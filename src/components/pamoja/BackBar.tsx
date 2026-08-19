import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { TOUCH_MIN } from "@/lib/layout";
import { S } from "@/lib/strings";

/**
 * The way back out of a pushed screen, as the design draws it: a circular chevron
 * at the top left. The tab bar is what lets a fan leave a screen entirely; this is
 * what lets her retrace one step.
 *
 * It hides itself at the root of a stack, where there is nothing to go back to, so
 * it can be dropped into a screen without the screen knowing how it was reached.
 *
 * Every screen mounts it as a direct child of `Screen`, outside its own padded
 * column, so it carries its own `ml-5` to land on the same gutter as the content.
 * Without it the circle sits at x=0 and the chevron is clipped by the screen edge.
 */
export function BackBar() {
  const navigation = useNavigation();
  if (!navigation.canGoBack()) return null;
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel={S.back}
      style={{ minHeight: TOUCH_MIN, minWidth: TOUCH_MIN }}
      className="ml-5 mt-4 self-start items-center justify-center rounded-full border border-hairline bg-canvas active:opacity-70"
    >
      <Icon name="chevron-left" size={18} color={colors.ink} />
    </Pressable>
  );
}
