import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Pill } from "@/components/ui";
import { getCountryByCode } from "@/data/mockCountries";
import { useTripStore } from "@/store/useTripStore";

const MODULES = ["Overview", "Documents", "Itinerary", "Bookings", "Budget", "Packing"] as const;
type Module = (typeof MODULES)[number];

export function TripHub({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const [module, setModule] = useState<Module>("Overview");
  if (!trip) return null;
  const country = getCountryByCode(trip.countryCode);

  return (
    <View className="flex-1">
      <View className="px-4 pb-1">
        <Text className="text-[12px] font-bold uppercase text-ink-400">
          {country?.flag} {country?.name}
        </Text>
        <Text className="text-[22px] font-semibold text-ink-900">{trip.title}</Text>
      </View>

      <View style={{ height: 44 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}
        >
          {MODULES.map((m) => (
            <Pill key={m} label={m} active={m === module} onPress={() => setModule(m)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      >
        <Text className="text-ink-500">{module} — coming up in the next task.</Text>
      </ScrollView>
    </View>
  );
}
