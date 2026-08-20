# Pamoja portal

The public marketing site — "Karibu, pamoja." Originally built from the
**`Pamoja Portal.dc.html`** board in `Karibu Kenya eTA portal.zip` (a Claude Design
canvas); it now follows the **Pamoja Landing v6 + Mobile** boards — see *The board's
system, followed rather than approximated*, below, for what that means and *History*,
further down, for what it followed in between.

Static markup — `index.html`, four more marketing/auth pages, five logged-in pages and
`img/` — plus one build step: `npm run build:portal-bundle` runs esbuild (the portal's
only dependency) over `src/portal-entry.ts` to produce `portal/app-data.js`, the app's
data, logic and copy, bundled for a browser. See *The boundary with the app*, below, for
what that import surface is and is not.

## The board's system, followed rather than approximated

The portal follows the **Pamoja Landing v6** board (desktop) and **Pamoja Mobile**
(phone), from `Pamoja Page Vibrant Redesign.zip` — the only pair of the seven boards in
that zip that share a palette and therefore specify a responsive story rather than
leaving one to be guessed. v4 (forest green) and v5 (maroon) are different directions,
not iterations; v1–v3 share v6's family but have no matching phone board. The survey is
`docs/design/2026-08-20-vibrant-redesign-findings.md`; the decision record is
`docs/superpowers/specs/2026-08-20-portal-v6-redesign-design.md`.

### The palette

Indigo `#23276b` is both the ground and the interactive colour — nav, dark panels, body
text, buttons, links, the active destination. Yellow `#ffd22c` carries figures and
eyebrows (`--highlight`) and stands in for accent text on dark (`--on-dark`). Orange
`#f4772c` (`--brand`) is a fill and a decoration, and on a light ground it is never type.

That restriction is not taste — it is measured. **The board's orange is not a text colour
on paper**: it is 2.79 on `--canvas` and 2.58 on `--surface-soft`, failing even the
large-text AA threshold of 3.0. This is why `--accent` is indigo rather than orange,
despite orange looking like "the accent" on the board — the board's own buttons are indigo
pills, and an earlier draft of the spec had `--accent` mapped to orange before that
measurement overturned it. Orange never carries a white label either (2.79 the other way),
which is why quiet footer controls sit on indigo, not orange. `--brand` is
set as text in exactly one place: `"tournament."` on the indigo CTA band, where it is 4.78.

**The two display tints** are how the board's two-tone headings survive that. The board
tints the second half of every section heading — "One Pass. *Five doors.*", "Fan events
*and promotions*", "Explore the *host country*" — and `--display-tint` (`#eb600c`) and
`--display-tint-alt` (`#1f8fc4`) are the board's orange and cyan taken down until they
clear 3.0 on the darker of the page's two light grounds: 3.13 and 3.36 on
`--surface-soft`, 3.38 and 3.63 on `--canvas`. They are named for the register they belong
to, not for the hue, because what they have in common is *where they may be used* — only
`--fs-feature`, `--fs-head` at weight 800, and `--fs-display`, all of which are WCAG large
text. Neither may go near body copy; there is no orange in this palette that can.

`--marker` (`#ee4b3b`) is the categorical red, at the board's own value: it separates one
member of a set from the rest — Kenya among the three countries, Move among the five
partner categories — and carries no state meaning. Nothing is wrong because it is red.

`--muted` is lightened from the board's own value for the same reason. The board's
`#7c7e96`, used as secondary text on the indigo ground, is 3.36 there and fails AA
(needs 4.5). `--muted` is that value +10% lightness — `#989aad`, 4.80 on indigo. The
board is a picture; AA is a requirement; where they disagree, AA wins, and the deviation
is recorded in `portal.css` rather than silently absorbed.

