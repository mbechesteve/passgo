import { describe, expect, it } from "vitest";

import { AIR_LINKS } from "@/data/air";
import { BORDER_CROSSINGS } from "@/data/borders";
import { FUEL_ASSUMPTIONS, fuelAssumptionLabel, fuelEstimate } from "./cost";

describe("fuelEstimate", () => {
  it("is distance × consumption × price", () => {
    // 900 km at 8 L/100 km is 72 L; at KES 190 that is 13,680, shown as 13,700.
    expect(fuelEstimate(900)).toBe(13700);
  });

  it("rounds to the nearest hundred, so it cannot read as a quote", () => {
    for (const km of [1, 273, 653, 900, 2400]) {
      expect(fuelEstimate(km) % 100).toBe(0);
    }
  });

  it("scales with distance", () => {
    expect(fuelEstimate(600)).toBeGreaterThan(fuelEstimate(300));
  });

  it("costs nothing for no distance, and never goes negative", () => {
    expect(fuelEstimate(0)).toBe(0);
    expect(fuelEstimate(-100)).toBe(0);
  });

  it("honours different assumptions, which is the point of exposing them", () => {
    const thirsty = fuelEstimate(900, { litresPer100Km: 12, kesPerLitre: 190 });
    expect(thirsty).toBeGreaterThan(fuelEstimate(900));
  });

  it("keeps its published assumptions plausible", () => {
    expect(FUEL_ASSUMPTIONS.litresPer100Km).toBeGreaterThan(0);
    expect(FUEL_ASSUMPTIONS.kesPerLitre).toBeGreaterThan(0);
  });

  it("gives every crossing a usable estimate", () => {
    for (const c of BORDER_CROSSINGS) {
      expect(fuelEstimate(c.distanceKm), `no estimate for ${c.id}`).toBeGreaterThan(0);
    }
  });

  it("costs more to drive to Dar than to Arusha, as the road says", () => {
    const dar = BORDER_CROSSINGS.find((c) => c.id === "bx-in-tz-dar")!;
    const arusha = BORDER_CROSSINGS.find((c) => c.id === "bx-in-tz-arusha")!;
    expect(fuelEstimate(dar.distanceKm)).toBeGreaterThan(
      fuelEstimate(arusha.distanceKm)
    );
  });
});

describe("fuelAssumptionLabel", () => {
  it("prints the very numbers the estimate used", () => {
    expect(fuelAssumptionLabel()).toBe("8 L/100 km at KES 190 a litre");
  });

  it("follows the assumptions rather than restating them", () => {
    expect(fuelAssumptionLabel({ litresPer100Km: 12, kesPerLitre: 205 })).toBe(
      "12 L/100 km at KES 205 a litre"
    );
  });
});

describe("the seeded fare estimates", () => {
  it("gives every leg a range, low before high", () => {
    for (const l of AIR_LINKS) {
      expect(l.fareEstimate.low).toBeGreaterThan(0);
      expect(l.fareEstimate.high).toBeGreaterThan(l.fareEstimate.low);
    }
  });

  it("never prices an international leg below a domestic one", () => {
    // Not a claim about any particular fare — a structural check, so a seed edit
    // cannot quietly make Dar es Salaam cheaper than Eldoret.
    const domestic = AIR_LINKS.filter((l) => l.country === "KE");
    const international = AIR_LINKS.filter((l) => l.country !== "KE");
    const dearestDomestic = Math.max(...domestic.map((l) => l.fareEstimate.low));
    for (const l of international) {
      expect(l.fareEstimate.low).toBeGreaterThanOrEqual(dearestDomestic);
    }
  });
});
