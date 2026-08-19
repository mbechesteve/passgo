import { describe, expect, it } from "vitest";
import { BORDER_CROSSINGS } from "@/data/borders";
import type { OriginCountry } from "@/types";

const ORIGINS: OriginCountry[] = ["UG", "TZ", "RW", "ET"];

describe("the border crossings", () => {
  it("has exactly one record per origin country", () => {
    for (const origin of ORIGINS) {
      expect(BORDER_CROSSINGS.filter((c) => c.origin === origin).length).toBe(1);
    }
  });

  it("gives every record a unique origin", () => {
    expect(new Set(BORDER_CROSSINGS.map((c) => c.origin)).size).toBe(
      BORDER_CROSSINGS.length
    );
  });

  it("never leaves requirements or goodToKnow empty", () => {
    for (const c of BORDER_CROSSINGS) {
      expect(c.requirements.length).toBeGreaterThan(0);
      expect(c.goodToKnow.length).toBeGreaterThan(0);
    }
  });

  it("gives every record an insurance-related requirement — Ethiopia used to be the exception", () => {
    // This is the test that would have caught the original defect: Ethiopia, on
    // the longest and remotest drive, had no insurance requirement at all.
    for (const c of BORDER_CROSSINGS) {
      const hasInsurance = c.requirements.some((r) =>
        /insurance|yellow card/i.test(r.label)
      );
      expect(hasInsurance).toBe(true);
    }
  });

  it("never lets the carnet stand in for insurance", () => {
    // A carnet de passage is a customs document, not insurance — the two must
    // never be presented as substitutes for one another.
    const et = BORDER_CROSSINGS.find((c) => c.origin === "ET")!;
    const carnet = et.requirements.find((r) => r.label === "Carnet de passage")!;
    expect(carnet.detail.toLowerCase()).not.toContain("yellow card");
    expect(carnet.detail.toLowerCase()).not.toContain("insurance");
  });

  it("gives every record an as-of date", () => {
    for (const c of BORDER_CROSSINGS) {
      expect(c.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("warns Rwanda and Ethiopia they drive on the right at home — the actual mix-up caught during implementation", () => {
    for (const origin of ["RW", "ET"] as OriginCountry[]) {
      const c = BORDER_CROSSINGS.find((x) => x.origin === origin)!;
      const driveSide = c.goodToKnow.find((g) => g.label === "Drive side")!;
      expect(driveSide.detail).toContain("right at home");
    }
  });

  it("tells Uganda and Tanzania they already drive on the left — the same side as home", () => {
    for (const origin of ["UG", "TZ"] as OriginCountry[]) {
      const c = BORDER_CROSSINGS.find((x) => x.origin === origin)!;
      const driveSide = c.goodToKnow.find((g) => g.label === "Drive side")!;
      expect(driveSide.detail).toMatch(/^Left/);
    }
  });
});
