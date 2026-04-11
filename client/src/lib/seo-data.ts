export interface SeoSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
}

export interface SeoPageData {
  slug: string;
  type: "core" | "district" | "mahalle-block" | "mahalle" | "category" | "blog" | "keyword";
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
          "jetgo.pet web sitemiz üzerinden tüm ürünleri inceleyebilir, fiyatları karşılaştırabilir ve sepetinize ekleyebilirsiniz. Ardından WhatsApp üzerinden tek tıkla siparişinizi onaylayın. Kurye ekibimiz siparişinizi kapınıza kadar getirir. Kapıda nakit, POS ile kredi kartı veya QR kod ile ödeme yapabilirsiniz.",
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
          "Minimum sipariş tutarımız 700 TL'dir. 1.500 TL ve üzeri siparişlerde kargo ücretsizdir. Samsun petshop indirim ve kampanyalarını düzenli olarak güncelliyoruz. Üye olan müşterilerimize özel hoş geldin kuponu hediye ediyoruz.",
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
      { q: "Samsun petshop minimum sipariş tutarı nedir?", a: "Minimum sipariş tutarımız 700 TL'dir. 1.500 TL ve üzeri siparişlerde kargo ücretsizdir." },
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
      { q: "Canik'te minimum sipariş tutarı nedir?", a: "Minimum sipariş tutarımız 700 TL'dir. 1.500 TL üzeri siparişlerde kargo ücretsizdir." },
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
];

