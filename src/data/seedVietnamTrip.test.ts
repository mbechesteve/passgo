import { describe, expect, it } from "vitest";
import { VIETNAM_TRIP } from "@/data/seedVietnamTrip";

describe("VIETNAM_TRIP seed", () => {
  it("has stable id and VN country", () => {
    expect(VIETNAM_TRIP.id).toBe("trip_vietnam_2026");
    expect(VIETNAM_TRIP.countryCode).toBe("VN");
  });
  it("has both travellers", () => {
    expect(VIETNAM_TRIP.travelers).toEqual(["Mbeche", "Cyn"]);
  });
  it("documents: 10 core (all checked) + 5 backup (all checked)", () => {
    const core = VIETNAM_TRIP.documents!.filter((d) => d.folder === "core");
    const backup = VIETNAM_TRIP.documents!.filter((d) => d.folder === "backup");
    expect(core).toHaveLength(10);
    expect(backup).toHaveLength(5);
    expect(VIETNAM_TRIP.documents!.every((d) => d.checked)).toBe(true);
  });
  it("two booked flights", () => {
    expect(VIETNAM_TRIP.flights).toHaveLength(2);
    expect(VIETNAM_TRIP.flights!.every((f) => f.status === "Booked")).toBe(true);
  });
  it("two confirmed stays totalling KES 75,000", () => {
    expect(VIETNAM_TRIP.stays).toHaveLength(2);
    expect(VIETNAM_TRIP.stays!.reduce((s, x) => s + (x.totalKes ?? 0), 0)).toBe(75000);
  });
  it("budget estimated total is 629,250", () => {
    const est = VIETNAM_TRIP.budget!.reduce((s, b) => s + (b.estimatedKes ?? 0), 0);
    expect(est).toBe(629250);
  });
  it("every id in every list is unique", () => {
    const ids = [
      ...VIETNAM_TRIP.documents!,
      ...VIETNAM_TRIP.flights!,
      ...VIETNAM_TRIP.stays!,
      ...VIETNAM_TRIP.schedule!,
      ...VIETNAM_TRIP.budget!,
      ...VIETNAM_TRIP.packing!,
      ...VIETNAM_TRIP.shopping!,
      ...VIETNAM_TRIP.apps!,
    ].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
