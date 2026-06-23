// A single stat chip on the Complete screen (handoff): big number + small label,
// slightly rotated for the sticker feel. Color applies to the number.
export function StatChip({
  value,
  label,
  color,
  rotate,
}: {
  value: number | string;
  label: string;
  color: string;
  rotate: number;
}) {
  return (
    <div
      className="flex-1 rounded-[13px] bg-surface px-2 py-3 text-center"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="font-display text-[22px] font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 font-body text-[11px] text-text-40">{label}</div>
    </div>
  );
}
