import "./global.css";

import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";

import { RootNavigator } from "@/navigation/RootNavigator";
import { PHONE_FRAME_WIDTH } from "@/lib/layout";
import { useLayoutMode } from "@/lib/useLayout";

// Pamoja is a phone-first app, and on the web below 1024px it is still framed in a
// centered phone-width column over a neutral backdrop — stretching a phone-first UI
// edge to edge reads as a bug. At 1024px and above the app takes the whole viewport
// instead and TabNavigator moves the tab bar to a rail; the framed column would only
// waste a desktop screen. On a real phone the column already fills the screen, so
// maxWidth has no effect there either way.

export default function App() {
  const mode = useLayoutMode();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  if (!fontsLoaded) return null;

  const framed = Platform.OS === "web" && mode === "phone";
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
          maxWidth: framed ? PHONE_FRAME_WIDTH : undefined,
          backgroundColor: "#ffffff",
        }}
      >
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
