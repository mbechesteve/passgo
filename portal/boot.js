/* The boot screen, shared by every page that raises one.

   The rule is that the mountain is never cut off half-drawn: whatever else happens, the
   summit finishes being traced before the page behind it is shown. So there are two
   conditions, not one. The page has to be ready — `load` rather than DOMContentLoaded,
   because the thing worth waiting for is the heaviest asset, and on the front page that is
   the hero footage, which arrives last. And the drawing has to be finished.

   When the page becomes ready the looping trace is stopped wherever it happens to be, and
   the remaining stroke is transitioned to nothing, so the line runs on to the summit and
   completes instead of snapping. A page that is ready in 200ms therefore still shows a
   whole mountain; one that takes three seconds shows the loop until then and the same
   completion afterwards.

   Two safeguards. If a resource never resolves, `load` never fires, so a cap starts the
   same completion anyway — the curtain lifts on a page that is otherwise perfectly usable.
   And the [data-booting] attribute that makes any of this visible is set by an inline
   script in each page's head, so a reader with JavaScript off never meets a curtain that
   nothing will lift. */
(function () {
  var CAP_MS = 4000;      // longest we will wait for `load` before finishing anyway
  var DRAW_MS = 520;      // completing the stroke
  var HOLD_MS = 160;      // the drawn summit, held, before the fade

  var boot = document.getElementById("boot");
  if (!boot) return;
  var ridge = boot.querySelector(".boot-ridge");
  var finishing = false;

  function lift() {
    boot.classList.add("is-done");
    window.setTimeout(function () {
      document.documentElement.removeAttribute("data-booting");
    }, 500);
  }

  /* Run the trace on to the summit from wherever it is, then lift. */
  function finish() {
    if (finishing) return;
    finishing = true;

    if (!ridge || !window.getComputedStyle) { lift(); return; }

    var offset = parseFloat(window.getComputedStyle(ridge).strokeDashoffset);
    // Past the summit already — the stroke is sweeping away, or motion is reduced and it
    // was drawn from the start. Either way there is nothing left to draw.
    if (!isFinite(offset) || offset <= 0) {
      ridge.style.animation = "none";
      ridge.style.strokeDashoffset = "0";
      window.setTimeout(lift, HOLD_MS);
      return;
    }

    ridge.style.transition = "none";
    ridge.style.animation = "none";
    ridge.style.strokeDashoffset = String(offset);
    void ridge.getBoundingClientRect();          // flush, so the next value transitions
    ridge.style.transition = "stroke-dashoffset " + DRAW_MS + "ms cubic-bezier(0.65, 0, 0.35, 1)";
    ridge.style.strokeDashoffset = "0";
    window.setTimeout(lift, DRAW_MS + HOLD_MS);
  }

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  window.setTimeout(finish, CAP_MS);
})();
