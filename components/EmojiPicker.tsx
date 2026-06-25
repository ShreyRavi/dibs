"use client";

import { EVENT_EMOJIS } from "@/lib/emojis";

// Curated event-emoji grid picker (the list "logo"). Tap one; selected gets a
// lime ring. Web-safe set, no dependency.
export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Pick an emoji">
      {EVENT_EMOJIS.map((e) => {
        const selected = e === value;
        return (
          <button
            key={e}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={e}
            onClick={() => onChange(e)}
            className="grid aspect-square place-items-center rounded-[12px] bg-surface text-[22px]"
            style={
              selected
                ? { boxShadow: "0 0 0 2px var(--lime)", background: "rgba(200,255,77,0.1)" }
                : { border: "1px solid var(--hairline)" }
            }
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
