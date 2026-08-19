import { ScrollView } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { BackBar } from "@/components/pamoja/BackBar";
import { FixtureDetail } from "@/components/pamoja/FixtureDetail";
import type { MatchesStackParamList } from "@/navigation/types";

/**
 * A fixture on its own screen — the phone arrangement, pushed from the schedule.
 *
 * On a wide viewport the schedule renders `FixtureDetail` in a pane instead and this
 * screen is never reached, so the detail itself lives in the component both use.
 */
export function FixtureScreen() {
  const { params } = useRoute<RouteProp<MatchesStackParamList, "Fixture">>();
  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <FixtureDetail matchId={params.matchId} />
      </ScrollView>
    </Screen>
  );
}
