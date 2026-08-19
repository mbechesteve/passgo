import { describe, expect, it } from "vitest";

import { PARKING_ZONES } from "@/data/parking";
import { walkRangeLabel } from "./parking";

const zone = (id: string, walkMinutes: number) => ({
  id,
  zone: id.toUpperCase(),
  detail: "",
  walkMinutes,
});

describe("walkRangeLabel", () => {
  it("spans the shortest and longest walk", () => {
    expect(walkRangeLabel([zone("a", 4), zone("b", 7), zone("c", 18)])).toBe("4–18");
  });

  it("does not care what order the zones arrive in", () => {
    expect(walkRangeLabel([zone("c", 18), zone("a", 4), zone("b", 7)])).toBe("4–18");
  });

  it("collapses to one figure when every zone walks the same", () => {
    expect(walkRangeLabel([zone("a", 7), zone("b", 7)])).toBe("7");
  });

  it("gives one figure for one zone", () => {
    expect(walkRangeLabel([zone("a", 4)])).toBe("4");
  });

  it("returns null with nothing to describe, rather than an empty range", () => {
    expect(walkRangeLabel([])).toBeNull();
  });

  it("uses an en dash, as the rest of the app's ranges do", () => {
    expect(walkRangeLabel([zone("a", 4), zone("b", 18)])).not.toContain("-");
  });

  it("describes the seeded zones the Parking screen actually lists", () => {
    // Guards the band against the seed changing underneath it: the range shown on
    // Driving must be the range Parking itself renders.
    expect(walkRangeLabel(PARKING_ZONES)).toBe("4–18");
  });
});
