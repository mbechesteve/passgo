import { Text, View } from "react-native";

import { Chip } from "@/components/pamoja/Chip";
import { Crest } from "@/components/pamoja/Crest";
import { StatTrio } from "@/components/pamoja/StatTrio";
import { S } from "@/lib/strings";
import type { Match, MatchTicket, Pass } from "@/types";
import { eatParts } from "@/lib/clock";
import { codeCells, ticketReference } from "@/utils/ticket";

/**
 * A deterministic block derived from the reference string. It is a visual STAND-IN,
 * not a scannable QR: making it scannable needs react-native-svg plus an encoder,
 * which is follow-up work. Nothing in this app reads a code, so nothing here breaks.
 */
function CodeBlock({ reference }: { reference: string }) {
  const size = 11;
  const cells = codeCells(reference, size);

  return (
    <View className="rounded-card bg-deep p-3">
      {Array.from({ length: size }).map((_, row) => (
        <View key={row} className="flex-row">
          {Array.from({ length: size }).map((__, col) => (
            <View
              key={col}
              className={`m-[1px] h-2.5 w-2.5 rounded-[1px] ${
                cells[row * size + col] ? "bg-white" : "bg-transparent"
              }`}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function TicketCard({
  ticket,
  match,
  pass,
}: {
  ticket: MatchTicket;
  match: Match;
  pass: Pass;
}) {
  const { time } = eatParts(match.kickoff);
  return (
    <View className="overflow-hidden rounded-card border border-hairline bg-canvas">
      <View className="bg-accent px-5 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-[11px] uppercase tracking-[1.5px] text-white">
            {S.passMatchPass}
          </Text>
          <Chip
            label={`${S.passCategoryPrefix} ${ticket.category}`}
            tone="ondark"
          />
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <Crest team={match.home} />
          <View className="items-center">
            <Text className="font-mono text-[11px] tracking-[1.5px] text-white">
              {time}
            </Text>
            <Text className="mt-1 font-display text-[22px] text-white">
              {S.passVersus}
            </Text>
            <Text className="mt-1 text-[12px] text-white">{match.venue}</Text>
          </View>
          <Crest team={match.away} />
        </View>
      </View>

      <View className="px-5 pt-1">
        <StatTrio
          items={[
            { value: ticket.gate, label: S.passGate },
            { value: ticket.section, label: S.passSection },
            { value: ticket.seat, label: S.passSeat },
          ]}
        />
      </View>

      {/* The perforation */}
      <View className="mx-5 my-2 h-px border-t border-dashed border-hairline" />

      <View className="items-center px-5 pb-5">
        <CodeBlock reference={ticketReference(pass, match)} />
        <Text className="mt-3 font-mono text-[12px] tracking-[1.5px] text-ink">
          {ticketReference(pass, match)}
        </Text>
        <Text className="mt-2 px-4 text-center font-mono text-[10px] leading-4 text-mute">
          {S.passCodeStandIn}
        </Text>
      </View>
    </View>
  );
}
