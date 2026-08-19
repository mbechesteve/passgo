# Pamoja — Matchday Redesign Design Spec

**Date:** 2026-08-19
**Status:** Awaiting review
**Author:** Mbeche (with Claude)
**Supersedes:** nothing. This spec *extends*
`2026-08-18-pamoja-pass-app-design.md`; where the two disagree, the disagreement is
named explicitly below and the earlier spec wins unless this one says otherwise.
**Source documents:** `Mobile design without Craydel colours.zip` — a Claude Design
canvas, 7 artboards, iOS frames (`Match App Mobile.dc.html`);
`uploads/Uratibu-Brand-Guidelines.pdf` (V1.0, July 2026)

## Summary

Take the delivered design canvas into the app: restyle the four existing tabs, add two
new screens (**Live** and **Drive & Borders**), and enrich the Pass, Wallet and Services
tabs — without giving up the product's central claim that Pamoja never holds a fan's
money.

The canvas is a redesign *of this app*: its `uploads/` folder contains a screenshot of
our own Home screen. It is therefore a revision, not a greenfield brief, and most of it
can be adopted as drawn.

Two findings shrink the work considerably:

1. **The palette already matches.** `tailwind.config.js` defines `deep #04222b`,
   `accent #0e6ba8`, `panel #eef0f0`, `surface #f5f8f8` and `ink #16181a`. Those are
   Uratibu's Forest, Command Cerulean, Tint, Paper and Ink *exactly* — arrived at
   independently by sampling the proposal artwork (`DESIGN.md`). The brand change is
   therefore typographic, not chromatic.
2. **The Tailwind family keys are the whole choke point.** `fontFamily` maps five
   semantic keys (`sans`, `medium`, `display`, `mono`, `mono-medium`) onto faces. Keeping
   the keys and swapping the faces re-letters every screen with no `className` edits
   anywhere.

Three things in the canvas contradict committed intent and are resolved here rather than
absorbed silently: the stored-value wallet, the Pass becoming a seat ticket, and
illustrative figures that conflict with the proposal's own.

## Goals

- Move the app onto Uratibu typography — **Outfit** for voice, **JetBrains Mono** for
  readouts — at a single choke point, with no screen edits.
- Adopt the canvas's component vocabulary: crests, chips, avatars, search field,
  sparkline, donut, tile grid, perforated ticket.
- Add the **Live** tab (scores, match stats, also-live list) and the **Drive & Borders**
  guide, both fixture-backed behind the existing repository seam.
- Give the Pass tab its match ticket *beneath* the entitlement card, so the credential
  and the seat coexist.
- Keep every figure this app has already been verified against, unchanged.
- Fix `kickoffLabel`, which carries the same offset defect that `recordLine` carried
  until commit `1bbab4e`.

## Non-Goals (YAGNI)

- **No balance, no top-up, no send, no card number.** The canvas's Wallet artboard draws
  `BALANCE KES 2,450.00`, a card ending `4921`, Top up / Send buttons and an
  `M-Pesa top up +3,000` activity line. Adopting these would reverse Rev. 2 §05 —
  *"The money never touches PAMOJA… never holds the funds, never sees a card number, and
  needs no banking licence in any of the three countries"* — which is quoted in
  `src/utils/redeem.ts` and rendered to the fan in `S.confirmPaySuffix`. It would also
  drag in custody, transfer and reconciliation, none of which the awaiting-decision
  posture permits. **Decision: the Wallet stays a record.**
- **No chat or messaging.** The Services artboard ends in a *Chat* button. There is no
  messaging backend and building one is far outside this work. The "Stewards answer in
  under 2 minutes on matchday" note is kept as copy; the button is omitted rather than
  shipped as a dead end.
- **No camera, no QR scanning.** Unchanged from the earlier spec. The Pass *displays* a
  code; nothing in this app reads one.
- **No live-score feed.** Scores are seeded fixtures; only the match minute is derived
  from the clock.
- **No per-category or per-status colour.** `DESIGN.md` holds: two hues, one neutral
  ramp. The canvas obeys this, and the tints added below are shades of the same two hues.
- **Family passes** remain out, per the earlier spec.

## What the canvas gets, and what it does not

| Artboard | Verdict | Note |
|---|---|---|
| 1A Home | Adopt | Avatar, crests, gates-open line, sparkline, week chip, offer distances |
| 1B Explore | Adopt | Search + 4 filters over a merged result set. Largest single-screen change |
| 1C Services | Adopt, extended | Tiles band **above** the retained partner browser |
| 1D Pass | Adopt, extended | Ticket card **below** the retained entitlement card |
| 2A Wallet | Adopt visuals only | Donut and week chip kept; balance, card, Top up, Send dropped |
| 3A Watch Live | Adopt | New tab. Featured match derived from the clock |
| 3B Drive & Borders | Adopt | New pushed screen. The canvas gives it no entry point — see below |

