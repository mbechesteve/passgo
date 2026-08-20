# Portal v6 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the whole portal — the marketing page and the five logged-in pages — onto the Pamoja Landing v6 + Mobile boards, without touching the app at `/app`.

**Architecture:** The five logged-in pages contain zero raw colour values; they consume only `portal.css`'s role tokens. So the token layer is the lever: repointing ~20 values re-skins every page at once. On top of that go a derived eight-step type scale, Outfit in place of DM Sans, the board's card radius, and colour photography with its attribution intact.

**Tech Stack:** Plain CSS custom properties and static HTML in `portal/`; Google Fonts for Outfit and JetBrains Mono; Node for the contrast and page verifiers; Playwright for browser checks.

**Spec:** `docs/superpowers/specs/2026-08-20-portal-v6-redesign-design.md`
**Board survey (measured values, type scale, contrast):** `docs/design/2026-08-20-vibrant-redesign-findings.md`

## Global Constraints

- **Token names do not change**, except the one rename in Task 1. They are roles, not colours. `portal/README.md`: *"A variable called `--gold` holding blue is worse than a rename."*
- **No page may hold a raw colour.** Every colour comes from a `portal.css` token. A hex literal in `app.css`, a page script or a page's inline style is a defect.
- **WCAG AA is binding and beats the board.** 4.5:1 body, 3:1 large text. Where the board's own value fails, contrast wins and the deviation is recorded in a comment beside the token.
- **Orange `#f4772c` is `--brand`: display sizes only.** Never body text, never a control surface, never on white below 40px. It fails at 2.79 on white. The interactive colour is indigo.
- **Breakpoint stays 860px. Touch targets stay 44px.** Neither is a board decision and neither changes.
- **JetBrains Mono stays.** It is the data register — Pass serials, record lines, kickoff times, figures. Not a second display face.
- **No information-architecture change.** No page added, removed, renamed or re-sectioned.
- **Attribution is a licence term.** Every image on a page must map to one of the nine attributions in `portal/credits.html`. An image that cannot be mapped **stops the task and asks** — it does not ship uncredited.
- **The app at `/app` is not touched.** No file under `src/screens`, `src/components`, `src/navigation`, nor `tailwind.config.js`, `src/lib/theme.ts` or `DESIGN.md`.
- Gate: `npm test` (252/23), `npm run verify:bundle`, `npm run verify:portal`, and from Task 1 also `npm run verify:contrast`.
- The board files are in a scratchpad, not the repo: `/tmp/claude-1000/-home-mbeche-Documents-projects-2026-PassGo/6f005a8b-212c-43f1-a2fb-08f19995da6e/scratchpad/redesign/`. `Pamoja Landing v6.dc.html` and `Pamoja Mobile.dc.html` are the two that matter.

**Depends on:** the final-review fix wave for the port landing first. It touches `portal/pages/*.js`, `scripts/verify-portal.mjs`, `src/portal-entry.ts` and both READMEs. Do not start Task 1 until it is merged, or you will conflict.

---

### Task 1: The token layer

The whole re-skin in one file, plus a test that keeps it honest.

**Files:**
- Modify: `portal/portal.css` (the `:root` block)
- Modify: `portal/auth.css`, `portal/index.html` (the `--cyan` rename, 14 uses across these and portal.css)
- Create: `scripts/verify-contrast.mjs`
- Modify: `package.json` (add `verify:contrast`)

**Interfaces:**
- Produces: the token set below. Every later task consumes it and adds no colours of its own.

- [ ] **Step 1: Write the failing contrast test**

```js
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

console.log(bad ? `\nverify-contrast: ${bad} failing` : "\nverify-contrast: all pairs ok");
process.exit(bad ? 1 : 0);
```

- [ ] **Step 2: Run it and watch it fail**

Add to `package.json` scripts: `"verify:contrast": "node scripts/verify-contrast.mjs"`.

Run: `npm run verify:contrast`
Expected: FAIL — `--highlight is not defined in portal/portal.css`. That token does not exist yet.

