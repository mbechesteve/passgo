import { describe, expect, it } from "vitest";
import { forCountry } from "@/utils/entitlements";
import { ENTITLEMENTS } from "@/data/entitlements";

describe("forCountry", () => {
  it("returns everything valid in Kenya", () => {
    expect(forCountry(ENTITLEMENTS, "KE").length).toBeGreaterThan(0);
  });

  it("only returns entitlements listing that country", () => {
    for (const e of forCountry(ENTITLEMENTS, "UG")) {
      expect(e.countries).toContain("UG");
    }
  });

  it("covers all four entitlement kinds in Kenya", () => {
    const kinds = new Set(forCountry(ENTITLEMENTS, "KE").map((e) => e.kind));
    expect(kinds).toEqual(
      new Set(["match-access", "transport-fare", "discount", "priority-service"])
    );
  });

  it("grants match access in all three host countries", () => {
    const access = ENTITLEMENTS.find((e) => e.kind === "match-access");
    expect(access?.countries).toEqual(["KE", "UG", "TZ"]);
  });
});
