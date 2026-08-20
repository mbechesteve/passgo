// Build portal/app-data.js — the app's data, logic and copy, for the portal.
//
// The portal's logged-in pages are hand-written markup, but the numbers behind them
// are proposal specifications guarded by src/utils/spec-figures.test.ts. Retyping
// them into HTML would create a second copy that drifts silently. So the pages read
// from this bundle instead, and the test constrains both surfaces at once.
//
// Two aliases do the work of making app code run in a browser:
//
// - `@` is the tsconfig path alias; esbuild does not read tsconfig paths from a
//   script invocation, so it is restated here.
// - AsyncStorage is replaced by src/lib/web-storage.ts. The stores are otherwise
//   unmodified — they are the app's, not a copy.
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
