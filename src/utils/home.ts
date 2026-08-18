import type { PassEvent } from "@/types";
import { hasBorderEvent } from "@/utils/record";

/**
 * "A fan who lives here gets the match, the route and their savings… A fan who
 * flew in gets validity, the border and a city they have never visited. Same
 * four tabs underneath." — Figure 3 commentary.
 */
export function homeVariant(events: PassEvent[]): "resident" | "arrived" {
  return hasBorderEvent(events) ? "arrived" : "resident";
}
