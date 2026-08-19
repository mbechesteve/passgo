# Pamoja — Getting There By Air Design Spec

**Date:** 2026-08-19
**Status:** Implemented
**Author:** Mbeche (with Claude)
**Source document:** `jambojet.com/en-US`, supplied as a reference for how a fan would
fly to a match.

## Summary

Fans may want to fly to a game — to another host country, or to a Kenyan city they
cannot reasonably drive to. Two things had to happen for that to mean anything: there
had to be games outside Nairobi, and a surface had to say how to reach one. So the
Driving screen becomes **Getting there** with a Drive / Fly toggle, and the seed gains
four away fixtures.

The Fly view offers four legs, domestic first:

| Leg | Route | Then | For |
|---|---|---|---|
| Eldoret | NBO → EDL | ~18 km | Kipchoge Keino, Eldoret |
| Kakamega | NBO → **KIS** | ~50 km | Bukhungu, Kakamega |
| Kampala | NBO → EBB | ~50 km | Namboole, Kampala |
| Dar es Salaam | NBO → DAR | ~15 km | Benjamin Mkapa, Dar es Salaam |

## The finding that shaped it

**No June 2027 air network exists to report.** As of June 2026 Jambojet served seven
domestic destinations and **no international ones**; Nairobi–Entebbe is scheduled to
resume from October 2026, and its published plan reaches 17 routes by 2029.

So the air view carries **no fare, no flight time and no frequency** — the parts a
reference airline site is mostly made of, and exactly the parts nobody has published
for the tournament. Quoting them would repeat the defect `debbce9` removed.

The domestic legs are where more can honestly be said. **Nairobi–Eldoret and
Nairobi–Kisumu are current Jambojet services**, so those legs name the airline. That is
a claim about a route operating today, not a claim about a 2027 timetable, and the
caveat still asks a fan to confirm the schedule.

## Venue provenance

Every venue used is a real ground widely reported as a 2027 venue — Kasarani and
Talanta as main venues, Kipchoge Keino as Kenya's alternative, Bukhungu (Kakamega),
Namboole (Kampala) and Benjamin Mkapa (Dar es Salaam). **"Widely reported" is the
strongest thing that can be said: CAF has published no official venue list.** An
earlier comment in `matches.ts` called Namboole and Mkapa "real Pamoja co-host grounds",
which overstated it; that is corrected.

Pairings are prototype figures, as the Nairobi ones already are.

## Fixtures added

| Fixture | Venue | Kickoff |
|---|---|---|
| Uganda v Ghana | Namboole, Kampala (UG) | 2027-06-29 16:00 EAT |
| Tanzania v Algeria | Benjamin Mkapa, Dar es Salaam (TZ) | 2027-07-01 16:00 EAT |
| Egypt v Senegal | Kipchoge Keino, Eldoret (KE) | 2027-07-02 16:00 EAT |
| Morocco v Ghana | Bukhungu, Kakamega (KE) | 2027-07-04 16:00 EAT |

All four sit after Kenya v Mali, so `nextMatch` and every figure reading from it are
unchanged, and before August so `nextMatch` still runs out where `match.test.ts` says.
Tanzania, Ghana and Algeria joined `TEAM_FLAG` and `TEAM_CODE` — the existing coverage
test fails without them, which is the guard working.

## Architecture

**`AirLink`** is keyed on the city it *serves*, not the country it lands in:

```ts
export interface AirLink {
  id: string;
  country: HostCountry;   // "KE" for a domestic leg
  servesCity: string;     // the city whose fixtures this leg is for
  fromCity: string; fromCode: string;
  toCity: string;  toCode: string;
  transferKm: number; transferTo: string;
  requirements: { label: string; detail: string }[];
  goodToKnow: { label: string; detail: string }[];
  asOf: string;
}
```

Two reasons it is not keyed on country. **Kakamega has no airport** — Kisumu's serves
it, so arrival city and served city genuinely differ, and a test asserts the transfer
names the served city whenever they do. And a domestic leg keyed on `"KE"` would offer
every Kenyan fixture, most of which are in Nairobi and need no flight at all.

- **`src/utils/air.ts`** — pure: `linkById`, `fixturesInCity`, `awayCitySuffix`.
- **12 tests**, including four that hold the seed itself: every leg has a fixture to
  travel for, no leg flies to Nairobi where the fan already is, the transfer names the
  served city when it differs from the arrival city, and **international legs ask for a
  passport while domestic ones do not**.

`RouteStrip` was generalised from taking a `BorderCrossing` to taking six strings, so
the road route and the air route are drawn by one component rather than two
near-identical ones. `DESIGN.md`'s entry is updated.

## Details worth keeping

- **Domestic legs ask for a photo ID, not a passport**, and their good-to-know says
  what does *not* change: same currency, same phone line, same Pass, no border.
- **The caveat has two versions.** A domestic hop has no embassy to ask, so telling a
  fan flying Nairobi–Eldoret to check entry requirements would be advice about nothing.
- **The "Once you're in Nairobi" band shows only in Drive.** A fan flying to Kampala is
  *leaving* Nairobi, so the last-leg band would be about the wrong city.
- **`awayCitySuffix` keys on the city, not the country.** Eldoret and Kakamega are both
  in Kenya and both need saying: "Sun 16:00 · Bukhungu" does not tell a Nairobi fan the
  ground is a flight away.
- **Requirement wording matches `borders.ts`** where the requirement is the same one.

## Decisions

| Decision | Taken | Rejected |
|---|---|---|
| Away fixtures | Four — two abroad, two upcountry | Two; none at all |
| Air content | The leg and the documents | Fare-led search (invented); route board alone |
| Placement | Folded into Driving as Getting there | A separate Flights screen; inline per fixture |
| Leg key | The city served | The host country |

## Not included

- **No booking, no payment.** Same boundary as the ticket office and redemption:
  Rev. 2 §05. The screen says what a fan needs; the airline sells the seat.
- **No schedules or fares anywhere**, domestic included.
- **No Mombasa, Zanzibar, Arusha, Hoima or Bungoma legs**, which would mean seeding
  fixtures for venues nothing uses.
- **No hall map for the away fixtures** — their rows in Explore stay inert, since the
  ticket office covers only Talanta.
