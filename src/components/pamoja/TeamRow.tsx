import { type ReactNode } from "react";
import { Text, View } from "react-native";

import { teamFlag } from "@/utils/match";

/**
 * A fixture's two nations, each as a flag beside its own name, with whatever
 * belongs between them slotted in the middle — a "v" on Home, the score and minute
 * on Live, the kickoff and venue on the ticket.
 *
 * This replaced a pair of three-letter code tiles. "KEN" and "MLI" asked the fan to
 * decode an abbreviation, and on two of the three surfaces the country was then
 * spelled out again a few pixels away; naming each side once, with its flag, says
 * the same thing without the decoding or the repetition.
 *
 * The codes still exist — `crestCode` derives the ticket reference — they are just
 * no longer what a fan reads.
 */
export function TeamRow({
  home,
  away,
  middle,
  tone = "light",
}: {
  home: string;
  away: string;
  middle: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const name = `text-[15px] ${dark ? "text-white" : "text-ink"}`;

  // A nation we hold no flag for renders its name alone rather than a gap.
  const side = (team: string, align: string) => {
    const flag = teamFlag(team);
    return (
      <View className={`flex-1 flex-row items-center ${align}`}>
        {flag ? <Text className="mr-2 text-[20px]">{flag}</Text> : null}
        <Text className={`font-medium ${name}`} numberOfLines={1}>
          {team}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-row items-center">
      {side(home, "justify-start")}
      <View className="items-center px-3">{middle}</View>
      {side(away, "justify-end")}
    </View>
  );
}
