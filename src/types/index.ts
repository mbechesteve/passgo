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

/** The seat, distinct from the credential. One per match, tied to a Pass. */
export interface MatchTicket {
  id: string;
  passId: string;
  matchId: string;
  category: 1 | 2 | 3;
  gate: string;
  section: string;
  seat: string;
  /**
   * What the ticket itself is worth. This is an entitlement's stated value, NOT
   * something that happened, so it is never written to the record and never added
   * into `YOU'VE SAVED`.
   */
  savings: { label: string; was: number; now: number | "free" }[];
}

/**
 * A priced block of the bowl, for the ticket office's hall map. Block level, not
 * seat level: the seat is assigned, exactly as `MatchTicket` already represents it,
 * so no per-seat inventory has to be invented.
 */
export interface StadiumBlock {
  id: string;
  /** What is printed on the block itself — "214". */
  label: string;
  stand: "N" | "E" | "S" | "W";
  category: 1 | 2 | 3;
  gate: string;
  /** Seats left. A block at zero is drawn, but cannot be chosen. */
  available: number;
}

/** One fixture's bowl. Prices are per seat, in KES, by category. */
export interface HallMap {
  matchId: string;
  prices: Record<1 | 2 | 3, number>;
  blocks: StadiumBlock[];
}

/**
 * How a fan pays. A preference, not an account: Pamoja holds no balance and stores no
 * number — only enough of a tail to recognise which method is which.
 *
 * A top-up wallet was asked for and declined. Rev. 2 §05 — "never holds the funds,
 * never sees a card number, and needs no banking licence in any of the three
 * countries" — means stored value would need an e-money licence in Kenya, Uganda and
 * Tanzania, and card handling would bring PCI scope. Naming the method a fan will pay
 * with gives the same convenience and reverses nothing.
 */
export type PaymentKind = "mpesa" | "airtel" | "card";

export interface PaymentMethod {
  id: string;
  kind: PaymentKind;
  /** Last 3 digits for mobile money, last 4 for a card. Never the whole number. */
  tail: string;
  isDefault: boolean;
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
/**
 * Flying to an away fixture: the city pair, the road transfer at the far end, and what
 * a fan needs to be let in.
 *
 * Deliberately carries no fare and no schedule. Airlines and timetables for June 2027
 * are not published — Jambojet served no international routes as of June 2026 and is
 * scheduled to resume Nairobi–Entebbe from October 2026 — so a price or a frequency
 * here would be invented. `asOf` and the screen's caveat cover what is here.
 */
export interface AirLink {
  id: string;
  /** The host country this leg reaches. Domestic legs are "KE". */
  country: HostCountry;
  /**
   * The city whose fixtures this leg is for — the Fly view's selector, and what
   * `fixturesInCity` matches on. Not always the arrival city: the nearest airport to
   * Bukhungu, Kakamega is Kisumu's.
   */
  servesCity: string;
  fromCity: string; // "Nairobi"
  fromCode: string; // "NBO"
  toCity: string; // "Entebbe"
  toCode: string; // "EBB"
  /** The road leg from the arrival airport to the ground. */
  transferKm: number;
  transferTo: string; // "Namboole, Kampala"
  /**
   * An indicative one-way fare range, in KES. Not derived and not quoted: no June 2027
   * fare is published by anyone, so this is a prototype figure on the same footing as
   * the ticket office's Cat 1 and Cat 3 prices, and the screen labels it as such.
   */
  fareEstimate: { low: number; high: number };
  requirements: { label: string; detail: string }[];
  goodToKnow: { label: string; detail: string }[];
  /** ISO date this record was last checked against a real source. */
  asOf: string;
}

export interface BorderCrossing {
  id: string;
  /**
   * "in" arrives in Nairobi; "out" leaves it for an away fixture. The screen carried
   * only inbound routes at first, which made one heading answer two different
   * questions — Drive told a fan how to reach Kenya while Fly told them how to leave it.
   */
  direction: "in" | "out";
  /** The country at the far end, whichever way the journey runs. */
  country: OriginCountry;
  label: string; // "From Uganda", "To Dar es Salaam"
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
  /** ISO date this record was last checked against a real source. */
  asOf: string;
}
