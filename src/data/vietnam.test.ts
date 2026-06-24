import { describe, expect, it } from "vitest";
import { MOCK_COUNTRIES } from "@/data/mockCountries";
import { MOCK_CITIES } from "@/data/mockCities";
import { MOCK_VISA_RULES } from "@/data/mockVisaRules";

describe("Vietnam reference data", () => {
  it("has a VN country", () => {
    expect(MOCK_COUNTRIES.find((c) => c.code === "VN")?.name).toBe("Vietnam");
  });
  it("has three VN cities", () => {
    expect(MOCK_CITIES.filter((c) => c.countryCode === "VN").map((c) => c.id)).toEqual(
      ["city_hoian", "city_danang", "city_hanoi"]
    );
  });
  it("has a KE→VN e-visa rule", () => {
    const r = MOCK_VISA_RULES.find((v) => v.passportCountry === "KE" && v.destCountry === "VN");
    expect(r?.visaType).toBe("evisa");
  });
});
