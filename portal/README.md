# Pamoja portal

The public marketing site — "Twende, pamoja." Built from the **`Pamoja Portal.dc.html`**
board in `Karibu Kenya eTA portal.zip` (a Claude Design canvas).

A single static page: `index.html` plus `img/`. No build step, no dependencies, nothing
imported from the app.

## The board's system, followed rather than approximated

Taken from `Pamoja Portal.dc.html` itself, not eyeballed from a screenshot:

| | |
|---|---|
| Radius | **10px** on cards and buttons; 4px on chips; 999px **only** in the nav |
| Imagery | `grayscale(1) contrast(1.06)`, then a `multiply` gradient wash over it |
| Sections | 88–96px vertical, 64px horizontal |
| Heads | 42px section · 72px featured fixture · 36px feature tile · 21px small tile |
| Gold | `#F2C744` eyebrows and numbers · `#F2C200` buttons · `#FFD427` hover |
| Green | `#067647` carries list dates, event titles and chevrons |
| Bands | `#eef0f0` behind events and partners |

The first build got this wrong — pills everywhere, colour photography, 14px cards, no
fixtures list — which is why it did not look like the board.

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

## It now follows minimax, like the app

The portal was built to the canvas board — near-black, gold `#F2C744`, green `#067647`,
10px radii, Outfit. It now follows **`minimax/DESIGN.md`**, the same template the app was
re-skinned to, so the two surfaces are one product again.

| | Board | Now (minimax) |
|---|---|---|
| Interactive | gold `#F2C744` | brand-blue `#1456f0` |
| On dark text | gold | brand-cyan `#3daeff` |
| Live / confirmed | green `#067647` | success `#1ba673` on `#e8ffea` |
| Ground | `#f5f8f8` | `#f7f8fa` |
| Faces | Outfit | DM Sans |
| Buttons | 10px, gold fill | pills, black primary — white on dark |
| Cards | 10px | 16px, with 32px on the photo-hero surfaces |
| Inputs | 10px | 8px, 2px `#1d4ed8` when focused |

Variables were **renamed**, not repointed: `--gold` became `--accent`, `--green` became
`--success`, `--paper` became `--surface`. A variable called `--gold` holding blue is worse
than a rename.

Three departures from the template, each deliberate:

- **JetBrains Mono stays.** The template says not to add a second display face; mono here
  is the data register, not display. Same reasoning as the app.
- **Hovers stay.** The template documents none — "per the no-hover policy" — which suits a
  product UI and not a marketing page a mouse visits.
- **Circular buttons are 44px, not the template's 36px.** 44 is the floor Apple, Android
  and WCAG 2.5.5 agree on.

## Why the board's palette is gone

The app is `deep #04222b` + `accent #0e6ba8` — two hues, per Uratibu. This surface is
near-black `#121316`, gold `#F2C744` and green `#067647`, which is what the board draws
and what a public marketing site needs to do that a product does not. It is the same
split Hayya keeps between `hayya.qa` and the Hayya app.

**The app's theme is untouched.** `tailwind.config.js`, `src/lib/theme.ts` and `DESIGN.md`
are unchanged, and nothing here is importable from `src/`. If the two ever need to agree,
that is a decision to take deliberately rather than by leakage.

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

Six images from Wikimedia Commons, **self-hosted** in `img/` rather than hotlinked —
Wikimedia asks not to be used as a CDN. Every one carries a credit in the page: a caption
on the card and a full attribution list with links in the footer. The hero is
`Pt_Thomson_Batian_Nelion_Mt_Kenya.JPG`, which is Batian and Nelion — the same summits
the app's `PeakFrame` motif is cut from.

If any image is replaced, its credit has to move with it. CC BY-SA requires attribution.

Attribution lives on **`credits.html`**, linked from the footer by a single "Photo
credits" line. The board's footer carries no legal text and neither does this one — but
the link is not optional decoration: the "BY" in CC BY-SA is a licence term, so that page
is what keeps displaying the photographs lawful. The prototype caveat moved there too.

## Pages

| File | What it is |
|---|---|
| `index.html` | the marketing page — the board, ported |
| `login.html` | Pass number + one-time code. No password: there is none to steal, and none to store |
| `signup.html` | the app's own three questions — country, name, ticket reference. No payment fields anywhere |
| `dashboard.html` | the inside of the app on the web: credential, next match and seat, the record, the partner network |
| `credits.html` | photo attributions. **Unlinked** — see Photography |
| `portal.css` | tokens, base type, buttons, nav, footer — shared by all of them |
| `auth.css` | only what login, sign-up and the dashboard add |

Nothing is authenticated. Both forms are `method="get"` to `dashboard.html`, so any input
opens it, no credentials are stored, and no payment details are collected on any page —
Rev. 2 §05 holds here as it does in the app.

The dashboard's figures are the **app's**, not written for the page: `KE-PM-8842`,
Amina Nakato, `Valid · 24 days left`, Cat 2 / Gate D / Section 214 / Seat 17, the
`KES 850 · food and drink · Kasarani ward · 12:55` record line with its `KES 150` saved,
and the five partner counts. `src/utils/spec-figures.test.ts` guards those, so if the app's
figures move, that suite is what will say this page is stale.

## Not wired into deployment

`vercel.json` and `netlify.toml` serve the app's `dist/` at the domain root. This page is
not part of that, deliberately — putting a marketing site in front of the app changes what
the domain root means, which is a decision to take rather than assume. To view it now:

```bash
python3 -m http.server 8080 --directory portal   # then open http://localhost:8080
```

## Still to do

- Nav links all point at in-page anchors; nothing behind "Log in", "Track my Pass" or
  "Get your Pamoja Pass" yet.
- The language switch (EN / SW / FR) and the accessibility menu are labels, not controls.
- The fixture ticker is hand-written from the seed rather than read from it, so it will
  drift when fixtures change.