### Deviations from the drawing, and why

- **`IN 2 DAYS` → derived.** The canvas labels a Saturday 16:00 kickoff `IN 2 DAYS`, but
  from the demo instant (Wednesday 23 June) that is three days. The label is computed
  from the clock, so it reads `IN 3 DAYS`.
- **`71'` and `58'` → derived.** Live minutes come from `now() − kickoff`, so the seeded
  kickoffs decide them. Round kickoff times are preferred over reverse-engineering the
  drawn minutes.
- **`JAMES KARIUKI`, `KES 950`, `+450` → replaced.** Figure 1 specifies `Amina Nakato`
  and `KE-PM-8842`; the verified savings figure from the Mama Oliech redemption is
  `KES 150`. The canvas's numbers are placeholder and are treated as such.
- **`THIS PASS SAVES YOU` → `WHAT THIS TICKET SAVES YOU`.** See *Two savings figures*.
- **Ugandan venue dropped.** The also-live list names Mandela Stadium, Kampala. Decision 5
  seeds Kenya only, and `MATCHES` is Kenyan throughout, so live fixtures use Kenyan
  venues.
- **Drive & Borders gets an entry point.** Its artboard shows the same five-tab bar with
  nothing pointing at it. It hangs off a full-width *Driving in* row directly beneath the
  Services tiles band — it is a guide, not a service list, so it does not take a tile.

## Architecture

### Typography — the choke point

Add `@expo-google-fonts/outfit` and `@expo-google-fonts/jetbrains-mono`; drop
`space-grotesk` and `ibm-plex-mono`. Load the faces in `App.tsx`, and remap
`tailwind.config.js` **keeping every key name**:

| Key | Was | Becomes |
|---|---|---|
| `sans` | `SpaceGrotesk_500Medium` | `Outfit_400Regular` |
| `medium` | `SpaceGrotesk_600SemiBold` | `Outfit_500Medium` |
| `display` | `SpaceGrotesk_700Bold` | `Outfit_700Bold` |
| `display-heavy` | — (new) | `Outfit_800ExtraBold` |
| `mono` | `IBMPlexMono_400Regular` | `JetBrainsMono_400Regular` |
| `mono-medium` | `IBMPlexMono_500Medium` | `JetBrainsMono_500Medium` |

`display-heavy` is the one new key, for the large money figures the canvas sets at 800.
The existing comment in `tailwind.config.js` — that family keys must not collide with
Tailwind's weight utilities — still governs: `display-heavy` is safe, `bold` would not be.

Outfit is rounder and wider than Space Grotesk at the same size. The Pass card, the money
figures and the tab labels are the places most likely to reflow; each is checked in the
browser rather than assumed.

### Palette — additions only

No existing hue changes. Added, all shades of the same two hues:

