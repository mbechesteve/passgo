import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AttractionCard } from "@/components/AttractionCard";
import { CityGroup } from "@/components/CityGroup";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Button, Card, Pill } from "@/components/ui";
import { colors, regionColor } from "@/lib/theme";
import { fetchCountryGraph } from "@/data/repository";
import { getCountryByCode } from "@/data/mockCountries";
import { getCityById } from "@/data/mockCities";
import { getAttractionById } from "@/data/mockAttractions";
import { groupItemsByCity, useTripStore } from "@/store/useTripStore";
import type { Attraction, City, TripItem } from "@/types";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PlanScreen() {
  const nav = useNavigation<Nav>();
  const trips = useTripStore((s) => s.trips);
  const activeTripId = useTripStore((s) => s.activeTripId);
  const setActiveTrip = useTripStore((s) => s.setActiveTrip);

  const active = trips.find((t) => t.id === activeTripId) ?? trips[0];

  // Ensure something is selected once trips exist.
  useEffect(() => {
    if (!activeTripId && trips[0]) setActiveTrip(trips[0].id);
  }, [activeTripId, trips, setActiveTrip]);

  if (trips.length === 0) {
    return (
      <Screen className="px-6">
        <Header title="Trip Planner" />
        <View className="flex-1 items-center justify-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
            <Icon name="briefcase" size={28} color={colors.ink[400]} />
          </View>
          <Text className="mt-3 text-[17px] font-semibold text-ink-900">
            No trips yet
          </Text>
          <Text className="mt-1 text-center text-[13px] text-ink-500">
            Open a country and tap “Start planning” to build your itinerary.
          </Text>
          <Button
            title="Browse countries"
            className="mt-5 px-6"
            onPress={() => nav.navigate("Tabs", { screen: "Discover" })}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Trip Planner" />
      {/* Trip switcher — fixed-height wrapper so the row can't stretch the
          pills vertically (react-native-web stretches an unbounded horizontal
          ScrollView in a flex column). */}
      {trips.length > 1 ? (
        <View style={{ height: 44 }} className="mb-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              alignItems: "center",
            }}
          >
            {trips.map((t) => (
              <Pill
                key={t.id}
                label={`${getCountryByCode(t.countryCode)?.flag ?? ""} ${t.title}`}
                active={t.id === active?.id}
                onPress={() => setActiveTrip(t.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {active ? <TripEditor key={active.id} tripId={active.id} /> : null}
    </Screen>
  );
}

function TripEditor({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const updateMeta = useTripStore((s) => s.updateTripMeta);
  const reorder = useTripStore((s) => s.reorderCityItems);
  const removeItem = useTripStore((s) => s.removeItem);
  const updateItem = useTripStore((s) => s.updateItem);
  const addAttraction = useTripStore((s) => s.addAttraction);

  const [graph, setGraph] = useState<{ cities: City[]; attractions: Attraction[] }>(
    { cities: [], attractions: [] }
  );
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!trip) return;
    fetchCountryGraph(trip.countryCode).then(setGraph);
  }, [trip?.countryCode]);

  const grouped = useMemo(() => groupItemsByCity(trip), [trip]);
  if (!trip) return null;

  const country = getCountryByCode(trip.countryCode);
  const usedAttractionIds = new Set(trip.items.map((i) => i.attractionId));

  // Cities that currently have items, in stable order.
  const cityIdsWithItems = graph.cities
    .map((c) => c.id)
    .filter((id) => (grouped.get(id)?.length ?? 0) > 0);

  return (
    <NestableScrollContainer
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
    >
      {/* Trip meta */}
      <Card className="mb-4 p-4">
        <Text className="text-[12px] font-bold uppercase text-ink-400">
          {country?.flag} {country?.name}
        </Text>
        <TextInput
          value={trip.title}
          onChangeText={(v) => updateMeta(trip.id, { title: v })}
          className="mt-1 text-[20px] font-semibold text-ink-900"
        />
        {/* Itinerary summary */}
        <View className="mt-2 flex-row items-center">
          <Icon name="map-pin" size={13} color={colors.ink[500]} />
          <Text className="ml-1.5 text-[12.5px] font-semibold text-ink-700">
            {cityIdsWithItems.length}{" "}
            {cityIdsWithItems.length === 1 ? "city" : "cities"}
          </Text>
          <Text className="mx-2 text-ink-400">·</Text>
          <Icon name="check-square" size={13} color={colors.ink[500]} />
          <Text className="ml-1.5 text-[12.5px] font-semibold text-ink-700">
            {trip.items.length} {trip.items.length === 1 ? "stop" : "stops"}
          </Text>
        </View>
        <View className="mt-3 flex-row gap-3">
          <Field
            label="Start"
            value={trip.startDate ?? ""}
            placeholder="YYYY-MM-DD"
            onChange={(v) => updateMeta(trip.id, { startDate: v })}
          />
          <Field
            label="End"
            value={trip.endDate ?? ""}
            placeholder="YYYY-MM-DD"
            onChange={(v) => updateMeta(trip.id, { endDate: v })}
          />
        </View>
        <Field
          label="Accommodation"
          value={trip.accommodation ?? ""}
          placeholder="e.g. Zanzibar Beach Resort"
          onChange={(v) => updateMeta(trip.id, { accommodation: v })}
          className="mt-3"
        />
      </Card>

      {trip.items.length === 0 ? (
        <Card className="mb-4 items-center p-6">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
            <Icon name="map-pin" size={22} color={colors.ink[400]} />
          </View>
          <Text className="mt-2.5 text-[14px] font-semibold text-ink-700">
            Add activities to start your itinerary
          </Text>
        </Card>
      ) : (
        cityIdsWithItems.map((cityId, idx) => {
          const city = getCityById(cityId);
          const items = grouped.get(cityId) ?? [];
          if (!city) return null;
          return (
            <CityGroup
              key={cityId}
              city={city}
              index={idx}
              count={items.length}
              accentColor={country ? regionColor(country.region) : undefined}
            >
              <NestableDraggableFlatList
                data={items}
                keyExtractor={(i) => i.id}
                activationDistance={12}
                onDragEnd={({ data }) => reorder(trip.id, cityId, data)}
                renderItem={({ item, drag, isActive }: RenderItemParams<TripItem>) => (
                  <PlannerRow
                    item={item}
                    isActive={isActive}
                    drag={drag}
                    onRemove={() => removeItem(trip.id, item.id)}
                    onNote={(note) => updateItem(trip.id, item.id, { note })}
                  />
                )}
              />
            </CityGroup>
          );
        })
      )}

      {/* Add activities */}
      <Button
        title={showAdd ? "Done adding" : "+ Add activities"}
        variant={showAdd ? "secondary" : "primary"}
        onPress={() => setShowAdd((v) => !v)}
        className="mb-4"
      />
      {showAdd
        ? graph.cities.map((city) => {
            const available = graph.attractions.filter(
              (a) => a.cityId === city.id
            );
            if (available.length === 0) return null;
            return (
              <CityGroup key={`add_${city.id}`} city={city}>
                {available.map((a) => (
                  <AttractionCard
                    key={a.id}
                    attraction={a}
                    added={usedAttractionIds.has(a.id)}
                    onAdd={() => addAttraction(trip.id, a)}
                  />
                ))}
              </CityGroup>
            );
          })
        : null}
    </NestableScrollContainer>
  );
}

function PlannerRow({
  item,
  drag,
  isActive,
  onRemove,
  onNote,
}: {
  item: TripItem;
  drag: () => void;
  isActive: boolean;
  onRemove: () => void;
  onNote: (v: string) => void;
}) {
  const attraction = item.attractionId
    ? getAttractionById(item.attractionId)
    : undefined;
  return (
    <View
      className={`mb-2 rounded-2xl border bg-surface p-3 ${
        isActive ? "border-brand-600" : "border-surface-sunken"
      }`}
    >
      <View className="flex-row items-center">
        <Pressable
          onLongPress={drag}
          delayLongPress={120}
          hitSlop={8}
          accessibilityLabel="Drag to reorder"
          className="pr-3"
        >
          <Icon name="menu" size={18} color={colors.ink[400]} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-ink-900">{item.title}</Text>
          {attraction ? (
            <Text className="text-[11px] text-ink-400">
              {attraction.category} · {attraction.durationHours}h
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityLabel={`Remove ${item.title}`}
          className="h-7 w-7 items-center justify-center rounded-full bg-surface-muted"
        >
          <Icon name="x" size={14} color={colors.ink[500]} />
        </Pressable>
      </View>
      <TextInput
        value={item.note ?? ""}
        onChangeText={onNote}
        placeholder="Add a note…"
        placeholderTextColor="#929292"
        className="mt-2 rounded-xl bg-surface-muted px-3 py-2 text-[13px] text-ink-700"
      />
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <View className={`flex-1 ${className}`}>
      <Text className="mb-1 text-[11px] font-bold uppercase text-ink-400">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#929292"
        className="rounded-xl border border-surface-sunken bg-surface px-3 py-2.5 text-[14px] text-ink-900"
      />
    </View>
  );
}

const Header = ({ title }: { title: string }) => (
  <View className="px-4 pb-2 pt-2">
    <Text className="text-[26px] font-semibold text-ink-900">{title}</Text>
  </View>
);
