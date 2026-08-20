# Portal App Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the portal a logged-in surface covering the app's 17 screens as five hand-written pages that read their figures, copy and logic from the same `src/` modules the app uses.

**Architecture:** esbuild bundles the RN-free layers of `src/` (plus the four Zustand stores, with AsyncStorage aliased to a localStorage shim) into one IIFE at `portal/app-data.js` exposing a global `Pamoja`. Five hand-written pages read from it. Detail screens become in-page `<dialog>`s rather than navigations, so nothing is more than one dismissal deep.

**Tech Stack:** Plain HTML/CSS/ES modules in `portal/`; esbuild 0.21.5 for the bundle; TypeScript + vitest for the shim; Playwright for page verification.

**Spec:** `docs/superpowers/specs/2026-08-20-portal-app-port-design.md`

## Global Constraints

- **Never hard-code a figure, fixture, price, partner count or user-facing string** that `src/` already holds. Read it from the `Pamoja` global. This is the whole point of the bundle.
- **Time comes from `Pamoja.clock.now()`, never `new Date()`.** The demo clock is `DEMO_NOW = 2027-06-23T12:55:00+03:00`. A page using wall-clock time renders figures that `spec-figures.test.ts` does not predict, and Explore-style seven-day windows silently empty.
- **Breakpoint is 860px** — the portal's existing one. Do not introduce the app's 1024.
- **Minimum touch target 44px** (the floor `portal/README.md` sets and justifies).
- **Reuse `portal.css` tokens unchanged.** No new colours, no new type scale.
- **No auth, no payment capture.** Forms stay `method="get"`. Rev. 2 §05.
- **Every page keeps the boot curtain contract:** the inline `data-booting` head script plus `boot.js`, exactly as `dashboard.html` has it today.
- Test commands: `npm test` (vitest, 247 tests currently green), `npm run build`, `npm run verify:portal`.

## The page shell

Every logged-in page opens with exactly this. Tasks below give only the `<main>`
onward and say "open with the shell in *The page shell*" — copy it from here, not from
a neighbouring task, which you may not have read.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PAGE TITLE — Pamoja</title>
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="favicon-512.png" sizes="512x512" type="image/png">
<link rel="apple-touch-icon" href="favicon-180.png">
<meta name="theme-color" content="#0a0a0a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="portal.css">
<link rel="stylesheet" href="auth.css">
<link rel="stylesheet" href="app.css">
</head>
<body>

<div class="utility mono m11">
  <span style="color:var(--muted)">AFCON 2027 · Kenya · Uganda · Tanzania</span>
</div>

<nav class="nav" aria-label="Main">
  <input class="menu-toggle" type="checkbox" id="menu">
  <a href="index.html" style="color:inherit">
    <span class="brand-name">Pamoja</span>
    <span class="brand-sub mono">The official fan pass</span>
  </a>
  <div class="nav-links">
    <a href="dashboard.html">Home</a>
    <a href="matches.html">Matches</a>
    <a href="live.html">Live</a>
    <a href="partners.html">Partners</a>
    <a href="pass.html">Pass</a>
  </div>
  <div class="nav-cta">
    <a class="btn btn-ghost-dark desk-only" href="index.html">Log out</a>
    <label class="burger" for="menu" aria-label="Open the menu">&#8801;</label>
  </div>
</nav>
```

Take the boot-curtain markup — the inline `data-booting` head script and the `#boot`
element — verbatim from `portal/login.html`, and place it exactly where that file places
it. Do not retype it from memory; it pairs with `boot.js`.

(An earlier draft said to copy it from `dashboard.html`. That file is the pre-plan
prototype and has no curtain at all. `index.html`, `login.html` and `signup.html` each
carry it and are byte-identical; `login.html` is the smallest of the three.)

The closing scripts are, in this order (page script varies):

```html
<script src="app-data.js"></script>
<script src="state.js"></script>
<script src="chrome.js"></script>
<script src="pages/PAGE.js"></script>
<script src="boot.js"></script>
```

`app-data.js` must come first — `state.js` throws if `Pamoja` is absent.

---

### Task 1: The localStorage shim for AsyncStorage

The four stores import `@react-native-async-storage/async-storage`. On web that package is backed by `localStorage` anyway, so the portal aliases it to a shim. The shim lives in `src/lib/` rather than `scripts/` (a refinement of the spec, which said `scripts/shims/`) so it is typed and so vitest's existing `src/**/*.test.ts` glob picks its test up with no config change.

Only three methods are used across the stores and `src/lib/storage.ts`: `getItem`, `setItem`, `removeItem`.

**Files:**
- Create: `src/lib/web-storage.ts`
- Test: `src/lib/web-storage.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: default export `webStorage` with `getItem(key: string): Promise<string | null>`, `setItem(key: string, value: string): Promise<void>`, `removeItem(key: string): Promise<void>`. Task 2 aliases the AsyncStorage package to this module.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/web-storage.test.ts
import { beforeEach, describe, expect, it } from "vitest";

import webStorage from "@/lib/web-storage";

// vitest runs in the `node` environment, so there is no localStorage. The shim has
// to work against whatever `globalThis.localStorage` is at call time, not at import
// time, or it captures undefined and every store silently stops persisting.
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
});

describe("the AsyncStorage shim", () => {
  it("round-trips a value", async () => {
    await webStorage.setItem("pamoja-pass", '{"issued":1}');
    expect(await webStorage.getItem("pamoja-pass")).toBe('{"issued":1}');
  });

  it("returns null for a key that was never set", async () => {
    expect(await webStorage.getItem("absent")).toBeNull();
  });

  it("removes a key", async () => {
    await webStorage.setItem("k", "v");
    await webStorage.removeItem("k");
    expect(await webStorage.getItem("k")).toBeNull();
  });

  it("resolves to null rather than throwing when there is no localStorage", async () => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
    expect(await webStorage.getItem("k")).toBeNull();
    await expect(webStorage.setItem("k", "v")).resolves.toBeUndefined();
  });

  it("swallows a quota failure so a full disk cannot break a render", async () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => null,
      setItem: () => { throw new Error("QuotaExceededError"); },
      removeItem: () => {},
    };
    await expect(webStorage.setItem("k", "v")).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/web-storage.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/web-storage"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/web-storage.ts
/* The web stand-in for AsyncStorage.

   The stores persist through `createJSONStorage(() => AsyncStorage)`, which needs
   only three methods and needs them to return promises. On the web AsyncStorage is
   itself a thin wrapper over localStorage, so the portal aliases the package to
   this at build time rather than shipping the React Native one to a browser that
   has the real thing already.

   `localStorage` is read at call time, never captured at import: the bundle is an
   IIFE that may be evaluated before a document exists, and a captured `undefined`
   would turn every write into a silent no-op that only shows up as state that will
   not persist.

   Every failure resolves rather than rejects. Persistence here is best-effort — a
   private-mode browser or a full quota should cost the user their history, not
   their page. */

function store(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    // Accessing localStorage throws outright in some privacy modes.
    return null;
  }
}

export const webStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return store()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      store()?.setItem(key, value);
    } catch {
      // best-effort; quota and privacy-mode failures are not the caller's problem
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      store()?.removeItem(key);
    } catch {
      // as above
    }
  },
};

export default webStorage;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/web-storage.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Confirm nothing else broke**

Run: `npm test`
Expected: 23 files passed, 252 tests passed (247 existing + 5 new).

- [ ] **Step 6: Commit**

```bash
git add src/lib/web-storage.ts src/lib/web-storage.test.ts
git commit -m "feat: back AsyncStorage with localStorage for the web"
```

---

### Task 2: The shared bundle

**Files:**
- Create: `src/portal-entry.ts`
- Create: `scripts/build-portal-bundle.mjs`
- Create: `scripts/verify-bundle.mjs`
- Modify: `package.json` (add `esbuild` devDependency; add `build:portal-bundle`; chain it into `build`)
- Modify: `.gitignore` (ignore `portal/app-data.js`)

**Interfaces:**
- Consumes: `src/lib/web-storage.ts` from Task 1.
- Produces: `portal/app-data.js`, an IIFE setting `window.Pamoja` with exactly the members listed in Step 1 below. Every later task reads from this global.

- [ ] **Step 1: Write the bundle entry**

```ts
// src/portal-entry.ts
/* The portal's view of the app.

   Everything the logged-in portal pages need, and nothing else. This is a deliberate
   boundary, not a convenience re-export: the portal is a second client, and what it
   may reach into is a decision worth being able to read in one file.

   Nothing here may import from `src/screens`, `src/components` or `src/navigation` —
   those pull React Native, which does not belong in a browser bundle. */

