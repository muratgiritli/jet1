---
name: Guest checkout inline OTP confirm
description: How jetgo-only frictionless guest checkout works in checkout.tsx and the phone/race gotchas that block it.
---

# Guest (misafir) checkout — jetgo only

Gated by `store.commerce.guestCheckout === true` (only jetgo). When on, checkout.tsx
suppresses the login/register membership wall, shows an inline name+phone+address
contact section, and confirms the order with a single SMS code in a stripped-down
OTP-only modal (`guestMode`). The OTP verify silently creates/logs into an account
(no signup bonus), so the backend `/api/orders` (needs `session.customerId`) is
unchanged. Other 8 stores keep the wall.

**Why phone normalization is a trap:** the OTP is *sent* for one phone string and
*verified* against another. `doAuthVerify` verifies `authPhone.replace(/\D/g,"")`,
and `formatAuthPhone()` only keeps the first 10 digits. If the send side uses the
raw input (e.g. an `05xx...` 11-digit value) while verify uses the 10-digit
`formatAuthPhone` form, verification silently fails.
**How to apply:** derive the send number from the SAME `formatAuthPhone(...)` value
that verify uses, and canonicalize the guest phone input to 10 national digits
(strip a leading `0`, cap at 10). Keep send == display(`authPhone`) == verify.

**Why the order can be placed twice:** a trusted-device `/api/otp/send` response
places the order directly (no code entry), and the OTP-verify path also places it —
plus rapid double-clicks. **How to apply:** guard with synchronous refs, not just
React loading state — `placingOrderRef` around `placeOrder` (reset in `finally`,
which still runs on the online-payment `window.location` redirect+return) and a
start guard around `startGuestOrder`.
