import { describe, expect, it } from "vitest";
import { nextMatch, matchLabel, kickoffLabel } from "@/utils/match";
import { MATCHES } from "@/data/matches";
import { DEMO_NOW } from "@/lib/clock";

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
