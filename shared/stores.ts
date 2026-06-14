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

export interface StoreCommerce {
  /**
   * "local" = mahalle içi teslimat modeli ("Getirmesi" + mahalle eşleştirme).
   * "cargo" = ülke geneli kargo modeli (il/ilçe seçimi + sabit kargo ücreti).
   */
  fulfillment: "local" | "cargo";
  /** Sipariş özetinde teslimat/kargo ücreti satırının etiketi. */
  shippingLabel: string;
  /** true ise yalnızca online kredi kartı ödemesi sunulur, diğerleri gizlenir. */
  onlinePaymentOnly: boolean;
  /** false ise ön sipariş bu sitede kapalıdır (stok bitince yalnızca "Gelince Haber Ver"). */
  preorderEnabled: boolean;
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
  /** Optional mobile-only logo (e.g. light/white variant for the dark mobile header). */
  logoMobile?: string;
  /** Favicon path. */
  favicon: string;
  /** Phone in E.164. */
  phone: string;
  /** Human-readable phone. */
  phoneDisplay: string;
  /** Contact email. */
  email: string;
  /** Human-readable street address shown in footer / contact areas. */
  address: string;
  /** Legal company / trade name shown in footer / contact areas. */
  companyName: string;
  /** LocalBusiness description. */
  businessDescription: string;
  /** Brand slogan. */
  slogan: string;
  /** Social profile URLs (JSON-LD sameAs). */
  social: string[];
  theme: StoreTheme;
  seo: StoreSeo;
  /** Mağazaya özel ticaret / teslimat davranışı. */
  commerce: StoreCommerce;
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
  address: "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun",
  companyName: "Sizpa İnternet Tic. Ltd. Şti.",
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
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
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
  logo: "/logo-atakum.webp",
  logoMobile: "/logo-atakum-mobile.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Atatürk 3 kısım bulvarı no 113 ATAKUM SAMSUN",
  companyName: "Sizpa internet tic.ltd.şti.",
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
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

const samsun: StoreConfig = {
  id: "samsun",
  hostnames: ["atakumpet.com", "www.atakumpet.com"],
  name: "Atakum Pet",
  shortName: "Atakum Pet",
  brandWord: "Atakum Pet",
  alternateNames: ["Atakum Pet", "Atakum Petshop", "Atakum Pet Shop", "atakumpet"],
  domain: "https://www.atakumpet.com",
  logo: "/logo-atakumpet.webp",
  logoMobile: "/logo-atakumpet-mobile.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Atatürk 3 kısım bulvarı no 113 ATAKUM SAMSUN",
  companyName: "Sizpa internet tic.ltd.şti.",
  businessDescription:
    "Türkiye geneli kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri Atakum Pet'ten güvenli ödeme ve hızlı kargo ile kapınıza gelir.",
  slogan: "Türkiye'nin Her Yerine Hızlı Kargo",
  social: [],
  theme: {
    primary: "271 65% 56%",
    topBar: "#7B1FA2",
    navBar: "#9C27B0",
  },
  seo: {
    title: "Atakum Pet - Türkiye Geneli Kargo | Kedi & Köpek Maması",
    description:
      "Türkiye'nin her yerine kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu güvenli online ödeme ve hızlı kargo. Atakum Pet.",
    keywords:
      "atakum pet, atakumpet, online pet shop, kargo ile mama, kedi maması, köpek maması, kedi kumu, ödül maması, evcil hayvan ürünleri, türkiye geneli pet shop, online kredi kartı",
    ogImage: "/og-image.webp",
  },
  commerce: {
    fulfillment: "cargo",
    shippingLabel: "Kargo Ücreti",
    onlinePaymentOnly: true,
    preorderEnabled: false,
  },
};

// Samsun Pet Shop — second Türkiye-geneli kargo brand. Same cargo / online-card-
// only commerce model as `samsun` (atakumpet.com) but its OWN domain, name, logo
// and SEO so it ranks independently for "samsun pet shop" searches. NOTE: the id
// is "samsunpet" — it must NOT collide with the existing "samsun" store (which is
// bound to atakumpet.com), even though both are Samsun-region cargo storefronts.
const samsunpet: StoreConfig = {
  id: "samsunpet",
  hostnames: ["samsunpet.com", "www.samsunpet.com"],
  name: "Samsun Pet Shop",
  shortName: "Samsun Pet Shop",
  brandWord: "Samsun Pet Shop",
  alternateNames: ["Samsun Pet Shop", "Samsun Petshop", "Samsun Pet", "samsunpet"],
  domain: "https://www.samsunpet.com",
  logo: "/logo-samsun.webp",
  logoMobile: "/logo-samsun.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Atatürk 3 kısım bulvarı no 113 ATAKUM SAMSUN",
  companyName: "Sizpa internet tic.ltd.şti.",
  businessDescription:
    "Türkiye geneli kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri Samsun Pet Shop'tan güvenli ödeme ve hızlı kargo ile kapınıza gelir.",
  slogan: "Türkiye'nin Her Yerine Hızlı Kargo",
  social: [],
  theme: {
    primary: "174 72% 36%",
    topBar: "#00695C",
    navBar: "#00897B",
  },
  seo: {
    title: "Samsun Pet Shop - Türkiye Geneli Kargo | Kedi & Köpek Maması",
    description:
      "Türkiye'nin her yerine kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu güvenli online ödeme ve hızlı kargo. Samsun Pet Shop.",
    keywords:
      "samsun pet shop, samsun petshop, samsun pet, online pet shop, kargo ile mama, kedi maması, köpek maması, kedi kumu, ödül maması, evcil hayvan ürünleri, türkiye geneli pet shop, online kredi kartı",
    ogImage: "/og-image.webp",
  },
  commerce: {
    fulfillment: "cargo",
    shippingLabel: "Kargo Ücreti",
    onlinePaymentOnly: true,
    preorderEnabled: false,
  },
};

// Karadeniz Pet Shop — third Türkiye-geneli kargo brand. Same cargo / online-
// card-only commerce model as `samsun` / `samsunpet`, but its OWN domain, name,
// logo and SEO so it ranks independently for "karadeniz pet shop" searches.
const karadeniz: StoreConfig = {
  id: "karadeniz",
  hostnames: ["karadenizpetshop.com", "www.karadenizpetshop.com"],
  name: "Karadeniz Pet Shop",
  shortName: "Karadeniz Pet Shop",
  brandWord: "Karadeniz Pet Shop",
  alternateNames: ["Karadeniz Pet Shop", "Karadeniz Petshop", "Karadeniz Pet", "karadenizpetshop"],
  domain: "https://www.karadenizpetshop.com",
  logo: "/logo-karadeniz.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Atatürk 3 kısım bulvarı no 113 ATAKUM SAMSUN",
  companyName: "Sizpa internet tic.ltd.şti.",
  businessDescription:
    "Türkiye geneli kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri Karadeniz Pet Shop'tan güvenli ödeme ve hızlı kargo ile kapınıza gelir.",
  slogan: "Türkiye'nin Her Yerine Hızlı Kargo",
  social: [],
  theme: {
    primary: "152 58% 37%",
    topBar: "#1B5E20",
    navBar: "#2E7D32",
  },
  seo: {
    title: "Karadeniz Pet Shop - Türkiye Geneli Kargo | Kedi & Köpek Maması",
    description:
      "Türkiye'nin her yerine kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu güvenli online ödeme ve hızlı kargo. Karadeniz Pet Shop.",
    keywords:
      "karadeniz pet shop, karadeniz petshop, karadeniz pet, online pet shop, kargo ile mama, kedi maması, köpek maması, kedi kumu, ödül maması, evcil hayvan ürünleri, türkiye geneli pet shop, online kredi kartı",
    ogImage: "/og-image.webp",
  },
  commerce: {
    fulfillment: "cargo",
    shippingLabel: "Kargo Ücreti",
    onlinePaymentOnly: true,
    preorderEnabled: false,
  },
};

// Atakum Pet (atakum.biz) — a SECOND local same-day storefront for the Atakum /
// Samsun area, distinct from the "atakum" (atakumpetshop.com) store. Same LOCAL
// commerce model (Mahalle checkout + door payment + preorder) but its OWN
// domain, theme and logo. NOTE: per the owner's request it intentionally shares
// the "Atakum Pet" brand word with the cargo `samsun` store (atakumpet.com); the
// two stay SEPARATE via distinct id + domain (host resolution is by hostname).
const atakumbiz: StoreConfig = {
  id: "atakumbiz",
  hostnames: ["atakum.biz", "www.atakum.biz"],
  name: "Atakum Pet",
  shortName: "Atakum Pet",
  brandWord: "Atakum Pet",
  alternateNames: ["Atakum Pet", "Atakum Petshop", "Atakum Pet Shop", "atakum.biz"],
  domain: "https://www.atakum.biz",
  logo: "/logo-atakumbiz.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Atatürk 3 kısım bulvarı no 113 ATAKUM SAMSUN",
  companyName: "Sizpa internet tic.ltd.şti.",
  businessDescription:
    "Atakum'un hızlı pet shop'u Atakum Pet. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünlerinde Atakum, İlkadım, Canik içi aynı gün teslimat ve kapıda ödeme imkanı.",
  slogan: "Atakum'un Hızlı Pet Shop'u — Aynı Gün Teslimat",
  social: [],
  theme: {
    primary: "14 80% 45%",
    topBar: "#BF360C",
    navBar: "#E64A19",
  },
  seo: {
    title: "Atakum Pet - Atakum & Samsun'a Aynı Gün Petshop Teslimat",
    description:
      "Atakum ve Samsun'a aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu kapıda ödeme. Atakum Pet 09:00-21:00, 0850 840 39 59.",
    keywords:
      "atakum pet, atakum petshop, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, samsun petshop, ilkadım petshop, canik petshop, kapıda ödeme petshop atakum",
    ogImage: "/og-image.webp",
  },
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// JETGO (jetgo.pet) — a SECOND domain for the flagship JETGO brand that works the
// same way as jetgomarket.com: same JETGO branding, theme, logo and the LOCAL
// same-day commerce model. It is a SEPARATE self-canonicalising store on its OWN
// domain (jetgo.pet) so it stays on its own URL instead of redirecting to
// jetgomarket.com. NOTE: it intentionally shares the "JETGO" brand word with the
// default `jetgo` store; the two stay SEPARATE via distinct id + domain. Because
// the domain itself contains the substring "jetgo", brandifyFor uses a
// placeholder pass so the domain is rewritten to jetgo.pet (NOT "JETGO.pet").
const jetgopet: StoreConfig = {
  id: "jetgopet",
  hostnames: ["jetgo.pet", "www.jetgo.pet"],
  name: "JETGO Pet Shop Samsun",
  shortName: "JETGO",
  brandWord: "JETGO",
  alternateNames: ["JETGO Samsun Pet Shop", "JetGo Pet", "JETGO Atakum Pet Shop", "JETGO"],
  domain: "https://www.jetgo.pet",
  logo: "/logo-jetgo.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun",
  companyName: "Sizpa İnternet Tic. Ltd. Şti.",
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
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// JETGO (jetgo.shop) — a THIRD domain for the flagship JETGO brand that works the
// same way as jetgomarket.com / jetgo.pet: same JETGO branding, theme, logo and the
// LOCAL same-day commerce model. It is a SEPARATE self-canonicalising store on its
// OWN domain (jetgo.shop) so it stays on its own URL instead of redirecting to
// jetgomarket.com. NOTE: it intentionally shares the "JETGO" brand word with the
// default `jetgo` store; the two stay SEPARATE via distinct id + domain. Because
// the domain itself contains the substring "jetgo", brandifyFor uses a
// placeholder pass so the domain is rewritten to jetgo.shop (NOT "JETGO.shop").
const jetgoshop: StoreConfig = {
  id: "jetgoshop",
  hostnames: ["jetgo.shop", "www.jetgo.shop"],
  name: "JETGO Pet Shop Samsun",
  shortName: "JETGO",
  brandWord: "JETGO",
  alternateNames: ["JETGO Samsun Pet Shop", "JetGo Pet", "JETGO Atakum Pet Shop", "JETGO"],
  domain: "https://www.jetgo.shop",
  logo: "/logo-jetgo.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun",
  companyName: "Sizpa İnternet Tic. Ltd. Şti.",
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
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// marka.pet (markapet) — a FOURTH Türkiye-geneli kargo brand. Same cargo /
// online-card-only commerce model as samsun / samsunpet / karadeniz, but its OWN
// self-canonicalising domain. Per the owner's request the customer-facing brand
// IS the domain string "marka.pet" (used as name / shortName / brandWord), and the
// logo is a TEMPORARY placeholder (client/public/logo-marka.webp) to be replaced
// by an uploaded asset. The domain has no "jetgo" substring, so brandifyFor needs
// no placeholder protection here (the simple swap can't corrupt it).
const markapet: StoreConfig = {
  id: "markapet",
  hostnames: ["marka.pet", "www.marka.pet"],
  name: "marka.pet",
  shortName: "marka.pet",
  brandWord: "marka.pet",
  alternateNames: ["marka.pet", "Marka Pet", "Marka Pet Shop", "markapet"],
  domain: "https://www.marka.pet",
  logo: "/logo-marka.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Atatürk 3 kısım bulvarı no 113 ATAKUM SAMSUN",
  companyName: "Sizpa internet tic.ltd.şti.",
  businessDescription:
    "Türkiye geneli kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri marka.pet'ten güvenli ödeme ve hızlı kargo ile kapınıza gelir.",
  slogan: "Türkiye'nin Her Yerine Hızlı Kargo",
  social: [],
  theme: {
    primary: "25 95% 53%",
    topBar: "#9A3412",
    navBar: "#EA580C",
  },
  seo: {
    title: "marka.pet - Türkiye Geneli Kargo | Kedi & Köpek Maması",
    description:
      "Türkiye'nin her yerine kargo ile pet shop alışverişi. Kedi maması, köpek maması, kedi kumu güvenli online ödeme ve hızlı kargo. marka.pet.",
    keywords:
      "marka.pet, marka pet, marka pet shop, online pet shop, kargo ile mama, kedi maması, köpek maması, kedi kumu, ödül maması, evcil hayvan ürünleri, türkiye geneli pet shop, online kredi kartı",
    ogImage: "/og-image.webp",
  },
  commerce: {
    fulfillment: "cargo",
    shippingLabel: "Kargo Ücreti",
    onlinePaymentOnly: true,
    preorderEnabled: false,
  },
};

export const STORES: StoreConfig[] = [jetgo, atakum, samsun, samsunpet, karadeniz, atakumbiz, jetgopet, jetgoshop, markapet];
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
  // Swap the jetgomarket domain into placeholders FIRST, run the brand-word pass,
  // then expand the placeholders. This protects a brand domain that itself
  // contains the substring "jetgo" (e.g. jetgo.pet): if the domain were inserted
  // before the brand pass, "/jetgo/g -> brandWord" would corrupt it into
  // "JETGO.pet". The placeholders carry no "jetgo" token, so they survive the
  // brand pass untouched. Behavior is unchanged for domains without "jetgo".
  const HOST_PH = "\uE000H\uE000";
  const APEX_PH = "\uE000A\uE000";
  return text
    .replace(/www\.jetgomarket\.com/gi, HOST_PH)
    .replace(/jetgomarket\.com/gi, APEX_PH)
    .replace(/JETGO/g, store.brandWord)
    .replace(/Jetgo/g, store.brandWord)
    .replace(/jetgo/g, store.brandWord)
    .split(HOST_PH).join(host)
    .split(APEX_PH).join(apex);
}

/** Canonical hostname (with www if that is the canonical form) for a store. */
export function canonicalHost(store: StoreConfig): string {
  try {
    return new URL(store.domain).host.toLowerCase();
  } catch {
    return "";
  }
}
