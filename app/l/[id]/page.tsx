import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireMember } from "@/lib/requireMember";
import { formatEventAt } from "@/lib/format";
import type { ListState } from "@/lib/types";
import ListClient from "./ListClient";

export const dynamic = "force-dynamic";

// OG tags for chat unfurl (og:image comes from opengraph-image.tsx in this segment).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: list } = await supabaseAdmin()
    .from("dibs_lists")
    .select("title, event_at")
    .eq("id", id)
    .single();
  if (!list) return { title: "Dibs — list not found" };
  const date = formatEventAt(list.event_at);
  const desc = `Call dibs on a task${date ? ` · ${date}` : ""}. No app, no login.`;
  return {
    title: `${list.title} — Dibs`,
    description: desc,
    openGraph: { title: list.title, description: desc, type: "website" },
    twitter: { card: "summary_large_image", title: list.title, description: desc },
  };
}

// Server-render the initial list snapshot (first paint). A cold visitor lands
// here in read-only mode — no name wall (the NamePrompt fires on first claim,
// handled client-side in ListClient). Full pixel-accurate List is T6.
export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: listId } = await params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, title, event_at, shared")
    .eq("id", listId)
    .single();
  if (!list) notFound();

  const [{ data: members }, { data: tasks }] = await Promise.all([
    db.from("dibs_members").select("id, name, color").eq("list_id", listId),
    db
      .from("dibs_tasks")
      .select("id, emoji, title, owner_member_id, done, position, updated_at")
      .eq("list_id", listId)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
  ]);

  const me = await requireMember(listId);

  const initial: ListState & { you: string | null } = {
    id: list.id,
    title: list.title,
    event_at: list.event_at,
    shared: list.shared,
    members: members ?? [],
    tasks: tasks ?? [],
    you: me?.id ?? null,
  };

  return <ListClient initial={initial} />;
}
