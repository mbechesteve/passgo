import { eatParts } from "@/lib/clock";
import type { Match, MatchTicket, Pass } from "@/types";
import { crestCode } from "@/utils/match";

/**
 * "KEN-MLI · 2606-8842" — crests, the match day and month, and the Pass serial.
 * Derived rather than stored, like every other reference in this app.
 */
export function ticketReference(pass: Pass, match: Match): string {
  const { day } = eatParts(match.kickoff); // "2027-06-26"
  const [, month, dayOfMonth] = day.split("-");
  const serial = pass.id.split("-").pop() ?? "0000";
  return `${crestCode(match.home)}-${crestCode(match.away)} · ${dayOfMonth}${month}-${serial}`;
}

/**
 * The prototype seats every holder in the same place — Figure 3's Cat 2, Gate D.
 * Real allocation is an LOC ticketing concern and is not this app's to invent.
 */
export function issueTicket(pass: Pass, match: Match): MatchTicket {
  return {
    id: `${pass.id}-${match.id}`,
    passId: pass.id,
    matchId: match.id,
    category: 2,
    gate: "D",
    section: "214",
    seat: "17",
    savings: [
      { label: "Ticket · Cat 2", was: 2000, now: 1500 },
      { label: "Shuttle both ways", was: 600, now: "free" },
    ],
  };
}

/** What the ticket saves, summed from its own rows. Never touches the record. */
export function ticketSaved(ticket: MatchTicket): number {
  return ticket.savings.reduce(
    (sum, row) => sum + (row.now === "free" ? row.was : row.was - row.now),
    0
  );
}
