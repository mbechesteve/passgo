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
        // Primary — near-black ink. `brand-700` (#080808) is every primary CTA.
        brand: {
          50: "#f3f3f3", // light selected-row highlight
          100: "#e6e6e6", // light chip / light text on dark bands
          200: "#cccccc",
          300: "#999999",
          400: "#4d4d4d",
          500: "#1f1f1f",
          600: "#141414",
          700: "#080808", // primary CTA / active tab / ink
          800: "#000000",
          900: "#000000",
        },
        // Premium sub-brand — Webflow accent purple.
        ocean: {
          50: "#f3edff",
          100: "#e9ddff",
          300: "#7a3dff", // accent purple
          500: "#6a2fe6",
          600: "#7a3dff", // premium button / icon fill
          700: "#5a23c0", // gradient deep
        },
        // Text on white — ink down to mute-soft.
        ink: {
          900: "#080808", // headings + ink
          700: "#363636", // body
          500: "#898989", // mute
          400: "#ababab", // mute-soft / placeholder
        },
        surface: {
          DEFAULT: "#ffffff", // canvas / cards
          muted: "#f6f6f6", // subtle inset wells, page tint
          sunken: "#d8d8d8", // hairline borders
        },
        // Semantic visa-status colors = Webflow chromatic accents.
        visa: {
          free: "#00d722", // accent green
          voa: "#ffae13", // accent yellow
          evisa: "#3b89ff", // accent blue
          required: "#ee1d36", // accent red
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        card: "8px", // Webflow card radius (rounded.md)
      },
    },
  },
  plugins: [],
};
