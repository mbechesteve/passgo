// The Mount Kenya motif, as geometry.
//
// Mount Kenya is one mountain with a split crown, not two hills: Batian (5,199m)
// and Nelion (5,188m) stand about 140m apart, separated by the narrow col known as
// the Gate of the Mists. The fractions below say exactly that — two apexes close
// to the centre, a shallow notch between them, long shoulders falling to the frame
// edges — so the shape reads as the mountain rather than as scenery.
//
// Everything here is pure and unit-tested. The two path builders share one summit
// table, so the mask that frames a photograph and the 22px tab icon can never
// drift apart into two different mountains.

/** A point in frame coordinates. */
export interface Point {
  x: number;
  y: number;
}

/**
 * The summit, west to east, as fractions: `x` of the frame width, `y` of the
 * distance from the highest point down to the shoulder line. Batian sits at 0 —
 * it is the highest point on the mountain, so nothing is drawn above it.
 */
export const SUMMIT: readonly Point[] = [
  { x: 0.42, y: 0.115 }, // Nelion
  { x: 0.49, y: 0.346 }, // the Gate of the Mists
  { x: 0.56, y: 0 }, // Batian
] as const;

/**
 * How far down the frame the shoulders fall in the media mask. A quarter leaves
 * the bottom three-quarters uncropped, which is where overlaid captions sit — the
 * angular crown never competes with text.
 */
export const SHOULDER_BAND = 0.26;

/** Two decimals is finer than a device pixel, and keeps paths comparable. */
const n = (v: number) => String(Math.round(v * 100) / 100);

/** The summit in frame coordinates, given a width and the shoulder line's depth. */
export function summitVertices(width: number, shoulderY: number): Point[] {
  return SUMMIT.map((p) => ({ x: p.x * width, y: p.y * shoulderY }));
}

/**
 * The filled region below the summit: a closed path with the peaks cut into its
 * top edge and `radius` corners on its base. This is what media is masked to.
 */
export function peakMaskPath(width: number, height: number, radius = 10): string {
  const shoulderY = SHOULDER_BAND * height;
  // A radius taller than the straight-sided part of the frame would invert the
  // base curves, so it is clamped rather than trusted.
  const r = Math.max(0, Math.min(radius, width / 2, (height - shoulderY) / 2));
  const crown = summitVertices(width, shoulderY)
    .map((p) => `L ${n(p.x)},${n(p.y)}`)
    .join(" ");

  return [
    `M 0,${n(shoulderY)}`,
    crown,
    `L ${n(width)},${n(shoulderY)}`,
    `L ${n(width)},${n(height - r)}`,
    `Q ${n(width)},${n(height)} ${n(width - r)},${n(height)}`,
    `L ${n(r)},${n(height)}`,
    `Q 0,${n(height)} 0,${n(height - r)}`,
    "Z",
  ].join(" ");
}

/**
 * The summit alone, as an open stroke from base corner to base corner — the tab
 * icon. Its shoulders sit on the bottom edge rather than a quarter down, so the
 * whole height is mountain and the shape survives at 22px.
 */
export function peakGlyphPath(width: number, height: number): string {
  const crown = summitVertices(width, height)
    .map((p) => `L ${n(p.x)},${n(p.y)}`)
    .join(" ");
  return `M 0,${n(height)} ${crown} L ${n(width)},${n(height)}`;
}
