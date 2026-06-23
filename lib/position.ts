// Minimal fractional indexing for task ordering. Appending uses a key strictly
// greater than the last; two simultaneous appends produce different keys (each
// derived from the current max plus a random suffix), so they never collide on
// ordering. Good enough for a friend-group list; swap for a real lib if needed.

const SUFFIX_LEN = 4;

function randSuffix(): string {
  return Math.random().toString(36).slice(2, 2 + SUFFIX_LEN);
}

// Returns a position key that sorts after `last` (or first if last is null).
export function positionAfter(last: string | null): string {
  const base = last ? last.split(":")[0] : "0";
  const n = parseInt(base, 36);
  const next = (Number.isFinite(n) ? n + 1 : 1).toString(36);
  return `${next}:${randSuffix()}`;
}

export function comparePosition(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
