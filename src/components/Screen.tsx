import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CONTENT_MAX } from "@/lib/layout";
import { useLayoutMode } from "@/lib/useLayout";

/**
 * Standard screen shell: safe area + app background.
 *
 * In the wide arrangement the content is centred in a column of its own rather than
 * spread across a desktop viewport — one choke point, so every screen gets the same
 * measure without knowing the breakpoint exists. The background still fills the
 * whole scene, so the column reads as a column and not as a floating card.
 */
export function Screen({
  children,
  edges = ["top"],
  className = "",
}: {
  children: ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
  className?: string;
}) {
  const wide = useLayoutMode() === "wide";
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-surface">
      <View
        className={`flex-1 ${className}`}
        style={wide ? { width: "100%", maxWidth: CONTENT_MAX, alignSelf: "center" } : undefined}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
