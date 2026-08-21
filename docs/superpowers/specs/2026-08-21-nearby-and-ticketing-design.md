# Pamoja — Near You, and Seat-Level Ticketing Design Spec

**Date:** 2026-08-21
**Status:** Approved, not yet implemented
**Author:** Mbeche (with Claude)
**Supersedes:** nothing wholesale, but **reverses one decision** taken in
`2026-08-19-talanta-ticket-office-design.md` — its *Three decisions* table rejected
"Individual seat picking", and this spec adopts it. See **Reversing the seat decision**,
below, for why that is now the right call and what it costs.
**Surface:** the portal only. The Expo app is untouched by this spec.

## Summary

Four additions to the portal, all on one brief:

1. **Fan Villages near you** — the fan zones promoted from a line in `EXPLORE_ITEMS` to
   an entity with capacity, hours and facilities.
2. **Concerts and performances near you** — the events rail's six hardcoded cards become
   data, sortable by distance.
3. **Artists participating** — a roster that cross-links with the performances, so both
   "who is playing this show" and "where else is this act playing" are answerable.
4. **Seat-level ticketing** — pick a section, then a row and a seat from a real grid; or
   take a hospitality box whole.

Plus a responsive pass: audit every existing page at four widths, and build the new ones
mobile-first.

## Why

Three of the four things already half-exist, in a form that cannot answer the question
being asked of it.

`EXPLORE_ITEMS` carries two `kind: "fan-zone"` members — Uhuru Park and Kasarani — with a
name, a `detail` string and an `opensAt`. That is enough to list a fan zone and not enough
to choose between two. The events rail on `index.html` is six `<a class="ev">` elements
written by hand, so a seventh event is a markup edit and "which of these is nearest me"
is unanswerable by construction. And artists appear nowhere at all, though every one of
those six cards is a concert.

"Near you" has no precedent anywhere in the codebase. Nothing has ever asked where the
reader is.

## The decisions

