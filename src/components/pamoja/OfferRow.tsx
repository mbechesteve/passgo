import { Pressable, Text } from "react-native";

import { colors } from "@/lib/theme";
import type { Partner } from "@/types";

/** "Mama Oliech    −15%", exactly as Home lists them in Figure 3. */
export function OfferRow({
  partner,
  onPress,
}: {
  partner: Partner;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-hairline py-3 active:opacity-70"
    >
      <Text className="text-[15px] text-ink">{partner.name}</Text>
      <Text
        className="font-mono-medium text-[14px]"
        style={{ color: colors.accent }}
      >
        −{partner.discountPct}%
      </Text>
    </Pressable>
  );
}
