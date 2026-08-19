import { Text, View } from "react-native";

/**
 * Kampala UGA ───── MALABA ───── Nairobi KEN, and
 * Nairobi NBO ───── FLY ───── Entebbe EBB.
 *
 * Takes the six strings rather than a `BorderCrossing`, so the road view and the air
 * view draw their route the same way instead of through two near-identical components.
 */
export function RouteStrip({
  fromCity,
  fromCode,
  via,
  toCity,
  toCode,
}: {
  fromCity: string;
  fromCode: string;
  via: string;
  toCity: string;
  toCode: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="font-medium text-[15px] text-ink">{fromCity}</Text>
        <Text className="mt-0.5 font-mono text-[10px] tracking-[1.2px] text-mute">
          {fromCode}
        </Text>
      </View>

      <View className="mx-3 flex-1 items-center">
        <View className="h-px w-full bg-hairline" />
        <Text className="mt-1.5 font-mono text-[10px] tracking-[1.5px] text-accent">
          {via}
        </Text>
      </View>

      <View className="items-end">
        <Text className="font-medium text-[15px] text-ink">{toCity}</Text>
        <Text className="mt-0.5 font-mono text-[10px] tracking-[1.2px] text-mute">
          {toCode}
        </Text>
      </View>
    </View>
  );
}