export * as strings from "@/lib/strings";
export * as clock from "@/lib/clock";

export { MATCHES } from "@/data/matches";
export { MATCH_LIVE } from "@/data/live";
export { ENTITLEMENTS } from "@/data/entitlements";
export { EXPLORE_ITEMS } from "@/data/explore";
export { PARKING_ZONES } from "@/data/parking";
export { TICKET_SEED } from "@/data/ticket";
export { NAMED_PARTNERS, PARTNER_TARGETS, generatePartners } from "@/data/partners";

export { DEMO_HOLDER_NAME, issuePass } from "@/utils/issue";
export { daysLeft, passStatus, validityLabel } from "@/utils/pass";
export {
  CATEGORIES,
  CATEGORY_LABEL,
  byCategory,
  countsByCategory,
  findByShortCode,
  nearby,
} from "@/utils/partners";
export { buildRedemption, computeMoney } from "@/utils/redeem";
export {
  groupByDay,
  hasBorderEvent,
  offersUsed,
  recordLine,
  savingsRate,
  totalSaved,
  totalSpent,
  weekSavings,
} from "@/utils/record";
export {
  daysUntilLabel,
  gatesOpenLabel,
  kickoffChipLabel,
  kickoffLabel,
  liveMatches,
  liveMinute,
  matchLabel,
  matchPhase,
  minuteLabel,
  nextMatch,
  teamFlag,
} from "@/utils/match";
export { homeVariant } from "@/utils/home";

export { usePassStore } from "@/store/usePassStore";
export { useRecordStore } from "@/store/useRecordStore";
export { usePaymentStore } from "@/store/usePaymentStore";
export { usePartnerStore } from "@/store/usePartnerStore";
```

- [ ] **Step 2: Write the build script**

```js
// scripts/build-portal-bundle.mjs
/* Build portal/app-data.js — the app's data, logic and copy, for the portal.

   The portal's logged-in pages are hand-written markup, but the numbers behind them
   are proposal specifications guarded by src/utils/spec-figures.test.ts. Retyping
   them into HTML would create a second copy that drifts silently. So the pages read
   from this bundle instead, and the test constrains both surfaces at once.

   Two aliases do the work of making app code run in a browser:

   - `@` is the tsconfig path alias; esbuild does not read tsconfig paths from a
     script invocation, so it is restated here.
   - AsyncStorage is replaced by src/lib/web-storage.ts. The stores are otherwise
     unmodified — they are the app's, not a copy. */
import { build } from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "portal/app-data.js";

await build({
  entryPoints: [resolve(root, "src/portal-entry.ts")],
  outfile: resolve(root, OUT),
  bundle: true,
  format: "iife",
  globalName: "Pamoja",
  platform: "browser",
  target: ["es2020"],
  // Readable in devtools, and small enough that the bytes are not the point.
  minify: false,
  logLevel: "warning",
  alias: {
    "@": resolve(root, "src"),
    "@react-native-async-storage/async-storage": resolve(root, "src/lib/web-storage.ts"),
  },
});

console.log(`build-portal-bundle: wrote ${OUT}`);
```

- [ ] **Step 3: Write the bundle smoke test**

This is not a vitest test — the artefact is a browser IIFE, so it is checked by evaluating it the way a browser would.

```js
// scripts/verify-bundle.mjs
/* Evaluate portal/app-data.js the way a browser would and assert the contract the
   portal pages depend on. Guards the bundle's shape; spec-figures.test.ts guards
   the numbers inside it. */
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const src = readFileSync("portal/app-data.js", "utf8");

// A browser-ish global: the IIFE assigns to `this`/globalThis, and the stores reach
// for localStorage on rehydrate.
const sandbox = { window: undefined, localStorage: undefined, console };
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
runInNewContext(src, sandbox);

const P = sandbox.Pamoja;
assert.ok(P, "the bundle must define a Pamoja global");

for (const name of [
  "strings", "clock", "MATCHES", "MATCH_LIVE", "ENTITLEMENTS", "generatePartners",
  "issuePass", "validityLabel", "countsByCategory", "buildRedemption", "recordLine",
  "totalSaved", "nextMatch", "matchLabel", "usePassStore", "useRecordStore",
]) {
  assert.ok(name in P, `Pamoja.${name} is missing from the bundle`);
}

// The figures must survive bundling, not just the names.
assert.equal(P.generatePartners().length, 2189, "Figure 3: the network totals 2,189");
assert.equal(P.MATCHES.length, 11, "the seed carries eleven matches");
assert.ok(P.clock.now() instanceof Date, "clock.now() must return a Date");

// The alias took: the RN storage package must not survive into the bundle. Asserted
// on the package specifier rather than on /react-native/i, which also matches comment
// prose and identifiers and would fail on a perfectly good bundle.
assert.ok(!src.includes("@react-native-async-storage"),
  "AsyncStorage must have been aliased away");

