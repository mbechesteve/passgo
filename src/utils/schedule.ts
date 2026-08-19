import { eatParts } from "@/lib/clock";
import type { HallMap, Match } from "@/types";
import { mapForMatch } from "@/utils/hallmap";
import { matchPhase, minuteLabel } from "@/utils/match";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export interface DayGroup {
  /** The EAT day, "2027-06-23" — also the sort key. */
  key: string;
  /** "TODAY · WED 23 JUN", or "SAT 26 JUN". */
  label: string;
  matches: Match[];
}

/**
 * The whole tournament, grouped by the day each fixture kicks off in EAT.
 *
 * No window and no row cap. Explore used to show four of eleven fixtures — capped to
 * seven days and five rows — which meant a schedule change had to bend to the surface
 * rather than the reverse. Every fixture appears here.
 */
export function dayGroups(matches: Match[], at: Date): DayGroup[] {
  const today = eatParts(at.toISOString()).day;
  const byDay = new Map<string, Match[]>();

  for (const m of matches) {
    const { day } = eatParts(m.kickoff);
    byDay.set(day, [...(byDay.get(day) ?? []), m]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({
      key,
      label: dayLabel(key, today),
      matches: [...group].sort(
        (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      ),
    }));
}

function dayLabel(day: string, today: string): string {
  const [year, month, date] = day.split("-");
  const weekday = DAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
  const stamp = `${weekday} ${Number(date)} ${MONTHS[Number(month) - 1]}`;
  void year;
  return day === today ? `TODAY · ${stamp}` : stamp;
}

export type FixtureStatusKind =
  | "live"
  | "full-time"
  | "ticket-held"
  | "on-sale"
  | "sold-out"
  | "not-on-sale";

export interface FixtureStatus {
  kind: FixtureStatusKind;
  label: string;
}

export interface StatusContext {
  at: Date;
  maps: HallMap[];
  /** The match the Pass's own ticket is for, if it holds one. */
  ticketMatchId?: string;
}

/**
 * The one chip a fixture row carries, in priority order: what is happening now beats
 * what a fan holds, which beats what is on sale.
 *
 * A fan who already holds a seat is never told the fixture is on sale — that is the
 * ordering doing real work rather than a cosmetic preference.
 */
export function fixtureStatus(match: Match, ctx: StatusContext): FixtureStatus {
  const phase = matchPhase(match, ctx.at);

  if (phase === "live" || phase === "half-time") {
    return { kind: "live", label: `LIVE ${minuteLabel(match, ctx.at)}` };
  }
  if (phase === "full-time") return { kind: "full-time", label: "FT" };

  if (ctx.ticketMatchId === match.id) {
    return { kind: "ticket-held", label: "TICKET HELD" };
  }

  const map = mapForMatch(ctx.maps, match.id);
  if (!map) return { kind: "not-on-sale", label: "NOT YET ON SALE" };

  const seatsLeft = map.blocks.some((b) => b.available > 0);
  return seatsLeft
    ? { kind: "on-sale", label: "ON SALE" }
    : { kind: "sold-out", label: "SOLD OUT" };
}

/**
 * "Kasarani · Nairobi" — the ground and the city it is in, always.
 *
 * A venue name alone cannot be placed: "Bukhungu" tells a fan in Nairobi nothing about
 * whether that is a bus ride or a flight. Where the venue is named for its city, the
 * city is not repeated.
 */
export function venueLine(match: Match): string {
  return match.venue === match.city
    ? match.venue
    : `${match.venue} · ${match.city}`;
}
