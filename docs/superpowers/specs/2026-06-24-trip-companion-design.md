# PassGo Trip Companion — Design Spec

**Date:** 2026-06-24
**Status:** Approved for planning
**Author:** Mbeche (with Claude)

## Summary

Evolve PassGo's thin `Trip` model into a full **post-booking trip companion**, and
seed a real first trip — Vietnam, travellers Mbeche + Cyn, 1–8 July 2026 — transcribed
from the user's `Vietnam_Trip_Planner_.xlsx`. PassGo today is a passport-first
*discovery* tool; this turns it into an "I've booked it, now help me pull it off" tool.

The single `Plan` tab grows into a **Trip Hub** with a segmented switcher across six
modules. All seeded data is editable, so it stays a living tool the user updates
before and during the trip.

## Goals

- Capture every dimension of the source Excel that has app value: visa/document
  checklist, flights, accommodation, day-by-day itinerary, budget, packing/carry-on,
  shopping, recommended apps.
- Vietnam trip present and complete on first launch.
- Everything editable: tap to check items, edit text and amounts.
- Reuse existing tech and design system; no new dependencies.
- Add Vietnam to PassGo's country data so the app renders it consistently and it
  appears in Discover.

## Non-Goals (YAGNI)

- Excel importer (decision: seed-as-data now; importer is a possible later addition).
- Accounts / real multi-user sync. "Cyn" is a plain name tag on budget items.
- USD conversion of trip money (kept in KES).
- Push notifications / reminders.
- A dedicated module for the "Prep" beauty-appointments sheet — its dated tasks fold
  into a small optional "Pre-trip prep" checklist under the Packing module.
- Gating any of this behind the existing paywall. All trip-companion features are free.

## Source data (Vietnam_Trip_Planner_.xlsx)

11 sheets map to modules as follows:

| Sheet(s)                         | Module        |
| -------------------------------- | ------------- |
| Overview                         | Overview      |
| Print                            | Documents     |
| Overview (dates) + Itinerary     | Itinerary     |
| Flights + Accommodation          | Bookings      |
| Budget                           | Budget        |
| Packing + Carry on + Shopping + Apps + Prep | Packing |

Key facts to seed: 2 pax; Nairobi → Doha → Hanoi (Qatar, booked) and Hanoi → Da Nang
(VietJet/Vietravel, booked); Hoi An stay (The Beachside Boutique, 2–6 Jul, 4 nights,
KES 55,000, confirmed) and Hanoi stay (Hanoi de Garden, 6–8 Jul, 2 nights, KES 20,000,
confirmed); budget total estimated KES 629,250 / actual-so-far KES 383,330.72; Core +
Backup document folders (~15 items); packing lists with quantities; shopping wishlist;
recommended apps (Airalo, Grab, Klook, etc.).

## Data Model

Extend `Trip` in `src/types/index.ts`. All new fields optional so existing/empty trips
and the current attraction-based planner keep working.

