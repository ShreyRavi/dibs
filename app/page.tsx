"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Washes } from "@/components/Washes";
import { Stamp } from "@/components/Stamp";

interface DraftTask {
  id: string;
  emoji: string;
  title: string;
}

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

// Default the event to the next Saturday 8 PM (matches the handoff vibe).
function defaultEventAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  d.setHours(20, 0, 0, 0);
  // datetime-local wants "YYYY-MM-DDTHH:mm" in local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatEventAt(local: string): string {
  const d = new Date(local);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: d.getMinutes() ? "2-digit" : undefined,
  });
}

// Auto-suggested starter tasks (handoff Set Up is pre-populated). Editable.
const SUGGESTED: Omit<DraftTask, "id">[] = [
  { emoji: "🎤", title: "Book the karaoke room" },
  { emoji: "🍰", title: "Order the cake" },
  { emoji: "💌", title: "Send the invite" },
  { emoji: "🎵", title: "Make the playlist" },
  { emoji: "🎈", title: "Bring decorations" },
  { emoji: "🍸", title: "Pick the bar after" },
  { emoji: "🎁", title: "Collect $ for the gift" },
];

// Split a leading emoji off a typed task ("🍕 pizza" → {emoji,title}).
function splitEmoji(input: string): { emoji: string; title: string } {
  const m = input.trim().match(/^(\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic})*)\s*(.*)$/u);
  if (m && m[2]) return { emoji: m[1], title: m[2] };
  return { emoji: "✨", title: input.trim() };
}

export default function SetUp() {
  const router = useRouter();
  const [title, setTitle] = useState("Dev's 25th 🎂");
  const [eventAt, setEventAt] = useState(defaultEventAt());
  const [tasks, setTasks] = useState<DraftTask[]>(
    SUGGESTED.map((t) => ({ ...t, id: uid() })),
  );
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addDraft() {
    const text = draft.trim();
    if (!text) return;
    const { emoji, title: t } = splitEmoji(text);
    setTasks((ts) => [...ts, { id: uid(), emoji, title: t }]);
    setDraft("");
  }

  async function share() {
    if (submitting || !title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          event_at: eventAt ? new Date(eventAt).toISOString() : null,
          tasks: tasks.map((t) => ({ emoji: t.emoji, title: t.title })),
        }),
      });
      if (!res.ok) {
        setSubmitting(false);
        return;
      }
      const { listId } = await res.json();
      // Share surface is P3; for now go straight to the list.
      router.push(`/l/${listId}`);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <main className="screen flex flex-col px-[22px] pt-16 pb-[30px]">
      <Washes />

      {/* Eyebrow */}
      <div className="flex items-center gap-2.5">
        <Stamp />
        <span className="font-display text-[14px] font-semibold text-text-60">
          New event ✨
        </span>
      </div>

      {/* Title (editable) */}
      <input
        aria-label="Event name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-4 w-full bg-transparent font-display text-[32px] font-bold leading-[1.1] tracking-[-1px] text-text caret-[var(--lime)] outline-none"
      />

      {/* Date — native picker, persisted as event_at; formatted preview shown */}
      <label className="mt-1 flex items-center gap-2 font-body text-[14px] text-text-50">
        <input
          type="datetime-local"
          aria-label="Event date and time"
          value={eventAt}
          onChange={(e) => setEventAt(e.target.value)}
          className="bg-transparent text-text-50 outline-none [color-scheme:dark]"
        />
        {eventAt && (
          <span className="text-text-40">· {formatEventAt(eventAt)}</span>
        )}
      </label>

      {/* Section label */}
      <div className="mb-3 mt-[30px] font-display text-[12px] font-semibold uppercase tracking-[1.5px] text-text-40">
        Tasks
      </div>

      {/* Task rows */}
      <ul className="flex flex-col gap-[9px]">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-[14px] border border-hairline bg-surface px-[14px] py-[13px]"
          >
            <span
              aria-hidden
              className="h-[18px] w-[18px] shrink-0 rounded-full"
              style={{ border: "2px dashed rgba(245,243,239,0.22)" }}
            />
            <span className="font-body text-[16px] font-medium">
              {t.emoji} {t.title}
            </span>
            <button
              aria-label={`Remove ${t.title}`}
              onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))}
              className="ml-auto min-h-[44px] min-w-[44px] text-text-40"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* Add-task row */}
      <div
        className="mt-[9px] flex items-center gap-3 rounded-[14px] px-[14px] py-[13px]"
        style={{ border: "1px dashed rgba(255,255,255,0.12)" }}
      >
        <span aria-hidden className="text-text-40">
          +
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDraft()}
          placeholder="Add a task…"
          aria-label="Add a task"
          className="w-full bg-transparent font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />
      </div>

      {/* CTA */}
      <button
        onClick={share}
        disabled={submitting || !title.trim()}
        className="mt-6 w-full rounded-[16px] bg-lime px-4 py-[17px] font-display text-[18px] font-bold text-bg shadow-lime-cta disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Share with the group →"}
      </button>

      <p className="mt-3 text-center font-body text-[13px] text-text-40">
        Drop it in any group chat — they don&apos;t even need the app ✨
      </p>
    </main>
  );
}
