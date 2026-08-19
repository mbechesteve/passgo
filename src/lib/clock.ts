// The single time seam. The tournament is in June 2027 but the app is built and
// demoed before then, so every date-derived display reads through `now()`.
//
// The demo date is not arbitrary — it is the only instant at which all of the
// proposal's own figures are simultaneously true:
//   · 24 days left to 2027-07-17          → 2027-06-23   (Figure 3)
//   · "Kasarani ward · 12:55 · Wednesday" → 2027-06-23 is a Wednesday (Figure 4)
//   · next fixture "Sat 16:00"            → 2027-06-26
//
// Nothing outside this file may call Date.now() or `new Date()` with no argument.

export const TOURNAMENT_START = "2027-06-19";
export const TOURNAMENT_END = "2027-07-17";

/** Wednesday 23 June 2027, 12:55 EAT (UTC+3). */
export const DEMO_NOW = new Date("2027-06-23T12:55:00+03:00");

let realTime = false;

export function setUseRealTime(value: boolean): void {
  realTime = value;
}

export function isRealTime(): boolean {
  return realTime;
}

export function now(): Date {
  return realTime ? new Date() : new Date(DEMO_NOW.getTime());
}

// Kenya, Tanzania and Uganda all keep UTC+3 year-round with no daylight saving,
// so one fixed offset renders every event correctly in all three host countries.
// A fixed offset also survives engines shipped without full ICU data, which rules
// out Intl time zones on React Native.
export const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * The wall-clock day and time of an instant, as East Africa reads them.
 * `PassEvent.at` is stored as a UTC instant, so the record must convert before it
 * prints — otherwise a use at 12:55 EAT reads 09:55.
 */
export function eatParts(iso: string): { day: string; time: string } {
  const shifted = new Date(new Date(iso).getTime() + EAT_OFFSET_MS).toISOString();
  return { day: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}
