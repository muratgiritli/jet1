---
name: Per-request store resolution (proxy-safe)
description: How to resolve the active store/domain from a request, and which SMS/SEO surfaces are per-domain vs shared.
---

# Resolving the active store from a request

**Rule:** public/host-based store resolution must read the forwarded host, not the raw socket hostname.
Use `reqStore(req)` → `getStoreByHost(x-forwarded-host || host || req.hostname)`.
`publicStoreId(req)` and order `sourceSite` both go through `reqStore`.

**Why:** behind the deployment proxy `req.hostname` is the internal host, so `getStoreByHost(req.hostname)`
silently falls back to the default store (jetgo). That misroutes branded content, the order's `sourceSite`,
and therefore every customer-facing SMS (header + message branding) for atakum.

**How to apply:** any NEW public endpoint that needs the current domain/brand must use `reqStore(req)`.
Admin endpoints use `adminStoreId(req)` instead (reads `?store=`/`body.store`); admin client calls MUST send
that param or they default to `"all"`.

# Per-domain SMS

- `sendSmsViaNetgsm(phone, msg, msgheaderOverride?)` — override falls back to env `NETGSM_MSGHEADER` when undefined.
- `resolveSmsHeader(storeId)` reads store-scoped `sms_msgheader` app_setting; returns undefined when unset → env default.
  So a store stays on the default header until an admin sets one. **The override must be a NetGSM-approved sender
  name or sends fail.**
- Customer-facing SMS (OTP, havale, post-delivery) + bulk SMS are per-store. Admin *notification* SMS intentionally
  stays on the env default header.
- Post-delivery copy keeps the `JETGO50` coupon line ONLY for store id `jetgo`; other stores get coupon-free copy.
  Never run `brandifyFor` over `JETGO50` — it would corrupt the coupon code.

# Per-domain SEO

- sitemap.xml/-main/-products/-seo, robots.txt, google-merchant.xml, llms.txt derive `SITE`/brand from `reqStore(req)`.
- Admin exports (`/api/export/xlsx`, `/api/export/yml`) derive from `storeById(adminStoreId(req))`; yml filename is `<storeId>_urunler.yml`.
