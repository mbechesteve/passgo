import { Pressable, Text, View } from "react-native";

import { colors } from "@/lib/theme";
import type { Partner } from "@/types";

/** "Mama Oliech    −15%", exactly as Home lists them in Figure 3, now with distance. */
export function OfferRow({
  partner,
  subline,
  onPress,
}: {
  partner: Partner;
  subline?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-hairline py-3 active:opacity-70"
    >
      <View className="h-10 w-10 items-center justify-center rounded-card bg-panel">
        <Text className="font-display text-[14px] text-ink">
          {partner.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-ink">{partner.name}</Text>
        {subline ? (
          <Text className="mt-0.5 font-mono text-[11px] text-mute">{subline}</Text>
        ) : null}
      </View>
      <Text
        className="font-mono-medium text-[14px]"
        style={{ color: colors.accent }}
      >
        −{partner.discountPct}%
      </Text>
    </Pressable>
  );
}
