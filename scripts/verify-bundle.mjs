// Evaluate portal/app-data.js the way a browser would and assert the contract the
// portal pages depend on. Guards the bundle's shape; spec-figures.test.ts guards
// the numbers inside it.
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const src = readFileSync("portal/app-data.js", "utf8");

// A browser-ish global: the IIFE assigns to `this`/globalThis, and the stores reach
// for localStorage on rehydrate.
//
// Date is passed in deliberately: vm.runInNewContext runs the bundle in its own
// V8 realm, which by default gets its own fresh intrinsics (Date, Array, ...) the
// same way a cross-origin iframe would. Left alone, `clock.now() instanceof Date`
// below compares against this file's Date and fails even though the bundle is
// fine — so the sandbox is given this realm's Date up front, and `new Date()`
// inside the bundle resolves to it instead of minting a second, incompatible one.
const sandbox = { window: undefined, localStorage: undefined, console, Date };
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
runInNewContext(src, sandbox);

const P = sandbox.Pamoja;
assert.ok(P, "the bundle must define a Pamoja global");

// The whole of the boundary, in one list, asserted in BOTH directions. A page that
// starts reading something new fails here until src/portal-entry.ts is widened
// deliberately — and so does an export no page reads, which is what keeps that
// file's "and nothing else" a fact rather than a wish.
const CONTRACT = [
  "strings", "clock",
  "MATCHES", "EXPLORE_ITEMS", "PARKING_ZONES", "NAMED_PARTNERS", "generatePartners",
  "DEMO_HOLDER_NAME", "passStatus", "validityLabel",
  "CATEGORIES", "CATEGORY_LABEL", "countsByCategory",
  "buildRedemption", "computeMoney", "kes",
  "KINDS", "KIND_LABEL", "describeMethod", "tailOf",
  "recordLine", "totalSaved", "totalSpent",
  "daysUntilLabel", "gatesOpenLabel", "kickoffChipLabel", "kickoffLabel",
  "liveMatches", "matchLabel", "matchPhase", "minuteLabel", "nextMatch",
  "usePassStore", "useRecordStore", "usePaymentStore",
];
assert.deepEqual(Object.keys(P).sort(), [...CONTRACT].sort(),
  "the bundle must expose exactly the portal contract, no more and no less");

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
