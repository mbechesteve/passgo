import { describe, expect, it, beforeEach } from "vitest";
import {
  DEMO_NOW,
  now,
  setUseRealTime,
  isRealTime,
  TOURNAMENT_START,
  TOURNAMENT_END,
} from "@/lib/clock";
import { daysUntil } from "@/utils/format";

beforeEach(() => setUseRealTime(false));

describe("the demo clock", () => {
  it("is pinned to Wednesday 2027-06-23 at 12:55 EAT", () => {
    expect(DEMO_NOW.toISOString()).toBe("2027-06-23T09:55:00.000Z");
    // 12:55 EAT === 09:55 UTC, and 2027-06-23 is a Wednesday.
    expect(DEMO_NOW.getUTCDay()).toBe(3);
  });

  it("leaves exactly 24 days of validity — the figure in Figure 3", () => {
    expect(daysUntil(TOURNAMENT_END, DEMO_NOW)).toBe(24);
  });

  it("sits inside the tournament window", () => {
    expect(new Date(TOURNAMENT_START).getTime()).toBeLessThan(DEMO_NOW.getTime());
    expect(new Date(TOURNAMENT_END).getTime()).toBeGreaterThan(DEMO_NOW.getTime());
  });

  it("returns the demo date by default", () => {
    expect(now().toISOString()).toBe(DEMO_NOW.toISOString());
    expect(isRealTime()).toBe(false);
  });

  it("returns real time once switched", () => {
    setUseRealTime(true);
    expect(isRealTime()).toBe(true);
    expect(now().getTime()).not.toBe(DEMO_NOW.getTime());
  });
});
