import { MapRouteList, type MapData } from "./mapRoute";

export type { MapData } from "./mapRoute";

/**
 * Web build of PassGoMap. react-native-maps has no web bundle, so on web we
 * render the route-list preview only. Metro resolves this file over
 * PassGoMap.tsx for the web platform automatically.
 */
export function PassGoMap({ data, height = 320 }: { data: MapData; height?: number }) {
  return <MapRouteList data={data} height={height} />;
}
