import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { Eyebrow } from "@/components/pamoja/Eyebrow";
import { now } from "@/lib/clock";
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
        <View className="flex-1 px-5 pt-8">
          <Eyebrow>Cannot redeem</Eyebrow>
          <Text className="mt-3 font-display text-[24px] tracking-[-0.5px] text-ink">
            {pass ? validityLabel(pass, now()) : "No Pass on this device"}
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-body">
            Your Pass has to be active to claim a discount. Nothing has been
            recorded.
          </Text>
        </View>
      </Screen>
    );
  }

  const onSubmit = () => {
    const partner = findByShortCode(partners, code);
    if (!partner) {
      setError("That code was not recognised.");
      return;
    }
    setError(null);
    navigation.navigate("Confirm", { partnerId: partner.id, channel: "qr" });
  };

  return (
    <Screen>
      <View className="flex-1 px-5 pt-8">
        <Eyebrow>Step 1 of 3 · Scan</Eyebrow>
        <Text className="mt-3 font-display text-[26px] tracking-[-0.5px] text-ink">
          Enter the merchant's code
        </Text>

        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t);
            setError(null);
          }}
          placeholder="e.g. MO-001"
          autoCapitalize="characters"
          autoCorrect={false}
          className="mt-6 rounded-card border border-hairline bg-canvas px-4 py-4 font-mono text-[16px] text-ink"
        />

        {error ? (
          <View className="mt-3">
            <Text className="text-[14px] text-ink">{error}</Text>
            <Text className="mt-1 font-mono text-[11px] leading-4 text-mute">
              Ask the merchant to enter your Pass code instead — it works
              without your phone.
            </Text>
          </View>
        ) : null}

        <Button
          title="Continue"
          className="mt-6"
          disabled={code.trim().length === 0}
          onPress={onSubmit}
        />
      </View>
    </Screen>
  );
}
