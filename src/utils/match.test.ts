import { describe, expect, it } from "vitest";
import { nextMatch, matchLabel, kickoffLabel, crestCode } from "@/utils/match";
import { MATCHES } from "@/data/matches";
import { DEMO_NOW } from "@/lib/clock";
import type { Match } from "@/types";

describe("nextMatch", () => {
  it("returns Kenya v Mali at the demo clock — the fixture in Figure 3", () => {
    const m = nextMatch(MATCHES, DEMO_NOW);
    expect(m?.home).toBe("Kenya");
    expect(m?.away).toBe("Mali");
    expect(m?.venue).toBe("Kasarani");
  });

  it("kicks off on Saturday 2027-06-26 at 16:00", () => {
    const m = nextMatch(MATCHES, DEMO_NOW);
    expect(m?.kickoff.slice(0, 10)).toBe("2027-06-26");
    expect(new Date(m!.kickoff).getUTCDay()).toBe(6); // Saturday
  });

  it("skips fixtures that have already kicked off", () => {
    const m = nextMatch(MATCHES, new Date("2027-06-27T00:00:00+03:00"));
    expect(m?.kickoff.slice(0, 10)).not.toBe("2027-06-26");
  });

  it("returns undefined once the tournament is over", () => {
    expect(nextMatch(MATCHES, new Date("2027-08-01T00:00:00+03:00"))).toBeUndefined();
  });
});

describe("labels", () => {
  it("renders the fixture as the card prints it", () => {
    const m = nextMatch(MATCHES, DEMO_NOW)!;
    expect(matchLabel(m)).toBe("Kenya v Mali");
    expect(kickoffLabel(m)).toBe("Sat 16:00 · Kasarani");
  });
});

// A kickoff after midnight EAT is still the previous day in UTC. This is the case the
// old implementation got wrong, and the reason it survived: no seeded fixture hit it.
const AFTER_MIDNIGHT: Match = {
  id: "m-late",
  home: "Kenya",
  away: "Egypt",
  kickoff: "2027-06-27T01:00:00+03:00", // = 2027-06-26T22:00Z, a Saturday in UTC
  venue: "Kasarani",
  city: "Nairobi",
  country: "KE",
  coords: { lat: -1.2226, lng: 36.8917 },
};

describe("kickoffLabel across UTC midnight", () => {
  it("reads the EAT weekday, not the UTC one", () => {
    // 01:00 on Sunday 27 June in Nairobi — not Saturday, which is what UTC says.
    expect(kickoffLabel(AFTER_MIDNIGHT)).toBe("Sun 01:00 · Kasarani");
  });
});

describe("crestCode", () => {
  it("uses the official three-letter code, which is not a truncation", () => {
    expect(crestCode("Mali")).toBe("MLI"); // not "MAL"
    expect(crestCode("Côte d'Ivoire")).toBe("CIV");
  });

  it("codes every seeded nation", () => {
    expect(crestCode("Kenya")).toBe("KEN");
    expect(crestCode("Zambia")).toBe("ZAM");
    expect(crestCode("Morocco")).toBe("MAR");
    expect(crestCode("Uganda")).toBe("UGA");
    expect(crestCode("Senegal")).toBe("SEN");
    expect(crestCode("Egypt")).toBe("EGY");
  });

  it("falls back to the first three letters for an unseeded name", () => {
    expect(crestCode("Namibia")).toBe("NAM");
  });
});
