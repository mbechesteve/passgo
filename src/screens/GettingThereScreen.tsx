import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { BackBar } from "@/components/pamoja/BackBar";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { RouteStrip } from "@/components/pamoja/RouteStrip";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import {
  fetchAirLinks,
  fetchBorderCrossings,
  fetchMatches,
  fetchParking,
} from "@/data/repository";
import { dateLabel, kes } from "@/utils/format";
import { awayCitySuffix, fixturesInCity, linkById } from "@/utils/air";
import { kickoffLabel, matchLabel } from "@/utils/match";
import { walkRangeLabel } from "@/utils/parking";
import { fuelAssumptionLabel, fuelEstimate } from "@/utils/cost";
import type { AirLink, BorderCrossing, Match, ParkingZone } from "@/types";

type Mode = "drive" | "fly";

/**
 * How a fan reaches a match — by road across a border, or by air to an away fixture.
 *
 * One screen for both, because the two share almost everything that matters: the
 * documents, the provenance caveat, and the fact that a route is only ever "correct as
 * of" a date. Two screens would have meant describing the same passport requirement
 * twice and a fan backing out of one to compare it with the other.
 *
 * The air view carries no fare, no flight time and no frequency. Nobody has published
 * a June 2027 network — see the note in `src/data/air.ts` — and inventing one is the
 * defect `debbce9` removed.
 */
