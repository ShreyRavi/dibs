import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatEventAt } from "@/lib/format";
import { Washes } from "@/components/Washes";
import { Stamp } from "@/components/Stamp";
import { DibsCard } from "@/components/DibsCard";
import { ShareActions } from "@/components/ShareActions";
import type { Member, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

// Share surface — the wedge moment. Shows the Dibs card preview + copy/share
// link. Marks the list shared (locks the title) on first visit.
export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: list } = await db
    .from("dibs_lists")
    .select("id, title, event_at, shared")
    .eq("id", id)
    .single();
  if (!list) notFound();

  // Lock the title once shared (so the cached OG can't go stale).
  if (!list.shared) {
    await db.from("dibs_lists").update({ shared: true }).eq("id", id);
  }

  const [{ data: members }, { data: tasks }] = await Promise.all([
    db.from("dibs_members").select("id, name, color").eq("list_id", id),
    db
      .from("dibs_tasks")
      .select("id, done, owner_member_id")
      .eq("list_id", id)
      .is("deleted_at", null),
  ]);

  const total = (tasks ?? []).length;
  const done = (tasks as Pick<Task, "done">[] | null)?.filter((t) => t.done).length ?? 0;
  const needOwner =
    (tasks as Pick<Task, "owner_member_id">[] | null)?.filter((t) => !t.owner_member_id)
      .length ?? 0;

  return (
    <main className="screen flex flex-col px-[22px] pt-16 pb-[30px]">
      <Washes />

      <div className="flex items-center gap-2.5">
        <Stamp />
        <span className="font-display text-[14px] font-semibold text-text-60">
          Ready to share ✨
        </span>
      </div>

      <h1 className="mt-4 font-display text-[26px] font-bold tracking-[-0.8px]">
        Drop this in the group chat
      </h1>
      <p className="mt-1 font-body text-[14px] text-text-50">
        Tap to open · works in any chat
      </p>

      <div className="mt-6">
        <DibsCard
          title={list.title}
          date={formatEventAt(list.event_at)}
          done={done}
          total={total}
          needOwner={needOwner}
          members={(members as Member[]) ?? []}
        />
      </div>

      <ShareActions listId={list.id} title={list.title} />

      <p className="mt-4 text-center font-body text-[12px] text-text-40">
        No login, no app — anyone with the link can call dibs ✨
      </p>
    </main>
  );
}
