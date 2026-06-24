import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyToken, cookieName, makeToken } from "@/lib/identity";

export const dynamic = "force-dynamic";

// GET /r/[code]/[token] — restore your identity on a new device. Verifies the
// signed token against the list, confirms the member still exists, sets the
// device cookie, and redirects to the list. Fixes the cross-device duplicate:
// instead of forking a new member, you carry your existing one.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ code: string; token: string }> },
) {
  const { code, token } = await ctx.params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, code")
    .eq("code", code)
    .single();
  const listUrl = new URL(`/l/${code}`, process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
  if (!list) return NextResponse.redirect(new URL("/", listUrl));

  const decoded = decodeURIComponent(token);
  const memberId = verifyToken(decoded, list.id);
  if (!memberId) return NextResponse.redirect(listUrl); // bad/forged token → just open the list

  // Confirm the member still belongs to this list before adopting the identity.
  const { data: member } = await db
    .from("dibs_members")
    .select("id")
    .eq("id", memberId)
    .eq("list_id", list.id)
    .single();
  if (!member) return NextResponse.redirect(listUrl);

  const res = NextResponse.redirect(listUrl);
  res.cookies.set(cookieName(list.id), makeToken(memberId, list.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
