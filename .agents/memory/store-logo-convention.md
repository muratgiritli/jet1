---
name: Per-store logo convention
description: New branded-store logos must be WHITE wordmarks in raster webp; SVG <img> logos render blank in this app.
---

# Per-store logo asset rules

Each `StoreConfig.logo` is rendered by `Logo.tsx` as `<img src={logo}>` inside
`Header.tsx`, whose top bar background is `theme.topBar` (a dark brand color).
So a store logo MUST be a **white** wordmark — a dark/colored logo disappears on
the colored header, and the `Logo.tsx` text fallback (only fires when `logo` is
falsy) is `hsl(var(--primary))` which is also invisible on the same-hued bar.

**Use raster `webp`, not SVG.** An SVG referenced via `<img src=...>` rendered
blank in the running app/preview even though the file served HTTP 200. All
shipping store logos are `.webp`. When no logo asset exists for a new store,
generate one: author a white-text SVG wordmark, then rasterize with `sharp`
(`sharp(svg, { density: ~384 }).resize({ width: ~620 }).webp({ alpha: true })`)
and verify it has opaque white pixels before wiring it up. Don't keep the SVG
source around — match the webp-only convention.

**Why:** a white SVG wordmark looked correct as a file but showed nothing in the
header (blank logo slot); switching the exact same artwork to webp fixed it.

**Note:** the desktop home `demo-anasayfa.tsx` does NOT use this logo image at
all — it renders the brand as hardcoded-purple TEXT (`store.shortName`), so per-
store logo/theme colors only surface on `Header.tsx` pages + `main.tsx`
`--primary`, never on the desktop homepage. Don't judge a new store's logo/theme
by the desktop home screenshot; check an inner page (e.g. a category page).
