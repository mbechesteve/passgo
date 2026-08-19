import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TabNavigator } from "./TabNavigator";
import { IssuanceScreen } from "@/screens/IssuanceScreen";
import { CategoryScreen } from "@/screens/CategoryScreen";
import { PartnerScreen } from "@/screens/PartnerScreen";
import { WalletScreen } from "@/screens/WalletScreen";
import { ParkingScreen } from "@/screens/ParkingScreen";
import { SafetyScreen } from "@/screens/SafetyScreen";
import { DrivingScreen } from "@/screens/DrivingScreen";
import { ScanScreen } from "@/screens/ScanScreen";
import { ConfirmScreen } from "@/screens/ConfirmScreen";
import { usePassStore } from "@/store/usePassStore";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const pass = usePassStore((s) => s.pass);
  const hydrated = usePassStore((s) => s.hydrated);

  if (!hydrated) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {pass === null ? (
          <Stack.Screen name="Issuance" component={IssuanceScreen} />
        ) : (
          <Stack.Screen name="Tabs" component={TabNavigator} />
        )}
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="Partner" component={PartnerScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Parking" component={ParkingScreen} />
        <Stack.Screen name="Safety" component={SafetyScreen} />
        <Stack.Screen name="Driving" component={DrivingScreen} />
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="Confirm"
          component={ConfirmScreen}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
