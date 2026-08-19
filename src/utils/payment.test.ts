import { describe, expect, it } from "vitest";

import type { PaymentMethod } from "@/types";
import {
  KINDS,
  addMethod,
  defaultMethod,
  describeMethod,
  makeMethod,
  removeMethod,
  setDefault,
  tailOf,
} from "./payment";

const mpesa = () => makeMethod("mpesa", "0712345789", 1);
const card = () => makeMethod("card", "4111 1111 1111 4921", 2);

describe("tailOf", () => {
  it("keeps only the last digits", () => {
    expect(tailOf("0712345789", 3)).toBe("789");
    expect(tailOf("4111 1111 1111 4921", 4)).toBe("4921");
  });

  it("ignores spaces, dashes and country prefixes", () => {
    expect(tailOf("+254 712-345-789", 3)).toBe("789");
  });

  it("gives back what it has when the input is shorter than asked for", () => {
    expect(tailOf("42", 4)).toBe("42");
  });

  it("returns nothing for input with no digits at all", () => {
    expect(tailOf("no digits here", 4)).toBe("");
  });
});

describe("makeMethod", () => {
  it("stores only the tail — never the number it was given", () => {
    // This is the whole point. Rev. 2 §05: Pamoja never sees a card number, so the
    // full input must not survive the constructor, in any field.
    const raw = "4111 1111 1111 4921";
    const m = card();
    const serialised = JSON.stringify(m);
    expect(serialised).not.toContain("4111");
    expect(serialised).not.toContain(raw.replace(/\s/g, ""));
    expect(m.tail).toBe("4921");
  });

  it("takes three digits for mobile money and four for a card", () => {
    expect(mpesa().tail).toBe("789");
    expect(card().tail).toBe("4921");
  });

  it("knows every kind the app already claims to accept", () => {
    // confirmPaySuffix says "by M-Pesa, Airtel Money or card" — the kinds must match
    // the promise the redemption screen already prints.
    expect(KINDS).toEqual(["mpesa", "airtel", "card"]);
  });
});

describe("describeMethod", () => {
  it("reads as a fan would say it", () => {
    expect(describeMethod(mpesa())).toBe("M-Pesa · •••789");
    expect(describeMethod(card())).toBe("Card · •••• 4921");
  });

  it("names Airtel Money in full, as the redemption screen does", () => {
    expect(describeMethod(makeMethod("airtel", "0733000456", 1))).toBe(
      "Airtel Money · •••456"
    );
  });
});

describe("the list", () => {
  it("makes the first method added the default — a fan should not have to choose", () => {
    const list = addMethod([], mpesa());
    expect(list[0].isDefault).toBe(true);
  });

  it("does not demote the existing default when another is added", () => {
    const list = addMethod(addMethod([], mpesa()), card());
    expect(list[0].isDefault).toBe(true);
    expect(list[1].isDefault).toBe(false);
  });

  it("keeps exactly one default when one is chosen", () => {
    const list = setDefault(addMethod(addMethod([], mpesa()), card()), card().id);
    expect(list.filter((m) => m.isDefault)).toHaveLength(1);
    expect(defaultMethod(list)?.id).toBe(card().id);
  });

  it("promotes a survivor when the default is removed, rather than leaving none", () => {
    const list = removeMethod(addMethod(addMethod([], mpesa()), card()), mpesa().id);
    expect(list).toHaveLength(1);
    expect(defaultMethod(list)?.id).toBe(card().id);
  });

  it("has no default when there are no methods", () => {
    expect(defaultMethod([])).toBeNull();
    expect(defaultMethod(removeMethod(addMethod([], mpesa()), mpesa().id))).toBeNull();
  });

  it("falls back to the first method if none is flagged", () => {
    const orphaned: PaymentMethod[] = [{ ...mpesa(), isDefault: false }];
    expect(defaultMethod(orphaned)?.id).toBe(mpesa().id);
  });
});
