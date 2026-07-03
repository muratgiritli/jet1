---
name: Homepage internal-link guard
description: store-scoped homepage React link blocks bypass the SeoPageData orphan test; extract to a shared module + assert
---

Hardcoded internal-link blocks rendered by React (e.g. landing.tsx
"Popüler Atakum Aramaları" / RegionLinks) are NOT covered by
store-scoping.test.ts's orphan-internal-link test — that test only scans
`SeoPageData.internalLinks`, never JSX.

**Why:** such a link can silently 404 if the target keyword/slug is later
dropped from a store's corpus, and nothing fails.

**How to apply:** keep the link list in a shared pure-TS module (e.g.
`client/src/lib/atakum-popular-searches.ts`), import it in BOTH the component
and the test, and assert every `href` resolves in `availableSlugSet(<store>)`.
Self-gate store-specific blocks (`if (store.id !== "atakum") return null`)
so the other 8 stores render nothing extra.
