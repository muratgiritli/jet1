---
name: Per-store SEO page overrides
description: How to give ONE store its own bespoke version of a SHARED SEO landing slug without leaking to sibling domains.
---

# Per-store SEO page overrides (storeId)

To give a single store its OWN, independent version of a landing page that
otherwise belongs to the SHARED, auto-brandified corpus, tag a `SeoPageData`
with `storeId`. That page then REPLACES the shared page at the same slug **only
on that store**, while every sibling domain keeps the shared (brandified)
version. Slug stays identical (same URL, different content) — this is an
override, not a `/store/<slug>` namespace.

**Why:** Most multi-domain SEO is shared + auto-brandified per host (see
multi-domain-branding.md). But occasionally one domain needs genuinely distinct
first-party content for a slug (real NAP, hours, neighbourhoods, delivery
promise) that can't just be a brand-word swap. `storeId` is the escape hatch.

**How to apply:**
- Resolution lives in `seo-data.ts`. storeId pages are collected into a
  per-store override map and are kept OUT of the shared local/cargo slug maps.
  `findSeoPage(slug, store)` checks the store's override first, then falls back
  to the shared map for the store's commerce model. `availableSlugSet` unions
  override keys; `getSeoPagesForStore` serves a store's own storeId pages (only
  if their availability fits the store's commerce model) and DROPS the shared
  page wherever that store has an override.
- Only override slugs whose shared page is itself `type==="keyword"`. NEVER
  replace curated core/district/brand pages with templated ones — guard with a
  `_sharedTypeBySlug` check before pushing the overrides.
- Overrides REPLACE 1:1, so the store's corpus size and slug set stay identical
  to a sibling's; assert this (parity + uniqueness) to catch accidental dupes.
- storeId pages must carry their own `availability` (e.g. localOnly) so they
  stay hidden on incompatible commerce models (a localOnly override is invisible
  on a cargo store).
- Truthfulness: keyword pages echo the keyword in the title for intent, but if a
  keyword implies a claim the store can't meet (e.g. "24 saat/7-24/gece" while
  hours are 09:00–21:00) add an explicit clarifying FAQ stating the real hours,
  so Google/AI never see a misleading claim.
- Bundle cost: the whole corpus (incl. one store's hundreds of overrides) ships
  to ALL clients via seo-data.ts. Acceptable today but monitor JS weight; if it
  regresses, move SEO generation/metadata server-side.
