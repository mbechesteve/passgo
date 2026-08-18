/** @type {import('tailwindcss').Config} */
// Theme tokens follow DESIGN.md (Webflow-inspired): white canvas, near-black
// (#080808) primary for every CTA/heading, hairline-bordered white cards, tight
// 4px button / 8px card radii, and a weight ceiling of 600. Chromatic accents
// (purple/blue/green/amber/red) are reserved for category & status surfaces.
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
