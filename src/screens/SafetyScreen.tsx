import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { BackBar } from "@/components/pamoja/BackBar";
import { S } from "@/lib/strings";

const ROWS = [
  { key: "help", title: S.safetyHelpLine, detail: S.safetyHelpLineDetail },
  { key: "report", title: S.safetyReport, detail: S.safetyReportDetail },
];

export function SafetyScreen() {
  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.safetyTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.safetyStandfirst}
        </Text>

        <View className="mt-6">
          {ROWS.map((r) => (
            <View key={r.key} className="border-b border-hairline py-3.5">
              <Text className="font-medium text-[15px] text-ink">{r.title}</Text>
              <Text className="mt-0.5 text-[13px] leading-5 text-body">
                {r.detail}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
