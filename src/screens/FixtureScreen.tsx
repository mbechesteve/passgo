import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Button, Pill } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { PeakFrame } from "@/components/pamoja/PeakFrame";
import { TeamRow } from "@/components/pamoja/TeamRow";
import { Icon } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { eatParts, now } from "@/lib/clock";
import { S } from "@/lib/strings";
import {
  fetchAirLinks,
  fetchBorderCrossings,
  fetchHallMaps,
  fetchMatches,
  fetchParking,
} from "@/data/repository";
import { usePassStore } from "@/store/usePassStore";
import { kes } from "@/utils/format";
import { gatesOpenLabel } from "@/utils/match";
import { fixtureStatus, venueLine } from "@/utils/schedule";
import { mapForMatch, tiers } from "@/utils/hallmap";
import { walkRangeLabel } from "@/utils/parking";
import { fuelEstimate } from "@/utils/cost";
import type {
  AirLink,
  BorderCrossing,
  HallMap,
  Match,
  ParkingZone,
} from "@/types";
import type { MatchesStackParamList } from "@/navigation/types";

type Section = "overview" | "tickets" | "travel" | "ground";

/** One way of getting there, as a ranked card. */
interface Leg {
  key: string;
  tag: string;
  title: string;
  sub?: string;
  right?: string;
  onPress?: () => void;
}

/**
 * One fixture, and everything a fan can do about it.
 *
 * This is the screen the redesign turns on. Tickets, travel and the ground used to live
 * in three different tabs behind their own navigation; here they are sections of the
 * match they belong to, so nothing about a fixture is more than one tap from the row it
 * was seen on.
 *
 * Travel is a set of ranked cards rather than the three stacked toggles it replaced, and
 * every figure on them is one the app already stands behind — the shuttle interval as
 * Services words it, the walk range derived from the parking zones, the fuel arithmetic,
 * and the air fare labelled indicative because no June 2027 fare is published.
 */
