import { describe, expect, it } from "vitest";
import {
  countsByCategory,
  byCategory,
  findByShortCode,
  nearby,
  CATEGORY_LABEL,
} from "@/utils/partners";
import type { Partner } from "@/types";

const make = (
  id: string,
  category: Partner["category"],
  lat: number,
  shortCode: string
): Partner => ({
  id, name: id, category, discountPct: 10, shortCode,
  ward: "Kasarani ward", city: "Nairobi", country: "KE",
  coords: { lat, lng: 36.88 },
});

const list: Partner[] = [
  make("a", "eat", -1.22, "ET-0001"),
  make("b", "eat", -1.40, "ET-0002"),
  make("c", "stay", -1.23, "ST-0001"),
];

describe("countsByCategory", () => {
  it("counts each category and reports zero for empty ones", () => {
    expect(countsByCategory(list)).toEqual({
      stay: 1, move: 0, eat: 2, shop: 0, do: 0,
    });
  });
  it("is empty-safe", () => {
    expect(countsByCategory([])).toEqual({
      stay: 0, move: 0, eat: 0, shop: 0, do: 0,
    });
  });
});

describe("byCategory", () => {
  it("filters to one category", () => {
    expect(byCategory(list, "eat").map((p) => p.id)).toEqual(["a", "b"]);
  });
});

describe("findByShortCode", () => {
  it("finds a merchant by the code on their counter", () => {
    expect(findByShortCode(list, "ST-0001")?.id).toBe("c");
  });
  it("is case-insensitive, since the code gets typed by hand", () => {
    expect(findByShortCode(list, "st-0001")?.id).toBe("c");
  });
  it("returns undefined for an unknown code", () => {
    expect(findByShortCode(list, "XX-9999")).toBeUndefined();
  });
});

describe("nearby", () => {
  it("orders by distance from the fan and honours the limit", () => {
    const origin = { lat: -1.2266, lng: 36.8899 };
    // From this origin: c ≈ 1.16 km, a ≈ 1.32 km, b ≈ 19.3 km.
    // b is excluded by the limit; c before a proves the sort.
    expect(nearby(list, origin, 2).map((p) => p.id)).toEqual(["c", "a"]);
  });
});

describe("CATEGORY_LABEL", () => {
  it("uses the five labels from Figure 3", () => {
    expect(CATEGORY_LABEL).toEqual({
      stay: "Stay", move: "Move", eat: "Eat", shop: "Shop", do: "Do",
    });
  });
});
