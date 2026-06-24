import { describe, it, expect } from "vitest";
import { rateLimit, clientKey } from "./rateLimit";

describe("rateLimit (in-memory backend, no KV env)", () => {
  it("allows up to max within the window, then blocks", async () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect((await rateLimit(key, 3, 10_000)).ok).toBe(true);
    const blocked = await rateLimit(key, 3, 10_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", async () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect((await rateLimit(a, 1, 10_000)).ok).toBe(true);
    expect((await rateLimit(a, 1, 10_000)).ok).toBe(false);
    expect((await rateLimit(b, 1, 10_000)).ok).toBe(true); // b unaffected
  });

  it("clientKey prefers the first x-forwarded-for hop", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKey(h)).toBe("1.2.3.4");
    expect(clientKey(new Headers())).toBe("unknown");
  });
});
