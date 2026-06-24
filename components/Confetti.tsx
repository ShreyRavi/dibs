"use client";

import { useEffect, useState } from "react";

// Confetti overlay (handoff dibsConfetti): 20 pieces falling + rotating, accent
// colors, cleared after 1.75s. Honors prefers-reduced-motion (renders nothing —
// the calling screen shows a calm payoff instead). aria-hidden.
const COLORS = ["#c8ff4d", "#ff5da2", "#8b9cff", "#ffb27a", "#6fe3c2", "#f5f3ef"];

interface Piece {
  id: number;
  left: number;
  w: number;
  h: number;
  color: string;
  delay: number;
  dur: number;
}

export function Confetti({ fireKey }: { fireKey: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (fireKey === 0) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // calm mode: no confetti
    }
    const next: Piece[] = Array.from({ length: 20 }, (_, i) => ({
      id: fireKey * 100 + i,
      left: Math.random() * 100,
      w: 6 + Math.random() * 6,
      h: 9 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 200,
      dur: 900 + Math.random() * 750,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1750);
    return () => clearTimeout(t);
  }, [fireKey]);

  if (!pieces.length) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[95] overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: 2,
            animation: `dibsConfetti ${p.dur}ms cubic-bezier(.2,.6,.4,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
