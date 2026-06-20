import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { CountryCard } from "@/components/CountryCard";
import {
  DEFAULT_FILTERS,
  FilterBar,
  type DiscoverFilters,
} from "@/components/FilterBar";
import { Screen } from "@/components/Screen";
import { SkeletonCard } from "@/components/SkeletonCard";
import { fetchCountries, fetchVisaRules } from "@/data/repository";
import { getPassport } from "@/data/passports";
import { EASY_VISA_TYPES, VISA_META } from "@/lib/theme";
import { useAppStore } from "@/store/useAppStore";
import type { Country, VisaRule } from "@/types";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DiscoverScreen() {
  const nav = useNavigation<Nav>();
  const passportCode = useAppStore((s) => s.passportCountry);
  const bucketList = useAppStore((s) => s.bucketListCountryCodes);
  const toggleBucket = useAppStore((s) => s.toggleBucketList);

  const [countries, setCountries] = useState<Country[]>([]);
  const [rules, setRules] = useState<Map<string, VisaRule>>(new Map());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      const [cs, rs] = await Promise.all([
        fetchCountries(),
        fetchVisaRules(passportCode),
      ]);
      if (!live) return;
      setCountries(cs);
      setRules(rs);
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, [passportCode]);

  const passport = getPassport(passportCode);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return countries
      .map((c) => ({ country: c, rule: rules.get(c.code) }))
      .filter(({ country, rule }) => {
        if (q && !country.name.toLowerCase().includes(q)) return false;
        if (filters.region !== "All" && country.region !== filters.region)
          return false;
        if (filters.budget !== "All" && country.budgetTier !== filters.budget)
          return false;
        if (filters.maxDays && country.suggestedDays > filters.maxDays)
          return false;
        if (filters.easyOnly && (!rule || !EASY_VISA_TYPES.includes(rule.visaType)))
          return false;
        return true;
      })
      .sort((a, b) => {
        const ea = a.rule ? VISA_META[a.rule.visaType].easeRank : 9;
        const eb = b.rule ? VISA_META[b.rule.visaType].easeRank : 9;
        if (ea !== eb) return ea - eb; // easiest entry first
        return a.country.popularityRank - b.country.popularityRank;
      });
  }, [countries, rules, query, filters]);

  const easyCount = useMemo(
    () =>
      countries.filter((c) => {
        const r = rules.get(c.code);
        return r && EASY_VISA_TYPES.includes(r.visaType);
      }).length,
    [countries, rules]
  );

  // How many filters differ from the defaults — surfaced on the Filters button.
  const activeFilterCount =
    (filters.region !== DEFAULT_FILTERS.region ? 1 : 0) +
    (filters.budget !== DEFAULT_FILTERS.budget ? 1 : 0) +
    (filters.maxDays !== DEFAULT_FILTERS.maxDays ? 1 : 0) +
    (filters.easyOnly !== DEFAULT_FILTERS.easyOnly ? 1 : 0);

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.country.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            {/* Greeting + passport */}
            <View className="flex-row items-center justify-between pt-2">
              <View>
                <Text className="text-[13px] font-semibold text-ink-400">
                  Travelling on
                </Text>
                <Text className="text-[22px] font-semibold text-ink-900">
                  {passport?.flag} {passport?.name ?? "Passport"} passport
                </Text>
              </View>
            </View>

            {/* Easy countries banner */}
            <View className="mt-3 flex-row items-center rounded-card bg-brand-700 px-4 py-3">
              <Text className="text-2xl">✈️</Text>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-semibold text-white">
                  {easyCount} easy destinations
                </Text>
                <Text className="text-[12px] text-brand-100">
                  Visa-free, visa on arrival or e-Visa for you
                </Text>
              </View>
            </View>

            {/* Search */}
            <View className="mt-4 flex-row items-center rounded-md border border-surface-sunken bg-surface px-3.5 py-1">
              <Text className="text-ink-400">🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search countries"
                placeholderTextColor="#ababab"
                returnKeyType="search"
                className="ml-2 flex-1 py-3 text-[15px] text-ink-900"
              />
              {query.length > 0 ? (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="mr-1 h-6 w-6 items-center justify-center rounded-full bg-surface-muted"
                >
                  <Text className="text-[12px] text-ink-500">✕</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setShowFilters((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${showFilters ? "Hide" : "Show"} filters${
                  activeFilterCount ? `, ${activeFilterCount} active` : ""
                }`}
                className="h-9 flex-row items-center justify-center rounded bg-brand-700 px-3.5"
              >
                <Text className="text-[13px] font-semibold text-white">
                  {showFilters ? "Hide" : "Filters"}
                </Text>
                {activeFilterCount > 0 && !showFilters ? (
                  <View className="ml-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-white px-1">
                    <Text className="text-[10px] font-bold text-brand-700">
                      {activeFilterCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            {showFilters ? (
              <View className="mt-3">
                <FilterBar filters={filters} onChange={setFilters} />
              </View>
            ) : null}

            <View className="mb-3 mt-4 flex-row items-center justify-between">
              <Text className="text-[17px] font-semibold text-ink-900">
                {filters.easyOnly ? "Easy countries" : "All countries"}
              </Text>
              <Text className="text-[13px] font-semibold text-ink-400">
                {filtered.length} results
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <CountryCard
            country={item.country}
            rule={item.rule}
            saved={bucketList.includes(item.country.code)}
            onToggleSave={() => toggleBucket(item.country.code)}
            onPress={() =>
              nav.navigate("CountryDetail", { code: item.country.code })
            }
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View className="items-center py-20">
              <Text className="text-3xl">🧭</Text>
              <Text className="mt-2 text-[15px] font-semibold text-ink-700">
                No countries match your filters
              </Text>
              <Text className="mt-1 text-center text-[13px] text-ink-500">
                Try widening your region or budget.
              </Text>
              <Pressable
                onPress={() => {
                  setFilters(DEFAULT_FILTERS);
                  setQuery("");
                }}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters"
                className="mt-3 rounded border border-surface-sunken px-4 py-2"
              >
                <Text className="text-[13px] font-semibold text-ink-900">
                  Reset filters
                </Text>
              </Pressable>
            </View>
          )
        }
      />
    </Screen>
  );
}
