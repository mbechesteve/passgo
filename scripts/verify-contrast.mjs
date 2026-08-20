// scripts/verify-contrast.mjs
/* The token palette, checked against WCAG AA.
   The v6 board is a picture, not a contract: two of its own pairings fail AA, and the
   fix for each was a judgement (lighten --muted; keep orange off text entirely). This
   asserts those judgements so a later "let's use the board value" quietly undoes
   neither. Ratios are computed from portal.css itself, so editing a token re-runs the
   check rather than dating this file. */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const css = readFileSync("portal/portal.css", "utf8");

function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  assert.ok(m, `--${name} is not defined in portal/portal.css`);
  return m[1];
}
function srgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}
function luminance(hex) {
  const [r, g, b] = srgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// [foreground, background, minimum, why this pair exists]
const PAIRS = [
  ["ink",       "canvas",  4.5, "body copy on paper"],
  ["ink",       "surface", 4.5, "body copy on the banded ground"],
  ["slate",     "canvas",  4.5, "secondary body copy"],
  ["canvas",    "primary", 4.5, "reversed type on the dark ground"],
  ["muted",     "primary", 4.5, "secondary type on the dark ground"],
  ["highlight", "primary", 3.0, "the figures and eyebrows on dark"],
  ["accent",    "canvas",  4.5, "links and the active destination"],
];
/* Note: the ratio is symmetric, so a pair is listed once. --canvas on --accent is the
   same number as --accent on --canvas — a button label on the indigo ground is covered
   by the line above, not by a second entry. */

let bad = 0;
for (const [fg, bg, min, why] of PAIRS) {
  const r = ratio(token(fg), token(bg));
  const ok = r >= min;
  if (!ok) bad++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} --${fg} on --${bg}  ${r.toFixed(2)} (need ${min}) — ${why}`
  );
}

/* --brand is deliberately absent from PAIRS: orange is 2.79 on white, which fails even
   the large-text threshold, so it is never a text colour. Assert that instead — the
   guarantee is that it is NOT used as one, which pages enforce, not this file. */
const brandOnCanvas = ratio(token("brand"), token("canvas"));
assert.ok(
  brandOnCanvas < 3.0,
  `--brand now reaches ${brandOnCanvas.toFixed(2)} on --canvas. If it has been changed to ` +
    `a text-safe colour, move it into PAIRS; if not, this assertion is stale.`
);

/* --stone is also deliberately absent from PAIRS, for the opposite reason to --brand:
   it IS used as text (the .tabbar label in app.css), just never against --primary. It
   can't be, structurally — --stone sits on --canvas (a light ground, wants a darker
   token) and would need to sit on --primary (a dark ground, wants a lighter one) at
   the same time, and no single grey clears 4.5 against both #ffffff and #23276b (the
   midpoint search that proves this: nothing between 0x00 and 0xff does). --primary
   went from near-black to indigo under Task 1, which is what turned the old
   .split-left .foot — the compliance line "Prototype figures · Pamoja never holds
   funds." — from 6.07 to 3.09 on that pairing. The fix was to stop pairing them: .foot
   now takes --muted (4.80 on --primary, already in PAIRS, already the colour the line
   above it in the same panel uses), and --stone stays put for the tabbar.

   What follows is a tripwire on the two TOKEN VALUES, not on their use. It re-derives the
   ratio from --stone's and --primary's own hex, so it fires only when someone edits one of
   those two tokens. A fresh var(--stone) written onto a dark panel tomorrow would sit at
   this same failing 3.09 and the suite would stay green — catching that needs a usage
   scanner, which this is not. Its job is narrower and still worth doing: stop anyone
   "fixing" a future dark-ground regression by lightening --stone until the pair clears
   4.5, which would quietly sink its --canvas use instead. */
const stoneOnPrimary = ratio(token("stone"), token("primary"));
assert.ok(
  stoneOnPrimary < 4.5,
  `--stone now reaches ${stoneOnPrimary.toFixed(2)} on --primary. A token value changed: ` +
    `--stone or --primary. This checks the two values against each other, not where they ` +
    `are used, so it cannot mean a stray var(--stone) appeared on a dark ground. If the ` +
    `pair was made safe deliberately AND --stone still clears 4.5 on --canvas, move it ` +
    `into PAIRS; otherwise the edit that raised this ratio is the bug.`
);

console.log(bad ? `\nverify-contrast: ${bad} failing` : "\nverify-contrast: all pairs ok");
process.exit(bad ? 1 : 0);
