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

/**
 * Domaine ÖZEL Google hesap kimlikleri. Her alan opsiyoneldir; boş bırakılan
 * alan için o domainde HİÇBİR Google etiketi yüklenmez. Böylece her domain
 * Google'a karşı bağımsız bir site gibi davranır (ayrı GA4 / GTM / Search Console).
 */
export interface StoreGoogle {
  /** Google Tag Manager kapsayıcı id'si, örn: "GTM-XXXXXXX". */
  gtmId?: string;
  /** GA4 ölçüm id'leri, örn: ["G-XXXXXXXXXX"]. Birden fazla olabilir. */
  ga4Ids?: string[];
  /** Google Ads dönüşüm id'leri, örn: ["AW-XXXXXXXXXX"]. */
  adsIds?: string[];
  /** Search Console META doğrulama kodu (meta etiketindeki content="..." değeri). */
  siteVerification?: string;
  /** Search Console HTML-DOSYA doğrulaması: /google<ID>.html dosyasındaki ID kısmı. */
  verificationFileId?: string;
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
  /**
   * Domaine ÖZEL Google hesapları (her domain Google'a karşı bağımsız bir site).
   * Boş `{}` bırakıldığında bu domainde HİÇ Google etiketi/doğrulaması yüklenmez.
   * Sahibi kendi GA4 / GTM / Search Console hesaplarını açıp kodlarını buraya girer.
   */
  google?: StoreGoogle;
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
      "Atakum içinde 1 saatte, Samsun geneline aynı gün petshop teslimatı. Denizevleri, Atakent, Mimar Sinan ve tüm Atakum mahallelerine kedi maması, köpek maması, kedi kumu kapıda ödeme. JETGO 0850 840 39 59.",
    keywords:
      "atakum petshop, atakum pet shop, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, atakum 1 saatte teslimat, denizevleri petshop, atakent petshop, mimar sinan petshop, yenimahalle petshop, kurupelit petshop, samsun petshop, kapıda ödeme petshop atakum",
    ogImage: "/og-image.webp",
  },
  google: {},
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
  google: {},
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
    "Atakum'un hızlı pet shop'u Atakum Pet. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünleri Atakum içinde aynı gün, İlkadım ve Canik'e hızlı teslimatla kapınızda; ödemeyi kapıda nakit, kart veya QR ile yapın.",
  slogan: "Atakum'a Aynı Gün Teslimat — Atakum Pet",
  social: [],
  theme: {
    primary: "271 65% 56%",
    topBar: "#7B1FA2",
    navBar: "#9C27B0",
  },
  seo: {
    title: "Atakum Pet - Atakum'a Aynı Gün Petshop Teslimat | Kapıda Ödeme",
    description:
      "Atakum, İlkadım ve Canik'e aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu kapıda ödeme ile. Atakum Pet, 0850 840 39 59.",
    keywords:
      "atakum pet, atakumpet, atakum petshop, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, atakum acil mama, kapıda ödeme petshop atakum, ilkadım petshop, canik petshop, samsun petshop",
    ogImage: "/og-image.webp",
  },
  google: {},
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// Samsun Pet Shop — a LOCAL same-day Samsun storefront. Same local commerce model
// (Mahalle checkout + kapıda ödeme + preorder) as `samsun` (atakumpet.com) but its
// OWN domain, name, logo and SEO so it ranks independently for "samsun pet shop"
// searches. NOTE: the id is "samsunpet" — it must NOT collide with the existing
// "samsun" store (bound to atakumpet.com); both are Samsun same-day storefronts.
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
    "Samsun'un mahalle mahalle pet shop'u Samsun Pet Shop. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünleri Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine aynı gün kuryeyle; ödeme kapıda nakit, kart veya QR ile.",
  slogan: "Samsun'un Her Mahallesine Aynı Gün Teslimat",
  social: [],
  theme: {
    primary: "174 72% 36%",
    topBar: "#00695C",
    navBar: "#00897B",
  },
  seo: {
    title: "Samsun Pet Shop - Samsun'a Aynı Gün Petshop Teslimat | Kapıda Ödeme",
    description:
      "Samsun genelinde aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu Atakum, İlkadım ve Canik mahallelerine kapıda ödeme ile. Samsun Pet Shop, 0850 840 39 59.",
    keywords:
      "samsun pet shop, samsun petshop, samsun pet, samsun kedi maması, samsun köpek maması, samsun kedi kumu, samsun aynı gün teslimat, kapıda ödeme petshop samsun, atakum petshop, ilkadım petshop, canik petshop, tekkeköy petshop",
    ogImage: "/og-image.webp",
  },
  google: {},
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// Karadeniz Pet Shop — a LOCAL same-day Samsun storefront. Same local commerce
// model (Mahalle checkout + kapıda ödeme + preorder) as `samsun` / `samsunpet`,
// but its OWN domain, name, logo and SEO so it ranks independently for "karadeniz
// pet shop" searches.
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
    "Samsunlu komşunuz Karadeniz Pet Shop. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünlerini güvenle sipariş edin; Samsun içinde aynı gün kapınızda, ödemeyi kapıda nakit, kart veya QR ile yapın.",
  slogan: "Samsun'un Güvenilir Pet Shop'u — Aynı Gün Teslimat",
  social: [],
  theme: {
    primary: "152 58% 37%",
    topBar: "#1B5E20",
    navBar: "#2E7D32",
  },
  seo: {
    title: "Karadeniz Pet Shop - Samsun'da Aynı Gün Petshop | Kapıda Ödeme",
    description:
      "Samsun'un güvenilir yerel pet shop'u. Kedi maması, köpek maması, kedi kumu aynı gün kapınızda, kapıda ödeme ile. Karadeniz Pet Shop, 0850 840 39 59.",
    keywords:
      "karadeniz pet shop, karadeniz petshop, karadeniz pet, samsun pet shop, samsun kedi maması, samsun köpek maması, samsun kedi kumu, samsun aynı gün teslimat, kapıda ödeme petshop samsun, atakum petshop, ilkadım petshop, canik petshop",
    ogImage: "/og-image.webp",
  },
  google: {},
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// Atakum Pet (atakum.biz) — a SECOND local same-day storefront for the Atakum /
// Samsun area, distinct from the "atakum" (atakumpetshop.com) store. Same LOCAL
// commerce model (Mahalle checkout + door payment + preorder) but its OWN
// domain, theme and logo. NOTE: per the owner's request it intentionally shares
// the "Atakum Pet" brand word with the `samsun` store (atakumpet.com); the
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
    "Atakum'un en hızlı pet shop'u Atakum Pet. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünlerinde Atakum içinde 1 saatte, İlkadım, Canik ve Tekkeköy'e aynı gün teslimat ve kapıda ödeme imkanı.",
  slogan: "Atakum'a 1 Saatte Teslimat — Atakum'un Hızlı Pet Shop'u",
  social: [],
  theme: {
    primary: "14 80% 45%",
    topBar: "#BF360C",
    navBar: "#E64A19",
  },
  seo: {
    title: "Atakum Pet - Atakum'a 1 Saatte Petshop Teslimat | Aynı Gün",
    description:
      "Atakum içinde 1 saatte, Samsun'a aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu kapıda ödeme. Atakum Pet 09:00-21:00, 0850 840 39 59.",
    keywords:
      "atakum pet, atakum petshop, atakum 1 saatte teslimat, 1 saatte petshop atakum, 1 saatte mama atakum, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, samsun petshop, ilkadım petshop, canik petshop, kapıda ödeme petshop atakum",
    ogImage: "/og-image.webp",
  },
  google: {},
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
    title: "Atakum Pet Shop - Aynı Gün Mama Teslimat & Kapıda Ödeme | JETGO",
    description:
      "Atakum'da kedi maması, köpek maması ve kedi kumu aynı gün kapınızda. JETGO; Esenevler, Balaç, Büyükoyumca, Çamlıyazı, Kurupelit ve OMÜ dahil tüm Atakum mahallelerine kapıda ödeme ile hızlı teslimat. 0850 840 39 59.",
    keywords:
      "atakum pet shop, atakum petshop, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, atakum kapıda ödeme petshop, esenevler petshop, balaç petshop, büyükoyumca petshop, çamlıyazı petshop, kurupelit petshop, omü petshop, atakum 1 saatte teslimat",
    ogImage: "/og-image.webp",
  },
  google: { adsIds: ["AW-18243800307"] },
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
    title: "Samsun Pet Shop & Atakum Petshop - Aynı Gün Teslimat | JETGO",
    description:
      "Samsun'da kedi maması, köpek maması ve kedi kumu aynı gün kapınızda. JETGO; Atakum, İlkadım, Canik ve tüm mahallelere (Denizevleri, Atakent, Mimar Sinan, Yenimahalle) kapıda ödeme ile teslimat. 0850 840 39 59.",
    keywords:
      "samsun petshop, samsun pet shop, atakum petshop, samsun kedi maması, samsun köpek maması, samsun kedi kumu, atakum aynı gün teslimat, denizevleri petshop, atakent petshop, yenimahalle petshop, mimar sinan petshop, ilkadım petshop, canik petshop, kapıda ödeme petshop samsun",
    ogImage: "/og-image.webp",
  },
  google: {},
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

