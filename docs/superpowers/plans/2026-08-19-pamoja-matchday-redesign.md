# Pamoja Matchday Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the delivered design canvas into the app — Uratibu typography, the canvas's
component vocabulary, two new screens (Live, Drive & Borders), and enriched Pass, Wallet,
Services, Home and Explore tabs — without giving up the promise that Pamoja never holds a
fan's money.

**Architecture:** Tokens first, then primitives, then screens, then the new subsystems.
The Tailwind `fontFamily` keys are a single choke point: keep the key names, swap the
faces, and every screen re-letters with no `className` edits. New data (live scores,
border crossings) goes behind the existing read-through cache in `repository.ts`, so no
new mechanism is introduced. All new logic is pure functions in `src/utils/`, unit-tested;
components stay presentational and are verified in a real browser.

**Tech Stack:** Expo 51 / React Native 0.74 / react-native-web, NativeWind 4 (Tailwind),
Zustand + AsyncStorage, React Navigation 6, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-08-19-pamoja-matchday-redesign-design.md`
(extends `docs/superpowers/specs/2026-08-18-pamoja-pass-app-design.md`)

## Global Constraints

Every task's requirements implicitly include this section.

- **Two hues only.** `deep` (`#04222b`) and `accent` (`#0e6ba8`), plus one neutral
  ink-to-canvas ramp. No per-category and no per-status colour. New tokens must be shades
  of those two hues. (`DESIGN.md`)
- **One time seam.** Nothing outside `src/lib/clock.ts` may call `Date.now()` or
  `new Date()` with no argument. Every date-derived display reads through `now()`, and
  every wall-clock rendering of a stored instant goes through `eatParts`. Guard:
  `grep -rn "Date.now()\|new Date()" src/ --include=*.ts --include=*.tsx | grep -v "src/lib/clock.ts"`
  must print nothing.
- **`PassEvent.at` is a UTC instant.** Render it through `eatParts`; never scrape
  wall-clock fields off the ISO string.
- **Never display a number the app cannot fill.** `2,189` comes from `partners.length`,
  category counts from `countsByCategory`. Guard: no literal `2,189` or `2189` in any
  `.tsx` outside a comment.
- **No funds held, ever.** No balance, no top-up, no send, no card number, no stored
  value anywhere. (Rev. 2 §05)
- **Only a redemption writes to the record.** `useRecordStore` is append-only and is the
  sole source of `YOU'VE SAVED`. A ticket's stated savings are never added to it.
- **All user-facing copy lives in `src/lib/strings.ts`** as `S.*`. Formatter output
  (`kes()`, `recordLine()`, `validityLabel()`, `kickoffLabel()`, `CATEGORY_LABEL`) and
  template literals interpolating data are exempt, as they already are.
- **British English** in copy — *organisation, centre, programme*.
- **Vitest only collects `src/**/*.test.ts`** (see `vitest.config.ts`) — there is no
  `.tsx` test environment and no renderer. Component correctness is verified by
  `npm run lint` (prop types) and by driving the built app in a browser. Do not add a
  component test framework in this plan.
- **Font family keys must not collide with Tailwind weight utilities.** A key named
  `bold` or `semibold` would generate `font-bold` / `font-semibold` and clash. Existing
  keys (`sans`, `medium`, `display`, `mono`, `mono-medium`) and the new `display-heavy`
  are safe.
- **These figures must not move.** They are proposal specifications, not sample data:
  `2,189` and 210 / 84 / 1,340 / 460 / 95; `Amina Nakato`; `KE-PM-8842`;
  `Valid · 24 days left`; `KES 850 · food and drink`; `Kasarani ward · 12:55`; `KES 150`.
- **Every task ends green.** `npm run lint && npm test` before each commit.

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `src/utils/spec-figures.test.ts` | Characterisation guard for the figures above |
| `src/data/live.ts` | Seeded `MatchLive` scores and stats |
| `src/data/borders.ts` | Seeded `BorderCrossing` reference content |
| `src/data/parking.ts` | Seeded parking zones |
| `src/utils/ticket.ts` | `issueTicket`, `ticketReference`, `ticketSaved` |
| `src/utils/ticket.test.ts` | Tests for the above |
| `src/components/pamoja/Crest.tsx` | Three-letter team tile |
| `src/components/pamoja/Chip.tsx` | Small mono pill, four variants |
| `src/components/pamoja/Avatar.tsx` | Initials disc |
| `src/components/pamoja/StatTrio.tsx` | Three-up figure row |
| `src/components/pamoja/Sparkline.tsx` | Daily-savings bars |
| `src/components/pamoja/Donut.tsx` | Savings-rate ring |
| `src/components/pamoja/SearchField.tsx` | Explore's input |
| `src/components/pamoja/MoneyBox.tsx` | The gradient savings panel |
| `src/components/pamoja/TicketCard.tsx` | Perforated match ticket + code block |
| `src/components/pamoja/RouteStrip.tsx` | Origin → post → destination |
| `src/components/pamoja/TileGrid.tsx` | Services matchday tiles |
| `src/screens/LiveScreen.tsx` | The Live tab |
| `src/screens/DrivingScreen.tsx` | Drive & Borders guide |
| `src/screens/ParkingScreen.tsx` | Pre-bookable zones |
| `src/screens/SafetyScreen.tsx` | Steward help + report |

**Modified**

| File | Change |
|---|---|
| `package.json` | Font packages swapped |
| `App.tsx` | `useFonts` faces |
| `tailwind.config.js` | Family remap, `display-heavy`, new colour rungs, cooler greys |
| `src/lib/theme.ts` | Mirror the palette |
| `DESIGN.md` | Document type and palette changes |
| `src/types/index.ts` | `Match.coords`, `MatchLive`, `MatchPhase`, `MatchTicket`, `OriginCountry`, `BorderCrossing` |
| `src/data/matches.ts` | Coords on all fixtures; two live fixtures added |
| `src/data/repository.ts` | `fetchMatchLive`, `fetchBorderCrossings`, `fetchParking` |
| `src/utils/match.ts` | `kickoffLabel` fix; `TEAM_CODE`, `crestCode`, `matchPhase`, `liveMinute`, `liveMatches`, `gatesOpenLabel`, `daysUntilLabel` |
| `src/utils/match.test.ts` | Tests for all of the above |
| `src/utils/record.ts` | `weekSavings`, `savingsRate`, `offersUsed`, `savingsSeries` |
| `src/utils/record.test.ts` | Tests for the above |
| `src/utils/format.ts` | `initials` |
| `src/utils/format.test.ts` | Test for `initials` |
| `src/store/usePassStore.ts` | Hold the issued `MatchTicket` |
| `src/navigation/types.ts` | `Live` tab; `Driving`, `Parking`, `Safety` routes |
| `src/navigation/TabNavigator.tsx` | Five tabs |
| `src/navigation/RootNavigator.tsx` | New pushed screens |
| `src/screens/HomeScreen.tsx` | Rebuild |
| `src/screens/ExploreScreen.tsx` | Rebuild |
| `src/screens/ServicesScreen.tsx` | Tiles band + Driving row above the browser |
| `src/screens/PassScreen.tsx` | Status chip + ticket card |
| `src/screens/WalletScreen.tsx` | Donut + week chip |
| `src/lib/strings.ts` | All new copy |

---

### Task 1: Lock the figures before anything moves

The restyle touches every screen. Before changing a single token, freeze the proposal's
figures in one test file so any drift fails loudly.

This test is a **characterisation guard**: it passes the moment you write it, because it
describes behaviour that already works. That is correct and intended — its value is
failing later. Step 3 proves it can fail.

**Files:**
- Create: `src/utils/spec-figures.test.ts`

**Interfaces:**
- Consumes: `generatePartners` from `@/data/partners`; `countsByCategory` from
  `@/utils/partners`; `issuePass`, `DEMO_HOLDER_NAME` from `@/utils/issue`;
  `validityLabel` from `@/utils/pass`; `buildRedemption` from `@/utils/redeem`;
  `recordLine`, `totalSaved` from `@/utils/record`; `DEMO_NOW` from `@/lib/clock`
- Produces: nothing. A guard only.

- [ ] **Step 1: Write the guard**

```ts
import { describe, expect, it } from "vitest";

import { DEMO_NOW } from "@/lib/clock";
import { NAMED_PARTNERS, generatePartners } from "@/data/partners";
import { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
import { validityLabel } from "@/utils/pass";
import { countsByCategory } from "@/utils/partners";
import { recordLine, totalSaved } from "@/utils/record";
import { buildRedemption } from "@/utils/redeem";

// The proposal's own figures. These are specifications, not sample data: Figure 1
// prints the card, Figure 3 the network, Figure 4 the record line. Any change that
// moves one of these is a regression, however good it looks.

describe("the network, per Figure 3", () => {
  const partners = generatePartners();

  it("totals 2,189", () => {
    expect(partners.length).toBe(2189);
  });

  it("splits 210 / 84 / 1,340 / 460 / 95", () => {
    expect(countsByCategory(partners)).toEqual({
      stay: 210,
      move: 84,
      eat: 1340,
      shop: 460,
      do: 95,
    });
  });
});

describe("the card, per Figure 1", () => {
  const pass = issuePass({
    holderName: DEMO_HOLDER_NAME,
    issuedIn: "KE",
    sequence: 0,
  });

  it("reads Amina Nakato", () => {
    expect(pass.holderName).toBe("Amina Nakato");
  });

  it("carries serial KE-PM-8842", () => {
    expect(pass.id).toBe("KE-PM-8842");
  });

  it("reads Valid · 24 days left at the demo instant", () => {
    expect(validityLabel(pass, DEMO_NOW)).toBe("Valid · 24 days left");
  });
});

describe("the record line, per Figure 4", () => {
  const pass = issuePass({
    holderName: DEMO_HOLDER_NAME,
    issuedIn: "KE",
    sequence: 0,
  });
  const mamaOliech = NAMED_PARTNERS.find((p) => p.name === "Mama Oliech")!;
  const event = buildRedemption({
    pass,
    partner: mamaOliech,
    gross: 1000,
    channel: "qr",
    at: DEMO_NOW,
    seq: 0,
  });

  it("writes KES 850 · food and drink / Kasarani ward · 12:55", () => {
    expect(recordLine(event)).toEqual({
      primary: "KES 850 · food and drink",
      secondary: "Kasarani ward · 12:55",
    });
  });

  it("saves KES 150", () => {
    expect(totalSaved([event])).toBe(150);
  });
});
```

- [ ] **Step 2: Run it and confirm it passes**

Run: `npx vitest run src/utils/spec-figures.test.ts`
Expected: PASS, 7 tests. It describes what already works.

- [ ] **Step 3: Prove the guard can fail**

Temporarily change `stay: 210` to `stay: 211` in `src/data/partners.ts`
(`PARTNER_TARGETS`), then run the guard again.

Run: `npx vitest run src/utils/spec-figures.test.ts`
Expected: FAIL on both the total (2190 ≠ 2189) and the split. **Now revert the edit** and
re-run to confirm PASS. A guard you have not watched fail is not a guard.

- [ ] **Step 4: Full suite and lint**

