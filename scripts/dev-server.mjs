/* The development server, shaped like the deployed site.

   In production the portal is the domain root and the app is exported under /app.
   Metro cannot reproduce that on its own — it serves the RN bundle at / and knows
   nothing about portal/ — so running `expo start` alone shows the app where the
   marketing page belongs, which is the one thing this arrangement has to get right.

   So Metro is moved out of the way onto :8082 and this owns :8081 in front of it:

       /            portal/index.html
       /signup.html portal/signup.html      (and every other portal file)
       /app         the app, proxied to Metro
       /app/*       the app, proxied to Metro

   The routing rule is deliberately "portal first, Metro otherwise" rather than a
   list of app paths. The portal is a fixed, small set of static files; the app's
   request surface is not — Metro serves bundles, source maps, symbolication, the
   HMR socket and asset URLs whose shapes change between SDK versions. Enumerating
   the portal is possible; enumerating Metro is a guess that goes stale.

   The /app prefix is stripped when forwarding, and a request that arrives without
   it is forwarded unchanged. That is what makes this independent of whether the
   dev server honours `experiments.baseUrl` — if it does, assets arrive as
   /app/_expo/… and are stripped; if it does not, they arrive as /_expo/…, match no
   portal file, and pass straight through. Either way Metro sees the path it wrote.

   WebSocket upgrades are bridged too, or hot reload dies the moment Metro stops
   being the origin the browser is talking to. */
import { createServer, request as httpRequest } from "node:http";
import { connect } from "node:net";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, normalize, extname, resolve } from "node:path";

const PORT = Number(process.env.PORT || 8081);
const METRO_PORT = Number(process.env.METRO_PORT || 8082);
const METRO_HOST = "127.0.0.1";
const PORTAL = resolve("portal");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

/* The portal file a request names, or null if it names none.

   normalize() collapses any ../ before the join, so a crafted path cannot escape
   portal/ — worth doing even in a dev server, because this one is reachable from
   the network. */
function portalFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const rel = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const candidate = rel === "/" || rel === "" ? "index.html" : rel.replace(/^[/\\]+/, "");
  if (!candidate) return null;
  const full = join(PORTAL, candidate);
  if (!full.startsWith(PORTAL)) return null;
  if (!existsSync(full)) return null;
  return statSync(full).isFile() ? full : null;
}

function serveFile(res, full) {
  res.writeHead(200, {
    "Content-Type": TYPES[extname(full).toLowerCase()] || "application/octet-stream",
    // The portal is being edited while this runs; never let a stale copy stick.
    "Cache-Control": "no-store",
  });
  createReadStream(full).pipe(res);
}

/* /app and /app/* address the app; Metro knows itself as the root. */
function metroPath(url) {
  if (url === "/app") return "/";
  if (url.startsWith("/app/")) return url.slice("/app".length);
  if (url.startsWith("/app?")) return "/" + url.slice("/app".length);
  return url;
}

function proxy(req, res) {
  const upstream = httpRequest(
    {
      host: METRO_HOST,
      port: METRO_PORT,
      method: req.method,
      path: metroPath(req.url),
      headers: { ...req.headers, host: `${METRO_HOST}:${METRO_PORT}` },
    },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    }
  );
  upstream.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      `The app's bundler is not answering on :${METRO_PORT}.\n\n${err.message}\n\n` +
        `The portal at http://localhost:${PORT}/ is unaffected.\n`
    );
  });
  req.pipe(upstream);
}

const server = createServer((req, res) => {
  const pathname = (req.url || "/").split("?")[0];
  const isApp = pathname === "/app" || pathname.startsWith("/app/");
  const file = isApp ? null : portalFile(pathname);

  if (file) return serveFile(res, file);

  /* A .html the portal does not have is a portal typo, and in production it 404s —
     the app's SPA fallback is scoped to /app there. Without this it would fall
     through to Metro, which answers every unmatched path with the app, and a
     mistyped portal URL would silently render the app instead. Only .html is
     treated this way: the app's own bundle and asset requests arrive unprefixed
     (the dev server passes baseUrl to the transformer, not into the HTML) and must
     still pass through. */
  if (!isApp && pathname.endsWith(".html")) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(`No such portal page: ${pathname}\n`);
  }

  proxy(req, res);
});

/* Hot reload rides a WebSocket, which http.request cannot carry — bridge the raw
   sockets instead and let Metro and the browser speak directly through them. */
server.on("upgrade", (req, socket, head) => {
  const upstream = connect(METRO_PORT, METRO_HOST, () => {
    const headers = Object.entries(req.headers)
      .filter(([k]) => k.toLowerCase() !== "host")
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\r\n");
    upstream.write(
      `${req.method} ${metroPath(req.url)} HTTP/1.1\r\n` +
        `host: ${METRO_HOST}:${METRO_PORT}\r\n${headers}\r\n\r\n`
    );
    if (head && head.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

/* detached, so the bundler gets its own process group.

   `npx expo` is a launcher: the process spawn() returns is npx, and the expo dev
   server is its child. Signalling the launcher alone kills npx and leaves the dev
   server holding :8082, so the next `npm run web` fails on a port nothing appears
   to own. Signalling the group takes both. */
const metro = spawn(
  "npx",
  ["expo", "start", "--web", "--port", String(METRO_PORT)],
  {
    stdio: ["ignore", "inherit", "inherit"],
    detached: true,
    env: { ...process.env, BROWSER: "none", EXPO_NO_TELEMETRY: "1" },
  }
);

let exiting = false;
function shutdown() {
  if (exiting) return;
  exiting = true;
  try {
    process.kill(-metro.pid, "SIGTERM");
  } catch {
    // Already gone, or never got a group — nothing to signal.
  }
  server.close(() => process.exit(0));
  // The bundler can take its time; do not hang the terminal waiting for it.
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
metro.on("exit", (code) => {
  if (code) console.error(`\nThe bundler exited with code ${code}.`);
  shutdown();
});

server.listen(PORT, () => {
  console.log(
    `\n  portal   http://localhost:${PORT}/` +
      `\n  app      http://localhost:${PORT}/app` +
      `\n\n  (bundler on :${METRO_PORT}, proxied)\n`
  );
});
