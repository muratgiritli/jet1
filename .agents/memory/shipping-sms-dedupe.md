---
name: Shipping tracking SMS dedupe
description: How the "kargoya verildi" tracking SMS fires and is deduped across the tracking and status routes
---

# Shipping tracking SMS dedupe

The "Siparisiniz kargoya verildi" SMS (cargo company + tracking no + URL) is sent
through a single helper that both the tracking PATCH and the order status PATCH
route call. It only sends when cargoCompany + trackingNumber + customerPhone exist
AND the `orders.shipping_sms_sent` dedupe flag is false, then sets the flag.

`updateOrderTracking` resets `shipping_sms_sent` to false (SQL CASE comparing old
vs new) only when the tracking number actually changes, so a re-shipment with a new
number re-notifies but a no-op re-save does not.

**Why:** the SMS used to fire only on the tracking PATCH; moving status to a shipped
state without re-saving tracking left customers uninformed, and naive auto-send would
double-text.

**How to apply:** any new code path that "ships" an order should call the shared
shipment-notify helper rather than re-implementing the SMS. Note the admin UI has NO
shipped/kargoda status option today (statuses: yeni/onaylandi/hazirlaniyor/tamamlandi/iptal);
the status route recognizes shipped statuses (kargoda/kargoya/shipped/in_transit) for
forward-compatibility/API use. If a shipped status is ever added to the admin dropdown,
the auto-SMS already works end-to-end.