Run: `npm run lint && npm test`
Expected: all green — 13 files, 92 tests (the 12 files and 85 tests already present, plus this file's 7).

- [ ] **Step 5: Commit**

```bash
git add src/utils/spec-figures.test.ts
git commit -m "test: freeze the proposal figures before the restyle moves anything"
```

---

### Task 2: The design tokens — Outfit, JetBrains Mono, and the cooler greys

One commit shifts the whole app's language. No screen is edited: the Tailwind family keys
keep their names and only their faces change.

**Files:**
- Modify: `package.json`, `App.tsx:9-17,29-35`, `tailwind.config.js`, `src/lib/theme.ts`,
  `DESIGN.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: Tailwind classes `font-display-heavy`, `bg-deep-grad`, `bg-deep-deeper`,
  `bg-accent-tint`, `bg-accent-tint-strong`, `text-accent-soft`, `text-ondark-mute`,
  `text-ondark-faint`, `bg-accent-bright`; and on `colors` in `@/lib/theme`:
  `deepGrad`, `deepDeeper`, `accentBright`, `accentPress`, `accentTint`,
  `accentTintStrong`, `accentSoft`, `ondarkMute`, `ondarkFaint`.

- [ ] **Step 1: Swap the font packages**

```bash
npm uninstall @expo-google-fonts/space-grotesk @expo-google-fonts/ibm-plex-mono
npm install @expo-google-fonts/outfit @expo-google-fonts/jetbrains-mono
```

- [ ] **Step 2: Load the new faces**

In `App.tsx`, replace both font imports and the `useFonts` call:

```tsx
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
```

```tsx
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
```

- [ ] **Step 3: Remap the families and add the colour rungs**

In `tailwind.config.js`, replace the `fontFamily` block, keeping every existing key name:

```js
      fontFamily: {
        sans: ["Outfit_400Regular"],
        medium: ["Outfit_500Medium"],
        display: ["Outfit_700Bold"],
        "display-heavy": ["Outfit_800ExtraBold"],
        mono: ["JetBrainsMono_400Regular"],
        "mono-medium": ["JetBrainsMono_500Medium"],
      },
```

In the same file, extend `colors`. `deep` and `accent` gain rungs; `body`, `mute` and
`faint` shift to the canvas's cooler greys; nothing else changes:

```js
        deep: {
          DEFAULT: "#04222b",
          soft: "#223c44",
          grad: "#0a3641",     // second gradient stop
          deeper: "#062b36",   // third gradient stop
        },
        accent: {
          DEFAULT: "#0e6ba8",
          bright: "#1782c4",        // pressed
          press: "#0a5486",         // pressed, on text
          tint: "#e2edf4",          // chip fill on light
          "tint-strong": "#cde2ef",
          soft: "#6fc2e8",          // accent text ON deep
        },
        ondark: {
          mute: "#8ea5ae",
          faint: "#7fa5b4",
        },
        ink: { DEFAULT: "#16181a" },
        body: { DEFAULT: "#4a565b" },   // was #545557 — cooler
        mute: { DEFAULT: "#5a686d" },   // was #676869 — cooler
        faint: { DEFAULT: "#8a9599" },  // was #acadae — cooler
```

- [ ] **Step 4: Mirror the palette in theme.ts**

`src/lib/theme.ts` is used where raw values are needed (maps, icons, shadows, gradients).
Replace the `colors` object:

```ts
export const colors = {
  deep: "#04222b",
  deepSoft: "#223c44",
  deepGrad: "#0a3641",
  deepDeeper: "#062b36",
  accent: "#0e6ba8",
  accentBright: "#1782c4",
  accentPress: "#0a5486",
  accentTint: "#e2edf4",
  accentTintStrong: "#cde2ef",
  accentSoft: "#6fc2e8",
  ondarkMute: "#8ea5ae",
  ondarkFaint: "#7fa5b4",
  ink: "#16181a",
  body: "#4a565b",
  mute: "#5a686d",
  faint: "#8a9599",
  hairline: "#dde3e4",
  panel: "#eef0f0",
  surface: "#f5f8f8",
  canvas: "#ffffff",
} as const;
```

- [ ] **Step 5: Update DESIGN.md**

In the Palette table, correct the `body` / `mute` / `faint` hexes to `#4a565b` /
`#5a686d` / `#8a9599`, and add rows for the nine new tokens with the uses given in Step 3.
Replace the Typography section body with:

```markdown
Headings and body are set in **Outfit** (Uratibu §03) — Regular for body, Medium for
emphasis, Bold for headings, ExtraBold for the large money figures. Everything
procedural — codes, amounts, record lines, pass numbers, timestamps — is set in
**JetBrains Mono**, uppercased for eyebrows, so a glance distinguishes narrative text
from data the user might need to type, read aloud, or match against a physical document.

Families are addressed by semantic key (`font-sans`, `font-medium`, `font-display`,
`font-display-heavy`, `font-mono`, `font-mono-medium`), never by weight utility — the
faces carry the weight. Swapping the faces behind these keys re-letters the whole app
without touching a screen.
```

- [ ] **Step 6: Verify the figures did not move**

Run: `npm run lint && npm test`
Expected: all green. The guard from Task 1 proves no figure shifted.

- [ ] **Step 7: Verify visually — the one thing tests cannot see**

```bash
npm run build
cd dist && python3 -m http.server 8931 &
```

Drive it headlessly (see the memory note `driving-the-app-in-a-browser` for the Playwright
import path and the selector caveats), or open `http://localhost:8931`. Walk issuance →
all four tabs. Check specifically:

- Text renders in Outfit, not a fallback sans — the `a` and `g` are single-storey.
- Mono runs are JetBrains Mono.
- `KES 0` on Home and the Pass card's `Amina Nakato` / `KE-PM-8842` do not wrap or clip.
- The four tab labels still fit.

Stop the server by port when done (`ss -ltnp | grep 8931`), not with `pkill -f`, which
matches its own command line.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: move the app onto Outfit, JetBrains Mono and the cooler grey ramp"
```

---

### Task 3: Match coordinates, team codes, and the kickoffLabel offset defect

`kickoffLabel` currently scrapes the wall clock off the ISO string and takes the weekday
from `getUTCDay()`. That is the same fault `recordLine` carried until `1bbab4e`. It is
correct today only because every seeded kickoff is hand-written at `+03:00` and none
crosses UTC midnight — and this plan adds fixtures.

**Files:**
- Modify: `src/types/index.ts`, `src/data/matches.ts`, `src/utils/match.ts`,
  `src/utils/match.test.ts`

**Interfaces:**
- Consumes: `eatParts` from `@/lib/clock`
- Produces: `Match.coords: { lat: number; lng: number }`;
  `TEAM_CODE: Record<string, string>`; `crestCode(team: string): string`;
  `kickoffLabel(m: Match): string` (fixed)

- [ ] **Step 1: Write the failing tests**

Append to `src/utils/match.test.ts`:

```ts
import { crestCode } from "@/utils/match";
import type { Match } from "@/types";

// A kickoff after midnight EAT is still the previous day in UTC. This is the case the
// old implementation got wrong, and the reason it survived: no seeded fixture hit it.
const AFTER_MIDNIGHT: Match = {
  id: "m-late",
  home: "Kenya",
  away: "Egypt",
  kickoff: "2027-06-27T01:00:00+03:00", // = 2027-06-26T22:00Z, a Saturday in UTC
  venue: "Kasarani",
  city: "Nairobi",
  country: "KE",
  coords: { lat: -1.2226, lng: 36.8917 },
};

describe("kickoffLabel across UTC midnight", () => {
  it("reads the EAT weekday, not the UTC one", () => {
    // 01:00 on Sunday 27 June in Nairobi — not Saturday, which is what UTC says.
    expect(kickoffLabel(AFTER_MIDNIGHT)).toBe("Sun 01:00 · Kasarani");
  });
});

describe("crestCode", () => {
  it("uses the official three-letter code, which is not a truncation", () => {
    expect(crestCode("Mali")).toBe("MLI"); // not "MAL"
    expect(crestCode("Côte d'Ivoire")).toBe("CIV");
  });

  it("codes every seeded nation", () => {
    expect(crestCode("Kenya")).toBe("KEN");
    expect(crestCode("Zambia")).toBe("ZAM");
    expect(crestCode("Morocco")).toBe("MAR");
    expect(crestCode("Uganda")).toBe("UGA");
    expect(crestCode("Senegal")).toBe("SEN");
    expect(crestCode("Egypt")).toBe("EGY");
  });

  it("falls back to the first three letters for an unseeded name", () => {
    expect(crestCode("Namibia")).toBe("NAM");
  });
});
```

- [ ] **Step 2: Run and watch them fail**

Run: `npx vitest run src/utils/match.test.ts`
Expected: FAIL — `crestCode` is not exported, and the midnight test reports
`Sat 01:00 · Kasarani` against the expected `Sun 01:00 · Kasarani`. Both failures are the
point; a type error on `coords` is also expected until Step 3.

- [ ] **Step 3: Add coords to the Match type and every fixture**

In `src/types/index.ts`, extend `Match`:

```ts
export interface Match {
  id: string;
  home: string;
  away: string;
  kickoff: string; // ISO, with the venue's own +03:00 offset
  venue: string;
  city: string;
  country: HostCountry;
  /** Venue centre — "400m from Gate D" and the route screen both read this. */
  coords: { lat: number; lng: number };
}
```

In `src/data/matches.ts`, add `coords` to all four existing fixtures. Venue centres:

```ts
// Kasarani
coords: { lat: -1.2226, lng: 36.8917 },
// Nyayo
coords: { lat: -1.3044, lng: 36.8264 },
```

Kenya v Mali, Kenya v Morocco and Senegal v Egypt are at Kasarani; Côte d'Ivoire v Zambia
is at Nyayo.

- [ ] **Step 4: Fix kickoffLabel and add the codes**

Replace the bottom of `src/utils/match.ts`:

```ts
import { eatParts } from "@/lib/clock";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Official three-letter codes. A substring rule cannot do this job: Mali is MLI, not
 * MAL, and "Côte d'Ivoire" has no sane truncation.
 */
export const TEAM_CODE: Record<string, string> = {
  Kenya: "KEN",
  Mali: "MLI",
  Zambia: "ZAM",
  Morocco: "MAR",
  Uganda: "UGA",
  Senegal: "SEN",
  "Côte d'Ivoire": "CIV",
  Egypt: "EGY",
};

export function crestCode(team: string): string {
  return TEAM_CODE[team] ?? team.slice(0, 3).toUpperCase();
}

/** "Sat 16:00 · Kasarani" — the day and time as East Africa reads them. */
export function kickoffLabel(m: Match): string {
  const { day, time } = eatParts(m.kickoff);
  const weekday = DAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
  return `${weekday} ${time} · ${m.venue}`;
}
```

Delete the old `DAYS` declaration and the old `kickoffLabel` body.

- [ ] **Step 5: Run and watch them pass**

Run: `npx vitest run src/utils/match.test.ts`
Expected: PASS. The pre-existing assertion `kickoffLabel(m) === "Sat 16:00 · Kasarani"`
must still pass — the fix is offset-agnostic, so it is correct for both the hand-authored
`+03:00` fixtures and any UTC-normalised instant.

- [ ] **Step 6: Full suite, lint, and the time-seam guard**

Run: `npm run lint && npm test`
Expected: all green.

Run: `grep -rn "Date.now()\|new Date()" src/ --include=*.ts --include=*.tsx | grep -v "src/lib/clock.ts"`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: read kickoff labels in EAT, and code crests from a map not a truncation"
```

---

### Task 4: Live matches — phase, minute, and two fixtures in play

**Files:**
- Modify: `src/types/index.ts`, `src/data/matches.ts`, `src/utils/match.ts`,
  `src/utils/match.test.ts`, `src/data/repository.ts`
- Create: `src/data/live.ts`

**Interfaces:**
- Consumes: `Match`, `crestCode` from Task 3
- Produces: `MatchPhase`; `MatchLive`;
  `matchPhase(m: Match, at: Date): MatchPhase`;
  `liveMinute(m: Match, at: Date): number | null`;
  `liveMatches(matches: Match[], at: Date): Match[]`;
  `MATCH_LIVE: MatchLive[]`; `fetchMatchLive(): Promise<MatchLive[]>`

- [ ] **Step 1: Write the failing tests**

Append to `src/utils/match.test.ts`:

```ts
import { liveMatches, liveMinute, matchPhase } from "@/utils/match";

// Kickoffs are chosen so the minutes come out clean once the 15-minute interval is
// subtracted. At the demo instant (12:55 EAT) Zambia v Morocco is 85 wall-minutes in.
const ZAM_MAR = () => MATCHES.find((m) => m.id === "m-zam-mar")!;
const UGA_SEN = () => MATCHES.find((m) => m.id === "m-uga-sen")!;

describe("matchPhase", () => {
  const m = ZAM_MAR();
  const at = (wall: number) =>
    new Date(new Date(m.kickoff).getTime() + wall * 60_000);

  it("is scheduled before kickoff", () => {
    expect(matchPhase(m, at(-1))).toBe("scheduled");
  });

  it("is live through the first half", () => {
    expect(matchPhase(m, at(0))).toBe("live");
    expect(matchPhase(m, at(45))).toBe("live");
  });

  it("is half-time across the interval", () => {
    expect(matchPhase(m, at(46))).toBe("half-time");
    expect(matchPhase(m, at(60))).toBe("half-time");
  });

  it("is live again through the second half", () => {
    expect(matchPhase(m, at(61))).toBe("live");
    expect(matchPhase(m, at(105))).toBe("live");
  });

  it("is full-time after 105 wall-minutes", () => {
    expect(matchPhase(m, at(106))).toBe("full-time");
  });
});

describe("liveMinute", () => {
  const m = ZAM_MAR();
  const at = (wall: number) =>
    new Date(new Date(m.kickoff).getTime() + wall * 60_000);

  it("counts wall-minutes in the first half", () => {
    expect(liveMinute(m, at(30))).toBe(30);
  });

  it("holds at 45 through the interval", () => {
    expect(liveMinute(m, at(52))).toBe(45);
  });

  it("subtracts the interval in the second half", () => {
    expect(liveMinute(m, at(85))).toBe(70);
  });

  it("is null when the match is not in play", () => {
    expect(liveMinute(m, at(-1))).toBeNull();
    expect(liveMinute(m, at(200))).toBeNull();
  });
});

describe("liveMatches at the demo instant", () => {
  it("returns both Wednesday fixtures, most advanced first", () => {
    const live = liveMatches(MATCHES, DEMO_NOW);
    expect(live.map((m) => m.id)).toEqual(["m-zam-mar", "m-uga-sen"]);
  });

  it("reads 70' and 55'", () => {
    const [featured, also] = liveMatches(MATCHES, DEMO_NOW);
    expect(liveMinute(featured, DEMO_NOW)).toBe(70);
    expect(liveMinute(also, DEMO_NOW)).toBe(55);
  });

  it("leaves the next fixture alone — Home still reads Kenya v Mali", () => {
    expect(nextMatch(MATCHES, DEMO_NOW)?.id).toBe("m-ken-mli");
  });

  it("is empty once the tournament is over", () => {
    expect(liveMatches(MATCHES, new Date("2027-08-01T12:00:00+03:00"))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and watch them fail**

Run: `npx vitest run src/utils/match.test.ts`
Expected: FAIL — the three functions are not exported and the two fixtures do not exist.

- [ ] **Step 3: Add the types**

In `src/types/index.ts`, after `Match`:

```ts
export type MatchPhase = "scheduled" | "live" | "half-time" | "full-time";

/** Seeded score and stats. The minute is never stored — it derives from the clock. */
export interface MatchLive {
  matchId: string;
  home: number; // goals
  away: number;
  possession: [number, number];
  shots: [number, number];
  corners: [number, number];
}
```

- [ ] **Step 4: Seed the two live fixtures**

Append to `MATCHES` in `src/data/matches.ts`:

```ts
  // In play at the demo instant. Kickoffs are chosen so that once the 15-minute
  // interval is subtracted the minutes read 70' and 55' — the app derives them, so
  // the drawing's 71' and 58' were never reachable from a round kickoff.
  {
    id: "m-zam-mar",
    home: "Zambia", away: "Morocco",
    kickoff: "2027-06-23T11:30:00+03:00",
    venue: "Nyayo", city: "Nairobi", country: "KE",
    coords: { lat: -1.3044, lng: 36.8264 },
  },
  {
    id: "m-uga-sen",
    home: "Uganda", away: "Senegal",
    kickoff: "2027-06-23T11:45:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
    coords: { lat: -1.2226, lng: 36.8917 },
  },
```

- [ ] **Step 5: Create the live data**

Create `src/data/live.ts`:

```ts
import type { MatchLive } from "@/types";

// Scores and stats are seeded, not fetched: Section 12's decisions are outstanding and
// no live feed exists. Only the minute is derived, from the clock.
export const MATCH_LIVE: MatchLive[] = [
  {
    matchId: "m-zam-mar",
    home: 0,
    away: 2,
    possession: [42, 58],
    shots: [4, 9],
    corners: [2, 5],
  },
  {
    matchId: "m-uga-sen",
    home: 1,
    away: 1,
    possession: [51, 49],
    shots: [6, 7],
    corners: [3, 3],
  },
];
```

- [ ] **Step 6: Implement the three functions**

Append to `src/utils/match.ts`:

```ts
import type { MatchPhase } from "@/types";

const HALF = 45;
const INTERVAL = 15;
const FULL = HALF * 2 + INTERVAL; // 105 wall-minutes from kickoff to full time

/** Whole minutes of wall clock since kickoff. Negative before it starts. */
function wallMinutes(m: Match, at: Date): number {
  return Math.floor((at.getTime() - new Date(m.kickoff).getTime()) / 60_000);
}

export function matchPhase(m: Match, at: Date): MatchPhase {
  const wall = wallMinutes(m, at);
  if (wall < 0) return "scheduled";
  if (wall <= HALF) return "live";
  if (wall <= HALF + INTERVAL) return "half-time";
  if (wall <= FULL) return "live";
  return "full-time";
}

/** Playing minute, or null when the match is not in play. */
export function liveMinute(m: Match, at: Date): number | null {
  const phase = matchPhase(m, at);
  if (phase === "scheduled" || phase === "full-time") return null;
  if (phase === "half-time") return HALF;
  const wall = wallMinutes(m, at);
  return wall <= HALF ? wall : wall - INTERVAL;
}

/** In play now, most advanced first: the first is featured, the rest are "also live". */
export function liveMatches(matches: Match[], at: Date): Match[] {
  return matches
    .filter((m) => {
      const phase = matchPhase(m, at);
      return phase === "live" || phase === "half-time";
    })
    .sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );
}
```

- [ ] **Step 7: Expose it through the repository seam**

In `src/data/repository.ts`, add the import and the fetch, following the existing pattern
exactly:

```ts
import { MATCH_LIVE } from "./live";
```

```ts
export async function fetchMatchLive(): Promise<MatchLive[]> {
  return cached("live", () => MATCH_LIVE);
}
```

Add `MatchLive` to the type import at the top of the file.

- [ ] **Step 8: Run and watch them pass**

Run: `npx vitest run src/utils/match.test.ts`
Expected: PASS, including the pre-existing `nextMatch` tests — both new fixtures kicked
off before the demo instant, so the next fixture is still Kenya v Mali on Saturday.

- [ ] **Step 9: Full suite and lint**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: derive match phase and minute, and seed two fixtures in play"
```

