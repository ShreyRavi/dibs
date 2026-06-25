import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { makeToken, sign, cookieName } from "@/lib/identity";
import { colorForIndex } from "@/lib/colors";
import { positionAfter } from "@/lib/position";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { generateCode } from "@/lib/code";
import { cleanEmoji } from "@/lib/emojis";
import { safeHttpUrl } from "@/lib/url";

const SeedTask = z.object({
  emoji: z.string().min(1).max(8).default("✨"),
  title: z.string().min(1).max(200),
});

const Body = z.object({
  title: z.string().trim().min(1).max(120),
  emoji: z.string().max(12).optional(),
  description: z.string().max(500).nullable().optional(),
  // Accept any string (incl. a bare domain); safeHttpUrl normalizes/validates.
  invite_url: z.string().max(500).nullable().optional(),
  event_at: z.string().datetime({ offset: true }).nullable().optional(),
  // Optional: when omitted, no host member is created — the host follows the
  // same list-first / name-on-first-claim flow as everyone (consistent identity,
  // avoids the "You" absolute-vs-relative name problem).
  hostName: z.string().min(1).max(40).optional(),
  tasks: z.array(SeedTask).max(50).default([]),
});

// POST /api/lists — create a list + seed tasks. Optionally create a host member
// (+ set their device cookie) if a hostName is given.
export async function POST(req: NextRequest) {
  // Soft abuse guard: cap list creation per client (best-effort, per instance).
  const rl = await rateLimit(`create:${clientKey(req.headers)}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "slow down — too many lists" },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, emoji, description, invite_url, event_at, hostName, tasks } =
    parsed.data;
  const db = supabaseAdmin();

  // Insert with a short public code; retry a few times on the rare unique clash.
  let listId = "";
  let code = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode();
    const { data: list, error: listErr } = await db
      .from("dibs_lists")
      .insert({
        title,
        emoji: cleanEmoji(emoji),
        description: description || null,
        invite_url: safeHttpUrl(invite_url),
        event_at: event_at ?? null,
        code: candidate,
      })
      .select("id, code")
      .single();
    if (list) {
      listId = list.id as string;
      code = list.code as string;
      break;
    }
    // 23505 = unique_violation on code → try a new code
    if (listErr && listErr.code !== "23505") {
      return NextResponse.json({ error: "could not create list" }, { status: 500 });
    }
  }
  if (!listId) {
    return NextResponse.json({ error: "could not create list" }, { status: 500 });
  }

  if (tasks.length) {
    let pos: string | null = null;
    const rows = tasks.map((t) => {
      pos = positionAfter(pos);
      return { list_id: listId, emoji: t.emoji, title: t.title, position: pos };
    });
    await db.from("dibs_tasks").insert(rows);
  }

  let hostId: string | null = null;
  if (hostName) {
    const { data: host } = await db
      .from("dibs_members")
      .insert({
        list_id: listId,
        name: hostName,
        color: colorForIndex(0),
        device_token_hash: sign("pending", listId),
      })
      .select("id")
      .single();
    if (host) {
      hostId = host.id as string;
      await db
        .from("dibs_members")
        .update({ device_token_hash: sign(hostId, listId) })
        .eq("id", hostId);
    }
  }

  const res = NextResponse.json({ listId, code, memberId: hostId });
  if (hostId) {
    res.cookies.set(cookieName(listId), makeToken(hostId, listId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
