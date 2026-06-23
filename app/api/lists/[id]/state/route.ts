import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireMember } from "@/lib/requireMember";
import type { ListState } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/lists/[id]/state — full snapshot for first paint and reconnect
// resync. Two queries (members + tasks), never N+1. Filters soft-deleted tasks.
// `you` is the current device's memberId, or null if not yet joined.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, title, event_at, shared")
    .eq("id", listId)
    .single();
  if (!list) return NextResponse.json({ error: "list not found" }, { status: 404 });

  const [{ data: members }, { data: tasks }] = await Promise.all([
    db.from("dibs_members").select("id, name, color").eq("list_id", listId),
    db
      .from("dibs_tasks")
      .select("id, emoji, title, owner_member_id, done, position, updated_at")
      .eq("list_id", listId)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
  ]);

  const you = await requireMember(listId);

  const state: ListState & { you: string | null } = {
    id: list.id,
    title: list.title,
    event_at: list.event_at,
    shared: list.shared,
    members: members ?? [],
    tasks: tasks ?? [],
    you: you?.id ?? null,
  };
  return NextResponse.json(state);
}
