import "./global.css";

import { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTripStore } from "@/store/useTripStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/navigation/RootNavigator";

// PassGo is a phone-first app. On wide viewports (web / tablet) we frame it in a
// centered phone-width column over a neutral backdrop instead of stretching the
// whole UI edge-to-edge. On a real phone the column already fills the screen, so
// maxWidth has no effect there.
const PHONE_WIDTH = 440;

export default function App() {
  useEffect(() => {
    useTripStore.getState().seedIfEmpty();
  }, []);

  const framed = Platform.OS === "web";
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: framed ? "#e7e8ec" : "#ffffff",
      }}
    >
      <SafeAreaProvider
        style={{
          flex: 1,
          width: "100%",
          maxWidth: PHONE_WIDTH,
          backgroundColor: "#ffffff",
        }}
      >
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
