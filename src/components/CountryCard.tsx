import { Pressable, Text, View } from "react-native";

import type { Country, VisaRule } from "@/types";
import { colors, regionColor, VISA_META } from "@/lib/theme";
import { budgetLabel, visaDetailLine, visaIconName } from "@/utils/format";
import { AppImage } from "./AppImage";
import { Icon, type IconName } from "./Icon";
import { VisaBadge } from "./VisaBadge";

/**
 * The primary Discover card: hero image, flag, name, visa badge and quick facts.
 */
export function CountryCard({
  country,
  rule,
  onPress,
  saved,
  onToggleSave,
}: {
  country: Country;
  rule?: VisaRule;
  onPress: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const accent = regionColor(country.region);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${country.name}, ${country.region}. ${
        rule ? "Tap for visa details and city guides." : "Tap for details."
      }`}
      className="mb-4 overflow-hidden rounded-card bg-surface border border-surface-sunken active:opacity-90"
      style={{
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <View className="relative">
        {/* Region category strip — Webflow's chromatic-category signature. */}
        <View
          className="absolute left-0 right-0 top-0 z-10 h-1.5"
          style={{ backgroundColor: accent }}
        />
        <AppImage uri={country.heroImage} className="h-44 w-full" />
        {/* gradient-ish scrim */}
        <View className="absolute inset-0 bg-black/10" />
        <View className="absolute left-3 top-3">
          {rule ? <VisaBadge rule={rule} /> : null}
        </View>
        {onToggleSave ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleSave();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              saved
                ? `Remove ${country.name} from bucket list`
                : `Add ${country.name} to bucket list`
            }
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white/90"
          >
            <Text className="text-base">{saved ? "❤️" : "🤍"}</Text>
          </Pressable>
        ) : null}
        <View className="absolute bottom-3 left-3 right-3 flex-row items-center">
          <Text className="text-3xl">{country.flag}</Text>
          <View className="ml-2 flex-1">
            <Text className="text-lg font-semibold text-white">
              {country.name}
            </Text>
            <View className="flex-row items-center">
              <View
                className="mr-1.5 h-2 w-2 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <Text className="text-[12px] font-medium text-white/90">
                {country.region} · {country.capital}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Visa detail bar — surfaces the cost + processing/stay the spec wanted. */}
      {rule ? (
        <View className="flex-row items-center border-b border-surface-sunken bg-surface-muted px-4 py-2.5">
          <Icon
            name={visaIconName(rule) as IconName}
            size={14}
            color={VISA_META[rule.visaType].color}
          />
          <Text className="ml-2 flex-1 text-[12.5px] font-semibold text-ink-900">
            {visaDetailLine(rule)}
          </Text>
        </View>
      ) : null}

      <View className="p-4">
        <Text className="text-[13px] leading-5 text-ink-500" numberOfLines={2}>
          {country.summary}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Fact icon="dollar-sign" text={`~$${country.dailyBudgetUsd}/day`} />
            <Fact icon="calendar" text={`${country.suggestedDays} days`} />
            <Fact icon="sliders" text={budgetLabel[country.budgetTier]} />
          </View>
          <Icon name="arrow-right" size={16} color={colors.ink[400]} />
        </View>
      </View>
    </Pressable>
  );
}

function Fact({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="mr-4 flex-row items-center">
      <Icon name={icon} size={13} color={colors.ink[500]} />
      <Text className="ml-1.5 text-[12px] font-semibold text-ink-700">{text}</Text>
    </View>
  );
}
