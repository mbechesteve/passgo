// ── Domain types ────────────────────────────────────────────────────────────
// Single source of truth for data shapes flowing seed → store → UI. The optional
// /supabase/*.sql files mirror these 1:1 if you ever move to a hosted backend,
// but the app itself persists everything locally (AsyncStorage / localStorage).

export type VisaType =
  | "visa_free"
  | "visa_on_arrival"
  | "evisa"
  | "eta" // electronic travel authorization
  | "visa_required";

export type Region =
  | "Africa"
  | "Asia"
  | "Europe"
  | "Middle East"
  | "Oceania"
  | "North America"
  | "South America"
  | "Caribbean";

export type BudgetTier = "budget" | "moderate" | "luxury";

export interface Country {
  id: string;
  /** ISO 3166-1 alpha-2, e.g. "TZ". */
  code: string;
  name: string;
  flag: string; // emoji
  region: Region;
  capital: string;
  currency: string; // ISO 4217, e.g. "TZS"
  currencyName: string;
  languages: string[];
  /** Indicative daily backpacker→comfort budget in USD. */
  dailyBudgetUsd: number;
  budgetTier: BudgetTier;
  /** Suggested trip length in days. */
  suggestedDays: number;
  bestSeason: string;
  heroImage: string;
  summary: string;
  popularityRank: number;
}

export interface VisaRule {
  id: string;
  /** ISO alpha-2 of the traveller's passport, e.g. "KE". */
  passportCountry: string;
  /** ISO alpha-2 of the destination, e.g. "TZ". */
  destCountry: string;
  visaType: VisaType;
  /** Cost in USD. 0 = free. */
  costUsd: number;
  /** Processing/issuance time in days. 0 = instant / on arrival. */
  processingDays: number;
  /** Max stay permitted, in days. */
  stayDays: number;
  /** Official application or info URL. */
  officialLink: string;
  notes?: string;
}

export interface PrepGuide {
  destCountry: string;
  documents: string[];
  vaccinations: string[];
  currency: { tips: string; cards: string; cash: string };
  sim: { providers: string[]; tips: string };
  safety: string[];
  /** Premium-gated rich content. */
  premium: boolean;
}

export interface City {
  id: string;
  countryCode: string;
  name: string;
  lat: number;
  lng: number;
  image: string;
  blurb: string;
  /** Suggested days to spend here. */
  suggestedDays: number;
}

export interface Attraction {
  id: string;
  cityId: string;
  name: string;
  category: string; // e.g. "Beach", "Museum", "Safari"
  image: string;
  lat: number;
  lng: number;
  openingHours: string;
  /** Entry fee in USD. 0 = free. */
  feeUsd: number;
  rating: number; // 0–5
  durationHours: number;
  blurb: string;
}

// ── Trip planning ─────────────────────────────────────────────────────────────

export interface TripItem {
  /** References an Attraction (or a free-form custom stop). */
  id: string;
  attractionId?: string;
  cityId: string;
  title: string;
  note?: string;
  /** ISO date string, optional. */
  date?: string;
  /** Order within its city group. */
  order: number;
}

export interface Flight {
  id: string;
  airline: string;
  route: string;
  departDate?: string;
  returnDate?: string;
  pricePpKes?: number;
  status?: "Booked" | "Pending" | "Cancelled";
  notes?: string;
}

export interface Stay {
  id: string;
  location: string;
  hotel: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  totalKes?: number;
  link?: string;
  status?: "Confirmed" | "Pending" | "Cancelled";
  notes?: string;
}

export interface ItineraryBlock {
  time: string;
  activity: string;
  area?: string;
}

export interface ItineraryDay {
  id: string;
  date?: string;
  location: string;
  plan: string[];
  blocks?: ItineraryBlock[];
  notes?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  estimatedKes?: number;
  actualKes?: number;
  paidBy?: string;
  status?: string;
}

export interface DocItem {
  id: string;
  label: string;
  folder: "core" | "backup";
  checked: boolean;
}

export interface PackItem {
  id: string;
  category: string;
  name: string;
  qty?: string;
  date?: string;
  checked: boolean;
}

export interface AppRec {
  id: string;
  category: string;
  name: string;
  purpose?: string;
  link?: string;
}

export interface Trip {
  id: string;
  countryCode: string;
  title: string;
  startDate?: string;
  endDate?: string;
  accommodation?: string;
  items: TripItem[];
  createdAt: string;

  // ── Trip companion (all optional) ──
  travelers?: string[];
  overview?: {
    areas?: string;
    departure?: string;
    durationLabel?: string;
    route?: string[];
  };
  flights?: Flight[];
  stays?: Stay[];
  schedule?: ItineraryDay[];
  budget?: BudgetItem[];
  documents?: DocItem[];
  packing?: PackItem[];
  shopping?: PackItem[];
  apps?: AppRec[];
}

// ── User / profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  passportCountry: string; // ISO alpha-2
  isPremium: boolean;
  visitedCountryCodes: string[];
  bucketListCountryCodes: string[];
  savedTripIds: string[];
}
