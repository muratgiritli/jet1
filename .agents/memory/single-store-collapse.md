---
name: Single-store collapse (9 → jetgo)
description: The app was permanently reduced to one store (jetgo); how to read the many older multi-store memory notes now.
---

The store roster was permanently collapsed to a SINGLE store `jetgo` (brand Enuygun).
The other 8 stores and all their dead artifacts (SEO corpora, per-store logos, on-disk
sitemap dirs) were removed. The current roster is authoritative in `shared/stores.ts`.

**Why:** owner wanted a single storefront; the multi-store machinery is kept only for
possible future reuse, not because more stores exist.

**How to apply:**
- The multi-store ENGINE is intentionally intact (per-store scoping, brandify,
  google/merchant per-store config, cargo-vs-local commerce model). It still works for
  N stores, but `STORES` currently holds only `jetgo`.
- Read the many per-store / cargo / sibling-leak / per-store-logo / per-store-SEO-override
  memory notes as descriptions of DORMANT capability, not live behavior: there are no
  sibling stores to leak into and no live cargo store.
- Test gotchas after the collapse: admin google/merchant tests target `jetgo`; the
  google "no-op" test needs a fixture with `google: {}` because jetgo itself carries
  real google tags; cargo-path tests must synthesize a cargo store from the jetgo base.
- Sitemaps are served DYNAMICALLY from server routes, NOT from the on-disk `sitemaps/`
  dir (that dir is a dead artifact — editing it changes nothing).
- The 8 retired domains (atakumpetshop.com, atakumpet.com, samsunpet.com,
  karadenizpetshop.com, atakum.biz, jetgo.pet, jetgo.shop, marka.pet — apex+www)
  are permanently 301'd to `DEFAULT_STORE.domain` (www.enuygunpet.com), same path,
  by a middleware in `server/index.ts` that runs BEFORE the canonical-host redirect.
  It redirects EVERYTHING incl /robots.txt + /sitemap*.xml (unlike the canonical
  redirect, which exempts crawler files) because these hosts are dead and must fully
  funnel to the live site. They are no longer in STORES, so without it they'd serve
  default-store content on a 200. jetgomarket.com is NOT legacy — it's a live jetgo host.
