# Pamoja — Mount Kenya Motif & Reference Cues Design Spec

**Date:** 2026-08-19
**Status:** Awaiting review
**Author:** Mbeche (with Claude)
**Supersedes:** nothing. This spec *extends*
`2026-08-19-pamoja-matchday-redesign-design.md`, whose two standing rules — Outfit +
JetBrains Mono at the family-key choke point, and "no existing hue changes" — are
**upheld here without exception**.
**Source documents:** three screenshots of Qatar's **Hayya** app (Home, Explore, Explore
error state), supplied 2026-08-19 as a visual reference;
`uploads/Uratibu-Brand-Guidelines.pdf` (V1.0, July 2026) for what may not move.

## Summary

Adopt the *structural* cues of the Hayya reference — a national landmark shape used as
the mask for media, outlined pill filters with line icons, and headings written as
sentences — while changing neither the typeface nor a single hue. Kenya's landmark is
**Mount Kenya's twin summit** (Batian and Nelion, split by the Gate of the Mists), which
becomes `PeakFrame`: one component every image in the app passes through, and the source
of the Explore tab's icon.

Two findings shape the work:

1. **The app renders no photography at all today.** `AppImage` exists with zero
   consumers, `src/data/images.ts` only builds `picsum.photos` placeholders, and
   `ExploreItem` has no image field. The reference's photo-led cards are therefore new
   *content*, not a restyle — and a placeholder photograph under "Nairobi Museum" or
   "Karura Forest" would assert something false about a real place, exactly the class of
   defect commits `debbce9` and `ff2ec54` removed. So the photo-dependent half of this
   spec waits for licensed venue photography.
2. **The reference's warmth is unavailable to us.** Hayya's ground is a warm off-white.
   Ours is `#f5f8f8` — which is Uratibu's **Paper**, a brand-named colour, and the cool
   neutral ramp around it was set deliberately in the last restyle. Warming the ground
   was considered and **rejected**: Paper stands, and the reference's warmth is the one
   cue this spec knowingly declines.

## Goals

- Add **`PeakFrame`** — the Mount Kenya twin-summit mask — as the single component all
  app media is framed by, with its geometry in a pure, unit-tested function.
- Derive the **Explore tab icon** from the same path, so the motif appears at 22px and
  at card size from one source of truth.
- Give the filter row's existing `Pill` an **optional line icon**, producing the
  reference's filter pills without a new component.
- Rewrite one-word screen titles as **sentences**, merging each standfirst that merely
  restated its title.
- Leave Outfit, JetBrains Mono, `deep`, `accent` and every neutral exactly as they are.

## Non-Goals (YAGNI)

- **No serif display face.** Uratibu §03 mandates Outfit. The reference's high-contrast
  serif is the largest single reason those screens read as expensive, and we are not
  taking it. Recorded here so the omission is a decision, not an oversight.
- **No third hue.** Hayya's maroon and orange CTAs stay out; `accent` remains the only
  action colour.
- **No warm ground.** See Summary finding 2.
- **No photography in this pass.** No `picsum` seeds are wired into a card that names a
  real venue, under any "it's only a placeholder" rationale.
- **No new dependency beyond `react-native-svg`.**

## What the reference gets, and what it does not

| Cue in the Hayya screens | Verdict |
|---|---|
| National landmark shape as the media mask | **Adopt** — as Mount Kenya's twin summit |
| Same shape reused as a tab icon (their mosque) | **Adopt** — Explore tab |
| Outlined pill filters, line icon + label | **Adopt** — `Pill` is already outlined; it gains the icon |
| Headings as sentences, sentence case, full stop | **Adopt** |
| Warm off-white ground | **Reject** — Uratibu Paper stands |
| High-contrast serif display face | **Reject** — Uratibu §03 mandates Outfit |
| Maroon / orange CTA hues | **Reject** — two hues only |
| Photo cards in a peeking carousel | **Defer** — needs licensed photography |
| Circular outline icon buttons in the header | **Defer** — no new affordance is needed yet |

## Architecture

### Dependency

`react-native-svg`, installed via `npx expo install react-native-svg` so Expo 51 resolves
its own pinned version rather than a floating latest. It supports react-native-web, so
the existing Playwright verification path (see the `driving-the-app-in-a-browser` note)
keeps working unchanged.

