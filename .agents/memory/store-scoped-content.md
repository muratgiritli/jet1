---
name: Store-scoped content (banners/campaigns/coupons/delivery)
description: How per-domain content scoping works in the multi-domain JETGO/Atakum app, and the rules to keep it consistent.
---

# Store-scoped content

Four subsystems are per-domain while products/stock/orders/customers stay shared:
home banners (table + settings-based: top promo, breed, category, sokak, veteriner), campaigns, coupons, delivery.

## Two scoping mechanisms (keep them consistent)
- **Table rows**: a `store` text column (default `"all"`). Public reads filter `store IN ('all', <hostStore>)`.
- **app_settings keys**: store-prefixed override keys `<store>:<key>` fall back to base `<key>`.

**Rule — only `"all"` is the unprefixed/base bucket.** Every concrete store, INCLUDING the default store (jetgo), uses its own prefix. Do NOT special-case the default store to the base bucket: that makes "Tümü" and the default store indistinguishable for settings (but distinct for rows), an inconsistency that breaks true per-store overrides. Existing unprefixed keys remain valid as the shared fallback (backward compatibility).

## Admin UI rule
A global store selector drives every section. **CREATE sends the selected store; EDIT/toggle/PATCH must NOT send store** — so editing preserves a row's existing store (editing an `all`/shared row keeps it shared). Shared (`all`) rows are intentionally shown + editable from every store view, with a badge.

**Why:** prevents accidental store reassignment on edit, and keeps shared content centrally manageable.

## Gotchas
- Store-prefixed GETs need a custom `queryFn` — the default query fetcher joins the queryKey with "/", so it can't append `?store=`. Use key tuple `[base, store]`; base-key invalidation still prefix-matches it.
- Coupon codes are unique per `(store, code)` (DB unique index on `(store, upper(code))`), NOT globally; lookup and create/update dup-checks must both be store-scoped or they disagree.
- New `store` columns + the coupon index are applied via idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the server bootstrap migrations (this app backfills prod that way; `db push` only covers dev), and the old global `unique(code)` constraint must be dropped.
