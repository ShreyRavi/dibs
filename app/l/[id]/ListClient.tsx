"use client";

import { useCallback, useRef, useState } from "react";
import { useListChannel } from "@/lib/useListChannel";
import { comparePosition } from "@/lib/position";
import type { ListState, Task, ListEvent } from "@/lib/types";

const newOpId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

// Minimal interactive List. Demonstrates the realtime reconciliation contract;
// full pixel-accurate UI (TaskRow, ProgressRing, confetti, NamePrompt) is T6/T9.
export default function ListClient({
  initial,
}: {
  initial: ListState & { you: string | null };
}) {
  const [state, setState] = useState(initial);
  const myOps = useRef<Set<string>>(new Set()); // op_ids this client originated

  const applyTask = useCallback((t: Task) => {
    setState((s) => {
      const idx = s.tasks.findIndex((x) => x.id === t.id);
      if (idx >= 0) {
        // staleness guard: only apply strictly-newer updates
        if (t.updated_at <= s.tasks[idx].updated_at) return s;
        const tasks = s.tasks.slice();
        tasks[idx] = t;
        return { ...s, tasks };
      }
      const tasks = [...s.tasks, t].sort((a, b) =>
        comparePosition(a.position, b.position),
      );
      return { ...s, tasks };
    });
  }, []);

  const resync = useCallback(async () => {
    const res = await fetch(`/api/lists/${state.id}/state`);
    if (res.ok) setState(await res.json());
  }, [state.id]);

  useListChannel(
    state.id,
    (e: ListEvent) => {
      if (myOps.current.has(e.op_id)) return; // ignore our own echo
      if (e.kind === "task.upserted") applyTask(e.task);
      else if (e.kind === "task.deleted")
        setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== e.task_id) }));
      else if (e.kind === "member.joined")
        setState((s) =>
          s.members.some((m) => m.id === e.member.id)
            ? s
            : { ...s, members: [...s.members, e.member] },
        );
    },
    resync,
  );

  const callDibs = useCallback(
    async (taskId: string) => {
      const op_id = newOpId();
      myOps.current.add(op_id);

      // list-first: if not yet a member, capture name on this first claim.
      if (!state.you) {
        const name = window.prompt("Your name?")?.trim();
        if (!name) return;
        const j = await fetch(`/api/lists/${state.id}/join`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, op_id: newOpId() }),
        });
        if (!j.ok) return;
        const { member } = await j.json();
        setState((s) => ({
          ...s,
          you: member.id,
          members: s.members.some((m) => m.id === member.id)
            ? s.members
            : [...s.members, member],
        }));
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "claim", op_id }),
      });
      if (res.status === 409) {
        // lost the race — resync to show the real owner
        await resync();
        return;
      }
      if (res.ok) applyTask((await res.json()).task);
    },
    [state.you, state.id, applyTask, resync],
  );

  const nameFor = (id: string | null) =>
    state.members.find((m) => m.id === id)?.name ?? null;

  return (
    <main className="screen flex flex-col px-5 pt-14 pb-8">
      <h1 className="font-display text-[28px] font-bold tracking-[-0.8px]">
        {state.title}
      </h1>
      <p className="mt-1 font-body text-[13px] text-text-50">
        {state.members.length <= 1
          ? "You"
          : `You + ${state.members.length - 1} other${state.members.length > 2 ? "s" : ""}`}
      </p>

      <ul className="mt-6 flex flex-col gap-[9px]">
        {state.tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-[15px] border border-hairline bg-surface px-[14px] py-[13px]"
          >
            <span className="font-body text-[16px]">
              {t.emoji} {t.title}
            </span>
            <span className="ml-auto">
              {t.owner_member_id ? (
                <span className="font-body text-[13px] font-semibold text-text-60">
                  {nameFor(t.owner_member_id)}
                </span>
              ) : (
                <button
                  onClick={() => callDibs(t.id)}
                  className="min-h-[44px] rounded-full bg-pink px-[15px] font-display text-[13px] font-bold text-bg shadow-pink"
                >
                  Call dibs
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>

      {state.tasks.length === 0 && (
        <p className="mt-10 text-center font-body text-[14px] text-text-40">
          no tasks yet — add the first one ✨
        </p>
      )}
    </main>
  );
}
