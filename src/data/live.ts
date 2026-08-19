import type { MatchLive } from "@/types";

// Scores and stats are seeded, not fetched: Section 12's decisions are outstanding and
// no live feed exists. Only the minute is derived, from the clock.
export const MATCH_LIVE: MatchLive[] = [
  {
    matchId: "m-zam-mar",
    home: 0,
    away: 2,
    possession: [42, 58],
    shots: [4, 9],
    corners: [2, 5],
  },
  {
    matchId: "m-uga-sen",
    home: 1,
    away: 1,
    possession: [51, 49],
    shots: [6, 7],
    corners: [3, 3],
  },
];
