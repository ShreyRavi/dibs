import { describe, it, expect } from "vitest";
import { safeHttpUrl } from "./url";
describe("safeHttpUrl", () => {
  it("allows http/https", () => {
    expect(safeHttpUrl("https://partiful.com/e/x")).toContain("partiful.com");
    expect(safeHttpUrl("http://evite.com")).toContain("evite.com");
  });
  it("coerces a bare domain to https (the create-400 fix)", () => {
    expect(safeHttpUrl("partiful.com/e/abc")).toBe("https://partiful.com/e/abc");
  });
  it("blocks javascript: and other schemes (XSS guard)", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("javascript://alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
  });
});
