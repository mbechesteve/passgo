import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { HallMap } from "@/components/pamoja/HallMap";
import { TeamRow } from "@/components/pamoja/TeamRow";
import { colors } from "@/lib/theme";
import { S } from "@/lib/strings";
import { fetchHallMaps, fetchMatches } from "@/data/repository";
import { kes } from "@/utils/format";
import { kickoffLabel } from "@/utils/match";
import {
  MAX_PER_ORDER,
  blockPrice,
  clampQty,
  mapForMatch,
  orderTotal,
  tiers,
} from "@/utils/hallmap";
import type { HallMap as HallMapData, Match, StadiumBlock } from "@/types";
import type { ExploreStackParamList } from "@/navigation/types";

const MAP_WIDTH = 320;
const MAP_HEIGHT = 260;

/**
 * The ticket office: pick a block, pick how many seats, see what it comes to, and
 * hand off.
 *
 * The hand-off is the point. Rev. 2 §05 — Pamoja "never holds the funds, never sees a
 * card number, and needs no banking licence in any of the three countries" — so this
 * screen stops at the total, in the same words `ConfirmScreen` uses for a discount.
 * There is no basket, no card field and no payment step, deliberately.
 *
 * Block level, not seat level: the seat is assigned, exactly as the Pass's own ticket
 * already represents it, so no per-seat inventory is invented and there is no hold
 * countdown pretending to reserve something no backend is holding.
 */
export function TicketOfficeScreen() {
  const { params } = useRoute<RouteProp<ExploreStackParamList, "TicketOffice">>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [maps, setMaps] = useState<HallMapData[]>([]);
  const [selected, setSelected] = useState<StadiumBlock | null>(null);
  const [qty, setQty] = useState(2);
  const [handedOff, setHandedOff] = useState(false);

  useEffect(() => {
    void fetchMatches().then(setMatches);
    void fetchHallMaps().then(setMaps);
  }, []);

  const match = matches.find((m) => m.id === params.matchId);
  const map = mapForMatch(maps, params.matchId);

  if (!map) {
    return (
      <Screen>
        <BackBar />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-[15px] text-body">{S.officeNotOnSale}</Text>
        </View>
      </Screen>
    );
  }

  const choose = (block: StadiumBlock) => {
    setSelected(block);
    setQty(clampQty(qty, block));
    setHandedOff(false);
  };

  const seats = selected ? clampQty(qty, selected) : 0;
  const total = selected ? orderTotal(map, selected, seats) : 0;
  const atMax =
    selected !== null && seats >= Math.min(MAX_PER_ORDER, selected.available);

  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.officeTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.officeStandfirst}
        </Text>

        {match ? (
          <View className="mt-5 rounded-card border border-hairline bg-canvas px-5 py-4">
            <TeamRow
              home={match.home}
              away={match.away}
              middle={
                <Text className="font-mono text-[11px] text-mute">
                  {kickoffLabel(match)}
                </Text>
              }
            />
          </View>
        ) : null}

        <View className="mt-6 items-center">
          <HallMap
            map={map}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            selectedId={selected?.id ?? null}
            onSelect={choose}
          />
        </View>

        <Eyebrow className="mt-8">{S.officeTiersHeading}</Eyebrow>
        <View className="mt-2">
          {tiers(map).map((tier) => (
            <View
              key={tier.category}
              className="flex-row items-center justify-between border-b border-hairline py-3"
            >
              <Chip label={`${S.passCategoryPrefix} ${tier.category}`} tone="tint" />
              <Text className="font-mono-medium text-[14px] text-ink">
                {kes(tier.price)}
              </Text>
            </View>
          ))}
        </View>

        {selected ? (
          <>
            <Eyebrow className="mt-8">{S.officeSeatsHeading}</Eyebrow>
            <View className="mt-2 flex-row items-center justify-between rounded-card border border-hairline bg-canvas px-5 py-4">
              <View className="flex-1">
                <Text className="font-medium text-[15px] text-ink">
                  {`${S.officeBlockPrefix} ${selected.label}`}
                </Text>
                <Text className="mt-0.5 font-mono text-[11px] text-mute">
                  {`${S.officeGatePrefix} ${selected.gate} · ${S.passCategoryPrefix} ${selected.category} · ${kes(blockPrice(map, selected))}`}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Stepper
                  label="−"
                  disabled={seats <= 1}
                  onPress={() => setQty(clampQty(seats - 1, selected))}
                />
                <Text className="mx-4 font-mono-medium text-[16px] text-ink">
                  {seats}
                </Text>
                <Stepper
                  label="+"
                  disabled={atMax}
                  onPress={() => setQty(clampQty(seats + 1, selected))}
                />
              </View>
            </View>

            <Eyebrow className="mt-8">{S.officeTotalHeading}</Eyebrow>
            <View className="mt-2 rounded-card border border-hairline bg-panel px-5 py-5">
              <Text className="font-mono text-[13px] text-mute">
                {`${seats} ${seats === 1 ? S.officeSeat : S.officeSeats} · ${S.officeBlockPrefix} ${selected.label}`}
              </Text>
              <Text className="mt-1 font-mono-medium text-[22px] text-ink">
                {kes(total)}
              </Text>
            </View>

            <Text className="mt-4 font-mono text-[11px] leading-4 text-mute">
              {S.officeHandoffNote}
            </Text>

            {handedOff ? (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-4 py-4">
                <Text className="text-[13px] leading-5 text-ink">
                  {S.officeHandedOff}
                </Text>
              </View>
            ) : (
              <Button
                title={S.officeContinue}
                className="mt-6"
                disabled={seats === 0}
                onPress={() => setHandedOff(true)}
              />
            )}
          </>
        ) : null}

        <Text className="mt-8 font-mono text-[11px] leading-4 text-mute">
          {S.officeFiguresCaveat}
        </Text>
      </ScrollView>
    </Screen>
  );
}

/** One end of the seat count. Square, so both ends read as one control. */
function Stepper({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label === "+" ? "One more seat" : "One fewer seat"}
      className={`h-9 w-9 items-center justify-center rounded-full border border-hairline ${
        disabled ? "opacity-40" : "active:opacity-70"
      }`}
    >
      <Text className="font-mono-medium text-[16px]" style={{ color: colors.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}
