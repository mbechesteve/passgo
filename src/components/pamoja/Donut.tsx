import { Text, View } from "react-native";

import { colors } from "@/lib/theme";

/** The savings-rate ring on the Wallet. `value` is 0–1. */
export function Donut({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <View className="h-16 w-16 items-center justify-center" accessibilityLabel={label}>
      <View
        className="absolute h-16 w-16 rounded-full"
        style={{ borderWidth: 6, borderColor: colors.panel }}
      />
      <View
        className="absolute h-16 w-16 rounded-full"
        style={{
          borderWidth: 6,
          borderColor: colors.accent,
          // A full ring reads as complete; a partial one leaves the base colour
          // showing on the sides it does not cover.
          borderRightColor: pct < 75 ? colors.panel : colors.accent,
          borderBottomColor: pct < 50 ? colors.panel : colors.accent,
          borderLeftColor: pct < 25 ? colors.panel : colors.accent,
          transform: [{ rotate: "-45deg" }],
        }}
      />
      <Text className="font-display text-[13px] text-ink">{`${pct}%`}</Text>
    </View>
  );
}
