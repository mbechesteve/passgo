import { describe, expect, it } from "vitest";
import { kes, daysUntil } from "@/utils/format";

describe("kes", () => {
  it("formats whole numbers with thousands separators", () => {
    expect(kes(629250)).toBe("KES 629,250");
  });
  it("rounds fractional KES", () => {
    expect(kes(348433.72)).toBe("KES 348,434");
  });
  it("renders an em dash for undefined", () => {
    expect(kes(undefined)).toBe("—");
  });
  it("handles zero", () => {
    expect(kes(0)).toBe("KES 0");
  });
});

describe("daysUntil", () => {
  const now = new Date("2026-06-24T00:00:00Z");
  it("counts whole days to a future date", () => {
    expect(daysUntil("2026-07-01T00:00:00Z", now)).toBe(7);
  });
  it("returns 0 on the same day", () => {
    expect(daysUntil("2026-06-24T12:00:00Z", now)).toBe(0);
  });
  it("returns negative for past dates", () => {
    expect(daysUntil("2026-06-20T00:00:00Z", now)).toBe(-4);
  });
  it("returns null for undefined", () => {
    expect(daysUntil(undefined, now)).toBeNull();
  });
  it("requires an explicit instant — no hidden read of the wall clock", () => {
    // @ts-expect-error - `now` is required; omitting it must not type-check
    expect(() => daysUntil("2026-07-01T00:00:00Z")).toThrow();
  });
});
