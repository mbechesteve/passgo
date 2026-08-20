// portal/pages/partners.js
/* The network, and the one flow on the portal that really changes state.

   The app offers two entry points — scanned, and card code read at the counter —
   and both go straight to Confirm with the gross pre-filled at 1,000. There is no
   intermediate code-entry step in the app and there is none here; only the channel
   label differs. */
(function () {
  "use strict";
  var C = window.PamojaChrome;

  /* The chrome first, and before the state gate below. chrome.js needs nothing from
     the bundle, so there is no reason to make navigation wait on it — and every
     reason not to. When portal/app-data.js is absent, which is what a fresh clone's
     dev server used to serve, mounting inside the gate left a phone with no tab bar
     at all and .nav-links hidden below 860px: a page with no way off it. */
  C.mount("partners");

  var P = window.Pamoja, S = window.PamojaState;
  // No bundle, no figures, no stores. The page stays navigable and simply renders
  // nothing rather than throwing its way to a blank screen.
  if (!P || !S) return;
  var esc = C.esc;

  /* The app's own formatter, through the bundle — see Task 5. Do not hand-write one:
     kes() is en-US, and a local copy reliably guesses en-KE. */
  var money = P.kes;

  var sheet, current = null;
  // Guards a double-tap of Confirm the way ConfirmScreen.tsx's `submitted` ref
  // does: a plain closure var, not React state, so the second click's read sees
  // the first click's write immediately rather than a stale value from before
  // either click re-rendered. Reset whenever a fresh redemption sheet opens.
  var submitted = false;

  // Mirrors ConfirmScreen.tsx's own parse: Number.parseInt (not Number()) plus
  // an isFinite-and-positive check. A run of digits long enough to overflow a
  // double parses to Infinity, which isFinite correctly rejects, same as "abc",
  // "", "-500" and "0" — none of these may ever reach buildRedemption.
  function parsedGross() {
    return Number.parseInt(document.getElementById("gross").value, 10);
  }
  function validGross(gross) {
    return Number.isFinite(gross) && gross > 0;
  }

  function preview() {
    var gross = parsedGross();
    var valid = validGross(gross);
    // Invalid input still needs a sensible preview rather than "KES NaN", so —
    // as ConfirmScreen does — compute against 0 when the typed amount doesn't
    // parse, and disable Confirm so that figure can never be written.
    var m = P.computeMoney(valid ? gross : 0, current ? current.discountPct : 0);
    document.getElementById("redeem-preview").textContent =
      money(m.net) + " to pay · " + money(m.discount) + " saved";
    document.getElementById("confirm-redeem").disabled = !valid;
  }

  function openRedeem(partner) {
    current = partner;
    submitted = false;
    document.getElementById("redeem-title").textContent = partner.name;
    document.getElementById("gross").value = 1000;
    preview();
    sheet.open();
  }

  function render() {
    var partners = P.generatePartners();
    var counts = P.countsByCategory(partners);
    document.getElementById("total").textContent =
      partners.length.toLocaleString("en-US") + " partners";
    document.getElementById("categories").innerHTML = P.CATEGORIES.map(function (c) {
      return "<li>" + esc(P.CATEGORY_LABEL[c]) + " <strong>" +
             (counts[c] || 0).toLocaleString("en-US") + "</strong></li>";
    }).join("");

    var near = P.NAMED_PARTNERS.slice(0, 8);
    var list = document.getElementById("nearby");
    list.innerHTML = near.map(function (p, i) {
      return '<li><button class="btn btn-ghost" data-i="' + i + '" ' +
             'style="min-height:44px;width:100%;text-align:left">' +
             "<strong>" + esc(p.name) + "</strong> · " + esc(p.discountPct) +
             "% off</button></li>";
    }).join("");
    Array.prototype.forEach.call(list.querySelectorAll("button[data-i]"), function (b) {
      b.addEventListener("click", function () { openRedeem(near[Number(b.dataset.i)]); });
    });
  }

  S.ready().then(function () {
    sheet = C.dialog("redeem");
    document.getElementById("gross").addEventListener("input", preview);
    document.getElementById("confirm-redeem").addEventListener("click", function () {
      if (submitted) return; // a double-tap must write once, not twice
      if (!S.pass()) { window.location.href = "signup.html"; return; }
      var gross = parsedGross();
      // The button is disabled whenever this is false, but a disabled button can
      // still receive a synthetic or queued click in some embedders — so check
      // again here. Invalid input must be unable to reach buildRedemption.
      if (!validGross(gross)) return;
      submitted = true;
      S.redeem({
        partner: current,
        gross: gross,
        // Channel is "nfc" | "qr" | "shortcode". This sheet is the counter path —
        // the fan reads her card code aloud — so it is shortcode, which state.js
        // routes through ingestShortCode rather than append.
        channel: "shortcode",
      });
      sheet.close();
    });
    render();
    S.subscribe(render);
  });
})();
