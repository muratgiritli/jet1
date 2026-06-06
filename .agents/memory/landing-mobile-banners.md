---
name: Mobile homepage banner sources
description: Which landing.tsx mobile banners are admin-managed vs hardcoded, and the dead-code HeroCarousel trap
---

# Mobile homepage (landing.tsx) banner architecture

The mobile homepage is `landing.tsx` (rendered when `isMobile`; desktop returns
`DemoAnasayfaEmbed`). `HeroCarousel` is **dead code** — defined but never rendered
(`<HeroCarousel` appears nowhere). Don't wire features into it expecting them to show.

**Admin-managed banners** (already editable): TopBanner, HomeBanners (`home_top`),
HomeBannersBelowCategory (`home_below_category`), HomeBottomCarousel
(`home_bottom_carousel`) via the banners CRUD table; BreedBannersRow
(`/api/public/breed-banners`), CategoryBannersStack (`/api/public/category-banners`).

**Simple settings-driven banners** (Sokak Canları, Veteriner Maması): image+link
override stored in `app_settings` keys `sokak_banner_image/_link`,
`veteriner_banner_image/_link`, served via `/api/public-settings`, saved via generic
`PATCH /api/admin/settings`. Components fall back to a static `@assets` default when
the override is empty.

**Why:** generic settings PATCH bypasses the per-endpoint sharp resize the banner-CRUD
and breed/category endpoints use, so image/link keys need explicit size/length/link
normalization guards inside the settings PATCH loop, or large base64 payloads slip in
via direct API calls.
