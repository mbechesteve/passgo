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
  {
    id: "m-sen-egy",
    home: "Senegal", away: "Egypt",
    kickoff: "2027-07-10T19:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
    coords: { lat: -1.2226, lng: 36.8917 },
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
