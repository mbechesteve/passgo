# Pamoja — The Portal on the v6 Board Design Spec

**Date:** 2026-08-20
**Status:** Approved — no implementation started
**Author:** Mbeche (with Claude)
**Source artefact:** `Pamoja Page Vibrant Redesign.zip` — 7 boards, a Craydel design
system, 164 assets. Held in scratchpad, not committed. Survey:
`docs/design/2026-08-20-vibrant-redesign-findings.md`.
**Depends on:** the portal owning the domain root, and its five logged-in pages
(`docs/superpowers/specs/2026-08-20-portal-app-port-design.md`, delivered the same day).

## Why

The portal is on minimax — near-black, brand-blue `#1456f0`, DM Sans, grayscale
photography. The boards move it to a warmer, louder system: indigo ground, orange and
yellow, Outfit, colour photography. The ask is that the portal follow them.

This is a re-skin and nothing more. v6's sections map one-to-one onto today's
`index.html`, so no information architecture changes, no page is added or removed, and
the app at `/app` is not touched.

## The decisions

| Decision | Taken | Rejected |
|---|---|---|
| Which board | **v6 (desktop) + Mobile (phone)** | v1–v3 (no mobile board); v4 forest green; v5 maroon |
| Reach | **The whole portal** | Marketing page only; portal *and* the app |
| The bundled `_ds/` | **Ignored** | Adopting the Craydel system |
| Photography | **Board's colour crops, credits carried forward** | New sources; keeping today's grayscale |

### Why v6 and Mobile

The seven boards are not iterations of one idea. v4 is forest green `#1b3a2d`, v5 is
maroon `#8a1538` — different directions. v1–v3 share v6's family but have no matching
phone board, so their breakpoint behaviour would be guesswork. v6 and Mobile are the only
pair that already agree, which means the responsive story is specified rather than
inferred.

### Why the bundled design system is ignored

`_ds/craydel-design-system-…/` is **Craydel's** brand system — a study-abroad platform,
teal `#00A3A3`, "Own it with Craydel." It arrived because it is attached to the design
workspace, not because it describes Pamoja. The Pamoja boards do not use it: six
incidental references across seven files, and their own palette shares nothing with it.
Applying a study-abroad company's colours to an AFCON fan pass would be a mistake made by
inheritance rather than by decision.

One trace of it survives in the boards and should be looked at deliberately: v6's closing
heading is **"Own the tournament."**, which echoes Craydel's rallying cry. It reads fine
for a fan pass. It is kept, but as a choice.

## Architecture

### The token layer is the whole lever

The five logged-in pages contain **zero raw colour values**. They consume only
`portal.css`'s role tokens — verified: `grep` for hex literals across `portal/app.css`
and `portal/pages/*.js` returns nothing. So repointing the tokens re-skins the marketing
page and all five logged-in pages at once, and the pages the boards never drew come along
without being touched.

Token **names do not change**. They are already roles rather than colours, and
`portal/README.md` sets the rule: *"A variable called `--gold` holding blue is worse than
a rename."*

| Token | Now (minimax) | v6 | Role |
|---|---|---|---|
| `--canvas` | `#ffffff` | `#ffffff` | paper — unchanged |
| `--ink` | `#0a0a0a` | `#23276b` | body and headings |
| `--primary` | `#0a0a0a` | `#23276b` | dark ground: nav, dark panels |
| `--primary-soft` | `#181e25` | derive from indigo | raised dark surface |
| `--accent` | `#1456f0` | `#f4772c` | interactive: CTAs, "pamoja." |
| `--accent-mid` | `#3b82f6` | derive from orange | hover |
| `--accent-deep` | `#1d4ed8` | derive from orange | focus ring |
| `--surface` | `#f7f8fa` | `#e9e8f1` | sunken band |
| `--surface-soft` | `#f2f3f5` | `#f7f6f3` | warm paper (from Mobile) |
| `--hairline` | `#e5e7eb` | `#b9bce4` | lilac rules |
| `--muted` | `#a8aab2` | `#7c7e96` | quiet type |
| `--slate`, `--steel`, `--stone` | grey ramp | indigo-tinted ramp | derived |
| `--charcoal` | `#222222` | derive from indigo | — |
| `--success`, `--success-bg` | `#1ba673`, `#e8ffea` | unchanged | semantic; the boards give no guidance, and green-for-valid is not theirs to overrule |
| `--pad-x` | `clamp(20px, 5vw, 64px)` | unchanged | — |

**How the derived values are derived.** The board gives one value per hue, not a ramp, so
the ramps are computed rather than picked: convert the board colour to HSL, hold hue and
saturation, and move lightness. `--primary-soft` is `--primary` lightened one step;
`--accent-mid` is `--accent` lightened one step and `--accent-deep` darkened one; the
`--slate` / `--steel` / `--stone` ramp is `--muted`'s hue and saturation at three
decreasing lightnesses. A step is 8% lightness. This is stated so the ramp is
reproducible and reviewable rather than eyeballed — if a computed value fails contrast
against its background, contrast wins and the deviation is recorded in the token file.

