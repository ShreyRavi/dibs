// Split a leading emoji off a typed task ("🍕 pizza" → {emoji,title}).
export function splitLeadingEmoji(input: string): { emoji: string; title: string } {
  const m = input
    .trim()
    .match(/^(\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic})*)\s*(.*)$/u);
  if (m && m[2]) return { emoji: m[1], title: m[2] };
  return { emoji: "✨", title: input.trim() };
}

// Split a comma-separated phrase into trimmed, non-empty task titles.
// "cake, 🎵 playlist, , bar" → ["cake", "🎵 playlist", "bar"]
export function splitTasks(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
