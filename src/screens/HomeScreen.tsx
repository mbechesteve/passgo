import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { OfferRow } from "@/components/pamoja/OfferRow";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { fetchMatches } from "@/data/repository";
import { usePartnerStore } from "@/store/usePartnerStore";
import { useRecordStore } from "@/store/useRecordStore";
import { usePassStore } from "@/store/usePassStore";
import { totalSaved } from "@/utils/record";
import { homeVariant } from "@/utils/home";
import { nextMatch, matchLabel, kickoffLabel } from "@/utils/match";
import { nearby } from "@/utils/partners";
import { validityLabel } from "@/utils/pass";
import { kes } from "@/utils/format";
import type { Match } from "@/types";

/** Where the fan is standing. Kasarani, so Figure 2's lunch is the nearest offer. */
const KASARANI = { lat: -1.2266, lng: 36.8899 };

function SavedTile({ saved }: { saved: number }) {
  return (
    <View
      className="mt-4 rounded-card px-5 py-5"
      style={{ backgroundColor: colors.deep }}
    >
      <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-faint">
        You've saved
      </Text>
      <Text className="mt-1.5 font-display text-[32px] tracking-[-0.5px] text-white">
        {kes(saved)}
      </Text>
      {saved === 0 && (
        <Text className="mt-2 font-mono text-[11px] leading-4 text-faint">
          Find an offer near you and your first line gets written.
        </Text>
      )}
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

  const saved = totalSaved(events);
  const variant = homeVariant(events);
  const fixture = nextMatch(matches, now());
  const offers = nearby(partners, KASARANI, 3);
  const crossing = events.find((e) => e.kind === "border");

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Eyebrow className="mt-4">Today</Eyebrow>

        {/* A fan who lives here leads with the match; a fan who flew in leads
            with validity and the border they came through. Figure 3. */}
        {variant === "resident" ? (
          <>
            {fixture && (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 py-5">
                <Text className="font-medium text-[22px] text-ink">
                  {matchLabel(fixture)}
                </Text>
                <Text className="mt-1 font-mono text-[12px] text-mute">
                  {kickoffLabel(fixture)}
                </Text>
              </View>
            )}
            <SavedTile saved={saved} />
          </>
        ) : (
          <>
            {pass && (
              <View className="mt-4 rounded-card border border-hairline bg-canvas px-5 py-5">
                <Text className="font-medium text-[22px] text-ink">
                  {validityLabel(pass, now())}
                </Text>
                {crossing && (
                  <Text className="mt-1 font-mono text-[12px] text-mute">
                    Entered at {crossing.place.name}
                  </Text>
                )}
              </View>
            )}
            <SavedTile saved={saved} />
          </>
        )}

        <Eyebrow className="mt-8">Offers near you</Eyebrow>
        <View className="mt-2">
          {offers.map((p) => (
            <OfferRow
              key={p.id}
              partner={p}
              onPress={() => navigation.navigate("Partner", { partnerId: p.id })}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