| Token | Hex | Use |
|---|---|---|
| `deep.grad` | `#0a3641` | Second stop of the money-box / balance-card gradient |
| `deep.deeper` | `#062b36` | Third stop, bottom-right of the gradient |
| `accent.bright` | `#1782c4` | Pressed state on accent (Uratibu's hover rung) |
| `accent.press` | `#0a5486` | Pressed state on accent text |
| `accent.tint` | `#e2edf4` | Chip fill on light surfaces |
| `accent.tint-strong` | `#cde2ef` | Chip fill, higher contrast |
| `accent.soft` | `#6fc2e8` | Accent text **on** `deep` — mono eyebrows, kickoff times |
| `ondark.mute` | `#8ea5ae` | Secondary text on `deep` |
| `ondark.faint` | `#7fa5b4` | Tertiary text on `deep` |

The canvas also runs cooler light greys than we do — `#5a686d` / `#8a9599` against our
`#545557` / `#676869` / `#acadae`. `body`, `mute` and `faint` shift to the cooler values.
This is a deliberate, app-wide change and the one part of the restyle with no local
blast radius: every screen moves a shade cooler at once. `theme.ts` mirrors all of it, as
it already does.

### Domain model additions

```ts
// Match gains coordinates — "400m from Gate D" and the route screen both need them.
export interface Match {
  /* …existing fields… */
  coords: { lat: number; lng: number };
}

/** Seeded score and stats. The minute is never stored — it derives from the clock. */
export interface MatchLive {
  matchId: string;
  home: number;               // goals
  away: number;
  possession: [number, number];
  shots: [number, number];
  corners: [number, number];
}

export type MatchPhase = "scheduled" | "live" | "half-time" | "full-time";

/** The seat, distinct from the credential. One per match, tied to a Pass. */
export interface MatchTicket {
  id: string;
  passId: string;
  matchId: string;
  category: 1 | 2 | 3;
  gate: string;               // "D"
  section: string;            // "214"
  seat: string;               // "17"
  /** Itemised, and deliberately NOT part of the record. See below. */
  savings: { label: string; was: number; now: number | "free" }[];
}

export type OriginCountry = "UG" | "TZ" | "RW" | "ET";

/** Static reference content: what a driver needs at the border. */
export interface BorderCrossing {
  origin: OriginCountry;
  originCity: string;         // "Kampala"
  post: string;               // "MALABA"
  destinationCity: string;    // "Nairobi"
  distanceKm: number;         // 653
  driveHours: number;         // 11
  waitMinutes: number;        // 45
  requirements: { label: string; detail: string }[];
  goodToKnow: { label: string; detail: string }[];
}
```

`MatchTicket.reference` is **not** stored — it derives from the match and the Pass serial
(`KEN-MLI · 2604-8871`), keeping the "derived, never stored" rule of the earlier spec.

### Two savings figures, kept apart

The canvas shows `KES 950` twice — once on Home as `YOU'VE SAVED` and once on the Pass as
`THIS PASS SAVES YOU` — implying they are the same quantity. They are not, and conflating
them would corrupt the record:

- **`YOU'VE SAVED`** (Home, Wallet) is `totalSaved(events)`: the sum of discounts on
  redemptions the fan actually made. Verified as `KES 150` after one Mama Oliech
  redemption. Only a redemption may move this number.
- **`WHAT THIS TICKET SAVES YOU`** (Pass) is the sum of the ticket's own line items — a
  discounted Cat 2 ticket, a free shuttle. It is an entitlement's stated value, not
  something that happened. It is never added into `events`, and its label is changed from
  the drawing so the two cannot be misread as one.

The Home copy `3 offers used · pass perks counted in` therefore loses its second clause;
it becomes `N offers used`, derived from the record.

### Time — one seam, extended

`src/lib/clock.ts` stays the only time source. The new helpers live in
`src/utils/match.ts` beside `nextMatch` and take their instant explicitly, exactly as
`daysUntil` and `passStatus` already do — callers pass `now()`:

```ts
export function matchPhase(match: Match, at: Date): MatchPhase;

/** Playing minute, or null when the match is not in play. */
export function liveMinute(match: Match, at: Date): number | null;

/** Live matches, most advanced first. The first is featured; the rest are "also live". */
export function liveMatches(matches: Match[], at: Date): Match[];
```

Given `wall` = whole minutes since kickoff, the phase and minute are:

| `wall` | Phase | Minute |
|---|---|---|
| < 0 | `scheduled` | — |
| 0–45 | `live` | `wall` |
| 46–60 | `half-time` | 45 |
| 61–105 | `live` | `wall − 15` |
| > 105 | `full-time` | — |

`liveMinute` returns null for `scheduled` and `full-time`, which is what drives the Live
tab's empty state.

**`kickoffLabel` is fixed as part of this work.** It currently reads:

```ts
const day = DAYS[new Date(m.kickoff).getUTCDay()];
const time = m.kickoff.match(/T(\d{2}:\d{2})/)?.[1] ?? "";
```

That is the same defect `recordLine` carried until `1bbab4e`: wall-clock fields scraped
from the literal string, and a UTC weekday. It is correct today only because every seeded
kickoff is hand-written at `+03:00` and none crosses UTC midnight. Adding fixtures — which
this work does — is exactly the change that breaks it. Both lines route through
`eatParts`, and a fixture whose kickoff crosses UTC midnight goes into the test suite as
the guard.

### Data layer

Four bundled datasets become six, all behind the existing read-through cache in
`repository.ts` — no new mechanism:

```ts
export async function fetchMatchLive(): Promise<MatchLive[]>;
export async function fetchBorderCrossings(): Promise<BorderCrossing[]>;
```

`MatchTicket` is issued, not fetched: `issueTicket(pass, match)` mirrors `issuePass`, and
the ticket is held in `usePassStore` beside the Pass.

## Navigation

Five tabs, in the canvas's order:

```
Home · Explore · Live · Services · Pass
```

`TabParamList` gains `Live: undefined`. `RootStackParamList` gains
`Driving: undefined`, `Parking: undefined` and `Safety: undefined`. Wallet stays pushed
from Pass; Driving is pushed from Services.

The navigator gating from Task 9 is untouched — holding a Pass still decides Issuance vs
Tabs.

## Screens

### Home

Eyebrow `TODAY` over a display heading, with an initials avatar at the right derived from
`pass.holderName` (`AN`, not the canvas's `JK`). Then:

- **Match card** — mono `SAT · 16:00`, a derived `IN 3 DAYS` chip, venue tag, crest tiles
  either side of `Kenya v Mali`,
  and a footer row of `Gates open 14:00` (kickoff − 2h, derived) against a *View pass*
  link into the Pass tab.
- **Money box** — `deep` → `deep.grad` → `deep.deeper` gradient. `YOU'VE SAVED` in mono
  over the figure in `display-heavy`, a `+N THIS WEEK` chip (sum of discounts in the
  trailing 7 days), a sparkline of daily savings, `N offers used`, and a *Browse offers*
  button into Services. The empty-state copy is retained from `S.homeSavedEmptyHint`.
- **Offers near you** — existing `OfferRow`s gaining an initial tile and a distance
  subline computed from the next match's venue coords (`400m from Gate D`), with a
  *See all* action.

The resident/arrived variant from `homeVariant` is preserved.

### Explore

The largest change. One search field over a merged result set, with filters
`All · Fixtures · Venues · Offers`, then sections `THIS WEEK` (dated fixture rows),
`EVENTS NEAR YOU`, `EAT NEARBY`, `THINGS TO SEE`, `VENUES`. Results merge three existing
sources — `fetchMatches`, `fetchExplore`, `fetchPartners` — so no new dataset is needed;
`freeWithPass` and distance carry through as they do today.

### Live

Featured match at the top: crests, score, derived minute (`70'`), and a three-up stat row
for possession, shots and corners from `MatchLive`. Beneath it, `ALSO LIVE` rows for the
remaining live fixtures with score and minute.

When nothing is live — including any time the real-time toggle is on outside a match — the
tab shows the next fixture and its countdown instead. This state is reachable in the
default demo by design, and is tested.

### Services

Three bands, top to bottom:

1. **Matchday tiles** — Shuttles, Food, Parking, Merch, Safety, Stays. Four route into
   existing category lists (`move`, `eat`, `shop`, `stay`). Parking and Safety get small
   new fixture-backed screens: Parking lists pre-bookable zones A–D with walk time to the
   gate; Safety lists the steward help line and a report row, both static.
2. **Driving in** — a full-width row into the border guide.
3. **The partner browser, retained** — `2,189 PARTNER BUSINESSES` over the five category
   tiles with their derived counts. This is the network Task 5 exists to produce and it
   keeps its surface.

The *Need a hand?* note is kept; the Chat button is not built.

### Pass

Entitlement card, restyled, with an `● ACTIVE` status chip; the `WHAT YOUR PASS UNLOCKS`
entitlement rows; then the **ticket card** — a `deep`/accent panel carrying `MATCH PASS`,
a `CAT 2` chip, crests either side of the kickoff and venue, a perforated divider, the
`GATE / SECTION / SEAT` three-up, a code block, and the derived reference in mono. Then
`WHAT THIS TICKET SAVES YOU` with its itemised rows, and the existing *My Wallet* row.

The code block renders a deterministic matrix derived from the reference string. It is
visually faithful and offline, and it is **not a scannable QR** — a real one needs
`react-native-svg` plus a QR encoder, which is a follow-up. The stand-in is labelled as
such in code so nobody mistakes it for a working credential.

### Wallet

Unchanged in substance. `YOU'VE SAVED` / `YOU'VE SPENT` figures, a savings-rate donut
(`totalSaved / (totalSaved + totalSpent)` — 15% on the verified data, not the canvas's
30%), a `+N THIS WK` chip, day-grouped `RecordLine`s, the storage-error banner, and the
closing note. No balance, no card, no Top up, no Send.

### Drive & Borders

Heading, standfirst, and origin chips for Uganda, Tanzania, Rwanda and Ethiopia
(defaulting to Uganda). Then the route strip (`Kampala UGA → MALABA → Nairobi KEN`), a
three-up of distance / drive time / border wait,
`AT THE BORDER YOU'LL NEED` as label-and-detail rows, and `GOOD TO KNOW` as a
four-row grid. All content comes from `BorderCrossing`; switching chips switches records.

## Design system additions

New components in `src/components/pamoja/`, alongside the existing five:

| Component | Purpose |
|---|---|
| `Crest` | Three-letter team tile, `deep` or `panel`; code from `TEAM_CODE` |
| `Chip` | Small mono pill; accent, tint or on-dark variants |
| `Avatar` | Initials disc derived from a name |
| `SearchField` | Explore's single input |
| `Sparkline` | Daily-savings bars, pure View widths — no charting dependency |
| `Donut` | Savings-rate ring |
| `TileGrid` | The Services matchday tiles |
| `TicketCard` | Perforated match ticket, with the code block |
| `StatTrio` | Three-up figures — used by Live, the route strip and the ticket |
| `RouteStrip` | Origin → post → destination |

`Pill` and `Stat` already exist in `src/components/ui`; `Chip` and `StatTrio` are the mono,
canvas-faithful variants rather than replacements, and the existing two stay where they
are.

## Seed data

- **Live fixtures** — two matches in play at the demo instant, both at Kenyan venues.
  Kickoffs are chosen to land clean minutes under the phase table above, where the 15
  minutes of half-time are subtracted after the interval:

  | Fixture | Venue | Kickoff | `wall` at 12:55 | Minute |
  |---|---|---|---|---|
  | Zambia v Morocco | Nyayo, Nairobi | 11:30 | 85 | 70' |
  | Uganda v Senegal | Kasarani, Nairobi | 11:45 | 70 | 55' |

  Zambia v Morocco is featured, being the more advanced. `nextMatch` is unaffected: both
  kicked off before the demo instant, so Home still reads Kenya v Mali on Saturday.
- **`TEAM_CODE`** — a map of FIFA three-letter codes for every seeded nation
  (`Kenya → KEN`, `Mali → MLI`, `Zambia → ZAM`, `Morocco → MAR`, `Uganda → UGA`,
  `Senegal → SEN`, `Côte d'Ivoire → CIV`, `Egypt → EGY`). A substring rule cannot do this
  — Mali's code is `MLI`, not `MAL`, and `Côte d'Ivoire` has no sane truncation. Unseeded
  names fall back to the first three letters upper-cased.
- **`Match.coords`** — added to all fixtures, existing and new.
- **`MatchLive`** — score and stats per live fixture, matching the canvas where it does
  not conflict.
- **`MatchTicket`** — one, for the next fixture, issued with the Pass: Cat 2, Gate D,
  Section 214, Seat 17, savings rows for the ticket and the shuttle.
- **`BorderCrossing`** — four records. Uganda's is the canvas's, verbatim: 653 km, ~11 h,
  ~45 min, five requirements, four good-to-knows.
- **Parking and Safety** — small lists, a handful of rows each.

## Error handling

Unchanged in approach. The record's storage failure stays loud (`storageError` banner),
because the record is the source of truth for savings. New reads follow the existing
pattern: a missing dataset yields an empty list and the section renders its empty state
rather than throwing. `liveMinute` returning null is a normal state, not an error.

## Testing

Every new pure function gets unit tests: `liveMinute` (before, during, half-time, after),
`liveMatches` ordering, gates-open and days-until labels, savings rate, trailing-week
savings, sparkline bucketing, ticket reference derivation, crest codes.

Two guards matter more than the rest:

1. **`kickoffLabel` after the fix** — including a fixture whose kickoff crosses UTC
   midnight, which is the case that would have caught the original defect.
2. **A consolidated figures test** — `2,189` and the five category counts, `Amina Nakato`
   / `KE-PM-8842` / `Valid · 24 days left`, and `KES 850 · food and drink` /
   `Kasarani ward · 12:55` / `KES 150`. These are proposal specifications, not sample
   data, and the restyle must not move them. `src/utils/redeem-record.test.ts` already
   holds the last of these; this consolidates the rest.

Beyond the suite, each stage ends with a headless browser drive of the built app —
issuance, all five tabs, both redemption paths — because a font swap and a grey shift are
precisely the changes a unit test cannot see. `npm run lint` and `npm test` gate every
commit, as now.

## Risks

- **Font metrics.** Outfit is wider than Space Grotesk. The money figures, the Pass card
  and five tab labels in place of four are the likely reflow points. Checked visually,
  not assumed.
- **The grey shift touches every screen.** Intended, but it is the change with the widest
  blast radius and no test can assert "looks right".
- **Explore's reframe** merges three data sources behind one search. It is the single
  largest screen change and the most likely to need a second pass.
- **The code block is not scannable.** Flagged in the UI copy and in code.
- **Five tabs is a crowded bar on small phones.** If labels truncate, icons-only with the
  active label is the fallback.

## Future work

- A real QR encoder, once scanning at a turnstile is in scope.
- A live-score feed behind `fetchMatchLive`, replacing the fixture with no screen change.
- Uganda and Tanzania fixtures and partners, when Decision 5 widens beyond Kenya.
- Chat, if and when there is something to chat with.
