import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Button } from "@/components/ui";
import { colors } from "@/lib/theme";
import {
  OFFERINGS,
  PREMIUM_BENEFITS,
  purchasePackage,
  restorePurchases,
  type SubscriptionPackage,
} from "@/lib/revenuecat";
import { useAppStore } from "@/store/useAppStore";

/**
 * Premium paywall. Used both as the "Premium" tab and as a modal (route
 * "Paywall") triggered from locked content. `onClose` is provided in modal mode.
 */
export function PremiumScreen({ onClose }: { onClose?: () => void }) {
  const nav = useNavigation();
  const isPremium = useAppStore((s) => s.isPremium);
  const setPremium = useAppStore((s) => s.setPremium);
  const [selected, setSelected] = useState("annual");
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    setBusy(true);
    const ok = await purchasePackage(selected);
    setBusy(false);
    if (ok) {
      setPremium(true);
      onClose?.();
    }
  };

  const restore = async () => {
    setBusy(true);
    const ok = await restorePurchases();
    setBusy(false);
    if (ok) setPremium(true);
  };

  if (isPremium) {
    return (
      <View className="flex-1 bg-surface-muted">
        <LinearGradient colors={[colors.ocean[700], colors.ocean[600]]} className="px-6 pb-10">
          <SafeAreaView edges={["top"]}>
            <View className="items-center pt-10">
              <Text className="text-5xl">👑</Text>
              <Text className="mt-3 text-2xl font-semibold text-white">
                You're Premium
              </Text>
              <Text className="mt-1 text-center text-[14px] text-white/90">
                All visa details, prep checklists, offline maps and PDF export are
                unlocked.
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View className="p-6">
          {PREMIUM_BENEFITS.map((b) => (
            <BenefitRow key={b.title} {...b} unlocked />
          ))}
          <Button
            title="Manage subscription"
            variant="secondary"
            className="mt-4"
            onPress={() => {}}
          />
          {__DEV__ ? (
            <Pressable onPress={() => setPremium(false)} className="mt-3">
              <Text className="text-center text-[12px] text-ink-400">
                (dev) Reset to free
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <LinearGradient colors={[colors.ocean[700], colors.ocean[600]]} className="px-6 pb-8">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-end pt-2">
            {onClose ? (
              <Pressable onPress={onClose} hitSlop={10}>
                <Text className="text-xl text-white/90">✕</Text>
              </Pressable>
            ) : null}
          </View>
          <View className="items-center pb-2">
            <Text className="text-5xl">🛂</Text>
            <Text className="mt-2 text-3xl font-semibold text-white">
              PassGo Premium
            </Text>
            <Text className="mt-1 text-center text-[14px] leading-5 text-white/90">
              Everything you need to go from “maybe” to boarding pass.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 16 }}
      >
        {PREMIUM_BENEFITS.map((b) => (
          <BenefitRow key={b.title} {...b} />
        ))}

        <View className="mt-5 gap-3">
          {OFFERINGS.map((p) => (
            <PlanOption
              key={p.id}
              pkg={p}
              selected={selected === p.id}
              onPress={() => setSelected(p.id)}
            />
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="border-t border-surface-sunken bg-surface">
        <View className="px-6 pb-2 pt-3">
          <Button
            title={busy ? "Processing…" : "Start Premium"}
            variant="premium"
            loading={busy}
            onPress={buy}
          />
          <View className="mt-3 flex-row items-center justify-center gap-4">
            <Pressable onPress={restore}>
              <Text className="text-[12px] font-semibold text-ink-400">Restore</Text>
            </Pressable>
            <Text className="text-ink-400">·</Text>
            <Text className="text-[12px] text-ink-400">Cancel anytime</Text>
          </View>
          <Text className="mt-1 text-center text-[10px] text-ink-400">
            Billing handled by RevenueCat (placeholder). No real charge in demo.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function BenefitRow({
  emoji,
  title,
  blurb,
  unlocked,
}: {
  emoji: string;
  title: string;
  blurb: string;
  unlocked?: boolean;
}) {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted">
        <Text className="text-lg">{emoji}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold text-ink-900">{title}</Text>
        <Text className="text-[12px] leading-4 text-ink-500">{blurb}</Text>
      </View>
      {unlocked ? <Text className="text-brand-600">✓</Text> : null}
    </View>
  );
}

function PlanOption({
  pkg,
  selected,
  onPress,
}: {
  pkg: SubscriptionPackage;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl border-2 p-4 ${
        selected ? "border-ocean-600 bg-ocean-50" : "border-surface-sunken bg-surface"
      }`}
    >
      {pkg.badge ? (
        <View className="mb-1 self-start rounded-full bg-ocean-600 px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-white">{pkg.badge}</Text>
        </View>
      ) : null}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[16px] font-semibold text-ink-900">{pkg.title}</Text>
          {pkg.perMonth ? (
            <Text className="text-[12px] text-ink-500">{pkg.perMonth}</Text>
          ) : null}
        </View>
        <View className="flex-row items-end">
          <Text className="text-[20px] font-semibold text-ink-900">{pkg.price}</Text>
          <Text className="mb-0.5 text-[12px] text-ink-500">{pkg.period}</Text>
        </View>
      </View>
    </Pressable>
  );
}
