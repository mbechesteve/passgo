import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Standard screen shell: safe area + app background. */
export function Screen({
  children,
  edges = ["top"],
  className = "",
}: {
  children: ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
  className?: string;
}) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-surface">
      <View className={`flex-1 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
