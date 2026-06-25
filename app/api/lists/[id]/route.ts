import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { cleanEmoji } from "@/lib/emojis";
import { safeHttpUrl } from "@/lib/url";

// PATCH /api/lists/[id] — update event fields (settings) or flip completed.
// Open via the link capability (same trust as claiming); a soft rate limit
// blunts abuse. Empty strings clear nullable fields.
const Body = z.object({
  title: z.string().min(1).max(120).optional(),
  emoji: z.string().max(12).optional(),
  description: z.string().max(500).nullable().optional(),
  invite_url: z.union([z.string().url().max(500), z.literal("")]).nullable().optional(),
  event_at: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;

  const rl = await rateLimit(`patch:${clientKey(req.headers)}`, 60, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "slow down" }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const p = parsed.data;

  const patch: Record<string, unknown> = {};
  if (p.title !== undefined) patch.title = p.title;
  if (p.emoji !== undefined) patch.emoji = cleanEmoji(p.emoji);
  if (p.description !== undefined) patch.description = p.description || null;
  if (p.invite_url !== undefined) patch.invite_url = safeHttpUrl(p.invite_url);
  if (p.event_at !== undefined) patch.event_at = p.event_at;
  if (p.completed !== undefined) patch.completed = p.completed;

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: true }); // nothing to change
  }

  const { data, error } = await supabaseAdmin()
    .from("dibs_lists")
    .update(patch)
    .eq("id", listId)
    .select("id, code, title, emoji, description, invite_url, event_at, completed")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "could not update" }, { status: 500 });
  }
  return NextResponse.json({ list: data });
}
