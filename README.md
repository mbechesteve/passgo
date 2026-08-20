# 🟦 Pamoja

**Pamoja** ("together" in Swahili) is the fan companion app for the **PAMOJA
Pass** at AFCON 2027 — the single digital pass fans use across the
tournament for match access, transport and city services.

The app has four tabs:

- **Home** — the fan's day at a glance.
- **Explore** — host cities, venues and things to do around matches.
- **Services** — transport, accommodation and on-the-ground help.
- **Pass** — the PAMOJA Pass itself: identity, entitlements and status.

Built with **React Native + Expo + TypeScript** and **NativeWind** (Tailwind).

> Runs on **mock data out of the box** — no backend needed to demo. The app's
> demo clock is fixed to **Wednesday 23 June 2027**, mid-tournament, so seeded
> data always reads as "now."

---

## Quick start

```bash
npm install
npm start        # then press i (iOS), a (Android) or w (web)
```

The app boots straight into the four-tab shell — **Home**, **Explore**,
**Services**, **Pass**.

---

## Project structure

```
PassGo/
├── App.tsx                     # GestureHandler + SafeArea + navigation root
├── app.json                    # Expo config
├── tailwind.config.js          # Pamoja theme tokens (deep / accent)
├── src/
│   ├── navigation/              # RootNavigator (stack) + TabNavigator (4 tabs)
│   ├── screens/                 # HomeScreen, ExploreScreen, ServicesScreen, PassScreen
│   ├── components/               # Screen, Icon, ui/, PamojaMap, ...
│   ├── data/                    # repository.ts (the mock↔live data seam)
│   ├── lib/                     # theme.ts, storage.ts
│   ├── types/                   # Domain types
│   └── utils/                   # formatting + Haversine distance
```

---

## Deploy the web build (Vercel / Netlify / static)

`npm run build` writes one directory, `dist/`, holding two stacked trees: the
portal at the root and the Expo web export under `/app`. It runs
`build:portal-bundle` (esbuild over `src/portal-entry.ts` → `portal/app-data.js`),
then `expo export --platform web --output-dir dist/app`, then copies `portal/`
over the root of `dist/` and injects the PWA manifest. Three things the host must
do, all already wired up:

- **Build with `npm run build` and serve `dist/`** — not `expo export` on its
  own, which would leave the domain root empty.
- **Rewrite `/app` and `/app/*` to `/app/index.html`** — the app is a single-page
  app, so its deep links need the fallback.
- **Leave the root alone.** The portal is made of real files and must *not* have
  a catch-all fallback: with one, a mistyped URL renders the marketing page
  instead of 404ing. `netlify.toml` says so where the rule lives.

`vercel.json` and `netlify.toml` configure all three. On Vercel, the committed
`vercel.json` overrides any auto-detected framework — just redeploy. The app's
assets are referenced from `/app/...` (`experiments.baseUrl` in `app.json`), so
deploy at the root of the domain, not a sub-path.

```bash
npm run build      # → dist/  (what the host runs)
npm run dev        # the same shape locally: portal at /, Metro proxied behind /app
```
