import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { makeToken, sign, cookieName } from "@/lib/identity";
import { colorForIndex } from "@/lib/colors";
import { broadcast } from "@/lib/supabaseAdmin";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const Body = z.object({
  name: z.string().min(1).max(40),
  op_id: z.string().min(1).max(64),
});

// POST /api/lists/[id]/join — a cold visitor names themselves (fires on their
// first "Call dibs"). Creates the member, sets the device cookie, broadcasts the
// new member so others' crew stacks update.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;

  // Soft abuse guard on an unauthenticated, row-creating endpoint.
  const rl = await rateLimit(`join:${clientKey(req.headers)}`, 30, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "slow down" },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id")
    .eq("id", listId)
    .single();
  if (!list) return NextResponse.json({ error: "list not found" }, { status: 404 });

  const { count } = await db
    .from("dibs_members")
    .select("id", { count: "exact", head: true })
    .eq("list_id", listId);

  const { data: member, error } = await db
    .from("dibs_members")
    .insert({
      list_id: listId,
      name: parsed.data.name,
      color: colorForIndex(count ?? 0),
      device_token_hash: sign("pending", listId),
    })
    .select("id, name, color")
    .single();
  if (error || !member) {
    return NextResponse.json({ error: "could not join" }, { status: 500 });
  }
  await db
    .from("dibs_members")
    .update({ device_token_hash: sign(member.id, listId) })
    .eq("id", member.id);

  await broadcast(listId, {
    kind: "member.joined",
    op_id: parsed.data.op_id,
    member,
  });

  const res = NextResponse.json({ member });
  res.cookies.set(cookieName(listId), makeToken(member.id, listId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
