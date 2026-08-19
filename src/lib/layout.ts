/**
 * Two arrangements, one breakpoint.
 *
 * `phone` is the app as drawn — a single column with the tab bar across the bottom.
 * On the web build below the breakpoint it is framed in a phone-width column over a
 * neutral backdrop, because stretching a phone-first UI edge to edge on a laptop
 * reads as a bug rather than a layout.
 *
 * `wide` moves the tab bar to a rail down the left and lets the content column
 * breathe. Chosen at 1024 so a tablet in landscape keeps the column it was designed
 * for and only a genuine desktop viewport gets the rail.
 */
export type LayoutMode = "phone" | "wide";

/** Where the rail arrangement takes over. */
export const WIDE_MIN = 1024;

/** The framed column on the web build below the breakpoint. */
export const PHONE_FRAME_WIDTH = 440;

/** The tab rail's width in the wide arrangement. */
export const RAIL_WIDTH = 96;

/** How wide the content column is allowed to grow beside the rail. */
export const CONTENT_MAX = 640;

export function layoutMode(width: number): LayoutMode {
  return width >= WIDE_MIN ? "wide" : "phone";
}

// The hook lives in ./useLayout, not here: importing react-native pulls in its
// Flow-typed source, which the test runner cannot parse — so this module stays
// pure and stays tested.
