// portal/pages/partners.js
/* The network, and the one flow on the portal that really changes state.

   The app offers two entry points — scanned, and card code read at the counter —
   and both go straight to Confirm with the gross pre-filled at 1,000. There is no
   intermediate code-entry step in the app and there is none here; only the channel
   label differs. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;
  var esc = C.esc;

  /* The app's own formatter, through the bundle — see Task 5. Do not hand-write one:
     kes() is en-US, and a local copy reliably guesses en-KE. */
  var money = P.kes;

  var sheet, current = null;

  function preview() {
    var gross = Number(document.getElementById("gross").value || 0);
    var m = P.computeMoney(gross, current ? current.discountPct : 0);
    // Money is { currency, gross, discount, net } — there is no `saved` field.
    document.getElementById("redeem-preview").textContent =
      money(m.net) + " to pay · " + money(m.discount) + " saved";
  }

  function openRedeem(partner) {
    current = partner;
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
    C.mount("partners");
    sheet = C.dialog("redeem");
    document.getElementById("gross").addEventListener("input", preview);
    document.getElementById("confirm-redeem").addEventListener("click", function () {
      if (!S.pass()) { window.location.href = "signup.html"; return; }
      S.redeem({
        partner: current,
        gross: Number(document.getElementById("gross").value || 0),
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
