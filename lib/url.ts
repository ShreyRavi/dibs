// Only accept http(s) URLs. Blocks javascript:/data: schemes that would be an
// XSS vector when the invite link is rendered as an <a href>.
export function safeHttpUrl(input: string | null | undefined): string | null {
  const v = (input ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* not a URL */
  }
  return null;
}
