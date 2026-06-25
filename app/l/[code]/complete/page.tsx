import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatEventAt } from "@/lib/format";
import CompleteClient from "./CompleteClient";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

// Complete screen — celebratory recap. Shows each person and the tasks they
// actually finished (who did what). "dropped balls" = unclaimed at completion.
export default async function CompletePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, code, title, emoji, event_at")
    .eq("code", code)
    .single();
  if (!list) notFound();

  const [{ data: members }, { data: tasks }] = await Promise.all([
    db.from("dibs_members").select("id, name, color").eq("list_id", list.id),
    db
      .from("dibs_tasks")
      .select("emoji, title, done, owner_member_id")
      .eq("list_id", list.id)
      .is("deleted_at", null),
  ]);

  const t = tasks ?? [];
  const tasksDone = t.filter((x) => x.done).length;
  const droppedBalls = t.filter((x) => !x.owner_member_id).length;

  // Group the DONE tasks under the person who finished them.
  const crew = (members ?? []).map((m) => ({
    member: m as Member,
    done: t
      .filter((x) => x.done && x.owner_member_id === m.id)
      .map((x) => ({ emoji: x.emoji as string, title: x.title as string })),
  }));

  const date = formatEventAt(list.event_at);

  return (
    <CompleteClient
      code={list.code}
      emoji={list.emoji}
      title={list.title}
      sub={`${date ? `${date} · ` : ""}pulled off ⚡`}
      tasksDone={tasksDone}
      people={(members ?? []).length}
      droppedBalls={droppedBalls}
      crew={crew}
    />
  );
}
