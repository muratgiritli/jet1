---
name: Test runs burn real SMS credits
description: Why every SMS send path must short-circuit under TEST_OTP_BYPASS, and how SMS-asserting tests opt back in.
---

# E2E test runs silently burn real SMS credits

OTP was bypassed in tests, but the **order/admin/shipping/cancel/IBAN SMS paths were not** —
they call the shared NetGSM sender directly. The e2e suite places real orders across every
store on each run, and the `test` workflow auto-runs on every file save, so each save fired
a batch of real "siparişiniz alındı"/"YENİ SİPARİŞ"/tracking SMS to the suite's fake 5XX
numbers (e.g. 5550000000). They queue at NetGSM (response `00`) but never deliver
("Ulaşan 0/1"), quietly draining the SMS balance — thousands of records accumulated this way.

**Rule:** the single NetGSM sender must short-circuit (return success, no network) whenever
`isTestOtpBypass()` is true. Keep ONE sender so ONE guard covers every SMS surface.

**Why:** the suite doesn't assert on most of these sends, so they passed green while burning
money. A guard at the sender is the only place that's guaranteed to cover all current and
future SMS callers.

**How to apply:** tests that genuinely need to verify SMS logic (count/payload) mock global
`fetch` AND set an explicit opt-in flag (`TEST_SMS_CAPTURE=1`) so the guard lets them run the
real sender logic against the mock — no real network. Restore the flag with the other env in
the capture's teardown. Never gate SMS suppression on creds presence alone: dev/test inherits
real NetGSM creds, so cred-present + real fetch = real send.
