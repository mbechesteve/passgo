import type { Entitlement } from "@/types";

// What the Pass unlocks, and where. Entitlements differ by country (Section 03);
// match access is the one that holds everywhere, which is why the card reads
// VALID IN ALL THREE COUNTRIES.
export const ENTITLEMENTS: Entitlement[] = [
  {
    id: "ent-access",
    kind: "match-access",
    countries: ["KE", "UG", "TZ"],
    label: "Match access",
    detail: "One tap at the turnstile. Works with no network.",
  },
  {
    id: "ent-transport",
    kind: "transport-fare",
    countries: ["KE"],
    label: "Reduced transport fares",
    detail: "Matchday buses between transport hubs and the venue.",
    value: 20,
  },
  {
    id: "ent-discount",
    kind: "discount",
    countries: ["KE"],
    label: "Partner discounts",
    detail: "At every partner business, on your card or your phone.",
    value: 15,
  },
  {
    id: "ent-priority",
    kind: "priority-service",
    countries: ["KE"],
    label: "Priority at the border",
    detail: "Pass holder lanes at every point of entry.",
  },
];
