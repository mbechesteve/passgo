import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";

export function CheckRow({
  label,
  checked,
  onToggle,
  meta,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  meta?: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center py-2.5"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-md border ${
          checked ? "border-brand-700 bg-brand-700" : "border-ink-400 bg-surface"
        }`}
      >
        {checked ? <Icon name="check" size={13} color="#fff" /> : null}
      </View>
      <Text
        className={`ml-3 flex-1 text-[14px] ${
          checked ? "text-ink-400 line-through" : "text-ink-900"
        }`}
      >
        {label}
      </Text>
      {meta ? <Text className="ml-2 text-[12px] text-ink-500">{meta}</Text> : null}
    </Pressable>
  );
}
