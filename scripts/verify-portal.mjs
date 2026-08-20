// Drive the logged-in portal's five pages in a real browser and check what the
// spec promises.
//
// This harness exists to survive a visual redesign. A restyle is free to change
// every colour, typeface, spacing and layout on these pages, and none of that may
// turn this suite red — so nothing here asserts appearance. What it asserts is
// structure (the five destinations exist, the right one is marked current, each
// declared dialog opens and closes), behaviour (no console or page errors) and
// data (the figures rendered into the DOM equal what the shared modules compute).
//
// Figures are never written down here. Every expected number is evaluated inside
// the page against `window.Pamoja` — the same bundle the page itself read it from.
// A literal 2189 in this file would only be a third copy of a fact that already
// lives in src/data and in spec-figures.test.ts, and the copy would be the thing
// that rots.
//
// Two browsing states are covered, not one. A fresh profile has no Pass, no
// record and no payment method, so every page renders its empty branch — a real,
// reachable surface. But the populated branch is where the figures actually exist
// to be checked, and the two run different code in home.js, pass.js and
// partners.js. A harness that only ever saw the empty branch would wave a
// redesign through even if it had silently broken the other half.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

// Playwright is deliberately not a project dependency: a browser download has no
// business in the install of an Expo app, and this is the only thing in the repo
// that wants one. It is reached in whichever of three ways is available, in order
// of how explicit each is.
//
//   1. PLAYWRIGHT_MODULE, an absolute path, which always wins. This is the escape
//      hatch that keeps the script from being tied to any one machine.
//   2. The bare specifier, for anyone who has it installed properly.
//   3. npx's own cache. `npx playwright` unpacks into a content-addressed
//      directory under ~/.npm/_npx/<hash>/, so scanning that directory finds a
//      copy that a developer already has without naming the hash — which differs
//      per machine — anywhere in this file.
//
// On the machine this harness was built on, (3) resolves to
//   /home/mbeche/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs
function playwrightCandidates() {
  const found = [];
  if (process.env.PLAYWRIGHT_MODULE) found.push(process.env.PLAYWRIGHT_MODULE);
  found.push("playwright");
  const cache = join(homedir(), ".npm", "_npx");
  try {
    for (const hash of readdirSync(cache)) {
      const entry = join(cache, hash, "node_modules", "playwright", "index.mjs");
      if (existsSync(entry)) found.push(entry);
    }
  } catch { /* no npx cache on this machine */ }
  return found;
}

async function loadPlaywright() {
  const tried = [];
  for (const candidate of playwrightCandidates()) {
    try {
      return await import(candidate);
    } catch (e) {
      tried.push(`  ${candidate}\n    ${e.message.split("\n")[0]}`);
    }
  }
  console.error(
    "verify-portal: could not load Playwright. Tried:\n" + tried.join("\n") + "\n" +
    "Install it (npx playwright install chromium) or point PLAYWRIGHT_MODULE at a copy, e.g.\n" +
    "  PLAYWRIGHT_MODULE=/home/mbeche/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs npm run verify:portal"
  );
  process.exit(1);
}

const { chromium } = await loadPlaywright();

// ---------------------------------------------------------------------------
// The static server
// ---------------------------------------------------------------------------

// Resolved from this file rather than from cwd: the script must behave the same
// whether npm runs it from the repo root or someone runs it from scripts/.
const PORTAL_DIR = fileURLToPath(new URL("../portal", import.meta.url));
const PORT = Number(process.env.PORTAL_PORT || 8090);
const ORIGIN = `http://127.0.0.1:${PORT}`;

const server = spawn(
  "python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", PORTAL_DIR],
  { stdio: "ignore" }
);
// Kill by the PID this process spawned, never by name: a "pkill -f http.server"
// also matches the invoking shell's own command line on some systems and takes
// the whole run down with the server.
let stopped = false;
const stop = () => {
  if (stopped) return;
  stopped = true;
  try { server.kill("SIGTERM"); } catch { /* already gone */ }
};
process.on("exit", stop);

