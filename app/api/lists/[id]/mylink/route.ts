import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireMember } from "@/lib/requireMember";
import { makeToken } from "@/lib/identity";

export const dynamic = "force-dynamic";

// GET /api/lists/[id]/mylink — a personal restore link for the current member.
// Opening it on another device adopts this same identity (no duplicate member).
// The cookie token is httpOnly so JS can't read it; the server mints the link.
// The link IS a capability — only the member sees it; sharing it shares identity.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;
  const me = await requireMember(listId);
  if (!me) return NextResponse.json({ error: "not a member" }, { status: 401 });

  const { data: list } = await supabaseAdmin()
    .from("dibs_lists")
    .select("code")
    .eq("id", listId)
    .single();
  if (!list) return NextResponse.json({ error: "list not found" }, { status: 404 });

  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const token = makeToken(me.id, listId);
  return NextResponse.json({
    url: `${base}/r/${list.code}/${encodeURIComponent(token)}`,
    name: me.name,
  });
}