- [ ] **Step 3: Repoint the tokens**

Replace `portal/portal.css`'s `:root` block with this. Values are the board's, except the three marked, which are derived by holding hue and saturation and moving lightness, or overridden by contrast.

```css
:root {
  /* The Pamoja Landing v6 board (desktop) and Pamoja Mobile (phone). Names are roles
     and did not change when the values did — the minimax blue became indigo in place,
     because a variable called --accent holding one brand's blue and then another's
     indigo is still --accent, whereas a variable named for a colour would now be lying.

     Three values are NOT the board's, and each is a contrast override rather than a
     preference. The board is a picture; AA is a requirement. */
  --primary:      #23276b;   /* indigo: nav, dark panels, the CTA band */
  --primary-soft: #2d328a;   /* indigo +8% lightness: raised dark surface */
  --charcoal:     #1d2058;   /* indigo -5%: pressed */
  --accent:       #23276b;   /* the interactive hue — buttons, links, active destination.
                                Indigo, not orange: the board's own buttons are indigo
                                pills, and orange is 2.79 on white, unusable for the 11px
                                active-tab label this drives. */
  --accent-mid:   #2d328a;   /* hover */
  --accent-deep:  #171a4c;   /* focus ring — indigo -8%, darker so it reads against the fill */
  --accent-200:   #c9cbe6;   /* indigo tint */
  --brand:        #f4772c;   /* the "pamoja." wordmark and decorative marks.
                                DISPLAY SIZES ONLY. Never body text, never a control
                                surface, never on white below 40px: it is 2.79 there. */
  --highlight:    #ffd22c;   /* the figures and eyebrows. 9.22 on indigo. */
  --on-dark:      #ffd22c;   /* accent text ON dark — was --cyan, which could not keep
                                its name while holding yellow. */
  --success:      #1ba673;   /* live and confirmed — semantic, and the boards say nothing
                                about it, so it is not theirs to overrule */
  --success-bg:   #e8ffea;
  --canvas:       #ffffff;
  --surface:      #e9e8f1;   /* the page ground */
  --surface-soft: #f7f6f3;   /* banded sections — the warm paper from the Mobile board */
  --hairline:     #b9bce4;   /* lilac rules */
  --ink:          #23276b;   /* body and headings */
  --slate:        #515365;   /* body copy — muted -18%, 7.57 on white */
  --steel:        #63657c;   /* muted -10% */
  --stone:        #767891;   /* muted -2% */
  --muted:        #989aad;   /* secondary text on dark. The board's #7c7e96 is 3.36 on
                                indigo and fails AA, so this is that value +10%: 4.80. */
  --ink-rgb:      35, 39, 107;  /* for the translucent inks app.css needs; a component
                                   must not decompose --ink by hand */
  --pad-x:        clamp(20px, 5vw, 64px);
}
```

- [ ] **Step 4: Rename `--cyan` to `--on-dark` at its consumers**

Run: `grep -rn 'var(--cyan)' portal/`
Expected: 14 matches across `portal/portal.css`, `portal/auth.css`, `portal/index.html`.

Replace each `var(--cyan)` with `var(--on-dark)`. Then confirm none remain:

Run: `grep -rn -- '--cyan' portal/`
Expected: no output.

- [ ] **Step 5: Run the contrast test**

Run: `npm run verify:contrast`
Expected: PASS — eight `ok` lines and `verify-contrast: all pairs ok`.

- [ ] **Step 6: Confirm the pages still work**

Run: `npm run verify:portal`
Expected: all pages ok. This suite asserts structure and data, never appearance, so a pure re-skin must not move it. **If it goes red, you broke behaviour, not looks — read the failure rather than adjusting the suite.**

Run: `npm test`
Expected: 252 tests / 23 files.

- [ ] **Step 7: Commit**

```bash
git add portal/portal.css portal/auth.css portal/index.html scripts/verify-contrast.mjs package.json
git commit -m "feat: repoint the portal's tokens onto the v6 board"
```

