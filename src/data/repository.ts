// Repository layer — the single seam between the UI and its data source.
//
// Reference data (countries, visa rules, cities, attractions, prep guides) ships
// bundled with the app, so it's always available offline. On first read each
// dataset is mirrored into AsyncStorage (the "offline cache"); subsequent reads
// come from there. User-generated data (profile, trips) lives in the Zustand
// `persist` stores, which are also AsyncStorage-backed.
//
// There is no network/backend: persistence is entirely on-device
// (AsyncStorage on native, localStorage on web).

import type {
  Attraction,
  City,
  Country,
  PrepGuide,
  VisaRule,
} from "@/types";
import { cacheKey, storage } from "@/lib/storage";

import { attractionsForCity, MOCK_ATTRACTIONS } from "./mockAttractions";
import { citiesForCountry, MOCK_CITIES } from "./mockCities";
import { getCountryByCode, MOCK_COUNTRIES } from "./mockCountries";
import { getPrepForCountry, MOCK_PREP } from "./mockPrep";
import { MOCK_VISA_RULES, visaRulesForPassport } from "./mockVisaRules";

// Read-through cache: return the cached copy if present, otherwise compute from
// the bundled seed, persist it, and return it.
async function cached<T>(name: string, compute: () => T): Promise<T> {
  const hit = await storage.getJSON<T>(cacheKey(name));
  if (hit != null) return hit;
  const data = compute();
  await storage.setJSON(cacheKey(name), data);
  return data;
}

export async function fetchCountries(): Promise<Country[]> {
  const all = await cached("countries", () => MOCK_COUNTRIES);
  return [...all].sort((a, b) => a.popularityRank - b.popularityRank);
}

export async function fetchCountry(code: string): Promise<Country | undefined> {
  return getCountryByCode(code);
}

/** Visa rules for a passport, keyed by destination country code. */
export async function fetchVisaRules(
  passportCode: string
): Promise<Map<string, VisaRule>> {
  return visaRulesForPassport(passportCode);
}

export async function fetchVisaRule(
  passportCode: string,
  destCode: string
): Promise<VisaRule | undefined> {
  const map = await fetchVisaRules(passportCode);
  return map.get(destCode);
}

export async function fetchCities(countryCode: string): Promise<City[]> {
  return citiesForCountry(countryCode);
}

export async function fetchAttractions(cityId: string): Promise<Attraction[]> {
  return attractionsForCity(cityId);
}

export async function fetchPrepGuide(countryCode: string): Promise<PrepGuide> {
  return getPrepForCountry(countryCode);
}

// All cities + their attractions for a country, for the planner/map.
export async function fetchCountryGraph(countryCode: string) {
  const cities = await fetchCities(countryCode);
  const cityIds = new Set(cities.map((c) => c.id));
  const attractions = MOCK_ATTRACTIONS.filter((a) => cityIds.has(a.cityId));
  return { cities, attractions };
}

/** Wipe the offline reference cache (e.g. on a "refresh data" action). */
export async function clearReferenceCache(): Promise<void> {
  await Promise.all(
    ["countries"].map((n) => storage.remove(cacheKey(n)))
  );
}

export const __seed = {
  MOCK_COUNTRIES,
  MOCK_CITIES,
  MOCK_ATTRACTIONS,
  MOCK_VISA_RULES,
  MOCK_PREP,
};
