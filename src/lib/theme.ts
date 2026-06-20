import type { VisaType } from "@/types";

// Central palette — kept in sync with tailwind.config.js. Used where raw color
// values are needed (maps, gradients, icons, shadows) outside of className.
export const colors = {
  // Near-black primary (see DESIGN.md / tailwind.config.js).
  brand: {
    50: "#f3f3f3",
    100: "#e6e6e6",
    200: "#cccccc",
    400: "#4d4d4d",
    500: "#1f1f1f",
    600: "#141414",
    700: "#080808",
    800: "#000000",
    900: "#000000",
  },
  // Webflow accent purple — Premium sub-brand.
  ocean: {
    100: "#e9ddff",
    500: "#6a2fe6",
    600: "#7a3dff",
    700: "#5a23c0",
  },
  ink: {
    900: "#080808",
    700: "#363636",
    500: "#898989",
    400: "#ababab",
  },
  visa: {
    free: "#00d722",
    voa: "#ffae13",
    evisa: "#3b89ff",
    required: "#ee1d36",
  },
} as const;

export interface VisaMeta {
  label: string;
  short: string;
  color: string;
  bg: string; // tailwind bg class
  text: string; // tailwind text class
  border: string; // tailwind border class
  /** Lower = easier to enter; used for "easy countries" sorting. */
  easeRank: number;
}

export const VISA_META: Record<VisaType, VisaMeta> = {
  visa_free: {
    label: "Visa-Free",
    short: "Visa-Free",
    color: colors.visa.free,
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    easeRank: 0,
  },
  visa_on_arrival: {
    label: "Visa on Arrival",
    short: "VoA",
    color: colors.visa.voa,
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    easeRank: 1,
  },
  eta: {
    label: "Travel Authorization (ETA)",
    short: "ETA",
    color: colors.visa.evisa,
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    easeRank: 2,
  },
  evisa: {
    label: "e-Visa",
    short: "e-Visa",
    color: colors.visa.evisa,
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    easeRank: 3,
  },
  visa_required: {
    label: "Visa Required",
    short: "Visa Required",
    color: colors.visa.required,
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    easeRank: 4,
  },
};

/** A visa type is "easy" if it does not require an embassy visit ahead of travel. */
export const EASY_VISA_TYPES: VisaType[] = [
  "visa_free",
  "visa_on_arrival",
  "eta",
  "evisa",
];

// Webflow's signature is a chromatic category palette — one saturated hue per
// product surface. PassGo's natural categories are regions, so each region gets
// a fixed accent used as a card strip + dot for instant visual grouping.
export const REGION_ACCENT: Record<string, string> = {
  Africa: "#ff6b00", // orange
  Asia: "#ed52cb", // pink
  Europe: "#7a3dff", // purple
  "Middle East": "#ffae13", // yellow
  Oceania: "#3b89ff", // blue
  "North America": "#006acc", // deep blue
  "South America": "#00d722", // green
  Caribbean: "#00b3a6", // teal
};

export const regionColor = (region: string) =>
  REGION_ACCENT[region] ?? colors.ink[500];
