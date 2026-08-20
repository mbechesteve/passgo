// portal/pages/live.js
/* What is happening now, on the demo clock. */
(function () {
  "use strict";
  var C = window.PamojaChrome;

  /* The chrome first, and before the state gate below. chrome.js needs nothing from
     the bundle, so there is no reason to make navigation wait on it — and every
     reason not to. When portal/app-data.js is absent, which is what a fresh clone's
     dev server used to serve, mounting inside the gate left a phone with no tab bar
     at all and .nav-links hidden below 860px: a page with no way off it. */
  C.mount("live");

  var P = window.Pamoja, S = window.PamojaState;
  // No bundle, no figures, no stores. The page stays navigable and simply renders
  // nothing rather than throwing its way to a blank screen.
  if (!P || !S) return;

  var esc = C.esc;
  var T = P.strings.S;   // the app's own words for "live" and for nothing being on

  function render() {
    var now = S.now();
    var live = P.liveMatches(P.MATCHES, now);
    document.getElementById("state").textContent =
      live.length ? T.liveBadge : T.liveNothingOn;
    document.getElementById("live-body").innerHTML = live.length
      ? live.map(function (m) {
          return "<p><strong>" + esc(P.matchLabel(m)) + "</strong> · " +
                 esc(P.minuteLabel(m, now)) + "</p>";
        }).join("")
      : (function () {
          var next = P.nextMatch(P.MATCHES, now);
          return next
            ? '<p class="muted">' + esc(T.liveNextUp) + ": " +
              esc(P.matchLabel(next)) + " · " + esc(P.daysUntilLabel(next, now)) + "</p>"
            : '<p class="muted">The tournament is over on this clock.</p>';
        })();
  }

  S.ready().then(render);
})();