```ts
export interface Flight {
  id: string;
  airline: string;
  route: string;           // "NBO → Doha → Hanoi"
  departDate?: string;     // ISO
  returnDate?: string;     // ISO
  pricePpKes?: number;     // per person
  status?: "Booked" | "Pending" | "Cancelled";
  notes?: string;
}

export interface Stay {
  id: string;
  location: string;        // "Hoi An"
  hotel: string;
  checkIn?: string;        // ISO
  checkOut?: string;       // ISO
  nights?: number;
  totalKes?: number;
  link?: string;
  status?: "Confirmed" | "Pending" | "Cancelled";
  notes?: string;
}

export interface ItineraryBlock {
  time: string;            // "Morning", "Lunch", "Evening" (free text)
  activity: string;
  area?: string;
}

export interface ItineraryDay {
  id: string;
  date?: string;           // ISO or free label ("3 Jul (Birthday)")
  location: string;        // "Hoi An"
  plan: string[];          // bullet items
  blocks?: ItineraryBlock[]; // used for the time-blocked Hanoi day
  notes?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  estimatedKes?: number;
  actualKes?: number;
  paidBy?: string;         // "Mbeche" | "Cyn"
  status?: string;         // e.g. "Booked"
}

export interface DocItem {
  id: string;
  label: string;
  folder: "core" | "backup";
  checked: boolean;
}

export interface PackItem {
  id: string;
  category: string;        // "Clothing", "Toiletries", "Travel Documents", "Pre-trip prep"...
  name: string;
  qty?: string;            // "2", "Several", "1 tube" — kept as string (Excel is mixed)
  date?: string;           // optional, for Pre-trip prep tasks
  checked: boolean;
}

export interface AppRec {
  id: string;
  category: string;        // "Transport", "Internet", "Activities"...
  name: string;
  purpose?: string;
  link?: string;
}

export interface Trip {
  // ── existing ──
  id: string;
  countryCode: string;
  title: string;
  startDate?: string;
  endDate?: string;
  accommodation?: string;  // legacy single field; kept for back-compat
  items: TripItem[];       // legacy attraction-based planner
  createdAt: string;

  // ── new (all optional) ──
  travelers?: string[];
  overview?: {
    areas?: string;        // "Hoi An & Hanoi"
    departure?: string;    // "Nairobi"
    durationLabel?: string;// "6 nights / 7 days"
    route?: string[];      // ["Land Qatar → Fly to Hanoi", ...]
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
```

## Seed Data

New file `src/data/seedVietnamTrip.ts` exports a single fully-populated `Trip` object
transcribed from the Excel. IDs are stable string literals (e.g. `"vn_doc_passport"`)
so toggling state survives re-seeds and reorders. Checkbox defaults match the sheet
(Excel rows marked ✅ start `checked: true`).

Vietnam content added so the app renders the trip and lists it in Discover:

- `src/data/mockCountries.ts`: add Vietnam (`code: "VN"`, flag 🇻🇳, region Asia, capital
  Hanoi, currency VND, etc.).
- `src/data/mockCities.ts`: add Hoi An, Da Nang, Hanoi (with lat/lng for the map).
- `src/data/mockVisaRules.ts`: add a KE → VN rule (e-visa) consistent with the
  existing `VisaRule` shape.
- A handful of Vietnam attractions in `mockAttractions.ts` are **optional** and only
  needed if we want the legacy attraction planner to work for VN; the new Itinerary
  module does not depend on them. Marked optional in the plan.

## Store Changes (`src/store/useTripStore.ts`)

Add to `TripState`:

```ts
seeded: boolean;
seedIfEmpty: () => void;                       // adds Vietnam trip once, sets seeded
toggleDoc: (tripId, docId) => void;
togglePack: (tripId, list: "packing" | "shopping", itemId) => void;
setBudgetActual: (tripId, itemId, actualKes: number | undefined) => void;
updateTripRich: (tripId, patch: Partial<Trip>) => void;  // generic editor for flights/stays/schedule/etc.
```

