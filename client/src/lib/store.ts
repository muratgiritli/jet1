import { getStoreByHost, brandifyFor, type StoreConfig } from "@shared/stores";

// The active store is decided once, synchronously, from the browser host.
// All branding (name, logo, colors, SEO) reads from this single resolved value.
export const CURRENT_STORE: StoreConfig = getStoreByHost(
  typeof window !== "undefined" ? window.location.hostname : undefined,
);

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
