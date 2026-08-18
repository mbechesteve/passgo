# Pamoja Design System

Pamoja is built on two hues, sampled from the PAMOJA proposal artwork. There is
no per-category chromatic accent system: every screen draws from the same
deep/accent pair plus a neutral ink-to-canvas ramp.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `deep` | `#04222b` | Pass card / dark surfaces |
| `deep-soft` | `#223c44` | Secondary dark surface, deep-on-deep separation |
| `accent` | `#0e6ba8` | The single blue — active tab, links, primary actions |
| `ink` | `#16181a` | Headings, primary text |
| `body` | `#545557` | Default body text |
| `mute` | `#676869` | Secondary / lower-priority text |
| `faint` | `#acadae` | Placeholder text, inactive icons |
| `hairline` | `#dde3e4` | 1px borders, dividers |
| `panel` | `#eef0f0` | Soft fill for pills / inset chips |
| `surface` | `#f5f8f8` | Page background |
| `canvas` | `#ffffff` | Card backgrounds |

Two hues only — `deep` and `accent`. There is no third or fourth brand colour
and no per-category or per-status colour coding.

## Typography

Headings use a geometric sans with negative tracking. Everything procedural —
codes, amounts, and record lines (pass numbers, ticket references, timestamps)
— is set in uppercase mono, so a glance distinguishes narrative text from
data the user might need to type, read aloud, or match against a physical
document.

## Shape

Cards use a `10px` border radius (`rounded-card`).
