import { describe, expect, it } from "vitest";
import { issuePass, DEMO_HOLDER_NAME } from "@/utils/issue";
import { TOURNAMENT_START, TOURNAMENT_END } from "@/lib/clock";

describe("issuePass", () => {
  it("assigns KE-PM-8842 to the first Kenya-issued Pass, as printed in Figure 1", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.id).toBe("KE-PM-8842");
  });

  it("uses the id as the short code read across a counter", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.shortCode).toBe("KE-PM-8842");
  });

  it("issues for the whole tournament window", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.validFrom).toBe(TOURNAMENT_START);
    expect(p.validUntil).toBe(TOURNAMENT_END);
    expect(p.status).toBe("active");
  });

  it("issues fans by default", () => {
    const p = issuePass({ holderName: "Amina Nakato", issuedIn: "KE", sequence: 0 });
    expect(p.tier).toBe("fan");
  });

  it("moves on to a new number for later passes", () => {
    const p = issuePass({ holderName: "Otieno Were", issuedIn: "KE", sequence: 1 });
    expect(p.id).toBe("KE-PM-8843");
  });

  it("prefixes with the issuing country", () => {
    const p = issuePass({ holderName: "Grace Mushi", issuedIn: "TZ", sequence: 0 });
    expect(p.id).toBe("TZ-PM-8842");
  });

  it("keeps the holder's name as given", () => {
    const p = issuePass({ holderName: "  Amina Nakato ", issuedIn: "KE", sequence: 0 });
    expect(p.holderName).toBe("Amina Nakato");
  });

  it("offers Amina as the pre-filled demo identity", () => {
    expect(DEMO_HOLDER_NAME).toBe("Amina Nakato");
  });
});
