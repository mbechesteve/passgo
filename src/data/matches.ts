import type { Match } from "@/types";

// AFCON 2027 Kenyan fixtures. Kenya v Mali on Saturday 26 June at Kasarani is the
// one printed in Figure 3; it is the next fixture from the demo clock.
export const MATCHES: Match[] = [
  {
    id: "m-ken-mli",
    home: "Kenya", away: "Mali",
    kickoff: "2027-06-26T16:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
  },
  {
    id: "m-civ-zam",
    home: "Côte d'Ivoire", away: "Zambia",
    kickoff: "2027-06-29T19:00:00+03:00",
    venue: "Nyayo", city: "Nairobi", country: "KE",
  },
  {
    id: "m-ken-mar",
    home: "Kenya", away: "Morocco",
    kickoff: "2027-07-03T16:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
  },
  {
    id: "m-sen-egy",
    home: "Senegal", away: "Egypt",
    kickoff: "2027-07-10T19:00:00+03:00",
    venue: "Kasarani", city: "Nairobi", country: "KE",
  },
];