- `seedIfEmpty` adds the seed trip only when `!seeded` (not merely when `trips` is
  empty — so a user who deletes all trips isn't re-seeded). Sets `activeTripId` to it.
- Persist `version` bumped (e.g. to `2`) with a `migrate` that returns prior state
  unchanged (new fields are optional, so no data transform needed). Persisted key
  stays `passgo-trips`; add `seeded` to persisted state.
- `seedIfEmpty()` is invoked once on app start — from `App.tsx` (or a small
  `useSeedTrip` hook) after store hydration.

## Navigation & Screens

The `Plan` tab becomes the **Trip Hub**. Keep `PlanScreen` as the entry; refactor its
body so that when the active trip has rich data it renders a **module switcher**;
otherwise it falls back to the existing attraction-based `TripEditor` (preserving
current behaviour for discovery-built trips).

New components under `src/screens/trip/` (or `src/components/trip/`):

- `TripHub.tsx` — owns the segmented control + active module state; renders the trip
  switcher pills (existing) above it.
- `OverviewModule.tsx` — hero card (flag, name, travellers, dates, areas, route),
  **days-to-departure countdown**, and status chips: `Docs x/total`, `Budget actual/est`,
  booking status.
- `DocumentsModule.tsx` — two folders (Core, Backup) of tappable checklist rows with a
  progress bar. ⭐ headline visa feature.
- `ItineraryModule.tsx` — day cards: date → location → plan bullets + notes; renders
  `blocks` as a time-stamped list for the Hanoi day. Editable text.
- `BookingsModule.tsx` — Flights section + Stays section; status `Pill`s, KES prices,
  "Open link" buttons (`Linking.openURL`), totals.
- `BudgetModule.tsx` — category rows (estimated vs actual KES, paidBy tag), editable
  actuals, totals + progress bar.
- `PackingModule.tsx` — sectioned checklists: Packing, Carry-on (carry-on items live in
  `packing` under category "Carry-on" or a separate section — see Open Questions),
  Shopping wishlist, recommended Apps, and Pre-trip prep.

Reuse existing `ui` primitives: `Card`, `Pill`, `Button`, `Screen`, `Icon`. New tiny
shared pieces: `CheckRow` (tappable check + label + optional qty/meta) and `ProgressBar`.

No new tab is added; `TabParamList` is unchanged. Module state is local to `TripHub`
(no new navigation params).

## Formatting

Add to `src/utils/format.ts`:

```ts
export const kes = (n?: number) =>
  n == null ? "—" : `KES ${Math.round(n).toLocaleString("en-KE")}`;

export const daysUntil = (iso?: string) => /* whole days from today to iso, or null */;
```

`daysUntil` must avoid `Date.now()`/`new Date()` only where the sandbox forbids it at
*build* time; at runtime in the app these are fine (the store already uses
`new Date().toISOString()`). The countdown is a runtime value.

## Error / Edge Handling

- Missing optional fields render as "—" or hide their section; no crashes on partial data.
- `Linking.openURL` wrapped in try/catch; invalid/empty links disable the button.
- Editing an amount parses to a number; blank clears `actualKes` to `undefined`.
- Re-seeding guarded by `seeded` flag; deleting the trip will not resurrect it.
- Budget/doc progress handle empty lists (0/0 → show "—" or 0%).

## Testing

- Unit: `kes()` formatting (including `undefined`), `daysUntil()` boundaries,
  budget/doc progress math, `groupItemsByCity` still passes.
- Store: `seedIfEmpty` adds exactly once; `toggleDoc`/`togglePack` flip the right item;
  `setBudgetActual` updates and clears; persist migrate preserves existing trips.
- Component/manual: each module renders the seeded Vietnam data; checkboxes persist
  across reload; "Open link" opens hotel URLs; countdown shows days to 1 Jul 2026.

## File Touch List

- `src/types/index.ts` — new interfaces + `Trip` extension.
- `src/store/useTripStore.ts` — new state/actions, persist v2.
- `src/data/seedVietnamTrip.ts` — new seed.
- `src/data/mockCountries.ts`, `mockCities.ts`, `mockVisaRules.ts` — add Vietnam.
- `src/screens/PlanScreen.tsx` — branch to `TripHub` when rich data present.
- `src/components/trip/*` (or `src/screens/trip/*`) — module components + `CheckRow`,
  `ProgressBar`.
- `src/utils/format.ts` — `kes`, `daysUntil`.
- `App.tsx` — call `seedIfEmpty()` on start.
- Tests alongside the above.

## Open Questions (resolve during planning, low-risk defaults chosen)

1. Carry-on vs Packing: default — keep Carry-on as its own section within the Packing
   module (the Excel separates them), modelled as `packing` items with
   `category: "Carry-on"` plus a section divider. Could split into its own field later.
2. Component location: default `src/components/trip/` to match existing `components/`
   convention; revisit if the modules grow screen-sized.
