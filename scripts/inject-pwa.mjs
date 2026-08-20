// Post-build step: inject PWA <head> tags + service-worker registration into
// the exported app's index.html. The Expo Metro web export doesn't let us
// customize the document head directly (no Expo Router here), so we patch the
// generated HTML after `expo export`. The manifest, icons and sw.js are copied
// from public/ by Expo, and land alongside it.
//
// The app is exported under dist/app so the portal can own the domain root, so
// every path injected here is /app-prefixed. Registering the worker at
// /app/sw.js also scopes it to /app/, which is what keeps it off the portal.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const REL = "dist/app/index.html";
const html = resolve(REL);
if (!existsSync(html)) {
  console.error(`inject-pwa: ${REL} not found — run expo export first.`);
  process.exit(1);
}

const HEAD = `
    <link rel="manifest" href="/app/manifest.json" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Pamoja" />
    <link rel="apple-touch-icon" href="/app/apple-touch-icon-180.png" />
  `;

const SW = `
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/app/sw.js").catch(function () {});
        });
      }
    </script>
  `;

let src = readFileSync(html, "utf8");

if (!src.includes('rel="manifest"')) {
  src = src.replace("</head>", `${HEAD}</head>`);
}
if (!src.includes("serviceWorker.register")) {
  src = src.replace("</body>", `${SW}</body>`);
}

writeFileSync(html, src);
console.log(`inject-pwa: patched ${REL} (manifest, icons, service worker)`);
