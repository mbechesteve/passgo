// ── Identity ─────────────────────────────────────────────────────────────────
export type HostCountry = "KE" | "UG" | "TZ";
export type PassTier = "fan" | "player" | "official" | "media" | "worker";
export type PassStatus = "active" | "expired" | "suspended";

export interface Pass {
  id: string; // "KE-PM-8842"
  holderName: string;
  tier: PassTier;
  issuedIn: HostCountry;
  validFrom: string; // ISO date
  validUntil: string; // ISO date
  shortCode: string; // printed on the card; read aloud at a counter
  status: PassStatus;
}

// ── Entitlement ──────────────────────────────────────────────────────────────
export type EntitlementKind =
  | "match-access"
  | "transport-fare"
  | "discount"
  | "priority-service";

export interface Entitlement {
  id: string;
  kind: EntitlementKind;
  countries: HostCountry[];
  label: string;
  detail: string;
  value?: number; // e.g. 15 for a 15% discount tier
}

// ── The record ───────────────────────────────────────────────────────────────
export type EventKind =
  | "border"
  | "turnstile"
  | "transport"
  | "purchase"
  | "fan-zone";

/** How the use reached the record. `shortcode` never touches the fan's phone. */
export type Channel = "nfc" | "qr" | "shortcode";

export interface Money {
  currency: "KES";
  gross: number;
  discount: number;
  net: number;
}

export interface Place {
  name: string;
  ward?: string;
  city: string;
  country: HostCountry;
}

export interface PassEvent {
  id: string;
  passId: string;
  kind: EventKind;
  at: string; // ISO instant in UTC — render through `eatParts` in @/lib/clock
  place: Place;
  channel: Channel;
  partnerId?: string;
  amount?: Money;
}

// ── Partners ─────────────────────────────────────────────────────────────────
export type PartnerCategory = "stay" | "move" | "eat" | "shop" | "do";

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  discountPct: number; // 15 → shown as −15%
  shortCode: string; // the merchant code scanned or entered at the counter
  ward: string;
  city: string;
  country: HostCountry;
  coords: { lat: number; lng: number };
}

// ── Explore ──────────────────────────────────────────────────────────────────
export type ExploreKind = "event" | "place" | "fan-zone";

export interface ExploreItem {
  id: string;
  kind: ExploreKind;
  name: string;
  detail: string;
  freeWithPass: boolean;
  startsAt?: string; // ISO — events
  opensAt?: string; // "14:00" — fan zones
  ward: string;
  city: string;
  country: HostCountry;
  coords: { lat: number; lng: number };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────
export interface Match {
  id: string;
  home: string;
  away: string;
  kickoff: string; // ISO, with the venue's own +03:00 offset
  venue: string;
  city: string;
  country: HostCountry;
  /** Venue centre — "400m from Gate D" and the route screen both read this. */
  coords: { lat: number; lng: number };
}

export type MatchPhase = "scheduled" | "live" | "half-time" | "full-time";

/** Seeded score and stats. The minute is never stored — it derives from the clock. */
export interface MatchLive {
  matchId: string;
  home: number; // goals
  away: number;
  possession: [number, number];
  shots: [number, number];
  corners: [number, number];
}

// ── Parking ──────────────────────────────────────────────────────────────────
export interface ParkingZone {
  id: string;
  zone: string;
  detail: string;
  walkMinutes: number;
}

// ── Borders ──────────────────────────────────────────────────────────────────
export type OriginCountry = "UG" | "TZ" | "RW" | "ET";

/** Static reference content: what a driver needs at the border. */
export interface BorderCrossing {
  origin: OriginCountry;
  originLabel: string; // "From Uganda"
  originCity: string; // "Kampala"
  originCode: string; // "UGA"
  post: string; // "MALABA"
  destinationCity: string; // "Nairobi"
  destinationCode: string; // "KEN"
  distanceKm: number;
  driveHours: number;
  waitMinutes: number;
  requirements: { label: string; detail: string }[];
  goodToKnow: { label: string; detail: string }[];
}
