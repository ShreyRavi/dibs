import { Avatar } from "./Avatar";
import type { Member } from "@/lib/types";

// Crew row as named chips (avatar + full name) — communal, shows who's in.
// "You" sorts first and is labeled You; everyone else by name. Wraps on mobile.
export function Crew({ members, you }: { members: Member[]; you: string | null }) {
  if (members.length === 0) {
    return (
      <span className="font-body text-[13px] text-text-40">
        Just you so far — call dibs to join the crew ✨
      </span>
    );
  }
  const ordered = [...members].sort((a, b) =>
    a.id === you ? -1 : b.id === you ? 1 : 0,
  );
  return (
    <div className="flex flex-wrap gap-2">
      {ordered.map((m) => (
        <span
          key={m.id}
          className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface py-1 pl-1 pr-2.5"
        >
          <Avatar member={m} size={20} />
          <span className="font-body text-[13px] font-medium text-text">
            {m.id === you ? "You" : m.name}
          </span>
        </span>
      ))}
    </div>
  );
}
