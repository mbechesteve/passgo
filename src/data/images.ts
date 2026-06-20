// Deterministic placeholder imagery for the demo. Swap these for real CDN URLs
// (or Supabase Storage) when wiring live data. picsum.photos always resolves,
// so the UI never shows broken images during development.
export const img = (seed: string, w = 1200, h = 800) =>
  `https://picsum.photos/seed/passgo-${seed}/${w}/${h}`;
