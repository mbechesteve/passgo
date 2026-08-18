import { Text, View } from "react-native";

import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import type { Pass } from "@/types";
import { validityLabel } from "@/utils/pass";

/**
 * The credential, as printed in Figure 1. Renders entirely from local state with
 * no network path at all — Section 04 promises the turnstile works with no
 * network needed, and this card is what the fan holds up.
 */
export function PassCard({ pass }: { pass: Pass }) {
  const validity = validityLabel(pass, now());
  const spent = pass.status !== "active";
  return (
    <View
      className="rounded-card p-5"
      style={{ backgroundColor: colors.deep, opacity: spent ? 0.55 : 1 }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-[15px] tracking-[2px] text-white">
          PAMOJA
        </Text>
        <View
          className="h-4 w-6 rounded-[2px]"
          style={{ backgroundColor: colors.accent }}
        />
      </View>

      <Text className="mt-8 font-medium text-[19px] text-white">
        {pass.holderName}
      </Text>
      <Text className="mt-1 font-mono text-[13px] tracking-[1px] text-faint">
        {pass.id}
      </Text>

      <Text
        className="mt-6 font-mono text-[11px] uppercase tracking-[1.5px]"
        style={{ color: colors.accent }}
      >
        Valid in all three countries
      </Text>
      <Text className="mt-1.5 font-mono text-[11px] text-faint">{validity}</Text>
    </View>
  );
}
