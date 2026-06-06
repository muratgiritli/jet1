// Multi-domain "tek mutfak, çok tabela" store registry.
//
// One application / one database / one deployment serves multiple branded
// storefronts on different custom domains. Products, stock, customers, orders
// and the admin panel are SHARED. Only the per-domain identity below changes:
// name, logo, colors and SEO title/meta/JSON-LD.
//
// To add a new branded site: add a new StoreConfig entry to STORES with its
// own hostnames (apex + www), name, theme colors, logo and SEO defaults, then
// link the domain in the Replit Deployment settings.

export interface StoreTheme {
  /** HSL triplet WITHOUT hsl() wrapper, e.g. "203 89% 53%". Drives --primary. */
  primary: string;
  /** Header top bar background color (hex). */
  topBar: string;
  /** Category nav bar background color (hex). */
  navBar: string;
}

export interface StoreSeo {
  /** Homepage <title>. */
  title: string;
  /** Homepage meta description. */
  description: string;
  /** Homepage meta keywords. */
  keywords: string;
  /** OG/share image path relative to the domain, e.g. "/og-image.webp". */
  ogImage: string;
}

export interface StoreConfig {
  /** Stable internal id, also used to tag the order's source site. */
  id: string;
  /** Exact hostnames (apex + www) that resolve to this store. */
  hostnames: string[];
  /** Full brand name (title / og:site_name / JSON-LD name). */
  name: string;
  /** Short brand name (PWA / app title). */
  shortName: string;
  /** Distinctive brand word used to swap "JETGO" mentions in shared content. */
  brandWord: string;
  /** SEO alternateName list. */
  alternateNames: string[];
  /** Canonical absolute base URL, no trailing slash. */
  domain: string;
  /** Logo image path. */
  logo: string;
  /** Favicon path. */
  favicon: string;
  /** Phone in E.164. */
  phone: string;
  /** Human-readable phone. */
  phoneDisplay: string;
  /** Contact email. */
  email: string;
  /** LocalBusiness description. */
  businessDescription: string;
  /** Brand slogan. */
  slogan: string;
  /** Social profile URLs (JSON-LD sameAs). */
  social: string[];
  theme: StoreTheme;
  seo: StoreSeo;
}

const jetgo: StoreConfig = {
  id: "jetgo",
  hostnames: ["jetgomarket.com", "www.jetgomarket.com"],
  name: "JETGO Pet Shop Samsun",
  shortName: "JETGO",
  brandWord: "JETGO",
  alternateNames: ["JETGO Samsun Pet Shop", "JetGo Pet", "JETGO Atakum Pet Shop", "JETGO"],
  domain: "https://www.jetgomarket.com",
  logo: "/logo-jetgo.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  businessDescription:
    "Samsun'un en hızlı pet shop'u JETGO. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünlerinde Atakum, İlkadım, Canik içi aynı gün teslimat ve kapıda ödeme imkanı.",
  slogan: "Samsun'un Hızlı Pet Shop'u — Aynı Gün Teslimat",
  social: [
    "https://www.instagram.com/jetgomarket.com",
    "https://www.facebook.com/jetgomarket.com",
  ],
  theme: {
    primary: "203 89% 53%",
    topBar: "#6B3480",
    navBar: "#7c4dff",
  },
  seo: {
    title: "Atakum Petshop & Samsun Pet Shop - Aynı Gün Teslimat | JETGO",
    description:
      "Atakum, Samsun, İlkadım, Canik'e aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu kapıda ödeme. JETGO 09:00-21:00, 0850 840 39 59.",
    keywords:
      "atakum petshop, samsun petshop, samsun pet shop, atakum pet shop, samsun kedi maması, samsun köpek maması, samsun kedi kumu, atakum aynı gün teslimat, samsun acil petshop, ilkadım petshop, canik petshop, kapıda ödeme petshop samsun",
    ogImage: "/og-image.webp",
  },
};

const atakum: StoreConfig = {
  id: "atakum",
  hostnames: ["atakumpetshop.com", "www.atakumpetshop.com"],
  name: "Atakum Pet Shop",
  shortName: "Atakum Pet Shop",
  brandWord: "Atakum",
  alternateNames: ["Atakum Petshop", "Atakum Pet", "Atakum Samsun Pet Shop", "Atakum Pet Shop Samsun"],
  domain: "https://www.atakumpetshop.com",
  logo: "",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  businessDescription:
    "Atakum'un hızlı pet shop'u Atakum Pet Shop. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünlerinde Atakum, İlkadım, Canik içi aynı gün teslimat ve kapıda ödeme imkanı.",
  slogan: "Atakum'un Hızlı Pet Shop'u — Aynı Gün Teslimat",
  social: [],
  theme: {
    primary: "291 64% 42%",
    topBar: "#4A148C",
    navBar: "#7B1FA2",
  },
  seo: {
    title: "Atakum Pet Shop - Atakum'a Aynı Gün Petshop Teslimat | Atakum Petshop",
    description:
      "Atakum'a aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu kapıda ödeme. Atakum Pet Shop 09:00-21:00, 0850 840 39 59.",
    keywords:
      "atakum pet shop, atakum petshop, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, atakum acil petshop, samsun petshop, ilkadım petshop, canik petshop, kapıda ödeme petshop atakum",
    ogImage: "/og-image.webp",
  },
};

export const STORES: StoreConfig[] = [jetgo, atakum];
export const DEFAULT_STORE: StoreConfig = jetgo;

/** Lowercase host, strip port and a leading "www." */
export function normalizeHost(host?: string | null): string {
  if (!host) return "";
  return host.toLowerCase().trim().split(":")[0].replace(/^www\./, "");
}

/**
 * Resolve a store from any request host. Unknown hosts (dev / replit.dev /
 * localhost / preview) fall back to the default store so behavior is unchanged.
 */
export function getStoreByHost(host?: string | null): StoreConfig {
  const h = normalizeHost(host);
  if (!h) return DEFAULT_STORE;
  for (const s of STORES) {
    if (s.hostnames.some((hn) => normalizeHost(hn) === h)) return s;
  }
  return DEFAULT_STORE;
}

/**
 * Match a store by EXACT configured hostname (apex or www, port stripped).
 * Returns undefined for unknown hosts — used by the canonical-host redirect so
 * only configured production hostnames are touched.
 */
export function getStoreByExactHost(host?: string | null): StoreConfig | undefined {
  if (!host) return undefined;
  const h = host.toLowerCase().trim().split(":")[0];
  for (const s of STORES) {
    if (s.hostnames.some((hn) => hn.toLowerCase() === h)) return s;
  }
  return undefined;
}

/**
 * Replace shared-content "JETGO" / "jetgomarket.com" brand mentions with the
 * given store's brand word and domain. No-op for the default (jetgo) store so
 * its content is never altered. Used by both client (<SEO>, page bodies) and
 * server (meta injection) so every domain reads as its own brand.
 */
export function brandifyFor(store: StoreConfig, text: string): string {
  if (!text || store.id === DEFAULT_STORE.id) return text;
  const host = canonicalHost(store);
  const apex = host.replace(/^www\./, "");
  return text
    .replace(/www\.jetgomarket\.com/gi, host)
    .replace(/jetgomarket\.com/gi, apex)
    .replace(/JETGO/g, store.brandWord)
    .replace(/Jetgo/g, store.brandWord)
    .replace(/jetgo/g, store.brandWord);
}

/** Canonical hostname (with www if that is the canonical form) for a store. */
export function canonicalHost(store: StoreConfig): string {
  try {
    return new URL(store.domain).host.toLowerCase();
  } catch {
    return "";
  }
}
