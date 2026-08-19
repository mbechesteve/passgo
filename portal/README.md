# Pamoja portal

The public marketing site — "Twende, pamoja." Built from the **`Pamoja Portal.dc.html`**
board in `Karibu Kenya eTA portal.zip` (a Claude Design canvas).

A single static page: `index.html` plus `img/`. No build step, no dependencies, nothing
imported from the app.

## Why it does not look like the app

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
