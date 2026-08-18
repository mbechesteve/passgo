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

The app exports to a static SPA — `npm run build` (`expo export --platform web`)
writes everything to `dist/`. Two things the host must do, both already wired up:

- **Build with `expo export` and serve `dist/`** — otherwise the host serves
  nothing (blank page).
- **SPA fallback** — rewrite every route to `/index.html` so refreshes and deep
  links don't 404.

`vercel.json` and `netlify.toml` configure both. On Vercel, the committed
`vercel.json` overrides any auto-detected framework — just redeploy. Assets are
referenced from the domain **root** (`/_expo/...`), so deploy at the root of the
domain, not a sub-path.

```bash
npm run build      # → dist/  (what the host runs)
```