console.log("verify-bundle: ok — Pamoja exposes the portal contract");
```

- [ ] **Step 4: Wire it into the build and ignore the output**

Add to `package.json` `devDependencies`: `"esbuild": "^0.21.5"`. It is already in `node_modules` as a transitive dependency of Expo, so no install is needed — but a build that relies on a package no manifest names breaks the day its parent stops pulling it in.

Set these `scripts` entries:

```json
"build:portal-bundle": "node scripts/build-portal-bundle.mjs",
"build": "npm run build:portal-bundle && expo export --platform web --output-dir dist/app && node scripts/copy-portal.mjs && node scripts/inject-pwa.mjs",
"verify:bundle": "node scripts/verify-bundle.mjs"
```

The bundle is built **before** `copy-portal.mjs`, or the copy misses it.

Append to `.gitignore`:

```
portal/app-data.js
```

- [ ] **Step 5: Build and verify**

Run: `npm run build:portal-bundle && npm run verify:bundle`
Expected: `build-portal-bundle: wrote portal/app-data.js` then `verify-bundle: ok — Pamoja exposes the portal contract`.

If Step 5 fails with an unresolved `react-native` import, an entry in `src/portal-entry.ts` is reaching a module that is not RN-free. Find it with `npx esbuild --bundle src/portal-entry.ts --outfile=/dev/null --alias:@=./src 2>&1 | head`, and remove that export rather than shimming further — the boundary is the point.

- [ ] **Step 6: Confirm the full build still works end to end**

Run: `npm run build && ls dist/app-data.js dist/app/index.html`
Expected: both listed; the bundle reaches `dist/` through `copy-portal.mjs`.

- [ ] **Step 7: Commit**

```bash
git add src/portal-entry.ts scripts/build-portal-bundle.mjs scripts/verify-bundle.mjs package.json .gitignore
git commit -m "feat: bundle the app's data and logic for the portal"
```

---

### Task 3: The portal's state layer

**Files:**
- Create: `portal/state.js`

**Interfaces:**
- Consumes: `window.Pamoja` from Task 2.
- Produces: `window.PamojaState` with `ready(): Promise<void>`, `now()`, `pass()`, `ticket()`, `events()`, `issue({holderName, issuedIn})`, `redeem({partner, gross, channel})`, `methods()`, `chooseMethod(id)`, `reset()`, and `subscribe(fn)`. Tasks 4–9 call only these. There is no wallet reorder — the app has none.

- [ ] **Step 1: Write the state layer**

```js
// portal/state.js
/* The portal's state, over the app's stores.

   Multi-page HTML forgets everything on every navigation, so unlike the app — which
   hydrates once and keeps a live store in memory — each page here has to wait for
   rehydration before it renders. `ready()` is that wait, and every page awaits it
   before its first paint. Rendering first and correcting later would flash a Pass
   that says "no Pass" at a fan who has one.

   The stores are the app's own, reached through the bundle. Nothing is reimplemented
   here; this is a thin, page-shaped door onto them. */
(function (global) {
  "use strict";

  var P = global.Pamoja;
  if (!P) throw new Error("state.js loaded before app-data.js");

  var pass = P.usePassStore;
  var record = P.useRecordStore;
  var payment = P.usePaymentStore;

  /* Zustand's persist middleware rehydrates asynchronously. Each store sets its own
     `hydrated` flag in onRehydrateStorage; wait for all of them rather than racing
     the first. */
  function whenHydrated(store) {
    return new Promise(function (resolve) {
      if (store.getState().hydrated) return resolve();
      var stop = store.subscribe(function (s) {
        if (s.hydrated) { stop(); resolve(); }
      });
      // A store whose persisted key is absent still rehydrates, but if a browser
      // denies storage entirely the callback may never run. Do not hang the page.
      setTimeout(function () { stop(); resolve(); }, 1500);
    });
  }

  var readyPromise = null;

  var State = {
    ready: function () {
      if (!readyPromise) {
        readyPromise = Promise.all([
          whenHydrated(pass), whenHydrated(record), whenHydrated(payment),
        ]).then(function () {});
      }
      return readyPromise;
    },

    /* Always the demo clock unless the app has been switched to real time. Pages
       must not call new Date(): the seeded fixtures sit around 2027-06-23. */
    now: function () { return P.clock.now(); },

    pass: function () { return pass.getState().pass; },
    ticket: function () { return pass.getState().ticket; },
    events: function () { return record.getState().events; },

    issue: function (input) {
      pass.getState().issue(input);
      return pass.getState().pass;
    },

    /* Both redemption entry points — scanned, and card code read at the counter.
       The app offers no intermediate code-entry step and neither does the portal.

       The two do NOT converge on one store call. useRecordStore keeps `append` (a
       use that happened through the app) separate from `ingestShortCode` (a use
       that arrived inbound, where the fan never touched her phone), and its own
       comment says keeping them separate "is what makes the no-exclusion promise
       real". Collapsing them here would quietly undo that. */
    redeem: function (input) {
      var events = record.getState().events;
      var event = P.buildRedemption({
        pass: pass.getState().pass,
        partner: input.partner,
        gross: input.gross,
        channel: input.channel,          // "qr" | "nfc" | "shortcode"
        at: State.now(),
        seq: events.length,              // required: keeps event ids distinct
      });
      if (input.channel === "shortcode") record.getState().ingestShortCode(event);
      else record.getState().append(event);
      return event;
    },

    /* The wallet is a list of methods with one default — there is no ordering in
       the app, so there is none here. `choose` is the only thing that moves. */
    methods: function () { return payment.getState().methods; },
    chooseMethod: function (id) { payment.getState().choose(id); },

    reset: function () {
      pass.getState().reset();
      record.getState().clear();
    },

    /* Re-render on change, for the dialogs that mutate. */
    subscribe: function (fn) {
      var stops = [pass.subscribe(fn), record.subscribe(fn), payment.subscribe(fn)];
      return function () { stops.forEach(function (s) { s(); }); };
    },
  };

  global.PamojaState = State;
})(window);
```

- [ ] **Step 2: Confirm the store surface**

The code above was written against the stores as they actually are, after a scan that
found four mismatches in an earlier draft. Confirm it still holds:

Run: `grep -nE "append:|ingestShortCode:|clear:|choose:|methods:|hydrated:" src/store/useRecordStore.ts src/store/usePaymentStore.ts`
Run: `sed -n '13,22p' src/utils/redeem.ts`

Expected: `useRecordStore` exposes `events`, `append`, `ingestShortCode`, `clear`;
`usePaymentStore` exposes `methods`, `add`, `choose`, `forget`; all three stores expose
`hydrated`; `RedemptionInput` requires `pass`, `partner`, `gross`, `channel`, `at`, `seq`.

**If anything differs, correct `portal/state.js` to match the store — never the other
way round.** The stores are the app's and this task does not modify them.

- [ ] **Step 3: Commit**

```bash
git add portal/state.js
git commit -m "feat: give the portal a state layer over the app's stores"
```

---

### Task 4: The logged-in chrome

Five destinations need one navigation, one dialog treatment and one responsive rule, defined once.

**Files:**
- Create: `portal/app.css`
- Create: `portal/chrome.js`

**Interfaces:**
- Consumes: `portal.css` tokens; `window.PamojaState` from Task 3.
- Produces: `window.PamojaChrome.mount(activeId)` renders the five-item bar into `<nav class="tabbar">`; `window.PamojaChrome.dialog(id)` returns `{open(), close(), el}` for a `<dialog id>`; `window.PamojaChrome.esc(s)` HTML-escapes a value. Tasks 5–9 call all three.

- [ ] **Step 1: Write the chrome stylesheet**

```css
/* portal/app.css — the logged-in surface.
   Tokens, type and buttons all come from portal.css; this adds only what having an
   app inside the portal needs. The breakpoint is 860px, the portal's own, so the
   marketing page and these pages reflow together. */

