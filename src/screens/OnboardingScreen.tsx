import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { MOCK_COUNTRIES } from "@/data/mockCountries";
import { PASSPORTS, type Passport } from "@/data/passports";
import { useAppStore } from "@/store/useAppStore";

// A "departures board" of real destination flags for the hero strip.
const DEST_FLAGS = MOCK_COUNTRIES.slice(0, 14).map((c) => c.flag);

export function OnboardingScreen() {
  const setPassport = useAppStore((s) => s.setPassport);
  const current = useAppStore((s) => s.passportCountry);
  // Re-entering to switch passports preselects the current one.
  const [selected, setSelected] = useState<string | null>(current || "KE");

  return (
    <View className="flex-1 bg-surface">
      <SafeAreaView edges={["top"]}>
        <View className="px-6 pb-5 pt-6">
          {/* Brand row — crafted monogram mark with a green "stamp" dot. */}
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-ink-900">
              <Text className="text-[18px] font-bold text-white">P</Text>
              <View
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface"
                style={{ backgroundColor: "#00d722" }}
              />
            </View>
            <Text className="ml-2.5 text-[20px] font-semibold tracking-tight text-ink-900">
              PassGo
            </Text>
          </View>

          {/* Eyebrow — Webflow's signature uppercase tracked label. */}
          <Text
            className="mt-7 text-[11px] font-semibold uppercase text-ink-400"
            style={{ letterSpacing: 1.6 }}
          >
            Passport-first travel
          </Text>

          {/* Headline — "easiest" gets a visa-free green highlight (meaning, not decor). */}
          <Text className="mt-2 text-[30px] font-semibold leading-9 tracking-tight text-ink-900">
            Find the{" "}
            <Text
              className="text-[#0a7d2a]"
              style={{ backgroundColor: "#d6f9df" }}
            >
              {" "}easiest{" "}
            </Text>{" "}
            countries to visit on your passport.
          </Text>

          {/* Departures strip — real destination flags. */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {DEST_FLAGS.map((flag, i) => (
              <View
                key={i}
                className="mr-2 h-9 w-9 items-center justify-center rounded-lg border border-surface-sunken bg-surface-muted"
              >
                <Text className="text-[18px]">{flag}</Text>
              </View>
            ))}
          </ScrollView>

          <Text className="mt-4 text-[14px] leading-5 text-ink-500">
            50+ destinations · visa-free, visa on arrival & e-Visa — then plan the
            whole trip.
          </Text>
        </View>
        <View className="h-px bg-surface-sunken" />
      </SafeAreaView>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-[18px] font-semibold text-ink-900">
          What passport do you travel on?
        </Text>
        <Text className="mt-1 text-[13px] text-ink-500">
          We use this to show your exact visa requirements.
        </Text>

        <FlatList
          data={PASSPORTS}
          keyExtractor={(p) => p.code}
          className="mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <PassportRow
              passport={item}
              selected={selected === item.code}
              onPress={() => setSelected(item.code)}
            />
          )}
        />
      </View>

      <SafeAreaView edges={["bottom"]} className="bg-surface">
        <View className="px-6 pb-3 pt-2">
          <Button
            title="Continue"
            disabled={!selected}
            onPress={() => selected && setPassport(selected)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function PassportRow({
  passport,
  selected,
  onPress,
}: {
  passport: Passport;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2.5 flex-row items-center rounded-2xl border p-3.5 ${
        selected
          ? "border-brand-600 bg-brand-50"
          : "border-surface-sunken bg-surface"
      }`}
    >
      <Text className="text-3xl">{passport.flag}</Text>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold text-ink-900">{passport.name}</Text>
        <Text className="text-[12px] text-ink-400">
          {passport.seeded ? "Full visa data available" : "Demo data"}
        </Text>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand-600 bg-brand-600" : "border-surface-sunken"
        }`}
      >
        {selected ? <Text className="text-[12px] font-bold text-white">✓</Text> : null}
      </View>
    </Pressable>
  );
}
