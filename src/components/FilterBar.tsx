import { ScrollView, Text, View } from "react-native";

import type { BudgetTier, Region } from "@/types";
import { Pill } from "./ui";

export interface DiscoverFilters {
  region: Region | "All";
  budget: BudgetTier | "All";
  /** Max suggested trip length in days, or null for any. */
  maxDays: number | null;
  /** Only show "easy" (visa-free / VoA / e-Visa / ETA) destinations. */
  easyOnly: boolean;
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  region: "All",
  budget: "All",
  maxDays: null,
  easyOnly: true,
};

const REGIONS: (Region | "All")[] = [
  "All",
  "Africa",
  "Asia",
  "Middle East",
  "Europe",
  "Caribbean",
  "Oceania",
];

const BUDGETS: { key: BudgetTier | "All"; label: string }[] = [
  { key: "All", label: "Any budget" },
  { key: "budget", label: "💰 Budget" },
  { key: "moderate", label: "💰💰 Moderate" },
  { key: "luxury", label: "💎 Premium" },
];

const TRIP_LENGTHS: { key: number | null; label: string }[] = [
  { key: null, label: "Any length" },
  { key: 4, label: "≤ 4 days" },
  { key: 7, label: "≤ 1 week" },
  { key: 10, label: "≤ 10 days" },
];

export function FilterBar({
  filters,
  onChange,
}: {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
}) {
  return (
    <View>
      <Row>
        <Pill
          label={filters.easyOnly ? "✅ Easy only" : "Show all visa types"}
          active={filters.easyOnly}
          onPress={() => onChange({ ...filters, easyOnly: !filters.easyOnly })}
        />
      </Row>

      <Label text="Region" />
      <Row>
        {REGIONS.map((r) => (
          <Pill
            key={r}
            label={r}
            active={filters.region === r}
            onPress={() => onChange({ ...filters, region: r })}
          />
        ))}
      </Row>

      <Label text="Budget" />
      <Row>
        {BUDGETS.map((b) => (
          <Pill
            key={b.key}
            label={b.label}
            active={filters.budget === b.key}
            onPress={() => onChange({ ...filters, budget: b.key })}
          />
        ))}
      </Row>

      <Label text="Trip length" />
      <Row>
        {TRIP_LENGTHS.map((t) => (
          <Pill
            key={String(t.key)}
            label={t.label}
            active={filters.maxDays === t.key}
            onPress={() => onChange({ ...filters, maxDays: t.key })}
          />
        ))}
      </Row>
    </View>
  );
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 16 }}
    className="mb-1"
  >
    {children}
  </ScrollView>
);

const Label = ({ text }: { text: string }) => (
  <Text className="mb-1.5 mt-3 text-[12px] font-bold uppercase tracking-wide text-ink-400">
    {text}
  </Text>
);
