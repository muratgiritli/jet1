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
  /**
   * true ise ürün popup'ı ve kampanya kartlarında doğrudan "Sepete Ekle" + adet (+/-)
   * kontrolü gösterilir (eski hızlı sipariş akışı). false/undefined ise butonlar ürün
   * detay sayfasına yönlendirir. Yalnızca jetgo (jetgomarket.com) için açıktır.
   */
  quickAddToCart?: boolean;
  /**
   * true ise misafir (üyeliksiz) sipariş akışı açıktır: müşteri ad + telefon +
   * adres girer, sipariş tek seferlik SMS koduyla onaylanır (arka planda sessiz
   * hesap oluşturulur). Üyelik duvarı gösterilmez. Yalnızca jetgo için açıktır.
   */
  guestCheckout?: boolean;
  /**
   * true ise liste/kategori sayfaları ve ürün detay sayfası yeni (modern) tasarımı
   * kullanır: yatay ürün satırları (Ürünü İncele) + zengin ürün detay sayfası.
   * Yalnızca jetgo (jetgomarket.com) için açıktır.
   */
  modernCatalogUI?: boolean;
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
  hostnames: ["enuygunpet.com", "www.enuygunpet.com"],
  name: "Enuygun Pet Shop Samsun",
  shortName: "Enuygun",
  brandWord: "Enuygun",
  alternateNames: ["Enuygun Samsun Pet Shop", "Enuygun Pet", "Enuygun Atakum Pet Shop", "Enuygun"],
  domain: "https://www.enuygunpet.com",
  logo: "/logo-enuygun.webp",
  favicon: "/favicon-192.png",
  phone: "+908508403959",
  phoneDisplay: "0850 840 39 59",
  email: "info@sizpa.com",
  address: "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun",
  companyName: "Sizpa İnternet Tic. Ltd. Şti.",
  businessDescription:
    "Samsun'un en hızlı pet shop'u Enuygun. Kedi maması, köpek maması, kedi kumu, ödül maması ve evcil hayvan ürünlerinde Atakum, İlkadım, Canik içi aynı gün teslimat ve kapıda ödeme imkanı.",
  slogan: "Samsun'un Hızlı Pet Shop'u — Aynı Gün Teslimat",
  social: [],
  theme: {
    primary: "203 89% 53%",
    topBar: "#6B3480",
    navBar: "#7c4dff",
  },
  seo: {
    title: "Atakum Petshop & Samsun Pet Shop - Aynı Gün Teslimat | Enuygun",
    description:
      "Atakum içinde 1 saatte, Samsun geneline aynı gün petshop teslimatı. Denizevleri, Atakent, Mimar Sinan ve tüm Atakum mahallelerine kedi maması, köpek maması, kedi kumu kapıda ödeme. Enuygun 0850 840 39 59.",
    keywords:
      "atakum petshop, atakum pet shop, atakum kedi maması, atakum köpek maması, atakum kedi kumu, atakum aynı gün teslimat, atakum 1 saatte teslimat, denizevleri petshop, atakent petshop, mimar sinan petshop, yenimahalle petshop, kurupelit petshop, samsun petshop, kapıda ödeme petshop atakum",
    ogImage: "/og-image.webp",
  },
  google: {
    gtmId: "GTM-5CS6KNDV",
    siteVerification: "NM2XVxg4l9LiW90SmKoo3brIjr12guYrDUriTcR0Jok",
  },
  commerce: {
    fulfillment: "local",
    shippingLabel: "Getirmesi",
    onlinePaymentOnly: false,
    preorderEnabled: true,
    quickAddToCart: true,
    guestCheckout: true,
    modernCatalogUI: true,
  },
};

export const STORES: StoreConfig[] = [jetgo];
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
 * given store's brand word and domain. The shared SEO corpus + static index.html
 * are authored in JETGO / jetgomarket.com terms as the substitution SOURCE; every
 * store — including the flagship, which is now branded Enuygun — is derived from
 * it. Used by both client (<SEO>, page bodies) and server (meta injection) so
 * every domain reads as its own brand.
 */
export function brandifyFor(store: StoreConfig, text: string): string {
  if (!text) return text;
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
