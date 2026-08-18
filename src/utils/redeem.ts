import type { Channel, Money, Partner, Pass, PassEvent } from "@/types";

/**
 * The discount arithmetic. PAMOJA never holds any of this money — the fan pays
 * the merchant directly by M-Pesa, Airtel Money or card (Rev. 2, Section 05).
 * These figures exist to be recorded, not to be charged.
 */
export function computeMoney(gross: number, discountPct: number): Money {
  const discount = Math.round((gross * discountPct) / 100);
  return { currency: "KES", gross, discount, net: gross - discount };
}

export interface RedemptionInput {
  pass: Pass;
  partner: Partner;
  gross: number;
  channel: Channel;
  at: Date;
  /** Monotonic counter from the record length — keeps ids distinct and stable. */
  seq: number;
}

/**
 * One line, from one use. Identical whether the fan scanned the merchant's code
 * or read her card code across the counter; only `channel` differs.
 */
export function buildRedemption(input: RedemptionInput): PassEvent {
  const { pass, partner, gross, channel, at, seq } = input;
  return {
    id: `${pass.id}-${seq}`,
    passId: pass.id,
    kind: "purchase",
    at: at.toISOString(),
    place: {
      name: partner.name,
      ward: partner.ward,
      city: partner.city,
      country: partner.country,
    },
    channel,
    partnerId: partner.id,
    amount: computeMoney(gross, partner.discountPct),
  };
}
