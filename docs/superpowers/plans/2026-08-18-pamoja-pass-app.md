# PAMOJA Pass Fan App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace PassGo with Pamoja — the fan mobile app for the PAMOJA Pass at AFCON 2027 — with four tabs, a working redemption record loop, and mock data behind the existing repository seam.

**Architecture:** The repo keeps its shape (`screens/ components/ data/ store/ lib/ utils/ navigation/ types/`) and its infrastructure; the PassGo domain is deleted and replaced. Three Zustand stores map to the proposal's three credential layers — `usePassStore` (identity + entitlement), `useRecordStore` (the append-only event log, the sole writer of lines), `usePartnerStore` (the partner network). Every headline figure is derived from data, never stored. All time reads go through one clock seam pinned to a demo date.

**Tech Stack:** Expo 51, React Native 0.74, TypeScript (strict), NativeWind 4 / Tailwind 3, Zustand 4 + AsyncStorage persist, React Navigation 6, react-native-maps, Vitest 2.

**Spec:** `docs/superpowers/specs/2026-08-18-pamoja-pass-app-design.md`

## Global Constraints

- **Never hold funds.** The app applies a discount and records a purchase; it is not a checkout. No payment provider, no card capture, no balance. Confirm screens must state that payment happens separately via M-Pesa, Airtel Money or card.
- **`useRecordStore` is the only writer of `PassEvent`s.** No other store or screen appends lines.
- **No `Date.now()`, no bare `new Date()`** outside `src/lib/clock.ts`. Every time read goes through `now()`.
- **Demo clock:** `2027-06-23T12:55:00+03:00` (Wednesday, EAT). Tournament window `2027-06-19` → `2027-07-17`.
- **Partner counts are exact and derived:** Stay 210 · Move 84 · Eat 1,340 · Shop 460 · Do 95 = **2,189**. Never display a hardcoded total.
- **Two hues only.** `deep #04222b`, `accent #0e6ba8`. No per-category colors.
- **Copy verbatim from the proposal** where it appears: `VALID IN ALL THREE COUNTRIES`, `YOU'VE SAVED`, `OFFERS NEAR YOU`, `COMING UP`, `NEAR YOU`, `2,189 PARTNER BUSINESSES`, `Valid · 24 days left`.
- **Kenya only.** `HostCountry` is `"KE" | "UG" | "TZ"` but only `KE` has seeded content.
- **English only**, all user-facing strings in `src/lib/strings.ts` from Task 14 onward.
- **No paywall, no premium, no RevenueCat, no family passes, no camera.**
- Lint is `npm run lint` (`tsc --noEmit`). Tests are `npm test` (`vitest run`). Both must pass before every commit.

---

## File Structure

**Deleted (PassGo domain):**
`src/screens/{Discover,CountryDetail,Plan,Paywall,Premium,Onboarding}Screen.tsx`,
`src/components/{CountryCard,AttractionCard,CityGroup,VisaBadge,PremiumLock}.tsx`,
`src/components/trip/` (all 9 files),
`src/data/{mockCountries,mockCities,mockAttractions,mockPrep,mockVisaRules,passports,seedVietnamTrip,vietnam.test,seedVietnamTrip.test}.ts`,
`src/store/{useAppStore,useTripStore,tripReducers,tripReducers.test}.ts`,
`src/lib/revenuecat.ts`,
`src/utils/{tripStats,tripStats.test}.ts`.

**Kept unchanged:** `App.tsx`, `src/lib/storage.ts` (key prefix updated), `src/components/{Screen,Icon,AppImage,SkeletonCard,FilterBar}.tsx`, `src/components/ui/index.tsx` (restyled), `src/components/mapRoute.tsx`, `src/data/images.ts`, `metro.config.js`, `babel.config.js`, `vitest.config.ts`, `tsconfig.json`.

**Renamed:** `src/components/PassGoMap.tsx` → `PamojaMap.tsx`, `PassGoMap.web.tsx` → `PamojaMap.web.tsx`.

**Created:**

| File | Responsibility |
| --- | --- |
| `src/lib/clock.ts` | the single time seam; demo date |
| `src/lib/strings.ts` | all user-facing copy (Task 14) |
| `src/types/index.ts` | rewritten: the whole domain model |
| `src/utils/pass.ts` | validity, days left, status |
| `src/utils/record.ts` | savings, grouping, line formatting, border flag |
| `src/utils/redeem.ts` | discount arithmetic, event construction |
| `src/utils/partners.ts` | counts, category filter, nearby, short-code lookup |
| `src/utils/entitlements.ts` | entitlements for a country |
| `src/utils/match.ts` | next match from the clock |
| `src/data/partners.ts` | deterministic 2,189-partner generator + named partners |
| `src/data/explore.ts` | fan zones, events, places |
| `src/data/matches.ts` | the fixture list |
| `src/data/entitlements.ts` | seeded entitlements |
| `src/data/repository.ts` | rewritten: the one UI↔data seam |
| `src/store/usePassStore.ts` | identity + entitlement |
| `src/store/useRecordStore.ts` | the append-only record |
| `src/store/usePartnerStore.ts` | the partner network |
| `src/components/pamoja/PassCard.tsx` | the `#04222b` credential card |
| `src/components/pamoja/Eyebrow.tsx` | uppercase mono section label |
| `src/components/pamoja/RecordLine.tsx` | one line of the record |
| `src/components/pamoja/CategoryTile.tsx` | Services tile with derived count |
| `src/components/pamoja/OfferRow.tsx` | `Mama Oliech −15%` |
| `src/screens/IssuanceScreen.tsx` | apply → carry |
| `src/screens/HomeScreen.tsx` | today, savings, offers |
| `src/screens/ExploreScreen.tsx` | events / places / fan zones |
| `src/screens/ServicesScreen.tsx` | five categories |
| `src/screens/CategoryScreen.tsx` | partners in a category |
| `src/screens/PartnerScreen.tsx` | partner detail + redeem entry |
| `src/screens/PassScreen.tsx` | the card + entitlements |
| `src/screens/WalletScreen.tsx` | the record |
| `src/screens/ScanScreen.tsx` | step 1 of redemption |
| `src/screens/ConfirmScreen.tsx` | step 2 of redemption |

---

### Task 1: Clear the ground and rebrand the shell

Delete the PassGo domain, install the Pamoja design tokens, and leave the app booting on four placeholder tabs. Nothing in this task is Pamoja *behaviour* — it exists so every later task starts from a clean, compiling tree.

**Files:**
- Delete: the 25 files listed under "Deleted" in File Structure
- Rename: `src/components/PassGoMap.tsx` → `src/components/PamojaMap.tsx`, `src/components/PassGoMap.web.tsx` → `src/components/PamojaMap.web.tsx`
- Modify: `app.json`, `tailwind.config.js`, `src/lib/theme.ts`, `src/lib/storage.ts:33`, `src/utils/format.ts`, `src/utils/format.test.ts`, `src/types/index.ts`, `src/navigation/{types,TabNavigator,RootNavigator}.tsx`, `package.json`, `DESIGN.md`, `README.md`
- Create: `src/screens/{Home,Explore,Services,Pass}Screen.tsx` (placeholders)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: Tailwind tokens `deep`, `deep-soft`, `accent`, `ink`, `body`, `mute`, `faint`, `hairline`, `panel`, `surface`, `canvas`; `colors` export from `@/lib/theme` with the same keys; `TabParamList = { Home: undefined; Explore: undefined; Services: undefined; Pass: undefined }`

- [ ] **Step 1: Delete the PassGo domain**

```bash
cd /home/mbeche/Documents/projects/2026/PassGo
git rm -q src/screens/DiscoverScreen.tsx src/screens/CountryDetailScreen.tsx \
  src/screens/PlanScreen.tsx src/screens/PaywallScreen.tsx \
  src/screens/PremiumScreen.tsx src/screens/OnboardingScreen.tsx \
  src/components/CountryCard.tsx src/components/AttractionCard.tsx \
  src/components/CityGroup.tsx src/components/VisaBadge.tsx \
  src/components/PremiumLock.tsx
git rm -q -r src/components/trip
git rm -q src/data/mockCountries.ts src/data/mockCities.ts \
  src/data/mockAttractions.ts src/data/mockPrep.ts src/data/mockVisaRules.ts \
  src/data/passports.ts src/data/seedVietnamTrip.ts \
  src/data/seedVietnamTrip.test.ts src/data/vietnam.test.ts
git rm -q src/store/useAppStore.ts src/store/useTripStore.ts \
  src/store/tripReducers.ts src/store/tripReducers.test.ts
git rm -q src/lib/revenuecat.ts src/utils/tripStats.ts src/utils/tripStats.test.ts
git mv src/components/PassGoMap.tsx src/components/PamojaMap.tsx
git mv src/components/PassGoMap.web.tsx src/components/PamojaMap.web.tsx
```

- [ ] **Step 2: Replace the theme tokens**

Replace the whole `colors` block in `tailwind.config.js` (keep `content`, `presets`, `darkMode`, `plugins` as they are):

```js
      colors: {
        // Sampled from the PAMOJA proposal artwork (Figures 1 and 3). Two hues only.
        deep: { DEFAULT: "#04222b", soft: "#223c44" }, // Pass card / dark surfaces
        accent: { DEFAULT: "#0e6ba8" },                 // the single blue
        ink: { DEFAULT: "#16181a", 900: "#16181a", 800: "#2b2d2f" },
        body: { DEFAULT: "#545557" },
        mute: { DEFAULT: "#676869" },
        faint: { DEFAULT: "#acadae" },
        hairline: { DEFAULT: "#dde3e4" },
        panel: { DEFAULT: "#eef0f0" },
        surface: { DEFAULT: "#f5f8f8" },
        canvas: { DEFAULT: "#ffffff" },
      },
      borderRadius: { card: "10px" },
```

- [ ] **Step 3: Replace `src/lib/theme.ts`**

Delete the file's entire contents and replace with:

```ts
// Central palette — kept in sync with tailwind.config.js. Used where raw color
// values are needed (maps, icons, shadows) outside of className.
// Sampled from the PAMOJA proposal artwork; exactly two hues.
export const colors = {
  deep: "#04222b",
  deepSoft: "#223c44",
  accent: "#0e6ba8",
  ink: "#16181a",
  inkSoft: "#2b2d2f",
  body: "#545557",
  mute: "#676869",
  faint: "#acadae",
  hairline: "#dde3e4",
  panel: "#eef0f0",
  surface: "#f5f8f8",
  canvas: "#ffffff",
} as const;
```

- [ ] **Step 4: Trim `src/utils/format.ts` to what survives**

Delete `usd`, `processing`, `visaBadgeText`, `budgetLabel`, `visaDetailLine`, `visaIconName` and the `VisaRule` / `VISA_META` imports. Keep exactly `distanceKm`, `km`, `kes`, `daysUntil` with their current bodies. The file should now import nothing.

- [ ] **Step 5: Trim `src/utils/format.test.ts` to match**

The file currently holds exactly two `describe` blocks — `kes` and `daysUntil` — and both cover functions that survive. So no test deletions are needed; only fix the import line if it names a removed symbol. Verify with `grep -n '^describe' src/utils/format.test.ts` before changing anything.

