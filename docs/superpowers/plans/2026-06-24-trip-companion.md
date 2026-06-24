# PassGo Trip Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend PassGo's `Trip` into a full trip companion and seed a real Vietnam trip (Mbeche + Cyn, 1–8 Jul 2026) with six editable modules: Overview, Documents, Itinerary, Bookings, Budget, Packing.

**Architecture:** No new runtime tech. Extend the `Trip` type with optional fields, add a transcribed seed file, add pure reducer/stat helpers, extend the Zustand `useTripStore`, and grow the `Plan` tab into a `TripHub` with a segmented module switcher. Pure logic is TDD'd with a new lightweight **vitest** runner; React Native UI is verified with `tsc --noEmit` plus manual web checks (RN component testing infra is out of scope for this app).

**Tech Stack:** React Native 0.74 + Expo 51, TypeScript 5.3, NativeWind 4 (Tailwind classes), Zustand 4 with `persist`/AsyncStorage, React Navigation 6. New dev-only: vitest.

## Global Constraints

- **Money is KES**, never converted. Format with `kes()`. Source figures verbatim from the Excel.
- **All new `Trip` fields are optional** — existing/empty trips and the legacy attraction planner must keep working unchanged.
- **No new dependencies** except `vitest` (devDependency) and its config.
- **Pure-logic files stay React-Native-free** (`src/utils/format.ts`, `src/utils/tripStats.ts`, `src/store/tripReducers.ts`, `src/data/seedVietnamTrip.ts`, `src/data/mock*.ts`) so vitest can import them in a node environment. UI components live under `src/components/trip/`.
- **Path alias** `@/` resolves to `src/` (see `babel.config.js`); vitest config must mirror this.
- **No `Date.now()`/`Math.random()` in seed/data files** — use literal string ids.
- **TDD for pure logic**; UI verified by `npm run lint` (`tsc --noEmit`) + manual web run.
- **Reuse existing `ui` primitives**: `Card`, `Button`, `Pill`, `SectionTitle`, `Tag`, `Stat` from `@/components/ui`; `Icon` from `@/components/Icon`; `colors` from `@/lib/theme`.
- **Default checkbox seed state**: items marked ✅ in the Excel start `checked: true` (all Documents and all Carry-on items); Packing/Shopping items start `checked: false`.

---

## File Structure

- `src/types/index.ts` — extend `Trip`, add `Flight`, `Stay`, `ItineraryBlock`, `ItineraryDay`, `BudgetItem`, `DocItem`, `PackItem`, `AppRec`.
- `src/utils/format.ts` — add `kes()`, `daysUntil()`.
- `src/utils/tripStats.ts` *(new)* — `docProgress`, `packProgress`, `budgetTotals`.
- `src/store/tripReducers.ts` *(new)* — pure `toggleDocItem`, `togglePackItem`, `setBudgetActualItem`.
- `src/store/useTripStore.ts` — add `seeded`, `seedIfEmpty`, `toggleDoc`, `togglePack`, `setBudgetActual`, `updateTripRich`; persist v2.
- `src/data/mockCountries.ts`, `mockCities.ts`, `mockVisaRules.ts` — add Vietnam.
- `src/data/seedVietnamTrip.ts` *(new)* — full transcribed trip.
- `src/components/trip/CheckRow.tsx`, `ProgressBar.tsx` *(new)* — shared UI.
- `src/components/trip/TripHub.tsx` *(new)* — segmented switcher.
- `src/components/trip/OverviewModule.tsx`, `DocumentsModule.tsx`, `ItineraryModule.tsx`, `BookingsModule.tsx`, `BudgetModule.tsx`, `PackingModule.tsx` *(new)*.
- `src/screens/PlanScreen.tsx` — branch to `TripHub` when trip has rich data.
- `App.tsx` — call `seedIfEmpty()` on start.
- `vitest.config.ts`, test files *(new)*.

---

## Task 1: Test tooling + money/date formatters

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDep + `test` script)
- Modify: `src/utils/format.ts`
- Test: `src/utils/format.test.ts`

**Interfaces:**
- Produces: `kes(n?: number): string`, `daysUntil(iso?: string, now?: Date): number | null`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest@^2
```

- [ ] **Step 2: Add test script to package.json**

In `package.json` `scripts`, add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Create vitest config mirroring the `@/` alias**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

- [ ] **Step 4: Write the failing test**

Create `src/utils/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { kes, daysUntil } from "@/utils/format";

describe("kes", () => {
  it("formats whole numbers with thousands separators", () => {
    expect(kes(629250)).toBe("KES 629,250");
  });
  it("rounds fractional KES", () => {
    expect(kes(348433.72)).toBe("KES 348,434");
  });
  it("renders an em dash for undefined", () => {
    expect(kes(undefined)).toBe("—");
  });
  it("handles zero", () => {
    expect(kes(0)).toBe("KES 0");
  });
});

