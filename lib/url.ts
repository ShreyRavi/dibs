// Normalize + safety-check an invite URL. Coerces a bare domain
// ("partiful.com/e/x") to https:// rather than rejecting it, and only ever
// returns http(s) URLs — blocking javascript:/data: XSS vectors when the link
// is rendered as an <a href>. Returns null for empty/unsafe input.
export function safeHttpUrl(input: string | null | undefined): string | null {
  let v = (input ?? "").trim();
  if (!v) return null;
  // No scheme (no "x://") → assume https.
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* not a usable URL */
  }
  return null;
}
