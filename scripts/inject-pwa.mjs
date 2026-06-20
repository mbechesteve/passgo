// Post-build step: inject PWA <head> tags + service-worker registration into
// the exported dist/index.html. The Expo Metro web export doesn't let us
// customize the document head directly (no Expo Router here), so we patch the
// generated HTML after `expo export`. The manifest, icons and sw.js are copied
// from public/ to dist/ automatically by Expo.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const html = resolve("dist/index.html");
if (!existsSync(html)) {
  console.error("inject-pwa: dist/index.html not found — run expo export first.");
  process.exit(1);
}

const HEAD = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#080808" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="PassGo" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180.png" />
  `;

const SW = `
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/sw.js").catch(function () {});
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
console.log("inject-pwa: patched dist/index.html (manifest, icons, service worker)");
