import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { S } from "@/lib/strings";
import { usePassStore } from "@/store/usePassStore";
import { DEMO_HOLDER_NAME } from "@/utils/issue";
import type { HostCountry } from "@/types";

const COUNTRIES: { code: HostCountry; label: string }[] = [
  { code: "KE", label: S.issuanceCountryKenya },
  { code: "UG", label: S.issuanceCountryUganda },
  { code: "TZ", label: S.issuanceCountryTanzania },
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
              {S.issuanceStep0Heading}
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
            <Button
              title={S.issuanceContinue}
              className="mt-4"
              onPress={() => setStep(1)}
            />
          </View>
        )}

        {step === 1 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              {S.issuanceStep1Heading}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={S.issuanceNamePlaceholder}
              className="mt-6 rounded-card border border-hairline bg-canvas px-4 py-4 text-[16px] text-ink"
            />
            <Text className="mt-3 font-mono text-[11px] leading-4 text-mute">
              {S.issuanceStep1Disclaimer}
            </Text>
            <Button
              title={S.issuanceContinue}
              className="mt-6"
              disabled={name.trim().length === 0}
              onPress={() => setStep(2)}
            />
          </View>
        )}

        {step === 2 && (
          <View className="mt-6">
            <Text className="font-display text-[28px] tracking-[-0.5px] text-ink">
              {S.issuanceStep2Heading}
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-body">
              {S.issuanceStep2Body}
            </Text>
            <Button
              title={S.issuanceCreateButton}
              className="mt-6"
              onPress={() => issue({ holderName: name, issuedIn: country })}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
