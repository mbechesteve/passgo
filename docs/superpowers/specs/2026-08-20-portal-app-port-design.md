# Pamoja — Porting the App's Screens Into the Portal Design Spec

**Date:** 2026-08-20
**Status:** Approved — no implementation started
**Author:** Mbeche (with Claude)
**Depends on:** the portal now owns the domain root and the app is exported under
`/app` (same session, see "The seam this sits on" below).

## Why

The portal was a marketing page with a single 181-line `dashboard.html` standing in for
the product behind it. The ask is that logging in on the portal lead into the whole
product — the Pass, the matches, the record, the network — and that it be *easier* to
navigate than the app, not merely a copy of it, and that it work on a phone in a browser.

An alternative was considered and rejected in conversation: point "Log in" at `/app` and
let the real React Native Web app be the logged-in surface. That costs nothing to build
and has no drift. It was rejected in favour of hand-written portal pages, so this spec
takes the duplication seriously and confines it to the one layer that has to be
duplicated — markup — while sharing everything that does not.

## The three decisions

| Decision | Taken | Rejected |
|---|---|---|
| Logged-in surface | **Hand-written portal pages** | Hand off to `/app`; hand off plus a shared shell |
| What is shared with `src/` | **Data, logic and copy; markup is written** | Everything hard-coded; share state persistence too |
| Structure | **Five pages, detail folded in** | One scrolling page; seventeen pages mirroring the app |

### Markup is duplicated. Nothing else is.

The 17 screens are ~2,300 lines of React Native. Rewriting them as HTML is the accepted
cost. Rewriting the *figures* alongside them is not: the proposal's numbers are a
specification, `src/utils/spec-figures.test.ts` exists to hold them, and a second
hand-typed copy of 2,189 or `KE-PM-8842` is a place the two surfaces drift apart quietly.

This is affordable because most of the app's non-visual code is already free of React
Native. `src/data/`, `src/utils/` and `src/lib/{strings,clock,layout,theme}.ts` import
nothing from `react-native`, `expo` or `@react-navigation` — a property the app has
because vitest cannot parse React Native, so tested modules were kept clean. That
constraint, adopted for testing, is what makes a second client possible.

The four Zustand stores and `src/lib/storage.ts` are *not* pure: they import
`@react-native-async-storage/async-storage`. On web that package is backed by
`localStorage` anyway, so it is aliased at build time to a shim rather than worked around.

### Five destinations, not seventeen

"Simple to navigate" is the requirement, so detail screens stop being destinations.

| Page | Absorbs |
|---|---|
| `dashboard.html` (Home) | Home, Partner, Confirm, GettingThere, Parking |
| `matches.html` | Matches, Fixture, TicketOffice, Safety, Parking, GettingThere |
| `live.html` | Live |
| `partners.html` | Partners, Category, Partner, Scan, Confirm |
| `pass.html` | Pass, Wallet, PaymentMethod |

Detail opens in an in-page `<dialog>`, not a navigation. Back therefore never goes three
deep, and on a phone the user is never more than one dismissal from a top-level page.

## Architecture

### The bundle

`scripts/build-portal-bundle.mjs` runs esbuild over one generated entry that re-exports
the shared layers. esbuild 0.21.5 is already in `node_modules` as a transitive dependency
of Expo, so nothing needs downloading — but it is added to `devDependencies` explicitly
all the same. A build that depends on a package no manifest names breaks the day the
dependency that pulled it in stops doing so.

```
src/data/*
src/utils/*
src/lib/{strings,clock,layout,theme}.ts
src/store/*                     (via the alias below)

  @react-native-async-storage/async-storage → scripts/shims/async-storage.js

        ↓  esbuild --bundle --format=iife --global-name=Pamoja

portal/app-data.js
```

`scripts/shims/async-storage.js` is a localStorage-backed implementation of the four
methods the stores use (`getItem`, `setItem`, `removeItem`, `multiRemove`), returning
promises so the stores' `await`s are unchanged.

