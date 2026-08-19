import type { AirLink } from "@/types";

// Getting to an away fixture by air. One record per host country a fan would fly to.
//
// What is NOT here, on purpose: fares, flight times, frequencies and any claim that a
// route will be operating in June 2027. Jambojet — the carrier this was modelled on —
// served seven domestic destinations and no international ones as of June 2026, with
// Nairobi–Entebbe scheduled to resume from October 2026. A 2027 tournament network is
// not published by anyone, so quoting one would be the same defect debbce9 removed.
//
// Airport codes, transfer distances and entry documents are the stable part, and even
// those carry `asOf` and the screen's confirm-before-you-travel caveat.
//
// Requirement wording is deliberately the same as the road crossings in ./borders.ts
// where the requirement is the same one — one document should not be described two
// ways depending on which way a fan arrives.

/** True for every host country: all three keep East Africa Time, so nothing shifts. */
const TIME_ZONE_GOOD_TO_KNOW = {
  label: "Time zone",
  detail: "Same as Nairobi — EAT, no change",
};

/** Uganda and Tanzania are both EAC members, so the roaming position is the same. */
const ROAMING_GOOD_TO_KNOW = {
  label: "SIM and data",
  detail: "EAC roaming is capped — or pick up a local SIM on arrival",
};

const PASS_GOOD_TO_KNOW = {
  label: "Your Pass",
  detail: "Valid in all three countries — carry it with your ID",
};

const REQUIREMENTS = [
  {
    label: "Passport or EA national ID",
    detail: "EAC citizens can travel on ID — no visa needed",
  },
  { label: "Yellow fever certificate", detail: "Checked on arrival" },
  {
    label: "Your PAMOJA Pass",
    detail: "Shown with your ticket at the ground",
  },
];

export const AIR_LINKS: AirLink[] = [
  {
    id: "air-ug",
    country: "UG",
    countryLabel: "To Uganda",
    fromCity: "Nairobi",
    fromCode: "NBO",
    toCity: "Entebbe",
    toCode: "EBB",
    transferKm: 50,
    transferTo: "Namboole, Kampala",
    requirements: REQUIREMENTS,
    goodToKnow: [
      TIME_ZONE_GOOD_TO_KNOW,
      { label: "Currency", detail: "UGX — Kenyan shillings are not accepted" },
      ROAMING_GOOD_TO_KNOW,
      PASS_GOOD_TO_KNOW,
    ],
    asOf: "2026-08-19",
  },
  {
    id: "air-tz",
    country: "TZ",
    countryLabel: "To Tanzania",
    fromCity: "Nairobi",
    fromCode: "NBO",
    toCity: "Dar es Salaam",
    toCode: "DAR",
    transferKm: 15,
    transferTo: "Benjamin Mkapa, Dar es Salaam",
    requirements: REQUIREMENTS,
    goodToKnow: [
      TIME_ZONE_GOOD_TO_KNOW,
      { label: "Currency", detail: "TZS — Kenyan shillings are not accepted" },
      ROAMING_GOOD_TO_KNOW,
      PASS_GOOD_TO_KNOW,
    ],
    asOf: "2026-08-19",
  },
];