- [ ] **Step 6: Empty the domain types**

Replace all of `src/types/index.ts` with a placeholder — Task 2 fills it in:

```ts
// Domain model — filled in by Task 2.
export {};
```

- [ ] **Step 7: Update the storage key prefix**

In `src/lib/storage.ts`, change the last line:

```ts
export const cacheKey = (name: string) => `pamoja:cache:${name}`;
```

- [ ] **Step 8: Four placeholder screens**

Create each of `src/screens/HomeScreen.tsx`, `ExploreScreen.tsx`, `ServicesScreen.tsx`, `PassScreen.tsx` with the same shape, substituting the name:

```tsx
import { Text, View } from "react-native";

import { Screen } from "@/components/Screen";

export function HomeScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-ink">Home</Text>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 9: Rewrite the navigation**

`src/navigation/types.ts`:

```ts
export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Services: undefined;
  Pass: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
};
```

`src/navigation/TabNavigator.tsx` — keep the existing structure and styling approach, changing only the routes, icons and colors:

```tsx
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { HomeScreen } from "@/screens/HomeScreen";
import { ExploreScreen } from "@/screens/ExploreScreen";
import { ServicesScreen } from "@/screens/ServicesScreen";
import { PassScreen } from "@/screens/PassScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, IconName> = {
  Home: "home",
  Explore: "compass",
  Services: "grid",
  Pass: "credit-card",
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 6 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          borderTopColor: colors.hairline,
          backgroundColor: colors.canvas,
        },
        tabBarIcon: ({ color }) => (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Icon name={ICONS[route.name]} size={21} color={color} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Pass" component={PassScreen} />
    </Tab.Navigator>
  );
}
```

Then open `src/navigation/RootNavigator.tsx` and reduce it to a stack with a single `Tabs` screen rendering `TabNavigator`, deleting every import of a removed screen. Task 8 reintroduces gating and modals.

- [ ] **Step 10: Rebrand `app.json`**

Set `expo.name` to `"Pamoja"`, `expo.slug` to `"pamoja"`, `expo.scheme` to `"pamoja"`, `expo.ios.bundleIdentifier` to `"com.uratibu.pamoja"`, `expo.android.package` to `"com.uratibu.pamoja"`, and `expo.android.adaptiveIcon.backgroundColor` to `"#04222b"`. Delete the `expo.extra.revenueCatApiKey` entry (leave `extra` present but empty if nothing else is in it).

- [ ] **Step 11: Drop the paywall dependency**

```bash
npm pkg set name=pamoja
```

Then check whether `react-native-purchases` appears in `package.json` dependencies; if so, `npm uninstall react-native-purchases`. (It is expected to be absent — the paywall was a placeholder — in which case do nothing.)

- [ ] **Step 12: Replace `DESIGN.md`**

Replace the whole file with the Pamoja system — the palette table and typography notes from the spec's "Design system" section, under a `# Pamoja Design System` heading. Copy the hex values exactly.

- [ ] **Step 13: Update `README.md`**

Rewrite the title and the opening description for Pamoja: what the PAMOJA Pass is, the four tabs, that it runs on mock data, and the demo-clock date. Delete the "Demo the Premium flow" section and every reference to passports, visas, Discover, trips or RevenueCat.

- [ ] **Step 14: Verify the tree compiles and tests pass**

Run: `npm run lint && npm test`
Expected: `tsc` reports no errors; vitest passes with only the trimmed `format.test.ts` suite.

If `tsc` reports an unresolved import, it is a file that referenced something deleted in Step 1 — fix it by deleting the reference, not by restoring the file.

- [ ] **Step 15: Verify the app boots**

Run: `npm run web`
Expected: the app loads and shows four tabs — Home, Explore, Services, Pass — with the blue active tint.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "refactor: strip PassGo domain, install Pamoja shell and tokens"
```

---

### Task 2: The domain model and the clock

The single time seam, and the types every later task depends on.

**Files:**
- Create: `src/lib/clock.ts`, `src/lib/clock.test.ts`, `src/utils/pass.ts`, `src/utils/pass.test.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `daysUntil` from `@/utils/format`
- Produces:
  - `@/lib/clock`: `DEMO_NOW: Date`, `now(): Date`, `setUseRealTime(v: boolean): void`, `isRealTime(): boolean`, `TOURNAMENT_START: string`, `TOURNAMENT_END: string`
  - `@/types`: `HostCountry`, `PassTier`, `PassStatus`, `Pass`, `EntitlementKind`, `Entitlement`, `EventKind`, `Channel`, `Money`, `Place`, `PassEvent`, `PartnerCategory`, `Partner`, `ExploreKind`, `ExploreItem`, `Match`
  - `@/utils/pass`: `daysLeft(pass, now): number`, `passStatus(pass, now): PassStatus`, `validityLabel(pass, now): string`

- [ ] **Step 1: Write the domain types**

Replace all of `src/types/index.ts`:

```ts
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
  at: string; // ISO
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
  kickoff: string; // ISO
  venue: string;
  city: string;
  country: HostCountry;
}
```

- [ ] **Step 2: Write the failing clock test**

Create `src/lib/clock.test.ts`:

```ts
import { describe, expect, it, beforeEach } from "vitest";
import {
  DEMO_NOW,
  now,
  setUseRealTime,
  isRealTime,
  TOURNAMENT_START,
  TOURNAMENT_END,
} from "@/lib/clock";
import { daysUntil } from "@/utils/format";

beforeEach(() => setUseRealTime(false));

describe("the demo clock", () => {
  it("is pinned to Wednesday 2027-06-23 at 12:55 EAT", () => {
    expect(DEMO_NOW.toISOString()).toBe("2027-06-23T09:55:00.000Z");
    // 12:55 EAT === 09:55 UTC, and 2027-06-23 is a Wednesday.
    expect(DEMO_NOW.getUTCDay()).toBe(3);
  });

  it("leaves exactly 24 days of validity — the figure in Figure 3", () => {
    expect(daysUntil(TOURNAMENT_END, DEMO_NOW)).toBe(24);
  });

  it("sits inside the tournament window", () => {
    expect(new Date(TOURNAMENT_START).getTime()).toBeLessThan(DEMO_NOW.getTime());
    expect(new Date(TOURNAMENT_END).getTime()).toBeGreaterThan(DEMO_NOW.getTime());
  });

  it("returns the demo date by default", () => {
    expect(now().toISOString()).toBe(DEMO_NOW.toISOString());
    expect(isRealTime()).toBe(false);
  });

  it("returns real time once switched", () => {
    setUseRealTime(true);
    expect(isRealTime()).toBe(true);
    expect(now().getTime()).not.toBe(DEMO_NOW.getTime());
  });
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npx vitest run src/lib/clock.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/clock"`.

- [ ] **Step 4: Implement the clock**

Create `src/lib/clock.ts`:

```ts
// The single time seam. The tournament is in June 2027 but the app is built and
// demoed before then, so every date-derived display reads through `now()`.
//
// The demo date is not arbitrary — it is the only instant at which all of the
// proposal's own figures are simultaneously true:
//   · 24 days left to 2027-07-17          → 2027-06-23   (Figure 3)
//   · "Kasarani ward · 12:55 · Wednesday" → 2027-06-23 is a Wednesday (Figure 4)
//   · next fixture "Sat 16:00"            → 2027-06-26
//
// Nothing outside this file may call Date.now() or `new Date()` with no argument.

export const TOURNAMENT_START = "2027-06-19";
export const TOURNAMENT_END = "2027-07-17";

/** Wednesday 23 June 2027, 12:55 EAT (UTC+3). */
export const DEMO_NOW = new Date("2027-06-23T12:55:00+03:00");

let realTime = false;

export function setUseRealTime(value: boolean): void {
  realTime = value;
}

export function isRealTime(): boolean {
  return realTime;
}

export function now(): Date {
  return realTime ? new Date() : new Date(DEMO_NOW.getTime());
}
```

- [ ] **Step 5: Run the clock test — it should pass**

Run: `npx vitest run src/lib/clock.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Write the failing validity test**

Create `src/utils/pass.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { daysLeft, passStatus, validityLabel } from "@/utils/pass";
import { DEMO_NOW } from "@/lib/clock";
import type { Pass } from "@/types";

const pass: Pass = {
  id: "KE-PM-8842",
  holderName: "Amina Nakato",
  tier: "fan",
  issuedIn: "KE",
  validFrom: "2027-06-19",
  validUntil: "2027-07-17",
  shortCode: "KE-PM-8842",
  status: "active",
};

describe("daysLeft", () => {
  it("is 24 at the demo clock — the figure printed in Figure 3", () => {
    expect(daysLeft(pass, DEMO_NOW)).toBe(24);
  });

  it("is 0 on the final day", () => {
    expect(daysLeft(pass, new Date("2027-07-17T09:00:00Z"))).toBe(0);
  });

  it("never goes below 0 once expired", () => {
    expect(daysLeft(pass, new Date("2027-08-01T09:00:00Z"))).toBe(0);
  });
});

describe("passStatus", () => {
  it("is active inside the window", () => {
    expect(passStatus(pass, DEMO_NOW)).toBe("active");
  });

  it("is expired after the window", () => {
    expect(passStatus(pass, new Date("2027-08-01T09:00:00Z"))).toBe("expired");
  });

  it("respects a suspended pass regardless of dates", () => {
    expect(passStatus({ ...pass, status: "suspended" }, DEMO_NOW)).toBe("suspended");
  });
});

describe("validityLabel", () => {
  it("reads exactly as the card does", () => {
    expect(validityLabel(pass, DEMO_NOW)).toBe("Valid · 24 days left");
  });

  it("singularises the last day", () => {
    expect(validityLabel(pass, new Date("2027-07-16T09:00:00Z"))).toBe(
      "Valid · 1 day left"
    );
  });

  it("says so when the pass is spent", () => {
    expect(validityLabel(pass, new Date("2027-08-01T09:00:00Z"))).toBe("Expired");
  });

  it("says so when the pass is suspended", () => {
    expect(validityLabel({ ...pass, status: "suspended" }, DEMO_NOW)).toBe(
      "Suspended"
    );
  });
});
```

- [ ] **Step 7: Run it to make sure it fails**

Run: `npx vitest run src/utils/pass.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/pass"`.

- [ ] **Step 8: Implement the validity helpers**

Create `src/utils/pass.ts`:

```ts
import type { Pass, PassStatus } from "@/types";
import { daysUntil } from "@/utils/format";

/** Whole days remaining on the Pass. Never negative. */
export function daysLeft(pass: Pass, at: Date): number {
  const d = daysUntil(pass.validUntil, at);
  return d == null || d < 0 ? 0 : d;
}

/** A suspended Pass stays suspended; otherwise the window decides. */
export function passStatus(pass: Pass, at: Date): PassStatus {
  if (pass.status === "suspended") return "suspended";
  const start = new Date(pass.validFrom).getTime();
  const end = new Date(pass.validUntil).getTime() + 86_400_000; // inclusive
  const t = at.getTime();
  return t >= start && t < end ? "active" : "expired";
}

/** The line printed on the card: "Valid · 24 days left". */
export function validityLabel(pass: Pass, at: Date): string {
  const status = passStatus(pass, at);
  if (status === "suspended") return "Suspended";
  if (status === "expired") return "Expired";
  const days = daysLeft(pass, at);
  return `Valid · ${days} ${days === 1 ? "day" : "days"} left`;
}
```

