import { Text, View } from "react-native";

import type { PassEvent } from "@/types";
import { recordLine } from "@/utils/record";

/**
 * One line of the record, set in mono — which is the point. "Every tap, scan and
 * purchase, written the moment it happens. Not a survey, not an estimate, not
 * reconstructed months later."
 */
export function RecordLine({ event }: { event: PassEvent }) {
  const { primary, secondary } = recordLine(event);
  return (
    <View className="border-b border-hairline py-3.5">
      <Text className="font-mono-medium text-[14px] text-ink">{primary}</Text>
      <Text className="mt-1 font-mono text-[12px] text-mute">{secondary}</Text>
    </View>
  );
}
