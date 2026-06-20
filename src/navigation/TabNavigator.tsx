import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";
import { DiscoverScreen } from "@/screens/DiscoverScreen";
import { PlanScreen } from "@/screens/PlanScreen";
import { MapScreen } from "@/screens/MapScreen";
import { PremiumScreen } from "@/screens/PremiumScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

// Consistent Feather line icons that tint with the active/inactive color.
const ICONS: Record<keyof TabParamList, IconName> = {
  Discover: "compass",
  Plan: "calendar",
  Map: "map",
  Premium: "star",
  Profile: "user",
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink[900],
        tabBarInactiveTintColor: colors.ink[400],
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 6 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          borderTopColor: "#d8d8d8",
          backgroundColor: "#ffffff",
        },
        tabBarIcon: ({ focused, color }) => (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Icon
              name={ICONS[route.name]}
              size={21}
              color={color}
            />
            {/* Active marker — a small ink dot, echoing the brand stamp. */}
            <View
              style={{
                marginTop: 4,
                height: 4,
                width: 4,
                borderRadius: 2,
                backgroundColor: focused ? colors.ink[900] : "transparent",
              }}
            />
          </View>
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
