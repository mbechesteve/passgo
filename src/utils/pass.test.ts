import { describe, expect, it } from "vitest";
import { daysLeft, passStatus, validityLabel } from "@/utils/pass";
import { DEMO_NOW } from "@/lib/clock";
import type { Pass } from "@/types";

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

describe("daysLeft", () => {
  it("is 24 at the demo clock — the figure printed in Figure 3", () => {
    expect(daysLeft(pass, DEMO_NOW)).toBe(24);
  });

  it("is 0 on the final day", () => {
    expect(daysLeft(pass, new Date("2027-07-17T09:00:00Z"))).toBe(0);
  });

  it("never goes below 0 once expired", () => {
    expect(daysLeft(pass, new Date("2027-08-01T09:00:00Z"))).toBe(0);
  });
});

describe("passStatus", () => {
  it("is active inside the window", () => {
    expect(passStatus(pass, DEMO_NOW)).toBe("active");
  });

  it("is expired after the window", () => {
    expect(passStatus(pass, new Date("2027-08-01T09:00:00Z"))).toBe("expired");
  });

  it("respects a suspended pass regardless of dates", () => {
    expect(passStatus({ ...pass, status: "suspended" }, DEMO_NOW)).toBe("suspended");
  });
});

describe("validityLabel", () => {
  it("reads exactly as the card does", () => {
    expect(validityLabel(pass, DEMO_NOW)).toBe("Valid · 24 days left");
  });

  it("singularises the last day", () => {
    expect(validityLabel(pass, new Date("2027-07-16T09:00:00Z"))).toBe(
      "Valid · 1 day left"
    );
  });

  it("says so when the pass is spent", () => {
    expect(validityLabel(pass, new Date("2027-08-01T09:00:00Z"))).toBe("Expired");
  });

  it("says so when the pass is suspended", () => {
    expect(validityLabel({ ...pass, status: "suspended" }, DEMO_NOW)).toBe(
      "Suspended"
    );
  });
});
