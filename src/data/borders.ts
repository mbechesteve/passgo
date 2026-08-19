import type { BorderCrossing } from "@/types";

// "Good to know" facts are kept per-record, not shared, except for currency —
// the one fact genuinely true regardless of origin. Drive side and SIM/roaming
// depend on the origin's own traffic rule and EAC membership, so an earlier
// version that spread a shared array of them into every record produced two
// factual errors (Rwanda/Ethiopia told they drive on the left when they drive
// on the right at home; Ethiopia told about EAC roaming despite not being an
// EAC member). Keep this constant to exactly the entries that hold for all
// four origins — if that ever drops to one, inline it and delete the constant.
const CURRENCY_GOOD_TO_KNOW = {
  label: "Currency",
  detail: "KES · pay by M-Pesa almost everywhere",
};

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
      CURRENCY_GOOD_TO_KNOW,
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
        // Tanzania withdrew from COMESA in 2000 (it's EAC/SADC instead), so it
        // does not hold a COMESA Yellow Card. Keep the insurance requirement —
        // dropping it could read as "no cover needed" — but don't name a
        // scheme we haven't verified applies here.
        label: "Third-party insurance",
        detail: "Valid in Kenya — buy cover at Namanga if you do not hold regional insurance",
      },
      { label: "Vehicle logbook", detail: "Original, in the driver's name" },
      { label: "Temporary import permit", detail: "Free at Namanga, valid 14 days" },
    ],
    goodToKnow: [
      { label: "Drive side", detail: "Left — same as Tanzania" },
      CURRENCY_GOOD_TO_KNOW,
      {
        label: "SIM and data",
        detail: "EAC roaming is capped — or pick up a local SIM at the border",
      },
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
      // Rwanda drives on the right — this is a switch, not a match, so it's
      // worded as a caution rather than the neutral "same as home" phrasing.
      {
        label: "Drive side",
        detail: "Kenya drives on the left — you drive on the right at home",
      },
      CURRENCY_GOOD_TO_KNOW,
      {
        label: "SIM and data",
        detail: "EAC roaming is capped — or pick up a local SIM at the border",
      },
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
      // Ethiopia drives on the right — same caution as Rwanda, not "same as home".
      {
        label: "Drive side",
        detail: "Kenya drives on the left — you drive on the right at home",
      },
      CURRENCY_GOOD_TO_KNOW,
      // Not an EAC member, so there's no roaming cap to mention — the actual
      // advice is to buy local, unlike the EAC-origin records above.
      { label: "SIM and data", detail: "No EAC roaming benefit — buy a local SIM at Moyale" },
      { label: "Fuel", detail: "Long gaps north of Isiolo — fill whenever you can" },
    ],
  },
];
