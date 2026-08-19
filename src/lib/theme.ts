// Central palette — kept in sync with tailwind.config.js. Used where raw color
// values are needed (maps, icons, shadows) outside of className.
//
// From minimax/DESIGN.md. This is no longer the Uratibu palette; see DESIGN.md for
// what was replaced and why.
export const colors = {
  deep: "#0a0a0a",
  deepSoft: "#181e25",
  deepGrad: "#181e25",
  deepDeeper: "#0a0a0a",
  accent: "#1456f0",
  accentTint: "#bfdbfe",
  accentSoft: "#3daeff",
  ondarkMute: "#a8aab2",
  ondarkFaint: "#8e8e93",
  ink: "#0a0a0a",
  body: "#45515e",
  mute: "#5f5f5f",
  faint: "#8e8e93",
  hairline: "#e5e7eb",
  panel: "#f2f3f5",
  surface: "#f7f8fa",
  canvas: "#ffffff",
  live: "#1ba673",
  liveTint: "#e8ffea",
} as const;
