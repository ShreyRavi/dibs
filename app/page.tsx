import Link from "next/link";
import { Washes } from "@/components/Washes";
import { DibsLogo } from "@/components/DibsLogo";
import { Footer } from "@/components/Footer";

// Landing — what Dibs is, a quick visual demo of the mechanic, and a way to
// start a new group. Not a pre-filled event (that lives at /new).

function DemoRow({
  emoji,
  title,
  state,
}: {
  emoji: string;
  title: string;
  state: { kind: "done"; who: string; color: string } | { kind: "dibs" };
}) {
  return (
    <li className="flex items-center gap-3 rounded-[15px] border border-hairline bg-surface px-[14px] py-[11px]">
      {state.kind === "done" ? (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime">
          <span className="font-display text-[13px] font-extrabold text-bg">✓</span>
        </span>
      ) : (
        <span
          aria-hidden
          className="h-6 w-6 shrink-0 rounded-full"
          style={{ border: "2px dashed rgba(245,243,239,0.22)" }}
        />
      )}
      <span
        className={`font-body text-[15px] ${state.kind === "done" ? "text-text-40 line-through" : ""}`}
      >
        {emoji} {title}
      </span>
      <span className="ml-auto shrink-0">
        {state.kind === "done" ? (
          <span className="flex items-center gap-1.5">
            <span
              className="grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold text-bg"
              style={{ background: state.color, border: "2px solid #0d0d0f" }}
            >
              {state.who[0]}
            </span>
            <span className="font-body text-[12px] font-semibold text-text-60">
              {state.who}
            </span>
          </span>
        ) : (
          <span className="rounded-full bg-pink px-[13px] py-[7px] font-display text-[12px] font-bold text-bg shadow-pink">
            Call dibs
          </span>
        )}
      </span>
    </li>
  );
}

export default function Home() {
  return (
    <main className="screen flex flex-col px-[22px] pt-16 pb-[30px]">
      <Washes />

      <DibsLogo parent />

      <h1 className="mt-5 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-1.2px]">
        Call dibs on the
        <br />
        to-do list.
      </h1>
      <p className="mt-3 font-body text-[15px] text-text-50">
        Shared lists for group plans — a birthday, a trip, a potluck. Drop the link in
        any chat. Everyone claims what they&apos;ll do. No app, no login.
      </p>

      {/* Live-feel demo */}
      <div className="mt-7 font-display text-[12px] font-semibold uppercase tracking-[1.5px] text-text-40">
        Dev&apos;s Bday · demo
      </div>
      <ul className="mt-3 flex flex-col gap-[9px]">
        <DemoRow emoji="🍰" title="Order the cake" state={{ kind: "done", who: "Maya", color: "#ff5da2" }} />
        <DemoRow emoji="🎵" title="Make the playlist" state={{ kind: "dibs" }} />
        <DemoRow emoji="🎈" title="Bring decorations" state={{ kind: "dibs" }} />
      </ul>

      <Link
        href="/new"
        className="mt-7 w-full rounded-[16px] bg-lime px-4 py-[17px] text-center font-display text-[18px] font-bold text-bg shadow-lime-cta"
      >
        Create a list →
      </Link>
      <p className="mt-3 text-center font-body text-[13px] text-text-40">
        Free · takes 20 seconds · works in any group chat ✨
      </p>
      <Footer />
    </main>
  );
}
