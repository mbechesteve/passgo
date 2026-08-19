import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { RouteStrip } from "@/components/pamoja/RouteStrip";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { S } from "@/lib/strings";
import { fetchBorderCrossings } from "@/data/repository";
import type { BorderCrossing, OriginCountry } from "@/types";

export function DrivingScreen() {
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [origin, setOrigin] = useState<OriginCountry>("UG");

  useEffect(() => {
    void fetchBorderCrossings().then(setCrossings);
  }, []);

  const crossing = crossings.find((c) => c.origin === origin);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.drivingTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.drivingStandfirst}
        </Text>

        <View className="mt-5 flex-row flex-wrap">
          {crossings.map((c) => (
            <View key={c.origin} className="mb-2">
              <Pill
                label={c.originLabel}
                active={c.origin === origin}
                onPress={() => setOrigin(c.origin)}
              />
            </View>
          ))}
        </View>

        {crossing ? (
          <>
            <Eyebrow className="mt-6">{S.drivingYourRoute}</Eyebrow>
            <View className="mt-3 rounded-card border border-hairline bg-canvas px-5 py-5">
              <RouteStrip crossing={crossing} />
              <View className="mt-4 border-t border-hairline pt-1">
                <StatTrio
                  items={[
                    {
                      value: `${crossing.distanceKm.toLocaleString("en-US")} km`,
                      label: S.drivingDistance,
                    },
                    { value: `~${crossing.driveHours} h`, label: S.drivingDriveTime },
                    {
                      value: `~${crossing.waitMinutes} min`,
                      label: S.drivingBorderWait,
                    },
                  ]}
                />
              </View>
            </View>

            <Eyebrow className="mt-8">{S.drivingNeed}</Eyebrow>
            <View className="mt-2">
              {crossing.requirements.map((r) => (
                <View key={r.label} className="border-b border-hairline py-3.5">
                  <Text className="font-medium text-[15px] text-ink">{r.label}</Text>
                  <Text className="mt-0.5 text-[13px] leading-5 text-body">
                    {r.detail}
                  </Text>
                </View>
              ))}
            </View>

            <Eyebrow className="mt-8">{S.drivingGoodToKnow}</Eyebrow>
            <View className="mt-3 flex-row flex-wrap justify-between">
              {crossing.goodToKnow.map((g) => (
                <View
                  key={g.label}
                  className="mb-3 w-[48%] rounded-card bg-panel px-4 py-3"
                >
                  <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-mute">
                    {g.label}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-ink">
                    {g.detail}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
