import { Linking, Text, View } from "react-native";

import { Button, Card, Tag } from "@/components/ui";
import { kes } from "@/utils/format";
import type { Flight, Stay, Trip } from "@/types";

async function openLink(url?: string) {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    /* no-op: invalid link */
  }
}

export function BookingsModule({ trip }: { trip: Trip }) {
  const flights = trip.flights ?? [];
  const stays = trip.stays ?? [];
  return (
    <View>
      {flights.length ? (
        <Text className="mb-2 text-[12px] font-bold uppercase text-ink-400">Flights</Text>
      ) : null}
      {flights.map((f) => (
        <FlightCard key={f.id} f={f} />
      ))}

      {stays.length ? (
        <Text className="mb-2 mt-2 text-[12px] font-bold uppercase text-ink-400">Stays</Text>
      ) : null}
      {stays.map((s) => (
        <StayCard key={s.id} s={s} />
      ))}
    </View>
  );
}

function FlightCard({ f }: { f: Flight }) {
  return (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold text-ink-900">{f.airline}</Text>
        {f.status ? <Tag label={f.status} /> : null}
      </View>
      <Text className="mt-0.5 text-[13.5px] text-ink-700">{f.route}</Text>
      <Text className="mt-1 text-[12.5px] text-ink-500">
        {f.departDate ?? ""}
        {f.returnDate ? ` · returns ${f.returnDate}` : ""}
      </Text>
      {f.pricePpKes != null ? (
        <Text className="mt-1 text-[13px] font-semibold text-ink-900">
          {kes(f.pricePpKes)} pp
        </Text>
      ) : null}
    </Card>
  );
}

function StayCard({ s }: { s: Stay }) {
  return (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-ink-500">{s.location}</Text>
        {s.status ? <Tag label={s.status} /> : null}
      </View>
      <Text className="mt-0.5 text-[15px] font-semibold text-ink-900">{s.hotel}</Text>
      <Text className="mt-1 text-[12.5px] text-ink-500">
        {s.checkIn ?? ""} → {s.checkOut ?? ""}
        {s.nights ? ` · ${s.nights} nights` : ""}
      </Text>
      {s.notes ? <Text className="mt-1 text-[12.5px] text-ink-700">{s.notes}</Text> : null}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-ink-900">{kes(s.totalKes)}</Text>
        {s.link ? (
          <Button title="Open booking" variant="secondary" onPress={() => openLink(s.link)} />
        ) : null}
      </View>
    </Card>
  );
}
