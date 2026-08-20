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
