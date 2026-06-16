---
name: Per-domain Google independence
description: Why Google tags (GTM/GA4/Ads/GSC) must never be hardcoded in index.html, and how each domain stays an independent Google property.
---

# Per-domain Google independence

Each branded domain must be its OWN Google property (separate GTM, GA4, Ads, Search Console). To keep them independent:

- **Never put Google snippets in `client/index.html`.** A hardcoded snippet runs on ALL domains and cross-contaminates accounts. The template only carries a comment warning against it.
- Google tags are now **DB-backed and admin-editable per domain, no redeploy** (`server/google-tags.ts`): one JSON value per store in `app_settings` key `<storeId>:google_tags`, short-lived in-memory cache invalidated on write, fail-closed to null on DB error. Admin UI = GoogleTagsSection in `client/src/pages/admin.tsx` via `/api/admin/google-tags` (requireAdmin). `StoreConfig.google` in `shared/stores.ts` (`StoreGoogle`: `gtmId`, `ga4Ids[]`, `adsIds[]`, `siteVerification`, `verificationFileId`) is now the **static FALLBACK**, used only when no DB row exists.
- **DB-present-wins:** an explicit DB override fully replaces static — even an empty `{}` override blanks the static tags (intentional: lets admin disable a domain's tags without redeploy). Absence of a row → static fallback. `getStoreGoogleConfig` returns the override (or null); `injectAllMeta` passes `{...store, google: dbGoogle}` to `injectGoogleTags` when present, else the static store. No `all` fallback — exact `<storeId>:` key only, so no cross-domain leak.
- Injection still happens server-side in `injectGoogleTags()` (`server/seo-meta.ts`), called from `injectAllMeta()` so it covers BOTH dev (vite.ts) and prod (static.ts) HTML transforms. Only configured fields are emitted. `injectGoogleTags` signature unchanged.
- Writes whitelist `storeId` against `STORES` (throws "invalid store" → 400) and normalize ids (trim, comma/newline split, dedupe, cap count + length).
- **Why:** the app is one codebase serving 9 branded domains; a shared global tag would merge analytics/verification across unrelated brands. DB-backed lets the owner change tags per domain from admin without a redeploy.
- **How to apply:** to wire a domain, save its `google_tags` from admin (or seed the static `google` block as fallback). To add a new Google surface, extend `StoreGoogle` + `injectGoogleTags` + `normalizeGoogleConfig`, not index.html.
- **Note:** the `/google<ID>.html` HTML-file verification route still reads STATIC `verificationFileId` only (not part of the DB-backed admin UI).

## Sanitization (security)
Config ids are embedded into inline `<script>`/attributes, so they MUST be sanitized: `sanitizeGId()` strips anything outside `[A-Za-z0-9_-]`; GSC meta content is HTML-escaped. Any new id field that lands in markup must pass through the same guard.

## Search Console HTML-file verification
Served by a dynamic route in `server/routes.ts` matching `/google<ID>.html`, returning the file ONLY when the resolved store's `verificationFileId` matches (else 404) — so each domain verifies independently. Route is registered before static serving so it wins. It must not collide with `/google-merchant.xml` (`.xml`, has a dash) or `/yandex_*.html`.
