import { Text, View } from "react-native";

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View>
      {label ? (
        <Text className="mb-1 text-[11px] font-bold uppercase text-ink-400">
          {label}
        </Text>
      ) : null}
      <View className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <View
          className="h-2 rounded-full bg-brand-700"
          style={{ width: `${clamped * 100}%` }}
        />
      </View>
    </View>
  );
}
