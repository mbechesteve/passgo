/**
 * Every user-facing string in the app, in one place. Grouped by the screen
 * that owns it, in the same order `src/screens/` lists them.
 *
 * Out of scope, and left where it stands: anything produced by a formatter
 * (`kes()`, `toLocaleString`, `recordLine()`, `validityLabel()`,
 * `matchLabel()`, `kickoffLabel()`, `CATEGORY_LABEL`), a template literal
 * that interpolates data (e.g. the partner/business counts), and the literal
 * unit "KES" rendered by the Eyebrow in the money box.
 */
export const S = {
  // ── Shared ──────────────────────────────────────────────────────────────
  // Used by BackBar, which every pushed screen renders. Sits above the
  // screen-ordered blocks below because it belongs to no single screen.
  back: "Go back",
  // The separator between two nations on a fixture row. Lowercase by design: the
  // ticket's own "VS" is a different, louder register (see passVersus).
  fixtureVersus: "v",

  // ── CategoryScreen ──────────────────────────────────────────────────────
  // (nothing to extract — its only text is the interpolated partner count.)

  // ── ConfirmScreen ───────────────────────────────────────────────────────
  confirmUnavailable:
    "This discount cannot be claimed right now. Nothing has been recorded.",
  confirmStepWritten: "Step 3 of 3 · One line written",
  confirmHeldNote:
    "Held on this device. No dashboard anywhere assembles this view of you.",
  confirmSeeWallet: "See my wallet",
  confirmStepConfirm: "Step 2 of 3 · Confirm",
  confirmChannelCardCode: "Card code",
  confirmChannelScanned: "Scanned",
  confirmBillHeading: "What the bill comes to",
  confirmPayPrefix: "You pay",
  confirmPaySuffix:
    "directly, by M-Pesa, Airtel Money or card. Pamoja never holds your money — it only records that this happened.",
  confirmButton: "Confirm the discount",

  // ── GettingThereScreen ──────────────────────────────────────────────────
  gettingThereTitle: "Getting there.",
  gettingThereStandfirst:
    "What you need to reach the ground, by road or by air.",
  modeDrive: "Drive",
  modeFly: "Fly",
  drivingYourRoute: "Your route",
  drivingDistance: "Distance",
  drivingDriveTime: "Drive time",
  drivingBorderWait: "Border wait",
  drivingNeed: "At the border you'll need",
  drivingGoodToKnow: "Good to know",
  drivingAsOfPrefix: "Correct as of",
  // The last leg, once the border is behind you. Deliberately not called
  // "how else to arrive": these are not alternatives to the crossing, they are
  // what happens after it, and they are the same whichever border you used.
  drivingOnceInNairobi: "Once you're in Nairobi",
  drivingParkAndWalk: "Park and walk",
  drivingConfirmCaveat:
    "Confirm current requirements with the relevant embassy or border authority before you travel.",
  flyVia: "FLY",
  flyTransferPrefix: "Then",
  flyTransferMiddle: "by road to",
  flyNeed: "At the airport you'll need",
  flyFixturesThere: "Fixtures there",
  // Stronger than the road caveat, because the road exists and the June 2027 air
  // network is not published by anyone. See the note in src/data/air.ts.
  airConfirmCaveat:
    "Airlines and schedules for June 2027 are not published. Confirm the route with the airline, and entry requirements with the relevant embassy, before you travel.",

  // ── ExploreScreen ───────────────────────────────────────────────────────
  exploreTitle: "Go and see Nairobi.",
  explorePlaceholder: "Search fixtures, venues, offers",
  exploreFilterAll: "All",
  exploreFilterFixtures: "Fixtures",
  exploreFilterVenues: "Venues",
  exploreFilterOffers: "Offers",
  exploreThisWeek: "This week",
  exploreEventsNearYou: "Events near you",
  exploreEatNearby: "Eat nearby",
  exploreOtherOffers: "More offers",
  exploreThingsToSee: "Things to see",
  exploreNoResults: "Nothing matches that yet.",
  exploreFreeEntry: "Free entry with your Pass",

  // ── TicketOfficeScreen ──────────────────────────────────────────────────
  officeTitle: "Choose where you'll sit.",
  officeStandfirst: "Pick a block, then how many seats. The seat itself is assigned.",
  officeTiersHeading: "What a seat costs",
  officeSoldOut: "Sold out",
  officeBlockPrefix: "Block",
  officeGatePrefix: "Gate",
  officeSeatsHeading: "How many seats",
  officeTotalHeading: "Your order",
  officeSeat: "seat",
  officeSeats: "seats",
  // The same boundary the redemption flow states, in the same words: the app never
  // takes the money. Rev. 2 §05 — never holds the funds, never sees a card number.
  officeHandoffNote:
    "Pamoja never holds your money. The seller takes the payment and issues the ticket; your Pass then carries it.",
  officeContinue: "Continue to the seller",
  officeHandedOff:
    "Ticketing is handled by the tournament's official seller. This prototype stops at the hand-off rather than taking a payment.",
  officeNotOnSale: "Tickets for this fixture are not sold through this office.",
  officeFiguresCaveat:
    "Prototype figures. Real allocation and pricing are the LOC's to set.",
  officeTickets: "Tickets",

  // ── HomeScreen ──────────────────────────────────────────────────────────
  homeToday: "Today",
  homeMatchday: "Matchday",
  homeYouveSaved: "You've saved",
  homeSavedEmptyHint: "Find an offer near you and your first line gets written.",
  homeEnteredAtPrefix: "Entered at",
  homeOffersNearYou: "Offers near you",
  homeOfferDistanceFrom: "from",
  homeGatesOpenPrefix: "Gates open",
  homeViewPass: "View pass",
  homeBrowseOffers: "Browse offers",
  homeSeeAll: "See all",
  homeThisWeekPrefix: "+",
  homeThisWeekSuffix: "This week",
  homeOfferUsedSuffix: "offer used",
  homeOffersUsedSuffix: "offers used",

  // ── IssuanceScreen ──────────────────────────────────────────────────────
  issuanceCountryKenya: "Kenya",
  issuanceCountryUganda: "Uganda",
  issuanceCountryTanzania: "Tanzania",
  issuanceStep0Heading: "Where are you collecting your Pass?",
  issuanceContinue: "Continue",
  issuanceStep1Heading: "Who is the Pass for?",
  issuanceNamePlaceholder: "Full name",
  issuanceStep1Disclaimer:
    "Prototype only. A real Pass is verified once, when it is issued, by the accrediting authority — not self-entered.",
  issuanceStep2Heading: "Your ticket",
  issuanceStep2Body:
    "Your Pass is created with your ticket, and works at the border, at the turnstile, on transport and at every partner business.",
  issuanceCreateButton: "Create my Pass",

  // ── LiveScreen ──────────────────────────────────────────────────────────
  liveTitle: "The match, as it happens.",
  liveBadge: "Live",
  // The minute field's value — sits in the mono data register alongside "70'", not
  // body copy, so it keeps its own caps. Its two render sites deliberately don't
  // apply `uppercase`: one interpolates the venue name, which would shout too.
  liveHalfTime: "HALF TIME",
  liveAlsoLive: "Also live",
  livePossession: "Possession",
  liveShots: "Shots",
  liveCorners: "Corners",
  liveNothingOn: "Nothing is kicking off right now.",
  liveNextUp: "Next up",

  // ── ParkingScreen ───────────────────────────────────────────────────────
  parkingTitle: "Pre-book a zone.",
  parkingStandfirst: "Payment is at the gate, by M-Pesa.",
  parkingWalkSuffix: "min walk",

  // ── PartnerScreen ───────────────────────────────────────────────────────
  partnerNotListed: "That partner is no longer listed.",
  partnerDiscountHeading: "Your discount",
  partnerMerchantCodePrefix: "Merchant code",
  partnerScanButton: "Scan to redeem",
  partnerShortCodeButton: "I read my card code at the counter",
  partnerDisclaimer:
    "You pay the merchant directly by M-Pesa, Airtel Money or card. Pamoja never holds your money.",

  // ── PassScreen ──────────────────────────────────────────────────────────
  passUnlocksHeading: "What your Pass unlocks",
  passWalletTitle: "My Wallet",
  passWalletSubtitle: "Tickets, passes, purchases",
  passActive: "Active",
  passSuspended: "Suspended",
  passExpired: "Expired",
  passMatchPass: "Match pass",
  passCategoryPrefix: "Cat",
  passVersus: "VS",
  passGate: "Gate",
  passSection: "Section",
  passSeat: "Seat",
  passTicketSaves: "What this ticket saves you",
  passTicketFree: "Free",
  passTicketTotal: "Total",
  passCodeStandIn: "Show this at the gate. A steward can also read your Pass code.",

  // ── SafetyScreen ────────────────────────────────────────────────────────
  safetyTitle: "Stewards are on every concourse.",
  safetyHelpLine: "Steward help line",
  safetyHelpLineDetail: "Free from any Kenyan number on matchday",
  safetyReport: "Report a problem",
  safetyReportDetail: "Crowding, a blocked exit, anything unsafe",

  // ── ScanScreen ──────────────────────────────────────────────────────────
  scanCannotRedeem: "Cannot redeem",
  scanNoPassOnDevice: "No Pass on this device",
  scanInactiveBody:
    "Your Pass has to be active to claim a discount. Nothing has been recorded.",
  scanCodeNotRecognised: "That code was not recognised.",
  scanStep: "Step 1 of 3 · Scan",
  scanHeading: "Enter the merchant's code",
  scanPlaceholder: "e.g. MO-001",
  scanHelperText:
    "Ask the merchant to enter your Pass code instead — it works without your phone.",
  scanContinue: "Continue",

  // ── ServicesScreen ──────────────────────────────────────────────────────
  servicesTitle: "Everything around the match, sorted.",
  servicesShuttles: "Shuttles",
  servicesShuttlesDetail: "CBD to the stadium, every 15 minutes",
  servicesFood: "Food",
  servicesFoodDetail: "Order to your seat block",
  servicesParking: "Parking",
  servicesParkingDetail: "Pre-book zones A–D",
  servicesMerch: "Merch",
  servicesMerchDetail: "Official kit, gate pickup",
  servicesSafety: "Safety",
  servicesSafetyDetail: "Report or get help fast",
  servicesStays: "Stays",
  servicesStaysDetail: "Verified lodges near the ground",
  servicesDrivingTitle: "Getting there",
  servicesDrivingDetail: "By road or by air",
  servicesNeedAHand: "Need a hand?",
  servicesStewards: "Stewards answer in under 2 minutes on matchday.",

  // ── WalletScreen ────────────────────────────────────────────────────────
  walletTitle: "Every line your Pass has written.",
  walletStorageError:
    "Your record could not be saved to this device. Recent lines may be missing.",
  walletYouveSaved: "You've saved",
  walletYouveSpent: "You've spent",
  walletSavedWithApp: "Saved with the app",
  walletThisWeek: "This week",
  walletOfferThisTournament: "offer this tournament",
  walletOffersThisTournament: "offers this tournament",
  walletEmptyState:
    "Nothing yet. Every time you use your Pass, one line is written here — and nowhere else.",
  walletClosingNote:
    "This record is yours, and it is held on this device. No dashboard anywhere assembles this view of you.",
} as const;
