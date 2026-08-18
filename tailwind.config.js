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
        deep: { DEFAULT: "#04222b", soft: "#223c44" }, // Pass card / dark surfaces
        accent: { DEFAULT: "#0e6ba8" },                 // the single blue
        ink: { DEFAULT: "#16181a" },
        body: { DEFAULT: "#545557" },
        mute: { DEFAULT: "#676869" },
        faint: { DEFAULT: "#acadae" },
        hairline: { DEFAULT: "#dde3e4" },
        panel: { DEFAULT: "#eef0f0" },
        surface: { DEFAULT: "#f5f8f8" },
        canvas: { DEFAULT: "#ffffff" },
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: { card: "10px" },
    },
  },
  plugins: [],
};
