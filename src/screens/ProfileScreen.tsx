import { ScrollView, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { CountryCard } from "@/components/CountryCard";
import { Icon, type IconName } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors, regionColor } from "@/lib/theme";
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

        {/* Identity — passport-cover hero (matches the Discover hero) */}
        <View
          className="overflow-hidden rounded-card bg-brand-700 p-5"
          style={{
            shadowColor: "#000000",
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Text className="text-2xl">{passport?.flag ?? "🪪"}</Text>
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-[17px] font-semibold text-white">
                  {passport?.name ?? "Traveller"} passport
                </Text>
                <View
                  className={`ml-2 rounded-full px-2 py-0.5 ${
                    isPremium ? "bg-ocean-600" : "bg-white/15"
                  }`}
                >
                  <Text
                    className="text-[10px] font-bold uppercase text-white"
                    style={{ letterSpacing: 0.6 }}
                  >
                    {isPremium ? "Premium" : "Free"}
                  </Text>
                </View>
              </View>
              <Text className="mt-0.5 text-[12px] text-white/55">
                Your travel identity
              </Text>
            </View>
            <Pressable
              onPress={changePassport}
              hitSlop={8}
              accessibilityLabel="Change passport"
              className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
            >
              <Icon name="repeat" size={15} color="#ffffff" />
            </Pressable>
          </View>

          {/* Inline frosted stat wells */}
          <View className="mt-4 flex-row gap-2.5">
            <HeroStat icon="briefcase" value={trips.length} label="trips" />
            <HeroStat
              icon="check-circle"
              value={visitedCountryCodes.length}
              label="visited"
            />
            <HeroStat
              icon="heart"
              value={bucketListCountryCodes.length}
              label="bucket list"
            />
          </View>

          {!isPremium ? (
            <Button
              title="Upgrade to Premium"
              variant="premium"
              className="mt-4"
              icon={<Icon name="star" size={16} color="#ffffff" />}
              onPress={() => nav.navigate("Paywall", { source: "profile" })}
            />
          ) : null}
        </View>

        {/* Saved trips */}
        <SectionTitle title="Saved trips" className="mb-3 mt-6" />
        {trips.length === 0 ? (
          <Card className="items-center p-6">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
              <Icon name="briefcase" size={22} color={colors.ink[400]} />
            </View>
            <Text className="mt-2.5 text-[14px] font-semibold text-ink-700">
              No trips yet
            </Text>
            <Text className="mt-0.5 text-center text-[12px] text-ink-500">
              Open a country and tap “Start planning”.
            </Text>
            <Pressable
              onPress={() => nav.navigate("Tabs", { screen: "Discover" })}
              className="mt-3 rounded border border-surface-sunken px-4 py-2"
            >
              <Text className="text-[13px] font-semibold text-ink-900">
                Browse countries
              </Text>
            </Pressable>
          </Card>
        ) : (
          trips.map((t) => {
            const c = getCountryByCode(t.countryCode);
            return (
              <Card key={t.id} className="mb-2.5 flex-row items-center p-3.5">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface-muted">
                  <Text className="text-xl">{c?.flag}</Text>
                </View>
                <Pressable
                  className="ml-3 flex-1"
                  onPress={() => {
                    setActiveTrip(t.id);
                    nav.navigate("Tabs", { screen: "Plan" });
                  }}
                >
                  <Text className="text-[15px] font-semibold text-ink-900">
                    {t.title}
                  </Text>
                  <View className="mt-0.5 flex-row items-center">
                    <Icon name="map-pin" size={11} color={colors.ink[500]} />
                    <Text className="ml-1 text-[12px] text-ink-500">
                      {t.items.length} stops
                      {t.startDate ? ` · ${t.startDate}` : ""}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => deleteTrip(t.id)}
                  hitSlop={8}
                  accessibilityLabel={`Delete ${t.title}`}
                  className="h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
                >
                  <Icon name="trash-2" size={15} color={colors.visa.required} />
                </Pressable>
              </Card>
            );
          })
        )}

        {/* Passport stamps — visited tracker */}
        <SectionTitle title="Passport stamps" className="mb-3 mt-6" />
        <Card className="p-4">
          {/* Progress header */}
          <View className="flex-row items-end justify-between">
            <View className="flex-row items-end">
              <Text className="text-[34px] font-semibold leading-9 text-ink-900">
                {visitedCountryCodes.length}
              </Text>
              <Text className="mb-1 ml-1.5 text-[13px] font-medium text-ink-500">
                of {MOCK_COUNTRIES.length} stamped
              </Text>
            </View>
            <Text className="mb-1 text-[13px] font-bold text-ink-900">
              {Math.round(
                (visitedCountryCodes.length / MOCK_COUNTRIES.length) * 100
              )}
              %
            </Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-surface-sunken">
            <View
              className="h-2 rounded-full bg-brand-700"
              style={{
                width: `${Math.min(
                  100,
                  (visitedCountryCodes.length / MOCK_COUNTRIES.length) * 100
                )}%`,
              }}
            />
          </View>

          {/* Stamp grid */}
          <View className="mt-4 flex-row flex-wrap gap-2.5">
            {MOCK_COUNTRIES.map((c) => {
              const on = visitedCountryCodes.includes(c.code);
              const accent = regionColor(c.region);
              return (
                <Pressable
                  key={c.code}
                  onPress={() => toggleVisited(c.code)}
                  accessibilityRole="button"
                  accessibilityLabel={`${
                    on ? "Unmark" : "Mark"
                  } ${c.name} as visited`}
                  className="relative h-11 w-11 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: on ? accent : "#d8d8d8",
                    borderWidth: on ? 2 : 1,
                    backgroundColor: on ? "#ffffff" : "#f6f6f6",
                    opacity: on ? 1 : 0.55,
                  }}
                >
                  <Text className="text-[20px]">{c.flag}</Text>
                  {on ? (
                    <View
                      className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full border border-surface"
                      style={{ backgroundColor: accent }}
                    >
                      <Icon name="check" size={9} color="#ffffff" />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-3 text-[11px] text-ink-400">
            Tap a flag to stamp a country you’ve visited.
          </Text>
        </Card>

        {/* Bucket list */}
        <SectionTitle title="Bucket list" className="mb-3 mt-6" />
        {bucketCountries.length === 0 ? (
          <Card className="items-center p-6">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
              <Icon name="heart" size={22} color={colors.ink[400]} />
            </View>
            <Text className="mt-2.5 text-center text-[13px] text-ink-500">
              Tap the heart on any country to save it here.
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

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: number;
  label: string;
}) {
  return (
    <View className="flex-1 items-center rounded-xl bg-white/10 py-3">
      <Icon name={icon} size={15} color="rgba(255,255,255,0.7)" />
      <Text className="mt-1.5 text-[16px] font-semibold text-white">{value}</Text>
      <Text className="text-[11px] font-medium text-white/55">{label}</Text>
    </View>
  );
}