- [ ] **Step 9: Run the tests — both suites should pass**

Run: `npm test`
Expected: PASS — `format`, `clock` and `pass` suites all green.

- [ ] **Step 10: Verify types compile**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add src/types/index.ts src/lib/clock.ts src/lib/clock.test.ts \
  src/utils/pass.ts src/utils/pass.test.ts
git commit -m "feat: add Pamoja domain model, demo clock and Pass validity"
```

---

### Task 3: The record — the append-only log

The heart of the proposal: every use writes one line, and nothing else may write one.

**Files:**
- Create: `src/store/useRecordStore.ts`, `src/utils/record.ts`, `src/utils/record.test.ts`
- Test: `src/utils/record.test.ts`

**Interfaces:**
- Consumes: `PassEvent`, `Money` from `@/types`; `kes` from `@/utils/format`
- Produces:
  - `@/utils/record`: `totalSaved(events): number`, `totalSpent(events): number`, `hasBorderEvent(events): boolean`, `recordLine(e): { primary: string; secondary: string }`, `groupByDay(events): DayGroup[]`, `type DayGroup = { day: string; events: PassEvent[] }`
  - `@/store/useRecordStore`: `useRecordStore` with `{ events: PassEvent[]; hydrated: boolean; append(e: PassEvent): void; ingestShortCode(e: PassEvent): void; clear(): void }`

- [ ] **Step 1: Write the failing record test**

Create `src/utils/record.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  totalSaved,
  totalSpent,
  hasBorderEvent,
  recordLine,
  groupByDay,
} from "@/utils/record";
import type { PassEvent } from "@/types";

const lunch: PassEvent = {
  id: "e1",
  passId: "KE-PM-8842",
  kind: "purchase",
  at: "2027-06-23T12:55:00+03:00",
  place: { name: "Mama Oliech", ward: "Kasarani ward", city: "Nairobi", country: "KE" },
  channel: "qr",
  partnerId: "p-mama-oliech",
  amount: { currency: "KES", gross: 1000, discount: 150, net: 850 },
};

const bus: PassEvent = {
  id: "e2",
  passId: "KE-PM-8842",
  kind: "transport",
  at: "2027-06-22T14:20:00+03:00",
  place: { name: "Kenya Bus", ward: "Westlands ward", city: "Nairobi", country: "KE" },
  channel: "nfc",
  partnerId: "p-kenya-bus",
  amount: { currency: "KES", gross: 200, discount: 40, net: 160 },
};

const border: PassEvent = {
  id: "e3",
  passId: "KE-PM-8842",
  kind: "border",
  at: "2027-06-22T06:40:00+03:00",
  place: { name: "Malaba", city: "Malaba", country: "KE" },
  channel: "nfc",
};

describe("totalSaved", () => {
  it("sums the discount across the record", () => {
    expect(totalSaved([lunch, bus])).toBe(190);
  });
  it("ignores events with no money", () => {
    expect(totalSaved([lunch, border])).toBe(150);
  });
  it("is 0 for a fresh Pass", () => {
    expect(totalSaved([])).toBe(0);
  });
});

describe("totalSpent", () => {
  it("sums what was actually paid, not the gross", () => {
    expect(totalSpent([lunch, bus])).toBe(1010);
  });
});

describe("hasBorderEvent", () => {
  it("is true once the fan has crossed", () => {
    expect(hasBorderEvent([bus, border])).toBe(true);
  });
  it("is false for a fan who lives here", () => {
    expect(hasBorderEvent([lunch, bus])).toBe(false);
  });
});

describe("recordLine", () => {
  it("renders a purchase exactly as Figure 2 prints it", () => {
    expect(recordLine(lunch)).toEqual({
      primary: "KES 850 · food and drink",
      secondary: "Kasarani ward · 12:55",
    });
  });

  it("renders transport with its own noun", () => {
    expect(recordLine(bus).primary).toBe("KES 160 · transport");
  });

  it("renders a border crossing with no money", () => {
    expect(recordLine(border)).toEqual({
      primary: "Border crossing · Malaba",
      secondary: "Malaba · 06:40",
    });
  });
});

