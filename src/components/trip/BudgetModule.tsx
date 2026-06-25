import { Text, TextInput, View } from "react-native";

import { Card, Tag } from "@/components/ui";
import { ProgressBar } from "./ProgressBar";
import { useTripStore } from "@/store/useTripStore";
import { kes } from "@/utils/format";
import { budgetTotals } from "@/utils/tripStats";
import type { BudgetItem } from "@/types";

export function BudgetModule({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const setActual = useTripStore((s) => s.setBudgetActual);
  if (!trip) return null;
  const items = trip.budget ?? [];
  const totals = budgetTotals(items);

  return (
    <View>
      <Card className="mb-3 p-4">
        <ProgressBar pct={totals.pct} label="Spent vs estimated" />
        <View className="mt-3 flex-row justify-between">
          <Text className="text-[13px] text-ink-500">
            Actual <Text className="font-semibold text-ink-900">{kes(totals.actual)}</Text>
          </Text>
          <Text className="text-[13px] text-ink-500">
            Estimated <Text className="font-semibold text-ink-900">{kes(totals.estimated)}</Text>
          </Text>
        </View>
      </Card>

      <Card className="px-4 py-1">
        {items.map((b) => (
          <Row key={b.id} item={b} onActual={(v) => setActual(tripId, b.id, v)} />
        ))}
      </Card>
    </View>
  );
}

function Row({
  item,
  onActual,
}: {
  item: BudgetItem;
  onActual: (v: number | undefined) => void;
}) {
  return (
    <View className="flex-row items-center border-b border-surface-sunken py-3 last:border-b-0">
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-ink-900">{item.category}</Text>
        <View className="mt-0.5 flex-row items-center">
          <Text className="text-[11.5px] text-ink-400">Est {kes(item.estimatedKes)}</Text>
          {item.paidBy ? (
            <View className="ml-2">
              <Tag label={item.paidBy} />
            </View>
          ) : null}
        </View>
      </View>
      <TextInput
        defaultValue={item.actualKes != null ? String(Math.round(item.actualKes)) : ""}
        onChangeText={(t) => {
          const n = Number(t.replace(/[^0-9.]/g, ""));
          onActual(t.trim() === "" || Number.isNaN(n) ? undefined : n);
        }}
        keyboardType="numeric"
        placeholder="Actual"
        placeholderTextColor="#929292"
        className="w-24 rounded-xl border border-surface-sunken bg-surface px-2 py-2 text-right text-[13px] text-ink-900"
      />
    </View>
  );
}
