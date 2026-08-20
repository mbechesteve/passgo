// portal/chrome.js
/* The five destinations, and the dialog treatment that replaces the app's stacks.

   The app reaches its detail screens by pushing onto a stack; here they are dialogs
   on the parent page. That is the whole of "simpler to navigate": back never goes
   three deep, because there is nothing to go back through. */
(function (global) {
  "use strict";

  var TABS = [
    { id: "home",     href: "dashboard.html", label: "Home" },
    { id: "matches",  href: "matches.html",   label: "Matches" },
    { id: "live",     href: "live.html",      label: "Live" },
    { id: "partners", href: "partners.html",  label: "Partners" },
    { id: "pass",     href: "pass.html",      label: "Pass" },
  ];

  function mount(activeId) {
    var nav = document.querySelector("nav.tabbar");
    if (!nav) return;
    nav.setAttribute("aria-label", "Sections");
    nav.innerHTML = TABS.map(function (t) {
      var current = t.id === activeId ? ' aria-current="page"' : "";
      return '<a href="' + t.href + '"' + current + '>' +
             '<span class="tabbar-dot"></span>' + t.label + "</a>";
    }).join("");
  }

  /* Dialogs are <dialog> so the browser supplies the modal semantics — focus trap,
     Escape, inert background — rather than us reimplementing them badly. */
  function dialog(id) {
    var el = document.getElementById(id);
    if (!el) throw new Error("no dialog #" + id);
    var closer = el.querySelector(".sheet-close");
    if (closer) closer.addEventListener("click", function () { el.close(); });
    // Clicking the backdrop dismisses, matching the sheet gesture on a phone.
    el.addEventListener("click", function (e) { if (e.target === el) el.close(); });
    return {
      open: function () { el.showModal(); },
      close: function () { el.close(); },
      el: el,
    };
  }

  /* Every page interpolates store data — a holder's name, a merchant's, a fixture's —
     into innerHTML. `esc` lives here rather than once per page because five copies of
     the same four replacements is five chances for one page to drift from the rest. */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  global.PamojaChrome = { mount: mount, dialog: dialog, esc: esc, TABS: TABS };
})(window);
