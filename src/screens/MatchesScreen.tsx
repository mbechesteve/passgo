import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { fetchHallMaps, fetchMatches } from "@/data/repository";
import { usePassStore } from "@/store/usePassStore";
import { eatParts } from "@/lib/clock";
import { matchLabel } from "@/utils/match";
import { dayGroups, fixtureStatus, venueLine } from "@/utils/schedule";
import type { FixtureStatusKind } from "@/utils/schedule";
import type { HallMap, Match } from "@/types";

/** Status is shown as depth of the one accent, never as a third colour. */
const TONE: Record<FixtureStatusKind, "accent" | "tint" | "panel"> = {
  live: "accent",
  "ticket-held": "tint",
  "on-sale": "tint",
  "sold-out": "panel",
  "full-time": "panel",
  "not-on-sale": "panel",
};

/**
 * The schedule — the spine of the app.
 *
 * Every fixture, grouped by the day it kicks off, with no window and no row cap. This
 * replaces a capped Explore list that showed four of eleven: a schedule that hides more
 * than half the tournament made fixtures bend to fit the surface, which is why a match
 * once had to be re-dated so its own ticket office could be reached.
 *
 * Every row is a button into the fixture, so whatever a fan wants to do about a match —
 * tickets, travel, the ground — is one tap from where they saw it.
 */
export function MatchesScreen() {
  const navigation = useNavigation<any>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [maps, setMaps] = useState<HallMap[]>([]);
  const ticket = usePassStore((s) => s.ticket);

  useEffect(() => {
    void fetchMatches().then(setMatches);
    void fetchHallMaps().then(setMaps);
  }, []);

  const at = now();
  const groups = dayGroups(matches, at);
  const venues = new Set(matches.map((m) => m.venue)).size;

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <View className="mt-4 flex-row items-end justify-between">
          <Text className="font-display text-[26px] tracking-[-0.5px] text-ink">
            {S.matchesTitle}
          </Text>
          <Text className="font-mono text-[10px] uppercase tracking-[1.2px] text-mute">
            {`${matches.length} ${S.matchesFixtures} · ${venues} ${S.matchesVenues}`}
          </Text>
        </View>

        {groups.map((group) => (
          <View key={group.key} className="mt-6">
            <Eyebrow>{group.label}</Eyebrow>
            <View className="mt-2">
              {group.matches.map((m) => {
                const status = fixtureStatus(m, {
                  at,
                  maps,
                  ticketMatchId: ticket?.matchId,
                });
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => navigation.navigate("Fixture", { matchId: m.id })}
                    accessibilityRole="button"
                    className="mb-2 rounded-card border border-hairline bg-canvas px-4 py-3.5 active:opacity-70"
                  >
                    <View className="flex-row items-start justify-between">
                      {/* One compact line per fixture: a schedule is scanned, not
                          read, and eleven rows of flags push half of them off-screen.
                          The flags get their room on the fixture's own header. */}
                      <View className="flex-1 pr-3">
                        <Text className="font-medium text-[15px] text-ink">
                          {matchLabel(m)}
                        </Text>
                        <Text className="mt-0.5 font-mono text-[11px] text-mute">
                          {venueLine(m)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-mono-medium text-[13px] text-ink">
                          {eatParts(m.kickoff).time}
                        </Text>
                        <View className="mt-1.5">
                          <Chip label={status.label} tone={TONE[status.kind]} />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
