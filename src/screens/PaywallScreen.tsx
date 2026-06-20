import { useNavigation } from "@react-navigation/native";

import { PremiumScreen } from "./PremiumScreen";

/** Modal presentation of the paywall, opened from locked content. */
export function PaywallScreen() {
  const nav = useNavigation();
  return <PremiumScreen onClose={() => nav.goBack()} />;
}
