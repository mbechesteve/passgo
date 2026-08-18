import type { Entitlement, HostCountry } from "@/types";

export function forCountry(
  entitlements: Entitlement[],
  country: HostCountry
): Entitlement[] {
  return entitlements.filter((e) => e.countries.includes(country));
}
