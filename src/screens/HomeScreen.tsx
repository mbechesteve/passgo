import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/pamoja/Avatar";
import { Chip } from "@/components/pamoja/Chip";
import { TeamRow } from "@/components/pamoja/TeamRow";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { MoneyBox } from "@/components/pamoja/MoneyBox";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { TOUCH_MIN } from "@/lib/layout";
import { fetchMatches } from "@/data/repository";
import { usePartnerStore } from "@/store/usePartnerStore";
import { usePassStore } from "@/store/usePassStore";
import { useRecordStore } from "@/store/useRecordStore";
import { distanceKm, km } from "@/utils/format";
import { homeVariant } from "@/utils/home";
import {
  daysUntilLabel,
  gatesOpenLabel,
  kickoffChipLabel,
  nextMatch,
} from "@/utils/match";
import { nearby } from "@/utils/partners";
import { validityLabel } from "@/utils/pass";
import { offersUsed, savingsSeries, totalSaved, weekSavings } from "@/utils/record";
import type { Match } from "@/types";

/** Where the fan is standing. Kasarani, so Figure 2's lunch is the nearest offer. */
const KASARANI = { lat: -1.2266, lng: 36.8899 };

function FixtureCard({
  fixture,
  at,
  onViewPass,
}: {
  fixture: Match;
  at: Date;
  onViewPass: () => void;
}) {
  return (
    <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 pt-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="font-mono text-[12px] tracking-[1.5px] text-accent">
            {kickoffChipLabel(fixture)}
          </Text>
          <View className="ml-2.5">
            <Chip label={daysUntilLabel(fixture, at)} tone="accent" />
          </View>
        </View>
        <Chip label={fixture.venue} tone="panel" />
      </View>

      <View className="mt-4">
        <TeamRow
          home={fixture.home}
          away={fixture.away}
          middle={
            <Text className="font-display text-[15px] text-mute">
              {S.fixtureVersus}
            </Text>
          }
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between border-t border-hairline py-4">
        <Text className="text-[13px] text-body">
          {`${S.homeGatesOpenPrefix} ${gatesOpenLabel(fixture)}`}
        </Text>
        <Pressable
          onPress={onViewPass}
          accessibilityRole="button"
          style={{ minHeight: TOUCH_MIN }}
          className="justify-center"
        >
          <Text className="font-medium text-[14px] text-accent">
            {S.homeViewPass}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const pass = usePassStore((s) => s.pass);
  const events = useRecordStore((s) => s.events);
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    void load();
    void fetchMatches().then(setMatches);
  }, [load]);

  const at = now();
  const variant = homeVariant(events);
  const fixture = nextMatch(matches, at);
  const offers = nearby(partners, KASARANI, 3);
  const crossing = events.find((e) => e.kind === "border");

  const money = (
    <MoneyBox
      saved={totalSaved(events)}
      week={weekSavings(events, at)}
      series={savingsSeries(events, at, 7)}
      offers={offersUsed(events)}
      onBrowse={() => navigation.navigate("PartnersTab")}
    />
  );

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Eyebrow>{S.homeToday}</Eyebrow>
            <Text className="mt-1 font-display text-[26px] tracking-[-0.5px] text-ink">
              {S.homeMatchday}
            </Text>
          </View>
          {pass ? <Avatar name={pass.holderName} /> : null}
        </View>

        {/* A fan who lives here leads with the match; a fan who flew in leads
            with validity and the border they came through. Figure 3. */}
        {variant === "resident" ? (
          <>
            {fixture ? (
              <FixtureCard
                fixture={fixture}
                at={at}
                onViewPass={() => navigation.navigate("PassTab")}
              />
            ) : null}
            {money}
          </>
        ) : (
          <>
            {pass ? (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 py-5">
                <Text className="font-medium text-[22px] text-ink">
                  {validityLabel(pass, at)}
                </Text>
                {crossing ? (
                  <Text className="mt-1 font-mono text-[12px] text-mute">
                    {`${S.homeEnteredAtPrefix} ${crossing.place.name}`}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {money}
          </>
        )}

        <View className="mt-8 flex-row items-center justify-between">
          <Eyebrow>{S.homeOffersNearYou}</Eyebrow>
          <Pressable
            onPress={() => navigation.navigate("PartnersTab")}
            accessibilityRole="button"
            style={{ minHeight: TOUCH_MIN }}
            className="justify-center"
          >
            <Text className="font-medium text-[13px] text-accent">
              {S.homeSeeAll}
            </Text>
          </Pressable>
        </View>
        <View className="mt-2">
          {offers.map((p) => (
            <OfferRow
              key={p.id}
              partner={p}
              subline={
                fixture
                  ? `${km(distanceKm(p.coords, fixture.coords))} ${
                      S.homeOfferDistanceFrom
                    } ${fixture.venue}`
                  : undefined
              }
              onPress={() => navigation.navigate("Partner", { partnerId: p.id })}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
