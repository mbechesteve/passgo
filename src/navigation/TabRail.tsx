import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { colors } from "@/lib/theme";
import { RAIL_WIDTH } from "@/lib/layout";

/**
 * The tab bar as a rail down the left, for the wide arrangement.
 *
 * Bottom-tabs v6 has no side-bar option, and styling the built-in bar into one does
 * not work: its items live in an inner row container, so a `flexDirection: "column"`
 * on the bar itself leaves them overlapping in the corner. Supplying our own bar for
 * this arrangement is the supported route.
 *
 * It renders each route's own `tabBarIcon` and `title` from the navigator's options
 * rather than keeping a second list of icons and labels in step — the Explore tab's
 * PeakIcon reaches the rail for free — and emits `tabPress` exactly as the built-in
 * bar does, so a tab's own listeners still fire.
 */
export function TabRail({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: RAIL_WIDTH,
        paddingTop: 20,
        borderRightWidth: 1,
        borderRightColor: colors.hairline,
        backgroundColor: colors.canvas,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const color = focused ? colors.accent : colors.faint;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            className="items-center py-3.5 active:opacity-70"
          >
            {options.tabBarIcon?.({ focused, color, size: 21 })}
            <Text className="mt-1.5 font-medium text-[11px]" style={{ color }}>
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
