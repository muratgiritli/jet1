// SEO-corpus-dependent store helpers. Kept OUT of ./store on purpose: ./store is
// imported eagerly (main.tsx resolves CURRENT_STORE before React mounts, and most
// eager components — Header/Footer/SEO — import from it). Statically importing the
// large seo-data corpus there forced the entire SEO page set (tens of thousands of
// entries + dedup loops) to load and run on EVERY page open, before first paint.
// These helpers are only used by lazy, SEO-only pages (seo-pages, ad-landing), so
// importing them from here keeps seo-data in those lazy chunks instead.
import {
  findSeoPage,
  getSeoPagesForStore,
  availableSlugSet,
  ALL_SEO_SLUGS,
  type SeoPageData,
} from "./seo-data";
import { CURRENT_STORE } from "./store";

/** SEO pages eligible for the active store's commerce model. */
export function storePages(): SeoPageData[] {
  return getSeoPagesForStore(CURRENT_STORE);
}

/** Resolve a slug to the variant served by the active store (or undefined). */
export function findStorePage(slug: string): SeoPageData | undefined {
  return findSeoPage(slug, CURRENT_STORE);
}

/**
 * Drop internal/buy links that point to SEO pages not served by the active
 * store (e.g. local-only slugs on a cargo domain). Non-SEO app routes
 * (/magaza, /kategori/..., /urun/...) are always kept.
 */
export function filterStoreLinks<T extends { href: string }>(links: T[]): T[] {
  const avail = availableSlugSet(CURRENT_STORE);
  return links.filter((l) => {
    const m = l.href.match(/^\/([^/]+)$/);
    if (!m) return true;
    const s = m[1];
    if (!ALL_SEO_SLUGS.has(s)) return true;
    return avail.has(s);
  });
}