`portal/app-data.js` is build output. It is gitignored, and `npm run build` produces it
before `copy-portal.mjs` runs, so the copy picks it up.

**Boundary:** pages read from the global `Pamoja`. A page never hard-codes a figure, a
fixture, a price or a user-facing string that `src/lib/strings.ts` already holds.

### State

`portal/state.js` sits over the shimmed stores and rehydrates from `localStorage` on
every page load — multi-page HTML loses in-memory state at each navigation, so
rehydration is per-page rather than once.

Real, mutating behaviour is scoped to four flows:

- issuing a Pass (the three questions `signup.html` already asks)
- redeeming at a partner, from both entry points the app offers, keeping the record
  store's deliberate split between `append` (through the app) and `ingestShortCode`
  (read aloud at a counter)
- choosing the default payment method
- the record accumulating, with its saved total

An earlier draft of this list said "reordering the wallet". It was wrong: no reorder
exists anywhere in the app. `usePaymentStore` holds a list of methods with one marked
default, moved by `choose(id)`. The portal may not offer a capability the product does
not have, so the flow is choosing the default.

Everything else renders from seed data and does not pretend to mutate. A page that cannot
really do a thing does not offer a control that looks as though it can.

### Responsive

Mobile-first; the phone in a browser is the case that prompted this.

The breakpoint is the portal's existing **860px**, not the app's 1024. Introducing a
second breakpoint into `portal.css` to match the app would make the marketing page and
the logged-in pages reflow at different widths, which is a worse outcome than either
number.

- **Below 860px** — single column, sticky five-item bottom bar, 44px minimum touch
  targets (the floor `portal/README.md` already sets and justifies).
- **860px and up** — the portal's existing header nav, content capped and centred.

No new type scale, no new colour. `portal.css` tokens are reused unchanged so the
logged-in pages read as the same product as the marketing page.

## Testing

- **Vitest** keeps guarding the figures, unchanged. Because the pages compute from the
  same modules, `spec-figures.test.ts` now constrains both surfaces rather than one.
- **Playwright** over all five pages at 420×900 and 1280×900, asserting: no console or
  page errors; the bottom bar present and reachable below the breakpoint; every `<dialog>`
  opens and dismisses; and the Figure 1, 3 and 4 numbers read *out of the DOM* and
  compared against what the shared modules compute — never against literals in the test,
  which would just be a third copy of the same figures.
- The portal's boot curtain must be waited out (`[data-booting]` is removed when it
  lifts) or screenshots capture the Mount Kenya motif instead of the page.

## Out of scope

- `ScanScreen`'s camera. The app's own is a mock; the portal's is a button.
- Authentication. Both forms stay `method="get"`; nothing is verified or stored.
- Payment capture. Rev. 2 §05 holds here exactly as it does in the app.

## The seam this sits on

Earlier the same day the portal became the domain root and the app moved to `/app`:
`experiments.baseUrl`, `expo export --output-dir dist/app`, `copy-portal.mjs`, the PWA
manifest and service worker rescoped to `/app/`, host rewrites narrowed from a catch-all
to `/app/*`, and `scripts/dev-server.mjs` serving the portal at `/` with the bundler
proxied behind it.

One correction belongs with that work: the dev server's design claimed hot reload was
preserved. It is not, and was not before — this Expo web setup requests its bundle with
`hot=false`, and a probe against the bundler directly, with the proxy bypassed, fails the
same way. The proxy is not the cause. Hot reload is a separate question from this spec.

## Risks

- **Drift in behaviour, not figures.** The shared bundle holds the numbers still; it does
  not stop the portal's redemption dialog and the app's Confirm screen from diverging in
  what they *do*. Only review catches that.
- **`portal/app-data.js` bundles more than a marketing page needs.** `generatePartners()`
  builds 2,189 records. If the payload becomes a problem, the fix is to narrow the entry,
  not to hard-code results.
- **The portal's charter changes.** `portal/README.md` says "no build step, no
  dependencies, nothing imported from the app". Two of those three stop being true, and
  the README has to say so rather than be quietly falsified.
