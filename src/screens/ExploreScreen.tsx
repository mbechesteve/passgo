import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { PamojaMap, type MapData } from "@/components/PamojaMap";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { fetchExplore } from "@/data/repository";
import type { ExploreItem, ExploreKind } from "@/types";

const SEGMENTS: { key: ExploreKind; label: string }[] = [
  { key: "event", label: S.exploreSegmentEvents },
  { key: "place", label: S.exploreSegmentPlaces },
  { key: "fan-zone", label: S.exploreSegmentFanZones },
];

/** Nairobi's centre — every seeded item sits in the city, so the map gets one
 *  city and a pin per item rather than a multi-city route. */
const NAIROBI = { id: "nairobi", name: "Nairobi", lat: -1.2864, lng: 36.8172 };

function toMapData(items: ExploreItem[]): MapData {
  return {
    cities: [NAIROBI],
    attractions: items.map((i) => ({
      id: i.id,
      name: i.name,
      lat: i.coords.lat,
      lng: i.coords.lng,
      category: i.kind,
      cityId: NAIROBI.id,
    })),
  };
}

/** Events are "coming up" until they start; fan zones open daily, so they always are. */
function isComingUp(item: ExploreItem, at: Date): boolean {
  if (item.startsAt) return new Date(item.startsAt).getTime() > at.getTime();
  return item.opensAt != null;
}

function Row({ item }: { item: ExploreItem }) {
  return (
    <View className="border-b border-hairline py-3.5">
      <Text className="font-medium text-[15px] text-ink">{item.name}</Text>
      <Text className="mt-1 text-[13px] text-body">{item.detail}</Text>
      {item.freeWithPass ? (
        <Text
          className="mt-1 font-mono text-[11px]"
          style={{ color: colors.accent }}
        >
          {S.exploreFreeEntry}
        </Text>
      ) : null}
    </View>
  );
}

export function ExploreScreen() {
  const [kind, setKind] = useState<ExploreKind>("event");
  const [items, setItems] = useState<ExploreItem[]>([]);

  useEffect(() => {
    void fetchExplore().then(setItems);
  }, []);

  const at = now();
  const visible = useMemo(() => items.filter((i) => i.kind === kind), [items, kind]);
  const comingUp = visible
    .filter((i) => isComingUp(i, at))
    .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
  const nearYou = visible.filter((i) => !isComingUp(i, at));

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <View className="mt-4 flex-row">
          {SEGMENTS.map((s) => (
            <Pill
              key={s.key}
              label={s.label}
              active={kind === s.key}
              onPress={() => setKind(s.key)}
            />
          ))}
        </View>

        {comingUp.length > 0 ? (
          <>
            <Eyebrow className="mt-6">{S.exploreComingUp}</Eyebrow>
            <View className="mt-2">
              {comingUp.map((i) => (
                <Row key={i.id} item={i} />
              ))}
            </View>
          </>
        ) : null}

        {nearYou.length > 0 ? (
          <>
            <Eyebrow className="mt-6">{S.exploreNearYou}</Eyebrow>
            <View className="mt-2">
              {nearYou.map((i) => (
                <Row key={i.id} item={i} />
              ))}
            </View>
          </>
        ) : null}

        {visible.length > 0 ? (
          <View className="mt-6">
            <PamojaMap data={toMapData(visible)} height={280} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
