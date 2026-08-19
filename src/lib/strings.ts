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

  // ── ExploreScreen ───────────────────────────────────────────────────────
  exploreSegmentEvents: "Events",
  exploreSegmentPlaces: "Places",
  exploreSegmentFanZones: "Fan Zones",
  exploreFreeEntry: "Free entry with your Pass",
  exploreComingUp: "Coming up",
  exploreNearYou: "Near you",

  // ── HomeScreen ──────────────────────────────────────────────────────────
  homeToday: "Today",
  homeMatchday: "Matchday",
  homeYouveSaved: "You've saved",
  homeSavedEmptyHint: "Find an offer near you and your first line gets written.",
  homeEnteredAtPrefix: "Entered at",
  homeOffersNearYou: "Offers near you",
  homeGatesOpenPrefix: "Gates open",
  homeViewPass: "View pass",
  homeBrowseOffers: "Browse offers",
  homeSeeAll: "See all",
  homeThisWeekPrefix: "+",
  homeThisWeekSuffix: "THIS WEEK",
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
  liveTitle: "Live",
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
  parkingTitle: "Parking",
  parkingStandfirst: "Pre-book a zone. Payment is at the gate, by M-Pesa.",

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

  // ── SafetyScreen ────────────────────────────────────────────────────────
  safetyTitle: "Safety",
  safetyStandfirst: "Stewards are on every concourse.",
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
  servicesTitle: "Services",
  servicesStandfirst: "Everything around the match, sorted.",
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
  servicesDrivingTitle: "Driving in",
  servicesDrivingDetail: "What you need at the border",
  servicesNeedAHand: "Need a hand?",
  servicesStewards: "Stewards answer in under 2 minutes on matchday.",

  // ── WalletScreen ────────────────────────────────────────────────────────
  walletStorageError:
    "Your record could not be saved to this device. Recent lines may be missing.",
  walletYouveSaved: "You've saved",
  walletYouveSpent: "You've spent",
  walletEmptyState:
    "Nothing yet. Every time you use your Pass, one line is written here — and nowhere else.",
  walletClosingNote:
    "This record is yours, and it is held on this device. No dashboard anywhere assembles this view of you.",
} as const;
