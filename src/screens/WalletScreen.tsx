import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { BackBar } from "@/components/pamoja/BackBar";
import { Chip } from "@/components/pamoja/Chip";
import { Donut } from "@/components/pamoja/Donut";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { Figure } from "@/components/pamoja/Figure";
import { RecordLine } from "@/components/pamoja/RecordLine";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { useRecordStore } from "@/store/useRecordStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { defaultMethod, describeMethod } from "@/utils/payment";
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
  const navigation = useNavigation<any>();
  const events = useRecordStore((s) => s.events);
  const methods = usePaymentStore((s) => s.methods);
  const method = defaultMethod(methods);
  const storageError = useRecordStore((s) => s.storageError);
  const groups = groupByDay(events);
  const offers = offersUsed(events);

  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.walletTitle}
        </Text>

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
                {S.walletSavedWithApp}
              </Text>
              <Text className="mt-0.5 text-[13px] text-body">
                {`${offers} ${
                  offers === 1
                    ? S.walletOfferThisTournament
                    : S.walletOffersThisTournament
                }`}
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

        {/* A preference, not a balance. There is nothing to top up here — see the
            note on PaymentMethod in @/types for why that is a product rule. */}
        <Pressable
          onPress={() => navigation.navigate("PaymentMethod")}
          accessibilityRole="button"
          className="mt-6 flex-row items-center justify-between rounded-card border border-hairline bg-canvas px-5 py-4 active:opacity-80"
        >
          <View className="flex-1 pr-3">
            <Text className="font-medium text-[15px] text-ink">{S.payHowYouPay}</Text>
            <Text className="mt-0.5 font-mono text-[12px] text-mute">
              {method ? describeMethod(method) : S.payNoneSaved}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mute} />
        </Pressable>

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
