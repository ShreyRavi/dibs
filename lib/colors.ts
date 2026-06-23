// Fixed member-avatar palette from the handoff. "You" (the first/host slot in
// the prototype) is lime; everyone else cycles the remaining colors. Past the
// palette length we cycle rather than generate random colors (design decision).
export const MEMBER_PALETTE = [
  "#c8ff4d", // lime  — first member
  "#ff5da2", // pink
  "#8b9cff", // periwinkle
  "#ffb27a", // peach
  "#6fe3c2", // mint
] as const;

export function colorForIndex(memberCount: number): string {
  return MEMBER_PALETTE[memberCount % MEMBER_PALETTE.length];
}
