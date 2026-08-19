import { describe, expect, it } from "vitest";

import {
  SHOULDER_BAND,
  SUMMIT,
  peakGlyphPath,
  peakMaskPath,
  summitVertices,
} from "./peaks";

/** Every number in a path string, in order. */
const nums = (path: string) =>
  (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

describe("SUMMIT", () => {
  it("runs west to east: Nelion, the Gate of the Mists, then Batian", () => {
    expect(SUMMIT.map((p) => p.x)).toEqual([...SUMMIT.map((p) => p.x)].sort((a, b) => a - b));
  });

  it("puts Batian highest, as it is the higher of the two summits", () => {
    const [nelion, col, batian] = SUMMIT;
    expect(batian.y).toBeLessThan(nelion.y);
    expect(col.y).toBeGreaterThan(nelion.y);
    expect(col.y).toBeGreaterThan(batian.y);
  });

  it("keeps the whole summit inside its band", () => {
    for (const p of SUMMIT) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThan(1);
    }
  });

  it("splits the crown narrowly — one mountain, not two hills", () => {
    const [nelion, , batian] = SUMMIT;
    expect(batian.x - nelion.x).toBeLessThan(0.2);
  });
});

describe("summitVertices", () => {
  it("scales x with width and y with the shoulder line", () => {
    const a = summitVertices(100, 50);
    const b = summitVertices(200, 100);
    for (let i = 0; i < a.length; i++) {
      expect(b[i].x).toBeCloseTo(a[i].x * 2);
      expect(b[i].y).toBeCloseTo(a[i].y * 2);
    }
  });

  it("holds every vertex strictly above the shoulder line", () => {
    for (const v of summitVertices(320, 80)) expect(v.y).toBeLessThan(80);
  });

  it("keeps the col strictly below both apexes", () => {
    const [nelion, col, batian] = summitVertices(320, 80);
    expect(col.y).toBeGreaterThan(nelion.y);
    expect(col.y).toBeGreaterThan(batian.y);
  });
});

describe("peakMaskPath", () => {
  const W = 320;
  const H = 200;
  const path = peakMaskPath(W, H);

  it("opens at the left shoulder and closes the region", () => {
    const [x0, y0] = nums(path);
    expect(x0).toBe(0);
    expect(y0).toBeCloseTo(SHOULDER_BAND * H);
    expect(path.startsWith("M 0,")).toBe(true);
    expect(path.trimEnd().endsWith("Z")).toBe(true);
  });

  it("stays inside the frame at every coordinate", () => {
    const n = nums(path);
    for (let i = 0; i < n.length; i += 2) {
      expect(n[i]).toBeGreaterThanOrEqual(0);
      expect(n[i]).toBeLessThanOrEqual(W);
      expect(n[i + 1]).toBeGreaterThanOrEqual(0);
      expect(n[i + 1]).toBeLessThanOrEqual(H);
    }
  });

  it("rounds only the base corners — the summit keeps its edges", () => {
    const summitSegment = path.slice(0, path.indexOf(`${W},`));
    expect(summitSegment).not.toContain("Q");
    expect(path).toContain("Q");
  });

  // Proportionality is exact in the vertices (asserted above); here it is checked
  // on the printed path, which rounds to two decimals — so doubling the frame can
  // move a printed coordinate by at most one rounding step off exactly double.
  it("scales every vertex proportionally", () => {
    const small = nums(peakMaskPath(100, 100, 0));
    const large = nums(peakMaskPath(200, 200, 0));
    expect(small.length).toBe(large.length);
    for (let i = 0; i < small.length; i++) {
      expect(Math.abs(large[i] - small[i] * 2)).toBeLessThanOrEqual(0.02);
    }
  });

  it("clamps a radius larger than the frame instead of inverting it", () => {
    const path = peakMaskPath(40, 40, 500);
    for (const v of nums(path)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(40);
    }
  });
});

describe("peakGlyphPath", () => {
  const path = peakGlyphPath(22, 22);

  it("is an open stroke from base corner to base corner", () => {
    expect(path.startsWith("M 0,22")).toBe(true);
    expect(path.trimEnd().endsWith("22,22")).toBe(true);
    expect(path).not.toContain("Z");
    expect(path).not.toContain("Q");
  });

  it("uses the full height, so the summit reads at icon size", () => {
    const ys = nums(path).filter((_, i) => i % 2 === 1);
    expect(Math.min(...ys)).toBe(0);
    expect(Math.max(...ys)).toBe(22);
  });

  it("draws the same crown as the mask", () => {
    const glyph = summitVertices(22, 22);
    const [nelion, col, batian] = glyph;
    expect(batian.y).toBeLessThan(nelion.y);
    expect(col.y).toBeGreaterThan(batian.y);
  });
});
