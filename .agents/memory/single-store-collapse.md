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
- 9 retired domains (atakumpetshop.com, atakumpet.com, samsunpet.com,
  karadenizpetshop.com, atakum.biz, jetgo.pet, jetgo.shop, marka.pet, AND
  jetgomarket.com — apex+www) are permanently 301'd to `DEFAULT_STORE.domain`
  (www.enuygunpetshop.com), same path, by a middleware in `server/index.ts` that runs
  BEFORE the canonical-host redirect. It redirects EVERYTHING incl /robots.txt +
  /sitemap*.xml (unlike the canonical redirect, which exempts crawler files) because
  these hosts are dead and must fully funnel to the live site. They are no longer in
  STORES, so without it they'd serve default-store content on a 200.
- The internal `store.id` is STILL `"jetgo"` after the Enuygun rebrand — never derive a
  DISPLAYED brand string from `store.id` (e.g. `store.id === "jetgo" ? "jetgo" : ...`),
  or the old brand leaks into the UI (this bit the bespoke desktop-home wordmark in
  `demo-anasayfa.tsx`). Display brand comes from `store.shortName` / `store.brandWord`
  / `brandify()`; `store.id` is an internal key only.
- jetgomarket.com was the ORIGINAL brand domain of the surviving store; it is now
  FULLY retired too (removed from jetgo.hostnames; www.enuygunpetshop.com is the SOLE
  live host). BUT the brandify SOURCE is still the hardcoded literal "jetgomarket.com"
  / "JETGO" (in `brandifyFor` + the index.html/llms.txt corpus) — that is independent
  of hostnames and MUST stay, or serve-time rewriting to Enuygun breaks.
- Brand assets are Enuygun: `client/public/favicon-{512,192}.png` + `favicon.png` +
  `favicon.webp` = a white "E" monogram on a purple gradient; `og-image.webp`
  (1200x630, previously MISSING → og:image was broken) = purple gradient + the real
  `logo-enuygun.webp` wordmark + a TR slogan. Regenerate via
  `node scripts/gen-brand-assets.cjs` (sharp). Admin export download filenames are
  `enuygun_*` (xlsx/yml), not `jetgo_*`; client localStorage keys stay `jetgo_*`.
