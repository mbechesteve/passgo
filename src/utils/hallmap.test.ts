import { describe, expect, it } from "vitest";

import { HALL_MAPS } from "@/data/hallmaps";
import { MATCHES } from "@/data/matches";
import type { HallMap, StadiumBlock } from "@/types";
import {
  MAX_PER_ORDER,
  blockPrice,
  blockRects,
  clampQty,
  isSoldOut,
  mapForMatch,
  orderTotal,
  tiers,
} from "./hallmap";

const block = (
  id: string,
  stand: StadiumBlock["stand"],
  category: 1 | 2 | 3,
  available = 40
): StadiumBlock => ({ id, label: id, stand, category, gate: "D", available });

const map: HallMap = {
  matchId: "m-test",
  prices: { 1: 3500, 2: 2000, 3: 1000 },
  blocks: [
    block("W1", "W", 1),
    block("W2", "W", 1),
    block("E1", "E", 2),
    block("N1", "N", 3),
    block("S1", "S", 3, 0),
  ],
};

describe("mapForMatch", () => {
  it("finds the map for a fixture that sells tickets here", () => {
    expect(mapForMatch([map], "m-test")).toBe(map);
  });

  it("returns null for a fixture that does not, rather than an empty map", () => {
    expect(mapForMatch([map], "m-other")).toBeNull();
  });
});

describe("prices", () => {
  it("prices a block by its category", () => {
    expect(blockPrice(map, block("W1", "W", 1))).toBe(3500);
    expect(blockPrice(map, block("E1", "E", 2))).toBe(2000);
    expect(blockPrice(map, block("N1", "N", 3))).toBe(1000);
  });

  it("multiplies out an order", () => {
    expect(orderTotal(map, block("E1", "E", 2), 3)).toBe(6000);
  });

  it("totals nothing for no seats", () => {
    expect(orderTotal(map, block("E1", "E", 2), 0)).toBe(0);
  });

  it("lists the tiers cheapest last, each with its price", () => {
    expect(tiers(map)).toEqual([
      { category: 1, price: 3500 },
      { category: 2, price: 2000 },
      { category: 3, price: 1000 },
    ]);
  });
});

describe("availability", () => {
  it("knows a block with nothing left", () => {
    expect(isSoldOut(block("S1", "S", 3, 0))).toBe(true);
    expect(isSoldOut(block("W1", "W", 1, 1))).toBe(false);
  });

  it("never lets an order exceed what the block holds", () => {
    expect(clampQty(10, block("W1", "W", 1, 3))).toBe(3);
  });

  it("caps an order at the per-order limit", () => {
    expect(clampQty(99, block("W1", "W", 1, 500))).toBe(MAX_PER_ORDER);
  });

  it("never goes below one seat", () => {
    expect(clampQty(0, block("W1", "W", 1))).toBe(1);
    expect(clampQty(-4, block("W1", "W", 1))).toBe(1);
  });

  it("gives zero for a sold-out block — one seat would be a lie", () => {
    expect(clampQty(1, block("S1", "S", 3, 0))).toBe(0);
  });
});

describe("blockRects", () => {
  const W = 320;
  const H = 240;
  const rects = blockRects(map.blocks, W, H);

  it("places every block", () => {
    expect(rects.map((r) => r.id).sort()).toEqual(["E1", "N1", "S1", "W1", "W2"]);
  });

  it("keeps every block inside the frame", () => {
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(W);
      expect(r.y + r.h).toBeLessThanOrEqual(H);
      expect(r.w).toBeGreaterThan(0);
      expect(r.h).toBeGreaterThan(0);
    }
  });

  it("lays a stand's blocks along one line — north across, west down", () => {
    const north = rects.filter((r) => r.id.startsWith("N"));
    const west = rects.filter((r) => r.id.startsWith("W"));
    expect(new Set(north.map((r) => r.y)).size).toBe(1);
    expect(new Set(west.map((r) => r.x)).size).toBe(1);
  });

  it("does not overlap two blocks in the same stand", () => {
    const [w1, w2] = rects.filter((r) => r.id.startsWith("W"));
    expect(w1.y + w1.h).toBeLessThanOrEqual(w2.y);
  });

  it("puts north above south, and west left of east", () => {
    const at = (id: string) => rects.find((r) => r.id === id)!;
    expect(at("N1").y).toBeLessThan(at("S1").y);
    expect(at("W1").x).toBeLessThan(at("E1").x);
  });

  it("has nothing to place for no blocks", () => {
    expect(blockRects([], W, H)).toEqual([]);
  });
});

describe("the seeded Talanta map", () => {
  it("belongs to a fixture that exists", () => {
    for (const m of HALL_MAPS) {
      expect(MATCHES.some((f) => f.id === m.matchId)).toBe(true);
    }
  });

  it("is played at Talanta — the venue this office was built for", () => {
    for (const m of HALL_MAPS) {
      const fixture = MATCHES.find((f) => f.id === m.matchId)!;
      expect(fixture.venue).toContain("Talanta");
    }
  });

  it("prices every category its blocks actually use", () => {
    for (const m of HALL_MAPS) {
      for (const b of m.blocks) expect(m.prices[b.category]).toBeGreaterThan(0);
    }
  });

  it("anchors Cat 2 to the ticket face value the app already states", () => {
    // TICKET_SEED's savings row reads "Ticket · Cat 2, was 2000". The office cannot
    // quote a different face price for the same category without contradicting the
    // Pass, so this figure is fixed by that seed rather than chosen here.
    for (const m of HALL_MAPS) expect(m.prices[2]).toBe(2000);
  });

  it("prices Cat 1 above Cat 2 above Cat 3", () => {
    for (const m of HALL_MAPS) {
      expect(m.prices[1]).toBeGreaterThan(m.prices[2]);
      expect(m.prices[2]).toBeGreaterThan(m.prices[3]);
    }
  });
});
