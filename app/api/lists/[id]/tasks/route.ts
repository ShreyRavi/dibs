import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, broadcast } from "@/lib/supabaseAdmin";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { positionAfter } from "@/lib/position";
import { splitLeadingEmoji } from "@/lib/parseTask";

// Accept a single title or a batch (comma-split client-side). Each phrase may
// carry a leading emoji ("🍕 pizza"); otherwise defaults to ✨.
const Body = z.object({
  title: z.string().min(1).max(200).optional(),
  titles: z.array(z.string().min(1).max(200)).max(50).optional(),
  op_id: z.string().min(1).max(64),
});

// POST /api/lists/[id]/tasks — add one or many unclaimed tasks. Open via the
// link capability (adding an unclaimed task needs no identity; claiming does).
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: listId } = await ctx.params;

  const rl = await rateLimit(`addtask:${clientKey(req.headers)}`, 120, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "slow down" }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const raw = parsed.data.titles ?? (parsed.data.title ? [parsed.data.title] : []);
  if (!raw.length) {
    return NextResponse.json({ error: "no tasks" }, { status: 400 });
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

  let pos: string | null = last?.position ?? null;
  const rows = raw.map((phrase) => {
    const { emoji, title } = splitLeadingEmoji(phrase);
    pos = positionAfter(pos);
    return { list_id: listId, emoji, title, position: pos };
  });

  const { data: tasks, error } = await db
    .from("dibs_tasks")
    .insert(rows)
    .select("id, emoji, title, owner_member_id, done, position, updated_at");
  if (error || !tasks) {
    return NextResponse.json({ error: "could not add tasks" }, { status: 500 });
  }

  for (const task of tasks) {
    await broadcast(listId, { kind: "task.upserted", op_id: parsed.data.op_id, task });
  }
  return NextResponse.json({ tasks });
}
