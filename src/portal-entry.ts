/* The portal's view of the app.

   Everything the logged-in portal pages need, and nothing else — a claim that is
   now true and kept true: scripts/verify-bundle.mjs asserts the built global's own
   key set against the list below, so an export that no page reads fails the build
   rather than sitting here looking authorised. This is a deliberate boundary, not a
   convenience re-export: the portal is a second client, and what it may reach into
   is a decision worth being able to read in one file.

   "Pages" includes scripts/verify-portal.mjs, which computes every figure it expects
   inside the page against this same global rather than writing numbers down.

   Nothing here may import from `src/screens`, `src/components` or `src/navigation` —
   those pull React Native, which does not belong in a browser bundle. */

// The copy. Pages render `strings.S.<key>`; a sentence src/lib/strings.ts already
// holds is never retyped into markup.
export * as strings from "@/lib/strings";
// `now()` is the time seam — the frozen demo clock — and `eatParts` the EAT reader.
// A page calling new Date() would land outside the seeded June 2027 fixtures.
export * as clock from "@/lib/clock";

export { MATCHES } from "@/data/matches";
export { EXPLORE_ITEMS } from "@/data/explore";
export { PARKING_ZONES } from "@/data/parking";
export { NAMED_PARTNERS, generatePartners } from "@/data/partners";

// Read by scripts/verify-portal.mjs, not by a page: the harness mints the serial
// the app would give a device's first Pass and compares signup.html's against it,
// rather than writing KE-PM-8842 into a third place.
export { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
export { passStatus, validityLabel } from "@/utils/pass";
export { CATEGORIES, CATEGORY_LABEL, countsByCategory } from "@/utils/partners";
export { buildRedemption, computeMoney } from "@/utils/redeem";
export { kes } from "@/utils/format";
export { KINDS, KIND_LABEL, describeMethod, tailOf } from "@/utils/payment";
export { recordLine, totalSaved, totalSpent } from "@/utils/record";
export {
  daysUntilLabel,
  gatesOpenLabel,
  kickoffChipLabel,
  kickoffLabel,
  liveMatches,
  matchLabel,
  matchPhase,
  minuteLabel,
  nextMatch,
} from "@/utils/match";

// The three stores the four mutating flows touch. usePartnerStore is not among
// them: no portal page sorts or pins a partner, so it is not exported.
export { usePassStore } from "@/store/usePassStore";
export { useRecordStore } from "@/store/useRecordStore";
export { usePaymentStore } from "@/store/usePaymentStore";
