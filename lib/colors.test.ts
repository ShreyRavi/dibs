import { describe, it, expect } from "vitest";
import { colorForIndex, MEMBER_PALETTE } from "./colors";

describe("colors", () => {
  it("first member is lime (You slot)", () => {
    expect(colorForIndex(0)).toBe("#c8ff4d");
  });

  it("assigns distinct colors within the palette length", () => {
    const seen = new Set(MEMBER_PALETTE.map((_, i) => colorForIndex(i)));
    expect(seen.size).toBe(MEMBER_PALETTE.length);
  });

  it("cycles the palette past its length (no random colors)", () => {
    expect(colorForIndex(MEMBER_PALETTE.length)).toBe(colorForIndex(0));
    expect(colorForIndex(MEMBER_PALETTE.length + 1)).toBe(colorForIndex(1));
  });
});
