---
name: Order payment_status / visible-order rule
description: When an order counts as a real (paid) order vs an unpaid online-checkout attempt
---

# Order payment_status semantics

Online card orders (iyzico / Tosla / "online") are inserted into `orders` BEFORE payment
completes — `payment_status = 'pending'` (then `'awaiting'` while the gateway page is open),
and **stock is decremented at creation time**, not at payment success. On success the
callback sets `'completed'`; on failure `'failed'` + `status = 'iptal'`.

- `payment_status` schema default is `'completed'` → cash/kapıda orders are always "paid/visible".

## Visible-order rule (apply consistently)
An order should only be shown/counted as a real order when
`payment_status NOT IN ('pending','awaiting')`. This is the criterion the new-order
notification queries use, and the admin order list (`/api/admin/orders`) must use it too —
otherwise unpaid online attempts surface in admin as if payment was received.
**Why:** users saw orders appear in admin as "online ödeme" the moment the iyzico page opened,
before any payment was taken.
**How to apply:** any new endpoint that lists/counts orders for admin/reports should filter
out `pending`/`awaiting` payment_status (consider centralizing this criterion).

## Stale-pending cleanup (TTL)
Abandoned pending/awaiting online orders (gateway page closed without paying) keep stock
reserved. A periodic cleanup in registerRoutes cancels them: orders with payment_status
IN ('pending','awaiting'), status <> 'iptal', older than STALE_PENDING_MINUTES (30) are
passed to `cancelOrderAndRestoreStock` (sets failed/iptal + restores stock via stock_movements).
Runs on startup and every 10 min. Reuses the same restore path as payment-failure callbacks.
