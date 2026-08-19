import { eatParts } from "@/lib/clock";
import type { Match } from "@/types";

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