---

### Task 2: Outfit, and a type scale that is eight steps rather than thirty

**Files:**
- Modify: `portal/portal.css` (font stacks, and the new scale tokens)
- Modify: all eight portal HTML files' Google Fonts `<link>` (`index`, `login`, `signup`, `dashboard`, `matches`, `live`, `partners`, `pass`, `credits`)

**Interfaces:**
- Consumes: Task 1's tokens.
- Produces: `--fs-micro` … `--fs-display`, consumed by Tasks 4 and 5.

- [ ] **Step 1: Swap the font link**

Every portal HTML page currently loads DM Sans. `credits.html` still loads Outfit from before the minimax migration — check it and bring it into line with the rest rather than leaving a second variant.

The replacement link, identical on every page. Weights are the board's: it is top-loaded, 800 (41 uses) and 700 (31) dominating.

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Run: `grep -c 'family=Outfit' portal/*.html`
Expected: every portal page returns 1, and `grep -rn 'DM+Sans' portal/` returns nothing.

- [ ] **Step 2: Add the scale, and point the body stack at Outfit**

Add to `portal/portal.css`'s `:root`:

```css
  /* Eight steps, derived from the boards rather than lifted. v6 and Mobile carry 30
     distinct sizes between them, which is not 30 decisions: everything at 40px and up
     is weight 800, and Mobile's 52px/48px are v6's 96px/84px at a narrower artboard —
     one element, two widths. Those collapse into the two fluid steps below. The dense
     band at 10-14px is the label and mono register and needs three steps, not five.
     7px and 8px appear six times between them, below this portal's legibility floor,
     and fold into --fs-micro. */
  --fs-micro:    11px;                      /* eyebrows, mono labels */
  --fs-small:    13px;
  --fs-body-sm:  15px;
  --fs-body:     17px;
  --fs-subhead:  22px;
  --fs-head:     28px;
  --fs-feature:  clamp(40px, 5.5vw, 64px);  /* section displays */
  --fs-display:  clamp(52px, 9vw, 96px);    /* the hero, phone to desktop */
```

Then replace the DM Sans body stack. Find it with `grep -n "DM Sans" portal/portal.css` and set:

```css
  font-family: "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif;
```

Leave every `"JetBrains Mono"` stack exactly as it is.

- [ ] **Step 3: Verify no stray sizes remain in the shared sheets**

Run: `grep -oE 'font-size:\s*[0-9.]+px' portal/portal.css portal/auth.css portal/app.css | sort -u`
Expected: nothing, or only values you can justify. Every size in these three sheets should now be `var(--fs-…)`. Convert any literal you find to the nearest step; if none fits, the scale is wrong and you should say so rather than adding a ninth step quietly.

- [ ] **Step 4: Run the gate**

Run: `npm run verify:contrast && npm run verify:portal && npm test`
Expected: contrast ok, pages ok, 252/23.

- [ ] **Step 5: Look at it**

Serve `portal/` and screenshot `index.html` and `pass.html` at 420×900 and 1280×900. Spawn and kill the server inside your Node script; do not background a shell command. Wait for `!document.documentElement.hasAttribute('data-booting')` before capturing or you photograph the boot curtain.

**Look at the screenshots.** Type at the wrong scale is obvious on sight and invisible to every assertion in this plan. Describe what you see in your report.

- [ ] **Step 6: Commit**

```bash
git add portal/portal.css portal/*.html
git commit -m "feat: put the portal on Outfit and an eight-step scale"
```

---

### Task 3: Form — radius, weight, and the three deferred cleanups

**Files:**
- Modify: `portal/portal.css`, `portal/app.css`

**Interfaces:**
- Consumes: Tasks 1 and 2.

- [ ] **Step 1: Move the card radius to the board's**

The board's radii, counted: 999px pills (17 uses), then 20px cards (7), then 24/18/12/10 once or twice each. Today's cards are 16px.

Add a token rather than scattering the number:

