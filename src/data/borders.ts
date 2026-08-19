import type { BorderCrossing } from "@/types";

// Origin-dependent "good to know" facts (drive side, SIM and roaming) are
// written per-record, not shared: an earlier version shared them and produced
// two factual errors — Rwanda and Ethiopia were told they drive on the left
// when they drive on the right at home, and Ethiopia was told about EAC
// roaming despite not being an EAC member. Currency is shared here because,
// unlike those, it genuinely is the same for every origin — everyone pays
// KES in Kenya.
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
        detail: "Issued at Malaba",
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
      { label: "Fuel", detail: "Fuel is available at Eldoret" },
    ],
    asOf: "2026-08-19",
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
      { label: "Temporary import permit", detail: "Issued at Namanga" },
    ],
    goodToKnow: [
      { label: "Drive side", detail: "Left — same as Tanzania" },
      CURRENCY_GOOD_TO_KNOW,
      {
        label: "SIM and data",
        detail: "EAC roaming is capped — or pick up a local SIM at the border",
      },
      { label: "Fuel", detail: "Fuel is available at Namanga" },
    ],
    asOf: "2026-08-19",
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
        label: "Temporary import permit",
        // Same vehicle, same MALABA post, same Kenyan customs requirement as the
        // Uganda and Tanzania records above — this was missing here before.
        detail: "Issued at Malaba",
      },
      {
        label: "2 transit stamps",
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
    asOf: "2026-08-19",
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
      {
        // A carnet de passage is a customs document — a guarantee against duty on
        // the vehicle — not insurance, so it is not a substitute for the
        // third-party cover below and is never described as one.
        label: "Carnet de passage",
        detail: "Customs guarantee for temporary vehicle import — arrange before you travel",
      },
      {
        // Ethiopia held no insurance requirement at all — the only record
        // without one, on the longest, remotest drive. Worded like the
        // Tanzania row above: scheme-agnostic, since Ethiopia holds no COMESA
        // Yellow Card either.
        label: "Third-party insurance",
        detail: "Valid in Kenya — buy cover at Moyale if you do not hold regional insurance",
      },
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
    asOf: "2026-08-19",
  },
];
