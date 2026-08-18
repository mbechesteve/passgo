import { Text, View } from "react-native";

import { Screen } from "@/components/Screen";

export function HomeScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-ink">Home</Text>
      </View>
    </Screen>
  );
}
