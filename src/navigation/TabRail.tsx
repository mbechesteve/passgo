import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { colors } from "@/lib/theme";
import { RAIL_WIDTH, TOUCH_MIN } from "@/lib/layout";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { usePassStore } from "@/store/usePassStore";
import { eatParts } from "@/lib/clock";
import { passStatus, validityLabel } from "@/utils/pass";

/**
 * The tab bar as a rail down the left, for the wide arrangement.
 *
 * Bottom-tabs v6 has no side-bar option, and styling the built-in bar into one does not
 * work: its items live in an inner row container, so `flexDirection: "column"` on the bar
 * leaves them overlapping in the corner. Supplying our own bar is the supported route.
 *
 * At 232px it carries what the design canvas gives it — the wordmark, the destinations as
 * words rather than glyphs, and the Pass's own status pinned to the foot, so the
 * credential is legible from every screen without opening its tab. Icons are dropped
 * here: a label is unambiguous, and a rail wide enough for words does not need both.
 *
 * `tabPress` is emitted exactly as the built-in bar does, so a tab's own listeners fire.
 */
export function TabRail({ state, descriptors, navigation }: BottomTabBarProps) {
  const pass = usePassStore((s) => s.pass);
  const at = now();

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: RAIL_WIDTH,
        paddingTop: 24,
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: colors.deep,
      }}
    >
      <View className="px-2.5 pb-5">
        <Text className="font-display-heavy text-[24px] tracking-[-0.5px] text-white">
          {S.railWordmark}
        </Text>
        <Text className="mt-1 font-mono text-[10px] uppercase tracking-[1.2px] text-ondark-faint">
          {S.railSubtitle}
        </Text>
      </View>

      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];

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
            style={{ minHeight: TOUCH_MIN }}
            className={`mb-1 justify-center rounded-card px-2.5 ${
              focused ? "bg-accent" : "active:opacity-70"
            }`}
          >
            <Text
              className={`font-medium text-[15px] ${
                focused ? "text-white" : "text-ondark-mute"
              }`}
            >
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}

      {/* The credential, readable from anywhere. Pinned to the foot so it never
          competes with the destinations above it. */}
      <View className="mt-auto border-t border-deep-soft pt-4">
        {pass ? (
          <>
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-accent-soft">
              {passStatus(pass, at) === "active" ? S.passActive : S.railPassLabel}
            </Text>
            <Text className="mt-1 font-mono-medium text-[13px] text-white">
              {pass.id}
            </Text>
            <Text className="mt-1 font-mono text-[10px] text-ondark-faint">
              {validityLabel(pass, at)}
            </Text>
          </>
        ) : null}
        <Text className="mt-3 font-mono text-[10px] uppercase tracking-[1.2px] text-ondark-faint">
          {`${eatParts(at.toISOString()).day} · ${eatParts(at.toISOString()).time} EAT`}
        </Text>
      </View>
    </View>
  );
}