The alternative — three ground-coloured `borderWidth` triangles overlaid on the media's
top edge, the idiom `Donut` already uses — was rejected for two reasons: it paints over
rather than masks, so it is only correct on a known solid background and will show seams
once photographs arrive; and it cannot produce the 22px tab icon.

### Geometry — pure functions over one summit table

`src/utils/peaks.ts`

```ts
export const SUMMIT: readonly Point[]          // fractions: Nelion, the col, Batian
export function summitVertices(width: number, shoulderY: number): Point[]
export function peakMaskPath(width: number, height: number, radius = 10): string
export function peakGlyphPath(width: number, height: number): string
```

**Amended during implementation.** One `peakPath` was specified. Two builders are
needed: stroking the closed mask would draw a jagged-topped *rectangle*, not a
mountain, so the icon needs an open polyline whose shoulders sit on the base rather
than a quarter down. Both read the same `SUMMIT` fractions, so there is still one
mountain — `SHOULDER_BAND` is the only thing that differs between them.

The summit is *one* mountain with a split crown, not two hills: Batian and Nelion stand
about 140m apart, separated by the narrow col known as the Gate of the Mists. The path
reflects that — two apexes close together near the centre, a shallow notch between them,
and long shoulders falling to the frame edges.

| Vertex | x | y |
|---|---|---|
| left shoulder | `0` | `0.26h` |
| Nelion apex | `0.42w` | `0.03h` |
| Gate of the Mists | `0.49w` | `0.09h` |
| Batian apex | `0.56w` | `0` |
| right shoulder | `w` | `0.26h` |

From the right shoulder the path runs down the right edge, across the base with `radius`
corners, and up the left edge to close.

Consequence for photography, to be carried into the photo brief: the mask removes the top
quarter of the frame at the edges, so subjects must sit low. Overlaid captions stay in the
**bottom third**, clear of the peak zone — this is what keeps the angular crown from
competing with text, the one trade-off flagged when the shape was chosen.

### `PeakFrame`

`src/components/pamoja/PeakFrame.tsx`

```tsx
<PeakFrame width={w} height={h} uri={item.image}>{caption}</PeakFrame>
```

**Amended during implementation.** The design above had `AppImage` as the masked
child. `react-native-svg` cannot mask an ordinary React Native view — that needs a
second dependency, `@react-native-masked-view/masked-view` — but it can clip an SVG
`<Image>` and fill a path with a gradient. So the media is `uri`, drawn inside the
SVG, and `children` are whatever sits *over* it.

The exchange is deliberate: one dependency instead of two, at the cost of
`expo-image`'s caching and fade for masked media. `AppImage` still serves every
unmasked image in the app.

`children` are laid into the **bottom third**, which turns the caption rule below
from a note into a property of the component. With no `uri` the frame fills with the
existing `deep → deep-grad → deep-deeper` gradient — what every instance renders
until photography exists.

### The filter row — `Pill`, not `Chip`

**Amended during implementation.** The design above put an `outline` tone on `Chip`.
That was the wrong component: `Pill` in `src/components/ui/index.tsx` is already the
filter row's control and already carries the reference's outlined treatment
(`bg-canvas border-hairline`, `bg-deep` when active). Giving `Chip` the same look
would have left the app with two pills that render identically — the duplication
`77fcaad` and `57b7d7f` were fixing.

So `Pill` gains `icon?: IconName`, and `Chip` is untouched. Explore's four filters
each carry a Feather glyph — `list`, `calendar`, `map-pin`, `tag`. "All" is given one
too: a row where a single pill lacks an icon reads as a mistake.

### Explore tab icon

`src/components/pamoja/PeakIcon.tsx` renders `peakGlyphPath` at 22px as a stroked outline,
matching Feather's line weight, and replaces the Feather glyph for the Explore tab only.
The other four tabs keep their Feather icons — one bespoke icon among five is the
reference's own arrangement, where only Places carries the national shape.

### Copy — titles become sentences

Each one-word title duplicated its own tab label; where a standfirst merely restated the
title, the standfirst is deleted and its sentence is promoted.

