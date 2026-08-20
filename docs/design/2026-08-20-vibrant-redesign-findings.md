# v6 + Mobile — what the boards actually specify

Source: "Pamoja Page Vibrant Redesign.zip" (7 boards + Craydel DS + 164 assets, 35MB),
extracted to scratchpad only. NOT copied into the repo.

## Decisions taken
- Target: **Pamoja Landing v6** (desktop) + **Pamoja Mobile** (phone). The only pair
  sharing a palette. v4 (forest green) and v5 (maroon) are different directions, not
  iterations; v1-v3 are the same family but have no mobile board.
- Scope: the whole portal — marketing page directly from the boards, five logged-in
  pages derived from the same tokens. The app at /app is NOT touched.
- The `_ds/` Craydel design system is IGNORED. It is a study-abroad brand (teal
  #00A3A3, "Own it with Craydel"); the Pamoja boards do not use it (6 incidental hits).

## Palette, counted from v6
| Role | Value |
|---|---|
| Ground / headings | `#23276b` indigo (47 uses) |
| Paper | `#ffffff` (27) |
| Accent, numbers | `#ffd22c` yellow (25) |
| CTA, "pamoja." | `#f4772c` orange (15) |
| Quiet rules, support | `#b9bce4` lilac (13) |
| Surface | `#e9e8f1` / `#e7e8f8` |
| Muted type | `#7c7e96` |

## Form
- Radii: **999px pills dominate** (17 uses), then **20px cards** (7), 24px, 18px, 12px, 10px.
  Current portal.css is 16px cards + pills — close, not the same.
- Weights: heavily top-loaded — 800 (41), 700 (31), 600 (15), 500 (6), 300 (8).
  Much heavier than the current DM Sans setting.
- Face: **Outfit** throughout. Already a project dependency
  (@expo-google-fonts/outfit) and the portal used it before the minimax migration.

## The catch
The boards define **no `:root` custom properties** — every value is a literal, and the
font-size list is full of canvas half-pixel artifacts (9.5, 10.5, 11.5...). So the token
set has to be *derived*, not lifted. That derivation is the first real task of the
redesign, and it should produce a documented scale rather than 30 one-off sizes.

## What the boards do NOT cover
Nothing for dashboard / matches / live / partners / pass. Those five layouts get derived
from the board's system (type scale, radii, spacing, colour roles), not invented fresh.

## What this reverses
portal/README.md records the portal being migrated TO minimax — DM Sans, brand-blue
#1456f0, grayscale photography. This goes back to Outfit and colour. Deliberate, and the
README has to say so rather than be contradicted.

## The IA is unchanged — this is a re-skin, not a rebuild

v6's sections map almost one-to-one onto the current `index.html`:

| v6 heading | current section |
|---|---|
| Karibu, pamoja. | hero |
| One Pass. Five doors. | `#pass` (the doors accordion) |
| All fixtures | `#matches` |
| Fan events and promotions | `#events` |
| Explore the host country | `#explore` |
| Own the tournament. | closing CTA / `#partners` |

So the work is tokens, type, imagery and component form — not information architecture.
The doors accordion, the ticker and the fixtures rail all survive as concepts.

One copy note: **"Own the tournament."** echoes the Craydel brand bible's rallying cry
("Own it with Craydel"), which is bundled in the same zip. It reads fine for a fan pass,
but it arrived from a study-abroad brand's verbal DNA rather than from Pamoja's, so it is
worth a deliberate keep-or-change rather than adopting by inheritance.

## The derived type scale

The board's 30 rounded sizes are not 30 decisions. The six values at 40px and above are
all `font-weight: 800`, and Mobile's 52px/48px are the same two headings as v6's 96px/84px
— one element at two artboard widths. They collapse into fluid steps. The dense band at
10–14px (103 of the uses) is the label/mono register, which needs three steps, not five.

Eight steps, and what each covers:

| Token | Value | Board sizes it absorbs |
|---|---|---|
| `--fs-micro` | `11px` | 9, 10, 11 — eyebrows, mono labels |
| `--fs-small` | `13px` | 12, 13 |
| `--fs-body-sm` | `15px` | 14, 15, 16 |
| `--fs-body` | `17px` | 17, 18, 19 |
| `--fs-subhead` | `22px` | 20, 21, 22, 24, 25 |
| `--fs-head` | `28px` | 26, 27, 29, 32 |
| `--fs-feature` | `clamp(40px, 5.5vw, 64px)` | 34, 40, 48, 56, 64 |
| `--fs-display` | `clamp(52px, 9vw, 96px)` | 52 (mobile) → 84, 96 (desktop) — the hero |

7px and 8px appear once and five times respectively, below the portal's own legibility
floor; they fold into `--fs-micro`.

## Contrast: two of the board's own pairings fail WCAG AA

Computed, not guessed:

| Pair | Ratio | Needs | |
|---|---|---|---|
| indigo `#23276b` on white | 13.34 | 4.5 | pass |
| white on indigo | 13.34 | 4.5 | pass |
| yellow `#ffd22c` on indigo | 9.22 | 3.0 | pass |
| orange `#f4772c` on indigo | 4.78 | 3.0 | pass |
| muted `#7c7e96` on white | **3.98** | 4.5 | **fails body** |
| orange `#f4772c` on white | **2.79** | 3.0 | **fails even large text** |

So orange cannot carry text on white — it is a fill colour there (button grounds, rules,
the "pamoja." wordmark at display size where the board sets it on white, which is itself
borderline and should be checked against the board's actual usage). And the board's muted
grey needs darkening for body use. These are the two places where the spec's rule —
contrast wins over the 8%-lightness derivation, and the deviation is recorded — actually
bites.