.appmain { padding: 0 var(--pad-x) 96px; max-width: 1180px; margin: 0 auto; }

/* --- the five destinations ------------------------------------------------- */

.tabbar { display: none; }

@media (max-width: 860px) {
  /* On a phone the bar is the navigation, so it is fixed and the page is padded
     out from under it — including the safe area, or the last row sits beneath the
     home indicator on iOS. */
  .tabbar {
    position: fixed; inset: auto 0 0 0; z-index: 40;
    display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
    background: var(--canvas); border-top: 1px solid var(--hairline);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  .tabbar a {
    /* 44px is the floor Apple, Android and WCAG 2.5.5 agree on. */
    min-height: 44px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px;
    font-size: 11px; letter-spacing: 0.04em; text-decoration: none;
    color: var(--stone); padding: 8px 4px;
  }
  .tabbar a[aria-current="page"] { color: var(--accent); font-weight: 600; }
  .tabbar .tabbar-dot { width: 5px; height: 5px; border-radius: 999px; background: currentColor; opacity: 0; }
  .tabbar a[aria-current="page"] .tabbar-dot { opacity: 1; }
  .appmain { padding-bottom: calc(76px + env(safe-area-inset-bottom, 0)); }
  .nav-links { display: none; }
}

/* --- detail, as a dialog rather than a destination -------------------------- */

dialog.sheet {
  border: 0; padding: 0; background: var(--canvas); color: var(--ink);
  border-radius: 16px; max-width: 620px; width: calc(100% - 32px);
  box-shadow: 0 24px 64px rgba(10, 10, 10, 0.24);
}
dialog.sheet::backdrop { background: rgba(10, 10, 10, 0.44); }
.sheet-head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 20px 24px; border-bottom: 1px solid var(--hairline);
}
.sheet-body { padding: 24px; }
.sheet-close {
  min-width: 44px; min-height: 44px; border: 0; background: transparent;
  font-size: 22px; line-height: 1; color: var(--slate); cursor: pointer;
  border-radius: 999px;
}
.sheet-close:focus-visible { outline: 2px solid var(--accent-deep); outline-offset: 2px; }

@media (max-width: 860px) {
  /* A phone gets a bottom sheet, not a centred card: the thumb is at the bottom. */
  dialog.sheet {
    width: 100%; max-width: none; margin: 0 0 0 auto;
    position: fixed; inset: auto 0 0 0;
    border-radius: 16px 16px 0 0; max-height: 88dvh; overflow-y: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  dialog.sheet { animation: none; }
}
```

- [ ] **Step 2: Write the chrome script**

```js
// portal/chrome.js
/* The five destinations, and the dialog treatment that replaces the app's stacks.

   The app reaches its detail screens by pushing onto a stack; here they are dialogs
   on the parent page. That is the whole of "simpler to navigate": back never goes
   three deep, because there is nothing to go back through. */
(function (global) {
  "use strict";

  var TABS = [
    { id: "home",     href: "dashboard.html", label: "Home" },
    { id: "matches",  href: "matches.html",   label: "Matches" },
    { id: "live",     href: "live.html",      label: "Live" },
    { id: "partners", href: "partners.html",  label: "Partners" },
    { id: "pass",     href: "pass.html",      label: "Pass" },
  ];

  function mount(activeId) {
    var nav = document.querySelector("nav.tabbar");
    if (!nav) return;
    nav.setAttribute("aria-label", "Sections");
    nav.innerHTML = TABS.map(function (t) {
      var current = t.id === activeId ? ' aria-current="page"' : "";
      return '<a href="' + t.href + '"' + current + '>' +
             '<span class="tabbar-dot"></span>' + t.label + "</a>";
    }).join("");
  }

  /* Dialogs are <dialog> so the browser supplies the modal semantics — focus trap,
     Escape, inert background — rather than us reimplementing them badly. */
  function dialog(id) {
    var el = document.getElementById(id);
    if (!el) throw new Error("no dialog #" + id);
    var closer = el.querySelector(".sheet-close");
    if (closer) closer.addEventListener("click", function () { el.close(); });
    // Clicking the backdrop dismisses, matching the sheet gesture on a phone.
    el.addEventListener("click", function (e) { if (e.target === el) el.close(); });
    return {
      open: function () { el.showModal(); },
      close: function () { el.close(); },
      el: el,
    };
  }

  /* Escaping lives here rather than in each page script. Every page interpolates
     store data into innerHTML, so every page needs it; five copies of the same four
     replacements is five chances for one of them to be subtly different. */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  global.PamojaChrome = { mount: mount, dialog: dialog, esc: esc, TABS: TABS };
})(window);
```

- [ ] **Step 3: Commit**

```bash
git add portal/app.css portal/chrome.js
git commit -m "feat: add the portal's logged-in navigation and dialog chrome"
```

---

### Task 5: `pass.html` — Pass, Wallet, Payment method

Built first because it is the smallest of the five and proves the whole stack — bundle, state, chrome — before four more pages depend on it.

**Files:**
- Create: `portal/pass.html`
- Create: `portal/pages/pass.js`

**Interfaces:**
- Consumes: `Pamoja`, `PamojaState`, `PamojaChrome`.
- Produces: nothing other tasks consume.

- [ ] **Step 1: Write the page shell**

Open with the shell in *The page shell*, titled `Your Pass — Pamoja`. Then the body:

```html
<main class="appmain" id="page">
  <div class="dash-head">
    <div>
      <p class="eyebrow mono" id="clock"></p>
      <h1 style="margin-top:10px" id="greeting"></h1>
    </div>
    <span class="pill-tag" id="validity"></span>
  </div>

  <section class="panel" aria-labelledby="cred-h">
    <h2 id="cred-h">Your Pass</h2>
    <dl class="figure" id="credential"></dl>
    <button class="btn" id="open-wallet">Wallet and payment method</button>
  </section>

  <section class="panel" aria-labelledby="rec-h">
    <h2 id="rec-h">Your record</h2>
    <ul class="rowline" id="record"></ul>
    <p class="muted" id="record-totals"></p>
  </section>
</main>

<nav class="tabbar"></nav>

<dialog class="sheet" id="wallet">
  <div class="sheet-head">
    <h2 style="margin:0;font-size:20px">Wallet</h2>
    <button class="sheet-close" aria-label="Close">&times;</button>
  </div>
  <div class="sheet-body">
    <p class="muted">The default method is the one offered first at a counter.</p>
    <ul class="rowline" id="wallet-list"></ul>
  </div>
</dialog>

<script src="app-data.js"></script>
<script src="state.js"></script>
<script src="chrome.js"></script>
<script src="pages/pass.js"></script>
<script src="boot.js"></script>
```

- [ ] **Step 2: Write the page script**

```js
// portal/pages/pass.js
/* The Pass, the record and the wallet — the app's PassScreen, WalletScreen and
   PaymentMethodScreen on one page.

   Every value is read from the bundle. None is typed in: the serial, the holder,
   the validity and the record totals are the figures src/utils/spec-figures.test.ts
   holds as proposal specifications. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  var esc = C.esc;

  /* Money is formatted by the app's own kes() — exported through the bundle. A local
     helper here would be a second implementation of the same rule, and the obvious
     hand-written one gets it wrong: kes() renders en-US ("KES 1,000"), not en-KE. */
  var money = P.kes;

  function render() {
    var now = S.now();
    var pass = S.pass();
    var events = S.events();

    var parts = P.clock.eatParts(now.toISOString());
    document.getElementById("clock").textContent = parts.day + " · " + parts.time + " EAT";

    document.getElementById("greeting").textContent = pass
      ? "Karibu, " + pass.holderName.split(" ")[0] + "."
      : "No Pass on this device yet.";

    document.getElementById("validity").textContent = pass
      ? P.validityLabel(pass, now)
      : "Not issued";

    document.getElementById("credential").innerHTML = pass
      ? [
          ["Pass number", pass.shortCode],
          ["Holder", pass.holderName],
          ["Issued in", pass.issuedIn],
          ["Status", P.passStatus(pass, now)],
        ].map(function (row) {
          return "<dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd>";
        }).join("")
      : '<dd><a href="signup.html">Get your Pamoja Pass</a></dd>';

    document.getElementById("record").innerHTML = events.length
      ? events.map(function (e) {
          var line = P.recordLine(e);
          return "<li><strong>" + esc(line.primary) + "</strong><br>" +
                 '<span class="muted">' + esc(line.secondary) + "</span></li>";
        }).join("")
      : '<li class="muted">Nothing spent yet.</li>';

    document.getElementById("record-totals").textContent =
      money(P.totalSpent(events)) + " spent · " + money(P.totalSaved(events)) + " saved";

    renderWallet();
  }

  /* Choosing the default, not reordering.

     The app has no ordering: usePaymentStore is a list of methods with one marked
     default, moved by choose(id). A drag-to-reorder control here would offer a
     capability the product does not have. Radios say "one of these is the default"
     exactly, and are operable by keyboard and thumb without any drag affordance. */
  function renderWallet() {
    var methods = S.methods();
    var list = document.getElementById("wallet-list");

    if (!methods.length) {
      list.innerHTML = '<li class="muted">No payment method saved on this device.</li>';
      return;
    }

    list.innerHTML = methods.map(function (m, i) {
      var id = "method-" + i;
      return '<li><label for="' + id + '" style="display:flex;gap:12px;' +
        'align-items:center;min-height:44px">' +
        '<input type="radio" name="default-method" id="' + id + '" value="' +
        esc(m.id) + '"' + (m.isDefault ? " checked" : "") + ">" +
        "<span>" + esc(m.label) + "</span></label></li>";
    }).join("");

    Array.prototype.forEach.call(
      list.querySelectorAll('input[name="default-method"]'),
      function (r) {
        r.addEventListener("change", function () { S.chooseMethod(r.value); });
      }
    );
  }

  S.ready().then(function () {
    C.mount("pass");
    var wallet = C.dialog("wallet");
    document.getElementById("open-wallet").addEventListener("click", wallet.open);
    render();
    S.subscribe(render);
  });
})();
```

- [ ] **Step 3: Confirm the PaymentMethod fields**

`renderWallet` reads `m.id`, `m.isDefault` and `m.label`. Confirm those are the real
field names:

Run: `grep -n "PaymentMethod" -A10 src/types/index.ts | head -20`

Correct the page to match the type. Do not add fallbacks — use the real names.

- [ ] **Step 4: Verify in a browser**

Run: `npm run build:portal-bundle` then serve and open the page:

```bash
python3 -m http.server 8080 --directory portal
```

Open `http://localhost:8080/pass.html`. Expected: the greeting, a validity pill, and either the credential or a link to sign up; the Wallet button opens a sheet; with no method saved it says so rather than showing an empty list; no console errors. Wait for `[data-booting]` to clear before judging a blank page — that is the Mount Kenya curtain, not a failure.

