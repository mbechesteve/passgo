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
  /* The two-tone display tints. 3.0, not 4.5: every use is --fs-feature (28-40px, 800),
     --fs-head at 800, or --fs-display, all of which are WCAG "large text". Each is
     listed against BOTH light grounds, because the page has two of them and the board's
     headings do not all sit on the same one — "Fan events and promotions" is on
     --canvas, "One Pass. Five doors." and "Explore the host country" are on
     --surface-soft, which is darker and therefore the binding case. */
  ["display-tint",     "canvas",       3.0, "the warm half of a display heading, on paper"],
  ["display-tint",     "surface-soft", 3.0, "the same, on the banded ground"],
  ["display-tint-alt", "canvas",       3.0, "the green half of a display heading, on paper"],
  ["display-tint-alt", "surface-soft", 3.0, "the same, on the banded ground"],
  /* --brand is a text colour in exactly one place — "tournament." on the CTA band — and
     the board's raw orange clears there, so it is checked where it is used rather than
     being darkened for a ground it never sits on. */
  ["brand",            "primary",      3.0, "the warm half of the CTA headline, on the green ground"],
  /* The partners band's five figures, which the board gives five different colours. All
     are --fs-head at weight 800 on --primary, so 3.0. --highlight is checked above; the
     other four are here. --marker is checked on --canvas as well, where it is the Kenya
     dot on an event card rather than a figure — a graphic, and 3.0 again. */
  ["display-tint-alt", "primary",      3.0, "the Stay figure, and the Tanzania dot, on the green ground"],
  ["success",          "primary",      3.0, "the Do figure on the green ground"],
  ["marker",           "primary",      3.0, "the Move figure on the green ground"],
  ["marker",           "canvas",       3.0, "the Kenya dot on an event card"],
  /* --brand used to be deliberately ABSENT from this list. Under indigo it was the board's
     orange at 2.79 on white — below even the large-text threshold — so the guarantee worth
     asserting was that it is never type. The rebrand inverts that: the palette's one red is
     3.82 on --canvas, which large text clears, so the pair is checkable and is checked.
     It is still not body-copy safe (3.82 < 4.5) and no page sets it as body copy. */
  ["brand",            "canvas",       3.0, "the red display heading, on paper"],
  /* --accent-200 is the open door's body copy and the fixture card's kick-off line, both on
     dark. It was never gated; the rebrand is the moment to gate it, because it is a tint of
     the ground now and a tint of the ground is the one thing that can quietly converge. */
  ["accent-200",       "primary",      4.5, "body copy on the dark ground"],
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

/* The assertion that used to stand here required --brand to stay UNDER 3.0 on --canvas —
   a tripwire against anyone "restoring the board value" and putting an unusable orange back
   into type. It is gone because its subject is gone: the palette's warm colour is a red at
   3.82 on white, and an assertion that a token must remain unusable is only worth keeping
   while the token actually is. The pair is now gated in PAIRS above, which is the stronger
   statement — it fails if the red is ever taken light enough to stop being readable. */

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