export function GettingThereScreen() {
  const navigation = useNavigation<any>();
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [links, setLinks] = useState<AirLink[]>([]);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [mode, setMode] = useState<Mode>("drive");
  // Which way the road runs, then which road. Kept apart because the same country can
  // appear in both directions and a fan is asking a different question in each.
  const [heading, setHeading] = useState<"in" | "out">("in");
  const [crossingId, setCrossingId] = useState("bx-in-ug");
  // The leg, by id — a fan picks a city to travel to, and two of them are inside Kenya.
  const [legId, setLegId] = useState("air-eldoret");

  useEffect(() => {
    void fetchBorderCrossings().then(setCrossings);
    void fetchAirLinks().then(setLinks);
    void fetchParking().then(setZones);
    void fetchMatches().then(setMatches);
  }, []);

  const at = now();
  const sameHeading = crossings.filter((c) => c.direction === heading);
  // A selection made in one direction does not survive a switch to the other, so fall
  // back to the first route of the new heading rather than showing nothing.
  const picked = crossings.find((c) => c.id === crossingId);
  const crossing =
    picked && picked.direction === heading ? picked : sameHeading[0];
  const link = linkById(links, legId);
  const walk = walkRangeLabel(zones);

  // Both rows carry figures the app already stands behind — the shuttle interval in the
  // words Services uses, the walk range derived from the zones Parking lists.
  const legs = [
    {
      key: "shuttle",
      title: S.servicesShuttles,
      detail: S.servicesShuttlesDetail,
      onPress: () => navigation.navigate("Category", { category: "move" }),
    },
    {
      key: "park",
      title: S.drivingParkAndWalk,
      detail: walk
        ? `${S.servicesParkingDetail} · ${walk} ${S.parkingWalkSuffix}`
        : S.servicesParkingDetail,
      onPress: () => navigation.navigate("Parking"),
    },
  ];

  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.gettingThereTitle}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.gettingThereStandfirst}
        </Text>

        <View className="mt-5 flex-row">
          <Pill
            label={S.modeDrive}
            icon="navigation"
            active={mode === "drive"}
            onPress={() => setMode("drive")}
          />
          <Pill
            label={S.modeFly}
            icon="send"
            active={mode === "fly"}
            onPress={() => setMode("fly")}
          />
        </View>

        {mode === "drive" ? (
          <>
            <View className="mt-4 flex-row flex-wrap">
              <View className="mb-2">
                <Pill
                  label={S.driveArriving}
                  active={heading === "in"}
                  onPress={() => setHeading("in")}
                />
              </View>
              <View className="mb-2">
                <Pill
                  label={S.driveLeaving}
                  active={heading === "out"}
                  onPress={() => setHeading("out")}
                />
              </View>
            </View>

            <View className="flex-row flex-wrap">
              {sameHeading.map((c) => (
                <View key={c.id} className="mb-2">
                  <Pill
                    label={c.label}
                    active={c.id === crossing?.id}
                    onPress={() => setCrossingId(c.id)}
                  />
                </View>
              ))}
            </View>

            {crossing ? (
              <>
                <Eyebrow className="mt-6">{S.drivingYourRoute}</Eyebrow>
                <View className="mt-3 rounded-card border border-hairline bg-canvas px-5 py-5">
                  <RouteStrip
                    fromCity={crossing.originCity}
                    fromCode={crossing.originCode}
                    via={crossing.post}
                    toCity={crossing.destinationCity}
                    toCode={crossing.destinationCode}
                  />
                  <View className="mt-4 border-t border-hairline pt-1">
                    <StatTrio
                      items={[
                        {
                          value: `~${crossing.distanceKm.toLocaleString("en-US")} km`,
                          label: S.drivingDistance,
                        },
                        {
                          value: `~${crossing.driveHours} h`,
                          label: S.drivingDriveTime,
                        },
                        {
                          value: `~${crossing.waitMinutes} min`,
                          label: S.drivingBorderWait,
                        },
                      ]}
                    />
                  </View>

                  <View className="mt-4 border-t border-hairline pt-3">
                    <Text className="font-mono-medium text-[15px] text-ink">
                      {`${S.costFuelPrefix} ~${kes(fuelEstimate(crossing.distanceKm))}`}
                    </Text>
                    <Text className="mt-1 font-mono text-[11px] leading-4 text-mute">
                      {`${S.costAssumesPrefix} ${fuelAssumptionLabel()}. ${S.costExcludesNote}`}
                    </Text>
                  </View>
                </View>

                <Requirements
                  heading={S.drivingNeed}
                  items={crossing.requirements}
                />
                <GoodToKnow items={crossing.goodToKnow} />

                <Text className="mt-6 font-mono text-[11px] leading-4 text-mute">
                  {`${S.drivingAsOfPrefix} ${dateLabel(crossing.asOf)}. ${S.drivingConfirmCaveat}`}
                </Text>
              </>
            ) : null}

            {/* Only the road view arrives in Nairobi. A fan flying out to Kampala is
                leaving it, so the last-leg band would be about the wrong city. */}
            <Eyebrow className="mt-8">{S.drivingOnceInNairobi}</Eyebrow>
            <View className="mt-2">
              {legs.map((leg) => (
                <Pressable
                  key={leg.key}
                  onPress={leg.onPress}
                  className="flex-row items-center border-b border-hairline py-3.5 active:opacity-70"
                >
                  <View className="flex-1 pr-3">
                    <Text className="font-medium text-[15px] text-ink">
                      {leg.title}
                    </Text>
                    <Text className="mt-0.5 text-[13px] leading-5 text-body">
                      {leg.detail}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={18} color={colors.mute} />
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <View className="mt-4 flex-row flex-wrap">
              {links.map((l) => (
                <View key={l.id} className="mb-2">
                  <Pill
                    label={l.servesCity}
                    active={l.id === legId}
                    onPress={() => setLegId(l.id)}
                  />
                </View>
              ))}
            </View>

            {link ? (
              <>
                <Eyebrow className="mt-6">{S.drivingYourRoute}</Eyebrow>
                <View className="mt-3 rounded-card border border-hairline bg-canvas px-5 py-5">
                  <RouteStrip
                    fromCity={link.fromCity}
                    fromCode={link.fromCode}
                    via={S.flyVia}
                    toCity={link.toCity}
                    toCode={link.toCode}
                  />
                  <View className="mt-4 border-t border-hairline pt-3">
                    <Text className="text-[13px] leading-5 text-body">
                      {`${S.flyTransferPrefix} ~${link.transferKm} km ${S.flyTransferMiddle} ${link.transferTo}.`}
                    </Text>
                    <Text className="mt-3 font-mono-medium text-[15px] text-ink">
                      {`${S.costFarePrefix} ~${kes(link.fareEstimate.low)}–${link.fareEstimate.high.toLocaleString("en-US")}`}
                    </Text>
                    <Text className="mt-1 font-mono text-[11px] leading-4 text-mute">
                      {S.costFareIndicative}
                    </Text>
                  </View>
                </View>

                {/* Why a fan would make the trip at all. Derived from the fixture
                    list, so a schedule change cannot leave this block stale. */}
                <Eyebrow className="mt-8">{S.flyFixturesThere}</Eyebrow>
                <View className="mt-2">
                  {fixturesInCity(matches, link.servesCity, at).map((m) => (
                    <View key={m.id} className="border-b border-hairline py-3.5">
                      <Text className="font-medium text-[15px] text-ink">
                        {matchLabel(m)}
                      </Text>
                      <Text className="mt-0.5 font-mono text-[11px] text-mute">
                        {`${kickoffLabel(m)}${awayCitySuffix(m)}`}
                      </Text>
                    </View>
                  ))}
                </View>

                <Requirements heading={S.flyNeed} items={link.requirements} />
                <GoodToKnow items={link.goodToKnow} />

                <Text className="mt-6 font-mono text-[11px] leading-4 text-mute">
                  {`${S.drivingAsOfPrefix} ${dateLabel(link.asOf)}. ${
                    link.country === "KE"
                      ? S.airConfirmCaveatDomestic
                      : S.airConfirmCaveat
                  }`}
                </Text>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

/** The documents block. One component, so a mode cannot describe them differently. */
function Requirements({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; detail: string }[];
}) {
  return (
    <>
      <Eyebrow className="mt-8">{heading}</Eyebrow>
      <View className="mt-2">
        {items.map((r) => (
          <View key={r.label} className="border-b border-hairline py-3.5">
            <Text className="font-medium text-[15px] text-ink">{r.label}</Text>
            <Text className="mt-0.5 text-[13px] leading-5 text-body">{r.detail}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function GoodToKnow({ items }: { items: { label: string; detail: string }[] }) {
  return (
    <>
      <Eyebrow className="mt-8">{S.drivingGoodToKnow}</Eyebrow>
      <View className="mt-3 flex-row flex-wrap justify-between">
        {items.map((g) => (
          <View key={g.label} className="mb-3 w-[48%] rounded-card bg-panel px-4 py-3">
            <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-mute">
              {g.label}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-ink">{g.detail}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
