import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

import { Button } from "@/components/ui";
import { Chip } from "@/components/pamoja/Chip";
import { Sparkline } from "@/components/pamoja/Sparkline";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { kes } from "@/utils/format";

// LinearGradient is a third-party component, so NativeWind will not style it from a
// className until it is registered. src/components/AppImage.tsx does the same for
// expo-image; without this the padding and margin below are silently dropped.
cssInterop(LinearGradient, { className: "style" });

/**
 * The savings panel. This figure is the record's own total and nothing else moves it —
 * no ticket perk, no promotional credit. Rev. 2 §09.
 */
export function MoneyBox({
  saved,
  week,
  series,
  offers,
  onBrowse,
}: {
  saved: number;
  week: number;
  series: number[];
  offers: number;
  onBrowse: () => void;
}) {
  return (
    <LinearGradient
      colors={[colors.deep, colors.deepGrad, colors.deepDeeper]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mt-4 rounded-card px-5 py-5"
    >
      <View className="flex-row items-start justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-ondark-mute">
          {S.homeYouveSaved}
        </Text>
        {week > 0 ? (
          <Chip
            label={`${S.homeThisWeekPrefix}${week} ${S.homeThisWeekSuffix}`}
            tone="ondark"
          />
        ) : null}
      </View>

      <View className="mt-2 flex-row items-end justify-between">
        <Text className="font-display-heavy text-[36px] tracking-[-1px] text-white">
          {kes(saved)}
        </Text>
        <View className="pb-1.5">
          <Sparkline values={series} />
        </View>
      </View>

      {saved === 0 ? (
        <Text className="mt-2 font-mono text-[11px] leading-4 text-ondark-faint">
          {S.homeSavedEmptyHint}
        </Text>
      ) : (
        <Text className="mt-2 text-[13px] text-ondark-mute">
          {`${offers} ${offers === 1 ? S.homeOfferUsedSuffix : S.homeOffersUsedSuffix}`}
        </Text>
      )}

      <Button
        title={S.homeBrowseOffers}
        variant="accent"
        className="mt-4 self-start"
        onPress={onBrowse}
      />
    </LinearGradient>
  );
}
