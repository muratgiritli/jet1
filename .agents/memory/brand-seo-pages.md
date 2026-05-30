---
name: Brand SEO landing pages
description: How JETGO brand landing pages (/{brand}-atakum) are structured and the doorway-content decision behind them
---

# Brand SEO landing pages

Brand pages live in `client/src/lib/brand-seo-data.ts` (builder + per-brand config),
imported and pushed into `SEO_PAGES` by `seo-data.ts`. Rendered by `seo-pages.tsx`
(type === "brand"). Sitemap entries are derived from `BRAND_PAGES` in
`server/routes.ts` sitemap-seo route — never hardcode brand slugs there.

## Decision: quality unique pages, NOT doorway pages
**Rule:** Do NOT mass-generate brand×location doorway pages (e.g. ~1000 brand+Atakum
templated pages). Build a bounded set of genuinely unique pages only for REAL food
brands that have real product inventory.
**Why:** GSC showed existing ~140 templated location pages barely indexed; thin/
duplicate doorway content is a Google penalty risk and wasn't getting indexed anyway.
The real problem was indexing, not URL count.
**How to apply:** Each brand page needs unique intro + sections + brand-specific FAQ.
Exclude generic category buckets that aren't brands (Yaş Mama Çeşitleri, Uygun Çuval
Mamalar, Kedi Konserve). Brand pages omit the WhatsApp order CTA (hideWhatsapp prop +
type-gated bottom CTA); non-brand SEO pages keep WhatsApp.

## Gotcha: brand_slug varies per animal/subcategory combo
buyLinks must use the EXACT `brand_slug` from the `brand_categories` table for each
(animal, subcategory) combo — it is NOT stable across an animal. Verified example:
Reflex köpek = `/kategori/kopek/mama-markalari/reflex-mama` but Reflex kedi =
`/kategori/kedi/kedi-mamasi/reflex`. Always query brand_categories before writing buyLinks.
