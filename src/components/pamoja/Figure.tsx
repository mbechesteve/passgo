import { Text, View } from "react-native";

import { Eyebrow } from "./Eyebrow";

/** A headline number with its label above it, as the proposal sets its figures. */
export function Figure({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Eyebrow>{label}</Eyebrow>
      <Text className="mt-1.5 font-display text-[32px] tracking-[-0.5px] text-ink">
        {value}
      </Text>
    </View>
  );
}
