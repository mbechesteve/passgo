import type { PartnerCategory } from "@/types";

// Navigation is a stack *inside each tab*, not one stack above them. That is what
// keeps the tab bar on every page: a screen pushed within a tab stays under that
// tab's bar, where the earlier arrangement — every pushed screen in a root stack
// above the tabs — covered the bar by construction and left seven screens with no
// way back to it at all.
//
// Tab routes are suffixed `Tab` so a tab and the screen at its root can share a
// name without colliding. Switching tabs is `navigate("PassTab")`; reaching a
// screen inside another tab is `navigate("PassTab", { screen: "Wallet" })`.

/**
 * Reachable from more than one tab, so registered in each of their stacks with
 * identical params. Exported so the screens themselves can type their route
 * without needing to know which tab's stack they were pushed onto.
 */
export type SharedRoutes = {
  Partner: { partnerId: string };
  Confirm: { partnerId: string; channel: "qr" | "shortcode" };
};

export type HomeStackParamList = { Home: undefined } & SharedRoutes;

// TicketOffice stays out of SharedRoutes: fixtures are browsed on Explore, so one
// tab reaches it, and SharedRoutes is for screens more than one tab can reach.
export type ExploreStackParamList = {
  Explore: undefined;
  TicketOffice: { matchId: string };
} & SharedRoutes;

export type LiveStackParamList = { Live: undefined };

export type ServicesStackParamList = {
  Services: undefined;
  Category: { category: PartnerCategory };
  Parking: undefined;
  Safety: undefined;
  Driving: undefined;
  Scan: undefined;
} & SharedRoutes;

export type PassStackParamList = { Pass: undefined; Wallet: undefined };

export type TabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  LiveTab: undefined;
  ServicesTab: undefined;
  PassTab: undefined;
};

export type RootStackParamList = {
  Issuance: undefined;
  Tabs: undefined;
};
