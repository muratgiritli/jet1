---
name: Store-scoped content (banners/campaigns/coupons/delivery)
description: How per-domain content scoping works across server + admin UI in the multi-domain JETGO/Atakum app.
---

# Store-scoped content

Four subsystems are domain-specific while products/stock/orders/customers stay shared:
home banners (table `banners` + settings-based: top promo, breed, category, sokak, veteriner), campaigns, coupons, delivery neighborhoods.

## Two scoping mechanisms
- **Table rows** (banners, campaign_items, coupons, delivery_neighborhoods): each has a `store` text column default `"all"`. Public reads filter `store IN ('all', <hostStore>)`. Admin GET returns ALL rows incl `store`; client filters by selected store.
- **app_settings keys**: store-prefixed override keys `<store>:<key>` fall back to base `<key>`. `settingsPrefix(store)` returns `""` for `all` AND for DEFAULT_STORE (jetgo) → both write base keys (backward-compat). Only `STORE_SCOPED_SETTING_KEYS` get prefixed; everything else (payment, loyalty, pet) stays base/shared even when a store is selected. Breed/category/top banner setting routes use their own `writeStoreSettings`/`settingsPrefix` + `resolveSettingsLike`, NOT the key set.

## Server helpers (server/routes.ts, top of registerRoutes)
`publicStoreId(req)` = getStoreByHost(req.hostname).id (public reads). `adminStoreId(req)` reads `?store=` OR `body.store`, defaults `"all"`. Public banner GETs also accept `?store=` override (via isValidStore) so admin can preview a store.

## Admin UI rule (client/src/pages/admin.tsx)
Global `useAdminStore()` (localStorage "admin-store", default "all"). **CREATE sends `store: adminStore`; EDIT/toggle/PATCH must NOT send store** so a row keeps its existing store (editing an `all` row keeps it shared). Shared (`all`) rows are intentionally shown+editable from every store view with a "Tüm Siteler" badge — editing one affects all stores by design.

**Why:** prevents accidental store reassignment on edit, and keeps shared content centrally manageable.

**How to apply:** any new store-scoped admin section: store-prefixed GET needs a custom `queryFn` (the default fetcher joins queryKey with "/" so it can't add `?store=`); use key tuple `[base, adminStore]` — base-key invalidation still prefix-matches it. Coupon code validation is app-level scoped to `store IN ('all', currentStore)` (no DB unique(code)).
