"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Copy-link + native-share + open-list actions for the share surface (client).
export function ShareActions({ listId, title }: { listId: string; title: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/l/${listId}` : "";

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: `Call dibs 👇`, url });
        return;
      } catch {
        // user cancelled or unsupported — fall through to copy
      }
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — link is shown below regardless */
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        onClick={share}
        className="w-full rounded-[14px] bg-lime px-4 py-4 font-display text-[17px] font-bold text-bg shadow-lime-cta"
      >
        Share the link →
      </button>
      <button
        onClick={copy}
        className="w-full rounded-[14px] px-4 py-3 font-display text-[15px] font-bold text-text"
        style={{ border: "1px solid rgba(245,243,239,0.18)" }}
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <button
        onClick={() => router.push(`/l/${listId}`)}
        className="w-full py-2 font-body text-[14px] text-text-50"
      >
        Open the list →
      </button>
    </div>
  );
}
