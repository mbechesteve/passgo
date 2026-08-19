import { describe, expect, it } from "vitest";

import { DEMO_NOW } from "@/lib/clock";
import { NAMED_PARTNERS } from "@/data/partners";
import { issuePass } from "@/utils/issue";
import { groupByDay, recordLine } from "@/utils/record";
import { buildRedemption } from "@/utils/redeem";

// These two modules meet only in ConfirmScreen, so their contract for
// `PassEvent.at` was never exercised end to end. Figure 4 of the proposal is the
// arbiter: 1,000/= at Mama Oliech reads "Kasarani ward · 12:55" in EAT.
const mamaOliech = NAMED_PARTNERS.find((p) => p.name === "Mama Oliech")!;
const pass = issuePass({
  holderName: "Amina Nakato",
  issuedIn: "KE",
  sequence: 0,
});

const redeem = (at: Date) =>
  buildRedemption({
    pass,
    partner: mamaOliech,
    gross: 1000,
    channel: "qr",
    at,
    seq: 0,
  });

describe("a redemption, as the record renders it", () => {
  it("reads the wall-clock time in EAT, not UTC", () => {
    // DEMO_NOW is 12:55 EAT, which is 09:55Z.
    expect(recordLine(redeem(DEMO_NOW)).secondary).toBe(
      "Kasarani ward · 12:55"
    );
  });

  it("writes Figure 4's line in full", () => {
    const line = recordLine(redeem(DEMO_NOW));
    expect(line.primary).toBe("KES 850 · food and drink");
    expect(line.secondary).toBe("Kasarani ward · 12:55");
  });

  it("groups an after-midnight use under its own EAT day", () => {
    // 01:30 EAT on the 24th is still 22:30Z on the 23rd. The Wallet heading
    // must read the day the fan lived, not the day UTC was having.
    const event = redeem(new Date("2027-06-24T01:30:00+03:00"));
    expect(groupByDay([event])[0].day).toBe("2027-06-24");
    expect(recordLine(event).secondary).toBe("Kasarani ward · 01:30");
  });
});
