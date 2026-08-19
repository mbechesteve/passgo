import type { AirLink, HostCountry, Match } from "@/types";

/** The air leg to a host country, or null where there is none to fly. */
export function linkForCountry(
  links: AirLink[],
  country: HostCountry
): AirLink | null {
  return links.find((l) => l.country === country) ?? null;
}

/** Fixtures still to come in one country, soonest first. */
export function fixturesIn(
  matches: Match[],
  country: HostCountry,
  at: Date
): Match[] {
  return matches
    .filter((m) => m.country === country && new Date(m.kickoff) > at)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

/**
 * " · Kampala" for a fixture outside Kenya, "" for one inside it.
 *
 * `kickoffLabel` names the venue and nothing else, which is enough while every
 * fixture is in Nairobi — as is every offer, parking zone and shuttle in the app. A
 * ground abroad is the exception, and "Tue 16:00 · Namboole" does not tell a fan in
 * Nairobi that it is in another country.
 */
export function awayCitySuffix(match: Match): string {
  return match.country === "KE" ? "" : ` · ${match.city}`;
}
