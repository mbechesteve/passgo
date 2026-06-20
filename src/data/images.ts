// Deterministic placeholder imagery for the demo. Swap these for real CDN URLs
// (or Supabase Storage) when wiring live data. picsum.photos always resolves,
// so the UI never shows broken images during development.
//
// Default size is kept modest (cards/heroes look crisp at 800px on a phone
// column) so images download fast; use resizePicsum() for small thumbnails.
export const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/passgo-${seed}/${w}/${h}`;

/** Rewrite a picsum URL's dimensions — used to request small thumbnails. */
export const resizePicsum = (url: string, w: number, h: number) =>
  url.replace(/\/\d+\/\d+(\?.*)?$/, `/${w}/${h}$1`);
