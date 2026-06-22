---
name: Eager store.ts bundle — keep the SEO corpus out
description: client/src/lib/store.ts loads before React; importing the heavy seo-data corpus into it stalls every page open.
---

Rule: `client/src/lib/store.ts` is an EAGER module — `main.tsx` resolves
`CURRENT_STORE` and applies branding before React mounts, and the always-rendered
chrome (Header/Footer/SEO/Logo) all import from it. Never statically import the
`seo-data` corpus (or any other module that does heavy module-load work) into
`store.ts` or anything else on the eager path.

`seo-data` builds tens of thousands of SEO pages at module-load with several
`new Set` dedup loops; pulling it eagerly makes EVERY page open synchronously
load+execute the whole corpus before first paint. The seo-data-dependent store
helpers (`storePages`, `findStorePage`, `filterStoreLinks`) live in
`client/src/lib/store-seo.ts`, which imports `seo-data` and is imported ONLY by
lazy SEO routes (`seo-pages.tsx`, `ad-landing.tsx`), keeping the corpus in a lazy
chunk (~1.14MB built) instead of the eager bundle.

**Why:** As the per-store SEO corpus grew (many `keyword-pages-*-all.ts` files),
store.ts's static `import ... from "./seo-data"` silently became a ~1.14MB eager
dependency, making all branded storefronts slow to OPEN ("yavaş açılıyor … SEO
sayfalarından sonra"). The fix dropped the seo-pages chunk 285KB → 11.5KB.

**How to apply:** Keep store.ts dependent only on `@shared/stores` (light). If a
helper needs seo-data, put it in store-seo.ts and import it from a lazy route. A
guard test in `server/__tests__/store-scoping.test.ts` ("eager-bundle guard")
fails if store.ts imports `./seo-data` again. Server-side seo-data imports
(`routes.ts` / `seo-meta.ts`) are a separate concern — startup-time, not browser
first paint.
