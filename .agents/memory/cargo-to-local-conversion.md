---
name: Cargo→local conversion (all 9 stores now local)
description: The 4 last cargo stores became local same-day; what stays dormant and the link-pruning / footprint traps the flip exposes.
---

The 4 previously-CARGO stores — `samsun` (atakumpet.com), `samsunpet` (samsunpet.com),
`karadeniz` (karadenizpetshop.com), `markapet` (marka.pet) — were converted to the
LOCAL same-day Samsun model (commerce = fulfillment "local", shippingLabel
"Getirmesi", onlinePaymentOnly false, preorderEnabled true). There are now ZERO live
cargo stores; all 9 are `fulfillment:"local"`.

**Dormant cargo machinery is RETAINED, not deleted** (no live store exercises it, but
tests/fixtures rely on it): synthetic cargo `StoreConfig` test fixtures; `commercifyFor`
(shared/stores.ts) gated on `fulfillment==="cargo"` → no-op now; `CARGO_COPY_REWRITES`;
the `_cargoSlugMap` build + the `isCargoStore` cargo branch of `findSeoPage` /
`availableSlugSet`; `classifyAvailability`'s `cargoOnly` path. Don't rip these out.

**Trap — internal-link pruning must follow the LIVE commerce model.** A store's
exclusive-page internal links are filtered against a "served slug" set. `findSeoPage` /
`availableSlugSet` resolve a now-local store via `_localSlugMap` (because
`isCargoStore` is false), so the per-store link-pruning blocks in `seo-data.ts` MUST
seed their served set from `_localSlugMap` too. Leaving them on `_cargoSlugMap` (the
old cargo space) silently OVER-PRUNES valid `localOnly` links — and NO test catches
it, because the link tests only assert "no dangling link," never a minimum link
count. When you flip any store cargo→local, flip its link-pruning slug-map source in
lockstep.

**Trap — same-day footprint truthfulness.** Same-day delivery is real only for the
Samsun metro core: Atakum, İlkadım, Canik, Tekkeköy (+ their neighborhoods like
Mimarsinan, Denizevleri, Atakent, Kurupelit, Esenevler...). Do NOT name FAR Samsun-
province districts (e.g. Bafra ~50 km out) in same-day claims/region banks — a
subagent added Bafra and it had to be removed. Replace length-preserving so the
generator's `pick(arr, h, salt)` indices don't shift.

**Pre-existing, out-of-scope gap to flag, not silently fix:** SHARED storeless SEO
pages in `seo-data.ts` still carry "ücretsiz kargo" / "mahalle bazlı kargo ücreti"
wording. These are served on ALL stores incl. jetgo (local all along), so the wording
predates this conversion. Rewriting it touches every store's shared copy — a separate
task; surface it rather than expanding a scoped conversion.