```css
  --radius-card: 20px;   /* the board's card radius; pills stay 999px */
```

Then replace card-radius literals in `portal.css`, `auth.css` and `app.css` with `var(--radius-card)`. Leave 999px pills, `50%` circles, and the 16px on `dialog.sheet` if changing it would fight the sheet's phone treatment — say which you kept and why.

- [ ] **Step 2: Take the three cleanups deferred into this redesign**

All three were logged during the port and explicitly held for this work:

1. `portal/app.css` uses `rgba(10, 10, 10, 0.24)` and `rgba(10, 10, 10, 0.44)` for the dialog shadow and backdrop — hand-decomposed `--ink`, and now the wrong colour entirely since `--ink` is indigo. Use the `--ink-rgb` token Task 1 added: `rgba(var(--ink-rgb), 0.24)` and `rgba(var(--ink-rgb), 0.44)`.
2. `portal/app.css` has a `@media (prefers-reduced-motion: reduce)` block setting `animation: none` on `dialog.sheet`, which has no animation. It is dead. Delete it — or, if you give the sheet an entrance animation while you are here, make the block real. Do not leave it as-is.
3. `portal/app.css`'s `.appmain` sets `padding-bottom: 96px` unconditionally, including on desktop where `.tabbar` is `display: none` and there is nothing to clear. Scope it to the phone breakpoint.

- [ ] **Step 3: Verify**

Run: `grep -rn 'rgba(10, *10, *10' portal/`
Expected: no output.

Run: `npm run verify:contrast && npm run verify:portal && npm test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add portal/portal.css portal/app.css
git commit -m "feat: take the board's card radius, and clear three deferred cleanups"
```

---

### Task 4: The marketing page

The largest task, and the only one with a board to copy from directly.

**Files:**
- Modify: `portal/index.html`

**Interfaces:** consumes Tasks 1–3.

- [ ] **Step 1: Read the board next to the page**

Open `Pamoja Landing v6.dc.html` and `Pamoja Mobile.dc.html` from the scratchpad path in Global Constraints, and `portal/index.html` beside them.

The sections map one-to-one; **nothing is added, removed or re-ordered**:

| v6 heading | `index.html` section |
|---|---|
| Karibu, pamoja. | hero |
| One Pass. Five doors. | `#pass` — the doors accordion |
| All fixtures | `#matches` |
| Fan events and promotions | `#events` |
| Explore the host country | `#explore` |
| Own the tournament. | closing CTA / `#partners` |

- [ ] **Step 2: Bring the page onto the system**

Work section by section, committing as you go. What changes: colour (via tokens only), type (via the scale only), radius, weight, and the hero's treatment. What does not change: the markup's structure, the section ids, the anchor links, the doors accordion's radio-input mechanism, the ticker's `translateX(-50%)` marquee, or the events rail's `scrollBy(±364)` buttons.

Specifics from the board:
- The hero heading is two lines — "Karibu," in `--ink`, "pamoja." in `--brand`. This is the one place orange carries text, and it is legitimate: `--fs-display` is 52–96px, far above the large-text threshold, and the board draws it exactly so.
- The figure row (11 / 7 / 3 / 2,189) takes `--highlight` for the numbers and `--fs-micro` uppercase for the labels.
- Chips above the hero heading are pills: one filled `--primary`, one filled `--highlight`, one outlined.
- Buttons are indigo pills with white labels. **Not orange** — see Global Constraints.
- The closing heading is **"Own the tournament."** The spec keeps it, but records that it
  echoes the Craydel brand bible bundled in the same zip ("Own it with Craydel") rather
  than coming from Pamoja's own voice. Keep it; do not quietly reword it, and do not
  quietly adopt more of that voice elsewhere on the page.

The hero, concretely, since it is the page's whole first impression and the one place
orange carries text:

```html
<p class="eyebrow mono">One Pass &middot; Three countries &middot; Every match</p>
<h1 class="hero-title">
  Karibu,<br><span class="hero-title-brand">pamoja.</span>
</h1>
```

