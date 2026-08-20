// Post-build step: copy the portal over the root of dist/.
//
// The portal is the domain root and the app lives under /app, so the build is
// two independent trees stacked into one directory: `expo export` writes
// dist/app, and this copies portal/ on top of dist/ itself. Nothing is shared
// between them — the portal imports nothing from src/ and has no build step of
// its own, which is why a copy is the whole of it.
//
// Deliberately not a wipe-and-copy: dist/app already exists by the time this
// runs, and removing dist/ here would delete the export we just made.
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const SRC = resolve("portal");
const OUT = resolve("dist");

if (!existsSync(SRC)) {
  console.error("copy-portal: portal/ not found.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

// README.md documents the portal for whoever is editing it; it is not part of
// the site and should not be served.
const skip = new Set(["README.md"]);
const entries = readdirSync(SRC).filter((name) => !skip.has(name));

for (const name of entries) {
  cpSync(resolve(SRC, name), resolve(OUT, name), { recursive: true });
}

console.log(`copy-portal: copied ${entries.length} entries from portal/ to dist/`);
