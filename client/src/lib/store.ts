import { getStoreByHost, getStoreByExactHost, STORES, type StoreConfig, brandifyFor, commercifyFor } from "@shared/stores";

// Store override for local/e2e smoke testing. Real branded storefronts can only
// be served from their custom domains, so on the dev/preview host the resolver
// always falls back to the default (jetgo) store. To exercise another branded
// storefront (e.g. samsun) in a browser smoke test, pass `?__store=<id>` once —
// it is remembered for the rest of the session (sessionStorage) so it survives
// client-side navigation. The override is ignored whenever the current host is a
// real configured custom domain (getStoreByExactHost matches), so production
// branded domains can never be repointed via this param.
function resolveStoreOverride(): StoreConfig | undefined {
  if (typeof window === "undefined") return undefined;
  if (getStoreByExactHost(window.location.hostname)) return undefined;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("__store");
    if (fromQuery) sessionStorage.setItem("__store_override", fromQuery);
    const overrideId = fromQuery || sessionStorage.getItem("__store_override");
    if (!overrideId) return undefined;
    return STORES.find((s) => s.id === overrideId);
  } catch {
    return undefined;
  }
}

// The active store is decided once, synchronously, from the browser host.
// All branding (name, logo, colors, SEO) reads from this single resolved value.
const __override = resolveStoreOverride();
export const CURRENT_STORE: StoreConfig =
  __override ??
  getStoreByHost(typeof window !== "undefined" ? window.location.hostname : undefined);

export function useStore(): StoreConfig {
  return CURRENT_STORE;
}

/**
 * Swap shared-content "JETGO" / "jetgomarket.com" mentions for the active
 * store's brand. No-op on the default (jetgo) site. Apply to user-facing text
 * only (titles, descriptions, page bodies) — never to asset paths, testids,
 * localStorage keys or social handles.
 */
export function brandify(text: string): string {
  return brandifyFor(CURRENT_STORE, text);
}

/**
 * Rewrite local same-day-courier / door-payment SEO claims to cargo/online
 * wording for the current store. No-op unless this store is cargo-fulfilled.
 * Apply BEFORE brandify on shared SEO copy: brandify(commercify(text)).
 */
export function commercify(text: string): string {
  return commercifyFor(CURRENT_STORE, text);
}

// SEO-corpus-dependent helpers (storePages, findStorePage, filterStoreLinks) live
// in ./store-seo so the heavy seo-data module stays OUT of this eagerly loaded file.
// Import them from "@/lib/store-seo" (only lazy SEO pages need them).
