import { ReactNode } from "react";
import { Text, View } from "react-native";

import type { City } from "@/types";
import { resizePicsum } from "@/data/images";
import { AppImage } from "./AppImage";

/**
 * A city section header used in Country Detail, the Planner and the Map sheet.
 * Renders the city's image, name, day estimate and an optional count badge,
 * with arbitrary children below (attraction cards, planner rows, etc.).
 */
export function CityGroup({
  city,
  count,
  index,
  accentColor,
  children,
  right,
}: {
  city: City;
  count?: number;
  index?: number;
  /** Region accent for the step number (defaults to brand ink). */
  accentColor?: string;
  children?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View className="mb-5">
      <View className="mb-3 flex-row items-center">
        <AppImage
          uri={resizePicsum(city.image, 120, 120)}
          className="h-12 w-12 rounded-xl"
        />
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            {typeof index === "number" ? (
              <View
                className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-brand-700"
                style={accentColor ? { backgroundColor: accentColor } : undefined}
              >
                <Text className="text-[11px] font-semibold text-white">
                  {index + 1}
                </Text>
              </View>
            ) : null}
            <Text className="text-[16px] font-semibold text-ink-900">
              {city.name}
            </Text>
          </View>
          <Text className="text-[12px] text-ink-500" numberOfLines={1}>
            {typeof count === "number"
              ? `${count} ${count === 1 ? "activity" : "activities"} · ~${city.suggestedDays} days`
              : city.blurb}
          </Text>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}
