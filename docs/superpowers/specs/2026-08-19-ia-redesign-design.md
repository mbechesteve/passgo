# Pamoja — Information Architecture Redesign Design Spec

**Date:** 2026-08-19
**Status:** Awaiting visual design — no implementation started
**Author:** Mbeche (with Claude)
**Companion artefact:** `docs/design/pamoja-design-brief.pdf` (6pp, generated from
`pamoja-design-brief.html`), written to be pasted into Claude Design.

## Why

Driving the built app to audit it turned up one thing that was fine and three that were not.

**Fine:** the navigation plumbing. The tab bar is present on all 15 screens and back works
on every pushed screen. `e86bb4e` and `7c1466c` between them closed that off, and a note
in the session memory claiming the Wallet strands a fan is stale and has been corrected.
So the problem was never wiring — it is information architecture.

**Not fine:**

1. **Seven of eleven fixtures cannot be reached.** Explore is the app's only fixture list
   and it is capped to a seven-day window *and* five rows. Home shows one fixture; Live
   shows what is live or next. There is no full schedule anywhere. This was discovered the
   hard way: the Talanta fixture had to be re-dated from 6 July to 28 June purely so its
   own ticket office was reachable — the tail wagging the dog.
2. **Eleven of fifteen pressables had no accessibility role**, so every interactive row,
   tile and pill was announced as plain content. **Fixed in this session** (measured 1 → 12
   controls on Getting there); the visible focus/pressed treatment remains a design ask.
3. **Getting there stacks three rows of chrome** — Drive/Fly, Arriving/Leaving, then up to
   five route pills — before a fan sees one fact.

## The three decisions

| Decision | Taken | Rejected |
|---|---|---|
| The spine | **The match** | The Pass; Today/now |
| Tabs | **Four: Home · Matches · Offers · Pass** | Five with Services renamed; keep five as-is |
| Desktop | **Two-pane master/detail** | Dashboard Home only; responsive grid throughout |

### The match is the spine

Almost everything a fan does hangs off a fixture. Today the fixture is a row buried under a
search box and the things attached to it are scattered across three tabs. A **Matches** tab
holds the full schedule; a fixture opens one screen composing everything about it:

```
MATCH DETAIL
  TeamRow (flags + names) · kickoff · venue AND city
  State ......... scheduled -> live (score, stats) -> full-time   [absorbs the Live tab]
  Getting there . road + air legs to THIS city, with cost estimates
  Tickets ....... hall map + block picker, where a map exists
  At the ground . parking zones + walk times, safety, shuttles
  Your ticket ... if the Pass carries one for this match
```

This dissolves problems 1 and 3, and the inconsistent affordances (one fixture row opens a
ticket office; three identical-looking rows do nothing).

### Four tabs

`Live` stops being a tab — it is dead most of the tournament — and becomes a state of a
match. `Services` splits: matchday logistics attach to the match they belong to, and the
2,189-partner network becomes `Offers`. Every one of today's 15 screens has a home; the
mapping is in the brief.

### Desktop

Almost every screen is a list that leads to a detail, so above 1024px both should be
visible: schedule beside a match, offers beside a partner, the Pass beside its record.
Home stays one wide surface, multi-column. The 96px rail and the 1024px breakpoint from
`e947509` are kept.

## Two tensions the decisions create

- **Live needs a one-tap path.** Folding it into a match is right, but during a match a fan
  must not have to go Matches → find the fixture → scroll. Home has to surface a live match
  loudly and lead straight to it.
- **Inbound travel is not match-specific.** "Arriving in Kenya from Uganda" belongs to a
  fan, not a fixture. Per-match travel lives in the detail; the arriving guide needs its own
  home off Home or it is orphaned.

## Non-negotiables carried into the redesign

No payment ever (Rev. 2 §05); two hues, no per-category or per-status colour coding; Outfit
and JetBrains Mono by semantic key; the Mount Kenya media motif; no invented data presented
as fact — every price, fare, schedule and entry requirement keeps its `asOf` and its
caveat, or is labelled a prototype figure; the record stays on the device.

## Next step

Visual design of the four-tab structure and the match detail, mobile and desktop, from the
brief. **No code changes to navigation or screens have been made** — the only implementation
in this session was the accessibility-role fix, which is independent of the redesign.
Implementation should follow an approved design, as its own plan.
