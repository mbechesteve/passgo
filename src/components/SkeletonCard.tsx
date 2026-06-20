import { View } from "react-native";

/** Placeholder shown while Discover loads — mirrors the CountryCard shape. */
export function SkeletonCard() {
  return (
    <View className="mb-4 overflow-hidden rounded-card bg-surface border border-surface-sunken">
      <View className="h-44 w-full bg-surface-muted" />
      <View className="p-4">
        <View className="h-3 w-4/5 rounded bg-surface-muted" />
        <View className="mt-2 h-3 w-3/5 rounded bg-surface-muted" />
        <View className="mt-4 h-3 w-2/3 rounded bg-surface-muted" />
      </View>
    </View>
  );
}
