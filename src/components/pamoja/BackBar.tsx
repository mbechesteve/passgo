import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";

/**
 * The way back out of a pushed screen, as the design draws it: a circular chevron
 * at the top left. The tab bar is what lets a fan leave a screen entirely; this is
 * what lets her retrace one step.
 *
 * It hides itself at the root of a stack, where there is nothing to go back to, so
 * it can be dropped into a screen without the screen knowing how it was reached.
 */
export function BackBar() {
  const navigation = useNavigation();
  if (!navigation.canGoBack()) return null;
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel={S.back}
      className="mt-4 h-9 w-9 items-center justify-center rounded-full border border-hairline bg-canvas active:opacity-70"
    >
      <Icon name="chevron-left" size={18} color={colors.ink} />
    </Pressable>
  );
}
