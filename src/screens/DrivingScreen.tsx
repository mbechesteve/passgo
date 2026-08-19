import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { RouteStrip } from "@/components/pamoja/RouteStrip";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { S } from "@/lib/strings";
import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { fetchBorderCrossings, fetchParking } from "@/data/repository";
import { dateLabel } from "@/utils/format";
import { walkRangeLabel } from "@/utils/parking";
import type { BorderCrossing, OriginCountry, ParkingZone } from "@/types";

export function DrivingScreen() {
  const navigation = useNavigation<any>();
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [origin, setOrigin] = useState<OriginCountry>("UG");

  useEffect(() => {
    void fetchBorderCrossings().then(setCrossings);
    void fetchParking().then(setZones);
  }, []);

  const crossing = crossings.find((c) => c.origin === origin);
  const walk = walkRangeLabel(zones);

  // Both rows carry figures the app already stands behind elsewhere — the shuttle
  // interval as Services words it, the walk range derived from the very zones the
  // Parking screen lists. Nothing here is a new claim about Nairobi transport.
  const legs = [
    {
      key: "shuttle",
      title: S.servicesShuttles,
      detail: S.servicesShuttlesDetail,
      onPress: () => navigation.navigate("Category", { category: "move" }),
    },
    {
      key: "park",
      title: S.drivingParkAndWalk,
      detail: walk
        ? `${S.servicesParkingDetail} · ${walk} ${S.parkingWalkSuffix}`
        : S.servicesParkingDetail,
      onPress: () => navigation.navigate("Parking"),
    },
  ];

  return (
    <Screen>
      <BackBar />
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
                      value: `~${crossing.distanceKm.toLocaleString("en-US")} km`,
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

            <Text className="mt-6 font-mono text-[11px] leading-4 text-mute">
              {`${S.drivingAsOfPrefix} ${dateLabel(crossing.asOf)}. ${S.drivingConfirmCaveat}`}
            </Text>
          </>
        ) : null}

        <Eyebrow className="mt-8">{S.drivingOnceInNairobi}</Eyebrow>
        <View className="mt-2">
          {legs.map((leg) => (
            <Pressable
              key={leg.key}
              onPress={leg.onPress}
              className="flex-row items-center border-b border-hairline py-3.5 active:opacity-70"
            >
              <View className="flex-1 pr-3">
                <Text className="font-medium text-[15px] text-ink">{leg.title}</Text>
                <Text className="mt-0.5 text-[13px] leading-5 text-body">
                  {leg.detail}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.mute} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
