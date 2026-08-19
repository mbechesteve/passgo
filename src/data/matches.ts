import type { Match } from "@/types";

// AFCON 2027 Kenyan fixtures. Kenya v Mali on Saturday 26 June at Kasarani is the
// one printed in Figure 3; it is the next fixture from the demo clock.
export const MATCHES: Match[] = [
  {
    id: "m-ken-mli",
    home: "Kenya", away: "Mali",
    kickoff: "2027-06-26T16:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
    coords: { lat: -1.2226, lng: 36.8917 },
  },
  {
    id: "m-civ-zam",
    home: "Côte d'Ivoire", away: "Zambia",
    kickoff: "2027-06-29T19:00:00+03:00",
    venue: "Nyayo", city: "Nairobi", country: "KE",
    coords: { lat: -1.3044, lng: 36.8264 },
  },
  {
    id: "m-ken-mar",
    home: "Kenya", away: "Morocco",
    kickoff: "2027-07-03T16:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
    coords: { lat: -1.2226, lng: 36.8917 },
  },
  // The one fixture with a ticket office behind it. The date is pinned from three
  // sides: after Kenya v Mali, so the next fixture from the demo clock and every
  // figure reading from it are unchanged; inside Explore's seven-day window, which is
  // the only surface that lists fixtures, so the office is reachable at all; and
  // before August, so `nextMatch` still runs out where the tests say it does.
  {
    id: "m-mli-zam",
    home: "Mali", away: "Zambia",
    kickoff: "2027-06-28T19:00:00+03:00",
    venue: "Talanta", city: "Nairobi", country: "KE",
    coords: { lat: -1.3021, lng: 36.7834 },
  },
  {
    id: "m-sen-egy",
    home: "Senegal", away: "Egypt",
    kickoff: "2027-07-10T19:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
    coords: { lat: -1.2226, lng: 36.8917 },
  },
  // The away fixtures. Both venues are real Pamoja co-host grounds; the pairings are
  // prototype figures, exactly as the Nairobi ones are. These are what make the Pass's
  // "valid in all three countries" claim mean something a fan can act on — and the
  // reason the Getting there screen has a Fly view at all.
  {
    id: "m-uga-gha",
    home: "Uganda", away: "Ghana",
    kickoff: "2027-06-29T16:00:00+03:00",
    venue: "Namboole", city: "Kampala", country: "UG",
    coords: { lat: 0.3606, lng: 32.6503 },
  },
  {
    id: "m-tza-alg",
    home: "Tanzania", away: "Algeria",
    kickoff: "2027-07-01T16:00:00+03:00",
    venue: "Benjamin Mkapa", city: "Dar es Salaam", country: "TZ",
    coords: { lat: -6.8676, lng: 39.2593 },
  },
  // In play at the demo instant. Kickoffs are chosen so that once the 15-minute
  // interval is subtracted the minutes read 70' and 55' — the app derives them, so
  // the drawing's 71' and 58' were never reachable from a round kickoff.
  {
    id: "m-zam-mar",
    home: "Zambia", away: "Morocco",
    kickoff: "2027-06-23T11:30:00+03:00",
    venue: "Nyayo", city: "Nairobi", country: "KE",
    coords: { lat: -1.3044, lng: 36.8264 },
  },
  {
    id: "m-uga-sen",
    home: "Uganda", away: "Senegal",
    kickoff: "2027-06-23T11:45:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
    coords: { lat: -1.2226, lng: 36.8917 },
  },
];