| | |
|---|---|
| Radius | `--radius-card` 20px on cards; 999px pills (the board's most common radius by far); 50% circles |
| Imagery | colour, `contrast(1.06)`, a `multiply` wash carried over — see *Photography*, below |
| Weights | top-loaded: 800 and 700 dominate, against a light 300/500 tail — considerably heavier than the previous setting |
| Faces | **Outfit**, replacing DM Sans; **JetBrains Mono stays** — see *Type*, below |

The first build of this portal, before it followed any board at all, got even the shape
of the thing wrong — pills everywhere, colour photography, 14px cards, no fixtures list.
That failure predates both boards discussed in this file and is why later builds started
from a board's own file rather than a screenshot of one.

### Type

The board carries 30 distinct font sizes between the two artboards, from 9px to 96px,
including canvas half-pixel artifacts (9.5, 10.5, 11.5…) that are rendering residue, not
design decisions. Those are not 30 decisions, and the scale here is **eight derived
steps, not the board's thirty**:

| Token | Value | Board sizes it absorbs |
|---|---|---|
| `--fs-micro` | `11px` | 9, 10, 11 — eyebrows, mono labels |
| `--fs-small` | `13px` | 12, 13 |
| `--fs-body-sm` | `15px` | 14, 15, 16 |
| `--fs-body` | `17px` | 17, 18, 19 |
| `--fs-subhead` | `22px` | 20, 21, 22, 24, 25 |
| `--fs-head` | `28px` | 26, 27, 29, 32 |
| `--fs-feature` | `clamp(28px, 3.2vw, 40px)` | 34, 40, 48, 56, 64 — see below |
| `--fs-display` | `clamp(52px, 9vw, 96px)` | 52 (Mobile) → 84, 96 (v6) — the hero |

Two collapses drive that count. Everything at 40px and up on the board is weight 800, so
weight rather than size is doing the work of a separate register above 40. And Mobile's
52px/48px headings are v6's 96px/84px headings at a narrower artboard — one element
rendered at two widths, not two decisions — so they fold into the single fluid
`--fs-display` step rather than each getting their own token.

`--fs-feature` is the **section-heading register** — the board's 40px section heads
("One Pass. Five doors.", "Fan events and promotions", "Explore the host country"). The
board's larger one-off headings (the featured fixture's score line, the CTA headline, the
partners stat, at 56/64/84px) are **display register**, not section-heading register.
These two were merged in an earlier draft, and the merge resolved to the wrong end: the
clamp's growth term reached 64px by 1164px, so every real desktop width rendered the
display size and `--fs-feature` never actually occupied its own 28–40px band — 64px
showed up everywhere a desktop was involved. The fix was to split them back apart, not to
retune the clamp. `--fs-feature` now spans only 28–40px; do not re-merge it with
`--fs-display` — the two roles differ in cast, not in count.

`--fs-feature`'s comment in `portal.css` and `.split-media .quote p` in `auth.css` are
where this is spelled out in full if a future change needs the reasoning again.

**One bespoke size, tracked here because it is not on the scale.**
`portal/auth.css`'s `.split-media .quote p` (the login/sign-up split-screen pull-quote)
is a one-off `clamp(24px, 3vw, 34px)`, not a scale step. It is a genuine role
difference — a two-line supporting pull-quote set lighter than a single-line section
heading, sitting under `--fs-feature`'s 28–40px band at every width — and it is
documented at its own declaration, but nowhere a board author would look for it. If a
future board draws a pull-quote, check it against this rather than assuming it belongs on
the eight-step scale.

**JetBrains Mono stays.** It is the data register — the Pass serial, record lines,
kickoff times, figures — not a second display face competing with Outfit. Same reasoning
as the app.

### Enforcement, and its limit

`scripts/verify-contrast.mjs` reads the token pairs straight out of `portal.css` and
fails the build if a pairing regresses — `--muted` on `--primary`, `--accent` on
`--canvas`, the two display tints against *both* light grounds at 3.0, the partners band's
five figures against `--primary`, and the rest of the pairs a real element actually uses,
plus a tripwire asserting `--brand` stays under the text-safe threshold on paper. What it
cannot do: it checks
token pairs, not text set over photography. Text-over-photo contrast — the eyebrow on the
featured fixture's image, a caption over a `.shot`/`.wash` pair — is measured by hand,
against the actual rendered pixel, each time the imagery changes.

## The interactions, ported too

| Board | Here |
|---|---|
| Doors accordion (`activeDoor` state, `flex` 3.2 open / 0.55 shut, 420ms) | radio inputs + `input:checked + .door`, same flex values and easing |
| Collapsed door titles turned on their side | `writing-mode: vertical-rl`, faded by the same 250ms |
| `tickerscroll` marquee, `translateX(-50%)`, 32s linear | same, with the run duplicated so the loop is seamless |
| `livedot`, 1.6s, red `#E8412F` | same |
| Events rail `scrollBy(±364)` buttons | same, the only JavaScript on the page |
| `style-hover` / `style-active` / `style-focus` (11 / 1 / 3 variants) | CSS `:hover`, `:active`, `:focus-visible` |

