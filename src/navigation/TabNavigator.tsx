import { useEffect, useState } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Icon, type IconName } from "@/components/Icon";
import { PeakIcon } from "@/components/pamoja/PeakIcon";
import { TabRail } from "./TabRail";
import { RAIL_WIDTH } from "@/lib/layout";
import { useLayoutMode } from "@/lib/useLayout";
import { colors } from "@/lib/theme";
import { now } from "@/lib/clock";
import { fetchMatches } from "@/data/repository";
import { usePassStore } from "@/store/usePassStore";
import { nextMatch } from "@/utils/match";
import type { Match } from "@/types";
import { HomeScreen } from "@/screens/HomeScreen";
import { MatchesScreen } from "@/screens/MatchesScreen";
import { FixtureScreen } from "@/screens/FixtureScreen";
import { PartnersScreen } from "@/screens/PartnersScreen";
import { LiveScreen } from "@/screens/LiveScreen";
import { PassScreen } from "@/screens/PassScreen";
import { CategoryScreen } from "@/screens/CategoryScreen";
import { PartnerScreen } from "@/screens/PartnerScreen";
import { WalletScreen } from "@/screens/WalletScreen";
import { TicketOfficeScreen } from "@/screens/TicketOfficeScreen";
import { PaymentMethodScreen } from "@/screens/PaymentMethodScreen";
import { ParkingScreen } from "@/screens/ParkingScreen";
import { SafetyScreen } from "@/screens/SafetyScreen";
import { GettingThereScreen } from "@/screens/GettingThereScreen";
import { ScanScreen } from "@/screens/ScanScreen";
import { ConfirmScreen } from "@/screens/ConfirmScreen";
import type {
  HomeStackParamList,
  LiveStackParamList,
  MatchesStackParamList,
  PartnersStackParamList,
  PassStackParamList,
  TabParamList,
} from "./types";

// Each tab owns a stack, so a pushed screen renders under the tab bar instead of
// over it. Screens reachable from more than one tab (Partner, Confirm) are
// registered in each stack that can reach them — deliberately, so every tab keeps
// its own history: backing out of a partner found via Explore returns to Explore,
// not to wherever another tab had been left.

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MatchesStack = createNativeStackNavigator<MatchesStackParamList>();
const LiveStack = createNativeStackNavigator<LiveStackParamList>();
const PartnersStack = createNativeStackNavigator<PartnersStackParamList>();
const PassStack = createNativeStackNavigator<PassStackParamList>();

/** Every screen draws its own title, so no stack shows a header. */
const stackOptions = { headerShown: false } as const;

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Partner" component={PartnerScreen} />
      <HomeStack.Screen name="Confirm" component={ConfirmScreen} />
      <HomeStack.Screen name="GettingThere" component={GettingThereScreen} />
      <HomeStack.Screen name="Parking" component={ParkingScreen} />
    </HomeStack.Navigator>
  );
}

function MatchesStackScreen() {
  return (
    <MatchesStack.Navigator screenOptions={stackOptions}>
      <MatchesStack.Screen name="Matches" component={MatchesScreen} />
      <MatchesStack.Screen name="Fixture" component={FixtureScreen} />
      <MatchesStack.Screen name="TicketOffice" component={TicketOfficeScreen} />
      <MatchesStack.Screen name="Parking" component={ParkingScreen} />
      <MatchesStack.Screen name="Safety" component={SafetyScreen} />
      <MatchesStack.Screen name="GettingThere" component={GettingThereScreen} />
      <MatchesStack.Screen name="Partner" component={PartnerScreen} />
      <MatchesStack.Screen name="Confirm" component={ConfirmScreen} />
    </MatchesStack.Navigator>
  );
}

function LiveStackScreen() {
  return (
    <LiveStack.Navigator screenOptions={stackOptions}>
      <LiveStack.Screen name="Live" component={LiveScreen} />
    </LiveStack.Navigator>
  );
}

function PartnersStackScreen() {
  return (
    <PartnersStack.Navigator screenOptions={stackOptions}>
      <PartnersStack.Screen name="Partners" component={PartnersScreen} />
      <PartnersStack.Screen name="Category" component={CategoryScreen} />
      <PartnersStack.Screen name="Partner" component={PartnerScreen} />
      <PartnersStack.Screen name="Scan" component={ScanScreen} />
      <PartnersStack.Screen name="Confirm" component={ConfirmScreen} />
    </PartnersStack.Navigator>
  );
}

function PassStackScreen() {
  return (
    <PassStack.Navigator screenOptions={stackOptions}>
      <PassStack.Screen name="Pass" component={PassScreen} />
      <PassStack.Screen name="Wallet" component={WalletScreen} />
      <PassStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
    </PassStack.Navigator>
  );
}

// Explore is drawn by PeakIcon, not Feather: it carries the Mount Kenya summit, the
// same geometry PeakFrame crops media to. The other four stay on the shared line set.
const ICONS: Record<Exclude<keyof TabParamList, "MatchesTab">, IconName> = {
  HomeTab: "home",
  LiveTab: "play-circle",
  PartnersTab: "tag",
  PassTab: "credit-card",
};

// One navigator, two arrangements. Below 1024px the library's own bottom bar; above
// it, TabRail down the left with the scene held clear of it. Both read the same
// routes and the same tabBarIcon, so nothing about the tabs is defined twice.
export function TabNavigator() {
  const wide = useLayoutMode() === "wide";
  const ticket = usePassStore((s) => s.ticket);
  const issueTicketFor = usePassStore((s) => s.issueTicketFor);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    void fetchMatches().then(setMatches);
  }, []);

  // Issued here rather than on the Pass screen. It used to happen in PassScreen's own
  // effect, which meant a fan who had not yet opened that tab held no ticket as far as
  // the rest of the app knew — the schedule showed "NOT YET ON SALE" against the very
  // fixture their seat was for. The Pass is app-wide state, so it is settled app-wide.
  //
  // Re-issues when the ticket is for a fixture other than the next one, not only when
  // there is none: an unguarded check leaves a stale ticket alive past its own fixture
  // once the clock rolls over.
  const fixture = nextMatch(matches, now());
  useEffect(() => {
    if (fixture && ticket?.matchId !== fixture.id) issueTicketFor(fixture);
  }, [fixture, ticket, issueTicketFor]);
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
            {route.name === "MatchesTab" ? (
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
        name="MatchesTab"
        component={MatchesStackScreen}
        options={{ title: "Matches" }}
      />
      <Tab.Screen
        name="LiveTab"
        component={LiveStackScreen}
        options={{ title: "Live" }}
      />
      <Tab.Screen
        name="PartnersTab"
        component={PartnersStackScreen}
        options={{ title: "Partners" }}
      />
      <Tab.Screen
        name="PassTab"
        component={PassStackScreen}
        options={{ title: "Pass" }}
      />
    </Tab.Navigator>
  );
}
