import type { ParkingZone } from "@/types";

/**
 * How long a walk the parking zones imply, as a range: "4–18", or a single figure
 * when every zone is the same distance out. Null when there are no zones, so a
 * caller renders nothing rather than an empty range.
 *
 * Derived, never stored — the Driving screen's band and the Parking screen's list
 * therefore cannot disagree about how far a fan walks.
 */
export function walkRangeLabel(zones: ParkingZone[]): string | null {
  if (zones.length === 0) return null;
  const minutes = zones.map((z) => z.walkMinutes);
  const min = Math.min(...minutes);
  const max = Math.max(...minutes);
  return min === max ? `${min}` : `${min}–${max}`;
}
