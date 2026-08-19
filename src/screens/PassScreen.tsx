import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Icon } from "@/components/Icon";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { PassCard } from "@/components/pamoja/PassCard";
import { TicketCard } from "@/components/pamoja/TicketCard";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { kes } from "@/utils/format";
import { fetchEntitlements, fetchMatches } from "@/data/repository";
import { usePassStore } from "@/store/usePassStore";
import { forCountry } from "@/utils/entitlements";
import { nextMatch } from "@/utils/match";
import { ticketSaved } from "@/utils/ticket";
import type { Entitlement, Match } from "@/types";

export function PassScreen() {
  const navigation = useNavigation<any>();
  const pass = usePassStore((s) => s.pass);
  const ticket = usePassStore((s) => s.ticket);
  const issueTicketFor = usePassStore((s) => s.issueTicketFor);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    void fetchEntitlements().then(setEntitlements);
    void fetchMatches().then(setMatches);
  }, []);

  const fixture = nextMatch(matches, now());

  useEffect(() => {
    if (fixture && !ticket) issueTicketFor(fixture);
  }, [fixture, ticket, issueTicketFor]);

  // The navigator only renders the tabs when a Pass exists.
  if (!pass) return null;

  const mine = forCountry(entitlements, pass.issuedIn);

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <View className="mt-4 flex-row items-center justify-end">
          <Chip label={`● ${S.passActive}`} tone="tint" />
        </View>

        <View className="mt-2">
          <PassCard pass={pass} />
        </View>

        <Eyebrow className="mt-8">{S.passUnlocksHeading}</Eyebrow>
        <View className="mt-2">
          {mine.map((e) => (
            <View key={e.id} className="border-b border-hairline py-3.5">
              <Text className="font-medium text-[15px] text-ink">{e.label}</Text>
              <Text className="mt-1 text-[13px] leading-5 text-body">{e.detail}</Text>
            </View>
          ))}
        </View>

        {ticket && fixture ? (
          <>
            <View className="mt-8">
              <TicketCard ticket={ticket} match={fixture} pass={pass} />
            </View>

            <Eyebrow className="mt-8">{S.passTicketSaves}</Eyebrow>
            <View className="mt-2">
              {ticket.savings.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-center justify-between border-b border-hairline py-3"
                >
                  <Text className="flex-1 text-[14px] text-ink">{row.label}</Text>
                  <Text className="mr-3 font-mono text-[12px] text-faint line-through">
                    {row.was.toLocaleString("en-US")}
                  </Text>
                  <Text className="font-mono-medium text-[14px] text-ink">
                    {row.now === "free" ? "Free" : row.now.toLocaleString("en-US")}
                  </Text>
                </View>
              ))}
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-medium text-[14px] text-ink">
                  {S.passTicketTotal}
                </Text>
                <Text className="font-mono-medium text-[15px] text-accent">
                  {kes(ticketSaved(ticket))}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate("Wallet")}
          className="mt-6 flex-row items-center justify-between rounded-card border border-hairline bg-canvas px-5 py-4 active:opacity-80"
        >
          <View>
            <Text className="font-medium text-[15px] text-ink">
              {S.passWalletTitle}
            </Text>
            <Text className="mt-0.5 text-[13px] text-body">
              {S.passWalletSubtitle}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mute} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
