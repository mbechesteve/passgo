import { Text, View } from "react-native";

import { Screen } from "@/components/Screen";

export function PassScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-ink">Pass</Text>
      </View>
    </Screen>
  );
}
