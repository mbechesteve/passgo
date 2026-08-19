import type { HallMap } from "@/types";

/**
 * Talanta's bowl, block by block. The one fixture in the seed with a ticket office
 * behind it.
 *
 * Two figures here are fixed by the app rather than chosen: Cat 2 is priced at 2,000
 * because `TICKET_SEED` already states that as the face value of a Cat 2 ticket, and
 * block 214 on Gate D is Cat 2 because that is the seat the Pass's own ticket carries.
 * The office cannot quote a different price or category for the same seat without
 * contradicting the Pass. Cat 1 and Cat 3 sit either side of that anchor.
 *
 * Real allocation and real pricing are an LOC ticketing concern, as the ticket seed
 * already says. These are the prototype's figures, and the screen says so.
 */
export const HALL_MAPS: HallMap[] = [
  {
    matchId: "m-mli-zam",
    prices: { 1: 3500, 2: 2000, 3: 1000 },
    blocks: [
      { id: "w-114", label: "114", stand: "W", category: 1, gate: "A", available: 42 },
      { id: "w-116", label: "116", stand: "W", category: 1, gate: "A", available: 0 },
      { id: "w-118", label: "118", stand: "W", category: 1, gate: "A", available: 18 },
      { id: "e-214", label: "214", stand: "E", category: 2, gate: "D", available: 96 },
      { id: "e-216", label: "216", stand: "E", category: 2, gate: "D", available: 64 },
      { id: "e-218", label: "218", stand: "E", category: 2, gate: "D", available: 4 },
      { id: "n-301", label: "301", stand: "N", category: 3, gate: "B", available: 210 },
      { id: "n-303", label: "303", stand: "N", category: 3, gate: "B", available: 0 },
      { id: "s-305", label: "305", stand: "S", category: 3, gate: "C", available: 174 },
      { id: "s-307", label: "307", stand: "S", category: 3, gate: "C", available: 88 },
    ],
  },
];
