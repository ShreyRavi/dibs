import type { Member } from "@/lib/types";

// Member avatar: initial on a colored circle, dark ring (handoff). Sizes vary by
// context (24-34px). Text/icon on bright accents is dark #0d0d0f.
export function Avatar({ member, size = 24 }: { member: Member; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display font-bold text-bg"
      style={{
        width: size,
        height: size,
        background: member.color,
        border: "2px solid #0d0d0f",
        fontSize: Math.round(size * 0.42),
      }}
      title={member.name}
    >
      {member.name.charAt(0).toUpperCase()}
    </span>
  );
}

// Overlapping stack of avatars (margin-left -8px), handoff crew row.
export function AvatarStack({
  members,
  size = 30,
}: {
  members: Member[];
  size?: number;
}) {
  return (
    <span className="flex items-center">
      {members.map((m, i) => (
        <span key={m.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar member={m} size={size} />
        </span>
      ))}
    </span>
  );
}
