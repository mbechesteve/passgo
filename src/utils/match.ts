import { daysBetweenEatDays, eatParts } from "@/lib/clock";
import { S } from "@/lib/strings";
import type { Match, MatchPhase } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The soonest fixture that has not yet kicked off. */
export function nextMatch(matches: Match[], at: Date): Match | undefined {
  return [...matches]
    .filter((m) => new Date(m.kickoff).getTime() > at.getTime())
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0];
}

export function matchLabel(m: Match): string {
  return `${m.home} v ${m.away}`;
}

/**
 * Official three-letter codes. A substring rule cannot do this job: Mali is MLI, not
 * MAL, and "Côte d'Ivoire" has no sane truncation.
 */
/**
 * The flag beside each country's name. Kept beside TEAM_CODE and derived the same
 * way — from a map, not from the name — because there is no rule that turns
 * "Côte d'Ivoire" into a regional-indicator pair.
 *
 * An unseeded nation returns no flag rather than a wrong one, and the row that
 * renders it copes with an empty string.
 */
const TEAM_FLAG: Record<string, string> = {
  Kenya: "\u{1F1F0}\u{1F1EA}",
  Mali: "\u{1F1F2}\u{1F1F1}",
  Zambia: "\u{1F1FF}\u{1F1F2}",
  Morocco: "\u{1F1F2}\u{1F1E6}",
  Uganda: "\u{1F1FA}\u{1F1EC}",
  Senegal: "\u{1F1F8}\u{1F1F3}",
  "Côte d'Ivoire": "\u{1F1E8}\u{1F1EE}",
  Egypt: "\u{1F1EA}\u{1F1EC}",
  Tanzania: "\u{1F1F9}\u{1F1FF}",
  Ghana: "\u{1F1EC}\u{1F1ED}",
  Algeria: "\u{1F1E9}\u{1F1FF}",
};

/** The flag for a nation, or "" when we do not hold one. */
export function teamFlag(team: string): string {
  return TEAM_FLAG[team] ?? "";
}

const TEAM_CODE: Record<string, string> = {
  Kenya: "KEN",
  Mali: "MLI",
  Zambia: "ZAM",
  Morocco: "MAR",
  Uganda: "UGA",
  Senegal: "SEN",
  "Côte d'Ivoire": "CIV",
  Egypt: "EGY",
  // The first-three-letters fallback happens to be right for these three. They are
  // listed anyway: the map is the reason the codes are correct, not a coincidence.
  Tanzania: "TAN",
  Ghana: "GHA",
  Algeria: "ALG",
};

export function crestCode(team: string): string {
  return TEAM_CODE[team] ?? team.slice(0, 3).toUpperCase();
}

/** "Sat 16:00 · Kasarani" — the day and time as East Africa reads them. */
export function kickoffLabel(m: Match): string {
  const { day, time } = eatParts(m.kickoff);
  const weekday = DAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
  return `${weekday} ${time} · ${m.venue}`;
}

/**
 * "SAT · 16:00" — the Home fixture card's chip form. Derived independently of
 * `kickoffLabel`, not by re-parsing its output: splitting that string apart to
 * reassemble this one was correct only by accident, and silently wrong the
 * moment `kickoffLabel`'s format moved.
 */
export function kickoffChipLabel(m: Match): string {
  const { day, time } = eatParts(m.kickoff);
  const weekday = DAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
  return `${weekday.toUpperCase()} · ${time}`;
}

const HALF = 45;
const INTERVAL = 15;
const FULL = HALF * 2 + INTERVAL; // 105 wall-minutes from kickoff to full time

/** Whole minutes of wall clock since kickoff. Negative before it starts. */
function wallMinutes(m: Match, at: Date): number {
  return Math.floor((at.getTime() - new Date(m.kickoff).getTime()) / 60_000);
}

export function matchPhase(m: Match, at: Date): MatchPhase {
  const wall = wallMinutes(m, at);
  if (wall < 0) return "scheduled";
  if (wall <= HALF) return "live";
  if (wall <= HALF + INTERVAL) return "half-time";
  if (wall <= FULL) return "live";
  return "full-time";
}

/** Playing minute, or null when the match is not in play. */
export function liveMinute(m: Match, at: Date): number | null {
  const phase = matchPhase(m, at);
  if (phase === "scheduled" || phase === "full-time") return null;
  if (phase === "half-time") return HALF;
  const wall = wallMinutes(m, at);
  return wall <= HALF ? wall : wall - INTERVAL;
}

/** "70'", or "HALF TIME" across the interval. Lifted out of LiveScreen so it can be
 *  unit-tested — a .tsx screen file cannot be, since the suite runs with no renderer. */
export function minuteLabel(m: Match, at: Date): string {
  if (matchPhase(m, at) === "half-time") return S.liveHalfTime;
  const minute = liveMinute(m, at);
  return minute == null ? "" : `${minute}'`;
}

/** In play now, most advanced first: the first is featured, the rest are "also live". */
export function liveMatches(matches: Match[], at: Date): Match[] {
  return matches
    .filter((m) => {
      const phase = matchPhase(m, at);
      return phase === "live" || phase === "half-time";
    })
    .sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );
}

const GATES_OPEN_BEFORE_MS = 2 * 60 * 60 * 1000;

/** "14:00" — when the turnstiles open, two hours before kickoff, in EAT. */
export function gatesOpenLabel(m: Match): string {
  const opens = new Date(
    new Date(m.kickoff).getTime() - GATES_OPEN_BEFORE_MS
  ).toISOString();
  return eatParts(opens).time;
}

/** "TODAY", "TOMORROW", "IN 3 DAYS" — counted in EAT days, never hard-coded. */
export function daysUntilLabel(m: Match, at: Date): string {
  const kickoffDay = eatParts(m.kickoff).day;
  const today = eatParts(at.toISOString()).day;
  const days = daysBetweenEatDays(today, kickoffDay);
  if (days === 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  return `IN ${days} DAYS`;
}
