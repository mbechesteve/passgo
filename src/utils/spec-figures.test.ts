import { describe, expect, it } from "vitest";

import { DEMO_NOW } from "@/lib/clock";
import { NAMED_PARTNERS, generatePartners } from "@/data/partners";
import { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
import { validityLabel } from "@/utils/pass";
import { countsByCategory } from "@/utils/partners";
import { recordLine, totalSaved } from "@/utils/record";
import { buildRedemption } from "@/utils/redeem";

// The proposal's own figures. These are specifications, not sample data: Figure 1
// prints the card, Figure 3 the network, Figure 4 the record line. Any change that
// moves one of these is a regression, however good it looks.

describe("the network, per Figure 3", () => {
  const partners = generatePartners();

  it("totals 2,189", () => {
    expect(partners.length).toBe(2189);
  });

  it("splits 210 / 84 / 1,340 / 460 / 95", () => {
    expect(countsByCategory(partners)).toEqual({
      stay: 210,
      move: 84,
      eat: 1340,
      shop: 460,
      do: 95,
    });
  });
});

describe("the card, per Figure 1", () => {
  const pass = issuePass({
    holderName: DEMO_HOLDER_NAME,
    issuedIn: "KE",
    sequence: 0,
  });

  it("reads Amina Nakato", () => {
    expect(pass.holderName).toBe("Amina Nakato");
  });

  it("carries serial KE-PM-8842", () => {
    expect(pass.id).toBe("KE-PM-8842");
  });

  it("reads Valid · 24 days left at the demo instant", () => {
    expect(validityLabel(pass, DEMO_NOW)).toBe("Valid · 24 days left");
  });
});

describe("the record line, per Figure 4", () => {
  const pass = issuePass({
    holderName: DEMO_HOLDER_NAME,
    issuedIn: "KE",
    sequence: 0,
  });
  const mamaOliech = NAMED_PARTNERS.find((p) => p.name === "Mama Oliech")!;
  const event = buildRedemption({
    pass,
    partner: mamaOliech,
    gross: 1000,
    channel: "qr",
    at: DEMO_NOW,
    seq: 0,
  });

  it("writes KES 850 · food and drink / Kasarani ward · 12:55", () => {
    expect(recordLine(event)).toEqual({
      primary: "KES 850 · food and drink",
      secondary: "Kasarani ward · 12:55",
    });
  });

  it("saves KES 150", () => {
    expect(totalSaved([event])).toBe(150);
  });
});
