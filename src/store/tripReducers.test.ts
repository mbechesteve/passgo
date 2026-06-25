import { describe, expect, it } from "vitest";
import {
  toggleDocItem,
  togglePackItem,
  setBudgetActualItem,
} from "@/store/tripReducers";
import type { Trip } from "@/types";

const base: Trip = {
  id: "t1",
  countryCode: "VN",
  title: "Vietnam",
  items: [],
  createdAt: "2026-06-24T00:00:00.000Z",
  documents: [
    { id: "d1", label: "Passport", folder: "core", checked: true },
    { id: "d2", label: "Photos", folder: "core", checked: false },
  ],
  packing: [{ id: "p1", category: "Clothing", name: "Shorts", checked: false }],
  shopping: [{ id: "s1", category: "Gifts", name: "Coffee", checked: false }],
  budget: [{ id: "b1", category: "Flights", estimatedKes: 350000 }],
};

describe("toggleDocItem", () => {
  it("flips the targeted doc and leaves others alone", () => {
    const next = toggleDocItem(base, "d2");
    expect(next.documents?.find((d) => d.id === "d2")?.checked).toBe(true);
    expect(next.documents?.find((d) => d.id === "d1")?.checked).toBe(true);
    expect(next).not.toBe(base); // immutable
  });
});

describe("togglePackItem", () => {
  it("flips a packing item", () => {
    expect(togglePackItem(base, "packing", "p1").packing?.[0].checked).toBe(true);
  });
  it("flips a shopping item", () => {
    expect(togglePackItem(base, "shopping", "s1").shopping?.[0].checked).toBe(true);
  });
});

describe("setBudgetActualItem", () => {
  it("sets an actual amount", () => {
    expect(setBudgetActualItem(base, "b1", 348434).budget?.[0].actualKes).toBe(348434);
  });
  it("clears with undefined", () => {
    const withVal = setBudgetActualItem(base, "b1", 100);
    expect(setBudgetActualItem(withVal, "b1", undefined).budget?.[0].actualKes).toBeUndefined();
  });
});
