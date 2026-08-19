import type { AirLink } from "@/types";

// Getting to an away fixture by air. One record per fixture city a fan would fly to,
// domestic first — those are the legs a fan can actually fly today.
//
// What is NOT here, on purpose: fares, frequencies, flight times, and any claim about
// which routes will operate in June 2027. Jambojet — the carrier this was modelled on —
// served seven domestic destinations and no international ones as of June 2026, with
// Nairobi–Entebbe scheduled to resume from October 2026 and a published plan reaching 17
// routes by 2029. Nobody has published a tournament network, so quoting one would be the
// same defect debbce9 removed.
//
// The domestic legs are the ones where the *route* can be named: Nairobi–Eldoret and
// Nairobi–Kisumu are current Jambojet services. Even so, no schedule is quoted, and
// `asOf` plus the screen's caveat cover all of it.
//
// Requirement wording matches ./borders.ts where the requirement is the same one — a
// document should not be described two ways depending on which way a fan arrives.

const PASS_REQUIREMENT = {
  label: "Your PAMOJA Pass",
  detail: "Shown with your ticket at the ground",
};

/** A domestic hop crosses no border: ID at the gate, and nothing to declare. */
const DOMESTIC_REQUIREMENTS = [
  {
    label: "Photo ID",
    detail: "Any government ID for a domestic flight — no passport needed",
  },
  PASS_REQUIREMENT,
];

const INTERNATIONAL_REQUIREMENTS = [
  {
    label: "Passport or EA national ID",
    detail: "EAC citizens can travel on ID — no visa needed",
  },
  { label: "Yellow fever certificate", detail: "Checked on arrival" },
  PASS_REQUIREMENT,
];

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

/** Nothing changes on a domestic hop, which is worth saying plainly. */
const DOMESTIC_GOOD_TO_KNOW = [
  { label: "Airline", detail: "Jambojet flies this route from Nairobi" },
  { label: "Currency", detail: "KES · pay by M-Pesa almost everywhere" },
  { label: "SIM and data", detail: "Your Kenyan line works as it does at home" },
  { label: "Your Pass", detail: "The same Pass — no border, nothing to show" },
];

export const AIR_LINKS: AirLink[] = [
  {
    id: "air-eldoret",
    country: "KE",
    servesCity: "Eldoret",
    fromCity: "Nairobi",
    fromCode: "NBO",
    toCity: "Eldoret",
    toCode: "EDL",
    transferKm: 18,
    transferTo: "Kipchoge Keino, Eldoret",
    fareEstimate: { low: 6000, high: 12000 },
    requirements: DOMESTIC_REQUIREMENTS,
    goodToKnow: DOMESTIC_GOOD_TO_KNOW,
    asOf: "2026-08-19",
  },
  {
    // The nearest airport to Bukhungu is Kisumu's, not Kakamega's — which is exactly
    // why a leg names the city it serves separately from the city it lands in.
    id: "air-kakamega",
    country: "KE",
    servesCity: "Kakamega",
    fromCity: "Nairobi",
    fromCode: "NBO",
    toCity: "Kisumu",
    toCode: "KIS",
    transferKm: 50,
    transferTo: "Bukhungu, Kakamega",
    fareEstimate: { low: 6000, high: 12000 },
    requirements: DOMESTIC_REQUIREMENTS,
    goodToKnow: DOMESTIC_GOOD_TO_KNOW,
    asOf: "2026-08-19",
  },
  {
    id: "air-kampala",
    country: "UG",
    servesCity: "Kampala",
    fromCity: "Nairobi",
    fromCode: "NBO",
    toCity: "Entebbe",
    toCode: "EBB",
    transferKm: 50,
    transferTo: "Namboole, Kampala",
    fareEstimate: { low: 14000, high: 26000 },
    requirements: INTERNATIONAL_REQUIREMENTS,
    goodToKnow: [
      TIME_ZONE_GOOD_TO_KNOW,
      { label: "Currency", detail: "UGX — Kenyan shillings are not accepted" },
      ROAMING_GOOD_TO_KNOW,
      PASS_GOOD_TO_KNOW,
    ],
    asOf: "2026-08-19",
  },
  {
    id: "air-dar",
    country: "TZ",
    servesCity: "Dar es Salaam",
    fromCity: "Nairobi",
    fromCode: "NBO",
    toCity: "Dar es Salaam",
    toCode: "DAR",
    transferKm: 15,
    transferTo: "Benjamin Mkapa, Dar es Salaam",
    fareEstimate: { low: 16000, high: 32000 },
    requirements: INTERNATIONAL_REQUIREMENTS,
    goodToKnow: [
      TIME_ZONE_GOOD_TO_KNOW,
      { label: "Currency", detail: "TZS — Kenyan shillings are not accepted" },
      ROAMING_GOOD_TO_KNOW,
      PASS_GOOD_TO_KNOW,
    ],
    asOf: "2026-08-19",
  },
];
