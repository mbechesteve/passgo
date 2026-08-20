// portal/pages/home.js
/* Home: the next match, the network and what has been spent.
   The app's HomeScreen, with Partner, Confirm, Getting There and Parking folded in
   as dialogs rather than pushes. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  var esc = C.esc;

  function render() {
    var now = S.now(), pass = S.pass(), events = S.events();
    var parts = P.clock.eatParts(now.toISOString());
    document.getElementById("clock").textContent = parts.day + " · " + parts.time + " EAT";
    document.getElementById("greeting").textContent = pass
      ? "Karibu, " + pass.holderName.split(" ")[0] + "."
      : "Karibu.";
    document.getElementById("validity").textContent = pass ? P.validityLabel(pass, now) : "No Pass yet";

    var next = P.nextMatch(P.MATCHES, now);
    document.getElementById("next-match").innerHTML = next
      ? "<p><strong>" + esc(P.matchLabel(next)) + "</strong></p>" +
        "<p>" + esc(P.kickoffLabel(next)) + " · " + esc(P.daysUntilLabel(next, now)) + "</p>" +
        '<p class="muted">' + esc(P.gatesOpenLabel(next)) + "</p>"
      : '<p class="muted">No fixture ahead of the demo clock.</p>';

    var partners = P.generatePartners();
    var counts = P.countsByCategory(partners);
    document.getElementById("categories").innerHTML = P.CATEGORIES.map(function (c) {
      return "<li>" + esc(P.CATEGORY_LABEL[c]) + " <strong>" +
             (counts[c] || 0).toLocaleString("en-US") + "</strong></li>";
    }).join("");
    document.getElementById("network-total").textContent =
      partners.length.toLocaleString("en-US") + " partners across three countries";

    // Newest three, not the first three the store happens to hold — see
    // PamojaState.eventsNewestFirst for why the store's own order is the wrong way
    // round for a heading that says "Recent".
    document.getElementById("record").innerHTML = events.length
      ? S.eventsNewestFirst().slice(0, 3).map(function (e) {
          var l = P.recordLine(e);
          return "<li><strong>" + esc(l.primary) + "</strong><br>" +
                 '<span class="muted">' + esc(l.secondary) + "</span></li>";
        }).join("")
      : '<li class="muted">Nothing spent yet.</li>';

    // ExploreItem (src/types/index.ts) names the field `name`, not `title` — there
    // is no `title` field on the type, so a `||` fallback would only ever mask a typo.
    document.getElementById("travel-list").innerHTML =
      P.EXPLORE_ITEMS.slice(0, 8).map(function (i) {
        return "<li>" + esc(i.name) + "</li>";
      }).join("");

    // ParkingZone (src/types/index.ts) names the field `zone`; it has no `name`.
    document.getElementById("parking-list").innerHTML =
      P.PARKING_ZONES.map(function (z) {
        return "<li>" + esc(z.zone) + "</li>";
      }).join("");
  }

  S.ready().then(function () {
    C.mount("home");
    var travel = C.dialog("travel"), parking = C.dialog("parking");
    document.getElementById("open-travel").addEventListener("click", travel.open);
    document.getElementById("open-parking").addEventListener("click", parking.open);
    render();
    S.subscribe(render);
  });
})();
