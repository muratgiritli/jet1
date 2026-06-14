---
name: e2e rate-limit isolation in store-scoping tests
description: Why each new e2e OTP/order test must run under its own client IP, not the shared localhost bucket.
---

# E2E OTP/order tests must use a per-test client IP

The store-scoping test suite mounts the real routes with `trust proxy` on, so
`req.ip` (and thus every per-IP rate-limit bucket) is driven by the request's
`X-Forwarded-For`. When a test omits XFF, all its requests land in ONE shared
localhost bucket alongside every other e2e test.

**Rule:** any NEW end-to-end OTP-bypass + order flow you add must send a unique
`X-Forwarded-For` (a TEST-NET IP like `203.0.113.x`) on its otp/send, otp/verify
and order POSTs. `post()` / `postWithCookie()` take an optional trailing `xff`
arg for exactly this.

**Why:** the order route is rate-limited per IP (a modest hourly cap, ~20). With
each storefront's e2e flow doing 1–2 order POSTs (cargo flows do a door-reject +
a success), the cumulative count on the shared bucket sits right at the edge.
Adding the 4th cargo brand's flow on the shared IP tipped it over and made the
LATER, unrelated jetgopet/jetgoshop e2e tests flake to HTTP 429 (expected 201) —
a confusing failure that looks unrelated to the change that caused it.

**How to apply:** when adding a storefront, copy the cargo/local e2e pattern AND
give the new flow its own `xff` IP so it never accumulates into the shared
bucket. This keeps the shared bucket's count identical to before your change.
Ideal long-term: every e2e OTP/order flow gets its own XFF; today only the
newest flow is isolated.
