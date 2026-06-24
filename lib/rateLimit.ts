// Rate limiter with two backends:
//  - Upstash Redis REST (distributed, shared across instances) when
//    UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
//  - In-memory fixed window (per serverless instance, resets on cold start)
//    otherwise — fine as a soft guard for low traffic.
// Set the Upstash env vars (free tier works) to harden against real abuse.

export interface RateResult {
  ok: boolean;
  retryAfterMs: number;
}

// ── in-memory backend ────────────────────────────────────────────────────────
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function memoryLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (b.count >= max) return { ok: false, retryAfterMs: b.resetAt - now };
  b.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

// ── Upstash REST backend ─────────────────────────────────────────────────────
async function upstashLimit(
  url: string,
  token: string,
  key: string,
  max: number,
  windowMs: number,
): Promise<RateResult> {
  const windowSec = Math.ceil(windowMs / 1000);
  // Atomic-ish fixed window: INCR, set TTL only on the first hit (NX).
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
    ]),
  });
  if (!res.ok) return { ok: true, retryAfterMs: 0 }; // fail open on KV outage
  const data = (await res.json()) as Array<{ result: number }>;
  const count = data?.[0]?.result ?? 1;
  if (count > max) return { ok: false, retryAfterMs: windowMs };
  return { ok: true, retryAfterMs: 0 };
}

// Returns whether `key` is within `max` hits per `windowMs`.
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await upstashLimit(url, token, `dibs:rl:${key}`, max, windowMs);
    } catch {
      return memoryLimit(key, max, windowMs); // fall back if the KV call throws
    }
  }
  return memoryLimit(key, max, windowMs);
}

// Best-effort client key from proxy headers (Vercel sets x-forwarded-for).
export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
