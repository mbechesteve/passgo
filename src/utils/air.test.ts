import { describe, expect, it } from "vitest";

import { AIR_LINKS } from "@/data/air";
import { MATCHES } from "@/data/matches";
import { DEMO_NOW } from "@/lib/clock";
import { awayCitySuffix, fixturesIn, linkForCountry } from "./air";

describe("linkForCountry", () => {
  it("finds the leg to a country we fly to", () => {
    expect(linkForCountry(AIR_LINKS, "UG")?.toCode).toBe("EBB");
    expect(linkForCountry(AIR_LINKS, "TZ")?.toCode).toBe("DAR");
  });

  it("has no leg to the country you are already in", () => {
    expect(linkForCountry(AIR_LINKS, "KE")).toBeNull();
  });
});

describe("fixturesIn", () => {
  it("lists only the fixtures in that country, soonest first", () => {
    const ug = fixturesIn(MATCHES, "UG", DEMO_NOW);
    expect(ug.length).toBeGreaterThan(0);
    for (const m of ug) expect(m.country).toBe("UG");
  });

  it("gives every away country at least one fixture to travel for", () => {
    // A Fly view offering a country with nothing to watch there would be pointless,
    // so the seed has to keep pace with the air links.
    for (const link of AIR_LINKS) {
      expect(
        fixturesIn(MATCHES, link.country, DEMO_NOW).length,
        `no fixture in ${link.country}`
      ).toBeGreaterThan(0);
    }
  });

  it("drops fixtures that have already kicked off", () => {
    const after = new Date("2027-07-20T00:00:00+03:00");
    expect(fixturesIn(MATCHES, "UG", after)).toEqual([]);
  });

  it("orders by kickoff", () => {
    const all = fixturesIn(MATCHES, "KE", DEMO_NOW);
    const times = all.map((m) => new Date(m.kickoff).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});

describe("awayCitySuffix", () => {
  const find = (id: string) => MATCHES.find((m) => m.id === id)!;

  it("names the city for a fixture outside Kenya", () => {
    // Every other surface in the app is Nairobi-centred — the offers, the parking
    // zones, the shuttles — so a venue abroad is the one that needs saying where.
    expect(awayCitySuffix(find("m-uga-gha"))).toBe(" · Kampala");
    expect(awayCitySuffix(find("m-tza-alg"))).toBe(" · Dar es Salaam");
  });

  it("adds nothing for a Nairobi fixture, where the venue is enough", () => {
    expect(awayCitySuffix(find("m-ken-mli"))).toBe("");
  });
});