describe("daysUntil", () => {
  const now = new Date("2026-06-24T00:00:00Z");
  it("counts whole days to a future date", () => {
    expect(daysUntil("2026-07-01T00:00:00Z", now)).toBe(7);
  });
  it("returns 0 on the same day", () => {
    expect(daysUntil("2026-06-24T12:00:00Z", now)).toBe(0);
  });
  it("returns negative for past dates", () => {
    expect(daysUntil("2026-06-20T00:00:00Z", now)).toBe(-4);
  });
  it("returns null for undefined", () => {
    expect(daysUntil(undefined, now)).toBeNull();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `kes`/`daysUntil` are not exported from `format.ts`.

- [ ] **Step 6: Implement the formatters**

Append to `src/utils/format.ts`:

```ts
/** "KES 629,250" — KES, rounded to whole shillings. "—" when undefined. */
export const kes = (n?: number): string =>
  n == null ? "—" : `KES ${Math.round(n).toLocaleString("en-US")}`;

/**
 * Whole days from `now` (default: current time) to an ISO date.
 * Positive = future, 0 = today, negative = past, null = no date.
 */
export const daysUntil = (iso?: string, now: Date = new Date()): number | null => {
  if (!iso) return null;
  const MS = 86_400_000;
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = new Date(iso);
  const end = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate()
  );
  return Math.round((end - start) / MS);
};
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS (8 assertions).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/utils/format.ts src/utils/format.test.ts
git commit -m "feat: add vitest + kes/daysUntil formatters"
```

---

## Task 2: Trip domain types

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `Flight`, `Stay`, `ItineraryBlock`, `ItineraryDay`, `BudgetItem`, `DocItem`, `PackItem`, `AppRec`, and extended `Trip`. These names/fields are consumed by every later task.

- [ ] **Step 1: Add the sub-interfaces and extend `Trip`**

In `src/types/index.ts`, replace the existing `Trip` interface (the block starting `export interface Trip {`) with:

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: PASS (no errors). The existing `TripItem` interface above `Trip` is untouched.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: extend Trip type with companion fields"
```

---

## Task 3: Trip stat helpers (progress + totals)

**Files:**
- Create: `src/utils/tripStats.ts`
- Test: `src/utils/tripStats.test.ts`

**Interfaces:**
- Consumes: `DocItem`, `PackItem`, `BudgetItem` from `@/types`.
- Produces:
  - `docProgress(docs?: DocItem[]): { done: number; total: number; pct: number }`
  - `packProgress(items?: PackItem[]): { done: number; total: number; pct: number }`
  - `budgetTotals(items?: BudgetItem[]): { estimated: number; actual: number; pct: number }`
  - `pct` is 0–1.

- [ ] **Step 1: Write the failing test**

Create `src/utils/tripStats.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { docProgress, packProgress, budgetTotals } from "@/utils/tripStats";
import type { DocItem, PackItem, BudgetItem } from "@/types";

const docs: DocItem[] = [
  { id: "a", label: "Passport", folder: "core", checked: true },
  { id: "b", label: "Photos", folder: "core", checked: false },
  { id: "c", label: "Insurance", folder: "backup", checked: true },
];
const pack: PackItem[] = [
  { id: "p1", category: "Clothing", name: "Shorts", checked: false },
  { id: "p2", category: "Clothing", name: "Dress", checked: true },
];
const budget: BudgetItem[] = [
  { id: "b1", category: "Flights", estimatedKes: 350000, actualKes: 348433.72 },
  { id: "b2", category: "Hotels", estimatedKes: 80000 },
];

describe("docProgress", () => {
  it("counts checked over total", () => {
    expect(docProgress(docs)).toEqual({ done: 2, total: 3, pct: 2 / 3 });
  });
  it("is empty-safe", () => {
    expect(docProgress(undefined)).toEqual({ done: 0, total: 0, pct: 0 });
  });
});

describe("packProgress", () => {
  it("counts checked over total", () => {
    expect(packProgress(pack)).toEqual({ done: 1, total: 2, pct: 0.5 });
  });
});

describe("budgetTotals", () => {
  it("sums estimated and actual, pct = actual/estimated", () => {
    const t = budgetTotals(budget);
    expect(t.estimated).toBe(430000);
    expect(t.actual).toBeCloseTo(348433.72, 2);
    expect(t.pct).toBeCloseTo(348433.72 / 430000, 5);
  });
  it("is empty-safe", () => {
    expect(budgetTotals(undefined)).toEqual({ estimated: 0, actual: 0, pct: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/utils/tripStats.ts` does not exist.

- [ ] **Step 3: Implement the helpers**

Create `src/utils/tripStats.ts`:

```ts
import type { BudgetItem, DocItem, PackItem } from "@/types";

function checkedProgress(items: { checked: boolean }[]) {
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  return { done, total, pct: total === 0 ? 0 : done / total };
}

export const docProgress = (docs?: DocItem[]) => checkedProgress(docs ?? []);
export const packProgress = (items?: PackItem[]) => checkedProgress(items ?? []);

export function budgetTotals(items?: BudgetItem[]) {
  const list = items ?? [];
  const estimated = list.reduce((s, i) => s + (i.estimatedKes ?? 0), 0);
  const actual = list.reduce((s, i) => s + (i.actualKes ?? 0), 0);
  return { estimated, actual, pct: estimated === 0 ? 0 : actual / estimated };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/tripStats.ts src/utils/tripStats.test.ts
git commit -m "feat: add trip progress + budget total helpers"
```

---

## Task 4: Pure trip reducers (toggle/edit)

**Files:**
- Create: `src/store/tripReducers.ts`
- Test: `src/store/tripReducers.test.ts`

**Interfaces:**
- Consumes: `Trip` from `@/types`.
- Produces (all return a new `Trip`, never mutate):
  - `toggleDocItem(trip: Trip, docId: string): Trip`
  - `togglePackItem(trip: Trip, list: "packing" | "shopping", itemId: string): Trip`
  - `setBudgetActualItem(trip: Trip, itemId: string, actualKes: number | undefined): Trip`

- [ ] **Step 1: Write the failing test**

Create `src/store/tripReducers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  toggleDocItem,
  togglePackItem,
  setBudgetActualItem,
} from "@/store/tripReducers";
import type { Trip } from "@/types";

const base: Trip = {
  id: "t1",
  countryCode: "VN",
  title: "Vietnam",
  items: [],
  createdAt: "2026-06-24T00:00:00.000Z",
  documents: [
    { id: "d1", label: "Passport", folder: "core", checked: true },
    { id: "d2", label: "Photos", folder: "core", checked: false },
  ],
  packing: [{ id: "p1", category: "Clothing", name: "Shorts", checked: false }],
  shopping: [{ id: "s1", category: "Gifts", name: "Coffee", checked: false }],
  budget: [{ id: "b1", category: "Flights", estimatedKes: 350000 }],
};

describe("toggleDocItem", () => {
  it("flips the targeted doc and leaves others alone", () => {
    const next = toggleDocItem(base, "d2");
    expect(next.documents?.find((d) => d.id === "d2")?.checked).toBe(true);
    expect(next.documents?.find((d) => d.id === "d1")?.checked).toBe(true);
    expect(next).not.toBe(base); // immutable
  });
});

describe("togglePackItem", () => {
  it("flips a packing item", () => {
    expect(togglePackItem(base, "packing", "p1").packing?.[0].checked).toBe(true);
  });
  it("flips a shopping item", () => {
    expect(togglePackItem(base, "shopping", "s1").shopping?.[0].checked).toBe(true);
  });
});

describe("setBudgetActualItem", () => {
  it("sets an actual amount", () => {
    expect(setBudgetActualItem(base, "b1", 348434).budget?.[0].actualKes).toBe(348434);
  });
  it("clears with undefined", () => {
    const withVal = setBudgetActualItem(base, "b1", 100);
    expect(setBudgetActualItem(withVal, "b1", undefined).budget?.[0].actualKes).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/store/tripReducers.ts` does not exist.

- [ ] **Step 3: Implement the reducers**

Create `src/store/tripReducers.ts`:

```ts
import type { Trip } from "@/types";

export function toggleDocItem(trip: Trip, docId: string): Trip {
  return {
    ...trip,
    documents: (trip.documents ?? []).map((d) =>
      d.id === docId ? { ...d, checked: !d.checked } : d
    ),
  };
}

export function togglePackItem(
  trip: Trip,
  list: "packing" | "shopping",
  itemId: string
): Trip {
  return {
    ...trip,
    [list]: (trip[list] ?? []).map((i) =>
      i.id === itemId ? { ...i, checked: !i.checked } : i
    ),
  };
}

export function setBudgetActualItem(
  trip: Trip,
  itemId: string,
  actualKes: number | undefined
): Trip {
  return {
    ...trip,
    budget: (trip.budget ?? []).map((b) =>
      b.id === itemId ? { ...b, actualKes } : b
    ),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/tripReducers.ts src/store/tripReducers.test.ts
git commit -m "feat: add pure trip reducers for toggles and budget edits"
```

---

## Task 5: Add Vietnam to reference data

**Files:**
- Modify: `src/data/mockCountries.ts`
- Modify: `src/data/mockCities.ts`
- Modify: `src/data/mockVisaRules.ts`
- Test: `src/data/vietnam.test.ts`

**Interfaces:**
- Produces: a `Country` with `code: "VN"`, three `City` rows (`city_hoian`, `city_danang`, `city_hanoi`), and a `VisaRule` `v_ke_vn`. Consumed by the seed (Task 6) and `TripHub` header (Task 9).

- [ ] **Step 1: Write the failing test**

Create `src/data/vietnam.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MOCK_COUNTRIES } from "@/data/mockCountries";
import { MOCK_CITIES } from "@/data/mockCities";
import { MOCK_VISA_RULES } from "@/data/mockVisaRules";

describe("Vietnam reference data", () => {
  it("has a VN country", () => {
    expect(MOCK_COUNTRIES.find((c) => c.code === "VN")?.name).toBe("Vietnam");
  });
  it("has three VN cities", () => {
    expect(MOCK_CITIES.filter((c) => c.countryCode === "VN").map((c) => c.id)).toEqual(
      ["city_hoian", "city_danang", "city_hanoi"]
    );
  });
  it("has a KE→VN e-visa rule", () => {
    const r = MOCK_VISA_RULES.find((v) => v.passportCountry === "KE" && v.destCountry === "VN");
    expect(r?.visaType).toBe("evisa");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — VN rows not present.

- [ ] **Step 3: Add the Vietnam country**

In `src/data/mockCountries.ts`, add this object as the first element of the `MOCK_COUNTRIES` array (right after `export const MOCK_COUNTRIES: Country[] = [`):

```ts
  {
    id: "c_vn",
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    region: "Asia",
    capital: "Hanoi",
    currency: "VND",
    currencyName: "Vietnamese Dong",
    languages: ["Vietnamese"],
    dailyBudgetUsd: 45,
    budgetTier: "budget",
    suggestedDays: 7,
    bestSeason: "Feb–Apr & Aug–Oct",
    heroImage: img("vn-hero"),
    summary:
      "Lantern-lit Hoi An, the buzz of Hanoi's Old Quarter and a 3,000 km coastline of beaches and street food.",
    popularityRank: 0,
  },
```

- [ ] **Step 4: Add the three Vietnam cities**

In `src/data/mockCities.ts`, add to the `MOCK_CITIES` array (e.g. right after the opening `[`):

```ts
  // Vietnam
  {
    id: "city_hoian",
    countryCode: "VN",
    name: "Hoi An",
    lat: 15.8801,
    lng: 108.338,
    image: img("hoian"),
    blurb: "UNESCO old town of lantern-lit lanes, tailors and An Bang Beach.",
    suggestedDays: 4,
  },
  {
    id: "city_danang",
    countryCode: "VN",
    name: "Da Nang",
    lat: 16.0544,
    lng: 108.2022,
    image: img("danang"),
    blurb: "Marble Mountains, the Dragon Bridge and the airport gateway to Hoi An.",
    suggestedDays: 1,
  },
  {
    id: "city_hanoi",
    countryCode: "VN",
    name: "Hanoi",
    lat: 21.0278,
    lng: 105.8342,
    image: img("hanoi"),
    blurb: "The capital's Old Quarter, Hoan Kiem Lake and Train Street.",
    suggestedDays: 2,
  },
```

- [ ] **Step 5: Add the KE→VN visa rule**

In `src/data/mockVisaRules.ts`, add to the `MOCK_VISA_RULES` array (e.g. right after the opening `[`):

```ts
  {
    id: "v_ke_vn",
    passportCountry: "KE",
    destCountry: "VN",
    visaType: "evisa",
    costUsd: 25,
    processingDays: 3,
    stayDays: 90,
    officialLink: "https://evisa.gov.vn/",
    notes: "Single/multiple-entry e-visa via the official portal; apply ahead of travel.",
  },
```

- [ ] **Step 6: Run test + typecheck**

Run: `npm test` → Expected: PASS.
Run: `npm run lint` → Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/mockCountries.ts src/data/mockCities.ts src/data/mockVisaRules.ts src/data/vietnam.test.ts
git commit -m "feat: add Vietnam country, cities and visa rule"
```

---

## Task 6: Vietnam trip seed

**Files:**
- Create: `src/data/seedVietnamTrip.ts`
- Test: `src/data/seedVietnamTrip.test.ts`

**Interfaces:**
- Consumes: `Trip` and sub-types from `@/types`.
- Produces: `export const VIETNAM_TRIP: Trip` with `id: "trip_vietnam_2026"`.

- [ ] **Step 1: Write the failing test (integrity against the Excel)**

Create `src/data/seedVietnamTrip.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { VIETNAM_TRIP } from "@/data/seedVietnamTrip";

describe("VIETNAM_TRIP seed", () => {
  it("has stable id and VN country", () => {
    expect(VIETNAM_TRIP.id).toBe("trip_vietnam_2026");
    expect(VIETNAM_TRIP.countryCode).toBe("VN");
  });
  it("has both travellers", () => {
    expect(VIETNAM_TRIP.travelers).toEqual(["Mbeche", "Cyn"]);
  });
  it("documents: 10 core (all checked) + 5 backup (all checked)", () => {
    const core = VIETNAM_TRIP.documents!.filter((d) => d.folder === "core");
    const backup = VIETNAM_TRIP.documents!.filter((d) => d.folder === "backup");
    expect(core).toHaveLength(10);
    expect(backup).toHaveLength(5);
    expect(VIETNAM_TRIP.documents!.every((d) => d.checked)).toBe(true);
  });
  it("two booked flights", () => {
    expect(VIETNAM_TRIP.flights).toHaveLength(2);
    expect(VIETNAM_TRIP.flights!.every((f) => f.status === "Booked")).toBe(true);
  });
  it("two confirmed stays totalling KES 75,000", () => {
    expect(VIETNAM_TRIP.stays).toHaveLength(2);
    expect(VIETNAM_TRIP.stays!.reduce((s, x) => s + (x.totalKes ?? 0), 0)).toBe(75000);
  });
  it("budget estimated total is 629,250", () => {
    const est = VIETNAM_TRIP.budget!.reduce((s, b) => s + (b.estimatedKes ?? 0), 0);
    expect(est).toBe(629250);
  });
  it("every id in every list is unique", () => {
    const ids = [
      ...VIETNAM_TRIP.documents!,
      ...VIETNAM_TRIP.flights!,
      ...VIETNAM_TRIP.stays!,
      ...VIETNAM_TRIP.schedule!,
      ...VIETNAM_TRIP.budget!,
      ...VIETNAM_TRIP.packing!,
      ...VIETNAM_TRIP.shopping!,
      ...VIETNAM_TRIP.apps!,
    ].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — seed file does not exist.

- [ ] **Step 3: Create the seed file (full transcription of the Excel)**

Create `src/data/seedVietnamTrip.ts`:

```ts
import type { Trip } from "@/types";

// Transcribed verbatim from Vietnam_Trip_Planner_.xlsx (Mbeche + Cyn, Jul 2026).
// Money is KES. Ids are stable literals so toggle state survives re-seeds.
export const VIETNAM_TRIP: Trip = {
  id: "trip_vietnam_2026",
  countryCode: "VN",
  title: "Vietnam 2026",
  startDate: "2026-07-01",
  endDate: "2026-07-08",
  createdAt: "2026-06-24T00:00:00.000Z",
  items: [],
  travelers: ["Mbeche", "Cyn"],
  overview: {
    areas: "Hoi An & Hanoi",
    departure: "Nairobi",
    durationLabel: "6 nights / 7 days",
    route: [
      "1 Jul — Land Doha → fly to Hanoi",
      "2 Jul — Land Hanoi → fly to Da Nang",
      "2–5 Jul — Da Nang + Hoi An",
      "6 Jul — Fly back to Hanoi",
      "6–7 Jul — Hanoi",
      "8 Jul — Fly home",
    ],
  },

  flights: [
    {
      id: "fl_qatar",
      airline: "Qatar Airways",
      route: "NBO → Doha → Hanoi",
      departDate: "2026-07-01",
      returnDate: "2026-07-08",
      pricePpKes: 302000,
      status: "Booked",
    },
    {
      id: "fl_vietjet",
      airline: "Vietravel / VietJet Air",
      route: "Hanoi → Da Nang",
      departDate: "2026-07-02",
      returnDate: "2026-07-06",
      pricePpKes: 46433.72,
      status: "Booked",
    },
  ],

  stays: [
    {
      id: "stay_hoian",
      location: "Hoi An",
      hotel: "The Beachside Boutique Hotel & Villa",
      checkIn: "2026-07-02",
      checkOut: "2026-07-06",
      nights: 4,
      totalKes: 55000,
      link: "https://www.trip.com/w/jRoRxQR7RU2",
      status: "Confirmed",
      notes: "Suite room with garden view",
    },
    {
      id: "stay_hanoi",
      location: "Hanoi",
      hotel: "Hanoi de Garden Boutique Hotel & Spa",
      checkIn: "2026-07-06",
      checkOut: "2026-07-08",
      nights: 2,
      totalKes: 20000,
      link: "https://www.trip.com/w/31c9XZM7RU2",
      status: "Confirmed",
      notes: "Suite with balcony",
    },
  ],

  schedule: [
    {
      id: "day_0702",
      date: "2026-07-02",
      location: "Hoi An (An Bang)",
      plan: [
        "Arrive Da Nang, transfer to hotel",
        "Sunset walk on An Bang Beach or town exploration",
        "Dinner near An Bang beach",
      ],
      notes: "Hotel transfer or Grab.",
    },
    {
      id: "day_0703",
      date: "2026-07-03",
      location: "Hoi An — Birthday 🎂",
      plan: [
        "Relaxed morning (pool / beach)",
        "Heritage Art Museum",
        "Old Town afternoon",
        "Uncle Huan",
        "Birthday dinner",
        "Lantern boat ride",
      ],
      notes: "Lantern boat ride, riverside dinner reservation, café stop.",
    },
    {
      id: "day_0704",
      date: "2026-07-04",
      location: "Hoi An",
      plan: [
        "Japanese Bridge",
        "Shopping & tailoring",
        "Roving Chillhouse brunch",
        "Rice fields",
        "Blush Beach Club",
      ],
      notes: "An Bang beach, spa / massage, beach cafés.",
    },
    {
      id: "day_0705",
      date: "2026-07-05",
      location: "Da Nang",
      plan: [
        "First / final tailoring fitting",
        "Da Nang day trip",
        "Marble Mountains",
        "Skincare shopping",
        "Coffee stops",
        "Dragon Bridge show",
        "Hoi An Night Market",
      ],
      notes: "Option 1: Marble Mountains + Linh Ung Pagoda. Option 2: cooking class.",
    },
    {
      id: "day_0706",
      date: "2026-07-06",
      location: "Hoi An → Hanoi",
      plan: [
        "Pick up clothes, massage, beach",
        "Check out, transfer to airport",
        "Fly to Hanoi, check in",
        "Old Quarter walk + dinner",
      ],
      notes: "Grab to airport, evening street food, night market.",
    },
    {
      id: "day_0707",
      date: "2026-07-07",
      location: "Hanoi",
      plan: [],
      blocks: [
        { time: "Early morning", activity: "Hoan Kiem Lake walk + Ngoc Son Temple", area: "Hoan Kiem" },
        { time: "Morning", activity: "Ho Chi Minh Mausoleum (outside)", area: "Ba Dinh Square" },
        { time: "Late morning", activity: "Temple of Literature", area: "Dong Da" },
        { time: "Lunch", activity: "Local street food", area: "Old Quarter" },
        { time: "Afternoon", activity: "Optional: Museum of Ethnology or spa", area: "Outside city centre" },
        { time: "Evening", activity: "Train Street + dinner", area: "Old Quarter" },
        { time: "Night", activity: "Rooftop drink (optional)", area: "Hoan Kiem" },
      ],
    },
    {
      id: "day_0708",
      date: "2026-07-08",
      location: "Hanoi",
      plan: ["Check out", "Transfer to airport", "Fly home"],
    },
  ],

  budget: [
    { id: "bg_flights", category: "Flights", estimatedKes: 350000, actualKes: 348433.72, paidBy: "Mbeche", status: "Booked" },
    { id: "bg_hotels", category: "Hotels", estimatedKes: 80000, paidBy: "Cyn" },
    { id: "bg_activities", category: "Activities", estimatedKes: 80000, paidBy: "Cyn" },
    { id: "bg_food", category: "Food", estimatedKes: 50000, paidBy: "Cyn" },
    { id: "bg_approval", category: "Approval letter", estimatedKes: 31920, actualKes: 31460, paidBy: "Mbeche" },
    { id: "bg_transport", category: "Transport", estimatedKes: 20000, paidBy: "Cyn" },
    { id: "bg_fasttrack", category: "Fast-track airport", estimatedKes: 8700, paidBy: "Cyn" },
    { id: "bg_insurance", category: "Travel insurance", estimatedKes: 5130, paidBy: "Cyn" },
    { id: "bg_visa_stamp", category: "Visa stamping fee", paidBy: "Cyn" },
    { id: "bg_visa_init_cyn", category: "Visa initial (Cyn)", estimatedKes: 3500, actualKes: 3437, paidBy: "Cyn" },
    { id: "bg_visa_init_mbe", category: "Visa initial (Mbeche)", paidBy: "Mbeche" },
    { id: "bg_misc", category: "Misc", paidBy: "Cyn" },
  ],

  documents: [
    { id: "doc_passport", label: "Passport", folder: "core", checked: true },
    { id: "doc_approval", label: "Visa Approval Letter (2 copies)", folder: "core", checked: true },
    { id: "doc_entryform", label: "Signed Entry Form", folder: "core", checked: true },
    { id: "doc_photos", label: "4 passport photos", folder: "core", checked: true },
    { id: "doc_biopage", label: "Passport bio page copy", folder: "core", checked: true },
    { id: "doc_qatar", label: "Qatar Airways confirmation", folder: "core", checked: true },
    { id: "doc_vietjet", label: "VietJet confirmation", folder: "core", checked: true },
    { id: "doc_hoian_hotel", label: "Hoi An hotel confirmation", folder: "core", checked: true },
    { id: "doc_hanoi_hotel", label: "Hanoi hotel confirmation", folder: "core", checked: true },
    { id: "doc_usd_cash", label: "USD 25 cash per person", folder: "core", checked: true },
    { id: "doc_employment", label: "Employment letter", folder: "backup", checked: true },
    { id: "doc_bank", label: "3 months bank statements", folder: "backup", checked: true },
    { id: "doc_insurance", label: "Travel insurance", folder: "backup", checked: true },
    { id: "doc_receipt", label: "Approval Letter payment receipt", folder: "backup", checked: true },
    { id: "doc_emergency", label: "Emergency cash", folder: "backup", checked: true },
  ],

  packing: [
    { id: "pk_airport_outfit", category: "Clothing", name: "Airport outfit", qty: "2", checked: false },
    { id: "pk_coord", category: "Clothing", name: "Co-ord sets", qty: "2", checked: false },
    { id: "pk_shorts", category: "Clothing", name: "Shorts", qty: "3", checked: false },
    { id: "pk_beach_shorts", category: "Clothing", name: "Beach shorts", qty: "2", checked: false },
    { id: "pk_dresses", category: "Clothing", name: "Dresses", qty: "4", checked: false },
    { id: "pk_skirts", category: "Clothing", name: "Skirts", qty: "3", checked: false },
    { id: "pk_tops", category: "Clothing", name: "Light tops", qty: "5", checked: false },
    { id: "pk_coverup", category: "Clothing", name: "Beach cover-up", qty: "1", checked: false },
    { id: "pk_kimono", category: "Clothing", name: "Kimono", qty: "1", checked: false },
    { id: "pk_pyjamas", category: "Clothing", name: "Pyjamas", qty: "2", checked: false },
    { id: "pk_underwear", category: "Clothing", name: "Underwear", qty: "10", checked: false },
    { id: "pk_bras", category: "Clothing", name: "Bras", qty: "3", checked: false },
    { id: "pk_socks", category: "Clothing", name: "Socks", qty: "5", checked: false },
    { id: "pk_bandana", category: "Clothing", name: "Bandana", qty: "1", checked: false },
    { id: "pk_hairties", category: "Clothing", name: "Hair ties", qty: "2", checked: false },
    { id: "pk_towel", category: "Clothing", name: "Towel", qty: "2", checked: false },
    { id: "pk_hoodie", category: "Clothing", name: "Light sweater / hoodie", qty: "1", checked: false },
    { id: "pk_sandals", category: "Shoes", name: "Walking sandals", qty: "3", checked: false },
    { id: "pk_sneakers", category: "Shoes", name: "Comfortable sneakers", qty: "1", checked: false },
    { id: "pk_heels", category: "Shoes", name: "Heels", qty: "1", checked: false },
    { id: "pk_flipflops", category: "Shoes", name: "Flip flops", qty: "1", checked: false },
    { id: "pk_beachshoes", category: "Shoes", name: "Beach shoes", qty: "1", checked: false },
    { id: "pk_swimsuit", category: "Beach", name: "Swimsuit", qty: "4", checked: false },
    { id: "pk_sunglasses", category: "Beach", name: "Sunglasses", qty: "2", checked: false },
    { id: "pk_hat", category: "Beach", name: "Hat / cap", qty: "1", checked: false },
    { id: "pk_beachbag", category: "Beach", name: "Beach bag", qty: "1", checked: false },
    { id: "pk_toothbrush", category: "Toiletries", name: "Toothbrush", qty: "1", checked: false },
    { id: "pk_toothpaste", category: "Toiletries", name: "Toothpaste", qty: "1", checked: false },
    { id: "pk_deodorant", category: "Toiletries", name: "Deodorant", qty: "2", checked: false },
    { id: "pk_poopourri", category: "Toiletries", name: "Poo pourri", qty: "1", checked: false },
    { id: "pk_cottonpads", category: "Toiletries", name: "Cotton pads", qty: "1", checked: false },
    { id: "pk_pantyliners", category: "Toiletries", name: "Pantyliners", qty: "Several", checked: false },
    { id: "pk_lipbalm", category: "Toiletries", name: "Lip balm", qty: "1", checked: false },
    { id: "pk_makeup", category: "Toiletries", name: "Makeup", checked: false },
    { id: "pk_lotion", category: "Toiletries", name: "Body lotion", qty: "1", checked: false },
    { id: "pk_perfume", category: "Toiletries", name: "Perfume", qty: "2", checked: false },
    { id: "pk_wipes", category: "Toiletries", name: "Wipes", checked: false },
    { id: "pk_tissues", category: "Toiletries", name: "Pocket tissues", checked: false },
    { id: "pk_micellar", category: "Toiletries", name: "Micellar water", checked: false },
    { id: "pk_curlcream", category: "Toiletries", name: "Curl cream", checked: false },
    { id: "pk_facewash", category: "Skincare", name: "Face wash", qty: "1", checked: false },
    { id: "pk_moisturiser", category: "Skincare", name: "Moisturiser", qty: "1", checked: false },
    { id: "pk_sunscreen", category: "Skincare", name: "Sunscreen SPF50", qty: "1", checked: false },
    { id: "pk_retinol", category: "Skincare", name: "Retinol lotion", qty: "1", checked: false },
    { id: "pk_serum", category: "Skincare", name: "Hydrating serum", qty: "1", checked: false },
    { id: "pk_pimplepatch", category: "Skincare", name: "Pimple patches", qty: "Several", checked: false },
    { id: "pk_jewellery_pouch", category: "Bags", name: "Jewellery pouch", qty: "1", checked: false },
    { id: "pk_makeupbag", category: "Bags", name: "Small makeup bag", qty: "1", checked: false },
    { id: "pk_crossbody", category: "Bags", name: "Crossbody / sling bag", qty: "1", checked: false },
    { id: "pk_backpack", category: "Bags", name: "Day backpack", qty: "1", checked: false },
    { id: "pk_tote", category: "Bags", name: "Foldable tote bag", qty: "1", checked: false },
    { id: "pk_laundrybag", category: "Bags", name: "Laundry bag", checked: false },
    { id: "pk_antifungal", category: "Medication", name: "Antifungal cream", qty: "1 tube", checked: false },
    { id: "pk_painkillers", category: "Medication", name: "Painkillers", qty: "1 pack", checked: false },
    { id: "pk_antihistamine", category: "Medication", name: "Antihistamine", qty: "1 pack", checked: false },
    { id: "pk_imodium", category: "Medication", name: "Imodium / stomach medication", qty: "1 pack", checked: false },
    { id: "pk_motionsick", category: "Medication", name: "Motion sickness tablets", checked: false },
    { id: "pk_phone", category: "Electronics", name: "Phone", qty: "1", checked: false },
    { id: "pk_charger", category: "Electronics", name: "Phone charger", qty: "1", checked: false },
    { id: "pk_powerbank", category: "Electronics", name: "Power bank", qty: "1", checked: false },
    { id: "pk_earphones", category: "Electronics", name: "Earphones / headphones", qty: "1", checked: false },
    { id: "pk_adapter", category: "Electronics", name: "Universal adapter", qty: "1", checked: false },
    { id: "pk_laptop", category: "Electronics", name: "Laptop", qty: "1", checked: false },
    { id: "co_passport", category: "Carry-on", name: "Passport", checked: true },
    { id: "co_visa_docs", category: "Carry-on", name: "Vietnam visa / approval documents", checked: true },
    { id: "co_flight_conf", category: "Carry-on", name: "Flight confirmations", checked: true },
    { id: "co_hotel_conf", category: "Carry-on", name: "Hotel confirmations", checked: true },
    { id: "co_insurance", category: "Carry-on", name: "Travel insurance", checked: true },
    { id: "co_pen", category: "Carry-on", name: "Pen", checked: true },
    { id: "co_phone", category: "Carry-on", name: "Phone", checked: true },
    { id: "co_powerbank", category: "Carry-on", name: "Power bank", checked: true },
    { id: "co_cable", category: "Carry-on", name: "Charging cable", checked: true },
    { id: "co_earphones", category: "Carry-on", name: "Earphones / headphones", checked: true },
    { id: "co_adapter", category: "Carry-on", name: "Plug adapter", checked: true },
    { id: "co_neckpillow", category: "Carry-on", name: "Neck pillow", checked: true },
    { id: "co_eyemask", category: "Carry-on", name: "Eye mask", checked: true },
    { id: "co_hoodie", category: "Carry-on", name: "Light sweater / hoodie", checked: true },
    { id: "co_compression", category: "Carry-on", name: "Compression socks", checked: true },
    { id: "co_toothbrush", category: "Carry-on", name: "Toothbrush", checked: true },
    { id: "co_toothpaste", category: "Carry-on", name: "Small toothpaste", checked: true },
    { id: "co_lipbalm", category: "Carry-on", name: "Lip balm", checked: true },
    { id: "co_handcream", category: "Carry-on", name: "Hand cream / moisturizer", checked: true },
    { id: "co_deodorant", category: "Carry-on", name: "Deodorant", checked: true },
    { id: "co_wipes", category: "Carry-on", name: "Tissues / wet wipes", checked: true },
    { id: "co_meds", category: "Carry-on", name: "Regular medication", checked: true },
    { id: "co_painkillers", category: "Carry-on", name: "Painkillers", checked: true },
    { id: "co_sanitizer", category: "Carry-on", name: "Hand sanitizer", checked: true },
    { id: "co_netflix", category: "Carry-on", name: "Downloaded Netflix shows", checked: true },
    { id: "co_spotify", category: "Carry-on", name: "Downloaded Spotify playlists", checked: true },
    { id: "co_kindle", category: "Carry-on", name: "Kindle / books / podcasts", checked: true },
    { id: "co_underwear", category: "Carry-on", name: "Spare underwear", checked: true },
    { id: "co_spare_top", category: "Carry-on", name: "Spare t-shirt / top", checked: true },
    { id: "prep_waxing", category: "Pre-trip prep", name: "Waxing 🦵", date: "2026-06-26", checked: false },
    { id: "prep_laser", category: "Pre-trip prep", name: "Laser hair removal 💥", date: "2026-06-26", checked: false },
    { id: "prep_lashes", category: "Pre-trip prep", name: "Lashes 👁", date: "2026-06-27", checked: false },
    { id: "prep_nails", category: "Pre-trip prep", name: "Nails 💅", checked: false },
    { id: "prep_brows", category: "Pre-trip prep", name: "Brows 👁", date: "2026-06-29", checked: false },
    { id: "prep_hair", category: "Pre-trip prep", name: "Hair appointment 💇", date: "2026-06-30", checked: false },
  ],

  shopping: [
    { id: "sh_tailored", category: "Shopping", name: "Tailored clothes 👗", checked: false },
    { id: "sh_leather", category: "Shopping", name: "Leather bag or wallet 👜", checked: false },
    { id: "sh_coffee", category: "Shopping", name: "Coffee ☕", checked: false },
    { id: "sh_snacks", category: "Shopping", name: "Vietnamese snacks 🍫", qty: "Chocolate, sweets & dried fruit", checked: false },
    { id: "sh_clothes", category: "Shopping", name: "Clothes shopping 👗", checked: false },
    { id: "sh_skincare", category: "Shopping", name: "Skincare shopping 🧴", checked: false },
    { id: "sh_shoes", category: "Shopping", name: "Shoe shopping 👟", checked: false },
    { id: "sh_jewellery", category: "Shopping", name: "Jewellery 💍", checked: false },
    { id: "sh_gifts", category: "Shopping", name: "Gifts for family & friends 🎁", checked: false },
    { id: "sh_perfume", category: "Shopping", name: "Perfume 🌸", checked: false },
  ],

  apps: [
    { id: "app_booking", category: "Accommodation", name: "Booking.com", purpose: "Hotels" },
    { id: "app_agoda", category: "Accommodation", name: "Agoda", purpose: "Hotels" },
    { id: "app_airalo", category: "Internet", name: "Airalo", purpose: "eSIM" },
    { id: "app_grab", category: "Transport", name: "Grab", purpose: "Rides" },
    { id: "app_be", category: "Transport", name: "Be", purpose: "Rides" },
    { id: "app_klook", category: "Activities", name: "Klook", purpose: "Bookings" },
    { id: "app_gyg", category: "Activities", name: "GetYourGuide", purpose: "Backup" },
    { id: "app_foody", category: "Meals", name: "Foody", purpose: "Food discovery" },
    { id: "app_grabfood", category: "Meals", name: "GrabFood", purpose: "Delivery" },
    { id: "app_maps", category: "Maps", name: "Google Maps", purpose: "Navigation" },
    { id: "app_translate", category: "Language", name: "Google Translate", purpose: "Communication" },
  ],
};
```

- [ ] **Step 4: Run test + typecheck**

Run: `npm test` → Expected: PASS (all integrity checks).
Run: `npm run lint` → Expected: PASS.

> If the budget total assertion fails, recheck the `estimatedKes` figures sum to 629,250 (350000+80000+80000+50000+31920+20000+8700+5130+3500 = 629,250).

- [ ] **Step 5: Commit**

```bash
git add src/data/seedVietnamTrip.ts src/data/seedVietnamTrip.test.ts
git commit -m "feat: add transcribed Vietnam trip seed"
```

---

## Task 7: Store wiring (seed + toggles + persist v2)

**Files:**
- Modify: `src/store/useTripStore.ts`

**Interfaces:**
- Consumes: `VIETNAM_TRIP` from `@/data/seedVietnamTrip`; reducers from `@/store/tripReducers`.
- Produces on the store: `seeded: boolean`, `seedIfEmpty(): void`, `toggleDoc(tripId, docId): void`, `togglePack(tripId, list, itemId): void`, `setBudgetActual(tripId, itemId, actualKes?): void`, `updateTripRich(tripId, patch: Partial<Trip>): void`.

- [ ] **Step 1: Add imports**

In `src/store/useTripStore.ts`, update the imports block:

```ts
import type { Attraction, Trip, TripItem } from "@/types";
import { VIETNAM_TRIP } from "@/data/seedVietnamTrip";
import {
  setBudgetActualItem,
  toggleDocItem,
  togglePackItem,
} from "@/store/tripReducers";
```

- [ ] **Step 2: Extend the `TripState` interface**

Add these members to the `interface TripState { ... }` block:

```ts
  seeded: boolean;
  seedIfEmpty: () => void;
  toggleDoc: (tripId: string, docId: string) => void;
  togglePack: (tripId: string, list: "packing" | "shopping", itemId: string) => void;
  setBudgetActual: (tripId: string, itemId: string, actualKes: number | undefined) => void;
  updateTripRich: (tripId: string, patch: Partial<Trip>) => void;
```

- [ ] **Step 3: Implement the actions**

In the store creator, add `seeded: false,` next to `activeTripId: null,`, and add these actions (e.g. after `reorderCityItems`):

```ts
      seedIfEmpty: () =>
        set((s) => {
          if (s.seeded) return s;
          return {
            seeded: true,
            trips: [VIETNAM_TRIP, ...s.trips],
            activeTripId: s.activeTripId ?? VIETNAM_TRIP.id,
          };
        }),

      toggleDoc: (tripId, docId) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? toggleDocItem(t, docId) : t)),
        })),

      togglePack: (tripId, list, itemId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId ? togglePackItem(t, list, itemId) : t
          ),
        })),

      setBudgetActual: (tripId, itemId, actualKes) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId ? setBudgetActualItem(t, itemId, actualKes) : t
          ),
        })),

      updateTripRich: (tripId, patch) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? { ...t, ...patch } : t)),
        })),
```

- [ ] **Step 4: Bump persist version**

In the `persist(...)` options object (currently `{ name: "passgo-trips", storage: ... }`), add:

```ts
      version: 2,
      migrate: (persisted) => persisted as TripState,
```

(New fields are optional, so prior persisted trips need no transform; `seeded` defaults via the store creator if absent.)

- [ ] **Step 5: Typecheck**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/store/useTripStore.ts
git commit -m "feat: wire seed + toggle/edit actions into trip store"
```

---

## Task 8: Shared UI — CheckRow + ProgressBar

**Files:**
- Create: `src/components/trip/CheckRow.tsx`
- Create: `src/components/trip/ProgressBar.tsx`

**Interfaces:**
- Produces:
  - `CheckRow({ label, checked, onToggle, meta? }: { label: string; checked: boolean; onToggle: () => void; meta?: string })`
  - `ProgressBar({ pct, label? }: { pct: number; label?: string })` — `pct` 0–1.

- [ ] **Step 1: Create ProgressBar**

Create `src/components/trip/ProgressBar.tsx`:

```tsx
import { Text, View } from "react-native";

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View>
      {label ? (
        <Text className="mb-1 text-[11px] font-bold uppercase text-ink-400">
          {label}
        </Text>
      ) : null}
      <View className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <View
          className="h-2 rounded-full bg-brand-700"
          style={{ width: `${clamped * 100}%` }}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Create CheckRow**

Create `src/components/trip/CheckRow.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";

export function CheckRow({
  label,
  checked,
  onToggle,
  meta,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  meta?: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center py-2.5"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-md border ${
          checked ? "border-brand-700 bg-brand-700" : "border-ink-400 bg-surface"
        }`}
      >
        {checked ? <Icon name="check" size={13} color="#fff" /> : null}
      </View>
      <Text
        className={`ml-3 flex-1 text-[14px] ${
          checked ? "text-ink-400 line-through" : "text-ink-900"
        }`}
      >
        {label}
      </Text>
      {meta ? <Text className="ml-2 text-[12px] text-ink-500">{meta}</Text> : null}
    </Pressable>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run lint`
Expected: PASS.

> Note: `Icon name="check"` uses Feather icons (same set already used across the app, e.g. `check-square`). If `tsc` flags `"check"` as not in `IconName`, open `src/components/Icon.tsx` and confirm the allowed names; use `"check"` if present, otherwise `"check-circle"`.

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/CheckRow.tsx src/components/trip/ProgressBar.tsx
git commit -m "feat: add CheckRow + ProgressBar trip UI primitives"
```

---

## Task 9: TripHub shell + segmented switcher + PlanScreen branch

**Files:**
- Create: `src/components/trip/TripHub.tsx`
- Modify: `src/screens/PlanScreen.tsx`

**Interfaces:**
- Consumes: `useTripStore`, `getCountryByCode`, the modules from Tasks 10–14 (imported but each created in its own task — until then, render placeholders).
- Produces: `TripHub({ tripId }: { tripId: string })`.

- [ ] **Step 1: Create TripHub with placeholder module bodies**

Create `src/components/trip/TripHub.tsx`:

```tsx
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Pill } from "@/components/ui";
import { getCountryByCode } from "@/data/mockCountries";
import { useTripStore } from "@/store/useTripStore";

const MODULES = ["Overview", "Documents", "Itinerary", "Bookings", "Budget", "Packing"] as const;
type Module = (typeof MODULES)[number];

export function TripHub({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const [module, setModule] = useState<Module>("Overview");
  if (!trip) return null;
  const country = getCountryByCode(trip.countryCode);

  return (
    <View className="flex-1">
      <View className="px-4 pb-1">
        <Text className="text-[12px] font-bold uppercase text-ink-400">
          {country?.flag} {country?.name}
        </Text>
        <Text className="text-[22px] font-semibold text-ink-900">{trip.title}</Text>
      </View>

      <View style={{ height: 44 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}
        >
          {MODULES.map((m) => (
            <Pill key={m} label={m} active={m === module} onPress={() => setModule(m)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      >
        <Text className="text-ink-500">{module} — coming up in the next task.</Text>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Branch PlanScreen to TripHub for rich trips**

In `src/screens/PlanScreen.tsx`, add the import:

```tsx
import { TripHub } from "@/components/trip/TripHub";
```

Then replace the final render line `{active ? <TripEditor key={active.id} tripId={active.id} /> : null}` with:

```tsx
      {active ? (
        isRichTrip(active) ? (
          <TripHub key={active.id} tripId={active.id} />
        ) : (
          <TripEditor key={active.id} tripId={active.id} />
        )
      ) : null}
```

And add this helper near the bottom of the file (above `Header`):

```tsx
import type { Trip } from "@/types";

/** A trip carries companion data once any rich module is populated. */
function isRichTrip(t: Trip): boolean {
  return Boolean(
    t.documents?.length ||
      t.flights?.length ||
      t.schedule?.length ||
      t.budget?.length
  );
}
```

(If `Trip` is already imported in the file, merge the type into the existing import instead of adding a duplicate.)

- [ ] **Step 3: Typecheck + manual web check**

Run: `npm run lint` → Expected: PASS.
Run: `npm run web`, open the app, go to the **Plan** tab.
Expected: Vietnam trip shows the header (🇻🇳 Vietnam / "Vietnam 2026") and a scrollable pill row Overview…Packing; tapping pills swaps the "coming up" placeholder text. (Seed is wired in Task 15; if the trip is absent, temporarily verify by confirming the screen still renders the empty state without errors.)

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/TripHub.tsx src/screens/PlanScreen.tsx
git commit -m "feat: add TripHub shell + branch PlanScreen for rich trips"
```

---

## Task 10: Overview module

**Files:**
- Create: `src/components/trip/OverviewModule.tsx`
- Modify: `src/components/trip/TripHub.tsx`

**Interfaces:**
- Consumes: `Trip`, `docProgress`/`budgetTotals` from `@/utils/tripStats`, `kes`/`daysUntil` from `@/utils/format`.
- Produces: `OverviewModule({ trip }: { trip: Trip })`.

- [ ] **Step 1: Create OverviewModule**

Create `src/components/trip/OverviewModule.tsx`:

```tsx
import { Text, View } from "react-native";

import { Card, Stat } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { daysUntil, kes } from "@/utils/format";
import { budgetTotals, docProgress } from "@/utils/tripStats";
import type { Trip } from "@/types";

export function OverviewModule({ trip }: { trip: Trip }) {
  const days = daysUntil(trip.startDate);
  const docs = docProgress(trip.documents);
  const budget = budgetTotals(trip.budget);
  const countdown =
    days == null ? "—" : days > 0 ? `${days}d` : days === 0 ? "Today" : `${-days}d ago`;

  return (
    <View>
      <Card className="mb-3 p-4">
        {days != null && days >= 0 ? (
          <Text className="text-[13px] font-semibold text-ink-500">
            {days === 0 ? "Departure is today ✈️" : `${days} days to departure ✈️`}
          </Text>
        ) : null}
        <Text className="mt-1 text-[15px] font-semibold text-ink-900">
          {trip.overview?.areas ?? trip.accommodation ?? ""}
        </Text>
        <View className="mt-1 flex-row flex-wrap">
          {trip.startDate ? (
            <Meta icon="calendar" text={`${trip.startDate} → ${trip.endDate ?? ""}`} />
          ) : null}
          {trip.overview?.durationLabel ? (
            <Meta icon="clock" text={trip.overview.durationLabel} />
          ) : null}
          {trip.travelers?.length ? (
            <Meta icon="users" text={trip.travelers.join(" & ")} />
          ) : null}
          {trip.overview?.departure ? (
            <Meta icon="map-pin" text={`From ${trip.overview.departure}`} />
          ) : null}
        </View>
      </Card>

      <View className="mb-3 flex-row gap-2">
        <Stat value={countdown} label="Countdown" icon="calendar" />
        <Stat value={`${docs.done}/${docs.total}`} label="Documents" icon="check-square" />
        <Stat value={kes(budget.actual)} label="Spent" icon="credit-card" />
      </View>

      {trip.overview?.route?.length ? (
        <Card className="p-4">
          <Text className="mb-2 text-[12px] font-bold uppercase text-ink-400">Route</Text>
          {trip.overview.route.map((leg, i) => (
            <View key={i} className="flex-row items-start py-1">
              <Icon name="chevron-right" size={14} color={colors.ink[400]} />
              <Text className="ml-1.5 flex-1 text-[13.5px] text-ink-700">{leg}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

function Meta({ icon, text }: { icon: any; text: string }) {
  return (
    <View className="mr-3 mt-1.5 flex-row items-center">
      <Icon name={icon} size={13} color={colors.ink[500]} />
      <Text className="ml-1 text-[12.5px] text-ink-700">{text}</Text>
    </View>
  );
}
```

> If `tsc` flags any icon name (`clock`, `users`, `credit-card`, `chevron-right`), substitute a name confirmed in `src/components/Icon.tsx`.

- [ ] **Step 2: Render it in TripHub**

In `src/components/trip/TripHub.tsx`, add `import { OverviewModule } from "./OverviewModule";` and replace the placeholder `<Text>` body with a switch:

```tsx
        {module === "Overview" ? <OverviewModule trip={trip} /> : null}
        {module !== "Overview" ? (
          <Text className="text-ink-500">{module} — coming up.</Text>
        ) : null}
```

- [ ] **Step 3: Typecheck + manual web check**

Run: `npm run lint` → PASS.
Run app → Plan → Overview shows countdown, dates, travellers, doc count, spend, and the route list.

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/OverviewModule.tsx src/components/trip/TripHub.tsx
git commit -m "feat: add trip Overview module"
```

---

## Task 11: Documents module (the visa checklist)

**Files:**
- Create: `src/components/trip/DocumentsModule.tsx`
- Modify: `src/components/trip/TripHub.tsx`

**Interfaces:**
- Consumes: `useTripStore().toggleDoc`, `CheckRow`, `ProgressBar`, `docProgress`.
- Produces: `DocumentsModule({ tripId }: { tripId: string })`.

- [ ] **Step 1: Create DocumentsModule**

Create `src/components/trip/DocumentsModule.tsx`:

```tsx
import { Text, View } from "react-native";

import { Card } from "@/components/ui";
import { CheckRow } from "./CheckRow";
import { ProgressBar } from "./ProgressBar";
import { useTripStore } from "@/store/useTripStore";
import { docProgress } from "@/utils/tripStats";

export function DocumentsModule({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const toggleDoc = useTripStore((s) => s.toggleDoc);
  if (!trip) return null;
  const docs = trip.documents ?? [];
  const core = docs.filter((d) => d.folder === "core");
  const backup = docs.filter((d) => d.folder === "backup");
  const p = docProgress(docs);

  return (
    <View>
      <Card className="mb-3 p-4">
        <ProgressBar pct={p.pct} label={`Folder ready · ${p.done}/${p.total}`} />
      </Card>
      <Folder title="Core visa folder" tripId={tripId} items={core} toggle={toggleDoc} />
      <Folder title="Backup folder" tripId={tripId} items={backup} toggle={toggleDoc} />
    </View>
  );
}

function Folder({
  title,
  tripId,
  items,
  toggle,
}: {
  title: string;
  tripId: string;
  items: { id: string; label: string; checked: boolean }[];
  toggle: (tripId: string, docId: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <Card className="mb-3 px-4 py-2">
      <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">{title}</Text>
      {items.map((d) => (
        <CheckRow
          key={d.id}
          label={d.label}
          checked={d.checked}
          onToggle={() => toggle(tripId, d.id)}
        />
      ))}
    </Card>
  );
}
```

- [ ] **Step 2: Render it in TripHub**

Add `import { DocumentsModule } from "./DocumentsModule";` and add to the body switch:

```tsx
        {module === "Documents" ? <DocumentsModule tripId={tripId} /> : null}
```

Also remove `"Documents"` from the placeholder fallback (update the `module !== "Overview"` guard to also exclude `"Documents"`, or — cleaner — restructure to an explicit per-module conditional as each task lands). Simplest: change the fallback condition to `!["Overview", "Documents"].includes(module)`.

- [ ] **Step 3: Typecheck + manual web check**

Run: `npm run lint` → PASS.
Run app → Plan → Documents: two folders render, all 15 items pre-checked, progress shows 15/15; tapping an item unchecks it and the bar updates; reload the page → state persists.

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/DocumentsModule.tsx src/components/trip/TripHub.tsx
git commit -m "feat: add Documents (visa checklist) module"
```

---

## Task 12: Itinerary module

**Files:**
- Create: `src/components/trip/ItineraryModule.tsx`
- Modify: `src/components/trip/TripHub.tsx`

**Interfaces:**
- Consumes: `Trip`, `ItineraryDay`.
- Produces: `ItineraryModule({ trip }: { trip: Trip })`.

- [ ] **Step 1: Create ItineraryModule**

Create `src/components/trip/ItineraryModule.tsx`:

```tsx
import { Text, View } from "react-native";

import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import type { ItineraryDay, Trip } from "@/types";

export function ItineraryModule({ trip }: { trip: Trip }) {
  const days = trip.schedule ?? [];
  if (days.length === 0) {
    return <Text className="text-ink-500">No itinerary yet.</Text>;
  }
  return (
    <View>
      {days.map((day) => (
        <DayCard key={day.id} day={day} />
      ))}
    </View>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <Card className="mb-3 p-4">
      <Text className="text-[12px] font-bold uppercase text-ink-400">{day.date ?? ""}</Text>
      <Text className="mb-2 text-[16px] font-semibold text-ink-900">{day.location}</Text>

      {day.plan.map((line, i) => (
        <View key={i} className="flex-row items-start py-0.5">
          <Icon name="chevron-right" size={14} color={colors.ink[400]} />
          <Text className="ml-1.5 flex-1 text-[13.5px] text-ink-700">{line}</Text>
        </View>
      ))}

      {day.blocks?.map((b, i) => (
        <View key={i} className="mt-2 flex-row">
          <Text className="w-24 text-[12px] font-semibold text-ink-500">{b.time}</Text>
          <View className="flex-1">
            <Text className="text-[13.5px] text-ink-900">{b.activity}</Text>
            {b.area ? <Text className="text-[11.5px] text-ink-400">{b.area}</Text> : null}
          </View>
        </View>
      ))}

      {day.notes ? (
        <Text className="mt-2 rounded-xl bg-surface-muted px-3 py-2 text-[12.5px] text-ink-700">
          {day.notes}
        </Text>
      ) : null}
    </Card>
  );
}
```

- [ ] **Step 2: Render it in TripHub**

Add `import { ItineraryModule } from "./ItineraryModule";`, add `{module === "Itinerary" ? <ItineraryModule trip={trip} /> : null}`, and add `"Itinerary"` to the fallback exclusion list.

- [ ] **Step 3: Typecheck + manual web check**

Run: `npm run lint` → PASS.
Run app → Plan → Itinerary: seven day cards; 7 Jul shows time-blocks (Early morning…Night); notes render in grey boxes.

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/ItineraryModule.tsx src/components/trip/TripHub.tsx
git commit -m "feat: add Itinerary module"
```

---

## Task 13: Bookings module

**Files:**
- Create: `src/components/trip/BookingsModule.tsx`
- Modify: `src/components/trip/TripHub.tsx`

**Interfaces:**
- Consumes: `Trip`, `Flight`, `Stay`, `kes`, `Button`/`Tag`/`Card`, `Linking`.
- Produces: `BookingsModule({ trip }: { trip: Trip })`.

- [ ] **Step 1: Create BookingsModule**

Create `src/components/trip/BookingsModule.tsx`:

```tsx
import { Linking, Text, View } from "react-native";

import { Button, Card, Tag } from "@/components/ui";
import { kes } from "@/utils/format";
import type { Flight, Stay, Trip } from "@/types";

async function openLink(url?: string) {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    /* no-op: invalid link */
  }
}

export function BookingsModule({ trip }: { trip: Trip }) {
  const flights = trip.flights ?? [];
  const stays = trip.stays ?? [];
  return (
    <View>
      {flights.length ? (
        <Text className="mb-2 text-[12px] font-bold uppercase text-ink-400">Flights</Text>
      ) : null}
      {flights.map((f) => (
        <FlightCard key={f.id} f={f} />
      ))}

      {stays.length ? (
        <Text className="mb-2 mt-2 text-[12px] font-bold uppercase text-ink-400">Stays</Text>
      ) : null}
      {stays.map((s) => (
        <StayCard key={s.id} s={s} />
      ))}
    </View>
  );
}

function FlightCard({ f }: { f: Flight }) {
  return (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold text-ink-900">{f.airline}</Text>
        {f.status ? <Tag label={f.status} /> : null}
      </View>
      <Text className="mt-0.5 text-[13.5px] text-ink-700">{f.route}</Text>
      <Text className="mt-1 text-[12.5px] text-ink-500">
        {f.departDate ?? ""}
        {f.returnDate ? ` · returns ${f.returnDate}` : ""}
      </Text>
      {f.pricePpKes != null ? (
        <Text className="mt-1 text-[13px] font-semibold text-ink-900">
          {kes(f.pricePpKes)} pp
        </Text>
      ) : null}
    </Card>
  );
}

function StayCard({ s }: { s: Stay }) {
  return (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-ink-500">{s.location}</Text>
        {s.status ? <Tag label={s.status} /> : null}
      </View>
      <Text className="mt-0.5 text-[15px] font-semibold text-ink-900">{s.hotel}</Text>
      <Text className="mt-1 text-[12.5px] text-ink-500">
        {s.checkIn ?? ""} → {s.checkOut ?? ""}
        {s.nights ? ` · ${s.nights} nights` : ""}
      </Text>
      {s.notes ? <Text className="mt-1 text-[12.5px] text-ink-700">{s.notes}</Text> : null}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-ink-900">{kes(s.totalKes)}</Text>
        {s.link ? (
          <Button title="Open booking" variant="secondary" onPress={() => openLink(s.link)} />
        ) : null}
      </View>
    </Card>
  );
}
```

- [ ] **Step 2: Render it in TripHub**

Add `import { BookingsModule } from "./BookingsModule";`, add `{module === "Bookings" ? <BookingsModule trip={trip} /> : null}`, and add `"Bookings"` to the fallback exclusion list.

- [ ] **Step 3: Typecheck + manual web check**

Run: `npm run lint` → PASS.
Run app → Plan → Bookings: two flights (Qatar/VietJet, "Booked" tags, KES pp), two stays (Confirmed, KES totals); "Open booking" opens the trip.com URL in a new tab.

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/BookingsModule.tsx src/components/trip/TripHub.tsx
git commit -m "feat: add Bookings module"
```

---

## Task 14: Budget module

**Files:**
- Create: `src/components/trip/BudgetModule.tsx`
- Modify: `src/components/trip/TripHub.tsx`

**Interfaces:**
- Consumes: `useTripStore().setBudgetActual`, `budgetTotals`, `kes`, `ProgressBar`, `Tag`, `Card`.
- Produces: `BudgetModule({ tripId }: { tripId: string })`.

- [ ] **Step 1: Create BudgetModule**

Create `src/components/trip/BudgetModule.tsx`:

```tsx
import { Text, TextInput, View } from "react-native";

import { Card, Tag } from "@/components/ui";
import { ProgressBar } from "./ProgressBar";
import { useTripStore } from "@/store/useTripStore";
import { kes } from "@/utils/format";
import { budgetTotals } from "@/utils/tripStats";
import type { BudgetItem } from "@/types";

export function BudgetModule({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const setActual = useTripStore((s) => s.setBudgetActual);
  if (!trip) return null;
  const items = trip.budget ?? [];
  const totals = budgetTotals(items);

  return (
    <View>
      <Card className="mb-3 p-4">
        <ProgressBar pct={totals.pct} label="Spent vs estimated" />
        <View className="mt-3 flex-row justify-between">
          <Text className="text-[13px] text-ink-500">
            Actual <Text className="font-semibold text-ink-900">{kes(totals.actual)}</Text>
          </Text>
          <Text className="text-[13px] text-ink-500">
            Estimated <Text className="font-semibold text-ink-900">{kes(totals.estimated)}</Text>
          </Text>
        </View>
      </Card>

      <Card className="px-4 py-1">
        {items.map((b) => (
          <Row key={b.id} item={b} onActual={(v) => setActual(tripId, b.id, v)} />
        ))}
      </Card>
    </View>
  );
}

function Row({
  item,
  onActual,
}: {
  item: BudgetItem;
  onActual: (v: number | undefined) => void;
}) {
  return (
    <View className="flex-row items-center border-b border-surface-sunken py-3 last:border-b-0">
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-ink-900">{item.category}</Text>
        <View className="mt-0.5 flex-row items-center">
          <Text className="text-[11.5px] text-ink-400">Est {kes(item.estimatedKes)}</Text>
          {item.paidBy ? (
            <View className="ml-2">
              <Tag label={item.paidBy} />
            </View>
          ) : null}
        </View>
      </View>
      <TextInput
        defaultValue={item.actualKes != null ? String(Math.round(item.actualKes)) : ""}
        onChangeText={(t) => {
          const n = Number(t.replace(/[^0-9.]/g, ""));
          onActual(t.trim() === "" || Number.isNaN(n) ? undefined : n);
        }}
        keyboardType="numeric"
        placeholder="Actual"
        placeholderTextColor="#929292"
        className="w-24 rounded-xl border border-surface-sunken bg-surface px-2 py-2 text-right text-[13px] text-ink-900"
      />
    </View>
  );
}
```

- [ ] **Step 2: Render it in TripHub**

Add `import { BudgetModule } from "./BudgetModule";`, add `{module === "Budget" ? <BudgetModule tripId={tripId} /> : null}`, and add `"Budget"` to the fallback exclusion list.

- [ ] **Step 3: Typecheck + manual web check**

Run: `npm run lint` → PASS.
Run app → Plan → Budget: rows with estimates + paidBy tags; header shows Actual ≈ KES 383,331 / Estimated KES 629,250; typing an actual updates the bar; clearing the field resets it; reload persists.

- [ ] **Step 4: Commit**

```bash
git add src/components/trip/BudgetModule.tsx src/components/trip/TripHub.tsx
git commit -m "feat: add Budget module"
```

---

## Task 15: Packing module + seed wiring + full verification

**Files:**
- Create: `src/components/trip/PackingModule.tsx`
- Modify: `src/components/trip/TripHub.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `useTripStore().togglePack`, `seedIfEmpty`, `CheckRow`, `packProgress`.
- Produces: `PackingModule({ tripId }: { tripId: string })`.

- [ ] **Step 1: Create PackingModule (Packing/Carry-on/Prep + Shopping + Apps)**

Create `src/components/trip/PackingModule.tsx`:

```tsx
import { Linking, Text, View } from "react-native";

import { Card } from "@/components/ui";
import { CheckRow } from "./CheckRow";
import { ProgressBar } from "./ProgressBar";
import { useTripStore } from "@/store/useTripStore";
import { packProgress } from "@/utils/tripStats";
import type { PackItem } from "@/types";

function groupByCategory(items: PackItem[]): [string, PackItem[]][] {
  const map = new Map<string, PackItem[]>();
  for (const it of items) {
    const arr = map.get(it.category) ?? [];
    arr.push(it);
    map.set(it.category, arr);
  }
  return [...map.entries()];
}

export function PackingModule({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const togglePack = useTripStore((s) => s.togglePack);
  if (!trip) return null;

  const packing = trip.packing ?? [];
  const shopping = trip.shopping ?? [];
  const apps = trip.apps ?? [];
  const p = packProgress(packing);

  return (
    <View>
      <Card className="mb-3 p-4">
        <ProgressBar pct={p.pct} label={`Packed · ${p.done}/${p.total}`} />
      </Card>

      {groupByCategory(packing).map(([category, items]) => (
        <Card key={category} className="mb-3 px-4 py-2">
          <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">{category}</Text>
          {items.map((it) => (
            <CheckRow
              key={it.id}
              label={it.name}
              meta={it.qty ?? it.date}
              checked={it.checked}
              onToggle={() => togglePack(tripId, "packing", it.id)}
            />
          ))}
        </Card>
      ))}

      {shopping.length ? (
        <Card className="mb-3 px-4 py-2">
          <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">
            Shopping wishlist
          </Text>
          {shopping.map((it) => (
            <CheckRow
              key={it.id}
              label={it.name}
              meta={it.qty}
              checked={it.checked}
              onToggle={() => togglePack(tripId, "shopping", it.id)}
            />
          ))}
        </Card>
      ) : null}

      {apps.length ? (
        <Card className="mb-3 px-4 py-2">
          <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">Useful apps</Text>
          {apps.map((a) => (
            <View key={a.id} className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-[14px] font-semibold text-ink-900">{a.name}</Text>
                <Text className="text-[11.5px] text-ink-400">
                  {a.category}
                  {a.purpose ? ` · ${a.purpose}` : ""}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}
```

(`Linking` import kept for parity with other modules; remove if `tsc` flags it as unused — `tsc --noEmit` with the project's settings does not error on unused imports by default, but drop it if a lint step is added later.)

> Simpler: since `Linking` is not used here, omit its import. Final import line: `import { Text, View } from "react-native";`.

- [ ] **Step 2: Render it in TripHub and remove the placeholder fallback**

Add `import { PackingModule } from "./PackingModule";`, add `{module === "Packing" ? <PackingModule tripId={tripId} /> : null}`, and now that all six modules exist, **delete the placeholder fallback `<Text>` block entirely**. The body should be six clean conditionals:

```tsx
        {module === "Overview" ? <OverviewModule trip={trip} /> : null}
        {module === "Documents" ? <DocumentsModule tripId={tripId} /> : null}
        {module === "Itinerary" ? <ItineraryModule trip={trip} /> : null}
        {module === "Bookings" ? <BookingsModule trip={trip} /> : null}
        {module === "Budget" ? <BudgetModule tripId={tripId} /> : null}
        {module === "Packing" ? <PackingModule tripId={tripId} /> : null}
```

- [ ] **Step 3: Seed on app start**

In `App.tsx`, import the store and call `seedIfEmpty()` once on mount. Add near the top:

```tsx
import { useEffect } from "react";
import { useTripStore } from "@/store/useTripStore";
```

Inside `export default function App() {`, before the `return`:

```tsx
  useEffect(() => {
    useTripStore.getState().seedIfEmpty();
  }, []);
```

> The store is `persist`-backed; calling `seedIfEmpty` after mount runs once hydration has occurred for web/native. The `seeded` flag guards against double-seeding across reloads.

- [ ] **Step 4: Full verification**

```bash
npm test            # all vitest suites green
npm run lint        # tsc --noEmit clean
npm run web         # manual walkthrough
```

Manual checklist (Plan tab, fresh browser profile or cleared storage):
- Overview: countdown to 1 Jul 2026, travellers "Mbeche & Cyn", route list.
- Documents: 2 folders, 15/15 checked; toggling persists across reload.
- Itinerary: 7 day cards incl. time-blocked 7 Jul.
- Bookings: 2 flights + 2 stays; "Open booking" works.
- Budget: header ≈ KES 383,331 / 629,250; editing an actual updates the bar + persists.
- Packing: category sections + Carry-on (pre-checked) + Pre-trip prep (with dates) + Shopping + Useful apps; toggling persists.
- Discover tab: Vietnam 🇻🇳 appears in the country list.

- [ ] **Step 5: Commit**

```bash
git add src/components/trip/PackingModule.tsx src/components/trip/TripHub.tsx App.tsx
git commit -m "feat: add Packing module + seed Vietnam trip on launch"
```

---

## Self-Review

**Spec coverage:**
- Visa & Documents → Task 11 ✓ · Bookings → Task 13 ✓ · Itinerary → Task 12 ✓ · Budget → Task 14 ✓ · Packing/Carry-on/Shopping/Apps/Prep → Tasks 6 (seed) + 15 ✓ · Overview + countdown → Task 10 ✓ · Vietnam reference data → Task 5 ✓ · Data model → Task 2 ✓ · Store + persist + seed-once → Task 7 + 15 ✓ · KES formatting → Task 1 ✓ · Editable (toggles/actuals) → Tasks 4/7/11/14/15 ✓.
- Out-of-scope items (importer, accounts, USD, paywall gating) correctly have no tasks.

**Placeholder scan:** No "TBD/TODO/handle edge cases". The only intentional placeholders are the temporary TripHub fallback text (introduced Task 9, removed Task 15) — explicitly tracked.

**Type consistency:** `toggleDoc`/`togglePack`/`setBudgetActual`/`updateTripRich`/`seedIfEmpty`/`seeded` names match across Tasks 4, 7, 11, 14, 15. Stat helper return shape `{done,total,pct}` and `{estimated,actual,pct}` used consistently in Tasks 3, 10, 11, 14. `PackItem`/`DocItem`/`BudgetItem` fields match the seed in Task 6. `list: "packing" | "shopping"` consistent in reducer (Task 4), store (Task 7), and module (Task 15).

**Known follow-ups (not blockers):** the `repository.ts` read-through cache stores `MOCK_COUNTRIES` in AsyncStorage on first read; a returning user with a pre-existing `countries` cache key won't see Vietnam until cache clears. Fresh installs are unaffected. If needed, bump the cache key — out of scope for this plan.