---

### Task 5: The derivations Home, Wallet and the Pass need

Every new number on a screen is computed here first, so no component invents one.

**Files:**
- Modify: `src/utils/record.ts`, `src/utils/record.test.ts`, `src/utils/format.ts`,
  `src/utils/format.test.ts`, `src/utils/match.ts`, `src/utils/match.test.ts`

**Interfaces:**
- Consumes: `PassEvent` from `@/types`; `eatParts` from `@/lib/clock`; `Match` from Task 3
- Produces:
  `weekSavings(events: PassEvent[], at: Date): number`;
  `savingsRate(events: PassEvent[]): number`;
  `offersUsed(events: PassEvent[]): number`;
  `savingsSeries(events: PassEvent[], at: Date, days: number): number[]`;
  `initials(name: string): string`;
  `gatesOpenLabel(m: Match): string`;
  `daysUntilLabel(m: Match, at: Date): string`

- [ ] **Step 1: Write the failing record tests**

Append to `src/utils/record.test.ts`:

```ts
import { offersUsed, savingsRate, savingsSeries, weekSavings } from "@/utils/record";
import { DEMO_NOW } from "@/lib/clock";

/** A purchase on a given EAT day, saving `discount` off `gross`. */
function purchase(day: string, gross: number, discount: number, seq: number): PassEvent {
  return {
    id: `e-${seq}`,
    passId: "KE-PM-8842",
    kind: "purchase",
    at: new Date(`${day}T12:55:00+03:00`).toISOString(),
    place: { name: "Mama Oliech", ward: "Kasarani ward", city: "Nairobi", country: "KE" },
    channel: "qr",
    amount: { currency: "KES", gross, discount, net: gross - discount },
  };
}

describe("weekSavings", () => {
  it("counts the trailing seven days, today included", () => {
    const events = [
      purchase("2027-06-23", 1000, 150, 1), // today
      purchase("2027-06-19", 400, 60, 2),   // 4 days back
      purchase("2027-06-10", 900, 200, 3),  // outside the window
    ];
    expect(weekSavings(events, DEMO_NOW)).toBe(210);
  });

  it("is zero on an empty record", () => {
    expect(weekSavings([], DEMO_NOW)).toBe(0);
  });
});

describe("savingsRate", () => {
  it("is saved over gross — 150 off 1,000 is 0.15", () => {
    expect(savingsRate([purchase("2027-06-23", 1000, 150, 1)])).toBeCloseTo(0.15);
  });

  it("is zero on an empty record rather than NaN", () => {
    expect(savingsRate([])).toBe(0);
  });
});

describe("offersUsed", () => {
  it("counts purchases only, not border or turnstile lines", () => {
    const events: PassEvent[] = [
      purchase("2027-06-23", 1000, 150, 1),
      purchase("2027-06-22", 500, 50, 2),
      {
        id: "e-b", passId: "KE-PM-8842", kind: "border",
        at: new Date("2027-06-21T08:00:00+03:00").toISOString(),
        place: { name: "Malaba", city: "Malaba", country: "KE" }, channel: "nfc",
      },
    ];
    expect(offersUsed(events)).toBe(2);
  });
});

describe("savingsSeries", () => {
  it("returns one bucket per day, oldest first", () => {
    const series = savingsSeries([purchase("2027-06-23", 1000, 150, 1)], DEMO_NOW, 7);
    expect(series).toHaveLength(7);
    expect(series[6]).toBe(150); // today is the last bucket
    expect(series.slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("buckets by EAT day, not UTC day", () => {
    // 01:30 EAT on the 23rd is 22:30Z on the 22nd. It belongs to the 23rd.
    const late: PassEvent = {
      ...purchase("2027-06-23", 200, 20, 9),
      at: new Date("2027-06-23T01:30:00+03:00").toISOString(),
    };
    expect(savingsSeries([late], DEMO_NOW, 7)[6]).toBe(20);
  });
});
```

- [ ] **Step 2: Run and watch them fail**

Run: `npx vitest run src/utils/record.test.ts`
Expected: FAIL — none of the four functions is exported.

- [ ] **Step 3: Implement the record derivations**

Append to `src/utils/record.ts`:

```ts
/** The EAT day an event belongs to, as a sortable "2027-06-23". */
function eatDay(iso: string): string {
  return eatParts(iso).day;
}

/** Days between two EAT day strings. */
function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000
  );
}

/** Discounts from the trailing seven days, today included. */
export function weekSavings(events: PassEvent[], at: Date): number {
  const today = eatDay(at.toISOString());
  return events
    .filter((e) => {
      const age = daysBetween(eatDay(e.at), today);
      return age >= 0 && age < 7;
    })
    .reduce((sum, e) => sum + (e.amount?.discount ?? 0), 0);
}

/** Saved as a share of gross. Zero on an empty record, never NaN. */
export function savingsRate(events: PassEvent[]): number {
  const gross = totalSaved(events) + totalSpent(events);
  return gross === 0 ? 0 : totalSaved(events) / gross;
}

/** How many offers the fan has actually used. */
export function offersUsed(events: PassEvent[]): number {
  return events.filter((e) => e.kind === "purchase").length;
}

/** Savings per EAT day for the last `days` days, oldest first — the sparkline. */
export function savingsSeries(
  events: PassEvent[],
  at: Date,
  days: number
): number[] {
  const today = eatDay(at.toISOString());
  const buckets = new Array<number>(days).fill(0);
  for (const e of events) {
    const age = daysBetween(eatDay(e.at), today);
    if (age >= 0 && age < days) {
      buckets[days - 1 - age] += e.amount?.discount ?? 0;
    }
  }
  return buckets;
}
```

- [ ] **Step 4: Run and watch them pass**

Run: `npx vitest run src/utils/record.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing format and match-label tests**

Append to `src/utils/format.test.ts`:

```ts
import { initials } from "@/utils/format";

describe("initials", () => {
  it("takes the first two words", () => {
    expect(initials("Amina Nakato")).toBe("AN");
  });

  it("handles a single name", () => {
    expect(initials("Amina")).toBe("A");
  });

  it("ignores extra words and stray spacing", () => {
    expect(initials("  amina grace nakato ")).toBe("AG");
  });
});
```

Append to `src/utils/match.test.ts`:

```ts
import { daysUntilLabel, gatesOpenLabel } from "@/utils/match";

describe("gatesOpenLabel", () => {
  it("opens two hours before kickoff, in EAT", () => {
    expect(gatesOpenLabel(nextMatch(MATCHES, DEMO_NOW)!)).toBe("14:00");
  });
});

describe("daysUntilLabel", () => {
  const fixture = () => nextMatch(MATCHES, DEMO_NOW)!;

  it("reads IN 3 DAYS from Wednesday to Saturday", () => {
    // The drawing says IN 2 DAYS; from the demo instant that is wrong by a day.
    expect(daysUntilLabel(fixture(), DEMO_NOW)).toBe("IN 3 DAYS");
  });

  it("reads TODAY on the day itself", () => {
    expect(daysUntilLabel(fixture(), new Date("2027-06-26T09:00:00+03:00"))).toBe("TODAY");
  });

  it("reads TOMORROW the day before", () => {
    expect(daysUntilLabel(fixture(), new Date("2027-06-25T09:00:00+03:00"))).toBe("TOMORROW");
  });
});
```

- [ ] **Step 6: Run and watch them fail**

Run: `npx vitest run src/utils/format.test.ts src/utils/match.test.ts`
Expected: FAIL — `initials`, `gatesOpenLabel` and `daysUntilLabel` are not exported.

- [ ] **Step 7: Implement them**

Append to `src/utils/format.ts`:

```ts
/** "Amina Nakato" → "AN". The avatar disc on Home. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
```

Append to `src/utils/match.ts`:

```ts
const GATES_OPEN_BEFORE_MS = 2 * 60 * 60 * 1000;

/** "14:00" — when the turnstiles open, two hours before kickoff, in EAT. */
export function gatesOpenLabel(m: Match): string {
  const opens = new Date(
    new Date(m.kickoff).getTime() - GATES_OPEN_BEFORE_MS
  ).toISOString();
  return eatParts(opens).time;
}

