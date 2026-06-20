import { ScrollView, Text, View } from "react-native";

import type { Attraction, City } from "@/types";
import { colors } from "@/lib/theme";
import { distanceKm, km } from "@/utils/format";
import { Icon } from "./Icon";

export interface MapData {
  cities: City[];
  attractions: Attraction[];
  /** Ordered city ids to draw a route line through. */
  routeCityIds?: string[];
}

/**
 * Route preview shown on web (where react-native-maps has no build) and as a
 * graceful fallback if the native maps module fails to load. Lists ordered
 * stops with inter-city distances and per-city spot counts.
 */
export function MapRouteList({ data, height }: { data: MapData; height: number }) {
  const ordered = (data.routeCityIds ?? data.cities.map((c) => c.id))
    .map((id) => data.cities.find((c) => c.id === id))
    .filter((c): c is City => !!c);

  return (
    <View
      className="rounded-card border border-surface-sunken bg-surface-muted p-4"
      style={{ minHeight: height }}
    >
      <View className="mb-3 flex-row items-center">
        <Icon name="map" size={15} color={colors.ink[700]} />
        <Text className="ml-2 text-[13px] font-semibold text-ink-700">
          Route preview
        </Text>
        <View className="ml-auto rounded-full bg-ocean-100 px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-ocean-700">
            Live map on device
          </Text>
        </View>
      </View>
      <ScrollView>
        {ordered.map((city, i) => {
          const next = ordered[i + 1];
          const pins = data.attractions.filter((a) => a.cityId === city.id);
          return (
            <View key={city.id}>
              <View className="flex-row items-center">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-700">
                  <Text className="text-[11px] font-semibold text-white">
                    {i + 1}
                  </Text>
                </View>
                <Text className="ml-2 text-[14px] font-bold text-ink-900">
                  {city.name}
                </Text>
                <View className="ml-auto flex-row items-center">
                  <Icon name="map-pin" size={11} color={colors.ink[400]} />
                  <Text className="ml-1 text-[11px] text-ink-400">
                    {pins.length} spots
                  </Text>
                </View>
              </View>
              {next ? (
                <View className="my-1.5 ml-3 flex-row items-center">
                  <View className="h-5 w-px bg-brand-200" />
                  <Text className="ml-3 text-[11px] font-medium text-ink-500">
                    ↓ {km(distanceKm(city, next))} to {next.name}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Frame a region around all cities with padding (native maps initialRegion). */
export function regionFor(cities: City[]) {
  if (cities.length === 0) {
    return { latitude: 0, longitude: 20, latitudeDelta: 60, longitudeDelta: 60 };
  }
  const lats = cities.map((c) => c.lat);
  const lngs = cities.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.4, (maxLat - minLat) * 1.6),
    longitudeDelta: Math.max(0.4, (maxLng - minLng) * 1.6),
  };
}
