# PAMOJA Pass — Fan App Design Spec

**Date:** 2026-08-18
**Status:** Approved for planning
**Author:** Mbeche (with Claude)
**Source documents:** `PAMOJA Pass Proposal Rev2.pdf` (PP-2027-01, Rev. 2), `PAMOJA Pass
Framework.pdf`, `PAMOJA Pass Proposal (Brief Style).pdf` — Uratibu Limited, Nairobi
**Reference product:** [hayya.qa](https://hayya.qa/) — Qatar's Hayya credential portal

## Summary

Replace PassGo with **Pamoja**, the fan mobile app for the PAMOJA Pass at AFCON 2027
(19 June – 17 July 2027, Kenya · Uganda · Tanzania).

The PAMOJA Pass is one credential — NFC card, QR fallback, wallet copy — issued to every
fan, player, official and accredited worker, carrying three layers: **identity** (who),
**entitlement** (what it unlocks), and **the record** (every tap, scan and purchase,
written the moment it happens). This app is the fan-facing half of that: the Pass in your
pocket, the partner network you spend it at, and your own record of what you did.

The app ships on mock data behind a repository interface — the pattern PassGo already
uses — so screens do not change when a live backend lands. This matters commercially:
the proposal is awaiting five committee decisions (Rev. 2, Section 12), and building real
M-Pesa integration or real credential issuance ahead of those decisions would be
premature.

Kenya is the only seeded market, per Decision 5 (Kenya as sole Phase 0 market).

## Goals

- Reproduce the four-tab app specified in Figure 3 of the proposal — **Home, Explore,
  Services, Pass** — as a working prototype.
- Make the record loop real: a redemption writes one line, and savings accumulate from
  the fan's own redemptions rather than from a hardcoded number.
- Implement **both** redemption paths — smartphone scan and physical-card short code —
  so the no-exclusion promise is structural, not decorative.
- Keep the fan's record on the fan's device, faithful to Section 09's sovereignty rules.
- Preserve the mock-behind-interface seam so a real backend needs no screen changes.
- Carry the proposal's own numbers and named businesses through verbatim, so the demo and
  the document agree line for line.

## Non-Goals (YAGNI)

These are not deferrals of nice-to-haves. Several are constraints the proposal argues for
explicitly, and building them would break the design it is selling.

- **No funds held, ever.** Section 05: *"The money never touches PAMOJA. Payment goes
  straight from the fan to the merchant's own account… never holds the funds, never sees
  a card number, and needs no banking licence in any of the three countries."* The app
  applies a discount and records that a purchase happened. It is not a checkout. The
  three taps are scan → confirm → one line written; the fan then pays by M-Pesa exactly
  as she would on any other purchase, outside the app.
- **No institutional or aggregate dashboard** inside the fan app. Counts and totals roll
  up elsewhere, to the LOC and CAF. Nothing in this app assembles a view of anyone but
  its own holder.
- **No camera, no face anything.** The density/safety layer (Section 08) is not part of
  the fan app.
- **No paywall, no RevenueCat.** The Pass is free to the fan; Uratibu is paid by
  merchants, the LOC and host governments (Section 11). The `revenuecat.ts` dependency is
  removed.
- **No family passes in v1.** "Manage my Passes" and the `3 / 8` counter appear in
  Figure 3 but are deferred; a dead row is worse than no row.
- **No Amina replay** in v1 (considered and deferred; see Future work).
- **No real identity verification.** Issuance is a mock standing in for accredited
  issuance, labelled as such.
- **No Uganda or Tanzania content.** The card reads *VALID IN ALL THREE COUNTRIES* —
  that is the entitlement — but only Kenya has seeded partners, places and matches.
- **English only** in v1, with strings centralised so Swahili can land without touching
  screens.

## What replaces what

PassGo becomes Pamoja in place. The domain changes completely; the infrastructure does
not.

**Kept:** `App.tsx`, Expo / NativeWind / Metro / Babel config, `src/lib/storage.ts`,
`src/components/ui/index.tsx`, `Screen`, `Icon`, `AppImage`, `SkeletonCard`, `FilterBar`,
the `PassGoMap` / `PassGoMap.web` platform split (renamed `PamojaMap`), the
`repository.ts` seam, path aliases, `tsc --noEmit` as lint, `vitest run` as test.

**Removed:** `DiscoverScreen`, `CountryDetailScreen`, `PlanScreen`, `PaywallScreen`,
`PremiumScreen`, `OnboardingScreen`, the five-tab `TabNavigator`, all of
`src/components/trip/`, `CountryCard`, `AttractionCard`, `CityGroup`, `VisaBadge`,
`PremiumLock`, `mockCountries`, `mockCities`, `mockAttractions`, `mockPrep`,
`mockVisaRules`, `passports.ts`, `seedVietnamTrip.ts`, `useTripStore`, `tripReducers`,
`useAppStore`, `lib/revenuecat.ts`, and their tests.

**Renamed:** app identity in `app.json` (`name: "Pamoja"`, `slug: "pamoja"`, scheme
`pamoja`, bundle `com.uratibu.pamoja`), `PassGoMap` → `PamojaMap`. The repository
*directory* keeps its name — renaming it breaks the Vercel and Netlify project links for
no gain.

`DESIGN.md` currently holds a Webflow design analysis; it is replaced by the Pamoja
design system (below).

## Architecture

Top-level layout is unchanged from PassGo — `screens/ components/ data/ store/ lib/
utils/ navigation/ types/` — with per-tab component subfolders following the precedent
`components/trip/` already set.

The store splits along the proposal's own three layers rather than along tabs, so that
the boundary the spec cares about most is enforced by the code:

| Store | Owns | Section |
| --- | --- | --- |
| `usePassStore` | identity + entitlement: holder, tier, validity, short code, what the Pass unlocks per country | 03 |
| `useRecordStore` | the event log. Append-only. The **only** writer of lines. | 03, 04 |
| `usePartnerStore` | the partner network, categories, offers, distance | 05 |

`repository.ts` keeps its exact current role: the single seam between UI and data, mock
behind an async interface.

### Domain model

```ts
// ── Identity ─────────────────────────────────────────────
type HostCountry = "KE" | "UG" | "TZ";
type PassTier = "fan" | "player" | "official" | "media" | "worker";

interface Pass {
  id: string;              // "KE-PM-8842"
  holderName: string;      // "Amina Nakato"
  tier: PassTier;
  issuedIn: HostCountry;
  validFrom: string;       // ISO — 2027-06-19
  validUntil: string;      // ISO — 2027-07-17
  shortCode: string;       // printed on the card; read aloud at a counter
  status: "active" | "expired" | "suspended";
}

// ── Entitlement ──────────────────────────────────────────
interface Entitlement {
  kind: "match-access" | "transport-fare" | "discount" | "priority-service";
  countries: HostCountry[];   // entitlements differ by country (Section 03)
  label: string;
  detail: string;
  value?: number;             // e.g. -15 for a 15% discount tier
}

// ── The record ── append-only, on device ─────────────────
type EventKind = "border" | "turnstile" | "transport" | "purchase" | "fan-zone";
type Channel = "nfc" | "qr" | "shortcode";

interface PassEvent {
  id: string;
  passId: string;
  kind: EventKind;
  at: string;                 // ISO
  place: { name: string; ward?: string; city: string; country: HostCountry };
  channel: Channel;
  partnerId?: string;
  amount?: { currency: "KES"; gross: number; discount: number; net: number };
}
```

### Derived, never stored

Every headline number in Figure 3 is computed from the data behind it, so it cannot drift
from what the app actually shows:

| Display | Derived from |
| --- | --- |
| `YOU'VE SAVED KES 3,410` | sum of `amount.discount` across the record |
| `2,189 PARTNER BUSINESSES` | partner set size |
| `Eat 1,340`, `Shop 460`, … | partner set grouped by category |
| `Valid · 24 days left` | `validUntil` minus today |
| Home's resident-vs-arrived variant | does the record contain a `border` event? |

### The two redemption paths

Both write an identical line. They differ only in how the line arrives.

1. **Scan** (`channel: "qr"`) — fan scans the merchant's code, confirms the discount, the
   line is written. Figure 4.
2. **Short code** (`channel: "shortcode"`) — fan reads `KE-PM-8842` to a cashier who
   enters it by USSD or a counter device. The discount applies and the line is written,
   but **the fan never touches her phone.** This event therefore arrives *inbound*, via a
   separate ingest function on `useRecordStore`, not through the scan flow. In the
   prototype it is simulated; against a real backend it is a push.

Keeping these entry points distinct is what makes Section 03's "THE FIX" real. A
smartphone-only redemption path would silently break the no-exclusion promise, which the
proposal identifies as a defect in its own first draft.

### Time, and the demo clock

The tournament is in June 2027 but the app is being built and demoed in 2026, so every
date-derived display — `Valid · 24 days left`, the next match, "today" in the Wallet —
needs a single seam rather than direct `Date.now()` calls. All time reads go through
`lib/clock.ts`, whose default is a **demo date of Wednesday 2027-06-23, 12:55 EAT**, with
a switch to real time.

That date is not arbitrary. It is the only date at which the proposal's own figures are
all simultaneously true:

| Proposal figure | Requires |
| --- | --- |
| `Valid · 24 days left` (Figure 3) | exactly 24 days to `2027-07-17` → **2027-06-23** |
| `Kasarani ward · 12:55 · Wednesday lunchtime` (Figure 4) | a Wednesday at 12:55 → **2027-06-23** ✓ |
| `Kenya v Mali · Sat 16:00` (Figure 3) | the next Saturday → **2027-06-26** |

The tournament window itself checks out: 19 June and 17 July 2027 are both Saturdays.
Pinning the clock here means every screen matches the document without a single hardcoded
string.

### Where the record lives

On device, in AsyncStorage, via the existing `storage` module. **This is not a prototype
shortcut — it is the correct architecture.** Section 09:

> A fan can always see her own complete journey, on her own device. That is not a privacy
> exception, it is her own data, held by her. What no institutional dashboard in any of
> the three countries ever does… is assemble that same cross-domain view for anyone else.

When a backend lands, only aggregates leave the device. This should not later be
"fixed" by syncing full records to a server.

## Screens

`RootNavigator` (stack) gates on whether a Pass exists: none → issuance; otherwise →
tabs. Modals stack above: Scan, Confirm, PartnerDetail, EventDetail.

### Issuance — the hayya front door

Three steps: country of issue → who you are (name, nationality) → your ticket. The Pass
then materialises, echoing Rev. 2 Section 04: *"Buys her ticket. Her Pass is created with
it."* hayya's flow is apply → track → carry; with no issuing authority to wait on, this
collapses to apply → carry.

Self-entered identity is a **mock standing in for accredited issuance** (Section 03:
"Verified once, when the Pass is issued"). Labelled as such in-app.

### Home — your match, your savings

`TODAY`; the next match (*Kenya v Mali · Sat 16:00 · Kasarani*); the savings tile;
`OFFERS NEAR YOU` (Mama Oliech −15%, Java House −10%, Kenya Bus −20%).

Figure 3's commentary is built, not skipped: *"A fan who lives here gets the match, the
route and their savings… A fan who flew in gets validity, the border and a city they have
never visited. Same four tabs underneath."* One derived flag — does the record contain a
border crossing? — switches which three cards lead. Savings leads for residents *"because
that is what opens the app on a day with no match."*

### Explore — fan zones, events, places

Segmented Events / Places / Fan Zones; `COMING UP` then `NEAR YOU`. Seeded: Fan Zone ·
Uhuru Park (open daily from 14:00, free entry with your Pass), Nairobi Museum, Karura
Forest. Reuses the map via the existing `.tsx` / `.web.tsx` platform split.

### Services — every business that gives you a discount

Five category tiles with live counts → category list → partner detail. Five and not
twelve is deliberate: *"Qatar shipped twelve service tiles on a mature partner network. We
are building ours from nothing; five that are full beat twelve that are empty."* Counts
stay derived, so a category can never display a number it cannot fill.

### Pass — the credential

The card: `#04222b`, holder name, `KE-PM-8842`, `Valid · 24 days left`, `VALID IN ALL
THREE COUNTRIES`. Renders entirely from local state with **no network path at all** —
Section 04 promises the turnstile works "with no network needed." Below it, entitlements
by country, and the way into the Wallet.

### Wallet — her own record

The record, grouped by day, each entry in the proposal's own format:

```
KES 850 · food and drink
Kasarani ward · 12:55
```

This is the one screen in the system that assembles a whole journey, and it exists only
here, on her device.

### Scan → Confirm

Modal pair. Confirm shows gross, discount and net, and states plainly that payment
happens separately, through M-Pesa, Airtel Money or card, as normal.

## Design system

Sampled directly from the proposal artwork (Figures 1 and 3), not approximated. Exactly
two hues.

| Token | Hex | Role |
| --- | --- | --- |
| `deep` | `#04222b` | Pass card, dark surfaces — a petrol navy, notably not black |
| `deep-soft` | `#223c44` | raised areas inside the card |
| `accent` | `#0e6ba8` | the single blue: links, active tab, validity line |
| `ink` | `#16181a` | headings, body |
| `body` | `#545557` | secondary text |
| `mute` | `#676869` | tertiary text |
| `faint` | `#acadae` | disabled, placeholders |
| `hairline` | `#dde3e4` | borders |
| `panel` | `#eef0f0` | cards, tiles |
| `surface` | `#f5f8f8` | app background |
| `canvas` | `#ffffff` | — |

This replaces PassGo's tokens wholesale: the purple `ocean` ramp goes with Premium, the
four `visa` colors go with the visa domain.

**No per-category colors** for Stay / Move / Eat / Shop / Do. Figure 3 renders those tiles
plain; inventing five brand colors would fight the design.

**Typography.** Headings in a geometric sans with negative tracking. Everything
procedural — `SECTION 03 / 10`, `KE-PM-8842`, `KES 850 · food and drink` — in uppercase
mono. The mono is load-bearing: it is what makes a record line *look* like a record line.
Every Wallet entry is monospaced. This adds `expo-font` plus two families; the repo
currently uses system faces only.

`tailwind.config.js` and `src/lib/theme.ts` stay in sync, as they do today.

## Seed data

The proposal's numbers are internally consistent, so the seed matches them exactly rather
than approximating.

**Partners — 2,189 total:** Stay 210 · Move 84 · Eat 1,340 · Shop 460 · Do 95. The named
businesses come through verbatim (Mama Oliech −15%, Java House −10%, Kenya Bus −20%); the
remainder is generated deterministically from curated Nairobi ward and business-name
pools, so the counts are real listings you can scroll into rather than a label over an
empty set.

**Places and events:** Fan Zone · Uhuru Park, Nairobi Museum, Karura Forest.
**Match:** Kenya v Mali · Sat 16:00 · Kasarani.
**Holder:** Amina Nakato, `KE-PM-8842`, as printed on the card in Figure 1. Issuance
pre-fills that name as a demo convenience, and the first Kenya-issued Pass is assigned
`KE-PM-8842` deterministically, so a fresh install reproduces the artwork exactly.

**The record starts empty, and that is deliberate.** Figure 3 shows `YOU'VE SAVED KES
3,410`, but seeding that number would defeat the point: the whole argument is that a line
is written when a use happens. So a new Pass has zero saved, and the figure is reached by
redeeming — which is precisely the loop the demo exists to show. (The deferred Amina
replay, in Future work, is the shortcut that gets there in one tap; it is deferred, not
absent, for exactly this reason.)

The seed reproduces the proposal's own arithmetic: Section 06's worked example
(`KES 1,000 − 150 = 850`) is exactly Mama Oliech's 15% on a 1,000/= lunch, and Figure 2's
record line is that same purchase, in Kasarani ward, at 12:55.

## Error handling

- **Expired or suspended Pass** — the card renders in a muted state with the reason; the
  scan flow refuses and explains, rather than writing a line.
- **Unknown merchant code** — Confirm is never reached; the scan modal reports the code
  was not recognised and offers the short-code path.
- **Storage failure** — the record is the app's source of truth for savings, so a failed
  append surfaces to the user rather than failing silently. Reads fall back to the
  bundled seed, as `repository.ts` does today.
- **Offline** — the intended state, not an error. The Pass card, entitlements and Wallet
  are fully available with no network. Nothing in the four tabs blocks on a request.
- **Empty record** — a new Pass has no lines. Home shows the savings tile at zero with a
  prompt to find an offer; the Wallet shows a first-use state.

## Testing

Vitest, extending the existing setup. Pure logic only, no React Native rendering — the
same discipline the current tests follow.

- Savings derived from the record, including the empty case.
- Category counts derived from the partner set; total equals 2,189.
- Discount arithmetic — 15% of 1,000 is 150, net 850.
- `Valid · N days left` across before / during / after the tournament window, and that
  the demo clock yields exactly 24.
- The next-match lookup returns Saturday 2027-06-26 from the demo clock.
- Record append is ordered and append-only.
- Entitlement resolution per country.
- Home's resident-vs-arrived flag against records with and without a border event.
- Short-code ingest produces a line identical to the scanned equivalent, differing only
  in `channel`.

## Future work

Deliberately out of v1, in the order they would most likely be picked up:

1. **Amina's journey, replayable** — the five events from Section 04 (Malaba 06:40, bus
   14:20, lunch 12:55, turnstile 16:10) played through the app as a demo. Small to build
   on top of the record loop, and it tells the whole proposal in thirty seconds. The
   strongest candidate for a second cut.
2. **Family passes** — "Manage my Passes", the `3 / 8` counter. Backs the argument that
   three people through a turnstile is three attendances, not one, and that a shared Pass
   would understate every per-person figure in the tournament reports.
3. **Uganda and Tanzania content**, once Kenya is proven (Decision 5's sequencing).
4. **Swahili**, via the string module.
5. **Real backend** behind `repository.ts` — issuance, verification, M-Pesa/Daraja,
   NFC. Gated on Decisions 1 and 2.
