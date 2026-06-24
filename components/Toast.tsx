"use client";

import { useEffect } from "react";

// Transient pill toast at bottom-center: warm-white bg, dark text, enters with
// fade+rise, auto-dismisses ~1.9s (handoff). aria-live for screen readers.
export function Toast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-7 z-[96] flex justify-center px-6"
    >
      <div
        className="rounded-full bg-text px-4 py-2.5 font-display text-[14px] font-semibold text-bg shadow-lg"
        style={{ animation: "dibsToast .3s ease" }}
      >
        {message}
      </div>
    </div>
  );
}
