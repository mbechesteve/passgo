import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Icon } from "@/components/Icon";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { PassCard } from "@/components/pamoja/PassCard";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { fetchEntitlements } from "@/data/repository";
import { usePassStore } from "@/store/usePassStore";
import { forCountry } from "@/utils/entitlements";
import type { Entitlement } from "@/types";

export function PassScreen() {
  const navigation = useNavigation<any>();
  const pass = usePassStore((s) => s.pass);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  useEffect(() => {
    void fetchEntitlements().then(setEntitlements);
  }, []);

  // The navigator only renders the tabs when a Pass exists.
  if (!pass) return null;

  const mine = forCountry(entitlements, pass.issuedIn);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <View className="mt-4">
          <PassCard pass={pass} />
        </View>

        <Eyebrow className="mt-8">{S.passUnlocksHeading}</Eyebrow>
        <View className="mt-2">
          {mine.map((e) => (
            <View key={e.id} className="border-b border-hairline py-3.5">
              <Text className="font-medium text-[15px] text-ink">{e.label}</Text>
              <Text className="mt-1 text-[13px] leading-5 text-body">{e.detail}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => navigation.navigate("Wallet")}
          className="mt-6 flex-row items-center justify-between rounded-card border border-hairline bg-canvas px-5 py-4 active:opacity-80"
        >
          <View>
            <Text className="font-medium text-[15px] text-ink">
              {S.passWalletTitle}
            </Text>
            <Text className="mt-0.5 text-[13px] text-body">
              {S.passWalletSubtitle}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mute} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
