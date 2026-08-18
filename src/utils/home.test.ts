import { describe, expect, it } from "vitest";
import { homeVariant } from "@/utils/home";
import type { PassEvent } from "@/types";

const purchase: PassEvent = {
  id: "e1", passId: "KE-PM-8842", kind: "purchase",
  at: "2027-06-23T12:55:00+03:00",
  place: { name: "Mama Oliech", ward: "Kasarani ward", city: "Nairobi", country: "KE" },
  channel: "qr",
  amount: { currency: "KES", gross: 1000, discount: 150, net: 850 },
};

const border: PassEvent = {
  id: "e2", passId: "KE-PM-8842", kind: "border",
  at: "2027-06-22T06:40:00+03:00",
  place: { name: "Malaba", city: "Malaba", country: "KE" },
  channel: "nfc",
};

describe("homeVariant", () => {
  it("treats a fan with no crossing as living here", () => {
    expect(homeVariant([purchase])).toBe("resident");
  });

  it("treats a fan who crossed a border as having flown in", () => {
    expect(homeVariant([purchase, border])).toBe("arrived");
  });

  it("defaults a fresh Pass to resident", () => {
    expect(homeVariant([])).toBe("resident");
  });
});
