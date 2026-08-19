import type { HallMap, StadiumBlock } from "@/types";

/** How many seats one order may hold. */
export const MAX_PER_ORDER = 6;

/** The map for a fixture, or null where tickets are not sold through this office. */
export function mapForMatch(maps: HallMap[], matchId: string): HallMap | null {
  return maps.find((m) => m.matchId === matchId) ?? null;
}

/** What one seat in this block costs. */
export function blockPrice(map: HallMap, block: StadiumBlock): number {
  return map.prices[block.category];
}

/** What the order comes to. Pamoja never takes it — see TicketOfficeScreen. */
export function orderTotal(map: HallMap, block: StadiumBlock, qty: number): number {
  return blockPrice(map, block) * qty;
}

/** The categories with their prices, dearest first — the legend's own order. */
export function tiers(map: HallMap): { category: 1 | 2 | 3; price: number }[] {
  return ([1, 2, 3] as const).map((category) => ({
    category,
    price: map.prices[category],
  }));
}

export function isSoldOut(block: StadiumBlock): boolean {
  return block.available <= 0;
}

/**
 * A quantity the block can actually honour: at least one seat, never more than the
 * per-order limit or the block itself holds — and zero for a sold-out block, where
 * offering a single seat would be a lie.
 */
export function clampQty(qty: number, block: StadiumBlock): number {
  if (isSoldOut(block)) return 0;
  return Math.max(1, Math.min(Math.floor(qty), MAX_PER_ORDER, block.available));
}

/** A block's place in the drawn bowl. */
export interface BlockRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const PAD = 6;
const BAND = 40;
const GAP = 4;

/**
 * How far the pitch sits inside the frame — the depth of a stand band plus its gap.
 * Exported so the drawing does not restate the number the layout already knows.
 */
export const BOWL_INSET = PAD + BAND + GAP;

/** Splits a run into `count` slots with `GAP` between them. */
function slots(start: number, end: number, count: number): { at: number; size: number }[] {
  const size = (end - start - GAP * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) => ({
    at: start + i * (size + GAP),
    size,
  }));
}

/**
 * Where each block sits in a schematic bowl: two stands across, two down, the pitch
 * in the middle. Pure, so the arrangement is asserted in tests rather than eyeballed,
 * and the seed carries no coordinates — a block knows its stand, not its pixels.
 */
export function blockRects(
  blocks: StadiumBlock[],
  width: number,
  height: number
): BlockRect[] {
  // The corners belong to the side stands, so the end stands run between them.
  const runStart = PAD + BAND + GAP;
  const acrossEnd = width - PAD - BAND - GAP;
  const downEnd = height - PAD - BAND - GAP;

  const out: BlockRect[] = [];
  for (const stand of ["N", "E", "S", "W"] as const) {
    const inStand = blocks.filter((b) => b.stand === stand);
    if (inStand.length === 0) continue;

    const across = stand === "N" || stand === "S";
    const run = slots(runStart, across ? acrossEnd : downEnd, inStand.length);

    inStand.forEach((block, i) => {
      const { at, size } = run[i];
      out.push(
        across
          ? {
              id: block.id,
              x: at,
              y: stand === "N" ? PAD : height - PAD - BAND,
              w: size,
              h: BAND,
            }
          : {
              id: block.id,
              x: stand === "W" ? PAD : width - PAD - BAND,
              y: at,
              w: BAND,
              h: size,
            }
      );
    });
  }
  return out;
}
