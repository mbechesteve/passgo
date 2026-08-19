import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Button, Pill } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Chip } from "@/components/pamoja/Chip";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { S } from "@/lib/strings";
import { TOUCH_MIN } from "@/lib/layout";
import { usePaymentStore } from "@/store/usePaymentStore";
import { KINDS, describeMethod, tailOf } from "@/utils/payment";
import type { PaymentKind } from "@/types";

const KIND_LABEL: Record<PaymentKind, string> = {
  mpesa: "M-Pesa",
  airtel: "Airtel Money",
  card: "Card",
};

/**
 * The methods a fan will pay with, and adding another.
 *
 * Nothing here is an account. There is no balance, no top-up and no transaction list:
 * Rev. 2 §05 is that Pamoja never holds funds and never sees a card number, so this
 * screen only records *which* method to name at a counter. A top-up wallet was asked
 * for and declined for that reason — see the note on `PaymentMethod` in @/types.
 *
 * What the fan types is used to derive a digit tail and then dropped; the store never
 * receives it. The screen says so, because someone typing a card number deserves to
 * know where it goes.
 */
export function PaymentMethodScreen() {
  const methods = usePaymentStore((s) => s.methods);
  const add = usePaymentStore((s) => s.add);
  const choose = usePaymentStore((s) => s.choose);
  const forget = usePaymentStore((s) => s.forget);

  const [kind, setKind] = useState<PaymentKind>("mpesa");
  const [raw, setRaw] = useState("");
  const enough = tailOf(raw, kind === "card" ? 4 : 3).length > 0;

  return (
    <Screen>
      <BackBar />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-10">
        <Text className="mt-4 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.payHowYouPay}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-body">
          {S.payAddStandfirst}
        </Text>

        {methods.length === 0 ? (
          <Text className="mt-8 text-[15px] leading-6 text-body">{S.payNoneYet}</Text>
        ) : (
          <View className="mt-6">
            {methods.map((m) => (
              <View key={m.id} className="border-b border-hairline py-3.5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-mono-medium text-[15px] text-ink">
                    {describeMethod(m)}
                  </Text>
                  {m.isDefault ? <Chip label={S.payDefault} tone="tint" /> : null}
                </View>
                <View className="mt-2 flex-row">
                  {m.isDefault ? null : (
                    <Pressable
                      onPress={() => choose(m.id)}
                      accessibilityRole="button"
                      style={{ minHeight: TOUCH_MIN }}
                      className="mr-4 justify-center active:opacity-70"
                    >
                      <Text className="font-medium text-[13px] text-accent">
                        {S.payUse}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => forget(m.id)}
                    accessibilityRole="button"
                    style={{ minHeight: TOUCH_MIN }}
                    className="justify-center active:opacity-70"
                  >
                    <Text className="font-medium text-[13px] text-mute">
                      {S.payForget}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <Eyebrow className="mt-8">{S.payAddAnother}</Eyebrow>
        <View className="mt-2 flex-row flex-wrap">
          {KINDS.map((k) => (
            <View key={k} className="mb-2">
              <Pill
                label={KIND_LABEL[k]}
                active={k === kind}
                onPress={() => {
                  setKind(k);
                  setRaw("");
                }}
              />
            </View>
          ))}
        </View>

        <Eyebrow className="mt-4">
          {kind === "card" ? S.payCardHeading : S.payPhoneHeading}
        </Eyebrow>
        <TextInput
          value={raw}
          onChangeText={setRaw}
          keyboardType="number-pad"
          placeholder={kind === "card" ? S.payCardPlaceholder : S.payPhonePlaceholder}
          className="mt-2 rounded-card border border-hairline bg-canvas px-4 py-4 font-mono text-[16px] text-ink"
        />
        <Text className="mt-3 font-mono text-[11px] leading-4 text-mute">
          {S.payDiscardNote}
        </Text>

        <Button
          title={S.payAddButton}
          className="mt-6"
          disabled={!enough}
          onPress={() => {
            add(kind, raw);
            setRaw("");
          }}
        />
      </ScrollView>
    </Screen>
  );
}
