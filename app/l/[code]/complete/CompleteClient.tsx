"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Washes } from "@/components/Washes";
import { Seal } from "@/components/Seal";
import { StatChip } from "@/components/StatChip";
import { Avatar } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { Footer } from "@/components/Footer";
import type { Member } from "@/lib/types";

interface CrewEntry {
  member: Member;
  done: { emoji: string; title: string }[];
}

// Complete payoff screen. Fires confetti once on entry. Shows each person and
// the tasks they finished (who did what). Reduced-motion → no confetti.
export default function CompleteClient({
  code,
  emoji,
  title,
  sub,
  tasksDone,
  people,
  droppedBalls,
  crew,
}: {
  code: string;
  emoji: string;
  title: string;
  sub: string;
  tasksDone: number;
  people: number;
  droppedBalls: number;
  crew: CrewEntry[];
}) {
  const router = useRouter();
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    setConfettiKey(1); // fire once on mount
  }, []);

  return (
    <main className="screen flex flex-col items-center px-[26px] pt-[64px] pb-10 text-center">
      <Washes pink="80% 90%" lime="50% 8%" />
      <Confetti fireKey={confettiKey} />

      <Seal emoji={emoji} />

      <h1 className="mt-7 font-display text-[30px] font-extrabold tracking-[-0.5px]">
        {title}
      </h1>
      <p className="mt-2 font-body text-[14px] text-text-50">{sub}</p>

      <div className="mt-6 flex w-full gap-3">
        <StatChip value={tasksDone} label="tasks done" color="var(--lime)" rotate={-3} />
        <StatChip value={people} label="people" color="var(--pink)" rotate={2} />
        <StatChip value={droppedBalls} label="dropped balls" color="var(--periwinkle)" rotate={-2} />
      </div>

      {/* Pulled off by the crew — full names + what each person finished */}
      {crew.length > 0 && (
        <div className="mt-8 w-full">
          <p className="mb-3 font-body text-[13px] text-text-50">Pulled off by the crew</p>
          <ul className="flex flex-col gap-2.5 text-left">
            {crew.map(({ member, done }) => (
              <li
                key={member.id}
                className="rounded-[14px] border border-hairline bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar member={member} size={28} />
                  <span className="font-display text-[15px] font-bold text-text">
                    {member.name}
                  </span>
                  <span className="ml-auto font-body text-[12px] text-text-40">
                    {done.length} done
                  </span>
                </div>
                {done.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 pl-[38px]">
                    {done.map((t, i) => (
                      <li key={i} className="font-body text-[14px] text-text-60">
                        {t.emoji} {t.title}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto w-full pt-10">
        <button
          onClick={() => router.push("/new")}
          className="w-full rounded-[16px] bg-lime px-4 py-4 font-display text-[17px] font-bold text-bg shadow-lime-cta"
        >
          Plan the next one 🎉
        </button>
        <button
          onClick={() => router.push(`/l/${code}`)}
          className="mt-3 w-full rounded-[16px] px-4 py-3.5 font-display text-[15px] font-bold text-text"
          style={{ border: "1px solid rgba(245,243,239,0.18)" }}
        >
          Back to the list
        </button>
      </div>

      <Footer />
    </main>
  );
}