```css
.hero-title {
  font-size: var(--fs-display);
  font-weight: 800;
  line-height: 0.82;          /* the board's, at display size */
  letter-spacing: -0.03em;
  color: var(--ink);
  margin: 0;
}
/* The one legitimate use of --brand on text: --fs-display is 52-96px, far above the
   large-text threshold, and the board draws the wordmark exactly this way. Anywhere
   smaller and this would fail at 2.79 on white. */
.hero-title-brand { color: var(--brand); }
```

- [ ] **Step 3: Guard the one thing that can silently break**

`index.html` hand-types `2,189` in four places. It predates the bundle and is out of this plan's scope to fix, but note in your report whether your edits preserved all four, because nothing tests them.

Run: `grep -c '2,189' portal/index.html`
Expected: 4 — the same as before you started.

- [ ] **Step 4: Verify and look**

Run: `npm run verify:contrast && npm run verify:portal && npm test`

Then screenshot `index.html` at 420×900 and 1280×900 (server spawned and killed inside your script; wait out `data-booting`) and **compare against the board screenshots side by side**. Describe the differences you accepted and why in your report.

- [ ] **Step 5: Commit**

```bash
git add portal/index.html
git commit -m "feat: bring the marketing page onto the v6 board"
```

---

### Task 5: The five logged-in pages

The boards never drew these. They already inherit Tasks 1–3; this pass gives them the board's component form.

**Files:**
- Modify: `portal/app.css`
- Modify: `portal/dashboard.html`, `portal/matches.html`, `portal/live.html`, `portal/partners.html`, `portal/pass.html` — only where a class or a size is applied, not their structure
- Modify: `portal/pages/*.js` — only where markup carries an inline style

**Interfaces:** consumes Tasks 1–3.

- [ ] **Step 1: Derive, do not invent**

Apply the board's *system*, not new layouts:
- eyebrows and section labels at `--fs-micro`, uppercase, letter-spaced, in `--slate`
- figures and counts in `--highlight` on dark grounds, `--ink` on light, at `--fs-subhead` or `--fs-head`
- headings at weight 800, matching the board's top-loaded weighting
- cards at `--radius-card`, pills for controls
- the tab bar's active destination in `--accent` (indigo), which is legible where orange was not

No page gains a section, a control, or a navigation. If a page looks empty next to the marketing page, that is the empty state and it is correct — do not add ornament to fill it.

- [ ] **Step 2: Remove inline styles that belong in the sheet**

The port left duplicated inline styles: `min-height:44px;width:100%` appears in `portal/pages/matches.js` and `portal/pages/partners.js`. Move it to a class in `app.css` and use it in both. Check for others while you are in there.

Run: `grep -n 'style="' portal/pages/*.js`
Expected: markedly fewer than before; report what you left and why.

- [ ] **Step 3: Verify**

Run: `npm run verify:contrast && npm run verify:portal && npm test`
Expected: all green. `verify:portal` asserts structure and data only, so a correct re-skin cannot move it.

- [ ] **Step 4: Look at all five, at both widths**

Screenshot each of the five at 420×900 and 1280×900 (server inside your script, wait out `data-booting`). **Look at them.** In particular check the credential block on `pass.html`, which was rebuilt during the port and is the densest thing on any of these pages.

- [ ] **Step 5: Commit**

```bash
git add portal/app.css portal/dashboard.html portal/matches.html portal/live.html portal/partners.html portal/pass.html portal/pages
git commit -m "feat: derive the logged-in pages from the board's system"
```

---

### Task 6: Photography, and the credits that must travel with it

**Files:**
- Add: selected files under `portal/img/`
- Modify: `portal/index.html` (image references and the grayscale treatment)
- Modify: `portal/credits.html` if and only if an attribution needs correcting

- [ ] **Step 1: Establish the mapping before copying anything**

The board's `clr-*` assets are colour crops of the same subjects as the current photography. The nine attributions in `portal/credits.html` are CC BY-SA and cover the originals; a recoloured crop is a derivative and the obligation follows it.

