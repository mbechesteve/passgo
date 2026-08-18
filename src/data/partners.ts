import type { Partner, PartnerCategory } from "@/types";

// The partner network. The counts are the proposal's own (Figure 3) and they sum
// to 2,189 exactly, so the app never displays a number it cannot fill.
export const PARTNER_TARGETS: Record<PartnerCategory, number> = {
  stay: 210,
  move: 84,
  eat: 1340,
  shop: 460,
  do: 95,
};

const WARDS = [
  "Kasarani ward", "Kilimani ward", "Westlands ward", "Karen ward",
  "Embakasi ward", "Lang'ata ward", "Parklands ward", "Dagoretti ward",
  "Roysambu ward", "South C ward", "Eastleigh ward", "Ngara ward",
  "Kileleshwa ward", "Lavington ward", "Ruaraka ward", "Kibra ward",
  "Makadara ward", "Starehe ward", "Mathare ward", "Kamukunji ward",
];

// Rough centre of each ward, in listing order, so "near you" is plausible.
const WARD_COORDS: { lat: number; lng: number }[] = [
  { lat: -1.2266, lng: 36.8899 }, { lat: -1.2906, lng: 36.7833 },
  { lat: -1.2673, lng: 36.8065 }, { lat: -1.3191, lng: 36.7062 },
  { lat: -1.3167, lng: 36.9167 }, { lat: -1.3667, lng: 36.7333 },
  { lat: -1.2626, lng: 36.8180 }, { lat: -1.2921, lng: 36.7500 },
  { lat: -1.2200, lng: 36.8850 }, { lat: -1.3200, lng: 36.8300 },
  { lat: -1.2760, lng: 36.8500 }, { lat: -1.2780, lng: 36.8300 },
  { lat: -1.2790, lng: 36.7830 }, { lat: -1.2810, lng: 36.7690 },
  { lat: -1.2400, lng: 36.8700 }, { lat: -1.3130, lng: 36.7800 },
  { lat: -1.3000, lng: 36.8600 }, { lat: -1.2800, lng: 36.8300 },
  { lat: -1.2600, lng: 36.8600 }, { lat: -1.2850, lng: 36.8450 },
];

const FIRST: Record<PartnerCategory, string[]> = {
  stay: ["Acacia", "Jamii", "Sarova", "Nyumbani", "Tamarind", "Baraka", "Amani", "Serena"],
  move: ["Super", "City", "Umoja", "Rapid", "Nairobi", "Jitegemee", "Safari"],
  eat: ["Mama", "Kwa", "Nyama", "Chai", "Kikoy", "Pilau", "Ugali", "Samaki", "Choma", "Tamu"],
  shop: ["Soko", "Duka", "Biashara", "Zawadi", "Bidhaa", "Maridadi", "Nunua"],
  do: ["Safari", "Heritage", "Kifaru", "Simba", "Twiga", "Uhuru"],
};

const SECOND: Record<PartnerCategory, string[]> = {
  stay: ["Lodge", "Suites", "Guest House", "Residence", "Inn", "Rooms"],
  move: ["Shuttle", "Coaches", "Sacco", "Movers", "Transit", "Line"],
  eat: ["Kitchen", "Grill", "Bistro", "Cafe", "Corner", "House", "Point", "Joint"],
  shop: ["Market", "Stores", "Traders", "Outfitters", "Emporium", "Supplies"],
  do: ["Tours", "Trails", "Gallery", "Walks", "Experience"],
};

const PREFIX: Record<PartnerCategory, string> = {
  stay: "ST", move: "MV", eat: "ET", shop: "SH", do: "DO",
};

/** Cycled so the network shows a realistic spread of discount tiers. */
const DISCOUNTS = [5, 10, 15, 20];

/** The businesses the proposal names by hand, with the discounts it states. */
export const NAMED_PARTNERS: Partner[] = [
  {
    id: "p-mama-oliech", name: "Mama Oliech", category: "eat", discountPct: 15,
    shortCode: "MO-001", ward: "Kasarani ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2266, lng: 36.8899 },
  },
  {
    id: "p-java-house", name: "Java House", category: "eat", discountPct: 10,
    shortCode: "JH-001", ward: "Kilimani ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2906, lng: 36.7833 },
  },
  {
    id: "p-kenya-bus", name: "Kenya Bus", category: "move", discountPct: 20,
    shortCode: "KB-001", ward: "Starehe ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2800, lng: 36.8300 },
  },
];

/**
 * Deterministic — no randomness, so the same network every run and every
 * install. Named partners occupy the first slot(s) of their category; the rest
 * are generated from the name pools so the counts are real listings you can
 * scroll into rather than a label over an empty set.
 */
export function generatePartners(): Partner[] {
  const out: Partner[] = [];
  const categories = Object.keys(PARTNER_TARGETS) as PartnerCategory[];

  for (const category of categories) {
    const named = NAMED_PARTNERS.filter((p) => p.category === category);
    out.push(...named);

    const first = FIRST[category];
    const second = SECOND[category];
    for (let i = named.length; i < PARTNER_TARGETS[category]; i++) {
      // Mixed radix over (first, second, ward) so the triple is injective in i
      // and no two partners share a name. Cycling the ward on `i % WARDS.length`
      // instead would repeat the same name every 160 entries — 1,258 duplicates
      // in Eat alone.
      const w = Math.floor(i / (first.length * second.length)) % WARDS.length;
      const name = `${first[i % first.length]} ${
        second[Math.floor(i / first.length) % second.length]
      } ${WARDS[w].replace(" ward", "")}`;
      out.push({
        id: `p-${category}-${i}`,
        name,
        category,
        discountPct: DISCOUNTS[i % DISCOUNTS.length],
        shortCode: `${PREFIX[category]}-${String(i).padStart(4, "0")}`,
        ward: WARDS[w],
        city: "Nairobi",
        country: "KE",
        coords: WARD_COORDS[w],
      });
    }
  }
  return out;
}
