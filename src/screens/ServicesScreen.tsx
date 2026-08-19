import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Icon } from "@/components/Icon";
import { CategoryTile } from "@/components/pamoja/CategoryTile";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { TileGrid, type Tile } from "@/components/pamoja/TileGrid";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { usePartnerStore } from "@/store/usePartnerStore";
import { CATEGORIES, countsByCategory } from "@/utils/partners";

export function ServicesScreen() {
  const navigation = useNavigation<any>();
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  // Derived, never stored — a tile can never show a number it cannot fill.
  const counts = countsByCategory(partners);

  const category = (c: "stay" | "move" | "eat" | "shop" | "do") => () =>
    navigation.navigate("Category", { category: c });

  const tiles: Tile[] = [
    { key: "shuttles", title: S.servicesShuttles, detail: S.servicesShuttlesDetail, icon: "truck", onPress: category("move") },
    { key: "food", title: S.servicesFood, detail: S.servicesFoodDetail, icon: "coffee", onPress: category("eat") },
    { key: "parking", title: S.servicesParking, detail: S.servicesParkingDetail, icon: "map-pin", onPress: () => navigation.navigate("Parking") },
    { key: "merch", title: S.servicesMerch, detail: S.servicesMerchDetail, icon: "shopping-bag", onPress: category("shop") },
    { key: "safety", title: S.servicesSafety, detail: S.servicesSafetyDetail, icon: "shield", onPress: () => navigation.navigate("Safety") },
    { key: "stays", title: S.servicesStays, detail: S.servicesStaysDetail, icon: "home", onPress: category("stay") },
  ];

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.servicesTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.servicesStandfirst}
        </Text>

        <View className="mt-5">
          <TileGrid tiles={tiles} />
        </View>

        <Pressable
          onPress={() => navigation.navigate("Driving")}
          className="mt-1 flex-row items-center justify-between rounded-card border border-hairline bg-canvas px-4 py-4 active:opacity-80"
        >
          <View className="flex-1">
            <Text className="font-medium text-[15px] text-ink">
              {S.servicesDrivingTitle}
            </Text>
            <Text className="mt-0.5 text-[12px] text-mute">
              {S.servicesDrivingDetail}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mute} />
        </Pressable>

        {/* The network keeps its surface: this figure and these counts are the
            reason the 2,189-partner dataset exists. */}
        <Eyebrow className="mt-8">
          {`${partners.length.toLocaleString("en-US")} partner businesses`}
        </Eyebrow>

        <View className="mt-4 flex-row flex-wrap justify-between">
          {CATEGORIES.map((c) => (
            <View key={c} className="w-[48%]">
              <CategoryTile
                category={c}
                count={counts[c]}
                onPress={category(c)}
              />
            </View>
          ))}
        </View>

        <View className="mt-8 rounded-card bg-panel px-4 py-4">
          <Text className="font-medium text-[15px] text-ink">
            {S.servicesNeedAHand}
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-body">
            {S.servicesStewards}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
