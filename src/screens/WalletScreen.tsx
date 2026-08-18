import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { Figure } from "@/components/pamoja/Figure";
import { RecordLine } from "@/components/pamoja/RecordLine";
import { useRecordStore } from "@/store/useRecordStore";
import { kes } from "@/utils/format";
import { groupByDay, totalSaved, totalSpent } from "@/utils/record";

export function WalletScreen() {
  const events = useRecordStore((s) => s.events);
  const storageError = useRecordStore((s) => s.storageError);
  const groups = groupByDay(events);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        {storageError ? (
          <View className="mt-4 rounded-card border border-hairline bg-panel px-4 py-3">
            <Text className="text-[13px] leading-5 text-ink">
              Your record could not be saved to this device. Recent lines may be
              missing.
            </Text>
          </View>
        ) : null}

        <View className="mt-6 flex-row">
          <View className="flex-1">
            <Figure value={kes(totalSaved(events))} label="You've saved" />
          </View>
          <View className="flex-1">
            <Figure value={kes(totalSpent(events))} label="You've spent" />
          </View>
        </View>

        {groups.length === 0 ? (
          <Text className="mt-10 text-[15px] leading-6 text-body">
            Nothing yet. Every time you use your Pass, one line is written here
            — and nowhere else.
          </Text>
        ) : (
          groups.map((g) => (
            <View key={g.day} className="mt-8">
              <Eyebrow>{g.day}</Eyebrow>
              <View className="mt-2">
                {g.events.map((e) => (
                  <RecordLine key={e.id} event={e} />
                ))}
              </View>
            </View>
          ))
        )}

        <Text className="mt-10 font-mono text-[11px] leading-4 text-mute">
          This record is yours, and it is held on this device. No dashboard
          anywhere assembles this view of you.
        </Text>
      </ScrollView>
    </Screen>
  );
}
