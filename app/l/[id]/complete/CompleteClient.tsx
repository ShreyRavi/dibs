"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Washes } from "@/components/Washes";
import { Seal } from "@/components/Seal";
import { StatChip } from "@/components/StatChip";
import { AvatarStack } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import type { Member } from "@/lib/types";

// Complete payoff screen. Fires confetti once on entry (handoff). Reduced-motion
// users get the static seal without confetti (Confetti self-suppresses).
export default function CompleteClient({
  listId,
  title,
  sub,
  tasksDone,
  people,
  droppedBalls,
  members,
}: {
  listId: string;
  title: string;
  sub: string;
  tasksDone: number;
  people: number;
  droppedBalls: number;
  members: Member[];
}) {
  const router = useRouter();
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    setConfettiKey(1); // fire once on mount
  }, []);

  return (
    <main className="screen flex flex-col items-center px-[26px] pt-[74px] pb-10 text-center">
      <Washes pink="80% 90%" lime="50% 8%" />
      <Confetti fireKey={confettiKey} />

      <Seal />

      <h1 className="mt-7 font-display text-[30px] font-extrabold tracking-[-0.5px]">
        {title}
      </h1>
      <p className="mt-2 font-body text-[14px] text-text-50">{sub}</p>

      <div className="mt-6 flex w-full gap-3">
        <StatChip value={tasksDone} label="tasks done" color="var(--lime)" rotate={-3} />
        <StatChip value={people} label="people" color="var(--pink)" rotate={2} />
        <StatChip value={droppedBalls} label="dropped balls" color="var(--periwinkle)" rotate={-2} />
      </div>

      {members.length > 0 && (
        <div className="mt-7 flex flex-col items-center gap-2">
          <span className="font-body text-[13px] text-text-50">Pulled off by the crew</span>
          <AvatarStack members={members} size={32} />
        </div>
      )}

      <div className="mt-auto w-full pt-10">
        <button
          onClick={() => router.push("/")}
          className="w-full rounded-[16px] bg-lime px-4 py-4 font-display text-[17px] font-bold text-bg shadow-lime-cta"
        >
          Plan the next one 🎉
        </button>
        <button
          onClick={() => router.push(`/l/${listId}`)}
          className="mt-3 w-full rounded-[16px] px-4 py-3.5 font-display text-[15px] font-bold text-text"
          style={{ border: "1px solid rgba(245,243,239,0.18)" }}
        >
          Back to the list
        </button>
      </div>
    </main>
  );
}
