import { Text, View } from "react-native";

import { crestCode } from "@/utils/match";

/** "KEN" — the three-letter tile either side of a fixture. */
export function Crest({
  team,
  tone = "panel",
}: {
  team: string;
  tone?: "deep" | "panel";
}) {
  const dark = tone === "deep";
  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-card ${
        dark ? "bg-deep" : "bg-panel"
      }`}
    >
      <Text
        className={`font-display text-[13px] tracking-[0.5px] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {crestCode(team)}
      </Text>
    </View>
  );
}
