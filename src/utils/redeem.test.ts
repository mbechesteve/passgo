import { describe, expect, it } from "vitest";
import { computeMoney, buildRedemption } from "@/utils/redeem";
import { DEMO_NOW } from "@/lib/clock";
import type { Partner, Pass } from "@/types";

const pass: Pass = {
  id: "KE-PM-8842",
  holderName: "Amina Nakato",
  tier: "fan",
  issuedIn: "KE",
  validFrom: "2027-06-19",
  validUntil: "2027-07-17",
  shortCode: "KE-PM-8842",
  status: "active",
};

const mamaOliech: Partner = {
  id: "p-mama-oliech",
  name: "Mama Oliech",
  category: "eat",
  discountPct: 15,
  shortCode: "MO-001",
  ward: "Kasarani ward",
  city: "Nairobi",
  country: "KE",
  coords: { lat: -1.2266, lng: 36.8899 },
};

describe("computeMoney", () => {
  it("reproduces Section 06's worked example exactly", () => {
    expect(computeMoney(1000, 15)).toEqual({
      currency: "KES",
      gross: 1000,
      discount: 150,
      net: 850,
    });
  });

  it("rounds the discount to whole shillings", () => {
    expect(computeMoney(333, 15)).toEqual({
      currency: "KES",
      gross: 333,
      discount: 50,
      net: 283,
    });
  });

  it("handles a zero discount", () => {
    expect(computeMoney(500, 0)).toEqual({
      currency: "KES",
      gross: 500,
      discount: 0,
      net: 500,
    });
  });
});

describe("buildRedemption", () => {
  const base = {
    pass,
    partner: mamaOliech,
    gross: 1000,
    at: DEMO_NOW,
    seq: 1,
  };

  it("writes the line Figure 2 prints", () => {
    const e = buildRedemption({ ...base, channel: "qr" });
    expect(e.kind).toBe("purchase");
    expect(e.passId).toBe("KE-PM-8842");
    expect(e.partnerId).toBe("p-mama-oliech");
    expect(e.amount).toEqual({
      currency: "KES",
      gross: 1000,
      discount: 150,
      net: 850,
    });
    expect(e.place).toEqual({
      name: "Mama Oliech",
      ward: "Kasarani ward",
      city: "Nairobi",
      country: "KE",
    });
  });

  it("stamps the time from the clock it is given", () => {
    const e = buildRedemption({ ...base, channel: "qr" });
    expect(e.at).toBe(DEMO_NOW.toISOString());
  });

  it("produces an identical line whether scanned or read aloud", () => {
    const scanned = buildRedemption({ ...base, channel: "qr" });
    const spoken = buildRedemption({ ...base, channel: "shortcode" });
    const { channel: c1, ...restScanned } = scanned;
    const { channel: c2, ...restSpoken } = spoken;
    expect(restScanned).toEqual(restSpoken);
    expect(c1).toBe("qr");
    expect(c2).toBe("shortcode");
  });

  it("gives each redemption a distinct id", () => {
    const a = buildRedemption({ ...base, channel: "qr", seq: 1 });
    const b = buildRedemption({ ...base, channel: "qr", seq: 2 });
    expect(a.id).not.toBe(b.id);
  });
});
