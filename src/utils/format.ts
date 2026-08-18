/** Great-circle distance in km between two coordinates (Haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const km = (v: number) =>
  v < 1 ? `${Math.round(v * 1000)} m` : `${v.toFixed(v < 10 ? 1 : 0)} km`;

/** "KES 629,250" — KES, rounded to whole shillings. "—" when undefined. */
export const kes = (n?: number): string =>
  n == null ? "—" : `KES ${Math.round(n).toLocaleString("en-US")}`;

/**
 * Whole days from `now` (default: current time) to an ISO date.
 * Positive = future, 0 = today, negative = past, null = no date.
 */
export const daysUntil = (iso?: string, now: Date = new Date()): number | null => {
  if (!iso) return null;
  const MS = 86_400_000;
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = new Date(iso);
  const end = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate()
  );
  return Math.round((end - start) / MS);
};
