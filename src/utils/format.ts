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
 * Whole days from `now` to an ISO date.
 * Caller must pass the instant via `now()` from @/lib/clock.
 * Positive = future, 0 = today, negative = past, null = no date.
 */
export const daysUntil = (iso: string | undefined, now: Date): number | null => {
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * "19 August 2026" from an ISO date string, e.g. content provenance dates.
 * Parsed by hand rather than through a Date object: this formats static
 * content dates, not a wall-clock instant, and the one time seam is `now()`.
 */
export function dateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "Amina Nakato" → "AN". The avatar disc on Home. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
