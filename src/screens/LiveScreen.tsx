import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Chip } from "@/components/pamoja/Chip";
import { Crest } from "@/components/pamoja/Crest";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { fetchMatchLive, fetchMatches } from "@/data/repository";
import {
  daysUntilLabel,
  kickoffLabel,
  liveMatches,
  liveMinute,
  matchLabel,
  matchPhase,
  nextMatch,
} from "@/utils/match";
import type { Match, MatchLive } from "@/types";

/** "70'", or "HALF TIME" across the interval. */
function minuteLabel(match: Match, at: Date): string {
  if (matchPhase(match, at) === "half-time") return S.liveHalfTime;
  const minute = liveMinute(match, at);
  return minute == null ? "" : `${minute}'`;
}

export function LiveScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [live, setLive] = useState<MatchLive[]>([]);

  useEffect(() => {
    void fetchMatches().then(setMatches);
    void fetchMatchLive().then(setLive);
  }, []);

  const at = now();
  const inPlay = liveMatches(matches, at);
  const scoreFor = (id: string) => live.find((l) => l.matchId === id);
  const [featured, ...also] = inPlay;
  const featuredScore = featured ? scoreFor(featured.id) : undefined;
  const upcoming = nextMatch(matches, at);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.liveTitle}
        </Text>

        {featured && featuredScore ? (
          <>
            <View className="mt-4 rounded-card bg-deep px-5 py-5">
              <Chip label={S.liveBadge} tone="accent" />

              <View className="mt-4 flex-row items-center justify-between">
                <View className="items-center">
                  <Crest team={featured.home} />
                  <Text className="mt-2 text-[12px] text-ondark-mute">
                    {featured.home}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="font-display-heavy text-[34px] text-white">
                    {`${featuredScore.home} – ${featuredScore.away}`}
                  </Text>
                  <Text className="mt-1 font-mono text-[12px] text-accent-soft">
                    {minuteLabel(featured, at)}
                  </Text>
                </View>
                <View className="items-center">
                  <Crest team={featured.away} />
                  <Text className="mt-2 text-[12px] text-ondark-mute">
                    {featured.away}
                  </Text>
                </View>
              </View>

              <View className="mt-5 border-t border-deep-grad pt-1">
                <StatTrio
                  tone="dark"
                  items={[
                    {
                      value: `${featuredScore.possession[0]}%`,
                      label: S.livePossession,
                    },
                    { value: `${featuredScore.shots[0]}`, label: S.liveShots },
                    { value: `${featuredScore.corners[0]}`, label: S.liveCorners },
                  ]}
                />
              </View>
            </View>

            {also.length > 0 ? (
              <>
                <Eyebrow className="mt-8">{S.liveAlsoLive}</Eyebrow>
                <View className="mt-2">
                  {also.map((m) => {
                    const score = scoreFor(m.id);
                    return (
                      <View
                        key={m.id}
                        className="flex-row items-center justify-between border-b border-hairline py-3.5"
                      >
                        <View className="flex-1">
                          <Text className="text-[15px] text-ink">
                            {matchLabel(m)}
                          </Text>
                          <Text className="mt-0.5 font-mono text-[11px] text-mute">
                            {`${minuteLabel(m, at)} · ${m.venue}`}
                          </Text>
                        </View>
                        {score ? (
                          <Text className="font-mono-medium text-[15px] text-ink">
                            {`${score.home} – ${score.away}`}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <View className="mt-6">
            <Text className="text-[15px] leading-6 text-body">
              {S.liveNothingOn}
            </Text>
            {upcoming ? (
              <View className="mt-6">
                <Eyebrow>{S.liveNextUp}</Eyebrow>
                <View className="mt-2 rounded-card border border-hairline bg-canvas px-5 py-5">
                  <Text className="font-display text-[19px] text-ink">
                    {matchLabel(upcoming)}
                  </Text>
                  <Text className="mt-1 font-mono text-[12px] text-mute">
                    {kickoffLabel(upcoming)}
                  </Text>
                  <View className="mt-3">
                    <Chip label={daysUntilLabel(upcoming, at)} tone="tint" />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
