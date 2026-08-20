// portal/state.js
/* The portal's state, over the app's stores.

   Multi-page HTML forgets everything on every navigation, so unlike the app — which
   hydrates once and keeps a live store in memory — each page here has to wait for
   rehydration before it renders. `ready()` is that wait, and every page awaits it
   before its first paint. Rendering first and correcting later would flash a Pass
   that says "no Pass" at a fan who has one.

   The stores are the app's own, reached through the bundle. Nothing is reimplemented
   here; this is a thin, page-shaped door onto them. */
(function (global) {
  "use strict";

  var P = global.Pamoja;
  if (!P) throw new Error("state.js loaded before app-data.js");

  var pass = P.usePassStore;
  var record = P.useRecordStore;
  var payment = P.usePaymentStore;

  /* Zustand's persist middleware rehydrates asynchronously. Each store sets its own
     `hydrated` flag in onRehydrateStorage; wait for all of them rather than racing
     the first. */
  function whenHydrated(store) {
    return new Promise(function (resolve) {
      if (store.getState().hydrated) return resolve();
      var stop = store.subscribe(function (s) {
        if (s.hydrated) { stop(); resolve(); }
      });
      // A store whose persisted key is absent still rehydrates, but if a browser
      // denies storage entirely the callback may never run. Do not hang the page.
      setTimeout(function () { stop(); resolve(); }, 1500);
    });
  }

  var readyPromise = null;

  var State = {
    ready: function () {
      if (!readyPromise) {
        readyPromise = Promise.all([
          whenHydrated(pass), whenHydrated(record), whenHydrated(payment),
        ]).then(function () {});
      }
      return readyPromise;
    },

    /* Always the demo clock unless the app has been switched to real time. Pages
       must not call new Date(): the seeded fixtures sit around 2027-06-23. */
    now: function () { return P.clock.now(); },

    pass: function () { return pass.getState().pass; },
    ticket: function () { return pass.getState().ticket; },
    events: function () { return record.getState().events; },

    /* The record with the newest use first — the order both surfaces that show it
       want, and the opposite of the order the store keeps.

       useRecordStore appends, so events[0] is the fan's FIRST use. A "Recent" list
       taken off the front therefore stops changing after the third redemption, and
       the whole record reads oldest-down.

       The app's own rule is groupByDay, which sorts newest day first and newest
       event first within a day. It was tried here and it cannot order this page: it
       sorts on `e.at`, and every redemption the portal writes is stamped with
       `now()` — the frozen demo clock, 2027-06-23T12:55 EAT. Four uses share one
       instant, a stable sort leaves them exactly as they arrived, and the oldest
       still leads. Insertion order is the only ordering the portal actually has, so
       it is reversed explicitly rather than dressed up as a timestamp sort.

       Copied to reverse: the array is the store's own, and reversing in place would
       mutate state behind Zustand's back. */
    eventsNewestFirst: function () {
      return record.getState().events.slice().reverse();
    },

    issue: function (input) {
      pass.getState().issue(input);
      return pass.getState().pass;
    },

    /* Both redemption entry points — scanned, and card code read at the counter.
       The app offers no intermediate code-entry step and neither does the portal.

       The two do NOT converge on one store call. useRecordStore keeps `append` (a
       use that happened through the app) separate from `ingestShortCode` (a use
       that arrived inbound, where the fan never touched her phone), and its own
       comment says keeping them separate "is what makes the no-exclusion promise
       real". Collapsing them here would quietly undo that. */
    redeem: function (input) {
      var events = record.getState().events;
      var event = P.buildRedemption({
        pass: pass.getState().pass,
        partner: input.partner,
        gross: input.gross,
        channel: input.channel,          // "qr" | "nfc" | "shortcode"
        at: State.now(),
        seq: events.length,              // required: keeps event ids distinct
      });
      if (input.channel === "shortcode") record.getState().ingestShortCode(event);
      else record.getState().append(event);
      return event;
    },

    /* The wallet is a list of methods with one default — there is no ordering in
       the app, so there is none here. `choose` is the only thing that moves. */
    methods: function () { return payment.getState().methods; },
    chooseMethod: function (id) { payment.getState().choose(id); },

    reset: function () {
      pass.getState().reset();
      record.getState().clear();
    },

    /* Re-render on change, for the dialogs that mutate. */
    subscribe: function (fn) {
      var stops = [pass.subscribe(fn), record.subscribe(fn), payment.subscribe(fn)];
      return function () { stops.forEach(function (s) { s(); }); };
    },
  };

  global.PamojaState = State;
})(window);
