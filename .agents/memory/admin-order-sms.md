---
name: Admin new-order SMS paths
description: Where the admin "YENI SIPARIS" notification SMS must fire and how it is deduped across payment-completion paths.
---

# Admin new-order notification SMS

The admin "YENI SIPARIS" SMS (driven by app_settings `admin_phone` + `order_notification_sms`,
sent through the shared NetGSM helper) must be triggered from a single helper that is wired into
**every** order-completion path:

- non-online order creation (cash/door/havale) — fires immediately, payment not yet confirmed
- Tosla user redirect callback (success)
- Tosla **server webhook** (success) — easy to forget; this path completes orders even when the
  user never returns to the callback URL
- iyzico callback (success)

**Why:** Online orders are created `pending` and only completed on a payment-success signal. Tosla
has two independent success signals (the browser callback AND the server-to-server webhook). The
webhook path historically had no admin SMS at all, so production completed online orders that never
notified the admin — only OTP SMS were ever seen going to the admin number. Duplicating the SMS
logic inline per-path also made it fragile and non-idempotent.

**How to apply:** Use one helper that (1) reads the settings and early-returns if phone unset or
notifications disabled, (2) atomically claims the order with
`UPDATE orders SET admin_sms_sent=true WHERE id=$1 AND admin_sms_sent=false RETURNING ...`
(exactly-once guard that survives concurrent callback+webhook), then (3) sends. This is at-most-once
delivery (flag claimed before send), matching the existing `shipping_sms_sent` dedupe pattern. When
adding any new order-completion path, wire this helper in too. Keep `admin_sms_sent` in the startup
defensive `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ...` block alongside `shipping_sms_sent` so
production has the column at boot regardless of the publish migration.