| Decision | Taken | Rejected |
|---|---|---|
| Surface | Portal only | Portal + app (double the work, and the app's mobile story is separate); app only (leaves the responsive pass undone) |
| Where "you" are | City picker, geolocation preselects | A `src/lib/place.ts` seam like the clock (visitor cannot change it); real geolocation sorted by true distance (non-deterministic, unverifiable) |
| Seat granularity | Section → row → seat, derived inventory | Section + seat dropdown (loses "where am I sitting"); block-level with boxes added (does not deliver seat picking) |
| Hospitality boxes | A second tab beside the bowl | Boxes drawn as a fifth band on the bowl (needs `blockRects` taught a fifth stand); a fourth `category` (makes a whole-box price masquerade as per-seat) |
| Navigation | One new destination, plus tickets nested under a fixture | Three new destinations (eight tabbar items at 360px); sections on `index.html` (buries it in a 1,008-line file) |
| Responsive scope | Audit all pages, new pages mobile-first | New pages only; full sweep with a written breakpoint audit and an overflow verify script |

## "Near you", and why the geolocation call is not in `src`

This codebase is built to be checkable. `src/lib/clock.ts` freezes time to a seeded June
2027 so that every figure a page shows can be recomputed; `scripts/verify-portal.mjs`
recomputes them rather than trusting numbers written into markup. Real geolocation is
hostile to all of that: distances become unverifiable and every visitor sees a different
page.

So the reader's location is a **city**, chosen from a visible control, and
`navigator.geolocation` has exactly one job — preselect the nearest city on first visit.
After that it is out of the loop. A denied prompt costs nothing and falls through to
Nairobi.

That splits cleanly across the boundary the project already maintains:

| Lives in | What | Why there |
|---|---|---|
| `src/utils/nearby.ts` | `HOST_CITIES`, `haversineKm()`, `nearestCity()`, `byDistanceFrom()`, `distanceLabel()` | Pure, unit-tested under vitest, no React Native import — the constraint that keeps tested modules parseable |
| `portal/pages/nearby.js` | the ~10-line `navigator.geolocation` call | A browser API cannot live in `src`, and should not: it is the one part that is not a function of its inputs |

Distances derive from `coords`, which partners, explore items and match venues already
carry. `verify-portal.mjs` can therefore keep asserting them.

`exploreEventsNearYou` — "Events near you" — already exists in `src/lib/strings.ts` and is
reused rather than retyped.

### The six cities

`HOST_CITIES` is **six**, not five: the five that `MATCHES` plays in, plus Zanzibar, which
holds a performance and no fixture.

| City | Country | Has fixtures | Note |
|---|---|---|---|
| Nairobi | KE | yes | Kasarani, Nyayo, Talanta |
| Kampala | UG | yes | Namboole |
| Dar es Salaam | TZ | yes | Benjamin Mkapa |
| Eldoret | KE | yes | Kipchoge Keino |
| Kakamega | KE | yes | Bukhungu |
| Zanzibar | TZ | **no** | Forodhani Gardens — a performance city only |

Zanzibar is why the city list is its own seed rather than derived from `MATCHES.city`:
deriving it would drop the one city a fan might be in with no match to attend, which is
exactly the reader "concerts near you" is for.

Each entry carries **city-centre** coordinates, which is a second reason it must be a seed —
`MATCHES` carries *venue* coordinates, and a stadium is not a city centre. Distances are
measured from the picked city's centre to each item's own `coords`.

## Fan Villages: promoted, not duplicated

`FanVillage` becomes the **source of truth**, and the two `fan-zone` members of
`EXPLORE_ITEMS` are *derived* from `FAN_VILLAGES` rather than retyped beside them.

This is the one shape that satisfies three constraints at once. A village's name and
coordinates live in exactly one place. `EXPLORE_ITEMS` keeps all six members, so
`portal/pages/home.js`'s `.slice(0, 8)` and the app's `repository.ts` are untouched — no
regression on the dashboard. And nothing has to be un-asserted: `EXPLORE_ITEMS` is read by
`home.js`, `repository.ts` and the bundle contract, but **no figure assertion counts it**
in either `verify-portal.mjs` or `spec-figures.test.ts`, which is what makes the promotion
safe. Adding `FAN_VILLAGES` alongside the existing fan zones was the obvious move and the
wrong one — two records of the same park, free to drift.

Note that `"fan-zone"` is *also* an `EventKind` on the record, where `src/utils/record.ts`
renders it "fan zone entry". That is a different axis — something that happened to a
Pass — and is untouched.

## Artists and performances

`Performance` replaces the six hand-written cards, reusing the `img/ev-*.jpg` photographs
already in `portal/img/`. `Artist` is a separate entity joined by `artistIds`, which is
what makes the roster bidirectional: a performance renders its line-up, and an act renders
its dates.

**The line-up is invented, and labelled.** No June 2027 bill exists. This project already
refuses to state what it cannot source — `AirLink` carries no fare because none is
published, and the rail already reads *"prototype listings — confirm before you plan"* —
so real artist names on a fabricated bill would be the one thing here that misleads. Act
names are therefore plainly fictional and the whole section carries the prototype stamp
the fixtures and fares carry.

`Artist.country` is typed `HostCountry`, so the existing `.flag-ke` / `.flag-tz` /
`.flag-ug` classes work unchanged. A continental guest act renders flagless rather than
pulling in a fourth flag sprite.

## Reversing the seat decision

The Talanta spec rejected individual seat picking, and gave a good reason:

> Per-seat picking would need a seat inventory, availability state and holds — and with no
> backend, the reference's "Time Remaining" countdown would reserve nothing. A countdown
> that holds no seat is a lie told with a timer, so there isn't one.

`src/data/ticket.ts` and the `StadiumBlock` docstring say the same thing in fewer words.

**Two of those three objections still stand, and are still honoured.** There is no hold
and no countdown — nothing here reserves a seat, so nothing pretends to. And there is no
payment: the office stops exactly where it stops today, at a selection and a hand-off, per
Rev. 2 §05.

The objection that falls is the **inventory**, and it falls because it can be derived
instead of stored:

```
seatTaken(blockId, row, seat) -> boolean
```

pure, from the identifiers' own characters — the same technique `codeCells()` in
`src/utils/ticket.ts` already uses, and for the reason its comment gives: a seeded PRNG
was tried there and was wrong, because `state * 1103515245` exceeds
`Number.MAX_SAFE_INTEGER` and silently stops being deterministic. Derived this way the
inventory is identical on every load, asserted in tests rather than eyeballed, and no seat
list is hardcoded anywhere.

So the reversal is narrow: *seat selection* is adopted; *seat reservation* is still
refused. What was true in August stays true — this office holds nothing and takes nothing.

**One string now says the opposite of what the page does.** `officeStandfirst` reads "Pick
a block, then how many seats. The seat itself is assigned." It must be rewritten, not left
to contradict the screen.

## Architecture

### Types (`src/types/index.ts`)

| Type | Fields |
|---|---|
| `FanVillage` | `id`, `name`, `detail`, `capacity`, `opensAt`, `closesAt`, `facilities: VillageFacility[]`, `freeWithPass`, `ward`, `city`, `country`, `coords` |
| `VillageFacility` | `"big-screen" \| "food" \| "bar" \| "family" \| "merch" \| "wifi"` |
| `Artist` | `id`, `name`, `genre`, `country: HostCountry` |
| `Performance` | `id`, `name`, `venue`, `startsAt`, `artistIds[]`, `freeWithPass`, `ticketFrom?`, `villageId?`, `ward`, `city`, `country`, `coords`, `image` |
| `HospitalityBox` | `id`, `name`, `stand`, `gate`, `capacity`, `price` (whole box), `inclusions[]`, `available` |
| `Selection` | `{ kind: "seat"; blockId; row; seat } \| { kind: "box"; boxId }` |

Extended: `StadiumBlock` gains `rows: string[]` and `seatsPerRow`. `HallMap` gains
`boxes: HospitalityBox[]`.

`Selection` is a discriminated union because a seat and a box are priced by different
units — per seat against `HallMap.prices[category]`, versus a whole-box `price` — and the
union makes it impossible to total one as if it were the other. It is what keeps the
rejected "fourth category" from creeping back in through the totalling code.

It earns a place in the type layer only because two pure functions take it —
`selectionLabel(map, selection)` and `selectionTotal(map, selection)` in
`src/utils/seats.ts`, both unit-tested. The portal page holds the selection and asks those
functions what it says and what it costs, rather than computing either in markup. A type
that only `portal/pages/tickets.js` touched would buy nothing, since that file is plain JS.

**`blockRects()` is not touched.** Boxes are a tab, not a fifth band, so its four-stand
arrangement and the tests asserting it stand as they are.

### Data (`src/data/`)

`villages.ts`, `artists.ts`, `performances.ts`; `hallmaps.ts` gains boxes and per-block
rows; `explore.ts` derives its two fan zones from `FAN_VILLAGES`.

### Logic (`src/utils/`)

| Module | Functions |
|---|---|
| `nearby.ts` | `HOST_CITIES`, `haversineKm`, `nearestCity`, `byDistanceFrom`, `distanceLabel` |
| `villages.ts` | `openNowLabel`, `villagesNear`, `facilityLabel` |
| `performances.ts` | `lineup`, `performancesForArtist`, `performancesNear`, `whenLabel` |
| `seats.ts` | `seatTaken`, `seatMap`, `freeSeats`, `seatLabel`, `boxTotal`, `selectionLabel`, `selectionTotal` |

All pure, all RN-free, all unit-tested.

### The portal

| File | Role |
|---|---|
| `portal/nearby.html` + `pages/nearby.js` | The new destination. A city picker, then a segmented control over Villages / Concerts / Artists |
| `portal/tickets.html` + `pages/tickets.js` | `?match=…`. Two tabs: Seats (bowl → section → seat grid) and Hospitality (boxes) |
| `portal/chrome.js` | `TABS` grows by one: `{ id: "nearby", href: "nearby.html", label: "Near you" }` |
| `portal/index.html` | The events rail re-renders from `PERFORMANCES` instead of hardcoded markup |
| `portal/matches.html` | The fixture sheet gains a "Get tickets" action into `tickets.html` |

Six destinations at 360px is 60px each, clear of the 44px floor. Tickets is deliberately
**not** a destination — it is reached from a fixture, mirroring how the app reaches
`TicketOfficeScreen`.

### The bundle boundary

`src/portal-entry.ts` widens by `FAN_VILLAGES`, `ARTISTS`, `PERFORMANCES`, `HALL_MAPS` and
the new util functions, and `CONTRACT` in `scripts/verify-bundle.mjs` widens to match. That
assertion runs in both directions, so it fails until the boundary is opened on purpose —
which is the point of it.

## Responsive

Audit at **360 / 390 / 768 / 1280**, headless, every existing page; fix what actually
breaks; build the new pages mobile-first. The portal already has real mobile work — the
fixed `.tabbar` under 860px, bottom-sheet `<dialog>`s, the recent nav and split-auth
fixes — so this is a gap hunt, not a rewrite.

**The seat grid is the one genuine problem.** Ten seats across at the 44px touch floor is
440px, wider than a 360px phone. The resolution:

- The grid sits in an `overflow-x: auto` frame with the row letters sticky-left.
- Cells are 32px at 4px gaps — 36px effective spacing. That clears **WCAG 2.5.8** (24px
  minimum, AA) and does **not** clear **2.5.5** (44px enhanced). The deviation gets a
  comment beside the value, the way `portal.css` documents its contrast deviations. AA is
  met; the enhanced criterion is knowingly missed on a dense-data control.
- Tapping a row letter opens that row as a plain list — the accessible path to any seat
  with no pinching and full-size targets.

## Testing

- New vitest suites for `nearby`, `villages`, `performances`, `seats` — including that
  `seatTaken` is stable across calls, that `freeSeats` agrees with the grid it describes,
  and that `nearestCity` picks correctly at the midpoints between host cities.
- `verify-bundle.mjs` `CONTRACT` updated; it fails in both directions.
- `verify-portal.mjs` extended to recompute the new pages' figures.
- `npm run lint` (`tsc --noEmit`) and `npm run verify:contrast` for any new token pair.
- The four-width audit, driven headless.

## Not included

- **The Expo app.** Not a line of it. Its `MatchTicket` flow keeps its assigned seat.
- **Payment.** No basket, no card field, no seat hold, no countdown. Rev. 2 §05 stands.
- **Real names or real prices.** Invented acts, prototype figures, stamped as such.
- **A fourth flag sprite** for non-host-country acts.
- **An overflow verify script.** Considered as part of the responsive option and not
  taken; the audit is manual this round.

## Risks

- **Six tabs is the ceiling.** A seventh destination breaks the mobile tabbar and forces
  an overflow pattern. Anything beyond this spec should nest rather than add a tab.
- **The seat grid's 32px cells miss WCAG 2.5.5.** Mitigated by the row-list path, but it
  is a real deviation and is recorded rather than absorbed.
- **Derived inventory looks arbitrary.** A fan cannot tell why seat F12 is taken. That is
  true of any prototype inventory and the page says it is seeded.
- **`explore.ts` deriving from `villages.ts` adds an import edge** between two data
  modules that were previously independent. Worth watching if either grows.
