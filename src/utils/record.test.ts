import { describe, expect, it } from "vitest";
import {
  totalSaved,
  totalSpent,
  hasBorderEvent,
  recordLine,
  groupByDay,
  offersUsed,
  savingsRate,
  savingsSeries,
  weekSavings,
} from "@/utils/record";
import type { PassEvent } from "@/types";
import { DEMO_NOW } from "@/lib/clock";

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

/** A purchase on a given EAT day, saving `discount` off `gross`. */
function purchase(day: string, gross: number, discount: number, seq: number): PassEvent {
  return {
    id: `e-${seq}`,
    passId: "KE-PM-8842",
    kind: "purchase",
    at: new Date(`${day}T12:55:00+03:00`).toISOString(),
    place: { name: "Mama Oliech", ward: "Kasarani ward", city: "Nairobi", country: "KE" },
    channel: "qr",
    amount: { currency: "KES", gross, discount, net: gross - discount },
  };
}

describe("weekSavings", () => {
  it("counts the trailing seven days, today included", () => {
    const events = [
      purchase("2027-06-23", 1000, 150, 1), // today
      purchase("2027-06-19", 400, 60, 2),   // 4 days back
      purchase("2027-06-10", 900, 200, 3),  // outside the window
    ];
    expect(weekSavings(events, DEMO_NOW)).toBe(210);
  });

  it("is zero on an empty record", () => {
    expect(weekSavings([], DEMO_NOW)).toBe(0);
  });

  it("includes a purchase exactly 6 days back", () => {
    expect(weekSavings([purchase("2027-06-17", 500, 70, 4)], DEMO_NOW)).toBe(70);
  });

  it("excludes a purchase exactly 7 days back", () => {
    expect(weekSavings([purchase("2027-06-16", 500, 70, 5)], DEMO_NOW)).toBe(0);
  });
});

describe("savingsRate", () => {
  it("is saved over gross — 150 off 1,000 is 0.15", () => {
    expect(savingsRate([purchase("2027-06-23", 1000, 150, 1)])).toBeCloseTo(0.15);
  });

  it("is zero on an empty record rather than NaN", () => {
    expect(savingsRate([])).toBe(0);
  });
});

describe("offersUsed", () => {
  it("counts purchases only, not border or turnstile lines", () => {
    const events: PassEvent[] = [
      purchase("2027-06-23", 1000, 150, 1),
      purchase("2027-06-22", 500, 50, 2),
      {
        id: "e-b", passId: "KE-PM-8842", kind: "border",
        at: new Date("2027-06-21T08:00:00+03:00").toISOString(),
        place: { name: "Malaba", city: "Malaba", country: "KE" }, channel: "nfc",
      },
    ];
    expect(offersUsed(events)).toBe(2);
  });
});

describe("savingsSeries", () => {
  it("returns one bucket per day, oldest first", () => {
    const series = savingsSeries([purchase("2027-06-23", 1000, 150, 1)], DEMO_NOW, 7);
    expect(series).toHaveLength(7);
    expect(series[6]).toBe(150); // today is the last bucket
    expect(series.slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("buckets by EAT day, not UTC day", () => {
    // 01:30 EAT on the 23rd is 22:30Z on the 22nd. It belongs to the 23rd.
    const late: PassEvent = {
      ...purchase("2027-06-23", 200, 20, 9),
      at: new Date("2027-06-23T01:30:00+03:00").toISOString(),
    };
    expect(savingsSeries([late], DEMO_NOW, 7)[6]).toBe(20);
  });

  it("places a purchase exactly 6 days back in the oldest in-window bucket", () => {
    const series = savingsSeries([purchase("2027-06-17", 500, 70, 6)], DEMO_NOW, 7);
    expect(series[0]).toBe(70);
    expect(series.slice(1)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("excludes a purchase exactly 7 days back from every bucket", () => {
    const series = savingsSeries([purchase("2027-06-16", 500, 70, 7)], DEMO_NOW, 7);
    expect(series).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
