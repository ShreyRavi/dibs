"use client";

import { Avatar } from "./Avatar";
import type { Member, Task } from "@/lib/types";

// A single task row with three variants (handoff List screen):
//  - has owner   → checkbox (toggle done) + owner chip
//  - unclaimed   → dashed placeholder + pink "Call dibs" pill
//  - done        → filled check + strikethrough title
// Interactive controls carry a 44px hit area (a11y, design-review decision).
export function TaskRow({
  task,
  owner,
  isYou,
  popOwner,
  onCallDibs,
  onToggle,
}: {
  task: Task;
  owner: Member | null;
  isYou: boolean;
  popOwner: boolean;
  onCallDibs: () => void;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center gap-[13px] rounded-[15px] border border-hairline bg-surface px-[14px] py-[10px]">
      {/* Left control */}
      {owner ? (
        <button
          onClick={onToggle}
          aria-label={task.done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
          aria-pressed={task.done}
          className="grid h-11 w-11 shrink-0 place-items-center"
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-full"
            style={{
              border: task.done ? "2px solid var(--lime)" : "2px solid rgba(245,243,239,0.3)",
              background: task.done ? "var(--lime)" : "transparent",
            }}
          >
            {task.done && (
              <span className="font-display text-[14px] font-extrabold text-bg">✓</span>
            )}
          </span>
        </button>
      ) : (
        <span
          aria-hidden
          className="ml-[10px] h-6 w-6 shrink-0 rounded-full"
          style={{ border: "2px dashed rgba(245,243,239,0.22)" }}
        />
      )}

      {/* Title */}
      <span
        className={`font-body text-[16px] ${task.done ? "text-text-40 line-through" : ""}`}
      >
        {task.emoji} {task.title}
      </span>

      {/* Right control */}
      <span className="ml-auto shrink-0">
        {owner ? (
          <span
            className="flex items-center gap-2"
            style={popOwner ? { animation: "dibsPop .4s ease" } : undefined}
          >
            <Avatar member={owner} size={24} />
            <span className="font-body text-[13px] font-semibold" style={{ color: "rgba(245,243,239,0.7)" }}>
              {isYou ? "You" : owner.name}
            </span>
          </span>
        ) : (
          <button
            onClick={onCallDibs}
            className="min-h-11 rounded-full bg-pink px-[15px] font-display text-[13px] font-bold text-bg shadow-pink"
          >
            Call dibs
          </button>
        )}
      </span>
    </li>
  );
}
