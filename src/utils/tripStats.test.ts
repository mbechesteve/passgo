import { describe, expect, it } from "vitest";
import { docProgress, packProgress, budgetTotals } from "@/utils/tripStats";
import type { DocItem, PackItem, BudgetItem } from "@/types";

const docs: DocItem[] = [
  { id: "a", label: "Passport", folder: "core", checked: true },
  { id: "b", label: "Photos", folder: "core", checked: false },
  { id: "c", label: "Insurance", folder: "backup", checked: true },
];
const pack: PackItem[] = [
  { id: "p1", category: "Clothing", name: "Shorts", checked: false },
  { id: "p2", category: "Clothing", name: "Dress", checked: true },
];
const budget: BudgetItem[] = [
  { id: "b1", category: "Flights", estimatedKes: 350000, actualKes: 348433.72 },
  { id: "b2", category: "Hotels", estimatedKes: 80000 },
];

describe("docProgress", () => {
  it("counts checked over total", () => {
    expect(docProgress(docs)).toEqual({ done: 2, total: 3, pct: 2 / 3 });
  });
  it("is empty-safe", () => {
    expect(docProgress(undefined)).toEqual({ done: 0, total: 0, pct: 0 });
  });
});

describe("packProgress", () => {
  it("counts checked over total", () => {
    expect(packProgress(pack)).toEqual({ done: 1, total: 2, pct: 0.5 });
  });
});

describe("budgetTotals", () => {
  it("sums estimated and actual, pct = actual/estimated", () => {
    const t = budgetTotals(budget);
    expect(t.estimated).toBe(430000);
    expect(t.actual).toBeCloseTo(348433.72, 2);
    expect(t.pct).toBeCloseTo(348433.72 / 430000, 5);
  });
  it("is empty-safe", () => {
    expect(budgetTotals(undefined)).toEqual({ estimated: 0, actual: 0, pct: 0 });
  });
});
