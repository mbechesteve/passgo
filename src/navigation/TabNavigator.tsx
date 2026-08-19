import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Icon, type IconName } from "@/components/Icon";
import { PeakIcon } from "@/components/pamoja/PeakIcon";
import { TabRail } from "./TabRail";
import { RAIL_WIDTH } from "@/lib/layout";
import { useLayoutMode } from "@/lib/useLayout";
import { colors } from "@/lib/theme";
import { HomeScreen } from "@/screens/HomeScreen";
import { ExploreScreen } from "@/screens/ExploreScreen";
import { LiveScreen } from "@/screens/LiveScreen";
import { ServicesScreen } from "@/screens/ServicesScreen";
import { PassScreen } from "@/screens/PassScreen";
import { CategoryScreen } from "@/screens/CategoryScreen";
import { PartnerScreen } from "@/screens/PartnerScreen";
import { WalletScreen } from "@/screens/WalletScreen";
import { TicketOfficeScreen } from "@/screens/TicketOfficeScreen";
import { ParkingScreen } from "@/screens/ParkingScreen";
import { SafetyScreen } from "@/screens/SafetyScreen";
import { GettingThereScreen } from "@/screens/GettingThereScreen";
import { ScanScreen } from "@/screens/ScanScreen";
import { ConfirmScreen } from "@/screens/ConfirmScreen";
import type {
  ExploreStackParamList,
  HomeStackParamList,
  LiveStackParamList,
  PassStackParamList,
  ServicesStackParamList,
  TabParamList,
} from "./types";

// Each tab owns a stack, so a pushed screen renders under the tab bar instead of
// over it. Screens reachable from more than one tab (Partner, Confirm) are
// registered in each stack that can reach them — deliberately, so every tab keeps
// its own history: backing out of a partner found via Explore returns to Explore,
// not to wherever another tab had been left.

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const LiveStack = createNativeStackNavigator<LiveStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const PassStack = createNativeStackNavigator<PassStackParamList>();

/** Every screen draws its own title, so no stack shows a header. */
const stackOptions = { headerShown: false } as const;

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Partner" component={PartnerScreen} />
      <HomeStack.Screen name="Confirm" component={ConfirmScreen} />
    </HomeStack.Navigator>
  );
}

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={stackOptions}>
      <ExploreStack.Screen name="Explore" component={ExploreScreen} />
      <ExploreStack.Screen name="Partner" component={PartnerScreen} />
      <ExploreStack.Screen name="Confirm" component={ConfirmScreen} />
      <ExploreStack.Screen name="TicketOffice" component={TicketOfficeScreen} />
    </ExploreStack.Navigator>
  );
}

function LiveStackScreen() {
  return (
    <LiveStack.Navigator screenOptions={stackOptions}>
      <LiveStack.Screen name="Live" component={LiveScreen} />
    </LiveStack.Navigator>
  );
}

function ServicesStackScreen() {
  return (
    <ServicesStack.Navigator screenOptions={stackOptions}>
      <ServicesStack.Screen name="Services" component={ServicesScreen} />
      <ServicesStack.Screen name="Category" component={CategoryScreen} />
      <ServicesStack.Screen name="Partner" component={PartnerScreen} />
      <ServicesStack.Screen name="Scan" component={ScanScreen} />
      <ServicesStack.Screen name="Confirm" component={ConfirmScreen} />
      <ServicesStack.Screen name="Parking" component={ParkingScreen} />
      <ServicesStack.Screen name="Safety" component={SafetyScreen} />
      <ServicesStack.Screen name="GettingThere" component={GettingThereScreen} />
    </ServicesStack.Navigator>
  );
}

function PassStackScreen() {
  return (
    <PassStack.Navigator screenOptions={stackOptions}>
      <PassStack.Screen name="Pass" component={PassScreen} />
      <PassStack.Screen name="Wallet" component={WalletScreen} />
    </PassStack.Navigator>
  );
}

// Explore is drawn by PeakIcon, not Feather: it carries the Mount Kenya summit, the
// same geometry PeakFrame crops media to. The other four stay on the shared line set.
const ICONS: Record<Exclude<keyof TabParamList, "ExploreTab">, IconName> = {
  HomeTab: "home",
  LiveTab: "play-circle",
  ServicesTab: "grid",
  PassTab: "credit-card",
};

// One navigator, two arrangements. Below 1024px the library's own bottom bar; above
// it, TabRail down the left with the scene held clear of it. Both read the same
// routes and the same tabBarIcon, so nothing about the tabs is defined twice.
export function TabNavigator() {
  const wide = useLayoutMode() === "wide";
  return (
    <Tab.Navigator
      sceneContainerStyle={wide ? { paddingLeft: RAIL_WIDTH } : undefined}
      tabBar={wide ? (props) => <TabRail {...props} /> : undefined}
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
            {route.name === "ExploreTab" ? (
              <PeakIcon size={21} color={color} />
            ) : (
              <Icon name={ICONS[route.name]} size={21} color={color} />
            )}
          </View>
        ),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackScreen}
        options={{ title: "Explore" }}
      />
      <Tab.Screen
        name="LiveTab"
        component={LiveStackScreen}
        options={{ title: "Live" }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStackScreen}
        options={{ title: "Services" }}
      />
      <Tab.Screen
        name="PassTab"
        component={PassStackScreen}
        options={{ title: "Pass" }}
      />
    </Tab.Navigator>
  );
}