Only the rail buttons need script. Everything else is CSS, so the page works with
JavaScript disabled, and all of it stops under `prefers-reduced-motion`.

## History: it once followed minimax, like the app

**This section is superseded.** The portal no longer follows minimax; it follows the v6
board described above. It is kept because the reasoning behind that earlier move is
still worth having, and a reader who finds only the current state cannot tell what was
tried and rejected before it.

The portal was originally built to the Claude Design canvas board — near-black, gold
`#F2C744`, green `#067647`, 10px radii, Outfit. For one stretch of its history it instead
followed **`minimax/DESIGN.md`**, the same template the app was re-skinned to, so that the
two surfaces were one product, palette and all.

| | Canvas board | Minimax (then) |
|---|---|---|
| Interactive | gold `#F2C744` | brand-blue `#1456f0` |
| On dark text | gold | brand-cyan `#3daeff` |
| Live / confirmed | green `#067647` | success `#1ba673` on `#e8ffea` |
| Ground | `#f5f8f8` | `#f7f8fa` |
| Faces | Outfit | DM Sans |
| Buttons | 10px, gold fill | pills, black primary — white on dark |
| Cards | 10px | 16px, with 32px on the photo-hero surfaces |
| Inputs | 10px | 8px, 2px `#1d4ed8` when focused |

Variables were **renamed**, not repointed, at that migration: `--gold` became `--accent`,
`--green` became `--success`, `--paper` became `--surface`. A variable called `--gold`
holding blue is worse than a rename — the same rule the v6 move above also followed
(indigo took over `--accent` in place, rather than a fresh token appearing next to a
stale one).

Three departures from the minimax template were deliberate at the time, and two of the
three still hold: **JetBrains Mono stayed** (the data register, not a second display
face — the reasoning the current *Type* section above restates); **hovers stayed** (the
template documented none, which suits a product UI and not a marketing page a mouse
visits); **circular buttons stayed 44px**, not the template's 36px, because 44 is the
floor Apple, Android and WCAG 2.5.5 agree on, and that floor does not move with a
redesign.

## Why the portal's palette differs from the app's

The app's theme — `deep #04222b` + `accent #0e6ba8`, per Uratibu — is untouched by any of
this. This surface now draws indigo, yellow and orange from the v6 board, which is what a
public marketing site can do that a product does not; before that it was near-black, gold
and green from the canvas board, for the same reason. It is the same split Hayya keeps
between `hayya.qa` and the Hayya app, and the *Out of scope* / *Risks* sections of
`docs/superpowers/specs/2026-08-20-portal-v6-redesign-design.md` accept the seam this
widens, deliberately, rather than by drift.

**The app's theme is untouched.** `tailwind.config.js`, `src/lib/theme.ts` and `DESIGN.md`
are unchanged, and no CSS or colour token is importable from `src/` — only figures and
logic cross, through `src/portal-entry.ts` (see *The boundary with the app*, below). If
the two themes ever need to agree, that is a decision to take deliberately rather than by
leakage.

## Figures are the app's, not the board's

Where the board and the product disagreed, the product won:

| | Board | Here |
|---|---|---|
| Partner categories | 6 — Food 812, Lodging 415, Transport 388, Retail 306, Culture 168, Essentials 100 | 5 — Eat 1,340, Shop 460, Stay 210, Do 95, Move 84 |
| Venues | 6 | **7** |
| Fixtures | KEN v NGA, TAN v EGY, UGA v ALG | the seeded ones: KEN v MLI next, ZAM v MAR live |

The 2,189 total, the three countries and the eleven matches were already the same in
both. `src/utils/spec-figures.test.ts` guards the split as a proposal specification, so
the page repeats it rather than inventing a second version of the same fact.

## Photography

Colour, not greyscale. `.shot` used to run `grayscale(1) contrast(1.06)` to hide the real
colour already present in every JPEG in `img/`; the v6 board's own reference imagery is
colour, so the `grayscale(1)` came off and only `contrast(1.06)` stays — that part was
never about the missing colour. The `.wash` — the `multiply`-blend gradient over each
framed photograph — survives for a different reason: it is what keeps text legible over a
photograph, not a stand-in for the grey the board never specified. Text-over-photo
contrast is not something `scripts/verify-contrast.mjs` can check — see *Enforcement, and
its limit*, above — so each wash's opacity is measured by hand against the actual rendered
pixel. `.featured .veil`'s 0.82 records one such measurement, taken at the eyebrow's
worst-case pixel; `.door .panel`'s 0.58 records another, taken at the worst pixel inside
the *tight glyph box* of each label rather than the label's layout box, which on a
`writing-mode: vertical-rl` title is most of the door and mostly not text.

