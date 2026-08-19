import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { BackBar } from "@/components/pamoja/BackBar";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { colors } from "@/lib/theme";
import { usePartnerStore } from "@/store/usePartnerStore";
import { CATEGORY_LABEL, byCategory } from "@/utils/partners";
import type { ServicesStackParamList } from "@/navigation/types";

export function CategoryScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProp<ServicesStackParamList, "Category">>();
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  const list = byCategory(partners, params.category);

  return (
    <Screen>
      <BackBar />
      <View className="px-5 pt-4">
        <Eyebrow>{`${list.length.toLocaleString("en-US")} partners`}</Eyebrow>
        <Text className="mt-1 font-display text-[28px] tracking-[-0.5px] text-ink">
          {CATEGORY_LABEL[params.category]}
        </Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        className="mt-2 px-5"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("Partner", { partnerId: item.id })}
            className="flex-row items-center justify-between border-b border-hairline py-3.5 active:opacity-70"
          >
            <View className="flex-1 pr-3">
              <Text className="text-[15px] text-ink">{item.name}</Text>
              <Text className="mt-0.5 font-mono text-[11px] text-mute">
                {item.ward}
              </Text>
            </View>
            <Text
              className="font-mono-medium text-[14px]"
              style={{ color: colors.accent }}
            >
              −{item.discountPct}%
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
