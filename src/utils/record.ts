import { eatParts } from "@/lib/clock";
import type { EventKind, PassEvent } from "@/types";
import { kes } from "@/utils/format";

/** The noun each kind of use goes by in the record, per Figure 2. */
const NOUN: Record<EventKind, string> = {
  purchase: "food and drink",
  transport: "transport",
  turnstile: "stadium entry",
  "fan-zone": "fan zone entry",
  border: "border crossing",
};

export function totalSaved(events: PassEvent[]): number {
  return events.reduce((sum, e) => sum + (e.amount?.discount ?? 0), 0);
}

export function totalSpent(events: PassEvent[]): number {
  return events.reduce((sum, e) => sum + (e.amount?.net ?? 0), 0);
}

/** Has this fan crossed a border? Decides which cards lead the Home screen. */
export function hasBorderEvent(events: PassEvent[]): boolean {
  return events.some((e) => e.kind === "border");
}

/** "12:55" — the wall-clock time in EAT, the zone all three host countries keep. */
function timeOf(iso: string): string {
  return eatParts(iso).time;
}

/** "2027-06-23" — the EAT day, so a use after midnight is filed as the fan lived it. */
function dayOf(iso: string): string {
  return eatParts(iso).day;
}

/** One line of the record, in the proposal's own format. */
export function recordLine(e: PassEvent): { primary: string; secondary: string } {
  const primary = e.amount
    ? `${kes(e.amount.net)} · ${NOUN[e.kind]}`
    : `${NOUN[e.kind].charAt(0).toUpperCase()}${NOUN[e.kind].slice(1)} · ${e.place.name}`;
  const where = e.place.ward ?? e.place.city;
  return { primary, secondary: `${where} · ${timeOf(e.at)}` };
}

export interface DayGroup {
  day: string; // "2027-06-23"
  events: PassEvent[];
}

/** Newest day first, newest event first within a day. */
export function groupByDay(events: PassEvent[]): DayGroup[] {
  const byDay = new Map<string, PassEvent[]>();
  for (const e of events) {
    const day = dayOf(e.at);
    const list = byDay.get(day);
    if (list) list.push(e);
    else byDay.set(day, [e]);
  }
  return [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, list]) => ({
      day,
      events: [...list].sort((a, b) => b.at.localeCompare(a.at)),
    }));
}

/** The EAT day an event belongs to, as a sortable "2027-06-23". */
function eatDay(iso: string): string {
  return eatParts(iso).day;
}

/** Days between two EAT day strings. */
function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000
  );
}

/** Discounts from the trailing seven days, today included. */
export function weekSavings(events: PassEvent[], at: Date): number {
  const today = eatDay(at.toISOString());
  return events
    .filter((e) => {
      const age = daysBetween(eatDay(e.at), today);
      return age >= 0 && age < 7;
    })
    .reduce((sum, e) => sum + (e.amount?.discount ?? 0), 0);
}

/** Saved as a share of gross. Zero on an empty record, never NaN. */
export function savingsRate(events: PassEvent[]): number {
  const gross = totalSaved(events) + totalSpent(events);
  return gross === 0 ? 0 : totalSaved(events) / gross;
}

/** How many offers the fan has actually used. */
export function offersUsed(events: PassEvent[]): number {
  return events.filter((e) => e.kind === "purchase").length;
}

/** Savings per EAT day for the last `days` days, oldest first — the sparkline. */
export function savingsSeries(
  events: PassEvent[],
  at: Date,
  days: number
): number[] {
  const today = eatDay(at.toISOString());
  const buckets = new Array<number>(days).fill(0);
  for (const e of events) {
    const age = daysBetween(eatDay(e.at), today);
    if (age >= 0 && age < days) {
      buckets[days - 1 - age] += e.amount?.discount ?? 0;
    }
  }
  return buckets;
}
