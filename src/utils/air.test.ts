import { describe, expect, it } from "vitest";

import { AIR_LINKS } from "@/data/air";
import { MATCHES } from "@/data/matches";
import { DEMO_NOW } from "@/lib/clock";
import { awayCitySuffix, fixturesInCity, linkById } from "./air";

describe("linkById", () => {
  it("finds a leg", () => {
    expect(linkById(AIR_LINKS, "air-kampala")?.toCode).toBe("EBB");
    expect(linkById(AIR_LINKS, "air-eldoret")?.toCode).toBe("EDL");
  });

  it("returns null for a leg we do not fly", () => {
    expect(linkById(AIR_LINKS, "air-mombasa")).toBeNull();
  });
});

describe("the seeded legs", () => {
  it("lands where the fixture is, or names the transfer that gets there", () => {
    // Kakamega has no airport; Kisumu's serves it. A leg's arrival city and the city
    // its fixtures are in are therefore allowed to differ — but the transfer must say so.
    for (const link of AIR_LINKS) {
      if (link.toCity !== link.servesCity) {
        expect(link.transferTo, `${link.id} lands away from its city`).toContain(
          link.servesCity
        );
      }
    }
  });

  it("gives every leg a fixture to travel for", () => {
    // A leg offering a city with nothing to watch there would be pointless, so the
    // seed has to keep pace with the schedule.
    for (const link of AIR_LINKS) {
      expect(
        fixturesInCity(MATCHES, link.servesCity, DEMO_NOW).length,
        `no fixture in ${link.servesCity}`
      ).toBeGreaterThan(0);
    }
  });

  it("never offers a flight to Nairobi, where the fan already is", () => {
    for (const link of AIR_LINKS) expect(link.servesCity).not.toBe("Nairobi");
  });

  it("asks for a passport on international legs and not on domestic ones", () => {
    for (const link of AIR_LINKS) {
      const labels = link.requirements.map((r) => r.label).join(" ");
      if (link.country === "KE") expect(labels).not.toContain("Passport");
      else expect(labels).toContain("Passport");
    }
  });
});

describe("fixturesInCity", () => {
  it("lists only that city's fixtures", () => {
    const eldoret = fixturesInCity(MATCHES, "Eldoret", DEMO_NOW);
    expect(eldoret.length).toBeGreaterThan(0);
    for (const m of eldoret) expect(m.city).toBe("Eldoret");
  });

  it("does not hand a domestic leg every fixture in the country", () => {
    const nairobi = fixturesInCity(MATCHES, "Nairobi", DEMO_NOW).length;
    expect(fixturesInCity(MATCHES, "Eldoret", DEMO_NOW).length).toBeLessThan(nairobi);
  });

  it("drops fixtures that have already kicked off", () => {
    expect(
      fixturesInCity(MATCHES, "Kampala", new Date("2027-07-20T00:00:00+03:00"))
    ).toEqual([]);
  });

  it("orders by kickoff", () => {
    const times = fixturesInCity(MATCHES, "Nairobi", DEMO_NOW).map((m) =>
      new Date(m.kickoff).getTime()
    );
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});

describe("awayCitySuffix", () => {
  const find = (id: string) => MATCHES.find((m) => m.id === id)!;

  it("names the city for any ground away from Nairobi, at home or abroad", () => {
    expect(awayCitySuffix(find("m-uga-gha"))).toBe(" · Kampala");
    expect(awayCitySuffix(find("m-egy-sen"))).toBe(" · Eldoret");
    expect(awayCitySuffix(find("m-mar-gha"))).toBe(" · Kakamega");
  });

  it("adds nothing for a Nairobi fixture, where the venue is enough", () => {
    expect(awayCitySuffix(find("m-ken-mli"))).toBe("");
  });
});