export function FixtureScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProp<MatchesStackParamList, "Fixture">>();

  const [matches, setMatches] = useState<Match[]>([]);
  const [maps, setMaps] = useState<HallMap[]>([]);
  const [links, setLinks] = useState<AirLink[]>([]);
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [section, setSection] = useState<Section>("overview");
  const [headerWidth, setHeaderWidth] = useState(0);

  const ticket = usePassStore((s) => s.ticket);

  useEffect(() => {
    void fetchMatches().then(setMatches);
    void fetchHallMaps().then(setMaps);
    void fetchAirLinks().then(setLinks);
    void fetchBorderCrossings().then(setCrossings);
    void fetchParking().then(setZones);
  }, []);

  const at = now();
  const match = matches.find((m) => m.id === params.matchId);

  if (!match) {
    return (
      <Screen>
        <BackBar />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-[15px] text-body">{S.fixtureNotFound}</Text>
        </View>
      </Screen>
    );
  }

  const status = fixtureStatus(match, { at, maps, ticketMatchId: ticket?.matchId });
  const map = mapForMatch(maps, match.id);
  const holdsTicket = ticket?.matchId === match.id;
  const inNairobi = match.city === "Nairobi";
  const walk = walkRangeLabel(zones);

  const SECTIONS: { key: Section; label: string }[] = [
    { key: "overview", label: S.fixtureOverview },
    { key: "tickets", label: S.fixtureTickets },
    { key: "travel", label: S.fixtureTravel },
    { key: "ground", label: S.fixtureGround },
  ];

  // Ranked by what a fan in Nairobi would reach for first.
  const legs: Leg[] = [];
  if (inNairobi) {
    legs.push({
      key: "shuttle",
      tag: S.legShuttle,
      title: S.servicesShuttles,
      sub: S.servicesShuttlesDetail,
    });
    legs.push({
      key: "park",
      tag: S.legRoad,
      title: S.drivingParkAndWalk,
      sub: walk
        ? `${S.servicesParkingDetail} · ${walk} ${S.parkingWalkSuffix}`
        : S.servicesParkingDetail,
      onPress: () => navigation.navigate("Parking"),
    });
  } else {
    const link = links.find((l) => l.servesCity === match.city);
    if (link) {
      legs.push({
        key: "fly",
        tag: S.legAir,
        title: `${link.fromCode} → ${link.toCode}`,
        sub: `${S.flyTransferPrefix} ~${link.transferKm} km ${S.flyTransferMiddle} ${link.transferTo}`,
        right: `~${kes(link.fareEstimate.low)}–${link.fareEstimate.high.toLocaleString("en-US")}`,
        onPress: () => navigation.navigate("GettingThere"),
      });
    }
    const road = crossings.find(
      (c) => c.direction === "out" && c.destinationCity === match.city
    );
    if (road) {
      legs.push({
        key: "road",
        tag: S.legRoad,
        title: `${road.originCity} → ${road.destinationCity}`,
        sub: `~${road.distanceKm.toLocaleString("en-US")} km · ~${road.driveHours} h · ${road.post}`,
        right: `${S.costFuelPrefix} ~${kes(fuelEstimate(road.distanceKm))}`,
        onPress: () => navigation.navigate("GettingThere"),
      });
    }
  }

  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* The motif carries the header: the same summit the media mask cuts. */}
        {/* The gutter sits on the outer view and the measured one sits inside it:
            onLayout reports a view's own width including its padding, so measuring the
            padded view handed PeakFrame 40px more than it had to draw in. */}
        <View className="mt-4 px-5">
          <View onLayout={(e) => setHeaderWidth(e.nativeEvent.layout.width)}>
            {headerWidth > 0 ? (
            <PeakFrame width={headerWidth} height={168}>
              <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-accent-soft">
                {`${venueLine(match)} · ${eatParts(match.kickoff).time}`}
              </Text>
              <View className="mt-2">
                <TeamRow
                  home={match.home}
                  away={match.away}
                  tone="dark"
                  middle={
                    <Text className="font-mono text-[11px] text-ondark-mute">
                      {S.fixtureVersus}
                    </Text>
                  }
                />
              </View>
              </PeakFrame>
            ) : null}
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap px-5">
          {SECTIONS.map((s) => (
            <View key={s.key} className="mb-2">
              <Pill
                label={s.label}
                active={section === s.key}
                onPress={() => setSection(s.key)}
              />
            </View>
          ))}
        </View>

        <View className="px-5">
          {section === "overview" ? (
            <View className="mt-2">
              <View className="rounded-card border border-hairline bg-canvas px-5 py-4">
                <Eyebrow>{S.fixtureStatusHeading}</Eyebrow>
                <View className="mt-2 flex-row items-center">
                  <Chip
                    label={status.label}
                    tone={status.kind === "live" ? "accent" : "tint"}
                  />
                </View>
              </View>
              <View className="mt-3 rounded-card border border-hairline bg-canvas px-5 py-4">
                <Eyebrow>{S.fixtureVenueHeading}</Eyebrow>
                <Text className="mt-1 font-medium text-[15px] text-ink">
                  {venueLine(match)}
                </Text>
                <Text className="mt-0.5 font-mono text-[11px] text-mute">
                  {`${S.homeGatesOpenPrefix} ${gatesOpenLabel(match)}`}
                </Text>
              </View>
            </View>
          ) : null}

          {section === "tickets" ? (
            <View className="mt-2">
              {holdsTicket && ticket ? (
                <View className="rounded-card border border-hairline bg-canvas px-5 py-4">
                  <Eyebrow>{S.fixtureYourSeat}</Eyebrow>
                  <Text className="mt-1 font-mono-medium text-[15px] text-ink">
                    {`${S.passGate} ${ticket.gate} · ${S.passSection} ${ticket.section} · ${S.passSeat} ${ticket.seat}`}
                  </Text>
                </View>
              ) : map ? (
                <>
                  <Text className="text-[15px] leading-6 text-body">
                    {`${S.fixtureFrom} ${kes(
                      Math.min(...tiers(map).map((t) => t.price))
                    )}`}
                  </Text>
                  <Button
                    title={S.fixtureChooseSeat}
                    className="mt-4"
                    onPress={() =>
                      navigation.navigate("TicketOffice", { matchId: match.id })
                    }
                  />
                </>
              ) : (
                <Text className="text-[15px] leading-6 text-body">
                  {S.officeNotOnSale}
                </Text>
              )}
            </View>
          ) : null}

          {section === "travel" ? (
            <View className="mt-2">
              {legs.map((leg) => (
                <Pressable
                  key={leg.key}
                  onPress={leg.onPress}
                  disabled={!leg.onPress}
                  accessibilityRole="button"
                  className="mb-2 rounded-card border border-hairline bg-canvas px-4 py-3.5 active:opacity-70"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Chip label={leg.tag} tone="panel" />
                      <Text className="mt-2 font-medium text-[15px] text-ink">
                        {leg.title}
                      </Text>
                      {leg.sub ? (
                        <Text className="mt-0.5 text-[13px] leading-5 text-body">
                          {leg.sub}
                        </Text>
                      ) : null}
                    </View>
                    {leg.right ? (
                      <Text className="font-mono-medium text-[13px] text-ink">
                        {leg.right}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
              <Text className="mt-3 font-mono text-[11px] leading-4 text-mute">
                {S.fixtureTravelCaveat}
              </Text>
            </View>
          ) : null}

          {section === "ground" ? (
            <View className="mt-2">
              {[
                inNairobi
                  ? {
                      key: "parking",
                      title: S.servicesParking,
                      detail: S.servicesParkingDetail,
                      go: () => navigation.navigate("Parking"),
                    }
                  : null,
                {
                  key: "safety",
                  title: S.servicesSafety,
                  detail: S.servicesSafetyDetail,
                  go: () => navigation.navigate("Safety"),
                },
              ]
                .filter((r): r is NonNullable<typeof r> => r !== null)
                .map((row) => (
                  <Pressable
                    key={row.key}
                    onPress={row.go}
                    accessibilityRole="button"
                    className="flex-row items-center border-b border-hairline py-3.5 active:opacity-70"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="font-medium text-[15px] text-ink">
                        {row.title}
                      </Text>
                      <Text className="mt-0.5 text-[13px] text-body">{row.detail}</Text>
                    </View>
                    <Icon name="chevron-right" size={18} color={colors.mute} />
                  </Pressable>
                ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
