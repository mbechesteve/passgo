import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { HomeScreen } from "@/screens/HomeScreen";
import { ExploreScreen } from "@/screens/ExploreScreen";
import { LiveScreen } from "@/screens/LiveScreen";
import { ServicesScreen } from "@/screens/ServicesScreen";
import { PassScreen } from "@/screens/PassScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, IconName> = {
  Home: "home",
  Explore: "compass",
  Live: "play-circle",
  Services: "grid",
  Pass: "credit-card",
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 6 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          borderTopColor: colors.hairline,
          backgroundColor: colors.canvas,
        },
        tabBarIcon: ({ color }) => (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Icon name={ICONS[route.name]} size={21} color={color} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Pass" component={PassScreen} />
    </Tab.Navigator>
  );
}
