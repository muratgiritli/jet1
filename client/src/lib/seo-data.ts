import { BRAND_PAGES } from "./brand-seo-data";
import { KEYWORD_AUTO_PAGES } from "./keyword-pages";
import { ATAKUM_KEYWORD_PAGES } from "./keyword-pages-atakum";
import { ATAKUM_ALL_KEYWORD_PAGES } from "./keyword-pages-atakum-all";
import { JETGOSHOP_ALL_KEYWORD_PAGES } from "./keyword-pages-jetgoshop-all";
import { ATAKUMBIZ_ALL_KEYWORD_PAGES } from "./keyword-pages-atakumbiz-all";
import { MARKAPET_ALL_KEYWORD_PAGES } from "./keyword-pages-markapet-all";
import { KARADENIZ_ALL_KEYWORD_PAGES } from "./keyword-pages-karadeniz-all";
import { SAMSUN_ALL_KEYWORD_PAGES } from "./keyword-pages-samsun-all";
import { JETGO_KEYWORD_PAGES } from "./keyword-pages-jetgo";
import { ROYALCANIN_KEYWORD_PAGES } from "./keyword-pages-jetgo-royalcanin";
import { MARKALAR_KEYWORD_PAGES } from "./keyword-pages-jetgo-markalar";
import { DIGER_KEYWORD_PAGES } from "./keyword-pages-jetgo-diger";
import type { StoreConfig } from "@shared/stores";
export interface SeoSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
}

export interface SeoPageData {
  slug: string;
  type: "core" | "district" | "mahalle-block" | "mahalle" | "category" | "blog" | "keyword" | "brand";
  // Commerce-model scope. Default "all" = truthful on both local & cargo stores
  // (after commercify cleanup). "localOnly" = same-day courier / door-payment /
  // hyperlocal pages hidden from cargo domains. "cargoOnly" = online+kargo pages
  // hidden from local domains. See getSeoPagesForStore / findSeoPage.
  availability?: "all" | "localOnly" | "cargoOnly";
  // Store-EXCLUSIVE override. When set, this page is served ONLY on the store
  // whose id matches and, at a slug it shares with a normal page, it REPLACES
  // that page for this store (other stores keep the shared one). Lets one domain
  // (e.g. atakum) publish its own independent variant of a keyword landing page.
  // See _overrideByStore / findSeoPage / getSeoPagesForStore.
  storeId?: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  h1: string;
  intro: string[];
  sections?: SeoSection[];
  features?: string[];
  mahalleler?: string[];
  faq: { q: string; a: string }[];
  internalLinks: { text: string; href: string }[];
  buyLinks?: { text: string; href: string }[];
  parentDistrict?: string;
}

export const SEO_PAGES: SeoPageData[] = [
  {
    slug: "samsun-petshop",
    type: "core",
    title: "Samsun Pet Shop",
    metaTitle: "Samsun Petshop | Atakum En Yakın Petshop - Hızlı Teslimat & Kapıda Ödeme",
    metaDescription: "Samsun ve Atakum'da en yakın petshop! Kedi maması, köpek maması, kedi kumu ve tüm pet ürünlerinde hızlı teslimat, kapıda ödeme ve uygun fiyat avantajı.",
    keywords: "samsun petshop, samsun pet shop, atakum petshop, petshop samsun, samsun petstore, samsun hayvan mağazası, samsun evcil hayvan mağazası, petshop atakum, pet store samsun, samsun petshop en yakın, samsun petshop açık, jetgo petshop samsun",
    h1: "Samsun & Atakum Petshop: Evcil Hayvan İhtiyaçlarınız İçin En Yakın Çözüm",
    intro: [
      "JETGO, Samsun'un en kapsamlı kapıya teslim pet shop hizmetidir. 900'den fazla ürün çeşidiyle kedi, köpek, kuş ve kemirgen sahiplerine hızlı ve güvenilir teslimat sunuyoruz. Samsun'un Atakum, İlkadım, Canik ve Tekkeköy ilçelerine aynı gün teslimat yapıyoruz.",
      "Royal Canin, Hill's Science Plan, N&D, Pro Plan, Reflex ve daha birçok premium markayı uygun fiyatlarla kapınıza getiriyoruz. Nakit ödemede ekstra avantajlı fiyatlarımızdan yararlanın. Samsun'da petshop aramanıza gerek yok, JETGO size geliyor.",
      "Sipariş vermek çok kolay: ürünlerinizi seçin, sepete ekleyin ve WhatsApp üzerinden siparişinizi tamamlayın. Aynı gün içinde teslimat ekibimiz siparişinizi kapınıza getirir. Samsun petshop alışverişinde yeni bir dönem başlıyor.",
    ],
    sections: [
      {
        h2: "Samsun Petshop Hizmeti Nasıl Çalışır?",
        paragraphs: [
          "JETGO pet shop hizmeti, Getir modeli ile çalışan Samsun'un ilk kapıya teslim evcil hayvan mağazasıdır. Geleneksel pet shop'lara gidip ağır mama çuvallarını ve kedi kumu paketlerini taşıma derdi artık geride kaldı. Samsun petshop arayanlar için en pratik çözüm JETGO'dur.",
          "jetgomarket.com web sitemiz üzerinden tüm ürünleri inceleyebilir, fiyatları karşılaştırabilir ve sepetinize ekleyebilirsiniz. Ardından WhatsApp üzerinden tek tıkla siparişinizi onaylayın. Kurye ekibimiz siparişinizi kapınıza kadar getirir. Kapıda nakit, POS ile kredi kartı veya QR kod ile ödeme yapabilirsiniz.",
          "Samsun petshop denilince akla ilk gelen isim olan JETGO, müşterilerine sadakat programı olan Para Puan sistemi ile her siparişte %5 geri kazanım sağlar. Biriken puanlarınızı sonraki siparişlerinizde kullanabilirsiniz.",
        ],
      },
      {
        h2: "Samsun Petshop Ürün Çeşitleri",
        paragraphs: [
          "JETGO'da kediler için kuru mama, yaş mama, açık mama, kedi kumu, kedi tuvaleti, kedi taşıma çantası, malt-vitamin, ödül maması ve bakım ürünleri bulunmaktadır. Köpekler için kuru mama, yaş mama, ödül kemik, tuvalet malzemeleri, taşıma ürünleri ve bakım-sağlık ürünleri mevcuttur.",
          "Bunların yanı sıra kuş yemi, kuş kafesi, kuş vitamini, kemirgen yemi, kemirgen kafesi ve bakım aksesuarları da ürün yelpazemizde yer almaktadır. Samsun'da petshop nerede diye aramanıza gerek yok, tüm evcil hayvan ürünleri bir tık uzağınızda.",
        ],
        list: [
          "Kedi Maması: Royal Canin, Hill's, N&D, Pro Plan, Reflex, Felicia, Pronature, ProChoice",
          "Köpek Maması: Royal Canin, Hill's, N&D, Pro Plan, Reflex, Pro Performance, Econature",
          "Kedi Kumu: Van Cat, Biokat's, Sanicat - Bentonit, Silika, Aktif Karbonlu",
          "Kuş ve Kemirgen: Yem, kafes, vitamin, aksesuar çeşitleri",
          "Bakım Ürünleri: Şampuan, tırnak makası, diş bakım, çiş pedi",
        ],
      },
      {
        h2: "Samsun Petshop Teslimat Bölgeleri",
        paragraphs: [
          "Samsun petshop teslimatı Atakum, İlkadım, Canik ve Tekkeköy ilçelerinin tüm mahallelerine yapılmaktadır. Atakum'da Denizevleri, Güzelyalı, Kurupelit, Atakent, Mimar Sinan, Körfez, Yeni Mahalle gibi tüm mahallelere ulaşıyoruz. İlkadım'da Kadıköy, Rasathane, Kılıçdede, Baruthane; Canik'te Karşıyaka ve Gaziosmanpaşa mahallelerine düzenli teslimat rotalarımız mevcuttur.",
          "Atakum petshop arayanlar için sahil şeridindeki mahallelere öncelikli teslimat yapıyoruz. Teslimat süremiz ortalama 1-3 saat arasındadır. Samsun petshop açık mı diye merak ediyorsanız, her gün 09:00-21:00 saatleri arasında sipariş alıyoruz.",
        ],
      },
      {
        h2: "Samsun Petshop Fiyat ve Kampanya Avantajları",
        paragraphs: [
          "JETGO olarak Samsun petshop fiyatlarında en rekabetçi fiyat politikasını benimsiyoruz. Nakit ödemede ekstra avantajlı fiyat uyguluyoruz. Her siparişte kazandığınız %5 Para Puan ile bir sonraki alışverişinizde tasarruf sağlarsınız. Kampanya ürünlerimizi takip ederek özel fırsatları kaçırmayın.",
          "Minimum sipariş tutarımız 500 TL'dir. 1.500 TL ve üzeri siparişlerde kargo ücretsizdir. Samsun petshop indirim ve kampanyalarını düzenli olarak güncelliyoruz. Üye olan müşterilerimize özel hoş geldin kuponu hediye ediyoruz.",
        ],
      },
    ],
    features: [
      "900+ ürün çeşidi - Kedi, köpek, kuş, kemirgen",
      "Aynı gün teslimat - Sipariş verin, aynı gün kapınızda",
      "Nakit ödemede avantajlı fiyat - Piyasanın en uygun fiyatları",
      "WhatsApp ile kolay sipariş - Tek tıkla sipariş verin",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
      "Para Puan ile %5 geri kazanım",
      "1.500 TL üzeri ücretsiz kargo",
      "Kapıda POS, QR ve nakit ödeme",
    ],
    mahalleler: [
      "Atakum", "İlkadım", "Canik", "Tekkeköy",
      "Yeni Mahalle", "Denizevleri", "Güzelyalı", "Kurupelit",
      "Atakent", "İncesu", "Körfez", "Mimar Sinan",
      "Kadıköy", "Rasathane", "Kılıçdede", "Baruthane",
    ],
    faq: [
      { q: "Samsun'da pet shop teslimat süresi ne kadar?", a: "Samsun merkez ilçelere (Atakum, İlkadım, Canik) aynı gün teslimat yapıyoruz. Siparişinizi sabah verirseniz akşama kadar elinizde olur. Ortalama teslimat süremiz 1-3 saattir." },
      { q: "Samsun petshop minimum sipariş tutarı nedir?", a: "Minimum sipariş tutarımız 500 TL'dir. 1.500 TL ve üzeri siparişlerde kargo ücretsizdir." },
      { q: "Samsun petshop hangi ödeme yöntemlerini kabul ediyor?", a: "Kapıda nakit, kapıda kredi kartı (POS), banka havalesi/EFT ve QR ödeme seçeneklerimiz mevcuttur. Nakit ödemede ekstra avantajlı fiyat uyguluyoruz." },
    ],
    internalLinks: [
      { text: "Kedi Maması Samsun", href: "/samsun-petshop-kedi-mamasi" },
      { text: "Köpek Maması Samsun", href: "/samsun-petshop-kopek-mamasi" },
      { text: "Kedi Kumu Samsun", href: "/samsun-petshop-kedi-kumu" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "İlkadım Pet Shop", href: "/ilkadim-petshop" },
      { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "atakum-petshop",
    type: "district",
    title: "Atakum Pet Shop",
    metaTitle: "Atakum Petshop | En Yakın Pet Shop Atakum - Aynı Gün Kapıya Teslim | JETGO",
    metaDescription: "Atakum'a aynı gün teslimat yapan petshop. Kedi maması, köpek maması, kedi kumu. Denizevleri, Güzelyalı, Kurupelit, Atakent, Mimar Sinan petshop. Kapıda ödeme.",
    keywords: "atakum petshop, atakum pet shop, atakum petstore, atakum hayvan mağazası, atakum petshop en yakın, atakum petshop açık, atakum petshop nerede, atakum kedi maması, atakum köpek maması, petshop atakum, pet store atakum",
    h1: "Atakum Petshop: En Yakın Kapıya Teslim Pet Shop",
    intro: [
      "Atakum'un en güvenilir kapıya teslim pet shop hizmeti JETGO ile tanışın. Denizevleri'nden Güzelyalı'ya, Kurupelit'ten Atakent'e kadar Atakum'un her mahallesine aynı gün teslimat yapıyoruz. Atakum petshop arayanlar için en hızlı çözüm JETGO'dur.",
      "Kedi maması, köpek maması, kedi kumu, kuş yemi, kemirgen ürünleri ve tüm evcil hayvan aksesuarlarını kapınıza getiriyoruz. Royal Canin, Hill's, N&D gibi premium markaları en uygun fiyatlarla sunuyoruz. Atakum petshop en yakın diye aramanıza gerek yok, biz size geliyoruz.",
      "Atakum sahil şeridindeki müşterilerimize özel hızlı teslimat avantajımızdan yararlanın. Sabah siparişleriniz öğleden sonra kapınızda. Atakum petshop açık mı diye endişelenmeyin, her gün 09:00-21:00 arası hizmetinizdeyiz.",
    ],
    sections: [
      {
        h2: "Atakum Petshop Mahalle Bazlı Teslimat",
        paragraphs: [
          "JETGO olarak Atakum ilçesinin tüm mahallelerine düzenli teslimat rotası ile evcil hayvan ürünleri teslim ediyoruz. Atakum Yeni Mahalle petshop, Atakum Mimar Sinan petshop, Atakum Denizevleri petshop, Atakum Güzelyalı petshop, Atakum Esenevler petshop, Atakum Körfez petshop, Atakum Atakent petshop ve Atakum Taflan petshop arayanlar için en pratik çözüm JETGO'dur.",
          "Sahil şeridindeki Denizevleri, Güzelyalı ve Altınkum mahallelerine öncelikli hızlı teslimat yapıyoruz. İç mahallelerde yer alan Mimar Sinan, Körfez, İncesu, Soğuksu ve Taflan bölgelerine de aynı gün teslimat garantimiz geçerlidir.",
          "Atakum'da açık petshop arıyorsanız veya atakum petshop nerede diye soruyorsanız, cevap basit: JETGO kapınıza gelir. Fiziksel mağazaya gitmenize gerek yok, 900'den fazla ürünü online inceleyin ve sipariş verin.",
        ],
      },
      {
        h2: "Atakum Petshop Ürün ve Marka Çeşitleri",
        paragraphs: [
          "Atakum petshop olarak kedi maması markalarında Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan, Reflex Plus, Felicia, Pronature ve ProChoice gibi premium ve ekonomik markaları sunuyoruz. Yavru kedi maması, yetişkin kedi maması, kısırlaştırılmış kedi maması ve özel diyet mamalarını stokta bulunduruyoruz.",
          "Köpek maması markalarında Royal Canin, Hill's, N&D, Pro Plan, Reflex, Pro Performance, Econature ve Wanpy mevcut. Küçük ırk, orta ırk ve büyük ırk köpekler için özel formüllü mamalar, yavru köpek mamaları ve hassas sindirim mamaları ürün yelpazemizde yer alıyor.",
          "Kedi kumu olarak Van Cat, Biokat's ve Sanicat markalarının bentonit, silika ve aktif karbonlu seçeneklerini sunuyoruz. Atakum petshop kedi kumu teslimatında ağır kumları apartman katınıza kadar çıkarıyoruz.",
        ],
      },
      {
        h2: "Atakum Petshop Fiyat ve Ödeme",
        paragraphs: [
          "Atakum petshop fiyatlarında en uygun fiyat garantisi sunuyoruz. Nakit ödemede ekstra avantajlı fiyatlar geçerlidir. Kapıda POS cihazı ile kredi kartı, QR kod ile ödeme ve banka havalesi seçenekleri mevcuttur. Atakum petshop kapıda ödeme ile alışveriş yapabilirsiniz.",
          "Her siparişte %5 Para Puan kazanırsınız. Biriken puanlarınızı sonraki siparişlerinizde harcayabilirsiniz. Atakum petshop kampanya ve indirimlerini düzenli olarak takip edin, özel fırsatları kaçırmayın.",
        ],
      },
    ],
    mahalleler: [
      "Yeni Mahalle", "Denizevleri", "Güzelyalı", "Kurupelit",
      "Atakent", "İncesu", "Balaç", "Çakırlar",
      "Mimar Sinan", "Körfez", "Soğuksu", "Taflan",
      "Altınkum", "Çobanlı", "Büyükoyumca", "Esenevler",
    ],
    faq: [
      { q: "Atakum'da en yakın petshop nerede?", a: "JETGO olarak Atakum'un tüm mahallelerine kapıya teslim petshop hizmeti sunuyoruz. Fiziksel mağazaya gitmenize gerek yok, online sipariş verin aynı gün kapınıza getirelim." },
      { q: "Atakum petshop hangi saatte açık?", a: "JETGO Atakum petshop hizmeti her gün 09:00-21:00 saatleri arasında sipariş kabul etmektedir. 17:00'ye kadar verilen siparişler aynı gün teslim edilir." },
      { q: "Atakum Denizevleri'ne petshop teslimatı var mı?", a: "Evet, Denizevleri dahil Atakum'un tüm mahallelerine aynı gün teslimat yapıyoruz. Sahil şeridine öncelikli hızlı teslimat avantajımız mevcuttur." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Kedi Maması", href: "/atakum-petshop-kedi-mamasi" },
      { text: "Atakum Köpek Maması", href: "/atakum-petshop-kopek-mamasi" },
      { text: "Atakum Mahalleler", href: "/atakum-mahalleler" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "İlkadım Pet Shop", href: "/ilkadim-petshop" },
    ],
  },
  {
    slug: "ilkadim-petshop",
    type: "district",
    title: "İlkadım Pet Shop",
    metaTitle: "İlkadım Petshop | Aynı Gün Kapıya Teslim Pet Shop | JETGO Samsun",
    metaDescription: "İlkadım'a aynı gün teslimat yapan petshop. Kadıköy, Rasathane, Kılıçdede, Baruthane mahallelerine hızlı teslimat. Kedi köpek maması, kedi kumu kapıda ödeme.",
    keywords: "ilkadım petshop, ilkadım pet shop, ilkadım kedi maması, ilkadım köpek maması, ilkadım kapıya teslim, ilkadım petshop en yakın",
    h1: "İlkadım Kapıya Teslim Pet Shop",
    intro: [
      "İlkadım ilçesine aynı gün kapıya teslim pet shop hizmeti. Kadıköy, Rasathane, Kılıçdede, Kalkancı, Baruthane ve Ulugazi mahallelerine hızlı teslimat yapıyoruz. İlkadım petshop arayanlar için en pratik çözüm JETGO'dur.",
      "Samsun'un merkezi İlkadım ilçesinde yaşayan evcil hayvan sahipleri için 900'den fazla ürün seçeneği sunuyoruz. Premium kedi maması, köpek maması, kedi kumu ve aksesuar ürünlerini uygun fiyatlarla kapınıza getiriyoruz.",
      "İlkadım'ın yoğun trafiğinde mağaza mağaza dolaşmak yerine, JETGO ile tüm evcil hayvan ihtiyaçlarınızı tek tıkla sipariş edin. Aynı gün kapınıza getirelim. Royal Canin, Hill's, N&D, Pro Plan gibi premium markalar uygun fiyatlarla elinizin altında.",
    ],
    sections: [
      {
        h2: "İlkadım Petshop Teslimat Bölgeleri",
        paragraphs: [
          "İlkadım ilçesinin Kadıköy, Rasathane, Kılıçdede, Kalkancı, Baruthane, Ulugazi, Derecik, Adalet ve Çiftlik mahallelerine düzenli teslimat yapıyoruz. İlkadım merkezindeki tüm adreslere ortalama 1-2 saat içinde ulaşıyoruz.",
          "İlkadım petshop hizmeti olarak kedi maması, köpek maması, kedi kumu ve tüm evcil hayvan ürünlerini ağır paketler dahil kapınıza kadar teslim ediyoruz. Apartman katınıza kadar çıkarıyoruz.",
        ],
      },
      {
        h2: "İlkadım'da Mevcut Marka ve Ürünler",
        paragraphs: [
          "Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan, Reflex Plus, Profine, Felicia gibi kedi ve köpek maması markalarını İlkadım'a teslim ediyoruz. Kedi kumu markalarından Van Cat, Biokat's ve Sanicat stokta mevcut. Kuş yemi, kemirgen yemi ve tüm aksesuar ürünleri de kapıya teslim listemizdedir.",
          "İlkadım petshop olarak nakit ödemede avantajlı fiyat, kapıda POS ile kredi kartı ödeme, QR kod ödeme ve banka havalesi seçenekleri sunuyoruz. Her siparişte %5 Para Puan kazanırsınız.",
        ],
      },
    ],
    mahalleler: [
      "Kadıköy", "Rasathane", "Kılıçdede",
      "Kalkancı", "Baruthane", "Ulugazi",
      "Derecik", "Adalet", "Çiftlik",
    ],
    faq: [
      { q: "İlkadım'a petshop teslimat süresi ne kadar?", a: "İlkadım merkezine 1-2 saat içinde teslimat yapıyoruz. Yoğunluğa göre aynı gün teslimat garantimiz geçerlidir." },
      { q: "İlkadım Kadıköy mahallesine teslimat var mı?", a: "Evet, Kadıköy dahil İlkadım'ın tüm mahallelerine aynı gün teslimat yapıyoruz." },
      { q: "İlkadım'da petshop hangi markaları satıyor?", a: "Royal Canin, Hill's, N&D, Pro Plan, Reflex, Profine ve daha birçok premium marka mevcuttur. 900+ ürün çeşidimiz bulunmaktadır." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Canik Pet Shop", href: "/canik-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
    ],
  },
  {
    slug: "canik-petshop",
    type: "district",
    title: "Canik Pet Shop",
    metaTitle: "Canik Petshop | Aynı Gün Kapıya Teslim | JETGO Samsun",
    metaDescription: "Canik'e aynı gün teslimat yapan petshop. Karşıyaka, Gaziosmanpaşa, Yenimahalle mahallelerine hızlı teslimat. Kedi köpek maması, kedi kumu kapıda ödeme.",
    keywords: "canik petshop, canik pet shop, canik kedi maması, canik köpek maması, canik kapıya teslim, canik petshop en yakın",
    h1: "Canik Kapıya Teslim Pet Shop",
    intro: [
      "Canik ilçesine aynı gün kapıya teslim pet shop hizmeti. Karşıyaka, Gaziosmanpaşa, Yenimahalle ve Kuzeyyıldızı mahallelerine düzenli teslimat yapıyoruz. Canik petshop arayanlar için en güvenilir adres JETGO'dur.",
      "Canik'te yaşayan evcil hayvan sahipleri için premium marka kedi maması, köpek maması, kedi kumu ve aksesuar ürünlerini uygun fiyatlarla sunuyoruz. JETGO ile sipariş verin, aynı gün kapınıza getirelim. Nakit ödemede avantajlı fiyat, kapıda POS ve QR ödeme imkânı.",
      "Canik bölgesindeki müşterilerimize özel kampanya ve indirimlerden haberdar olmak için üye olun. Para Puan sistemiyle her siparişte %5 kazanın. 900'den fazla ürün çeşidi ile evcil dostunuzun tüm ihtiyaçlarını karşılıyoruz.",
    ],
    sections: [
      {
        h2: "Canik Petshop Ürün ve Hizmetler",
        paragraphs: [
          "Canik petshop hizmeti kapsamında kedi maması, köpek maması, kedi kumu, kuş yemi, kemirgen ürünleri ve tüm evcil hayvan aksesuarlarını kapınıza teslim ediyoruz. Royal Canin, Hill's, N&D, Pro Plan, Reflex gibi premium markalar en uygun fiyatlarla stokta mevcuttur.",
          "Canik'te kapıda nakit ödeme, kredi kartı (POS), QR kod ödeme ve banka havalesi seçenekleri sunuyoruz. Ağır mama çuvallarını ve kedi kumu paketlerini apartman katınıza kadar çıkarıyoruz.",
        ],
      },
    ],
    mahalleler: [
      "Karşıyaka", "Gaziosmanpaşa", "Yenimahalle", "Kuzeyyıldızı",
    ],
    faq: [
      { q: "Canik'e petshop teslimat süresi ne kadar?", a: "Canik ilçesine ortalama 1-3 saat içinde teslimat yapıyoruz. Aynı gün teslimat garantimiz geçerlidir." },
      { q: "Canik'te minimum sipariş tutarı nedir?", a: "Minimum sipariş tutarımız 500 TL'dir. 1.500 TL üzeri siparişlerde kargo ücretsizdir." },
      { q: "Canik Karşıyaka'ya petshop teslimatı var mı?", a: "Evet, Karşıyaka dahil Canik'in tüm mahallelerine aynı gün teslimat yapıyoruz." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "İlkadım Pet Shop", href: "/ilkadim-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
    ],
  },
  {
    slug: "atakum-mahalleler",
    type: "mahalle-block",
    title: "Atakum Mahalleler",
    metaTitle: "Atakum Mahallelerine Petshop Teslimat | JETGO Samsun",
    metaDescription: "Atakum'un tüm mahallelerine aynı gün petshop teslimatı. Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan ve diğer mahallelere kapıya teslim.",
    keywords: "atakum mahalleler petshop, denizevleri petshop, güzelyalı petshop, kurupelit petshop, atakent petshop, mimar sinan petshop, körfez petshop, taflan petshop, esenevler petshop",
    h1: "Atakum Tüm Mahalleler - Petshop Teslimat",
    intro: [
      "JETGO olarak Atakum ilçesinin tüm mahallelerine evcil hayvan ürünleri teslimatı yapıyoruz. Sahil şeridinden iç mahallelere kadar her noktaya aynı gün ulaşıyoruz. Atakum Yeni Mahalle, Mimar Sinan, Denizevleri, Güzelyalı, Esenevler, Körfez, Atakent ve Taflan petshop arayanlar için JETGO en yakın çözümdür.",
      "Aşağıda Atakum'un teslimat yaptığımız tüm mahallelerini bulabilirsiniz. Her mahalleye kedi maması, köpek maması, kedi kumu ve tüm evcil hayvan ürünlerini aynı gün kapıya teslim ediyoruz.",
    ],
    sections: [
      {
        h2: "Atakum Mahalle Bazlı Petshop Hizmeti",
        paragraphs: [
          "Atakum petshop hizmetimiz mahalle bazlı teslimat rotaları ile çalışmaktadır. Denizevleri, Güzelyalı ve Altınkum gibi sahil mahallelerine 1-2 saat içinde teslimat yapıyoruz. Kurupelit, Atakent ve İncesu bölgesine düzenli teslimat rotamız mevcuttur. Mimar Sinan, Körfez, Soğuksu ve Taflan gibi iç mahallelere de aynı gün teslimat garantisi sunuyoruz.",
          "Atakum'da en yakın petshop arayanlar için JETGO'nun kapıya teslim hizmeti en pratik çözümdür. Ağır mama çuvalları ve kedi kumu paketleri dahil tüm ürünlerinizi kapınıza, hatta apartman katınıza kadar getiriyoruz.",
        ],
      },
    ],
    mahalleler: [
      "Yeni Mahalle", "Denizevleri", "Güzelyalı", "Kurupelit",
      "Atakent", "İncesu", "Balaç", "Çakırlar",
      "Mimar Sinan", "Körfez", "Soğuksu", "Taflan",
      "Altınkum", "Çobanlı", "Büyükoyumca", "Kozalak",
      "Kamalı", "Çamlık", "Yeşildere", "Yeşilyurt", "Esenevler",
    ],
    faq: [
      { q: "Atakum'un en uzak mahallesine petshop teslimatı var mı?", a: "Evet, Taflan ve Balaç dahil Atakum'un tüm mahallelerine aynı gün teslimat yapıyoruz." },
      { q: "Atakum sahil şeridine teslimat süresi ne kadar?", a: "Denizevleri, Güzelyalı ve Altınkum gibi sahil mahallelerine 1-2 saat içinde teslimat yapıyoruz." },
      { q: "Atakum Esenevler'e petshop teslimatı var mı?", a: "Evet, Esenevler dahil Atakum'un tüm mahallelerine düzenli teslimat rotamız bulunmaktadır." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
    ],
  },
  {
    slug: "kedi-mamasi",
    type: "category",
    title: "Kedi Maması",
    metaTitle: "Kedi Maması Samsun - En İyi Markalar Uygun Fiyat | JETGO Petshop",
    metaDescription: "Samsun'da kedi maması kapıya teslim. Royal Canin, Hill's, N&D, Pro Plan, Reflex kedi maması. Yavru, yetişkin, kısırlaştırılmış kedi mamaları. Aynı gün teslimat.",
    keywords: "kedi maması, kedi maması samsun, samsun petshop kedi maması, en iyi kedi maması, ucuz kedi maması, royal canin kedi, hills kedi maması, samsun kedi maması fiyat, samsun premium kedi maması, samsun yavru kedi maması, samsun yetişkin kedi maması, samsun tahılsız kedi maması",
    h1: "Kedi Maması - Samsun Kapıya Teslim",
    intro: [
      "JETGO'da kedi maması çeşitlerimizle kedinizin beslenme ihtiyaçlarını en iyi şekilde karşılayın. Royal Canin, Hill's Science Plan, N&D, Pro Plan ve Reflex gibi dünya markalarını uygun fiyatlarla Samsun'da kapınıza getiriyoruz.",
      "Yavru kedi maması, yetişkin kedi maması, kısırlaştırılmış kedi maması, hassas sindirimli kedi maması ve özel diyet kedi mamalarını geniş ürün yelpazemizde bulabilirsiniz. Samsun'da kedi maması fiyatlarında nakit ödemede ekstra avantaj sunuyoruz.",
      "Kuru mama, yaş mama ve ödül maması seçenekleriyle kedinizin damak zevkine uygun ürünü kolayca bulun. Büyük boy paketlerde ekstra tasarruf fırsatı yakalayın. Samsun petshop kedi maması arayanlar için JETGO en doğru adres.",
    ],
    sections: [
      {
        h2: "Samsun'da En İyi Kedi Maması Markaları",
        paragraphs: [
          "Samsun kedi maması piyasasında en çok tercih edilen markalar Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan ve Reflex Plus'tır. Her markanın kendine özgü avantajları bulunmaktadır. Samsun Royal Canin kedi maması arıyorsanız, FIT 32, Indoor, Sensible ve Sterilised seçenekleri stokta mevcuttur.",
          "Samsun Pro Plan kedi maması, Samsun Hills kedi maması, Samsun Acana kedi maması gibi premium markalar uygun fiyatlarla kapınıza geliyor. Samsun tahılsız kedi maması arayanlar için N&D Farmina Tropical Selection ve Quinoa serisi idealdir.",
          "Samsun yavru kedi maması için Royal Canin Kitten, Hill's Kitten, Pro Plan Kitten seçenekleri, samsun yetişkin kedi maması için adult serileri uygun fiyatlarla mevcuttur.",
        ],
        list: [
          "Royal Canin: FIT 32, Indoor, Sensible 33, Sterilised, Kitten - Veteriner onaylı",
          "Hill's Science Plan: Adult, Kitten, Sterilised, Sensitive, Hypoallergenic",
          "N&D Farmina: Düşük Tahıllı, Tahılsız, Tropical, Pumpkin, Quinoa",
          "Pro Plan: Adult, Kitten, Sterilised, Derma Plus, Delicate",
          "Reflex Plus: Ekonomik premium, büyük paketlerde tasarruf",
          "Felicia, Pronature, ProChoice: Kaliteli alternatifler",
        ],
      },
      {
        h2: "Kedi Maması Fiyat İpuçları",
        paragraphs: [
          "Samsun kedi maması fiyatlarında en uygun fiyat JETGO'dadır. Nakit ödemede ekstra avantajlı fiyat uyguluyoruz. Büyük paketler (10-15 kg) kg başına en ekonomik seçenektir. 1,5 kg paketler 200-900 TL, 10-15 kg paketler 2.000-6.000 TL arasında değişmektedir.",
          "Her siparişte %5 Para Puan kazanırsınız. Biriken puanlarınızı sonraki kedi maması siparişlerinizde kullanabilirsiniz. Kampanya ürünlerini takip ederek ekstra tasarruf sağlayın.",
        ],
      },
    ],
    features: [
      "Royal Canin - FIT 32, Indoor, Sensible, Sterilised, Kitten",
      "Hill's Science Plan - Yetişkin, Yavru, Kısırlaştırılmış, Hypoallergenic",
      "N&D - Düşük Tahıllı, Tahılsız, Tropical Selection, Quinoa",
      "Pro Plan - Adult, Kitten, Sterilised, Delicate, Derma Plus",
      "Reflex / Reflex Plus - Ekonomik premium seçenekler",
      "Profine - Glutensiz premium mamalar",
      "Pronature, ProChoice, Felicia - Kaliteli alternatifler",
    ],
    faq: [
      { q: "Samsun'da en iyi kedi maması hangisi?", a: "Kedinizin yaşına, sağlık durumuna ve tercihine göre değişir. Premium markalar arasında Royal Canin, Hill's ve N&D en çok tercih edilen markalardır. JETGO'da tüm markaları uygun fiyatla bulabilirsiniz." },
      { q: "Samsun kedi maması aynı gün gelir mi?", a: "Evet, saat 17:00'ye kadar verilen kedi maması siparişleri aynı gün teslim edilir. Atakum, İlkadım ve Canik'e teslimat yapıyoruz." },
      { q: "Samsun'da kedi maması fiyatları ne kadar?", a: "Fiyatlar markaya ve pakete göre değişir. 1,5 kg paketler 200-900 TL, 10-15 kg paketler 2.000-6.000 TL arasındadır. Nakit ödemede ekstra avantaj." },
    ],
    internalLinks: [
      { text: "En İyi Kedi Maması Markaları", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kategorisi", href: "/kategori/kedi" },
      { text: "Atakum Kedi Maması", href: "/atakum-petshop-kedi-mamasi" },
    ],
  },
  {
    slug: "kopek-mamasi",
    type: "category",
    title: "Köpek Maması",
    metaTitle: "Köpek Maması Samsun - En İyi Markalar Uygun Fiyat | JETGO Petshop",
    metaDescription: "Samsun'da köpek maması kapıya teslim. Royal Canin, Hill's, N&D, Pro Plan köpek maması. Yavru, yetişkin, büyük/küçük ırk. Aynı gün teslimat kapıda ödeme.",
    keywords: "köpek maması, köpek maması samsun, samsun petshop köpek maması, en iyi köpek maması, ucuz köpek maması, royal canin köpek, hills köpek maması, samsun köpek maması fiyat, samsun yavru köpek maması, samsun büyük ırk köpek maması, samsun küçük ırk köpek maması, samsun tahılsız köpek maması",
    h1: "Köpek Maması - Samsun Kapıya Teslim",
    intro: [
      "JETGO'da köpek maması çeşitlerimizle köpeğinizin beslenme ihtiyaçlarını karşılayın. Küçük ırk, orta ırk ve büyük ırk köpekler için özel formüle edilmiş mamaları uygun fiyatlarla Samsun'da kapınıza getiriyoruz.",
      "Royal Canin, Hill's Science Plan, N&D, Pro Plan, Reflex ve Pro Performance gibi güvenilir markaları sunuyoruz. Yavru köpek mamasından yetişkin köpek mamasına, hassas sindirimden kilo kontrolüne kadar her ihtiyaca uygun seçenek mevcut.",
      "15 kg'lık büyük paketlerde ekonomik fiyatlar ve nakit ödemede ekstra avantaj. Samsun petshop köpek maması arayanlar için ağır çuvalları kapınıza kadar getiriyoruz. Köpeğinizin sağlıklı beslenmesi için doğru mamayı seçmenize yardımcı oluyoruz.",
    ],
    sections: [
      {
        h2: "Samsun'da Köpek Maması Markaları",
        paragraphs: [
          "Samsun köpek maması markalarında Royal Canin Maxi, Mini ve Medium serileri yavru ve yetişkin seçenekleriyle mevcuttur. Samsun Royal Canin köpek maması en çok tercih edilen premium markadır. Hill's Science Plan Sensitive, Hypoallergenic ve Light serileri hassas köpekler için idealdir.",
          "Samsun Pro Plan köpek maması, Samsun Pedigree köpek maması, Samsun Acana köpek maması ve Samsun Hills köpek maması gibi premium markalar stokta bulunmaktadır. Samsun tahılsız köpek maması arayanlar için N&D Quinoa ve Pumpkin serileri mevcuttur.",
        ],
        list: [
          "Royal Canin: Maxi, Mini, Medium - Yavru & Yetişkin ırk bazlı formüller",
          "Hill's Science Plan: Sensitive, Hypoallergenic, Light, Large Breed",
          "N&D: Düşük Tahıllı, Tahılsız, Quinoa, Pumpkin serileri",
          "Pro Plan: Adult, Puppy, Sensitive Skin, Athletic, Small & Mini",
          "Reflex / Reflex Plus: Ekonomik büyük paketler, yetişkin ve yavru",
          "Pro Performance: Premium ekonomik, 18 kg uygun fiyat",
          "Econature, Wanpy, Profine: Kaliteli alternatifler",
        ],
      },
      {
        h2: "Köpek Maması Fiyat Rehberi",
        paragraphs: [
          "Samsun köpek maması fiyatlarında en uygun fiyat JETGO'dadır. 12-15 kg paketler markaya göre 1.800-7.000 TL arasında değişmektedir. Nakit ödemede ekstra avantajlı fiyat uygulanır. Samsun'da en ucuz köpek maması arayanlar için büyük paketler kg başı en ekonomik seçenektir.",
          "15 kg çuvalları taşımak zor, JETGO ile kapınıza teslim ediyoruz. Her siparişte %5 Para Puan kazanarak sonraki alışverişinizde tasarruf sağlayın.",
        ],
      },
    ],
    features: [
      "Royal Canin - Maxi, Mini, Medium (Yavru & Yetişkin)",
      "Hill's Science Plan - Sensitive, Hypoallergenic, Light, Large",
      "N&D - Düşük Tahıllı, Tahılsız, Quinoa, Pumpkin",
      "Pro Plan - Adult, Puppy, Sensitive Skin, Athletic",
      "Reflex / Reflex Plus - Ekonomik büyük paketler",
      "Pro Performance - Premium ekonomik 18 kg seçenek",
      "Profine - Glutensiz, Hipoalerjenik",
    ],
    faq: [
      { q: "Samsun'da büyük ırk köpek maması hangisi?", a: "Royal Canin Maxi, Hill's Large Breed ve N&D büyük ırk köpekler için özel formüle edilmiş mamalardır. JETGO'da kapıya teslim mevcuttur." },
      { q: "Samsun köpek maması aynı gün teslimat var mı?", a: "Evet, saat 17:00'ye kadar verilen köpek maması siparişleri aynı gün teslim edilir. 15 kg çuvalları kapınıza getiriyoruz." },
      { q: "Samsun köpek maması fiyatları ne kadar?", a: "12-15 kg paketler markaya göre 1.800-7.000 TL arasında değişmektedir. Nakit ödemede ek indirim, %5 para puan kazanımı." },
    ],
    internalLinks: [
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Pet Aksesuar", href: "/pet-aksesuar" },
      { text: "Köpek Kategorisi", href: "/kategori/kopek" },
    ],
  },
  {
    slug: "kedi-kumu",
    type: "category",
    title: "Kedi Kumu",
    metaTitle: "Kedi Kumu Samsun - Kapıya Teslim En İyi Markalar | JETGO Petshop",
    metaDescription: "Samsun'da kedi kumu kapıya teslim. Bentonit, silika, doğal kedi kumu. Van Cat, Biokat's, Sanicat. Topaklanan, aktif karbonlu. Ağır kumları biz taşıyalım.",
    keywords: "kedi kumu, kedi kumu samsun, samsun petshop kedi kumu, en iyi kedi kumu, ucuz kedi kumu, bentonit kedi kumu, topaklanan kedi kumu, samsun kedi kumu fiyat, samsun bentonit kedi kumu, samsun silika kedi kumu, samsun kokulu kedi kumu, samsun kedi tuvaleti",
    h1: "Kedi Kumu - Samsun Kapıya Teslim",
    intro: [
      "Ağır kedi kumunu taşımaktan kurtulun! JETGO ile kedi kumunuzu Samsun'da kapınıza getiriyoruz. Bentonit, silika ve doğal kedi kumu çeşitlerimizle kedinizin konforunu sağlayın.",
      "Van Cat, Biokat's, Sanicat ve daha birçok markanın aktif karbonlu, aromalı ve ince taneli kedi kumlarını uygun fiyatlarla sunuyoruz. Topaklanan kedi kumları ile kolay temizlik, koku kontrolü ve uzun ömürlü kullanım. Samsun petshop kedi kumu arayanlar için en pratik çözüm.",
      "Kedi kumu taşımak zor ve zahmetli bir iş. 10-20 kg kum paketlerini apartman katınıza kadar çıkarıyoruz. JETGO'nun kapıya teslim hizmetiyle bu dertten kurtulun.",
    ],
    sections: [
      {
        h2: "Samsun Kedi Kumu Markaları ve Çeşitleri",
        paragraphs: [
          "Samsun'da kedi kumu çeşitleri arasında en çok bentonit topaklanan kumlar tercih edilmektedir. Samsun bentonit kedi kumu markalarından Van Cat aktif karbonlu ince taneli seçenekleriyle piyasanın en çok satılan markasıdır. Biokat's Bianco Fresh mandalina aromalı seçenek premium kalitesiyle öne çıkar.",
          "Samsun silika kedi kumu, samsun kokulu kedi kumu ve samsun kokusuz kedi kumu arayışlarında da JETGO'da geniş seçenek bulabilirsiniz. Topaklanan, aktif karbonlu ve aromalı kedi kumları mevcut.",
        ],
        list: [
          "Van Cat: Aktif Karbonlu, İnce Taneli, Klasik Bentonit - En çok satan marka",
          "Biokat's: Bianco Fresh, Mandalina Aromalı, Premium Almanya üretimi",
          "Sanicat: Duo Vanilya, Mandalina Aromalı, İspanya üretimi",
          "Topaklanan Bentonit: Kolay temizlik, koku kontrolü",
          "Aktif Karbonlu: Kötü kokuları emen, apartman dairesi için ideal",
          "İnce ve Kalın Taneli: Kedinizin tercihine göre seçenekler",
        ],
      },
      {
        h2: "Kedi Kumu Fiyatları ve Teslimat",
        paragraphs: [
          "Samsun kedi kumu fiyatları markaya ve litreye göre 100-600 TL arasında değişmektedir. Büyük paketlerde litre başına daha ekonomik fiyatlar sunuyoruz. Nakit ödemede ekstra avantajlı fiyat uygulanır.",
          "Samsun'da kedi kumu kapıya teslim hizmetimizle ağır kumları taşıma derdi artık yok. 10-20 kg paketleri apartman katınıza kadar çıkarıyoruz. Kedi kumu küreği ve kedi tuvaleti aksesuarları da JETGO'da mevcut.",
        ],
      },
    ],
    features: [
      "Van Cat - Aktif Karbonlu, İnce Taneli Bentonit",
      "Biokat's - Bianco Fresh, Aromalı Premium Kumlar",
      "Sanicat - Duo Vanilya, Mandalina Aromalı",
      "Topaklanan Bentonit Kumlar - Kolay temizlik",
      "Aktif Karbonlu Koku Önleyici - Apartman için ideal",
      "İnce ve Kalın Taneli Seçenekler",
    ],
    faq: [
      { q: "Samsun'da en iyi kedi kumu hangisi?", a: "Topaklanan bentonit kumlar en çok tercih edilen türdür. Van Cat aktif karbonlu ve Biokat's Bianco Fresh en popüler seçeneklerdir. JETGO'da tüm markalar mevcut." },
      { q: "Samsun kedi kumu kapıya teslim var mı?", a: "Evet, Samsun merkez ilçelerine aynı gün kedi kumu teslimatı yapıyoruz. 10-20 kg paketleri apartman katınıza kadar çıkarıyoruz." },
      { q: "Samsun kedi kumu fiyatları ne kadar?", a: "10 litrelik kedi kumları 100-600 TL arasında değişmektedir. Büyük paketlerde litre başı daha ekonomik. Nakit ödemede ekstra avantaj." },
    ],
    internalLinks: [
      { text: "En İyi Kedi Kumu Karşılaştırma", href: "/kedi-kumu-en-iyi" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Kategorisi", href: "/kategori/kedi" },
      { text: "Kedi Kumu Kapıya Teslim", href: "/kedi-kumu-kapiya-teslim-samsun" },
    ],
  },
  {
    slug: "pet-aksesuar",
    type: "category",
    title: "Pet Aksesuar",
    metaTitle: "Pet Aksesuar - Kedi Köpek Aksesuarları Kapıya Teslim | JETGO Samsun",
    metaDescription: "Kedi ve köpek aksesuarları kapıya teslim. Taşıma çantası, mama kabı, oyuncak, tasma, yataklar. Samsun'da aynı gün teslimat. JETGO Pet Shop.",
    keywords: "pet aksesuar, kedi aksesuar, köpek aksesuar, evcil hayvan aksesuar, pet shop aksesuar samsun, kedi bakım ürünleri samsun, köpek bakım ürünleri atakum",
    h1: "Pet Aksesuar - Kedi & Köpek Aksesuarları",
    intro: [
      "Evcil hayvanınız için ihtiyacınız olan tüm aksesuarları JETGO'da bulun. Taşıma çantaları, mama ve su kapları, oyuncaklar, tasmalar, yataklar ve bakım ürünleri kapınıza gelsin. Samsun'da evcil hayvan aksesuarları aynı gün teslimat.",
      "Köpek arabası, kedi tırmalama tahtası, çiş eğitim pedi, diş bakım ürünleri ve daha fazlasını uygun fiyatlarla sunuyoruz. Tommy, Pawise, M-Pets, Ferplast gibi kaliteli markalar mevcut. Kedi bakım ürünleri, köpek bakım ürünleri ve tüm evcil hayvan aksesuarları tek adreste.",
      "Evcil hayvanınızın konforunu ve mutluluğunu artıracak ürünleri keşfedin. Samsun'a aynı gün teslimat ile hemen sipariş verin.",
    ],
    sections: [
      {
        h2: "Kedi ve Köpek Aksesuar Çeşitleri",
        paragraphs: [
          "Samsun'da kedi bakım ürünleri olarak kedi taşıma çantası, kedi tuvaleti, kedi tırmalama tahtası, kedi yatağı, kedi mama kabı ve kedi oyuncakları sunuyoruz. Köpek bakım ürünleri olarak köpek arabası, köpek tasması, köpek yatağı, köpek mama kabı, çiş eğitim pedi ve köpek şampuanı mevcuttur.",
          "Tüm aksesuar ürünleri Samsun'a aynı gün kapıya teslim edilmektedir. Nakit ödemede avantajlı fiyat ve %5 Para Puan kazanımı geçerlidir.",
        ],
      },
    ],
    features: [
      "Taşıma Çantaları ve Kafesleri",
      "Köpek Arabaları (Tommy, Pawise)",
      "Mama ve Su Kapları",
      "Çiş Eğitim Pedleri",
      "Diş Bakım Ürünleri",
      "Tırnak Makasları ve Bakım Setleri",
      "Şampuan ve Bakım Ürünleri",
    ],
    faq: [
      { q: "Samsun'da evcil hayvan aksesuarları nereden alınır?", a: "JETGO Pet Shop'ta kedi ve köpek aksesuarlarını online sipariş edebilir, aynı gün kapınıza teslim alabilirsiniz." },
      { q: "Kedi taşıma çantası var mı?", a: "Evet, Ferplast Atlas ve diğer markaların taşıma çantaları mevcuttur. Kapıya teslim edilir." },
      { q: "Aksesuar ürünleri kapıya teslim var mı?", a: "Evet, tüm aksesuar ürünlerimiz Samsun merkez ilçelerine aynı gün teslim edilir." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Köpek Kategorisi", href: "/kategori/kopek" },
    ],
  },
  {
    slug: "kedi-mamasi-en-iyi-markalar",
    type: "blog",
    title: "En İyi Kedi Maması Markaları 2025",
    metaTitle: "En İyi Kedi Maması Markaları 2025 - Karşılaştırma ve Öneriler | JETGO",
    metaDescription: "2025'de en iyi kedi maması markaları karşılaştırması. Royal Canin, Hill's, N&D, Pro Plan hangisi daha iyi? Uzman önerileri ve fiyat karşılaştırması.",
    keywords: "en iyi kedi maması, kedi maması karşılaştırma, royal canin mi hills mi, kedi maması önerisi 2025, samsun kedi maması tavsiye",
    h1: "En İyi Kedi Maması Markaları 2025 - Karşılaştırma Rehberi",
    intro: [
      "Kediniz için en iyi mamayı seçmek önemli bir karar. Bu rehberde Türkiye'de satılan en iyi kedi maması markalarını karşılaştırıyoruz. Her markanın avantajları, dezavantajları ve fiyat aralıklarını detaylı şekilde inceliyoruz.",
      "Veteriner hekimlerin önerdiği premium markalardan ekonomik alternatiflere kadar, kedinizin yaşına ve sağlık durumuna uygun mamayı bu rehberle kolayca bulabilirsiniz. Samsun'da tüm markaları JETGO ile kapınıza sipariş edebilirsiniz.",
      "Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan ve Reflex Plus markalarını protein oranı, içerik kalitesi ve fiyat-performans açısından değerlendirdik. Samsun petshop hangi markaları satıyor diye merak ediyorsanız, tüm premium markalar JETGO'da mevcut.",
    ],
    sections: [
      {
        h2: "Premium Kedi Maması Markaları Detaylı Karşılaştırma",
        paragraphs: [
          "Royal Canin veteriner onaylı, geniş ürün yelpazesi ile bilinen dünya markasıdır. Yaşa, ırka ve sağlık durumuna özel formüller sunar. Sensible 33 hassas sindirim için, Sterilised kısır kediler için idealdir. Fiyat olarak orta-üst segmenttedir.",
          "Hill's Science Plan bilimsel araştırmaya dayalı formülleriyle öne çıkar. Hassas mide, cilt sağlığı ve özel diyet ihtiyaçları için benzersiz seçenekler sunar. Hypoallergenic böcek proteinli seçenek diğer markalarda bulunmayan özel bir üründür.",
          "N&D Farmina İtalyan üretimi premium bir markadır. Düşük tahıllı ve tahılsız mamalar, doğal içerikler ve yüksek et oranı ile fark yaratır. Kısırlaştırılmış kedi seçenekleri güçlüdür. Fiyat olarak üst segmenttedir.",
          "Pro Plan Purina'nın premium markasıdır. Uygun fiyatlı premium alternatif olarak öne çıkar. Yavru ve yetişkin seçenekleri zengindir. Sensitive ve Delicate serileri hassas kediler için uygundur.",
          "Reflex Plus Türkiye üretimi ekonomik premium bir markadır. Büyük paketlerde tasarruf sağlar. Orta segment için ideal bir seçimdir. Yetişkin, yavru ve kısır kedi seçenekleri mevcuttur.",
        ],
      },
    ],
    features: [
      "Royal Canin - Veteriner onaylı, geniş ürün yelpazesi, yaş ve ırka özel formüller",
      "Hill's Science Plan - Bilimsel araştırmaya dayalı, hassas mide ve cilt sağlığı formülleri",
      "N&D Farmina - Düşük tahıllı ve tahılsız, doğal içerikler, yüksek et oranı",
      "Pro Plan - Uygun fiyatlı premium alternatif, zengin yavru ve yetişkin seçenekler",
      "Reflex Plus - Türkiye üretimi, ekonomik premium, büyük paketlerde tasarruf",
    ],
    faq: [
      { q: "Royal Canin mi Hill's mi?", a: "Her iki marka da veteriner onaylı premium markalardır. Royal Canin ırka özel formüllerde, Hill's hassas sağlık durumlarında öne çıkar. İkisi de JETGO'da mevcut." },
      { q: "En ucuz premium kedi maması hangisi?", a: "Reflex Plus ve Pro Performance premium segmentte en uygun fiyatlı seçeneklerdir. JETGO'da nakit ödemede ekstra avantaj." },
      { q: "Kedi maması nereden alınır Samsun?", a: "JETGO Pet Shop'tan online sipariş vererek Samsun'da aynı gün teslim alabilirsiniz. 900+ ürün kapıya teslim." },
    ],
    internalLinks: [
      { text: "Kedi Maması Ürünleri", href: "/kedi-mamasi" },
      { text: "Kedi Kumu Karşılaştırma", href: "/kedi-kumu-en-iyi" },
      { text: "Kedi Kategorisi", href: "/kategori/kedi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "kedi-kumu-en-iyi",
    type: "blog",
    title: "En İyi Kedi Kumu Karşılaştırma 2025",
    metaTitle: "En İyi Kedi Kumu 2025 - Bentonit Silika Karşılaştırma | JETGO Samsun",
    metaDescription: "En iyi kedi kumu karşılaştırması. Bentonit mi silika mı? Van Cat, Biokat's, Sanicat hangisi daha iyi? Topaklanan kedi kumu önerileri. Samsun kapıya teslim.",
    keywords: "en iyi kedi kumu, kedi kumu karşılaştırma, bentonit kedi kumu, topaklanan kedi kumu, kedi kumu önerisi, samsun bentokat kedi kumu, samsun everclean kedi kumu",
    h1: "En İyi Kedi Kumu 2025 - Karşılaştırma Rehberi",
    intro: [
      "Doğru kedi kumunu seçmek hem kedinizin hem sizin konforunuz için kritik. Bu rehberde bentonit, silika ve doğal kedi kumlarını karşılaştırıyoruz. Samsun'da kedi kumu kapıya teslim için JETGO'yu tercih edebilirsiniz.",
      "Topaklanan kedi kumları temizlik kolaylığı ve koku kontrolü açısından en popüler seçenektir. Aktif karbonlu kumlar koku emiliminde ekstra başarılıdır. Samsun bentonit kedi kumu ve samsun silika kedi kumu çeşitleri JETGO'da mevcut.",
      "Van Cat, Biokat's ve Sanicat gibi lider markaların ürünlerini detaylı olarak inceliyoruz. Her markanın güçlü ve zayıf yönlerini, fiyat karşılaştırmasını sunuyoruz.",
    ],
    sections: [
      {
        h2: "Kedi Kumu Türleri: Bentonit vs Silika vs Doğal",
        paragraphs: [
          "Bentonit kedi kumları en yaygın tercih edilen türdür. Topaklanan yapısı sayesinde temizlemesi çok kolaydır. Aktif karbonlu seçenekler kötü kokuları emer. İnce taneli ve kalın taneli seçenekler mevcuttur. Fiyat olarak en ekonomik seçenektir.",
          "Silika kedi kumları daha uzun ömürlüdür ancak daha pahalıdır. Kristal yapısı ile nem emilimi yüksektir. Toz kaldırmaz. Hassas kediler için uygun olabilir. Samsun'da silika kedi kumu JETGO'da bulunabilir.",
          "Doğal kedi kumları (mısır, odun talaşı, buğday) çevre dostu seçeneklerdir. Biyolojik olarak parçalanabilir yapıdadır. Ancak koku kontrolü bentonite göre daha zayıftır.",
        ],
      },
    ],
    features: [
      "Van Cat - Aktif karbonlu, ince taneli bentonit. Türkiye'nin en çok satan kedi kumu",
      "Biokat's - Almanya üretimi premium bentonit. Bianco Fresh mandalina aromalı",
      "Sanicat - İspanya üretimi kaliteli kumlar. Duo serisi vanilya ve mandalina aromalı",
    ],
    faq: [
      { q: "Bentonit mi silika kedi kumu mu?", a: "Bentonit kumlar daha ekonomik ve topaklanan yapısıyla kolay temizlenir. Silika daha uzun ömürlü ama pahalıdır. Çoğu kedi sahibi bentonit tercih eder." },
      { q: "Aktif karbonlu kedi kumu ne işe yarar?", a: "Aktif karbon kötü kokuları emer ve nötralize eder. Özellikle apartman dairelerinde yaşayan kedi sahipleri için idealdir." },
      { q: "Kedi kumu ne sıklıkla değiştirilir?", a: "Topaklanan bentonit kumlar günlük pislik temizliği yapılarak 2-3 haftada bir tamamen değiştirilmelidir." },
    ],
    internalLinks: [
      { text: "Kedi Kumu Ürünleri", href: "/kedi-kumu" },
      { text: "Kedi Maması Markaları", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Kedi Kategorisi", href: "/kategori/kedi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "kopek-mamasi-fiyatlari",
    type: "blog",
    title: "Köpek Maması Fiyatları 2025",
    metaTitle: "Köpek Maması Fiyatları 2025 - Marka Karşılaştırma | JETGO Samsun Petshop",
    metaDescription: "Güncel köpek maması fiyatları. Royal Canin, Hill's, N&D, Pro Plan, Reflex köpek maması fiyat karşılaştırması. Samsun'da en uygun fiyat garantisi. JETGO.",
    keywords: "köpek maması fiyatları, köpek maması fiyat, ucuz köpek maması, köpek maması fiyat karşılaştırma, samsun köpek maması fiyat",
    h1: "Köpek Maması Fiyatları 2025 - Güncel Fiyat Rehberi",
    intro: [
      "Köpek maması fiyatları markaya, paket boyutuna ve içeriğe göre büyük farklılıklar göstermektedir. Bu rehberde en popüler köpek maması markalarının güncel fiyatlarını karşılaştırıyoruz.",
      "Premium markalardan ekonomik alternatiflere kadar, bütçenize ve köpeğinizin ihtiyaçlarına uygun mamayı bulmak için bu fiyat rehberini kullanabilirsiniz. Samsun köpek maması fiyatlarında JETGO en uygun fiyatı sunar.",
      "JETGO'da nakit ödemede ekstra avantajlı fiyatlar ve belirli tutar üzeri ücretsiz kargo sunuyoruz. Samsun'da en uygun köpek maması fiyatları için JETGO'yu tercih edin. Her siparişte %5 Para Puan kazanın.",
    ],
    sections: [
      {
        h2: "Marka Bazlı Köpek Maması Fiyat Tablosu",
        paragraphs: [
          "Aşağıda 2025 yılı güncel köpek maması fiyatlarını bulabilirsiniz. Fiyatlar dönemsel olarak değişiklik gösterebilir. En güncel fiyatlar için JETGO web sitesini kontrol edin.",
        ],
        list: [
          "Royal Canin 15 kg: 4.200 - 4.700 TL arası (ırka göre değişir)",
          "Hill's Science Plan 14 kg: 3.500 - 5.500 TL arası",
          "N&D 12 kg: 4.200 - 6.900 TL arası (tahılsız daha pahalı)",
          "Pro Plan 14 kg: 3.500 - 5.300 TL arası",
          "Reflex 15 kg: 1.850 - 2.450 TL arası (en ekonomik premium)",
          "Pro Performance 18 kg: 2.500 - 2.600 TL arası (kg başı en uygun)",
          "Profine 12 kg: 3.000 - 3.500 TL arası (glutensiz premium)",
        ],
      },
    ],
    faq: [
      { q: "En ucuz köpek maması hangisi?", a: "Premium segmentte Reflex ve Pro Performance en uygun fiyatlı markalardır. 15-18 kg paketlerde kg başı 120-150 TL civarındadır." },
      { q: "Royal Canin köpek maması fiyatı ne kadar?", a: "Royal Canin 15 kg paketler 4.200-4.700 TL arasındadır. Irka ve yaşa göre fiyat değişir." },
      { q: "Samsun'da en ucuz köpek maması nerede?", a: "JETGO Pet Shop nakit ödeme fiyatlarıyla Samsun'da en uygun fiyatları sunar. %5 Para Puan ile ekstra tasarruf." },
    ],
    internalLinks: [
      { text: "Köpek Maması Ürünleri", href: "/kopek-mamasi" },
      { text: "Kedi Maması Markaları", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Köpek Kategorisi", href: "/kategori/kopek" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
];

interface MahalleConfig {
  name: string;
  slug: string;
  district: string;
  districtSlug: string;
  nearby: string[];
  landmark?: string;
}

const ATAKUM_MAHALLELER: MahalleConfig[] = [
  { name: "Denizevleri", slug: "denizevleri", district: "Atakum", districtSlug: "atakum", nearby: ["Güzelyalı", "Altınkum", "Yeni Mahalle"], landmark: "sahil şeridi" },
  { name: "Güzelyalı", slug: "guzelyali", district: "Atakum", districtSlug: "atakum", nearby: ["Denizevleri", "Kurupelit", "Atakent"], landmark: "Güzelyalı sahil" },
  { name: "Kurupelit", slug: "kurupelit", district: "Atakum", districtSlug: "atakum", nearby: ["Güzelyalı", "Atakent", "OMÜ"], landmark: "Ondokuz Mayıs Üniversitesi" },
  { name: "Atakent", slug: "atakent", district: "Atakum", districtSlug: "atakum", nearby: ["Kurupelit", "İncesu", "Güzelyalı"], landmark: "Atakent konutları" },
  { name: "İncesu", slug: "incesu", district: "Atakum", districtSlug: "atakum", nearby: ["Atakent", "Körfez", "Mimar Sinan"] },
  { name: "Mimar Sinan", slug: "mimar-sinan", district: "Atakum", districtSlug: "atakum", nearby: ["İncesu", "Körfez", "Çakırlar"] },
  { name: "Körfez", slug: "korfez", district: "Atakum", districtSlug: "atakum", nearby: ["Mimar Sinan", "İncesu", "Soğuksu"] },
  { name: "Yeni Mahalle", slug: "yeni-mahalle", district: "Atakum", districtSlug: "atakum", nearby: ["Denizevleri", "Altınkum", "Balaç"], landmark: "Atatürk Bulvarı" },
  { name: "Altınkum", slug: "altinkum", district: "Atakum", districtSlug: "atakum", nearby: ["Yeni Mahalle", "Denizevleri", "Çobanlı"], landmark: "Altınkum plajı" },
  { name: "Balaç", slug: "balac", district: "Atakum", districtSlug: "atakum", nearby: ["Yeni Mahalle", "Çakırlar", "Taflan"] },
  { name: "Çakırlar", slug: "cakirlar", district: "Atakum", districtSlug: "atakum", nearby: ["Balaç", "Mimar Sinan", "Taflan"] },
  { name: "Soğuksu", slug: "soguksu", district: "Atakum", districtSlug: "atakum", nearby: ["Körfez", "Taflan", "Çakırlar"] },
  { name: "Taflan", slug: "taflan", district: "Atakum", districtSlug: "atakum", nearby: ["Soğuksu", "Balaç", "Çakırlar"] },
  { name: "Çobanlı", slug: "cobanli", district: "Atakum", districtSlug: "atakum", nearby: ["Altınkum", "Büyükoyumca", "Yeni Mahalle"] },
  { name: "Büyükoyumca", slug: "buyukoyumca", district: "Atakum", districtSlug: "atakum", nearby: ["Çobanlı", "Altınkum", "Kozalak"] },
  { name: "Esenevler", slug: "esenevler", district: "Atakum", districtSlug: "atakum", nearby: ["Yeni Mahalle", "Denizevleri", "Altınkum"] },
  { name: "Cumhuriyet", slug: "cumhuriyet", district: "Atakum", districtSlug: "atakum", nearby: ["Denizevleri", "Güzelyalı", "Yeni Mahalle"], landmark: "Cumhuriyet Caddesi" },
  { name: "Alanlı", slug: "alanli", district: "Atakum", districtSlug: "atakum", nearby: ["Taflan", "Çakırlar", "Soğuksu"] },
  { name: "Küçükoyumca", slug: "kucukoyumca", district: "Atakum", districtSlug: "atakum", nearby: ["Büyükoyumca", "Çobanlı", "Altınkum"] },
  { name: "Avdan", slug: "avdan", district: "Atakum", districtSlug: "atakum", nearby: ["Taflan", "Soğuksu", "Alanlı"] },
  { name: "Çatalçam", slug: "catalcam", district: "Atakum", districtSlug: "atakum", nearby: ["Soğuksu", "Taflan", "Avdan"] },
  { name: "Hacıismail", slug: "haciismail", district: "Atakum", districtSlug: "atakum", nearby: ["Balaç", "Çakırlar", "Alanlı"] },
  { name: "Kamalı", slug: "kamali", district: "Atakum", districtSlug: "atakum", nearby: ["Taflan", "Avdan", "Çatalçam"] },
  { name: "Mecidiye", slug: "mecidiye", district: "Atakum", districtSlug: "atakum", nearby: ["Büyükoyumca", "Küçükoyumca", "Çobanlı"] },
  { name: "Yeniçam", slug: "yenicam", district: "Atakum", districtSlug: "atakum", nearby: ["Çatalçam", "Avdan", "Taflan"] },
  { name: "Organize Sanayi", slug: "organize-sanayi", district: "Atakum", districtSlug: "atakum", nearby: ["Kurupelit", "Atakent", "İncesu"], landmark: "Samsun OSB" },
  { name: "Kozaağaç", slug: "kozaagac", district: "Atakum", districtSlug: "atakum", nearby: ["Soğuksu", "Körfez", "Taflan"] },
  { name: "Küçükkolpınar", slug: "kucukkolpinar", district: "Atakum", districtSlug: "atakum", nearby: ["Büyükoyumca", "Mecidiye", "Küçükoyumca"], landmark: "Küçükkolpınar köy yolu" },
];

const ILKADIM_MAHALLELER: MahalleConfig[] = [
  { name: "Kadıköy", slug: "kadikoy", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Rasathane", "Kılıçdede", "Adalet"], landmark: "İlkadım merkez" },
  { name: "Rasathane", slug: "rasathane", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Kadıköy", "Kılıçdede", "Baruthane"] },
  { name: "Kılıçdede", slug: "kilicdede", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Kadıköy", "Rasathane", "Kalkancı"] },
  { name: "Baruthane", slug: "baruthane", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Rasathane", "Ulugazi", "Derecik"] },
  { name: "Kalkancı", slug: "kalkanci", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Kılıçdede", "Adalet", "Çiftlik"] },
  { name: "Ulugazi", slug: "ulugazi", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Baruthane", "Derecik", "Rasathane"] },
  { name: "Derecik", slug: "derecik", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Baruthane", "Ulugazi", "Çiftlik"] },
  { name: "Adalet", slug: "adalet", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Kadıköy", "Kalkancı", "Çiftlik"], landmark: "Adalet Sarayı" },
  { name: "Çiftlik", slug: "ciftlik", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Adalet", "Derecik", "Kalkancı"] },
  { name: "Liman", slug: "liman", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Kadıköy", "Adalet", "Hançerli"], landmark: "Samsun Limanı" },
  { name: "Tepecik", slug: "tepecik", district: "İlkadım", districtSlug: "ilkadim", nearby: ["Baruthane", "Ulugazi", "Derecik"], landmark: "Tepecik mevkii" },
];

const CANIK_MAHALLELER: MahalleConfig[] = [
  { name: "Karşıyaka", slug: "karsiyaka", district: "Canik", districtSlug: "canik", nearby: ["Gaziosmanpaşa", "Yenimahalle", "Kuzeyyıldızı"], landmark: "Karşıyaka merkez" },
  { name: "Gaziosmanpaşa", slug: "gaziosmanpasa", district: "Canik", districtSlug: "canik", nearby: ["Karşıyaka", "Yenimahalle", "Kuzeyyıldızı"] },
  { name: "Yenimahalle", slug: "canik-yenimahalle", district: "Canik", districtSlug: "canik", nearby: ["Karşıyaka", "Gaziosmanpaşa", "Kuzeyyıldızı"] },
  { name: "Kuzeyyıldızı", slug: "kuzeyyildizi", district: "Canik", districtSlug: "canik", nearby: ["Yenimahalle", "Gaziosmanpaşa", "Karşıyaka"] },
  { name: "Karadeniz", slug: "karadeniz", district: "Canik", districtSlug: "canik", nearby: ["Karşıyaka", "Gaziosmanpaşa", "Kuzeyyıldızı"], landmark: "Karadeniz Mahallesi" },
];

function generateMahallePage(m: MahalleConfig): SeoPageData {
  const nearbyText = m.nearby.join(", ");
  return {
    slug: `${m.districtSlug}-${m.slug}-petshop`,
    type: "mahalle",
    parentDistrict: m.districtSlug,
    title: `${m.name} Pet Shop`,
    metaTitle: `${m.name} Petshop - ${m.district} Kapıya Teslim | JETGO Samsun`,
    metaDescription: `${m.name} mahallesine aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu kapıya teslim. ${nearbyText} yakını. JETGO Samsun.`,
    keywords: `${m.name.toLowerCase()} petshop, ${m.name.toLowerCase()} pet shop, ${m.name.toLowerCase()} kedi maması, ${m.name.toLowerCase()} köpek maması, ${m.district.toLowerCase()} ${m.name.toLowerCase()} petshop, ${m.name.toLowerCase()} kapıya teslim petshop, ${m.name.toLowerCase()} petshop en yakın, ${m.name.toLowerCase()} petshop açık`,
    h1: `${m.name} Kapıya Teslim Petshop`,
    intro: [
      `${m.name} mahallesine aynı gün kapıya teslim petshop hizmeti! JETGO olarak ${m.district}'un ${m.name} mahallesine kedi maması, köpek maması, kedi kumu ve tüm evcil hayvan ürünlerini hızlıca ulaştırıyoruz.${m.landmark ? ` ${m.landmark} çevresindeki tüm noktalara teslimat yapıyoruz.` : ""} ${m.name} petshop en yakın diye aramanıza gerek yok, JETGO kapınıza gelir.`,
      `${m.name} ve çevresindeki ${nearbyText} mahallelerine düzenli teslimat rotamız bulunmaktadır. Royal Canin, Hill's, N&D, Pro Plan ve Reflex gibi premium markaları kapınıza getiriyoruz. ${m.name} petshop açık mı diye merak etmeyin, her gün 09:00-21:00 arası hizmetinizdeyiz.`,
      `Ağır mama ve kum çuvallarını taşımak zorunda kalmayın. JETGO ile online sipariş verin, aynı gün ${m.name} adresinize teslim edelim. Nakit, POS ve QR kod ile kapıda ödeme yapabilirsiniz. Her siparişte %5 Para Puan kazanın.`,
    ],
    sections: [
      {
        h2: `${m.name} Petshop Ürün ve Hizmetler`,
        paragraphs: [
          `${m.name} mahallesine kedi maması markalarından Royal Canin, Hill's, N&D, Pro Plan, Reflex Plus, Felicia ve ProChoice teslim ediyoruz. Köpek maması markalarından Royal Canin, Hill's, N&D, Pro Plan, Reflex, Pro Performance ve Econature mevcut.`,
          `Kedi kumu olarak Van Cat, Biokat's ve Sanicat bentonit, silika ve aktif karbonlu kumlar sunuyoruz. Kuş yemi, kemirgen yemi ve tüm evcil hayvan aksesuarları da ${m.name}'ye kapıya teslim edilmektedir. ${m.name} petshop hizmetimizde kapıda nakit ödeme, POS ile kredi kartı, QR kod ödeme ve banka havalesi seçenekleri mevcuttur.`,
          `${m.name} bölgesinde minimum sipariş tutarı mahalle bazlı belirlenmektedir. 1.500 TL üzeri siparişlerde kargo ücretsizdir. Nakit ödemede ekstra avantajlı fiyat uygulanır.`,
        ],
      },
      {
        h2: `${m.name}'de Evcil Hayvan Bakım İpuçları`,
        paragraphs: [
          `${m.name} ve ${m.district} bölgesinde yaşayan evcil hayvan sahipleri için düzenli beslenme programı oluşturmak önemlidir. Kediniz veya köpeğiniz için doğru mama seçimi, yaşına, kilosuna ve sağlık durumuna göre yapılmalıdır. JETGO'nun akıllı mama hesaplama aracını kullanarak evcil dostunuzun günlük mama ihtiyacını hesaplayabilirsiniz.`,
          `Kedi kumu düzenli olarak temizlenmeli ve 2-3 haftada bir tamamen değiştirilmelidir. Ağır kum çuvallarını taşımak yerine JETGO'nun kapıya teslim hizmetinden yararlanın. ${m.name}'ye aynı gün teslimat garantisi sunuyoruz.`,
        ],
      },
    ],
    features: [
      `${m.name}'ye aynı gün teslimat`,
      "900+ ürün çeşidi - Kedi, köpek, kuş, kemirgen",
      "Kapıda nakit, POS ve QR ödeme",
      "Her siparişte %5 Para Puan kazanım",
      `${nearbyText} mahallelerine de teslimat`,
      "1.500 TL üzeri ücretsiz kargo",
      "WhatsApp ile kolay sipariş",
    ],
    faq: [
      { q: `${m.name}'ye petshop teslimat süresi ne kadar?`, a: `${m.name} mahallesine ortalama 1-2 saat içinde teslimat yapıyoruz. ${m.district} merkezine yakınlığı sayesinde hızlı ulaşım sağlıyoruz. Aynı gün teslimat garantimiz geçerlidir.` },
      { q: `${m.name}'de minimum sipariş tutarı nedir?`, a: `${m.name} mahallesi için minimum sipariş tutarı 500 TL'dir. 1.500 TL üzeri siparişlerde kargo ücretsizdir. Nakit ödemede ekstra avantajlı fiyat uygulanır.` },
      { q: `${m.name} yakınında açık petshop var mı?`, a: `JETGO, ${m.name} ve çevresindeki ${nearbyText} mahallelerine kapıya teslim petshop hizmeti sunmaktadır. Her gün 09:00-21:00 arası hizmet veriyoruz. Mağazaya gitmenize gerek yok!` },
    ],
    internalLinks: [
      { text: `${m.district} Pet Shop`, href: `/${m.districtSlug}-petshop` },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
    ],
  };
}

const MAHALLE_PAGES: SeoPageData[] = [
  ...ATAKUM_MAHALLELER.map(generateMahallePage),
  ...ILKADIM_MAHALLELER.map(generateMahallePage),
  ...CANIK_MAHALLELER.map(generateMahallePage),
];

const KEYWORD_PAGES: SeoPageData[] = [
  {
    slug: "en-yakin-petshop",
    type: "keyword",
    title: "En Yakın Petshop",
    metaTitle: "En Yakın Petshop | Samsun Atakum Kapıya Teslim Pet Shop - JETGO",
    metaDescription: "En yakın petshop arıyorsanız JETGO size geliyor! Samsun ve Atakum'da kedi maması, köpek maması, kedi kumu 1 saatte kapıda. Kapıda ödeme, uygun fiyat.",
    keywords: "en yakın petshop, en yakın pet shop, yakınımdaki petshop, en yakın petshop nerede, çevremdeki petshop, en yakın hayvan mağazası, yakındaki pet shop, en yakın açık petshop, en yakın petshop samsun, en yakın petshop atakum",
    h1: "En Yakın Petshop: Mağazaya Gitme, Petshop Sana Gelsin",
    intro: [
      "En yakın petshop arıyorsanız artık haritada gezmenize gerek yok. JETGO, Samsun ve Atakum'un tüm mahallelerine kapıya teslim petshop hizmeti sunar. Nerede olursanız olun, en yakın petshop kapınızın önüne kadar gelir.",
      "Geleneksel petshop'a gidip ağır mama çuvallarını taşımak yerine, jetgomarket.com üzerinden ürünleri seçin, siparişinizi verin ve aynı gün kapınızda teslim alın. En yakın petshop artık telefonunuzda.",
      "900'den fazla ürün, Royal Canin, Hill's, N&D, Pro Plan gibi premium markalar ve piyasanın en uygun fiyatları ile hizmetinizdeyiz. Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz.",
    ],
    sections: [
      {
        h2: "En Yakın Petshop Neden JETGO?",
        paragraphs: [
          "En yakın petshop'u ararken mesafe, açık olup olmaması ve fiyat önemlidir. JETGO bu üç sorunu da çözer: nerede olursanız olun teslimat yaparız, her gün 09:00-21:00 arası sipariş alırız ve nakit ödemede ekstra avantajlı fiyat sunarız.",
          "Ortalama 1-3 saat içinde teslimat yapıyoruz. Acil mama veya kedi kumu ihtiyacınızda en yakın petshop olarak hızla yanınızdayız. Ağır ürünleri apartman katınıza kadar getiriyoruz.",
        ],
      },
      {
        h2: "En Yakın Petshop Ürünleri",
        paragraphs: [
          "Kedi maması, köpek maması, kedi kumu, yaş mama, ödül maması, kuş yemi, kemirgen ürünleri ve tüm bakım-aksesuar ürünleri stoklarımızda mevcut. En yakın petshop'ta bulabileceğiniz her şey JETGO'da var.",
        ],
        list: [
          "Kedi & Köpek Maması: Royal Canin, Hill's, N&D, Pro Plan, Reflex",
          "Kedi Kumu: Van Cat, Biokat's, Sanicat",
          "Kuş & Kemirgen ürünleri",
          "Bakım & aksesuar çeşitleri",
        ],
      },
    ],
    features: [
      "Bulunduğunuz yere kapıya teslim",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Kapıda nakit, POS, QR ödeme",
      "900+ ürün, premium markalar",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "En yakın petshop hangisi?", a: "JETGO, bulunduğunuz konuma kapıya teslim hizmeti verdiği için en pratik en yakın petshop'tur. Samsun ve Atakum'un tüm mahallelerine teslimat yapıyoruz." },
      { q: "En yakın petshop ne kadar sürede teslim eder?", a: "Ortalama 1-3 saat içinde siparişiniz kapınızda olur." },
      { q: "En yakın petshop kapıda ödeme kabul ediyor mu?", a: "Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "En Yakın Petshoplar", href: "/en-yakin-petshoplar" },
      { text: "Petshop Kapıda Ödeme", href: "/petshop-kapida-odeme" },
      { text: "Getir Petshop", href: "/getir-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "en-yakin-petshoplar",
    type: "keyword",
    title: "En Yakın Petshoplar",
    metaTitle: "En Yakın Petshoplar | Samsun Atakum Kapıya Teslim - JETGO Pet Shop",
    metaDescription: "En yakın petshoplar arasında en hızlısı JETGO. Samsun ve Atakum'da kedi maması, köpek maması, kedi kumu aynı gün kapınızda. Kapıda ödeme, uygun fiyat.",
    keywords: "en yakın petshoplar, yakınımdaki petshoplar, çevredeki petshoplar, en yakın pet shoplar, yakındaki hayvan mağazaları, en yakın petshoplar samsun, en yakın petshoplar atakum, açık petshoplar",
    h1: "En Yakın Petshoplar Arasında En Hızlı Teslimat JETGO'da",
    intro: [
      "En yakın petshoplar arasında karşılaştırma yaparken hız, fiyat ve ürün çeşidi en önemli kriterlerdir. JETGO, Samsun ve Atakum'da kapıya teslim çalışan modeliyle en yakın petshoplar içinde en pratik seçenektir.",
      "Birçok petshop'u tek tek dolaşmak yerine, tüm ürünleri jetgomarket.com üzerinden inceleyin, fiyatları karşılaştırın ve tek tıkla sipariş verin. Siparişiniz aynı gün kapınıza gelir.",
      "Royal Canin, Hill's, N&D, Pro Plan, Reflex gibi premium markalar, 900+ ürün çeşidi ve uygun fiyatlarla en yakın petshoplar arasında öne çıkıyoruz.",
    ],
    sections: [
      {
        h2: "En Yakın Petshoplar Nasıl Karşılaştırılır?",
        paragraphs: [
          "En yakın petshoplar arasında seçim yaparken teslimat süresi, ödeme seçenekleri, ürün stoğu ve fiyat avantajına bakmalısınız. JETGO bu kriterlerin tamamında öne çıkar: 1-3 saat teslimat, kapıda ödeme, geniş stok ve nakit avantajlı fiyat.",
          "Ağır mama çuvalları ve kedi kumu paketlerini taşıma derdi olmadan, en yakın petshoplar arasından en hızlısını seçin. JETGO ürünleri apartman katınıza kadar getirir.",
        ],
      },
      {
        h2: "En Yakın Petshoplar Ürün Yelpazesi",
        paragraphs: [
          "Kediler, köpekler, kuşlar ve kemirgenler için ihtiyacınız olan tüm ürünler tek adreste. En yakın petshoplar arasında en geniş ürün yelpazelerinden birine sahibiz.",
        ],
        list: [
          "Kedi maması, köpek maması, yaş mama, ödül maması",
          "Kedi kumu ve tuvalet ürünleri",
          "Kuş yemi, kafes ve kemirgen ürünleri",
          "Şampuan, tarak, çiş pedi ve bakım ürünleri",
        ],
      },
    ],
    faq: [
      { q: "En yakın petshoplar arasında hangisi en hızlı teslim eder?", a: "JETGO ortalama 1-3 saat içinde kapıya teslim yaparak en yakın petshoplar arasında en hızlı seçeneklerden biridir." },
      { q: "En yakın petshoplar kapıda ödeme yapıyor mu?", a: "JETGO'da kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz." },
      { q: "En yakın petshoplar hangi bölgelere teslimat yapıyor?", a: "Samsun'un Atakum, İlkadım ve Canik ilçelerinin tüm mahallelerine teslimat yapıyoruz." },
    ],
    internalLinks: [
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Petshop Kapıda Ödeme", href: "/petshop-kapida-odeme" },
      { text: "Getir Petshop", href: "/getir-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "kapida-odeme-petshop",
    type: "keyword",
    title: "Kapıda Ödeme Petshop",
    metaTitle: "Kapıda Ödeme Petshop | Samsun Atakum Nakit & Kart Kapıda - JETGO",
    metaDescription: "Kapıda ödeme petshop! Samsun ve Atakum'da nakit, kredi kartı (POS) ve QR ile kapıda ödeme. Kedi maması, köpek maması, kedi kumu aynı gün kapınızda.",
    keywords: "kapıda ödeme petshop, kapıda ödemeli petshop, nakit ödeme petshop, kapıda kredi kartı petshop, kapıda ödeme pet shop, kapıda ödeme mama, kapıda ödeme kedi maması, kapıda ödeme köpek maması, kapıda ödeme petshop samsun, kapıda ödeme petshop atakum",
    h1: "Kapıda Ödeme Petshop: Ürünü Gör, Kapında Öde",
    intro: [
      "Kapıda ödeme petshop arayanlar için JETGO, ürünleriniz elinize ulaştığında nakit, kredi kartı (POS) veya QR kod ile ödeme imkânı sunar. Önceden ödeme yapma zorunluluğu yok; siparişiniz kapınıza geldiğinde dilediğiniz yöntemle ödersiniz.",
      "Samsun ve Atakum'da kapıda ödeme petshop hizmetimizle kedi maması, köpek maması, kedi kumu ve tüm pet ürünleri aynı gün kapınızda. Nakit ödemede ekstra avantajlı fiyat uyguluyoruz.",
      "900+ ürün, premium markalar ve güvenli kapıda ödeme ile içiniz rahat alışveriş yapın. jetgomarket.com'dan sipariş verin, kapınızda ödeyin.",
    ],
    sections: [
      {
        h2: "Kapıda Ödeme Petshop Seçenekleri",
        paragraphs: [
          "Kapıda ödeme petshop hizmetimizde üç ödeme yöntemi sunuyoruz: kapıda nakit, kapıda kredi kartı (POS cihazı ile) ve kapıda QR kod ödeme. Nakit ödemeyi tercih edenlere ekstra avantajlı fiyat uyguluyoruz.",
          "Kapıda ödeme sayesinde ürünü görmeden ödeme yapma endişesi yaşamazsınız. Siparişiniz kapınıza ulaştığında kontrol eder, ardından ödemenizi yaparsınız. Güvenli ve pratik alışverişin adresi JETGO.",
        ],
      },
      {
        h2: "Kapıda Ödeme Petshop Ürünleri",
        paragraphs: [
          "Kapıda ödeme ile kedi maması, köpek maması, kedi kumu, yaş mama, kuş yemi, kemirgen ürünleri ve tüm bakım-aksesuarları sipariş edebilirsiniz. Tüm ürünlerde kapıda ödeme geçerlidir.",
        ],
        list: [
          "Kapıda nakit ödeme - ekstra avantajlı fiyat",
          "Kapıda kredi kartı (POS)",
          "Kapıda QR kod ödeme",
          "Banka havalesi / EFT seçeneği",
        ],
      },
    ],
    features: [
      "Kapıda nakit ödeme - avantajlı fiyat",
      "Kapıda kredi kartı (POS)",
      "Kapıda QR kod ödeme",
      "Aynı gün teslimat, 1-3 saat",
      "900+ ürün, premium markalar",
    ],
    faq: [
      { q: "Kapıda ödeme petshop hangi yöntemleri kabul ediyor?", a: "Kapıda nakit, kapıda kredi kartı (POS) ve kapıda QR kod ile ödeme yapabilirsiniz. Banka havalesi/EFT de mevcuttur." },
      { q: "Kapıda nakit ödemede indirim var mı?", a: "Evet, nakit ödemede ekstra avantajlı fiyat uyguluyoruz." },
      { q: "Kapıda ödeme petshop hangi bölgelere teslimat yapıyor?", a: "Samsun'un Atakum, İlkadım ve Canik ilçelerinin tüm mahallelerine kapıda ödeme ile teslimat yapıyoruz." },
    ],
    internalLinks: [
      { text: "Petshop Kapıda Ödeme", href: "/petshop-kapida-odeme" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
      { text: "Getir Petshop", href: "/getir-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "petshop-kapida-odeme",
    type: "keyword",
    title: "Petshop Kapıda Ödeme",
    metaTitle: "Petshop Kapıda Ödeme | Samsun Atakum Nakit Kart QR - JETGO Pet Shop",
    metaDescription: "Petshop kapıda ödeme imkânı! Samsun ve Atakum'da nakit, kredi kartı ve QR ile kapıda ödeme. Mama ve kedi kumu aynı gün kapınızda, uygun fiyat.",
    keywords: "petshop kapıda ödeme, pet shop kapıda ödeme, petshop nakit ödeme, petshop kapıda kredi kartı, petshop kapıda ödemeli, mama kapıda ödeme, kedi maması kapıda ödeme, köpek maması kapıda ödeme, petshop kapıda ödeme samsun, petshop kapıda ödeme atakum",
    h1: "Petshop Kapıda Ödeme: Güvenli ve Pratik Alışveriş",
    intro: [
      "Petshop kapıda ödeme imkânı sayesinde önceden ödeme yapmadan sipariş verebilirsiniz. JETGO'da siparişiniz kapınıza geldiğinde nakit, kredi kartı (POS) veya QR kod ile ödersiniz.",
      "Samsun ve Atakum'da petshop kapıda ödeme hizmetiyle kedi maması, köpek maması, kedi kumu ve tüm ürünler aynı gün kapınızda. Nakit ödemede ekstra avantajlı fiyat.",
      "Ürününüzü görmeden ödeme yapma endişesi olmadan, güvenle alışveriş yapın. jetgomarket.com'dan seçin, kapınızda ödeyin.",
    ],
    sections: [
      {
        h2: "Petshop Kapıda Ödeme Nasıl Çalışır?",
        paragraphs: [
          "jetgomarket.com üzerinden ürünlerinizi sepete ekleyin ve siparişinizi verin. Kurye ekibimiz siparişinizi kapınıza getirir. Ürünleri teslim aldığınızda nakit, POS ile kredi kartı veya QR kod ile ödemenizi yaparsınız.",
          "Petshop kapıda ödeme, özellikle ilk kez sipariş veren müşteriler için güven sağlar. Ürünü elinize alıp kontrol ettikten sonra ödeme yaptığınız için içiniz rahat olur.",
        ],
      },
      {
        h2: "Petshop Kapıda Ödeme Avantajları",
        paragraphs: [
          "Petshop kapıda ödeme ile nakit avantajlı fiyat, güvenli alışveriş ve esnek ödeme imkânı bir arada. Tüm ürünlerde kapıda ödeme geçerlidir; mama, kedi kumu, aksesuar fark etmez.",
        ],
        list: [
          "Önceden ödeme zorunluluğu yok",
          "Nakit, kredi kartı (POS), QR ödeme",
          "Nakit ödemede avantajlı fiyat",
          "Ürünü gör, sonra öde - güvenli alışveriş",
        ],
      },
    ],
    faq: [
      { q: "Petshop kapıda ödeme nasıl yapılır?", a: "Siparişiniz kapınıza geldiğinde nakit, kredi kartı (POS) veya QR kod ile ödeme yaparsınız. Önceden ödeme gerekmez." },
      { q: "Petshop kapıda ödemede kredi kartı geçer mi?", a: "Evet, kurye POS cihazı ile kapıda kredi kartı ödemesi alabilir." },
      { q: "Petshop kapıda ödeme hangi bölgelerde geçerli?", a: "Samsun'un Atakum, İlkadım ve Canik ilçelerinin tüm mahallelerinde kapıda ödeme geçerlidir." },
    ],
    internalLinks: [
      { text: "Kapıda Ödeme Petshop", href: "/kapida-odeme-petshop" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
      { text: "Getir Petshop", href: "/getir-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "getir-petshop",
    type: "keyword",
    title: "Getir Petshop",
    metaTitle: "Getir Petshop Mantığında Hızlı Pet Shop | Samsun Atakum - JETGO",
    metaDescription: "Getir tarzı hızlı petshop! Samsun ve Atakum'da kedi maması, köpek maması, kedi kumu 1 saatte kapıda. JETGO ile getir modeli kapıya teslim pet shop.",
    keywords: "getir petshop, getir tarzı petshop, getir gibi petshop, hızlı petshop, dakikada petshop, getir mama, getir kedi maması, anlık teslimat petshop, getir petshop samsun, getir petshop atakum, hızlı teslim pet shop",
    h1: "Getir Petshop Mantığında Hızlı Kapıya Teslim Pet Shop",
    intro: [
      "Getir petshop tarzında hızlı teslimat mı arıyorsunuz? JETGO, getir modeliyle çalışan Samsun ve Atakum'un kapıya teslim pet shop'udur. Mama ve kedi kumu siparişiniz ortalama 1-3 saat içinde kapınızda.",
      "Tıpkı getir mantığında olduğu gibi, uygulamadan değil jetgomarket.com'dan birkaç tıkla sipariş verin, ürünleriniz hızla kapınıza gelsin. Ağır çuvalları taşımanıza gerek kalmaz.",
      "900+ ürün, Royal Canin, Hill's, N&D, Pro Plan gibi premium markalar ve uygun fiyatlarla hizmetinizdeyiz. Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz.",
    ],
    sections: [
      {
        h2: "Getir Petshop Modeli Nasıl Çalışır?",
        paragraphs: [
          "Getir petshop modeli, evcil hayvan ürünlerini hızlı ve kapıya teslim mantığıyla buluşturur. JETGO da aynı prensiple çalışır: online sipariş alır, kurye ekibiyle aynı gün teslimat yapar. Mağazaya gitme, sıra bekleme veya ağır ürün taşıma derdi yoktur.",
          "Acil mama veya kedi kumu ihtiyacınızda getir petshop hızında yanınızdayız. Siparişlerinizi her gün 09:00-21:00 arasında alıyoruz.",
        ],
      },
      {
        h2: "Getir Petshop ile Neler Sipariş Edebilirsiniz?",
        paragraphs: [
          "Kedi maması, köpek maması, kedi kumu, yaş mama, ödül maması, kuş yemi, kemirgen ürünleri ve tüm bakım-aksesuarları getir hızında kapınıza getiriyoruz.",
        ],
        list: [
          "Kedi & köpek maması - premium markalar",
          "Kedi kumu - apartman katınıza kadar",
          "Kuş & kemirgen ürünleri",
          "Bakım ürünleri ve aksesuarlar",
        ],
      },
    ],
    features: [
      "Getir modeli kapıya teslim",
      "Ortalama 1-3 saat hızlı teslimat",
      "900+ ürün, premium markalar",
      "Kapıda nakit, POS, QR ödeme",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Getir petshop var mı?", a: "JETGO, getir modeliyle çalışan kapıya teslim pet shop'tur. Samsun ve Atakum'a aynı gün hızlı teslimat yapar." },
      { q: "Getir petshop ne kadar sürede teslim eder?", a: "Ortalama 1-3 saat içinde siparişiniz kapınızda olur." },
      { q: "Getir petshop nereden sipariş verilir?", a: "jetgomarket.com adresinden ürünleri seçip sipariş verebilir, WhatsApp ile de onaylayabilirsiniz." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
      { text: "Kapıda Ödeme Petshop", href: "/kapida-odeme-petshop" },
      { text: "Petshop Kapıda Ödeme", href: "/petshop-kapida-odeme" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "samsun-atakum-petshop-kedi-kopek-mamasi",
    type: "keyword",
    title: "Samsun Atakum Petshop Kedi Köpek Maması",
    metaTitle: "Samsun Atakum Petshop | Kedi Köpek Maması Hızlı Teslimat | JETGO",
    metaDescription: "Samsun ve Atakum petshop. Kedi maması, köpek maması, kedi kumu aynı gün kapıya teslim. 900+ ürün, premium markalar, uygun fiyat. JETGO Pet Shop.",
    keywords: "samsun atakum petshop, samsun petshop kedi maması, atakum petshop kedi maması, samsun petshop köpek maması, atakum petshop köpek maması, samsun kedi maması petshop, atakum kedi maması petshop, samsun köpek maması petshop, atakum köpek maması petshop",
    h1: "Samsun & Atakum Petshop: Kedi ve Köpek Maması Kapıya Teslim",
    intro: [
      "Samsun ve Atakum'da petshop arayanlar için JETGO, kedi maması ve köpek maması başta olmak üzere tüm evcil hayvan ürünlerini aynı gün kapıya teslim ediyor. 900'den fazla ürün çeşidi, premium markalar ve piyasanın en uygun fiyatlarıyla hizmetinizdeyiz.",
      "Samsun petshop kedi maması arayanlar için Royal Canin, Hill's, N&D, Pro Plan ve Reflex gibi dünya markalarını stokta tutuyoruz. Samsun petshop köpek maması için büyük ırk, küçük ırk, yavru ve yetişkin formülleri mevcut.",
      "Atakum petshop olarak Denizevleri, Güzelyalı, Kurupelit, Atakent ve tüm mahallelere aynı gün teslimat yapıyoruz. Kedi kumu, kuş yemi, kemirgen ürünleri ve tüm aksesuarlar da ürün yelpazemizde yer alıyor.",
    ],
    sections: [
      {
        h2: "Samsun Petshop Kedi Maması Seçenekleri",
        paragraphs: [
          "Samsun petshop kedi maması ürünlerimiz arasında samsun premium kedi maması, samsun yavru kedi maması, samsun yetişkin kedi maması ve samsun tahılsız kedi maması seçenekleri bulunmaktadır. Samsun Royal Canin kedi maması, samsun Pro Plan kedi maması, samsun Hills kedi maması ve samsun Acana kedi maması gibi dünya markalarını kapınıza getiriyoruz.",
          "Atakum petshop kedi maması siparişlerinizi aynı gün teslim ediyoruz. Kısırlaştırılmış kedi maması, hassas sindirim maması, indoor kedi maması ve diyet kedi maması çeşitleri geniş ürün yelpazemizde mevcut.",
        ],
      },
      {
        h2: "Samsun Petshop Köpek Maması Seçenekleri",
        paragraphs: [
          "Samsun petshop köpek maması ürünlerimiz arasında samsun yavru köpek maması, samsun yetişkin köpek maması, samsun büyük ırk köpek maması ve samsun küçük ırk köpek maması seçenekleri bulunmaktadır. Samsun Royal Canin köpek maması, samsun Pro Plan köpek maması, samsun Hills köpek maması ve samsun Pedigree köpek maması gibi premium markalar stokta.",
          "Atakum petshop köpek maması siparişlerinde 15 kg çuvalları kapınıza kadar getiriyoruz. Hassas sindirim, kilo kontrolü ve hipoalerjenik köpek mamaları da mevcuttur.",
        ],
      },
      {
        h2: "Samsun Petshop Teslimat ve Ödeme",
        paragraphs: [
          "Samsun petshop hızlı teslim hizmetimizle siparişleriniz aynı gün kapınıza ulaşır. Samsun petshop eve teslim, samsun petshop kapıda ödeme ve samsun petshop online sipariş avantajlarından yararlanın.",
          "Kapıda nakit ödeme, POS ile kredi kartı, QR kod ödeme ve banka havalesi seçeneklerimiz mevcuttur. Nakit ödemede ekstra avantajlı fiyat uyguluyoruz. Her siparişte %5 Para Puan kazanırsınız. WhatsApp ile de sipariş verebilirsiniz.",
        ],
      },
    ],
    faq: [
      { q: "Samsun ve Atakum'da petshop var mı?", a: "Evet, JETGO Samsun ve Atakum'un tüm mahallelerine kapıya teslim petshop hizmeti sunmaktadır. 900+ ürün, premium markalar, aynı gün teslimat." },
      { q: "Samsun petshop hangi markaları satıyor?", a: "Royal Canin, Hill's, N&D, Pro Plan, Reflex, Profine, ProChoice, Felicia ve daha birçok premium marka mevcuttur." },
      { q: "Samsun petshop kapıda ödeme var mı?", a: "Evet, kapıda nakit, POS ile kredi kartı ve QR kod ile ödeme yapabilirsiniz. Nakit ödemede ekstra avantajlı fiyat." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "jetgo-petshop",
    type: "keyword",
    title: "JETGO Petshop",
    metaTitle: "JETGO Petshop Samsun Atakum | Hızlı Teslimat Kapıda Ödeme | jetgomarket.com",
    metaDescription: "JETGO petshop Samsun ve Atakum. Kedi maması, köpek maması, kedi kumu 1 saatte kapıya teslim. 900+ ürün, premium markalar. jetgomarket.com online sipariş.",
    keywords: "jetgo petshop, jetgo petshop samsun, jetgo petshop atakum, jetgo pet samsun, jetgomarket.com, jetgo mama samsun, jetgo petshop hızlı teslim, jetgo petshop eve teslim, jetgo petshop kapıda ödeme, jetgo petshop online sipariş, jetgo petshop kedi kumu",
    h1: "JETGO Petshop - Samsun'un Kapıya Teslim Pet Shop'u",
    intro: [
      "JETGO, Samsun'un ilk ve en kapsamlı kapıya teslim petshop hizmetidir. Getir modeli ile çalışan JETGO, evcil hayvan ürünlerinizi online sipariş ile aynı gün kapınıza teslim eder. jetgomarket.com adresinden veya WhatsApp ile kolayca sipariş verebilirsiniz.",
      "JETGO petshop Samsun ve Atakum başta olmak üzere İlkadım ve Canik ilçelerine de hizmet vermektedir. 900'den fazla ürün çeşidi, Royal Canin, Hill's, N&D, Pro Plan gibi premium markalar ve piyasanın en rekabetçi fiyatları ile hizmetinizdeyiz.",
      "JETGO petshop hızlı teslim özelliği sayesinde siparişleriniz ortalama 1-3 saat içinde kapınızda. Kapıda nakit ödeme, POS ile kredi kartı ve QR kod ödeme seçenekleri mevcut. Her siparişte %5 Para Puan kazanırsınız.",
    ],
    sections: [
      {
        h2: "JETGO Petshop Neden Farklı?",
        paragraphs: [
          "JETGO petshop geleneksel pet shop'lardan farklı olarak tamamen online çalışan bir kapıya teslim hizmetidir. Mağazaya gitmenize, trafikte vakit kaybetmenize veya ağır çuvalları taşımanıza gerek yok. Tüm ürünleri online inceleyin, fiyatları karşılaştırın ve tek tıkla sipariş verin.",
          "JETGO petshop mama sipariş sürecini olabildiğince kolaylaştırmıştır. Web sitesi jetgomarket.com üzerinden sepetinizi oluşturun, WhatsApp ile onaylayın ve aynı gün teslimatı bekleyin. Sesli sipariş seçeneği ile WhatsApp üzerinden sesli mesajla da sipariş verebilirsiniz.",
          "JETGO petshop online sipariş avantajları arasında 7/24 sipariş verebilme, fiyat karşılaştırma, ürün detaylarını inceleme ve favori ürün listeleri oluşturma yer almaktadır. Para Puan sadakat programı ile her siparişte tasarruf sağlarsınız.",
        ],
      },
      {
        h2: "JETGO Petshop Ürün Portföyü",
        paragraphs: [
          "JETGO petshop kedi maması, köpek maması, kedi kumu, yaş mama, ödül maması, bakım ürünleri, taşıma ürünleri, kuş yemi, kuş kafesi, kemirgen yemi ve aksesuar ürünleri olmak üzere 900'den fazla ürün sunmaktadır.",
          "JETGO petshop kedi kumu teslimatında ağır kumları apartman katınıza kadar çıkarıyoruz. 10-20 kg kedi kumu paketlerini taşıma derdi artık yok. JETGO petshop eve teslim hizmetinin en büyük avantajlarından biri ağır ürünlerin kapınıza kadar getirilmesidir.",
        ],
      },
    ],
    features: [
      "Getir modeli kapıya teslim petshop hizmeti",
      "900+ ürün çeşidi, premium markalar",
      "Aynı gün teslimat, ortalama 1-3 saat",
      "Kapıda nakit, POS, QR ödeme",
      "Her siparişte %5 Para Puan kazanımı",
      "WhatsApp ile kolay ve sesli sipariş",
      "jetgomarket.com online sipariş platformu",
      "Atakum, İlkadım, Canik teslimat",
    ],
    faq: [
      { q: "JETGO petshop nasıl sipariş verilir?", a: "jetgomarket.com adresinden ürünlerinizi sepete ekleyin, WhatsApp ile siparişi onaylayın. Aynı gün kapınıza teslim edilir. Sesli sipariş de mevcuttur." },
      { q: "JETGO petshop teslimat süresi ne kadar?", a: "Ortalama 1-3 saat içinde teslimat yapıyoruz. 17:00'ye kadar verilen siparişler aynı gün teslim edilir." },
      { q: "JETGO petshop hangi bölgelere teslimat yapıyor?", a: "Samsun'un Atakum, İlkadım ve Canik ilçelerinin tüm mahallelerine teslimat yapıyoruz." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop-samsun" },
    ],
  },
  {
    slug: "samsun-petshop-kedi-mamasi",
    type: "keyword",
    title: "Samsun Petshop Kedi Maması",
    metaTitle: "Samsun Petshop Kedi Maması | Royal Canin Hill's N&D Kapıya Teslim | JETGO",
    metaDescription: "Samsun petshop kedi maması. Royal Canin, Hill's, N&D, Pro Plan kedi maması kapıya teslim. Yavru, yetişkin, kısır kedi maması. Aynı gün teslimat, uygun fiyat.",
    keywords: "samsun petshop kedi maması, samsun kedi maması petshop, samsun kedi maması fiyat, samsun premium kedi maması, samsun yavru kedi maması, samsun yetişkin kedi maması, samsun tahılsız kedi maması, samsun royal canin kedi maması, samsun proplan kedi maması, samsun hills kedi maması, samsun acana kedi maması, samsun felix kedi maması",
    h1: "Samsun Petshop Kedi Maması - Premium Markalar Uygun Fiyat",
    intro: [
      "Samsun'da petshop kedi maması arayanlar için JETGO, Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan, Reflex Plus ve daha birçok premium markayı kapıya teslim ediyor. Samsun kedi maması fiyatlarında nakit ödemede ekstra avantaj sunuyoruz.",
      "Samsun yavru kedi maması, samsun yetişkin kedi maması, samsun kısırlaştırılmış kedi maması ve samsun tahılsız kedi maması çeşitleri geniş ürün yelpazemizde mevcut. Her kedinizin ihtiyacına uygun mama JETGO'da bulunur.",
      "Samsun Royal Canin kedi maması, samsun Pro Plan kedi maması, samsun Hills kedi maması ve samsun Acana kedi maması gibi dünya markalarını stokta tutuyoruz. Aynı gün teslimat ile kedinizi aç bırakmayın.",
    ],
    sections: [
      {
        h2: "Samsun'da Kedi Maması Markaları ve Türleri",
        paragraphs: [
          "Samsun petshop kedi maması ürünlerimiz yavru, yetişkin, kısırlaştırılmış, hassas sindirim, indoor ve özel diyet kategorilerinde sunulmaktadır. Samsun premium kedi maması segmentinde Royal Canin, Hill's ve N&D en çok tercih edilen markalardır.",
          "Samsun Felix kedi maması, samsun Whiskas kedi maması gibi ekonomik markalar da mevcuttur. Kuru mama, yaş mama, konserve mama ve ödül maması seçenekleri ile kedinizin damak zevkine uygun ürünü kolayca bulabilirsiniz.",
          "Samsun kedi maması fiyatları markaya göre değişmektedir. 1,5 kg paketler 200-900 TL, büyük paketler 2.000-6.000 TL arasındadır. Nakit ödemede ekstra avantajlı fiyat ve %5 Para Puan kazanımı ile tasarruf sağlayın.",
        ],
      },
    ],
    faq: [
      { q: "Samsun'da kedi maması hangi petshop'ta bulunur?", a: "JETGO petshop'ta Royal Canin, Hill's, N&D, Pro Plan dahil 50'den fazla kedi maması çeşidi mevcuttur. Kapıya teslim edilir." },
      { q: "Samsun kedi maması fiyatları uygun mu?", a: "JETGO nakit ödeme fiyatlarıyla piyasanın en uygun fiyatlarını sunar. %5 Para Puan ile ekstra tasarruf." },
      { q: "Samsun'da kedi maması aynı gün teslim edilir mi?", a: "Evet, 17:00'ye kadar verilen siparişler aynı gün teslim edilir. Atakum, İlkadım, Canik'e teslimat." },
    ],
    internalLinks: [
      { text: "Kedi Maması Markaları", href: "/kedi-mamasi" },
      { text: "En İyi Kedi Maması", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Kedi Kategorisi", href: "/kategori/kedi" },
    ],
  },
  {
    slug: "samsun-petshop-kopek-mamasi",
    type: "keyword",
    title: "Samsun Petshop Köpek Maması",
    metaTitle: "Samsun Petshop Köpek Maması | Royal Canin Hill's Pro Plan Kapıya Teslim | JETGO",
    metaDescription: "Samsun petshop köpek maması. Royal Canin, Hill's, N&D, Pro Plan köpek maması kapıya teslim. Yavru, yetişkin, büyük küçük ırk. Aynı gün teslimat.",
    keywords: "samsun petshop köpek maması, samsun köpek maması petshop, samsun köpek maması fiyat, samsun premium köpek maması, samsun yavru köpek maması, samsun yetişkin köpek maması, samsun büyük ırk köpek maması, samsun küçük ırk köpek maması, samsun tahılsız köpek maması, samsun royal canin köpek maması, samsun proplan köpek maması, samsun pedigree köpek maması, samsun hills köpek maması, samsun acana köpek maması",
    h1: "Samsun Petshop Köpek Maması - Tüm Markalar Kapıya Teslim",
    intro: [
      "Samsun'da petshop köpek maması arayanlar için JETGO, Royal Canin, Hill's, N&D, Pro Plan, Reflex ve Pro Performance gibi tüm premium markaları kapıya teslim ediyor. 15 kg çuvalları taşıma derdi artık yok.",
      "Samsun yavru köpek maması, samsun yetişkin köpek maması, samsun büyük ırk köpek maması, samsun küçük ırk köpek maması ve samsun tahılsız köpek maması çeşitleri JETGO'da mevcut.",
      "Samsun Royal Canin köpek maması, samsun Pro Plan köpek maması, samsun Pedigree köpek maması ve samsun Hills köpek maması stokta bulunmaktadır. Nakit ödemede ekstra avantajlı fiyat ve her siparişte %5 Para Puan.",
    ],
    sections: [
      {
        h2: "Samsun Köpek Maması Marka ve Türleri",
        paragraphs: [
          "Samsun petshop köpek maması kategorisinde yavru, yetişkin, senior, küçük ırk, orta ırk, büyük ırk, hassas sindirim, kilo kontrol ve hipoalerjenik seçenekler mevcuttur. Samsun premium köpek maması için Royal Canin, Hill's ve N&D öne çıkan markalardır.",
          "Samsun Acana köpek maması, Econature, Wanpy ve Profine gibi alternatif premium markalar da JETGO'da bulunmaktadır. Köpek maması fiyatları 12-18 kg paketlerde 1.800-7.000 TL arasında değişmektedir.",
        ],
      },
    ],
    faq: [
      { q: "Samsun'da köpek maması nereden alınır?", a: "JETGO petshop'ta tüm premium köpek maması markaları mevcuttur. Kapıya teslim edilir, ağır çuvalları taşıma derdi yok." },
      { q: "Samsun köpek maması fiyatları ne kadar?", a: "12-18 kg paketler 1.800-7.000 TL arası. Nakit ödemede ekstra avantaj, %5 Para Puan kazanımı." },
      { q: "Büyük ırk köpek maması Samsun'da var mı?", a: "Evet, Royal Canin Maxi, Hill's Large Breed ve N&D büyük ırk köpek mamaları JETGO'da stokta." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Köpek Kategorisi", href: "/kategori/kopek" },
    ],
  },
  {
    slug: "samsun-petshop-kedi-kumu",
    type: "keyword",
    title: "Samsun Petshop Kedi Kumu",
    metaTitle: "Samsun Petshop Kedi Kumu | Bentonit Silika Kapıya Teslim | JETGO",
    metaDescription: "Samsun petshop kedi kumu kapıya teslim. Bentonit, silika, aktif karbonlu, topaklanan kedi kumu. Van Cat, Biokat's, Sanicat. Ağır kumları biz getiriyoruz.",
    keywords: "samsun petshop kedi kumu, samsun kedi kumu petshop, samsun kedi kumu fiyat, samsun topaklanan kedi kumu, samsun silika kedi kumu, samsun bentonit kedi kumu, samsun kokulu kedi kumu, samsun kokusuz kedi kumu, samsun everclean kedi kumu, samsun bentokat kedi kumu, samsun kedi tuvaleti, samsun kedi kumu küreği",
    h1: "Samsun Petshop Kedi Kumu - Kapıya Teslim",
    intro: [
      "Samsun'da petshop kedi kumu arayanlar için JETGO, Van Cat, Biokat's ve Sanicat markalarının bentonit, silika ve aktif karbonlu kedi kumlarını kapıya teslim ediyor. 10-20 kg ağır kum paketlerini apartman katınıza kadar çıkarıyoruz.",
      "Samsun topaklanan kedi kumu, samsun bentonit kedi kumu, samsun silika kedi kumu, samsun kokulu kedi kumu ve samsun kokusuz kedi kumu çeşitleri geniş ürün yelpazemizde mevcut. Aktif karbonlu kumlar apartman dairelerinde koku kontrolü için idealdir.",
      "Samsun kedi kumu fiyatları 10 litrelik paketlerde 100-600 TL arasında değişmektedir. Nakit ödemede ekstra avantajlı fiyat. Kedi tuvaleti ve kedi kumu küreği aksesuarları da JETGO'da mevcut.",
    ],
    sections: [
      {
        h2: "Samsun Kedi Kumu Marka ve Çeşitleri",
        paragraphs: [
          "Samsun petshop kedi kumu markalarından Van Cat aktif karbonlu ince taneli bentonit ile piyasanın en çok satan markasıdır. Samsun Biokat's kedi kumu Bianco Fresh mandalina aromalı seçeneği ile premium kalite sunar. Samsun Sanicat kedi kumu Duo serisi vanilya ve mandalina aromalıdır.",
          "Samsun bentokat kedi kumu ve samsun everclean kedi kumu gibi markalar da stokta mevcuttur. Topaklanan, aktif karbonlu, aromalı, ince taneli ve kalın taneli kedi kumu seçenekleri JETGO'da bulunabilir. Kedi tuvaleti aksesuarları ve kedi kumu küreği de kapıya teslim edilir.",
        ],
      },
    ],
    faq: [
      { q: "Samsun'da kedi kumu kapıya teslim var mı?", a: "Evet, JETGO tüm kedi kumu markalarını Samsun merkez ilçelerine aynı gün kapıya teslim eder. 10-20 kg paketleri apartman katınıza çıkarırız." },
      { q: "Samsun kedi kumu fiyatları uygun mu?", a: "JETGO nakit ödeme fiyatlarıyla piyasanın en uygun kedi kumu fiyatlarını sunar. %5 Para Puan ile ekstra tasarruf." },
      { q: "Samsun'da en iyi kedi kumu hangisi?", a: "Topaklanan bentonit kumlar en popülerdir. Van Cat aktif karbonlu ve Biokat's Bianco Fresh en çok tercih edilen markalar." },
    ],
    internalLinks: [
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Kedi Kumu Karşılaştırma", href: "/kedi-kumu-en-iyi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
    ],
  },
  {
    slug: "atakum-petshop-kedi-mamasi",
    type: "keyword",
    title: "Atakum Petshop Kedi Maması",
    metaTitle: "Atakum Petshop Kedi Maması | Premium Markalar Aynı Gün Teslimat | JETGO",
    metaDescription: "Atakum petshop kedi maması kapıya teslim. Royal Canin, Hill's, N&D, Pro Plan. Denizevleri, Güzelyalı, Kurupelit, Atakent teslimat. JETGO Samsun.",
    keywords: "atakum petshop kedi maması, atakum kedi maması petshop, atakum kedi maması fiyat, atakum kedi maması, atakum premium kedi maması",
    h1: "Atakum Petshop Kedi Maması - Premium Markalar Kapıya Teslim",
    intro: [
      "Atakum'da petshop kedi maması arayanlar için JETGO tüm premium markaları Denizevleri, Güzelyalı, Kurupelit, Atakent ve diğer tüm mahallelere aynı gün kapıya teslim ediyor.",
      "Atakum petshop kedi maması seçenekleri arasında Royal Canin, Hill's, N&D, Pro Plan, Reflex Plus, Felicia ve ProChoice gibi markalar yer almaktadır. Yavru, yetişkin, kısır ve özel diyet kedi mamaları mevcut.",
      "Atakum kedi maması fiyatlarında JETGO nakit ödemede ekstra avantaj sunar. Her siparişte %5 Para Puan kazanın. Aynı gün teslimat garantisi ile kedinizi aç bırakmayın.",
    ],
    sections: [
      {
        h2: "Atakum Mahallelerine Kedi Maması Teslimatı",
        paragraphs: [
          "Atakum Denizevleri, Güzelyalı, Kurupelit, Atakent, Mimar Sinan, Körfez, Yeni Mahalle, İncesu, Soğuksu, Taflan ve tüm diğer mahallelere kedi maması teslimatı yapıyoruz. Sahil şeridindeki mahallelere öncelikli hızlı teslimat avantajı mevcuttur.",
          "Atakum petshop kedi maması siparişinizi jetgomarket.com üzerinden veya WhatsApp ile verin, aynı gün kapınıza teslim edelim. 1,5 kg'dan 15 kg'a kadar tüm paket boyutları mevcut.",
        ],
      },
    ],
    faq: [
      { q: "Atakum'da kedi maması nereden alınır?", a: "JETGO petshop tüm kedi maması markalarını Atakum'un her mahallesine aynı gün kapıya teslim eder." },
      { q: "Atakum kedi maması fiyatları uygun mu?", a: "JETGO nakit ödeme fiyatlarıyla Atakum'da en uygun kedi maması fiyatlarını sunar. %5 Para Puan kazanımı." },
      { q: "Atakum Güzelyalı'ya kedi maması teslimatı var mı?", a: "Evet, Güzelyalı dahil Atakum'un tüm mahallelerine aynı gün kedi maması teslimatı yapıyoruz." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Samsun Kedi Maması", href: "/samsun-petshop-kedi-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
    ],
  },
  {
    slug: "atakum-petshop-kopek-mamasi",
    type: "keyword",
    title: "Atakum Petshop Köpek Maması",
    metaTitle: "Atakum Petshop Köpek Maması | Premium Markalar Kapıya Teslim | JETGO",
    metaDescription: "Atakum petshop köpek maması kapıya teslim. Royal Canin, Hill's, N&D, Pro Plan. 15 kg çuvalları kapınıza getiriyoruz. Aynı gün teslimat. JETGO.",
    keywords: "atakum petshop köpek maması, atakum köpek maması petshop, atakum köpek maması fiyat, atakum köpek maması",
    h1: "Atakum Petshop Köpek Maması - Ağır Çuvalları Biz Getiriyoruz",
    intro: [
      "Atakum'da petshop köpek maması arayanlar için JETGO tüm premium markaları kapıya teslim ediyor. 15 kg çuvalları apartman katınıza kadar getiriyoruz. Taşıma derdi yok.",
      "Royal Canin, Hill's, N&D, Pro Plan, Reflex, Pro Performance köpek mamaları Atakum'un tüm mahallelerine aynı gün teslim. Yavru, yetişkin, büyük ırk, küçük ırk ve hassas sindirim mamaları mevcut.",
      "Atakum köpek maması fiyatlarında nakit ödemede ekstra avantaj. %5 Para Puan kazanımı. 1.500 TL üzeri ücretsiz kargo.",
    ],
    sections: [
      {
        h2: "Atakum Köpek Maması Teslimat ve Fiyat",
        paragraphs: [
          "Atakum petshop köpek maması siparişlerinde 12-18 kg ağır çuvalları kapınıza kadar, hatta apartman katınıza kadar teslim ediyoruz. Denizevleri, Güzelyalı, Kurupelit, Atakent ve tüm mahallelere aynı gün teslimat.",
          "Atakum köpek maması fiyatları 12-18 kg paketlerde 1.800-7.000 TL arasında değişmektedir. JETGO nakit ödeme fiyatlarıyla piyasanın en uygun fiyatlarını sunar. Her siparişte %5 Para Puan kazanırsınız.",
        ],
      },
    ],
    faq: [
      { q: "Atakum'da köpek maması nereden alınır?", a: "JETGO petshop tüm köpek maması markalarını Atakum'a kapıya teslim eder. 15 kg çuvalları taşıma derdi yok." },
      { q: "Atakum köpek maması aynı gün gelir mi?", a: "Evet, 17:00'ye kadar verilen siparişler aynı gün teslim edilir." },
      { q: "Atakum'da büyük ırk köpek maması var mı?", a: "Evet, Royal Canin Maxi, Hill's Large Breed ve N&D büyük ırk köpek mamaları JETGO'da stokta." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Samsun Köpek Maması", href: "/samsun-petshop-kopek-mamasi" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
    ],
  },
  {
    slug: "en-yakin-petshop-samsun",
    type: "keyword",
    title: "En Yakın Petshop Samsun",
    metaTitle: "En Yakın Petshop Samsun | Yakınımda Petshop - Kapınıza Geliyoruz | JETGO",
    metaDescription: "Samsun'da en yakın petshop'u aramayın, biz kapınıza geliyoruz! JETGO ile kedi maması, köpek maması, kedi kumu aynı gün teslimat. Atakum, İlkadım, Canik.",
    keywords: "samsun petshop en yakın, atakum petshop en yakın, en yakın petshop, yakınımda petshop, samsun en yakın pet shop, pet shop yakınımda, samsun petshop yakınımda, atakum petshop yakınımda, petshop near me samsun, bana en yakın petshop samsun, bana en yakın petshop atakum",
    h1: "Samsun'da En Yakın Petshop - Kapınıza Geliyoruz",
    intro: [
      "Samsun'da en yakın petshop'u arıyorsunuz ama trafikte vakit kaybetmek istemiyorsunuz? JETGO ile evcil hayvan ürünlerinizi online sipariş verin, aynı gün kapınıza teslim edelim. Samsun petshop en yakın, atakum petshop en yakın diye aramanıza gerek yok, en yakın petshop her zaman cebinizde.",
      "Samsun petshop yakınımda, atakum petshop yakınımda, bana en yakın petshop samsun gibi aramalara en iyi cevap JETGO'nun kapıya teslim hizmetidir. Artık ağır mama çuvallarını ve kedi kumunu taşımak zorunda değilsiniz.",
      "900'den fazla ürün çeşidi, premium markalar ve uygun fiyatlarla Samsun'un en kapsamlı online petshop'u JETGO'da. Her siparişte %5 Para Puan kazanın.",
    ],
    sections: [
      {
        h2: "En Yakın Petshop Yerine Kapıya Teslim",
        paragraphs: [
          "Geleneksel petshop'a gitmek trafikte vakit kaybetmek, ağır çuvalları taşımak ve sınırlı ürün seçeneği demektir. JETGO ile bu sorunların hepsini çözüyoruz. 900'den fazla ürünü online inceleyin, fiyatları karşılaştırın ve tek tıkla sipariş verin.",
          "Samsun petshop nerede, samsun petshop açık mı, samsun petshop hangi saatte açık gibi sorulara cevap: JETGO her gün 09:00-21:00 arası sipariş kabul eder ve aynı gün kapınıza teslim eder. Petshop near me samsun arayanlar için en pratik çözüm.",
          "Atakum, İlkadım ve Canik ilçelerinin tüm mahallelerine teslimat yapıyoruz. Samsun petshop adresleri aramak yerine JETGO'nun kapıya teslim hizmetinden yararlanın.",
        ],
      },
    ],
    features: [
      "Aynı gün kapıya teslimat - Mağazaya gitmeye gerek yok",
      "Atakum, İlkadım, Canik tüm mahallelere",
      "900+ ürün çeşidi - Online karşılaştırma",
      "Kapıda nakit, POS, QR ödeme",
      "Her siparişte %5 Para Puan",
      "WhatsApp ile kolay sipariş",
      "Premium markalar uygun fiyatla",
    ],
    faq: [
      { q: "Samsun'da en yakın petshop nerede?", a: "JETGO ile petshop'a gitmenize gerek yok! Online sipariş verin, aynı gün kapınıza teslim edelim. Atakum, İlkadım ve Canik'e teslimat yapıyoruz." },
      { q: "Samsun petshop açık mı şimdi?", a: "JETGO her gün 09:00-21:00 arası sipariş kabul etmektedir. 17:00'ye kadar verilen siparişler aynı gün teslim edilir." },
      { q: "Samsun petshop telefon numarası nedir?", a: "JETGO Pet Shop: 0850 840 39 59. WhatsApp üzerinden de sipariş verebilirsiniz." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "İlkadım Pet Shop", href: "/ilkadim-petshop" },
      { text: "Canik Pet Shop", href: "/canik-petshop" },
      { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
    ],
  },
  {
    slug: "kapiya-teslim-petshop-samsun",
    type: "keyword",
    title: "Kapıya Teslim Petshop Samsun",
    metaTitle: "Kapıya Teslim Petshop Samsun | Aynı Gün Teslimat Kapıda Ödeme | JETGO",
    metaDescription: "Samsun'da kapıya teslim petshop. Kedi maması, köpek maması, kedi kumu aynı gün adresinize. Nakit, kredi kartı, QR ödeme. Hızlı teslimat. JETGO.",
    keywords: "samsun petshop hızlı teslim, samsun petshop 1 saatte teslim, samsun petshop aynı gün teslim, samsun petshop eve teslim, samsun petshop kapıda ödeme, samsun petshop online sipariş, atakum petshop hızlı teslim, atakum petshop eve teslim, atakum petshop kapıda ödeme, samsun petshop kurye, samsun petshop hızlı kurye",
    h1: "Samsun Kapıya Teslim Petshop - Aynı Gün Teslimat",
    intro: [
      "JETGO, Samsun'un ilk kapıya teslim petshop hizmetidir. Getir modeli ile evcil hayvan ürünlerinizi online sipariş verin, aynı gün kapınıza getirelim. Samsun petshop hızlı teslim, samsun petshop eve teslim ve samsun petshop aynı gün teslim avantajlarından yararlanın.",
      "Atakum, İlkadım ve Canik ilçelerinin tüm mahallelerine düzenli teslimat rotalarımız bulunmaktadır. Sabah verdiğiniz siparişler akşama kapınızda. Samsun petshop 1 saatte teslim ile acil ihtiyaçlarınız için de hazırız.",
      "Samsun petshop kapıda ödeme seçeneklerimiz: kapıda nakit, POS cihazı ile kredi kartı, QR kod ile ödeme ve banka havalesi. Samsun petshop online sipariş ile 7/24 sipariş verebilirsiniz.",
    ],
    sections: [
      {
        h2: "Samsun Petshop Hızlı Teslimat Nasıl Çalışır?",
        paragraphs: [
          "jetgomarket.com üzerinden ürünlerinizi sepete ekleyin, WhatsApp ile siparişinizi onaylayın. Samsun petshop kurye ekibimiz siparişinizi kapınıza getirir. Ortalama teslimat süremiz 1-3 saattir. Samsun petshop hızlı kurye hizmetimizle acil ihtiyaçlarınız için öncelikli teslimat da mevcuttur.",
          "Samsun petshop mama sipariş, samsun petshop whatsapp sipariş ve samsun petshop telefon sipariş seçenekleriyle kolayca sipariş verebilirsiniz. Samsun petshop online satış platformumuz 7/24 açıktır.",
          "Atakum petshop hızlı teslim, atakum petshop eve teslim ve atakum petshop kapıda ödeme avantajlarından yararlanın. Tüm Samsun merkez ilçelerine aynı gün teslimat garantisi sunuyoruz.",
        ],
      },
    ],
    features: [
      "Aynı gün kapıya teslimat garantisi",
      "Ortalama 1-3 saat teslimat süresi",
      "Kapıda nakit, POS, QR ödeme",
      "900+ ürün çeşidi",
      "Royal Canin, Hill's, N&D, Pro Plan",
      "Her siparişte %5 Para Puan",
      "1.500 TL üzeri ücretsiz kargo",
      "WhatsApp ile anlık sipariş",
    ],
    faq: [
      { q: "Samsun petshop aynı gün teslim ediyor mu?", a: "Evet, 17:00'ye kadar verilen siparişler aynı gün teslim edilir. Ortalama teslimat süresi 1-3 saattir." },
      { q: "Samsun petshop kapıda ödeme var mı?", a: "Evet, kapıda nakit, kredi kartı (POS) ve QR kod ile ödeme yapabilirsiniz. Nakit ödemede ekstra avantaj." },
      { q: "Samsun petshop teslimat ücreti ne kadar?", a: "Teslimat ücreti mahallenize göre değişir. 1.500 TL üzeri siparişlerde kargo ücretsizdir." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop-samsun" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
    ],
  },
  {
    slug: "online-petshop-samsun",
    type: "keyword",
    title: "Online Petshop Samsun",
    metaTitle: "Online Petshop Samsun | 900+ Ürün Aynı Gün Teslimat | JETGO",
    metaDescription: "Samsun online petshop. 900+ kedi köpek ürünü, premium markalar, uygun fiyat. Aynı gün teslimat, kapıda ödeme. JETGO ile online evcil hayvan alışverişi.",
    keywords: "samsun petshop online sipariş, samsun petshop online satış, samsun petshop internetten alışveriş, samsun petshop e-ticaret, online petshop samsun, online pet shop, samsun online evcil hayvan, internet petshop samsun, pet ürünleri online samsun, atakum petshop online sipariş",
    h1: "Samsun Online Petshop - JETGO",
    intro: [
      "Samsun'un en kapsamlı online petshop'u JETGO ile evcil hayvan alışverişinizi kolaylaştırın. 900'den fazla ürün, premium markalar ve uygun fiyatlarla tüm ihtiyaçlarınızı tek tıkla karşılayın. Samsun petshop online sipariş ile 7/24 sipariş verin.",
      "Kedi maması, köpek maması, kedi kumu, kuş yemi, kemirgen ürünleri ve evcil hayvan aksesuarlarını online sipariş verin. Atakum, İlkadım ve Canik'e aynı gün kapıya teslim ediyoruz. Samsun petshop internetten alışveriş artık çok kolay.",
      "Online alışverişin avantajlarından yararlanın: fiyat karşılaştırma, ürün detayları ve Para Puan kazanımı. Her siparişte %5 Para Puan kazanın. Samsun petshop e-ticaret platformumuz jetgomarket.com üzerinden güvenle alışveriş yapın.",
    ],
    sections: [
      {
        h2: "Online Petshop Avantajları",
        paragraphs: [
          "Samsun petshop online satış hizmetimizle 7/24 sipariş verebilirsiniz. Ürünleri online inceleyin, fiyatları karşılaştırın, favorilerinize ekleyin ve tek tıkla sipariş verin. Geleneksel petshop'a gitmek yerine JETGO'nun online petshop hizmetinden yararlanın.",
          "Pet ürünleri online samsun arayanlar için JETGO en kapsamlı çözümdür. 900+ ürün, 50+ marka ve piyasanın en rekabetçi fiyatları tek platformda. Atakum petshop online sipariş ile Atakum'un tüm mahallelerine aynı gün teslimat.",
        ],
      },
    ],
    features: [
      "900+ ürün çeşidi online",
      "7/24 sipariş verebilme",
      "Fiyat karşılaştırma kolaylığı",
      "Para Puan kazanımı - %5 geri kazanım",
      "Aynı gün teslimat",
      "Kapıda ödeme seçenekleri",
      "Favorilere ekleme ve hatırlatma",
    ],
    faq: [
      { q: "Samsun online petshop'tan nasıl sipariş verilir?", a: "jetgomarket.com adresine girin, ürünlerinizi sepete ekleyin ve WhatsApp üzerinden siparişinizi tamamlayın. Aynı gün kapınıza teslim." },
      { q: "Online petshop sipariş güvenli mi?", a: "Evet, ödeme kapıda yapılır. Nakit, POS veya QR kod ile güvenle ödeme yapabilirsiniz." },
      { q: "Samsun online petshop'ta indirim var mı?", a: "Evet, nakit ödemede ekstra avantajlı fiyat. Her siparişte %5 Para Puan kazanırsınız. Düzenli kampanyalar mevcuttur." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
    ],
  },
  {
    slug: "samsun-petshop-fiyat-kampanya",
    type: "keyword",
    title: "Samsun Petshop Fiyat ve Kampanya",
    metaTitle: "Samsun Petshop Fiyat & Kampanya | En Uygun Fiyat İndirim | JETGO",
    metaDescription: "Samsun petshop fiyat ve kampanya. Mama fiyat, kedi kumu fiyat. Nakit ödemede indirim. %5 Para Puan. JETGO Samsun en uygun fiyat petshop.",
    keywords: "samsun petshop mama fiyat, samsun petshop kedi kumu fiyat, samsun petshop ucuz mama, samsun petshop en ucuz mama, samsun petshop uygun fiyat, samsun petshop indirim, samsun petshop kampanya, samsun petshop fırsat, atakum petshop mama fiyat, atakum petshop ucuz mama, atakum petshop indirim, atakum petshop kampanya, samsun petshop kedi kumu fiyat",
    h1: "Samsun Petshop Fiyat ve Kampanya - En Uygun Fiyat",
    intro: [
      "Samsun petshop fiyatlarında en uygun fiyat JETGO'dadır. Samsun petshop mama fiyat karşılaştırmasında nakit ödemede ekstra avantajlı fiyatlarımızla piyasanın en rekabetçi fiyatlarını sunuyoruz. Samsun petshop uygun fiyat arayanlar için doğru adres.",
      "Samsun petshop indirim ve samsun petshop kampanya fırsatlarını düzenli olarak güncelliyoruz. Samsun petshop ucuz mama arayanlar için büyük paketlerde kg başı en ekonomik fiyatlar sunuyoruz. Atakum petshop indirim ve atakum petshop kampanya avantajları da mevcuttur.",
      "Her siparişte %5 Para Puan kazanarak sonraki alışverişinizde ek tasarruf sağlayın. Yeni üye olan müşterilerimize 100 TL hoş geldin kuponu hediye ediyoruz. Samsun petshop fırsat avantajlarını kaçırmayın.",
    ],
    sections: [
      {
        h2: "Samsun Petshop Fiyat Avantajları",
        paragraphs: [
          "JETGO'da samsun petshop mama fiyat karşılaştırmasında nakit ödeme fiyatları piyasanın en uygun fiyatlarıdır. Samsun petshop kedi kumu fiyat karşılaştırmasında da uygun fiyat garantisi sunuyoruz. Atakum petshop mama fiyat ve atakum petshop kedi kumu fiyat aynı avantajlı fiyatlarla geçerlidir.",
          "Samsun petshop en ucuz mama seçenekleri olarak Reflex ve Pro Performance markaları kg başı en uygun fiyatlı mamalardır. Premium segmentte ise Royal Canin, Hill's ve N&D markaları piyasanın altında fiyatlarla sunulmaktadır.",
          "Minimum sipariş tutarı 500 TL, 1.500 TL üzeri ücretsiz kargo. Nakit ödemede ekstra avantajlı fiyat. %5 Para Puan kazanımı. 100 TL hoş geldin kuponu yeni üyelere hediye.",
        ],
      },
    ],
    faq: [
      { q: "Samsun petshop en ucuz mama nerede?", a: "JETGO nakit ödeme fiyatlarıyla Samsun'da en uygun mama fiyatlarını sunar. %5 Para Puan ile ekstra tasarruf." },
      { q: "Samsun petshop kampanya var mı?", a: "Evet, düzenli kampanyalar, indirimler ve özel fırsatlar mevcuttur. Yeni üyelere 100 TL hoş geldin kuponu hediye." },
      { q: "Samsun petshop fiyatları uygun mu?", a: "JETGO nakit ödeme fiyatları piyasanın en rekabetçi fiyatlarıdır. Büyük paketlerde kg başı daha ekonomik, %5 Para Puan ile ekstra avantaj." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Maması Fiyatları", href: "/samsun-kedi-mamasi-fiyatlari" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Kampanyalar", href: "/kampanya" },
    ],
  },
  {
    slug: "samsun-evcil-hayvan-magazasi",
    type: "keyword",
    title: "Samsun Evcil Hayvan Mağazası",
    metaTitle: "Samsun Evcil Hayvan Mağazası | Online Sipariş Kapıya Teslim | JETGO",
    metaDescription: "Samsun evcil hayvan mağazası online. Kedi, köpek, kuş, kemirgen ürünleri. 900+ ürün, premium markalar. Aynı gün kapıya teslim. JETGO Pet Shop.",
    keywords: "samsun hayvan mağazası, atakum hayvan mağazası, samsun evcil hayvan mağazası, evcil hayvan ürünleri samsun, evcil hayvan ürünleri atakum, evcil hayvan ihtiyaçları samsun, evcil hayvan beslenme samsun, evcil hayvan aksesuarları atakum, pet mağazası samsun, petshop tavsiye samsun",
    h1: "Samsun Evcil Hayvan Mağazası - Online & Kapıya Teslim",
    intro: [
      "Samsun'un en kapsamlı online evcil hayvan mağazası JETGO ile tanışın. Kedi, köpek, kuş ve kemirgen sahipleri için 900'den fazla ürün çeşidi sunuyoruz. Samsun hayvan mağazası, atakum hayvan mağazası arayanlar için JETGO en doğru adres.",
      "Geleneksel pet mağazalarından farklı olarak, JETGO'da tüm alışverişinizi online yapabilir ve aynı gün kapınıza teslim alabilirsiniz. Premium markalar, uygun fiyatlar ve kapıda ödeme kolaylığı. Evcil hayvan ihtiyaçları samsun arayanlar için tek adres.",
      "Mama, kum, aksesuar, bakım ürünleri, vitamin, ödül maması - evcil dostunuz için ne ararsanız JETGO'da bulun. Her siparişte %5 Para Puan kazanın. Evcil hayvan beslenme samsun, evcil hayvan aksesuarları atakum arayanlar hoş geldiniz.",
    ],
    sections: [
      {
        h2: "Samsun Evcil Hayvan Mağazası Ürün Çeşitleri",
        paragraphs: [
          "JETGO evcil hayvan mağazasında kedi ürünleri, köpek ürünleri, kuş ürünleri ve kemirgen ürünleri olmak üzere 4 ana kategori bulunmaktadır. Kedi bakım ürünleri samsun ve köpek bakım ürünleri atakum arayanlar için geniş ürün yelpazesi sunuyoruz.",
          "Kedi kategorisinde kuru mama, yaş mama, açık mama, kedi kumu, kedi tuvaleti, kedi taşıma, malt-vitamin, ödül ve bakım-sağlık ürünleri mevcut. Köpek kategorisinde kuru mama, yaş mama, ödül kemik, tuvalet malzemeleri, taşıma-kulübe ve bakım-sağlık ürünleri yer alıyor. Kuş ve kemirgen kategorilerinde yem, kafes, vitamin ve aksesuar ürünleri bulunmaktadır.",
        ],
      },
    ],
    faq: [
      { q: "Samsun'da evcil hayvan mağazası var mı?", a: "Evet, JETGO Samsun'un online evcil hayvan mağazasıdır. 900+ ürünü aynı gün kapınıza teslim ediyoruz." },
      { q: "Kuş yemi ve kemirgen ürünleri de var mı?", a: "Evet, kedi ve köpek ürünlerinin yanı sıra kuş yemi, kuş kafesi, kemirgen yemi ve aksesuarları da satıyoruz." },
      { q: "Samsun petshop tavsiye eder misiniz?", a: "JETGO, Samsun'un en kapsamlı kapıya teslim petshop'udur. 900+ ürün, premium markalar, uygun fiyat ve aynı gün teslimat." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Pet Aksesuar", href: "/pet-aksesuar" },
      { text: "Online Petshop", href: "/online-petshop-samsun" },
    ],
  },
  {
    slug: "samsun-kedi-mamasi-fiyatlari",
    type: "keyword",
    title: "Samsun Kedi Maması Fiyatları",
    metaTitle: "Samsun Kedi Maması Fiyatları 2025 - En Uygun Fiyat | JETGO Petshop",
    metaDescription: "Samsun kedi maması fiyatları. Royal Canin, Hill's, N&D, Pro Plan güncel fiyatlar. Nakit ödemede ekstra indirim. %5 Para Puan. JETGO kapıya teslim.",
    keywords: "samsun kedi maması fiyat, kedi maması fiyatları samsun, ucuz kedi maması samsun, kedi maması indirim samsun, atakum kedi maması fiyat",
    h1: "Samsun Kedi Maması Fiyatları 2025",
    intro: [
      "Samsun'da en uygun kedi maması fiyatlarını JETGO'da bulun. Nakit ödemede ekstra avantajlı fiyatlarımızla piyasanın en rekabetçi fiyatlarını sunuyoruz. Samsun kedi maması fiyat karşılaştırması için aşağıdaki listeyi inceleyin.",
      "Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan, Reflex Plus ve Profine gibi premium markaların güncel fiyatlarını karşılaştırın. 1,5 kg'dan 15 kg'a kadar tüm paket seçenekleri mevcut.",
      "Her siparişte %5 Para Puan kazanarak bir sonraki alışverişinizde ekstra tasarruf sağlayın. Büyük paketlerde kg başı daha ekonomik fiyatlar. Ucuz kedi maması samsun arayanlar için JETGO en doğru adres.",
    ],
    features: [
      "Royal Canin 2 kg: 650 - 850 TL",
      "Royal Canin 10 kg: 3.500 - 4.500 TL",
      "Hill's 3 kg: 900 - 1.400 TL",
      "N&D 1,5 kg: 700 - 1.100 TL",
      "Pro Plan 3 kg: 750 - 1.050 TL",
      "Reflex Plus 8 kg: 1.200 - 1.600 TL",
      "Profine 2 kg: 550 - 750 TL",
    ],
    faq: [
      { q: "Samsun'da en ucuz kedi maması nerede?", a: "JETGO Pet Shop nakit ödeme fiyatlarıyla Samsun'da en uygun kedi maması fiyatlarını sunmaktadır. %5 Para Puan ile ekstra tasarruf." },
      { q: "Samsun kedi maması indirim var mı?", a: "Nakit ödemede ekstra avantajlı fiyat. Her siparişte %5 Para Puan. Düzenli kampanya ve indirimler mevcut." },
      { q: "Atakum kedi maması fiyatları farklı mı?", a: "Hayır, JETGO tüm bölgelere aynı fiyat uygular. Nakit ödemede ekstra avantaj tüm bölgelerde geçerli." },
    ],
    internalLinks: [
      { text: "Kedi Maması Markaları", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "acil-kedi-mamasi-samsun",
    type: "keyword",
    title: "Acil Kedi Maması Samsun",
    metaTitle: "Acil Kedi Maması Samsun - Hızlı Teslimat | JETGO Petshop",
    metaDescription: "Kedi maması bitti mi? Samsun'da acil kedi maması teslimatı. Royal Canin, Hill's, N&D aynı gün kapınıza. Hızlı sipariş, hızlı teslimat. JETGO.",
    keywords: "acil kedi maması, kedi maması acil teslimat, kedi maması bitti, acil mama samsun, hızlı kedi maması teslimat",
    h1: "Acil Kedi Maması Teslimatı - Samsun",
    intro: [
      "Kedi maması bitti ve acil ihtiyacınız mı var? JETGO ile Samsun'da aynı gün kedi maması teslimatı yapıyoruz. Royal Canin, Hill's, N&D, Pro Plan ve Reflex kedi mamalarını hızla kapınıza getiriyoruz.",
      "Kedinizin açlığını bekletmeyin! jetgomarket.com üzerinden veya WhatsApp ile anında sipariş verin. Atakum, İlkadım ve Canik'e hızlandırılmış teslimat seçeneğimiz mevcuttur. Ortalama 1-2 saat içinde kapınızda.",
      "Yavru kedi maması, yetişkin kedi maması, kısırlaştırılmış kedi maması - hangi türü ararsanız arayın, stoklarımızda hazır. Acil siparişleriniz için öncelikli teslimat yapıyoruz.",
    ],
    faq: [
      { q: "Acil kedi maması ne kadar sürede gelir?", a: "Acil siparişler ortalama 1-2 saat içinde teslim edilir. Atakum sahil şeridine daha da hızlı ulaşıyoruz." },
      { q: "Gece kedi maması sipariş verebilir miyim?", a: "Sipariş 7/24 verilebilir. Gece verilen siparişler sabah ilk teslimat rotasında kapınıza ulaştırılır." },
      { q: "Acil sipariş ek ücret var mı?", a: "Acil siparişlerde standart teslimat ücreti uygulanır, ek ücret yoktur." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "En İyi Kedi Maması", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
    ],
  },
  {
    slug: "kopek-mamasi-hizli-teslim-samsun",
    type: "keyword",
    title: "Köpek Maması Hızlı Teslim Samsun",
    metaTitle: "Köpek Maması Hızlı Teslim Samsun - Aynı Gün Kapıda | JETGO",
    metaDescription: "Samsun'da köpek maması hızlı teslimat. 15 kg çuvalları taşımayın, biz getirelim. Royal Canin, Hill's, N&D, Pro Plan. Aynı gün kapıda ödeme. JETGO.",
    keywords: "köpek maması hızlı teslimat, köpek maması teslim samsun, büyük paket köpek maması teslimat, köpek maması kapıya teslim, samsun petshop mama sipariş",
    h1: "Köpek Maması Hızlı Teslim - Samsun",
    intro: [
      "15 kiloluk köpek maması çuvallarını taşımak zor! JETGO ile Samsun'da köpek maması siparişinizi kapınıza teslim ediyoruz. Royal Canin, Hill's, N&D, Pro Plan, Reflex ve Pro Performance markalarını stokta tutuyoruz.",
      "Büyük ırk köpek sahipleri için ağır paketlerin kapıya teslimi büyük kolaylık. Yavru köpek mamasından yetişkin köpek mamasına, hassas sindirimden kilo kontrolüne her ihtiyaca uygun mama mevcut.",
      "Nakit ödemede ekstra avantajlı fiyatlar sunuyoruz. Her siparişte %5 Para Puan kazanın. Samsun petshop mama sipariş ile kolay ve hızlı alışveriş.",
    ],
    faq: [
      { q: "15 kg köpek maması teslimat yapıyor musunuz?", a: "Evet, ağır paketler dahil tüm ürünlerimizi kapınıza, hatta apartman katınıza kadar teslim ediyoruz." },
      { q: "Köpek maması aynı gün gelir mi?", a: "Evet, saat 17:00'ye kadar verilen siparişler aynı gün teslim edilir." },
      { q: "Büyük paketlerde indirim var mı?", a: "Büyük paketler kg başı daha ekonomiktir. Nakit ödemede ekstra avantaj ve %5 Para Puan kazanırsınız." },
    ],
    internalLinks: [
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
    ],
  },
  {
    slug: "kedi-kumu-kapiya-teslim-samsun",
    type: "keyword",
    title: "Kedi Kumu Kapıya Teslim Samsun",
    metaTitle: "Kedi Kumu Kapıya Teslim Samsun | Ağır Kumu Biz Taşıyalım | JETGO",
    metaDescription: "Samsun'da kedi kumu kapıya teslim. Ağır bentonit kumu taşımayın, biz getirelim. Van Cat, Biokat's, Sanicat. Aynı gün teslimat, apartman katına kadar.",
    keywords: "kedi kumu kapıya teslim, kedi kumu teslimat samsun, kedi kumu sipariş, ağır kedi kumu teslimat, bentonit kum kapıya teslim, samsun kedi kumu kapıya teslim",
    h1: "Kedi Kumu Kapıya Teslim - Samsun",
    intro: [
      "10-20 kiloluk kedi kumu çuvallarını apartmanınıza taşımak çok zor! JETGO ile Samsun'da kedi kumunuzu kapınıza, hatta apartman katınıza kadar teslim ediyoruz. Ağır kaldırma derdi artık yok.",
      "Van Cat, Biokat's, Sanicat ve daha birçok marka bentonit, silika ve doğal kedi kumlarını geniş yelpazemizde bulabilirsiniz. Topaklanan, aktif karbonlu, aromalı ve ince taneli seçenekler mevcut.",
      "Düzenli kedi kumu siparişi için hatırlatma özelliğimizi kullanın. Kumunuz bitmeden önce sipariş verin. Nakit ödemede avantajlı fiyat, %5 Para Puan kazanımı.",
    ],
    faq: [
      { q: "Ağır kedi kumunu kapıya teslim ediyor musunuz?", a: "Evet! 10-20 kg kedi kumlarını dahil tüm ürünleri kapınıza kadar, apartman katınıza kadar teslim ediyoruz." },
      { q: "Kedi kumu kapıya teslim ücreti ne kadar?", a: "Teslimat ücreti mahallenize göre değişir. 1.500 TL üzeri siparişlerde kargo ücretsizdir." },
      { q: "En iyi kedi kumu hangisi?", a: "Topaklanan bentonit kumlar en çok tercih edilir. Van Cat aktif karbonlu ve Biokat's Bianco Fresh en popüler." },
    ],
    internalLinks: [
      { text: "Kedi Kumu Karşılaştırma", href: "/kedi-kumu-en-iyi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "mama-siparis-samsun",
    type: "keyword",
    title: "Mama Sipariş Samsun",
    metaTitle: "Mama Sipariş Samsun - Kedi Köpek Maması Online Sipariş | JETGO",
    metaDescription: "Samsun'da kedi ve köpek maması online sipariş. Royal Canin, Hill's, N&D en uygun fiyat. Aynı gün kapıya teslim, kapıda ödeme. JETGO Pet Shop.",
    keywords: "mama sipariş samsun, kedi maması sipariş, köpek maması sipariş, online mama sipariş, samsun petshop mama sipariş, samsun petshop whatsapp sipariş, samsun petshop telefon sipariş, atakum petshop mama sipariş",
    h1: "Samsun Mama Sipariş - Kedi & Köpek Maması Online",
    intro: [
      "Samsun'da kedi ve köpek maması sipariş etmek artık çok kolay! JETGO ile Royal Canin, Hill's, N&D, Pro Plan, Reflex ve daha birçok premium marka mamayı online sipariş verin, aynı gün kapınıza teslim edelim.",
      "Yavru mama, yetişkin mama, kısırlaştırılmış mama, diyet mama, hassas sindirim maması - her türü geniş ürün yelpazemizde bulabilirsiniz. Kuru mama, yaş mama ve ödül maması seçenekleri mevcut. WhatsApp ile de sipariş verebilirsiniz.",
      "Nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan kazanımı. Mama siparişinizi JETGO ile verin, hem tasarruf edin hem de kolaylıktan yararlanın. Samsun petshop whatsapp sipariş ile hızlı ve kolay.",
    ],
    faq: [
      { q: "Samsun'da mama sipariş nasıl verilir?", a: "jetgomarket.com adresinden ürünlerinizi sepete ekleyin, WhatsApp ile siparişinizi tamamlayın. WhatsApp: 0850 840 39 59." },
      { q: "Mama siparişi aynı gün gelir mi?", a: "Evet, saat 17:00'ye kadar verilen mama siparişleri aynı gün teslim edilir." },
      { q: "En ucuz mama siparişi nereden verilir?", a: "JETGO'da nakit ödeme fiyatları piyasanın en uygun fiyatlarıdır. %5 Para Puan ile ekstra tasarruf." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kapıya Teslim", href: "/kapiya-teslim-petshop-samsun" },
    ],
  },
  {
    slug: "petshop-delivery-samsun",
    type: "keyword",
    title: "Pet Shop Delivery Samsun",
    metaTitle: "Pet Shop Delivery Samsun | Getir Model Evcil Hayvan Teslimatı | JETGO",
    metaDescription: "Samsun pet shop delivery hizmeti. Getir modeli ile evcil hayvan ürünleri kapınıza. Kedi köpek maması, kedi kumu aynı gün teslimat. JETGO.",
    keywords: "petshop delivery samsun, pet shop teslimat, pet shop kurye samsun, evcil hayvan teslimat, petshop getir samsun",
    h1: "Pet Shop Delivery Samsun - Getir Model Teslimat",
    intro: [
      "JETGO, Samsun'un ilk Getir modeli pet shop delivery hizmetidir. Evcil hayvan ürünlerinizi tıpkı yemek siparişi verir gibi online sipariş verin, aynı gün kapınıza teslim edelim.",
      "Geleneksel pet shop'lara gidip ağır çuvalları taşımak yerine, JETGO'nun delivery hizmeti ile evcil dostunuzun tüm ihtiyaçlarını telefonunuzdan karşılayın. Sipariş, teslimat ve ödeme sürecinin tamamı kapınızda.",
      "Samsun'un Atakum, İlkadım ve Canik ilçelerindeki tüm mahallelere düzenli teslimat rotalarımız mevcuttur. 900'den fazla ürün, premium markalar ve rekabetçi fiyatlarla hizmetinizdeyiz.",
    ],
    faq: [
      { q: "Pet shop delivery ne demek?", a: "Pet shop delivery, evcil hayvan ürünlerinin online sipariş ile kapınıza teslim edilmesi hizmetidir. JETGO bu hizmeti Samsun'da sunmaktadır." },
      { q: "Delivery süresi ne kadar?", a: "Ortalama 1-3 saat içinde teslimat yapıyoruz. Konumunuza ve sipariş yoğunluğuna göre değişebilir." },
      { q: "Delivery ücretsiz mi?", a: "1.500 TL üzeri siparişlerde ücretsiz teslimat. Altındaki siparişlerde mahalle bazlı ücret uygulanır." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop-samsun" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
    ],
  },
  {
    slug: "atakum-kedi-kumu-kapiya-teslim",
    type: "keyword",
    title: "Atakum Kedi Kumu Kapıya Teslim",
    metaTitle: "Atakum Kedi Kumu Kapıya Teslim | Bentonit Silika Ağır Kumlar | JETGO",
    metaDescription: "Atakum'da kedi kumu kapıya teslim. Bentonit, silika, aktif karbonlu kedi kumu. Ağır kum çuvallarını taşımayın, JETGO kapınıza getirsin. Aynı gün teslimat.",
    keywords: "atakum kedi kumu, atakum kedi kumu kapıya teslim, atakum bentonit kedi kumu, atakum silika kedi kumu, atakum kedi kumu fiyat, kedi kumu atakum petshop",
    h1: "Atakum Kedi Kumu Kapıya Teslim - Ağır Kumları Biz Getiriyoruz",
    intro: [
      "Atakum'da kedi kumu taşıma derdi artık yok! JETGO olarak Van Cat, Biokat's ve Sanicat marka kedi kumlarını apartman katınıza kadar teslim ediyoruz. Bentonit, silika ve aktif karbonlu kum seçenekleri mevcut.",
      "Atakum'un tüm mahallelerine - Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan, Körfez, Altınkum ve diğer tüm mahallelere aynı gün kedi kumu teslimatı yapıyoruz. 10-20 kg ağır paketleri siz taşımayın.",
      "Atakum kedi kumu fiyatları 10 litrelik paketlerde 100-600 TL arasında değişmektedir. Nakit ödemede ekstra avantajlı fiyat. Her siparişte %5 Para Puan kazanın.",
    ],
    sections: [
      {
        h2: "Atakum'da En Çok Tercih Edilen Kedi Kumları",
        paragraphs: [
          "Atakum'da apartman dairelerinde yaşayan kedi sahipleri için aktif karbonlu bentonit kumlar en çok tercih edilen kum türüdür. Koku kontrolü sağlar ve topaklanma özelliği sayesinde temizliği kolaydır. Van Cat ince taneli aktif karbonlu kum bu kategorinin lideridir.",
          "Silika kedi kumları toz yapmaz ve uzun süre kullanılabilir. Biokat's ve Sanicat silika kumlar Atakum'daki müşterilerimiz arasında popülerdir. Aromalı kumlar lavanta, bebek pudrası ve mandalina kokularıyla mevcuttur.",
        ],
      },
    ],
    faq: [
      { q: "Atakum'a kedi kumu aynı gün teslim edilir mi?", a: "Evet, 17:00'ye kadar verilen siparişler Atakum'un tüm mahallelerine aynı gün teslim edilir." },
      { q: "Ağır kum paketlerini kata çıkarıyor musunuz?", a: "Evet, 10-20 kg kum paketlerini apartman katınıza kadar çıkarıyoruz." },
      { q: "Atakum'da en uygun kedi kumu hangisi?", a: "Van Cat aktif karbonlu bentonit kum fiyat-performans açısından en çok tercih edilen üründür." },
    ],
    internalLinks: [
      { text: "Kedi Kumu Çeşitleri", href: "/kedi-kumu" },
      { text: "Kedi Kumu Rehberi", href: "/kedi-kumu-en-iyi" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
    ],
  },
  {
    slug: "atakum-kedi-mamasi-kapiya-teslim",
    type: "keyword",
    title: "Atakum Kedi Maması Kapıya Teslim",
    metaTitle: "Atakum Kedi Maması Kapıya Teslim | Royal Canin Hill's N&D | JETGO",
    metaDescription: "Atakum'da kedi maması kapıya teslim. Royal Canin, Hill's, N&D, Pro Plan kedi maması aynı gün teslimat. Yavru, yetişkin, kısır kedi maması. JETGO.",
    keywords: "atakum kedi maması, atakum kedi maması kapıya teslim, atakum kedi maması fiyat, atakum royal canin kedi, atakum hills kedi maması, atakum proplan kedi maması, atakum premium kedi maması",
    h1: "Atakum Kedi Maması Kapıya Teslim - Premium Markalar",
    intro: [
      "Atakum'da kedi maması arayanlar için JETGO, Royal Canin, Hill's, N&D, Pro Plan ve Reflex gibi tüm premium markaları aynı gün kapıya teslim ediyor. 1,5 kg'dan 15 kg'a kadar tüm paket boyutları mevcut.",
      "Atakum'un Denizevleri, Güzelyalı, Kurupelit, Atakent, Altınkum ve tüm mahallelerine kedi maması teslimatı yapıyoruz. Yavru kedi maması, yetişkin kedi maması, kısırlaştırılmış kedi maması ve özel diyet mamaları stokta.",
      "Atakum kedi maması fiyatlarında nakit ödemede ekstra avantaj sunuyoruz. Her siparişte %5 Para Puan kazanın ve bir sonraki alışverişinizde kullanın.",
    ],
    sections: [
      {
        h2: "Atakum'da Kedi Maması Markaları",
        paragraphs: [
          "Atakum'da en çok tercih edilen kedi maması markaları Royal Canin, Hill's Science Plan, N&D Farmina, Pro Plan ve Reflex Plus'tır. Her markanın yavru (kitten), yetişkin (adult), kısırlaştırılmış (sterilised), hassas sindirim (sensitive) ve indoor formülleri mevcuttur.",
          "Açık mama seçeneği ile kedinizin beğendiği mamayı gramajlı olarak da satın alabilirsiniz. Farklı markaları test etmek veya bütçenize uygun miktarda almak için açık mama idealdir.",
        ],
      },
    ],
    faq: [
      { q: "Atakum'a kedi maması aynı gün teslim edilir mi?", a: "Evet, 17:00'ye kadar verilen siparişler Atakum'un tüm mahallelerine aynı gün teslim edilir." },
      { q: "Atakum'da en uygun kedi maması fiyatı nerede?", a: "JETGO nakit ödeme fiyatlarıyla Atakum'da en uygun kedi maması fiyatlarını sunar. %5 Para Puan ile ekstra tasarruf." },
      { q: "Kısır kedi maması Atakum'da var mı?", a: "Evet, Royal Canin Sterilised, Hill's Sterilised, Pro Plan Sterilised ve daha birçok kısır kedi maması JETGO'da stokta." },
    ],
    internalLinks: [
      { text: "Kedi Maması Markaları", href: "/kedi-mamasi" },
      { text: "En İyi Kedi Maması", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kedi Kumu Atakum", href: "/atakum-kedi-kumu-kapiya-teslim" },
    ],
  },
  {
    slug: "atakum-kopek-mamasi-kapiya-teslim",
    type: "keyword",
    title: "Atakum Köpek Maması Kapıya Teslim",
    metaTitle: "Atakum Köpek Maması Kapıya Teslim | 15 kg Çuval Kapınıza | JETGO",
    metaDescription: "Atakum'da köpek maması kapıya teslim. 15 kg çuval mamaları apartman katınıza getiriyoruz. Royal Canin, Hill's, N&D, Pro Plan. JETGO Pet Shop.",
    keywords: "atakum köpek maması, atakum köpek maması kapıya teslim, atakum köpek maması fiyat, atakum royal canin köpek, atakum hills köpek maması, atakum 15 kg köpek maması",
    h1: "Atakum Köpek Maması Kapıya Teslim - Ağır Çuvalları Biz Getiriyoruz",
    intro: [
      "Atakum'da köpek maması arayanlar için JETGO, Royal Canin, Hill's, N&D, Pro Plan, Reflex ve Pro Performance gibi tüm markaları kapıya teslim ediyor. 12-18 kg ağır çuvalları apartman katınıza kadar çıkarıyoruz.",
      "Atakum'un tüm mahallelerine köpek maması teslimatı yapıyoruz. Yavru, yetişkin, yaşlı, küçük ırk, büyük ırk ve özel diyet köpek mamaları stokta. Ağır mama çuvallarını taşıma derdi yok.",
      "Atakum köpek maması fiyatlarında nakit ödemede ekstra avantajlı fiyat. 12-18 kg paketlerde 1.800-7.000 TL arası. %5 Para Puan ile tasarruf edin.",
    ],
    faq: [
      { q: "15 kg köpek maması Atakum'a teslim ediliyor mu?", a: "Evet, 15-18 kg ağır çuvalları Atakum'un tüm mahallelerine, apartman katınıza kadar teslim ediyoruz." },
      { q: "Atakum'da en ucuz köpek maması nerede?", a: "JETGO nakit ödeme fiyatlarıyla en uygun fiyatları sunar. Reflex ve Pro Performance ekonomik seçeneklerdir." },
      { q: "Büyük ırk köpek maması Atakum'da var mı?", a: "Evet, Royal Canin Maxi, Hill's Large Breed ve N&D büyük ırk formülleri stokta. Aynı gün teslimat." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Köpek Uygun Çuval", href: "/samsun-kopek-uygun-cuval-mama" },
    ],
  },
  {
    slug: "atakum-kus-yemi-kafes",
    type: "keyword",
    title: "Atakum Kuş Yemi ve Kafesi",
    metaTitle: "Atakum Kuş Yemi Kafesi Kapıya Teslim | Muhabbet Kanarya | JETGO",
    metaDescription: "Atakum'da kuş yemi ve kafesi kapıya teslim. Muhabbet kuşu, kanarya, papağan yemi ve kafesi. Vitamin, aksesuar. JETGO Pet Shop Samsun.",
    keywords: "atakum kuş yemi, atakum kuş kafesi, atakum muhabbet kuşu yemi, atakum kanarya yemi, atakum papağan yemi, atakum kuş vitamini, atakum kuş aksesuarı",
    h1: "Atakum Kuş Yemi ve Kafesi Kapıya Teslim",
    intro: [
      "Atakum'da kuş yemi, kuş kafesi, kuş vitamini ve kuş aksesuarlarını JETGO kapınıza teslim ediyor. Muhabbet kuşu, kanarya, sultan papağanı ve papağan türleri için özel yemler mevcut.",
      "Atakum'un tüm mahallelerine kuş ürünleri teslimatı yapıyoruz. Kuş kafesi, tünek, yemlik, suluk, banyoluk ve oyuncak gibi aksesuarlar da ürün yelpazemizde yer alıyor.",
      "Atakum kuş yemi fiyatları 50-300 TL arasında, kuş kafesi fiyatları 150-2.000 TL arasında değişmektedir. Nakit ödemede avantajlı fiyat.",
    ],
    faq: [
      { q: "Atakum'da kuş yemi nereden alınır?", a: "JETGO petshop'ta muhabbet, kanarya, papağan ve tüm kuş türleri için yem mevcuttur. Kapıya teslim." },
      { q: "Atakum'a kuş kafesi teslim ediliyor mu?", a: "Evet, tüm kuş kafesi modellerini Atakum'un her mahallesine kapıya teslim ediyoruz." },
      { q: "Kuş vitamini Atakum'da var mı?", a: "Evet, tüy dökümü vitamini, multivitamin ve mineral takviye ürünleri JETGO'da mevcut." },
    ],
    internalLinks: [
      { text: "Kuş Yemi", href: "/samsun-kus-yemi" },
      { text: "Kuş Kafesi", href: "/samsun-kus-kafesi" },
      { text: "Kuş Vitamini", href: "/samsun-kus-vitamini" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
    ],
  },
  {
    slug: "atakum-kemirgen-urunleri",
    type: "keyword",
    title: "Atakum Kemirgen Ürünleri",
    metaTitle: "Atakum Kemirgen Ürünleri | Hamster Tavşan Yemi Kafes | JETGO Petshop",
    metaDescription: "Atakum'da kemirgen ürünleri kapıya teslim. Hamster yemi, tavşan yemi, guinea pig yemi, kemirgen kafesi ve aksesuar. JETGO Pet Shop Samsun.",
    keywords: "atakum kemirgen ürünleri, atakum hamster yemi, atakum tavşan yemi, atakum guinea pig, atakum kemirgen kafesi, atakum hamster kafesi",
    h1: "Atakum Kemirgen Ürünleri Kapıya Teslim",
    intro: [
      "Atakum'da hamster, tavşan, guinea pig ve chinchilla ürünlerini JETGO kapınıza teslim ediyor. Kemirgen yemi, kafes, vitamin ve aksesuar çeşitleri mevcut.",
      "Kemirgen sahiplerinin ihtiyacı olan tüm ürünler - yem, kafes, koşu çarkı, yuva, altlık, kemirme taşı ve vitamin takviyeleri Atakum'un tüm mahallelerine aynı gün teslim edilmektedir.",
      "Atakum kemirgen ürünleri fiyatlarında nakit ödemede avantajlı fiyat ve %5 Para Puan kazanımı geçerlidir.",
    ],
    faq: [
      { q: "Atakum'da hamster yemi nereden alınır?", a: "JETGO petshop'ta hamster, tavşan ve guinea pig yemleri mevcuttur. Atakum'a kapıya teslim." },
      { q: "Kemirgen kafesi Atakum'a teslim ediliyor mu?", a: "Evet, tüm kemirgen kafesi modellerini Atakum'a kapıya teslim ediyoruz." },
      { q: "Hamster koşu çarkı Atakum'da var mı?", a: "Evet, koşu çarkı, tünel, yuva ve tüm hamster aksesuarları JETGO'da mevcut." },
    ],
    internalLinks: [
      { text: "Kemirgen Yemi", href: "/samsun-kemirgen-yemi" },
      { text: "Kemirgen Kafesi", href: "/samsun-kemirgen-kafesi" },
      { text: "Kemirgen Vitamin", href: "/samsun-kemirgen-vitamin" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
    ],
  },
  {
    slug: "atakum-petshop-ayni-gun-teslimat",
    type: "keyword",
    title: "Atakum Pet Shop Aynı Gün Teslimat",
    metaTitle: "Atakum Petshop Aynı Gün Teslimat | 1-3 Saat Kapıya Teslim | JETGO",
    metaDescription: "Atakum'da aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu siparişleriniz 1-3 saat içinde kapınızda. JETGO Pet Shop Samsun.",
    keywords: "atakum petshop aynı gün teslimat, atakum petshop hızlı teslimat, atakum evcil hayvan teslimat, atakum petshop kapıya teslim, atakum mama teslimat, atakum kedi kumu teslimat",
    h1: "Atakum Petshop Aynı Gün Teslimat - 1-3 Saat İçinde Kapınızda",
    intro: [
      "Kedinizin maması bitti, kumu azaldı mı? JETGO ile Atakum'da aynı gün teslimat! Siparişleriniz ortalama 1-3 saat içinde kapınızda. 17:00'ye kadar verilen siparişler aynı gün teslim edilir.",
      "Atakum'un Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan, Körfez, Altınkum, Yeni Mahalle ve tüm diğer mahallelerine düzenli teslimat rotalarımız bulunmaktadır. Getir modeli hızlı teslimat hizmetimizle mağazaya gitmenize gerek yok.",
      "Ağır mama çuvalları ve kedi kumu paketlerini arabanıza yüklemek, merdiven çıkarmak zorunda değilsiniz. JETGO kuryeleri siparişinizi apartman katınıza kadar çıkarır. Kapıda nakit, POS ve QR ödeme seçenekleri mevcut.",
    ],
    sections: [
      {
        h2: "Atakum Teslimat Nasıl Çalışır?",
        paragraphs: [
          "jetgomarket.com adresinden veya WhatsApp ile sipariş verin. Siparişiniz anında onaylanır ve teslimat sürecine alınır. Atakum merkez mahallelerine (Denizevleri, Güzelyalı, Kurupelit, Atakent) 1-2 saat, diğer mahallelere 2-3 saat içinde teslimat yapılır.",
          "Sesli sipariş seçeneği ile WhatsApp üzerinden sesli mesaj göndererek de sipariş verebilirsiniz. Yaşlı veya meşgul müşterilerimiz için bu seçenek büyük kolaylık sağlamaktadır.",
        ],
      },
      {
        h2: "Atakum Teslimat Avantajları",
        paragraphs: [
          "JETGO'nun Atakum teslimat hizmetinin avantajları: ağır ürünleri taşımak yok, mağazaya gitmek yok, trafikte vakit kaybetmek yok. Üstelik online fiyat karşılaştırma yapabilir, ürün detaylarını okuyabilir ve favori listenizi oluşturabilirsiniz.",
          "1.500 TL üzeri siparişlerde ücretsiz teslimat. Her siparişte %5 Para Puan kazanımı. Son siparişinizi tek tıkla tekrarlama özelliği ile düzenli alışverişleriniz daha da pratik.",
        ],
      },
    ],
    features: [
      "Aynı gün teslimat garantisi (17:00'ye kadar)",
      "Ortalama 1-3 saat teslimat süresi",
      "Ağır ürünler kata çıkarılır",
      "Kapıda nakit, POS, QR ödeme",
      "WhatsApp ile kolay ve sesli sipariş",
      "1.500 TL üzeri ücretsiz teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Atakum'a teslimat ne kadar sürer?", a: "Atakum merkez mahallelerine 1-2 saat, dış mahallelere 2-3 saat. Sipariş yoğunluğuna göre değişebilir." },
      { q: "Hafta sonu Atakum'a teslimat var mı?", a: "Evet, haftanın her günü 09:00-21:00 arası sipariş alıyoruz ve aynı gün teslimat yapıyoruz." },
      { q: "Atakum teslimat ücreti ne kadar?", a: "1.500 TL üzeri siparişlerde ücretsiz. Altında mahalle bazlı kargo ücreti uygulanır." },
      { q: "Akşam saatlerinde Atakum'a teslimat yapılır mı?", a: "17:00'ye kadar verilen siparişler aynı gün teslim edilir. Sonrasında ertesi gün teslimat planlanır." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop-samsun" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "atakum-en-yakin-petshop",
    type: "keyword",
    title: "Atakum En Yakın Pet Shop",
    metaTitle: "Atakum En Yakın Petshop | Kapıya Teslim Mağazaya Gitmeye Gerek Yok | JETGO",
    metaDescription: "Atakum'da en yakın petshop aramayın, JETGO kapınıza gelsin! Kedi köpek maması, kedi kumu aynı gün teslimat. Her mahallede hizmet. JETGO Pet Shop.",
    keywords: "atakum en yakın petshop, atakum yakın pet shop, atakum petshop nerede, atakum petshop açık mı, atakum petshop telefon, atakum evcil hayvan mağazası, en yakın pet shop atakum",
    h1: "Atakum En Yakın Petshop - JETGO Kapınıza Gelir",
    intro: [
      "Atakum'da en yakın petshop'u aramayın, JETGO zaten kapınıza geliyor! Getir modeli kapıya teslim hizmetimizle hangi mahallede olursanız olun, evcil hayvan ürünleriniz aynı gün kapınızda.",
      "Geleneksel pet shop'a gitmenize, trafikte vakit kaybetmenize, otopark aramanıza ve ağır çuvalları taşımanıza gerek yok. JETGO'da online sipariş verin veya WhatsApp'tan yazın, kuryelimiz 1-3 saat içinde kapınızda olsun.",
      "Atakum'un 28 mahallesine hizmet veriyoruz. Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan, Körfez, Altınkum, Yeni Mahalle, Balaç, Çakırlar, Soğuksu, Taflan ve diğer tüm mahallelere teslimat.",
    ],
    sections: [
      {
        h2: "Neden Mağazaya Gitmek Yerine JETGO?",
        paragraphs: [
          "JETGO kapıya teslim petshop hizmeti, Atakum'daki geleneksel pet shop'lara göre birçok avantaj sunar: fiyatları online karşılaştırabilirsiniz, ürün bilgilerini detaylıca okuyabilirsiniz, ağır ürünleri taşımak zorunda kalmazsınız ve kapıda ödeme yaparsınız.",
          "900'den fazla ürün çeşidi ile Atakum'daki herhangi bir fiziksel mağazadan daha geniş ürün yelpazesi sunuyoruz. Kedi maması, köpek maması, kedi kumu, kuş yemi, kemirgen yemi, bakım ürünleri ve aksesuarlar tek adreste.",
        ],
      },
    ],
    faq: [
      { q: "Atakum'da petshop var mı?", a: "JETGO, Atakum'un tüm mahallelerine kapıya teslim petshop hizmeti sunmaktadır. Mağazaya gitmenize gerek yok." },
      { q: "Atakum petshop açık mı?", a: "JETGO her gün 09:00-21:00 arası hizmet vermektedir. Online sipariş 7/24 verilebilir." },
      { q: "Atakum petshop telefon numarası nedir?", a: "JETGO Pet Shop telefon: 0850 840 39 59. WhatsApp ile de sipariş ve iletişim kurabilirsiniz." },
      { q: "Atakum'da en ucuz petshop hangisi?", a: "JETGO nakit ödeme fiyatlarıyla Atakum'da en uygun petshop fiyatlarını sunar. %5 Para Puan ile ekstra tasarruf." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Atakum Aynı Gün Teslimat", href: "/atakum-petshop-ayni-gun-teslimat" },
      { text: "Atakum Mahalleler", href: "/atakum-mahalleler" },
      { text: "En Yakın Petshop Samsun", href: "/en-yakin-petshop-samsun" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },
  {
    slug: "atakum-petshop-kapida-odeme",
    type: "keyword",
    title: "Atakum Petshop Kapıda Ödeme",
    metaTitle: "Atakum Petshop Kapıda Ödeme | Nakit POS QR | JETGO Pet Shop Samsun",
    metaDescription: "Atakum'da petshop kapıda ödeme. Nakit, POS ile kredi kartı, QR kod ödeme. EFT ve havale de kabul ediyoruz. Nakit ödemede avantajlı fiyat. JETGO.",
    keywords: "atakum petshop kapıda ödeme, atakum petshop nakit ödeme, atakum petshop kredi kartı, atakum petshop pos, atakum petshop qr ödeme, atakum evcil hayvan kapıda ödeme",
    h1: "Atakum Petshop Kapıda Ödeme - Nakit, POS, QR",
    intro: [
      "Atakum'da JETGO petshop'ta online sipariş verin, kapıda ödeyin! Nakit, POS ile kredi kartı, QR kod ödeme ve banka havalesi seçenekleri mevcuttur. Nakit ödemede ekstra avantajlı fiyat uyguluyoruz.",
      "Ön ödeme veya kredi kartı bilginizi paylaşma zorunluluğu yok. Siparişiniz kapınıza geldiğinde, ürünleri kontrol edin ve ödemenizi kapıda yapın. Güvenli alışveriş garantisi.",
      "Atakum'un tüm mahallelerine kapıda ödeme ile teslimat yapıyoruz. Her siparişte %5 Para Puan kazanın ve birikmiş puanlarınızı bir sonraki alışverişinizde kullanın.",
    ],
    faq: [
      { q: "Atakum'da petshop kapıda ödeme var mı?", a: "Evet, JETGO tüm siparişlerde kapıda ödeme kabul eder. Nakit, POS ve QR ödeme seçenekleri mevcuttur." },
      { q: "Nakit ödeme avantajı nedir?", a: "Nakit ödemede ürünlerde ekstra avantajlı fiyat uygulanır. Tüm ürünlerde nakit ve kredi kartı fiyatı ayrı belirtilir." },
      { q: "Kapıda kredi kartı ile ödeme yapılır mı?", a: "Evet, kuryelimiz yanında POS cihazı taşır. Kapıda kredi kartı ile ödeme yapabilirsiniz." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Atakum Aynı Gün Teslimat", href: "/atakum-petshop-ayni-gun-teslimat" },
      { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "atakum-petshop-whatsapp-siparis",
    type: "keyword",
    title: "Atakum Petshop WhatsApp Sipariş",
    metaTitle: "Atakum Petshop WhatsApp Sipariş | Sesli Sipariş Kolay Alışveriş | JETGO",
    metaDescription: "Atakum'da WhatsApp ile petshop siparişi. Sesli mesajla sipariş verin, aynı gün kapınıza teslim. Kolay, hızlı, pratik. JETGO Pet Shop Samsun.",
    keywords: "atakum petshop whatsapp, atakum petshop whatsapp sipariş, atakum petshop sesli sipariş, atakum petshop kolay sipariş, atakum mama siparişi whatsapp",
    h1: "Atakum Petshop WhatsApp Sipariş - Kolay ve Hızlı",
    intro: [
      "Atakum'da evcil hayvan ürünleri siparişi artık çok kolay! WhatsApp'tan mesaj yazın veya sesli mesaj gönderin, siparişiniz aynı gün kapınızda. Internet alışverişi ile uğraşmak istemeyenler için ideal.",
      "JETGO WhatsApp sipariş hattından 'Kedinizin maması Royal Canin 10 kg istiyorum' yazmanız veya sesli mesaj göndermeniz yeterli. Siparişiniz hazırlanır ve Atakum adresinize teslim edilir.",
      "Yaşlı müşterilerimiz, internet alışverişine aşina olmayanlar veya hızlıca sipariş vermek isteyenler için WhatsApp sipariş büyük kolaylık sağlamaktadır.",
    ],
    faq: [
      { q: "WhatsApp ile nasıl sipariş verilir?", a: "JETGO WhatsApp hattına ürün adı ve miktarını yazın veya sesli mesaj gönderin. Siparişiniz onaylanır ve aynı gün teslim edilir." },
      { q: "Sesli sipariş nasıl çalışır?", a: "WhatsApp'tan sesli mesaj göndererek sipariş verebilirsiniz. 'Royal Canin kedi maması 10 kg ve Van Cat kum istiyorum' gibi söyleyin." },
      { q: "WhatsApp sipariş 7/24 mı?", a: "WhatsApp mesajı 7/24 gönderebilirsiniz. Siparişler çalışma saatlerinde (09:00-21:00) işleme alınır." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Atakum Aynı Gün Teslimat", href: "/atakum-petshop-ayni-gun-teslimat" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "JETGO Petshop", href: "/jetgo-petshop" },
    ],
  },

  // ============ KAPSAMLI LOCAL SEO LANDING PAGES (2026 hub) ============
  // Kısa-form ürün/ilçe varyasyonları
  {
    slug: "atakum-kedi-mamasi",
    type: "keyword",
    title: "Atakum Kedi Maması",
    metaTitle: "Atakum Kedi Maması | Aynı Gün Teslimat | JETGO Pet",
    metaDescription: "Atakum'da kedi maması siparişi için JETGO aynı gün teslimat, kapıda ödeme ve güvenilir ürün avantajı sunar. Yavru, yetişkin, kısırlaştırılmış, tahılsız ve premium markalar.",
    keywords: "atakum kedi maması, atakum kedi mama siparişi, atakum yavru kedi maması, atakum kısırlaştırılmış kedi maması, atakum tahılsız mama, atakum premium kedi maması, samsun atakum kedi mama",
    h1: "Atakum Kedi Maması – Aynı Gün Teslimat",
    intro: [
      "Atakum'da kedi maması arıyorsanız, JETGO Pet olarak farklı yaş ve ihtiyaçlara uygun mama seçeneklerini hızlı teslimatla sunuyoruz. Yavru kedi maması, yetişkin kedi maması, kısırlaştırılmış kedi maması, tahılsız kedi maması ve premium markalar için Atakum'un farklı mahallelerine aynı gün teslimat sağlıyoruz.",
      "Mağazamız Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A adresinde olup, Atakum sahili boyunca Denizevleri'nden Cumhuriyet'e, içeride Mimar Sinan ve Körfez'e kadar tüm bölgeye düzenli rotalarla kurye çıkarıyoruz. Tüm mama paketlerimizin son kullanma tarihini sistemimiz üzerinden takip ediyor, SKT'si yakın ürünleri ayrı bölümde indirimli sunuyoruz.",
      "Sipariş için ürünleri seçin, sepete ekleyin, üye ol veya WhatsApp üzerinden tamamlayın. Atakum içi siparişler genellikle 1–2 saat içinde elinizde olur. Kapıda nakit (%5 indirimli), POS ile kart, QR ödeme ve havale/EFT seçenekleri mevcuttur.",
    ],
    sections: [
      {
        h2: "Atakum'da Hangi Mahallelere Kedi Maması Teslim Ediyoruz?",
        paragraphs: [
          "JETGO Pet, Atakum merkez başta olmak üzere Denizevleri, Körfez, Mimar Sinan, Yeni Mahalle, Altınkum, Güzelyalı, Taflan, Kurupelit, Atakent ve çevre mahallelere düzenli kedi maması teslimatı yapar. Sahil şeridindeki adreslere ortalama 60–90 dakika, iç mahallelerde 90–120 dakika içinde teslim ediyoruz.",
          "Saat 18:00'a kadar verilen siparişler aynı gün içinde teslim edilir; sonrasındaki siparişler ertesi sabah ilk rotalardan biriyle yola çıkar. Atakum dışına teslimat yapmıyoruz; bu sayede teslimat süremizi 1–2 saatte tutuyor, mamanın transit süresini kısaltıyoruz.",
        ],
        list: [
          "Denizevleri & sahil şeridi — sahile yakın siteler için öncelikli rota",
          "Mimar Sinan, Körfez, İncesu — iç bölgelere doğrudan teslimat",
          "Yeni Mahalle, Cumhuriyet, Esenevler — merkez teslimat",
          "Kurupelit, Atakent — OMÜ ve çevresi",
          "Taflan, Soğuksu, Çakırlar — çevre mahalleler",
        ],
      },
      {
        h2: "Atakum'da En Çok Tercih Edilen Kedi Maması Türleri",
        paragraphs: [
          "Yavru kedi maması (kitten): 2–12 ay arası yavrularda hızlı büyüme için yüksek protein. Royal Canin Kitten, Pro Plan Junior, Hill's Science Plan Kitten gibi seçenekler stoklarımızdadır.",
          "Yetişkin kedi maması (adult): 1 yaş üzeri sağlıklı kediler için dengeli formüller. Pronature Original, N&D, Reflex Plus, ProChoice gibi farklı bütçelere uygun markalar mevcut.",
          "Kısırlaştırılmış kedi maması (sterilised): kilo kontrolü ve idrar yolu sağlığı için düşük yağ-yüksek lif. Royal Canin Sterilised, Hill's Sterilised serileri Atakum'da en çok satan kategorimiz.",
          "Tahılsız kedi maması (grain-free): hassas sindirim ve alerji için tahıl içermeyen formüller. N&D Grain Free, Reflex Plus Grain Free seçeneklerimiz Atakum müşterilerinin favorisi.",
          "Hassas sindirim formülleri: kusma, ishal, hassas mide şikâyetleri için Sensitive serileri.",
        ],
      },
      {
        h2: "Neden JETGO Pet Atakum?",
        paragraphs: [
          "Atakum'daki yerel mağazamızdan çıkan tüm mama paketlerinde son kullanma tarihi kontrolünden geçirilir. Sistemimiz SKT'si yakın bir ürünü siparişe eklemenize izin vermez; bu sayede tazelik garantisi sunarız. Açılmamış kedi maması için 14 gün iade hakkınız vardır.",
          "Her siparişte %5 Para Puan kazanırsınız; sonraki alışverişlerinizde indirim olarak kullanırsınız. Yeni üyelere 100 TL hoş geldin kuponu sunuyoruz. Askıda Mama bölümünden sokak hayvanlarına bağışta bulunabilir, gönüllü besleme programımıza destek olabilirsiniz.",
        ],
      },
    ],
    features: [
      "Atakum içine 1–2 saat aynı gün teslimat",
      "Royal Canin, Hill's, Pro Plan, N&D, Reflex, Pronature stoğu",
      "SKT kontrollü mama paketleri",
      "Kapıda nakitte %5 indirim",
      "Akıllı mama hesaplama: bir paket kaç gün gider?",
      "Açılmamış mamada 14 gün iade hakkı",
    ],
    mahalleler: ["Denizevleri", "Körfez", "Mimar Sinan", "Yeni Mahalle", "Altınkum", "Güzelyalı", "Taflan", "Cumhuriyet", "Esenevler", "Kurupelit"],
    faq: [
      { q: "Atakum'da aynı gün kedi maması teslimatı var mı?", a: "Evet. Saat 18:00'a kadar verilen tüm Atakum içi siparişleri aynı gün, ortalama 1–2 saat içinde teslim ediyoruz. Sonraki siparişler ertesi sabah ilk rotalardan biriyle gönderilir." },
      { q: "Atakum'da kapıda ödeme yapabiliyor muyum?", a: "Evet. Atakum içi tüm siparişlerde kapıda nakit (%5 indirimli), POS cihazı ile kredi/banka kartı ve QR ödeme alıyoruz. Havale/EFT seçeneği de aktiftir." },
      { q: "Hangi kedi maması markaları Atakum'da bulunur?", a: "Royal Canin, Hill's Science Plan, Pro Plan, N&D Farmina, Reflex Plus, Pronature Original, ProChoice, Felicia ve Brit gibi 15+ marka stoklarımızda hazırdır." },
      { q: "Geç saatlerde sipariş verilebilir mi?", a: "Online sipariş hattımız 7/24 açıktır; ancak aynı gün teslimat için son kabul saati 18:00'dır. Sonrasındaki siparişler ertesi sabah ilk rotalarda teslim edilir." },
      { q: "Hangi mahallelere teslimat yapıyorsunuz?", a: "Atakum'un tüm mahallelerine teslimat yapıyoruz: Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan, Körfez, Yeni Mahalle, Altınkum, Balaç, Çakırlar, Soğuksu, Taflan, Çobanlı, Büyükoyumca, Esenevler, Cumhuriyet ve daha fazlası." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
      { text: "Samsun Kedi Maması", href: "/samsun-petshop-kedi-mamasi" },
      { text: "Atakum Aynı Gün Teslimat", href: "/atakum-petshop-ayni-gun-teslimat" },
      { text: "Atakum Yavru Kedi Maması", href: "/atakum-yavru-kedi-mamasi" },
      { text: "Atakum Tahılsız Mama", href: "/atakum-tahilsiz-mama" },
      { text: "Mağaza & Konum", href: "/magaza" },
    ],
  },

  {
    slug: "atakum-kopek-mamasi",
    type: "keyword",
    title: "Atakum Köpek Maması",
    metaTitle: "Atakum Köpek Maması | Kapıda Ödeme & Aynı Gün Teslimat | JETGO Pet",
    metaDescription: "Atakum'da köpek maması: yavru, yetişkin, büyük ırk, küçük ırk ve hipoalerjenik formüller. Aynı gün teslimat, kapıda ödeme, premium markalar. JETGO Pet Atakum.",
    keywords: "atakum köpek maması, atakum köpek mama siparişi, atakum yavru köpek maması, atakum büyük ırk köpek maması, atakum proplan, atakum royal canin, samsun atakum köpek mama",
    h1: "Atakum Köpek Maması – Eve Teslim, Kapıda Ödeme",
    intro: [
      "Atakum'da köpek maması ihtiyacınızı tek seferde, ağır çuvalı taşımadan karşılayın. JETGO Pet olarak yavru köpek maması, yetişkin köpek maması, büyük ırk köpek maması, küçük ırk formülleri ve hipoalerjenik (tahılsız) seçenekleri Atakum'daki adresinize aynı gün teslim ediyoruz.",
      "10–20 kg arası büyük çuvalları kurye ekibimiz kapınıza kadar getirir; siz kasanın başında değilsiniz, kuryeniz değil. Atakum sahil şeridinden iç mahallelere kadar tüm bölgede aktif teslimat rotamız var. Ürünlerin SKT'si sistem tarafından kontrol edilir, sadece taze parti satışa açılır.",
      "Royal Canin, Hill's, Pro Plan, N&D, Reflex, Pro Performance, Econature ve Brit gibi 15+ marka stoğumuzda. Kapıda nakitte %5 indirim, POS ile kart, QR ödeme veya havale/EFT seçenekleriyle istediğiniz şekilde ödeyin.",
    ],
    sections: [
      {
        h2: "Atakum'da Hangi Bölgelere Köpek Maması Teslim Ediyoruz?",
        paragraphs: [
          "Atakum'un tüm mahallelerine teslimat yapıyoruz: Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan, Körfez, Yeni Mahalle, Altınkum, Cumhuriyet, Esenevler, Taflan, Soğuksu, Çakırlar, Balaç, Büyükoyumca, Çobanlı, Kozaağaç, Mecidiye ve çevre mahalleler.",
          "Atakum içi ortalama teslimat süresi 60–120 dakikadır. Saat 18:00'a kadar verilen siparişler aynı gün, sonrası ertesi sabah teslim edilir. Büyük çuval (15 kg+) siparişlerinde kurye merdivenden taşıma yardımı sağlar.",
        ],
      },
      {
        h2: "Atakum'da En Çok Tercih Edilen Köpek Maması Türleri",
        paragraphs: [
          "Yavru köpek maması (puppy/junior): 2–12 ay arası gelişim için yüksek protein ve DHA. Pro Plan Puppy, Royal Canin Mini/Maxi Puppy, Hill's Science Plan Puppy.",
          "Yetişkin köpek maması (adult): 1 yaş üzeri dengeli formüller. Reflex Plus Adult, N&D Adult, Pro Performance.",
          "Büyük ırk köpek maması: 25 kg+ ırklar (Golden, Labrador, Çoban köpekleri) için özel kalsiyum-fosfor dengesi.",
          "Küçük ırk köpek maması: Yorkshire, Maltese, Pomeranian gibi küçük ırklar için yoğun enerji formülleri.",
          "Hipoalerjenik / tahılsız köpek maması: hassas mide ve alerji için tahıl içermeyen seçenekler.",
        ],
      },
      {
        h2: "Neden Atakumlu Köpek Sahipleri JETGO Tercih Ediyor?",
        paragraphs: [
          "Mağazamız Atakum içinde olduğu için kuryelerimiz şehir trafiğine takılmadan kısa rotada teslim eder. Siparişiniz hazırlanırken size WhatsApp üzerinden bilgi gelir; kurye yola çıktığında ikinci bilgilendirme yapılır. Yerli mağazadan çıkan üründe orijinallik garantimiz vardır.",
          "Akıllı mama hesaplama aracımızla köpeğinizin kilosuna göre 15 kg'lık çuvalın kaç gün gideceğini hesaplayın; mama bittiğinde size hatırlatma göndelim. Reçeteli (veteriner önerili) mamalarda da yardımcı oluyoruz.",
        ],
      },
    ],
    features: [
      "Atakum içi 1–2 saat teslimat",
      "Büyük çuvalı kuryeniz taşır",
      "Royal Canin, Pro Plan, Hill's, N&D, Reflex Plus stoğu",
      "Kapıda nakitte %5 indirim",
      "Akıllı mama hesaplama + bitti hatırlatması",
      "Açılmamış mamada 14 gün iade",
    ],
    mahalleler: ["Denizevleri", "Mimar Sinan", "Körfez", "Yeni Mahalle", "Cumhuriyet", "Kurupelit", "Atakent", "Altınkum", "Taflan", "Esenevler"],
    faq: [
      { q: "Atakum'da aynı gün köpek maması teslimatı var mı?", a: "Evet, 18:00'a kadar verilen tüm Atakum siparişleri aynı gün, ortalama 1–2 saat içinde teslim edilir." },
      { q: "Atakum'da kapıda ödeme yapabiliyor muyum?", a: "Evet, kapıda nakit (%5 indirimli), POS ile kart, QR ödeme ve havale/EFT seçenekleri tüm Atakum bölgesinde aktiftir." },
      { q: "Büyük ırk köpek maması bulunur mu?", a: "Royal Canin Maxi, Pro Plan Large Breed, N&D Adult Maxi, Reflex Plus Maxi ve Brit Premium Adult Large gibi 10+ büyük ırk seçeneği stoklarımızda mevcuttur." },
      { q: "Veteriner reçeteli özel mama da getiriyor musunuz?", a: "Evet. Hill's Prescription Diet, Royal Canin Veterinary Diet ve N&D Vet serilerini stokta bulundurabiliyoruz; reçetenizi WhatsApp üzerinden iletmeniz yeterlidir." },
      { q: "Atakum dışına da teslimat yapıyor musunuz?", a: "Hayır. Hızı koruyabilmek için yalnızca Atakum, İlkadım ve Canik içine teslimat yapıyoruz." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
      { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
      { text: "Atakum Yavru Kedi Maması", href: "/atakum-yavru-kedi-mamasi" },
      { text: "Atakum Tahılsız Mama", href: "/atakum-tahilsiz-mama" },
      { text: "Mağaza & Konum", href: "/magaza" },
    ],
  },

  {
    slug: "samsun-kedi-kumu",
    type: "keyword",
    title: "Samsun Kedi Kumu",
    metaTitle: "Samsun Kedi Kumu | Kapıya Teslim Bentonit & Silika | JETGO",
    metaDescription: "Samsun'da kedi kumu: bentonit, silika, aktif karbonlu, kokulu/kokusuz seçenekler. Atakum, İlkadım, Canik aynı gün teslimat. Ağır paketi kuryeniz taşır.",
    keywords: "samsun kedi kumu, atakum kedi kumu, samsun bentonit kedi kumu, samsun silika kedi kumu, kedi kumu kapıya teslim samsun, samsun kedi kumu fiyatları",
    h1: "Samsun Kedi Kumu – Ağır Paketi Kuryeniz Taşır",
    intro: [
      "Samsun'da kedi kumu siparişi vermek için artık ağır paketi siz taşımayın. JETGO Pet olarak Atakum, İlkadım ve Canik içindeki tüm mahallelere bentonit, silika ve aktif karbonlu kedi kumu çeşitlerini aynı gün teslim ediyoruz.",
      "10 kg ve 20 kg paketler kurye ekibimizle apartman kapısına kadar getirilir; gerekirse kurye merdiven yardımı sağlar. Van Cat, Biokat's, Sanicat ve farklı bütçelere uygun yerli markalar stoklarımızdadır.",
      "Samsun içi teslimat süremiz ortalama 1–3 saattir. Kapıda nakit (%5 indirim), POS, QR ve havale ödeme seçenekleri mevcuttur. Üyelerimiz her siparişte %5 Para Puan kazanır.",
    ],
    sections: [
      {
        h2: "Samsun'da Hangi Kedi Kumu Türleri Bulunur?",
        paragraphs: [
          "Bentonit kedi kumu: en çok tercih edilen tür. Topaklanma yeteneği yüksek, ekonomiktir. Kokulu/kokusuz, ince/iri taneli seçenekleri mevcuttur.",
          "Silika (kristal) kedi kumu: koku tutma kapasitesi yüksek, daha az değiştirilir, hijyenik. Tek kediler için ideal.",
          "Aktif karbonlu kedi kumu: çoklu kedi evlerinde koku problemine etkili çözüm.",
          "Doğal-bitkisel (mısır/tofu) kedi kumu: tuvalete dökülebilen, doğa dostu seçenek.",
        ],
        list: [
          "Van Cat — bentonit, premium, beyaz görünüm",
          "Biokat's — yüksek topaklanma, koku kontrol",
          "Sanicat — ekonomik, geniş ürün yelpazesi",
          "JETGO ekonomik bentonit — tek kediliklerde uygun fiyat",
        ],
      },
      {
        h2: "Samsun'da Kedi Kumu Teslimat Bölgeleri",
        paragraphs: [
          "Atakum: Denizevleri, Güzelyalı, Mimar Sinan, Körfez, Yeni Mahalle, Cumhuriyet, Altınkum ve tüm çevre mahalleler. İlkadım: Kadıköy, Rasathane, Kılıçdede, Baruthane, Adalet, Ulugazi, Liman ve çevresi. Canik: Karşıyaka, Gaziosmanpaşa, Yenimahalle, Kuzeyyıldızı, Karadeniz mahalleleri.",
          "Saat 18:00'a kadar verilen siparişler Samsun içinde aynı gün teslim edilir; sonrası ertesi sabah ilk rotalarda gönderilir.",
        ],
      },
    ],
    features: [
      "Bentonit, silika, aktif karbonlu, doğal seçenekler",
      "10 kg / 20 kg paketleri kuryeniz taşır",
      "Atakum, İlkadım, Canik aynı gün teslimat",
      "Kapıda nakit, kart, QR, havale ödeme",
      "Açılmamış paketlerde 14 gün iade",
      "Para Puan ile %5 geri kazanım",
    ],
    faq: [
      { q: "Samsun'a kaç saatte kedi kumu gelir?", a: "Atakum içine 1–2 saat, İlkadım ve Canik'e 1–3 saat içinde teslim ediyoruz." },
      { q: "Hangi kedi kumu markaları stoklarınızda var?", a: "Van Cat, Biokat's, Sanicat, kendi ekonomik bentonit serimiz ve farklı bütçelere yönelik yerli markalarımız mevcuttur." },
      { q: "Çoklu kedi için en iyi kum hangisi?", a: "Çoklu kedi evlerinde aktif karbonlu bentonit veya silika önerilir; koku kontrolü daha iyidir." },
      { q: "İade yapabilir miyim?", a: "Açılmamış paketlerde 14 gün iade hakkınız vardır; açılmış kedi kumu hijyen gereği iade alınmaz." },
    ],
    internalLinks: [
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Atakum Kedi Kumu", href: "/atakum-kedi-kumu-kapiya-teslim" },
      { text: "En İyi Kedi Kumu", href: "/kedi-kumu-en-iyi" },
      { text: "Atakum Hızlı Kedi Kumu", href: "/atakum-hizli-kedi-kumu" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Mağaza & Konum", href: "/magaza" },
    ],
  },

  {
    slug: "samsun-kopek-mamasi",
    type: "keyword",
    title: "Samsun Köpek Maması",
    metaTitle: "Samsun Köpek Maması | Aynı Gün Teslimat & Kapıda Ödeme | JETGO",
    metaDescription: "Samsun'da köpek maması: yavru, yetişkin, büyük/küçük ırk, hipoalerjenik. Atakum, İlkadım, Canik aynı gün teslimat. Royal Canin, Pro Plan, Hill's, N&D stoğu.",
    keywords: "samsun köpek maması, samsun büyük ırk köpek maması, samsun küçük ırk köpek maması, samsun yavru köpek maması, samsun proplan, samsun royal canin köpek",
    h1: "Samsun Köpek Maması – Çuvalı Kuryeniz Getirir",
    intro: [
      "Samsun'da köpek maması ararken ağır 15–20 kg çuvallarla uğraşmanıza gerek yok. JETGO Pet olarak Samsun'un Atakum, İlkadım ve Canik ilçelerine yavru, yetişkin, büyük ırk, küçük ırk ve hipoalerjenik köpek mamalarını aynı gün teslim ediyoruz.",
      "Mağazamız Atakum'un kalbinde, Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A'dadır. Royal Canin, Hill's, Pro Plan, N&D Farmina, Reflex Plus, Pro Performance, Econature ve Brit gibi premium ile ekonomik markaları bir arada bulundururuz.",
      "Sipariş için ürünleri seçin, sepete ekleyin, WhatsApp veya online sipariş üzerinden tamamlayın. Saat 18:00'a kadar verilen siparişler aynı gün Samsun içinde teslim edilir. Kapıda nakitte %5 indirim, POS, QR ve havale seçenekleri mevcuttur.",
    ],
    sections: [
      {
        h2: "Samsun'da Köpek Maması Teslimat Bölgeleri",
        paragraphs: [
          "Atakum: Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan, Körfez, Yeni Mahalle, Altınkum, Cumhuriyet, Esenevler, Taflan, Soğuksu, Büyükoyumca, Çobanlı, Kozaağaç ve tüm çevre. İlkadım: Kadıköy, Rasathane, Kılıçdede, Baruthane, Ulugazi, Adalet, Çiftlik, Tepecik, Liman. Canik: Karşıyaka, Gaziosmanpaşa, Yenimahalle, Kuzeyyıldızı, Karadeniz.",
          "Atakum içi ortalama 60–90 dakika, İlkadım/Canik içi 90–180 dakikada teslim ediyoruz.",
        ],
      },
      {
        h2: "Samsun'da Hangi Köpek Maması Türlerini Bulabilirsiniz?",
        paragraphs: [
          "Yavru köpek maması: Royal Canin Puppy, Pro Plan Puppy, Hill's Science Plan Puppy, N&D Puppy.",
          "Yetişkin köpek maması: Reflex Plus Adult, Pronature Original Adult, ProChoice Adult.",
          "Büyük ırk köpek maması: Pro Plan Large Breed, Royal Canin Maxi Adult, Brit Premium Adult Large, N&D Maxi.",
          "Küçük ırk köpek maması: Royal Canin Mini, Pro Plan Small Breed, Reflex Plus Mini.",
          "Hipoalerjenik / tahılsız: N&D Grain Free, Reflex Grain Free, Brit Grain Free.",
        ],
      },
      {
        h2: "Neden JETGO Pet Samsun?",
        paragraphs: [
          "Samsun yerel mağazamızdan çıkan tüm mama paketleri SKT kontrolünden geçer. Sistemimiz SKT'si yakın bir ürünü siparişe eklemenize izin vermez. Açılmamış mama için 14 gün iade hakkı, %5 Para Puan, akıllı mama hesaplama, mama bittiğinde hatırlatma ve veteriner reçeteli mama tedariki gibi avantajlarımız vardır.",
        ],
      },
    ],
    features: [
      "Atakum, İlkadım, Canik içine aynı gün teslimat",
      "15–20 kg çuvalı kurye taşır",
      "Royal Canin, Pro Plan, Hill's, N&D, Reflex, Brit stoğu",
      "Kapıda nakit (%5 indirim), POS, QR, havale",
      "SKT kontrollü mamalar, 14 gün iade",
      "Akıllı mama hesaplama + hatırlatma",
    ],
    faq: [
      { q: "Samsun'da hangi ilçelere köpek maması teslim ediyorsunuz?", a: "Atakum, İlkadım ve Canik içindeki tüm mahallelere teslim ediyoruz. Tekkeköy hattını şu an aktif olarak servisliyoruz ancak öncelik merkez 3 ilçedir." },
      { q: "Büyük çuval taşımakta zorlanıyorum, kurye yardım eder mi?", a: "Evet. 15 kg+ çuvallarda kurye apartman içine taşıma yardımı sağlar." },
      { q: "Reçeteli (veteriner) mama getiriyor musunuz?", a: "Evet. Hill's Prescription Diet, Royal Canin Veterinary Diet ve N&D Vet ürünlerini reçetenizi WhatsApp'tan paylaştığınızda tedarik ediyoruz." },
      { q: "Minimum sipariş tutarı nedir?", a: "Samsun içi minimum sipariş tutarımız 500 TL'dir. 1.000 TL üzeri siparişlerde teslimat ücretsizdir." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Samsun Büyük Irk Köpek Maması", href: "/samsun-buyuk-irk-kopek-mamasi" },
      { text: "Samsun Royal Canin Mama", href: "/samsun-royal-canin-mama" },
      { text: "Mağaza & Konum", href: "/magaza" },
    ],
  },

  // Hız / aciliyet pages
  ...buildSpeedPages(),

  // Kapıda ödeme & eve teslim pages
  ...buildPaymentPages(),

  // Marka & ürün özelinde
  ...buildBrandProductPages(),

  // Güven & yorumlar
  ...buildTrustPages(),
];

// ----------- Builder helpers for variation -----------

function buildLandingPage(cfg: {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  h1: string;
  intro: string[];
  sections?: SeoSection[];
  features: string[];
  mahalleler?: string[];
  faq: { q: string; a: string }[];
  internalLinks: { text: string; href: string }[];
}): SeoPageData {
  return { type: "keyword", ...cfg };
}

function buildSpeedPages(): SeoPageData[] {
  return [
    buildLandingPage({
      slug: "samsun-hizli-petshop",
      title: "Samsun Hızlı Petshop",
      metaTitle: "Samsun Hızlı Petshop | 1–2 Saatte Teslim | JETGO Pet",
      metaDescription: "Samsun'un en hızlı pet shop hizmeti. Atakum içine 60–90 dk, İlkadım ve Canik'e 90–180 dk teslimat. Ağır mama ve kum çuvalları kapınıza kadar.",
      keywords: "samsun hızlı petshop, samsun hızlı pet shop, samsun pet shop hızlı teslimat, samsun express petshop",
      h1: "Samsun'un En Hızlı Pet Shop'u – 1–2 Saatte Kapınızda",
      intro: [
        "Samsun'da kedinizin maması, köpeğinizin kumu veya kuşunuzun yemi acilen lazım olduğunda zaman kaybetmek istemezsiniz. JETGO Pet olarak Samsun içine ortalama 60–180 dakika içinde teslimat sunuyoruz.",
        "Mağazamız Atakum'da olduğu için Atakum içi teslimat süremiz çoğu zaman 60–90 dakikadır. İlkadım ve Canik'e 90–180 dakikada ulaşıyoruz. Kuryelerimiz şehir trafiğini bilen yerel ekiptir; kısa rotalarla planlanır.",
        "Online sipariş hattımız 7/24 açık; aynı gün teslimat için son saat 18:00'dır. Sonrasındaki siparişler ertesi sabah ilk rotalarda yola çıkar.",
      ],
      sections: [
        {
          h2: "Hızı Mümkün Kılan Yerel Operasyon",
          paragraphs: [
            "Atakum içindeki yerel mağazamız sayesinde sipariş hazırlığı 5–10 dakikada tamamlanır; kurye doğrudan adresinize çıkar. Kargo bekleme, depo hareketi yoktur.",
            "Hangi kuryenin hangi rotada olduğunu bilen mini-bölge sistemi ile mahallenize en yakın kuryeyi atarız.",
          ],
        },
      ],
      features: [
        "Atakum içine 60–90 dk teslimat",
        "İlkadım/Canik'e 90–180 dk teslimat",
        "Mağaza Atakum'da: kısa rota",
        "Yerel kurye ekibi",
        "WhatsApp anlık bilgilendirme",
      ],
      faq: [
        { q: "Samsun'da en hızlı petshop hangi?", a: "Yerel mağaza + yerel kurye + dar bölge planı sayesinde Samsun içinde 1–3 saat aralığında en hızlı teslimatı sunuyoruz." },
        { q: "Acil sipariş işaretleyebilir miyim?", a: "Sipariş notuna 'acil' yazmanız yeterlidir; mümkünse rota başına alınır." },
      ],
      internalLinks: [
        { text: "Atakum Acil Petshop", href: "/atakum-acil-petshop" },
        { text: "Samsun Acil Petshop", href: "/samsun-acil-petshop" },
        { text: "Samsun Express Petshop", href: "/samsun-express-petshop" },
        { text: "Atakum 1 Saatte Kedi Maması", href: "/atakum-1-saatte-kedi-mamasi" },
        { text: "Mağaza & Konum", href: "/magaza" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-acil-petshop",
      title: "Atakum Acil Petshop",
      metaTitle: "Atakum Acil Petshop | 1 Saatte Mama Teslimi | JETGO Pet",
      metaDescription: "Atakum'da acil mama, kedi kumu, çiş pedi ihtiyacınızda 1 saat içinde kapınızdayız. Mağazamız Atakum merkezinde, kuryelerimiz hep yakınınızda.",
      keywords: "atakum acil petshop, atakum 1 saatte mama, atakum acil kedi maması, atakum hızlı petshop",
      h1: "Atakum Acil Petshop – Yaklaşık 1 Saatte Kapınızda",
      intro: [
        "Mama bitti, kediniz aç mı kaldı? Atakum içinde JETGO Pet, ortalama 60 dakika içinde acil siparişinizi teslim eder. Mağazamız Atakum merkezindedir; kuryelerimiz Atakum içinde dolaşır.",
        "Atakum'un Denizevleri, Mimar Sinan, Cumhuriyet, Yeni Mahalle, Altınkum, Kurupelit gibi mahallelerine doğrudan rotalardan teslim ediyoruz. Acil siparişlerde sipariş notuna 'acil' yazmanız yeterlidir.",
        "Açık olan saatlerde aynı gün teslim, kapalı saatte ertesi sabah ilk rotalardan biriyle teslim. WhatsApp üzerinden hızlı destek alabilirsiniz.",
      ],
      features: [
        "Ortalama 60 dakika teslimat",
        "Yerel mağaza, yerel kurye",
        "Atakum içinde kısa rota",
        "WhatsApp anlık takip",
        "Kapıda nakit, POS, QR ödeme",
      ],
      faq: [
        { q: "Atakum'da gerçekten 1 saat içinde gelir mi?", a: "Atakum merkez ve sahil bölgelerinde çoğu zaman 60–90 dakika arasındayız. Trafik ve yoğunluğa göre 90 dk'yı geçtiği günler olabilir." },
        { q: "Gece sipariş verirsem ne olur?", a: "23:00'dan sonra verilen siparişler ertesi sabah ilk rotalardan biriyle teslim edilir." },
      ],
      internalLinks: [
        { text: "Atakum 1 Saatte Kedi Maması", href: "/atakum-1-saatte-kedi-mamasi" },
        { text: "Atakum Hızlı Kedi Kumu", href: "/atakum-hizli-kedi-kumu" },
        { text: "Atakum Anında Teslim Mama", href: "/atakum-aninda-teslim-mama" },
        { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
        { text: "Mağaza & Konum", href: "/magaza" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-acil-petshop",
      title: "Samsun Acil Petshop",
      metaTitle: "Samsun Acil Petshop | Aynı Saat Teslim | JETGO Pet",
      metaDescription: "Samsun'da acil pet ürünleri için JETGO Pet. Atakum, İlkadım, Canik içinde 1–3 saat teslim. Mama, kum, çiş pedi, kedi/köpek hijyen ürünleri.",
      keywords: "samsun acil petshop, samsun acil mama, samsun pet shop hızlı, samsun acil kedi kumu",
      h1: "Samsun Acil Petshop – Hızlı, Yerel, Güvenilir",
      intro: [
        "Samsun'un her yerinden acil pet ihtiyacınız için JETGO Pet 1–3 saat aralığında teslimat sunar. Atakum içine 60–90 dk, İlkadım ve Canik içine 90–180 dk içinde ulaşırız.",
        "Acil sipariş için sepetinizdeki ürünleri tamamladıktan sonra notlara 'acil' yazmanız yeterli. Kuryelerimiz mümkün olan en kısa rotada size yönlenir.",
      ],
      features: [
        "Atakum 60–90 dk, İlkadım/Canik 90–180 dk",
        "Yerel mağaza, yerel kurye",
        "Kapıda nakit, kart, QR ödeme",
        "WhatsApp ile sipariş takibi",
      ],
      faq: [
        { q: "Acil sipariş ek ücretli mi?", a: "Ek bir ücret almıyoruz. 1.000 TL üzeri tüm siparişlerde teslimat ücretsizdir." },
        { q: "Hangi ürünler acil sipariş için ideal?", a: "Mama, kedi kumu, çiş pedi, hijyen ürünleri ve veteriner önerili reçeteli mamalar." },
      ],
      internalLinks: [
        { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
        { text: "Samsun Express Petshop", href: "/samsun-express-petshop" },
        { text: "Samsun 1 Saatte Köpek Maması", href: "/samsun-1-saatte-kopek-mamasi" },
        { text: "Samsun 1 Saat Teslim Petshop", href: "/samsun-1-saat-teslim-petshop" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-1-saatte-kedi-mamasi",
      title: "Atakum 1 Saatte Kedi Maması",
      metaTitle: "Atakum 1 Saatte Kedi Maması Teslim | JETGO Pet",
      metaDescription: "Atakum'da 1 saat içinde kedi maması teslimatı. Yerel mağaza, yerel kurye. Royal Canin, Pro Plan, Hill's stoğu hazır.",
      keywords: "atakum 1 saatte kedi maması, atakum kedi maması hızlı teslimat, atakum acil kedi maması",
      h1: "Atakum 1 Saatte Kedi Maması Teslimatı",
      intro: [
        "Kediniz mamayı bitirdi mi? Atakum'da yaşıyorsanız JETGO Pet'ten verdiğiniz siparişi ortalama 60 dakika içinde alırsınız. Mağazamız Atakum'un kalbinde, Yenimahalle Atatürk 3. Kısım Bulvarı'nda.",
        "Royal Canin, Hill's, Pro Plan, N&D, Reflex Plus, Pronature Original gibi tüm popüler kedi maması markalarını anında stoktan çıkarırız. Yavru, yetişkin, kısırlaştırılmış, tahılsız ve hassas sindirim formülleri hazırdır.",
      ],
      features: [
        "Ortalama 60 dk teslim",
        "Atakum merkez yerel mağaza",
        "Royal Canin, Hill's, Pro Plan, N&D",
        "Kapıda nakitte %5 indirim",
        "Yavru / yetişkin / kısır / tahılsız",
      ],
      faq: [
        { q: "Hangi mahalleye 1 saat içinde gelirsiniz?", a: "Denizevleri, Mimar Sinan, Körfez, Yeni Mahalle, Cumhuriyet, Esenevler, Altınkum başta olmak üzere Atakum içi tüm mahallelerde 1 saat hedefimiz vardır." },
        { q: "Marka stokta yoksa ne olur?", a: "Sipariş öncesi stok kontrolü sistem üzerinden yapılır; sepete eklediğiniz ürün stokta var demektir." },
      ],
      internalLinks: [
        { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
        { text: "Atakum Acil Petshop", href: "/atakum-acil-petshop" },
        { text: "Atakum Anında Teslim Mama", href: "/atakum-aninda-teslim-mama" },
        { text: "Atakum Yavru Kedi Maması", href: "/atakum-yavru-kedi-mamasi" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-1-saatte-kopek-mamasi",
      title: "Samsun 1 Saatte Köpek Maması",
      metaTitle: "Samsun 1 Saatte Köpek Maması Teslim | JETGO Pet",
      metaDescription: "Samsun'da köpek maması 1 saat içinde kapınızda. Atakum içi 1 saat, İlkadım/Canik 1–3 saat. Büyük çuvalı kuryeniz taşır.",
      keywords: "samsun 1 saatte köpek maması, samsun acil köpek maması, samsun hızlı köpek mama",
      h1: "Samsun 1 Saatte Köpek Maması Teslimatı",
      intro: [
        "Samsun'da köpek maması ihtiyacınızı en hızlı şekilde JETGO Pet karşılar. Atakum içi siparişler ortalama 60 dakikada, İlkadım ve Canik içi siparişler 60–180 dakika arasında teslim edilir.",
        "Pro Plan, Royal Canin, Hill's, N&D, Reflex, Brit, Pro Performance markalarımız 15 kg ve 20 kg çuvallar dahil hazır stoktadır. Kuryeniz büyük çuvalı kapınıza kadar taşır.",
      ],
      features: [
        "Atakum'da 1 saat hedefi",
        "Tüm Samsun'da 1–3 saat",
        "15–20 kg çuvalı kurye taşır",
        "Pro Plan, Royal Canin, Hill's stoğu",
      ],
      faq: [
        { q: "Çuval taşımam lazım mı?", a: "Hayır. Kurye apartman kapısına kadar (talep ederseniz daire içine kadar) taşır." },
        { q: "Köpek mamamın markası özel ise?", a: "Stokta varsa ürünü sepette görürsünüz. Görmüyorsanız WhatsApp'tan sorabilirsiniz, mümkünse aynı gün getiriyoruz." },
      ],
      internalLinks: [
        { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
        { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
        { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
        { text: "Samsun Express Petshop", href: "/samsun-express-petshop" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-gece-acik-petshop",
      title: "Atakum Gece Açık Petshop",
      metaTitle: "Atakum Gece Sipariş Pet Shop | JETGO 7/24 Online",
      metaDescription: "Atakum'da gece sipariş alan pet shop. Online sipariş hattımız 7/24 açık. Sabah ilk rotada teslimat. WhatsApp destek.",
      keywords: "atakum gece açık petshop, atakum 24 saat petshop, atakum gece kedi maması",
      h1: "Atakum Gece Sipariş Pet Shop – Online 7/24",
      intro: [
        "Mağazamızın fiziksel saatleri Pzt-Cmt 09:00-22:00, Pazar 10:00-22:00 olsa da online sipariş hattımız 7/24 açıktır. Atakum'da gece verdiğiniz siparişler ertesi sabah ilk rotalardan biriyle teslim edilir.",
        "Acil bir durum varsa sipariş notuna belirtin; mümkünse açılışla birlikte ilk teslimat sizin olur.",
      ],
      features: [
        "7/24 online sipariş",
        "Sabah ilk rota teslimat",
        "Ertesi gün garanti",
        "Atakum merkez mağaza",
      ],
      faq: [
        { q: "Gece nereden sipariş veririm?", a: "jetgomarket.com üzerinden ürünleri seçip sepeti tamamlayın; sabah hazırlığı başlar." },
        { q: "Gece kapıya teslim var mı?", a: "Şu an gece teslimat yapmıyoruz; sabah ilk rota ile teslim ediyoruz. Trafik açıldığı anda yola çıkarız." },
      ],
      internalLinks: [
        { text: "Atakum Pet Shop", href: "/atakum-petshop" },
        { text: "Atakum Acil Petshop", href: "/atakum-acil-petshop" },
        { text: "Mağaza & Konum", href: "/magaza" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-aninda-teslim-mama",
      title: "Atakum Anında Teslim Mama",
      metaTitle: "Atakum Anında Teslim Kedi Köpek Maması | JETGO",
      metaDescription: "Atakum'da anında teslim kedi ve köpek maması. Yerel mağazadan çıkış, 1 saatte kapınızda. Royal Canin, Pro Plan, Hill's stoğu hazır.",
      keywords: "atakum anında teslim mama, atakum hemen teslim mama, atakum mama hızlı teslimat",
      h1: "Atakum Anında Teslim Mama – Sipariş Verir Vermez Yola Çıkıyoruz",
      intro: [
        "Atakum'daki yerel mağazamızdan size doğrudan teslim. Sipariş gelir gelmez hazırlığı başlatıyor, kurye 5–10 dakika içinde yola çıkıyor. Atakum içi ortalama 60 dk hedefimiz vardır.",
        "Tüm popüler kedi/köpek maması markalarımız sürekli stokta tutulur. SKT kontrolü sistemimiz sayesinde taze paketler size ulaşır.",
      ],
      features: [
        "5–10 dk hazırlık",
        "Atakum içi 60 dk hedef",
        "Premium markalar",
        "SKT kontrollü stok",
        "WhatsApp anlık takip",
      ],
      faq: [
        { q: "Kurye yola çıktığını nasıl bilirim?", a: "WhatsApp üzerinden sipariş hazırlandı ve kurye yola çıktı bildirimleri gönderilir." },
        { q: "Sipariş içi değişiklik yapabilir miyim?", a: "Kurye yola çıkmadan önce evet. WhatsApp'tan iletmeniz yeterli." },
      ],
      internalLinks: [
        { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
        { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
        { text: "Atakum 1 Saatte Kedi Maması", href: "/atakum-1-saatte-kedi-mamasi" },
        { text: "Atakum Acil Petshop", href: "/atakum-acil-petshop" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-1-saat-teslim-petshop",
      title: "Samsun 1 Saat Teslim Petshop",
      metaTitle: "Samsun 1 Saat Teslim Petshop | JETGO Pet",
      metaDescription: "Samsun'da 1 saat teslim hedefli pet shop. Atakum içi 60 dk, İlkadım/Canik içi 90–180 dk. Mama, kum, hijyen ürünleri.",
      keywords: "samsun 1 saat teslim petshop, samsun pet shop hızlı teslim, samsun 1 saatte teslim",
      h1: "Samsun 1 Saat Teslim Pet Shop",
      intro: [
        "Samsun'da en hızlı pet shop deneyimini yaşamak için JETGO Pet'i tercih edin. Atakum içine 60 dakika hedefimiz vardır; İlkadım ve Canik'e 90–180 dakika içinde ulaşırız.",
        "Mağazadan çıkış sonrası kuryeniz adresinize en kısa rotadan ilerler. Sipariş takibi WhatsApp üzerinden sizinle paylaşılır.",
      ],
      features: [
        "Atakum 60 dk hedef",
        "İlkadım/Canik 90–180 dk",
        "WhatsApp anlık takip",
        "Yerel kurye ekibi",
      ],
      faq: [
        { q: "1 saat teslim garantili mi?", a: "Atakum'da çoğu zaman; trafik ve yoğunluğa göre 90 dk'yı bulabilir. Garantili değildir, hedefimizdir." },
        { q: "İlkadım/Canik için teslim süresi nedir?", a: "90–180 dakika aralığındadır." },
      ],
      internalLinks: [
        { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
        { text: "Samsun Express Petshop", href: "/samsun-express-petshop" },
        { text: "Samsun 1 Saatte Köpek Maması", href: "/samsun-1-saatte-kopek-mamasi" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-express-petshop",
      title: "Samsun Express Petshop",
      metaTitle: "Samsun Express Petshop | Hızlı Mama, Kum, Aksesuar | JETGO",
      metaDescription: "Samsun express pet shop hizmeti. Aynı gün 1–3 saat teslim, kapıda ödeme, premium markalar. JETGO Pet Atakum mağazası.",
      keywords: "samsun express petshop, samsun pet shop express, samsun hızlı pet shop hizmeti",
      h1: "Samsun Express Pet Shop – Hızlı ve Yerel",
      intro: [
        "JETGO Pet, Samsun express pet shop kategorisinde en hızlı yerel hizmettir. Mağaza Atakum'da, kurye Samsun'da. Aynı gün teslim ve kapıda ödeme standardımızdır.",
        "Atakum içi 60–90 dk, İlkadım/Canik içi 90–180 dk teslimat. Mama, kum, çiş pedi, hijyen, aksesuar.",
      ],
      features: [
        "Aynı gün teslimat",
        "Yerel mağaza + yerel kurye",
        "Premium ve ekonomik markalar",
        "Kapıda nakit, kart, QR",
      ],
      faq: [
        { q: "Express sipariş için ek ücret var mı?", a: "Hayır, normal teslimat ücretleri geçerlidir." },
        { q: "Aksesuar da express geliyor mu?", a: "Evet, mağaza stoğunda olan tüm ürünler aynı süreyle gelir." },
      ],
      internalLinks: [
        { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
        { text: "Samsun Acil Petshop", href: "/samsun-acil-petshop" },
        { text: "Samsun 1 Saat Teslim Petshop", href: "/samsun-1-saat-teslim-petshop" },
      ],
    }),
  ];
}

function buildPaymentPages(): SeoPageData[] {
  return [
    buildLandingPage({
      slug: "samsun-kapida-odeme-petshop",
      title: "Samsun Kapıda Ödeme Petshop",
      metaTitle: "Samsun Kapıda Ödeme Petshop | %5 Nakit İndirim | JETGO",
      metaDescription: "Samsun'da kapıda ödeme alan pet shop. Nakitte %5 indirim, POS ile kart, QR ödeme, havale. Atakum, İlkadım, Canik aynı gün teslim.",
      keywords: "samsun kapıda ödeme petshop, samsun pet shop kapıda ödeme, samsun kapıda nakit petshop, samsun kapıda kart pos",
      h1: "Samsun'da Kapıda Ödeme Yapabileceğiniz Pet Shop",
      intro: [
        "JETGO Pet, Samsun'da kapıda ödeme alan yerel pet shop'tur. Atakum, İlkadım ve Canik içine yapılan tüm teslimatlarda kapıda nakit, POS ile kredi/banka kartı, QR ödeme ve havale/EFT seçenekleri mevcuttur.",
        "Kapıda nakit ödemede otomatik %5 indirim uygulanır. Üye olmanıza gerek yoktur; ancak üyeyseniz her siparişte %5 Para Puan da kazanırsınız.",
        "Online sipariş ile mağaza fiyatı arasında fark yoktur. Kart taksit seçeneklerini POS üzerinden bankanızla seçebilirsiniz.",
      ],
      features: [
        "Kapıda nakit (%5 indirimli)",
        "Kapıda kart (POS) ile taksit",
        "Kapıda QR ödeme (mobil bankacılık)",
        "Havale / EFT seçeneği",
        "Üyeye %5 Para Puan",
      ],
      faq: [
        { q: "Kapıda nakit indirimi nasıl uygulanır?", a: "Sepet sayfasında kapıda nakit seçtiğinizde toplamdan otomatik %5 düşülür." },
        { q: "Kart ile taksit yapabilir miyim?", a: "Evet. POS cihazımız ile bankanızın taksit seçeneklerini kullanabilirsiniz." },
        { q: "Havale ile sipariş verirsem ne zaman teslim?", a: "Havale dekontunu WhatsApp'tan iletirseniz teslimat aynı gün başlar." },
      ],
      internalLinks: [
        { text: "Atakum Kapıda Ödeme Petshop", href: "/atakum-kapida-odeme-petshop" },
        { text: "Atakum Pet Shop Kapıda Ödeme", href: "/atakum-petshop-kapida-odeme" },
        { text: "Kapıya Teslim Petshop Samsun", href: "/kapiya-teslim-petshop-samsun" },
        { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-kapida-odeme-petshop",
      title: "Atakum Kapıda Ödeme Petshop",
      metaTitle: "Atakum Kapıda Ödeme Petshop | %5 Nakit İndirim | JETGO",
      metaDescription: "Atakum'da kapıda ödeme alan pet shop. Nakit, POS, QR, havale seçenekleri. Aynı gün teslimat, %5 nakit indirimi.",
      keywords: "atakum kapıda ödeme petshop, atakum pet shop kapıda ödeme, atakum kapıda nakit petshop, atakum kapıda kart",
      h1: "Atakum Kapıda Ödeme Pet Shop – Nakit, Kart, QR",
      intro: [
        "Atakum içindeki tüm teslimatlarda kapıda ödeme avantajını JETGO Pet ile yaşayın. Kapıda nakit ödemede %5 indirim, POS cihazıyla kart, QR ödeme ve havale seçenekleri tüm Atakum bölgesinde aktiftir.",
        "Mağazamız Atakum'un kalbinde olduğu için kuryelerimiz Atakum içinde sürekli rotada. Sipariş hazırlığı sonrası kurye 5–10 dakika içinde yola çıkar.",
      ],
      features: [
        "Atakum içi tüm mahallelerde geçerli",
        "Nakit ödemede %5 indirim",
        "POS ile kart + taksit",
        "QR ödeme (mobil bankacılık)",
        "Havale / EFT alternatif",
      ],
      faq: [
        { q: "Atakum'da hangi mahallelerde kapıda ödeme aktif?", a: "Atakum'un tüm mahallelerinde aktiftir: Denizevleri, Mimar Sinan, Körfez, Yeni Mahalle, Cumhuriyet, Altınkum, Kurupelit, Atakent ve diğerleri." },
        { q: "Kart taksit yapılır mı?", a: "Bankanızın izin verdiği taksit seçeneklerini POS üzerinden uygulayabilirsiniz." },
      ],
      internalLinks: [
        { text: "Atakum Pet Shop Kapıda Ödeme", href: "/atakum-petshop-kapida-odeme" },
        { text: "Samsun Kapıda Ödeme Petshop", href: "/samsun-kapida-odeme-petshop" },
        { text: "Atakum Pet Shop", href: "/atakum-petshop" },
        { text: "Mağaza & Konum", href: "/magaza" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-eve-teslim-kedi-mamasi",
      title: "Samsun Eve Teslim Kedi Maması",
      metaTitle: "Samsun Eve Teslim Kedi Maması | JETGO Pet",
      metaDescription: "Samsun'da eve teslim kedi maması. Aynı gün teslimat, kapıda ödeme, premium markalar. Atakum, İlkadım, Canik içinde yerel servis.",
      keywords: "samsun eve teslim kedi maması, samsun kedi maması eve gelir, samsun pet shop eve teslim",
      h1: "Samsun Eve Teslim Kedi Maması",
      intro: [
        "Samsun'da kedinizin maması bittiyse mağazaya gitmenize gerek yok. JETGO Pet eve teslim kedi maması hizmetiyle Atakum, İlkadım ve Canik içine aynı gün teslimat yapar.",
        "Royal Canin, Pro Plan, Hill's, N&D, Reflex Plus, Pronature, Felicia, Brit, ProChoice gibi 15+ marka stoklarımızda. SKT kontrollü, taze paketler kapınıza kadar gelir.",
      ],
      features: [
        "Atakum/İlkadım/Canik aynı gün teslim",
        "Kapıda nakit (%5 indirim), POS, QR",
        "Premium ve ekonomik markalar",
        "SKT kontrollü stok",
        "Akıllı mama hesaplama",
      ],
      faq: [
        { q: "Hangi saate kadar sipariş verirsem aynı gün gelir?", a: "Saat 18:00'a kadar verilen siparişler aynı gün teslim edilir." },
        { q: "Eve teslim için ek ücret var mı?", a: "1.000 TL üzeri siparişlerde teslimat ücretsizdir." },
      ],
      internalLinks: [
        { text: "Samsun Kedi Maması", href: "/samsun-petshop-kedi-mamasi" },
        { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
        { text: "Atakum Eve Teslim Köpek Maması", href: "/atakum-eve-teslim-kopek-mamasi" },
        { text: "Mağaza & Konum", href: "/magaza" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-eve-teslim-kopek-mamasi",
      title: "Atakum Eve Teslim Köpek Maması",
      metaTitle: "Atakum Eve Teslim Köpek Maması | Aynı Gün | JETGO",
      metaDescription: "Atakum'da eve teslim köpek maması. Büyük çuvalı kuryeniz taşır. Royal Canin, Pro Plan, Hill's, N&D, Reflex stoğu.",
      keywords: "atakum eve teslim köpek maması, atakum köpek maması eve gelir, atakum köpek mama teslim",
      h1: "Atakum Eve Teslim Köpek Maması",
      intro: [
        "Atakum içindeki tüm mahallelere eve teslim köpek maması hizmeti. Büyük çuvallarınızı kuryeniz apartman içine kadar taşır. Mama hazırlığı 5–10 dk, teslim 60–90 dk.",
        "Pro Plan, Royal Canin, Hill's, N&D, Reflex Plus, Brit, Pronature, Pro Performance gibi tüm popüler markalarımız stokta.",
      ],
      features: [
        "Atakum içi 60–90 dk teslim",
        "Büyük çuvalı kurye taşır",
        "Kapıda nakit, kart, QR",
        "SKT kontrollü mama",
        "Para Puan ile %5 geri kazanım",
      ],
      faq: [
        { q: "Daire içine kadar taşır mı?", a: "Talep ederseniz evet. Asansörsüz binalarda da yardımcı oluyoruz." },
        { q: "Atakum dışına eve teslim yapıyor musunuz?", a: "Hayır, sadece Atakum, İlkadım, Canik içine teslim ediyoruz." },
      ],
      internalLinks: [
        { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
        { text: "Samsun Eve Teslim Kedi Maması", href: "/samsun-eve-teslim-kedi-mamasi" },
        { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
        { text: "Mağaza & Konum", href: "/magaza" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-petshop-kurye",
      title: "Samsun Petshop Kurye",
      metaTitle: "Samsun Petshop Kurye Hizmeti | Aynı Gün Teslim | JETGO",
      metaDescription: "Samsun'da pet shop kurye hizmeti. Atakum mağazasından çıkış, yerel kurye ekibi, 1–3 saatte teslim. Mama, kum, çiş pedi.",
      keywords: "samsun petshop kurye, samsun pet shop kurye, samsun mama kurye, samsun kedi maması kurye",
      h1: "Samsun Pet Shop Kurye Hizmeti",
      intro: [
        "JETGO Pet, Samsun'un en aktif pet shop kurye ağına sahip yerel mağazasıdır. Atakum mağazamızdan çıkan siparişler, yerel kurye ekibimizle Atakum, İlkadım ve Canik adreslerine 1–3 saat aralığında teslim edilir.",
        "Hangi kuryenin nerede olduğunu bilen mini-bölge sistemi sayesinde mahallenize en yakın kuryeyi atarız.",
      ],
      features: [
        "Yerel kurye ekibi",
        "Mini-bölge dağıtım",
        "WhatsApp anlık takip",
        "Atakum içi 1 saat hedef",
      ],
      faq: [
        { q: "Kurye numarasıyla iletişime geçebilir miyim?", a: "Sipariş takibi WhatsApp ana hat üzerindendir; özel kurye numarası paylaşımı standart değildir." },
        { q: "Sipariş notu yazabilir miyim?", a: "Evet. Ödeme adımında kurye için not alanı vardır (kapı kodu, kat vs.)." },
      ],
      internalLinks: [
        { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
        { text: "Samsun Express Petshop", href: "/samsun-express-petshop" },
        { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-hizli-kedi-kumu",
      title: "Atakum Hızlı Kedi Kumu",
      metaTitle: "Atakum Hızlı Kedi Kumu Teslim | JETGO Pet",
      metaDescription: "Atakum'da kedi kumu 1 saat içinde kapınızda. Bentonit, silika, aktif karbonlu seçenekler. 10–20 kg paketleri kuryeniz taşır.",
      keywords: "atakum hızlı kedi kumu, atakum kedi kumu acil, atakum kedi kumu hızlı teslim",
      h1: "Atakum Hızlı Kedi Kumu Teslimatı",
      intro: [
        "Atakum'da kedi kumu acil mi lazım? JETGO Pet'in yerel mağazasından çıkan siparişler ortalama 60 dakika içinde Atakum içindeki adresinize ulaşır. 10 kg ve 20 kg paketleri kurye apartman kapısına kadar taşır.",
        "Bentonit (Van Cat, Biokat's, Sanicat), silika ve aktif karbonlu seçenekler stoğumuzda. Tek kedi, çoklu kedi ve hassas burunlu kedi sahipleri için farklı koku kontrol seviyelerinde ürün bulunur.",
      ],
      features: [
        "Atakum içi ~60 dk teslim",
        "Bentonit, silika, aktif karbonlu",
        "10 kg ve 20 kg paketler",
        "Kuryeniz paketi taşır",
        "Kapıda nakit, kart, QR",
      ],
      faq: [
        { q: "20 kg kedi kumu paketi merdivene çıkar mı?", a: "Evet, kurye apartman içine ve gerekirse daire içine kadar taşır." },
        { q: "Kokulu/kokusuz seçenek var mı?", a: "Her iki seçenek de stoktadır." },
      ],
      internalLinks: [
        { text: "Samsun Kedi Kumu", href: "/samsun-kedi-kumu" },
        { text: "Atakum Kedi Kumu Kapıya Teslim", href: "/atakum-kedi-kumu-kapiya-teslim" },
        { text: "En İyi Kedi Kumu", href: "/kedi-kumu-en-iyi" },
        { text: "Atakum Acil Petshop", href: "/atakum-acil-petshop" },
      ],
    }),
  ];
}

function buildBrandProductPages(): SeoPageData[] {
  return [
    buildLandingPage({
      slug: "samsun-ucuz-kedi-mamasi",
      title: "Samsun Ucuz Kedi Maması",
      metaTitle: "Samsun Ucuz Kedi Maması | Uygun Fiyat & Kalite | JETGO",
      metaDescription: "Samsun'da ucuz kedi maması: ekonomik markalar, kampanyalı paketler, açık mama tartım. Aynı gün teslimat, kapıda nakit indirimi.",
      keywords: "samsun ucuz kedi maması, samsun ekonomik kedi maması, samsun uygun fiyatlı kedi maması, samsun kedi mama indirim",
      h1: "Samsun Ucuz Kedi Maması – Bütçe Dostu Seçenekler",
      intro: [
        "Samsun'da bütçeye uygun kedi maması arıyorsanız JETGO Pet'in ekonomik mama bölümüne göz atın. ProChoice, Felicia, Pronature gibi uygun fiyatlı markalar ve büyük gramajlı kampanya paketleri stoğumuzda.",
        "Açık mama satışı yapıyoruz: 500 g'dan istediğiniz miktarda tartım. Para Puan ve kapıda nakitte %5 ek indirim ile tasarrufu artırın.",
      ],
      features: [
        "Ekonomik markalar: ProChoice, Felicia, Pronature",
        "Kampanyalı büyük paketler",
        "Açık mama tartım (500 g+)",
        "Kapıda nakitte %5 indirim",
        "Para Puan ile %5 geri kazanım",
      ],
      faq: [
        { q: "En ucuz kedi maması hangisi?", a: "Marka ve gramaja göre değişir. Açık mama tartımı en ekonomik yoldur." },
        { q: "Kampanya ürünlerini nereden görürüm?", a: "/kampanya sayfasından kampanyalı tüm ürünlere ulaşırsınız." },
      ],
      internalLinks: [
        { text: "Atakum Uygun Fiyatlı Mama", href: "/atakum-uygun-fiyatli-mama" },
        { text: "Samsun Kedi Maması", href: "/samsun-petshop-kedi-mamasi" },
        { text: "Açık Mama", href: "/acik-mama" },
        { text: "Kampanyalar", href: "/kampanya" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-en-iyi-kopek-mamasi",
      title: "Samsun En İyi Köpek Maması",
      metaTitle: "Samsun En İyi Köpek Maması | Premium Markalar | JETGO",
      metaDescription: "Samsun'da en iyi köpek maması: Royal Canin, Hill's, Pro Plan, N&D. Veteriner önerili premium ve süper-premium formüller.",
      keywords: "samsun en iyi köpek maması, samsun premium köpek maması, samsun süper premium köpek mama, samsun veteriner mama",
      h1: "Samsun'da En İyi Köpek Maması Markaları",
      intro: [
        "Samsun'da köpeğiniz için en iyi maması seçerken yaş, ırk büyüklüğü, aktivite seviyesi ve sağlık durumu dikkate alınmalıdır. JETGO Pet olarak veterinerlerin önerdiği premium ve süper-premium markaları stokta tutuyoruz.",
        "Royal Canin, Hill's Science Plan, Pro Plan, N&D Farmina, Brit Premium ve Reflex Plus gibi birinci sınıf seçenekler. Tüm formüllerde SKT kontrolü yapılır.",
      ],
      features: [
        "Royal Canin (Mini, Maxi, Veterinary)",
        "Hill's Science Plan + Prescription Diet",
        "Pro Plan (Puppy, Adult, Sensitive)",
        "N&D Farmina Grain Free",
        "Brit Premium ve Reflex Plus",
      ],
      faq: [
        { q: "En iyi köpek maması nedir?", a: "Köpeğinizin yaş, ırk büyüklüğü ve sağlık durumuna göre değişir. Veteriner önerisi en doğrusudur." },
        { q: "Veteriner reçeteli mama getiriyor musunuz?", a: "Evet, Hill's Prescription Diet, Royal Canin Veterinary Diet ve N&D Vet ürünlerini reçete ile tedarik ederiz." },
      ],
      internalLinks: [
        { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
        { text: "Samsun Premium Mama", href: "/samsun-premium-mama" },
        { text: "Samsun Royal Canin Mama", href: "/samsun-royal-canin-mama" },
        { text: "Atakum ProPlan Mama", href: "/atakum-proplan-mama" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-proplan-mama",
      title: "Atakum Pro Plan Mama",
      metaTitle: "Atakum Pro Plan Mama | Kedi & Köpek | Aynı Gün | JETGO",
      metaDescription: "Atakum'da Pro Plan kedi ve köpek maması. Tüm yaş ve ırk seçenekleri stokta. Aynı gün teslimat, %5 nakit indirim.",
      keywords: "atakum proplan mama, atakum pro plan kedi maması, atakum pro plan köpek maması, samsun pro plan",
      h1: "Atakum Pro Plan Mama – Kedi & Köpek Tüm Seriler",
      intro: [
        "Atakum'da Pro Plan mama tedarikçisi JETGO Pet'tedir. Pro Plan'ın tüm kedi (Kitten, Adult, Sterilised, Hairball, Sensitive) ve köpek (Puppy, Adult, Small Breed, Large Breed Athletic, Sensitive) serilerini stoğumuzda bulundururuz.",
        "Atakum içi 60–90 dk teslim, kapıda %5 nakit indirim ve her siparişte %5 Para Puan kazanım.",
      ],
      features: [
        "Pro Plan Kitten, Adult, Sterilised",
        "Pro Plan Puppy, Adult, Senior",
        "Sensitive ve Hairball formülleri",
        "Atakum içi 1 saat teslim",
        "%5 nakit indirim + %5 Para Puan",
      ],
      faq: [
        { q: "Pro Plan tüm gramajlar var mı?", a: "1.5 kg, 3 kg, 7 kg, 10 kg ve 14 kg gramajların büyük kısmı stokta tutulur. Yoksa 1–2 gün içinde tedarik edilir." },
        { q: "Pro Plan otantik mi?", a: "Tüm Pro Plan ürünleri orijinal Türkiye distribütöründen alınır. Sahte ürün ihtimali yoktur." },
      ],
      internalLinks: [
        { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
        { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
        { text: "Samsun Royal Canin Mama", href: "/samsun-royal-canin-mama" },
        { text: "Samsun En İyi Köpek Maması", href: "/samsun-en-iyi-kopek-mamasi" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-royal-canin-mama",
      title: "Samsun Royal Canin Mama",
      metaTitle: "Samsun Royal Canin Mama | Kedi & Köpek | JETGO",
      metaDescription: "Samsun'da Royal Canin kedi ve köpek maması. Veteriner serileri dahil. Atakum, İlkadım, Canik aynı gün teslim.",
      keywords: "samsun royal canin mama, samsun royal canin kedi, samsun royal canin köpek, samsun royal canin veterinary",
      h1: "Samsun Royal Canin Mama Tedariki",
      intro: [
        "Royal Canin'in tüm Samsun çapında en güvenilir tedarikçilerinden biri JETGO Pet'tir. Royal Canin Kitten, Adult, Sterilised, Hairball Care, Indoor, Sensible serilerinin yanı sıra Mini, Medium, Maxi köpek serileri ve Veterinary Diet (Renal, Urinary, Hepatic, Diabetic, Hypoallergenic) reçeteli ürünleri tedarik ediyoruz.",
        "Atakum mağazamızdan Samsun'un her yerine 1–3 saat içinde teslim ediyoruz.",
      ],
      features: [
        "Royal Canin Kitten/Adult/Sterilised",
        "Royal Canin Mini/Medium/Maxi köpek",
        "Veterinary Diet (reçeteli)",
        "Türkiye orijinal distribütör",
        "Atakum/İlkadım/Canik aynı gün teslim",
      ],
      faq: [
        { q: "Royal Canin Veterinary Diet için reçete şart mı?", a: "Evet, veteriner reçetesini WhatsApp'tan iletmeniz yeterlidir." },
        { q: "Royal Canin gramaj seçenekleri?", a: "400 g'dan 15 kg'a kadar farklı gramajlar bulunur; stok durumu ürün sayfasında görünür." },
      ],
      internalLinks: [
        { text: "Atakum Pro Plan Mama", href: "/atakum-proplan-mama" },
        { text: "Samsun En İyi Köpek Maması", href: "/samsun-en-iyi-kopek-mamasi" },
        { text: "Samsun Premium Mama", href: "/samsun-premium-mama" },
        { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-yavru-kedi-mamasi",
      title: "Atakum Yavru Kedi Maması",
      metaTitle: "Atakum Yavru Kedi Maması (Kitten) | Aynı Gün | JETGO",
      metaDescription: "Atakum'da yavru kedi maması (kitten): Royal Canin Kitten, Pro Plan Junior, Hill's Science Plan Kitten, N&D Kitten. Hızlı teslim.",
      keywords: "atakum yavru kedi maması, atakum kitten mama, atakum yavru kedi mama, samsun yavru kedi mama",
      h1: "Atakum Yavru Kedi Maması (Kitten) – Hızlı Teslim",
      intro: [
        "2–12 ay arası yavru kedinizin gelişimi için yüksek protein ve DHA içeren kitten mamalar şart. Atakum'da JETGO Pet, Royal Canin Kitten, Pro Plan Junior, Hill's Science Plan Kitten, N&D Kitten ve Pronature Original Kitten gibi formüllerle sizleri bekliyor.",
        "Yavru kedinizin günlük mama ihtiyacını akıllı mama hesaplama aracımızla öğrenin.",
      ],
      features: [
        "Royal Canin / Pro Plan / Hill's / N&D Kitten",
        "1.5–3 kg gramaj seçenekleri",
        "Yüksek protein ve DHA",
        "Atakum içi 60 dk teslim",
        "Akıllı mama hesaplama",
      ],
      faq: [
        { q: "Yavru kedimi ne zaman yetişkin mamaya geçirmeliyim?", a: "Genellikle 12. aydan sonra. Veterinerinizle birlikte karar vermek en doğrusudur." },
        { q: "Yavru kedi maması ile yetişkin mama farkı nedir?", a: "Yavru mamada protein, kalori ve DHA daha yüksektir; gelişim için tasarlanır." },
      ],
      internalLinks: [
        { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
        { text: "Atakum Tahılsız Mama", href: "/atakum-tahilsiz-mama" },
        { text: "Atakum ProPlan Mama", href: "/atakum-proplan-mama" },
        { text: "Samsun Royal Canin Mama", href: "/samsun-royal-canin-mama" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-buyuk-irk-kopek-mamasi",
      title: "Samsun Büyük Irk Köpek Maması",
      metaTitle: "Samsun Büyük Irk Köpek Maması | Maxi Formül | JETGO",
      metaDescription: "Samsun'da büyük ırk köpek maması (Golden, Labrador, Çoban köpekleri). Maxi formüllerde özel kalsiyum-fosfor dengesi.",
      keywords: "samsun büyük ırk köpek maması, samsun maxi köpek mama, samsun golden mama, samsun labrador mama, samsun çoban köpeği mama",
      h1: "Samsun Büyük Irk Köpek Maması",
      intro: [
        "Samsun'da büyük ırk köpekleriniz için (Golden Retriever, Labrador, Alman Çoban Köpeği, Kangal, Rottweiler) maxi formül kuru mama tedarikçisi JETGO Pet'tir. Eklem sağlığı için glukozamin-kondroitin, dengeli kalsiyum-fosfor oranı ve büyük tane yapısı.",
        "Pro Plan Large Breed Adult/Athletic, Royal Canin Maxi Adult, Brit Premium Adult Large, N&D Maxi Adult, Reflex Plus Maxi seçenekleri stoğumuzda.",
      ],
      features: [
        "Pro Plan Large Breed",
        "Royal Canin Maxi",
        "Brit Premium Adult Large",
        "N&D Maxi Adult",
        "Glukozamin + kondroitin destekli",
      ],
      faq: [
        { q: "Büyük ırk köpek mamasının farkı nedir?", a: "Daha büyük tane (yutkunmayı önler), eklem destek katkıları ve kalsiyum-fosfor dengesi içerir." },
        { q: "20 kg+ köpeğim için hangi gramaj?", a: "Genellikle 15 kg ve üzeri çuvallar ekonomiktir; akıllı mama hesaplama aracını kullanabilirsiniz." },
      ],
      internalLinks: [
        { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
        { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
        { text: "Atakum ProPlan Mama", href: "/atakum-proplan-mama" },
        { text: "Samsun En İyi Köpek Maması", href: "/samsun-en-iyi-kopek-mamasi" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-tahilsiz-mama",
      title: "Atakum Tahılsız Mama",
      metaTitle: "Atakum Tahılsız Mama (Grain Free) Kedi & Köpek | JETGO",
      metaDescription: "Atakum'da tahılsız (grain-free) kedi ve köpek maması: hassas mide ve alerji için ideal. N&D, Reflex Grain Free, Brit Grain Free.",
      keywords: "atakum tahılsız mama, atakum grain free, atakum hipoalerjenik mama, samsun tahılsız mama",
      h1: "Atakum Tahılsız Mama – Hassas Mide ve Alerji İçin",
      intro: [
        "Hassas sindirim, gıda alerjisi veya cilt problemleri olan evcil hayvanlar için tahılsız (grain-free) mamalar idealdir. Atakum'da N&D Grain Free (Farmina), Reflex Plus Grain Free, Brit Grain Free, ProChoice Grain Free ve Pronature Grain Free seçenekleri stoğumuzda.",
        "Atakum içi 60–90 dk teslimat, %5 nakit indirim ve %5 Para Puan kazanım.",
      ],
      features: [
        "N&D Farmina Grain Free",
        "Reflex Plus Grain Free",
        "Brit Grain Free",
        "Hassas mide ve alerji desteği",
        "Atakum içi hızlı teslim",
      ],
      faq: [
        { q: "Tahılsız mamayı her köpek/kedi yiyebilir mi?", a: "Çoğunluk yiyebilir; bilinen kalp hastalığı olan ırklarda veteriner görüşü alın." },
        { q: "Tahılsız mama daha mı pahalı?", a: "Genellikle premium kategorisindedir; ekonomik tahılsız seçeneklerimiz de var." },
      ],
      internalLinks: [
        { text: "Atakum Yavru Kedi Maması", href: "/atakum-yavru-kedi-mamasi" },
        { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
        { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
        { text: "Samsun Premium Mama", href: "/samsun-premium-mama" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-premium-mama",
      title: "Samsun Premium Mama",
      metaTitle: "Samsun Premium Mama | Süper-Premium Markalar | JETGO",
      metaDescription: "Samsun'da premium ve süper-premium kedi/köpek maması: Royal Canin, Hill's Science Plan, Pro Plan, N&D, Brit. Aynı gün teslim.",
      keywords: "samsun premium mama, samsun süper premium mama, samsun premium kedi mama, samsun premium köpek mama",
      h1: "Samsun Premium ve Süper-Premium Mama",
      intro: [
        "Premium mama; daha yüksek protein kaynağı, daha az dolgu maddesi ve daha dengeli besin içerir. Samsun'da JETGO Pet süper-premium kategoride Royal Canin, Hill's Science Plan, Pro Plan, N&D Farmina ve Brit Premium serilerini stoğunda bulundurur.",
        "Premium mama seçimi yaparken kedi/köpeğinizin yaş ve sağlık durumunu mutlaka göz önünde bulundurun. Akıllı mama hesaplama aracımız size yardımcı olur.",
      ],
      features: [
        "Royal Canin",
        "Hill's Science Plan",
        "Pro Plan",
        "N&D Farmina",
        "Brit Premium",
        "Aynı gün Samsun içi teslim",
      ],
      faq: [
        { q: "Premium ile ekonomik mama arasında fark nedir?", a: "Premium mamada protein kaynağı et bazlıdır, dolgu maddesi (mısır, soya) azdır ve genellikle daha az miktarda yedirilir." },
        { q: "Premium mama bütçemi zorluyor, alternatif var mı?", a: "Evet. Kampanyalı paketler ve büyük gramajlarla maliyet düşürebilirsiniz; açık mama tartım da seçenektir." },
      ],
      internalLinks: [
        { text: "Samsun En İyi Köpek Maması", href: "/samsun-en-iyi-kopek-mamasi" },
        { text: "Samsun Royal Canin Mama", href: "/samsun-royal-canin-mama" },
        { text: "Atakum ProPlan Mama", href: "/atakum-proplan-mama" },
        { text: "Atakum Tahılsız Mama", href: "/atakum-tahilsiz-mama" },
      ],
    }),
  ];
}

function buildTrustPages(): SeoPageData[] {
  return [
    buildLandingPage({
      slug: "samsun-sahte-mama-nasil-anlasilir",
      title: "Samsun'da Sahte Mama Nasıl Anlaşılır",
      metaTitle: "Samsun Sahte Mama Nasıl Anlaşılır? | Orijinal Tedarik | JETGO",
      metaDescription: "Samsun'da sahte mama nasıl anlaşılır? Etiket, ambalaj, lot numarası, üretim/SKT kontrolü. Orijinal Türkiye distribütör tedariki: JETGO Pet.",
      keywords: "samsun sahte mama, samsun sahte kedi maması, samsun sahte köpek maması, sahte mama nasıl anlaşılır, orijinal mama samsun",
      h1: "Samsun'da Sahte Mama Nasıl Anlaşılır?",
      intro: [
        "Samsun'da maalesef internet üzerinden ya da bazı yerlerden ucuz fiyata satılan mamalarda sahtelik veya 'paralel ithalat' (Türkiye dışında üretilmiş, garanti dışı) ürünlerle karşılaşılabilir. JETGO Pet olarak tüm ürünlerimizi orijinal Türkiye distribütörlerinden tedarik ediyoruz.",
        "Sahte mamayı anlamanın en temel yolları: etiket dilini kontrol edin (Türkçe Tarım Bakanlığı izinli mi?), lot numarası ve üretim/SKT tarihi okunabilir mi, ambalaj kalitesi düşük mü?",
      ],
      sections: [
        {
          h2: "Sahte Mamayı Anlamanın 6 Yolu",
          paragraphs: [
            "1. Türkçe etiket: Türkiye'de satılan tüm mamaların Türkçe etiket içermesi şarttır.",
            "2. Lot numarası ve üretim/SKT: Açıkça okunabilir olmalı; silinmiş veya etiketin üzerine yapıştırılmış görünmemeli.",
            "3. Ambalaj kalitesi: Yırtık, baskısı silik, renk farkları olan paketler şüphelidir.",
            "4. Mama görünümü: Renk, koku ve tane yapısında ani farklar dikkat gerektirir.",
            "5. Distribütör bilgisi: Etikette Türkiye distribütör/ithalatçı bilgisi olmalı.",
            "6. Fiyat: Piyasa fiyatının çok altında olan ürünlerde dikkatli olun.",
          ],
        },
      ],
      features: [
        "Orijinal Türkiye distribütör tedariki",
        "SKT kontrollü stok",
        "Türkçe etiketli tüm ürünler",
        "Lot/SKT şeffaflığı",
        "Şüphe varsa ücretsiz iade",
      ],
      faq: [
        { q: "JETGO'dan aldığım mamada sahtelik şüphem olursa?", a: "Hemen WhatsApp'tan iletişime geçin; ürünü ücretsiz alır, inceleme sonrası iade-değişim yaparız." },
        { q: "Paralel ithalat ürünü ile orijinal arasında fark nedir?", a: "Paralel ithalatta Türkiye distribütör garantisi olmaz; üretici ülkesi farklı olabilir." },
      ],
      internalLinks: [
        { text: "Atakum SKT Mama", href: "/atakum-son-kullanma-tarihi-mama" },
        { text: "Samsun Orijinal Mama", href: "/samsun-orijinal-mama-nereden-alinir" },
        { text: "Atakum Güvenilir Petshop", href: "/atakum-guvenilir-petshop" },
        { text: "Samsun Pet Shop Yorumları", href: "/samsun-petshop-yorumlari" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-son-kullanma-tarihi-mama",
      title: "Atakum SKT (Son Kullanma Tarihi) Mama",
      metaTitle: "Atakum SKT Kontrollü Mama | Taze Stok | JETGO Pet",
      metaDescription: "Atakum'da SKT (son kullanma tarihi) kontrollü mama. Sistemimiz SKT'si yakın ürünü siparişe almaz; SKT yakın olanlar indirimli ayrı bölümde.",
      keywords: "atakum son kullanma tarihi mama, atakum skt mama, atakum taze mama, atakum mama tarih kontrolü",
      h1: "Atakum SKT Kontrollü Mama – Taze Stok Garantisi",
      intro: [
        "JETGO Pet'in Atakum mağazasında satılan tüm mamalar son kullanma tarihi (SKT) kontrolünden geçer. Sistemimiz SKT'si yakın bir ürünü standart siparişe eklemenize izin vermez; bu ürünler 'Açık Mama / SKT Yakın' bölümünde indirimli olarak ayrı satılır.",
        "Sipariş öncesi sunucu tarafında SKT validasyonu yapılır; süresi geçmiş bir ürün hiçbir zaman size gönderilmez. Ürünün SKT'si ürün sayfasında belirtilir.",
      ],
      features: [
        "Sunucu tarafında SKT validasyonu",
        "SKT yakın ürünler ayrı, indirimli",
        "Tüm gıdada tarih şeffaflığı",
        "Açılmamış mamada 14 gün iade",
        "Ücretsiz değişim garantisi",
      ],
      faq: [
        { q: "SKT'ye ne kadar kalanı satıyorsunuz?", a: "SKT'sine 30 gün ve üstü kalan ürünler standart siparişe alınır. 30 gün ve altı ürünler indirimli SKT bölümüne taşınır." },
        { q: "SKT'si geçmiş ürün gelirse ne yapayım?", a: "Şu ana kadar gelmedi, ancak gelirse hemen WhatsApp'tan iletişime geçin; ücretsiz değişim ve iade yaparız." },
      ],
      internalLinks: [
        { text: "Açık Mama", href: "/acik-mama" },
        { text: "Samsun Sahte Mama", href: "/samsun-sahte-mama-nasil-anlasilir" },
        { text: "Samsun Orijinal Mama", href: "/samsun-orijinal-mama-nereden-alinir" },
        { text: "Atakum Güvenilir Petshop", href: "/atakum-guvenilir-petshop" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-orijinal-mama-nereden-alinir",
      title: "Samsun'da Orijinal Mama Nereden Alınır",
      metaTitle: "Samsun Orijinal Mama Nereden Alınır? | Güvenli Tedarik | JETGO",
      metaDescription: "Samsun'da orijinal mama nereden alınır? JETGO Pet, tüm ürünleri Türkiye orijinal distribütörlerinden tedarik eder. SKT kontrollü, Türkçe etiketli.",
      keywords: "samsun orijinal mama, samsun orijinal kedi maması, samsun orijinal köpek maması, samsun mama güvenli alışveriş",
      h1: "Samsun'da Orijinal Mama Nereden Alınır?",
      intro: [
        "Samsun'da orijinal mama almak için yapmanız gereken en basit kontrol: ürün etiketinde Türkiye distribütörü bilgisi var mı? JETGO Pet'in tüm ürünleri Türkiye orijinal distribütörlerinden alınır; Türkçe etiketli ve Tarım Bakanlığı kayıtlıdır.",
        "Orijinal ürün almak için şu kanalları tercih edin: yerli mağazalar (görüp dokunabilirsiniz), Türkiye distribütörü ile resmi anlaşmalı satıcılar, etiketinde Türkçe yazısı ve resmi distribütör bilgisi olan ürünler.",
      ],
      features: [
        "Türkiye distribütör tedariki",
        "Türkçe etiket zorunluluğu",
        "Lot/SKT şeffaflığı",
        "Şüphede ücretsiz iade",
        "JETGO Pet yerli mağaza güvencesi",
      ],
      faq: [
        { q: "İnternetten alınan mama orijinal olmayabilir mi?", a: "Maalesef internet pazarlarında bazı satıcılar paralel ithalat veya sahte ürünler satabiliyor. Yerli mağaza ve resmi distribütörü tercih edin." },
        { q: "JETGO Pet'in tüm ürünleri orijinal mi?", a: "Evet, tüm ürünler Türkiye orijinal distribütörlerinden alınır. Sahte/paralel ürün satışı yapılmaz." },
      ],
      internalLinks: [
        { text: "Samsun Sahte Mama Nasıl Anlaşılır", href: "/samsun-sahte-mama-nasil-anlasilir" },
        { text: "Atakum SKT Mama", href: "/atakum-son-kullanma-tarihi-mama" },
        { text: "Atakum Güvenilir Petshop", href: "/atakum-guvenilir-petshop" },
        { text: "Samsun Pet Shop Yorumları", href: "/samsun-petshop-yorumlari" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-guvenilir-petshop",
      title: "Atakum Güvenilir Petshop",
      metaTitle: "Atakum Güvenilir Petshop | Yerli Mağaza & Orijinal Ürün | JETGO",
      metaDescription: "Atakum'da güvenilir pet shop: yerli mağaza, orijinal Türkiye distribütör tedariki, SKT kontrollü, müşteri yorumları, 14 gün iade.",
      keywords: "atakum güvenilir petshop, atakum güvenilir pet shop, atakum yerli petshop, atakum kaliteli petshop",
      h1: "Atakum'da Güvenilir Pet Shop – JETGO Pet",
      intro: [
        "Atakum'da yıllardır hizmet veren JETGO Pet, yerli mağazasıyla Atakum sakinlerinin güvenilir pet shop'udur. Tüm ürünler Türkiye orijinal distribütörlerinden alınır; SKT şeffaftır; açılmamış üründe 14 gün iade hakkı vardır.",
        "Sahte ürün riskine karşı yerli ve fiziksel adresi olan bir pet shop'u tercih etmek en akıllıca yoldur. Mağazamız Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A'dadır.",
      ],
      features: [
        "Yerli mağaza, fiziksel adres",
        "Türkiye distribütör tedariki",
        "SKT kontrollü stok",
        "14 gün açılmamış iade",
        "Müşteri yorumları şeffaf",
      ],
      faq: [
        { q: "JETGO yıllardır mı hizmet veriyor?", a: "Evet. Sizpa İnternet Tic. Ltd. Şti. çatısı altında Atakum'da yıllardır faaliyet gösteriyoruz." },
        { q: "İade ve değişim politikanız ne?", a: "Açılmamış üründe 14 gün iade. Hatalı/hasarlı ürün ücretsiz değişim." },
      ],
      internalLinks: [
        { text: "Samsun Pet Shop Yorumları", href: "/samsun-petshop-yorumlari" },
        { text: "Mağaza & Konum", href: "/magaza" },
        { text: "Samsun Orijinal Mama", href: "/samsun-orijinal-mama-nereden-alinir" },
        { text: "Atakum SKT Mama", href: "/atakum-son-kullanma-tarihi-mama" },
      ],
    }),
    buildLandingPage({
      slug: "samsun-petshop-yorumlari",
      title: "Samsun Pet Shop Yorumları",
      metaTitle: "Samsun Pet Shop Yorumları | JETGO Müşteri Deneyimleri",
      metaDescription: "Samsun pet shop yorumları. JETGO Pet müşteri deneyimleri, hızlı teslimat, kapıda ödeme, orijinal ürün geri bildirimleri.",
      keywords: "samsun petshop yorumları, samsun pet shop yorumları, jetgo yorum, jetgo pet yorumları, samsun pet shop güvenilir mi",
      h1: "Samsun Pet Shop Yorumları – JETGO Pet Deneyimleri",
      intro: [
        "Samsun'da bir pet shop seçerken yorumları okumak büyük önem taşır. JETGO Pet, müşteri deneyimine ve şeffaflığa öncelik verir. Ürün sayfalarımızda gerçek müşteri yorumlarını yayınlıyoruz.",
        "Hız, orijinal ürün, kapıda ödeme kolaylığı ve müşteri hizmetlerimizle ilgili Atakum, İlkadım ve Canik müşterilerinden geri bildirim alıyoruz.",
      ],
      features: [
        "Gerçek müşteri yorumları",
        "Yıldız puanlama sistemi",
        "Hız geri bildirimleri",
        "Kapıda ödeme deneyimleri",
        "Veteriner mama tedarik geri bildirimleri",
      ],
      faq: [
        { q: "Yorumlar nereden okunabilir?", a: "Ürün detay sayfalarında, alt bölümde gerçek kullanıcı yorumları yer alır." },
        { q: "Yorumlar onaylı mı?", a: "Yayına almadan önce admin tarafından kontrol edilir; spam ve uygunsuz içerikler filtrelenir." },
      ],
      internalLinks: [
        { text: "Atakum Güvenilir Petshop", href: "/atakum-guvenilir-petshop" },
        { text: "Mağaza & Konum", href: "/magaza" },
        { text: "Samsun Orijinal Mama", href: "/samsun-orijinal-mama-nereden-alinir" },
        { text: "Samsun Sahte Mama", href: "/samsun-sahte-mama-nasil-anlasilir" },
      ],
    }),
    buildLandingPage({
      slug: "atakum-uygun-fiyatli-mama",
      title: "Atakum Uygun Fiyatlı Mama",
      metaTitle: "Atakum Uygun Fiyatlı Mama | Bütçe Dostu Markalar | JETGO",
      metaDescription: "Atakum'da uygun fiyatlı kedi ve köpek maması. Ekonomik markalar, kampanyalı paketler, açık mama tartım. %5 nakit indirim.",
      keywords: "atakum uygun fiyatlı mama, atakum ekonomik mama, atakum ucuz mama, atakum bütçe mama",
      h1: "Atakum Uygun Fiyatlı Kedi & Köpek Maması",
      intro: [
        "Atakum'da kalitenin tadını bütçe dostu fiyatlarla yaşayın. ProChoice, Felicia, Pronature gibi ekonomik markalar; kampanyalı büyük paketler; açık mama tartım hizmeti ile her bütçeye uygun seçenek.",
        "Kapıda nakit ödemede %5 indirim, üyelik ile %5 Para Puan: toplamda %10'a varan tasarruf.",
      ],
      features: [
        "Ekonomik markalar (ProChoice, Felicia)",
        "Kampanya paketleri",
        "Açık mama tartım (500 g+)",
        "%5 nakit indirim",
        "%5 Para Puan kazanım",
      ],
      faq: [
        { q: "En ekonomik mama nasıl seçilir?", a: "Açık mama tartımı veya büyük gramajlı kampanya paketleri en ekonomiktir." },
        { q: "Kampanyalar değişiyor mu?", a: "Evet. /kampanya sayfasından güncel listeyi görebilirsiniz." },
      ],
      internalLinks: [
        { text: "Samsun Ucuz Kedi Maması", href: "/samsun-ucuz-kedi-mamasi" },
        { text: "Açık Mama", href: "/acik-mama" },
        { text: "Kampanyalar", href: "/kampanya" },
        { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      ],
    }),
  ];
}

const PRODUCT_SEO_PAGES: SeoPageData[] = [
  {
    slug: "samsun-kedi-acik-mama",
    type: "category",
    title: "Kedi Açık Mama Samsun",
    metaTitle: "Kedi Açık Mama Samsun | Gramajlı Kedi Maması Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da kedi açık mama kapıya teslim. Pro Plan, Hill's, Royal Canin, N&D açık mama gramajlı satış. İstediğiniz kadar alın, israfı önleyin. JETGO.",
    keywords: "kedi açık mama samsun, açık kedi maması, gramajlı kedi maması samsun, tartılı kedi maması, açık mama petshop samsun, samsun kedi açık mama fiyat, atakum kedi açık mama",
    h1: "Kedi Açık Mama - Samsun Gramajlı Satış Kapıya Teslim",
    intro: [
      "Kediniz için açık mama mı arıyorsunuz? JETGO'da Pro Plan, Hill's, Royal Canin, ProChoice, N&D, Enjoy ve Reflex markalarının kedi açık mamalarını gramajlı olarak satın alabilirsiniz. İstediğiniz miktarı alın, büyük paket almak zorunda kalmayın.",
      "Samsun'da kedi açık mama satışı yapan JETGO, tüm premium markaların açık mamalarını hijyenik koşullarda saklayarak kapınıza teslim eder. Kedinizin beğenisini test etmek, farklı markaları denemek veya bütçenize uygun miktarda almak için açık mama ideal çözümdür.",
      "Açık mama fiyatları kg bazında hesaplanır ve genellikle paketli mamaya göre daha ekonomiktir. Nakit ödemede ekstra avantajlı fiyat ve her siparişte %5 Para Puan kazanımı geçerlidir.",
    ],
    sections: [
      {
        h2: "Kedi Açık Mama Markaları",
        paragraphs: [
          "JETGO'da Pro Plan kedi açık mama, Hill's kedi açık mama, Royal Canin kedi açık mama, ProChoice kedi açık mama, N&D kedi açık mama, Enjoy kedi açık mama ve Reflex kedi açık mama seçenekleri mevcuttur. Her markanın yavru, yetişkin ve kısırlaştırılmış kedi formülleri açık olarak satılmaktadır.",
          "Açık mama satın almanın avantajları: israfı önlersiniz, farklı markaları deneyebilirsiniz, bütçenize göre miktar belirlersiniz ve kedinizin damak zevkine uygun mamayı bulana kadar küçük miktarlarda test edebilirsiniz.",
        ],
        list: [
          "Pro Plan Açık Mama: Yavru, Yetişkin, Kısır - Kg bazlı satış",
          "Hill's Açık Mama: Adult, Kitten, Sterilised formülleri",
          "Royal Canin Açık Mama: FIT 32, Indoor, Sensible, Sterilised",
          "N&D Açık Mama: Düşük Tahıllı ve Tahılsız seçenekler",
          "ProChoice Açık Mama: Ekonomik premium alternatif",
          "Reflex Açık Mama: Uygun fiyatlı kaliteli seçenek",
        ],
      },
    ],
    faq: [
      { q: "Samsun'da kedi açık mama nereden alınır?", a: "JETGO petshop'ta Pro Plan, Hill's, Royal Canin ve diğer markaların açık mamalarını gramajlı olarak satın alabilirsiniz. Kapıya teslim." },
      { q: "Açık mama hijyenik mi?", a: "Evet, JETGO'da tüm açık mamalar hijyenik koşullarda saklanır ve paketlenerek teslim edilir." },
      { q: "Açık mama fiyatları ne kadar?", a: "Açık mama fiyatları markaya göre kg bazında değişir. Genellikle paketli mamaya göre daha ekonomiktir." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "En İyi Kedi Maması", href: "/kedi-mamasi-en-iyi-markalar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
    ],
  },
  {
    slug: "samsun-kedi-yas-mama",
    type: "category",
    title: "Kedi Yaş Mama Samsun",
    metaTitle: "Kedi Yaş Mama Samsun | Pouch Konserve Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da kedi yaş mama kapıya teslim. Pouch, konserve, pate kedi yaş mamaları. Premium markalar uygun fiyat. Aynı gün teslimat. JETGO Pet Shop.",
    keywords: "kedi yaş mama samsun, kedi pouch mama samsun, kedi konserve mama samsun, yaş kedi maması, kedi pate samsun, samsun kedi yaş mama fiyat, atakum kedi yaş mama",
    h1: "Kedi Yaş Mama - Samsun Kapıya Teslim",
    intro: [
      "Kedinizin damak zevkine hitap eden yaş mama çeşitlerini JETGO'da bulun. Pouch, konserve ve pate formlarında kedi yaş mamalarını Samsun'da kapınıza teslim ediyoruz. Premium markalar uygun fiyatlarla.",
      "Kedi yaş mamalar hem lezzet hem de su alımı açısından önemlidir. Özellikle az su içen kediler için yaş mama takviyesi veterinerler tarafından önerilmektedir. Günlük öğünlere yaş mama eklemek kedinizin sağlığına katkı sağlar.",
      "Samsun'da kedi yaş mama çeşitlerimiz arasında tavuklu, ton balıklı, biftekli, ciğerli ve karışık lezzet seçenekleri bulunmaktadır. Yavru ve yetişkin kedi formülleri mevcuttur.",
    ],
    sections: [
      {
        h2: "Kedi Yaş Mama Çeşitleri ve Avantajları",
        paragraphs: [
          "Kedi yaş mamaları pouch (tek öğünlük paket), konserve (büyük boy) ve pate (ezme kıvam) olarak üç ana formda sunulmaktadır. Pouch mamalar günlük kullanım için pratiktir. Konserveler büyük boy paketlerle daha ekonomiktir. Pateler özellikle yaşlı ve diş problemi olan kediler için uygundur.",
          "Samsun kedi yaş mama fiyatları 15-80 TL arasında değişmektedir. Toplu alımda adet başı fiyat avantajı sunuyoruz. Nakit ödemede ekstra avantajlı fiyat geçerlidir.",
        ],
      },
    ],
    faq: [
      { q: "Kedi yaş mama günde kaç kez verilir?", a: "Yetişkin kedilere günde 1-2 pouch veya kuru mamanın yanına takviye olarak verilebilir. Veterinerinize danışmanızı öneririz." },
      { q: "Samsun'da kedi yaş mama kapıya teslim var mı?", a: "Evet, JETGO tüm kedi yaş mama çeşitlerini Samsun merkez ilçelerine aynı gün kapıya teslim eder." },
      { q: "En iyi kedi yaş mama hangisi?", a: "Royal Canin, Hill's ve Pro Plan yaş mamaları veteriner onaylı premium seçeneklerdir. JETGO'da mevcuttur." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Konserve", href: "/samsun-kedi-konserve" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
    ],
  },
  {
    slug: "samsun-kedi-konserve",
    type: "category",
    title: "Kedi Konserve Samsun",
    metaTitle: "Kedi Konserve Samsun | Premium Konserve Mama Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da kedi konserve mama kapıya teslim. Ton balıklı, tavuklu, biftekli konserve kedi maması. Premium markalar. Aynı gün teslimat. JETGO.",
    keywords: "kedi konserve samsun, kedi konserve mama, konserve kedi maması samsun, kedi konserve fiyat, samsun kedi konserve kapıya teslim",
    h1: "Kedi Konserve Mama - Samsun Kapıya Teslim",
    intro: [
      "Kediniz için lezzetli ve besleyici konserve mama çeşitlerini JETGO'da bulun. Ton balıklı, tavuklu, biftekli, ciğerli ve karışık lezzet konserve kedi mamaları Samsun'da kapınıza teslim.",
      "Kedi konserve mamaları yüksek protein içeriği ve doğal lezzetleriyle kedilerin en sevdiği mama türüdür. Özel günlerde veya düzenli beslenme programına ek olarak kullanılabilir. JETGO'da geniş konserve mama yelpazesi mevcut.",
      "Samsun kedi konserve fiyatları 25-120 TL arasında değişmektedir. Toplu alımda adet başı fiyat avantajı sunuyoruz. Nakit ödemede ekstra avantajlı fiyat ve %5 Para Puan.",
    ],
    faq: [
      { q: "Kedi konserve mama sağlıklı mı?", a: "Evet, konserve mamalar yüksek protein ve nem içeriğiyle kediler için sağlıklı bir besin kaynağıdır. Kuru mama yanına takviye olarak ideal." },
      { q: "Samsun'da kedi konserve nereden alınır?", a: "JETGO petshop'ta geniş konserve mama çeşitleri mevcuttur. Aynı gün kapıya teslim edilir." },
      { q: "Kedi konserve mama ne kadar?", a: "Konserve kedi maması fiyatları marka ve gramaja göre 25-120 TL arasında değişmektedir." },
    ],
    internalLinks: [
      { text: "Kedi Yaş Mama", href: "/samsun-kedi-yas-mama" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Ödül Mama", href: "/samsun-kedi-odul-mama" },
    ],
  },
  {
    slug: "samsun-kedi-malt-vitamin",
    type: "category",
    title: "Kedi Malt Vitamin Samsun",
    metaTitle: "Kedi Malt Vitamin Macun Samsun | Tüy Yumağı Önleyici | JETGO Petshop",
    metaDescription: "Samsun'da kedi malt, vitamin ve macun ürünleri kapıya teslim. Tüy yumağı önleyici malt, bağışıklık vitamini, taurin takviyesi. JETGO Pet Shop.",
    keywords: "kedi malt samsun, kedi vitamin samsun, kedi macun samsun, kedi malt macun, tüy yumağı kedi, kedi bağışıklık vitamini, kedi taurin, samsun kedi vitamin fiyat",
    h1: "Kedi Malt, Vitamin ve Macun - Samsun Kapıya Teslim",
    intro: [
      "Kedinizin sağlığı için malt, vitamin ve macun takviyelerini JETGO'da bulun. Tüy yumağı önleyici malt macunlar, bağışıklık güçlendirici vitaminler ve taurin takviyeleri Samsun'da kapınıza teslim.",
      "Kedi malt macunları tüy yumağı oluşumunu önleyerek kedinizin sindirim sistemini korur. Özellikle uzun tüylü kediler ve tüy dökme dönemlerinde düzenli malt kullanımı önerilmektedir. Vitamin takviyeleri bağışıklık sistemini güçlendirir.",
      "JETGO'da kedi malt, kedi vitamin, kedi macun ve kedi takviye ürünlerini uygun fiyatlarla sunuyoruz. Tüm ürünler Samsun merkez ilçelerine aynı gün kapıya teslim edilmektedir.",
    ],
    sections: [
      {
        h2: "Kedi Malt ve Vitamin Çeşitleri",
        paragraphs: [
          "Kedi malt macunları tüy yumağı önleyici formülle üretilir. Günlük 2-3 cm macun kedinize vererek tüy yumağı sorunlarını önleyebilirsiniz. Kedi vitaminleri bağışıklık güçlendirici, kemik ve eklem destekleyici, tüy sağlığı ve cilt bakımı formüllerinde mevcuttur.",
          "Taurin takviyesi kediler için hayati önem taşır. Kediler taurinı vücutlarında üretemez, bu nedenle dışarıdan takviye almaları gerekir. Kalp ve göz sağlığı için önemlidir.",
        ],
      },
    ],
    faq: [
      { q: "Kedi malt macun ne işe yarar?", a: "Kedi malt macunları tüy yumağı oluşumunu önler. Kediler tüylerini yalarken yutulan tüylerin sindirim sisteminde birikmesini engeller." },
      { q: "Kediye vitamin vermek gerekli mi?", a: "Premium mama kullanan kedilerde genellikle ek vitamin gerekli değildir. Ancak yaşlı, hamile veya hasta kedilerde veteriner önerisiyle vitamin takviyesi faydalı olabilir." },
      { q: "Samsun'da kedi vitamini nereden alınır?", a: "JETGO petshop'ta kedi malt, vitamin ve macun ürünleri mevcuttur. Aynı gün kapıya teslim edilir." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Bakım Sağlık", href: "/samsun-kedi-bakim-saglik" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Ödül Mama", href: "/samsun-kedi-odul-mama" },
    ],
  },
  {
    slug: "samsun-kedi-odul-mama",
    type: "category",
    title: "Kedi Ödül Maması Samsun",
    metaTitle: "Kedi Ödül Maması Samsun | Stick Treat Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da kedi ödül maması kapıya teslim. Stick, treat, çubuk ödül, creme pate ödül. Eğitim ve ödüllendirme için. JETGO Pet Shop.",
    keywords: "kedi ödül maması samsun, kedi stick samsun, kedi treat samsun, kedi ödül çubuk, kedi creme pate, samsun kedi ödül mama fiyat",
    h1: "Kedi Ödül Maması - Samsun Kapıya Teslim",
    intro: [
      "Kedinizi ödüllendirmek için çeşitli lezzet seçenekleriyle kedi ödül mamalarını JETGO'da bulun. Stick, treat, çubuk ödül ve creme pate formlarında ödül mamaları Samsun'da kapınıza teslim.",
      "Kedi ödül mamaları eğitim süreçlerinde, veteriner ziyaretlerinden sonra veya kedinizle bağınızı güçlendirmek için idealdir. Düşük kalorili seçenekler kilo kontrolü yapan kediler için uygundur.",
      "Samsun kedi ödül maması fiyatları 10-80 TL arasında değişmektedir. Tavuklu, ton balıklı, somon ve karides lezzetleri mevcut. JETGO'da nakit ödemede avantajlı fiyat.",
    ],
    faq: [
      { q: "Kedi ödül maması günde kaç tane verilir?", a: "Günde 3-5 stick veya paket üzerindeki öneriye göre verilebilir. Aşırı ödül mama kedinizin ana mama iştahını azaltabilir." },
      { q: "Samsun'da kedi ödül maması nereden alınır?", a: "JETGO petshop'ta geniş kedi ödül maması çeşitleri mevcuttur. Aynı gün kapıya teslim." },
      { q: "En iyi kedi ödül maması hangisi?", a: "Creamy pate ve stick ödüller kedilerin en çok sevdiği türlerdir. Doğal içerikli, katkısız ödül mamaları önerilir." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Yaş Mama", href: "/samsun-kedi-yas-mama" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Kedi Malt Vitamin", href: "/samsun-kedi-malt-vitamin" },
    ],
  },
  {
    slug: "samsun-kedi-bakim-saglik",
    type: "category",
    title: "Kedi Bakım Sağlık Ürünleri Samsun",
    metaTitle: "Kedi Bakım Sağlık Ürünleri Samsun | Şampuan Tırnak Diş Bakım | JETGO",
    metaDescription: "Samsun'da kedi bakım ve sağlık ürünleri kapıya teslim. Kedi şampuanı, tırnak makası, diş bakım, kulak temizleyici, pire önleyici. JETGO Pet Shop.",
    keywords: "kedi bakım ürünleri samsun, kedi şampuanı samsun, kedi tırnak makası, kedi diş bakım, kedi kulak temizleyici, kedi pire spreyi samsun, kedi sağlık ürünleri",
    h1: "Kedi Bakım ve Sağlık Ürünleri - Samsun Kapıya Teslim",
    intro: [
      "Kedinizin bakım ve sağlık ihtiyaçları için gereken tüm ürünleri JETGO'da bulun. Kedi şampuanı, tırnak makası, diş bakım seti, kulak temizleyici, göz bakım ve pire önleyici ürünler Samsun'da kapınıza teslim.",
      "Düzenli bakım kedinizin sağlığı ve mutluluğu için çok önemlidir. Tırnak kesimi, diş fırçalama, kulak temizliği ve tüy bakımı gibi rutin bakım işlemlerini evde kolayca yapabilirsiniz. İhtiyacınız olan tüm bakım ürünleri JETGO'da mevcut.",
      "Kedi sağlık ürünleri arasında pire ve kene önleyici damlalar, iç-dış parazit koruyucular ve yara bakım ürünleri de bulunmaktadır. Tüm ürünler aynı gün kapıya teslim.",
    ],
    faq: [
      { q: "Kediye ne sıklıkla banyo yaptırılır?", a: "Kediler genellikle kendi temizliklerini yapar. 2-3 ayda bir veya kirlendiklerinde banyo yeterlidir. Kedi şampuanı kullanılmalıdır." },
      { q: "Samsun'da kedi bakım ürünleri nereden alınır?", a: "JETGO petshop'ta kedi şampuanı, tırnak makası, diş bakım ve tüm bakım ürünleri mevcuttur. Kapıya teslim." },
      { q: "Kedi tırnakları ne zaman kesilmeli?", a: "Kedi tırnakları 2-3 haftada bir kontrol edilmeli ve uzadıysa kesilmelidir. Özel kedi tırnak makası kullanılmalıdır." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Kedi Taşıma", href: "/samsun-kedi-tasima" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kedi-tuvaleti",
    type: "category",
    title: "Kedi Tuvaleti Samsun",
    metaTitle: "Kedi Tuvaleti Samsun | Kapalı Açık Kedi Kabı Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da kedi tuvaleti kapıya teslim. Kapalı kedi tuvaleti, açık kedi kabı, elekli tuvalet, kedi kumu küreği. Premium markalar. JETGO Pet Shop.",
    keywords: "kedi tuvaleti samsun, kedi kabı samsun, kapalı kedi tuvaleti, açık kedi tuvaleti, elekli kedi tuvaleti, kedi kumu küreği samsun, kedi tuvaleti fiyat samsun",
    h1: "Kedi Tuvaleti - Samsun Kapıya Teslim",
    intro: [
      "Kediniz için uygun kedi tuvaletini JETGO'da bulun. Kapalı kedi tuvaleti, açık kedi kabı, elekli tuvalet ve self-clean modelleri Samsun'da kapınıza teslim. Kedi kumu küreği ve hijyen aksesuarları da mevcut.",
      "Kedi tuvaleti seçimi kedinizin konforu için önemlidir. Kapalı tuvaletler koku kontrolü sağlar, açık tuvaletler ise kedilerin girip çıkmasını kolaylaştırır. Evinizdeki alana ve kedinizin tercihine göre uygun modeli seçebilirsiniz.",
      "Samsun kedi tuvaleti fiyatları modele göre 150-800 TL arasında değişmektedir. JETGO'da nakit ödemede avantajlı fiyat ve %5 Para Puan kazanımı geçerlidir.",
    ],
    faq: [
      { q: "Kapalı mı açık mı kedi tuvaleti?", a: "Kapalı tuvaletler koku kontrolü sağlar ama bazı kediler kapalı alanları sevmez. Kedinizin tercihine göre seçim yapabilirsiniz." },
      { q: "Samsun'da kedi tuvaleti nereden alınır?", a: "JETGO petshop'ta kapalı, açık ve elekli kedi tuvaleti modelleri mevcuttur. Kapıya teslim edilir." },
      { q: "Kedi tuvaleti ne kadar?", a: "Kedi tuvaleti fiyatları modele göre 150-800 TL arasında değişmektedir. Nakit ödemede avantajlı fiyat." },
    ],
    internalLinks: [
      { text: "Kedi Kumu", href: "/kedi-kumu" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Bakım", href: "/samsun-kedi-bakim-saglik" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kedi-tasima",
    type: "category",
    title: "Kedi Taşıma Çantası Samsun",
    metaTitle: "Kedi Taşıma Çantası Samsun | Taşıma Kabı Kafes Kapıya Teslim | JETGO",
    metaDescription: "Samsun'da kedi taşıma çantası ve kabı kapıya teslim. Ferplast Atlas, sırt çantası, kabin boy taşıma. Veteriner ve seyahat için. JETGO Pet Shop.",
    keywords: "kedi taşıma çantası samsun, kedi taşıma kabı samsun, kedi kafesi samsun, kedi taşıma sırt çantası, ferplast kedi taşıma, kedi taşıma fiyat samsun",
    h1: "Kedi Taşıma Çantası ve Kabı - Samsun Kapıya Teslim",
    intro: [
      "Kedinizi veterinere götürürken veya seyahatte taşımak için uygun taşıma çantası ve kabını JETGO'da bulun. Ferplast Atlas, sırt çantası, kabin boy taşıma ve plastik taşıma kabı modelleri Samsun'da kapınıza teslim.",
      "Kedi taşıma çantası seçimi kedinizin güvenliği ve konforu için önemlidir. Havalandırma delikleri, güvenli kilit sistemi ve yeterli alan taşıma kabının olmazsa olmazlarıdır. Seyahat, veteriner ziyareti ve taşınma gibi durumlarda kaliteli taşıma kabı şarttır.",
      "Samsun kedi taşıma fiyatları modele göre 200-1.500 TL arasında değişmektedir. JETGO'da nakit ödemede avantajlı fiyat.",
    ],
    faq: [
      { q: "En iyi kedi taşıma çantası hangisi?", a: "Ferplast Atlas plastik taşıma kabları dayanıklılık ve güvenlik açısından en çok tercih edilen modellerdir." },
      { q: "Samsun'da kedi taşıma çantası nereden alınır?", a: "JETGO petshop'ta Ferplast ve diğer markaların kedi taşıma çantası ve kabı modelleri mevcuttur. Kapıya teslim." },
      { q: "Kedi taşıma kabı ne kadar?", a: "Fiyatlar modele göre 200-1.500 TL arasında değişir. Nakit ödemede avantajlı fiyat." },
    ],
    internalLinks: [
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Kedi Bakım", href: "/samsun-kedi-bakim-saglik" },
      { text: "Pet Aksesuar", href: "/pet-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kopek-acik-mama",
    type: "category",
    title: "Köpek Açık Mama Samsun",
    metaTitle: "Köpek Açık Mama Samsun | Gramajlı Köpek Maması Kapıya Teslim | JETGO",
    metaDescription: "Samsun'da köpek açık mama kapıya teslim. Pro Plan, Hill's, Royal Canin, Reflex açık mama gramajlı satış. İstediğiniz kadar alın. JETGO Pet Shop.",
    keywords: "köpek açık mama samsun, açık köpek maması, gramajlı köpek maması samsun, tartılı köpek maması, açık mama köpek petshop samsun",
    h1: "Köpek Açık Mama - Samsun Gramajlı Satış Kapıya Teslim",
    intro: [
      "Köpeğiniz için açık mama mı arıyorsunuz? JETGO'da Pro Plan, Hill's, Royal Canin ve Reflex markalarının köpek açık mamalarını gramajlı olarak satın alabilirsiniz. Büyük paket almadan istediğiniz miktarda mama alın.",
      "Samsun'da köpek açık mama satışı yapan JETGO, tüm premium markaların açık mamalarını hijyenik koşullarda kapınıza teslim eder. Yeni mama denemek, bütçeye uygun miktar almak veya geçici dönemler için açık mama ideal çözümdür.",
      "Açık mama fiyatları kg bazında hesaplanır. Nakit ödemede ekstra avantajlı fiyat ve her siparişte %5 Para Puan kazanımı geçerlidir.",
    ],
    faq: [
      { q: "Samsun'da köpek açık mama nereden alınır?", a: "JETGO petshop'ta Pro Plan, Hill's, Royal Canin ve Reflex köpek açık mamaları gramajlı olarak mevcuttur. Kapıya teslim." },
      { q: "Açık mama kaliteli mi?", a: "Evet, açık mamalar paketli mamalarla aynı üründür. JETGO'da hijyenik koşullarda saklanır ve paketlenir." },
      { q: "Köpek açık mama fiyatları ne kadar?", a: "Açık mama fiyatları markaya göre kg bazında değişir. Genellikle büyük paket fiyatına yakın seyreder." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Köpek Ödül Kemik", href: "/samsun-kopek-odul-kemik" },
    ],
  },
  {
    slug: "samsun-kopek-yas-mama",
    type: "category",
    title: "Köpek Yaş Mama Samsun",
    metaTitle: "Köpek Yaş Mama Samsun | Konserve Pouch Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da köpek yaş mama kapıya teslim. Konserve, pouch, pate köpek yaş maması. Premium markalar uygun fiyat. Aynı gün teslimat. JETGO.",
    keywords: "köpek yaş mama samsun, köpek konserve mama samsun, köpek pouch mama, köpek pate mama, samsun köpek yaş mama fiyat",
    h1: "Köpek Yaş Mama - Samsun Kapıya Teslim",
    intro: [
      "Köpeğinizin damak zevkine hitap eden yaş mama çeşitlerini JETGO'da bulun. Konserve, pouch ve pate formlarında köpek yaş mamaları Samsun'da kapınıza teslim ediyoruz.",
      "Köpek yaş mamaları lezzet açısından köpeklerin en çok sevdiği mama türüdür. Kuru mama yanına takviye olarak veya tek başına ana öğün olarak kullanılabilir. Su alımı düşük köpekler için yaş mama önerilir.",
      "Samsun köpek yaş mama fiyatları 20-100 TL arasında değişmektedir. Tavuklu, biftekli, kuzu etli ve balıklı lezzet seçenekleri mevcut.",
    ],
    faq: [
      { q: "Köpek yaş mama günde ne kadar verilir?", a: "Köpeğinizin kilosuna göre değişir. Paket üzerindeki önerilen porsiyon bilgisini takip edin veya veterinerinize danışın." },
      { q: "Samsun'da köpek yaş mama kapıya teslim var mı?", a: "Evet, JETGO tüm köpek yaş mama çeşitlerini Samsun merkez ilçelerine aynı gün kapıya teslim eder." },
      { q: "En iyi köpek yaş mama hangisi?", a: "Royal Canin, Hill's ve Pro Plan yaş mamaları premium kalitede seçeneklerdir. JETGO'da mevcuttur." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Ödül Kemik", href: "/samsun-kopek-odul-kemik" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Köpek Bakım", href: "/samsun-kopek-bakim-saglik" },
    ],
  },
  {
    slug: "samsun-kopek-odul-kemik",
    type: "category",
    title: "Köpek Ödül Kemik Samsun",
    metaTitle: "Köpek Ödül Kemik Samsun | Çiğneme Kemikleri Stick | JETGO Petshop",
    metaDescription: "Samsun'da köpek ödül kemik ve çiğneme ürünleri kapıya teslim. Doğal kemik, dental stick, eğitim ödülü. Premium markalar. JETGO Pet Shop.",
    keywords: "köpek ödül kemik samsun, köpek çiğneme kemikleri, köpek dental stick, köpek eğitim ödülü, köpek ödül maması samsun, köpek kemik fiyat samsun",
    h1: "Köpek Ödül Kemik ve Çiğneme Ürünleri - Samsun",
    intro: [
      "Köpeğinizi ödüllendirmek ve diş sağlığını desteklemek için ödül kemik ve çiğneme ürünlerini JETGO'da bulun. Doğal kemikler, dental stickler, eğitim ödülleri ve çiğneme oyuncakları Samsun'da kapınıza teslim.",
      "Köpek ödül kemikleri eğitim süreçlerinde motivasyon aracı olarak kullanılır. Dental stickler diş taşı oluşumunu önler ve ağız hijyenini destekler. Çiğneme kemikleri ise köpeğinizin doğal çiğneme ihtiyacını karşılar.",
      "Samsun köpek ödül kemik fiyatları 15-150 TL arasında değişmektedir. Doğal, katkısız ve düşük kalorili seçenekler mevcut.",
    ],
    faq: [
      { q: "Köpek kemikleri güvenli mi?", a: "Evet, JETGO'da satılan ödül kemikleri evcil hayvanlar için üretilmiş güvenli ürünlerdir. Köpeğinizin boyutuna uygun kemik seçmeniz önemlidir." },
      { q: "Samsun'da köpek ödül kemik nereden alınır?", a: "JETGO petshop'ta geniş köpek ödül kemik ve çiğneme ürünleri çeşitleri mevcuttur. Kapıya teslim." },
      { q: "Dental stick ne işe yarar?", a: "Dental stickler köpeğinizin dişlerini temizler, diş taşı oluşumunu önler ve ağız kokusunu azaltır." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Yaş Mama", href: "/samsun-kopek-yas-mama" },
      { text: "Köpek Bakım", href: "/samsun-kopek-bakim-saglik" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kopek-bakim-saglik",
    type: "category",
    title: "Köpek Bakım Sağlık Ürünleri Samsun",
    metaTitle: "Köpek Bakım Sağlık Ürünleri Samsun | Şampuan Pire Önleyici | JETGO",
    metaDescription: "Samsun'da köpek bakım ve sağlık ürünleri kapıya teslim. Köpek şampuanı, pire spreyi, tırnak makası, diş bakım, kulak temizleyici. JETGO Pet Shop.",
    keywords: "köpek bakım ürünleri samsun, köpek şampuanı samsun, köpek pire spreyi, köpek tırnak makası, köpek diş bakım, köpek sağlık ürünleri samsun",
    h1: "Köpek Bakım ve Sağlık Ürünleri - Samsun Kapıya Teslim",
    intro: [
      "Köpeğinizin bakım ve sağlık ihtiyaçları için gereken tüm ürünleri JETGO'da bulun. Köpek şampuanı, pire ve kene önleyici, tırnak makası, diş bakım seti ve kulak temizleyici ürünler Samsun'da kapınıza teslim.",
      "Düzenli bakım köpeğinizin sağlığı ve yaşam kalitesi için çok önemlidir. Banyo, tırnak kesimi, diş fırçalama ve kulak temizliği gibi bakım rutinlerini evde kolayca uygulayabilirsiniz.",
      "Pire ve kene mevsiminde koruyucu ürünler kullanmak köpeğinizi parazitlerden korur. JETGO'da çeşitli pire önleyici damla, sprey ve tasma seçenekleri mevcuttur.",
    ],
    faq: [
      { q: "Köpek ne sıklıkla yıkanır?", a: "Köpekler genellikle ayda 1-2 kez yıkanmalıdır. Çok sık yıkama cilt kuruluğuna neden olabilir. Köpek şampuanı kullanılmalıdır." },
      { q: "Samsun'da köpek bakım ürünleri nereden alınır?", a: "JETGO petshop'ta köpek şampuanı, pire önleyici ve tüm bakım ürünleri mevcuttur. Kapıya teslim." },
      { q: "Köpek pire spreyi ne zaman kullanılır?", a: "Pire mevsiminde (ilkbahar-yaz) düzenli kullanım önerilir. Veterinerinize danışarak uygun ürünü seçebilirsiniz." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Ödül Kemik", href: "/samsun-kopek-odul-kemik" },
      { text: "Pet Aksesuar", href: "/pet-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kopek-tuvalet-malzemeleri",
    type: "category",
    title: "Köpek Tuvalet Malzemeleri Samsun",
    metaTitle: "Köpek Tuvalet Malzemeleri Samsun | Çiş Pedi Hijyen | JETGO Petshop",
    metaDescription: "Samsun'da köpek tuvalet malzemeleri kapıya teslim. Çiş eğitim pedi, köpek bezi, hijyen spreyi, tuvalet eğitim ürünleri. JETGO Pet Shop.",
    keywords: "köpek tuvalet malzemeleri samsun, köpek çiş pedi samsun, köpek bezi samsun, köpek tuvalet eğitim, köpek hijyen spreyi, çiş pedi fiyat samsun",
    h1: "Köpek Tuvalet Malzemeleri - Samsun Kapıya Teslim",
    intro: [
      "Köpeğinizin tuvalet eğitimi ve hijyeni için gereken tüm malzemeleri JETGO'da bulun. Çiş eğitim pedleri, köpek bezleri, hijyen spreyleri ve tuvalet eğitim aksesuarları Samsun'da kapınıza teslim.",
      "Yavru köpek tuvalet eğitiminde çiş pedleri vazgeçilmez bir araçtır. Emici ve kaymaz tabanlı pedler ev içi hijyeni korur. Yaşlı veya hasta köpekler için de köpek bezleri ve hijyen pedleri mevcuttur.",
      "Samsun köpek çiş pedi fiyatları paket boyutuna göre 50-250 TL arasında değişmektedir. Toplu alımda avantajlı fiyatlar sunuyoruz.",
    ],
    faq: [
      { q: "Yavru köpek tuvalet eğitimi için ne gerekli?", a: "Çiş eğitim pedleri, tuvalet spreyi ve sabır! JETGO'da tüm tuvalet eğitim ürünleri mevcuttur." },
      { q: "Köpek çiş pedi ne kadar?", a: "Paket boyutuna göre 50-250 TL arasında. Büyük paketlerde adet başı daha ekonomik." },
      { q: "Samsun'da köpek tuvalet malzemeleri nereden alınır?", a: "JETGO petshop'ta çiş pedi, köpek bezi ve hijyen ürünleri mevcuttur. Kapıya teslim." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Bakım", href: "/samsun-kopek-bakim-saglik" },
      { text: "Pet Aksesuar", href: "/pet-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kopek-tasima-kulube",
    type: "category",
    title: "Köpek Taşıma ve Kulübe Samsun",
    metaTitle: "Köpek Taşıma Kulübe Samsun | Taşıma Kabı Araba Kafesi | JETGO Petshop",
    metaDescription: "Samsun'da köpek taşıma kabı ve kulübe kapıya teslim. Köpek arabası, araba kafesi, plastik taşıma, seyahat kafesi. JETGO Pet Shop.",
    keywords: "köpek taşıma kabı samsun, köpek kulübe samsun, köpek arabası samsun, köpek araba kafesi, köpek seyahat kafesi, köpek taşıma fiyat samsun",
    h1: "Köpek Taşıma Kabı ve Kulübe - Samsun Kapıya Teslim",
    intro: [
      "Köpeğinizi güvenle taşımak için taşıma kabı, kulübe ve araba kafesi seçeneklerini JETGO'da bulun. Küçük ırk köpekler için taşıma çantası, orta-büyük ırk için plastik taşıma kabı ve araba kafesi modelleri mevcut.",
      "Köpek taşıma kabı veteriner ziyaretleri, seyahat ve taşınma gibi durumlarda güvenli ulaşım sağlar. Köpek kulübeleri ev içi ve bahçe kullanımı için konforlu yaşam alanı oluşturur.",
      "Samsun köpek taşıma kabı fiyatları modele ve boyuta göre 300-3.000 TL arasında değişmektedir.",
    ],
    faq: [
      { q: "Köpek taşıma kabı nasıl seçilir?", a: "Köpeğinizin boyutuna uygun, havalandırmalı, güvenli kilit sistemli ve dayanıklı malzemeden yapılmış modelleri tercih edin." },
      { q: "Samsun'da köpek taşıma kabı nereden alınır?", a: "JETGO petshop'ta köpek taşıma kabı, kulübe ve araba kafesi modelleri mevcuttur. Kapıya teslim." },
      { q: "Köpek arabası var mı?", a: "Evet, küçük ırk köpekler için köpek arabası modelleri JETGO'da mevcuttur." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Bakım", href: "/samsun-kopek-bakim-saglik" },
      { text: "Pet Aksesuar", href: "/pet-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kopek-uygun-cuval-mama",
    type: "category",
    title: "Köpek Uygun Çuval Mama Samsun",
    metaTitle: "Köpek Uygun Çuval Mama Samsun | Ekonomik Büyük Paket | JETGO Petshop",
    metaDescription: "Samsun'da köpek uygun çuval mama kapıya teslim. 15-18 kg ekonomik büyük paket köpek maması. Reflex, Pro Performance uygun fiyat. JETGO.",
    keywords: "köpek uygun çuval mama samsun, ucuz köpek maması samsun, ekonomik köpek maması, büyük paket köpek maması samsun, 15 kg köpek maması fiyat samsun",
    h1: "Köpek Uygun Çuval Mama - Samsun Ekonomik Fiyat",
    intro: [
      "Bütçe dostu köpek maması arayanlar için JETGO'da uygun çuval mama seçenekleri mevcut. 15-18 kg büyük paket köpek mamaları Samsun'da kapınıza teslim. Ağır çuvalları taşıma derdi yok.",
      "Reflex, Pro Performance ve diğer ekonomik markaların büyük paket köpek mamaları kg başı en uygun fiyatı sunar. Çok köpekli haneler ve barınaklar için ideal ekonomik çözümler.",
      "Samsun uygun çuval köpek maması fiyatları 1.500-3.000 TL arasında değişmektedir. Nakit ödemede ekstra avantajlı fiyat ve %5 Para Puan kazanımı.",
    ],
    faq: [
      { q: "En ucuz köpek maması hangisi?", a: "Reflex ve Pro Performance 15-18 kg paketleri kg başı en uygun fiyatlı mamalardır. JETGO'da kapıya teslim." },
      { q: "Çuval mama kaliteli mi?", a: "Evet, JETGO'da satılan tüm mamalar kalite kontrollü ve SKT'si geçerli ürünlerdir." },
      { q: "15 kg mama kapıya teslim ediyor musunuz?", a: "Evet, ağır çuvalları kapınıza hatta apartman katınıza kadar teslim ediyoruz." },
    ],
    internalLinks: [
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Köpek Açık Mama", href: "/samsun-kopek-acik-mama" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kus-yemi",
    type: "category",
    title: "Kuş Yemi Samsun",
    metaTitle: "Kuş Yemi Samsun | Muhabbet Kanarya Papağan Yemi Kapıya Teslim | JETGO",
    metaDescription: "Samsun'da kuş yemi kapıya teslim. Muhabbet kuşu yemi, kanarya yemi, papağan yemi, sultan papağanı yemi. Premium markalar. JETGO Pet Shop.",
    keywords: "kuş yemi samsun, muhabbet kuşu yemi samsun, kanarya yemi samsun, papağan yemi samsun, sultan papağanı yemi, kuş yemi fiyat samsun, samsun kuş yemi petshop",
    h1: "Kuş Yemi - Samsun Kapıya Teslim",
    intro: [
      "Kuşunuz için en kaliteli yemleri JETGO'da bulun. Muhabbet kuşu yemi, kanarya yemi, papağan yemi, sultan papağanı yemi ve karışık kuş yemleri Samsun'da kapınıza teslim. Dengeli beslenme için vitamin takviyeli yem seçenekleri mevcut.",
      "Kuş yemi seçiminde kuşunuzun türüne uygun yem kullanmak çok önemlidir. Muhabbet kuşları, kanaryalar ve papağanlar farklı besin ihtiyaçlarına sahiptir. JETGO'da her kuş türü için özel formüle edilmiş yemler bulunmaktadır.",
      "Samsun kuş yemi fiyatları 50-300 TL arasında değişmektedir. Kilo bazlı ekonomik paketler ve günlük kullanım paketleri mevcut. Nakit ödemede avantajlı fiyat.",
    ],
    sections: [
      {
        h2: "Kuş Türüne Göre Yem Çeşitleri",
        paragraphs: [
          "Muhabbet kuşu yemi darı, kabuğu alınmış yulaf, keten tohumu ve vitamin karışımı içerir. Kanarya yemi ise kolza tohumu ağırlıklı, özel şarkı performansını destekleyen formüllerle hazırlanır. Papağan yemleri ayçekirdeği, kabak çekirdeği, fıstık ve meyve parçaları içerir.",
          "Sultan papağanı yemi orta boy tohumlar ve tahıl karışımından oluşur. Cennet papağanı, jako ve amazon papağanları için büyük boy tohumlu yem seçenekleri de JETGO'da mevcuttur.",
        ],
      },
    ],
    faq: [
      { q: "Samsun'da kuş yemi nereden alınır?", a: "JETGO petshop'ta muhabbet kuşu, kanarya, papağan ve tüm kuş türleri için yem çeşitleri mevcuttur. Kapıya teslim." },
      { q: "Kuş yemi ne kadar?", a: "Kuş yemi fiyatları türe ve pakete göre 50-300 TL arasında değişmektedir." },
      { q: "Muhabbet kuşu yemi en iyisi hangisi?", a: "Vitamin takviyeli, çeşitli tohum karışımlı premium kuş yemleri önerilir. JETGO'da kaliteli seçenekler mevcut." },
    ],
    internalLinks: [
      { text: "Kuş Kafesi", href: "/samsun-kus-kafesi" },
      { text: "Kuş Vitamini", href: "/samsun-kus-vitamini" },
      { text: "Kuş Bakım Aksesuar", href: "/samsun-kus-bakim-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kus-kafesi",
    type: "category",
    title: "Kuş Kafesi Samsun",
    metaTitle: "Kuş Kafesi Samsun | Muhabbet Kanarya Papağan Kafesi | JETGO Petshop",
    metaDescription: "Samsun'da kuş kafesi kapıya teslim. Muhabbet kuşu kafesi, kanarya kafesi, papağan kafesi. Çeşitli boyut ve modeller. JETGO Pet Shop.",
    keywords: "kuş kafesi samsun, muhabbet kuşu kafesi samsun, kanarya kafesi samsun, papağan kafesi samsun, kuş kafesi fiyat samsun",
    h1: "Kuş Kafesi - Samsun Kapıya Teslim",
    intro: [
      "Kuşunuz için uygun kafesi JETGO'da bulun. Muhabbet kuşu kafesi, kanarya kafesi, papağan kafesi ve sultan papağanı kafesi modelleri Samsun'da kapınıza teslim. Küçük, orta ve büyük boy seçenekler mevcut.",
      "Kuş kafesi seçiminde kuşunuzun türü ve boyutuna uygun genişlikte kafes tercih etmek önemlidir. Kafes içi aksesuar olarak tünek, yemlik, suluk ve oyuncak da JETGO'da mevcuttur.",
      "Samsun kuş kafesi fiyatları modele ve boyuta göre 150-2.000 TL arasında değişmektedir.",
    ],
    faq: [
      { q: "Kuş kafesi nasıl seçilir?", a: "Kuşunuzun rahatça kanat açabilecği genişlikte, dayanıklı malzemeden ve güvenli kilit sistemli kafes tercih edin." },
      { q: "Samsun'da kuş kafesi nereden alınır?", a: "JETGO petshop'ta çeşitli boyut ve modellerde kuş kafesleri mevcuttur. Kapıya teslim edilir." },
      { q: "Kuş kafesi ne kadar?", a: "Boyut ve modele göre 150-2.000 TL arasında değişmektedir." },
    ],
    internalLinks: [
      { text: "Kuş Yemi", href: "/samsun-kus-yemi" },
      { text: "Kuş Vitamini", href: "/samsun-kus-vitamini" },
      { text: "Kuş Bakım Aksesuar", href: "/samsun-kus-bakim-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kus-vitamini",
    type: "category",
    title: "Kuş Vitamini Samsun",
    metaTitle: "Kuş Vitamini Samsun | Kuş Takviye Mineral Kapıya Teslim | JETGO Petshop",
    metaDescription: "Samsun'da kuş vitamini ve mineral takviye kapıya teslim. Tüy dökümü vitamini, bağışıklık güçlendirici, kalsiyum. JETGO Pet Shop.",
    keywords: "kuş vitamini samsun, kuş mineral takviye, kuş tüy dökümü vitamini, kuş kalsiyum, kuş bağışıklık vitamini samsun",
    h1: "Kuş Vitamini ve Mineral Takviye - Samsun",
    intro: [
      "Kuşunuzun sağlığını desteklemek için vitamin ve mineral takviyelerini JETGO'da bulun. Tüy dökümü vitamini, bağışıklık güçlendirici, kalsiyum ve multivitamin seçenekleri Samsun'da kapıya teslim.",
      "Kuş vitaminleri özellikle tüy dökümü dönemlerinde, üreme döneminde ve kış aylarında kuşunuzun sağlığını korumak için önemlidir. Suya veya yeme karıştırılarak verilebilir.",
      "Samsun kuş vitamini fiyatları 30-150 TL arasında değişmektedir. JETGO'da nakit ödemede avantajlı fiyat.",
    ],
    faq: [
      { q: "Kuşlara vitamin gerekli mi?", a: "Dengeli yemle beslenen kuşlarda ek vitamin genellikle gerekli değildir. Ancak tüy dökümü ve stres dönemlerinde vitamin takviyesi faydalıdır." },
      { q: "Samsun'da kuş vitamini nereden alınır?", a: "JETGO petshop'ta çeşitli kuş vitamini ve mineral takviye ürünleri mevcuttur. Kapıya teslim." },
      { q: "Kuş vitamini nasıl verilir?", a: "Genellikle suya veya yeme karıştırılarak verilir. Ürün ambalajındaki dozaj talimatlarını takip edin." },
    ],
    internalLinks: [
      { text: "Kuş Yemi", href: "/samsun-kus-yemi" },
      { text: "Kuş Kafesi", href: "/samsun-kus-kafesi" },
      { text: "Kuş Bakım Aksesuar", href: "/samsun-kus-bakim-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kus-bakim-aksesuar",
    type: "category",
    title: "Kuş Bakım Aksesuar Samsun",
    metaTitle: "Kuş Bakım Aksesuar Samsun | Tünek Yemlik Oyuncak | JETGO Petshop",
    metaDescription: "Samsun'da kuş bakım ve aksesuar ürünleri kapıya teslim. Tünek, yemlik, suluk, kuş oyuncağı, kuş banyoluğu. JETGO Pet Shop.",
    keywords: "kuş aksesuar samsun, kuş tünek samsun, kuş yemlik, kuş suluk, kuş oyuncağı, kuş banyoluğu, kuş bakım ürünleri samsun",
    h1: "Kuş Bakım ve Aksesuar - Samsun Kapıya Teslim",
    intro: [
      "Kuşunuzun konforunu artıracak bakım ve aksesuar ürünlerini JETGO'da bulun. Tünek, yemlik, suluk, kuş oyuncağı, kuş banyoluğu ve kafes aksesuarları Samsun'da kapınıza teslim.",
      "Kuş aksesuarları kuşunuzun mutluluğu ve sağlığı için önemlidir. Farklı kalınlıkta tünekler ayak sağlığını destekler. Oyuncaklar zihinsel uyarım sağlar. Banyoluk ise kuşunuzun temizlik ihtiyacını karşılar.",
      "Samsun kuş aksesuar fiyatları 10-200 TL arasında değişmektedir. JETGO'da nakit ödemede avantajlı fiyat ve %5 Para Puan.",
    ],
    faq: [
      { q: "Kuş oyuncağı gerekli mi?", a: "Evet, kuş oyuncakları zihinsel uyarım sağlar ve can sıkıntısını önler. Özellikle tek kuş besleyenler için önemlidir." },
      { q: "Samsun'da kuş aksesuarı nereden alınır?", a: "JETGO petshop'ta tünek, yemlik, suluk, oyuncak ve tüm kuş aksesuarları mevcuttur. Kapıya teslim." },
      { q: "Kuş banyoluğu nasıl kullanılır?", a: "Kafes içine veya dışına asılır. Ilık su ile doldurulur. Kuşunuz kendi kendine banyo yapar." },
    ],
    internalLinks: [
      { text: "Kuş Yemi", href: "/samsun-kus-yemi" },
      { text: "Kuş Kafesi", href: "/samsun-kus-kafesi" },
      { text: "Kuş Vitamini", href: "/samsun-kus-vitamini" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kemirgen-yemi",
    type: "category",
    title: "Kemirgen Yemi Samsun",
    metaTitle: "Kemirgen Yemi Samsun | Hamster Tavşan Guinea Pig Yemi | JETGO Petshop",
    metaDescription: "Samsun'da kemirgen yemi kapıya teslim. Hamster yemi, tavşan yemi, guinea pig yemi, chinchilla yemi. Premium markalar. JETGO Pet Shop.",
    keywords: "kemirgen yemi samsun, hamster yemi samsun, tavşan yemi samsun, guinea pig yemi samsun, chinchilla yemi, kemirgen yemi fiyat samsun",
    h1: "Kemirgen Yemi - Samsun Kapıya Teslim",
    intro: [
      "Kemirgeniniz için en kaliteli yemleri JETGO'da bulun. Hamster yemi, tavşan yemi, guinea pig yemi ve chinchilla yemi Samsun'da kapınıza teslim. Dengeli beslenme için vitamin takviyeli yem seçenekleri mevcut.",
      "Kemirgen yemi seçiminde hayvanınızın türüne uygun yem kullanmak çok önemlidir. Hamsterlar, tavşanlar ve guinea pigler farklı besin ihtiyaçlarına sahiptir. JETGO'da her kemirgen türü için özel formüle edilmiş yemler bulunmaktadır.",
      "Samsun kemirgen yemi fiyatları 40-250 TL arasında değişmektedir. Nakit ödemede avantajlı fiyat ve %5 Para Puan.",
    ],
    faq: [
      { q: "Samsun'da kemirgen yemi nereden alınır?", a: "JETGO petshop'ta hamster, tavşan, guinea pig ve chinchilla yemi çeşitleri mevcuttur. Kapıya teslim." },
      { q: "En iyi kemirgen yemi hangisi?", a: "Hayvanınızın türüne uygun, vitamin takviyeli ve çeşitli tohum karışımlı yemler önerilir." },
      { q: "Kemirgen yemi ne kadar?", a: "Kemirgen yemi fiyatları türe ve pakete göre 40-250 TL arasında değişmektedir." },
    ],
    internalLinks: [
      { text: "Kemirgen Kafesi", href: "/samsun-kemirgen-kafesi" },
      { text: "Kemirgen Vitamin", href: "/samsun-kemirgen-vitamin" },
      { text: "Kemirgen Bakım", href: "/samsun-kemirgen-bakim-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kemirgen-kafesi",
    type: "category",
    title: "Kemirgen Kafesi Samsun",
    metaTitle: "Kemirgen Kafesi Samsun | Hamster Tavşan Guinea Pig Kafesi | JETGO Petshop",
    metaDescription: "Samsun'da kemirgen kafesi kapıya teslim. Hamster kafesi, tavşan kafesi, guinea pig kafesi. Çeşitli boyut ve modeller. JETGO Pet Shop.",
    keywords: "kemirgen kafesi samsun, hamster kafesi samsun, tavşan kafesi samsun, guinea pig kafesi samsun, kemirgen kafesi fiyat samsun",
    h1: "Kemirgen Kafesi - Samsun Kapıya Teslim",
    intro: [
      "Kemirgeniniz için uygun kafesi JETGO'da bulun. Hamster kafesi, tavşan kafesi, guinea pig kafesi ve chinchilla kafesi modelleri Samsun'da kapınıza teslim. Çeşitli boyut ve modeller mevcut.",
      "Kemirgen kafesi seçiminde hayvanınızın rahat hareket edebileceği genişlikte, güvenli tel aralığına sahip ve kolay temizlenebilir kafes tercih etmek önemlidir. Kafes içi aksesuar olarak koşu çarkı, yuva ve yemlik de JETGO'da mevcuttur.",
      "Samsun kemirgen kafesi fiyatları modele ve boyuta göre 200-1.500 TL arasında değişmektedir.",
    ],
    faq: [
      { q: "Hamster kafesi nasıl seçilir?", a: "Hamster için en az 40x30 cm taban alanı, güvenli tel aralığı ve kolay temizlenebilir kafes önerilir." },
      { q: "Samsun'da kemirgen kafesi nereden alınır?", a: "JETGO petshop'ta çeşitli boyut ve modellerde kemirgen kafesleri mevcuttur. Kapıya teslim edilir." },
      { q: "Kemirgen kafesi ne kadar?", a: "Boyut ve modele göre 200-1.500 TL arasında değişmektedir." },
    ],
    internalLinks: [
      { text: "Kemirgen Yemi", href: "/samsun-kemirgen-yemi" },
      { text: "Kemirgen Vitamin", href: "/samsun-kemirgen-vitamin" },
      { text: "Kemirgen Bakım", href: "/samsun-kemirgen-bakim-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kemirgen-vitamin",
    type: "category",
    title: "Kemirgen Vitamin Takviye Samsun",
    metaTitle: "Kemirgen Vitamin Takviye Samsun | Hamster Tavşan Vitamin | JETGO Petshop",
    metaDescription: "Samsun'da kemirgen vitamin ve takviye ürünleri kapıya teslim. C vitamini, mineral blok, kemirme taşı. JETGO Pet Shop.",
    keywords: "kemirgen vitamin samsun, hamster vitamin, tavşan vitamin, guinea pig c vitamini, kemirme taşı, mineral blok kemirgen samsun",
    h1: "Kemirgen Vitamin ve Takviye - Samsun Kapıya Teslim",
    intro: [
      "Kemirgeninizin sağlığını desteklemek için vitamin ve takviye ürünlerini JETGO'da bulun. C vitamini, mineral blok, kemirme taşı ve multivitamin seçenekleri Samsun'da kapıya teslim.",
      "Guinea pigler C vitamini üretemez, bu nedenle dışarıdan C vitamini takviyesi almaları şarttır. Kemirme taşları diş sağlığını destekler. Mineral bloklar ise mineral ihtiyacını karşılar.",
      "Samsun kemirgen vitamin fiyatları 20-100 TL arasında değişmektedir.",
    ],
    faq: [
      { q: "Guinea pig'e C vitamini vermek gerekli mi?", a: "Evet, guinea pigler C vitamini üretemez. Günlük C vitamini takviyesi şarttır. Suya veya yeme karıştırılabilir." },
      { q: "Kemirme taşı ne işe yarar?", a: "Kemirme taşları kemirgen dişlerinin aşınmasını sağlar. Kemirgen dişleri sürekli uzar, kemirme taşı doğal diş bakımı sağlar." },
      { q: "Samsun'da kemirgen vitamini nereden alınır?", a: "JETGO petshop'ta kemirgen vitamin, mineral blok ve kemirme taşı ürünleri mevcuttur. Kapıya teslim." },
    ],
    internalLinks: [
      { text: "Kemirgen Yemi", href: "/samsun-kemirgen-yemi" },
      { text: "Kemirgen Kafesi", href: "/samsun-kemirgen-kafesi" },
      { text: "Kemirgen Bakım", href: "/samsun-kemirgen-bakim-aksesuar" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-kemirgen-bakim-aksesuar",
    type: "category",
    title: "Kemirgen Bakım Aksesuar Samsun",
    metaTitle: "Kemirgen Bakım Aksesuar Samsun | Koşu Çarkı Yuva Altlık | JETGO Petshop",
    metaDescription: "Samsun'da kemirgen bakım ve aksesuar ürünleri kapıya teslim. Koşu çarkı, hamster yuva, kafes altlığı, kemirgen oyuncağı. JETGO Pet Shop.",
    keywords: "kemirgen aksesuar samsun, hamster koşu çarkı, kemirgen yuva, kafes altlığı, kemirgen oyuncağı, hamster aksesuar samsun",
    h1: "Kemirgen Bakım ve Aksesuar - Samsun Kapıya Teslim",
    intro: [
      "Kemirgeninizin konforunu artıracak bakım ve aksesuar ürünlerini JETGO'da bulun. Koşu çarkı, yuva, kafes altlığı, suluk, yemlik ve kemirgen oyuncakları Samsun'da kapınıza teslim.",
      "Kemirgen aksesuarları hayvanınızın mutluluğu ve sağlığı için önemlidir. Koşu çarkı egzersiz ihtiyacını karşılar. Yuva uyku ve güvenlik hissi sağlar. Tünel ve oyuncaklar zihinsel uyarım verir.",
      "Samsun kemirgen aksesuar fiyatları 15-300 TL arasında değişmektedir. Nakit ödemede avantajlı fiyat ve %5 Para Puan.",
    ],
    faq: [
      { q: "Hamster koşu çarkı gerekli mi?", a: "Evet, hamsterlar gece aktif hayvanlardır ve günde 8-10 km koşabilirler. Koşu çarkı vazgeçilmez bir aksesuardır." },
      { q: "Samsun'da kemirgen aksesuarı nereden alınır?", a: "JETGO petshop'ta koşu çarkı, yuva, altlık ve tüm kemirgen aksesuarları mevcuttur. Kapıya teslim." },
      { q: "Kafes altlığı ne kullanılır?", a: "Talaş, mısır koçanı granülü veya kağıt bazlı altlık kullanılabilir. Talaş en yaygın tercih edilen altlıktır." },
    ],
    internalLinks: [
      { text: "Kemirgen Yemi", href: "/samsun-kemirgen-yemi" },
      { text: "Kemirgen Kafesi", href: "/samsun-kemirgen-kafesi" },
      { text: "Kemirgen Vitamin", href: "/samsun-kemirgen-vitamin" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "samsun-akvaryum-malzemeleri",
    type: "category",
    title: "Akvaryum Malzemeleri Samsun",
    metaTitle: "Akvaryum Malzemeleri Samsun | Akvaryumcu - Balık Yemi & Ekipman Kapıda | JETGO",
    metaDescription: "Samsun'da akvaryum malzemeleri kapıya teslim. Akvaryum, filtre, balık yemi, su düzenleyici, dekor. En yakın akvaryumcu JETGO ile kapınızda. Kapıda ödeme.",
    keywords: "akvaryum malzemeleri samsun, petshop akvaryum, akvaryum balığı samsun, en yakın akvaryumcu, yakınlarda akvaryumcu, akvaryum ürünleri samsun, balık yemi samsun, akvaryum filtresi, samsun akvaryumcu, atakum akvaryumcu",
    h1: "Akvaryum Malzemeleri Samsun: En Yakın Akvaryumcu Kapınızda",
    intro: [
      "Samsun'da akvaryum malzemeleri arıyorsanız JETGO en yakın akvaryumcu olarak ihtiyaçlarınızı kapınıza getiriyor. Akvaryum, filtre, hava motoru, ısıtıcı, balık yemi, su düzenleyici ve dekor ürünleri tek adreste.",
      "Akvaryumcu dükkanını gezmek yerine jetgomarket.com üzerinden tüm akvaryum ürünlerini inceleyin, sepete ekleyin ve aynı gün kapınızda teslim alın. Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine teslimat yapıyoruz.",
      "Balık yemi, akvaryum bakım ürünleri ve ekipmanlarında uygun fiyat, kapıda ödeme ve her siparişte %5 Para Puan avantajı. Yakınlarda akvaryumcu aramaya son.",
    ],
    sections: [
      {
        h2: "Samsun Akvaryum Ürün Çeşitleri",
        paragraphs: [
          "Akvaryumunuzun kurulumundan günlük bakımına kadar ihtiyacınız olan tüm ürünler JETGO'da. Balık yemi, filtre malzemeleri, su düzenleyici kimyasallar, ısıtıcı, hava taşı ve dekor ürünlerini kapınıza getiriyoruz.",
          "Akvaryum balığınızın sağlığı için doğru yem ve temiz su şarttır. Pul yem, granül yem ve dipte beslenen balıklar için tablet yem çeşitlerimiz mevcuttur. Su düzenleyici ürünlerle akvaryum suyunu balıklarınız için ideal hale getirebilirsiniz.",
        ],
        list: [
          "Balık yemi: pul, granül ve tablet yem çeşitleri",
          "Akvaryum filtresi, sünger ve hava motoru",
          "Isıtıcı, termometre ve hava taşı",
          "Su düzenleyici ve akvaryum bakım kimyasalları",
          "Dekor, yapay bitki, taş ve zemin malzemeleri",
        ],
      },
      {
        h2: "En Yakın Akvaryumcu Neden JETGO?",
        paragraphs: [
          "Samsun'da akvaryum malzemesi için dükkan dükkan gezmenize gerek yok. JETGO en yakın akvaryumcu olarak ürünleri kapınıza kadar getirir. Ortalama 1-3 saat içinde teslimat yapıyoruz.",
          "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz. Nakit ödemede ekstra avantajlı fiyat sunuyoruz. Ağır akvaryum ve ekipmanları apartman katınıza kadar taşıyoruz.",
        ],
      },
    ],
    features: [
      "Akvaryum ekipmanı ve balık yemi çeşitleri",
      "Aynı gün, ortalama 1-3 saat kapıya teslim",
      "Kapıda nakit, POS ve QR ödeme",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Samsun'da akvaryum malzemeleri nereden alınır?", a: "JETGO petshop'ta akvaryum, filtre, balık yemi, su düzenleyici ve dekor ürünleri mevcuttur. Online seçip kapınızda teslim alabilirsiniz." },
      { q: "Akvaryum balığı yemi kapıya teslim var mı?", a: "Evet, pul, granül ve tablet balık yemi çeşitlerini aynı gün kapınıza getiriyoruz." },
      { q: "En yakın akvaryumcu hangisi?", a: "JETGO, Samsun ve Atakum'un tüm mahallelerine kapıya teslim hizmeti verdiği için en pratik en yakın akvaryumcudur." },
    ],
    internalLinks: [
      { text: "Kuş Yemi Samsun", href: "/samsun-kus-yemi" },
      { text: "Kemirgen Ürünleri", href: "/samsun-kemirgen-yemi" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
    ],
  },
  {
    slug: "samsun-acik-petshop",
    type: "keyword",
    title: "Samsun Açık Petshop",
    metaTitle: "Samsun Açık Petshop | Şu An Açık Nöbetçi Pet Market - Hafta Sonu Teslim | JETGO",
    metaDescription: "Samsun'da şu an açık petshop! Hafta sonu, pazar günü ve akşam saatlerinde sipariş. Nöbetçi pet market gibi acil mama ve kedi kumu kapıda. Kapıda ödeme.",
    keywords: "samsun açık petshop, şu an açık petshop, bugün açık petshop, hafta sonu açık petshop, pazar günü açık petshop, gece açık petshop, nöbetçi pet market, açık pet market, geç saate kadar açık petshop, petshop açık mı, en yakın petshop açık şimdi, samsun nöbetçi petshop",
    h1: "Samsun'da Şu An Açık Petshop: Hafta Sonu ve Akşam Teslimat",
    intro: [
      "Samsun'da şu an açık petshop mu arıyorsunuz? JETGO her gün, hafta sonu ve pazar günü dahil sipariş alır ve kapınıza teslim eder. Petshop açık mı diye telefon dolaştırmaya gerek yok.",
      "Acil mama, kedi kumu veya pet ürünü ihtiyacınızda nöbetçi pet market gibi yanınızdayız. Sabah erken saatten akşam geç saatlere kadar sipariş verebilir, siparişinizi aynı gün kapınızda teslim alabilirsiniz.",
      "jetgomarket.com üzerinden ürünleri seçin, WhatsApp ile tek tıkla onaylayın. Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz. Hafta sonu açık petshop arayanlar için en pratik çözüm JETGO'dur.",
    ],
    sections: [
      {
        h2: "Petshop Açık Mı? Sipariş Saatlerimiz",
        paragraphs: [
          "JETGO her gün hizmetinizdedir; hafta içi, hafta sonu ve pazar günü sipariş alıyoruz. Bugün açık petshop arıyorsanız doğru yerdesiniz. Gündüz verilen siparişler aynı gün, ortalama 1-3 saat içinde kapınıza ulaşır.",
          "Gece geç saatte aklınıza gelen siparişleri de jetgomarket.com üzerinden bırakabilirsiniz; ertesi günün ilk teslimat rotasında kapınıza getiririz. Şu an açık petshop arayışınızda 7 gün yanınızdayız.",
        ],
      },
      {
        h2: "Hafta Sonu ve Acil İhtiyaçta Nöbetçi Pet Market",
        paragraphs: [
          "Maması veya kedi kumu hafta sonu bittiğinde nöbetçi pet market gibi devreye giriyoruz. Pazar günü açık petshop bulmak Samsun'da artık çok kolay: siparişinizi verin, kapınıza gelsin.",
          "Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine teslimat yapıyoruz. En yakın petshop açık şimdi diye aratmadan, JETGO ile ürünleriniz hızla kapınızda.",
        ],
      },
    ],
    features: [
      "Hafta sonu ve pazar günü dahil her gün sipariş",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Acil mama ve kedi kumunda nöbetçi pet market gibi hız",
      "Kapıda nakit, POS ve QR ödeme",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
    ],
    faq: [
      { q: "Samsun'da şu an açık petshop var mı?", a: "JETGO her gün sipariş alır ve kapınıza teslim eder. Gündüz verdiğiniz siparişler aynı gün elinize ulaşır." },
      { q: "Pazar günü petshop açık mı?", a: "Evet, pazar günü ve hafta sonu dahil sipariş alıyoruz. Siparişinizi kapınıza getiriyoruz." },
      { q: "Gece petshop'tan mama sipariş edebilir miyim?", a: "Gece siparişinizi jetgomarket.com üzerinden bırakabilirsiniz; ertesi günün ilk teslimat rotasında kapınıza getiririz." },
    ],
    internalLinks: [
      { text: "Samsun Acil Petshop", href: "/samsun-acil-petshop" },
      { text: "Atakum Gece Açık Petshop", href: "/atakum-gece-acik-petshop" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
      { text: "Samsun Hızlı Petshop", href: "/samsun-hizli-petshop" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "atakum-pet-market",
    type: "keyword",
    title: "Atakum Pet Market",
    metaTitle: "Atakum Pet Market | Pet Ürünleri Kapıya Teslim - Gross Market Fiyatına | JETGO",
    metaDescription: "Atakum pet market: kedi maması, köpek maması, kedi kumu ve tüm pet ürünleri uygun fiyata kapıda. Denizevleri, Güzelyalı, Atakent teslimat. Kapıda ödeme.",
    keywords: "atakum pet market, atakum pet market teslimat, atakum pet ürünleri, atakum petshop gross market, atakum mama kapıya teslim, pet market kapıya teslim, atakum pet market açık, atakum online pet market, pet ürünleri mağazası atakum",
    h1: "Atakum Pet Market: Gross Market Fiyatına Kapıya Teslim",
    intro: [
      "Atakum pet market arayanlar için JETGO, geniş ürün yelpazesini gross market fiyatına kapınıza getiriyor. Kedi maması, köpek maması, kedi kumu, kuş yemi ve tüm pet ürünleri tek adreste.",
      "Denizevleri, Güzelyalı, Kurupelit, Atakent, Mimar Sinan ve Atakum'un tüm mahallelerine aynı gün teslimat yapıyoruz. Pet market kapıya teslim hizmeti ile ağır çuval taşıma derdine son.",
      "jetgomarket.com üzerinden 900'den fazla ürünü inceleyin, fiyatları karşılaştırın ve sepete ekleyin. Kapıda nakit, kredi kartı (POS) ve QR ödeme; nakit ödemede ekstra avantajlı fiyat.",
    ],
    sections: [
      {
        h2: "Atakum Pet Market Ürünleri ve Fiyat Avantajı",
        paragraphs: [
          "JETGO Atakum pet market olarak premium ve ekonomik markaları bir arada sunar. Royal Canin, Hill's, N&D, Pro Plan, Reflex gibi markaları gross market mantığıyla uygun fiyatlandırıyoruz.",
          "Kedi ve köpek maması, yaş mama, ödül maması, kedi kumu, tuvalet ürünleri, kuş ve kemirgen ürünleri ile aksesuarlar stoklarımızda. Atakum pet ürünleri ihtiyacınızın tamamı tek siparişte kapınızda.",
        ],
        list: [
          "Kedi & köpek maması: Royal Canin, Hill's, N&D, Pro Plan, Reflex",
          "Kedi kumu: Van Cat, Biokat's, Sanicat",
          "Kuş ve kemirgen yem, kafes ve aksesuarları",
          "Bakım ürünleri: şampuan, tarak, çiş pedi",
        ],
      },
      {
        h2: "Atakum Pet Market Teslimat Bölgeleri",
        paragraphs: [
          "Sahil şeridindeki Denizevleri, Güzelyalı ve Altınkum'a öncelikli hızlı teslimat yapıyoruz. Mimar Sinan, Körfez, İncesu, Esenevler ve Taflan mahallelerine de aynı gün teslimat garantimiz geçerlidir.",
          "Atakum pet market teslimat süremiz ortalama 1-3 saattir. Sabah verilen siparişler öğleden sonra kapınızda olur.",
        ],
      },
    ],
    features: [
      "900+ ürün, gross market fiyat avantajı",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Kapıda nakit, POS ve QR ödeme",
      "Atakum tüm mahallelere teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Atakum pet market teslimatı ne kadar sürer?", a: "Atakum'un tüm mahallelerine aynı gün, ortalama 1-3 saat içinde teslimat yapıyoruz." },
      { q: "Atakum pet market kapıda ödeme kabul ediyor mu?", a: "Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz. Nakit ödemede avantajlı fiyat sunuyoruz." },
      { q: "Atakum pet ürünleri fiyatları uygun mu?", a: "Gross market mantığıyla çalışıyoruz; premium ve ekonomik markaları uygun fiyata kapınıza getiriyoruz." },
    ],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
      { text: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
      { text: "Atakum Kapıda Ödeme", href: "/atakum-kapida-odeme-petshop" },
      { text: "Samsun Pet Market", href: "/samsun-pet-market" },
    ],
  },
  {
    slug: "samsun-pet-market",
    type: "keyword",
    title: "Samsun Pet Market",
    metaTitle: "Samsun Pet Market | En Büyük Pet Ürünleri Mağazası Kapıda - Gross Market | JETGO",
    metaDescription: "Samsun'un en büyük pet market'i JETGO. 900+ ürün, uygun fiyata kedi-köpek maması, kedi kumu kapıya teslim. Atakum, İlkadım, Canik. Kapıda ödeme.",
    keywords: "samsun pet market, samsun pet market teslimat, samsun petshop gross market, en iyi petshop samsun, en büyük petshop samsun, pet market online, pet market yakın, samsun pet ürünleri teslimat, online pet market",
    h1: "Samsun Pet Market: En Büyük Ürün Yelpazesi, Gross Market Fiyatı",
    intro: [
      "Samsun pet market arayanlar için JETGO, 900'den fazla ürün çeşidiyle Samsun'un en kapsamlı kapıya teslim pet market'idir. Kedi, köpek, kuş ve kemirgen sahiplerine gross market fiyatına teslimat sunuyoruz.",
      "En iyi ve en büyük petshop deneyimini online'a taşıdık. Tüm pet ürünlerini jetgomarket.com üzerinden inceleyin, fiyatları karşılaştırın ve aynı gün kapınızda teslim alın.",
      "Atakum, İlkadım, Canik ve Tekkeköy'e teslimat yapıyoruz. Kapıda nakit, kredi kartı (POS) ve QR ödeme; nakit ödemede ekstra avantajlı fiyat ve %5 Para Puan.",
    ],
    sections: [
      {
        h2: "Samsun Pet Market Neden En İyisi?",
        paragraphs: [
          "Samsun pet market arayışında hız, ürün çeşidi ve fiyat en önemli kriterlerdir. JETGO bu üçünde de öne çıkar: 900+ ürün, 1-3 saat teslimat ve gross market mantığıyla uygun fiyatlar.",
          "Mağaza mağaza gezmek yerine online pet market deneyimiyle tüm ürünleri tek ekranda görün. Ağır mama çuvalları ve kedi kumu paketlerini apartman katınıza kadar getiriyoruz.",
        ],
      },
      {
        h2: "Samsun Pet Market Ürün Yelpazesi",
        paragraphs: [
          "Kediler, köpekler, kuşlar ve kemirgenler için ihtiyacınız olan her ürün tek adreste. Premium markalardan ekonomik seçeneklere kadar geniş yelpaze sunuyoruz.",
        ],
        list: [
          "Kedi maması, köpek maması, yaş mama, ödül maması",
          "Kedi kumu ve tuvalet ürünleri",
          "Kuş yemi, kafes ve kemirgen ürünleri",
          "Bakım, aksesuar ve sağlık ürünleri",
        ],
      },
    ],
    features: [
      "900+ ürün, en geniş yelpaze",
      "Gross market fiyat avantajı",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Samsun'un en büyük pet market'i hangisi?", a: "JETGO, 900'den fazla ürün çeşidi ve kapıya teslim modeliyle Samsun'un en kapsamlı pet market'lerinden biridir." },
      { q: "Samsun pet market teslimatı kapıda ödeme var mı?", a: "Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz." },
      { q: "Online pet market siparişi nasıl verilir?", a: "jetgomarket.com üzerinden ürünleri sepete ekleyin, WhatsApp ile onaylayın; siparişiniz aynı gün kapınıza gelir." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum Pet Market", href: "/atakum-pet-market" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
    ],
  },
  {
    slug: "samsun-eve-teslim-petshop",
    type: "keyword",
    title: "Samsun Eve Teslim Petshop",
    metaTitle: "Samsun Eve Teslim Petshop | Mama Eve Servis - Petshop Kapınıza Gelsin | JETGO",
    metaDescription: "Samsun'da eve teslim petshop. Kedi maması, köpek maması, kedi kumu kurye ile kapınıza. Petshop size gelsin, ağır çuval taşımayın. Aynı gün, kapıda ödeme.",
    keywords: "samsun eve teslim petshop, petshop eve teslim, mama eve teslim, petshop eve servis, petshop getirsin, petshop gelsin, petshop kurye ile teslim, evcil hayvan ürünleri teslimat, pet ürünleri kapıya teslim, petshop hemen gelsin",
    h1: "Eve Teslim Petshop Samsun: Petshop Ayağınıza Gelsin",
    intro: [
      "Samsun'da eve teslim petshop hizmeti ile artık mağazaya gitmenize gerek yok. JETGO, kedi maması, köpek maması, kedi kumu ve tüm pet ürünlerini kurye ile kapınıza getiriyor.",
      "Ağır mama çuvallarını ve kedi kumu paketlerini taşımak yerine, jetgomarket.com üzerinden siparişinizi verin; petshop size gelsin. Evcil hayvan ürünleri teslimatını apartman katınıza kadar yapıyoruz.",
      "Aynı gün, ortalama 1-3 saat içinde teslimat. Kapıda nakit, kredi kartı (POS) ve QR ile ödeme; nakit ödemede ekstra avantajlı fiyat ve %5 Para Puan.",
    ],
    sections: [
      {
        h2: "Petshop Eve Servis Nasıl Çalışır?",
        paragraphs: [
          "Mama eve teslim almak çok kolay: ürünlerinizi seçin, sepete ekleyin ve WhatsApp üzerinden tek tıkla onaylayın. Kurye ekibimiz siparişinizi kapınıza kadar getirir.",
          "Petshop getirsin, petshop gelsin diyenler için Samsun'un pratik çözümü JETGO. Evcil hayvan ürünleri teslimatını Getir modeliyle hızlı ve güvenilir şekilde yapıyoruz.",
        ],
      },
      {
        h2: "Samsun Eve Teslim Petshop Bölgeleri",
        paragraphs: [
          "Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine eve teslim petshop hizmeti veriyoruz. Sahil şeridindeki mahallelere öncelikli hızlı teslimat yapıyoruz.",
          "Petshop hemen gelsin dediğinizde acil mama ve kedi kumu ihtiyaçlarınızda da yanınızdayız. Ortalama teslimat süremiz 1-3 saattir.",
        ],
      },
    ],
    features: [
      "Mama ve pet ürünleri eve servis",
      "Kurye ile kapıya, apartman katına kadar teslim",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Kapıda nakit, POS ve QR ödeme",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
    ],
    faq: [
      { q: "Samsun'da petshop eve teslim yapıyor mu?", a: "Evet, JETGO kedi maması, köpek maması, kedi kumu ve tüm pet ürünlerini kurye ile kapınıza teslim eder." },
      { q: "Mama eve teslim ne kadar sürer?", a: "Ortalama 1-3 saat içinde siparişiniz kapınızda olur. Sabah verilen siparişler öğleden sonra elinizde." },
      { q: "Eve teslim petshop kapıda ödeme var mı?", a: "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Getir Petshop", href: "/getir-petshop" },
      { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
      { text: "Samsun Petshop Kurye", href: "/samsun-petshop-kurye" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
    ],
  },
  {
    slug: "samsun-petshop-telefon-siparis",
    type: "keyword",
    title: "Samsun Petshop Telefon Sipariş",
    metaTitle: "Samsun Petshop Telefon Sipariş | WhatsApp ile Mama Siparişi - Kapıda Ödeme | JETGO",
    metaDescription: "Samsun'da petshop telefon ve WhatsApp sipariş. Kedi-köpek maması, kedi kumu tek tıkla WhatsApp'tan kapınıza. Telefonla mama siparişi, kapıda ödeme.",
    keywords: "samsun petshop telefon sipariş, petshop whatsapp sipariş, petshop telefon numarası, telefonla mama siparişi, petshop telefon sipariş, pet market telefon sipariş, whatsapp petshop, petshop adres, samsun petshop iletişim",
    h1: "Samsun Petshop Telefon & WhatsApp Sipariş",
    intro: [
      "Samsun'da petshop telefon sipariş veya WhatsApp sipariş arıyorsanız JETGO ile tek tıkla mama siparişi verebilirsiniz. Kedi maması, köpek maması ve kedi kumu kapınıza gelsin.",
      "jetgomarket.com üzerinden ürünleri sepete ekleyin ve WhatsApp üzerinden siparişinizi onaylayın. Telefonla mama siparişi vermek artık çok kolay; kurye ekibimiz aynı gün kapınıza getirir.",
      "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz. Nakit ödemede ekstra avantajlı fiyat ve her siparişte %5 Para Puan.",
    ],
    sections: [
      {
        h2: "Telefonla Mama Siparişi Nasıl Verilir?",
        paragraphs: [
          "Sipariş vermek için önce jetgomarket.com'da ürünlerinizi seçip sepete ekleyin. Ardından WhatsApp sipariş butonuyla siparişinizi tek tıkla iletin. Dilerseniz telefon üzerinden de bilgi alabilirsiniz.",
          "WhatsApp petshop sipariş sistemi sayesinde stok, fiyat ve teslimat bilgilerini anında öğrenir, siparişinizi hızlıca tamamlarsınız. Pet market telefon sipariş kolaylığı JETGO'da.",
        ],
      },
      {
        h2: "Mağaza Adresi ve Teslimat",
        paragraphs: [
          "JETGO kapıya teslim çalışan bir petshop'tur; mağaza adresine gidip yol tarifi almanıza gerek yok. Siparişiniz bulunduğunuz adrese kurye ile getirilir.",
          "Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine teslimat yapıyoruz. Teslimat süremiz ortalama 1-3 saattir.",
        ],
      },
    ],
    features: [
      "WhatsApp ile tek tıkla sipariş",
      "Telefonla bilgi ve sipariş desteği",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Kapıda nakit, POS ve QR ödeme",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
    ],
    faq: [
      { q: "Samsun petshop telefon sipariş nasıl verilir?", a: "jetgomarket.com'da sepetinizi oluşturun ve WhatsApp üzerinden onaylayın; dilerseniz telefonla da destek alabilirsiniz." },
      { q: "WhatsApp ile mama siparişi verebilir miyim?", a: "Evet, ürünleri sepete ekledikten sonra WhatsApp sipariş butonuyla tek tıkla siparişinizi iletebilirsiniz." },
      { q: "Mağazaya gitmem gerekiyor mu?", a: "Hayır, JETGO kapıya teslim çalışır. Siparişiniz bulunduğunuz adrese kurye ile getirilir." },
    ],
    internalLinks: [
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
      { text: "Atakum WhatsApp Sipariş", href: "/atakum-petshop-whatsapp-siparis" },
      { text: "Online Petshop Samsun", href: "/online-petshop-samsun" },
      { text: "Mama Sipariş Samsun", href: "/mama-siparis-samsun" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
    ],
  },
  {
    slug: "samsun-indirimli-petshop",
    type: "keyword",
    title: "Samsun İndirimli Petshop",
    metaTitle: "Samsun İndirimli Petshop | Ucuz & Uygun Fiyat Pet Market - Kampanya | JETGO",
    metaDescription: "Samsun'da indirimli petshop! Kedi-köpek maması, kedi kumu kampanyalı ve uygun fiyata kapıda. Ucuz petshop, nakit avantajı, %5 Para Puan. Kapıda ödeme.",
    keywords: "samsun indirimli petshop, ucuz petshop, uygun fiyat petshop, indirimli petshop, petshop kampanya, ucuz pet market, uygun fiyatlı petshop samsun, kampanyalı mama samsun, petshop indirim",
    h1: "Samsun İndirimli Petshop: Kampanyalı ve Uygun Fiyatlı Pet Market",
    intro: [
      "Samsun'da indirimli petshop arıyorsanız JETGO uygun fiyat ve kampanyalarıyla yanınızda. Kedi maması, köpek maması, kedi kumu ve tüm pet ürünlerinde rekabetçi fiyat avantajı.",
      "Ucuz petshop deneyimini kaliteden ödün vermeden sunuyoruz. Premium markaları uygun fiyata kapınıza getiriyor, nakit ödemede ekstra indirim sağlıyoruz.",
      "Her siparişte %5 Para Puan kazanır, bir sonraki alışverişinizde kullanırsınız. Kampanya ürünlerimizi takip ederek özel fırsatları kaçırmayın.",
    ],
    sections: [
      {
        h2: "İndirimli Petshop Fiyat Avantajları",
        paragraphs: [
          "JETGO olarak Samsun'da en rekabetçi petshop fiyat politikasını benimsiyoruz. Nakit ödemede avantajlı fiyat, kampanyalı ürünler ve %5 Para Puan ile tasarruf edersiniz.",
          "Uygun fiyat petshop arayanlar için düzenli kampanyalar yapıyoruz. İndirimli mama, kedi kumu ve aksesuar fırsatlarını online sayfamızdan takip edebilirsiniz.",
        ],
      },
      {
        h2: "Kampanyalı Mama ve Pet Ürünleri",
        paragraphs: [
          "Ekonomik çuval mamalardan premium markalara kadar her bütçeye uygun seçenekler sunuyoruz. Kampanyalı mama ve toplu alımlarda ekstra avantaj sağlıyoruz.",
          "Üye olan müşterilerimize özel hoş geldin kuponu hediye ediyoruz. Minimum sipariş tutarını geçen alışverişlerde kargo ücretsizdir.",
        ],
      },
    ],
    features: [
      "Uygun fiyat ve kampanyalı ürünler",
      "Nakit ödemede ekstra indirim",
      "Her siparişte %5 Para Puan",
      "Üyelere hoş geldin kuponu",
      "Aynı gün kapıya teslim",
    ],
    faq: [
      { q: "Samsun'da indirimli petshop hangisi?", a: "JETGO, uygun fiyat, kampanyalı ürünler ve nakit ödeme avantajıyla Samsun'un en ekonomik petshop seçeneklerinden biridir." },
      { q: "Ucuz petshop kaliteli mi?", a: "Evet, premium markaları uygun fiyata sunuyoruz. Fiyat avantajı kaliteden ödün vermeden sağlanır." },
      { q: "Petshop kampanyalarını nereden takip ederim?", a: "Kampanya ve indirimli ürünleri jetgomarket.com üzerinden takip edebilir, üyelere özel kuponlardan yararlanabilirsiniz." },
    ],
    internalLinks: [
      { text: "Samsun Ucuz Kedi Maması", href: "/samsun-ucuz-kedi-mamasi" },
      { text: "Atakum Uygun Fiyatlı Mama", href: "/atakum-uygun-fiyatli-mama" },
      { text: "Samsun Petshop Fiyat Kampanya", href: "/samsun-petshop-fiyat-kampanya" },
      { text: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
      { text: "Samsun Pet Shop", href: "/samsun-petshop" },
    ],
  },
  {
    slug: "acil-kopek-mamasi-samsun",
    type: "keyword",
    title: "Acil Köpek Maması Samsun",
    metaTitle: "Acil Köpek Maması Samsun | Hemen Kapıya Teslim 1 Saatte | JETGO Petshop",
    metaDescription: "Samsun'da acil köpek maması mı bitti? JETGO hemen kapınıza getirir. Royal Canin, Pro Plan, Reflex köpek maması aynı gün, 1-3 saatte. Kapıda ödeme.",
    keywords: "acil köpek maması samsun, hemen köpek maması, acil mama siparişi, acil köpek maması, köpek maması yakın, acil pet market, samsun acil köpek maması, hemen mama siparişi",
    h1: "Acil Köpek Maması Samsun: Maması Bittiyse Hemen Kapında",
    intro: [
      "Köpeğinizin maması mı bitti? Samsun'da acil köpek maması ihtiyacınızda JETGO hemen yanınızda. Royal Canin, Pro Plan, Reflex, N&D ve daha birçok markayı aynı gün kapınıza getiriyoruz.",
      "Acil mama siparişi vermek çok kolay: jetgomarket.com'dan mamayı seçin, WhatsApp ile onaylayın. Acil pet market gibi hızlı hareket eder, siparişinizi ortalama 1-3 saatte teslim ederiz.",
      "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz. Köpek maması yakın çevrenizde arayışınıza son; JETGO size geliyor.",
    ],
    sections: [
      {
        h2: "Hemen Köpek Maması Nasıl Sipariş Edilir?",
        paragraphs: [
          "Acil durumlarda zaman önemlidir. Mamanızı online seçin, sepete ekleyin ve WhatsApp üzerinden tek tıkla siparişi tamamlayın. Kurye ekibimiz en kısa sürede kapınıza ulaşır.",
          "Hemen mama siparişi için stok durumunu online görebilir, doğru markayı hızlıca seçebilirsiniz. Ağır köpek maması çuvallarını apartman katınıza kadar getiriyoruz.",
        ],
      },
      {
        h2: "Acil Köpek Maması Teslimat Bölgeleri",
        paragraphs: [
          "Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine acil köpek maması teslimatı yapıyoruz. Sahil şeridindeki mahallelere öncelikli hızlı teslimat avantajı.",
          "Ortalama teslimat süremiz 1-3 saattir. Sabah verdiğiniz acil siparişler öğleden sonra kapınızda olur.",
        ],
      },
    ],
    features: [
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Royal Canin, Pro Plan, Reflex, N&D markaları",
      "Kapıda nakit, POS ve QR ödeme",
      "Atakum, İlkadım, Canik, Tekkeköy teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Samsun'da acil köpek maması nereden alınır?", a: "JETGO acil köpek maması ihtiyacınızı aynı gün, ortalama 1-3 saatte kapınıza getirir. Online seçip WhatsApp ile sipariş verin." },
      { q: "Acil köpek maması ne kadar sürede gelir?", a: "Ortalama 1-3 saat içinde siparişiniz kapınızda olur. Sabah verilen siparişler öğleden sonra elinizde." },
      { q: "Acil mama siparişinde kapıda ödeme var mı?", a: "Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz." },
    ],
    internalLinks: [
      { text: "Acil Kedi Maması Samsun", href: "/acil-kedi-mamasi-samsun" },
      { text: "Samsun Acil Petshop", href: "/samsun-acil-petshop" },
      { text: "Köpek Maması Hızlı Teslim", href: "/kopek-mamasi-hizli-teslim-samsun" },
      { text: "Samsun Köpek Maması", href: "/samsun-kopek-mamasi" },
      { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
    ],
  },
];

SEO_PAGES.push(...MAHALLE_PAGES, ...KEYWORD_PAGES, ...PRODUCT_SEO_PAGES);

SEO_PAGES.push(...BRAND_PAGES);

// Otomatik üretilen anahtar kelime sayfaları: slug'ı mevcut bir sayfayla
// çakışanları atla (mevcut sayfa zaten o terimi hedefliyor).
const existingSlugs = new Set(SEO_PAGES.map((p) => p.slug));
export const KEYWORD_AUTO_ADDED = KEYWORD_AUTO_PAGES.filter(
  (p) => !existingSlugs.has(p.slug),
);
SEO_PAGES.push(...KEYWORD_AUTO_ADDED);

// Atakum-EXCLUSIVE keyword pages (storeId "atakum"). They override the SHARED
// keyword page at the same slug ONLY on atakumpetshop.com. We keep an override
// only when the slug's shared page is itself a keyword page — never replace a
// curated core/category/district/brand page with a templated keyword one.
const _sharedTypeBySlug = new Map<string, SeoPageData["type"]>();
for (const p of SEO_PAGES) {
  if (!_sharedTypeBySlug.has(p.slug)) _sharedTypeBySlug.set(p.slug, p.type);
}
export const ATAKUM_EXCLUSIVE_PAGES: SeoPageData[] = ATAKUM_KEYWORD_PAGES.filter(
  (p) => _sharedTypeBySlug.get(p.slug) === "keyword",
);
SEO_PAGES.push(...ATAKUM_EXCLUSIVE_PAGES);

// ATAKUM broad NEW-SLUG corpus (storeId "atakum"), served ONLY on
// atakumpetshop.com. Unlike the legacy ATAKUM_EXCLUSIVE_PAGES above — which only
// OVERRIDE shared keyword slugs 1:1 — this corpus ADDS brand-new long-tail slugs,
// exactly like the jetgo corpora below. De-dup rules:
//   • a slug already owned by ANY legacy atakum page LOSES (legacy wins);
//   • a slug that would clobber a hand-authored NON-keyword curated page
//     (core/category/district/brand) is SKIPPED;
//   • a collision with a shared KEYWORD slug is allowed and becomes an atakum
//     override; a brand-new slug is added outright.
const _atakumAllSeen = new Set<string>(ATAKUM_KEYWORD_PAGES.map((p) => p.slug));
export const ATAKUM_ALL_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of ATAKUM_ALL_KEYWORD_PAGES) {
  if (_atakumAllSeen.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _atakumAllSeen.add(p.slug);
  ATAKUM_ALL_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...ATAKUM_ALL_EXCLUSIVE_PAGES);

// JETGO-EXCLUSIVE Pro Plan + Royal Canin / pet-food keyword pages (storeId
// "jetgo"), served ONLY on jetgomarket.com. Unlike atakum's override-only set,
// these are NEW product/brand slugs (not in the shared corpus), so we ADD every
// page UNLESS its slug would clobber a hand-authored NON-keyword curated page
// (core/category/district/brand). A collision with a shared keyword page is
// allowed and becomes a jetgo override.
//
// All four jetgo corpora carry storeId "jetgo", so a slug that appears in more
// than one would be served twice for jetgo and break the unique-slug invariant.
// We therefore de-duplicate across the corpora here — order is Pro Plan, then
// Royal Canin, then the "diğer markalar" brand catch-all, then the broad "diğer
// anahtar kelimeler" multi-category corpus; the EARLIER (more specialised) corpus
// wins — in addition to each generator's own internal slug de-dup.
const _jetgoCorpus: SeoPageData[] = [
  ...JETGO_KEYWORD_PAGES,
  ...ROYALCANIN_KEYWORD_PAGES,
  ...MARKALAR_KEYWORD_PAGES,
  ...DIGER_KEYWORD_PAGES,
];
const _jetgoSeenSlugs = new Set<string>();
export const JETGO_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of _jetgoCorpus) {
  if (_jetgoSeenSlugs.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _jetgoSeenSlugs.add(p.slug);
  JETGO_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...JETGO_EXCLUSIVE_PAGES);

// JETGO SHOP broad multi-category corpus (storeId "jetgoshop"), served ONLY on
// jetgo.shop. jetgo.shop shares the JETGO brand/theme with jetgomarket.com, so
// it cannot differ by brand or NAP — the corpus is unique vs jetgomarket.com by
// CONTENT (wholly separate prose/structure/FAQ in keyword-pages-jetgoshop-all).
// De-dup mirrors the atakum-all rules:
//   • a collision with a hand-authored NON-keyword curated page
//     (core/category/district/brand) is SKIPPED — never clobber curated content;
//   • a collision with a shared KEYWORD slug is allowed and becomes a jetgoshop
//     override; a brand-new slug (incl. one only a jetgo-EXCLUSIVE page owns,
//     which is store-scoped to jetgo and so absent from _sharedTypeBySlug) is
//     added outright as a jetgoshop-scoped page.
const _jetgoshopAllSeen = new Set<string>();
export const JETGOSHOP_ALL_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of JETGOSHOP_ALL_KEYWORD_PAGES) {
  if (_jetgoshopAllSeen.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _jetgoshopAllSeen.add(p.slug);
  JETGOSHOP_ALL_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...JETGOSHOP_ALL_EXCLUSIVE_PAGES);

// ATAKUM PET broad multi-category corpus (storeId "atakumbiz"), served ONLY on
// atakum.biz. atakum.biz shares the "Atakum Pet" brand WORD with the cargo
// `samsun` store and the same Atakum 1-saat angle as the atakum-all corpus, so it
// cannot differ by facts — the corpus is unique vs jetgomarket.com AND vs the
// atakum-all / jetgoshop-all corpora by CONTENT (wholly separate prose / FAQ /
// section rhythm in keyword-pages-atakumbiz-all). De-dup mirrors the rules above:
//   • a collision with a hand-authored NON-keyword curated page
//     (core/category/district/brand) is SKIPPED — never clobber curated content;
//   • a collision with a shared KEYWORD slug is allowed and becomes an atakumbiz
//     override; a brand-new slug is added outright as an atakumbiz-scoped page.
const _atakumbizAllSeen = new Set<string>();
export const ATAKUMBIZ_ALL_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of ATAKUMBIZ_ALL_KEYWORD_PAGES) {
  if (_atakumbizAllSeen.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _atakumbizAllSeen.add(p.slug);
  ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...ATAKUMBIZ_ALL_EXCLUSIVE_PAGES);

// MARKA.PET broad multi-category corpus (storeId "markapet"), served ONLY on
// marka.pet. This is the FIRST store-exclusive corpus built for a CARGO store:
// every page is tagged availability "cargoOnly" by the generator, so it is
// served exclusively on the Türkiye-geneli marka.pet domain and never on a local
// store. Its prose is wholly separate (cargo voice: Türkiye geneli kargo, güvenli
// online ödeme) so it is unique BY CONTENT vs jetgomarket.com AND the atakum-all /
// jetgoshop-all / atakumbiz-all corpora. De-dup mirrors the rules above:
//   • a collision with a hand-authored NON-keyword curated page is SKIPPED —
//     never clobber curated content;
//   • a collision with a shared KEYWORD slug becomes a markapet override; a
//     brand-new slug is added outright as a markapet-scoped page.
const _markapetAllSeen = new Set<string>();
export const MARKAPET_ALL_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of MARKAPET_ALL_KEYWORD_PAGES) {
  if (_markapetAllSeen.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _markapetAllSeen.add(p.slug);
  MARKAPET_ALL_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...MARKAPET_ALL_EXCLUSIVE_PAGES);

// KARADENIZ PET SHOP broad multi-category corpus (storeId "karadeniz"), served
// ONLY on karadenizpetshop.com. This is the SECOND store-exclusive CARGO corpus
// (after marka.pet): every page is tagged availability "cargoOnly" by the
// generator, so it is served exclusively on the Türkiye-geneli karadeniz domain
// and never on a local store. Its prose is a wholly separate cargo voice, unique
// BY CONTENT vs jetgomarket.com (the markalar+diger universe it shares) AND the
// markapet-all sibling cargo corpus. De-dup mirrors the rules above:
//   • a collision with a hand-authored NON-keyword curated page is SKIPPED —
//     never clobber curated content;
//   • a collision with a shared KEYWORD slug becomes a karadeniz override; a
//     brand-new slug is added outright as a karadeniz-scoped page.
const _karadenizAllSeen = new Set<string>();
export const KARADENIZ_ALL_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of KARADENIZ_ALL_KEYWORD_PAGES) {
  if (_karadenizAllSeen.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _karadenizAllSeen.add(p.slug);
  KARADENIZ_ALL_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...KARADENIZ_ALL_EXCLUSIVE_PAGES);

// ATAKUM PET broad multi-category corpus (storeId "samsun"), served ONLY on
// atakumpet.com. This is the THIRD store-exclusive CARGO corpus (after marka.pet
// and karadenizpetshop.com): every page is tagged availability "cargoOnly" by the
// generator, so it is served exclusively on the Türkiye-geneli samsun domain and
// never on a local store. It consumes the SAME markalar+diger universe as the
// karadeniz corpus, so the same slugs resolve on both domains — its prose is a
// wholly separate cargo "Atakum Pet" voice, unique BY CONTENT vs jetgomarket.com
// AND the karadeniz-all / markapet-all sibling cargo corpora. De-dup mirrors the
// rules above:
//   • a collision with a hand-authored NON-keyword curated page is SKIPPED —
//     never clobber curated content;
//   • a collision with a shared KEYWORD slug becomes a samsun override; a
//     brand-new slug is added outright as a samsun-scoped page.
const _samsunAllSeen = new Set<string>();
export const SAMSUN_ALL_EXCLUSIVE_PAGES: SeoPageData[] = [];
for (const p of SAMSUN_ALL_KEYWORD_PAGES) {
  if (_samsunAllSeen.has(p.slug)) continue;
  const shared = _sharedTypeBySlug.get(p.slug);
  if (shared !== undefined && shared !== "keyword") continue;
  _samsunAllSeen.add(p.slug);
  SAMSUN_ALL_EXCLUSIVE_PAGES.push(p);
}
SEO_PAGES.push(...SAMSUN_ALL_EXCLUSIVE_PAGES);

// ---------------------------------------------------------------------------
// Commerce-model availability + per-store resolution.
// ---------------------------------------------------------------------------

// Local-intent tokens: geography, proximity, same-day-courier speed, door
// payment and local channels. Any hand-authored page mentioning these in its
// slug/keywords/headings cannot be served truthfully on a cargo domain.
const CLASSIFY_LOCAL_RE =
  /(samsun|atakum|i̇lkad|ilkad|canik|tekkek|mahalle|en yakın|en yakin|yakınınız|yakininiz|aynı gün|ayni gun|1 saat|bir saat|2 saat|acil|express|hızlı|hizli|anında|aninda|hemen|kurye|getir|gelsin|eve teslim|eve servis|kapıda ödeme|kapida odeme|kapıda nakit|whatsapp|nöbetçi|nobetci|gece|24 saat|7\/24|açık petshop|acik petshop|hafta sonu)/i;

function classifyAvailability(p: SeoPageData): "all" | "localOnly" | "cargoOnly" {
  if (p.availability) return p.availability;
  if (p.type === "district" || p.type === "mahalle" || p.type === "mahalle-block") {
    return "localOnly";
  }
  const hay = `${p.slug} ${p.keywords} ${p.h1} ${p.title} ${p.metaTitle}`;
  return CLASSIFY_LOCAL_RE.test(hay) ? "localOnly" : "all";
}

// Normalise every page so `availability` is always set.
for (const p of SEO_PAGES) {
  p.availability = classifyAvailability(p);
}

export function isCargoStore(store: StoreConfig): boolean {
  return store.commerce.fulfillment === "cargo";
}

/** Pages eligible for a store's commerce model (unique slugs per model). */
export function getSeoPagesForStore(store: StoreConfig): SeoPageData[] {
  const cargo = isCargoStore(store);
  const overrides = _overrideByStore.get(store.id);
  return SEO_PAGES.filter((p) => {
    const a = p.availability ?? "all";
    const fitsModel = a === "all" || (cargo ? a === "cargoOnly" : a === "localOnly");
    // Store-EXCLUSIVE pages: served only on their own store (and only if the
    // page still fits this store's commerce model).
    if (p.storeId) return p.storeId === store.id && fitsModel;
    // Shared page replaced by this store's own override at the same slug.
    if (overrides?.has(p.slug)) return false;
    return fitsModel;
  });
}

/**
 * Sibling domains that share ONE corpus but must each publish a DISTINCT sitemap.
 * Within a group, every landing slug is assigned to exactly one member by a stable
 * hash (`hash(slug) % group.length`, indexed into the group array), so the members'
 * sitemap-seo.xml files advertise disjoint, evenly-sized slices instead of
 * identical lists. The pages themselves stay reachable on every domain — only the
 * sitemap LISTING is sliced (serving / orphan-link checks are untouched).
 *
 *   Group 1 — the 3 independent JETGO LOCAL domains (shared local corpus):
 *     jetgomarket.com / jetgo.pet / jetgo.shop
 *   Group 2 — the 4 CARGO sibling domains (shared cargo corpus):
 *     atakumpet.com / samsunpet.com / karadenizpetshop.com / marka.pet
 *
 * ORDER & LENGTH ARE LOAD-BEARING *per group*: reordering or resizing a group
 * remaps every slug among that group's members (churns those sitemaps), so only
 * append/reorder a group deliberately. Groups are INDEPENDENT — editing one never
 * affects another. A store in NO group owns every slug (full corpus, unchanged).
 */
export const SITEMAP_PARTITION_GROUPS: readonly (readonly string[])[] = [
  ["jetgo", "jetgopet", "jetgoshop"],
  ["samsun", "samsunpet", "karadeniz", "markapet"],
] as const;

/** The partition group that contains `storeId`, or undefined if it is in none. */
function partitionGroupOf(storeId: string): readonly string[] | undefined {
  return SITEMAP_PARTITION_GROUPS.find((g) => g.includes(storeId));
}

export function stableSlugHash(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = (((h << 5) + h) ^ slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Is `store` the assigned sitemap owner of `slug`? A store outside every
 * partition group owns every slug (unchanged behaviour); inside a group it owns
 * only the slugs whose hash maps to its index within that group.
 */
export function ownsSitemapSlug(store: StoreConfig, slug: string): boolean {
  const group = partitionGroupOf(store.id);
  if (!group) return true;
  return stableSlugHash(slug) % group.length === group.indexOf(store.id);
}

/**
 * Landing pages this store should list in ITS sitemap. For a member of a
 * partition group this is a disjoint slice of the shared corpus; for every other
 * store it is the full eligible set (unchanged behaviour).
 */
export function getSitemapPagesForStore(store: StoreConfig): SeoPageData[] {
  const pages = getSeoPagesForStore(store);
  if (!partitionGroupOf(store.id)) return pages;
  // Store-EXCLUSIVE pages (storeId === this store) exist ONLY on this domain, so
  // there is nothing to partition across siblings — this store must list them ALL
  // in its own sitemap. Only the SHARED corpus is split by the hash partition.
  //
  // A shared (storeless) page whose slug is OVERRIDDEN by a store-exclusive page
  // inside this partition group is a special case: the exclusive owner already
  // lists that slug (above), so the shared twin must be excluded from the hash
  // partition entirely — otherwise a sibling that hash-owns the slug would list
  // it too, breaking the disjoint-slice invariant.
  const claimed = _groupExclusiveSlugs.get(store.id);
  return pages.filter(
    (p) =>
      p.storeId === store.id ||
      (ownsSitemapSlug(store, p.slug) && !(claimed && claimed.has(p.slug))),
  );
}

const _localSlugMap = new Map<string, SeoPageData>();
const _cargoSlugMap = new Map<string, SeoPageData>();
// Per-store exclusive overrides: storeId -> (slug -> page). Built ONLY from
// pages carrying a storeId; these never enter the shared commerce-model maps.
const _overrideByStore = new Map<string, Map<string, SeoPageData>>();
for (const p of SEO_PAGES) {
  if (p.storeId) {
    let m = _overrideByStore.get(p.storeId);
    if (!m) {
      m = new Map<string, SeoPageData>();
      _overrideByStore.set(p.storeId, m);
    }
    if (!m.has(p.slug)) m.set(p.slug, p);
    continue;
  }
  const a = p.availability ?? "all";
  if (a !== "cargoOnly" && !_localSlugMap.has(p.slug)) _localSlugMap.set(p.slug, p);
  if (a !== "localOnly" && !_cargoSlugMap.has(p.slug)) _cargoSlugMap.set(p.slug, p);
}

// storeId -> the slugs claimed by a store-exclusive page ANYWHERE in that store's
// sitemap-partition group. Used by getSitemapPagesForStore to keep the per-domain
// sitemap slices disjoint: the shared twin of a claimed slug is listed only by its
// exclusive owner, never re-listed by a sibling that merely hash-owns it.
const _groupExclusiveSlugs = new Map<string, Set<string>>();
for (const group of SITEMAP_PARTITION_GROUPS) {
  const claimed = new Set<string>();
  for (const sid of group) {
    const m = _overrideByStore.get(sid);
    if (m) for (const slug of m.keys()) claimed.add(slug);
  }
  for (const sid of group) _groupExclusiveSlugs.set(sid, claimed);
}

// marka.pet (cargo) internal links must resolve WITHIN the cargo slug space.
// The shared generator borrows core/sibling links that, on a LOCAL store, point
// at localOnly curated slugs (e.g. /kedi-mamasi, /en-yakin-petshop) which a cargo
// store never serves. Drop any single-segment SEO link on a markapet-exclusive
// page that does not resolve to a slug reachable on marka.pet; parametric/app
// routes (href containing a nested "/") are left untouched.
{
  const _markapetServed = new Set<string>(_cargoSlugMap.keys());
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) _markapetServed.add(p.slug);
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) {
    if (!p.internalLinks) continue;
    p.internalLinks = p.internalLinks.filter((l) => {
      const href = l.href || "";
      if (!href.startsWith("/")) return true;
      const slug = href.slice(1);
      if (!slug || slug.includes("/")) return true; // app / parametric route
      return _markapetServed.has(slug);
    });
  }
}

// karadenizpetshop.com (cargo) internal links must resolve WITHIN the cargo slug
// space too — same rationale as the marka.pet filter above. Drop any single-segment
// SEO link on a karadeniz-exclusive page that does not resolve to a slug reachable
// on karadenizpetshop.com; parametric/app routes (nested "/") are left untouched.
{
  const _karadenizServed = new Set<string>(_cargoSlugMap.keys());
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) _karadenizServed.add(p.slug);
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) {
    if (!p.internalLinks) continue;
    p.internalLinks = p.internalLinks.filter((l) => {
      const href = l.href || "";
      if (!href.startsWith("/")) return true;
      const slug = href.slice(1);
      if (!slug || slug.includes("/")) return true; // app / parametric route
      return _karadenizServed.has(slug);
    });
  }
}

// atakumpet.com (cargo) internal links must resolve WITHIN the cargo slug space
// too — same rationale as the marka.pet / karadeniz filters above. Drop any
// single-segment SEO link on a samsun-exclusive page that does not resolve to a
// slug reachable on atakumpet.com; parametric/app routes (nested "/") are left
// untouched.
{
  const _samsunServed = new Set<string>(_cargoSlugMap.keys());
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) _samsunServed.add(p.slug);
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    if (!p.internalLinks) continue;
    p.internalLinks = p.internalLinks.filter((l) => {
      const href = l.href || "";
      if (!href.startsWith("/")) return true;
      const slug = href.slice(1);
      if (!slug || slug.includes("/")) return true; // app / parametric route
      return _samsunServed.has(slug);
    });
  }
}

/** Resolve a slug to the variant served by this store: its own exclusive
 * override first, otherwise the shared variant for its commerce model. */
export function findSeoPage(slug: string, store: StoreConfig): SeoPageData | undefined {
  const override = _overrideByStore.get(store.id)?.get(slug);
  if (override) return override;
  return (isCargoStore(store) ? _cargoSlugMap : _localSlugMap).get(slug);
}

/** Set of slugs reachable on this store (for link/orphan filtering). */
export function availableSlugSet(store: StoreConfig): Set<string> {
  const set = new Set((isCargoStore(store) ? _cargoSlugMap : _localSlugMap).keys());
  const overrides = _overrideByStore.get(store.id);
  if (overrides) for (const slug of overrides.keys()) set.add(slug);
  return set;
}

/** Every SEO slug across both models — used to tell SEO links from app routes. */
export const ALL_SEO_SLUGS: Set<string> = new Set(SEO_PAGES.map((p) => p.slug));
