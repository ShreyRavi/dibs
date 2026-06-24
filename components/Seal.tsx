// Commemorative "EVENT COMPLETE" seal (handoff Complete screen): 150px circle,
// rotated -8deg, dashed lime border, radial-gradient fill, lime glow.
export function Seal() {
  return (
    <div
      className="grid place-items-center rounded-full"
      style={{
        width: 150,
        height: 150,
        transform: "rotate(-8deg)",
        background: "radial-gradient(circle at 50% 32%, #1d2611, #14130f)",
        border: "2px dashed rgba(200,255,77,0.55)",
        boxShadow: "0 0 42px rgba(200,255,77,0.28)",
      }}
    >
      <div className="text-[38px] leading-none">🎉</div>
      <div className="mt-1 text-center font-display text-[15px] font-extrabold leading-[1.15] tracking-[2.5px] text-lime">
        EVENT
        <br />
        COMPLETE
      </div>
    </div>
  );
}