Sometimes no wash is the answer. The door numbers sit on the unveiled top of a photograph,
where the five images measured 1.57, 2.71, 8.07, 1.11 and 1.04 and a scrim heavy enough to
grey out the top third still left two of them under 3. `.door .num` was given its own
`--primary` ground instead, which is 9.22 by construction and does not have to be
re-measured when someone swaps a photograph.

Every *photograph* is **self-hosted** in `img/` rather than hotlinked — Wikimedia asks not
to be used as a CDN — and carries a credit in the page: a caption on the card, or a listing
in the footer's attribution table, or both.

Most come from Wikimedia Commons. **Five do not**, and they are the exception that has to be
closed rather than absorbed: `stadium-interior.jpg` (featured fixture), `stadium-night.jpg`
(Doors 01), `expressway.jpg` (Doors 02), `towers-dusk.jpg` (Doors 03) and
`police-vehicles.jpg` (Doors 05) were supplied for this prototype with no photographer and
no licence recorded. They hold rows on
`credits.html` that say exactly that, because an image on the page with no row at all is the
one state that table exists to prevent — but a row reading "source not recorded" is a note
to whoever clears them, not a licence. None of the four is cleared for publication.

Two of them carry a further problem no crop fixes. `towers-dusk.jpg` shows a legible
**JW MARRIOTT** sign, sitting under a door captioned *Partner discounts* — a real hotel
brand presented as a Pamoja partner, which is a claim the prototype is not entitled to
make. `police-vehicles.jpg` shows Kenya Police liveries and a readable plate under
*Security*, which reads as official endorsement the same way.

Two files in `img/` are not photographs and raise no attribution at all:
`trophy-doodle.png`, the hero, and `panel-strip.png`, the closed doors' line art. Both are
original illustration from the v6 board. The licensed football clip that used to hold the
hero left with them, and its credits row left with it — an attribution outlives the work
only as a lie.

**`credits.html` is no longer linked from any page.** It was removed from the footers of
`index`, `login` and `signup` on request. The file itself is kept, and every photograph
still on the site is still mapped to a row in it — so the mapping is intact and only the
route to it is gone.

That route is what CC BY-SA asks for. These are Wikimedia photographs under CC BY-SA, and
the licence's attribution term is not discharged by a credits page nothing points at. This
is recorded here rather than argued: restoring compliance is one line in the shared footer,
and the alternative — swapping the remaining photographs for the original illustrations the
v6 board supplies, which raise no attribution at all — is the other way to close it.

**The mapping rule still holds for anyone adding an image:** every photograph maps to a row
on `credits.html`, and CC BY-SA attribution follows a derivative, so a re-crop of the same
source extends its credit rather than escaping it. Neither the
canvas board's footer nor the v6 board's carries any legal text, and neither does this
one — but the link is not optional decoration: the "BY" in CC BY-SA is a licence term, so
that page is what keeps displaying the photographs lawful. The prototype caveat lives
there too.

## Pages

No board — the original canvas board or v6 — was ever drawn for the five logged-in
pages below (`dashboard.html`, `matches.html`, `live.html`, `partners.html`,
`pass.html`). They exist because tokens, not layouts, drive them: `portal/app.css` and
`portal/pages/*.js` hold no raw colour values, only role tokens, so repointing
`portal.css`'s `:root` re-skins the marketing page and all five of these at once, and a
board's component form — card radius, weight, the eyebrow-and-number treatment — is
carried across by derivation from the same rules rather than by eye. If a board is ever
drawn for these five pages, it **supersedes** this derivation rather than conflicting
with it — the derivation was always a stand-in for a board that did not exist yet, not a
competing decision.

