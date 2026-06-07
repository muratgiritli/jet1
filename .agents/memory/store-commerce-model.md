---
name: Per-store commerce model
description: How per-domain fulfillment/payment/preorder behavior is configured and enforced in the multi-domain store.
---

Each `StoreConfig` in `shared/stores.ts` carries a `commerce` block:
`fulfillment: "local" | "cargo"`, `shippingLabel`, `onlinePaymentOnly`, `preorderEnabled`.
`STORES` is resolved per request by host; server uses `reqStore(req).commerce`, client uses `useStore().commerce`.

**Rule:** behavioral differences between domains (cargo vs local delivery, payment restriction,
preorder availability) must be gated by the **store** commerce flag, not only by a per-product flag.

**Why:** product flags (e.g. `product.preorderEnabled`) are shared across all domains since products
are shared. Gating only on the product flag let a cargo-only store (samsun) still accept backorders.
The fix gates preorder/backorder both in client UI (product-detail) AND in `/api/orders` creation
(`prod.preorderEnabled && reqStore(req).commerce.preorderEnabled`). Client-only gating is bypassable.

**How to apply:** when adding a new branded domain or per-domain behavior, add a `commerce` flag,
then enforce it on BOTH sides. Cargo orders carry city/district/cargoCompany/trackingNumber/trackingUrl
on the orders table; admin sets tracking via `PATCH /api/admin/orders/:id/tracking` (carrier allowlist
templates auto-derive trackingUrl). Customer order detail surfaces "Kargom nerede?" link.

**A payment restriction has more than one client surface.** Checkout renders payment options across
several independent blocks (the method picker AND a separate door/installment block AND cash/EFT/QR
info panels), each with its own visibility condition. An online-only restriction must gate ALL of
them — gating only the main picker once let an online-only store still display a door-payment block.
**Why:** the surfaces evolved separately, so a new restriction silently misses the ones added later.
**How to apply:** when adding/auditing any "store X only allows payment method Y" rule, check every
payment block in checkout and confirm each honors the flag; the server already rejects disallowed
methods, so a missed surface is a client-display leak (still wrong), not a security hole.