describe("groupByDay", () => {
  it("groups by calendar day, newest day first, newest event first", () => {
    const groups = groupByDay([bus, lunch, border]);
    expect(groups.map((g) => g.day)).toEqual(["2027-06-23", "2027-06-22"]);
    expect(groups[0].events.map((e) => e.id)).toEqual(["e1"]);
    expect(groups[1].events.map((e) => e.id)).toEqual(["e2", "e3"]);
  });

  it("is empty-safe", () => {
    expect(groupByDay([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/utils/record.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/record"`.

- [ ] **Step 3: Implement the record helpers**

Create `src/utils/record.ts`:

```ts
import type { EventKind, PassEvent } from "@/types";
import { kes } from "@/utils/format";

/** The noun each kind of use goes by in the record, per Figure 2. */
const NOUN: Record<EventKind, string> = {
  purchase: "food and drink",
  transport: "transport",
  turnstile: "stadium entry",
  "fan-zone": "fan zone entry",
  border: "border crossing",
};

export function totalSaved(events: PassEvent[]): number {
  return events.reduce((sum, e) => sum + (e.amount?.discount ?? 0), 0);
}

export function totalSpent(events: PassEvent[]): number {
  return events.reduce((sum, e) => sum + (e.amount?.net ?? 0), 0);
}

/** Has this fan crossed a border? Decides which cards lead the Home screen. */
export function hasBorderEvent(events: PassEvent[]): boolean {
  return events.some((e) => e.kind === "border");
}

/** "12:55" in the event's own offset, as written. */
function timeOf(iso: string): string {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

/** "2027-06-23" in the event's own offset. */
function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

/** One line of the record, in the proposal's own format. */
export function recordLine(e: PassEvent): { primary: string; secondary: string } {
  const primary = e.amount
    ? `${kes(e.amount.net)} · ${NOUN[e.kind]}`
    : `${NOUN[e.kind].charAt(0).toUpperCase()}${NOUN[e.kind].slice(1)} · ${e.place.name}`;
  const where = e.place.ward ?? e.place.city;
  return { primary, secondary: `${where} · ${timeOf(e.at)}` };
}

export interface DayGroup {
  day: string; // "2027-06-23"
  events: PassEvent[];
}

/** Newest day first, newest event first within a day. */
export function groupByDay(events: PassEvent[]): DayGroup[] {
  const byDay = new Map<string, PassEvent[]>();
  for (const e of events) {
    const day = dayOf(e.at);
    const list = byDay.get(day);
    if (list) list.push(e);
    else byDay.set(day, [e]);
  }
  return [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, list]) => ({
      day,
      events: [...list].sort((a, b) => b.at.localeCompare(a.at)),
    }));
}
```

- [ ] **Step 4: Run the test — it should pass**

Run: `npx vitest run src/utils/record.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 5: Implement the record store**

Create `src/store/useRecordStore.ts`:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PassEvent } from "@/types";

// The record. Append-only, and the ONLY writer of lines in the app.
//
// It lives on the fan's device, which is not a prototype shortcut: Section 09 of
// the proposal is explicit that a fan sees her own complete journey on her own
// device while no institutional dashboard ever assembles that view of anyone.
// When a backend lands, only aggregates leave. Do not "fix" this by syncing
// whole records to a server.

// The record is the app's source of truth for savings, so a failed write must
// surface rather than fail silently — unlike the reference-data cache in
// storage.ts, where swallowing a quota error is harmless.
const loudStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      useRecordStore.setState({ storageError: true });
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      useRecordStore.setState({ storageError: true });
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      useRecordStore.setState({ storageError: true });
    }
  },
};

interface RecordState {
  events: PassEvent[];
  hydrated: boolean;
  /** True once a read or write failed; the Wallet shows a banner. */
  storageError: boolean;
  /** A use that happened through the app — a scan or a tap. */
  append: (event: PassEvent) => void;
  /**
   * A use that happened at a counter, where the fan read her card code aloud and
   * never touched her phone. It arrives inbound rather than from a tap in the
   * app; in the prototype it is simulated, against a real backend it is a push.
   * Keeping this path separate is what makes the no-exclusion promise real.
   */
  ingestShortCode: (event: PassEvent) => void;
  clear: () => void;
}

export const useRecordStore = create<RecordState>()(
  persist(
    (set) => ({
      events: [],
      hydrated: false,
      storageError: false,
      append: (event) => set((s) => ({ events: [...s.events, event] })),
      ingestShortCode: (event) =>
        set((s) => ({
          events: [...s.events, { ...event, channel: "shortcode" as const }],
        })),
      clear: () => set({ events: [] }),
    }),
    {
      name: "pamoja-record",
      storage: createJSONStorage(() => loudStorage),
      onRehydrateStorage: () => (_state, error) => {
        useRecordStore.setState({
          hydrated: true,
          storageError: error != null,
        });
      },
    }
  )
);
```

- [ ] **Step 6: Run lint and the full suite**

Run: `npm run lint && npm test`
Expected: no type errors; all suites pass.

- [ ] **Step 7: Commit**

```bash
git add src/utils/record.ts src/utils/record.test.ts src/store/useRecordStore.ts
git commit -m "feat: add the append-only Pass record and its derivations"
```

---

### Task 4: Redemption arithmetic and both entry paths

Turns a partner and a price into one line. Proves scan and short code produce identical records.

**Files:**
- Create: `src/utils/redeem.ts`, `src/utils/redeem.test.ts`

**Interfaces:**
- Consumes: `Partner`, `Pass`, `PassEvent`, `Money`, `Channel` from `@/types`
- Produces: `@/utils/redeem`: `computeMoney(gross: number, discountPct: number): Money`, `buildRedemption(input: RedemptionInput): PassEvent`, `interface RedemptionInput { pass: Pass; partner: Partner; gross: number; channel: Channel; at: Date; seq: number }`

- [ ] **Step 1: Write the failing test**

Create `src/utils/redeem.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeMoney, buildRedemption } from "@/utils/redeem";
import { DEMO_NOW } from "@/lib/clock";
import type { Partner, Pass } from "@/types";

const pass: Pass = {
  id: "KE-PM-8842",
  holderName: "Amina Nakato",
  tier: "fan",
  issuedIn: "KE",
  validFrom: "2027-06-19",
  validUntil: "2027-07-17",
  shortCode: "KE-PM-8842",
  status: "active",
};

const mamaOliech: Partner = {
  id: "p-mama-oliech",
  name: "Mama Oliech",
  category: "eat",
  discountPct: 15,
  shortCode: "MO-001",
  ward: "Kasarani ward",
  city: "Nairobi",
  country: "KE",
  coords: { lat: -1.2266, lng: 36.8899 },
};

describe("computeMoney", () => {
  it("reproduces Section 06's worked example exactly", () => {
    expect(computeMoney(1000, 15)).toEqual({
      currency: "KES",
      gross: 1000,
      discount: 150,
      net: 850,
    });
  });

  it("rounds the discount to whole shillings", () => {
    expect(computeMoney(333, 15)).toEqual({
      currency: "KES",
      gross: 333,
      discount: 50,
      net: 283,
    });
  });

  it("handles a zero discount", () => {
    expect(computeMoney(500, 0)).toEqual({
      currency: "KES",
      gross: 500,
      discount: 0,
      net: 500,
    });
  });
});

describe("buildRedemption", () => {
  const base = {
    pass,
    partner: mamaOliech,
    gross: 1000,
    at: DEMO_NOW,
    seq: 1,
  };

  it("writes the line Figure 2 prints", () => {
    const e = buildRedemption({ ...base, channel: "qr" });
    expect(e.kind).toBe("purchase");
    expect(e.passId).toBe("KE-PM-8842");
    expect(e.partnerId).toBe("p-mama-oliech");
    expect(e.amount).toEqual({
      currency: "KES",
      gross: 1000,
      discount: 150,
      net: 850,
    });
    expect(e.place).toEqual({
      name: "Mama Oliech",
      ward: "Kasarani ward",
      city: "Nairobi",
      country: "KE",
    });
  });

  it("stamps the time from the clock it is given", () => {
    const e = buildRedemption({ ...base, channel: "qr" });
    expect(e.at).toBe(DEMO_NOW.toISOString());
  });

  it("produces an identical line whether scanned or read aloud", () => {
    const scanned = buildRedemption({ ...base, channel: "qr" });
    const spoken = buildRedemption({ ...base, channel: "shortcode" });
    const { channel: c1, ...restScanned } = scanned;
    const { channel: c2, ...restSpoken } = spoken;
    expect(restScanned).toEqual(restSpoken);
    expect(c1).toBe("qr");
    expect(c2).toBe("shortcode");
  });

  it("gives each redemption a distinct id", () => {
    const a = buildRedemption({ ...base, channel: "qr", seq: 1 });
    const b = buildRedemption({ ...base, channel: "qr", seq: 2 });
    expect(a.id).not.toBe(b.id);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/utils/redeem.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/redeem"`.

- [ ] **Step 3: Implement**

Create `src/utils/redeem.ts`:

```ts
import type { Channel, Money, Partner, Pass, PassEvent } from "@/types";

/**
 * The discount arithmetic. PAMOJA never holds any of this money — the fan pays
 * the merchant directly by M-Pesa, Airtel Money or card (Rev. 2, Section 05).
 * These figures exist to be recorded, not to be charged.
 */
export function computeMoney(gross: number, discountPct: number): Money {
  const discount = Math.round((gross * discountPct) / 100);
  return { currency: "KES", gross, discount, net: gross - discount };
}

export interface RedemptionInput {
  pass: Pass;
  partner: Partner;
  gross: number;
  channel: Channel;
  at: Date;
  /** Monotonic counter from the record length — keeps ids distinct and stable. */
  seq: number;
}

/**
 * One line, from one use. Identical whether the fan scanned the merchant's code
 * or read her card code across the counter; only `channel` differs.
 */
export function buildRedemption(input: RedemptionInput): PassEvent {
  const { pass, partner, gross, channel, at, seq } = input;
  return {
    id: `${pass.id}-${seq}`,
    passId: pass.id,
    kind: "purchase",
    at: at.toISOString(),
    place: {
      name: partner.name,
      ward: partner.ward,
      city: partner.city,
      country: partner.country,
    },
    channel,
    partnerId: partner.id,
    amount: computeMoney(gross, partner.discountPct),
  };
}
```

- [ ] **Step 4: Run the test — it should pass**

Run: `npx vitest run src/utils/redeem.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Run lint and the full suite**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/utils/redeem.ts src/utils/redeem.test.ts
git commit -m "feat: add redemption arithmetic with matching scan and short-code paths"
```

---

### Task 5: The partner network — 2,189, generated and derived

**Files:**
- Create: `src/data/partners.ts`, `src/data/partners.test.ts`, `src/utils/partners.ts`, `src/utils/partners.test.ts`

**Interfaces:**
- Consumes: `Partner`, `PartnerCategory` from `@/types`; `distanceKm` from `@/utils/format`
- Produces:
  - `@/data/partners`: `PARTNER_TARGETS: Record<PartnerCategory, number>`, `NAMED_PARTNERS: Partner[]`, `generatePartners(): Partner[]`
  - `@/utils/partners`: `countsByCategory(list): Record<PartnerCategory, number>`, `byCategory(list, c): Partner[]`, `findByShortCode(list, code): Partner | undefined`, `nearby(list, origin, limit): Partner[]`, `CATEGORY_LABEL: Record<PartnerCategory, string>`, `CATEGORIES: PartnerCategory[]`

- [ ] **Step 1: Write the failing seed test**

Create `src/data/partners.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generatePartners, PARTNER_TARGETS, NAMED_PARTNERS } from "@/data/partners";
import { countsByCategory } from "@/utils/partners";

const partners = generatePartners();

describe("the partner seed", () => {
  it("totals exactly 2,189 — the figure printed in Figure 3", () => {
    expect(partners.length).toBe(2189);
  });

  it("matches the proposal's per-category counts exactly", () => {
    expect(countsByCategory(partners)).toEqual({
      stay: 210,
      move: 84,
      eat: 1340,
      shop: 460,
      do: 95,
    });
  });

  it("targets sum to the total", () => {
    const sum = Object.values(PARTNER_TARGETS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(2189);
  });

  it("includes the businesses the proposal names, at their stated discounts", () => {
    const byName = new Map(partners.map((p) => [p.name, p]));
    expect(byName.get("Mama Oliech")?.discountPct).toBe(15);
    expect(byName.get("Java House")?.discountPct).toBe(10);
    expect(byName.get("Kenya Bus")?.discountPct).toBe(20);
  });

  it("puts Mama Oliech in Kasarani ward, where Figure 2's lunch happens", () => {
    const mo = partners.find((p) => p.name === "Mama Oliech");
    expect(mo?.ward).toBe("Kasarani ward");
    expect(mo?.category).toBe("eat");
  });

  it("keeps every named partner in the generated set", () => {
    for (const named of NAMED_PARTNERS) {
      expect(partners.some((p) => p.id === named.id)).toBe(true);
    }
  });

  it("gives every partner a unique id and a unique short code", () => {
    expect(new Set(partners.map((p) => p.id)).size).toBe(2189);
    expect(new Set(partners.map((p) => p.shortCode)).size).toBe(2189);
  });

  it("gives every partner a distinct name — no two listings collide", () => {
    expect(new Set(partners.map((p) => p.name)).size).toBe(2189);
  });

  it("spreads the network widely across Nairobi's wards", () => {
    // Mixed radix reaches 18 of the 20 wards; assert the spread, not the exact
    // number, so tuning the name pools does not break the test.
    expect(new Set(partners.map((p) => p.ward)).size).toBeGreaterThanOrEqual(15);
  });

  it("is deterministic — two calls produce the same network", () => {
    expect(generatePartners()).toEqual(partners);
  });

  it("seeds Kenya only, per Decision 5", () => {
    expect(partners.every((p) => p.country === "KE")).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/data/partners.test.ts`
Expected: FAIL — `Failed to resolve import "@/data/partners"`.

- [ ] **Step 3: Implement the generator**

Create `src/data/partners.ts`:

```ts
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
```

- [ ] **Step 4: Write the failing derivation test**

Create `src/utils/partners.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  countsByCategory,
  byCategory,
  findByShortCode,
  nearby,
  CATEGORY_LABEL,
} from "@/utils/partners";
import type { Partner } from "@/types";

const make = (
  id: string,
  category: Partner["category"],
  lat: number,
  shortCode: string
): Partner => ({
  id, name: id, category, discountPct: 10, shortCode,
  ward: "Kasarani ward", city: "Nairobi", country: "KE",
  coords: { lat, lng: 36.88 },
});

const list: Partner[] = [
  make("a", "eat", -1.22, "ET-0001"),
  make("b", "eat", -1.40, "ET-0002"),
  make("c", "stay", -1.23, "ST-0001"),
];

describe("countsByCategory", () => {
  it("counts each category and reports zero for empty ones", () => {
    expect(countsByCategory(list)).toEqual({
      stay: 1, move: 0, eat: 2, shop: 0, do: 0,
    });
  });
  it("is empty-safe", () => {
    expect(countsByCategory([])).toEqual({
      stay: 0, move: 0, eat: 0, shop: 0, do: 0,
    });
  });
});

describe("byCategory", () => {
  it("filters to one category", () => {
    expect(byCategory(list, "eat").map((p) => p.id)).toEqual(["a", "b"]);
  });
});

describe("findByShortCode", () => {
  it("finds a merchant by the code on their counter", () => {
    expect(findByShortCode(list, "ST-0001")?.id).toBe("c");
  });
  it("is case-insensitive, since the code gets typed by hand", () => {
    expect(findByShortCode(list, "st-0001")?.id).toBe("c");
  });
  it("returns undefined for an unknown code", () => {
    expect(findByShortCode(list, "XX-9999")).toBeUndefined();
  });
});

describe("nearby", () => {
  it("orders by distance from the fan and honours the limit", () => {
    const origin = { lat: -1.2266, lng: 36.8899 };
    expect(nearby(list, origin, 2).map((p) => p.id)).toEqual(["a", "c"]);
  });
});

describe("CATEGORY_LABEL", () => {
  it("uses the five labels from Figure 3", () => {
    expect(CATEGORY_LABEL).toEqual({
      stay: "Stay", move: "Move", eat: "Eat", shop: "Shop", do: "Do",
    });
  });
});
```

- [ ] **Step 5: Run both tests to make sure they fail**

Run: `npx vitest run src/utils/partners.test.ts src/data/partners.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/partners"`.

- [ ] **Step 6: Implement the derivations**

Create `src/utils/partners.ts`:

```ts
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
```

- [ ] **Step 7: Run both tests — they should pass**

Run: `npx vitest run src/utils/partners.test.ts src/data/partners.test.ts`
Expected: PASS — 9 seed tests, 8 derivation tests.

- [ ] **Step 8: Run lint and the full suite**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add src/data/partners.ts src/data/partners.test.ts \
  src/utils/partners.ts src/utils/partners.test.ts
git commit -m "feat: seed the 2,189-partner network with derived category counts"
```

---

### Task 6: Remaining seed data and the repository seam

Fixtures, explore items, entitlements, and the one interface the UI reads through.

**Files:**
- Create: `src/data/matches.ts`, `src/data/explore.ts`, `src/data/entitlements.ts`, `src/utils/match.ts`, `src/utils/match.test.ts`, `src/utils/entitlements.ts`, `src/utils/entitlements.test.ts`
- Modify: `src/data/repository.ts` (full rewrite)

**Interfaces:**
- Consumes: `Match`, `ExploreItem`, `Entitlement`, `Partner`, `HostCountry` from `@/types`; `generatePartners` from `@/data/partners`; `cacheKey`, `storage` from `@/lib/storage`
- Produces:
  - `@/data/matches`: `MATCHES: Match[]`
  - `@/data/explore`: `EXPLORE_ITEMS: ExploreItem[]`
  - `@/data/entitlements`: `ENTITLEMENTS: Entitlement[]`
  - `@/utils/match`: `nextMatch(matches, at): Match | undefined`, `matchLabel(m): string`, `kickoffLabel(m): string`
  - `@/utils/entitlements`: `forCountry(list, country): Entitlement[]`
  - `@/data/repository`: `fetchPartners(): Promise<Partner[]>`, `fetchExplore(): Promise<ExploreItem[]>`, `fetchMatches(): Promise<Match[]>`, `fetchEntitlements(): Promise<Entitlement[]>`

- [ ] **Step 1: Write the failing match test**

Create `src/utils/match.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { nextMatch, matchLabel, kickoffLabel } from "@/utils/match";
import { MATCHES } from "@/data/matches";
import { DEMO_NOW } from "@/lib/clock";

describe("nextMatch", () => {
  it("returns Kenya v Mali at the demo clock — the fixture in Figure 3", () => {
    const m = nextMatch(MATCHES, DEMO_NOW);
    expect(m?.home).toBe("Kenya");
    expect(m?.away).toBe("Mali");
    expect(m?.venue).toBe("Kasarani");
  });

  it("kicks off on Saturday 2027-06-26 at 16:00", () => {
    const m = nextMatch(MATCHES, DEMO_NOW);
    expect(m?.kickoff.slice(0, 10)).toBe("2027-06-26");
    expect(new Date(m!.kickoff).getUTCDay()).toBe(6); // Saturday
  });

  it("skips fixtures that have already kicked off", () => {
    const m = nextMatch(MATCHES, new Date("2027-06-27T00:00:00+03:00"));
    expect(m?.kickoff.slice(0, 10)).not.toBe("2027-06-26");
  });

  it("returns undefined once the tournament is over", () => {
    expect(nextMatch(MATCHES, new Date("2027-08-01T00:00:00+03:00"))).toBeUndefined();
  });
});

describe("labels", () => {
  it("renders the fixture as the card prints it", () => {
    const m = nextMatch(MATCHES, DEMO_NOW)!;
    expect(matchLabel(m)).toBe("Kenya v Mali");
    expect(kickoffLabel(m)).toBe("Sat 16:00 · Kasarani");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/utils/match.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/match"`.

- [ ] **Step 3: Seed the fixtures**

Create `src/data/matches.ts`:

```ts
import type { Match } from "@/types";

// AFCON 2027 Kenyan fixtures. Kenya v Mali on Saturday 26 June at Kasarani is the
// one printed in Figure 3; it is the next fixture from the demo clock.
export const MATCHES: Match[] = [
  {
    id: "m-ken-mli",
    home: "Kenya", away: "Mali",
    kickoff: "2027-06-26T16:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
  },
  {
    id: "m-civ-zam",
    home: "Côte d'Ivoire", away: "Zambia",
    kickoff: "2027-06-29T19:00:00+03:00",
    venue: "Nyayo", city: "Nairobi", country: "KE",
  },
  {
    id: "m-ken-mar",
    home: "Kenya", away: "Morocco",
    kickoff: "2027-07-03T16:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
  },
  {
    id: "m-sen-egy",
    home: "Senegal", away: "Egypt",
    kickoff: "2027-07-10T19:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
  },
];
```

- [ ] **Step 4: Implement the match helpers**

Create `src/utils/match.ts`:

```ts
import type { Match } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The soonest fixture that has not yet kicked off. */
export function nextMatch(matches: Match[], at: Date): Match | undefined {
  return [...matches]
    .filter((m) => new Date(m.kickoff).getTime() > at.getTime())
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0];
}

export function matchLabel(m: Match): string {
  return `${m.home} v ${m.away}`;
}

/** "Sat 16:00 · Kasarani", read from the fixture's own offset. */
export function kickoffLabel(m: Match): string {
  const day = DAYS[new Date(m.kickoff).getUTCDay()];
  const time = m.kickoff.match(/T(\d{2}:\d{2})/)?.[1] ?? "";
  return `${day} ${time} · ${m.venue}`;
}
```

- [ ] **Step 5: Run the match test — it should pass**

Run: `npx vitest run src/utils/match.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Write the failing entitlements test**

Create `src/utils/entitlements.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { forCountry } from "@/utils/entitlements";
import { ENTITLEMENTS } from "@/data/entitlements";

describe("forCountry", () => {
  it("returns everything valid in Kenya", () => {
    expect(forCountry(ENTITLEMENTS, "KE").length).toBeGreaterThan(0);
  });

  it("only returns entitlements listing that country", () => {
    for (const e of forCountry(ENTITLEMENTS, "UG")) {
      expect(e.countries).toContain("UG");
    }
  });

  it("covers all four entitlement kinds in Kenya", () => {
    const kinds = new Set(forCountry(ENTITLEMENTS, "KE").map((e) => e.kind));
    expect(kinds).toEqual(
      new Set(["match-access", "transport-fare", "discount", "priority-service"])
    );
  });

  it("grants match access in all three host countries", () => {
    const access = ENTITLEMENTS.find((e) => e.kind === "match-access");
    expect(access?.countries).toEqual(["KE", "UG", "TZ"]);
  });
});
```

- [ ] **Step 7: Run it to make sure it fails**

Run: `npx vitest run src/utils/entitlements.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/entitlements"`.

- [ ] **Step 8: Seed the entitlements and implement the filter**

Create `src/data/entitlements.ts`:

```ts
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
```

Create `src/utils/entitlements.ts`:

```ts
import type { Entitlement, HostCountry } from "@/types";

export function forCountry(
  entitlements: Entitlement[],
  country: HostCountry
): Entitlement[] {
  return entitlements.filter((e) => e.countries.includes(country));
}
```

- [ ] **Step 9: Run the entitlements test — it should pass**

Run: `npx vitest run src/utils/entitlements.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 10: Seed the explore items**

Create `src/data/explore.ts`:

```ts
import type { ExploreItem } from "@/types";

// The places, events and fan zones named in Figure 3.
export const EXPLORE_ITEMS: ExploreItem[] = [
  {
    id: "x-uhuru-park",
    kind: "fan-zone",
    name: "Fan Zone · Uhuru Park",
    detail: "Free entry with your Pass",
    freeWithPass: true,
    opensAt: "14:00",
    ward: "Starehe ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2921, lng: 36.8170 },
  },
  {
    id: "x-kasarani-zone",
    kind: "fan-zone",
    name: "Fan Zone · Kasarani",
    detail: "Free entry with your Pass",
    freeWithPass: true,
    opensAt: "12:00",
    ward: "Kasarani ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2266, lng: 36.8899 },
  },
  {
    id: "x-nairobi-museum",
    kind: "place",
    name: "Nairobi Museum",
    detail: "Kenya's national collection",
    freeWithPass: false,
    ward: "Parklands ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2740, lng: 36.8150 },
  },
  {
    id: "x-karura-forest",
    kind: "place",
    name: "Karura Forest",
    detail: "Walking and cycling trails",
    freeWithPass: false,
    ward: "Ruaraka ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2360, lng: 36.8330 },
  },
  {
    id: "x-opening-ceremony",
    kind: "event",
    name: "Opening ceremony",
    detail: "Kasarani Stadium",
    freeWithPass: false,
    startsAt: "2027-06-19T17:00:00+03:00",
    ward: "Kasarani ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2266, lng: 36.8899 },
  },
  {
    id: "x-nairobi-live",
    kind: "event",
    name: "Nairobi Live",
    detail: "Music at the fan zone, nightly",
    freeWithPass: true,
    startsAt: "2027-06-24T19:00:00+03:00",
    ward: "Starehe ward", city: "Nairobi", country: "KE",
    coords: { lat: -1.2921, lng: 36.8170 },
  },
];
```

- [ ] **Step 11: Rewrite the repository**

Replace all of `src/data/repository.ts`:

```ts
// Repository layer — the single seam between the UI and its data source.
//
// Reference data (partners, explore items, fixtures, entitlements) ships bundled
// with the app, so it is always available offline. On first read each dataset is
// mirrored into AsyncStorage; subsequent reads come from there. The fan's own
// record is not here — it lives in useRecordStore, on her device (Section 09).
//
// When a real backend lands it replaces the bodies of these functions. No screen
// changes.

import type { Entitlement, ExploreItem, Match, Partner } from "@/types";
import { cacheKey, storage } from "@/lib/storage";

import { generatePartners } from "./partners";
import { EXPLORE_ITEMS } from "./explore";
import { MATCHES } from "./matches";
import { ENTITLEMENTS } from "./entitlements";

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

export async function fetchEntitlements(): Promise<Entitlement[]> {
  return cached("entitlements", () => ENTITLEMENTS);
}
```

- [ ] **Step 12: Run lint and the full suite**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 13: Commit**

```bash
git add src/data/matches.ts src/data/explore.ts src/data/entitlements.ts \
  src/data/repository.ts src/utils/match.ts src/utils/match.test.ts \
  src/utils/entitlements.ts src/utils/entitlements.test.ts
git commit -m "feat: seed fixtures, explore items and entitlements behind the repository seam"
```

---

### Task 7: The Pass store, issuance, and the Home variant

Identity and entitlement, plus the flag that decides which cards lead Home.

**Files:**
- Create: `src/store/usePassStore.ts`, `src/store/usePartnerStore.ts`, `src/utils/home.ts`, `src/utils/home.test.ts`, `src/utils/issue.ts`, `src/utils/issue.test.ts`

**Interfaces:**
- Consumes: `Pass`, `PassEvent`, `HostCountry`, `Partner` from `@/types`; `hasBorderEvent` from `@/utils/record`; `TOURNAMENT_START`, `TOURNAMENT_END` from `@/lib/clock`; `fetchPartners` from `@/data/repository`
- Produces:
  - `@/utils/issue`: `issuePass(input: { holderName: string; issuedIn: HostCountry; sequence: number }): Pass`, `DEMO_HOLDER_NAME: string`
  - `@/utils/home`: `homeVariant(events): "resident" | "arrived"`
  - `@/store/usePassStore`: `usePassStore` with `{ pass: Pass | null; hydrated: boolean; issue(input): void; suspend(): void; reset(): void }`
  - `@/store/usePartnerStore`: `usePartnerStore` with `{ partners: Partner[]; loaded: boolean; load(): Promise<void> }`

- [ ] **Step 1: Write the failing issuance test**

Create `src/utils/issue.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { issuePass, DEMO_HOLDER_NAME } from "@/utils/issue";
import { TOURNAMENT_START, TOURNAMENT_END } from "@/lib/clock";

describe("issuePass", () => {
  it("assigns KE-PM-8842 to the first Kenya-issued Pass, as printed in Figure 1", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.id).toBe("KE-PM-8842");
  });

  it("uses the id as the short code read across a counter", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.shortCode).toBe("KE-PM-8842");
  });

  it("issues for the whole tournament window", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.validFrom).toBe(TOURNAMENT_START);
    expect(p.validUntil).toBe(TOURNAMENT_END);
    expect(p.status).toBe("active");
  });

  it("issues fans by default", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.tier).toBe("fan");
  });

  it("moves on to a new number for later passes", () => {
    const p = issuePass({ holderName: "Otieno Were", issuedIn: "KE", sequence: 1 });
    expect(p.id).toBe("KE-PM-8843");
  });

  it("prefixes with the issuing country", () => {
    const p = issuePass({ holderName: "Grace Mushi", issuedIn: "TZ", sequence: 0 });
    expect(p.id).toBe("TZ-PM-8842");
  });

  it("keeps the holder's name as given", () => {
    const p = issuePass({ holderName: "  Amina Nakato ", issuedIn: "KE", sequence: 0 });
    expect(p.holderName).toBe("Amina Nakato");
  });

  it("offers Amina as the pre-filled demo identity", () => {
    expect(DEMO_HOLDER_NAME).toBe("Amina Nakato");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/utils/issue.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/issue"`.

- [ ] **Step 3: Implement issuance**

Create `src/utils/issue.ts`:

```ts
import type { HostCountry, Pass } from "@/types";
import { TOURNAMENT_START, TOURNAMENT_END } from "@/lib/clock";

/**
 * Pre-filled in the issuance form so a fresh install reproduces the card printed
 * in Figure 1 of the proposal.
 */
export const DEMO_HOLDER_NAME = "Amina Nakato";

/** The number on the card in Figure 1. The first Pass issued gets it. */
const FIRST_SERIAL = 8842;

export interface IssueInput {
  holderName: string;
  issuedIn: HostCountry;
  /** How many Passes have already been issued on this device. */
  sequence: number;
}

/**
 * Self-entered identity is a MOCK standing in for accredited issuance. Section 03
 * says the holder is "verified once, when the Pass is issued" — by an authority,
 * not by the holder. This is a prototype stand-in, labelled as such in the UI.
 */
export function issuePass(input: IssueInput): Pass {
  const id = `${input.issuedIn}-PM-${FIRST_SERIAL + input.sequence}`;
  return {
    id,
    holderName: input.holderName.trim(),
    tier: "fan",
    issuedIn: input.issuedIn,
    validFrom: TOURNAMENT_START,
    validUntil: TOURNAMENT_END,
    shortCode: id,
    status: "active",
  };
}
```

- [ ] **Step 4: Run the issuance test — it should pass**

Run: `npx vitest run src/utils/issue.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the failing Home variant test**

Create `src/utils/home.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { homeVariant } from "@/utils/home";
import type { PassEvent } from "@/types";

const purchase: PassEvent = {
  id: "e1", passId: "KE-PM-8842", kind: "purchase",
  at: "2027-06-23T12:55:00+03:00",
  place: { name: "Mama Oliech", ward: "Kasarani ward", city: "Nairobi", country: "KE" },
  channel: "qr",
  amount: { currency: "KES", gross: 1000, discount: 150, net: 850 },
};

const border: PassEvent = {
  id: "e2", passId: "KE-PM-8842", kind: "border",
  at: "2027-06-22T06:40:00+03:00",
  place: { name: "Malaba", city: "Malaba", country: "KE" },
  channel: "nfc",
};

describe("homeVariant", () => {
  it("treats a fan with no crossing as living here", () => {
    expect(homeVariant([purchase])).toBe("resident");
  });

  it("treats a fan who crossed a border as having flown in", () => {
    expect(homeVariant([purchase, border])).toBe("arrived");
  });

  it("defaults a fresh Pass to resident", () => {
    expect(homeVariant([])).toBe("resident");
  });
});
```

- [ ] **Step 6: Run it to make sure it fails**

Run: `npx vitest run src/utils/home.test.ts`
Expected: FAIL — `Failed to resolve import "@/utils/home"`.

- [ ] **Step 7: Implement the variant flag**

Create `src/utils/home.ts`:

```ts
import type { PassEvent } from "@/types";
import { hasBorderEvent } from "@/utils/record";

/**
 * "A fan who lives here gets the match, the route and their savings… A fan who
 * flew in gets validity, the border and a city they have never visited. Same
 * four tabs underneath." — Figure 3 commentary.
 */
export function homeVariant(events: PassEvent[]): "resident" | "arrived" {
  return hasBorderEvent(events) ? "arrived" : "resident";
}
```

- [ ] **Step 8: Run the variant test — it should pass**

Run: `npx vitest run src/utils/home.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 9: Implement the Pass store**

Create `src/store/usePassStore.ts`:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { HostCountry, Pass } from "@/types";
import { issuePass } from "@/utils/issue";

// Identity + entitlement. Never writes to the record — useRecordStore owns lines.

interface PassState {
  pass: Pass | null;
  /** How many Passes this device has issued; drives the serial number. */
  issued: number;
  hydrated: boolean;
  issue: (input: { holderName: string; issuedIn: HostCountry }) => void;
  suspend: () => void;
  reset: () => void;
}

export const usePassStore = create<PassState>()(
  persist(
    (set, get) => ({
      pass: null,
      issued: 0,
      hydrated: false,
      issue: ({ holderName, issuedIn }) =>
        set({
          pass: issuePass({ holderName, issuedIn, sequence: get().issued }),
          issued: get().issued + 1,
        }),
      suspend: () =>
        set((s) => ({
          pass: s.pass ? { ...s.pass, status: "suspended" as const } : null,
        })),
      reset: () => set({ pass: null, issued: 0 }),
    }),
    {
      name: "pamoja-pass",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        usePassStore.setState({ hydrated: true });
      },
    }
  )
);
```

- [ ] **Step 10: Implement the partner store**

Create `src/store/usePartnerStore.ts`:

```ts
import { create } from "zustand";

import type { Partner } from "@/types";
import { fetchPartners } from "@/data/repository";

// The partner network. Reference data, so it is not persisted here — the
// repository already mirrors it into AsyncStorage.

interface PartnerState {
  partners: Partner[];
  loaded: boolean;
  load: () => Promise<void>;
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  partners: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const partners = await fetchPartners();
    set({ partners, loaded: true });
  },
}));
```

- [ ] **Step 11: Run lint and the full suite**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 12: Commit**

```bash
git add src/store/usePassStore.ts src/store/usePartnerStore.ts \
  src/utils/issue.ts src/utils/issue.test.ts src/utils/home.ts src/utils/home.test.ts
git commit -m "feat: add Pass issuance, the Pass and partner stores, and the Home variant"
```

---

### Task 8: The design-system components

The visual vocabulary every screen is built from. Verified by `tsc` and by eye — these are presentational, so they carry no unit tests.

**Files:**
- Create: `src/components/pamoja/{PassCard,Eyebrow,RecordLine,CategoryTile,OfferRow,Figure}.tsx`
- Modify: `src/components/ui/index.tsx`, `package.json`, `App.tsx`

**Interfaces:**
- Consumes: `colors` from `@/lib/theme`; `Pass`, `PassEvent`, `Partner`, `PartnerCategory` from `@/types`; `validityLabel` from `@/utils/pass`; `recordLine` from `@/utils/record`; `CATEGORY_LABEL` from `@/utils/partners`; `now` from `@/lib/clock`
- Produces: `PassCard({ pass })`, `Eyebrow({ children })`, `RecordLine({ event })`, `CategoryTile({ category, count, onPress })`, `OfferRow({ partner, onPress })`, `Figure({ value, label })`

- [ ] **Step 1: Install the two type families**

```bash
npx expo install expo-font @expo-google-fonts/space-grotesk @expo-google-fonts/ibm-plex-mono
```

- [ ] **Step 2: Register the families in Tailwind**

In `tailwind.config.js`, replace the `fontFamily` block:

```js
      // NOTE: family keys must not collide with Tailwind's font-WEIGHT utilities.
      // A key named `semibold` or `bold` would generate `font-semibold` /
      // `font-bold` and clash with the built-in weight classes. Use these names,
      // and address weight through the family — the faces carry it.
      fontFamily: {
        sans: ["SpaceGrotesk_500Medium"],
        medium: ["SpaceGrotesk_600SemiBold"],
        display: ["SpaceGrotesk_700Bold"],
        mono: ["IBMPlexMono_400Regular"],
        "mono-medium": ["IBMPlexMono_500Medium"],
      },
```

Because the loaded faces carry their own weight, components must select a family
(`font-display`, `font-medium`, `font-mono`) and **never** a Tailwind weight
utility (`font-bold`, `font-semibold`) — on React Native those set a numeric
weight the loaded face cannot synthesise, and the text falls back to the system
font.

- [ ] **Step 3: Load the fonts at boot**

In `App.tsx`, add the font hook and hold rendering until it resolves. Add these imports at the top:

```tsx
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
```

Then inside the root component, before the existing return:

```tsx
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });
  if (!fontsLoaded) return null;
```

- [ ] **Step 4: Write the Eyebrow**

Create `src/components/pamoja/Eyebrow.tsx`:

```tsx
import { Text } from "react-native";

/**
 * The uppercase mono label the proposal sets every section and figure in:
 * "SECTION 03 / 10", "OFFERS NEAR YOU", "2,189 PARTNER BUSINESSES".
 */
export function Eyebrow({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <Text
      className={`font-mono text-[11px] uppercase tracking-[1.5px] text-mute ${className}`}
    >
      {children}
    </Text>
  );
}
```

- [ ] **Step 5: Write the PassCard**

Create `src/components/pamoja/PassCard.tsx`:

```tsx
import { Text, View } from "react-native";

import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import type { Pass } from "@/types";
import { validityLabel } from "@/utils/pass";

/**
 * The credential, as printed in Figure 1. Renders entirely from local state with
 * no network path at all — Section 04 promises the turnstile works with no
 * network needed, and this card is what the fan holds up.
 */
export function PassCard({ pass }: { pass: Pass }) {
  const validity = validityLabel(pass, now());
  const spent = pass.status !== "active";
  return (
    <View
      className="rounded-card p-5"
      style={{ backgroundColor: colors.deep, opacity: spent ? 0.55 : 1 }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-[15px] tracking-[2px] text-white">
          PAMOJA
        </Text>
        <View
          className="h-4 w-6 rounded-[2px]"
          style={{ backgroundColor: colors.accent }}
        />
      </View>

      <Text className="mt-8 font-medium text-[19px] text-white">
        {pass.holderName}
      </Text>
      <Text className="mt-1 font-mono text-[13px] tracking-[1px] text-faint">
        {pass.id}
      </Text>

      <Text
        className="mt-6 font-mono text-[11px] uppercase tracking-[1.5px]"
        style={{ color: colors.accent }}
      >
        Valid in all three countries
      </Text>
      <Text className="mt-1.5 font-mono text-[11px] text-faint">{validity}</Text>
    </View>
  );
}
```

- [ ] **Step 6: Write the RecordLine**

Create `src/components/pamoja/RecordLine.tsx`:

```tsx
import { Text, View } from "react-native";

import type { PassEvent } from "@/types";
import { recordLine } from "@/utils/record";

/**
 * One line of the record, set in mono — which is the point. "Every tap, scan and
 * purchase, written the moment it happens. Not a survey, not an estimate, not
 * reconstructed months later."
 */
export function RecordLine({ event }: { event: PassEvent }) {
  const { primary, secondary } = recordLine(event);
  return (
    <View className="border-b border-hairline py-3.5">
      <Text className="font-mono-medium text-[14px] text-ink">{primary}</Text>
      <Text className="mt-1 font-mono text-[12px] text-mute">{secondary}</Text>
    </View>
  );
}
```

- [ ] **Step 7: Write the CategoryTile, OfferRow and Figure**

Create `src/components/pamoja/CategoryTile.tsx`:

```tsx
import { Pressable, Text } from "react-native";

import type { PartnerCategory } from "@/types";
import { CATEGORY_LABEL } from "@/utils/partners";

/** A Services tile. The count is derived, so it can never overstate the network. */
export function CategoryTile({
  category,
  count,
  onPress,
}: {
  category: PartnerCategory;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-1 rounded-card border border-hairline bg-panel px-4 py-5 active:opacity-80"
    >
      <Text className="font-medium text-[17px] text-ink">
        {CATEGORY_LABEL[category]}
      </Text>
      <Text className="mt-1 font-mono text-[12px] text-mute">
        {count.toLocaleString("en-US")} partners
      </Text>
    </Pressable>
  );
}
```

Create `src/components/pamoja/OfferRow.tsx`:

```tsx
import { Pressable, Text } from "react-native";

import { colors } from "@/lib/theme";
import type { Partner } from "@/types";

/** "Mama Oliech    −15%", exactly as Home lists them in Figure 3. */
export function OfferRow({
  partner,
  onPress,
}: {
  partner: Partner;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-hairline py-3 active:opacity-70"
    >
      <Text className="text-[15px] text-ink">{partner.name}</Text>
      <Text
        className="font-mono-medium text-[14px]"
        style={{ color: colors.accent }}
      >
        −{partner.discountPct}%
      </Text>
    </Pressable>
  );
}
```

Create `src/components/pamoja/Figure.tsx`:

```tsx
import { Text, View } from "react-native";

import { Eyebrow } from "./Eyebrow";

/** A headline number with its label above it, as the proposal sets its figures. */
export function Figure({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Eyebrow>{label}</Eyebrow>
      <Text className="mt-1.5 font-display text-[32px] tracking-[-0.5px] text-ink">
        {value}
      </Text>
    </View>
  );
}
```

- [ ] **Step 8: Restyle the shared primitives**

In `src/components/ui/index.tsx`: change `Card`'s className to `rounded-card bg-canvas border border-hairline`, its `shadowColor` to `colors.deep`; replace the `ButtonVariant` union with `"primary" | "secondary" | "ghost"` and its `styles` map with `primary: { bg: "bg-deep", text: "text-white" }`, `secondary: { bg: "bg-canvas border border-hairline", text: "text-ink" }`, `ghost: { bg: "bg-transparent", text: "text-ink" }`; delete the `premium` variant entirely; update `Pill`, `SectionTitle`, `Tag` and `Stat` to use `bg-deep`/`border-deep`, `text-ink`, `text-mute`, `border-hairline`, `bg-panel` in place of the old `brand-*`, `ink-*` and `surface-*` classes. Update the `ActivityIndicator` color to `colors.deep`.

In `src/components/Screen.tsx`, change the SafeAreaView className to `flex-1 bg-surface`.

- [ ] **Step 9: Verify it compiles and boots**

Run: `npm run lint`
Expected: no errors.

Run: `npm run web`
Expected: the four tabs still render, now in the Pamoja palette with Space Grotesk and IBM Plex Mono loaded.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add the Pamoja design-system components and type families"
```

---

### Task 9: Issuance and navigation gating

**Files:**
- Create: `src/screens/IssuanceScreen.tsx`
- Modify: `src/navigation/RootNavigator.tsx`, `src/navigation/types.ts`

**Interfaces:**
- Consumes: `usePassStore`; `DEMO_HOLDER_NAME`, `issuePass` from `@/utils/issue`; `PassCard`, `Eyebrow`; `Button` from `@/components/ui`
- Produces: `RootStackParamList` gains `Issuance: undefined`, `Scan: undefined`, `Confirm: { partnerId: string; channel: "qr" | "shortcode" }`, `Category: { category: PartnerCategory }`, `Partner: { partnerId: string }`, `Wallet: undefined`

- [ ] **Step 1: Extend the route types**

Replace `src/navigation/types.ts`:

```ts
import type { PartnerCategory } from "@/types";

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Services: undefined;
  Pass: undefined;
};

export type RootStackParamList = {
  Issuance: undefined;
  Tabs: undefined;
  Category: { category: PartnerCategory };
  Partner: { partnerId: string };
  Wallet: undefined;
  Scan: undefined;
  Confirm: { partnerId: string; channel: "qr" | "shortcode" };
};
```

- [ ] **Step 2: Build the issuance screen**

Create `src/screens/IssuanceScreen.tsx` — three steps in one screen, advancing through local state:

```tsx
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { usePassStore } from "@/store/usePassStore";
import { DEMO_HOLDER_NAME } from "@/utils/issue";
import type { HostCountry } from "@/types";

const COUNTRIES: { code: HostCountry; label: string }[] = [
  { code: "KE", label: "Kenya" },
  { code: "UG", label: "Uganda" },
  { code: "TZ", label: "Tanzania" },
];

export function IssuanceScreen() {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<HostCountry>("KE");
  const [name, setName] = useState(DEMO_HOLDER_NAME);
  const issue = usePassStore((s) => s.issue);

  return (
    <Screen>
      <View className="flex-1 px-5 pt-8">
        <Eyebrow>{`Step ${step + 1} of 3`}</Eyebrow>

        {step === 0 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              Where are you collecting your Pass?
            </Text>
            <View className="mt-6">
              {COUNTRIES.map((c) => (
                <Button
                  key={c.code}
                  title={c.label}
                  variant={country === c.code ? "primary" : "secondary"}
                  className="mb-3"
                  onPress={() => setCountry(c.code)}
                />
              ))}
            </View>
            <Button title="Continue" className="mt-4" onPress={() => setStep(1)} />
          </View>
        )}

        {step === 1 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              Who is the Pass for?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              className="mt-6 rounded-card border border-hairline bg-canvas px-4 py-4 text-[16px] text-ink"
            />
            <Text className="mt-3 font-mono text-[11px] leading-4 text-mute">
              Prototype only. A real Pass is verified once, when it is issued, by
              the accrediting authority — not self-entered.
            </Text>
            <Button
              title="Continue"
              className="mt-6"
              disabled={name.trim().length === 0}
              onPress={() => setStep(2)}
            />
          </View>
        )}

        {step === 2 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              Your ticket
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-body">
              Your Pass is created with your ticket, and works at the border, at
              the turnstile, on transport and at every partner business.
            </Text>
            <Button
              title="Create my Pass"
              className="mt-6"
              onPress={() => issue({ holderName: name, issuedIn: country })}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
```

- [ ] **Step 3: Gate the root navigator**

Rewrite `src/navigation/RootNavigator.tsx` so it renders `IssuanceScreen` when `usePassStore((s) => s.pass)` is `null` and the tab navigator otherwise, with `Category`, `Partner`, `Wallet`, `Scan` and `Confirm` registered as additional stack screens (`Scan` and `Confirm` with `presentation: "modal"`). Wait for `hydrated` before deciding — render `null` until then, so a returning fan never flashes the issuance screen. Screens created in later tasks can be stubbed with the placeholder pattern from Task 1 Step 8 and replaced in place.

- [ ] **Step 4: Verify the gate works**

Run: `npm run web`
Expected: a fresh browser profile lands on issuance; completing the three steps reveals the four tabs; a reload stays on the tabs.

- [ ] **Step 5: Run lint and tests**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Pass issuance and gate the navigator on holding a Pass"
```

---

### Task 10: Home

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

**Interfaces:**
- Consumes: `usePassStore`, `useRecordStore`, `usePartnerStore`; `totalSaved` from `@/utils/record`; `homeVariant` from `@/utils/home`; `nextMatch`, `matchLabel`, `kickoffLabel` from `@/utils/match`; `nearby` from `@/utils/partners`; `MATCHES` via `fetchMatches`; `kes` from `@/utils/format`; `now` from `@/lib/clock`; `Eyebrow`, `OfferRow`, `Figure`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Build the savings tile**

Create the inverted tile Figure 3 leads with, at the top of `src/screens/HomeScreen.tsx`:

```tsx
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { fetchMatches } from "@/data/repository";
import { usePartnerStore } from "@/store/usePartnerStore";
import { useRecordStore } from "@/store/useRecordStore";
import { usePassStore } from "@/store/usePassStore";
import { totalSaved } from "@/utils/record";
import { homeVariant } from "@/utils/home";
import { nextMatch, matchLabel, kickoffLabel } from "@/utils/match";
import { nearby } from "@/utils/partners";
import { validityLabel } from "@/utils/pass";
import { kes } from "@/utils/format";
import type { Match } from "@/types";

/** Where the fan is standing. Kasarani, so Figure 2's lunch is the nearest offer. */
const KASARANI = { lat: -1.2266, lng: 36.8899 };

function SavedTile({ saved }: { saved: number }) {
  return (
    <View
      className="mt-4 rounded-card px-5 py-5"
      style={{ backgroundColor: colors.deep }}
    >
      <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-faint">
        You've saved
      </Text>
      <Text className="mt-1.5 font-display text-[32px] tracking-[-0.5px] text-white">
        {kes(saved)}
      </Text>
      {saved === 0 && (
        <Text className="mt-2 font-mono text-[11px] leading-4 text-faint">
          Find an offer near you and your first line gets written.
        </Text>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Build the screen body**

Append to the same file:

```tsx
export function HomeScreen() {
  const navigation = useNavigation<any>();
  const pass = usePassStore((s) => s.pass);
  const events = useRecordStore((s) => s.events);
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    void load();
    void fetchMatches().then(setMatches);
  }, [load]);

  const saved = totalSaved(events);
  const variant = homeVariant(events);
  const fixture = nextMatch(matches, now());
  const offers = nearby(partners, KASARANI, 3);
  const crossing = events.find((e) => e.kind === "border");

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Eyebrow className="mt-4">Today</Eyebrow>

        {/* A fan who lives here leads with the match; a fan who flew in leads
            with validity and the border they came through. Figure 3. */}
        {variant === "resident" ? (
          <>
            {fixture && (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 py-5">
                <Text className="font-medium text-[22px] text-ink">
                  {matchLabel(fixture)}
                </Text>
                <Text className="mt-1 font-mono text-[12px] text-mute">
                  {kickoffLabel(fixture)}
                </Text>
              </View>
            )}
            <SavedTile saved={saved} />
          </>
        ) : (
          <>
            {pass && (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 py-5">
                <Text className="font-medium text-[22px] text-ink">
                  {validityLabel(pass, now())}
                </Text>
                {crossing && (
                  <Text className="mt-1 font-mono text-[12px] text-mute">
                    Entered at {crossing.place.name}
                  </Text>
                )}
              </View>
            )}
            <SavedTile saved={saved} />
          </>
        )}

        <Eyebrow className="mt-8">Offers near you</Eyebrow>
        <View className="mt-2">
          {offers.map((p) => (
            <OfferRow
              key={p.id}
              partner={p}
              onPress={() => navigation.navigate("Partner", { partnerId: p.id })}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 3: Verify by eye**

Run: `npm run web`
Expected: Home shows `TODAY`, `Kenya v Mali` / `Sat 16:00 · Kasarani`, `YOU'VE SAVED` at `KES 0`, and three offers near you.

- [ ] **Step 4: Run lint and tests**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: build the Home tab with the savings figure and nearby offers"
```

---

### Task 11: Explore

**Files:**
- Modify: `src/screens/ExploreScreen.tsx`

**Interfaces:**
- Consumes: `fetchExplore` from `@/data/repository`; `ExploreItem`; `Eyebrow`; `Pill` from `@/components/ui`; `PamojaMap`; `now` from `@/lib/clock`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Build the screen**

Replace `src/screens/ExploreScreen.tsx` with:

- A `Pill` row segmenting `Events` / `Places` / `Fan Zones`, filtering `EXPLORE_ITEMS` by `kind` (`"event"` / `"place"` / `"fan-zone"`), defaulting to `Events`.
- `<Eyebrow>COMING UP</Eyebrow>` over items with a `startsAt` in the future relative to `now()`, or an `opensAt` for fan zones, sorted soonest first. Each row shows `name`, `detail`, and — when `freeWithPass` — the line `Free entry with your Pass` in the accent color.
- `<Eyebrow>NEAR YOU</Eyebrow>` over the remaining items for the active segment.
- The existing `PamojaMap` beneath, pinned to the visible items' `coords`.

Load with `fetchExplore()` in a `useEffect`, holding results in local state.

- [ ] **Step 2: Verify by eye**

Run: `npm run web`
Expected: `Fan Zone · Uhuru Park` with `Free entry with your Pass` under Fan Zones; `Nairobi Museum` and `Karura Forest` under Places.

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/screens/ExploreScreen.tsx
git commit -m "feat: build the Explore tab with events, places and fan zones"
```

---

### Task 12: Services, category and partner detail

**Files:**
- Modify: `src/screens/ServicesScreen.tsx`
- Create: `src/screens/CategoryScreen.tsx`, `src/screens/PartnerScreen.tsx`

**Interfaces:**
- Consumes: `usePartnerStore`; `countsByCategory`, `byCategory`, `CATEGORIES`, `CATEGORY_LABEL` from `@/utils/partners`; `CategoryTile`, `Eyebrow`; `Button` from `@/components/ui`
- Produces: navigation into `Category` and `Partner`, and out to `Confirm`

- [ ] **Step 1: Build Services**

Replace `src/screens/ServicesScreen.tsx`: load partners via `usePartnerStore`, then render `<Eyebrow>{`${partners.length.toLocaleString("en-US")} PARTNER BUSINESSES`}</Eyebrow>` — derived, never hardcoded — above a two-column grid of `CategoryTile` for each of `CATEGORIES`, each with `countsByCategory(partners)[category]`, navigating to `Category`.

- [ ] **Step 2: Build the category list**

Create `src/screens/CategoryScreen.tsx`: read `route.params.category`, render `CATEGORY_LABEL[category]` as the title, and a `FlatList` of `byCategory(partners, category)` showing name, ward and `−N%`, each navigating to `Partner`.

- [ ] **Step 3: Build partner detail**

Create `src/screens/PartnerScreen.tsx`: find the partner by `route.params.partnerId`, show name, category label, ward, the discount, and the merchant short code in mono. Two actions:

- `Scan to redeem` → navigates to `Confirm` with `{ partnerId, channel: "qr" }`
- `I read my card code at the counter` → navigates to `Confirm` with `{ partnerId, channel: "shortcode" }`

Beneath both, this line, which is not optional copy:

```
You pay the merchant directly by M-Pesa, Airtel Money or card. Pamoja never
holds your money.
```

- [ ] **Step 4: Verify by eye**

Run: `npm run web`
Expected: Services reads `2,189 PARTNER BUSINESSES` with tiles Stay 210, Move 84, Eat 1,340, Shop 460, Do 95; Eat opens a list of 1,340 you can scroll.

- [ ] **Step 5: Run lint and tests**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ServicesScreen.tsx src/screens/CategoryScreen.tsx \
  src/screens/PartnerScreen.tsx
git commit -m "feat: build the Services tab, category lists and partner detail"
```

---

### Task 13: Redemption — scan, confirm, and the line

The loop the whole app exists for.

**Files:**
- Create: `src/screens/ScanScreen.tsx`, `src/screens/ConfirmScreen.tsx`

**Interfaces:**
- Consumes: `usePassStore`, `useRecordStore`, `usePartnerStore`; `buildRedemption`, `computeMoney` from `@/utils/redeem`; `findByShortCode` from `@/utils/partners`; `passStatus` from `@/utils/pass`; `now` from `@/lib/clock`; `kes` from `@/utils/format`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Build the scan step**

Create `src/screens/ScanScreen.tsx`. There is no camera in this build (spec non-goal), so this is a merchant-code entry step standing in for the scan: a `TextInput` for the merchant code, resolved with `findByShortCode(partners, code)`.

- On a match → navigate to `Confirm` with `{ partnerId, channel: "qr" }`.
- On no match → show `That code was not recognised.` and, beneath it, `Ask the merchant to enter your Pass code instead — it works without your phone.`
- If `passStatus(pass, now()) !== "active"` → refuse before any lookup, showing the status and writing no line.

- [ ] **Step 2: Build the confirm step**

Create `src/screens/ConfirmScreen.tsx`. Read `{ partnerId, channel }` from params and resolve the partner. Present a number pad or `TextInput` for the bill amount, defaulting to `1000` so the demo reproduces Section 06's worked example. Show `computeMoney(gross, partner.discountPct)` broken out exactly as Section 06 prints it:

```
KES 1,000
−150
850
```

State plainly beneath: `You pay the merchant KES 850 directly. Pamoja never holds your money.`

The confirm action:

```tsx
const pass = usePassStore((s) => s.pass)!;
const events = useRecordStore((s) => s.events);
const append = useRecordStore((s) => s.append);
const ingestShortCode = useRecordStore((s) => s.ingestShortCode);

const onConfirm = () => {
  const event = buildRedemption({
    pass,
    partner,
    gross,
    channel,
    at: now(),
    seq: events.length,
  });
  if (channel === "shortcode") ingestShortCode(event);
  else append(event);
  navigation.navigate("Wallet");
};
```

Then a third view showing the written line — the `RecordLine` for the event just appended, under `<Eyebrow>ONE LINE WRITTEN</Eyebrow>` — before continuing to the Wallet.

- [ ] **Step 3: Verify the loop end to end**

Run: `npm run web`
Expected: Services → Eat → Mama Oliech → redeem at 1,000 → the line `KES 850 · food and drink` / `Kasarani ward · 12:55` appears, and Home's `YOU'VE SAVED` now reads `KES 150`.

- [ ] **Step 4: Verify the short-code path writes the same line**

Repeat via `I read my card code at the counter`.
Expected: an identical line in the Wallet, and the savings total rises again.

- [ ] **Step 5: Run lint and tests**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ScanScreen.tsx src/screens/ConfirmScreen.tsx
git commit -m "feat: build the redemption loop for both scan and short-code paths"
```

---

### Task 14: Pass, Wallet, and the strings module

**Files:**
- Modify: `src/screens/PassScreen.tsx`
- Create: `src/screens/WalletScreen.tsx`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `usePassStore`, `useRecordStore`; `PassCard`, `RecordLine`, `Eyebrow`, `Figure`; `forCountry` from `@/utils/entitlements`; `fetchEntitlements`; `groupByDay`, `totalSaved`, `totalSpent` from `@/utils/record`; `kes` from `@/utils/format`
- Produces: `@/lib/strings`: `S` — a flat object of every user-facing string

- [ ] **Step 1: Build the Pass tab**

Replace `src/screens/PassScreen.tsx`: `<PassCard pass={pass} />` at the top, then `<Eyebrow>WHAT YOUR PASS UNLOCKS</Eyebrow>` over `forCountry(entitlements, pass.issuedIn)` as label/detail rows, then a row into `Wallet` labelled `My Wallet` / `Tickets, passes, purchases`. Load entitlements with `fetchEntitlements()` into local state.

Do not add a "Manage my Passes" row — family passes are a spec non-goal for v1.

- [ ] **Step 2: Build the Wallet**

Create `src/screens/WalletScreen.tsx`: two `Figure`s side by side — `totalSaved` under `YOU'VE SAVED` and `totalSpent` under `YOU'VE SPENT` — then `groupByDay(events)` rendered as day headings (`<Eyebrow>` with the date) over `RecordLine`s.

Empty state: `Nothing yet. Every time you use your Pass, one line is written here — and nowhere else.`

When `useRecordStore((s) => s.storageError)` is true, show a banner above the
figures: `Your record could not be saved to this device. Recent lines may be
missing.` The record is the source of truth for savings, so this failure is never
swallowed.

Add a closing note at the foot of the list, in mono, at `text-mute`:

```
This record is yours, and it is held on this device. No dashboard anywhere
assembles this view of you.
```

- [ ] **Step 3: Extract the strings**

Create `src/lib/strings.ts` exporting a single flat `S` object holding every user-facing string added in Tasks 9–14, grouped by screen with comments. Then replace those literals across the screens with `S.*` references. Leave the mono figure formats (`kes()` output, record lines) where they are — those are formatting, not copy.

- [ ] **Step 4: Verify the whole app**

Run: `npm run web`
Expected: all four tabs work; the Pass card reads `Amina Nakato`, `KE-PM-8842`, `VALID IN ALL THREE COUNTRIES`, `Valid · 24 days left`; the Wallet lists every redemption.

- [ ] **Step 5: Run lint and the full suite**

Run: `npm run lint && npm test`
Expected: all green, all suites from Tasks 2–7 passing.

- [ ] **Step 6: Verify no stray time reads**

Run: `grep -rn "Date.now()\|new Date()" src/ --include=*.ts --include=*.tsx | grep -v "src/lib/clock.ts"`
Expected: no output. Any hit is a violation of the clock constraint — route it through `now()`.

- [ ] **Step 7: Verify no hardcoded partner total**

Run: `grep -rn "2,189\|2189" src/ --include=*.tsx`
Expected: no output. The figure must be derived from `partners.length`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: build the Pass and Wallet tabs and extract user-facing strings"
```

---

## Verification

After Task 14, the following must all hold:

- `npm run lint` — clean
- `npm test` — every suite passes
- `npm run web` — the app boots to issuance on a fresh profile, and to the four tabs thereafter
- Services reads `2,189 PARTNER BUSINESSES`, tiles read 210 / 84 / 1,340 / 460 / 95
- Redeeming 1,000/= at Mama Oliech writes `KES 850 · food and drink` / `Kasarani ward · 12:55` and raises `YOU'VE SAVED` by `KES 150`
- The short-code path writes an identical line
- The Pass card reads `Valid · 24 days left`
- No `Date.now()` or bare `new Date()` outside `src/lib/clock.ts`
