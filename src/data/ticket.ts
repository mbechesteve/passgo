import type { MatchTicket } from "@/types";

/**
 * The prototype seats every holder in the same place — Figure 3's Cat 2, Gate D.
 * Real allocation is an LOC ticketing concern and is not this app's to invent.
 */
export const TICKET_SEED: Omit<MatchTicket, "id" | "passId" | "matchId"> = {
  category: 2,
  gate: "D",
  section: "214",
  seat: "17",
  savings: [
    { label: "Ticket · Cat 2", was: 2000, now: 1500 },
    { label: "Shuttle both ways", was: 600, now: "free" },
  ],
};
