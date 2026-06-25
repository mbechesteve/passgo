import { Text, View } from "react-native";

import { Card } from "@/components/ui";
import { CheckRow } from "./CheckRow";
import { ProgressBar } from "./ProgressBar";
import { useTripStore } from "@/store/useTripStore";
import { packProgress } from "@/utils/tripStats";
import type { PackItem } from "@/types";

function groupByCategory(items: PackItem[]): [string, PackItem[]][] {
  const map = new Map<string, PackItem[]>();
  for (const it of items) {
    const arr = map.get(it.category) ?? [];
    arr.push(it);
    map.set(it.category, arr);
  }
  return [...map.entries()];
}

export function PackingModule({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const togglePack = useTripStore((s) => s.togglePack);
  if (!trip) return null;

  const packing = trip.packing ?? [];
  const shopping = trip.shopping ?? [];
  const apps = trip.apps ?? [];
  const p = packProgress(packing);

  return (
    <View>
      <Card className="mb-3 p-4">
        <ProgressBar pct={p.pct} label={`Packed · ${p.done}/${p.total}`} />
      </Card>

      {groupByCategory(packing).map(([category, items]) => (
        <Card key={category} className="mb-3 px-4 py-2">
          <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">{category}</Text>
          {items.map((it) => (
            <CheckRow
              key={it.id}
              label={it.name}
              meta={it.qty ?? it.date}
              checked={it.checked}
              onToggle={() => togglePack(tripId, "packing", it.id)}
            />
          ))}
        </Card>
      ))}

      {shopping.length ? (
        <Card className="mb-3 px-4 py-2">
          <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">
            Shopping wishlist
          </Text>
          {shopping.map((it) => (
            <CheckRow
              key={it.id}
              label={it.name}
              meta={it.qty}
              checked={it.checked}
              onToggle={() => togglePack(tripId, "shopping", it.id)}
            />
          ))}
        </Card>
      ) : null}

      {apps.length ? (
        <Card className="mb-3 px-4 py-2">
          <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">Useful apps</Text>
          {apps.map((a) => (
            <View key={a.id} className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-[14px] font-semibold text-ink-900">{a.name}</Text>
                <Text className="text-[11.5px] text-ink-400">
                  {a.category}
                  {a.purpose ? ` · ${a.purpose}` : ""}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}
