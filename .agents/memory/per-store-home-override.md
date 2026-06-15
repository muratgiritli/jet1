---
name: Per-store full homepage override
description: How to replace ONE store's homepage with a bespoke design without touching the other domains, plus the cart updateQty return-value footgun.
---

# Replacing one store's homepage end-to-end

To give a single store (e.g. `atakum`) a completely bespoke homepage while leaving
the other domains on the shared Landing/DemoAnasayfa, you must gate in **two**
places — gating only one leaves either the old page or duplicate chrome:

1. `client/src/pages/landing.tsx` — early `return <CustomHome/>` at the top of the
   `Landing` component (after the hooks) when `store.id === "<id>"`. This covers
   both mobile and desktop, since Landing is the `/` and `/petshop` entry.
2. `client/src/App.tsx` `AppShell` — the custom homepage renders its **own**
   header/footer/bottom-nav, so suppress the GLOBAL chrome for that store on the
   home routes only: `isCustomHome = store.id==="<id>" && (location==="/" || location==="/petshop")`,
   then `&& !isCustomHome` on each of Header, Footer, FloatingCartBar, BottomTabBar.

**Why:** otherwise you get either the old design still showing (missing #1) or two
stacked headers/footers/cart bars (missing #2). Keep the gate pinned to the home
routes so the store's inner routes keep the shared chrome.

Local preview without owning the domain: append `?__store=<id>` once (stored in
sessionStorage by `client/src/lib/store.ts`); ignored on real configured hosts.

# Cart updateQty footgun

`useCart().updateQty(id, delta)` returns **`blocked`** (boolean), NOT success:
`true` = the add was blocked (stock cap / campaign / preorder conflict), `false` =
it succeeded. Show the "Sepete eklendi" toast on `!blocked`. Blocked conflict cases
already raise their own destructive toast inside updateQty, so don't double-toast.
