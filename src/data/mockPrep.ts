import type { PrepGuide } from "@/types";

// "How to prepare" guides. Rich content is Premium-gated (premium: true) — the
// UI blurs/locks it behind the paywall for free users.
const base = (over: Partial<PrepGuide> & { destCountry: string }): PrepGuide => ({
  documents: [
    "Passport valid 6+ months beyond travel",
    "Return / onward ticket",
    "Proof of accommodation",
  ],
  vaccinations: ["Routine vaccines up to date"],
  currency: {
    tips: "Notify your bank before travel.",
    cards: "Visa & Mastercard widely accepted in cities.",
    cash: "Carry small notes for taxis and markets.",
  },
  sim: { providers: ["Local prepaid eSIM"], tips: "Buy at the airport on arrival." },
  safety: ["Use registered taxis", "Keep copies of documents"],
  premium: true,
  ...over,
});

export const MOCK_PREP: PrepGuide[] = [
  base({
    destCountry: "TZ",
    documents: [
      "Passport valid 6+ months",
      "Yellow fever certificate (if arriving from an endemic country)",
      "Return ticket & accommodation proof",
    ],
    vaccinations: ["Yellow fever (conditional)", "Hepatitis A", "Typhoid", "Malaria prophylaxis"],
    currency: {
      tips: "USD is widely accepted for tours and park fees; bring crisp post-2013 notes.",
      cards: "Cards work in hotels; ATMs in towns dispense TZS.",
      cash: "Carry TZS for markets, dala-dalas and tips.",
    },
    sim: {
      providers: ["Vodacom", "Airtel", "Halotel"],
      tips: "Buy a SIM at Zanzibar/Kilimanjaro airport with your passport; data is cheap.",
    },
    safety: [
      "Dress modestly in Stone Town and villages",
      "Agree taxi fares in advance",
      "Use reef-safe sunscreen",
    ],
  }),
  base({
    destCountry: "ZA",
    vaccinations: ["Hepatitis A", "Typhoid", "Malaria prophylaxis (Kruger/lowveld)"],
    currency: {
      tips: "The Rand is volatile — withdraw as you go.",
      cards: "Contactless is everywhere, even small cafés.",
      cash: "Keep some cash for car-guard tips and markets.",
    },
    sim: {
      providers: ["Vodacom", "MTN", "Cell C"],
      tips: "RICA registration needs your passport; buy at the airport.",
    },
    safety: [
      "Avoid displaying valuables in cities",
      "Don't walk alone at night in CBDs",
      "Use ride-hailing apps after dark",
    ],
  }),
  base({
    destCountry: "TH",
    vaccinations: ["Hepatitis A", "Typhoid", "Japanese encephalitis (rural/long stays)"],
    currency: {
      tips: "Withdraw THB from ATMs (≈220 THB fee) or exchange at SuperRich.",
      cards: "Malls and hotels take cards; markets are cash-only.",
      cash: "Keep 20–100 THB notes for street food and tuk-tuks.",
    },
    sim: {
      providers: ["AIS", "TrueMove H", "dtac"],
      tips: "Tourist SIMs with unlimited data are sold at every airport.",
    },
    safety: [
      "Dress respectfully at temples (cover shoulders & knees)",
      "Agree tuk-tuk/taxi fares or use the meter / Grab",
      "Beware jet-ski and gem 'scams' in tourist zones",
    ],
  }),
  base({
    destCountry: "AE",
    vaccinations: ["Routine vaccines up to date"],
    currency: {
      tips: "The Dirham is pegged to the USD (≈3.67 AED).",
      cards: "Cards accepted virtually everywhere.",
      cash: "Small cash useful for taxis and souks.",
    },
    sim: {
      providers: ["du", "Etisalat (e&)"],
      tips: "Tourist SIM at the airport; WhatsApp/FaceTime calls are restricted.",
    },
    safety: [
      "Respect conservative dress codes in public",
      "No public displays of affection or alcohol",
      "Friday is the holy day — some sites have limited hours",
    ],
  }),
  base({
    destCountry: "TR",
    currency: {
      tips: "The Lira fluctuates; pay in Lira, not euros, for better value.",
      cards: "Widely accepted; carry cash for bazaars and rural areas.",
      cash: "Keep small notes for tea, taxis and tips.",
    },
    sim: {
      providers: ["Turkcell", "Vodafone TR", "Türk Telekom"],
      tips: "SIMs are pricier than elsewhere; an eSIM is often cheaper for short trips.",
    },
    safety: [
      "Haggle politely in the Grand Bazaar",
      "Book balloon rides with licensed operators",
      "Watch for the friendly 'let me show you a bar' scam in Istanbul",
    ],
  }),
  base({
    destCountry: "MU",
    currency: {
      tips: "The Rupee is stable; resorts quote in EUR/USD too.",
      cards: "Cards accepted in resorts and supermarkets.",
      cash: "Cash for buses, markets and street food.",
    },
    sim: {
      providers: ["Emtel", "my.t (Mauritius Telecom)"],
      tips: "Cheap tourist data SIMs at the airport.",
    },
    safety: [
      "Strong lagoon currents at some public beaches",
      "Mosquito repellent in summer",
      "Drive on the left if renting a car",
    ],
  }),
];

export const getPrepForCountry = (code: string) =>
  MOCK_PREP.find((p) => p.destCountry === code) ?? base({ destCountry: code });
