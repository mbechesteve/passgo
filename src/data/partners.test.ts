import { describe, expect, it } from "vitest";
import { generatePartners, PARTNER_TARGETS, NAMED_PARTNERS } from "@/data/partners";
import { countsByCategory } from "@/utils/partners";

const partners = generatePartners();

describe("the partner seed", () => {
  it("totals exactly 2,189 — the figure printed in Figure 3", () => {
    expect(partners.length).toBe(2189);
  });

  it("matches the proposal's per-category counts exactly", () => {
    expect(countsByCategory(partners)).toEqual({
      stay: 210,
      move: 84,
      eat: 1340,
      shop: 460,
      do: 95,
    });
  });

  it("targets sum to the total", () => {
    const sum = Object.values(PARTNER_TARGETS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(2189);
  });

  it("includes the businesses the proposal names, at their stated discounts", () => {
    const byName = new Map(partners.map((p) => [p.name, p]));
    expect(byName.get("Mama Oliech")?.discountPct).toBe(15);
    expect(byName.get("Java House")?.discountPct).toBe(10);
    expect(byName.get("Kenya Bus")?.discountPct).toBe(20);
  });

  it("puts Mama Oliech in Kasarani ward, where Figure 2's lunch happens", () => {
    const mo = partners.find((p) => p.name === "Mama Oliech");
    expect(mo?.ward).toBe("Kasarani ward");
    expect(mo?.category).toBe("eat");
  });

  it("keeps every named partner in the generated set", () => {
    for (const named of NAMED_PARTNERS) {
      expect(partners.some((p) => p.id === named.id)).toBe(true);
    }
  });

  it("gives every partner a unique id and a unique short code", () => {
    expect(new Set(partners.map((p) => p.id)).size).toBe(2189);
    expect(new Set(partners.map((p) => p.shortCode)).size).toBe(2189);
  });

  it("gives every partner a distinct name — no two listings collide", () => {
    expect(new Set(partners.map((p) => p.name)).size).toBe(2189);
  });

  it("spreads the network widely across Nairobi's wards", () => {
    // Mixed radix reaches 18 of the 20 wards; assert the spread, not the exact
    // number, so tuning the name pools does not break the test.
    expect(new Set(partners.map((p) => p.ward)).size).toBeGreaterThanOrEqual(15);
  });

  it("is deterministic — two calls produce the same network", () => {
    expect(generatePartners()).toEqual(partners);
  });

  it("seeds Kenya only, per Decision 5", () => {
    expect(partners.every((p) => p.country === "KE")).toBe(true);
  });
});