// Poll for the first successful response rather than sleeping a guessed number of
// milliseconds. A fixed sleep is either too short on a loaded machine — which
// shows up as a mystery connection-refused — or wasted time on an idle one.
async function waitForServer(deadlineMs = 15000) {
  const until = Date.now() + deadlineMs;
  for (;;) {
    try {
      const res = await fetch(`${ORIGIN}/dashboard.html`, { method: "HEAD" });
      if (res.ok) return;
    } catch { /* not listening yet */ }
    if (Date.now() > until) {
      throw new Error(
        `the static server never answered on ${ORIGIN}. ` +
        `If port ${PORT} is already taken, set PORTAL_PORT to a free one.`
      );
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

// ---------------------------------------------------------------------------
// What each page is expected to offer
// ---------------------------------------------------------------------------

// `dialogs` is the complete set for each page, declared rather than discovered,
// so that the count is asserted in both directions: a page that quietly loses a
// dialog fails, and so does one that grows an undeclared one. live.html has none
// on purpose — the loop must tolerate zero, not assume at least one.
//
// `rendered` names one element the page's own script fills from the bundle. It is
// the signal that hydration finished and the first paint happened. The tab bar
// cannot be that signal any more: chrome.js needs nothing from the bundle and now
// mounts before the state gate, precisely so a page with no app-data.js is still
// navigable — which means a mounted tab bar no longer says anything about whether
// the figures have arrived.
const PAGES = [
  {
    file: "dashboard.html",
    rendered: "#clock",
    dialogs: [
      { id: "travel", trigger: "#open-travel" },
      { id: "parking", trigger: "#open-parking" },
    ],
  },
  { file: "matches.html", rendered: "#fixtures li",
    dialogs: [{ id: "fixture", trigger: '#fixtures button[data-i="0"]' }] },
  { file: "live.html", rendered: "#state", dialogs: [] },
  { file: "partners.html", rendered: "#nearby li",
    dialogs: [{ id: "redeem", trigger: '#nearby button[data-i="0"]' }] },
  { file: "pass.html", rendered: "#record li",
    dialogs: [{ id: "wallet", trigger: "#open-wallet" }] },
];

// Both the phone width the tab bar is built for and a desktop width where the tab
// bar is hidden and the header carries the same five destinations. Nothing below
// measures either viewport — the widths exist to run two layout branches of the
// page's own CSS, not to be asserted against.
const WIDTHS = [
  { w: 420, h: 900 },
  { w: 1280, h: 900 },
];

const CLICK_MS = 5000;

const STATES = [
  { name: "empty", populated: false },
  { name: "populated", populated: true },
];

// ---------------------------------------------------------------------------
// Data probes
// ---------------------------------------------------------------------------

// Each probe runs inside the page and returns rows of
//   [what, relation, actual-from-the-DOM, expected-from-the-bundle]
// so that both halves of every comparison are produced in the same place: the DOM
// on one side, `window.Pamoja` on the other, and nothing typed in this file.
//
// Probes read `textContent`, never `innerText`. innerText returns text as rendered
// — uppercased by text-transform, collapsed by display:none — and a redesign is
// entitled to change all of that. textContent is the content itself.
const PROBES = {
  "dashboard.html": () => {
    const P = window.Pamoja, S = window.PamojaState;
    const text = (sel) => (document.querySelector(sel)?.textContent ?? "").trim();
    const rows = [];
    const now = S.now(), pass = S.pass(), events = S.events();
    const partners = P.generatePartners();
    const counts = P.countsByCategory(partners);

    rows.push(["the demo clock", "contains", text("#clock"), P.clock.eatParts(now.toISOString()).time]);
    rows.push(["the network total", "contains", text("#network-total"),
      partners.length.toLocaleString("en-US")]);
    rows.push(["one row per category", "equals",
      String(document.querySelectorAll("#categories li").length), String(P.CATEGORIES.length)]);
    for (const c of P.CATEGORIES) {
      rows.push([`the ${c} count`, "contains", text("#categories"),
        (counts[c] || 0).toLocaleString("en-US")]);
    }

    const next = P.nextMatch(P.MATCHES, now);
    if (next) rows.push(["the next fixture", "contains", text("#next-match"), P.matchLabel(next)]);

    if (pass) {
      rows.push(["the validity label", "contains", text("#validity"),
        P.validityLabel(pass, now)]);
    } else {
      // There is no bundle-computed label to compare against on a device with no
      // Pass, and `contains ""` is a check that cannot fail. What the empty branch
      // actually promises is that the slot still says something rather than
      // sitting blank, so that is what is asserted.
      rows.push(["a validity line with no Pass", "equals",
        String(text("#validity").length > 0), "true"]);
    }
    if (events.length) {
      // useRecordStore appends, so the LAST element is the newest use, and a
      // heading that says "Recent" has to lead with it. Read the first row rather
      // than the whole list: a list that merely contains the newest somewhere
      // would still pass while rendering oldest-first.
      const first = (document.querySelector("#record li")?.textContent ?? "").trim();
      rows.push(["the newest redemption leads the record", "contains", first,
        P.recordLine(events[events.length - 1]).primary]);
      rows.push(["the recent list is capped", "equals",
        String(document.querySelectorAll("#record li").length <= 3), "true"]);
    }
    // A greeting that names somebody on a device with no Pass, or one that does
    // not name the holder on a device with one, is the empty/populated branch
    // going wrong — checked without quoting either branch's wording.
    rows.push(["the greeting names the holder only when there is one", "equals",
      String(pass ? text("#greeting").includes(pass.holderName.split(" ")[0]) : text("#greeting").length > 0),
      "true"]);
    return rows;
  },

  "matches.html": () => {
    const P = window.Pamoja;
    const text = (sel) => (document.querySelector(sel)?.textContent ?? "").trim();
    const rows = [];
    // This page lists every fixture rather than the app's seven-day window, so the
    // count on it is MATCHES.length itself — read from the bundle, never the 11.
    rows.push(["the fixture count", "contains", text("#count"), String(P.MATCHES.length)]);
    rows.push(["one row per fixture", "equals",
      String(document.querySelectorAll("#fixtures li").length), String(P.MATCHES.length)]);
    const listed = text("#fixtures");
    for (const m of P.MATCHES) {
      rows.push([`the fixture ${P.matchLabel(m)}`, "contains", listed, P.matchLabel(m)]);
    }
    return rows;
  },

  "live.html": () => {
    const P = window.Pamoja, S = window.PamojaState;
    const text = (sel) => (document.querySelector(sel)?.textContent ?? "").trim();
    const rows = [];
    const now = S.now();
    const live = P.liveMatches(P.MATCHES, now);
    rows.push(["a state line", "equals", String(text("#state").length > 0), "true"]);
    if (live.length) {
      for (const m of live) rows.push([`the live fixture ${P.matchLabel(m)}`, "contains",
        text("#live-body"), P.matchLabel(m)]);
    } else {
      const next = P.nextMatch(P.MATCHES, now);
      if (next) {
        // With nothing live the page falls back to naming the next fixture.
        rows.push(["the fallback line", "contains", text("#live-body"),
          P.matchLabel(next)]);
      } else {
        // Past the last fixture there is no fixture to name, only the
        // tournament-is-over line — and `contains ""` is a check that cannot fail.
        // What is promised here is that the body still says something.
        rows.push(["a body line past the last fixture", "equals",
          String(text("#live-body").length > 0), "true"]);
      }
    }
    return rows;
  },

  "partners.html": () => {
    const P = window.Pamoja;
    const text = (sel) => (document.querySelector(sel)?.textContent ?? "").trim();
    const rows = [];
    const partners = P.generatePartners();
    const counts = P.countsByCategory(partners);
    rows.push(["the network total", "contains", text("#total"),
      partners.length.toLocaleString("en-US")]);
    rows.push(["one row per category", "equals",
      String(document.querySelectorAll("#categories li").length), String(P.CATEGORIES.length)]);
    for (const c of P.CATEGORIES) {
      rows.push([`the ${c} count`, "contains", text("#categories"),
        (counts[c] || 0).toLocaleString("en-US")]);
    }
    // The nearby list is a slice of NAMED_PARTNERS; its length is whatever the page
    // chose, so assert that every row shown is a real named partner rather than
    // repeating the page's own slice size here.
    const shown = document.querySelectorAll("#nearby li").length;
    rows.push(["a non-empty nearby list", "equals", String(shown > 0), "true"]);
    rows.push(["nearby rows are named partners", "equals",
      String(shown <= P.NAMED_PARTNERS.length), "true"]);
    const near = text("#nearby");
    for (const p of P.NAMED_PARTNERS.slice(0, shown)) {
      rows.push([`the partner ${p.name}`, "contains", near, p.name]);
    }
    return rows;
  },

  "pass.html": () => {
    const P = window.Pamoja, S = window.PamojaState;
    const text = (sel) => (document.querySelector(sel)?.textContent ?? "").trim();
    const rows = [];
    const now = S.now(), pass = S.pass(), events = S.events();

    // True in both states: with no events these are the bundle's own zeroes, so
    // the same assertion covers the empty branch without naming a figure.
    const totals = text("#record-totals");
    rows.push(["the spent total", "contains", totals, P.kes(P.totalSpent(events))]);
    rows.push(["the saved total", "contains", totals, P.kes(P.totalSaved(events))]);
    rows.push(["one row per redemption", "equals",
      String(document.querySelectorAll("#record li").length), String(events.length || 1)]);
    if (events.length) {
      // Same rule as Home: the store appends, so the newest use is the last one
      // held, and the record has to lead with it rather than trail it.
      const firstRow = (document.querySelector("#record li")?.textContent ?? "").trim();
      rows.push(["the newest redemption leads the record", "contains", firstRow,
        P.recordLine(events[events.length - 1]).primary]);
    }

    if (pass) {
      // Every field the credential claims to show, compared against the store.
      const credential = text("#credential");
      for (const [what, value] of [
        ["pass number", pass.shortCode],
        ["holder", pass.holderName],
        ["country of issue", pass.issuedIn],
        ["status", P.passStatus(pass, now)],
      ]) rows.push([`the credential's ${what}`, "contains", credential, String(value)]);
      rows.push(["the validity label", "contains", text("#validity"), P.validityLabel(pass, now)]);
      rows.push(["no signup link once a Pass exists", "equals",
        String(!document.querySelector('#credential a[href="signup.html"]')), "true"]);
    } else {
      // The empty branch is asserted structurally — the route out of it exists —
      // rather than by quoting the placeholder copy, which a redesign may reword.
      rows.push(["a route to signup when there is no Pass", "equals",
        String(!!document.querySelector('#credential a[href="signup.html"]')), "true"]);
    }

    rows.push(["one row per payment method", "equals",
      String(document.querySelectorAll("#wallet-list li").length), String(S.methods().length || 1)]);
    return rows;
  },
};

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

await waitForServer();
const browser = await chromium.launch();
const failures = [];

// Each check is run and recorded independently rather than aborting the page at
// the first throw: one broken figure should not hide nine others, because the
// point of a regression net is to describe the whole of the damage in one run.
async function check(label, fn) {
  try {
    await fn();
  } catch (e) {
    failures.push(`${label}: ${e.message}`);
    return false;
  }
  return true;
}

for (const { w, h } of WIDTHS) {
  for (const { file, rendered: renderedSel, dialogs } of PAGES) {
    for (const state of STATES) {
      const label = `${file} @ ${w}px [${state.name}]`;
      // newPage() opens its own browser context, so every run starts from a
      // genuinely fresh profile: no Pass, no record, no payment method.
      const failedBefore = failures.length;
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errs = [];
      page.on("console", (m) => {
        if (m.type() !== "error") return;
        // The pages pull DM Sans and JetBrains Mono from Google's CDN. A machine
        // without network logs that failure as a console error, and it says
        // nothing about the portal: the type stack falls back and every figure
        // and destination below still holds. Anything else is a real defect.
        if (/fonts\.(googleapis|gstatic)\.com/.test(m.text())) return;
        errs.push(m.text());
      });
      page.on("pageerror", (e) => errs.push("pageerror: " + e.message));

      await page.goto(`${ORIGIN}/${file}`, { waitUntil: "load" });

      // Two waits, not one, and both are hard failures rather than swallowed
      // timeouts. boot.js holds a Mount Kenya curtain over the page until load
      // plus the ridge finishing its trace; assert before it lifts and you are
      // testing the curtain. And the page itself paints only after
      // PamojaState.ready() resolves, so the page's own `rendered` element having
      // text is the signal that the store has hydrated and the first render has
      // happened.
      const booted = await check(`${label} boot`, () => page.waitForFunction(
        () => !document.documentElement.hasAttribute("data-booting"), null, { timeout: 20000 }));
      const rendered = booted && await check(`${label} first render`, () => page.waitForFunction(
        (sel) => (document.querySelector(sel)?.textContent ?? "").trim().length > 0,
        renderedSel, { timeout: 20000 }));
      if (!rendered) { console.error(`  FAIL ${label}`); await page.close(); continue; }

      if (state.populated) {
        // Seeded through the very calls signup.html and the partners redeem sheet
        // make — issue() and redeem() on the shared store — not a hand-rolled
        // shortcut that writes the stores directly. Both home.js and pass.js
        // subscribe to the store, so this repaints the loaded page synchronously.
        // Two redemptions, not one, and from two partners whose discounts differ —
        // so the two record lines read differently and "the newest leads" is a
        // claim that can actually fail. One event orders trivially.
        await page.evaluate(() => {
          const S = window.PamojaState, P = window.Pamoja;
          if (!S.pass()) S.issue({ holderName: P.DEMO_HOLDER_NAME, issuedIn: "KE" });
          if (S.events().length === 0) {
            for (const partner of P.NAMED_PARTNERS.slice(0, 2)) {
              S.redeem({ partner, gross: 1000, channel: "shortcode" });
            }
          }
        });
      }

      // --- the five destinations, and which one is current ------------------
      await check(`${label} destinations`, async () => {
        const nav = await page.evaluate(() => ({
          tabbar: [...document.querySelectorAll("nav.tabbar a")]
            .map((a) => a.getAttribute("href")),
          header: [...document.querySelectorAll(".nav-links a")]
            .map((a) => a.getAttribute("href")),
          declared: window.PamojaChrome.TABS.map((t) => t.href),
        }));
        assert.equal(nav.tabbar.length, 5, "the tab bar must offer five destinations");
        // Sets, not sequences. The order the destinations appear in is a layout
        // decision a redesign may revisit; that all five are reachable is not.
        const sorted = (xs) => [...xs].sort();
        assert.deepEqual(sorted(nav.tabbar), sorted(nav.declared),
          "the tab bar must offer exactly the destinations chrome.js declares");
        // The header list is hand-written into each page's HTML while the tab bar
        // is generated. Comparing them catches a page whose markup has drifted
        // from the shared navigation.
        assert.deepEqual(sorted(nav.header), sorted(nav.declared),
          "the header must offer exactly the destinations chrome.js declares");
      });

      await check(`${label} aria-current`, async () => {
        const marked = await page.evaluate(() => [...document.querySelectorAll("nav.tabbar a")]
          .filter((a) => a.getAttribute("aria-current") === "page")
          .map((a) => a.getAttribute("href")));
        assert.equal(marked.length, 1, "exactly one destination may be marked current");
        assert.equal(marked[0], file, "the current destination must be this page");
      });

      // --- dialogs open and close -------------------------------------------
      await check(`${label} dialog inventory`, async () => {
        const found = await page.evaluate(() =>
          [...document.querySelectorAll("dialog.sheet")].map((d) => d.id).sort());
        assert.deepEqual(found, dialogs.map((d) => d.id).sort(),
          "the page must carry exactly the dialogs declared for it");
      });

      for (const { id, trigger } of dialogs) {
        // Opened through the page's own control, not by calling showModal() from
        // here: a trigger that has come unwired is exactly the sort of breakage
        // this harness is for, and calling showModal() directly would hide it.
        //
        // CLICK_MS is well under Playwright's 30s default because every element
        // clicked here is already in the DOM: a click that has to wait is a click
        // on something broken, and thirty seconds of waiting per dialog to learn
        // that buries the diagnosis in a slow run.
        const opened = await check(`${label} #${id} opens`, async () => {
          await page.click(trigger, { timeout: CLICK_MS });
          assert.ok(await page.evaluate((i) => document.getElementById(i).open, id),
            "the trigger must open the dialog");
        });
        // Nothing further is worth trying on a dialog that would not open — the
        // follow-ups would only time out and report the same defect twice.
        if (!opened) continue;

        // Escape is the browser's own dismissal, and the close button is the
        // page's. Both are promised, so both are exercised. Read the `open`
        // property rather than visibility: whether a closing dialog is still
        // painted mid-transition is appearance, and `open` is the fact.
        await check(`${label} #${id} closes on Escape`, async () => {
          await page.keyboard.press("Escape");
          assert.ok(!await page.evaluate((i) => document.getElementById(i).open, id),
            "Escape must dismiss the dialog");
        });
        await check(`${label} #${id} closes on its close button`, async () => {
          await page.click(trigger, { timeout: CLICK_MS });
          await page.click(`#${id} .sheet-close`, { timeout: CLICK_MS });
          assert.ok(!await page.evaluate((i) => document.getElementById(i).open, id),
            "the close control must dismiss the dialog");
        });
      }

      // --- the redemption flow, where the portal really changes state --------
      // Only with a Pass: without one the sheet's Confirm navigates to signup
      // instead of writing, which is its own correct behaviour and not a
      // redemption. The figures in the sheet are compared against computeMoney
      // for the partner the page itself chose.
      if (file === "partners.html" && state.populated) {
        await check(`${label} redemption`, async () => {
          const before = await page.evaluate(() => window.PamojaState.events().length);
          await page.click('#nearby button[data-i="0"]', { timeout: CLICK_MS });
          const money = await page.evaluate(() => {
            const P = window.Pamoja;
            const partner = P.NAMED_PARTNERS[0];
            const gross = Number.parseInt(document.getElementById("gross").value, 10);
            const m = P.computeMoney(gross, partner.discountPct);
            return {
              title: document.getElementById("redeem-title").textContent.trim(),
              name: partner.name,
              preview: document.getElementById("redeem-preview").textContent,
              net: P.kes(m.net),
              discount: P.kes(m.discount),
            };
          });
          assert.equal(money.title, money.name, "the sheet must name the partner tapped");
          assert.ok(money.preview.includes(money.net),
            `the preview must show computeMoney's net (${money.net})`);
          assert.ok(money.preview.includes(money.discount),
            `the preview must show computeMoney's discount (${money.discount})`);
          await page.click("#confirm-redeem", { timeout: CLICK_MS });
          assert.ok(!await page.evaluate(() => document.getElementById("redeem").open),
            "confirming must dismiss the sheet");
          const after = await page.evaluate(() => window.PamojaState.events().length);
          assert.equal(after, before + 1, "confirming must write exactly one redemption");
        });
      }

      // --- the wallet, the other flow that really changes state --------------
      // Adding is what makes choosing a default reachable: the store ships empty
      // and nothing seeds it, so before there was a way to add one, `choose` could
      // never run. Both halves are exercised, and then the page is reloaded —
      // because a multi-page portal reloads on every navigation, and a wallet that
      // does not survive that is not a wallet.
      if (file === "pass.html" && state.populated) {
        await check(`${label} wallet`, async () => {
          const typed = { mpesa: "0712345789", card: "4111111111114921" };
          await page.click("#open-wallet", { timeout: CLICK_MS });

          const before = await page.evaluate(() => window.PamojaState.methods().length);
          await page.fill("#method-number", typed.mpesa);
          await page.click("#save-method", { timeout: CLICK_MS });
          await page.click("#kind-card", { timeout: CLICK_MS });
          await page.fill("#method-number", typed.card);
          await page.click("#save-method", { timeout: CLICK_MS });

          const added = await page.evaluate(() => {
            const P = window.Pamoja, S = window.PamojaState;
            return {
              count: S.methods().length,
              rows: document.querySelectorAll("#wallet-list li").length,
              listed: (document.querySelector("#wallet-list")?.textContent ?? "").trim(),
              described: S.methods().map((m) => P.describeMethod(m)),
              field: document.getElementById("method-number").value,
              stored: window.localStorage.getItem("pamoja-payment") ?? "",
              defaults: S.methods().filter((m) => m.isDefault).map((m) => m.id),
              ids: S.methods().map((m) => m.id),
            };
          });
          assert.equal(added.count, before + 2, "saving must add exactly one method each time");
          assert.equal(added.rows, added.count, "every saved method must be listed");
          for (const line of added.described) {
            assert.ok(added.listed.includes(line),
              `the wallet must name the method as describeMethod does (${line})`);
          }
          assert.equal(added.field, "", "the number typed must not be echoed back");
          // Rev. 2 §05, checked rather than asserted in prose: what reached the disk
          // must not contain the number the fan typed.
          for (const raw of Object.values(typed)) {
            assert.ok(!added.stored.includes(raw),
              "the raw number must never reach storage");
          }
          assert.equal(added.defaults.length, 1, "exactly one method may be the default");

          // Move the default to a method that is not currently holding it.
          const other = added.ids.find((id) => id !== added.defaults[0]);
          await page.click(`#wallet-list input[value="${other}"]`, { timeout: CLICK_MS });
          assert.deepEqual(
            await page.evaluate(() => window.PamojaState.methods().filter((m) => m.isDefault).map((m) => m.id)),
            [other], "choosing must move the default");

          // And it has to still be there after the page goes away and comes back.
          await page.reload({ waitUntil: "load" });
          await page.waitForFunction(
            () => !document.documentElement.hasAttribute("data-booting"), null, { timeout: 20000 });
          await page.waitForFunction(
            (sel) => (document.querySelector(sel)?.textContent ?? "").trim().length > 0,
            renderedSel, { timeout: 20000 });
          const reloaded = await page.evaluate(() => {
            const S = window.PamojaState;
            return {
              ids: S.methods().map((m) => m.id),
              defaults: S.methods().filter((m) => m.isDefault).map((m) => m.id),
            };
          });
          assert.deepEqual(reloaded.ids, added.ids, "the wallet must survive a reload");
          assert.deepEqual(reloaded.defaults, [other], "the chosen default must survive a reload");
        });
      }

      // --- the figures ------------------------------------------------------
      await check(`${label} figures`, async () => {
        const rows = await page.evaluate(PROBES[file]);
        assert.ok(rows.length > 0, "the probe must check something");
        for (const [what, relation, actual, expected] of rows) {
          if (relation === "equals") {
            assert.equal(actual, expected, `${what} — the DOM says "${actual}", the bundle says "${expected}"`);
          } else {
            assert.ok(actual.includes(expected),
              `${what} — the bundle says "${expected}", which is missing from "${actual}"`);
          }
        }
      });

      // Last, so that errors raised by the interactions above are caught too and
      // not only whatever happened before the first click.
      await check(`${label} console`, () => {
        assert.deepEqual(errs, [], `console errors: ${errs.join(" | ")}`);
      });

      if (failures.length === failedBefore) console.log(`  ok   ${label}`);
      else console.error(`  FAIL ${label}`);

      await page.close();
    }
  }
}

// ---------------------------------------------------------------------------
// signup.html
// ---------------------------------------------------------------------------

// The sixth page that matters, and the only one outside the five that writes to a
// store. It produces the Figure 1 serial, and it carries the double-submit guard
// that keeps producing it: issuing twice would make the device's first Pass
// KE-PM-8843. Both are checked here, and the serial is computed in the page from
// issuePass rather than written down.
for (const { w, h } of WIDTHS) {
  const label = `signup.html @ ${w}px`;
  const failedBefore = failures.length;
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (/fonts\.(googleapis|gstatic)\.com/.test(m.text())) return;
    errs.push(m.text());
  });
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));

  await page.goto(`${ORIGIN}/signup.html`, { waitUntil: "load" });
  const booted = await check(`${label} boot`, () => page.waitForFunction(
    () => !document.documentElement.hasAttribute("data-booting"), null, { timeout: 20000 }));

  if (booted) {
    // The app's three questions, and no fourth: where the Pass is collected, who
    // it is for, and the ticket it travels with.
    await check(`${label} the three questions`, async () => {
      const form = await page.evaluate(() => ({
        countries: document.querySelectorAll('form input[name="country"]').length,
        name: !!document.querySelector('form input[name="name"]'),
        ticket: !!document.querySelector('form input[name="ticket"]'),
        method: document.querySelector("form").getAttribute("method"),
      }));
      assert.equal(form.countries, 3, "one option per host country");
      assert.ok(form.name, "the form must ask who the Pass is for");
      assert.ok(form.ticket, "the form must ask for the ticket reference");
      // Nothing is authenticated and nothing is posted anywhere — see the spec's
      // out-of-scope list. A form that had grown a POST would be a real change.
      assert.equal(form.method, "get", "the form must stay a GET");
    });

    await check(`${label} issues the Figure 1 Pass, once`, async () => {
      assert.equal(await page.evaluate(() => window.PamojaState.pass()), null,
        "a fresh profile must start with no Pass");
      // Submitted twice, synchronously, which is exactly what the guard is for:
      // a second issue would take the device's first Pass off the Figure 1 serial.
      await page.evaluate(() => {
        const form = document.querySelector("form");
        form.requestSubmit();
        form.requestSubmit();
      });
      try {
        await page.waitForURL(/dashboard\.html/, { timeout: 20000 });
      } catch (e) {
        // The second submit issuing too would set location.href a second time and
        // abort the first navigation, so say what that almost certainly means
        // rather than leaving "frame was detached" to be interpreted.
        throw new Error(
          `the page did not settle on dashboard.html (${e.message}) — the likeliest ` +
          "cause is the submit handler navigating twice, i.e. the double-submit " +
          "guard no longer holding");
      }
      await page.waitForFunction(
        () => !!window.PamojaState && !!window.PamojaState.pass(), null, { timeout: 20000 });
      const issued = await page.evaluate(() => {
        const P = window.Pamoja, S = window.PamojaState;
        const pass = S.pass();
        const field = document.querySelector('input[name="name"]');
        return {
          shortCode: pass.shortCode,
          holderName: pass.holderName,
          // What the app would mint for the FIRST Pass on a device. If the double
          // submit got through, the serial above is the second one and these differ.
          expected: P.issuePass({
            holderName: pass.holderName, issuedIn: pass.issuedIn, sequence: 0,
          }).shortCode,
          typed: field ? field.value : null,
        };
      });
      assert.equal(issued.shortCode, issued.expected,
        "the first Pass on a device must carry the first serial");
    });
  }

  await check(`${label} console`, () => {
    assert.deepEqual(errs, [], `console errors: ${errs.join(" | ")}`);
  });

  if (failures.length === failedBefore) console.log(`  ok   ${label}`);
  else console.error(`  FAIL ${label}`);
  await page.close();
}

await browser.close();
stop();

if (failures.length) {
  console.error("\nverify-portal: " + failures.length + " failing");
  for (const f of failures) console.error("  - " + f);
} else {
  console.log("\nverify-portal: all pages ok");
}
process.exit(failures.length ? 1 : 0);
