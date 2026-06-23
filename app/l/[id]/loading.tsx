// Loading skeleton for the List route (first paint while the snapshot loads).
// Shimmer blocks in the handoff surface color; no spinner-on-blank.
export default function ListLoading() {
  return (
    <main className="screen flex flex-col px-5 pt-14 pb-[30px]">
      <div className="font-body text-[12px] text-text-40">← shared list</div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-7 w-2/3 animate-pulse rounded-md bg-surface" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-surface" />
      </div>
      <div className="mt-4 h-4 w-24 animate-pulse rounded bg-surface" />
      <ul className="mt-4 flex flex-col gap-[9px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="h-[52px] animate-pulse rounded-[15px] border border-hairline bg-surface"
          />
        ))}
      </ul>
    </main>
  );
}
