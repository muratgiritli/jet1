---
name: Per-domain Google independence
description: Why Google tags (GTM/GA4/Ads/GSC) must never be hardcoded in index.html, and how each domain stays an independent Google property.
---

# Per-domain Google independence

Each branded domain must be its OWN Google property (separate GTM, GA4, Ads, Search Console). To keep them independent:

- **Never put Google snippets in `client/index.html`.** A hardcoded snippet runs on ALL domains and cross-contaminates accounts. The template only carries a comment warning against it.
- Google tags are config-driven per store: `StoreConfig.google` (`StoreGoogle`: `gtmId`, `ga4Ids[]`, `adsIds[]`, `siteVerification`, `verificationFileId`) in `shared/stores.ts`. Empty `{}` = that domain emits ZERO tags/verification.
- Injection happens server-side in `injectGoogleTags()` (`server/seo-meta.ts`), called from `injectAllMeta()` so it covers BOTH dev (vite.ts) and prod (static.ts) HTML transforms. Only configured fields are emitted.
- **Why:** the app is one codebase serving 9 branded domains; a shared global tag would merge analytics/verification across unrelated brands.
- **How to apply:** to wire a domain, fill ONLY that store's `google` block. To add a new Google surface, extend `StoreGoogle` + `injectGoogleTags`, not index.html.

## Sanitization (security)
Config ids are embedded into inline `<script>`/attributes, so they MUST be sanitized: `sanitizeGId()` strips anything outside `[A-Za-z0-9_-]`; GSC meta content is HTML-escaped. Any new id field that lands in markup must pass through the same guard.

## Search Console HTML-file verification
Served by a dynamic route in `server/routes.ts` matching `/google<ID>.html`, returning the file ONLY when the resolved store's `verificationFileId` matches (else 404) — so each domain verifies independently. Route is registered before static serving so it wins. It must not collide with `/google-merchant.xml` (`.xml`, has a dash) or `/yandex_*.html`.
