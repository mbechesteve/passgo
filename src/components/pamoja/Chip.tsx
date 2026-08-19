import { Text, View } from "react-native";

/** A small uppercase mono pill: "IN 3 DAYS", "+450 THIS WEEK", "CAT 2". */
export function Chip({
  label,
  tone = "tint",
}: {
  label: string;
  tone?: "accent" | "tint" | "ondark" | "panel";
}) {
  const tones = {
    accent: { bg: "bg-accent", text: "text-white" },
    tint: { bg: "bg-accent-tint", text: "text-accent" },
    ondark: { bg: "bg-deep-grad", text: "text-accent-soft" },
    panel: { bg: "bg-panel", text: "text-mute" },
  } as const;
  const t = tones[tone];
  return (
    <View className={`self-start rounded-full px-3 py-1.5 ${t.bg}`}>
      <Text
        className={`font-mono-medium text-[10px] uppercase tracking-[1.2px] ${t.text}`}
      >
        {label}
      </Text>
    </View>
  );
}
