import type { BorderCrossing } from "@/types";

const COMMON_GOOD_TO_KNOW = [
  { label: "Drive side", detail: "Left — same as home" },
  { label: "Currency", detail: "KES · pay by M-Pesa almost everywhere" },
  {
    label: "SIM and data",
    detail: "EAC roaming is capped — or pick up a local SIM at the border",
  },
];

export const BORDER_CROSSINGS: BorderCrossing[] = [
  {
    origin: "UG",
    originLabel: "From Uganda",
    originCity: "Kampala",
    originCode: "UGA",
    post: "MALABA",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 653,
    driveHours: 11,
    waitMinutes: 45,
    requirements: [
      {
        label: "Passport or EA national ID",
        detail: "EAC citizens can cross on ID — no visa needed",
      },
      {
        label: "COMESA Yellow Card",
        detail: "Third-party insurance valid across the region",
      },
      {
        label: "Vehicle logbook",
        detail: "Original, in the driver's name — or a letter if borrowed",
      },
      {
        label: "Temporary import permit",
        detail: "Free at Malaba, valid 14 days — issued on the spot",
      },
      { label: "Yellow fever certificate", detail: "Checked at the health desk" },
    ],
    goodToKnow: [
      { label: "Drive side", detail: "Left — same as Uganda" },
      { label: "Currency", detail: "KES · pay by M-Pesa almost everywhere" },
      {
        label: "SIM and data",
        detail: "EAC roaming is capped — or pick up a local SIM at the border",
      },
      { label: "Fuel", detail: "Fill at Eldoret — the last cheap stop before Nairobi" },
    ],
  },
  {
    origin: "TZ",
    originLabel: "From Tanzania",
    originCity: "Arusha",
    originCode: "TZA",
    post: "NAMANGA",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 273,
    driveHours: 5,
    waitMinutes: 30,
    requirements: [
      {
        label: "Passport or EA national ID",
        detail: "EAC citizens can cross on ID — no visa needed",
      },
      {
        label: "COMESA Yellow Card",
        detail: "Third-party insurance valid across the region",
      },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      { label: "Temporary import permit", detail: "Free at Namanga, valid 14 days" },
    ],
    goodToKnow: [
      ...COMMON_GOOD_TO_KNOW,
      { label: "Fuel", detail: "Fill at Namanga — cheaper on the Kenyan side" },
    ],
  },
  {
    origin: "RW",
    originLabel: "From Rwanda",
    originCity: "Kigali",
    originCode: "RWA",
    post: "MALABA",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 1_180,
    driveHours: 19,
    waitMinutes: 60,
    requirements: [
      {
        label: "Passport or EA national ID",
        detail: "EAC citizens can cross on ID — no visa needed",
      },
      {
        label: "COMESA Yellow Card",
        detail: "Third-party insurance valid across the region",
      },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      {
        label: "Two transit stamps",
        detail: "You cross Uganda on the way — keep both",
      },
    ],
    goodToKnow: [
      ...COMMON_GOOD_TO_KNOW,
      { label: "Split the drive", detail: "Most stop overnight at Kampala or Eldoret" },
    ],
  },
  {
    origin: "ET",
    originLabel: "From Ethiopia",
    originCity: "Addis Ababa",
    originCode: "ETH",
    post: "MOYALE",
    destinationCity: "Nairobi",
    destinationCode: "KEN",
    distanceKm: 1_530,
    driveHours: 24,
    waitMinutes: 90,
    requirements: [
      { label: "Passport and Kenyan visa", detail: "Ethiopia is not an EAC member" },
      { label: "Carnet de passage", detail: "Required — the Yellow Card is not enough" },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      { label: "Yellow fever certificate", detail: "Checked at the health desk" },
    ],
    goodToKnow: [
      ...COMMON_GOOD_TO_KNOW,
      { label: "Fuel", detail: "Long gaps north of Isiolo — fill whenever you can" },
    ],
  },
];
