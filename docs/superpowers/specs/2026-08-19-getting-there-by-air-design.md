# Pamoja — Getting There By Air Design Spec

**Date:** 2026-08-19
**Status:** Implemented
**Author:** Mbeche (with Claude)
**Source document:** `jambojet.com/en-US`, supplied as a reference for how a fan would
fly between host countries.

## Summary

Fans may want to fly to another host country to watch a game. Two things had to happen
for that to mean anything: there had to be games in another country, and there had to be
a surface saying how to get to one. So the Driving screen becomes **Getting there**,
with a Drive / Fly toggle, and the seed gains two away fixtures at real co-host grounds.

## The finding that shaped it

**No June 2027 air network exists to report.** As of June 2026 Jambojet served seven
domestic destinations and **no international ones**; Nairobi–Entebbe is scheduled to
resume from October 2026, and Mombasa–Zanzibar ran from July 2024 but is not in the
current network. Its published plan reaches 17 routes by 2029.

So the air view carries **no fare, no flight time and no frequency**. Those are the
parts a reference airline site is mostly made of, and they are precisely the parts
nobody has published for the tournament. Quoting them would repeat the defect `debbce9`
removed and `ff2ec54` had to caveat. What is stable — airport codes, the road transfer
at the far end, the entry documents — is what the screen shows, and even that carries
`asOf` plus a caveat naming the airline explicitly as the thing to confirm.

## What was added

**Two away fixtures**, at grounds that really are Pamoja co-host venues:

| Fixture | Venue | Kickoff |
|---|---|---|
| Uganda v Ghana | Namboole, Kampala (UG) | 2027-06-29 16:00 EAT |
| Tanzania v Algeria | Benjamin Mkapa, Dar es Salaam (TZ) | 2027-07-01 16:00 EAT |

Pairings are prototype figures, as the Nairobi ones already are. Both are after Kenya v
Mali, so `nextMatch` and every figure reading from it are unchanged, and before August so
`nextMatch` still runs out where `match.test.ts` says. The nations bring `TEAM_FLAG` and
`TEAM_CODE` entries for Tanzania, Ghana and Algeria — the existing coverage test fails
without them, which is the guard working.

**`AirLink`** (`src/types`, seeded in `src/data/air.ts`): country, city pair with codes,
the road transfer, requirements, good-to-know, `asOf`. Requirement wording is copied
from `borders.ts` where the requirement is the same one — a passport rule should not be
described two ways depending on which way a fan arrives.

**`src/utils/air.ts`** — pure: `linkForCountry`, `fixturesIn`, `awayCitySuffix`. Eight
tests, including one asserting every air link has at least one fixture to travel for, so
a Fly view can never offer a country with nothing to watch there.

## Decisions

| Decision | Taken | Rejected |
|---|---|---|
| Away fixtures | Two, at real co-host venues | Four across three countries; none at all |
| Air content | The leg and the documents | Fare-led search (invented); route board alone (no documents) |
| Placement | Folded into Driving as Getting there | A separate Flights screen; inline per fixture |

One screen for both modes because they share the documents, the caveat and the
"correct as of" framing. Two would have meant describing the same passport requirement
twice, and a fan comparing drive against fly backing out of one screen into another.

## Two details worth keeping

- **The "Once you're in Nairobi" band shows only in Drive.** A fan flying to Kampala is
  *leaving* Nairobi, so the last-leg band would be about the wrong city.
- **`awayCitySuffix`.** `kickoffLabel` names the venue only, which is enough while every
  fixture, offer, parking zone and shuttle is in Nairobi. "Tue 16:00 · Namboole" does not
  tell a Nairobi fan that the ground is in another country, so a fixture outside Kenya
  gets its city appended — in Explore and in the Fly view's fixture list.

`RouteStrip` was generalised from taking a `BorderCrossing` to taking the six strings,
so the road route and the air route are drawn by one component rather than two
near-identical ones. `DESIGN.md`'s entry is updated.

## Not included

- **No booking, no payment.** Same boundary as the ticket office and redemption: Rev. 2
  §05. The screen tells a fan what they need; the airline sells the seat.
- **No carrier named per route.** Jambojet's Entebbe resumption is the one verifiable
  scheduling fact and it lives in the caveat's framing, not as a route claim.
- **No Zanzibar, Arusha or Hoima**, which would mean seeding fixtures and legs for
  venues no fixture uses.
- **Domestic flights** (Nairobi–Mombasa and the rest of Jambojet's actual network) are
  not covered: no fixture is outside Nairobi within Kenya.
