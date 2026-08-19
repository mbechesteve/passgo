import type { PartnerCategory } from "@/types";

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Live: undefined;
  Services: undefined;
  Pass: undefined;
};

export type RootStackParamList = {
  Issuance: undefined;
  Tabs: undefined;
  Category: { category: PartnerCategory };
  Partner: { partnerId: string };
  Wallet: undefined;
  Scan: undefined;
  Confirm: { partnerId: string; channel: "qr" | "shortcode" };
};
