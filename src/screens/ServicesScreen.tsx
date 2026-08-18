import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { CategoryTile } from "@/components/pamoja/CategoryTile";
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

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Eyebrow className="mt-4">
          {`${partners.length.toLocaleString("en-US")} partner businesses`}
        </Eyebrow>

        <View className="mt-4 flex-row flex-wrap justify-between">
          {CATEGORIES.map((c) => (
            <View key={c} className="w-[48%]">
              <CategoryTile
                category={c}
                count={counts[c]}
                onPress={() => navigation.navigate("Category", { category: c })}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
