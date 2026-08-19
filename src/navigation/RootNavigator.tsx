import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TabNavigator } from "./TabNavigator";
import { IssuanceScreen } from "@/screens/IssuanceScreen";
import { usePassStore } from "@/store/usePassStore";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// The root stack holds only the two states of the app: issuing a Pass, or holding
// one. Everything else lives inside a tab's own stack (see TabNavigator), so the
// tab bar stays visible on every page. Issuance is the one screen with no bar —
// it runs before a Pass exists, and the tabs it would offer cannot render yet.

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
