import type { VisaRule } from "@/types";
import { VISA_META } from "@/lib/theme";

/** "Free" or "$50". */
export const usd = (amount: number) =>
  amount === 0 ? "Free" : `$${amount % 1 === 0 ? amount : amount.toFixed(2)}`;

/** Human processing time. */
export const processing = (days: number) => {
  if (days <= 0) return "Instant";
  if (days === 1) return "1 day";
  return `${days} days`;
};

/** Compact badge text, e.g. "e-Visa · 1 day", "VoA $50", "Visa-Free". */
export function visaBadgeText(rule: VisaRule): string {
  const meta = VISA_META[rule.visaType];
  switch (rule.visaType) {
    case "visa_free":
      return meta.short;
    case "visa_on_arrival":
      return `VoA ${usd(rule.costUsd)}`;
    case "evisa":
    case "eta":
      return `${meta.short} · ${processing(rule.processingDays)}`;
    case "visa_required":
      return meta.short;
    default:
      return meta.short;
  }
}

export const budgetLabel: Record<string, string> = {
  budget: "Budget",
  moderate: "Moderate",
  luxury: "Premium",
};

/** A plain-English visa detail line for cards, e.g. "Free · stay up to 90 days". */
export function visaDetailLine(rule: VisaRule): string {
  const cost = rule.costUsd === 0 ? "Free" : usd(rule.costUsd);
  switch (rule.visaType) {
    case "visa_free":
      return `Free entry · stay up to ${rule.stayDays} days`;
    case "visa_on_arrival":
      return `On arrival · ${cost} · stay ${rule.stayDays} days`;
    case "eta":
    case "evisa":
      return `${cost} · approved in ~${processing(rule.processingDays)}`;
    case "visa_required":
      return `Embassy visa · ~${processing(rule.processingDays)}`;
    default:
      return cost;
  }
}

/** Feather icon name matching the visa type. */
export function visaIconName(rule: VisaRule): string {
  switch (rule.visaType) {
    case "visa_free":
      return "check-circle";
    case "visa_on_arrival":
      return "map-pin";
    case "eta":
    case "evisa":
      return "globe";
    case "visa_required":
      return "alert-circle";
    default:
      return "info";
  }
}

/** Great-circle distance in km between two coordinates (Haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const km = (v: number) =>
  v < 1 ? `${Math.round(v * 1000)} m` : `${v.toFixed(v < 10 ? 1 : 0)} km`;
