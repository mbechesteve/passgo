import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { RecordLine } from "@/components/pamoja/RecordLine";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { kes } from "@/utils/format";
import { passStatus } from "@/utils/pass";
import { buildRedemption, computeMoney } from "@/utils/redeem";
import { usePartnerStore } from "@/store/usePartnerStore";
import { usePassStore } from "@/store/usePassStore";
import { useRecordStore } from "@/store/useRecordStore";
import type { PassEvent } from "@/types";
import type { SharedRoutes } from "@/navigation/types";

export function ConfirmScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProp<SharedRoutes, "Confirm">>();

  const pass = usePassStore((s) => s.pass);
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);
  const events = useRecordStore((s) => s.events);
  const append = useRecordStore((s) => s.append);
  const ingestShortCode = useRecordStore((s) => s.ingestShortCode);

  const [amount, setAmount] = useState("1000");
  const [written, setWritten] = useState<PassEvent | null>(null);
  // A ref, not state: React batches state updates, so a double-tap in the same
  // frame would see the same stale `written`/`events.length` before either tap
  // re-renders. A ref mutates synchronously, so the second tap's read of
  // `submitted.current` sees the first tap's write immediately. Do not
  // "simplify" this into useState — that reintroduces the double-write bug.
  const submitted = useRef(false);

  useEffect(() => {
    void load();
  }, [load]);

  const partner = partners.find((p) => p.id === params.partnerId);

  if (!pass || !partner || passStatus(pass, now()) !== "active") {
    return (
      <Screen>
        <BackBar />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-[15px] text-body">{S.confirmUnavailable}</Text>
        </View>
      </Screen>
    );
  }

  // Step 3 — the line, once written.
  if (written) {
    return (
      <Screen>
        <View className="flex-1 px-5 pt-8">
          <Eyebrow>{S.confirmStepWritten}</Eyebrow>
          <View className="mt-3">
            <RecordLine event={written} />
          </View>
          <Text className="mt-4 font-mono text-[11px] leading-4 text-mute">
            {S.confirmHeldNote}
          </Text>
          <Button
            title={S.confirmSeeWallet}
            className="mt-6"
            onPress={() => navigation.navigate("PassTab", { screen: "Wallet" })}
          />
        </View>
      </Screen>
    );
  }

  const gross = Number.parseInt(amount, 10);
  const valid = Number.isFinite(gross) && gross > 0;
  const money = computeMoney(valid ? gross : 0, partner.discountPct);

  const onConfirm = () => {
    if (submitted.current) return; // synchronous — immune to batching
    submitted.current = true;
    const event = buildRedemption({
      pass,
      partner,
      gross,
      channel: params.channel,
      at: now(),
      seq: events.length,
    });
    // Two paths, one line. `shortcode` arrives inbound — the fan never touched
    // her phone — so it enters the record through its own door.
    if (params.channel === "shortcode") ingestShortCode(event);
    else append(event);
    setWritten(event);
  };

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Eyebrow className="mt-8">{S.confirmStepConfirm}</Eyebrow>
        <Text className="mt-3 font-display text-[26px] tracking-[-0.5px] text-ink">
          {partner.name}
        </Text>
        <Text className="mt-1 font-mono text-[12px] text-mute">
          {partner.ward} ·{" "}
          {params.channel === "shortcode"
            ? S.confirmChannelCardCode
            : S.confirmChannelScanned}
        </Text>

        <Eyebrow className="mt-8">{S.confirmBillHeading}</Eyebrow>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          className="mt-2 rounded-card border border-hairline bg-canvas px-4 py-4 font-mono text-[16px] text-ink"
        />

        <View className="mt-6 rounded-card border border-hairline bg-panel px-5 py-5">
          <Eyebrow>KES</Eyebrow>
          <Text className="mt-2 font-mono text-[15px] text-ink">
            {money.gross.toLocaleString("en-US")}
          </Text>
          <Text
            className="mt-1 font-mono text-[15px]"
            style={{ color: colors.accent }}
          >
            −{money.discount.toLocaleString("en-US")}
          </Text>
          <View className="mt-2 border-t border-hairline pt-2">
            <Text className="font-mono-medium text-[20px] text-ink">
              {money.net.toLocaleString("en-US")}
            </Text>
          </View>
        </View>

        <Text className="mt-4 font-mono text-[11px] leading-4 text-mute">
          {S.confirmPayPrefix} {partner.name} {kes(money.net)}{" "}
          {S.confirmPaySuffix}
        </Text>

        <Button
          title={S.confirmButton}
          className="mt-6"
          disabled={!valid}
          onPress={onConfirm}
        />
      </ScrollView>
    </Screen>
  );
}
