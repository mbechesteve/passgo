import { Image, Pressable, Text, View } from "react-native";

import type { Attraction } from "@/types";
import { usd } from "@/utils/format";

export function AttractionCard({
  attraction,
  onAdd,
  added,
  compact,
}: {
  attraction: Attraction;
  onAdd?: () => void;
  added?: boolean;
  compact?: boolean;
}) {
  return (
    <View
      className={`overflow-hidden rounded-2xl bg-surface border border-surface-sunken ${
        compact ? "w-60 mr-3" : "mb-3"
      }`}
    >
      <View className="relative">
        <Image
          source={{ uri: attraction.image }}
          className={compact ? "h-28 w-full" : "h-36 w-full"}
          resizeMode="cover"
        />
        <View className="absolute left-2 top-2 rounded-lg bg-black/55 px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-white">
            {attraction.category}
          </Text>
        </View>
        <View className="absolute right-2 top-2 flex-row items-center rounded-lg bg-white/90 px-2 py-0.5">
          <Text className="text-[11px] font-bold text-amber-600">★ {attraction.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View className="p-3">
        <Text className="text-[14px] font-bold text-ink-900" numberOfLines={1}>
          {attraction.name}
        </Text>
        {!compact ? (
          <Text className="mt-0.5 text-[12px] leading-4 text-ink-500" numberOfLines={2}>
            {attraction.blurb}
          </Text>
        ) : null}

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Meta emoji="🕒" text={`${attraction.durationHours}h`} />
            <Meta emoji="🎟️" text={usd(attraction.feeUsd)} />
          </View>
          {onAdd ? (
            <Pressable
              onPress={onAdd}
              disabled={added}
              hitSlop={8}
              className={`rounded-full px-3 py-1.5 ${
                added ? "bg-brand-100" : "bg-brand-700"
              }`}
            >
              <Text
                className={`text-[12px] font-bold ${
                  added ? "text-brand-800" : "text-white"
                }`}
              >
                {added ? "Added ✓" : "+ Add"}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {!compact ? (
          <Text className="mt-1.5 text-[11px] text-ink-400">
            {attraction.openingHours}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const Meta = ({ emoji, text }: { emoji: string; text: string }) => (
  <View className="mr-3 flex-row items-center">
    <Text className="text-[11px]">{emoji}</Text>
    <Text className="ml-1 text-[12px] font-semibold text-ink-700">{text}</Text>
  </View>
);
