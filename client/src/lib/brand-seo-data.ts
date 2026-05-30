import type { SeoPageData } from "./seo-data";

interface BrandConfig {
  slug: string;
  brand: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  h1: string;
  intro: string[];
  why: { h2: string; paragraphs: string[]; list?: string[] };
  variants: { h2: string; paragraphs: string[]; list?: string[] };
  features: string[];
  faq: { q: string; a: string }[];
  buyLinks: { text: string; href: string }[];
}

const CONFIGS: BrandConfig[] = [
  {
    slug: "royal-canin-atakum",
    brand: "Royal Canin",
    metaTitle: "Royal Canin Atakum | Kedi & Köpek Maması Aynı Gün Teslimat - JETGO",
    metaDescription:
      "Atakum'da Royal Canin kedi ve köpek mamaları kapınıza aynı gün teslim. Indoor, Sterilised, Kitten, Maxi, Mini ve ırka özel formüller. Kapıda ödeme, %5 Para Puan, uygun fiyat.",
    keywords:
      "royal canin atakum, royal canin samsun, atakum royal canin mama, royal canin kedi maması atakum, royal canin köpek maması atakum, royal canin sterilised atakum, royal canin indoor samsun, royal canin kitten atakum, royal canin fiyat atakum",
    h1: "Royal Canin Atakum: Kedi ve Köpek Mamaları Kapınıza Aynı Gün Teslim",
    intro: [
      "Royal Canin, dünya genelinde veteriner hekimlerin önerdiği; kedi ve köpeklerin ırkına, yaşına ve yaşam tarzına göre bilimsel olarak formüle edilmiş premium mama markasıdır. JETGO ile Atakum'un her mahallesine Royal Canin ürünlerini ağır çuval taşıma derdi olmadan aynı gün kapınıza getiriyoruz.",
      "Royal Canin Indoor, Sterilised, Kitten, Hair & Skin, Maxi Adult, Medium, Mini ve ırka özel (British Shorthair, Persian, German Shepherd) çeşitlerinin tamamı stoklarımızda. Atakum Denizevleri, Güzelyalı, Kurupelit, Atakent ve diğer mahallelerde Royal Canin arıyorsanız doğru yerdesiniz.",
      "Ürünü seçin, sepete ekleyin ve kapıda nakit, kredi kartı (POS) veya QR ile ödeyin. Her Royal Canin siparişinde %5 Para Puan kazanır, biriken puanı sonraki alışverişinizde kullanırsınız.",
    ],
    why: {
      h2: "Royal Canin Neden Veteriner Hekimlerin İlk Tercihi?",
      paragraphs: [
        "Royal Canin, \"tek beden herkese uyar\" yaklaşımını reddeder. Her formül; hayvanın türüne, ırkına, yaşına, boyutuna ve özel ihtiyaçlarına (kısırlaştırılmış, hassas sindirim, tüy sağlığı, kilo kontrolü) göre ayrı geliştirilir. Bu hassas beslenme yaklaşımı, markayı kliniklerin en çok önerdiği seçenek yapar.",
        "Mamaların kroket boyutu, dokusu ve besin yoğunluğu bile ırka göre değişir; Persian kedilerin çenesine uygun badem biçimli kroketler ya da Maxi köpekler için eklem sağlığını destekleyen formüller bunun göstergesidir.",
      ],
      list: [
        "Irk, yaş ve boyuta özel bilimsel formüller",
        "Hassas sindirim ve tüy-deri sağlığını destekleyen içerikler",
        "Kısırlaştırılmış kedi/köpekler için kilo kontrollü seçenekler",
      ],
    },
    variants: {
      h2: "Atakum'da Bulabileceğiniz Royal Canin Çeşitleri",
      paragraphs: [
        "Kediler için Indoor (ev kedileri), Sterilised (kısırlaştırılmış), Kitten (yavru), Hair & Skin (tüy sağlığı) ve ırka özel mamalar. Köpekler için Maxi, Medium, Mini ırk boyutuna göre yetişkin ve yavru (Puppy) formülleri ile ırka özel seçenekler.",
        "Hem kuru mama hem açık (gramajla) mama seçenekleriyle bütçenize ve damak tadına uygun çözümler sunuyoruz.",
      ],
    },
    features: [
      "Veteriner hekim önerili, bilimsel formüller",
      "Irk, yaş ve boyuta özel mama çeşitleri",
      "Indoor, Sterilised, Kitten, Maxi, Mini seçenekleri",
      "Atakum'un tüm mahallelerine aynı gün teslimat",
      "Kapıda nakit, kredi kartı (POS) ve QR ödeme",
      "Her siparişte %5 Para Puan kazancı",
    ],
    faq: [
      { q: "Royal Canin Indoor ile Sterilised arasındaki fark nedir?", a: "Indoor, az hareket eden ev kedileri için kalori dengelenmiş bir formüldür. Sterilised ise kısırlaştırılmış kedilerin değişen metabolizmasına ve kilo alma eğilimine göre geliştirilmiştir." },
      { q: "Royal Canin kedi maması köpeklere verilebilir mi?", a: "Hayır. Kedi ve köpeklerin besin ihtiyaçları farklıdır. Köpeğiniz için Royal Canin köpek maması kategorisinden ırk boyutuna uygun ürünü seçmelisiniz." },
      { q: "Atakum'da Royal Canin fiyatları ne kadar?", a: "Fiyatlar ürün türü ve gramaja göre değişir. Yukarıdaki butonlardan kategori sayfasına geçip güncel fiyatları görebilirsiniz. Nakit ödemede ayrıca avantaj sunuyoruz." },
    ],
    buyLinks: [
      { text: "Royal Canin Köpek Maması", href: "/kategori/kopek/mama-markalari/royal-canin" },
      { text: "Royal Canin Kedi Maması", href: "/kategori/kedi/kedi-mamasi/royal-canin" },
    ],
  },
  {
    slug: "nd-atakum",
    brand: "N&D",
    metaTitle: "N&D Atakum | Farmina Tahılsız Kedi & Köpek Maması - JETGO",
    metaDescription:
      "Atakum'da N&D (Farmina) tahılsız ve düşük tahıllı kedi & köpek mamaları aynı gün kapınızda. Yüksek hayvansal protein, balkabağı ve fonksiyonel formüller. Kapıda ödeme.",
    keywords:
      "nd atakum, n&d atakum, farmina atakum, nd mama samsun, nd tahılsız mama atakum, nd kedi maması atakum, nd köpek maması atakum, n&d grain free samsun",
    h1: "N&D Atakum: Farmina Tahılsız ve Düşük Tahıllı Mamalar Kapınızda",
    intro: [
      "N&D (Natural & Delicious), İtalyan Farmina firmasının yüksek hayvansal protein içeren premium mama serisidir. Tahılsız (Grain Free) ve Ata Tahılı (Ancestral Grain – kızıl buğday ve yulaf) çizgileriyle doğal beslenmeyi öne çıkarır. JETGO ile N&D ürünlerini Atakum'da aynı gün kapınıza getiriyoruz.",
      "Balkabağı, bıldırcın, ringa balığı, kuzu ve narenciye gibi fonksiyonel içerikler N&D'yi farklı kılar. Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde N&D mama arayanlar için doğru adres JETGO'dur.",
      "Ürünü seçin, sepete ekleyin, kapıda nakit/kart/QR ile ödeyin. Her N&D siparişinde %5 Para Puan kazanırsınız.",
    ],
    why: {
      h2: "N&D'yi Farklı Kılan Nedir?",
      paragraphs: [
        "N&D, yüksek oranda taze hayvansal protein ve düşük karbonhidrat felsefesiyle üretilir. Tahılsız serilerde tahıl yerine balkabağı gibi düşük glisemik içerikler kullanılır; bu da hassas sindirimli dostlar için tercih sebebidir.",
        "GDO'suz içerikler ve fonksiyonel reçeteler (deri-tüy sağlığı, sindirim, kilo dengesi) markanın öne çıkan özellikleridir.",
      ],
      list: [
        "Tahılsız (Grain Free) ve düşük tahıllı (Ancestral Grain) seriler",
        "Yüksek taze hayvansal protein oranı",
        "Balkabağı, bıldırcın, ringa gibi fonksiyonel içerikler",
      ],
    },
    variants: {
      h2: "Atakum'da N&D Çeşitleri",
      paragraphs: [
        "Köpekler için ırk boyutuna ve yaşa göre tahılsız ve düşük tahıllı kuru mamalar; kediler için kısırlaştırılmış, yavru ve yetişkin formülleri ile açık mama seçenekleri mevcuttur.",
        "Hassas sindirim, deri-tüy sağlığı ve kilo kontrolü gibi ihtiyaçlara yönelik reçeteleri kategori sayfasından inceleyebilirsiniz.",
      ],
    },
    features: [
      "Tahılsız ve düşük tahıllı premium seriler",
      "Yüksek hayvansal protein, düşük karbonhidrat",
      "GDO'suz, fonksiyonel içerikler",
      "Kedi ve köpek için geniş çeşit",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "N&D tahılsız mama her köpeğe uygun mu?", a: "Tahılsız seriler özellikle tahıl hassasiyeti olan köpekler için idealdir. Köpeğinizin yaşı ve ırk boyutuna uygun formülü seçmeniz önerilir." },
      { q: "N&D Ancestral Grain ne demek?", a: "Düşük oranda kızıl buğday ve yulaf içeren, tamamen tahılsız olmayan ama düşük tahıllı bir seridir. Tahılsız ile standart mama arası bir seçenektir." },
      { q: "N&D fiyatları Atakum'da ne kadar?", a: "Fiyatlar ürün ve gramaja göre değişir. Yukarıdaki butonla kategori sayfasından güncel fiyatları görebilirsiniz." },
    ],
    buyLinks: [
      { text: "N&D Köpek Maması", href: "/kategori/kopek/mama-markalari/nd" },
      { text: "N&D Kedi Maması", href: "/kategori/kedi/kedi-mamasi/nd" },
    ],
  },
  {
    slug: "hills-atakum",
    brand: "Hill's Science Plan",
    metaTitle: "Hill's Science Plan Atakum | Bilim Temelli Kedi & Köpek Maması - JETGO",
    metaDescription:
      "Atakum'da Hill's Science Plan kedi & köpek mamaları aynı gün kapınızda. Veterinerlerle geliştirilen, yaşam evresine ve özel ihtiyaca göre formüller. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "hills atakum, hill's science plan atakum, hills mama samsun, hills kedi maması atakum, hills köpek maması atakum, hills sensitive stomach atakum, hills sterilised samsun",
    h1: "Hill's Science Plan Atakum: Bilim Temelli Beslenme Kapınızda",
    intro: [
      "Hill's Science Plan, veteriner hekimler ve beslenme uzmanlarıyla geliştirilen, bilim temelli premium mama markasıdır. Klinik olarak kanıtlanmış beslenme yaklaşımıyla dünya genelinde tercih edilir. JETGO ile Hill's ürünlerini Atakum'da aynı gün kapınıza getiriyoruz.",
      "Yaşam evresine (yavru, yetişkin, yaşlı) ve özel ihtiyaca (Sensitive Stomach & Skin, Sterilised, Light, Oral Care) göre formüller sunan Hill's, Atakum Denizevleri, Güzelyalı ve Kurupelit'te kolayca ulaşabileceğiniz markadır.",
      "Sepete ekleyin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Hill's Science Plan Neden Tercih Edilir?",
      paragraphs: [
        "Hill's, içeriklerini ve oranlarını bilimsel araştırmalara dayandırır. Sindirim sağlığı, deri-tüy kalitesi, ağız sağlığı ve kilo yönetimi gibi spesifik konularda hedeflenmiş çözümler sunar.",
        "Klinik temelli geçmişi sayesinde hassas mideli ve özel ihtiyaçlı dostlar için güvenli bir tercihtir.",
      ],
      list: [
        "Veteriner ve beslenme uzmanlarıyla geliştirilmiş",
        "Yaşam evresine ve özel ihtiyaca göre formüller",
        "Sindirim, deri-tüy ve ağız sağlığına yönelik reçeteler",
      ],
    },
    variants: {
      h2: "Atakum'da Hill's Çeşitleri",
      paragraphs: [
        "Kediler için Sterilised, Sensitive Stomach & Skin, Indoor, Kitten ve yetişkin formülleri; köpekler için ırk boyutuna ve yaşa göre kuru mamalar ile açık mama seçenekleri bulunur.",
        "İhtiyacınıza uygun Hill's ürününü kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
      ],
    },
    features: [
      "Bilim temelli, klinik destekli formüller",
      "Yaşam evresine özel beslenme",
      "Hassas mide ve deri için özel seriler",
      "Kedi ve köpek için geniş çeşit",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Hill's Sensitive Stomach kimler için uygun?", a: "Hassas sindirim sistemine veya hassas deriye sahip kedi ve köpekler için geliştirilmiş bir seridir. Sindirimi kolay içeriklerle hazırlanır." },
      { q: "Hill's Science Plan ile Prescription Diet farkı nedir?", a: "Science Plan günlük sağlıklı beslenme serisidir. Prescription Diet ise veteriner kontrolünde, belirli rahatsızlıklara yönelik özel bir seridir." },
      { q: "Hill's Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Hill's siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Hill's Köpek Maması", href: "/kategori/kopek/mama-markalari/hills" },
      { text: "Hill's Kedi Maması", href: "/kategori/kedi/kedi-mamasi/hills" },
    ],
  },
  {
    slug: "pro-plan-atakum",
    brand: "Pro Plan",
    metaTitle: "Pro Plan Atakum | Purina Kedi & Köpek Maması Aynı Gün Teslim - JETGO",
    metaDescription:
      "Atakum'da Purina Pro Plan kedi & köpek mamaları aynı gün kapınızda. OptiHealth teknolojileri, probiyotik destekli formüller. Kapıda ödeme, %5 Para Puan, uygun fiyat.",
    keywords:
      "pro plan atakum, purina pro plan atakum, pro plan mama samsun, pro plan kedi maması atakum, pro plan köpek maması atakum, pro plan sterilised samsun",
    h1: "Pro Plan Atakum: Purina Bilim Temelli Beslenme Kapınızda",
    intro: [
      "Purina Pro Plan, bilim temelli ileri beslenme yaklaşımıyla geliştirilen premium mama markasıdır. OPTI- teknolojileri ve bazı formüllerdeki canlı probiyotik desteğiyle dostlarınızın sağlığını destekler. JETGO ile Pro Plan'ı Atakum'da aynı gün kapınıza getiriyoruz.",
      "Yaşa, boyuta ve özel ihtiyaca göre çeşitlenen Pro Plan, Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde kolayca ulaşabileceğiniz bir seçenektir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Pro Plan'ın Öne Çıkan Özellikleri",
      paragraphs: [
        "Pro Plan, sindirim sağlığı (OPTIDIGEST), denge (OPTIBALANCE) ve bağışıklık gibi hedeflere yönelik teknolojilerle formüle edilir. Bazı serilerde bulunan canlı probiyotik, sindirimi destekler.",
        "Yüksek kaliteli protein kaynakları ve dengeli içerikleriyle aktif ve seçici dostlar için güçlü bir tercihtir.",
      ],
      list: [
        "OPTI- teknolojileriyle hedefli beslenme",
        "Bazı serilerde canlı probiyotik desteği",
        "Yaş, boyut ve özel ihtiyaca göre çeşit",
      ],
    },
    variants: {
      h2: "Atakum'da Pro Plan Çeşitleri",
      paragraphs: [
        "Kediler için Sterilised, Kitten, hassas sindirim ve yetişkin formülleri ile açık mama; köpekler için ırk boyutuna ve yaşa göre kuru mamalar bulunur.",
        "İhtiyacınıza uygun Pro Plan ürününü kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
      ],
    },
    features: [
      "Bilim temelli ileri beslenme",
      "OPTI- teknolojileri ile hedefli formüller",
      "Probiyotik destekli seçenekler",
      "Kedi ve köpek için geniş çeşit",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Pro Plan Sterilised ne işe yarar?", a: "Kısırlaştırılmış kedilerin metabolizmasına uygun, kilo kontrolünü destekleyen dengeli bir formüldür." },
      { q: "Pro Plan'da probiyotik var mı?", a: "Bazı Pro Plan serileri canlı probiyotik içerir ve sindirim sağlığını destekler. Ürün açıklamasından kontrol edebilirsiniz." },
      { q: "Pro Plan Atakum fiyatları ne kadar?", a: "Fiyatlar ürün ve gramaja göre değişir. Kategori sayfasından güncel fiyatları görebilirsiniz." },
    ],
    buyLinks: [
      { text: "Pro Plan Köpek Maması", href: "/kategori/kopek/mama-markalari/pro-plan" },
      { text: "Pro Plan Kedi Maması", href: "/kategori/kedi/kedi-mamasi/pro-plan" },
    ],
  },
  {
    slug: "reflex-plus-atakum",
    brand: "Reflex Plus",
    metaTitle: "Reflex Plus Atakum | Köpek Maması Aynı Gün Teslim - JETGO",
    metaDescription:
      "Atakum'da Reflex Plus köpek mamaları aynı gün kapınızda. Yüksek protein, dengeli ve uygun fiyatlı premium yerli üretim. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "reflex plus atakum, reflex plus mama samsun, reflex plus köpek maması atakum, reflex plus fiyat atakum, yerli köpek maması atakum",
    h1: "Reflex Plus Atakum: Uygun Fiyatlı Premium Köpek Maması",
    intro: [
      "Reflex Plus, yerli üretim premium mama serisidir; yüksek protein ve dengeli içeriğiyle kalite-fiyat dengesi arayanların tercihidir. JETGO ile Reflex Plus'ı Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde uygun fiyatlı kaliteli köpek maması arayanlar için ideal bir seçenektir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Reflex Plus Neden Tercih Edilir?",
      paragraphs: [
        "Reflex Plus, premium içerikleri uygun fiyatla sunarak geniş bir kullanıcı kitlesine hitap eder. Dengeli protein-yağ oranı ve sindirimi destekleyen içerikleriyle günlük beslenme için güvenilirdir.",
        "Yerli üretim olması, hızlı tedarik ve erişilebilir fiyat avantajı sağlar.",
      ],
      list: [
        "Yüksek protein, dengeli formül",
        "Premium kalite, uygun fiyat",
        "Yerli üretim, kolay tedarik",
      ],
    },
    variants: {
      h2: "Atakum'da Reflex Plus Çeşitleri",
      paragraphs: [
        "Köpekler için ırk boyutuna ve yaşa göre kuru mama seçenekleri mevcuttur. Yavru ve yetişkin formüllerini kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
        "Bütçenize uygun çuval boyutlarıyla ekonomik alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Yüksek protein, dengeli içerik",
      "Premium kalite, uygun fiyat",
      "Yerli üretim",
      "Irk boyutuna göre çeşit",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Reflex Plus ile Reflex arasındaki fark nedir?", a: "Reflex Plus, Reflex serisinin üst (premium) çizgisidir; daha yüksek protein ve zenginleştirilmiş içeriklere sahiptir." },
      { q: "Reflex Plus hangi köpeklere uygun?", a: "Irk boyutuna ve yaşa uygun formül seçilerek hemen her köpek için kullanılabilir. Yavru ve yetişkin seçenekleri vardır." },
      { q: "Reflex Plus Atakum fiyatları ne kadar?", a: "Fiyatlar çuval boyutuna göre değişir. Kategori sayfasından güncel fiyatları görebilirsiniz." },
    ],
    buyLinks: [
      { text: "Reflex Plus Köpek Maması", href: "/kategori/kopek/mama-markalari/reflex-plus" },
    ],
  },
  {
    slug: "reflex-atakum",
    brand: "Reflex",
    metaTitle: "Reflex Atakum | Kedi & Köpek Maması Aynı Gün Teslim - JETGO",
    metaDescription:
      "Atakum'da Reflex kedi & köpek mamaları aynı gün kapınızda. Geniş çeşit, uygun fiyatlı yerli üretim mama. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "reflex atakum, reflex mama samsun, reflex kedi maması atakum, reflex köpek maması atakum, reflex fiyat atakum, yerli mama atakum",
    h1: "Reflex Atakum: Uygun Fiyatlı Kedi ve Köpek Maması",
    intro: [
      "Reflex, geniş ürün yelpazesi ve uygun fiyatıyla Türkiye'nin en bilinen yerli mama markalarından biridir. JETGO ile Reflex ürünlerini Atakum'da aynı gün kapınıza getiriyoruz.",
      "Kedi ve köpekler için kuru ve açık mama seçenekleriyle Reflex, Atakum Denizevleri, Güzelyalı ve Kurupelit'te bütçe dostu beslenme arayanların tercihidir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Reflex'i Tercih Etme Nedenleri",
      paragraphs: [
        "Reflex, dengeli içerikleri uygun fiyatla sunar. Günlük beslenme için ekonomik ve ulaşılabilir bir seçenektir; geniş çeşitliliğiyle hemen her ihtiyaca yanıt verir.",
        "Yerli üretim olması hızlı tedarik ve fiyat avantajı sağlar.",
      ],
      list: [
        "Geniş ürün yelpazesi",
        "Uygun fiyat, ekonomik beslenme",
        "Yerli üretim, kolay tedarik",
      ],
    },
    variants: {
      h2: "Atakum'da Reflex Çeşitleri",
      paragraphs: [
        "Kediler için yetişkin, yavru ve açık mama; köpekler için ırk boyutuna ve yaşa göre kuru mama seçenekleri mevcuttur.",
        "İhtiyacınıza uygun Reflex ürününü kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
      ],
    },
    features: [
      "Geniş çeşit, ekonomik fiyat",
      "Kedi ve köpek için seçenekler",
      "Kuru ve açık mama",
      "Yerli üretim",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Reflex mama kaliteli mi?", a: "Reflex, dengeli içerikleri uygun fiyatla sunan güvenilir bir yerli markadır. Daha yüksek protein için Reflex Plus serisini tercih edebilirsiniz." },
      { q: "Reflex açık mama satılıyor mu?", a: "Evet, Reflex açık (gramajla) mama seçenekleri mevcuttur. Kategori sayfasından inceleyebilirsiniz." },
      { q: "Reflex Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Reflex siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Reflex Köpek Maması", href: "/kategori/kopek/mama-markalari/reflex-mama" },
      { text: "Reflex Kedi Maması", href: "/kategori/kedi/kedi-mamasi/reflex" },
    ],
  },
  {
    slug: "felicia-atakum",
    brand: "Felicia",
    metaTitle: "Felicia Atakum | Uygun Fiyatlı Kedi & Köpek Maması - JETGO",
    metaDescription:
      "Atakum'da Felicia kedi & köpek mamaları aynı gün kapınızda. Uygun fiyatlı, dengeli içerikli yerli üretim mama. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "felicia atakum, felicia mama samsun, felicia kedi maması atakum, felicia köpek maması atakum, felicia fiyat atakum, ekonomik mama atakum",
    h1: "Felicia Atakum: Bütçe Dostu Kedi ve Köpek Maması",
    intro: [
      "Felicia, uygun fiyatlı ve dengeli içerikli yerli mama markasıdır; ekonomik beslenme arayan kedi ve köpek sahiplerinin tercihidir. JETGO ile Felicia'yı Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde bütçe dostu kaliteli mama arayanlar için ideal bir seçenektir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Felicia Neden Tercih Edilir?",
      paragraphs: [
        "Felicia, temel besin ihtiyaçlarını uygun fiyatla karşılar. Çok sayıda evcil hayvana bakanlar ve ekonomik beslenme arayanlar için pratik bir çözümdür.",
        "Yerli üretim avantajıyla erişilebilir fiyat ve hızlı tedarik sunar.",
      ],
      list: [
        "Uygun fiyat, dengeli içerik",
        "Çoklu beslenme için ekonomik",
        "Yerli üretim",
      ],
    },
    variants: {
      h2: "Atakum'da Felicia Çeşitleri",
      paragraphs: [
        "Kediler ve köpekler için yetişkin kuru mama seçenekleri mevcuttur. Çuval boyutlarını ve fiyatları kategori sayfasından inceleyebilirsiniz.",
        "Ekonomik çuval seçenekleriyle uygun maliyetli alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Uygun fiyat, ekonomik beslenme",
      "Kedi ve köpek için seçenekler",
      "Dengeli temel içerik",
      "Yerli üretim",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Felicia mama kimler için uygun?", a: "Ekonomik beslenme arayanlar ve çoklu evcil hayvan bakanlar için uygun, dengeli bir temel mamadır." },
      { q: "Felicia çuval boyutları neler?", a: "Farklı çuval boyutları mevcuttur. Güncel seçenekleri ve fiyatları kategori sayfasından görebilirsiniz." },
      { q: "Felicia Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Felicia siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Felicia Köpek Maması", href: "/kategori/kopek/mama-markalari/felicia" },
      { text: "Felicia Kedi Maması", href: "/kategori/kedi/kedi-mamasi/felicia" },
    ],
  },
  {
    slug: "lavital-atakum",
    brand: "LaVital",
    metaTitle: "LaVital Atakum | Kedi & Köpek Maması Aynı Gün Teslim - JETGO",
    metaDescription:
      "Atakum'da LaVital kedi & köpek mamaları aynı gün kapınızda. Uygun fiyatlı, kaliteli yerli üretim mama. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "lavital atakum, lavital mama samsun, lavital kedi maması atakum, lavital köpek maması atakum, lavital fiyat atakum",
    h1: "LaVital Atakum: Kaliteli ve Uygun Fiyatlı Mama",
    intro: [
      "LaVital, uygun fiyatlı premium yaklaşımıyla öne çıkan yerli mama markasıdır. Dengeli içerikleriyle kedi ve köpeklerin günlük beslenmesi için güvenilir bir seçenektir. JETGO ile LaVital'i Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde kalite-fiyat dengesi arayanlar için ideal bir tercihtir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "LaVital Neden Tercih Edilir?",
      paragraphs: [
        "LaVital, kaliteli içerikleri uygun fiyatla sunarak geniş bir kullanıcı kitlesine hitap eder. Dengeli protein-yağ oranıyla günlük beslenme için elverişlidir.",
        "Yerli üretim olması erişilebilir fiyat ve hızlı tedarik sağlar.",
      ],
      list: [
        "Kalite-fiyat dengesi",
        "Dengeli içerik",
        "Yerli üretim",
      ],
    },
    variants: {
      h2: "Atakum'da LaVital Çeşitleri",
      paragraphs: [
        "Kediler ve köpekler için kuru mama seçenekleri mevcuttur. Yaş ve boyuta uygun formülleri kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
        "Farklı çuval boyutlarıyla bütçenize uygun alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Kalite-fiyat dengesi",
      "Kedi ve köpek için seçenekler",
      "Dengeli içerik",
      "Yerli üretim",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "LaVital mama kaliteli mi?", a: "LaVital, dengeli içerikleri uygun fiyatla sunan, günlük beslenme için güvenilir bir yerli markadır." },
      { q: "LaVital hangi hayvanlar için var?", a: "Hem kediler hem köpekler için kuru mama seçenekleri mevcuttur. Kategori sayfasından inceleyebilirsiniz." },
      { q: "LaVital Atakum fiyatları ne kadar?", a: "Fiyatlar çuval boyutuna göre değişir. Kategori sayfasından güncel fiyatları görebilirsiniz." },
    ],
    buyLinks: [
      { text: "LaVital Köpek Maması", href: "/kategori/kopek/mama-markalari/lavital" },
      { text: "LaVital Kedi Maması", href: "/kategori/kedi/kedi-mamasi/lavital" },
    ],
  },
  {
    slug: "pronature-atakum",
    brand: "Pronature",
    metaTitle: "Pronature Atakum | Doğal İçerikli Kedi & Köpek Maması - JETGO",
    metaDescription:
      "Atakum'da Pronature kedi & köpek mamaları aynı gün kapınızda. Doğal, holistik içerikli premium mama. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "pronature atakum, pronature mama samsun, pronature kedi maması atakum, pronature köpek maması atakum, doğal mama atakum, holistik mama samsun",
    h1: "Pronature Atakum: Doğal ve Holistik Beslenme",
    intro: [
      "Pronature, doğal ve holistik içerik yaklaşımıyla öne çıkan, Kanada kökenli premium mama markasıdır. Kaliteli protein kaynakları ve doğal içerikleriyle dostlarınızın sağlığını destekler. JETGO ile Pronature'ı Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde doğal içerikli mama arayanlar için doğru adres JETGO'dur.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Pronature'ı Farklı Kılan Nedir?",
      paragraphs: [
        "Pronature, doğal içerikler ve dengeli reçetelerle holistik beslenmeyi hedefler. Deri-tüy sağlığı ve genel canlılığı destekleyen içerikleriyle bilinir.",
        "Kaliteli protein kaynakları ve özenli formülasyon markanın temel özelliğidir.",
      ],
      list: [
        "Doğal ve holistik içerik yaklaşımı",
        "Kaliteli protein kaynakları",
        "Deri-tüy sağlığını destekleyen reçeteler",
      ],
    },
    variants: {
      h2: "Atakum'da Pronature Çeşitleri",
      paragraphs: [
        "Kediler için yetişkin ve özel ihtiyaç formülleri; köpekler için ırk boyutuna ve yaşa göre kuru mama seçenekleri mevcuttur.",
        "İhtiyacınıza uygun Pronature ürününü kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
      ],
    },
    features: [
      "Doğal, holistik içerik",
      "Kaliteli protein kaynakları",
      "Kedi ve köpek için seçenekler",
      "Deri-tüy sağlığına destek",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Pronature holistik mama ne demek?", a: "Holistik mama, doğal içeriklerle bütüncül beslenmeyi hedefleyen, yapay katkıları sınırlı tutan yaklaşımı ifade eder." },
      { q: "Pronature hangi hayvanlar için var?", a: "Hem kediler hem köpekler için kuru mama seçenekleri mevcuttur. Kategori sayfasından inceleyebilirsiniz." },
      { q: "Pronature Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Pronature siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Pronature Köpek Maması", href: "/kategori/kopek/mama-markalari/pronature" },
      { text: "Pronature Kedi Maması", href: "/kategori/kedi/kedi-mamasi/pronature" },
    ],
  },
  {
    slug: "prochoice-atakum",
    brand: "ProChoice",
    metaTitle: "ProChoice Atakum | Kedi & Köpek Maması Aynı Gün Teslim - JETGO",
    metaDescription:
      "Atakum'da ProChoice kedi & köpek mamaları aynı gün kapınızda. Dengeli içerikli, uygun fiyatlı mama. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "prochoice atakum, prochoice mama samsun, prochoice kedi maması atakum, prochoice köpek maması atakum, prochoice fiyat atakum",
    h1: "ProChoice Atakum: Dengeli ve Uygun Fiyatlı Mama",
    intro: [
      "ProChoice, dengeli içerikleri uygun fiyatla sunan mama markasıdır; günlük beslenme için pratik bir tercihtir. JETGO ile ProChoice'u Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde uygun fiyatlı kaliteli mama arayanlar için elverişli bir seçenektir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "ProChoice Neden Tercih Edilir?",
      paragraphs: [
        "ProChoice, dengeli protein ve yağ oranlarıyla günlük beslenme ihtiyacını uygun maliyetle karşılar. Erişilebilir fiyatıyla pratik bir çözümdür.",
        "Kedi ve köpek için çeşitli seçenekleriyle farklı ihtiyaçlara yanıt verir.",
      ],
      list: [
        "Dengeli içerik, uygun fiyat",
        "Kedi ve köpek için çeşit",
        "Günlük beslenme için pratik",
      ],
    },
    variants: {
      h2: "Atakum'da ProChoice Çeşitleri",
      paragraphs: [
        "Kediler ve köpekler için kuru ve açık mama seçenekleri mevcuttur. Yaş ve boyuta uygun formülleri kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
        "Bütçenize uygun seçeneklerle ekonomik alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Dengeli içerik, uygun fiyat",
      "Kedi ve köpek için seçenekler",
      "Kuru ve açık mama",
      "Günlük beslenme için pratik",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "ProChoice mama kimler için uygun?", a: "Uygun fiyatlı, dengeli günlük beslenme arayan kedi ve köpek sahipleri için elverişlidir." },
      { q: "ProChoice açık mama var mı?", a: "Evet, ProChoice açık (gramajla) mama seçenekleri mevcuttur. Kategori sayfasından inceleyebilirsiniz." },
      { q: "ProChoice Atakum fiyatları ne kadar?", a: "Fiyatlar ürün ve gramaja göre değişir. Kategori sayfasından güncel fiyatları görebilirsiniz." },
    ],
    buyLinks: [
      { text: "ProChoice Köpek Maması", href: "/kategori/kopek/mama-markalari/prochoice" },
      { text: "ProChoice Kedi Maması", href: "/kategori/kedi/kedi-mamasi/prochoice" },
    ],
  },
  {
    slug: "properformance-atakum",
    brand: "ProPerformance",
    metaTitle: "ProPerformance Atakum | Enerjik Köpek & Kedi Maması - JETGO",
    metaDescription:
      "Atakum'da ProPerformance kedi & köpek mamaları aynı gün kapınızda. Aktif dostlar için enerji ve protein dengeli formüller. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "properformance atakum, properformance mama samsun, properformance köpek maması atakum, properformance kedi maması atakum, aktif köpek maması atakum",
    h1: "ProPerformance Atakum: Aktif Dostlar İçin Enerjik Beslenme",
    intro: [
      "ProPerformance, aktif ve enerjik dostlar için protein-enerji dengesi gözetilerek hazırlanan mama markasıdır. JETGO ile ProPerformance'ı Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde hareketli köpek ve kedileri için doyurucu mama arayanlar için uygun bir tercihtir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "ProPerformance Neden Tercih Edilir?",
      paragraphs: [
        "ProPerformance, yüksek enerji ihtiyacı olan aktif hayvanlar için dengeli protein ve yağ oranlarıyla formüle edilir. Günlük hareketliliği yüksek dostlar için doyurucu bir seçenektir.",
        "Uygun fiyatlı yapısıyla performans beslenmesini erişilebilir kılar.",
      ],
      list: [
        "Aktif dostlar için enerji dengesi",
        "Dengeli protein-yağ oranı",
        "Uygun fiyatlı performans beslenmesi",
      ],
    },
    variants: {
      h2: "Atakum'da ProPerformance Çeşitleri",
      paragraphs: [
        "Köpekler ve kediler için kuru mama seçenekleri mevcuttur. Yaş ve boyuta uygun formülleri kategori sayfasından fiyatlarıyla inceleyebilirsiniz.",
        "Farklı çuval boyutlarıyla bütçenize uygun alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Aktif dostlar için enerjik formül",
      "Dengeli protein-yağ oranı",
      "Kedi ve köpek için seçenekler",
      "Uygun fiyat",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "ProPerformance hangi köpekler için uygun?", a: "Hareketli, enerji ihtiyacı yüksek köpekler için doyurucu ve dengeli bir mamadır. Yaş ve boyuta uygun formül seçilmelidir." },
      { q: "ProPerformance kedi maması var mı?", a: "Evet, kediler için de seçenekleri mevcuttur. Kategori sayfasından inceleyebilirsiniz." },
      { q: "ProPerformance Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine ProPerformance siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "ProPerformance Köpek Maması", href: "/kategori/kopek/mama-markalari/properformance" },
      { text: "ProPerformance Kedi Maması", href: "/kategori/kedi/kedi-mamasi/properformance" },
    ],
  },
  {
    slug: "econature-atakum",
    brand: "Econature",
    metaTitle: "Econature Atakum | Uygun Fiyatlı Köpek Maması - JETGO",
    metaDescription:
      "Atakum'da Econature köpek mamaları aynı gün kapınızda. Doğal içerik yaklaşımı, uygun fiyat. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "econature atakum, econature mama samsun, econature köpek maması atakum, econature fiyat atakum, uygun köpek maması atakum",
    h1: "Econature Atakum: Uygun Fiyatlı Doğal İçerikli Köpek Maması",
    intro: [
      "Econature, doğal içerik yaklaşımını uygun fiyatla buluşturan köpek maması markasıdır. JETGO ile Econature'ı Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde ekonomik ve dengeli köpek maması arayanlar için uygun bir tercihtir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Econature Neden Tercih Edilir?",
      paragraphs: [
        "Econature, dengeli içerikleri uygun fiyatla sunar. Günlük beslenme için ekonomik ve ulaşılabilir bir çözümdür.",
        "Çoklu beslenme ve bütçe dostu alışveriş için elverişli bir seçenektir.",
      ],
      list: [
        "Doğal içerik yaklaşımı",
        "Uygun fiyat",
        "Günlük beslenme için pratik",
      ],
    },
    variants: {
      h2: "Atakum'da Econature Çeşitleri",
      paragraphs: [
        "Köpekler için ırk boyutuna ve yaşa göre kuru mama seçenekleri mevcuttur. Çuval boyutlarını ve fiyatları kategori sayfasından inceleyebilirsiniz.",
        "Ekonomik seçeneklerle uygun maliyetli alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Doğal içerik yaklaşımı",
      "Uygun fiyat",
      "Irk boyutuna göre çeşit",
      "Ekonomik beslenme",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Econature mama kimler için uygun?", a: "Ekonomik ve dengeli günlük beslenme arayan köpek sahipleri için uygun bir mamadır." },
      { q: "Econature çuval boyutları neler?", a: "Farklı çuval boyutları mevcuttur. Güncel seçenekleri ve fiyatları kategori sayfasından görebilirsiniz." },
      { q: "Econature Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Econature siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Econature Köpek Maması", href: "/kategori/kopek/mama-markalari/econature" },
    ],
  },
  {
    slug: "enjoy-atakum",
    brand: "Enjoy",
    metaTitle: "Enjoy Atakum | Uygun Fiyatlı Kedi & Köpek Maması - JETGO",
    metaDescription:
      "Atakum'da Enjoy kedi & köpek mamaları aynı gün kapınızda. Ekonomik, dengeli içerikli mama. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "enjoy atakum, enjoy mama samsun, enjoy kedi maması atakum, enjoy köpek maması atakum, ekonomik mama atakum",
    h1: "Enjoy Atakum: Ekonomik Kedi ve Köpek Maması",
    intro: [
      "Enjoy, uygun fiyatlı ve dengeli içerikli mama markasıdır; ekonomik beslenme arayanların pratik tercihidir. JETGO ile Enjoy'u Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde bütçe dostu mama arayanlar için elverişli bir seçenektir.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Enjoy Neden Tercih Edilir?",
      paragraphs: [
        "Enjoy, temel besin ihtiyaçlarını uygun fiyatla karşılar. Çoklu beslenme ve ekonomik alışveriş için pratik bir çözümdür.",
        "Kedi ve köpek için seçenekleriyle farklı ihtiyaçlara yanıt verir.",
      ],
      list: [
        "Uygun fiyat, dengeli içerik",
        "Kedi ve köpek için seçenekler",
        "Ekonomik beslenme",
      ],
    },
    variants: {
      h2: "Atakum'da Enjoy Çeşitleri",
      paragraphs: [
        "Kediler için açık ve kuru mama, köpekler için kuru mama seçenekleri mevcuttur. Fiyatları kategori sayfasından inceleyebilirsiniz.",
        "Bütçenize uygun seçeneklerle ekonomik alışveriş imkânı sunuyoruz.",
      ],
    },
    features: [
      "Uygun fiyat, ekonomik beslenme",
      "Kedi ve köpek için seçenekler",
      "Açık ve kuru mama",
      "Günlük beslenme için pratik",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Enjoy mama kimler için uygun?", a: "Ekonomik günlük beslenme arayan ve çoklu evcil hayvan bakan sahipler için uygun, dengeli bir mamadır." },
      { q: "Enjoy açık mama var mı?", a: "Evet, kediler için açık (gramajla) mama seçenekleri mevcuttur. Kategori sayfasından inceleyebilirsiniz." },
      { q: "Enjoy Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Enjoy siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Enjoy Köpek Maması", href: "/kategori/kopek/mama-markalari/enjoy" },
      { text: "Enjoy Kedi Maması", href: "/kategori/kedi/kedi-mamasi/enjoy" },
    ],
  },
  {
    slug: "wanpy-atakum",
    brand: "Wanpy",
    metaTitle: "Wanpy Atakum | Kedi & Köpek Ödül ve Atıştırmalık - JETGO",
    metaDescription:
      "Atakum'da Wanpy ödül ve atıştırmalık ürünleri aynı gün kapınızda. Lezzetli kedi & köpek snackleri. Kapıda ödeme, %5 Para Puan.",
    keywords:
      "wanpy atakum, wanpy samsun, wanpy ödül atakum, wanpy atıştırmalık samsun, kedi ödülü atakum, köpek ödülü atakum",
    h1: "Wanpy Atakum: Lezzetli Ödül ve Atıştırmalıklar",
    intro: [
      "Wanpy, kedi ve köpekler için lezzetli ödül ve atıştırmalık ürünleriyle bilinen bir markadır. Eğitim ödülü ve keyifli anlar için ideal seçenekler sunar. JETGO ile Wanpy'yi Atakum'da aynı gün kapınıza getiriyoruz.",
      "Atakum Denizevleri, Güzelyalı, Kurupelit ve diğer mahallelerde dostunuzu ödüllendirmek için pratik atıştırmalıklar arıyorsanız doğru yerdesiniz.",
      "Ürünü seçin, kapıda nakit/kart/QR ödeyin ve her siparişte %5 Para Puan kazanın.",
    ],
    why: {
      h2: "Wanpy Ödüllerini Tercih Etme Nedenleri",
      paragraphs: [
        "Wanpy, iştah açıcı tatları ve çeşitli dokularıyla eğitim ödülü ve ikram için kullanışlıdır. Küçük porsiyonları sayesinde günlük kullanım için uygundur.",
        "Geniş çeşitliliğiyle kedi ve köpeklerin damak tadına hitap eder.",
      ],
      list: [
        "Eğitim ve ödüllendirme için ideal",
        "İştah açıcı, çeşitli lezzetler",
        "Kedi ve köpek için seçenekler",
      ],
    },
    variants: {
      h2: "Atakum'da Wanpy Çeşitleri",
      paragraphs: [
        "Kedi ve köpekler için çeşitli ödül ve atıştırmalık seçenekleri mevcuttur. Ürünleri ve fiyatları kategori sayfasından inceleyebilirsiniz.",
        "Dostunuzu ödüllendirmek için uygun fiyatlı seçeneklerle alışveriş yapabilirsiniz.",
      ],
    },
    features: [
      "Eğitim ve ödül için atıştırmalık",
      "İştah açıcı lezzetler",
      "Kedi ve köpek için seçenekler",
      "Pratik, günlük kullanım",
      "Atakum'a aynı gün teslimat",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: "Wanpy ödülleri her gün verilebilir mi?", a: "Ödüller günlük kalori ihtiyacının küçük bir kısmını oluşturmalıdır. Eğitim ve ikram için ölçülü kullanılması önerilir." },
      { q: "Wanpy kedi ve köpek için ayrı mı?", a: "Evet, kediler ve köpekler için farklı ürünler mevcuttur. Kategori sayfasından dostunuza uygun olanı seçebilirsiniz." },
      { q: "Wanpy Atakum'a aynı gün gelir mi?", a: "Evet, Atakum'un tüm mahallelerine Wanpy siparişlerini aynı gün teslim ediyoruz." },
    ],
    buyLinks: [
      { text: "Wanpy Ödül & Atıştırmalık", href: "/kategori/kopek/mama-markalari/wanpy" },
    ],
  },
];

function buildBrandPage(c: BrandConfig, others: BrandConfig[]): SeoPageData {
  const deliverySection = {
    h2: `Atakum'a ${c.brand} Aynı Gün Teslimat`,
    paragraphs: [
      `JETGO, Atakum genelinde ${c.brand} siparişlerini aynı gün teslim eder. Denizevleri, Güzelyalı, Kurupelit, Atakent, İncesu, Mimar Sinan ve diğer mahallelere kurye ekibimiz ürünü kapınıza kadar getirir. Mama bitmeden sipariş verin, dostunuz aç kalmasın.`,
      `Ödemeyi kapıda nakit, POS ile kredi kartı veya QR kod ile yapabilirsiniz; online kredi kartı seçeneği de mevcuttur. Her ${c.brand} siparişinde %5 Para Puan kazanır, bir sonraki alışverişinizde indirim olarak kullanırsınız.`,
    ],
  };

  const sharedFaq = [
    { q: `${c.brand} Atakum'a aynı gün teslim ediliyor mu?`, a: `Evet. Atakum'un tüm mahallelerine (Denizevleri, Güzelyalı, Kurupelit, Atakent ve diğerleri) ${c.brand} siparişlerini aynı gün kapınıza teslim ediyoruz.` },
    { q: `${c.brand} siparişinde kapıda ödeme var mı?`, a: `Evet. Kapıda nakit, kredi kartı (POS) ve QR kod ile ödeyebilir; dilerseniz online kredi kartı da kullanabilirsiniz. Her siparişte %5 Para Puan kazanırsınız.` },
  ];

  const crossLinks = others.slice(0, 3).map((o) => ({ text: `${o.brand} Atakum`, href: `/${o.slug}` }));

  return {
    slug: c.slug,
    type: "brand",
    title: `${c.brand} Atakum`,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    keywords: c.keywords,
    h1: c.h1,
    intro: c.intro,
    sections: [c.why, c.variants, deliverySection],
    features: c.features,
    buyLinks: c.buyLinks,
    faq: [...c.faq, ...sharedFaq],
    internalLinks: [
      { text: "Atakum Pet Shop", href: "/atakum-petshop" },
      { text: "Kedi Maması", href: "/kedi-mamasi" },
      { text: "Köpek Maması", href: "/kopek-mamasi" },
      ...crossLinks,
    ],
  };
}

export const BRAND_PAGES: SeoPageData[] = CONFIGS.map((c, i) =>
  buildBrandPage(c, [...CONFIGS.slice(i + 1), ...CONFIGS.slice(0, i)]),
);
