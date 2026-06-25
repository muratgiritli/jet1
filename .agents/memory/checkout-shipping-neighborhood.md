---
name: Checkout shipping / neighborhood selection
description: How local-store shipping fees are resolved at order time and the rule for any structured mahalle (neighborhood) selector on checkout.
---

# Checkout shipping is server-recomputed from the address string

For local (non-cargo) stores the server recomputes shipping on every order by
**substring-matching the submitted `customerAddress`** against active
`delivery_neighborhoods` rows (store-scoped: `store IN ('all', orderStore)`,
"longest matching name wins"). The client's displayed fee is therefore only
trustworthy if the server lands on the same neighborhood.

## Rule: a structured neighborhood selector must send explicit identity

If you add any dropdown/structured mahalle picker at checkout, do NOT rely on the
free-text address match — client and server can diverge (e.g. the detail textarea
contains a different/longer neighborhood name than the one picked).

- Client sends an explicit `neighborhood` (the picked name) in the order payload.
- Server reads it and, when it exactly matches an active row for the order store
  (store-specific row preferred over the `all` row), uses that row's fees
  **before** the legacy substring fallback. No explicit neighborhood ⇒ fallback,
  so stores that don't use the picker are unchanged.

**Why:** all neighborhoods currently share identical fees, so divergence is
invisible today, but it becomes a real mischarge the moment an admin sets
per-neighborhood fees. The exact-match path makes the displayed fee authoritative.

**Future hardening:** prefer `neighborhoodId` over name if duplicate active names
per store scope ever become possible.

# Compute-only payload keys: read from req.body, keep out of the schema

`createOrderSchema.safeParse(req.body)` strips unknown keys, so anything NOT in
the schema (like `neighborhood`) is absent from the validated `orderData` and is
never inserted into the orders table. For a signal needed only for server-side
computation (not persistence), read it directly from `req.body` and leave it out
of the zod schema — this avoids adding a non-existent DB column to the insert.

# Jetgo-only changes stay behavior-identical for the other 8 stores

Gate everything behind a single derived flag (e.g.
`mahalleActive = jetgoModern && !isCargo && !donationDelivery`) and honor the
selection ONLY when that flag is true — in the matched-neighborhood memo, prefill
effect, validation, address composition, and the payload. Toggling
donation/cargo then makes a stale selection inert on both display and submission.
