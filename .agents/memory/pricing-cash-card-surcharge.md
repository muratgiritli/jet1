---
name: Cash-headline / +5% card surcharge pricing
description: The active pricing model — product.price is the cash price; non-cash adds 5% on product subtotal only.
---

Pricing model (REPLACED the old 10% Kapıda Nakit cash discount):
- `product.price` IS the cash (Kapıda Nakit) headline price — the cheapest, shown as the main price everywhere.
- POS, Havale/EFT, QR, and Online card ALL add +5% surcharge, computed on the PRODUCT subtotal ONLY (never shipping).
- Campaign orders are cash-only and NEVER get a surcharge. Preorders force online card and DO get +5%.
- Coupons: surcharge stays 5% of product subtotal; coupon is separate. grand_total = subtotal − coupon + shipping + round(subtotal*0.05).

**Why:** customers must see a truthful cash price as the headline and a transparent card up-charge; surcharging shipping would over-charge.

**How to apply:**
- Shared helpers in `client/src/lib/data.ts`: `CARD_SURCHARGE` (0.05), `cardPrice(cash)`, `roundMoney`, `isCashPaymentMethod`; `PaymentOption.surcharge` (nakit 0, others CARD_SURCHARGE) — this replaced the old `PaymentOption.disc`.
- Show the secondary card price with `<CardPriceNote price={cashPrice} />` (muted gray, NOT green — green implies cheaper, but card is dearer). PDP renders its own boxed gray card line inline.
- SERVER recomputes the surcharge independently in the `/api/orders` route and is the source of truth (gateways read the persisted grand_total); never trust client totals. Cash is detected by lowercasing paymentMethod first, then `/nakit/` (so capital "Kapıda Nakit" still matches).
- Cart's free-shipping threshold uses the CASH subtotal, not the surcharged total.
- Some SEO/static copy phrases this as "kapıda nakit %5 indirim" — left intentionally (already %5, acceptable consumer framing; not the old 10% logic).
