import { describe, it, expect } from "vitest";
import { formatEventAt } from "./format";

describe("formatEventAt", () => {
  it("returns empty string for null/undefined/invalid", () => {
    expect(formatEventAt(null)).toBe("");
    expect(formatEventAt(undefined)).toBe("");
    expect(formatEventAt("not-a-date")).toBe("");
  });

  it("formats a date with weekday, month, day and time", () => {
    // 2026-06-27 20:00 local
    const out = formatEventAt("2026-06-27T20:00:00");
    expect(out).toMatch(/Sat/);
    expect(out).toMatch(/Jun/);
    expect(out).toMatch(/27/);
    expect(out).toContain("·");
  });

  it("omits minutes when on the hour", () => {
    const out = formatEventAt("2026-06-27T20:00:00");
    expect(out).not.toMatch(/:00/);
  });
});
