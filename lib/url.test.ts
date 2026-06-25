import { describe, it, expect } from "vitest";
import { safeHttpUrl } from "./url";
describe("safeHttpUrl", () => {
  it("allows http/https", () => {
    expect(safeHttpUrl("https://partiful.com/e/x")).toContain("partiful.com");
    expect(safeHttpUrl("http://evite.com")).toContain("evite.com");
  });
  it("blocks javascript: and other schemes (XSS guard)", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
  });
});
