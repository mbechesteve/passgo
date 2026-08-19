import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { type IconName } from "@/components/Icon";
import { Pill } from "@/components/ui";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { CategoryTile } from "@/components/pamoja/CategoryTile";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { SearchField } from "@/components/pamoja/SearchField";
import { PamojaMap, type MapData } from "@/components/PamojaMap";
import { now } from "@/lib/clock";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { CATEGORIES, countsByCategory } from "@/utils/partners";
import { fetchExplore, fetchPartners } from "@/data/repository";
import type { ExploreItem, Partner } from "@/types";

type Filter = "all" | "venues" | "offers";

// Each filter carries a Feather glyph, as the reference's filter row does. "All" is
// given one too — a row where one pill alone has no icon reads as a mistake.
const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
  { key: "all", label: S.exploreFilterAll, icon: "list" },
  { key: "venues", label: S.exploreFilterVenues, icon: "map-pin" },
  { key: "offers", label: S.exploreFilterOffers, icon: "tag" },
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

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

export function PartnersScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    void fetchExplore().then(setItems);
    void fetchPartners().then(setPartners);
  }, []);

  const show = (f: Filter) => filter === "all" || filter === f;

  // "Venues" excludes events — an event under a filter named Venues is its own
  // false statement. "All" still shows both, via the events/places split below.
  const visibleItems = useMemo(
    () =>
      show("venues")
        ? items
            .filter((i) => filter !== "venues" || i.kind !== "event")
            .filter((i) => query === "" || matches(i.name + i.detail, query))
        : [],
    [items, filter, query]
  );

  // Search reaches every partner, not just the eat category — a lodge has to be
  // findable by name here, the same as it is from Services.
  const matchedOffers = useMemo(
    () =>
      show("offers")
        ? partners.filter((p) => query === "" || matches(p.name, query))
        : [],
    [partners, filter, query]
  );
  const eatOffers = matchedOffers.filter((p) => p.category === "eat").slice(0, 6);
  const otherOffers = matchedOffers
    .filter((p) => p.category !== "eat")
    .slice(0, 6);

  const counts = countsByCategory(partners);
  const events = visibleItems.filter((i) => i.kind === "event");
  const places = visibleItems.filter((i) => i.kind !== "event");
  const empty =
    visibleItems.length === 0 &&
    eatOffers.length === 0 &&
    otherOffers.length === 0;

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.partnersTitle}
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
              icon={f.icon}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </View>

        {/* The network's own surface. This band and its counts are why the
            2,189-partner dataset exists, and they came here when Services split —
            without it the split would have quietly dropped a proposal figure. */}
        <Eyebrow className="mt-8">
          {`${partners.length.toLocaleString("en-US")} partner businesses`}
        </Eyebrow>
        <View className="mt-4 flex-row flex-wrap justify-between">
          {CATEGORIES.map((c) => (
            <View key={c} className="w-[48%]">
              <CategoryTile
                category={c}
                count={counts[c]}
                onPress={() => navigation.navigate("Category", { category: c })}
              />
            </View>
          ))}
        </View>

        {empty ? (
          <Text className="mt-8 text-[15px] leading-6 text-body">
            {S.exploreNoResults}
          </Text>
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

        {eatOffers.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreEatNearby}</Eyebrow>
            <View className="mt-2">
              {eatOffers.map((p) => (
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

        {otherOffers.length > 0 ? (
          <>
            <Eyebrow className="mt-8">{S.exploreOtherOffers}</Eyebrow>
            <View className="mt-2">
              {otherOffers.map((p) => (
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
