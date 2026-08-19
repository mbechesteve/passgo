# Pamoja — Talanta Ticket Office Design Spec

**Date:** 2026-08-19
**Status:** Implemented
**Author:** Mbeche (with Claude)
**Supersedes:** nothing. Extends `2026-08-19-pamoja-matchday-redesign-design.md`,
whose Non-Goals this spec is careful not to reverse — see **The money boundary**.
**Source document:** Platinumlist's hall-map ticket office
(`doha.platinumlist.net/hall-map/ticket-office?id_event_show=4757196`), supplied as a
visual reference. Its hall map is canvas-rendered and could not be read directly; what
was legible is three price tiers, a "Time Remaining" hold countdown, a running
selection total, and a "Next" step.

## Summary

A ticket office for the one fixture played at **Talanta**: pick a block on a schematic
bowl, pick how many seats, see what it comes to, and hand off to the seller. Reachable
from Explore, where a fixture that sells tickets says so with a chip.

## The money boundary

Rev. 2 §05 — Pamoja *"never holds the funds, never sees a card number, and needs no
banking licence in any of the three countries"* — is why the previous spec rejected a
stored-value wallet, and it decides the shape of this screen.

So there is **no basket, no card field and no payment step**. The screen stops at the
total and states the boundary in the same words `ConfirmScreen` already uses for a
discount: the seller takes the payment and issues the ticket; the Pass then carries
it. The reference's checkout is the one part of it deliberately not copied.

The hand-off does not open an external seller either, because we have no real one to
name. Pressing it says so plainly rather than inventing a partner or faking a redirect.

## Three decisions, taken before building

| Decision | Taken | Rejected |
|---|---|---|
| Payment | Select, then hand off | In-app purchase (reverses Rev. 2 §05); read-only price map (too little) |
| What the map is built on | A match at Talanta, priced with the Pass's own Cat 1/2/3 | A demo concert; waiting for real event data |
| Seat granularity | Block level, seat assigned | Individual seat picking |

Block level follows from the model that already exists: `MatchTicket` carries
gate/section/seat and the seat is *assigned*. Per-seat picking would need a seat
inventory, availability state and holds — and with no backend, the reference's "Time
Remaining" countdown would reserve nothing. A countdown that holds no seat is a lie
told with a timer, so there isn't one.

## Figures, and where they come from

Two are fixed by the app rather than chosen here:

- **Cat 2 costs 2,000.** `TICKET_SEED` already states `"Ticket · Cat 2", was 2000`.
  The office cannot quote a different face price for the same category without
  contradicting the Pass.
- **Block 214, Gate D, is Cat 2.** That is the seat the Pass's own ticket carries.

Cat 1 (3,500) and Cat 3 (1,000) sit either side of that anchor, and the screen carries
`officeFiguresCaveat` — "Prototype figures. Real allocation and pricing are the LOC's
to set" — which is the same position `src/data/ticket.ts` already takes. A test asserts
the Cat 2 anchor and the ordering, so a later edit cannot quietly break the tie to the
Pass.

## The fixture

`m-mli-zam` — Mali v Zambia, Talanta, `2027-06-28T19:00:00+03:00`. The date is pinned
from three sides: after Kenya v Mali so `nextMatch` and every figure reading from it
are unchanged; inside Explore's seven-day window, which is the only surface listing
fixtures, so the office is reachable at all; and before August, so `nextMatch` still
runs out where `match.test.ts` says it does.

Both nations are already in the seed, so `TEAM_FLAG` covers them and the flag test
still passes.

## Architecture

```ts
// src/types
export interface StadiumBlock {
  id: string; label: string; stand: "N" | "E" | "S" | "W";
  category: 1 | 2 | 3; gate: string; available: number;
}
export interface HallMap { matchId: string; prices: Record<1 | 2 | 3, number>; blocks: StadiumBlock[] }
```

- **`src/data/hallmaps.ts`** — Talanta's ten blocks, two of them sold out so the
  disabled state is exercised by the seed rather than only by a test.
- **`src/data/repository.ts`** — `fetchHallMaps()`, through the same read-through
  cache as every other dataset. No screen changes when a backend replaces it.
- **`src/utils/hallmap.ts`** — pure: `mapForMatch`, `blockPrice`, `orderTotal`,
  `tiers`, `isSoldOut`, `clampQty`, and `blockRects` for the layout. The seed carries
  no coordinates — a block knows its stand, not its pixels — so the arrangement is
  asserted in tests rather than eyeballed. `BOWL_INSET` is exported so the drawing
  does not restate a number the layout already knows.
- **`src/components/pamoja/HallMap.tsx`** — SVG paints, React Native handles touches.
  Both read the same rects, so one geometry positions the paint and the pressables,
  and every block carries a real accessibility label instead of being an unlabelled
  shape.
- **`src/screens/TicketOfficeScreen.tsx`** — the flow, plus a `Screen`-level fallback
  for a fixture with no map.

Tier colour is depth of the single accent, not three hues — recorded in `DESIGN.md`
under "Category, without a third colour", because the rule now has a second potential
caller and should not be re-decided next time.

`TicketOffice` is registered in **Explore's stack only**, not `SharedRoutes`: one tab
reaches it, and `SharedRoutes` is documented as being for screens more than one tab can
reach.

## Testing

`src/utils/hallmap.test.ts`, 22 tests. Beyond the arithmetic: `clampQty` never exceeds
what a block holds or the per-order limit, never drops below one seat, and returns
**zero** for a sold-out block, where offering one seat would be a lie. The layout
tests assert every block lands inside the frame, that a stand's blocks share a line,
that two blocks in a stand do not overlap, and that north is above south and west left
of east. Four tests hold the seed itself: every map belongs to a real fixture, that
fixture is at Talanta, every category its blocks use is priced, and Cat 2 is 2,000.

Verified in a browser at 420×1200: ten blocks, two sold out and unpressable, Block 214
selecting to `Gate D · Cat 2 · KES 2,000`, the stepper moving 2 seats → `KES 4,000` and
3 → `KES 6,000`, and the hand-off note replacing the button.

## Not included

- **No Pass discount on ticket prices.** `TICKET_SEED` says a Pass turns a 2,000 Cat 2
  ticket into 1,500, which is a real relationship the office could show — but the
  equivalent ratio for Cat 1 and Cat 3 would be invented, so the office quotes face
  prices only.
- **No entry point from Home.** Home shows only the next fixture, which is at Kasarani
  and has no map.
- **No seat map for Kasarani or Nyayo**, which would mean pricing seven more fixtures
  we hold no figures for.
