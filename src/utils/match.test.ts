import { describe, expect, it } from "vitest";
import {
  nextMatch,
  matchLabel,
  kickoffLabel,
  crestCode,
  liveMatches,
  liveMinute,
  matchPhase,
} from "@/utils/match";
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

// Kickoffs are chosen so the minutes come out clean once the 15-minute interval is
// subtracted. At the demo instant (12:55 EAT) Zambia v Morocco is 85 wall-minutes in.
const ZAM_MAR = () => MATCHES.find((m) => m.id === "m-zam-mar")!;
const UGA_SEN = () => MATCHES.find((m) => m.id === "m-uga-sen")!;

describe("matchPhase", () => {
  const m = ZAM_MAR();
  const at = (wall: number) =>
    new Date(new Date(m.kickoff).getTime() + wall * 60_000);

  it("is scheduled before kickoff", () => {
    expect(matchPhase(m, at(-1))).toBe("scheduled");
  });

  it("is live through the first half", () => {
    expect(matchPhase(m, at(0))).toBe("live");
    expect(matchPhase(m, at(45))).toBe("live");
  });

  it("is half-time across the interval", () => {
    expect(matchPhase(m, at(46))).toBe("half-time");
    expect(matchPhase(m, at(60))).toBe("half-time");
  });

  it("is live again through the second half", () => {
    expect(matchPhase(m, at(61))).toBe("live");
    expect(matchPhase(m, at(105))).toBe("live");
  });

  it("is full-time after 105 wall-minutes", () => {
    expect(matchPhase(m, at(106))).toBe("full-time");
  });
});

describe("liveMinute", () => {
  const m = ZAM_MAR();
  const at = (wall: number) =>
    new Date(new Date(m.kickoff).getTime() + wall * 60_000);

  it("counts wall-minutes in the first half", () => {
    expect(liveMinute(m, at(30))).toBe(30);
  });

  it("holds at 45 through the interval", () => {
    expect(liveMinute(m, at(52))).toBe(45);
  });

  it("subtracts the interval in the second half", () => {
    expect(liveMinute(m, at(85))).toBe(70);
  });

  it("is null when the match is not in play", () => {
    expect(liveMinute(m, at(-1))).toBeNull();
    expect(liveMinute(m, at(200))).toBeNull();
  });
});

describe("liveMatches at the demo instant", () => {
  it("returns both Wednesday fixtures, most advanced first", () => {
    const live = liveMatches(MATCHES, DEMO_NOW);
    expect(live.map((m) => m.id)).toEqual(["m-zam-mar", "m-uga-sen"]);
  });

  it("reads 70' and 55'", () => {
    const [featured, also] = liveMatches(MATCHES, DEMO_NOW);
    expect(liveMinute(featured, DEMO_NOW)).toBe(70);
    expect(liveMinute(also, DEMO_NOW)).toBe(55);
  });

  it("leaves the next fixture alone — Home still reads Kenya v Mali", () => {
    expect(nextMatch(MATCHES, DEMO_NOW)?.id).toBe("m-ken-mli");
  });

  it("is empty once the tournament is over", () => {
    expect(liveMatches(MATCHES, new Date("2027-08-01T12:00:00+03:00"))).toEqual([]);
  });
});

import { daysUntilLabel, gatesOpenLabel } from "@/utils/match";

describe("gatesOpenLabel", () => {
  it("opens two hours before kickoff, in EAT", () => {
    expect(gatesOpenLabel(nextMatch(MATCHES, DEMO_NOW)!)).toBe("14:00");
  });
});

describe("daysUntilLabel", () => {
  const fixture = () => nextMatch(MATCHES, DEMO_NOW)!;

  it("reads IN 3 DAYS from Wednesday to Saturday", () => {
    // The drawing says IN 2 DAYS; from the demo instant that is wrong by a day.
    expect(daysUntilLabel(fixture(), DEMO_NOW)).toBe("IN 3 DAYS");
  });

  it("reads TODAY on the day itself", () => {
    expect(daysUntilLabel(fixture(), new Date("2027-06-26T09:00:00+03:00"))).toBe("TODAY");
  });

  it("reads TOMORROW the day before", () => {
    expect(daysUntilLabel(fixture(), new Date("2027-06-25T09:00:00+03:00"))).toBe("TOMORROW");
  });
});
