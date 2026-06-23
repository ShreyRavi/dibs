// Landing / Set Up entry. Full pixel-accurate Set Up screen is T6; this is the
// scaffold placeholder so the route resolves and the brand reads.
export default function Home() {
  return (
    <main className="screen flex flex-col px-[22px] pt-16 pb-8">
      <div className="flex items-center gap-3">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2"
          style={{
            transform: "rotate(-8deg)",
            boxShadow: "0 0 14px rgba(200,255,77,0.35)",
          }}
          aria-hidden
        >
          <span className="h-3 w-3 rounded-[3px] bg-lime" />
        </span>
        <span className="font-display text-[14px] font-semibold text-text-60">
          New event ✨
        </span>
      </div>

      <h1 className="mt-4 font-display text-[32px] font-bold tracking-[-1px]">
        Dibs
      </h1>
      <p className="mt-2 font-body text-[14px] text-text-50">
        Call dibs on the to-do list. No app, no login.
      </p>

      <p className="mt-auto text-center font-body text-[13px] text-text-40">
        Scaffolded. Set Up screen lands in T6.
      </p>
    </main>
  );
}
