import { Text, View } from "react-native";

import type { VisaRule } from "@/types";
import { VISA_META } from "@/lib/theme";
import { visaBadgeText } from "@/utils/format";

/**
 * Compact visa-status badge, e.g. "Visa-Free", "VoA $50", "e-Visa · 1 day".
 * Color-coded by ease of entry (green → amber → blue → red).
 */
export function VisaBadge({
  rule,
  size = "md",
}: {
  rule: VisaRule;
  size?: "sm" | "md";
}) {
  const meta = VISA_META[rule.visaType];
  const pad = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const text = size === "sm" ? "text-[11px]" : "text-[12px]";
  return (
    <View
      className={`flex-row items-center self-start rounded-full border ${meta.bg} ${meta.border} ${pad}`}
    >
      <View
        className="mr-1.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <Text className={`font-bold ${meta.text} ${text}`}>
        {visaBadgeText(rule)}
      </Text>
    </View>
  );
}
