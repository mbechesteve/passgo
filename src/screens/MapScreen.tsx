import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { CityGroup } from "@/components/CityGroup";
import { Icon } from "@/components/Icon";
import { PassGoMap } from "@/components/PassGoMap";
import { PremiumLock } from "@/components/PremiumLock";
import { Screen } from "@/components/Screen";
import { Button, Card } from "@/components/ui";
import { colors, regionColor } from "@/lib/theme";
import { fetchCountryGraph } from "@/data/repository";
import { getCountryByCode } from "@/data/mockCountries";
import { groupItemsByCity, useTripStore } from "@/store/useTripStore";
import type { Attraction, City } from "@/types";
import { distanceKm, km } from "@/utils/format";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MapScreen() {
  const nav = useNavigation<Nav>();
  const trips = useTripStore((s) => s.trips);
  const activeTripId = useTripStore((s) => s.activeTripId);
  const trip = trips.find((t) => t.id === activeTripId) ?? trips[0];

  const [graph, setGraph] = useState<{ cities: City[]; attractions: Attraction[] }>(
    { cities: [], attractions: [] }
  );

  useEffect(() => {
    if (trip) fetchCountryGraph(trip.countryCode).then(setGraph);
  }, [trip?.countryCode]);

  const grouped = useMemo(() => groupItemsByCity(trip), [trip]);

  if (!trip) {
    return (
      <Screen className="px-6">
        <Header title="Map View" />
        <View className="flex-1 items-center justify-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
            <Icon name="map" size={28} color={colors.ink[400]} />
          </View>
          <Text className="mt-3 text-[17px] font-semibold text-ink-900">
            No trip to map yet
          </Text>
          <Text className="mt-1 text-center text-[13px] text-ink-500">
            Plan a trip and your cities and attractions will appear here with
            routes and distances.
          </Text>
          <Button
            title="Browse countries"
            className="mt-5 px-6"
            onPress={() => nav.navigate("Tabs", { screen: "Discover" })}
          />
        </View>
      </Screen>
    );
  }

  const country = getCountryByCode(trip.countryCode);

  // Cities in the trip that have planned items → the route.
  const routeCities = graph.cities.filter(
    (c) => (grouped.get(c.id)?.length ?? 0) > 0
  );
  const routeCityIds = routeCities.map((c) => c.id);

  // Only show planned attractions on the map (fallback to all if none planned).
  const plannedAttractionIds = new Set(
    trip.items.map((i) => i.attractionId).filter(Boolean) as string[]
  );
  const mapAttractions =
    plannedAttractionIds.size > 0
      ? graph.attractions.filter((a) => plannedAttractionIds.has(a.id))
      : graph.attractions;
  const mapCities = routeCities.length > 0 ? routeCities : graph.cities;

  const totalKm = routeCities.reduce((sum, c, i) => {
    const next = routeCities[i + 1];
    return next ? sum + distanceKm(c, next) : sum;
  }, 0);

  return (
    <Screen>
      <Header title="Map View" subtitle={`${country?.flag} ${trip.title}`} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <PassGoMap
          data={{
            cities: mapCities,
            attractions: mapAttractions,
            routeCityIds,
          }}
          height={340}
        />

        {/* Route summary */}
        <Card className="mt-4 flex-row items-center p-4">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
            <Icon name="navigation" size={18} color={colors.ink[700]} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-semibold text-ink-900">
              {mapCities.length} cities · {mapAttractions.length} stops
            </Text>
            <Text className="text-[12px] text-ink-500">
              {totalKm > 0 ? `≈ ${km(totalKm)} city-to-city` : "Single base"}
            </Text>
          </View>
        </Card>

        {/* Offline maps — Premium */}
        <View className="mt-4">
          <PremiumLock
            title="Download offline maps"
            blurb="Save this route to use without data while you travel."
            onUpgrade={() => nav.navigate("Paywall", { source: "map" })}
          >
            <Card className="flex-row items-center p-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
                <Icon name="download" size={18} color={colors.ink[700]} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-semibold text-ink-900">
                  Offline map ready
                </Text>
                <Text className="text-[12px] text-ink-500">
                  Cached for {country?.name}.
                </Text>
              </View>
            </Card>
          </PremiumLock>
        </View>

        {/* Per-city groups */}
        <Text className="mb-3 mt-6 text-[17px] font-semibold text-ink-900">
          Stops by city
        </Text>
        {mapCities.map((city, idx) => {
          const items = grouped.get(city.id) ?? [];
          const planned =
            items.length > 0
              ? items
              : graph.attractions
                  .filter((a) => a.cityId === city.id)
                  .map((a) => ({
                    id: a.id,
                    cityId: city.id,
                    title: a.name,
                    order: 0,
                  }));
          return (
            <CityGroup
              key={city.id}
              city={city}
              index={idx}
              count={planned.length}
              accentColor={country ? regionColor(country.region) : undefined}
            >
              <View className="flex-row flex-wrap gap-1.5">
                {planned.map((p) => (
                  <View
                    key={p.id}
                    className="flex-row items-center rounded-full border border-surface-sunken bg-surface-muted px-3 py-1.5"
                  >
                    <Icon name="map-pin" size={11} color={colors.ink[500]} />
                    <Text className="ml-1.5 text-[12px] font-semibold text-ink-700">
                      {p.title}
                    </Text>
                  </View>
                ))}
              </View>
            </CityGroup>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const Header = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View className="px-4 pb-2 pt-2">
    <Text className="text-[26px] font-semibold text-ink-900">{title}</Text>
    {subtitle ? (
      <Text className="text-[13px] font-semibold text-ink-400">{subtitle}</Text>
    ) : null}
  </View>
);
