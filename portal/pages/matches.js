// portal/pages/matches.js
/* Every fixture, not a seven-day window.
   The app's Explore list is capped to seven days of the demo clock, which is why
   seven of eleven fixtures were once unreachable (see the 2026-08-19 IA spec). This
   page lists all of MATCHES deliberately. */
(function () {
  "use strict";
  var C = window.PamojaChrome;

  /* The chrome first, and before the state gate below. chrome.js needs nothing from
     the bundle, so there is no reason to make navigation wait on it — and every
     reason not to. When portal/app-data.js is absent, which is what a fresh clone's
     dev server used to serve, mounting inside the gate left a phone with no tab bar
     at all and .nav-links hidden below 860px: a page with no way off it. */
  C.mount("matches");

  var P = window.Pamoja, S = window.PamojaState;
  // No bundle, no figures, no stores. The page stays navigable and simply renders
  // nothing rather than throwing its way to a blank screen.
  if (!P || !S) return;

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
    sheet = C.dialog("fixture");
    render();
  });
})();
