import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireMember } from "@/lib/requireMember";
import { formatEventAt } from "@/lib/format";
import type { ListState } from "@/lib/types";
import ListClient from "./ListClient";

export const dynamic = "force-dynamic";

// One list-by-code lookup shared between generateMetadata() and the page body
// (Next calls both per request). cache() dedupes it → one query, not two.
const getListByCode = cache(async (code: string) => {
  const { data } = await supabaseAdmin()
    .from("dibs_lists")
    .select("id, code, title, emoji, description, invite_url, event_at, shared, completed")
    .eq("code", code)
    .single();
  return data;
});

// OG tags for chat unfurl (og:image comes from opengraph-image.tsx in this segment).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const list = await getListByCode(code);
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

// Public list page — resolved by the short permalink code. A cold visitor lands
// here in read-only mode (no name wall); the NamePrompt fires on first claim.
export default async function ListPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = supabaseAdmin();

  const list = await getListByCode(code); // cached — already fetched in metadata
  if (!list) notFound();

  // members, tasks, and the current member-identity are independent → one batch.
  const [{ data: members }, { data: tasks }, me] = await Promise.all([
    db.from("dibs_members").select("id, name, color").eq("list_id", list.id),
    db
      .from("dibs_tasks")
      .select("id, emoji, title, owner_member_id, done, position, updated_at")
      .eq("list_id", list.id)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
    requireMember(list.id),
  ]);

  const initial: ListState & { you: string | null } = {
    id: list.id,
    code: list.code,
    title: list.title,
    emoji: list.emoji,
    description: list.description,
    invite_url: list.invite_url,
    event_at: list.event_at,
    shared: list.shared,
    completed: list.completed,
    members: members ?? [],
    tasks: tasks ?? [],
    you: me?.id ?? null,
  };

  return <ListClient initial={initial} />;
}
