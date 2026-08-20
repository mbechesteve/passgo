// portal/pages/pass.js
/* The Pass, the record and the wallet — the app's PassScreen, WalletScreen and
   PaymentMethodScreen on one page.

   Every value is read from the bundle. None is typed in: the serial, the holder,
   the validity and the record totals are the figures src/utils/spec-figures.test.ts
   holds as proposal specifications. */
(function () {
  "use strict";
  var P = window.Pamoja, S = window.PamojaState, C = window.PamojaChrome;

  var esc = C.esc;

  function render() {
    var now = S.now();
    var pass = S.pass();
    var events = S.events();

    var parts = P.clock.eatParts(now.toISOString());
    document.getElementById("clock").textContent = parts.day + " · " + parts.time + " EAT";

    document.getElementById("greeting").textContent = pass
      ? "Karibu, " + pass.holderName.split(" ")[0] + "."
      : "No Pass on this device yet.";

    document.getElementById("validity").textContent = pass
      ? P.validityLabel(pass, now)
      : "Not issued";

    document.getElementById("credential").innerHTML = pass
      ? [
          ["Pass number", pass.shortCode],
          ["Holder", pass.holderName],
          ["Issued in", pass.issuedIn],
          ["Status", P.passStatus(pass, now)],
        ].map(function (row) {
          return "<dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd>";
        }).join("")
      : '<dd><a href="signup.html">Get your Pamoja Pass</a></dd>';

    document.getElementById("record").innerHTML = events.length
      ? events.map(function (e) {
          var line = P.recordLine(e);
          return "<li><strong>" + esc(line.primary) + "</strong><br>" +
                 '<span class="muted">' + esc(line.secondary) + "</span></li>";
        }).join("")
      : '<li class="muted">Nothing spent yet.</li>';

    document.getElementById("record-totals").textContent =
      P.kes(P.totalSpent(events)) + " spent · " + P.kes(P.totalSaved(events)) + " saved";

    renderWallet();
  }

  /* Choosing the default, not reordering.

     The app has no ordering: usePaymentStore is a list of methods with one marked
     default, moved by choose(id). A drag-to-reorder control here would offer a
     capability the product does not have. Radios say "one of these is the default"
     exactly, and are operable by keyboard and thumb without any drag affordance.

     PaymentMethod (src/types/index.ts) has no `label` field — it holds `kind` and a
     digit `tail` only, because the raw number a fan typed is never kept. The line a
     fan would read aloud ("M-Pesa · •••789") is `describeMethod`, the app's own
     formatter for exactly that; typing the "M-Pesa"/"Airtel Money"/"Card" strings
     again here would be the second copy the whole page exists to avoid. */
  function renderWallet() {
    var methods = S.methods();
    var list = document.getElementById("wallet-list");

    if (!methods.length) {
      list.innerHTML = '<li class="muted">No payment method saved on this device.</li>';
      return;
    }

    list.innerHTML = methods.map(function (m, i) {
      var id = "method-" + i;
      return '<li><label for="' + id + '" style="display:flex;gap:12px;' +
        'align-items:center;min-height:44px">' +
        '<input type="radio" name="default-method" id="' + id + '" value="' +
        esc(m.id) + '"' + (m.isDefault ? " checked" : "") + ">" +
        "<span>" + esc(P.describeMethod(m)) + "</span></label></li>";
    }).join("");

    Array.prototype.forEach.call(
      list.querySelectorAll('input[name="default-method"]'),
      function (r) {
        r.addEventListener("change", function () { S.chooseMethod(r.value); });
      }
    );
  }

  S.ready().then(function () {
    C.mount("pass");
    var wallet = C.dialog("wallet");
    document.getElementById("open-wallet").addEventListener("click", wallet.open);
    render();
    S.subscribe(render);
  });
})();
