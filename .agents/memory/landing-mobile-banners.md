---
name: Mobile homepage banner sources
description: Which landing.tsx mobile banners are admin-managed vs hardcoded, and the dead-code HeroCarousel trap
---

# Mobile homepage (landing.tsx) banner architecture

The mobile homepage is `landing.tsx` (rendered when `isMobile`; desktop returns
`DemoAnasayfaEmbed`). `HeroCarousel` is **dead code** — defined but never rendered
(`<HeroCarousel` appears nowhere). Don't wire features into it expecting them to show.

**Desktop homepage = `demo-anasayfa.tsx`** (mounted via `DemoAnasayfaEmbed` with
`embedded` defaulting to **false**, so its `!embedded` header AND footer DO render in
production — including a "DEMO TASARIM • Sadece önizleme" footer badge). It began life
as a static "demo" with hardcoded jetgo branding, so any per-store branding work must
touch it explicitly: it reads `useStore()` for the wordmark and gates delivery/payment
copy on `store.commerce.fulfillment === "cargo"` (cargo stores like samsun show
country-wide-kargo + online-only copy; local stores keep "Atakum içi 1 saatte" copy).
**Why:** SEO/meta auto-brandify but this visible body did not, so samsun/atakum showed
jetgo text + false "1 saatte teslim" claims until wired manually. Keep the jetgo
wordmark lowercase ("jetgo") — `brandify`/`brandWord` uppercases it to "JETGO".

**Admin-managed banners** (already editable): TopBanner, HomeBanners (`home_top`),
HomeBannersBelowCategory (`home_below_category`), HomeBottomCarousel
(`home_bottom_carousel`) via the banners CRUD table; BreedBannersRow
(`/api/public/breed-banners`), CategoryBannersStack (`/api/public/category-banners`).

**"Header altı" store banner = TopBanner** (settings-driven `top_banner_*`), NOT the
banners-CRUD `home_top`. TopBanner renders ONLY inside `landing.tsx` (mobile home →
home-only), shows to ALL users, and **falls back to a bundled `@assets` store photo
when `top_banner_image` is empty** so it appears in prod with NO prod DB write and
stays admin-overridable (image+link) via admin's "Mağaza Banner (Ana Sayfa)" section
(`TopPromoBannerAdmin`, PATCH `/api/admin/top-banner`). Hidden only when admin sets
`enabled=false`. Do NOT re-add a hardcoded banner in `Header.tsx` — that leaked onto
every page. **Trap:** the banners-CRUD `home_top` row (e.g. old "üst", prod-only) also
renders on mobile home via HomeBanners and will STACK below TopBanner; it's separate
live admin data (prod DB read-only to agent) — user must delete it in the Banner list.

**Simple settings-driven banners** (Sokak Canları, Veteriner Maması): image+link
override stored in `app_settings` keys `sokak_banner_image/_link`,
`veteriner_banner_image/_link`, served via `/api/public-settings`, saved via generic
`PATCH /api/admin/settings`. Components fall back to a static `@assets` default when
the override is empty.

**Why:** generic settings PATCH bypasses the per-endpoint sharp resize the banner-CRUD
and breed/category endpoints use, so image/link keys need explicit size/length/link
normalization guards inside the settings PATCH loop, or large base64 payloads slip in
via direct API calls.
