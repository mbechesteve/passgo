import type { HostCountry, Pass } from "@/types";
import { TOURNAMENT_START, TOURNAMENT_END } from "@/lib/clock";

/**
 * Pre-filled in the issuance form so a fresh install reproduces the card printed
 * in Figure 1 of the proposal.
 */
export const DEMO_HOLDER_NAME = "Amina Nakato";

/** The number on the card in Figure 1. The first Pass issued gets it. */
const FIRST_SERIAL = 8842;

export interface IssueInput {
  holderName: string;
  issuedIn: HostCountry;
  /** How many Passes have already been issued on this device. */
  sequence: number;
}

/**
 * Self-entered identity is a MOCK standing in for accredited issuance. Section 03
 * says the holder is "verified once, when the Pass is issued" — by an authority,
 * not by the holder. This is a prototype stand-in, labelled as such in the UI.
 */
export function issuePass(input: IssueInput): Pass {
  const id = `${input.issuedIn}-PM-${FIRST_SERIAL + input.sequence}`;
  return {
    id,
    holderName: input.holderName.trim(),
    tier: "fan",
    issuedIn: input.issuedIn,
    validFrom: TOURNAMENT_START,
    validUntil: TOURNAMENT_END,
    shortCode: id,
    status: "active",
  };
}
