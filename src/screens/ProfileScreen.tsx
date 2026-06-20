import { ScrollView, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { CountryCard } from "@/components/CountryCard";
import { Screen } from "@/components/Screen";
import { Button, Card, SectionTitle, Stat } from "@/components/ui";
import { getCountryByCode, MOCK_COUNTRIES } from "@/data/mockCountries";
import { getPassport } from "@/data/passports";
import { useAppStore } from "@/store/useAppStore";
import { useTripStore } from "@/store/useTripStore";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const nav = useNavigation<Nav>();
  const {
    passportCountry,
    isPremium,
    visitedCountryCodes,
    bucketListCountryCodes,
    toggleBucketList,
    toggleVisited,
    changePassport,
    reset,
  } = useAppStore();
  const trips = useTripStore((s) => s.trips);
  const setActiveTrip = useTripStore((s) => s.setActiveTrip);
  const deleteTrip = useTripStore((s) => s.deleteTrip);

  const passport = getPassport(passportCountry);
  const bucketCountries = bucketListCountryCodes
    .map(getCountryByCode)
    .filter(Boolean);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        <Text className="pb-2 pt-2 text-[26px] font-semibold text-ink-900">
          Profile
        </Text>

        {/* Identity card */}
        <Card className="p-4">
          <View className="flex-row items-center">
            <Text className="text-4xl">{passport?.flag ?? "🪪"}</Text>
            <View className="ml-3 flex-1">
              <Text className="text-[18px] font-semibold text-ink-900">
                {passport?.name ?? "Traveller"} passport
              </Text>
              <Text className="text-[12px] text-ink-500">
                {isPremium ? "👑 Premium member" : "Free plan"}
              </Text>
            </View>
            <Pressable
              onPress={changePassport}
              hitSlop={8}
              className="rounded-full bg-brand-100 px-3 py-1.5"
            >
              <Text className="text-[13px] font-bold text-brand-700">
                Change passport
              </Text>
            </Pressable>
          </View>
          <View className="mt-4 flex-row gap-2.5">
            <Stat emoji="🧳" value={`${trips.length}`} label="trips" />
            <Stat emoji="✅" value={`${visitedCountryCodes.length}`} label="visited" />
            <Stat emoji="❤️" value={`${bucketListCountryCodes.length}`} label="bucket list" />
          </View>
          {!isPremium ? (
            <Button
              title="✨ Upgrade to Premium"
              variant="premium"
              className="mt-4"
              onPress={() => nav.navigate("Paywall", { source: "profile" })}
            />
          ) : null}
        </Card>

        {/* Saved trips */}
        <SectionTitle title="Saved trips" className="mb-3 mt-6" />
        {trips.length === 0 ? (
          <Card className="p-4">
            <Text className="text-[13px] text-ink-500">
              No trips yet — start planning from any country.
            </Text>
          </Card>
        ) : (
          trips.map((t) => {
            const c = getCountryByCode(t.countryCode);
            return (
              <Card key={t.id} className="mb-2.5 flex-row items-center p-3.5">
                <Text className="text-2xl">{c?.flag}</Text>
                <Pressable
                  className="ml-3 flex-1"
                  onPress={() => {
                    setActiveTrip(t.id);
                    nav.navigate("Tabs", { screen: "Plan" });
                  }}
                >
                  <Text className="text-[15px] font-bold text-ink-900">{t.title}</Text>
                  <Text className="text-[12px] text-ink-500">
                    {t.items.length} activities
                    {t.startDate ? ` · ${t.startDate}` : ""}
                  </Text>
                </Pressable>
                <Pressable onPress={() => deleteTrip(t.id)} hitSlop={8}>
                  <Text className="text-[13px] font-bold text-red-500">Delete</Text>
                </Pressable>
              </Card>
            );
          })
        )}

        {/* Countries visited tracker */}
        <SectionTitle
          title="Countries visited"
          className="mb-3 mt-6"
          action={
            <Text className="text-[13px] font-semibold text-ink-400">
              {visitedCountryCodes.length}/{MOCK_COUNTRIES.length}
            </Text>
          }
        />
        <Card className="p-4">
          <View className="h-2 overflow-hidden rounded-full bg-surface-sunken">
            <View
              className="h-2 rounded-full bg-brand-600"
              style={{
                width: `${Math.min(
                  100,
                  (visitedCountryCodes.length / MOCK_COUNTRIES.length) * 100
                )}%`,
              }}
            />
          </View>
          <View className="mt-3 flex-row flex-wrap gap-1.5">
            {MOCK_COUNTRIES.map((c) => {
              const on = visitedCountryCodes.includes(c.code);
              return (
                <Pressable
                  key={c.code}
                  onPress={() => toggleVisited(c.code)}
                  className={`rounded-full px-2.5 py-1.5 ${
                    on ? "bg-brand-600" : "bg-surface-muted"
                  }`}
                >
                  <Text className={`text-[12px] ${on ? "" : "opacity-60"}`}>
                    {c.flag} {on ? "✓" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-2 text-[11px] text-ink-400">
            Tap a flag to mark it visited.
          </Text>
        </Card>

        {/* Bucket list */}
        <SectionTitle title="Bucket list" className="mb-3 mt-6" />
        {bucketCountries.length === 0 ? (
          <Card className="p-4">
            <Text className="text-[13px] text-ink-500">
              Tap the heart on any country to add it here.
            </Text>
          </Card>
        ) : (
          bucketCountries.map((c) =>
            c ? (
              <CountryCard
                key={c.code}
                country={c}
                saved
                onToggleSave={() => toggleBucketList(c.code)}
                onPress={() => nav.navigate("CountryDetail", { code: c.code })}
              />
            ) : null
          )
        )}

        {/* Danger zone */}
        <Pressable onPress={reset} className="mt-8 items-center py-2">
          <Text className="text-[13px] font-semibold text-red-500">
            Reset all app data
          </Text>
          <Text className="mt-0.5 text-[11px] text-ink-400">
            Clears passport, trips, premium and lists
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