Build the mapping explicitly, in your report, before you copy a file:

| board asset | current file | attribution on credits.html |
|---|---|---|
| `clr-mara.png` | `portal/img/mara.jpg` | `Wildebeest_Migration_Masai_mara.jpg` |
| `clr-lamu.png` | `portal/img/lamu.jpg` | `Lamu_dhow_1.JPG` |
| `clr-nairobi.png` | `portal/img/nairobi.jpg` | `Nairobi_skyline_P1000020.jpg` |
| `clr-mtkenya.png` | `portal/img/mt-kenya.jpg` | `Pt_Thomson_Batian_Nelion_Mt_Kenya.JPG` |
| `clr-ev-*.png` | `portal/img/ev-*.jpg` | the event attributions |
| `clr-door.png` | `portal/img/door-*.jpg` | the door attributions |

**Any asset you cannot place in that table stops this task.** Do not ship it, do not guess a source, and do not quietly leave it out of a page you have already styled for it. Say so in your report and stop.

- [ ] **Step 2: Copy only what is used**

The zip holds 164 files and 35MB. Copy the ones the page actually references and no more. The `clr-*` crops are small (850×179, 412×95) — check each is large enough for the slot it fills before replacing a full-size JPEG with it; if it is not, keep the current image and take only the colour treatment.

- [ ] **Step 3: Drop the grayscale treatment**

Find it with `grep -n 'grayscale' portal/*.css portal/*.html` — it is `grayscale(1) contrast(1.06)` with a multiply gradient wash over it. Colour replaces it. Remove the wash where the board shows the photograph plainly; keep it where the board still darkens an image behind text, because that wash is doing legibility work, not decoration.

- [ ] **Step 4: Verify the credits still hold**

Run: `grep -c 'creativecommons.org' portal/credits.html`
Expected: 9, unless you corrected an attribution — in which case say which and why.

Confirm the footer's "Photo credits" link still resolves, at both widths, in the browser. It is a licence term, not navigation.

- [ ] **Step 5: Run the gate and look**

Run: `npm run verify:contrast && npm run verify:portal && npm test`

Screenshot `index.html` at both widths. Check text over photography is still legible now the images are colour — this is the change most likely to break contrast in a way no token test can catch, because it is text on an image, not on a token.

- [ ] **Step 6: Commit**

```bash
git add portal/img portal/index.html portal/credits.html
git commit -m "feat: give the portal the board's colour photography"
```

---

### Task 7: Say what the portal is now

**Files:**
- Modify: `portal/README.md`

- [ ] **Step 1: Rewrite the design-system section**

`portal/README.md` currently documents the migration *to* minimax in detail, with a table of what changed and why. That is now historical.

Rewrite it to say the portal follows the **Pamoja Landing v6 + Mobile** boards, in the README's existing voice — prose that explains why, with tables. Keep the record of the minimax move rather than deleting it; the reasoning for the earlier decision is still worth having, and a reader who finds only the current state cannot tell what was tried.

State plainly:
- the palette, with indigo as ground and interactive, yellow for figures, and orange restricted to display
- that **orange is not a text colour** — 2.79 on white — and that `--accent` is indigo for exactly that reason
- that `--muted` is lightened from the board's value because the board's own pairing fails AA on indigo
- that the type scale is eight derived steps, not the board's thirty, and why
- that `scripts/verify-contrast.mjs` enforces all of this

- [ ] **Step 2: Correct the imagery section**

It describes grayscale photography with a multiply wash. Update it, and restate the attribution rule — it is the one thing in that file with legal force.

- [ ] **Step 3: Note what the boards did not cover**

Say that the five logged-in pages were derived from the board's system rather than drawn, so a future board for them supersedes this derivation rather than conflicting with it.

- [ ] **Step 4: Commit**

```bash
git add portal/README.md
git commit -m "docs: describe the portal as the v6 board leaves it"
```