const CANIK_MAHALLELER: MahalleConfig[] = [
  { name: "Karşıyaka", slug: "karsiyaka", district: "Canik", districtSlug: "canik", nearby: ["Gaziosmanpaşa", "Yenimahalle", "Kuzeyyıldızı"], landmark: "Karşıyaka merkez" },
  { name: "Gaziosmanpaşa", slug: "gaziosmanpasa", district: "Canik", districtSlug: "canik", nearby: ["Karşıyaka", "Yenimahalle", "Kuzeyyıldızı"] },
  { name: "Yenimahalle", slug: "canik-yenimahalle", district: "Canik", districtSlug: "canik", nearby: ["Karşıyaka", "Gaziosmanpaşa", "Kuzeyyıldızı"] },
  { name: "Kuzeyyıldızı", slug: "kuzeyyildizi", district: "Canik", districtSlug: "canik", nearby: ["Yenimahalle", "Gaziosmanpaşa", "Karşıyaka"] },
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
      { q: `${m.name}'de minimum sipariş tutarı nedir?`, a: `${m.name} mahallesi için minimum sipariş tutarı 700 TL'dir. 1.500 TL üzeri siparişlerde kargo ücretsizdir. Nakit ödemede ekstra avantajlı fiyat uygulanır.` },
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
    metaTitle: "JETGO Petshop Samsun Atakum | Hızlı Teslimat Kapıda Ödeme | jetgo.pet",
    metaDescription: "JETGO petshop Samsun ve Atakum. Kedi maması, köpek maması, kedi kumu 1 saatte kapıya teslim. 900+ ürün, premium markalar. jetgo.pet online sipariş.",
    keywords: "jetgo petshop, jetgo petshop samsun, jetgo petshop atakum, jetgo pet samsun, jetgo.pet, jetgo mama samsun, jetgo petshop hızlı teslim, jetgo petshop eve teslim, jetgo petshop kapıda ödeme, jetgo petshop online sipariş, jetgo petshop kedi kumu",
    h1: "JETGO Petshop - Samsun'un Kapıya Teslim Pet Shop'u",
    intro: [
      "JETGO, Samsun'un ilk ve en kapsamlı kapıya teslim petshop hizmetidir. Getir modeli ile çalışan JETGO, evcil hayvan ürünlerinizi online sipariş ile aynı gün kapınıza teslim eder. jetgo.pet adresinden veya WhatsApp ile kolayca sipariş verebilirsiniz.",
      "JETGO petshop Samsun ve Atakum başta olmak üzere İlkadım ve Canik ilçelerine de hizmet vermektedir. 900'den fazla ürün çeşidi, Royal Canin, Hill's, N&D, Pro Plan gibi premium markalar ve piyasanın en rekabetçi fiyatları ile hizmetinizdeyiz.",
      "JETGO petshop hızlı teslim özelliği sayesinde siparişleriniz ortalama 1-3 saat içinde kapınızda. Kapıda nakit ödeme, POS ile kredi kartı ve QR kod ödeme seçenekleri mevcut. Her siparişte %5 Para Puan kazanırsınız.",
    ],
    sections: [
      {
        h2: "JETGO Petshop Neden Farklı?",
        paragraphs: [
          "JETGO petshop geleneksel pet shop'lardan farklı olarak tamamen online çalışan bir kapıya teslim hizmetidir. Mağazaya gitmenize, trafikte vakit kaybetmenize veya ağır çuvalları taşımanıza gerek yok. Tüm ürünleri online inceleyin, fiyatları karşılaştırın ve tek tıkla sipariş verin.",
          "JETGO petshop mama sipariş sürecini olabildiğince kolaylaştırmıştır. Web sitesi jetgo.pet üzerinden sepetinizi oluşturun, WhatsApp ile onaylayın ve aynı gün teslimatı bekleyin. Sesli sipariş seçeneği ile WhatsApp üzerinden sesli mesajla da sipariş verebilirsiniz.",
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
      "jetgo.pet online sipariş platformu",
      "Atakum, İlkadım, Canik teslimat",
    ],
    faq: [
      { q: "JETGO petshop nasıl sipariş verilir?", a: "jetgo.pet adresinden ürünlerinizi sepete ekleyin, WhatsApp ile siparişi onaylayın. Aynı gün kapınıza teslim edilir. Sesli sipariş de mevcuttur." },
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
          "Atakum petshop kedi maması siparişinizi jetgo.pet üzerinden veya WhatsApp ile verin, aynı gün kapınıza teslim edelim. 1,5 kg'dan 15 kg'a kadar tüm paket boyutları mevcut.",
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
          "jetgo.pet üzerinden ürünlerinizi sepete ekleyin, WhatsApp ile siparişinizi onaylayın. Samsun petshop kurye ekibimiz siparişinizi kapınıza getirir. Ortalama teslimat süremiz 1-3 saattir. Samsun petshop hızlı kurye hizmetimizle acil ihtiyaçlarınız için öncelikli teslimat da mevcuttur.",
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
      "Online alışverişin avantajlarından yararlanın: fiyat karşılaştırma, ürün detayları ve Para Puan kazanımı. Her siparişte %5 Para Puan kazanın. Samsun petshop e-ticaret platformumuz jetgo.pet üzerinden güvenle alışveriş yapın.",
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
      { q: "Samsun online petshop'tan nasıl sipariş verilir?", a: "jetgo.pet adresine girin, ürünlerinizi sepete ekleyin ve WhatsApp üzerinden siparişinizi tamamlayın. Aynı gün kapınıza teslim." },
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
          "Minimum sipariş tutarı 700 TL, 1.500 TL üzeri ücretsiz kargo. Nakit ödemede ekstra avantajlı fiyat. %5 Para Puan kazanımı. 100 TL hoş geldin kuponu yeni üyelere hediye.",
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
      "Kedinizin açlığını bekletmeyin! jetgo.pet üzerinden veya WhatsApp ile anında sipariş verin. Atakum, İlkadım ve Canik'e hızlandırılmış teslimat seçeneğimiz mevcuttur. Ortalama 1-2 saat içinde kapınızda.",
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
      { q: "Samsun'da mama sipariş nasıl verilir?", a: "jetgo.pet adresinden ürünlerinizi sepete ekleyin, WhatsApp ile siparişinizi tamamlayın. WhatsApp: 0850 840 39 59." },
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
];

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
];

SEO_PAGES.push(...MAHALLE_PAGES, ...KEYWORD_PAGES, ...PRODUCT_SEO_PAGES);
