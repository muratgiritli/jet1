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