- [ ] **Step 5: Commit**

```bash
git add portal/pass.html portal/pages/pass.js
git commit -m "feat: add the Pass, record and wallet to the portal"
```

---

### Task 6: `dashboard.html` — Home

Rewrites the existing 181-line static page so its figures come from the bundle instead of being typed in, and folds in Partner, Confirm, Getting There and Parking as dialogs.

**Files:**
- Modify: `portal/dashboard.html` (rewrite body; keep the shell)
- Create: `portal/pages/home.js`

**Interfaces:** consumes `Pamoja`, `PamojaState`, `PamojaChrome`. Produces nothing.

- [ ] **Step 1: Rewrite the body**

**Replace the file wholesale** with the shell in *The page shell*, titled `Your Pass — Pamoja`, plus the body below. Do not try to preserve the existing `<head>`: `dashboard.html` is the pre-plan prototype, it has no boot curtain, and its nav points at anchors that no longer describe the site. The body it currently carries is the hand-typed prototype this task exists to replace.

```html
<main class="appmain" id="page">
  <div class="dash-head">
    <div>
      <p class="eyebrow mono" id="clock"></p>
      <h1 style="margin-top:10px" id="greeting"></h1>
    </div>
    <span class="pill-tag" id="validity"></span>
  </div>

  <section class="panel" aria-labelledby="next-h">
    <h2 id="next-h">Your next match</h2>
    <div id="next-match"></div>
    <button class="btn btn-ghost" id="open-travel">Getting there</button>
    <button class="btn btn-ghost" id="open-parking">Parking</button>
  </section>

  <section class="panel" aria-labelledby="net-h">
    <h2 id="net-h">The network</h2>
    <ul class="rowline" id="categories"></ul>
    <p class="muted" id="network-total"></p>
  </section>

  <section class="panel" aria-labelledby="rec-h">
    <h2 id="rec-h">Recent</h2>
    <ul class="rowline" id="record"></ul>
  </section>
</main>

<nav class="tabbar"></nav>

<dialog class="sheet" id="travel">
  <div class="sheet-head"><h2 style="margin:0;font-size:20px">Getting there</h2>
    <button class="sheet-close" aria-label="Close">&times;</button></div>
  <div class="sheet-body"><ul class="rowline" id="travel-list"></ul></div>
</dialog>

<dialog class="sheet" id="parking">
  <div class="sheet-head"><h2 style="margin:0;font-size:20px">Parking</h2>
    <button class="sheet-close" aria-label="Close">&times;</button></div>
  <div class="sheet-body"><ul class="rowline" id="parking-list"></ul></div>
</dialog>

<script src="app-data.js"></script>
<script src="state.js"></script>
<script src="chrome.js"></script>
<script src="pages/home.js"></script>
<script src="boot.js"></script>
```

Delete the HTML comment block that promises hand-copied figures — it is no longer true, and Task 10 replaces it with one that is.

- [ ] **Step 2: Write the page script**

