import { useMemo } from "react";
import { View } from "react-native";

import type { City } from "@/types";
import { colors } from "@/lib/theme";
import { MapRouteList, regionFor, type MapData } from "./mapRoute";

export type { MapData } from "./mapRoute";

/**
 * Native map (iOS/Android). Renders react-native-maps with a marker per city
 * (the cluster anchor), attraction pins, and a dashed polyline route between
 * cities. Metro picks PassGoMap.web.tsx on web, so this file's native-only
 * `require` is never bundled for web.
 *
 * Named PassGoMap to avoid colliding with react-native-maps' own MapView.
 */
export function PassGoMap({ data, height = 320 }: { data: MapData; height?: number }) {
  const region = useMemo(() => regionFor(data.cities), [data.cities]);

  let Maps: typeof import("react-native-maps");
  try {
    Maps = require("react-native-maps");
  } catch {
    return <MapRouteList data={data} height={height} />;
  }
  const { default: MapView, Marker, Polyline, PROVIDER_GOOGLE } = Maps as any;

  const routeCoords = (data.routeCityIds ?? data.cities.map((c) => c.id))
    .map((id) => data.cities.find((c) => c.id === id))
    .filter((c): c is City => !!c)
    .map((c) => ({ latitude: c.lat, longitude: c.lng }));

  return (
    <View className="overflow-hidden rounded-card" style={{ height }}>
      <MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={region}>
        {data.cities.map((c) => (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.lat, longitude: c.lng }}
            title={c.name}
            description={c.blurb}
            pinColor={colors.brand[700]}
          />
        ))}
        {data.attractions.map((a) => (
          <Marker
            key={a.id}
            coordinate={{ latitude: a.lat, longitude: a.lng }}
            title={a.name}
            description={a.category}
            pinColor={colors.ocean[600]}
            opacity={0.9}
          />
        ))}
        {routeCoords.length > 1 ? (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.brand[600]}
            strokeWidth={3}
            lineDashPattern={[6, 6]}
          />
        ) : null}
      </MapView>
    </View>
  );
}
