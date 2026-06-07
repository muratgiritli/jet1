---
name: Product detail buy bar
description: PDP owns the bottom on /urun; global bottom bars must self-hide there
---

# Product detail (PDP) bottom-bar ownership

On the product detail route (`/urun/*`) the page renders its own fixed bottom "buy bar"
(price + "Sepete Ekle" / "Sepeti Onayla"). To match the Trendyol-style single-CTA layout,
the two GLOBAL fixed bottom bars self-hide on `/urun`:
`BottomTabBar` and `FloatingCartBar` both early-return when `location.startsWith("/urun")`.

**Why:** those globals sit at very high z-index (z-[9999]/z-[9998]); without hiding them they
cover or duplicate the PDP buy bar (FloatingCartBar appears whenever the cart has items, which is
exactly the "Sepeti Onayla" state). The PDP buy bar uses a much lower z-index by design.

**How to apply:** if you add another fixed bottom element globally, gate it off `/urun` too, or
the PDP CTA flow breaks. The buy-bar button is state-driven by basket quantity for the product:
qty 0 => "Sepete Ekle" (adds 1); qty>0 => "Sepeti Onayla" (logged-in -> /odeme; guest -> a Dialog
offering /giris or guest /odeme). Applies to ALL stores (jetgo/atakum/samsun), not store-gated.