Every foreground/background pair must clear **WCAG AA** (4.5:1 for body, 3:1 for large
text). Orange `#f4772c` on white is around 3:1, so it is usable for large text, buttons
and rules but **not** for body copy — the board uses it that way and the tokens must not
invite otherwise.

**Two tokens need more than a repoint:**

- **A highlight role does not exist yet.** v6 uses yellow `#ffd22c` for numbers and
  eyebrows — the 11 / 7 / 3 / 2,189 figures and the small caps above headings. Nothing in
  `portal.css` holds that job today. Add `--highlight`.
- **`--cyan` must be renamed.** It is the on-dark accent, and in v6 that job is done by
  yellow. A token called `--cyan` holding `#ffd22c` is exactly the wart the README
  forbids. Rename it to `--on-dark`, updating its consumers.

### Type

**Outfit replaces DM Sans.** **JetBrains Mono stays**, for the reason `portal/README.md`
already records: mono here is the data register, not a second display face. The Pass
serial, the record lines, the kickoff times and the figures all live in it.

Loaded from Google Fonts, as the portal loads its faces today. The zip ships nine Outfit
TTFs; self-hosting them is a different decision, with its own weight budget, and is not
part of this.

**The scale must be derived, not lifted.** v6 carries 30 distinct font sizes from 9px to
96px, including canvas artifacts at 9.5, 10.5, 11.5, 12.5, 13.5 and 14.5px. Those are
rendering residue, not design. The output is a named scale of no more than
eight steps that covers every genuine size the board uses, and it is the artefact that
keeps the five undrawn pages coherent with the drawn one. "Genuine" is decided by
rounding the board's values to whole pixels and dropping any that then collide — the
half-pixel entries are all artifacts of canvas scaling and none survives that test.

Weights change materially: v6 is top-loaded — 800 (41 uses), 700 (31), 600 (15) against
500 (6) and 300 (8). Considerably heavier than the current setting.

### Form

Cards move from 16px to **20px**. Pills stay pills — 999px is the board's most common
radius by far (17 uses). The 44px minimum touch target and the 860px breakpoint are
unchanged; both are load-bearing and neither is a board decision.

### Imagery

Colour replaces the current `grayscale(1) contrast(1.06)` plus multiply wash.

Only assets actually used are copied in. The zip holds 164 files and 35MB; the portal
takes what the boards reference and no more.

**`credits.html` and the footer link survive.** The `clr-*` assets are crops of the same
subjects as today's credited photography — Mara, Lamu, Nairobi, Mt Kenya, and the five
event images — and the working assumption, taken deliberately, is that they are
derivatives of the same CC BY-SA Wikimedia originals. Attribution follows a derivative.
None of the seven boards carries any credit, so a naive port silently drops a licence
term.

**The rule for implementation:** every image that lands on a page must map to one of the
nine attributions on `credits.html`. An image that cannot be mapped stops the work and
asks; it does not ship uncredited.

### The five undrawn pages

`dashboard.html`, `matches.html`, `live.html`, `partners.html` and `pass.html` are not in
any board. They inherit the tokens and the type scale automatically. One derivation pass
then brings their component form into line — card radius, weights, the eyebrow-and-number
treatment. No new layouts, no navigation change, no content change.

## Testing

`scripts/verify-portal.mjs` is the regression net and is already appearance-independent
by construction: it asserts destinations, `aria-current`, dialogs opening and closing,
absence of console errors, and figures read from the DOM against values computed by the
bundle. It never asserts a colour, a font size or a pixel position. It should therefore
stay green through the entire redesign; a red run means something real broke.

**Prerequisite, and the first task of the plan:** Task 11's review found two assertions in
that harness — `verify-portal.mjs:242` and `:196` — that do `actual.includes("")` and
therefore cannot fail. They are dormant today (the demo clock never reaches those
branches), but leaning on a net with assertions that cannot fail is worse than having no
net, because it reads as safety. They are fixed before the redesign begins.

`npm test` (252 tests) is unaffected: the figures are unchanged, and this touches no
module it covers.

## Out of scope

- **The app at `/app`.** Its `DESIGN.md`, `tailwind.config.js`, `src/lib/theme.ts` and 17
  screens keep the minimax palette. The two surfaces will not match after this, which is
  a known and accepted consequence of the chosen reach.
- Self-hosting Outfit.
- The Craydel design system.
- Any information-architecture change.

## Risks

- **The seam with the app widens.** Today the portal and the app agree because both
  follow minimax. After this they will not, and a fan crossing from the portal into
  `/app` will see it. Accepted deliberately; re-skinning the app is a separate,
  much larger piece of work against a tested codebase.
- **Deriving the type scale is a judgement call**, and a bad one propagates to every page.
  It is a task with its own review for that reason.
- **The README goes stale again.** It currently documents the migration *to* minimax in
  detail, including a table of what changed and why. That section becomes historical and
  must be rewritten to say the portal now follows the v6 board — not deleted, since the
  reasoning for the earlier move is still worth having.
- **Attribution is the one hard failure mode here.** Everything else in this spec is
  reversible taste; dropping a CC BY-SA credit is a licence breach. Hence the explicit
  stop-and-ask rule above.
