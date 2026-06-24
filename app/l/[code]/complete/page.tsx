import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatEventAt } from "@/lib/format";
import CompleteClient from "./CompleteClient";
import type { Member, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

// Complete screen (T6c) — celebratory recap. Stats: tasks done, people,
// "dropped balls" = tasks left unclaimed at completion (design decision).
export default async function CompletePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, code, title, event_at")
    .eq("code", code)
    .single();
  if (!list) notFound();

  const [{ data: members }, { data: tasks }] = await Promise.all([
    db.from("dibs_members").select("id, name, color").eq("list_id", list.id),
    db
      .from("dibs_tasks")
      .select("done, owner_member_id")
      .eq("list_id", list.id)
      .is("deleted_at", null),
  ]);

  const t = (tasks as Pick<Task, "done" | "owner_member_id">[] | null) ?? [];
  const tasksDone = t.filter((x) => x.done).length;
  const droppedBalls = t.filter((x) => !x.owner_member_id).length;
  const date = formatEventAt(list.event_at);

  return (
    <CompleteClient
      code={list.code}
      title={list.title}
      sub={`${date ? `${date} · ` : ""}pulled off ⚡`}
      tasksDone={tasksDone}
      people={(members ?? []).length}
      droppedBalls={droppedBalls}
      members={(members as Member[]) ?? []}
    />
  );
}
