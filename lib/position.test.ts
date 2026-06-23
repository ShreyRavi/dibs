import { describe, it, expect } from "vitest";
import { positionAfter, comparePosition } from "./position";

describe("position", () => {
  it("first position sorts before a later one", () => {
    const first = positionAfter(null);
    const second = positionAfter(first);
    expect(comparePosition(first, second)).toBeLessThan(0);
  });

  it("each append sorts after the previous (monotonic)", () => {
    let last: string | null = null;
    const keys: string[] = [];
    for (let i = 0; i < 10; i++) {
      last = positionAfter(last);
      keys.push(last);
    }
    const sorted = [...keys].sort(comparePosition);
    expect(sorted).toEqual(keys);
  });

  it("two simultaneous appends after the same key do not collide", () => {
    const base = positionAfter(null);
    const a = positionAfter(base);
    const b = positionAfter(base);
    expect(a).not.toBe(b); // random suffix differentiates concurrent adds
  });

  it("comparePosition is a total order", () => {
    expect(comparePosition("a", "b")).toBeLessThan(0);
    expect(comparePosition("b", "a")).toBeGreaterThan(0);
    expect(comparePosition("a", "a")).toBe(0);
  });
});
