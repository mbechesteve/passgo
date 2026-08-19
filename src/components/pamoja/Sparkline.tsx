import { View } from "react-native";

/** Daily savings as bars, oldest left. The last bar is today, and is the accent one. */
export function Sparkline({ values }: { values: number[] }) {
  const peak = Math.max(...values, 1);
  return (
    <View className="h-8 flex-row items-end">
      {values.map((value, i) => {
        const last = i === values.length - 1;
        return (
          <View
            key={i}
            className={`mr-1 w-1.5 rounded-sm ${last ? "bg-accent" : "bg-deep-grad"}`}
            // A zero-savings day still shows a 2px stub, so the axis reads as a row
            // of days rather than a gap.
            style={{ height: Math.max(2, (value / peak) * 32) }}
          />
        );
      })}
    </View>
  );
}
