/* The portal's view of the app.

   Everything the logged-in portal pages need, and nothing else. This is a deliberate
   boundary, not a convenience re-export: the portal is a second client, and what it
   may reach into is a decision worth being able to read in one file.

   Nothing here may import from `src/screens`, `src/components` or `src/navigation` —
   those pull React Native, which does not belong in a browser bundle. */

export * as strings from "@/lib/strings";
export * as clock from "@/lib/clock";

export { MATCHES } from "@/data/matches";
export { MATCH_LIVE } from "@/data/live";
export { ENTITLEMENTS } from "@/data/entitlements";
export { EXPLORE_ITEMS } from "@/data/explore";
export { PARKING_ZONES } from "@/data/parking";
export { TICKET_SEED } from "@/data/ticket";
export { NAMED_PARTNERS, PARTNER_TARGETS, generatePartners } from "@/data/partners";

export { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
export { daysLeft, passStatus, validityLabel } from "@/utils/pass";
export {
  CATEGORIES,
  CATEGORY_LABEL,
  byCategory,
  countsByCategory,
  findByShortCode,
  nearby,
} from "@/utils/partners";
export { buildRedemption, computeMoney } from "@/utils/redeem";
export {
  groupByDay,
  hasBorderEvent,
  offersUsed,
  recordLine,
  savingsRate,
  totalSaved,
  totalSpent,
  weekSavings,
} from "@/utils/record";
export {
  daysUntilLabel,
  gatesOpenLabel,
  kickoffChipLabel,
  kickoffLabel,
  liveMatches,
  liveMinute,
  matchLabel,
  matchPhase,
  minuteLabel,
  nextMatch,
  teamFlag,
} from "@/utils/match";
export { homeVariant } from "@/utils/home";

export { usePassStore } from "@/store/usePassStore";
export { useRecordStore } from "@/store/useRecordStore";
export { usePaymentStore } from "@/store/usePaymentStore";
export { usePartnerStore } from "@/store/usePartnerStore";