```js
// portal/pages/home.js
/* Home: the next match, the network and what has been spent.
   The app's HomeScreen, with Partner, Confirm, Getting There and Parking folded in
   as dialogs rather than pushes. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  var esc = C.esc;

  function render() {
    var now = S.now(), pass = S.pass(), events = S.events();
    var parts = P.clock.eatParts(now.toISOString());
    document.getElementById("clock").textContent = parts.day + " · " + parts.time + " EAT";
    document.getElementById("greeting").textContent = pass
      ? "Karibu, " + pass.holderName.split(" ")[0] + "."
      : "Karibu.";
    document.getElementById("validity").textContent = pass ? P.validityLabel(pass, now) : "No Pass yet";

    var next = P.nextMatch(P.MATCHES, now);
    document.getElementById("next-match").innerHTML = next
      ? "<p><strong>" + esc(P.matchLabel(next)) + "</strong></p>" +
        "<p>" + esc(P.kickoffLabel(next)) + " · " + esc(P.daysUntilLabel(next, now)) + "</p>" +
        '<p class="muted">' + esc(P.gatesOpenLabel(next)) + "</p>"
      : '<p class="muted">No fixture ahead of the demo clock.</p>';

    var partners = P.generatePartners();
    var counts = P.countsByCategory(partners);
    document.getElementById("categories").innerHTML = P.CATEGORIES.map(function (c) {
      return "<li>" + esc(P.CATEGORY_LABEL[c]) + " <strong>" +
             (counts[c] || 0).toLocaleString("en-US") + "</strong></li>";
    }).join("");
    document.getElementById("network-total").textContent =
      partners.length.toLocaleString("en-US") + " partners across three countries";

    document.getElementById("record").innerHTML = events.length
      ? events.slice(0, 3).map(function (e) {
          var l = P.recordLine(e);
          return "<li><strong>" + esc(l.primary) + "</strong><br>" +
                 '<span class="muted">' + esc(l.secondary) + "</span></li>";
        }).join("")
      : '<li class="muted">Nothing spent yet.</li>';

    document.getElementById("travel-list").innerHTML =
      P.EXPLORE_ITEMS.slice(0, 8).map(function (i) {
        return "<li>" + esc(i.title || i.name) + "</li>";
      }).join("");

    document.getElementById("parking-list").innerHTML =
      P.PARKING_ZONES.map(function (z) {
        return "<li>" + esc(z.name) + "</li>";
      }).join("");
  }

  S.ready().then(function () {
    C.mount("home");
    var travel = C.dialog("travel"), parking = C.dialog("parking");
    document.getElementById("open-travel").addEventListener("click", travel.open);
    document.getElementById("open-parking").addEventListener("click", parking.open);
    render();
    S.subscribe(render);
  });
})();
```

- [ ] **Step 3: Reconcile the field names**

`EXPLORE_ITEMS` and `PARKING_ZONES` are read above for `.title`/`.name`. Confirm the real fields:

Run: `sed -n '1,20p' src/data/explore.ts src/data/parking.ts`

Fix `portal/pages/home.js` to use the actual property names. Do not add fallbacks like `i.title || i.name` to the committed code once the real name is known — pick the right one.

- [ ] **Step 4: Verify and commit**

Serve `portal/`, open `dashboard.html`, confirm 2,189 appears in the network total, both dialogs open, no console errors.

```bash
git add portal/dashboard.html portal/pages/home.js
git commit -m "feat: drive the portal dashboard from the app's own figures"
```

---

### Task 7: `matches.html` — Matches, Fixture, Ticket office, Safety

**Files:**
- Create: `portal/matches.html`
- Create: `portal/pages/matches.js`

- [ ] **Step 1: Write the shell**

Open with the shell in *The page shell*, titled `Matches — Pamoja`. Then the body:

```html
<main class="appmain" id="page">
  <div class="dash-head"><h1>Matches</h1><span class="pill-tag" id="count"></span></div>
  <section class="panel"><ul class="rowline" id="fixtures"></ul></section>
</main>
<nav class="tabbar"></nav>
<dialog class="sheet" id="fixture">
  <div class="sheet-head"><h2 style="margin:0;font-size:20px" id="fixture-title"></h2>
    <button class="sheet-close" aria-label="Close">&times;</button></div>
  <div class="sheet-body" id="fixture-body"></div>
</dialog>
<script src="app-data.js"></script><script src="state.js"></script>
<script src="chrome.js"></script><script src="pages/matches.js"></script>
<script src="boot.js"></script>
```

- [ ] **Step 2: Write the page script**

```js
// portal/pages/matches.js
/* Every fixture, not a seven-day window.
   The app's Explore list is capped to seven days of the demo clock, which is why
   seven of eleven fixtures were once unreachable (see the 2026-08-19 IA spec). This
   page lists all of MATCHES deliberately. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  var esc = C.esc;

  var sheet;

  function openFixture(match) {
    var now = S.now();
    document.getElementById("fixture-title").textContent = P.matchLabel(match);
    document.getElementById("fixture-body").innerHTML =
      "<p>" + esc(P.kickoffLabel(match)) + "</p>" +
      "<p>" + esc(P.gatesOpenLabel(match)) + "</p>" +
      '<p class="muted">' + esc(P.minuteLabel(match, now)) + "</p>" +
      '<p class="prototype">Ticket office and safety information are seeded, ' +
      "not live.</p>";
    sheet.open();
  }

  function render() {
    var now = S.now();
    var all = P.MATCHES;
    document.getElementById("count").textContent = all.length + " matches";
    var list = document.getElementById("fixtures");
    list.innerHTML = all.map(function (m, i) {
      return '<li><button class="btn btn-ghost" data-i="' + i + '" ' +
             'style="min-height:44px;width:100%;text-align:left">' +
             "<strong>" + esc(P.matchLabel(m)) + "</strong> · " +
             esc(P.kickoffChipLabel(m)) + " · " + esc(P.matchPhase(m, now)) +
             "</button></li>";
    }).join("");
    Array.prototype.forEach.call(list.querySelectorAll("button[data-i]"), function (b) {
      b.addEventListener("click", function () { openFixture(all[Number(b.dataset.i)]); });
    });
  }

  S.ready().then(function () {
    C.mount("matches");
    sheet = C.dialog("fixture");
    render();
  });
})();
```

- [ ] **Step 3: Verify and commit**

Open `matches.html`. Expected: 11 fixtures listed (not five, not seven-day-filtered); clicking one opens the sheet.

```bash
git add portal/matches.html portal/pages/matches.js
git commit -m "feat: list every fixture on the portal"
```

---

### Task 8: `live.html` — Live

**Files:**
- Create: `portal/live.html`
- Create: `portal/pages/live.js`

- [ ] **Step 1: Write the shell**

Open with the shell in *The page shell*, titled `Live — Pamoja`. Then the body:

```html
<main class="appmain" id="page">
  <div class="dash-head"><h1>Live</h1><span class="pill-tag" id="state"></span></div>
  <section class="panel" id="live-body"></section>
</main>
<nav class="tabbar"></nav>
<script src="app-data.js"></script><script src="state.js"></script>
<script src="chrome.js"></script><script src="pages/live.js"></script>
<script src="boot.js"></script>
```

- [ ] **Step 2: Write the page script**

