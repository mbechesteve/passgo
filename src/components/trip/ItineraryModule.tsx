import { Text, View } from "react-native";

import { Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import type { ItineraryDay, Trip } from "@/types";

export function ItineraryModule({ trip }: { trip: Trip }) {
  const days = trip.schedule ?? [];
  if (days.length === 0) {
    return <Text className="text-ink-500">No itinerary yet.</Text>;
  }
  return (
    <View>
      {days.map((day) => (
        <DayCard key={day.id} day={day} />
      ))}
    </View>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <Card className="mb-3 p-4">
      <Text className="text-[12px] font-bold uppercase text-ink-400">{day.date ?? ""}</Text>
      <Text className="mb-2 text-[16px] font-semibold text-ink-900">{day.location}</Text>

      {day.plan.map((line, i) => (
        <View key={i} className="flex-row items-start py-0.5">
          <Icon name="chevron-right" size={14} color={colors.ink[400]} />
          <Text className="ml-1.5 flex-1 text-[13.5px] text-ink-700">{line}</Text>
        </View>
      ))}

      {day.blocks?.map((b, i) => (
        <View key={i} className="mt-2 flex-row">
          <Text className="w-24 text-[12px] font-semibold text-ink-500">{b.time}</Text>
          <View className="flex-1">
            <Text className="text-[13.5px] text-ink-900">{b.activity}</Text>
            {b.area ? <Text className="text-[11.5px] text-ink-400">{b.area}</Text> : null}
          </View>
        </View>
      ))}

      {day.notes ? (
        <Text className="mt-2 rounded-xl bg-surface-muted px-3 py-2 text-[12.5px] text-ink-700">
          {day.notes}
        </Text>
      ) : null}
    </Card>
  );
}
