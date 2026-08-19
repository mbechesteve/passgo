import { Text, View } from "react-native";

import type { BorderCrossing } from "@/types";

/** Kampala UGA ───── MALABA ───── Nairobi KEN */
export function RouteStrip({ crossing }: { crossing: BorderCrossing }) {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="font-medium text-[15px] text-ink">
          {crossing.originCity}
        </Text>
        <Text className="mt-0.5 font-mono text-[10px] tracking-[1.2px] text-mute">
          {crossing.originCode}
        </Text>
      </View>

      <View className="mx-3 flex-1 items-center">
        <View className="h-px w-full bg-hairline" />
        <Text className="mt-1.5 font-mono text-[10px] tracking-[1.5px] text-accent">
          {crossing.post}
        </Text>
      </View>

      <View className="items-end">
        <Text className="font-medium text-[15px] text-ink">
          {crossing.destinationCity}
        </Text>
        <Text className="mt-0.5 font-mono text-[10px] tracking-[1.2px] text-mute">
          {crossing.destinationCode}
        </Text>
      </View>
    </View>
  );
}
