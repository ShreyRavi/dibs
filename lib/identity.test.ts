import { describe, it, expect } from "vitest";
import { makeToken, verifyToken, sign, cookieName } from "./identity";

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
