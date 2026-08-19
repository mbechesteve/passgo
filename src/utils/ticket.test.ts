import { describe, expect, it } from "vitest";

import { DEMO_NOW } from "@/lib/clock";
import { MATCHES } from "@/data/matches";
import { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
import { nextMatch } from "@/utils/match";
import { issueTicket, ticketReference, ticketSaved } from "@/utils/ticket";

const pass = issuePass({
  holderName: DEMO_HOLDER_NAME,
  issuedIn: "KE",
  sequence: 0,
});
const match = nextMatch(MATCHES, DEMO_NOW)!;

describe("ticketReference", () => {
  it("is derived from the crests, the match date and the Pass serial", () => {
    // The drawing prints "KEN-MLI · 2604-8871". 2604 reads as 26 April, which cannot
    // be a June fixture, and 8871 is not this Pass's serial — both are placeholder.
    // Deriving gives a reference that is always true of the pass and the match.
    expect(ticketReference(pass, match)).toBe("KEN-MLI · 2606-8842");
  });

  it("changes with the fixture", () => {
    const later = MATCHES.find((m) => m.id === "m-sen-egy")!;
    expect(ticketReference(pass, later)).toBe("SEN-EGY · 1007-8842");
  });
});

describe("issueTicket", () => {
  it("ties the ticket to the Pass and the match", () => {
    const ticket = issueTicket(pass, match);
    expect(ticket.passId).toBe("KE-PM-8842");
    expect(ticket.matchId).toBe("m-ken-mli");
    expect(ticket.id).toBe("KE-PM-8842-m-ken-mli");
  });

  it("seats the holder as Figure 3 prints it", () => {
    const ticket = issueTicket(pass, match);
    expect(ticket.category).toBe(2);
    expect(ticket.gate).toBe("D");
    expect(ticket.section).toBe("214");
    expect(ticket.seat).toBe("17");
  });
});

describe("ticketSaved", () => {
  it("sums the line items, counting a free item as its full former price", () => {
    // The drawing's own rows are 2,000 → 1,500 and 600 → Free, which is 1,100 —
    // not the 950 printed beside them. The total is derived from the rows.
    expect(ticketSaved(issueTicket(pass, match))).toBe(1100);
  });
});
