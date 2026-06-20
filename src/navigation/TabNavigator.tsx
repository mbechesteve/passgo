import { Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { colors } from "@/lib/theme";
import { DiscoverScreen } from "@/screens/DiscoverScreen";
import { PlanScreen } from "@/screens/PlanScreen";
import { MapScreen } from "@/screens/MapScreen";
import { PremiumScreen } from "@/screens/PremiumScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, string> = {
  Discover: "🧭",
  Plan: "🧳",
  Map: "🗺️",
  Premium: "👑",
  Profile: "👤",
};

function TabIcon({
  route,
  focused,
}: {
  route: keyof TabParamList;
  focused: boolean;
}) {
  return (
    <View className="items-center justify-center" style={{ width: 56 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
        {ICONS[route]}
      </Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand[700],
        tabBarInactiveTintColor: colors.ink[400],
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          borderTopColor: "#d8d8d8",
          backgroundColor: "#ffffff",
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon route={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ tabBarLabel: "Premium" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
