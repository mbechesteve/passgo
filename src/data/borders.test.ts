import { describe, expect, it } from "vitest";
import { BORDER_CROSSINGS } from "@/data/borders";
import type { OriginCountry } from "@/types";

const ORIGINS: OriginCountry[] = ["UG", "TZ", "RW", "ET"];
const inbound = BORDER_CROSSINGS.filter((c) => c.direction === "in");
const outbound = BORDER_CROSSINGS.filter((c) => c.direction === "out");
const byId = (id: string) => BORDER_CROSSINGS.find((c) => c.id === id)!;

describe("the border crossings", () => {
  it("gives every record a unique id", () => {
    expect(new Set(BORDER_CROSSINGS.map((c) => c.id)).size).toBe(
      BORDER_CROSSINGS.length
    );
  });

  it("has at least one inbound record per origin country", () => {
    for (const country of ORIGINS) {
      expect(
        inbound.filter((c) => c.country === country).length,
        `nothing inbound from ${country}`
      ).toBeGreaterThan(0);
    }
  });

  it("runs every inbound route into Nairobi and every outbound route out of it", () => {
    // The defect this guards: the screen once held only inbound routes, so one heading
    // answered two questions — Drive said how to reach Kenya, Fly how to leave it.
    for (const c of inbound) expect(c.destinationCity).toBe("Nairobi");
    for (const c of outbound) expect(c.originCity).toBe("Nairobi");
  });

  it("can leave for both away countries that have a fixture", () => {
    for (const country of ["UG", "TZ"] as OriginCountry[]) {
      expect(
        outbound.filter((c) => c.country === country).length,
        `no way out to ${country}`
      ).toBeGreaterThan(0);
    }
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
      expect(hasInsurance, `${c.id} has no insurance requirement`).toBe(true);
    }
  });

  it("never names a COMESA Yellow Card on a Tanzanian route", () => {
    // Tanzania withdrew from COMESA in 2000. d5d6797 fixed this once; the outbound
    // route was a second chance to get it wrong.
    for (const c of BORDER_CROSSINGS.filter((x) => x.country === "TZ")) {
      const labels = c.requirements.map((r) => r.label).join(" ");
      expect(labels, `${c.id} names a Yellow Card`).not.toMatch(/yellow card/i);
    }
  });

  it("never lets the carnet stand in for insurance", () => {
    // A carnet de passage is a customs document, not insurance — the two must
    // never be presented as substitutes for one another.
    const carnet = byId("bx-in-et").requirements.find(
      (r) => r.label === "Carnet de passage"
    )!;
    expect(carnet.detail.toLowerCase()).not.toContain("yellow card");
    expect(carnet.detail.toLowerCase()).not.toContain("insurance");
  });

  it("gives every record an as-of date", () => {
    for (const c of BORDER_CROSSINGS) {
      expect(c.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("warns Rwanda and Ethiopia they drive on the right at home — the actual mix-up caught during implementation", () => {
    for (const id of ["bx-in-rw", "bx-in-et"]) {
      const driveSide = byId(id).goodToKnow.find((g) => g.label === "Drive side")!;
      expect(driveSide.detail).toContain("right at home");
    }
  });

  it("tells every left-driving route it is the same side as home", () => {
    for (const id of ["bx-in-ug", "bx-in-tz-arusha", "bx-in-tz-dar", "bx-out-ug", "bx-out-tz"]) {
      const driveSide = byId(id).goodToKnow.find((g) => g.label === "Drive side")!;
      expect(driveSide.detail, `${id} drive side`).toMatch(/^Left/);
    }
  });

  it("tells a fan leaving Kenya that the currency changes", () => {
    for (const c of outbound) {
      const currency = c.goodToKnow.find((g) => g.label === "Currency")!;
      expect(currency.detail, `${c.id} currency`).toMatch(/not accepted/);
    }
  });

  it("keeps the two directions of the same road the same length", () => {
    expect(byId("bx-in-tz-dar").distanceKm).toBe(byId("bx-out-tz").distanceKm);
  });
});
