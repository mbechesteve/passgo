import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { S } from "@/lib/strings";
import { fetchParking } from "@/data/repository";
import type { ParkingZone } from "@/types";

export function ParkingScreen() {
  const [zones, setZones] = useState<ParkingZone[]>([]);

  useEffect(() => {
    void fetchParking().then(setZones);
  }, []);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.parkingTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.parkingStandfirst}
        </Text>

        <View className="mt-6">
          {zones.map((z) => (
            <View
              key={z.id}
              className="flex-row items-center justify-between border-b border-hairline py-3.5"
            >
              <View className="flex-1">
                <Text className="font-medium text-[15px] text-ink">{z.zone}</Text>
                <Text className="mt-0.5 text-[13px] text-body">{z.detail}</Text>
              </View>
              <Text className="font-mono text-[12px] text-mute">
                {`${z.walkMinutes} ${S.parkingWalkSuffix}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
