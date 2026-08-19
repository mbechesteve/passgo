# Pamoja Design System

Pamoja is built on two hues, sampled from the PAMOJA proposal artwork. There is
no per-category chromatic accent system: every screen draws from the same
deep/accent pair plus a neutral ink-to-canvas ramp.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `deep` | `#04222b` | Pass card / dark surfaces |
| `deep-soft` | `#223c44` | Secondary dark surface, deep-on-deep separation |
| `deep-grad` | `#0a3641` | Second gradient stop |
| `deep-deeper` | `#062b36` | Third gradient stop |
| `accent` | `#0e6ba8` | The single blue — active tab, links, primary actions |
| `accent-bright` | `#1782c4` | Pressed |
| `accent-press` | `#0a5486` | Pressed, on text |
| `accent-tint` | `#e2edf4` | Chip fill on light |
| `accent-tint-strong` | `#cde2ef` | — |
| `accent-soft` | `#6fc2e8` | Accent text ON deep |
| `ondark-mute` | `#8ea5ae` | — |
| `ondark-faint` | `#7fa5b4` | — |
| `ink` | `#16181a` | Headings, primary text |
| `body` | `#4a565b` | Default body text |
| `mute` | `#5a686d` | Secondary / lower-priority text |
| `faint` | `#8a9599` | Placeholder text, inactive icons |
| `hairline` | `#dde3e4` | 1px borders, dividers |
| `panel` | `#eef0f0` | Soft fill for pills / inset chips |
| `surface` | `#f5f8f8` | Page background |
| `canvas` | `#ffffff` | Card backgrounds |

Two hues only — `deep` and `accent`. There is no third or fourth brand colour
and no per-category or per-status colour coding.

## Typography

Headings and body are set in **Outfit** (Uratibu §03) — Regular for body, Medium for
emphasis, Bold for headings, ExtraBold for the large money figures. Everything
procedural — codes, amounts, record lines, pass numbers, timestamps — is set in
**JetBrains Mono**, uppercased for eyebrows, so a glance distinguishes narrative text
from data the user might need to type, read aloud, or match against a physical
document.

Families are addressed by semantic key (`font-sans`, `font-medium`, `font-display`,
`font-display-heavy`, `font-mono`, `font-mono-medium`), never by weight utility — the
faces carry the weight. Swapping the faces behind these keys re-letters the whole app
without touching a screen.

## Shape

Cards use a `10px` border radius (`rounded-card`).

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
| `Crest` | The three-letter team tile either side of a fixture. |
| `Chip` | A small uppercase mono pill — "IN 3 DAYS", "+450 THIS WEEK", "CAT 2". |
| `Avatar` | The holder's initials in a circle, top-right of Home. |
| `StatTrio` | Three figures side by side — possession/shots/corners, or distance/time/wait. |
| `Sparkline` | Daily savings as bars, oldest left, today's bar in accent. |
| `Donut` | The savings-rate ring on the Wallet. |
| `SearchField` | The search box atop Services and category lists. |
| `MoneyBox` | The Home savings panel — the record's own total, nothing else moves it. |
| `TileGrid` | The two-column matchday services band. |
| `RouteStrip` | A border crossing's route — origin city/code, the post, destination city/code. |
| `TicketCard` | The match ticket — crest header, gate/section/seat, and the non-scannable code stand-in. |
