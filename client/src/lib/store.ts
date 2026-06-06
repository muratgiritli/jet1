import { getStoreByHost, type StoreConfig } from "@shared/stores";

// The active store is decided once, synchronously, from the browser host.
// All branding (name, logo, colors, SEO) reads from this single resolved value.
export const CURRENT_STORE: StoreConfig = getStoreByHost(
  typeof window !== "undefined" ? window.location.hostname : undefined,
);

export function useStore(): StoreConfig {
  return CURRENT_STORE;
}
