---
name: Page horizontal-overflow guard (mobile "yana kayma")
description: Why product pages scrolled sideways on mobile and the sticky-safe way to contain it
---

# Mobile "yana kayma" (horizontal page overflow)

## Root cause on the PDP
- The product detail page renders the admin-entered product `long_description`
  HTML inside `.prose-product`. This is arbitrary HTML: a desktop-width
  `<table>`, a long unbreakable token/URL, or fixed-width media widens the WHOLE
  page. Any single wide element anywhere makes the entire page horizontally
  scrollable, even at the top where only the image shows. Observed prod
  scrollWidth ~1333px ≈ a pasted desktop-width table.
- It is product-specific, so dev test products (short/clean descriptions) never
  reproduce it while a real product does. Do NOT treat "dev is clean" as fixed.

## Fix (two layers)
1. Harden `.prose-product`: tables/pre `display:block; max-width:100%;
   overflow-x:auto` (scroll internally instead of widening the page);
   `overflow-wrap: break-word` so long tokens wrap; cap img/iframe/video to
   `max-width:100%`.
2. Catch-all page guard: `#root { overflow-x: clip; }`.

## Why #root, not html/body
- `overflow-x: clip`/`hidden` on the ROOT element (html/body) can disable
  vertical page scrolling via the browser's viewport overflow-propagation
  behavior — a verification test showed `body.scrollHeight=0` and
  `window.scrollTo` no-op after putting it on `html,body`.
- `#root` is body's normal-flow child, immune to that quirk. `overflow-x: clip`
  keeps `overflow-y` visible without making `#root` a scroll container, so window
  vertical scroll + `position:sticky` stay intact.
- **Why clip not hidden:** `overflow-x:hidden; overflow-y:visible` computes
  overflow-y to `auto` (per spec), turning the element into a vertical scroll
  container; `clip` does not.

## Scope
- Global (all 9 branded stores) but behavior-neutral — no store should ever
  scroll sideways. Consistent with prior global overflow fixes.
