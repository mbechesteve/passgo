import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";

export interface Tile {
  key: string;
  title: string;
  detail: string;
  icon: IconName;
  onPress: () => void;
}

/** The matchday services band. Two columns, so six tiles read as three rows. */
export function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {tiles.map((tile) => (
        <Pressable
          key={tile.key}
          onPress={tile.onPress}
          className="mb-3 w-[48%] rounded-card border border-hairline bg-canvas px-4 py-4 active:opacity-80"
        >
          <Icon name={tile.icon} size={18} color={colors.accent} />
          <Text className="mt-2.5 font-medium text-[15px] text-ink">
            {tile.title}
          </Text>
          <Text className="mt-0.5 text-[12px] leading-4 text-mute">
            {tile.detail}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
