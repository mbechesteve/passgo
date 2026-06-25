import { Text, View } from "react-native";

import { Card, Stat } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { daysUntil, kes } from "@/utils/format";
import { budgetTotals, docProgress } from "@/utils/tripStats";
import type { Trip } from "@/types";

export function OverviewModule({ trip }: { trip: Trip }) {
  const days = daysUntil(trip.startDate);
  const docs = docProgress(trip.documents);
  const budget = budgetTotals(trip.budget);
  const countdown =
    days == null ? "—" : days > 0 ? `${days}d` : days === 0 ? "Today" : `${-days}d ago`;

  return (
    <View>
      <Card className="mb-3 p-4">
        {days != null && days >= 0 ? (
          <Text className="text-[13px] font-semibold text-ink-500">
            {days === 0 ? "Departure is today ✈️" : `${days} days to departure ✈️`}
          </Text>
        ) : null}
        <Text className="mt-1 text-[15px] font-semibold text-ink-900">
          {trip.overview?.areas ?? trip.accommodation ?? ""}
        </Text>
        <View className="mt-1 flex-row flex-wrap">
          {trip.startDate ? (
            <Meta icon="calendar" text={`${trip.startDate} → ${trip.endDate ?? ""}`} />
          ) : null}
          {trip.overview?.durationLabel ? (
            <Meta icon="clock" text={trip.overview.durationLabel} />
          ) : null}
          {trip.travelers?.length ? (
            <Meta icon="users" text={trip.travelers.join(" & ")} />
          ) : null}
          {trip.overview?.departure ? (
            <Meta icon="map-pin" text={`From ${trip.overview.departure}`} />
          ) : null}
        </View>
      </Card>

      <View className="mb-3 flex-row gap-2">
        <Stat value={countdown} label="Countdown" icon="calendar" />
        <Stat value={`${docs.done}/${docs.total}`} label="Documents" icon="check-square" />
        <Stat value={kes(budget.actual)} label="Spent" icon="credit-card" />
      </View>

      {trip.overview?.route?.length ? (
        <Card className="p-4">
          <Text className="mb-2 text-[12px] font-bold uppercase text-ink-400">Route</Text>
          {trip.overview.route.map((leg, i) => (
            <View key={i} className="flex-row items-start py-1">
              <Icon name="chevron-right" size={14} color={colors.ink[400]} />
              <Text className="ml-1.5 flex-1 text-[13.5px] text-ink-700">{leg}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="mr-3 mt-1.5 flex-row items-center">
      <Icon name={icon} size={13} color={colors.ink[500]} />
      <Text className="ml-1 text-[12.5px] text-ink-700">{text}</Text>
    </View>
  );
}
