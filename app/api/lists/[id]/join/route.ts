import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { makeToken, sign, cookieName, phoneHash } from "@/lib/identity";
import { colorForIndex } from "@/lib/colors";
import { broadcast } from "@/lib/supabaseAdmin";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import type { Member } from "@/lib/types";

const Body = z.object({
  name: z.string().min(1).max(40),
  phone: z.string().max(40).optional(), // durable cross-device identity key
  op_id: z.string().min(1).max(64),
});

function setCookie(res: NextResponse, memberId: string, listId: string) {
  res.cookies.set(cookieName(listId), makeToken(memberId, listId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

// POST /api/lists/[id]/join — name yourself (fires on first "Call dibs").
// Phone is the durable identity: the SAME number always maps to the SAME member
// in a list, on any device (no duplicate). The device cookie is the fast path
// (a recognized device never sees the prompt); phone only matters on a new one.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;

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
  const { name, phone, op_id } = parsed.data;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id")
    .eq("id", listId)
    .single();
  if (!list) return NextResponse.json({ error: "list not found" }, { status: 404 });

  const pHash = phone ? phoneHash(phone) : null;

  // Already a member with this phone → adopt that identity (no new row).
  if (pHash) {
    const { data: existing } = await db
      .from("dibs_members")
      .select("id, name, color")
      .eq("list_id", listId)
      .eq("phone_hash", pHash)
      .maybeSingle();
    if (existing) {
      const res = NextResponse.json({ member: existing, adopted: true });
      setCookie(res, existing.id, listId);
      return res;
    }
  }

  const { count } = await db
    .from("dibs_members")
    .select("id", { count: "exact", head: true })
    .eq("list_id", listId);

  const { data: member, error } = await db
    .from("dibs_members")
    .insert({
      list_id: listId,
      name,
      color: colorForIndex(count ?? 0),
      device_token_hash: sign("pending", listId),
      phone_hash: pHash,
    })
    .select("id, name, color")
    .single();

  // Lost a race to another device with the same phone → adopt the winner.
  if (error?.code === "23505" && pHash) {
    const { data: winner } = await db
      .from("dibs_members")
      .select("id, name, color")
      .eq("list_id", listId)
      .eq("phone_hash", pHash)
      .single();
    if (winner) {
      const res = NextResponse.json({ member: winner, adopted: true });
      setCookie(res, winner.id, listId);
      return res;
    }
  }
  if (error || !member) {
    return NextResponse.json({ error: "could not join" }, { status: 500 });
  }

  await db
    .from("dibs_members")
    .update({ device_token_hash: sign(member.id, listId) })
    .eq("id", member.id);

  await broadcast(listId, { kind: "member.joined", op_id, member: member as Member });

  const res = NextResponse.json({ member });
  setCookie(res, member.id, listId);
  return res;
}
