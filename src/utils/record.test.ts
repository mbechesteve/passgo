import { describe, expect, it } from "vitest";
import {
  totalSaved,
  totalSpent,
  hasBorderEvent,
  recordLine,
  groupByDay,
} from "@/utils/record";
import type { PassEvent } from "@/types";

const lunch: PassEvent = {
  id: "e1",
  passId: "KE-PM-8842",
  kind: "purchase",
  at: "2027-06-23T12:55:00+03:00",
  place: { name: "Mama Oliech", ward: "Kasarani ward", city: "Nairobi", country: "KE" },
  channel: "qr",
  partnerId: "p-mama-oliech",
  amount: { currency: "KES", gross: 1000, discount: 150, net: 850 },
};

const bus: PassEvent = {
  id: "e2",
  passId: "KE-PM-8842",
  kind: "transport",
  at: "2027-06-22T14:20:00+03:00",
  place: { name: "Kenya Bus", ward: "Westlands ward", city: "Nairobi", country: "KE" },
  channel: "nfc",
  partnerId: "p-kenya-bus",
  amount: { currency: "KES", gross: 200, discount: 40, net: 160 },
};

const border: PassEvent = {
  id: "e3",
  passId: "KE-PM-8842",
  kind: "border",
  at: "2027-06-22T06:40:00+03:00",
  place: { name: "Malaba", city: "Malaba", country: "KE" },
  channel: "nfc",
};

describe("totalSaved", () => {
  it("sums the discount across the record", () => {
    expect(totalSaved([lunch, bus])).toBe(190);
  });
  it("ignores events with no money", () => {
    expect(totalSaved([lunch, border])).toBe(150);
  });
  it("is 0 for a fresh Pass", () => {
    expect(totalSaved([])).toBe(0);
  });
});

describe("totalSpent", () => {
  it("sums what was actually paid, not the gross", () => {
    expect(totalSpent([lunch, bus])).toBe(1010);
  });
});

describe("hasBorderEvent", () => {
  it("is true once the fan has crossed", () => {
    expect(hasBorderEvent([bus, border])).toBe(true);
  });
  it("is false for a fan who lives here", () => {
    expect(hasBorderEvent([lunch, bus])).toBe(false);
  });
});

describe("recordLine", () => {
  it("renders a purchase exactly as Figure 2 prints it", () => {
    expect(recordLine(lunch)).toEqual({
      primary: "KES 850 · food and drink",
      secondary: "Kasarani ward · 12:55",
    });
  });

  it("renders transport with its own noun", () => {
    expect(recordLine(bus).primary).toBe("KES 160 · transport");
  });

  it("renders a border crossing with no money", () => {
    expect(recordLine(border)).toEqual({
      primary: "Border crossing · Malaba",
      secondary: "Malaba · 06:40",
    });
  });
});

describe("groupByDay", () => {
  it("groups by calendar day, newest day first, newest event first", () => {
    const groups = groupByDay([bus, lunch, border]);
    expect(groups.map((g) => g.day)).toEqual(["2027-06-23", "2027-06-22"]);
    expect(groups[0].events.map((e) => e.id)).toEqual(["e1"]);
    expect(groups[1].events.map((e) => e.id)).toEqual(["e2", "e3"]);
  });

  it("is empty-safe", () => {
    expect(groupByDay([])).toEqual([]);
  });
});
