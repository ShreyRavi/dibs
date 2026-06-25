import { AvatarStack } from "./Avatar";
import type { Member } from "@/lib/types";

// The in-app Dibs card preview (handoff "THE DIBS CARD"). Richer than the static
// OG image because here we have live data: progress bar, needs-owner line, crew.
export function DibsCard({
  title,
  date,
  done,
  total,
  needOwner,
  members,
}: {
  title: string;
  date: string;
  done: number;
  total: number;
  needOwner: number;
  members: Member[];
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className="rounded-[22px] bg-bg p-4"
      style={{
        border: "1px solid rgba(200,255,77,0.22)",
        boxShadow: "0 0 30px rgba(200,255,77,0.1), 0 8px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* chiplet */}
      <div className="flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-surface-2">
          <span className="h-2 w-2 rounded-[2px] bg-lime" />
        </span>
        <span className="font-display text-[12px] font-semibold tracking-[0.3px] text-text-50">
          DIBS · shared list
        </span>
      </div>

      <h2 className="mt-2 font-display text-[21px] font-bold">{title}</h2>
      {date && <p className="mt-0.5 font-body text-[13px] text-text-50">{date}</p>}

      {/* progress */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.09)" }}>
          <div className="h-full rounded-full bg-lime" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-display text-[13px] font-semibold text-text-50">
          {done}/{total}
        </span>
      </div>

      {needOwner > 0 && (
        <p className="mt-2 font-body text-[13px] font-semibold text-pink">
          ⚡ {needOwner} task{needOwner > 1 ? "s" : ""} still need{needOwner === 1 ? "s" : ""} an owner
        </p>
      )}

      {members.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <AvatarStack members={members} size={28} />
          <span className="font-body text-[13px] text-text-50">
            {members.length} {members.length === 1 ? "person" : "people"}
          </span>
        </div>
      )}
    </div>
  );
}
