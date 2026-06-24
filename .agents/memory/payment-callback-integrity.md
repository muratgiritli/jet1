---
name: Payment callback integrity (Tosla)
description: Why public payment callbacks must enforce the gateway signature, and why cancelling an order must also fail its pending payment tokens.
---

# Tosla callback/webhook must enforce the signature Hash

Both `/api/tosla/callback` (buyer's browser return, redirects) and
`/api/tosla/webhook` (server-to-server, always 200) are PUBLIC and their
success fields (`Code`/`BankResponseCode`/`MdStatus`/`RequestStatus`) are
attacker-controllable. The buyer also knows their own `merchantOrderId` token
(`JET{id}T{base36}`, returned at payment init). So success fields alone must
NEVER complete an order.

**Rule:** require a valid Tosla `Hash` before honoring success. Compute
`expected` with the merchant secret keys (`tosla_api_pass`/`client_id`/
`api_user`) via the shared `toslaCallbackHash` formula; only proceed when
`callbackHash present AND expected === callbackHash`.

**On invalid/absent hash:** do NOT complete and do NOT cancel — callback returns
`failRedirect` (order stays pending), webhook returns `sendOk()` (acks without
transitioning). Never cancel based on unauthenticated data; let the other
channel or the 45-min stale-pending cleanup resolve it.

**Why:** before this, the code only `console.warn`'d on hash mismatch, so a buyer
could POST the public callback with forged success fields + no hash to mark a
`pending`/`awaiting` order `completed` without paying.

**iyzico is different — leave it.** iyzico trust comes from a server-to-server
`checkoutForm.retrieve` using merchant secrets + the DB-stored token, so its
callback isn't forgeable. Do NOT add an amount check there: installment payments
have `paidPrice != price` and it would break legit orders.

# Cancelling an order must also fail its pending payment tokens

When `cancelOrderAndRestoreStock` (stale-pending cleanup, tosla-disabled, init
failures) cancels an order and restores stock, it must also set any
`tosla_payment_tokens`/`iyzico_payment_tokens` for that order from `pending` to
`failed`.

**Why:** stale-cleanup used to restore stock but leave the token `pending`. A
late but VALID gateway callback could then claim the still-pending token and
(a) restore stock a SECOND time (inventory inflation), or (b) mark the token
`completed` while the order is already `iptal` (paid-but-cancelled mismatch).
Failing the token makes the late callback hit the `status === 'failed'`
idempotency early-return, so no double-restore and no zombie completion.

**Residual edge (not code-fixable, needs business call):** if a buyer genuinely
pays in the narrow window right after the 45-min cleanup cancels their order,
they see "failed" but money may be captured → manual refund/reconciliation.
