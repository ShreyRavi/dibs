"use client";

import { useState } from "react";
import { Stamp } from "./Stamp";

// First-claim identity prompt: name + phone. Phone is the durable key so the
// same person is recognized on any device (no duplicate). On-brand modal,
// fires only on a device that isn't a member yet.
export function NamePrompt({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: { name: string; phone: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const digits = phone.replace(/\D/g, "").length;
  const valid = name.trim().length > 0 && digits >= 7;

  function submit() {
    if (!valid) return;
    onSubmit({ name: name.trim(), phone: phone.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-[97] flex items-end justify-center bg-black/60 px-4 pb-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Join the list"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[400px] rounded-[20px] border border-hairline-strong bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <Stamp size={24} />
          <span className="font-display text-[13px] font-semibold text-text-60">
            Call dibs
          </span>
        </div>

        <h2 className="mt-3 font-display text-[22px] font-bold tracking-[-0.5px]">
          What&apos;s your name?
        </h2>
        <p className="mt-1 font-body text-[13px] text-text-50">
          So the crew knows who&apos;s got what.
        </p>

        <input
          aria-label="Your name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && digits >= 7 && submit()}
          placeholder="Your name"
          className="mt-4 w-full rounded-[12px] border border-hairline bg-bg px-3.5 py-3 font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />
        <input
          aria-label="Your number"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          // Keep it numeric only — strip anything that isn't a digit as they type.
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Your number — e.g. 5551234567"
          className="mt-2.5 w-full rounded-[12px] border border-hairline bg-bg px-3.5 py-3 font-body text-[16px] text-text caret-[var(--lime)] outline-none placeholder:text-text-40"
        />
        <p className="mt-2 font-body text-[12px] text-text-40">
          Your number just keeps it you on any device — no code, no spam.
        </p>

        <button
          onClick={submit}
          disabled={!valid}
          className="mt-4 w-full rounded-[14px] bg-lime px-4 py-3.5 font-display text-[16px] font-bold text-bg shadow-lime-cta disabled:opacity-50"
        >
          Join the list →
        </button>
      </div>
    </div>
  );
}
