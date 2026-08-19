import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { BackBar } from "@/components/pamoja/BackBar";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { now } from "@/lib/clock";
import { S } from "@/lib/strings";
import { passStatus, validityLabel } from "@/utils/pass";
import { findByShortCode } from "@/utils/partners";
import { usePartnerStore } from "@/store/usePartnerStore";
import { usePassStore } from "@/store/usePassStore";

export function ScanScreen() {
  const navigation = useNavigation<any>();
  const pass = usePassStore((s) => s.pass);
  const partners = usePartnerStore((s) => s.partners);
  const load = usePartnerStore((s) => s.load);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  // A Pass that is not active writes no line at all — refuse before any lookup.
  if (!pass || passStatus(pass, now()) !== "active") {
    return (
      <Screen>
        <BackBar />
        <View className="flex-1 px-5 pt-8">
          <Eyebrow>{S.scanCannotRedeem}</Eyebrow>
          <Text className="mt-3 font-display text-[24px] tracking-[-0.5px] text-ink">
            {pass ? validityLabel(pass, now()) : S.scanNoPassOnDevice}
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-body">
            {S.scanInactiveBody}
          </Text>
        </View>
      </Screen>
    );
  }

  const onSubmit = () => {
    const partner = findByShortCode(partners, code);
    if (!partner) {
      setError(S.scanCodeNotRecognised);
      return;
    }
    setError(null);
    navigation.navigate("Confirm", { partnerId: partner.id, channel: "qr" });
  };

  return (
    <Screen>
      <BackBar />
      <View className="flex-1 px-5 pt-8">
        <Eyebrow>{S.scanStep}</Eyebrow>
        <Text className="mt-3 font-display text-[26px] tracking-[-0.5px] text-ink">
          {S.scanHeading}
        </Text>

        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t);
            setError(null);
          }}
          placeholder={S.scanPlaceholder}
          autoCapitalize="characters"
          autoCorrect={false}
          className="mt-6 rounded-card border border-hairline bg-canvas px-4 py-4 font-mono text-[16px] text-ink"
        />

        {error ? (
          <View className="mt-3">
            <Text className="text-[14px] text-ink">{error}</Text>
            <Text className="mt-1 font-mono text-[11px] leading-4 text-mute">
              {S.scanHelperText}
            </Text>
          </View>
        ) : null}

        <Button
          title={S.scanContinue}
          className="mt-6"
          disabled={code.trim().length === 0}
          onPress={onSubmit}
        />
      </View>
    </Screen>
  );
}
