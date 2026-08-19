/** @type {import('tailwindcss').Config} */
// Theme tokens follow DESIGN.md, which now follows minimax/DESIGN.md — the design
// template added by `npx getdesign@latest add minimax`.
//
// This replaces the Uratibu-derived palette (deep #04222b, accent #0e6ba8) and Outfit.
// The token NAMES are unchanged on purpose: `deep`, `accent`, `ink`, `panel` and the
// six font keys are the choke point this app was built around, so re-skinning it is a
// change to this file and theme.ts rather than to fifty screens.
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // minimax's near-black. It carries the Pass card, the rail and the doors.
        deep: {
          DEFAULT: "#0a0a0a",   // primary
          soft: "#181e25",      // primary-soft
          grad: "#181e25",      // second gradient stop
          deeper: "#0a0a0a",    // third stop — the ramp is near-black on near-black
        },
        // minimax reserves coral/magenta/purple for product identity and never for
        // general interaction, so the interactive accent is its blue.
        accent: {
          DEFAULT: "#1456f0",   // brand-blue
          tint: "#bfdbfe",      // brand-blue-200 — chip fill on light
          soft: "#3daeff",      // brand-cyan — accent text ON deep
        },
        ondark: {
          mute: "#a8aab2",      // muted
          faint: "#8e8e93",     // stone
        },
        ink: { DEFAULT: "#0a0a0a" },
        body: { DEFAULT: "#45515e" },   // slate
        mute: { DEFAULT: "#5f5f5f" },   // steel
        faint: { DEFAULT: "#8e8e93" },  // stone
        hairline: { DEFAULT: "#e5e7eb" },
        panel: { DEFAULT: "#f2f3f5" },  // surface-soft
        surface: { DEFAULT: "#f7f8fa" },
        canvas: { DEFAULT: "#ffffff" },
        // The one semantic pair minimax defines, used for live and confirmed states.
        live: { DEFAULT: "#1ba673", tint: "#e8ffea" },
      },
      // NOTE: family keys must not collide with Tailwind's font-WEIGHT utilities.
      // Address weight through the family — the faces carry it.
      fontFamily: {
        sans: ["DMSans_400Regular"],
        medium: ["DMSans_500Medium"],
        display: ["DMSans_600SemiBold"],
        "display-heavy": ["DMSans_700Bold"],
        // Kept against minimax's advice, deliberately — see DESIGN.md.
        mono: ["JetBrainsMono_400Regular"],
        "mono-medium": ["JetBrainsMono_500Medium"],
      },
      // minimax's radius scale. `card` moves 10px -> 16px (its xl) and `hero` is the
      // 32px it pairs against that, which is the contrast it calls its signature.
      borderRadius: {
        card: "16px",
        hero: "32px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
