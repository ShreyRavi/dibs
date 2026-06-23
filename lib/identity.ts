import { createHmac, timingSafeEqual } from "crypto";

// Device identity with no login: a per-list httpOnly cookie carrying
// `${memberId}.${sig}` where sig = HMAC(secret, `${memberId}:${listId}`).
// Stateless to verify (recompute the HMAC); the member row is then confirmed in
// the DB by requireMember. New device = no cookie = new member on first claim.

function secret(): string {
  const s = process.env.DIBS_COOKIE_SECRET;
  if (!s) throw new Error("Missing DIBS_COOKIE_SECRET");
  return s;
}

export function cookieName(listId: string): string {
  return `dibs_${listId}`;
}

export function sign(memberId: string, listId: string): string {
  return createHmac("sha256", secret())
    .update(`${memberId}:${listId}`)
    .digest("hex");
}

export function makeToken(memberId: string, listId: string): string {
  return `${memberId}.${sign(memberId, listId)}`;
}

// Returns the memberId if the token is valid for this list, else null.
export function verifyToken(
  token: string | undefined,
  listId: string,
): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const memberId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(memberId, listId);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? memberId : null;
}
