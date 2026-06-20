import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CountryDetailScreen } from "@/screens/CountryDetailScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { PaywallScreen } from "@/screens/PaywallScreen";
import { useAppStore } from "@/store/useAppStore";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hydrated = useAppStore((s) => s.hydrated);
  const passportCountry = useAppStore((s) => s.passportCountry);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-muted">
        <ActivityIndicator color="#ff385c" />
      </View>
    );
  }

  const onboarded = !!passportCountry;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen
              name="CountryDetail"
              component={CountryDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
