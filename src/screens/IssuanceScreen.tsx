import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { usePassStore } from "@/store/usePassStore";
import { DEMO_HOLDER_NAME } from "@/utils/issue";
import type { HostCountry } from "@/types";

const COUNTRIES: { code: HostCountry; label: string }[] = [
  { code: "KE", label: "Kenya" },
  { code: "UG", label: "Uganda" },
  { code: "TZ", label: "Tanzania" },
];

export function IssuanceScreen() {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<HostCountry>("KE");
  const [name, setName] = useState(DEMO_HOLDER_NAME);
  const issue = usePassStore((s) => s.issue);

  return (
    <Screen>
      <View className="flex-1 px-5 pt-8">
        <Eyebrow>{`Step ${step + 1} of 3`}</Eyebrow>

        {step === 0 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              Where are you collecting your Pass?
            </Text>
            <View className="mt-6">
              {COUNTRIES.map((c) => (
                <Button
                  key={c.code}
                  title={c.label}
                  variant={country === c.code ? "primary" : "secondary"}
                  className="mb-3"
                  onPress={() => setCountry(c.code)}
                />
              ))}
            </View>
            <Button title="Continue" className="mt-4" onPress={() => setStep(1)} />
          </View>
        )}

        {step === 1 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              Who is the Pass for?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              className="mt-6 rounded-card border border-hairline bg-canvas px-4 py-4 text-[16px] text-ink"
            />
            <Text className="mt-3 font-mono text-[11px] leading-4 text-mute">
              Prototype only. A real Pass is verified once, when it is issued, by
              the accrediting authority — not self-entered.
            </Text>
            <Button
              title="Continue"
              className="mt-6"
              disabled={name.trim().length === 0}
              onPress={() => setStep(2)}
            />
          </View>
        )}

        {step === 2 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              Your ticket
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-body">
              Your Pass is created with your ticket, and works at the border, at
              the turnstile, on transport and at every partner business.
            </Text>
            <Button
              title="Create my Pass"
              className="mt-6"
              onPress={() => issue({ holderName: name, issuedIn: country })}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
