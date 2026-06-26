"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Washes } from "@/components/Washes";
import { DibsLogo } from "@/components/DibsLogo";
import { DateField } from "@/components/DateField";
import { EmojiPicker } from "@/components/EmojiPicker";
import { DEFAULT_EMOJI } from "@/lib/emojis";
import { splitLeadingEmoji } from "@/lib/parseTask";

interface DraftTask {
  id: string;
  emoji: string;
  title: string;
}

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

function defaultEventAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  d.setHours(20, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Set Up — create a NEW group. Starts blank.
export default function NewGroup() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState<string>(DEFAULT_EMOJI);
  // Empty on the server (the default depends on the clock/TZ → would mismatch
  // hydration); fill it in once mounted on the client.
  const [eventAt, setEventAt] = useState("");
  useEffect(() => setEventAt((v) => v || defaultEventAt()), []);
  const [description, setDescription] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [tasks, setTasks] = useState<DraftTask[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Comma-separated: "cake, 🎵 playlist, bar" → three tasks at once.
  function addDraft() {
    const title = draft.trim();
    if (!title) return;
    setTasks((ts) => [...ts, { id: uid(), ...splitLeadingEmoji(title) }]);
    setDraft("");
  }

  async function create() {
    if (submitting || !title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          emoji,
          description: description.trim() || null,
          invite_url: inviteUrl.trim() || null,
          event_at: eventAt ? new Date(eventAt).toISOString() : null,
          tasks: tasks.map((t) => ({ emoji: t.emoji, title: t.title })),
        }),
      });
      if (!res.ok) {
        setSubmitting(false);
        return;
      }
      const { code } = await res.json();
      router.push(`/l/${code}/share`);
    } catch {
      setSubmitting(false);
    }
  }

  const fieldCls =
    "w-full rounded-[12px] border border-hairline bg-surface px-3.5 py-3 font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40";

  return (
    <main className="screen flex flex-col px-[22px] pt-14 pb-[30px]">
      <Washes />
      <DibsLogo />

      {/* Title with the chosen emoji logo inline */}
      <div className="mt-5 flex items-start gap-2">
        <span aria-hidden className="mt-0.5 text-[30px] leading-none">{emoji}</span>
        <input
          aria-label="Event name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name your event"
          autoFocus
          className="w-full bg-transparent font-display text-[30px] font-bold leading-[1.1] tracking-[-1px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />
      </div>

      <DateField value={eventAt} onChange={setEventAt} />

      {/* Emoji logo picker */}
      <div className="mb-2 mt-5 font-display text-[12px] font-semibold uppercase tracking-[1.5px] text-text-40">
        Pick an emoji
      </div>
      <EmojiPicker value={emoji} onChange={setEmoji} />

      {/* Optional details */}
      <textarea
        aria-label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        rows={2}
        className={`mt-4 resize-none ${fieldCls}`}
      />
      <input
        aria-label="Invite link"
        value={inviteUrl}
        onChange={(e) => setInviteUrl(e.target.value)}
        placeholder="Invite link — Partiful, Evite… (optional)"
        inputMode="url"
        className={`mt-2.5 ${fieldCls}`}
      />

      {/* Tasks */}
      <div className="mb-3 mt-7 font-display text-[12px] font-semibold uppercase tracking-[1.5px] text-text-40">
        Tasks
      </div>
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

      <div
        className="mt-[9px] flex items-center gap-3 rounded-[14px] px-[14px] py-[13px]"
        style={{ border: "1px dashed rgba(255,255,255,0.12)" }}
      >
        <span aria-hidden className="text-text-40">+</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDraft()}
          placeholder="Add a task, hit enter…"
          aria-label="Add tasks"
          className="w-full bg-transparent font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />
      </div>

      {tasks.length === 0 && (
        <p className="mt-3 font-body text-[13px] text-text-40">
          e.g. <span className="text-text-50">cake, playlist, bar, decorations</span> —
          People call dibs on what they&apos;ll do.
        </p>
      )}

      <button
        onClick={create}
        disabled={submitting || !title.trim()}
        className="mt-6 w-full rounded-[16px] bg-lime px-4 py-[17px] font-display text-[18px] font-bold text-bg shadow-lime-cta disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create & share →"}
      </button>

      <p className="mt-3 text-center font-body text-[13px] text-text-40">
        Drop it in any group chat — they don&apos;t even need the app ✨
      </p>
    </main>
  );
}
