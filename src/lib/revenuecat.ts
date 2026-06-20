// ── RevenueCat placeholder ────────────────────────────────────────────────────
// Swap this module's body for the real `react-native-purchases` SDK when ready:
//
//   import Purchases from "react-native-purchases";
//   Purchases.configure({ apiKey });
//   const offerings = await Purchases.getOfferings();
//   const { customerInfo } = await Purchases.purchasePackage(pkg);
//   return customerInfo.entitlements.active["premium"] != null;
//
// For now it returns a static offering and simulates a successful purchase so
// the full paywall → unlock flow is demoable end-to-end.

export interface SubscriptionPackage {
  id: string;
  title: string;
  price: string;
  period: string;
  perMonth?: string;
  badge?: string;
  popular?: boolean;
}

export const PREMIUM_BENEFITS: { emoji: string; title: string; blurb: string }[] = [
  {
    emoji: "📋",
    title: "Full visa requirements",
    blurb: "Exact cost, processing time, max stay and official links.",
  },
  {
    emoji: "✅",
    title: "Prep checklists",
    blurb: "Documents, vaccinations, currency, SIM and safety per country.",
  },
  {
    emoji: "📥",
    title: "Offline maps",
    blurb: "Download routes and city maps to use without data.",
  },
  {
    emoji: "📄",
    title: "Export itinerary PDF",
    blurb: "Share a polished day-by-day plan with your travel companions.",
  },
  {
    emoji: "♾️",
    title: "Unlimited trips",
    blurb: "Plan as many destinations as you like, ad-free.",
  },
];

export const OFFERINGS: SubscriptionPackage[] = [
  {
    id: "annual",
    title: "Annual",
    price: "$39.99",
    period: "/year",
    perMonth: "$3.33/mo",
    badge: "Best value · Save 33%",
    popular: true,
  },
  {
    id: "monthly",
    title: "Monthly",
    price: "$4.99",
    period: "/month",
  },
];

/** Simulated purchase. Resolves true (entitlement granted) after a short delay. */
export async function purchasePackage(pkgId: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 900));
  return !!pkgId;
}

/** Simulated restore. */
export async function restorePurchases(): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 700));
  return false;
}
