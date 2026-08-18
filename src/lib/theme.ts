// Central palette — kept in sync with tailwind.config.js. Used where raw color
// values are needed (maps, icons, shadows) outside of className.
// Sampled from the PAMOJA proposal artwork; exactly two hues.
export const colors = {
  deep: "#04222b",
  deepSoft: "#223c44",
  accent: "#0e6ba8",
  ink: "#16181a",
  body: "#545557",
  mute: "#676869",
  faint: "#acadae",
  hairline: "#dde3e4",
  panel: "#eef0f0",
  surface: "#f5f8f8",
  canvas: "#ffffff",
} as const;
