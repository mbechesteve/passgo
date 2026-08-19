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

/**
 * The tab rail's width in the wide arrangement.
 *
 * 232 rather than 96: at icon-and-label size the rail could only carry five words, and
 * the design canvas gives it the wordmark, the live match and the Pass's own status too.
 */
export const RAIL_WIDTH = 232;

/** The schedule pane beside the rail, with the detail taking what is left. */
export const LIST_WIDTH = 420;

/** How wide the content column is allowed to grow beside the rail. */
export const CONTENT_MAX = 640;

/**
 * The smallest a tappable control may be, in either direction.
 *
 * 44 is the floor Apple, Android and WCAG 2.5.5 all land on. Several controls here were
 * 36 — the back button, the seat stepper, the filter pills — which is comfortable with a
 * mouse and not with a thumb. Applied as a minimum rather than a fixed size, so a
 * control that is already larger is left alone.
 *
 * One documented exception: the ticket office's hall-map blocks are sized by the bowl's
 * geometry, and WCAG allows it where the presentation is essential. Distorting a stadium
 * map to hit a target size would make it a worse map.
 */
export const TOUCH_MIN = 44;

export function layoutMode(width: number): LayoutMode {
  return width >= WIDE_MIN ? "wide" : "phone";
}

// The hook lives in ./useLayout, not here: importing react-native pulls in its
// Flow-typed source, which the test runner cannot parse — so this module stays
// pure and stays tested.
