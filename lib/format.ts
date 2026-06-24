// Format an ISO timestamp (or datetime-local string) as the handoff date line,
// e.g. "Sat, Jun 27 · 8 PM". Returns "" for empty/invalid input.
export function formatEventAt(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: d.getMinutes() ? "2-digit" : undefined,
  });
  return `${date} · ${time}`;
}
