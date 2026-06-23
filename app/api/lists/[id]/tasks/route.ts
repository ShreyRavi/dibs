import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, broadcast } from "@/lib/supabaseAdmin";
import { requireMember } from "@/lib/requireMember";
import { positionAfter } from "@/lib/position";

const Body = z.object({
  emoji: z.string().min(1).max(8).default("✨"),
  title: z.string().min(1).max(200),
  op_id: z.string().min(1).max(64),
});

// POST /api/lists/[id]/tasks — add an unclaimed task. Must be a member (no
// anonymous writes). Fractional position after the current last → no collision.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;
  const me = await requireMember(listId);
  if (!me) return NextResponse.json({ error: "join first" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = supabaseAdmin();

  const { data: last } = await db
    .from("dibs_tasks")
    .select("position")
    .eq("list_id", listId)
    .is("deleted_at", null)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: task, error } = await db
    .from("dibs_tasks")
    .insert({
      list_id: listId,
      emoji: parsed.data.emoji,
      title: parsed.data.title,
      position: positionAfter(last?.position ?? null),
    })
    .select("id, emoji, title, owner_member_id, done, position, updated_at")
    .single();
  if (error || !task) {
    return NextResponse.json({ error: "could not add task" }, { status: 500 });
  }

  await broadcast(listId, { kind: "task.upserted", op_id: parsed.data.op_id, task });
  return NextResponse.json({ task });
}
