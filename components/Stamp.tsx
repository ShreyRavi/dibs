// The in-feature brand mark: a dark rounded-square "stamp" holding a lime square,
// rotated -8deg with a lime glow. The signature sticker motif (handoff).
export function Stamp({ size = 28 }: { size?: number }) {
  const inner = Math.round(size * 0.43);
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-lg bg-surface-2"
      style={{
        width: size,
        height: size,
        transform: "rotate(-8deg)",
        boxShadow: "0 0 14px rgba(200,255,77,0.35)",
      }}
    >
      <span
        className="rounded-[3px] bg-lime"
        style={{ width: inner, height: inner }}
      />
    </span>
  );
}
