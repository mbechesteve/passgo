import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Chip } from "@/components/pamoja/Chip";
import { Donut } from "@/components/pamoja/Donut";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { Figure } from "@/components/pamoja/Figure";
import { RecordLine } from "@/components/pamoja/RecordLine";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { useRecordStore } from "@/store/useRecordStore";
import { kes } from "@/utils/format";
import {
  groupByDay,
  offersUsed,
  savingsRate,
  totalSaved,
  totalSpent,
  weekSavings,
} from "@/utils/record";

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
              {S.walletStorageError}
            </Text>
          </View>
        ) : null}

        <View className="mt-6 flex-row">
          <View className="flex-1">
            <Figure value={kes(totalSaved(events))} label={S.walletYouveSaved} />
          </View>
          <View className="flex-1">
            <Figure value={kes(totalSpent(events))} label={S.walletYouveSpent} />
          </View>
        </View>

        {events.length > 0 ? (
          <View className="mt-6 flex-row items-center rounded-card border border-hairline bg-canvas px-4 py-4">
            <Donut value={savingsRate(events)} label={S.walletSavedWithApp} />
            <View className="ml-4 flex-1">
              <Text className="font-medium text-[15px] text-ink">
                {`${S.walletSavedWithApp}: ${kes(totalSaved(events))}`}
              </Text>
              <Text className="mt-0.5 text-[13px] text-body">
                {`${offersUsed(events)} ${S.walletOffersThisTournament}`}
              </Text>
            </View>
            {weekSavings(events, now()) > 0 ? (
              <Chip
                label={`+${weekSavings(events, now())} ${S.walletThisWeek}`}
                tone="tint"
              />
            ) : null}
          </View>
        ) : null}

        {groups.length === 0 ? (
          <Text className="mt-10 text-[15px] leading-6 text-body">
            {S.walletEmptyState}
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
          {S.walletClosingNote}
        </Text>
      </ScrollView>
    </Screen>
  );
}
