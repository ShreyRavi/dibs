import Link from "next/link";

// 404 / list-not-found — warm, on-brand (design review spec). Full polish in T9.
export default function ListNotFound() {
  return (
    <main className="screen flex flex-col items-center justify-center px-6 text-center">
      <div
        className="mb-6 grid h-[120px] w-[120px] place-items-center rounded-full text-[40px]"
        style={{
          transform: "rotate(-8deg)",
          border: "2px dashed rgba(255,255,255,0.18)",
        }}
        aria-hidden
      >
        🎈
      </div>
      <h1 className="font-display text-[24px] font-bold tracking-[-0.5px]">
        this list isn&apos;t around anymore
      </h1>
      <p className="mt-2 font-body text-[14px] text-text-50">
        the link may have expired or the event already wrapped
      </p>
      <Link
        href="/new"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-hairline-strong px-5 font-display text-[15px] font-bold text-text"
      >
        start your own list →
      </Link>
    </main>
  );
}
