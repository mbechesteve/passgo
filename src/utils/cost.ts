/**
 * What a journey costs, to the extent it can honestly be said.
 *
 * A drive is arithmetic: distance, a consumption figure and a pump price. None of those
 * is hidden — the screen prints the assumptions next to the number, so a fan whose car
 * or fuel price differs can see why their own figure will differ. That is the only
 * reason a money figure belongs here at all; `debbce9` removed a fuel-price claim that
 * was stated as fact rather than as an input.
 *
 * Air fares are not arithmetic. Nobody has published a June 2027 fare, so those live in
 * the seed as clearly-labelled indicative figures, the same footing as the ticket
 * office's Cat 1 and Cat 3 prices.
 */

/** The inputs behind every drive estimate. Displayed, never assumed silently. */
export const FUEL_ASSUMPTIONS = {
  litresPer100Km: 8,
  kesPerLitre: 190,
} as const;

export interface FuelAssumptions {
  litresPer100Km: number;
  kesPerLitre: number;
}

/**
 * Fuel for one leg, rounded to the nearest 100 KES.
 *
 * The rounding is deliberate: printing "KES 13,684" would claim a precision the inputs
 * do not have, and a fan reading it would take it for a quote.
 */
export function fuelEstimate(
  distanceKm: number,
  assumptions: FuelAssumptions = FUEL_ASSUMPTIONS
): number {
  if (distanceKm <= 0) return 0;
  const litres = (distanceKm / 100) * assumptions.litresPer100Km;
  return Math.round((litres * assumptions.kesPerLitre) / 100) * 100;
}

/**
 * "8 L/100 km at KES 190 a litre" — the assumptions as a fan reads them.
 *
 * Built from the same object the arithmetic uses, so the printed assumption can never
 * drift from the figure it explains.
 */
export function fuelAssumptionLabel(
  assumptions: FuelAssumptions = FUEL_ASSUMPTIONS
): string {
  return `${assumptions.litresPer100Km} L/100 km at KES ${assumptions.kesPerLitre.toLocaleString(
    "en-US"
  )} a litre`;
}