/** "TODAY", "TOMORROW", "IN 3 DAYS" — counted in EAT days, never hard-coded. */
export function daysUntilLabel(m: Match, at: Date): string {
  const kickoffDay = eatParts(m.kickoff).day;
  const today = eatParts(at.toISOString()).day;
  const days = Math.round(
    (Date.parse(`${kickoffDay}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000
  );
  if (days === 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  return `IN ${days} DAYS`;
}
```

- [ ] **Step 8: Run everything**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: derive week savings, savings rate, sparkline buckets and match labels"
```

---

### Task 6: The shared primitives

Seven presentational components. Every number and code they display was derived and tested
in Tasks 3–5, so these hold no logic worth a unit test — and `vitest.config.ts` collects
only `.test.ts`, so there is no renderer to test them with. Their gate is `npm run lint`
(prop types) plus the build; their visual gate arrives with Task 7, which is the first
screen to mount them.

**Files:**
- Create: `src/components/pamoja/Crest.tsx`, `Chip.tsx`, `Avatar.tsx`, `StatTrio.tsx`,
  `Sparkline.tsx`, `Donut.tsx`, `SearchField.tsx`
- Modify: `src/lib/strings.ts`

**Interfaces:**
- Consumes: `crestCode` from `@/utils/match`; `initials` from `@/utils/format`; `colors`
  from `@/lib/theme`
- Produces:
  `<Crest team={string} tone?: "deep" | "panel" />`;
  `<Chip label={string} tone?: "accent" | "tint" | "ondark" | "panel" />`;
  `<Avatar name={string} />`;
  `<StatTrio items={{ value: string; label: string }[]} tone?: "light" | "dark" />`;
  `<Sparkline values={number[]} />`;
  `<Donut value={number} label={string} />`;
  `<SearchField value={string} onChangeText={(t: string) => void} placeholder={string} />`

- [ ] **Step 1: Crest**

```tsx
import { Text, View } from "react-native";

import { crestCode } from "@/utils/match";

/** "KEN" — the three-letter tile either side of a fixture. */
export function Crest({
  team,
  tone = "panel",
}: {
  team: string;
  tone?: "deep" | "panel";
}) {
  const dark = tone === "deep";
  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-card ${
        dark ? "bg-deep" : "bg-panel"
      }`}
    >
      <Text
        className={`font-display text-[13px] tracking-[0.5px] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {crestCode(team)}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Chip**

```tsx
import { Text, View } from "react-native";

/** A small uppercase mono pill: "IN 3 DAYS", "+450 THIS WEEK", "CAT 2". */
export function Chip({
  label,
  tone = "tint",
}: {
  label: string;
  tone?: "accent" | "tint" | "ondark" | "panel";
}) {
  const tones = {
    accent: { bg: "bg-accent", text: "text-white" },
    tint: { bg: "bg-accent-tint", text: "text-accent" },
    ondark: { bg: "bg-deep-grad", text: "text-accent-soft" },
    panel: { bg: "bg-panel", text: "text-mute" },
  } as const;
  const t = tones[tone];
  return (
    <View className={`self-start rounded-full px-3 py-1.5 ${t.bg}`}>
      <Text
        className={`font-mono-medium text-[10px] uppercase tracking-[1.2px] ${t.text}`}
      >
        {label}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Avatar**

```tsx
import { Text, View } from "react-native";

import { initials } from "@/utils/format";

/** The holder's initials, top-right of Home. */
export function Avatar({ name }: { name: string }) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full bg-deep">
      <Text className="font-display text-[14px] tracking-[0.5px] text-white">
        {initials(name)}
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: StatTrio**

```tsx
import { Text, View } from "react-native";

/** Three figures side by side — possession/shots/corners, or distance/time/wait. */
export function StatTrio({
  items,
  tone = "light",
}: {
  items: { value: string; label: string }[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <View className="flex-row">
      {items.map((item, i) => (
        <View
          key={item.label}
          className={`flex-1 items-center py-3 ${
            i > 0 ? "border-l border-hairline" : ""
          }`}
        >
          <Text
            className={`font-display text-[19px] ${dark ? "text-white" : "text-ink"}`}
          >
            {item.value}
          </Text>
          <Text
            className={`mt-1 font-mono text-[10px] uppercase tracking-[1.2px] ${
              dark ? "text-ondark-mute" : "text-mute"
            }`}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 5: Sparkline**

Bars, not a chart library — the app ships no charting dependency and this needs none.

```tsx
import { View } from "react-native";

/** Daily savings as bars, oldest left. The last bar is today, and is the accent one. */
export function Sparkline({ values }: { values: number[] }) {
  const peak = Math.max(...values, 1);
  return (
    <View className="h-8 flex-row items-end">
      {values.map((value, i) => {
        const last = i === values.length - 1;
        return (
          <View
            key={i}
            className={`mr-1 w-1.5 rounded-sm ${last ? "bg-accent" : "bg-deep-grad"}`}
            // A zero-savings day still shows a 2px stub, so the axis reads as a row
            // of days rather than a gap.
            style={{ height: Math.max(2, (value / peak) * 32) }}
          />
        );
      })}
    </View>
  );
}
```

- [ ] **Step 6: Donut**

A ring drawn with two nested views and a border — no SVG dependency.

```tsx
import { Text, View } from "react-native";

import { colors } from "@/lib/theme";

/** The savings-rate ring on the Wallet. `value` is 0–1. */
export function Donut({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <View className="h-16 w-16 items-center justify-center">
      <View
        className="absolute h-16 w-16 rounded-full"
        style={{ borderWidth: 6, borderColor: colors.panel }}
      />
      <View
        className="absolute h-16 w-16 rounded-full"
        style={{
          borderWidth: 6,
          borderColor: colors.accent,
          // A full ring reads as complete; a partial one leaves the base colour
          // showing on the sides it does not cover.
          borderRightColor: pct < 75 ? colors.panel : colors.accent,
          borderBottomColor: pct < 50 ? colors.panel : colors.accent,
          borderLeftColor: pct < 25 ? colors.panel : colors.accent,
          transform: [{ rotate: "-45deg" }],
        }}
      />
      <Text className="font-display text-[13px] text-ink">{`${pct}%`}</Text>
    </View>
  );
}
```

The ring is decorative, so the percentage carries the meaning; `label` is used for the
accessibility label on the outer `View` — set `accessibilityLabel={label}` there rather
than reaching for `sr-only`, which is a web-only Tailwind utility with no NativeWind
equivalent.

- [ ] **Step 7: SearchField**

```tsx
import { TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-row items-center rounded-card border border-hairline bg-canvas px-4 py-3">
      <Icon name="search" size={16} color={colors.faint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        className="ml-2.5 flex-1 text-[15px] text-ink"
      />
    </View>
  );
}
```

- [ ] **Step 8: Verify types and build**

Run: `npm run lint && npm test`
Expected: all green. Unused components do not fail the type check, but their props do.

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add the crest, chip, avatar, stat, sparkline, donut and search primitives"
```

---

### Task 7: Home

**Files:**
- Create: `src/components/pamoja/MoneyBox.tsx`
- Modify: `src/screens/HomeScreen.tsx`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `Crest`, `Chip`, `Avatar`, `Sparkline` (Task 6); `daysUntilLabel`,
  `gatesOpenLabel`, `kickoffLabel`, `matchLabel`, `nextMatch` (Tasks 3, 5);
  `weekSavings`, `savingsSeries`, `offersUsed`, `totalSaved` (Task 5); `initials`
- Produces:
  `<MoneyBox saved={number} week={number} series={number[]} offers={number} onBrowse={() => void} />`

- [ ] **Step 1: Add the copy**

In `src/lib/strings.ts`, in the HomeScreen block, add:

```ts
  homeMatchday: "Matchday",
  homeGatesOpenPrefix: "Gates open",
  homeViewPass: "View pass",
  homeBrowseOffers: "Browse offers",
  homeSeeAll: "See all",
  homeThisWeekPrefix: "+",
  homeThisWeekSuffix: "THIS WEEK",
  homeOffersUsedSuffix: "offers used",
```

Note: the drawing's `3 offers used · pass perks counted in` loses its second clause. A
ticket's perks are an entitlement's stated value and are never part of the record — see
the spec's *Two savings figures*.

- [ ] **Step 2: Build MoneyBox**

```tsx
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

import { Button } from "@/components/ui";
import { Chip } from "@/components/pamoja/Chip";
import { Sparkline } from "@/components/pamoja/Sparkline";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { kes } from "@/utils/format";

// LinearGradient is a third-party component, so NativeWind will not style it from a
// className until it is registered. src/components/AppImage.tsx does the same for
// expo-image; without this the padding and margin below are silently dropped.
cssInterop(LinearGradient, { className: "style" });

/**
 * The savings panel. This figure is the record's own total and nothing else moves it —
 * no ticket perk, no promotional credit. Rev. 2 §09.
 */
export function MoneyBox({
  saved,
  week,
  series,
  offers,
  onBrowse,
}: {
  saved: number;
  week: number;
  series: number[];
  offers: number;
  onBrowse: () => void;
}) {
  return (
    <LinearGradient
      colors={[colors.deep, colors.deepGrad, colors.deepDeeper]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mt-4 rounded-card px-5 py-5"
    >
      <View className="flex-row items-start justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-ondark-mute">
          {S.homeYouveSaved}
        </Text>
        {week > 0 ? (
          <Chip
            label={`${S.homeThisWeekPrefix}${week} ${S.homeThisWeekSuffix}`}
            tone="ondark"
          />
        ) : null}
      </View>

      <View className="mt-2 flex-row items-end justify-between">
        <Text className="font-display-heavy text-[36px] tracking-[-1px] text-white">
          {kes(saved)}
        </Text>
        <View className="pb-1.5">
          <Sparkline values={series} />
        </View>
      </View>

      {saved === 0 ? (
        <Text className="mt-2 font-mono text-[11px] leading-4 text-ondark-faint">
          {S.homeSavedEmptyHint}
        </Text>
      ) : (
        <Text className="mt-2 text-[13px] text-ondark-mute">
          {`${offers} ${S.homeOffersUsedSuffix}`}
        </Text>
      )}

      <Button
        title={S.homeBrowseOffers}
        variant="primary"
        className="mt-4 self-start bg-accent"
        onPress={onBrowse}
      />
    </LinearGradient>
  );
}
```

- [ ] **Step 3: Rebuild HomeScreen**

Replace `src/screens/HomeScreen.tsx` in full. The resident/arrived variant from
`homeVariant` is preserved — a fan who flew in still leads with validity and the border.

```tsx
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/pamoja/Avatar";
import { Chip } from "@/components/pamoja/Chip";
import { Crest } from "@/components/pamoja/Crest";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { MoneyBox } from "@/components/pamoja/MoneyBox";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { fetchMatches } from "@/data/repository";
import { usePartnerStore } from "@/store/usePartnerStore";
import { usePassStore } from "@/store/usePassStore";
import { useRecordStore } from "@/store/useRecordStore";
import { distanceKm, km } from "@/utils/format";
import { homeVariant } from "@/utils/home";
import {
  daysUntilLabel,
  gatesOpenLabel,
  kickoffLabel,
  matchLabel,
  nextMatch,
} from "@/utils/match";
import { nearby } from "@/utils/partners";
import { validityLabel } from "@/utils/pass";
import { offersUsed, savingsSeries, totalSaved, weekSavings } from "@/utils/record";
import type { Match } from "@/types";

/** Where the fan is standing. Kasarani, so Figure 2's lunch is the nearest offer. */
const KASARANI = { lat: -1.2266, lng: 36.8899 };

/** "SAT · 16:00" — the drawing's dot-separated form, from the derived label. */
function kickoffChip(fixture: Match): string {
  const [dayAndTime] = kickoffLabel(fixture).split(" · ");
  const [weekday, time] = dayAndTime.split(" ");
  return `${weekday.toUpperCase()} · ${time}`;
}

function FixtureCard({
  fixture,
  onViewPass,
}: {
  fixture: Match;
  onViewPass: () => void;
}) {
  return (
    <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 pt-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="font-mono text-[12px] tracking-[1.5px] text-accent">
            {kickoffChip(fixture)}
          </Text>
          <View className="ml-2.5">
            <Chip label={daysUntilLabel(fixture, now())} tone="accent" />
          </View>
        </View>
        <Chip label={fixture.venue} tone="panel" />
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Crest team={fixture.home} tone="deep" />
        <Text className="flex-1 px-3 text-center font-display text-[19px] text-ink">
          {matchLabel(fixture)}
        </Text>
        <Crest team={fixture.away} />
      </View>

      <View className="mt-4 flex-row items-center justify-between border-t border-hairline py-4">
        <Text className="text-[13px] text-body">
          {`${S.homeGatesOpenPrefix} ${gatesOpenLabel(fixture)}`}
        </Text>
        <Pressable onPress={onViewPass}>
          <Text className="font-medium text-[14px] text-accent">
            {S.homeViewPass}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

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

  const at = now();
  const variant = homeVariant(events);
  const fixture = nextMatch(matches, at);
  const offers = nearby(partners, KASARANI, 3);
  const crossing = events.find((e) => e.kind === "border");

  const money = (
    <MoneyBox
      saved={totalSaved(events)}
      week={weekSavings(events, at)}
      series={savingsSeries(events, at, 7)}
      offers={offersUsed(events)}
      onBrowse={() => navigation.navigate("Services")}
    />
  );

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Eyebrow>{S.homeToday}</Eyebrow>
            <Text className="mt-1 font-display text-[26px] tracking-[-0.5px] text-ink">
              {S.homeMatchday}
            </Text>
          </View>
          {pass ? <Avatar name={pass.holderName} /> : null}
        </View>

        {variant === "resident" ? (
          <>
            {fixture ? (
              <FixtureCard
                fixture={fixture}
                onViewPass={() => navigation.navigate("Pass")}
              />
            ) : null}
            {money}
          </>
        ) : (
          <>
            {pass ? (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 py-5">
                <Text className="font-medium text-[22px] text-ink">
                  {validityLabel(pass, at)}
                </Text>
                {crossing ? (
                  <Text className="mt-1 font-mono text-[12px] text-mute">
                    {`${S.homeEnteredAtPrefix} ${crossing.place.name}`}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {money}
          </>
        )}

        <View className="mt-8 flex-row items-center justify-between">
          <Eyebrow>{S.homeOffersNearYou}</Eyebrow>
          <Pressable onPress={() => navigation.navigate("Services")}>
            <Text className="font-medium text-[13px] text-accent">
              {S.homeSeeAll}
            </Text>
          </Pressable>
        </View>
        <View className="mt-2">
          {offers.map((p) => (
            <OfferRow
              key={p.id}
              partner={p}
              subline={
                fixture
                  ? km(distanceKm(p.coords, fixture.coords))
                  : undefined
              }
              onPress={() => navigation.navigate("Partner", { partnerId: p.id })}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 4: Give OfferRow its initial tile and subline**

Replace `src/components/pamoja/OfferRow.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";

import { colors } from "@/lib/theme";
import type { Partner } from "@/types";

/** "Mama Oliech    −15%", exactly as Home lists them in Figure 3, now with distance. */
export function OfferRow({
  partner,
  subline,
  onPress,
}: {
  partner: Partner;
  subline?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-hairline py-3 active:opacity-70"
    >
      <View className="h-10 w-10 items-center justify-center rounded-card bg-panel">
        <Text className="font-display text-[14px] text-ink">
          {partner.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-ink">{partner.name}</Text>
        {subline ? (
          <Text className="mt-0.5 font-mono text-[11px] text-mute">{subline}</Text>
        ) : null}
      </View>
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

- [ ] **Step 5: Run the suite and lint**

Run: `npm run lint && npm test`
Expected: all green. `nearby` already returns partners with `coords`, so `distanceKm`
type-checks.

- [ ] **Step 6: Verify in the browser**

Build, serve, drive. Confirm on Home:

- Eyebrow `TODAY` over `Matchday`, and an `AN` avatar — not `JK`.
- Fixture card reads `SAT`, chip `IN 3 DAYS` (not `IN 2 DAYS`), crests `KEN` and `MLI`,
  `Gates open 14:00`, `View pass`.
- Money box reads `KES 0` with the empty hint on a fresh profile, and after one Mama
  Oliech redemption reads `KES 150`, `+150 THIS WEEK`, `1 offers used`.
- Offers carry a distance subline.

Note `1 offers used` is grammatically wrong for a single offer. Fix it now by
pluralising in `MoneyBox`: use `offers === 1 ? "offer used" : "offers used"`, and split
`S.homeOffersUsedSuffix` into `homeOfferUsedSuffix` / `homeOffersUsedSuffix`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: rebuild Home with the fixture card, gradient money box and sparkline"
```

---

### Task 8: The Live tab, and five tabs in the bar

**Files:**
- Create: `src/screens/LiveScreen.tsx`
- Modify: `src/navigation/types.ts`, `src/navigation/TabNavigator.tsx`,
  `src/lib/strings.ts`

**Interfaces:**
- Consumes: `liveMatches`, `liveMinute`, `matchPhase`, `nextMatch`, `crestCode`,
  `matchLabel`, `kickoffLabel`, `daysUntilLabel` (Tasks 3–5); `fetchMatches`,
  `fetchMatchLive`; `Crest`, `Chip`, `StatTrio`, `Eyebrow`
- Produces: `LiveScreen`; `TabParamList` with `Live`

- [ ] **Step 1: Add the copy**

In `src/lib/strings.ts`, add a LiveScreen block in screen order (between IssuanceScreen
and PartnerScreen):

```ts
  // ── LiveScreen ──────────────────────────────────────────────────────────
  liveTitle: "Live",
  liveBadge: "LIVE",
  liveHalfTime: "HALF TIME",
  liveAlsoLive: "Also live",
  livePossession: "Possession",
  liveShots: "Shots",
  liveCorners: "Corners",
  liveNothingOn: "Nothing is kicking off right now.",
  liveNextUp: "Next up",
```

- [ ] **Step 2: Register the tab**

In `src/navigation/types.ts`, add `Live: undefined;` to `TabParamList` between `Explore`
and `Services`.

In `src/navigation/TabNavigator.tsx`, add the import, the icon and the screen — in the
canvas's order, Live third:

```tsx
import { LiveScreen } from "@/screens/LiveScreen";
```

```tsx
const ICONS: Record<keyof TabParamList, IconName> = {
  Home: "home",
  Explore: "compass",
  Live: "play-circle",
  Services: "grid",
  Pass: "credit-card",
};
```

```tsx
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Pass" component={PassScreen} />
```

- [ ] **Step 3: Build the screen**

```tsx
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Chip } from "@/components/pamoja/Chip";
import { Crest } from "@/components/pamoja/Crest";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { fetchMatchLive, fetchMatches } from "@/data/repository";
import {
  daysUntilLabel,
  kickoffLabel,
  liveMatches,
  liveMinute,
  matchLabel,
  matchPhase,
  nextMatch,
} from "@/utils/match";
import type { Match, MatchLive } from "@/types";

/** "70'", or "HALF TIME" across the interval. */
function minuteLabel(match: Match, at: Date): string {
  if (matchPhase(match, at) === "half-time") return S.liveHalfTime;
  const minute = liveMinute(match, at);
  return minute == null ? "" : `${minute}'`;
}

export function LiveScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [live, setLive] = useState<MatchLive[]>([]);

  useEffect(() => {
    void fetchMatches().then(setMatches);
    void fetchMatchLive().then(setLive);
  }, []);

  const at = now();
  const inPlay = liveMatches(matches, at);
  const scoreFor = (id: string) => live.find((l) => l.matchId === id);
  const [featured, ...also] = inPlay;
  const featuredScore = featured ? scoreFor(featured.id) : undefined;
  const upcoming = nextMatch(matches, at);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.liveTitle}
        </Text>

        {featured && featuredScore ? (
          <>
            <View className="mt-4 rounded-card bg-deep px-5 py-5">
              <Chip label={S.liveBadge} tone="accent" />

              <View className="mt-4 flex-row items-center justify-between">
                <View className="items-center">
                  <Crest team={featured.home} />
                  <Text className="mt-2 text-[12px] text-ondark-mute">
                    {featured.home}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="font-display-heavy text-[34px] text-white">
                    {`${featuredScore.home} – ${featuredScore.away}`}
                  </Text>
                  <Text className="mt-1 font-mono text-[12px] text-accent-soft">
                    {minuteLabel(featured, at)}
                  </Text>
                </View>
                <View className="items-center">
                  <Crest team={featured.away} />
                  <Text className="mt-2 text-[12px] text-ondark-mute">
                    {featured.away}
                  </Text>
                </View>
              </View>

              <View className="mt-5 border-t border-deep-grad pt-1">
                <StatTrio
                  tone="dark"
                  items={[
                    {
                      value: `${featuredScore.possession[0]}%`,
                      label: S.livePossession,
                    },
                    { value: `${featuredScore.shots[0]}`, label: S.liveShots },
                    { value: `${featuredScore.corners[0]}`, label: S.liveCorners },
                  ]}
                />
              </View>
            </View>

            {also.length > 0 ? (
              <>
                <Eyebrow className="mt-8">{S.liveAlsoLive}</Eyebrow>
                <View className="mt-2">
                  {also.map((m) => {
                    const score = scoreFor(m.id);
                    return (
                      <View
                        key={m.id}
                        className="flex-row items-center justify-between border-b border-hairline py-3.5"
                      >
                        <View className="flex-1">
                          <Text className="text-[15px] text-ink">
                            {matchLabel(m)}
                          </Text>
                          <Text className="mt-0.5 font-mono text-[11px] text-mute">
                            {`${minuteLabel(m, at)} · ${m.venue}`}
                          </Text>
                        </View>
                        {score ? (
                          <Text className="font-mono-medium text-[15px] text-ink">
                            {`${score.home} – ${score.away}`}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <View className="mt-6">
            <Text className="text-[15px] leading-6 text-body">
              {S.liveNothingOn}
            </Text>
            {upcoming ? (
              <View className="mt-6">
                <Eyebrow>{S.liveNextUp}</Eyebrow>
                <View className="mt-2 rounded-card border border-hairline bg-canvas px-5 py-5">
                  <Text className="font-display text-[19px] text-ink">
                    {matchLabel(upcoming)}
                  </Text>
                  <Text className="mt-1 font-mono text-[12px] text-mute">
                    {kickoffLabel(upcoming)}
                  </Text>
                  <View className="mt-3">
                    <Chip label={daysUntilLabel(upcoming, at)} tone="tint" />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 4: Run the suite and lint**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 5: Verify in the browser**

Build, serve, drive. Confirm:

- Five tabs: Home, Explore, Live, Services, Pass — and that all five labels fit without
  truncation at 390px width. If they truncate, drop labels to `tabBarShowLabel: false`
  for inactive tabs as the spec's fallback allows.
- Live shows Zambia v Morocco, `0 – 2`, `70'`, with possession 42%, shots 4, corners 2.
- `Also live` lists Uganda v Senegal, `1 – 1`, `55'`.
- Home still reads Kenya v Mali as the next fixture.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add the Live tab and widen the bar to five tabs"
```

---

### Task 9: Services — the matchday tiles above the network

The partner browser stays as the tab's spine. The tiles sit above it, and `Driving in`
sits between them.

**Files:**
- Create: `src/components/pamoja/TileGrid.tsx`, `src/screens/ParkingScreen.tsx`,
  `src/screens/SafetyScreen.tsx`, `src/data/parking.ts`
- Modify: `src/screens/ServicesScreen.tsx`, `src/navigation/types.ts`,
  `src/navigation/RootNavigator.tsx`, `src/data/repository.ts`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `CategoryTile`, `Eyebrow`, `countsByCategory`, `CATEGORIES`
- Produces: `<TileGrid tiles={{ key: string; title: string; detail: string; icon: IconName; onPress: () => void }[]} />`;
  `ParkingScreen`; `SafetyScreen`; `PARKING_ZONES`; `fetchParking()`

- [ ] **Step 1: Add the copy**

In `src/lib/strings.ts`, replace the ServicesScreen placeholder comment with:

```ts
  // ── ServicesScreen ──────────────────────────────────────────────────────
  servicesTitle: "Services",
  servicesStandfirst: "Everything around the match, sorted.",
  servicesShuttles: "Shuttles",
  servicesShuttlesDetail: "CBD to the stadium, every 15 minutes",
  servicesFood: "Food",
  servicesFoodDetail: "Order to your seat block",
  servicesParking: "Parking",
  servicesParkingDetail: "Pre-book zones A–D",
  servicesMerch: "Merch",
  servicesMerchDetail: "Official kit, gate pickup",
  servicesSafety: "Safety",
  servicesSafetyDetail: "Report or get help fast",
  servicesStays: "Stays",
  servicesStaysDetail: "Verified lodges near the ground",
  servicesDrivingTitle: "Driving in",
  servicesDrivingDetail: "What you need at the border",
  servicesNeedAHand: "Need a hand?",
  servicesStewards: "Stewards answer in under 2 minutes on matchday.",

  // ── ParkingScreen ───────────────────────────────────────────────────────
  parkingTitle: "Parking",
  parkingStandfirst: "Pre-book a zone. Payment is at the gate, by M-Pesa.",

  // ── SafetyScreen ────────────────────────────────────────────────────────
  safetyTitle: "Safety",
  safetyStandfirst: "Stewards are on every concourse.",
  safetyHelpLine: "Steward help line",
  safetyHelpLineDetail: "Free from any Kenyan number on matchday",
  safetyReport: "Report a problem",
  safetyReportDetail: "Crowding, a blocked exit, anything unsafe",
```

The canvas's *Chat* button is deliberately not built — there is no messaging backend, and
a button that goes nowhere is worse than no button. The note above it is kept.

- [ ] **Step 2: Build TileGrid**

```tsx
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";

export interface Tile {
  key: string;
  title: string;
  detail: string;
  icon: IconName;
  onPress: () => void;
}

/** The matchday services band. Two columns, so six tiles read as three rows. */
export function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {tiles.map((tile) => (
        <Pressable
          key={tile.key}
          onPress={tile.onPress}
          className="mb-3 w-[48%] rounded-card border border-hairline bg-canvas px-4 py-4 active:opacity-80"
        >
          <Icon name={tile.icon} size={18} color={colors.accent} />
          <Text className="mt-2.5 font-medium text-[15px] text-ink">
            {tile.title}
          </Text>
          <Text className="mt-0.5 text-[12px] leading-4 text-mute">
            {tile.detail}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

- [ ] **Step 3: Seed parking and expose it**

Create `src/data/parking.ts`:

```ts
export interface ParkingZone {
  id: string;
  zone: string;
  detail: string;
  walkMinutes: number;
}

export const PARKING_ZONES: ParkingZone[] = [
  { id: "pz-a", zone: "Zone A", detail: "Kasarani, north gate", walkMinutes: 4 },
  { id: "pz-b", zone: "Zone B", detail: "Kasarani, east approach", walkMinutes: 7 },
  { id: "pz-c", zone: "Zone C", detail: "Mwiki Road overflow", walkMinutes: 12 },
  { id: "pz-d", zone: "Zone D", detail: "Thika Road park and walk", walkMinutes: 18 },
];
```

In `src/data/repository.ts`:

```ts
import { PARKING_ZONES, type ParkingZone } from "./parking";
```

```ts
export async function fetchParking(): Promise<ParkingZone[]> {
  return cached("parking", () => PARKING_ZONES);
}
```

- [ ] **Step 4: Build the two small screens**

`src/screens/ParkingScreen.tsx`:

```tsx
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { S } from "@/lib/strings";
import { fetchParking } from "@/data/repository";
import type { ParkingZone } from "@/data/parking";

export function ParkingScreen() {
  const [zones, setZones] = useState<ParkingZone[]>([]);

  useEffect(() => {
    void fetchParking().then(setZones);
  }, []);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.parkingTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.parkingStandfirst}
        </Text>

        <View className="mt-6">
          {zones.map((z) => (
            <View
              key={z.id}
              className="flex-row items-center justify-between border-b border-hairline py-3.5"
            >
              <View className="flex-1">
                <Text className="font-medium text-[15px] text-ink">{z.zone}</Text>
                <Text className="mt-0.5 text-[13px] text-body">{z.detail}</Text>
              </View>
              <Text className="font-mono text-[12px] text-mute">
                {`${z.walkMinutes} min walk`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
```

`src/screens/SafetyScreen.tsx`:

```tsx
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { S } from "@/lib/strings";

const ROWS = [
  { key: "help", title: S.safetyHelpLine, detail: S.safetyHelpLineDetail },
  { key: "report", title: S.safetyReport, detail: S.safetyReportDetail },
];

export function SafetyScreen() {
  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.safetyTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.safetyStandfirst}
        </Text>

        <View className="mt-6">
          {ROWS.map((r) => (
            <View key={r.key} className="border-b border-hairline py-3.5">
              <Text className="font-medium text-[15px] text-ink">{r.title}</Text>
              <Text className="mt-0.5 text-[13px] leading-5 text-body">
                {r.detail}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 5: Register the routes**

In `src/navigation/types.ts`, add to `RootStackParamList`:

```ts
  Driving: undefined;
  Parking: undefined;
  Safety: undefined;
```

In `src/navigation/RootNavigator.tsx`, import and register `ParkingScreen` and
`SafetyScreen` as pushed screens, following the pattern the existing `Wallet` screen uses.
`Driving` is registered in Task 10 — do not reference `DrivingScreen` yet.

- [ ] **Step 6: Rebuild ServicesScreen**

```tsx
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Icon } from "@/components/Icon";
import { CategoryTile } from "@/components/pamoja/CategoryTile";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { TileGrid, type Tile } from "@/components/pamoja/TileGrid";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { usePartnerStore } from "@/store/usePartnerStore";
import { CATEGORIES, countsByCategory } from "@/utils/partners";

export function ServicesScreen() {
  const navigation = useNavigation<any>();
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  // Derived, never stored — a tile can never show a number it cannot fill.
  const counts = countsByCategory(partners);

  const category = (c: "stay" | "move" | "eat" | "shop" | "do") => () =>
    navigation.navigate("Category", { category: c });

  const tiles: Tile[] = [
    { key: "shuttles", title: S.servicesShuttles, detail: S.servicesShuttlesDetail, icon: "truck", onPress: category("move") },
    { key: "food", title: S.servicesFood, detail: S.servicesFoodDetail, icon: "coffee", onPress: category("eat") },
    { key: "parking", title: S.servicesParking, detail: S.servicesParkingDetail, icon: "map-pin", onPress: () => navigation.navigate("Parking") },
    { key: "merch", title: S.servicesMerch, detail: S.servicesMerchDetail, icon: "shopping-bag", onPress: category("shop") },
    { key: "safety", title: S.servicesSafety, detail: S.servicesSafetyDetail, icon: "shield", onPress: () => navigation.navigate("Safety") },
    { key: "stays", title: S.servicesStays, detail: S.servicesStaysDetail, icon: "home", onPress: category("stay") },
  ];

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.servicesTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.servicesStandfirst}
        </Text>

        <View className="mt-5">
          <TileGrid tiles={tiles} />
        </View>

        <Pressable
          onPress={() => navigation.navigate("Driving")}
          className="mt-1 flex-row items-center justify-between rounded-card border border-hairline bg-canvas px-4 py-4 active:opacity-80"
        >
          <View className="flex-1">
            <Text className="font-medium text-[15px] text-ink">
              {S.servicesDrivingTitle}
            </Text>
            <Text className="mt-0.5 text-[12px] text-mute">
              {S.servicesDrivingDetail}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mute} />
        </Pressable>

        {/* The network keeps its surface: this figure and these counts are the
            reason the 2,189-partner dataset exists. */}
        <Eyebrow className="mt-8">
          {`${partners.length.toLocaleString("en-US")} partner businesses`}
        </Eyebrow>

        <View className="mt-4 flex-row flex-wrap justify-between">
          {CATEGORIES.map((c) => (
            <View key={c} className="w-[48%]">
              <CategoryTile
                category={c}
                count={counts[c]}
                onPress={category(c)}
              />
            </View>
          ))}
        </View>

        <View className="mt-8 rounded-card bg-panel px-4 py-4">
          <Text className="font-medium text-[15px] text-ink">
            {S.servicesNeedAHand}
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-body">
            {S.servicesStewards}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 7: Run the suite, lint, and the derived-number guard**

Run: `npm run lint && npm test`
Expected: all green.

Run: `grep -rn "2,189\|2189" src/ --include=*.tsx`
Expected: only the JSDoc example in `src/components/pamoja/Eyebrow.tsx`. No rendered
literal.

- [ ] **Step 8: Verify in the browser**

Note that `Driving` is not yet registered, so tapping that row will warn. That is expected
until Task 10. Confirm the six tiles render, the `2,189 PARTNER BUSINESSES` eyebrow and
the five counts still read 210 / 84 / 1,340 / 460 / 95, and Parking and Safety both open.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add the Services matchday tiles above the retained partner browser"
```

---

### Task 10: Drive & Borders

**Files:**
- Create: `src/data/borders.ts`, `src/components/pamoja/RouteStrip.tsx`,
  `src/screens/DrivingScreen.tsx`
- Modify: `src/types/index.ts`, `src/data/repository.ts`,
  `src/navigation/RootNavigator.tsx`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `Pill` from `@/components/ui`; `StatTrio`, `Eyebrow`
- Produces: `OriginCountry`; `BorderCrossing`; `BORDER_CROSSINGS`;
  `fetchBorderCrossings()`; `<RouteStrip crossing={BorderCrossing} />`; `DrivingScreen`

- [ ] **Step 1: Add the types**

In `src/types/index.ts`:

```ts
// ── Borders ──────────────────────────────────────────────────────────────────
export type OriginCountry = "UG" | "TZ" | "RW" | "ET";

/** Static reference content: what a driver needs at the border. */
export interface BorderCrossing {
  origin: OriginCountry;
  originLabel: string;    // "From Uganda"
  originCity: string;     // "Kampala"
  originCode: string;     // "UGA"
  post: string;           // "MALABA"
  destinationCity: string; // "Nairobi"
  destinationCode: string; // "KEN"
  distanceKm: number;
  driveHours: number;
  waitMinutes: number;
  requirements: { label: string; detail: string }[];
  goodToKnow: { label: string; detail: string }[];
}
```

- [ ] **Step 2: Seed the crossings**

Create `src/data/borders.ts`. Uganda's record is the canvas's, verbatim. The other three
follow the same shape with their own posts and distances.

```ts
import type { BorderCrossing } from "@/types";

const COMMON_GOOD_TO_KNOW = [
  { label: "Drive side", detail: "Left — same as home" },
  { label: "Currency", detail: "KES · pay by M-Pesa almost everywhere" },
  {
    label: "SIM and data",
    detail: "EAC roaming is capped — or pick up a local SIM at the border",
  },
];

export const BORDER_CROSSINGS: BorderCrossing[] = [
  {
    origin: "UG",
    originLabel: "From Uganda",
    originCity: "Kampala",
    originCode: "UGA",
    post: "MALABA",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 653,
    driveHours: 11,
    waitMinutes: 45,
    requirements: [
      {
        label: "Passport or EA national ID",
        detail: "EAC citizens can cross on ID — no visa needed",
      },
      {
        label: "COMESA Yellow Card",
        detail: "Third-party insurance valid across the region",
      },
      {
        label: "Vehicle logbook",
        detail: "Original, in the driver's name — or a letter if borrowed",
      },
      {
        label: "Temporary import permit",
        detail: "Free at Malaba, valid 14 days — issued on the spot",
      },
      { label: "Yellow fever certificate", detail: "Checked at the health desk" },
    ],
    goodToKnow: [
      { label: "Drive side", detail: "Left — same as Uganda" },
      { label: "Currency", detail: "KES · pay by M-Pesa almost everywhere" },
      {
        label: "SIM and data",
        detail: "EAC roaming is capped — or pick up a local SIM at the border",
      },
      { label: "Fuel", detail: "Fill at Eldoret — the last cheap stop before Nairobi" },
    ],
  },
  {
    origin: "TZ",
    originLabel: "From Tanzania",
    originCity: "Arusha",
    originCode: "TZA",
    post: "NAMANGA",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 273,
    driveHours: 5,
    waitMinutes: 30,
    requirements: [
      {
        label: "Passport or EA national ID",
        detail: "EAC citizens can cross on ID — no visa needed",
      },
      {
        label: "COMESA Yellow Card",
        detail: "Third-party insurance valid across the region",
      },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      { label: "Temporary import permit", detail: "Free at Namanga, valid 14 days" },
    ],
    goodToKnow: [
      ...COMMON_GOOD_TO_KNOW,
      { label: "Fuel", detail: "Fill at Namanga — cheaper on the Kenyan side" },
    ],
  },
  {
    origin: "RW",
    originLabel: "From Rwanda",
    originCity: "Kigali",
    originCode: "RWA",
    post: "MALABA",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 1_180,
    driveHours: 19,
    waitMinutes: 60,
    requirements: [
      {
        label: "Passport or EA national ID",
        detail: "EAC citizens can cross on ID — no visa needed",
      },
      {
        label: "COMESA Yellow Card",
        detail: "Third-party insurance valid across the region",
      },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      {
        label: "Two transit stamps",
        detail: "You cross Uganda on the way — keep both",
      },
    ],
    goodToKnow: [
      ...COMMON_GOOD_TO_KNOW,
      { label: "Split the drive", detail: "Most stop overnight at Kampala or Eldoret" },
    ],
  },
  {
    origin: "ET",
    originLabel: "From Ethiopia",
    originCity: "Addis Ababa",
    originCode: "ETH",
    post: "MOYALE",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 1_530,
    driveHours: 24,
    waitMinutes: 90,
    requirements: [
      { label: "Passport and Kenyan visa", detail: "Ethiopia is not an EAC member" },
      { label: "Carnet de passage", detail: "Required — the Yellow Card is not enough" },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      { label: "Yellow fever certificate", detail: "Checked at the health desk" },
    ],
    goodToKnow: [
      ...COMMON_GOOD_TO_KNOW,
      { label: "Fuel", detail: "Long gaps north of Isiolo — fill whenever you can" },
    ],
  },
];
```

- [ ] **Step 3: Expose it**

In `src/data/repository.ts`:

```ts
import { BORDER_CROSSINGS } from "./borders";
```

```ts
export async function fetchBorderCrossings(): Promise<BorderCrossing[]> {
  return cached("borders", () => BORDER_CROSSINGS);
}
```

Add `BorderCrossing` to the type import.

- [ ] **Step 4: Build RouteStrip**

```tsx
import { Text, View } from "react-native";

import type { BorderCrossing } from "@/types";

/** Kampala UGA ───── MALABA ───── Nairobi KEN */
export function RouteStrip({ crossing }: { crossing: BorderCrossing }) {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="font-medium text-[15px] text-ink">
          {crossing.originCity}
        </Text>
        <Text className="mt-0.5 font-mono text-[10px] tracking-[1.2px] text-mute">
          {crossing.originCode}
        </Text>
      </View>

      <View className="mx-3 flex-1 items-center">
        <View className="h-px w-full bg-hairline" />
        <Text className="mt-1.5 font-mono text-[10px] tracking-[1.5px] text-accent">
          {crossing.post}
        </Text>
      </View>

      <View className="items-end">
        <Text className="font-medium text-[15px] text-ink">
          {crossing.destinationCity}
        </Text>
        <Text className="mt-0.5 font-mono text-[10px] tracking-[1.2px] text-mute">
          {crossing.destinationCode}
        </Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Add the copy**

In `src/lib/strings.ts`:

```ts
  // ── DrivingScreen ───────────────────────────────────────────────────────
  drivingTitle: "Driving in",
  drivingStandfirst: "Everything you need at the border, based on where you start.",
  drivingYourRoute: "Your route",
  drivingDistance: "Distance",
  drivingDriveTime: "Drive time",
  drivingBorderWait: "Border wait",
  drivingNeed: "At the border you'll need",
  drivingGoodToKnow: "Good to know",
```

- [ ] **Step 6: Build the screen**

```tsx
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { RouteStrip } from "@/components/pamoja/RouteStrip";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { S } from "@/lib/strings";
import { fetchBorderCrossings } from "@/data/repository";
import type { BorderCrossing, OriginCountry } from "@/types";

export function DrivingScreen() {
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [origin, setOrigin] = useState<OriginCountry>("UG");

  useEffect(() => {
    void fetchBorderCrossings().then(setCrossings);
  }, []);

  const crossing = crossings.find((c) => c.origin === origin);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.drivingTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.drivingStandfirst}
        </Text>

        <View className="mt-5 flex-row flex-wrap">
          {crossings.map((c) => (
            <View key={c.origin} className="mb-2">
              <Pill
                label={c.originLabel}
                active={c.origin === origin}
                onPress={() => setOrigin(c.origin)}
              />
            </View>
          ))}
        </View>

        {crossing ? (
          <>
            <Eyebrow className="mt-6">{S.drivingYourRoute}</Eyebrow>
            <View className="mt-3 rounded-card border border-hairline bg-canvas px-5 py-5">
              <RouteStrip crossing={crossing} />
              <View className="mt-4 border-t border-hairline pt-1">
                <StatTrio
                  items={[
                    {
                      value: `${crossing.distanceKm.toLocaleString("en-US")} km`,
                      label: S.drivingDistance,
                    },
                    { value: `~${crossing.driveHours} h`, label: S.drivingDriveTime },
                    {
                      value: `~${crossing.waitMinutes} min`,
                      label: S.drivingBorderWait,
                    },
                  ]}
                />
              </View>
            </View>

            <Eyebrow className="mt-8">{S.drivingNeed}</Eyebrow>
            <View className="mt-2">
              {crossing.requirements.map((r) => (
                <View key={r.label} className="border-b border-hairline py-3.5">
                  <Text className="font-medium text-[15px] text-ink">{r.label}</Text>
                  <Text className="mt-0.5 text-[13px] leading-5 text-body">
                    {r.detail}
                  </Text>
                </View>
              ))}
            </View>

            <Eyebrow className="mt-8">{S.drivingGoodToKnow}</Eyebrow>
            <View className="mt-3 flex-row flex-wrap justify-between">
              {crossing.goodToKnow.map((g) => (
                <View
                  key={g.label}
                  className="mb-3 w-[48%] rounded-card bg-panel px-4 py-3"
                >
                  <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-mute">
                    {g.label}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-ink">
                    {g.detail}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 7: Register the route**

In `src/navigation/RootNavigator.tsx`, import `DrivingScreen` and register it as a pushed
screen named `Driving`.

- [ ] **Step 8: Run the suite and lint**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 9: Verify in the browser**

Services → Driving in. Confirm the Uganda record reads `653 km`, `~11 h`, `~45 min`, five
requirements and four good-to-knows, and that switching to Tanzania swaps the whole record
(`273 km`, `NAMANGA`).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add the Drive & Borders guide for all four road approaches"
```

---

### Task 11: The match ticket on the Pass

The entitlement card stays and keeps gating the navigator. The ticket sits beneath it.

**Files:**
- Create: `src/utils/ticket.ts`, `src/utils/ticket.test.ts`,
  `src/components/pamoja/TicketCard.tsx`
- Modify: `src/types/index.ts`, `src/store/usePassStore.ts`,
  `src/screens/PassScreen.tsx`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `crestCode`, `kickoffLabel` (Task 3); `eatParts`; `Pass`, `Match`
- Produces: `MatchTicket`;
  `ticketReference(pass: Pass, match: Match): string`;
  `issueTicket(pass: Pass, match: Match): MatchTicket`;
  `ticketSaved(ticket: MatchTicket): number`;
  `<TicketCard ticket={MatchTicket} match={Match} pass={Pass} />`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/ticket.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { DEMO_NOW } from "@/lib/clock";
import { MATCHES } from "@/data/matches";
import { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
import { nextMatch } from "@/utils/match";
import { issueTicket, ticketReference, ticketSaved } from "@/utils/ticket";

const pass = issuePass({
  holderName: DEMO_HOLDER_NAME,
  issuedIn: "KE",
  sequence: 0,
});
const match = nextMatch(MATCHES, DEMO_NOW)!;

describe("ticketReference", () => {
  it("is derived from the crests, the match date and the Pass serial", () => {
    // The drawing prints "KEN-MLI · 2604-8871". 2604 reads as 26 April, which cannot
    // be a June fixture, and 8871 is not this Pass's serial — both are placeholder.
    // Deriving gives a reference that is always true of the pass and the match.
    expect(ticketReference(pass, match)).toBe("KEN-MLI · 2606-8842");
  });

  it("changes with the fixture", () => {
    const later = MATCHES.find((m) => m.id === "m-sen-egy")!;
    expect(ticketReference(pass, later)).toBe("SEN-EGY · 1007-8842");
  });
});

describe("issueTicket", () => {
  it("ties the ticket to the Pass and the match", () => {
    const ticket = issueTicket(pass, match);
    expect(ticket.passId).toBe("KE-PM-8842");
    expect(ticket.matchId).toBe("m-ken-mli");
    expect(ticket.id).toBe("KE-PM-8842-m-ken-mli");
  });

  it("seats the holder as Figure 3 prints it", () => {
    const ticket = issueTicket(pass, match);
    expect(ticket.category).toBe(2);
    expect(ticket.gate).toBe("D");
    expect(ticket.section).toBe("214");
    expect(ticket.seat).toBe("17");
  });
});

describe("ticketSaved", () => {
  it("sums the line items, counting a free item as its full former price", () => {
    // The drawing's own rows are 2,000 → 1,500 and 600 → Free, which is 1,100 —
    // not the 950 printed beside them. The total is derived from the rows.
    expect(ticketSaved(issueTicket(pass, match))).toBe(1100);
  });
});
```

- [ ] **Step 2: Run and watch them fail**

Run: `npx vitest run src/utils/ticket.test.ts`
Expected: FAIL — the module does not exist.

- [ ] **Step 3: Add the type**

In `src/types/index.ts`:

```ts
/** The seat, distinct from the credential. One per match, tied to a Pass. */
export interface MatchTicket {
  id: string;
  passId: string;
  matchId: string;
  category: 1 | 2 | 3;
  gate: string;
  section: string;
  seat: string;
  /**
   * What the ticket itself is worth. This is an entitlement's stated value, NOT
   * something that happened, so it is never written to the record and never added
   * into `YOU'VE SAVED`.
   */
  savings: { label: string; was: number; now: number | "free" }[];
}
```

- [ ] **Step 4: Implement**

Create `src/utils/ticket.ts`:

```ts
import { eatParts } from "@/lib/clock";
import type { Match, MatchTicket, Pass } from "@/types";
import { crestCode } from "@/utils/match";

/**
 * "KEN-MLI · 2606-8842" — crests, the match day and month, and the Pass serial.
 * Derived rather than stored, like every other reference in this app.
 */
export function ticketReference(pass: Pass, match: Match): string {
  const { day } = eatParts(match.kickoff); // "2027-06-26"
  const [, month, dayOfMonth] = day.split("-");
  const serial = pass.id.split("-").pop() ?? "0000";
  return `${crestCode(match.home)}-${crestCode(match.away)} · ${dayOfMonth}${month}-${serial}`;
}

/**
 * The prototype seats every holder in the same place — Figure 3's Cat 2, Gate D.
 * Real allocation is an LOC ticketing concern and is not this app's to invent.
 */
export function issueTicket(pass: Pass, match: Match): MatchTicket {
  return {
    id: `${pass.id}-${match.id}`,
    passId: pass.id,
    matchId: match.id,
    category: 2,
    gate: "D",
    section: "214",
    seat: "17",
    savings: [
      { label: "Ticket · Cat 2", was: 2000, now: 1500 },
      { label: "Shuttle both ways", was: 600, now: "free" },
    ],
  };
}

/** What the ticket saves, summed from its own rows. Never touches the record. */
export function ticketSaved(ticket: MatchTicket): number {
  return ticket.savings.reduce(
    (sum, row) => sum + (row.now === "free" ? row.was : row.was - row.now),
    0
  );
}
```

- [ ] **Step 5: Run and watch them pass**

Run: `npx vitest run src/utils/ticket.test.ts`
Expected: PASS. If the reference test fails, check the day/month order — the assertion
expects `2606` for 26 June, that is `DDMM`.

- [ ] **Step 6: Add the copy**

In `src/lib/strings.ts`, in the PassScreen block:

```ts
  passActive: "ACTIVE",
  passMatchPass: "Match pass",
  passCategoryPrefix: "CAT",
  passGate: "Gate",
  passSection: "Section",
  passSeat: "Seat",
  passTicketSaves: "What this ticket saves you",
  passCodeStandIn: "Show this at the gate. A steward can also read your Pass code.",
```

- [ ] **Step 7: Build TicketCard**

```tsx
import { Text, View } from "react-native";

import { Chip } from "@/components/pamoja/Chip";
import { Crest } from "@/components/pamoja/Crest";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { S } from "@/lib/strings";
import type { Match, MatchTicket, Pass } from "@/types";
import { eatParts } from "@/lib/clock";
import { ticketReference } from "@/utils/ticket";

/**
 * A deterministic block derived from the reference string. It is a visual STAND-IN,
 * not a scannable QR: making it scannable needs react-native-svg plus an encoder,
 * which is follow-up work. Nothing in this app reads a code, so nothing here breaks.
 */
function CodeBlock({ reference }: { reference: string }) {
  const size = 11;
  // Each cell is derived straight from the reference's own characters. A seeded PRNG
  // was the obvious approach and the wrong one: `state * 1103515245` exceeds
  // Number.MAX_SAFE_INTEGER, so it loses precision and stops being deterministic.
  const cells = Array.from({ length: size * size }, (_, i) => {
    const a = reference.charCodeAt(i % reference.length);
    const b = reference.charCodeAt((i * 7 + 3) % reference.length);
    return (a * 31 + b * 17 + i * 13) % 7 < 3;
  });

  return (
    <View className="rounded-card bg-deep p-3">
      {Array.from({ length: size }).map((_, row) => (
        <View key={row} className="flex-row">
          {Array.from({ length: size }).map((__, col) => (
            <View
              key={col}
              className={`m-[1px] h-2.5 w-2.5 rounded-[1px] ${
                cells[row * size + col] ? "bg-white" : "bg-transparent"
              }`}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function TicketCard({
  ticket,
  match,
  pass,
}: {
  ticket: MatchTicket;
  match: Match;
  pass: Pass;
}) {
  const { time } = eatParts(match.kickoff);
  return (
    <View className="overflow-hidden rounded-card border border-hairline bg-canvas">
      <View className="bg-accent px-5 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-white">
            {S.passMatchPass}
          </Text>
          <Chip
            label={`${S.passCategoryPrefix} ${ticket.category}`}
            tone="ondark"
          />
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <Crest team={match.home} />
          <View className="items-center">
            <Text className="font-mono text-[11px] tracking-[1.5px] text-white">
              {time}
            </Text>
            <Text className="mt-1 font-display text-[22px] text-white">VS</Text>
            <Text className="mt-1 text-[12px] text-white">{match.venue}</Text>
          </View>
          <Crest team={match.away} />
        </View>
      </View>

      <View className="px-5 pt-1">
        <StatTrio
          items={[
            { value: ticket.gate, label: S.passGate },
            { value: ticket.section, label: S.passSection },
            { value: ticket.seat, label: S.passSeat },
          ]}
        />
      </View>

      {/* The perforation */}
      <View className="mx-5 my-2 h-px border-t border-dashed border-hairline" />

      <View className="items-center px-5 pb-5">
        <CodeBlock reference={ticketReference(pass, match)} />
        <Text className="mt-3 font-mono text-[12px] tracking-[1.5px] text-ink">
          {ticketReference(pass, match)}
        </Text>
        <Text className="mt-2 px-4 text-center font-mono text-[10px] leading-4 text-mute">
          {S.passCodeStandIn}
        </Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 8: Hold the ticket in the store**

In `src/store/usePassStore.ts`, add `ticket: MatchTicket | null` to `PassState`, default
`null`, include it in `reset`, and add:

```ts
      issueTicketFor: (match: Match) =>
        set((s) => ({
          ticket: s.pass ? issueTicket(s.pass, match) : null,
        })),
```

Import `issueTicket` from `@/utils/ticket` and the `Match` / `MatchTicket` types. The
persisted key `pamoja-pass` now carries the ticket too, which is correct — it belongs to
the holder and stays on the device.

- [ ] **Step 9: Extend PassScreen**

In `src/screens/PassScreen.tsx`: load matches with `fetchMatches`, take
`nextMatch(matches, now())`, call `issueTicketFor(fixture)` in an effect when a fixture
exists and `ticket` is null, add an `● ACTIVE` chip beside the card, and render below the
entitlements:

```tsx
        {ticket && fixture ? (
          <>
            <View className="mt-8">
              <TicketCard ticket={ticket} match={fixture} pass={pass} />
            </View>

            <Eyebrow className="mt-8">{S.passTicketSaves}</Eyebrow>
            <View className="mt-2">
              {ticket.savings.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-center justify-between border-b border-hairline py-3"
                >
                  <Text className="flex-1 text-[14px] text-ink">{row.label}</Text>
                  <Text className="mr-3 font-mono text-[12px] text-faint line-through">
                    {row.was.toLocaleString("en-US")}
                  </Text>
                  <Text className="font-mono-medium text-[14px] text-ink">
                    {row.now === "free" ? "Free" : row.now.toLocaleString("en-US")}
                  </Text>
                </View>
              ))}
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-medium text-[14px] text-ink">
                  {S.passTicketSaves}
                </Text>
                <Text className="font-mono-medium text-[15px] text-accent">
                  {kes(ticketSaved(ticket))}
                </Text>
              </View>
            </View>
          </>
        ) : null}
```

Keep the `My Wallet` row last.

- [ ] **Step 10: Run the suite and lint**

Run: `npm run lint && npm test`
Expected: all green, including the Task 1 guard — the Pass card's Figure 1 strings are
untouched.

- [ ] **Step 11: Verify in the browser**

Pass tab. Confirm the entitlement card still reads `Amina Nakato`, `KE-PM-8842`,
`VALID IN ALL THREE COUNTRIES`, `Valid · 24 days left`; the ticket reads `CAT 2`,
`Gate D` / `Section 214` / `Seat 17`, `KEN-MLI · 2606-8842`; and the savings rows total
`KES 1,100` — kept visibly separate from the Wallet's `KES 150`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add the match ticket beneath the Pass, with its savings kept out of the record"
```

---

### Task 12: Wallet — the donut and the week chip

**Files:**
- Modify: `src/screens/WalletScreen.tsx`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `Donut`, `Chip` (Task 6); `savingsRate`, `weekSavings`, `offersUsed` (Task 5)
- Produces: nothing downstream.

- [ ] **Step 1: Add the copy**

```ts
  walletTitle: "Wallet",
  walletSavedWithApp: "Saved with the app",
  walletThisWeek: "THIS WK",
  walletOffersThisTournament: "offers this tournament",
```

- [ ] **Step 2: Add the summary card**

In `src/screens/WalletScreen.tsx`, keep the storage-error banner and the two `Figure`s
exactly as they are, then insert between the figures and the day groups:

```tsx
        {events.length > 0 ? (
          <View className="mt-6 flex-row items-center rounded-card border border-hairline bg-canvas px-4 py-4">
            <Donut value={savingsRate(events)} label={S.walletSavedWithApp} />
            <View className="ml-4 flex-1">
              <Text className="font-medium text-[15px] text-ink">
                {`${S.walletSavedWithApp}: ${kes(totalSaved(events))}`}
              </Text>
              <Text className="mt-0.5 text-[13px] text-body">
                {`${offersUsed(events)} ${S.walletOffersThisTournament}`}
              </Text>
            </View>
            {weekSavings(events, now()) > 0 ? (
              <Chip
                label={`+${weekSavings(events, now())} ${S.walletThisWeek}`}
                tone="tint"
              />
            ) : null}
          </View>
        ) : null}
```

Add the imports: `Donut`, `Chip`, `now` from `@/lib/clock`, and `offersUsed`,
`savingsRate`, `weekSavings` from `@/utils/record`.

There is deliberately no balance, no card, no Top up and no Send. See the plan's Global
Constraints.

- [ ] **Step 3: Run the suite and lint**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 4: Verify in the browser**

Redeem once at Mama Oliech, then open the Wallet. Confirm `YOU'VE SAVED KES 150`,
`YOU'VE SPENT KES 850`, a `15%` donut, `+150 THIS WK`, the day heading `2027-06-23`, the
line `KES 850 · food and drink` / `Kasarani ward · 12:55`, and the closing note.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add the savings-rate donut and week chip to the Wallet"
```

---

### Task 13: Explore — one search over three sources

The largest single-screen change. Fixtures, explore items and partners merge behind one
search field and four filters. No new dataset.

**Files:**
- Modify: `src/screens/ExploreScreen.tsx`, `src/lib/strings.ts`

**Interfaces:**
- Consumes: `SearchField` (Task 6); `Chip`; `fetchExplore`, `fetchMatches`,
  `fetchPartners`; `matchLabel`, `kickoffLabel`, `daysUntilLabel`; `distanceKm`, `km`
- Produces: nothing downstream.

- [ ] **Step 1: Add the copy**

Replace the three `exploreSegment*` strings with:

```ts
  exploreTitle: "Explore",
  explorePlaceholder: "Search fixtures, venues, offers",
  exploreFilterAll: "All",
  exploreFilterFixtures: "Fixtures",
  exploreFilterVenues: "Venues",
  exploreFilterOffers: "Offers",
  exploreThisWeek: "This week",
  exploreEventsNearYou: "Events near you",
  exploreEatNearby: "Eat nearby",
  exploreThingsToSee: "Things to see",
  exploreNoResults: "Nothing matches that yet.",
```

Keep `exploreFreeEntry`; the free-entry line still uses it. **Delete**
`exploreComingUp` and `exploreNearYou` — the rebuilt sections replace both, and leaving
them behind leaves dead copy in the module.

The spec lists a separate `VENUES` section. It is folded into `THINGS TO SEE` here
deliberately: every seeded non-event explore item is a venue or a place, so two headings
would split six rows across two near-identical lists. `Venues` remains as a filter.

- [ ] **Step 2: Rebuild the screen**

Replace `src/screens/ExploreScreen.tsx`. Keep the existing `PamojaMap` block at the foot,
unchanged, fed by whichever explore items are visible.

```tsx
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { SearchField } from "@/components/pamoja/SearchField";
import { PamojaMap, type MapData } from "@/components/PamojaMap";
import { now } from "@/lib/clock";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { fetchExplore, fetchMatches, fetchPartners } from "@/data/repository";
import { daysUntilLabel, kickoffLabel, matchLabel } from "@/utils/match";
import type { ExploreItem, Match, Partner } from "@/types";

type Filter = "all" | "fixtures" | "venues" | "offers";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: S.exploreFilterAll },
  { key: "fixtures", label: S.exploreFilterFixtures },
  { key: "venues", label: S.exploreFilterVenues },
  { key: "offers", label: S.exploreFilterOffers },
];

const NAIROBI = { id: "nairobi", name: "Nairobi", lat: -1.2864, lng: 36.8172 };

function toMapData(items: ExploreItem[]): MapData {
  return {
    cities: [NAIROBI],
    attractions: items.map((i) => ({
      id: i.id,
      name: i.name,
      lat: i.coords.lat,
      lng: i.coords.lng,
      category: i.kind,
      cityId: NAIROBI.id,
    })),
  };
}

function matches(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

function Row({ item }: { item: ExploreItem }) {
  return (
    <View className="border-b border-hairline py-3.5">
      <Text className="font-medium text-[15px] text-ink">{item.name}</Text>
      <Text className="mt-1 text-[13px] text-body">{item.detail}</Text>
      {item.freeWithPass ? (
        <Text className="mt-1 font-mono text-[11px]" style={{ color: colors.accent }}>
          {S.exploreFreeEntry}
        </Text>
      ) : null}
    </View>
  );
}

export function ExploreScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    void fetchExplore().then(setItems);
    void fetchMatches().then(setFixtures);
    void fetchPartners().then(setPartners);
  }, []);

  const at = now();
  const show = (f: Filter) => filter === "all" || filter === f;

  const visibleFixtures = useMemo(
    () =>
      show("fixtures")
        ? fixtures
            .filter(
              (m) =>
                new Date(m.kickoff).getTime() > at.getTime() &&
                (query === "" || matches(matchLabel(m) + m.venue, query))
            )
            .sort(
              (a, b) =>
                new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
            )
            .slice(0, 5)
        : [],
    [fixtures, filter, query, at]
  );

  const visibleItems = useMemo(
    () =>
      show("venues")
        ? items.filter((i) => query === "" || matches(i.name + i.detail, query))
        : [],
    [items, filter, query]
  );

  const visibleOffers = useMemo(
    () =>
      show("offers")
        ? partners
            .filter(
              (p) => p.category === "eat" && (query === "" || matches(p.name, query))
            )
            .slice(0, 6)
        : [],
    [partners, filter, query]
  );

  const events = visibleItems.filter((i) => i.kind === "event");
  const places = visibleItems.filter((i) => i.kind !== "event");
  const empty =
    visibleFixtures.length === 0 &&
    visibleItems.length === 0 &&
    visibleOffers.length === 0;

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.exploreTitle}
        </Text>

        <View className="mt-3">
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={S.explorePlaceholder}
          />
        </View>

        <View className="mt-3 flex-row">
          {FILTERS.map((f) => (
            <Pill
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>

        {empty ? (
          <Text className="mt-8 text-[15px] leading-6 text-body">
            {S.exploreNoResults}
          </Text>
        ) : null}

        {visibleFixtures.length > 0 ? (
          <>
            <Eyebrow className="mt-6">{S.exploreThisWeek}</Eyebrow>
            <View className="mt-2">
              {visibleFixtures.map((m) => (
                <View
                  key={m.id}
                  className="flex-row items-center justify-between border-b border-hairline py-3.5"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-[15px] text-ink">
                      {matchLabel(m)}
                    </Text>
                    <Text className="mt-0.5 font-mono text-[11px] text-mute">
                      {kickoffLabel(m)}
                    </Text>
                  </View>
                  <Chip label={daysUntilLabel(m, at)} tone="panel" />
                </View>
              ))}
            </View>
          </>
        ) : null}

        {events.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreEventsNearYou}</Eyebrow>
            <View className="mt-2">
              {events.map((i) => (
                <Row key={i.id} item={i} />
              ))}
            </View>
          </>
        ) : null}

        {visibleOffers.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreEatNearby}</Eyebrow>
            <View className="mt-2">
              {visibleOffers.map((p) => (
                <OfferRow
                  key={p.id}
                  partner={p}
                  subline={p.ward}
                  onPress={() =>
                    navigation.navigate("Partner", { partnerId: p.id })
                  }
                />
              ))}
            </View>
          </>
        ) : null}

        {places.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreThingsToSee}</Eyebrow>
            <View className="mt-2">
              {places.map((i) => (
                <Row key={i.id} item={i} />
              ))}
            </View>
          </>
        ) : null}

        {visibleItems.length > 0 ? (
          <View className="mt-8">
            <PamojaMap data={toMapData(visibleItems)} height={280} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 3: Run the suite and lint**

Run: `npm run lint && npm test`
Expected: all green.

- [ ] **Step 4: Verify in the browser**

Explore tab. Confirm: the search field filters live; `All` shows fixtures, events, eat and
places; `Fixtures` shows only the fixture list, with `Kenya v Mali` and `IN 3 DAYS`;
`Offers` shows only `Eat nearby`, with `Mama Oliech`; typing `oliech` narrows to one row;
typing `zzz` shows `Nothing matches that yet.`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: rebuild Explore as one search across fixtures, venues and offers"
```

---

### Task 14: Full verification and the copy sweep

**Files:**
- Modify: `src/lib/strings.ts`, `DESIGN.md`

- [ ] **Step 1: Sweep for stray literals**

Run: `grep -rnE '"[A-Z][a-z]+ [a-z]' src/screens src/components --include=*.tsx | grep -v "S\." | grep -v "^.*//"`
Expected: review each hit. Every user-facing sentence must be an `S.*` reference. Formatter
output, `className` strings and interpolated data are exempt.

Move anything found into `src/lib/strings.ts`, in the screen-ordered block it belongs to.

- [ ] **Step 2: Check the copy against the voice rules**

Read every new string in `src/lib/strings.ts`. Confirm British English (*organisation*,
*centre*), sentence case in body copy, no exclamation marks, numerals not words. Fix any
that drifted.

- [ ] **Step 3: Run every guard**

```bash
npm run lint
npm test
grep -rn "Date.now()\|new Date()" src/ --include=*.ts --include=*.tsx | grep -v "src/lib/clock.ts"
grep -rn "2,189\|2189" src/ --include=*.tsx
grep -rniE "balance|top ?up|card number" src/ --include=*.tsx
```

Expected: lint clean; every suite green; the first grep silent; the second matching only
the JSDoc in `Eyebrow.tsx`; the third silent — no stored value anywhere.

- [ ] **Step 4: Drive the whole app**

Build, serve, and walk every path: issuance on a fresh profile → five tabs → Services
tiles → Parking → Safety → Driving (all four origins) → Category → Partner → both
redemption paths → Confirm → Wallet → Pass. Confirm zero console errors.

Check the full figure set one last time:

| Where | Must read |
|---|---|
| Services | `2,189 PARTNER BUSINESSES`, 210 / 84 / 1,340 / 460 / 95 |
| Pass card | `Amina Nakato`, `KE-PM-8842`, `VALID IN ALL THREE COUNTRIES`, `Valid · 24 days left` |
| Ticket | `CAT 2`, `Gate D`, `Section 214`, `Seat 17`, `KEN-MLI · 2606-8842`, total `KES 1,100` |
| Home | `Matchday`, `IN 3 DAYS`, `Gates open 14:00`, `KES 150` after one redemption |
| Live | Zambia v Morocco `0 – 2` at `70'`; Uganda v Senegal `1 – 1` at `55'` |
| Wallet | `KES 150` / `KES 850`, `15%`, `2027-06-23`, `KES 850 · food and drink`, `Kasarani ward · 12:55` |
| Both paths | Identical record lines |

- [ ] **Step 5: Update DESIGN.md**

Add a Components section covering all seventeen components in `src/components/pamoja/` —
the six that already existed (`Eyebrow`, `Figure`, `OfferRow`, `PassCard`, `RecordLine`,
`CategoryTile`) and the eleven this work adds (`Crest`, `Chip`, `Avatar`, `StatTrio`,
`Sparkline`, `Donut`, `SearchField`, `MoneyBox`, `TileGrid`, `RouteStrip`, `TicketCard`)
— one line each on what it is for, so the next person does not reinvent `Chip` or
`StatTrio`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: sweep the new copy into strings and document the component set"
```

---

## Verification

After Task 14, all of the following must hold:

- `npm run lint` — clean
- `npm test` — every suite green, including `spec-figures.test.ts`
- `npm run build` — exit 0
- Five tabs, all labels legible at 390px
- Every figure in the Task 14 table reads as specified
- No `Date.now()` or bare `new Date()` outside `src/lib/clock.ts`
- No rendered `2,189` literal; the figure comes from `partners.length`
- No balance, top-up, send or card number anywhere in the app
- The Wallet's `KES 150` and the ticket's `KES 1,100` are visibly distinct quantities
- Zero console errors across every screen