| String | From | To |
|---|---|---|
| `exploreTitle` | "Explore" | "Go and see Nairobi." |
| `liveTitle` | "Live" | "The match, as it happens." |
| `servicesTitle` + `servicesStandfirst` | "Services" / "Everything around the match, sorted." | `servicesTitle` = "Everything around the match, sorted."; standfirst **deleted** |
| `safetyTitle` + `safetyStandfirst` | "Safety" / "Stewards are on every concourse." | `safetyTitle` = "Stewards are on every concourse."; standfirst **deleted** |
| `parkingTitle` + `parkingStandfirst` | "Parking" / "Pre-book a zone. Payment is at the gate, by M-Pesa." | `parkingTitle` = "Pre-book a zone."; standfirst = "Payment is at the gate, by M-Pesa." |
| `walletTitle` | "Wallet" | "Every line your Pass has written." |

`drivingTitle` ("Driving in") is **exempt**: it takes a country name as a value, like
`TeamRow`'s centre slot, so it is not a fixed sentence.

`exploreTitle` deliberately avoids the words "search", "fixtures", "venues" and "offers",
which the adjacent `explorePlaceholder` already carries — the same
don't-say-it-twice rule that replaced `Crest` with `TeamRow` in `57b7d7f`.

Home is out of scope: it leads with an eyebrow and a figure, not a title.

### Untouched by construction

Every string guarded by `src/utils/spec-figures.test.ts` — `2,189 PARTNER BUSINESSES`,
the tile counts, `Amina Nakato`, `KE-PM-8842`, `VALID IN ALL THREE COUNTRIES`,
`Valid · 24 days left` — and every figure in the `pamoja-verification-figures` note. No
string in this spec's table appears in that suite.

## Deferred until photography exists

Specified now so the later change is mechanical:

```ts
// src/types — added when assets land, not before.
export interface ExploreItem {
  /* …existing fields… */
  /** Licensed photograph of *this* venue. Absent → PeakFrame renders its gradient. */
  image?: string;
}
```

- `AppImage` as `PeakFrame`'s child, keyed off `item.image`.
- A peeking-card carousel (horizontal `ScrollView`, `snapToInterval`, card width ~78% of
  the viewport) on Explore, and on Home if the fixture card earns it.
- Attribution/licence line wherever a photograph is shown.

Absent `image`, every card renders the gradient — so the deferred half changes appearance
only where a real photograph of that exact venue exists.

## Testing

The path builders are pure, so they carry the suite:

- Path opens at the left shoulder and closes, for any `w`/`h`.
- All vertices fall inside `0 ≤ x ≤ w`, `0 ≤ y ≤ h`.
- Batian's apex is strictly higher than Nelion's; the col sits strictly below both;
  both apexes sit strictly above both shoulders.
- Scaling `w`/`h` scales every vertex proportionally — the mask is resolution-independent.
- `radius` reaches the base corners only, never the summit edge.

The repo has no component-test harness (vitest covers `utils/`, `data/` and `lib/` only),
so `PeakFrame`, `PeakIcon` and `Pill`'s icon are verified in the browser at 420×900 per
the `driving-the-app-in-a-browser` note: build, serve `dist/`, drive with Playwright,
screenshot Explore and the tab bar. `npm run lint` and the full 151-test suite must stay
green.

## Risks

- **`react-native-svg` on web.** Adds to the web bundle and is the first SVG in the
  project. Mitigation: the build is verified before the change is committed; if web
  rendering of `mask` misbehaves, `PeakFrame` falls back to an unmasked 10px rectangle
  rather than a broken frame.
- **The peak at 22px.** A split summit may read as noise at icon size. Mitigation: judged
  in the browser screenshot; if it fails, the icon keeps a Feather glyph and `PeakFrame`
  ships alone.
- **Motif fatigue.** Every image in one shape can read as a template. Mitigation: media
  is masked; cards, chips and panels stay rectangular.
- **Android, as with the flags.** `57b7d7f` recorded that flag emoji are inconsistent on
  older Android. SVG masking has its own Android history; only web is verified here, and
  that limit is stated rather than assumed away.

## Future work

- Licensed venue photography, then the deferred section above.
- Whether the peak edge belongs on the Pass card's header — deliberately not decided
  here; the credential is the one surface where decoration is least welcome.
