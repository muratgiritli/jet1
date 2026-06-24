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

**Banners exception:** table banners (BannerEditRow + BannersListSection create form) now expose an EXPLICIT per-site "Site" dropdown that DOES send `store` on edit, so admins can convert a shared `all` banner to a specific site (or back). Server PATCH `/api/admin/banners/:id` accepts `body.store` (validated via `isValidStore`, `all` is valid); `storeContextConflict`/`blockedByStoreContext` still allow reassigning shared (`all`) rows. This deliberate-dropdown reassignment is banner-only; campaigns/coupons/delivery still follow the no-store-on-edit rule.

## Settings-based banner "delete" trap
The top promo banner (`top_banner_*` app_settings) and similar image-settings banners: clearing the image writes `<store>:top_banner_image=""` but does NOT disable. `TopBanner` requires a non-empty image to render (returns null on empty — no bundled-default fallback), so an empty per-store image hides the banner for that site while base/other sites keep theirs. Admin "Görseli sil" copy says it hides the banner. `enabled` flag is a separate master switch.

## Shared-edit protection (two layers + a settings layer)
- **Row tables** (banners/campaign_items/coupons/delivery_neighborhoods): client `confirmSharedEdit` + amber "Tüm Siteler (ortak)" badge on every edit/toggle/delete control in a specific-store view, plus server `blockedByStoreContext` on every PATCH/DELETE. CREATE assigns `adminStoreId`.
- **Store-scoped app_settings keys** (the `<store>:`-prefixed set): inherently safe in a specific-store view — writes go to the prefixed override, never the shared base. No silent shared edit possible.
- **GLOBAL (non-store-scoped) app_settings keys** (payment API CREDENTIALS, bank IBAN/info, loyalty/puan, pet feeding, cross-sell, admin phone): editing these from a specific-store view writes the shared BASE and affects ALL sites. The big admin settings form warns via `confirmSharedSettingsSave` — only when a global key actually changed (store-scoped-only edits don't warn). The client shared-edit helpers + `STORE_SCOPED_SETTING_KEYS` live in `client/src/lib/storeScope.ts` (moved out of `admin.tsx` for testability); keep that set in sync with the server `STORE_SCOPED_SETTING_KEYS` (inline in `routes.ts`) or the warning misfires.

## Payment-method on/off toggles are STORE-SCOPED; credentials stay GLOBAL
The 7 `payment_*_enabled` toggle keys (nakit, kart/POS, qr, eft/havale, tosla, iyzico, plus the door-payment master) are in `STORE_SCOPED_SETTING_KEYS` — each site decides which methods it offers. But the Tosla/iyzico API CREDENTIALS (`tosla_*`, `iyzico_*`) and bank IBAN/info are NOT scoped — they resolve to the shared base. Admin writes keep credentials global automatically because credential keys aren't in the scoped set (written unprefixed). `getToslaConfig(store)`/`getIyzicoConfig(store)` read both toggle + creds via `resolveSettings`, so a manually/stale-inserted `<store>:tosla_*` row WOULD be honored — only a theoretical edge case, normal UI can't create one.

**Critical — gate EXISTING orders by the order's own store, not the request host.** Payment toggles resolve per-store, and the public request host (`reqStore`/`x-forwarded-host`) is attacker-mutable. `/api/{tosla,iyzico}/init-payment` must `SELECT source_site` and call `get*Config(o.source_site || reqStore(req).id)`, else a buyer opens the hosted-payment page via a *different* branded domain whose toggle is on and bypasses the owning store's "online card off" policy. Order CREATE gates on `reqStore(req).id` (correct — that's the storefront it's placed on). Callback/webhook callers keep default `"all"` (credentials-only, safe). Regression test: `payment-init enforces the order's store toggle, not the request host`.

**Why:** the original implementation read toggles off the request host for existing orders → host-swap bypass (architect-flagged blocking access-control issue). `bank_iban` is the canonical still-global key to use in `confirmSharedSettingsSave` tests — do NOT use a `payment_*_enabled` key as the "global" example, it's now store-scoped.

## Test coverage
`server/__tests__/store-scoping.test.ts` (run via the `test` validation workflow) now also guards this protection: server `blockedByStoreContext` (403 on cross-store PATCH/DELETE, allow shared `all`), client `confirmSharedSettingsSave` warn/skip logic, and a drift test asserting the client `STORE_SCOPED_SETTING_KEYS` equals the server set (parsed from `routes.ts` source). It forges an admin session (requireAdmin only checks `session.userId`).

## Gotchas
- Store-prefixed GETs need a custom `queryFn` — the default query fetcher joins the queryKey with "/", so it can't append `?store=`. Use key tuple `[base, store]`; base-key invalidation still prefix-matches it.
- Coupon codes are unique per `(store, code)` (DB unique index on `(store, upper(code))`), NOT globally; lookup and create/update dup-checks must both be store-scoped or they disagree.
- New `store` columns + the coupon index are applied via idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the server bootstrap migrations (this app backfills prod that way; `db push` only covers dev), and the old global `unique(code)` constraint must be dropped.
