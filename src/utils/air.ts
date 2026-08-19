import type { AirLink, Match } from "@/types";

/** The leg a fan has selected. */
export function linkById(links: AirLink[], id: string): AirLink | null {
  return links.find((l) => l.id === id) ?? null;
}

/**
 * Fixtures still to come in one city, soonest first.
 *
 * By city, not by country: a domestic leg to Eldoret must not offer every fixture in
 * Kenya, most of which are in Nairobi and need no flight at all.
 */
export function fixturesInCity(matches: Match[], city: string, at: Date): Match[] {
  return matches
    .filter((m) => m.city === city && new Date(m.kickoff) > at)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

/**
 * " · Kampala" for a fixture away from Nairobi, "" for one in it.
 *
 * `kickoffLabel` names the venue and nothing else. That is enough for Nairobi, where
 * every offer, parking zone and shuttle in the app also is — but "Tue 16:00 · Bukhungu"
 * does not tell a fan in Nairobi that the ground is a flight away. Keyed on the city
 * rather than the country, because Eldoret and Kakamega are both in Kenya and both
 * need saying.
 */
export function awayCitySuffix(match: Match): string {
  return match.city === "Nairobi" ? "" : ` · ${match.city}`;
}
