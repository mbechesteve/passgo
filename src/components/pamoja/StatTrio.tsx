import { Text, View } from "react-native";

/** Three figures side by side — possession/shots/corners, or distance/time/wait. */
export function StatTrio({
  items,
  tone = "light",
}: {
  items: { value: string; label: string }[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <View className="flex-row">
      {items.map((item, i) => (
        <View
          key={item.label}
          className={`flex-1 items-center py-3 ${
            i > 0 ? `border-l ${dark ? "border-deep-grad" : "border-hairline"}` : ""
          }`}
        >
          <Text
            className={`font-display text-[19px] ${dark ? "text-white" : "text-ink"}`}
          >
            {item.value}
          </Text>
          <Text
            className={`mt-1 font-mono text-[10px] uppercase tracking-[1.2px] ${
              dark ? "text-ondark-mute" : "text-mute"
            }`}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
