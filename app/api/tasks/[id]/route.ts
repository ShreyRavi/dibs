import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, broadcast } from "@/lib/supabaseAdmin";
import { requireMember } from "@/lib/requireMember";

const TASK_COLS =
  "id, emoji, title, owner_member_id, done, position, updated_at";

const Body = z.object({
  action: z.enum(["claim", "unclaim", "toggle", "delete", "edit"]),
  done: z.boolean().optional(), // for toggle
  title: z.string().trim().min(1).max(200).optional(), // for edit
  emoji: z.string().min(1).max(8).optional(), // for edit
  op_id: z.string().min(1).max(64),
});

// POST /api/tasks/[id] — mutate one task. Action dispatch (explicit > clever).
// Atomic guards run in Postgres:
//   claim   — owner_member_id IS NULL  (one winner; 0 rows = lost the race)
//   unclaim — owner_member_id = me      (only the owner can release)
//   toggle  — last-write-wins on done
//   delete  — soft delete (deleted_at)
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: taskId } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const db = supabaseAdmin();

  const { data: row } = await db
    .from("dibs_tasks")
    .select("list_id")
    .eq("id", taskId)
    .is("deleted_at", null)
    .single();
  if (!row) return NextResponse.json({ error: "task not found" }, { status: 404 });
  const listId = row.list_id as string;

  const me = await requireMember(listId);
  if (!me) return NextResponse.json({ error: "join first" }, { status: 401 });

  const { action } = parsed.data;

  if (action === "claim") {
    const { data, error } = await db
      .from("dibs_tasks")
      .update({ owner_member_id: me.id })
      .eq("id", taskId)
      .is("owner_member_id", null) // atomic: only an unowned task can be claimed
      .select(TASK_COLS)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "claim failed" }, { status: 500 });
    if (!data) {
      // 0 rows updated → someone got there first. Tell the client to roll back.
      return NextResponse.json({ lost: true }, { status: 409 });
    }
    await broadcast(listId, { kind: "task.upserted", op_id: parsed.data.op_id, task: data });
    return NextResponse.json({ task: data });
  }

  if (action === "unclaim") {
    const { data, error } = await db
      .from("dibs_tasks")
      .update({ owner_member_id: null })
      .eq("id", taskId)
      .eq("owner_member_id", me.id) // only the owner can release
      .select(TASK_COLS)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "unclaim failed" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "not your task" }, { status: 403 });
    await broadcast(listId, { kind: "task.upserted", op_id: parsed.data.op_id, task: data });
    return NextResponse.json({ task: data });
  }

  if (action === "toggle") {
    const { data, error } = await db
      .from("dibs_tasks")
      .update({ done: parsed.data.done ?? true })
      .eq("id", taskId)
      .select(TASK_COLS)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "toggle failed" }, { status: 500 });
    }
    await broadcast(listId, { kind: "task.upserted", op_id: parsed.data.op_id, task: data });
    return NextResponse.json({ task: data });
  }

  if (action === "edit") {
    const patch: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) patch.title = parsed.data.title;
    if (parsed.data.emoji !== undefined) patch.emoji = parsed.data.emoji;
    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: "nothing to edit" }, { status: 400 });
    }
    const { data, error } = await db
      .from("dibs_tasks")
      .update(patch)
      .eq("id", taskId)
      .select(TASK_COLS)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "edit failed" }, { status: 500 });
    }
    await broadcast(listId, { kind: "task.upserted", op_id: parsed.data.op_id, task: data });
    return NextResponse.json({ task: data });
  }

  // delete (soft)
  const { error } = await db
    .from("dibs_tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) return NextResponse.json({ error: "delete failed" }, { status: 500 });
  await broadcast(listId, { kind: "task.deleted", op_id: parsed.data.op_id, task_id: taskId });
  return NextResponse.json({ ok: true });
}
