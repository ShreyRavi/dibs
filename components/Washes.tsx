// Decorative radial background washes (handoff: pink top-left, lime top-right).
// pointer-events:none, sits under content. Positions configurable per screen.
export function Washes({
  pink = "30% 25%",
  lime = "70% 20%",
}: {
  pink?: string;
  lime?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${pink}, rgba(255,93,162,0.20), transparent 62%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${lime}, rgba(200,255,77,0.15), transparent 62%)`,
        }}
      />
    </div>
  );
}
