---
name: Order-cancel customer SMS
description: Where the buyer-facing "order cancelled" SMS fires and why it must NOT be wired into the auto-cancel paths.
---

# Customer "order cancelled" (iptal) SMS

The buyer-facing cancellation SMS fires only from the admin status route
(`PATCH /api/admin/orders/:id/status`) when an admin manually sets `status === "iptal"`,
alongside the sibling `tamamlandi` (delivered) SMS. It is branded per store via
`storeById(order.sourceSite)` + `resolveSmsHeader` and sent fire-and-forget through NetGSM.

**Why:** `status='iptal'` is ALSO set by `cancelOrderAndRestoreStock()` for stale-pending
timeouts and online-payment failures (Tosla disabled/not-configured/network/init-failed, etc.).
Those orders are abandoned or never-confirmed (payment_status pending/awaiting) — texting those
customers "your order was cancelled" would be wrong/spammy. So the cancel SMS must live only on
the admin's explicit manual-cancel route, NOT inside the auto-cancel helper.

**How to apply:** Guard the send with a status transition check (`prevStatus !== "iptal"` — read the
order's current status before `updateOrderStatus`) so re-selecting "iptal" on an already-cancelled
order does not re-send. Prefer this transition guard over a new schema dedupe flag for these
customer status SMS. If any future admin cancel/refund endpoint is added, route it through the same
notification, and keep auto-cancel paths silent.
