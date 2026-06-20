import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppImage } from "@/components/AppImage";
import { AttractionCard } from "@/components/AttractionCard";
import { CityGroup } from "@/components/CityGroup";
import { Icon, type IconName } from "@/components/Icon";
import { PremiumLock } from "@/components/PremiumLock";
import { Button, Card, SectionTitle, Stat, Tag } from "@/components/ui";
import { VisaBadge } from "@/components/VisaBadge";
import {
  fetchAttractions,
  fetchCities,
  fetchCountry,
  fetchPrepGuide,
  fetchVisaRule,
} from "@/data/repository";
import { colors, regionColor, VISA_META } from "@/lib/theme";
import { useAppStore } from "@/store/useAppStore";
import { useTripStore } from "@/store/useTripStore";
import type {
  Attraction,
  City,
  Country,
  PrepGuide,
  VisaRule,
} from "@/types";
import { processing, usd } from "@/utils/format";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, "CountryDetail">;

export function CountryDetailScreen() {
  const nav = useNavigation<Nav>();
  const { code } = useRoute<Rt>().params;
  const passportCode = useAppStore((s) => s.passportCountry);
  const bucketList = useAppStore((s) => s.bucketListCountryCodes);
  const toggleBucket = useAppStore((s) => s.toggleBucketList);
  const createTrip = useTripStore((s) => s.createTrip);
  const addAttraction = useTripStore((s) => s.addAttraction);
  const setActiveTrip = useTripStore((s) => s.setActiveTrip);
  const trips = useTripStore((s) => s.trips);

  const [country, setCountry] = useState<Country>();
  const [rule, setRule] = useState<VisaRule>();
  const [prep, setPrep] = useState<PrepGuide>();
  const [cities, setCities] = useState<City[]>([]);
  const [attractionsByCity, setAttractionsByCity] = useState<
    Record<string, Attraction[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      const [c, r, p, cs] = await Promise.all([
        fetchCountry(code),
        fetchVisaRule(passportCode, code),
        fetchPrepGuide(code),
        fetchCities(code),
      ]);
      const entries = await Promise.all(
        cs.map(async (city) => [city.id, await fetchAttractions(city.id)] as const)
      );
      if (!live) return;
      setCountry(c);
      setRule(r);
      setPrep(p);
      setCities(cs);
      setAttractionsByCity(Object.fromEntries(entries));
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, [code, passportCode]);

  if (loading || !country) {
    return <CountryDetailSkeleton />;
  }

  const saved = bucketList.includes(country.code);
  const meta = rule ? VISA_META[rule.visaType] : null;

  // The trip for this country (if one exists), so attractions can be added
  // straight from here and the CTA can reflect what's already planned.
  const countryTrip = trips.find((t) => t.countryCode === country.code);
  const addedIds = new Set(
    countryTrip?.items.map((i) => i.attractionId).filter(Boolean) as string[]
  );

  const addToTrip = (attraction: Attraction) => {
    const tripId =
      countryTrip?.id ?? createTrip(country.code, `${country.name} trip`);
    addAttraction(tripId, attraction);
  };

  const goToTrip = () => {
    const tripId =
      countryTrip?.id ?? createTrip(country.code, `${country.name} trip`);
    setActiveTrip(tripId);
    nav.navigate("Tabs", { screen: "Plan" });
  };

  return (
    <View className="flex-1 bg-surface-muted">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View className="relative">
          <AppImage uri={country.heroImage} className="h-72 w-full" />
          <View className="absolute inset-0 bg-black/25" />
          <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <Pressable
                onPress={() => nav.goBack()}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <Text className="text-lg text-white">‹</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleBucket(country.code)}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <Text className="text-base">{saved ? "❤️" : "🤍"}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
          <View className="absolute bottom-4 left-4 right-4">
            {rule ? <VisaBadge rule={rule} /> : null}
            <Text className="mt-2 text-3xl font-semibold text-white">
              {country.flag} {country.name}
            </Text>
            <View className="flex-row items-center">
              <View
                className="mr-1.5 h-2 w-2 rounded-full"
                style={{ backgroundColor: regionColor(country.region) }}
              />
              <Text className="text-[13px] font-medium text-white/90">
                {country.region} · {country.capital} · {country.currency}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          {/* Quick stats */}
          <View className="-mt-5 flex-row gap-2.5">
            <Stat icon="dollar-sign" value={`$${country.dailyBudgetUsd}`} label="per day" />
            <Stat icon="calendar" value={`${country.suggestedDays}d`} label="suggested" />
            <Stat icon="sun" value={country.bestSeason.split(" ")[0]} label="best season" />
          </View>

          <Text className="mt-4 text-[14px] leading-5 text-ink-700">
            {country.summary}
          </Text>

          {/* Visa — basic free, full requirements Premium */}
          <SectionTitle title="Visa requirements" className="mb-3 mt-6" />
          {rule && meta ? (
            <Card className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[12px] font-semibold uppercase text-ink-400">
                    Entry type
                  </Text>
                  <Text className="mt-0.5 text-[18px] font-semibold text-ink-900">
                    {meta.label}
                  </Text>
                </View>
                <VisaBadge rule={rule} />
              </View>

              <PremiumLock
                title="See full requirements"
                blurb="Cost, processing time, max stay and the official application link."
                onUpgrade={() => nav.navigate("Paywall", { source: "visa" })}
              >
                <View className="mt-4 border-t border-surface-sunken pt-4">
                  <View className="flex-row gap-2.5">
                    <Stat icon="dollar-sign" value={usd(rule.costUsd)} label="cost" />
                    <Stat icon="clock" value={processing(rule.processingDays)} label="processing" />
                    <Stat icon="calendar" value={`${rule.stayDays}d`} label="max stay" />
                  </View>
                  {rule.notes ? (
                    <Text className="mt-3 text-[13px] leading-5 text-ink-500">
                      {rule.notes}
                    </Text>
                  ) : null}
                  <Button
                    title="Open official source ↗"
                    variant="secondary"
                    className="mt-3"
                    onPress={() => Linking.openURL(rule.officialLink)}
                  />
                </View>
              </PremiumLock>
            </Card>
          ) : (
            <Card className="p-4">
              <Text className="text-[14px] text-ink-500">
                No visa rule on file for this destination yet.
              </Text>
            </Card>
          )}

          {/* How to prepare — Premium */}
          <SectionTitle title="How to prepare" className="mb-3 mt-6" />
          <PremiumLock
            title="Unlock the prep checklist"
            blurb="Documents, vaccinations, currency, SIM cards and safety tips."
            onUpgrade={() => nav.navigate("Paywall", { source: "prep" })}
          >
            {prep ? <PrepSection prep={prep} /> : null}
          </PremiumLock>

          {/* Cities + attractions */}
          <SectionTitle
            title="Top cities & things to do"
            className="mb-3 mt-6"
          />
          {cities.length === 0 ? (
            <Card className="p-4">
              <Text className="text-[14px] text-ink-500">
                Detailed city guides are coming soon for {country.name}.
              </Text>
            </Card>
          ) : (
            cities.map((city) => {
              const list = attractionsByCity[city.id] ?? [];
              return (
                <CityGroup key={city.id} city={city} count={list.length}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    {list.map((a) => (
                      <AttractionCard
                        key={a.id}
                        attraction={a}
                        compact
                        added={addedIds.has(a.id)}
                        onAdd={() => addToTrip(a)}
                      />
                    ))}
                  </ScrollView>
                </CityGroup>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 bg-surface border-t border-surface-sunken">
        <View className="flex-row items-center gap-3 px-4 py-3">
          <View className="flex-1">
            <Text className="text-[12px] text-ink-400">
              {countryTrip ? "In your trip" : "Plan your visit"}
            </Text>
            <Text className="text-[15px] font-semibold text-ink-900">
              {countryTrip
                ? `${countryTrip.items.length} ${
                    countryTrip.items.length === 1 ? "stop added" : "stops added"
                  }`
                : `${cities.length} cities · ${Object.values(attractionsByCity).flat().length} spots`}
            </Text>
          </View>
          <Button
            title={countryTrip ? "View trip" : "Start planning"}
            onPress={goToTrip}
            className="px-6"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function CountryDetailSkeleton() {
  return (
    <View className="flex-1 bg-surface-muted">
      <View className="h-72 w-full bg-surface-sunken" />
      <View className="px-4">
        <View className="-mt-5 flex-row gap-2.5">
          {[0, 1, 2].map((i) => (
            <View key={i} className="h-[72px] flex-1 rounded-xl bg-surface" />
          ))}
        </View>
        <View className="mt-5 h-3 w-3/4 rounded bg-surface-sunken" />
        <View className="mt-2 h-3 w-1/2 rounded bg-surface-sunken" />
        <View className="mt-6 h-28 rounded-card bg-surface" />
        <View className="mt-4 h-20 rounded-card bg-surface" />
      </View>
    </View>
  );
}

function PrepSection({ prep }: { prep: PrepGuide }) {
  return (
    <View className="gap-3">
      <PrepCard icon="file-text" title="Documents" items={prep.documents} />
      <PrepCard icon="shield" title="Vaccinations" items={prep.vaccinations} />
      <Card className="p-4">
        <PrepHeader icon="credit-card" title="Money" />
        <PrepLine label="Tips" value={prep.currency.tips} />
        <PrepLine label="Cards" value={prep.currency.cards} />
        <PrepLine label="Cash" value={prep.currency.cash} />
      </Card>
      <Card className="p-4">
        <PrepHeader icon="wifi" title="SIM & data" />
        <View className="mb-2 flex-row flex-wrap gap-1.5">
          {prep.sim.providers.map((p) => (
            <Tag key={p} label={p} />
          ))}
        </View>
        <Text className="text-[13px] leading-5 text-ink-500">{prep.sim.tips}</Text>
      </Card>
      <PrepCard icon="alert-triangle" title="Safety" items={prep.safety} />
    </View>
  );
}

function PrepHeader({ icon, title }: { icon: IconName; title: string }) {
  return (
    <View className="mb-3 flex-row items-center">
      <View className="h-7 w-7 items-center justify-center rounded-lg border border-surface-sunken bg-surface-muted">
        <Icon name={icon} size={14} color={colors.ink[700]} />
      </View>
      <Text className="ml-2.5 text-[15px] font-semibold text-ink-900">{title}</Text>
    </View>
  );
}

function PrepCard({
  icon,
  title,
  items,
}: {
  icon: IconName;
  title: string;
  items: string[];
}) {
  return (
    <Card className="p-4">
      <PrepHeader icon={icon} title={title} />
      {items.map((it, i) => (
        <View key={i} className="mb-1.5 flex-row items-start">
          <View className="mt-0.5">
            <Icon name="check" size={13} color={colors.ink[400]} />
          </View>
          <Text className="ml-2 flex-1 text-[13px] leading-5 text-ink-700">{it}</Text>
        </View>
      ))}
    </Card>
  );
}

const PrepLine = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-1.5 flex-row">
    <Text className="w-12 text-[12px] font-bold text-ink-400">{label}</Text>
    <Text className="flex-1 text-[13px] leading-5 text-ink-700">{value}</Text>
  </View>
);
