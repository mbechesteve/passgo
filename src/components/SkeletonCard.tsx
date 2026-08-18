import { View } from "react-native";

/** Generic loading placeholder card, sized to match a typical list card. */
export function SkeletonCard() {
  return (
    <View className="mb-4 overflow-hidden rounded-card bg-canvas border border-hairline">
      <View className="h-44 w-full bg-surface" />
      <View className="p-4">
        <View className="h-3 w-4/5 rounded bg-surface" />
        <View className="mt-2 h-3 w-3/5 rounded bg-surface" />
        <View className="mt-4 h-3 w-2/3 rounded bg-surface" />
      </View>
    </View>
  );
}
