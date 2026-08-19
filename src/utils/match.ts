import { eatParts } from "@/lib/clock";
import type { Match, MatchPhase } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The soonest fixture that has not yet kicked off. */
export function nextMatch(matches: Match[], at: Date): Match | undefined {
  return [...matches]
    .filter((m) => new Date(m.kickoff).getTime() > at.getTime())
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0];
}

export function matchLabel(m: Match): string {
  return `${m.home} v ${m.away}`;
}

/**
 * Official three-letter codes. A substring rule cannot do this job: Mali is MLI, not
 * MAL, and "Côte d'Ivoire" has no sane truncation.
 */
export const TEAM_CODE: Record<string, string> = {
  Kenya: "KEN",
  Mali: "MLI",
  Zambia: "ZAM",
  Morocco: "MAR",
  Uganda: "UGA",
  Senegal: "SEN",
  "Côte d'Ivoire": "CIV",
  Egypt: "EGY",
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
  const days = Math.round(
    (Date.parse(`${kickoffDay}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000
  );
  if (days === 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  return `IN ${days} DAYS`;
}
