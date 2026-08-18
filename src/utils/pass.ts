import type { Pass, PassStatus } from "@/types";
import { daysUntil } from "@/utils/format";

/** Whole days remaining on the Pass. Never negative. */
export function daysLeft(pass: Pass, at: Date): number {
  const d = daysUntil(pass.validUntil, at);
  return d == null || d < 0 ? 0 : d;
}

/** A suspended Pass stays suspended; otherwise the window decides. */
export function passStatus(pass: Pass, at: Date): PassStatus {
  if (pass.status === "suspended") return "suspended";
  const start = new Date(pass.validFrom).getTime();
  const end = new Date(pass.validUntil).getTime() + 86_400_000; // inclusive
  const t = at.getTime();
  return t >= start && t < end ? "active" : "expired";
}

/** The line printed on the card: "Valid · 24 days left". */
export function validityLabel(pass: Pass, at: Date): string {
  const status = passStatus(pass, at);
  if (status === "suspended") return "Suspended";
  if (status === "expired") return "Expired";
  const days = daysLeft(pass, at);
  return `Valid · ${days} ${days === 1 ? "day" : "days"} left`;
}
