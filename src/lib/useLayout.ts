import { useWindowDimensions } from "react-native";

import { layoutMode, type LayoutMode } from "./layout";

/** `layoutMode` against the live viewport. Re-runs on resize on the web. */
export function useLayoutMode(): LayoutMode {
  return layoutMode(useWindowDimensions().width);
}
