"use client";

import { useRef } from "react";
import { formatEventAt } from "@/lib/format";

// A clean date+time control: shows only the formatted line (handoff style) and
// opens the OS picker on tap via showPicker(). Avoids the native widget's own
// text rendering next to our formatted label (the redundancy design review flagged).
export function DateField({
  value,
  onChange,
}: {
  value: string; // datetime-local string "YYYY-MM-DDTHH:mm"
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function open() {
    const el = ref.current;
    if (!el) return;
    // showPicker is the modern path; fall back to focus+click for older engines.
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* not allowed in this context — fall through */
      }
    }
    el.focus();
    el.click();
  }

  return (
    <div className="relative mt-1 inline-flex">
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-1.5 font-body text-[14px] text-text-50"
      >
        <span aria-hidden>📅</span>
        <span>{value ? formatEventAt(value) : "Pick a date"}</span>
      </button>
      {/* Visually-hidden native input drives the value + the OS picker. */}
      <input
        ref={ref}
        type="datetime-local"
        aria-label="Event date and time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0 [color-scheme:dark]"
        tabIndex={-1}
      />
    </div>
  );
}
