"use client";

import { useState } from "react";
import { Stamp } from "./Stamp";
import { splitLeadingEmoji } from "@/lib/parseTask";
import type { Task } from "@/lib/types";

// Edit / delete a single task. Opened by tapping the task text. One field, same
// "emoji title" convention as adding (🍰 stays, ✨ default) so it's consistent.
// Only reachable once the device is a recognized member (gated by the caller).
export function TaskEditModal({
  task,
  canUndib,
  onSave,
  onUndib,
  onDelete,
  onClose,
}: {
  task: Task;
  canUndib?: boolean;
  onSave: (v: { emoji: string; title: string }) => void;
  onUndib?: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(`${task.emoji} ${task.title}`.trim());
  const [confirmDel, setConfirmDel] = useState(false);

  const parsed = splitLeadingEmoji(value);
  const valid = parsed.title.length > 0;

  function save() {
    if (!valid) return;
    onSave(parsed);
  }

  return (
    <div
      className="fixed inset-0 z-[97] flex items-end justify-center bg-black/60 px-4 pb-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Edit task"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-[20px] border border-hairline-strong bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <Stamp size={24} />
          <span className="font-display text-[13px] font-semibold text-text-60">
            Edit task
          </span>
        </div>

        <h2 className="mt-3 font-display text-[22px] font-bold tracking-[-0.5px]">
          Tweak or remove it
        </h2>
        <p className="mt-1 font-body text-[13px] text-text-50">
          Start with an emoji to set the icon — e.g. 🍰 Order the cake.
        </p>

        <input
          aria-label="Task text"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="🍰 Order the cake"
          className="mt-4 w-full rounded-[12px] border border-hairline bg-bg px-3.5 py-3 font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />

        <button
          onClick={save}
          disabled={!valid}
          className="mt-4 w-full rounded-[14px] bg-lime px-4 py-3.5 font-display text-[16px] font-bold text-bg shadow-lime-cta disabled:opacity-50"
        >
          Update task
        </button>

        {canUndib && onUndib && (
          <button
            onClick={onUndib}
            className="mt-2.5 w-full rounded-[14px] border border-hairline-strong px-4 py-3 font-display text-[15px] font-semibold text-text-60"
          >
            Un-dib — give it back 🔓
          </button>
        )}

        {confirmDel ? (
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 rounded-[14px] px-4 py-3 font-display text-[15px] font-bold text-pink"
              style={{ border: "1px solid rgba(255,93,162,0.5)" }}
            >
              Delete for real
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="flex-1 rounded-[14px] border border-hairline px-4 py-3 font-display text-[15px] font-semibold text-text-60"
            >
              Keep it
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            className="mt-2.5 w-full rounded-[14px] px-4 py-3 font-display text-[15px] font-semibold text-text-50 hover:text-pink"
          >
            Delete task
          </button>
        )}
      </div>
    </div>
  );
}
