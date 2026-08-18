import type { Partner, PartnerCategory } from "@/types";
import { distanceKm } from "@/utils/format";

/**
 * Five, not twelve. "Qatar shipped twelve service tiles on a mature partner
 * network. We are building ours from nothing; five that are full beat twelve
 * that are empty." — Figure 3 commentary.
 */
export const CATEGORY_LABEL: Record<PartnerCategory, string> = {
  stay: "Stay",
  move: "Move",
  eat: "Eat",
  shop: "Shop",
  do: "Do",
};

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as PartnerCategory[];

/** Derived, never stored — a tile can't show a number it can't fill. */
export function countsByCategory(
  partners: Partner[]
): Record<PartnerCategory, number> {
  const counts: Record<PartnerCategory, number> = {
    stay: 0, move: 0, eat: 0, shop: 0, do: 0,
  };
  for (const p of partners) counts[p.category]++;
  return counts;
}

export function byCategory(
  partners: Partner[],
  category: PartnerCategory
): Partner[] {
  return partners.filter((p) => p.category === category);
}

/** The code a cashier types when the fan reads it off her card. */
export function findByShortCode(
  partners: Partner[],
  code: string
): Partner | undefined {
  const needle = code.trim().toLowerCase();
  return partners.find((p) => p.shortCode.toLowerCase() === needle);
}

export function nearby(
  partners: Partner[],
  origin: { lat: number; lng: number },
  limit: number
): Partner[] {
  return [...partners]
    .sort((a, b) => distanceKm(origin, a.coords) - distanceKm(origin, b.coords))
    .slice(0, limit);
}
