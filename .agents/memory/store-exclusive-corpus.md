---
name: Store-exclusive landing-page corpora
description: Two shapes a single store can own an exclusive SEO corpus, plus the sitemap + test invariants that break when adding one.
---

A store can OWN an exclusive landing-page corpus in TWO distinct shapes (all pages
tagged `storeId`, `availability:"localOnly"`, `type:"keyword"`):

- **OVERRIDE corpus** (atakum): same slugs as the SHARED corpus, replaced 1:1 on
  that one domain. Integration filter keeps only pages whose shared slug already
  exists with `type==="keyword"`. Corpus size == shared local corpus (no new URLs).
- **NEW-SLUG corpus** (jetgo Pro Plan): brand-new slugs NOT in the shared corpus.
  Integration filter keeps a page UNLESS its slug collides with a NON-keyword
  curated shared page (collisions with a shared keyword page are an allowed
  override). This ADDS URLs, so the store's corpus is larger than a sibling's.

**Sitemap rule:** `getSitemapPagesForStore` must bypass the hash partition for a
store's own exclusives — `p.storeId === store.id || ownsSitemapSlug(...)`. Without
the `storeId===store.id` clause, a store that is in a partition group silently
drops most of its own exclusive pages from its sitemap.

**Why / test invariants that break:** when a local store gains its own exclusives,
two older invariants become wrong and must be relaxed (not deleted):
- "no store sees ANY exclusive page" → "no FOREIGN exclusive leaks", i.e. filter
  `p.storeId && p.storeId !== store.id`. A store legitimately sees its OWN.
- 1:1-override parity (corpus size + slug set) must be measured against a CLEAN
  sibling that owns no exclusives (e.g. jetgopet), NOT against a store that now
  owns a NEW-SLUG corpus (jetgo), or parity fails by the size of that corpus.

**How to apply:** adding any further store-exclusive corpus will reproduce these
exact two test breakages and require the sitemap bypass. `getSeoPagesForStore`
already gates exclusives by `storeId===store.id`, so leakage to siblings/cargo is
prevented at the source.
