import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { SearchField } from "@/components/pamoja/SearchField";
import { PamojaMap, type MapData } from "@/components/PamojaMap";
import { now } from "@/lib/clock";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { fetchExplore, fetchMatches, fetchPartners } from "@/data/repository";
import { daysUntilLabel, kickoffLabel, matchLabel } from "@/utils/match";
import type { ExploreItem, Match, Partner } from "@/types";

type Filter = "all" | "fixtures" | "venues" | "offers";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: S.exploreFilterAll },
  { key: "fixtures", label: S.exploreFilterFixtures },
  { key: "venues", label: S.exploreFilterVenues },
  { key: "offers", label: S.exploreFilterOffers },
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

function matches(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

function Row({ item }: { item: ExploreItem }) {
  return (
    <View className="border-b border-hairline py-3.5">
      <Text className="font-medium text-[15px] text-ink">{item.name}</Text>
      <Text className="mt-1 text-[13px] text-body">{item.detail}</Text>
      {item.freeWithPass ? (
        <Text className="mt-1 font-mono text-[11px]" style={{ color: colors.accent }}>
          {S.exploreFreeEntry}
        </Text>
      ) : null}
    </View>
  );
}

export function ExploreScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    void fetchExplore().then(setItems);
    void fetchMatches().then(setFixtures);
    void fetchPartners().then(setPartners);
  }, []);

  const at = now();
  const show = (f: Filter) => filter === "all" || filter === f;

  const visibleFixtures = useMemo(
    () =>
      show("fixtures")
        ? fixtures
            .filter(
              (m) =>
                new Date(m.kickoff).getTime() > at.getTime() &&
                (query === "" || matches(matchLabel(m) + m.venue, query))
            )
            .sort(
              (a, b) =>
                new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
            )
            .slice(0, 5)
        : [],
    [fixtures, filter, query, at]
  );

  const visibleItems = useMemo(
    () =>
      show("venues")
        ? items.filter((i) => query === "" || matches(i.name + i.detail, query))
        : [],
    [items, filter, query]
  );

  const visibleOffers = useMemo(
    () =>
      show("offers")
        ? partners
            .filter(
              (p) => p.category === "eat" && (query === "" || matches(p.name, query))
            )
            .slice(0, 6)
        : [],
    [partners, filter, query]
  );

  const events = visibleItems.filter((i) => i.kind === "event");
  const places = visibleItems.filter((i) => i.kind !== "event");
  const empty =
    visibleFixtures.length === 0 &&
    visibleItems.length === 0 &&
    visibleOffers.length === 0;

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.exploreTitle}
        </Text>

        <View className="mt-3">
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={S.explorePlaceholder}
          />
        </View>

        <View className="mt-3 flex-row">
          {FILTERS.map((f) => (
            <Pill
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>

        {empty ? (
          <Text className="mt-8 text-[15px] leading-6 text-body">
            {S.exploreNoResults}
          </Text>
        ) : null}

        {visibleFixtures.length > 0 ? (
          <>
            <Eyebrow className="mt-6">{S.exploreThisWeek}</Eyebrow>
            <View className="mt-2">
              {visibleFixtures.map((m) => (
                <View
                  key={m.id}
                  className="flex-row items-center justify-between border-b border-hairline py-3.5"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-[15px] text-ink">
                      {matchLabel(m)}
                    </Text>
                    <Text className="mt-0.5 font-mono text-[11px] text-mute">
                      {kickoffLabel(m)}
                    </Text>
                  </View>
                  <Chip label={daysUntilLabel(m, at)} tone="panel" />
                </View>
              ))}
            </View>
          </>
        ) : null}

        {events.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreEventsNearYou}</Eyebrow>
            <View className="mt-2">
              {events.map((i) => (
                <Row key={i.id} item={i} />
              ))}
            </View>
          </>
        ) : null}

        {visibleOffers.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreEatNearby}</Eyebrow>
            <View className="mt-2">
              {visibleOffers.map((p) => (
                <OfferRow
                  key={p.id}
                  partner={p}
                  subline={p.ward}
                  onPress={() =>
                    navigation.navigate("Partner", { partnerId: p.id })
                  }
                />
              ))}
            </View>
          </>
        ) : null}

        {places.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreThingsToSee}</Eyebrow>
            <View className="mt-2">
              {places.map((i) => (
                <Row key={i.id} item={i} />
              ))}
            </View>
          </>
        ) : null}

        {visibleItems.length > 0 ? (
          <View className="mt-8">
            <PamojaMap data={toMapData(visibleItems)} height={280} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
