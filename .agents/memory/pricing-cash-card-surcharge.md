---
name: Cash-headline / +5% card surcharge pricing
description: The active pricing model — product.price is the cash price; non-cash adds 5% on product subtotal only.
---

Pricing model (REPLACED the old 10% Kapıda Nakit cash discount):
- `product.price` IS the cash (Kapıda Nakit) headline price — the cheapest, shown as the main price everywhere.
- POS, Havale/EFT, QR, and Online card ALL add the surcharge, computed on the PRODUCT subtotal ONLY (never shipping).
- The surcharge % is ADMIN-CONFIGURABLE per store, NOT hardcoded: store-scoped app_setting `card_surcharge_percent` (a plain percent string, e.g. "5"). Default stays 5% when unset (no row) on client AND server AND admin-load. "0" is valid (0% = no surcharge); empty field → Number("")=0 → 0%. `CARD_SURCHARGE` (0.05) in data.ts is now only the FALLBACK default.
- Campaign orders are cash-only and NEVER get a surcharge. Preorders force online card and DO get the surcharge.
- Coupons: surcharge stays rate*product subtotal; coupon is separate. grand_total = subtotal − coupon + shipping + round(subtotal*rate).

**Why:** customers must see a truthful cash price as the headline and a transparent card up-charge; surcharging shipping would over-charge.

**How to apply:**
- Shared helpers in `client/src/lib/data.ts`: `CARD_SURCHARGE` (0.05), `cardPrice(cash)`, `roundMoney`, `isCashPaymentMethod`; `PaymentOption.surcharge` (nakit 0, others CARD_SURCHARGE) — this replaced the old `PaymentOption.disc`.
- Show the secondary card price with `<CardPriceNote price={cashPrice} />` (muted gray, NOT green — green implies cheaper, but card is dearer). PDP renders its own boxed gray card line inline.
- SERVER recomputes the surcharge independently in the `/api/orders` route and is the source of truth (gateways read the persisted grand_total); never trust client totals. Cash is detected by lowercasing paymentMethod first, then `/nakit/` (so capital "Kapıda Nakit" still matches).
- Cart's free-shipping threshold uses the CASH subtotal, not the surcharged total.
- Client reads the live rate via `useSurchargeRate()` (hook in `client/src/hooks/useSurchargeRate.ts`, backed by `/api/public-settings`); `parseSurchargeRate(percentStr)` → rate, `surchargeLabel(rate)` → "+%5"/"+%7,5". CartContext computes the authoritative client surcharge; checkout/PDP/CardPriceNote all consume the dynamic rate+label. `publicStoreId(req) === reqStore(req).id`, so the displayed rate == the server-charged rate per domain.
- DRIFT GUARD: any new store-scoped setting key (incl `card_surcharge_percent`) must be added to BOTH `STORE_SCOPED_SETTING_KEYS` in server/routes.ts AND the client mirror in `client/src/lib/storeScope.ts` — a test in store-scoping.test.ts ("client STORE_SCOPED_SETTING_KEYS matches the server set") fails on drift.
- `/urun-demo` (product-detail-demo.tsx) keeps hardcoded *1.05 mock math — it's a self-contained demo page, intentionally NOT wired to the configurable rate.
- Some SEO/static copy phrases this as "kapıda nakit %5 indirim" — left intentionally (already %5, acceptable consumer framing; not the old 10% logic).
