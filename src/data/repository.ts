// Repository layer — the single seam between the UI and its data source.
//
// Reference data (partners, explore items, fixtures, entitlements) ships bundled
// with the app, so it is always available offline. On first read each dataset is
// mirrored into AsyncStorage; subsequent reads come from there. The fan's own
// record is not here — it lives in useRecordStore, on her device (Section 09).
//
// When a real backend lands it replaces the bodies of these functions. No screen
// changes.

import type {
  AirLink,
  BorderCrossing,
  Entitlement,
  ExploreItem,
  HallMap,
  Match,
  MatchLive,
  ParkingZone,
  Partner,
} from "@/types";
import { cacheKey, storage } from "@/lib/storage";

import { generatePartners } from "./partners";
import { EXPLORE_ITEMS } from "./explore";
import { MATCHES } from "./matches";
import { MATCH_LIVE } from "./live";
import { ENTITLEMENTS } from "./entitlements";
import { PARKING_ZONES } from "./parking";
import { BORDER_CROSSINGS } from "./borders";
import { HALL_MAPS } from "./hallmaps";
import { AIR_LINKS } from "./air";

/** Read-through cache: cached copy if present, else compute, persist, return. */
async function cached<T>(name: string, compute: () => T): Promise<T> {
  const hit = await storage.getJSON<T>(cacheKey(name));
  if (hit != null) return hit;
  const data = compute();
  await storage.setJSON(cacheKey(name), data);
  return data;
}

export async function fetchPartners(): Promise<Partner[]> {
  return cached("partners", generatePartners);
}

export async function fetchExplore(): Promise<ExploreItem[]> {
  return cached("explore", () => EXPLORE_ITEMS);
}

export async function fetchMatches(): Promise<Match[]> {
  return cached("matches", () => MATCHES);
}

export async function fetchMatchLive(): Promise<MatchLive[]> {
  return cached("live", () => MATCH_LIVE);
}

export async function fetchEntitlements(): Promise<Entitlement[]> {
  return cached("entitlements", () => ENTITLEMENTS);
}

export async function fetchParking(): Promise<ParkingZone[]> {
  return cached("parking", () => PARKING_ZONES);
}

export async function fetchAirLinks(): Promise<AirLink[]> {
  return cached("airlinks", () => AIR_LINKS);
}

export async function fetchHallMaps(): Promise<HallMap[]> {
  return cached("hallmaps", () => HALL_MAPS);
}

export async function fetchBorderCrossings(): Promise<BorderCrossing[]> {
  return cached("borders", () => BORDER_CROSSINGS);
}
