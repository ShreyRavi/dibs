import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, code, title, emoji, description, invite_url, event_at, completed")
    .eq("code", code)
    .single();
  if (!list) notFound();

  const { data: tasks } = await db
    .from("dibs_tasks")
    .select("emoji, title, position")
    .eq("list_id", list.id)
    .is("deleted_at", null)
    .order("position", { ascending: true });

  // Current tasks as an editable comma list for export.
  const tasksCsv = (tasks ?? [])
    .map((t) => `${t.emoji ? `${t.emoji} ` : ""}${t.title}`)
    .join(", ");

  return (
    <SettingsClient
      listId={list.id}
      code={list.code}
      title={list.title}
      emoji={list.emoji}
      description={list.description ?? ""}
      inviteUrl={list.invite_url ?? ""}
      eventAt={list.event_at}
      completed={list.completed}
      tasksCsv={tasksCsv}
    />
  );
}
