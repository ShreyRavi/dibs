"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useListChannel } from "@/lib/useListChannel";
import { comparePosition } from "@/lib/position";
import { formatEventAt } from "@/lib/format";
import { splitTasks } from "@/lib/parseTask";
import { Washes } from "@/components/Washes";
import { DibsLogo } from "@/components/DibsLogo";
import { Footer } from "@/components/Footer";
import { ProgressRing } from "@/components/ProgressRing";
import { Crew } from "@/components/Crew";
import { TaskRow } from "@/components/TaskRow";
import { Toast } from "@/components/Toast";
import { Confetti } from "@/components/Confetti";
import { NamePrompt } from "@/components/NamePrompt";
import type { ListState, Task, Member, ListEvent } from "@/lib/types";

const newOpId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

type State = ListState & { you: string | null };

export default function ListClient({ initial }: { initial: State }) {
  const router = useRouter();
  const [state, setState] = useState<State>(initial);
  const [toast, setToast] = useState("");
  const [confettiKey, setConfettiKey] = useState(0);
  const [poppedTask, setPoppedTask] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);
  const myOps = useRef<Set<string>>(new Set());
  const joinInFlight = useRef<Promise<string | null> | null>(null);
  const promptResolver = useRef<
    ((v: { name: string; phone: string } | null) => void) | null
  >(null);

  const askIdentity = useCallback(
    () =>
      new Promise<{ name: string; phone: string } | null>((resolve) => {
        promptResolver.current = resolve;
        setPromptOpen(true);
      }),
    [],
  );
  const resolvePrompt = useCallback(
    (v: { name: string; phone: string } | null) => {
      setPromptOpen(false);
      promptResolver.current?.(v);
      promptResolver.current = null;
    },
    [],
  );

  const memberById = useMemo(() => {
    const m = new Map<string, Member>();
    state.members.forEach((x) => m.set(x.id, x));
    return m;
  }, [state.members]);

  const total = state.tasks.length;
  const doneCount = state.tasks.filter((t) => t.done).length;
  const needOwner = state.tasks.filter((t) => !t.owner_member_id).length;
  const allDone = total > 0 && doneCount === total;

  const fireToast = useCallback((m: string) => setToast(m), []);

  // Fire the celebration once when the list transitions to all-done — works for
  // both a local toggle and a remote one (broadcast). Avoids reading stale state.
  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      setConfettiKey((k) => k + 1);
      fireToast("🎉 that's everything!");
    }
    prevAllDone.current = allDone;
  }, [allDone, fireToast]);

  const applyTask = useCallback((t: Task) => {
    setState((s) => {
      const idx = s.tasks.findIndex((x) => x.id === t.id);
      if (idx >= 0) {
        if (t.updated_at <= s.tasks[idx].updated_at) return s; // staleness guard
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

  // Self-heal any dropped Broadcast message: resync on tab refocus and on a
  // gentle interval. Broadcast is best-effort, so this guarantees eventual
  // consistency for a multi-person live list without hammering the server.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") resync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const iv = setInterval(resync, 20_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(iv);
    };
  }, [resync]);

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
    setConnected,
  );

  // Ensure the device has a member; prompts for a name on first write. Guarded
  // by a single in-flight promise so two parallel claims can't create two
  // members for the same person (race the outside review flagged).
  const ensureMember = useCallback(async (): Promise<string | null> => {
    if (state.you) return state.you;
    if (joinInFlight.current) return joinInFlight.current;
    joinInFlight.current = (async () => {
      const id = await askIdentity();
      if (!id) return null;
      const res = await fetch(`/api/lists/${state.id}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: id.name, phone: id.phone, op_id: newOpId() }),
      });
      if (!res.ok) return null;
      const { member } = await res.json();
      setState((s) => ({
        ...s,
        you: member.id,
        members: s.members.some((m) => m.id === member.id)
          ? s.members
          : [...s.members, member],
      }));
      return member.id as string;
    })();
    try {
      return await joinInFlight.current;
    } finally {
      joinInFlight.current = null;
    }
  }, [state.you, state.id, askIdentity]);

  const callDibs = useCallback(
    async (taskId: string) => {
      const me = await ensureMember();
      if (!me) return;
      const op_id = newOpId();
      myOps.current.add(op_id);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "claim", op_id }),
      });
      if (res.status === 409) {
        await resync();
        fireToast("someone got there first 🤏");
        return;
      }
      if (res.ok) {
        applyTask((await res.json()).task);
        setPoppedTask(taskId);
        setConfettiKey((k) => k + 1);
        fireToast("Dibs! It's yours 🙌");
      }
    },
    [ensureMember, applyTask, resync, fireToast],
  );

  const toggleDone = useCallback(
    async (task: Task) => {
      const op_id = newOpId();
      myOps.current.add(op_id);
      const nextDone = !task.done;
      // Optimistic: flip `done` directly (bypass the staleness guard for our own
      // action; do NOT fabricate updated_at — the server echo, which is strictly
      // newer, then applies cleanly through applyTask).
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, done: nextDone } : t)),
      }));
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "toggle", done: nextDone, op_id }),
      });
      if (res.ok) applyTask((await res.json()).task as Task);
    },
    [applyTask],
  );

  const addTask = useCallback(async () => {
    const titles = splitTasks(draft); // comma-separated → many at once
    if (!titles.length) return;
    setDraft("");
    const op_id = newOpId();
    myOps.current.add(op_id);
    const res = await fetch(`/api/lists/${state.id}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titles, op_id }),
    });
    if (res.ok) {
      const { tasks } = await res.json();
      (tasks as Task[]).forEach(applyTask);
    }
  }, [draft, state.id, applyTask]);

  // Wrap up: mark the event completed, then show the recap.
  const wrapUp = useCallback(async () => {
    await fetch(`/api/lists/${state.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: true }),
    }).catch(() => {});
    router.push(`/l/${state.code}/complete`);
  }, [state.id, state.code, router]);

  // Personal restore link → carry this identity to another device (no dup member).
  const copyMyLink = useCallback(async () => {
    const res = await fetch(`/api/lists/${state.id}/mylink`);
    if (!res.ok) return;
    const { url } = await res.json();
    try {
      await navigator.clipboard.writeText(url);
      fireToast("Your link copied — open it on another device 📱");
    } catch {
      fireToast(url);
    }
  }, [state.id, fireToast]);

  // Past or explicitly wrapped → surface the recap up top (stays editable).
  const isPast = state.event_at ? new Date(state.event_at).getTime() < Date.now() : false;
  const showRecap = state.completed || isPast;

  return (
    <main className="screen flex flex-col px-5 pt-14 pb-[30px]">
      <Washes pink="20% 18%" lime="80% 12%" />

      {/* Header: brand + settings */}
      <div className="flex items-center justify-between">
        <DibsLogo />
        <Link
          href={`/l/${state.code}/settings`}
          aria-label="List settings"
          className="font-body text-[13px] text-text-40 hover:text-text-60"
        >
          ⚙ Settings
        </Link>
      </div>

      {/* Recap callout when wrapped or past */}
      {showRecap && (
        <Link
          href={`/l/${state.code}/complete`}
          className="mt-4 flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
          style={{
            background: "rgba(200,255,77,0.12)",
            border: "1px solid rgba(200,255,77,0.4)",
            boxShadow: "0 0 30px rgba(200,255,77,0.10)",
          }}
        >
          <span className="font-body text-[14px] font-bold text-lime">
            🎉 {state.completed ? "This event wrapped" : "This event has passed"} — see the recap
          </span>
          <span className="font-display text-[14px] font-bold text-lime">→</span>
        </Link>
      )}

      {/* Title + progress ring */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-bold leading-[1.1] tracking-[-0.8px]">
            <span aria-hidden className="mr-1.5">{state.emoji}</span>
            {state.title}
          </h1>
          {formatEventAt(state.event_at) && (
            <p className="mt-1 font-body text-[13px] text-text-50">
              {formatEventAt(state.event_at)}
            </p>
          )}
          {state.description && (
            <p className="mt-2 font-body text-[14px] text-text-60">{state.description}</p>
          )}
          {state.invite_url && /^https?:\/\//i.test(state.invite_url) && (
            <a
              href={state.invite_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-display text-[13px] font-bold text-lime"
            >
              View the invite →
            </a>
          )}
        </div>
        <ProgressRing done={doneCount} total={total} />
      </div>

      {/* Crew — named chips */}
      <div className="mt-4 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Crew members={state.members} you={state.you} />
        </div>
        {!connected && (
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 font-body text-[12px] text-text-50"
            aria-live="polite"
          >
            <span
              className="h-2 w-2 rounded-full bg-text-40"
              style={{ animation: "dibsToast 1s ease infinite alternate" }}
            />
            reconnecting…
          </span>
        )}
      </div>

      {/* Banners */}
      {allDone ? (
        <div
          className="mt-4 rounded-[14px] px-4 py-3 text-center font-body text-[14px] font-bold text-lime"
          style={{
            background: "rgba(200,255,77,0.12)",
            border: "1px solid rgba(200,255,77,0.4)",
            boxShadow: "0 0 30px rgba(200,255,77,0.10)",
          }}
        >
          🎉 every task done — let&apos;s gooo
        </div>
      ) : needOwner > 0 ? (
        <div
          className="mt-4 flex items-center gap-3 rounded-[14px] px-4 py-3"
          style={{
            background: "rgba(255,93,162,0.1)",
            border: "1px solid rgba(255,93,162,0.3)",
          }}
        >
          <span className="font-body text-[14px] font-semibold text-pink">
            ⚡ {needOwner} task{needOwner > 1 ? "s" : ""} need{needOwner === 1 ? "s" : ""} an owner
          </span>
          <button
            onClick={() => fireToast("Nudged the group 👋")}
            className="ml-auto min-h-9 rounded-full px-3 font-display text-[13px] font-semibold text-pink"
            style={{ border: "1px solid rgba(255,93,162,0.5)" }}
          >
            Nudge 👋
          </button>
        </div>
      ) : null}

      {/* Tasks */}
      <ul className="mt-4 flex flex-col gap-[9px]">
        {state.tasks.map((t) => {
          // An owned task is owned even if its member hasn't synced yet
          // (broadcast ordering): fall back to a placeholder chip, not "Call dibs".
          const owner = t.owner_member_id
            ? memberById.get(t.owner_member_id) ?? {
                id: t.owner_member_id,
                name: "…",
                color: "#6b6862",
              }
            : null;
          return (
            <TaskRow
              key={t.id}
              task={t}
              owner={owner}
              isYou={!!state.you && t.owner_member_id === state.you}
              popOwner={poppedTask === t.id}
              onCallDibs={() => callDibs(t.id)}
              onToggle={() => toggleDone(t)}
            />
          );
        })}
      </ul>

      {total === 0 && (
        <p className="mt-6 mb-2 text-center font-body text-[14px] text-text-40">
          no tasks yet — add the first one ✨
        </p>
      )}

      {/* Add task */}
      <div
        className="mt-[9px] flex items-center gap-3 rounded-[14px] px-[14px] py-[13px]"
        style={{ border: "1px dashed rgba(255,255,255,0.12)" }}
      >
        <span aria-hidden className="text-text-40">+</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add tasks — separate with commas for several…"
          aria-label="Add tasks"
          className="w-full bg-transparent font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />
      </div>

      {/* Complete / wrap-up */}
      <button
        onClick={wrapUp}
        className={
          allDone
            ? "mt-6 w-full rounded-[16px] bg-lime px-4 py-4 font-display text-[17px] font-bold text-bg shadow-lime-cta"
            : "mt-6 w-full rounded-[16px] px-4 py-4 font-display text-[16px] font-bold text-text"
        }
        style={allDone ? undefined : { border: "1px solid rgba(245,243,239,0.18)" }}
      >
        {allDone ? "Complete the event 🎉" : "Wrap up the event →"}
      </button>

      {state.you && (
        <button
          onClick={copyMyLink}
          className="mt-3 w-full text-center font-body text-[12px] text-text-40 underline-offset-2 hover:underline"
        >
          📱 Use on another device
        </button>
      )}

      <p className="mt-2 text-center font-body text-[12px] text-text-40">
        Synced with everyone in {state.title}
      </p>

      <Footer />

      {promptOpen && (
        <NamePrompt
          onSubmit={(v) => resolvePrompt(v)}
          onCancel={() => resolvePrompt(null)}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
      <Confetti fireKey={confettiKey} />
    </main>
  );
}
