/** @type {import('tailwindcss').Config} */
// Theme tokens follow DESIGN.md: two hues only — deep (#04222b) and accent
// (#0e6ba8), sampled from the PAMOJA proposal artwork. No per-category colors.
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Sampled from the PAMOJA proposal artwork (Figures 1 and 3). Two hues only.
        deep: {
          DEFAULT: "#04222b",
          soft: "#223c44",
          grad: "#0a3641",     // second gradient stop
          deeper: "#062b36",   // third gradient stop
        },
        accent: {
          DEFAULT: "#0e6ba8",
          tint: "#e2edf4",          // chip fill on light
          soft: "#6fc2e8",          // accent text ON deep
        },
        ondark: {
          mute: "#8ea5ae",
          faint: "#7fa5b4",
        },
        ink: { DEFAULT: "#16181a" },
        body: { DEFAULT: "#4a565b" },   // was #545557 — cooler
        mute: { DEFAULT: "#5a686d" },   // was #676869 — cooler
        faint: { DEFAULT: "#8a9599" },  // was #acadae — cooler
        hairline: { DEFAULT: "#dde3e4" },
        panel: { DEFAULT: "#eef0f0" },
        surface: { DEFAULT: "#f5f8f8" },
        canvas: { DEFAULT: "#ffffff" },
      },
      // NOTE: family keys must not collide with Tailwind's font-WEIGHT utilities.
      // A key named `semibold` or `bold` would generate `font-semibold` /
      // `font-bold` and clash with the built-in weight classes. Use these names,
      // and address weight through the family — the faces carry it.
      fontFamily: {
        sans: ["Outfit_400Regular"],
        medium: ["Outfit_500Medium"],
        display: ["Outfit_700Bold"],
        "display-heavy": ["Outfit_800ExtraBold"],
        mono: ["JetBrainsMono_400Regular"],
        "mono-medium": ["JetBrainsMono_500Medium"],
      },
      borderRadius: { card: "10px" },
    },
  },
  plugins: [],
};
