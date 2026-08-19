import { Text, View } from "react-native";

import { initials } from "@/utils/format";

/** The holder's initials, top-right of Home. */
export function Avatar({ name }: { name: string }) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full bg-deep">
      <Text className="font-display text-[14px] tracking-[0.5px] text-white">
        {initials(name)}
      </Text>
    </View>
  );
}
