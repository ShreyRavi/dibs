// Commemorative "EVENT COMPLETE" seal — a centered wax-stamp style badge.
// Two concentric dashed lime rings, dark radial fill, lime glow; the event emoji
// sits dead-center above a clean two-line label. No rotation, perfectly centered.
export function Seal({ emoji = "🎉" }: { emoji?: string }) {
  return (
    <div className="relative grid place-items-center" style={{ width: 168, height: 168 }}>
      {/* outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: "0 0 48px rgba(200,255,77,0.30)" }}
      />
      {/* dashed ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: "2px dashed rgba(200,255,77,0.55)" }}
      />
      {/* inner solid ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 12,
          border: "1px solid rgba(200,255,77,0.25)",
          background: "radial-gradient(circle at 50% 38%, #1d2611, #14130f)",
        }}
      />
      {/* centered content */}
      <div className="relative flex flex-col items-center justify-center text-center">
        <div className="text-[40px] leading-none">{emoji}</div>
        <div className="mt-2 font-display text-[13px] font-extrabold leading-[1.3] tracking-[3px] text-lime">
          EVENT
          <br />
          COMPLETE
        </div>
      </div>
    </div>
  );
}
