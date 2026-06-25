import { describe, it, expect } from "vitest";
import {
  makeToken,
  verifyToken,
  sign,
  cookieName,
  normalizePhone,
  phoneHash,
} from "./identity";

describe("phone identity", () => {
  it("normalizes formats + US country code to the same digits", () => {
    expect(normalizePhone("+1 (555) 123-4567")).toBe("5551234567");
    expect(normalizePhone("15551234567")).toBe("5551234567");
    expect(normalizePhone("555.123.4567")).toBe("5551234567");
  });

  it("rejects too-short numbers", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(phoneHash("12345")).toBeNull();
  });

  it("same number (any format) → same hash; different → different", () => {
    const a = phoneHash("(555) 123-4567");
    const b = phoneHash("+1 555 123 4567");
    const c = phoneHash("555 999 0000");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("does not store the raw number (hash is opaque hex)", () => {
    const h = phoneHash("5551234567")!;
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("555");
  });
});

describe("identity", () => {
  it("round-trips a valid token for the same list", () => {
    const token = makeToken("member-1", "list-A");
    expect(verifyToken(token, "list-A")).toBe("member-1");
  });

  it("rejects a token for a different list (capability is list-scoped)", () => {
    const token = makeToken("member-1", "list-A");
    expect(verifyToken(token, "list-B")).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = makeToken("member-1", "list-A");
    const tampered = token.slice(0, -1) + (token.endsWith("0") ? "1" : "0");
    expect(verifyToken(tampered, "list-A")).toBeNull();
  });

  it("rejects a forged member id (sig won't match)", () => {
    const realSig = sign("member-1", "list-A");
    const forged = `member-2.${realSig}`;
    expect(verifyToken(forged, "list-A")).toBeNull();
  });

  it("handles undefined / malformed tokens without throwing", () => {
    expect(verifyToken(undefined, "list-A")).toBeNull();
    expect(verifyToken("no-dot-here", "list-A")).toBeNull();
    expect(verifyToken("", "list-A")).toBeNull();
  });

  it("namespaces the cookie per list", () => {
    expect(cookieName("abc")).toBe("dibs_abc");
    expect(cookieName("abc")).not.toBe(cookieName("xyz"));
  });
});
