# 🛂 PassGo

Find the **easiest countries to visit** on your passport, then plan cities,
attractions and a full itinerary. Visa requirements & prep guides are Premium.

Built with **React Native + Expo + TypeScript**, **NativeWind** (Tailwind),
**Zustand** + AsyncStorage, **Supabase** (auth + Postgres), **react-native-maps**
and a **RevenueCat** placeholder for subscriptions.

> Runs on **mock data out of the box** — no backend needed to demo. Add Supabase
> credentials to switch to live data with zero screen changes.

---

## Quick start

```bash
npm install
npm start        # then press i (iOS), a (Android) or w (web)
```

The app boots into **Onboarding** → pick a passport (Kenya 🇰🇪 is fully seeded) →
**Discover**. Everything works on bundled mock data.

### Demo the Premium flow
Open any country → "See full requirements" / "Unlock prep checklist" → the
paywall. Tapping **Start Premium** flips a flag (no real charge) and unlocks all
gated content. Reset from **Profile → Premium tab** (dev-only button).

---

## Project structure

```
PassGo/
├── App.tsx                     # GestureHandler + SafeArea + navigation root
├── app.json                    # Expo config (Maps keys, Supabase extra)
├── tailwind.config.js          # Green/blue theme tokens + visa colors
├── src/
│   ├── navigation/             # RootNavigator (stack) + TabNavigator (5 tabs)
│   ├── screens/                # Onboarding, Discover, CountryDetail, Plan,
│   │                           #   Map, Premium/Paywall, Profile
│   ├── components/             # CountryCard, VisaBadge, CityGroup, PassGoMap,
│   │                           #   AttractionCard, FilterBar, PremiumLock, ui/
│   ├── store/                  # Zustand: useAppStore (profile), useTripStore
│   ├── data/                   # Mock data + repository.ts (the mock↔Supabase seam)
│   ├── lib/                    # supabase.ts, theme.ts, revenuecat.ts
│   ├── types/                  # Domain types (mirror the SQL schema)
│   └── utils/                  # formatting + Haversine distance
└── supabase/
    ├── schema.sql              # Tables, enums, RLS
    └── seed.sql                # 50 countries + KE visa rules + cities/attractions
```

## Screens & features

| Tab | What it does |
| --- | --- |
| **Discover** 🧭 | "Easy countries" for your passport (visa-free / VoA / e-Visa / ETA), color-coded badges, search + filters (region, budget, trip length, easy-only), sorted by entry-ease. |
| **Plan** 🧳 | Per-trip itinerary grouped by city, **drag-to-reorder** activities, notes, dates & accommodation. Add activities from the country's attractions. |
| **Map** 🗺️ | All trip cities + attractions on the map with a dashed **route** and city-to-city distances. Clusters per city; web shows a route-list fallback. |
| **Premium** 👑 | Paywall (annual/monthly), benefit list, RevenueCat-shaped purchase/restore. |
| **Profile** 👤 | Passport, saved trips, **countries-visited tracker** with progress bar, **bucket list**. |
| **Country Detail** | Visa type (free) → full requirements (Premium): cost, processing, max stay, official link. "How to prepare" (Premium). Top cities + attractions. |

## Components asked for

- **`CountryCard`** — hero image, flag, `VisaBadge`, quick facts, save heart.
- **`VisaBadge`** — "Visa-Free", "VoA $50", "e-Visa · 1 day", color-coded by ease.
- **`CityGroup`** — city header (image, day estimate, count) used in Detail/Plan/Map.
- **`PassGoMap`** — `react-native-maps` with city + attraction markers and a route
  polyline; degrades to a list on web.

---

## Going live with Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. SQL editor → run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` → `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` /
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` (also mirrored in `app.json > expo.extra`).
4. Restart. `src/lib/supabase.ts#isSupabaseConfigured` flips on automatically and
   `src/data/repository.ts` starts querying the live tables — **no screen changes**.

The `repository.ts` layer is the single seam: every screen calls `fetchCountries`,
`fetchVisaRules`, `fetchCities`, etc., which return mock data today and live rows
once configured.

### Maps
Add Google Maps API keys in `app.json` (`ios.config.googleMapsApiKey` and
`android.config.googleMaps.apiKey`). Maps require a **development build** or
device — they don't render in the web preview (a route list is shown instead).

### Payments
`src/lib/revenuecat.ts` is a drop-in placeholder. Swap its body for
`react-native-purchases` and set `EXPO_PUBLIC_REVENUECAT_API_KEY`. The paywall UI
and entitlement state (`useAppStore.isPremium`) are already wired.

---

## Data model (matches `src/types`)

`countries` · `cities` · `attractions` ·
`visa_rules[passport_country, dest_country, visa_type, cost_usd, processing_days, stay_days, official_link]` ·
`prep_guides` · `user_trips` · `user_profiles` (RLS: users see only their own rows).

> ⚠️ **Visa data is indicative** and seeded for the **Kenyan (KE) passport** as a
> first pass. Rules change often — the `official_link` on each Country Detail
> screen is the source of truth. Add more passports by inserting rows into
> `visa_rules` with the new `passport_country`.