```js
// portal/pages/live.js
/* What is happening now, on the demo clock. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  var esc = C.esc;

  function render() {
    var now = S.now();
    var live = P.liveMatches(P.MATCHES, now);
    document.getElementById("state").textContent = live.length ? "Live now" : "Nothing live";
    document.getElementById("live-body").innerHTML = live.length
      ? live.map(function (m) {
          return "<p><strong>" + esc(P.matchLabel(m)) + "</strong> · " +
                 esc(P.minuteLabel(m, now)) + "</p>";
        }).join("")
      : (function () {
          var next = P.nextMatch(P.MATCHES, now);
          return next
            ? '<p class="muted">Next: ' + esc(P.matchLabel(next)) + " · " +
              esc(P.daysUntilLabel(next, now)) + "</p>"
            : '<p class="muted">The tournament is over on this clock.</p>';
        })();
  }

  S.ready().then(function () { C.mount("live"); render(); });
})();
```

- [ ] **Step 3: Verify and commit**

```bash
git add portal/live.html portal/pages/live.js
git commit -m "feat: add the live page to the portal"
```

---

### Task 9: `partners.html` — Partners, Category, Partner, redeem

The only page with a mutating flow, so it carries the redemption dialog.

**Files:**
- Create: `portal/partners.html`
- Create: `portal/pages/partners.js`

- [ ] **Step 1: Write the shell**

Open with the shell in *The page shell*, titled `Partners — Pamoja`. Then the body:

```html
<main class="appmain" id="page">
  <div class="dash-head"><h1>Partners</h1><span class="pill-tag" id="total"></span></div>
  <section class="panel"><ul class="rowline" id="categories"></ul></section>
  <section class="panel" aria-labelledby="near-h">
    <h2 id="near-h">Nearby</h2>
    <ul class="rowline" id="nearby"></ul>
  </section>
</main>
<nav class="tabbar"></nav>
<dialog class="sheet" id="redeem">
  <div class="sheet-head"><h2 style="margin:0;font-size:20px" id="redeem-title"></h2>
    <button class="sheet-close" aria-label="Close">&times;</button></div>
  <div class="sheet-body">
    <p class="muted">Pamoja never holds your money — this is a direct hand-off.</p>
    <label for="gross">Amount (KES)</label>
    <input id="gross" type="number" inputmode="numeric" value="1000" min="0"
           style="min-height:44px;width:100%">
    <!-- 1000 matches the app's own prefill (ConfirmScreen.tsx:36, a screen-local
         useState literal rather than a shared constant, so there is nothing in
         src/ to read it from). -->
    <p id="redeem-preview"></p>
    <button class="btn" id="confirm-redeem" style="min-height:44px">Confirm</button>
  </div>
</dialog>
<script src="app-data.js"></script><script src="state.js"></script>
<script src="chrome.js"></script><script src="pages/partners.js"></script>
<script src="boot.js"></script>
```

- [ ] **Step 2: Write the page script**

```js
// portal/pages/partners.js
/* The network, and the one flow on the portal that really changes state.

   The app offers two entry points — scanned, and card code read at the counter —
   and both go straight to Confirm with the gross pre-filled at 1,000. There is no
   intermediate code-entry step in the app and there is none here; only the channel
   label differs. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  /* The app's own formatter, through the bundle — see Task 5. Do not hand-write one:
     kes() is en-US, and a local copy reliably guesses en-KE. */
  var money = P.kes;

  var sheet, current = null;

  function preview() {
    var gross = Number(document.getElementById("gross").value || 0);
    var m = P.computeMoney(gross, current ? current.discountPct : 0);
    document.getElementById("redeem-preview").textContent =
      money(m.net) + " to pay · " + money(m.saved) + " saved";
  }

  function openRedeem(partner) {
    current = partner;
    document.getElementById("redeem-title").textContent = partner.name;
    document.getElementById("gross").value = 1000;
    preview();
    sheet.open();
  }

  function render() {
    var partners = P.generatePartners();
    var counts = P.countsByCategory(partners);
    document.getElementById("total").textContent =
      partners.length.toLocaleString("en-US") + " partners";
    document.getElementById("categories").innerHTML = P.CATEGORIES.map(function (c) {
      return "<li>" + esc(P.CATEGORY_LABEL[c]) + " <strong>" +
             (counts[c] || 0).toLocaleString("en-US") + "</strong></li>";
    }).join("");

    var near = P.NAMED_PARTNERS.slice(0, 8);
    var list = document.getElementById("nearby");
    list.innerHTML = near.map(function (p, i) {
      return '<li><button class="btn btn-ghost" data-i="' + i + '" ' +
             'style="min-height:44px;width:100%;text-align:left">' +
             "<strong>" + esc(p.name) + "</strong> · " + esc(p.discountPct) +
             "% off</button></li>";
    }).join("");
    Array.prototype.forEach.call(list.querySelectorAll("button[data-i]"), function (b) {
      b.addEventListener("click", function () { openRedeem(near[Number(b.dataset.i)]); });
    });
  }

  S.ready().then(function () {
    C.mount("partners");
    sheet = C.dialog("redeem");
    document.getElementById("gross").addEventListener("input", preview);
    document.getElementById("confirm-redeem").addEventListener("click", function () {
      if (!S.pass()) { window.location.href = "signup.html"; return; }
      S.redeem({
        partner: current,
        gross: Number(document.getElementById("gross").value || 0),
        // Channel is "nfc" | "qr" | "shortcode". This sheet is the counter path —
        // the fan reads her card code aloud — so it is shortcode, which state.js
        // routes through ingestShortCode rather than append.
        channel: "shortcode",
      });
      sheet.close();
    });
    render();
    S.subscribe(render);
  });
})();
```

- [ ] **Step 3: Reconcile against `buildRedemption`**

Run: `sed -n '1,40p' src/utils/redeem.ts`

`computeMoney` returns `Money` — `{ currency, gross, discount, net }`. There is no
`saved` field, so `preview()` above is wrong: it must read `m.discount`, not `m.saved`.
Fix it. Then confirm `Partner` really carries `discountPct` and `name`, and that
`RedemptionInput` still takes `pass`, `partner`, `gross`, `channel`, `at`, `seq`.
Correct the page to match `src/`, never the reverse.

- [ ] **Step 4: Verify and commit**

Open `partners.html`. Expected: total reads 2,189; a nearby partner opens the sheet; confirming with a Pass present adds a line visible on `pass.html`. Without a Pass it redirects to sign-up rather than erroring.

```bash
git add portal/partners.html portal/pages/partners.js
git commit -m "feat: add the partner network and redemption to the portal"
```

---

### Task 10: Wire the pages together and correct the README

**Files:**
- Modify: `portal/login.html`, `portal/signup.html` (nav + destination)
- Modify: `portal/index.html` (nav "Log in" and the two CTAs)
- Modify: `portal/README.md`

- [ ] **Step 1: Make sign-up actually issue the Pass**

The spec lists issuing a Pass as one of the four flows that really works, but
`signup.html` currently just navigates: `action="dashboard.html" method="get"`, and no
Pass is ever created, so every logged-in page renders its empty state forever.

