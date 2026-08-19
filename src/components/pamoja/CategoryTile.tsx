import { Pressable, Text } from "react-native";

import type { PartnerCategory } from "@/types";
import { CATEGORY_LABEL } from "@/utils/partners";

/** A Services tile. The count is derived, so it can never overstate the network. */
export function CategoryTile({
  category,
  count,
  onPress,
}: {
  category: PartnerCategory;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-3 flex-1 rounded-card border border-hairline bg-panel px-4 py-5 active:opacity-80"
    >
      <Text className="font-medium text-[17px] text-ink">
        {CATEGORY_LABEL[category]}
      </Text>
      <Text className="mt-1 font-mono text-[12px] text-mute">
        {count.toLocaleString("en-US")} partners
      </Text>
    </Pressable>
  );
}
