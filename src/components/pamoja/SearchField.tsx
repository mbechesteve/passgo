import { TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";

/** The search box atop Services and category lists. */
export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-row items-center rounded-card border border-hairline bg-canvas px-4 py-3">
      <Icon name="search" size={16} color={colors.faint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        className="ml-2.5 flex-1 text-[15px] text-ink"
      />
    </View>
  );
}