Keep the form a `get` to `dashboard.html` — Rev. 2 §05 and the no-auth rule both hold —
but issue the Pass before letting the navigation happen. Add to `portal/signup.html`,
after the shell's scripts:

```html
<script src="app-data.js"></script>
<script src="state.js"></script>
<script>
/* The three questions the app asks, answered here, issuing the same Pass the app
   would issue — issuePass() is the app's, so the serial is the app's (KE-PM-8842
   for the first on a device, per Figure 1). The form still navigates by GET; this
   only makes sure there is something to navigate to. */
document.querySelector("form").addEventListener("submit", function (e) {
  var data = new FormData(e.target);
  var holderName = String(data.get("name") || "").trim();
  var issuedIn = String(data.get("country") || "KE");
  if (!holderName) return;               // let the browser's own validation speak
  e.preventDefault();
  window.PamojaState.ready().then(function () {
    window.PamojaState.issue({ holderName: holderName, issuedIn: issuedIn });
    window.location.href = "dashboard.html";
  });
});
</script>
```

Confirm the field `name` attributes in `portal/signup.html` match what this reads
(`name`, `country`) and that the country values are the `HostCountry` codes
`issuePass` expects — check with `grep -n "HostCountry" src/types/*.ts`. Correct the
script to the form, or the form to the codes, whichever is wrong.

- [ ] **Step 2: Point the marketing nav at the five pages**

In `portal/index.html`, `login.html` and `signup.html`, replace the `.nav-links` block's `dashboard.html`-and-anchors set with links that still make sense from a marketing page, and leave the five-destination bar to the logged-in pages only. `login.html` keeps `action="dashboard.html" method="get"` unchanged — logging in finds a Pass that sign-up created, or shows the empty state.

- [ ] **Step 3: Correct the README**

Two claims in `portal/README.md` are now false and must be rewritten, not deleted:

- "**A single static page**: `index.html` plus `img/`. No build step, no dependencies, nothing imported from the app." — the portal now has a build step (`build:portal-bundle`), one dependency (esbuild) and a deliberate import surface (`src/portal-entry.ts`).
- The "**Not wired into deployment**" section — the portal is the domain root; the app is at `/app`.

Add a short section stating the new boundary: markup is the portal's, figures and logic are the app's, `src/portal-entry.ts` is the whole of what crosses, and `spec-figures.test.ts` now guards both surfaces.

Update the "Pages" table with the five logged-in pages, and the "Still to do" list, which currently says nothing sits behind "Log in".

- [ ] **Step 4: Commit**

```bash
git add portal/index.html portal/login.html portal/signup.html portal/README.md
git commit -m "docs: describe the portal's new boundary with the app"
```

---

### Task 11: Verify the five pages in a browser

**Files:**
- Create: `scripts/verify-portal.mjs`
- Modify: `package.json` (add `verify:portal`)

- [ ] **Step 1: Write the verification script**

```js
// scripts/verify-portal.mjs
/* Drive the logged-in portal at both widths and check what the spec promises.
   Figures are read out of the DOM and compared against what the shared modules
   compute — never against literals here, which would only be a third copy of the
   same numbers. */
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

// Playwright is not a project dependency; it is reachable through npx. Point
// PLAYWRIGHT_MODULE at an absolute path if the bare specifier does not resolve.
const spec = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = await import(spec).catch(() => {
  console.error(
    `verify-portal: cannot import "${spec}".\n` +
    `Set PLAYWRIGHT_MODULE to an absolute path, e.g.\n` +
    `  PLAYWRIGHT_MODULE=$(npm root -g)/playwright/index.mjs npm run verify:portal`
  );
  process.exit(1);
});

const PORT = 8090;
const server = spawn("python3", ["-m", "http.server", String(PORT), "--directory", "portal"],
  { stdio: "ignore" });
const stop = () => { try { server.kill(); } catch {} };
process.on("exit", stop);

// Give the static server a moment without a bare sleep in the shell.
await new Promise((r) => setTimeout(r, 700));

const PAGES = [
  { file: "dashboard.html", tab: "home" },
  { file: "matches.html", tab: "matches" },
  { file: "live.html", tab: "live" },
  { file: "partners.html", tab: "partners" },
  { file: "pass.html", tab: "pass" },
];
const WIDTHS = [
  { w: 420, h: 900, phone: true },
  { w: 1280, h: 900, phone: false },
];

const browser = await chromium.launch();
let failures = 0;

for (const { w, h, phone } of WIDTHS) {
  for (const { file, tab } of PAGES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));

    await page.goto(`http://localhost:${PORT}/${file}`, { waitUntil: "load" });
    // boot.js holds a curtain until load + the ridge finishes drawing; without this
    // every assertion runs against the Mount Kenya motif instead of the page.
    await page.waitForFunction(
      () => !document.documentElement.hasAttribute("data-booting"), { timeout: 20000 }
    ).catch(() => {});

    const label = `${file} @ ${w}px`;
    try {
      assert.equal(errs.length, 0, `console errors: ${errs.join(" | ")}`);

      const current = await page.getAttribute(`nav.tabbar a[aria-current="page"]`, "href");
      assert.ok(current, "the active destination must be marked aria-current");

      if (phone) {
        const box = await page.locator("nav.tabbar").boundingBox();
        assert.ok(box && box.height >= 44, "the bar must clear the 44px touch floor");
        const links = await page.locator("nav.tabbar a").count();
        assert.equal(links, 5, "five destinations");
      }

      // Every <dialog> opens and dismisses.
      const ids = await page.locator("dialog.sheet").evaluateAll(
        (els) => els.map((e) => e.id));
      for (const id of ids) {
        await page.evaluate((i) => document.getElementById(i).showModal(), id);
        assert.ok(await page.locator(`#${id}`).isVisible(), `#${id} must open`);
        await page.keyboard.press("Escape");
      }

      // Figures, read from the DOM, compared against the bundle's own computation.
      if (file === "partners.html" || file === "dashboard.html") {
        const expected = await page.evaluate(
          () => window.Pamoja.generatePartners().length.toLocaleString("en-US"));
        const body = await page.innerText("body");
        assert.ok(body.includes(expected),
          `the network total (${expected}) must appear on the page`);
      }

      console.log(`  ok   ${label}`);
    } catch (e) {
      failures++;
      console.error(`  FAIL ${label}: ${e.message}`);
    }
    await page.close();
  }
}

await browser.close();
stop();
console.log(failures ? `\nverify-portal: ${failures} failing` : "\nverify-portal: all pages ok");
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Add the script**

In `package.json` `scripts`: `"verify:portal": "npm run build:portal-bundle && node scripts/verify-portal.mjs"`.

- [ ] **Step 3: Run it**

Run: `npm run verify:portal`
Expected: ten `ok` lines (five pages × two widths) and `verify-portal: all pages ok`.

- [ ] **Step 4: Run everything**

Run: `npm test && npm run verify:bundle && npm run verify:portal && npm run build`
Expected: 252 vitest tests pass; both verifiers pass; the build writes `dist/index.html`, `dist/app-data.js` and `dist/app/index.html`.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-portal.mjs package.json
git commit -m "test: drive the portal's five pages at both widths"
```