// marka.pet (markapet) — a LOCAL same-day Samsun storefront. Same local commerce
// model (Mahalle checkout + kapıda ödeme + preorder) as samsun / samsunpet /
// karadeniz, but its OWN self-canonicalising domain. Per the owner's request the
// customer-facing brand IS the domain string "marka.pet" (used as name / shortName
// / brandWord), and the logo is a TEMPORARY placeholder (client/public/
// logo-marka.webp) to be replaced by an uploaded asset. The domain has no "jetgo"
// substring, so brandifyFor needs no placeholder protection here (the simple swap
// can't corrupt it).
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
    "Pratik pet shop marka.pet. Kedi maması, köpek maması, kedi kumu, ödül maması, akvaryum ve kuş ürünlerini (Royal Canin, Pro Plan, Hills, Reflex, N&D) tek tıkla sipariş edin; Samsun içinde aynı gün kapınızda, kapıda nakit, kart veya QR ile ödeyin.",
  slogan: "Tek Tıkla Sipariş — Samsun İçi Aynı Gün Teslimat",
  social: [],
  theme: {
    primary: "25 95% 53%",
    topBar: "#9A3412",
    navBar: "#EA580C",
  },
  seo: {
    title: "marka.pet - Samsun'a Aynı Gün Petshop Teslimat | Kapıda Ödeme",
    description:
      "Samsun içinde aynı gün pet shop teslimatı. Kedi maması, köpek maması, kedi kumu, ödül maması, akvaryum ve kuş ürünlerinde Royal Canin, Pro Plan, Hills, Reflex, N&D; kapıda ödeme. marka.pet.",
    keywords:
      "marka.pet, marka pet, marka pet shop, samsun pet shop, samsun aynı gün teslimat, kapıda ödeme petshop samsun, kedi maması sipariş, köpek maması sipariş, online mama siparişi, kedi maması, köpek maması, kedi kumu, ödül maması, royal canin, pro plan, hills, reflex, n&d, brit care, evcil hayvan ürünleri, akvaryum malzemeleri, kuş yemi, atakum petshop, ilkadım petshop, canik petshop, uygun fiyat petshop",
    ogImage: "/og-image.webp",
  },
  google: {},
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
  },
};

