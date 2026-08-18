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

/** "Sat 16:00 · Kasarani", read from the fixture's own offset. */
export function kickoffLabel(m: Match): string {
  const day = DAYS[new Date(m.kickoff).getUTCDay()];
  const time = m.kickoff.match(/T(\d{2}:\d{2})/)?.[1] ?? "";
  return `${day} ${time} · ${m.venue}`;
}
