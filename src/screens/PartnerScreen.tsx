import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { S } from "@/lib/strings";
import { usePartnerStore } from "@/store/usePartnerStore";
import { CATEGORY_LABEL } from "@/utils/partners";
import type { SharedRoutes } from "@/navigation/types";

export function PartnerScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProp<SharedRoutes, "Partner">>();
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  const partner = partners.find((p) => p.id === params.partnerId);

  if (!partner) {
    return (
      <Screen>
        <BackBar />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-[15px] text-body">{S.partnerNotListed}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Eyebrow className="mt-4">{CATEGORY_LABEL[partner.category]}</Eyebrow>
        <Text className="mt-1 font-display text-[28px] tracking-[-0.5px] text-ink">
          {partner.name}
        </Text>
        <Text className="mt-1 font-mono text-[12px] text-mute">
          {partner.ward} · {partner.city}
        </Text>

        <View className="mt-6 rounded-card border border-hairline bg-panel px-5 py-5">
          <Eyebrow>{S.partnerDiscountHeading}</Eyebrow>
          <Text className="mt-1 font-display text-[32px] tracking-[-0.5px] text-ink">
            −{partner.discountPct}%
          </Text>
          <Text className="mt-3 font-mono text-[11px] text-mute">
            {S.partnerMerchantCodePrefix} {partner.shortCode}
          </Text>
        </View>

        <Button
          title={S.partnerScanButton}
          className="mt-6"
          onPress={() =>
            navigation.navigate("Confirm", {
              partnerId: partner.id,
              channel: "qr",
            })
          }
        />
        <Button
          title={S.partnerShortCodeButton}
          variant="secondary"
          className="mt-3"
          onPress={() =>
            navigation.navigate("Confirm", {
              partnerId: partner.id,
              channel: "shortcode",
            })
          }
        />

        <Text className="mt-4 font-mono text-[11px] leading-4 text-mute">
          {S.partnerDisclaimer}
        </Text>
      </ScrollView>
    </Screen>
  );
}
