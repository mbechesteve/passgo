// Central palette — kept in sync with tailwind.config.js. Used where raw color
// values are needed (maps, icons, shadows) outside of className.
// Sampled from the PAMOJA proposal artwork; exactly two hues.
export const colors = {
  deep: "#04222b",
  deepSoft: "#223c44",
  deepGrad: "#0a3641",
  deepDeeper: "#062b36",
  accent: "#0e6ba8",
  accentTint: "#e2edf4",
  accentSoft: "#6fc2e8",
  ondarkMute: "#8ea5ae",
  ondarkFaint: "#7fa5b4",
  ink: "#16181a",
  body: "#4a565b",
  mute: "#5a686d",
  faint: "#8a9599",
  hairline: "#dde3e4",
  panel: "#eef0f0",
  surface: "#f5f8f8",
  canvas: "#ffffff",
} as const;
