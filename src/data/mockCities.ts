import type { City } from "@/types";
import { img } from "./images";

// Cities for the flagship destinations. Coordinates are real so the Map View and
// route distances are meaningful.
export const MOCK_CITIES: City[] = [
  // Vietnam
  {
    id: "city_hoian",
    countryCode: "VN",
    name: "Hoi An",
    lat: 15.8801,
    lng: 108.338,
    image: img("hoian"),
    blurb: "UNESCO old town of lantern-lit lanes, tailors and An Bang Beach.",
    suggestedDays: 4,
  },
  {
    id: "city_danang",
    countryCode: "VN",
    name: "Da Nang",
    lat: 16.0544,
    lng: 108.2022,
    image: img("danang"),
    blurb: "Marble Mountains, the Dragon Bridge and the airport gateway to Hoi An.",
    suggestedDays: 1,
  },
  {
    id: "city_hanoi",
    countryCode: "VN",
    name: "Hanoi",
    lat: 21.0278,
    lng: 105.8342,
    image: img("hanoi"),
    blurb: "The capital's Old Quarter, Hoan Kiem Lake and Train Street.",
    suggestedDays: 2,
  },
  // Tanzania
  {
    id: "city_zanzibar",
    countryCode: "TZ",
    name: "Zanzibar (Stone Town)",
    lat: -6.1659,
    lng: 39.2026,
    image: img("zanzibar"),
    blurb: "UNESCO-listed maze of spice-trade lanes, beaches and dhow sunsets.",
    suggestedDays: 3,
  },
  {
    id: "city_arusha",
    countryCode: "TZ",
    name: "Arusha",
    lat: -3.3869,
    lng: 36.683,
    image: img("arusha"),
    blurb: "Safari gateway to the Serengeti and Ngorongoro Crater.",
    suggestedDays: 2,
  },
  // South Africa
  {
    id: "city_capetown",
    countryCode: "ZA",
    name: "Cape Town",
    lat: -33.9249,
    lng: 18.4241,
    image: img("capetown"),
    blurb: "Table Mountain, the Cape Peninsula and the V&A Waterfront.",
    suggestedDays: 4,
  },
  {
    id: "city_joburg",
    countryCode: "ZA",
    name: "Johannesburg",
    lat: -26.2041,
    lng: 28.0473,
    image: img("joburg"),
    blurb: "History at the Apartheid Museum and a launchpad to Kruger.",
    suggestedDays: 2,
  },
  // Thailand
  {
    id: "city_bangkok",
    countryCode: "TH",
    name: "Bangkok",
    lat: 13.7563,
    lng: 100.5018,
    image: img("bangkok"),
    blurb: "Grand palaces, floating markets and legendary street food.",
    suggestedDays: 3,
  },
  {
    id: "city_chiangmai",
    countryCode: "TH",
    name: "Chiang Mai",
    lat: 18.7883,
    lng: 98.9853,
    image: img("chiangmai"),
    blurb: "Mountain temples, night bazaars and ethical elephant sanctuaries.",
    suggestedDays: 3,
  },
  {
    id: "city_phuket",
    countryCode: "TH",
    name: "Phuket",
    lat: 7.8804,
    lng: 98.3923,
    image: img("phuket"),
    blurb: "Andaman beaches and the gateway to Phi Phi and James Bond Island.",
    suggestedDays: 3,
  },
  // UAE
  {
    id: "city_dubai",
    countryCode: "AE",
    name: "Dubai",
    lat: 25.2048,
    lng: 55.2708,
    image: img("dubai"),
    blurb: "Burj Khalifa, desert dunes and the world's largest mall.",
    suggestedDays: 3,
  },
  {
    id: "city_abudhabi",
    countryCode: "AE",
    name: "Abu Dhabi",
    lat: 24.4539,
    lng: 54.3773,
    image: img("abudhabi"),
    blurb: "Sheikh Zayed Grand Mosque, Louvre Abu Dhabi and Yas Island.",
    suggestedDays: 2,
  },
  // Türkiye
  {
    id: "city_istanbul",
    countryCode: "TR",
    name: "Istanbul",
    lat: 41.0082,
    lng: 28.9784,
    image: img("istanbul"),
    blurb: "Where Europe meets Asia — Hagia Sophia, bazaars and Bosphorus ferries.",
    suggestedDays: 4,
  },
  {
    id: "city_cappadocia",
    countryCode: "TR",
    name: "Cappadocia (Göreme)",
    lat: 38.6431,
    lng: 34.8289,
    image: img("cappadocia"),
    blurb: "Fairy chimneys, cave hotels and sunrise hot-air balloons.",
    suggestedDays: 2,
  },
  // Mauritius
  {
    id: "city_portlouis",
    countryCode: "MU",
    name: "Port Louis",
    lat: -20.1609,
    lng: 57.5012,
    image: img("portlouis"),
    blurb: "The capital's Caudan Waterfront, central market and colonial core.",
    suggestedDays: 1,
  },
  {
    id: "city_flicenflac",
    countryCode: "MU",
    name: "Flic en Flac",
    lat: -20.2747,
    lng: 57.3661,
    image: img("flicenflac"),
    blurb: "West-coast lagoon beaches, snorkelling and Black River Gorges nearby.",
    suggestedDays: 3,
  },
];

export const citiesForCountry = (countryCode: string) =>
  MOCK_CITIES.filter((c) => c.countryCode === countryCode);

export const getCityById = (id: string) =>
  MOCK_CITIES.find((c) => c.id === id);