export const STORES: StoreConfig[] = [jetgo, atakum, samsun, samsunpet, karadeniz, atakumbiz, jetgopet, jetgoshop, markapet];
export const DEFAULT_STORE: StoreConfig = jetgo;

/** Lowercase host, strip port and a leading "www." */
export function normalizeHost(host?: string | null): string {
  if (!host) return "";
  // A proxy can emit a comma-joined X-Forwarded-Host ("real.com, proxy"); the
  // client-facing host is the first token. Strip it before port + www so store
  // resolution stays consistent with reqOrigin's first-token host (no apex/store
  // mismatch on the sitemap file chain). No-op for ordinary single-host values.
  return host.split(",")[0].toLowerCase().trim().split(":")[0].replace(/^www\./, "");
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

// Shared SEO/landing copy is authored for the LOCAL same-day-courier + door-
// payment model (Samsun/Atakum). On a CARGO / online-payment-only store those
// delivery & payment promises are FALSE, and since they now also feed AI-visible
// JSON-LD they must be corrected. Each entry rewrites one specific local CLAIM
// (same-day speed, courier, neighborhood delivery, door payment, WhatsApp order)
// into its cargo/online equivalent. Ordered specific→general so longer phrases
// win before their substrings. Keyword phrases and generic "kapıya teslim"
// (true for cargo too) are intentionally NOT matched, so SEO targets survive.
const CARGO_COPY_REWRITES: ReadonlyArray<readonly [RegExp, string]> = [
  [/Kapıda nakit, kredi kartı \(POS\) ve QR ile ödeme yapabilirsiniz; nakit ödemede ekstra avantajlı fiyat\./g, "Güvenli online kredi/banka kartı ile ödeme yapabilirsiniz."],
  [/Evet, kapıda nakit, kredi kartı \(POS\) ve QR ile ödeme yapabilirsiniz\. Nakit ödemede avantajlı fiyat sunuyoruz\./g, "Evet, güvenli online kredi/banka kartı ile ödeme yapabilirsiniz."],
  [/Evet, kapıda nakit, kredi kartı \(POS\) ve QR ile ödeme yapabilirsiniz\./g, "Evet, güvenli online kredi/banka kartı ile ödeme yapabilirsiniz."],
  [/Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine teslimat yapıyoruz\./g, "Türkiye'nin her yerine kargo ile gönderim yapıyoruz."],
  [/(?:Samsun ve Atakum|Samsun|Atakum)'ın tüm mahallelerine kurye ile teslimat yapıyoruz\./g, "Türkiye'nin her yerine kargo ile gönderim yapıyoruz."],
  [/Kurye ekibimiz siparişinizi apartman katınıza kadar getirir, ağır çuval taşımazsınız\./g, "Kargo ile siparişiniz adresinize kadar gelir, ağır çuval taşımazsınız."],
  [/Aynı gün, ortalama 1-3 saat içinde siparişiniz kapınızda olur\./g, "Siparişiniz güvenli ödeme sonrası hızlıca kargoya verilir."],
  [/Aynı gün, ortalama 1-3 saat teslimat/g, "Hızlı kargo ile teslimat"],
  [/Ortalama 1-3 saat içinde siparişiniz kapınızda olur\. Sabah verilen siparişler öğleden sonra elinizde\./g, "Siparişiniz kargoya verildikten sonra çoğu adrese 1-3 iş gününde ulaşır."],
  [/Ortalama 1-3 saat içinde siparişiniz kapınızda olur\. Acil ihtiyaçlarda önceliklendirme yapıyoruz\./g, "Siparişiniz hızlı kargo ile gönderilir; çoğu adrese 1-3 iş gününde ulaşır."],
  [/Evet, ortalama 1-3 saat içinde teslimat yapıyoruz\. Sabah verilen siparişler öğleden sonra elinizde olur\./g, "Siparişinizi hızlıca kargoya veriyoruz; çoğu adrese 1-3 iş gününde ulaşır."],
  [/Evet, akvaryum ekipmanı ve balık yemi ürünlerini aynı gün kapınıza getiriyoruz\./g, "Evet, akvaryum ekipmanı ve balık yemi ürünlerini hızlı kargo ile adresinize gönderiyoruz."],
  [/her gün, hafta sonu ve pazar günü dahil sipariş alır\. Gündüz verdiğiniz siparişler aynı gün kapınıza ulaşır\./g, "her gün, hafta sonu dahil sipariş alır. Siparişleriniz hızlıca kargoya verilir."],
  [/her gün sipariş alır ve kapınıza teslim eder; hafta sonu ve pazar günü dahil hizmetinizdeyiz\./g, "her gün sipariş alır ve kargo ile adresinize gönderir; hafta sonu dahil hizmetinizdeyiz."],
  [/jetgomarket\.com üzerinden ürünleri seçin, sepete ekleyin ve WhatsApp ile tek tıkla siparişinizi onaylayın\./g, "jetgomarket.com üzerinden ürünleri seçin, sepete ekleyin ve güvenli online ödeme ile siparişinizi tamamlayın."],
  [/Ürünleri sepete ekleyip WhatsApp ile onaylayın; siparişiniz aynı gün kapınıza gelir\./g, "Ürünleri sepete ekleyip güvenli online ödeme ile tamamlayın; siparişiniz kargoyla adresinize gelir."],
  [/Kapıda nakit, POS ve QR ödeme/g, "Güvenli online kart ile ödeme"],
  [/Kapıda ödeme seçenekleri mevcuttur\./g, "Güvenli online ödeme seçenekleri mevcuttur."],
  [/Kapıda ödeme, uygun fiyat\./g, "Güvenli online ödeme, uygun fiyat."],
  [/Nakit ödemede ekstra indirim ve kampanyalı ürünler ile tasarruf edersiniz\./g, "Kampanyalı ürünler ile tasarruf edersiniz."],
  [/Nakit ödemede ekstra avantaj sağlıyoruz\./g, "Online ödeme avantajı sağlıyoruz."],
  [/kapıda ödeme kabul ediyor mu\?/g, "güvenli online ödeme kabul ediyor mu?"],
  [/için kapıda ödeme var mı\?/g, "için güvenli online ödeme var mı?"],
  [/gerçekten aynı gün mü\?/g, "ne kadar sürede gelir?"],
  [/(?:Samsun ve Atakum|Samsun|Atakum) tüm mahallelere teslimat/g, "Türkiye geneli kargo ile teslimat"],
  [/kurye ile teslimat yapıyoruz/g, "kargo ile teslimat yapıyoruz"],
  [/aynı gün kapınıza getirir\./g, "hızlı kargo ile adresinize gönderir."],
  [/aynı gün kapınızda teslim alın\./g, "hızlı kargo ile adresinizde teslim alın."],
  [/siparişinizi en kısa sürede kapınıza ulaştırır\./g, "siparişinizi en kısa sürede kargoya verir."],
  [/- aynı gün kapıda/g, "- hızlı kargo ile"],
  [/- hemen kapınızda/g, "- hızlı kargo ile"],
];

/**
 * Rewrite shared SEO/landing copy that hard-codes the LOCAL same-day courier +
 * door-payment model so it reads truthfully on CARGO / online-payment-only
 * stores (Karadeniz / Samsun / Samsunpet). No-op for local-fulfillment stores
 * and the default store. Only false delivery/payment CLAIMS are swapped; keyword
 * phrases and generic "kapıya teslim" stay intact. Compose with brandifyFor at
 * render time: brandifyFor(store, commercifyFor(store, text)).
 */
export function commercifyFor(store: StoreConfig, text: string): string {
  if (!text || store.commerce.fulfillment !== "cargo") return text;
  let t = text;
  for (const [pattern, replacement] of CARGO_COPY_REWRITES) t = t.replace(pattern, replacement);
  return t;
}

/** Canonical hostname (with www if that is the canonical form) for a store. */
export function canonicalHost(store: StoreConfig): string {
  try {
    return new URL(store.domain).host.toLowerCase();
  } catch {
    return "";
  }
}
