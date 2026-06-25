"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Washes } from "@/components/Washes";
import { DibsLogo } from "@/components/DibsLogo";
import { EmojiPicker } from "@/components/EmojiPicker";
import { splitTasks } from "@/lib/parseTask";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SettingsClient(props: {
  listId: string;
  code: string;
  title: string;
  emoji: string;
  description: string;
  inviteUrl: string;
  eventAt: string | null;
  completed: boolean;
  tasksCsv: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(props.title);
  const [emoji, setEmoji] = useState(props.emoji);
  const [description, setDescription] = useState(props.description);
  const [inviteUrl, setInviteUrl] = useState(props.inviteUrl);
  const [eventAt, setEventAt] = useState(toLocalInput(props.eventAt));
  const [completed, setCompleted] = useState(props.completed);
  const [importText, setImportText] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fieldCls =
    "w-full rounded-[12px] border border-hairline bg-surface px-3.5 py-3 font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40";

  async function save() {
    if (saving) return;
    setSaving(true);
    await fetch(`/api/lists/${props.listId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || undefined,
        emoji,
        description: description.trim() || null,
        invite_url: inviteUrl.trim() || null,
        event_at: eventAt ? new Date(eventAt).toISOString() : null,
        completed,
      }),
    }).catch(() => {});
    router.push(`/l/${props.code}`);
  }

  async function importTasks() {
    const titles = splitTasks(importText);
    if (!titles.length) return;
    const res = await fetch(`/api/lists/${props.listId}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titles, op_id: `import-${Date.now()}` }),
    });
    if (res.ok) {
      setImportText("");
      setMsg(`Added ${titles.length} task${titles.length > 1 ? "s" : ""} ✓`);
      setTimeout(() => setMsg(""), 1800);
    }
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(props.tasksCsv);
      setMsg("Tasks copied ✓");
      setTimeout(() => setMsg(""), 1800);
    } catch {
      /* ignore */
    }
  }

  const label = "mb-1.5 mt-5 font-display text-[12px] font-semibold uppercase tracking-[1.5px] text-text-40";

  return (
    <main className="screen flex flex-col px-[22px] pt-14 pb-[30px]">
      <Washes />
      <div className="flex items-center justify-between">
        <DibsLogo />
        <Link
          href={`/l/${props.code}`}
          className="font-body text-[13px] text-text-40 hover:text-text-60"
        >
          ← Back
        </Link>
      </div>

      <h1 className="mt-5 font-display text-[26px] font-bold tracking-[-0.5px]">Settings</h1>

      <div className={label}>Name</div>
      <input aria-label="Name" value={title} onChange={(e) => setTitle(e.target.value)} className={fieldCls} />

      <div className={label}>Emoji</div>
      <EmojiPicker value={emoji} onChange={setEmoji} />

      <div className={label}>Date & time</div>
      <input
        type="datetime-local"
        aria-label="Date and time"
        value={eventAt}
        onChange={(e) => setEventAt(e.target.value)}
        className={`${fieldCls} [color-scheme:dark]`}
      />

      <div className={label}>Description</div>
      <textarea
        aria-label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className={`resize-none ${fieldCls}`}
      />

      <div className={label}>Invite link</div>
      <input
        aria-label="Invite link"
        value={inviteUrl}
        onChange={(e) => setInviteUrl(e.target.value)}
        placeholder="https://partiful.com/e/…"
        inputMode="url"
        className={fieldCls}
      />

      <label className="mt-5 flex items-center gap-3 font-body text-[15px] text-text">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="h-5 w-5 accent-[var(--lime)]"
        />
        Event completed (uncheck to reopen)
      </label>

      {/* Task import / export */}
      <div className={label}>Tasks — import (comma-separated)</div>
      <textarea
        aria-label="Import tasks"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder="cake, 🎵 playlist, bar, decorations"
        rows={2}
        className={`resize-none ${fieldCls}`}
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={importTasks}
          className="flex-1 rounded-[12px] px-3 py-2.5 font-display text-[14px] font-bold text-text"
          style={{ border: "1px solid rgba(245,243,239,0.18)" }}
        >
          Add tasks
        </button>
        <button
          onClick={copyExport}
          className="flex-1 rounded-[12px] px-3 py-2.5 font-display text-[14px] font-bold text-text"
          style={{ border: "1px solid rgba(245,243,239,0.18)" }}
        >
          Export (copy)
        </button>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-7 w-full rounded-[16px] bg-lime px-4 py-4 font-display text-[17px] font-bold text-bg shadow-lime-cta disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

      {msg && <p className="mt-3 text-center font-body text-[13px] text-lime">{msg}</p>}
    </main>
  );
}