| File | What it is |
|---|---|
| `index.html` | the marketing page — the v6 board, ported |
| `login.html` | Pass number + one-time code. No password: there is none to steal, and none to store |
| `signup.html` | the app's own three questions — country, name, ticket reference — and now issues a real Pass on submit, through `PamojaState.issue()` |
| `dashboard.html` | Home: the next match, the partner network, and the three most recent lines of the record |
| `matches.html` | the fixture list, read from `MATCHES` |
| `live.html` | whatever `liveMatches(MATCHES, now)` says is under way, with its minute — no score: the portal reads the fixtures, not `MATCH_LIVE` |
| `partners.html` | the partner network by category, and the one flow that mutates state: redemption |
| `pass.html` | the Pass, the whole record newest-first, and the wallet: adding a payment method and choosing the default |
| `credits.html` | photo attributions. **Unlinked** — kept, but no page routes to it. See Photography |
| `portal.css` | tokens, base type, buttons, nav, footer — shared by all of them |
| `auth.css` | only what login, sign-up and the dashboard add |
| `app.css` | the logged-in pages' own chrome: tabbar, dialogs, panels |
| `app-data.js` | **generated**, gitignored — see *The boundary with the app* |
| `state.js` | the page-shaped door onto `app-data.js`'s stores: `ready()`, `pass()`, `issue()`, `redeem()`, `addMethod()`, `chooseMethod()` |
| `chrome.js` | mounts the five-tab bar on the logged-in pages. Needs nothing from the bundle, and is mounted before each page waits on it, so a page with no `app-data.js` is still navigable |
| `pages/*.js` | one script per logged-in page, rendering that page's figures from `app-data.js` |

Nothing is authenticated. Both forms stay `method="get"` to `dashboard.html`; sign-up now
issues a Pass first, so what login finds is either that Pass or, for anyone who never
signed up, the same empty state the pages always showed. No credentials are stored and no
payment details are collected on any page — Rev. 2 §05 holds here as it does in the app.

Every figure on the logged-in pages is the **app's**, not written for the page:
`KE-PM-8842`, Amina Nakato and `Valid · 24 days left` on `pass.html`, the
`KES 850 · food and drink · Kasarani ward · 12:55` record line with its `KES 150` saved,
and the five partner counts. `src/utils/spec-figures.test.ts` guards those, so if the app's
figures move, that suite is what will say these pages are stale.

One figure the app has and these pages do not: the ticket — Cat 2 / Gate D / Section 214 /
Seat 17. `PassScreen` shows it and `pass.html` does not yet, though `PamojaState.ticket()`
is there for whoever adds it.

## The boundary with the app

The markup, CSS and page scripts in `portal/` are the portal's own — nothing in `src/`
knows they exist. Figures and logic are the app's — nothing in `portal/` reinvents a
number or a rule the app already owns. `src/portal-entry.ts` is the whole of what
crosses that line: every data seed, formatter and store the logged-in pages read comes
through it, and nothing they use skips it. It excludes `src/screens`, `src/components`
and `src/navigation` outright, because those pull React Native, which does not belong in
a browser bundle.

`npm run build:portal-bundle` (esbuild, `scripts/build-portal-bundle.mjs`) compiles that
one file into `portal/app-data.js` — an IIFE global, `window.Pamoja` — which is
gitignored, not committed: it is generated the same way on every machine and in CI, so
committing it would just be a second copy to keep in sync. `portal/state.js` is a thin,
page-shaped door onto `Pamoja`'s Zustand stores (rehydration, a `ready()` to await before
first paint, `issue()`, `redeem()`, `addMethod()` and `chooseMethod()`), not a
reimplementation of them.

The boundary is checked, not merely stated: `npm run verify:bundle` compares the built
global's own key set against the contract it expects, in both directions, so neither a
page reaching for something new nor an export nothing reads goes unnoticed.

`src/utils/spec-figures.test.ts` now guards both surfaces at once: it is the single
source for every number this README and every logged-in page repeats, so a figure moving
in the app is a failing test here too, not a silent drift.

## Wired into deployment

`vercel.json` and `netlify.toml` now serve this portal at the domain root; `npm run build`
runs `build:portal-bundle` before it builds the Expo web app into `dist/app`, and both
configs rewrite `/app` and `/app/*` to the app's own `index.html`. Putting a marketing
site in front of the app changes what the domain root means — that decision has now been
taken, deliberately, rather than left assumed. To view the portal on its own:

```bash
npm run portal     # builds app-data.js, then serves portal/ on http://localhost:8080
```

Use the script rather than a bare `python3 -m http.server`: `app-data.js` is build output
and gitignored, and a portal served without it shows no figures at all.

## Still to do

- The language switch (EN / SW / FR) and the accessibility menu are labels, not controls.
- The fixture ticker is hand-written from the seed rather than read from it, so it will
  drift when fixtures change.
