# Pamoja Design System

Pamoja follows **`minimax/DESIGN.md`**, the design template added by
`npx getdesign@latest add minimax`. That file is the reference; this one records how it
lands on this codebase and what it replaced.

## What this replaced, and the cost

The previous system was derived from the PAMOJA proposal artwork and matched **Uratibu**
exactly — Forest `#04222b`, Command Cerulean `#0e6ba8`, Paper `#f5f8f8`, Ink — with
**Outfit** mandated by Uratibu §03, and a standing rule of *two hues only*.

None of that is followed any more. It is a deliberate reversal, taken knowingly:

- **Uratibu §03 is not observed.** The display and body face is now DM Sans.
- **The two-hue rule is gone.** minimax defines twenty-eight colours.
- **Paper, Forest and Command Cerulean are gone**, replaced by minimax's near-black and
  brand blue.

What survived, and why it survived, is set out below. If Uratibu is ever reinstated, this
section is the list of what has to move back.

## Palette

| Token | Hex | minimax name | Use |
| --- | --- | --- | --- |
| `deep` | `#0a0a0a` | primary | Pass card, the rail, dark surfaces |
| `deep-soft` / `deep-grad` | `#181e25` | primary-soft | Deep-on-deep separation, gradient stop |
| `accent` | `#1456f0` | brand-blue | The interactive colour — active tab, links, primary actions |
| `accent-tint` | `#bfdbfe` | brand-blue-200 | Chip fill on light |
| `accent-soft` | `#3daeff` | brand-cyan | Accent text ON deep |
| `live` / `live-tint` | `#1ba673` / `#e8ffea` | success-text / success-bg | Live and confirmed states |
| `ink` | `#0a0a0a` | ink | Headings, primary text |
| `body` | `#45515e` | slate | Default body text |
| `mute` | `#5f5f5f` | steel | Secondary text |
| `faint` | `#8e8e93` | stone | Placeholders, inactive icons |
| `hairline` | `#e5e7eb` | hairline | 1px borders |
| `panel` | `#f2f3f5` | surface-soft | Soft fills |
| `surface` | `#f7f8fa` | surface | Page background |
| `canvas` | `#ffffff` | canvas | Card backgrounds |

**One interactive hue.** minimax has coral, magenta and purple, and is explicit that they
are for product identity and *"never for general buttons or text"*. This app has no
product line to identify, so it takes the blue for interaction and nothing else. Its one
semantic pair — success — carries live and confirmed states, which is why a live fixture
is green and a purchasable one is blue.

## Typography

**DM Sans** for every voice role — 400 body, 500 medium, 600 headings, 700 emphasis —
which is what minimax specifies and the reason Outfit is gone.

**JetBrains Mono is kept, against minimax's advice.** Its rule is *"don't introduce a
second display typeface"*, and mono here is not a display face: it is the data register.
Codes, amounts, record lines, pass numbers and timestamps are set in it so that a glance
separates narrative text from data a fan might type, read aloud, or match against a
physical document. That is a functional device this product needs and the template had no
reason to consider. It is the one documented departure from the template.

Families are addressed by semantic key (`font-sans`, `font-medium`, `font-display`,
`font-display-heavy`, `font-mono`, `font-mono-medium`), never by weight utility. Swapping
the faces behind these keys re-letters the whole app without touching a screen — which is
what made this change a two-file edit rather than a fifty-screen one.

## Shape

minimax's radius scale, with its signature pairing: `rounded-card` is **16px** (its `xl`)
and `rounded-hero` is **32px**, and the contrast between the two is the point. `xs` 4px,
`sm` 6px, `md` 8px and `lg` 12px are available beneath them.

Every button, pill and badge is `rounded-full`, which minimax states as a Do and treats
as a brand signature.

## Motif

One landmark shape, used one way: **Mount Kenya's split summit** — Batian, the Gate
of the Mists, and Nelion — is the crop all media is framed by. Its geometry lives in
`src/utils/peaks.ts` as fractions, and both the media mask (`peakMaskPath`) and the
22px Explore tab icon (`peakGlyphPath`) read from that one table, so the frame and
the icon cannot drift into two different mountains.

The mask takes the top `0.26` of a frame, which leaves the bottom three-quarters
uncropped — where captions sit. The crown is the only angular form in the app, so
nothing is set across it: `PeakFrame` lays its children into the bottom third
rather than trusting each caller to remember.

Media only. Cards, chips and panels stay rectangular; a shape used everywhere stops
meaning anything.

## Category, without a colour code

Where something has tiers — the ticket office's Cat 1/2/3 blocks — the tier is shown
as *depth of the one accent*: full accent, 55%, 25%. This rule predates the minimax
template and the template agrees with it — brand hues are reserved for product identity
and never for general use, so a legend does not get to spend three of them. A state that is not a
tier at all, like a sold-out block, leaves the hue entirely for `panel`, so it reads
as absent rather than as a fourth tier.

Anything sitting on the faintest tier takes dark text — a label has to be readable in
every state, or the map is decoration.

## Components

All in `src/components/pamoja/`. One line each, so the next screen reuses
rather than reinvents.

| Component | For |
| --- | --- |
| `Eyebrow` | The uppercase mono section label — "SECTION 03 / 10", "OFFERS NEAR YOU". |
| `Figure` | A headline number with its `Eyebrow` label above it. |
| `OfferRow` | One partner in a list — initial tile, name, optional subline, discount. |
| `PassCard` | The credential itself, rendered from local state only, no network path. |
| `RecordLine` | One line of the append-only record, set in mono. |
| `CategoryTile` | A Services category tile, showing a derived (never stored) count. |
| `TeamRow` | A fixture's two nations, each as a flag beside its name, with a slot between them for the "v", the score, or the kickoff and venue |
| `Chip` | A small uppercase mono pill — "IN 3 DAYS", "+450 THIS WEEK", "CAT 2". |
| `Avatar` | The holder's initials in a circle, top-right of Home. |
| `StatTrio` | Three figures side by side — possession/shots/corners, or distance/time/wait. |
| `Sparkline` | Daily savings as bars, oldest left, today's bar in accent. |
| `Donut` | The savings-rate ring on the Wallet. |
| `SearchField` | The search box atop Services and category lists. |
| `MoneyBox` | The Home savings panel — the record's own total, nothing else moves it. |
| `TileGrid` | The two-column matchday services band. |
| `RouteStrip` | Either leg of a journey — city/code, what's between them (a border post or `FLY`), city/code. |
| `TicketCard` | The match ticket — crest header, gate/section/seat, and the non-scannable code stand-in. |
| `PeakFrame` | The Mount Kenya crop every image passes through. Fills with the deep gradient until a licensed photograph of that exact place exists. |
| `PeakIcon` | The same summit stroked at tab size — the Explore tab's icon. |
| `HallMap` | The ticket office's bowl — blocks by stand, priced by category, sold-out blocks dropped out of the hue. |
