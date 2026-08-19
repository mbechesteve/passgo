import { eatParts } from "@/lib/clock";
import { TICKET_SEED } from "@/data/ticket";
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

/** Ties the seeded seat and savings (@/data/ticket) to this Pass and match. */
export function issueTicket(pass: Pass, match: Match): MatchTicket {
  return {
    id: `${pass.id}-${match.id}`,
    passId: pass.id,
    matchId: match.id,
    ...TICKET_SEED,
  };
}

/** What the ticket saves, summed from its own rows. Never touches the record. */
export function ticketSaved(ticket: MatchTicket): number {
  return ticket.savings.reduce(
    (sum, row) => sum + (row.now === "free" ? row.was : row.was - row.now),
    0
  );
}

/**
 * Deterministic true/false cells for the ticket's non-scannable code stand-in,
 * derived straight from the reference string's own characters. A seeded PRNG was
 * the obvious approach and the wrong one: `state * 1103515245` exceeds
 * Number.MAX_SAFE_INTEGER, so it loses precision and stops being deterministic.
 */
export function codeCells(reference: string, size: number): boolean[] {
  return Array.from({ length: size * size }, (_, i) => {
    const a = reference.charCodeAt(i % reference.length);
    const b = reference.charCodeAt((i * 7 + 3) % reference.length);
    return (a * 31 + b * 17 + i * 13) % 7 < 3;
  });
}
