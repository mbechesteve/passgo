// portal/pages/pass.js
/* The Pass, the record and the wallet — the app's PassScreen, WalletScreen and
   PaymentMethodScreen on one page.

   Every value is read from the bundle. None is typed in: the serial, the holder,
   the validity and the record totals are the figures src/utils/spec-figures.test.ts
   holds as proposal specifications. */
(function () {
  "use strict";
  var C = window.PamojaChrome;

  /* The chrome first, and before the state gate below. chrome.js needs nothing from
     the bundle, so there is no reason to make navigation wait on it — and every
     reason not to. When portal/app-data.js is absent, which is what a fresh clone's
     dev server used to serve, mounting inside the gate left a phone with no tab bar
     at all and .nav-links hidden below 860px: a page with no way off it. */
  C.mount("pass");

  var P = window.Pamoja, S = window.PamojaState;
  // No bundle, no figures, no stores. The page stays navigable and simply renders
  // nothing rather than throwing its way to a blank screen.
  if (!P || !S) return;

  var esc = C.esc;
  // The app's own words, through the bundle. Nothing on this page types a sentence
  // src/lib/strings.ts already holds.
  var T = P.strings.S;

  function render() {
    var now = S.now();
    var pass = S.pass();
    var events = S.events();

    var parts = P.clock.eatParts(now.toISOString());
    document.getElementById("clock").textContent = parts.day + " · " + parts.time + " EAT";

    document.getElementById("greeting").textContent = pass
      ? "Karibu, " + pass.holderName.split(" ")[0] + "."
      : T.scanNoPassOnDevice;

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

    // The most recent use leads, as it does in the app's WalletScreen — see
    // PamojaState.eventsNewestFirst for why the store's order is reversed here.
    document.getElementById("record").innerHTML = events.length
      ? S.eventsNewestFirst().map(function (e) {
          var line = P.recordLine(e);
          return "<li><strong>" + esc(line.primary) + "</strong><br>" +
                 '<span class="muted">' + esc(line.secondary) + "</span></li>";
        }).join("")
      : '<li class="muted">' + esc(T.walletEmptyState) + "</li>";

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
      // The app's own empty state, which now tells the truth on this page too: a
      // method can be added right below it.
      list.innerHTML = '<li class="muted">' + esc(T.payNoneYet) + "</li>";
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

  /* Adding a method — the flow that makes choosing a default reachable at all.

     The store ships empty and nothing seeds it, so before this the wallet button
     always opened onto "no method saved" and `choose` could never run. The spec
     names choosing the default as one of four flows that really work, so the
     missing half is supplied rather than the button removed.

     The fields are PaymentMethodScreen's, and only those: which kind, and the
     number. No payment is captured and no balance exists — Rev. 2 §05 — and the
     number itself is not kept anywhere: it goes to usePaymentStore.add, which
     stores the digit tail alone, and the field is cleared rather than read back. */
  var kind = P.KINDS[0];

  function numberField() { return document.getElementById("method-number"); }

  /* The app gates its Save on `tailOf(raw, 3 | 4).length > 0`, which is true exactly
     when the input holds at least one digit — so ask for one digit rather than
     restating the app's per-kind tail lengths, which are payment.ts's business. */
  function enoughTyped() {
    return P.tailOf(numberField().value, 1).length > 0;
  }

  function syncAddForm() {
    var card = kind === "card";
    document.getElementById("number-heading").textContent =
      card ? T.payCardHeading : T.payPhoneHeading;
    numberField().placeholder = card ? T.payCardPlaceholder : T.payPhonePlaceholder;
    document.getElementById("save-method").disabled = !enoughTyped();
  }

  function mountAddForm() {
    document.getElementById("kind-heading").textContent = T.payKindHeading;
    document.getElementById("number-note").textContent = T.payDiscardNote;
    document.getElementById("save-method").textContent = T.payAddButton;

    var kinds = document.getElementById("method-kinds");
    kinds.insertAdjacentHTML("beforeend", P.KINDS.map(function (k) {
      var id = "kind-" + k;
      return '<label for="' + id + '" style="display:inline-flex;gap:8px;' +
        'align-items:center;min-height:44px;margin-right:16px">' +
        '<input type="radio" name="method-kind" id="' + id + '" value="' + esc(k) +
        '"' + (k === kind ? " checked" : "") + ">" +
        "<span>" + esc(P.KIND_LABEL[k]) + "</span></label>";
    }).join(""));

    Array.prototype.forEach.call(
      kinds.querySelectorAll('input[name="method-kind"]'),
      function (r) {
        r.addEventListener("change", function () {
          kind = r.value;
          // Cleared on a change of kind, as the app clears it: a phone number
          // half-typed is not the start of a card number.
          numberField().value = "";
          syncAddForm();
        });
      }
    );

    numberField().addEventListener("input", syncAddForm);

    document.getElementById("add-method").addEventListener("submit", function (e) {
      // There is nowhere to submit to. The form element exists so that Enter works
      // and the label/field pairing is a real one, not so anything is sent.
      e.preventDefault();
      if (!enoughTyped()) return;
      S.addMethod(kind, numberField().value);
      numberField().value = "";
      syncAddForm();
    });

    syncAddForm();
  }

  S.ready().then(function () {
    mountAddForm();
    var wallet = C.dialog("wallet");
    document.getElementById("open-wallet").addEventListener("click", wallet.open);
    render();
    S.subscribe(render);
  });
})();
