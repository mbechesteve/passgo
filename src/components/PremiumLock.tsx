import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppStore } from "@/store/useAppStore";

/**
 * Gates Premium content. When the user is free it renders a locked card with an
 * upsell that routes to the paywall; when Premium it renders children directly.
 */
export function PremiumLock({
  title,
  blurb,
  onUpgrade,
  children,
}: {
  title: string;
  blurb: string;
  onUpgrade: () => void;
  children: ReactNode;
}) {
  const isPremium = useAppStore((s) => s.isPremium);
  if (isPremium) return <>{children}</>;

  return (
    <Pressable
      onPress={onUpgrade}
      className="overflow-hidden rounded-card border border-ocean-300 bg-ocean-50"
    >
      <View className="flex-row items-center p-4">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-ocean-600">
          <Text className="text-lg">🔒</Text>
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-[15px] font-semibold text-ink-900">{title}</Text>
            <View className="ml-2 rounded-full bg-ocean-600 px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-white">PREMIUM</Text>
            </View>
          </View>
          <Text className="mt-0.5 text-[12px] leading-4 text-ink-500">{blurb}</Text>
        </View>
        <Text className="ml-2 text-ocean-300 text-lg font-bold">→</Text>
      </View>
    </Pressable>
  );
}
