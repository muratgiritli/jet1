import type { SeoPageData } from "./seo-data";

// Otomatik üretilen anahtar kelime SEO sayfaları.
// Kaynak: attached_assets/PETSHOP_ANAHTAR_KELİME listesi (her terim = 1 sayfa).
// İçerik render sırasında brandify() ile domaine göre çevrilir; "JETGO" / jetgomarket.com yazılır.

const KEYWORDS: string[] = [
  "petshop yakınımda",
  "yakındaki petshop",
  "en yakın pet market",
  "pet market yakın",
  "açık pet market",
  "24 saat petshop",
  "acil petshop",
  "nöbetçi pet market",
  "petshop eve teslim",
  "petshop hızlı teslimat",
  "1 saatte petshop",
  "1 saatte mama teslimat",
  "kedi maması kapıda ödeme",
  "köpek maması kapıda ödeme",
  "kedi maması sipariş",
  "köpek maması sipariş",
  "online petshop",
  "online pet market",
  "petshop online sipariş",
  "pet market online",
  "petshop eve servis",
  "petshop kurye",
  "evcil hayvan ürünleri teslimat",
  "pet ürünleri kapıya teslim",
  "pet market kapıya teslim",
  "petshop aynı gün teslim",
  "acil mama siparişi",
  "acil kedi maması",
  "acil köpek maması",
  "kedi maması yakın",
  "köpek maması yakın",
  "yakınlarda petshop",
  "petshop telefon sipariş",
  "pet market telefon sipariş",
  "petshop express teslimat",
  "petshop hızlı kurye",
  "mama siparişi kapıda ödeme",
  "mama eve teslim",
  "kedi kumu teslimat",
  "kedi kumu kapıya teslim",
  "kedi kumu sipariş",
  "köpek ödül maması sipariş",
  "petshop kampanya",
  "uygun fiyat petshop",
  "ucuz petshop",
  "indirimli petshop",
  "samsun kedi maması",
  "samsun köpek maması",
  "samsun mama siparişi",
  "samsun eve teslim petshop",
  "samsun kapıda ödeme petshop",
  "samsun online petshop",
  "samsun pet ürünleri",
  "atakum pet market",
  "atakum mama siparişi",
  "atakum kedi maması",
  "atakum köpek maması",
  "atakum eve teslim petshop",
  "atakum kapıda ödeme petshop",
  "atakum pet ürünleri",
  "atakum pet market teslimat",
  "atakum mama kapıya teslim",
  "atakum online petshop",
  "en yakın kedi maması",
  "en yakın köpek maması",
  "en yakın mama satan yer",
  "evime yakın petshop",
  "bulunduğum yere yakın petshop",
  "yakınımdaki pet market",
  "yakınımdaki petshoplar",
  "petshop açık mı",
  "şu an açık petshop",
  "bugün açık petshop",
  "hafta sonu açık petshop",
  "pazar günü açık petshop",
  "gece açık petshop",
  "petshop whatsapp sipariş",
  "petshop telefon numarası",
  "petshop adres",
  "petshop yol tarifi",
  "petshop akvaryum",
  "akvaryum malzemeleri samsun",
  "akvaryum balığı samsun",
  "kuş yemi teslimat",
  "kedi kumu eve teslim",
  "köpek maması eve teslim",
  "royal canin samsun",
  "pro plan samsun",
  "hills mama samsun",
  "reflex mama samsun",
  "brit care samsun",
  "lavital mama samsun",
  "nd mama samsun",
  "prochoice mama samsun",
  "en yakın royal canin satan petshop",
  "en yakın pro plan satan petshop",
  "en yakın hills satan petshop",
  "en yakın kedi kumu satan yer",
  "en yakın köpek maması satan yer",
  "petshop getirsin",
  "petshop gelsin",
  "petshop kurye ile teslim",
  "pet market hızlı teslimat",
  "evcil hayvan marketi",
  "evcil hayvan mağazası",
  "pet ürünleri mağazası",
  "hayvan ürünleri mağazası",
  "petshop samsun atakum",
  "atakum en yakın petshop",
  "samsun merkez petshop",
  "samsun açık petshop",
  "samsun nöbetçi petshop",
  "samsun mama teslimat",
  "samsun kedi kumu teslimat",
  "samsun pet ürünleri teslimat",
  "samsun petshop kapında",
  "atakum petshop kapında",
  "petshop bir saatte teslim",
  "mama bir saatte teslim",
  "kedi maması bir saatte teslim",
  "köpek maması bir saatte teslim",
  "pet market bir saatte teslim",
  "evcil hayvan ürünleri bir saatte teslim",
  "petshop hemen gelsin",
  "hemen mama siparişi",
  "hemen kedi maması",
  "hemen köpek maması",
  "acil pet market",
  "yakınlarda açık petshop",
  "yakınlarda pet market",
  "yakınlarda akvaryumcu",
  "en yakın akvaryumcu",
  "en yakın pet market açık",
  "en yakın petshop açık şimdi",
  "petshop bana yakın",
  "pet market bana yakın",
  "petshop burada",
  "yakındaki pet marketler",
  "petshop konumuma yakın",
  "konumuma yakın pet market",
  "en iyi petshop samsun",
  "en büyük petshop samsun",
  "samsun petshop gross market",
  "atakum petshop gross market",
  "samsun pet market teslimat",
  "atakum pet market teslimat",
  "petshop eve gelsin",
  "petshop hızlı servis",
  "petshop express",
  "pet market express",
  "anında petshop",
  "anında mama teslimat",
  "hemen petshop",
  "hemen pet market",
  "petshop sipariş ver",
  "pet market sipariş ver",
  "online mama siparişi",
  "telefonla mama siparişi",
  "whatsapp mama siparişi",
  "evcil hayvan maması teslimat",
  "evcil hayvan marketi yakın",
  "evcil hayvan mağazası yakın",
  "pet ihtiyaçları teslimat",
  "pet ürünleri sipariş",
  "pet ürünleri eve teslim",
  "pet ürünleri kapıda ödeme",
  "kapıda ödeme kedi maması",
  "kapıda ödeme köpek maması",
  "kapıda ödeme kedi kumu",
  "kapıda ödeme pet market",
  "kapıda ödeme evcil hayvan ürünleri",
  "aynı gün kedi maması",
  "aynı gün köpek maması",
  "aynı gün kedi kumu",
  "aynı gün pet market",
  "aynı gün evcil hayvan ürünleri",
  "hızlı kedi maması teslimat",
  "hızlı köpek maması teslimat",
  "hızlı petshop teslimat",
  "hızlı pet market teslimat",
  "acil kedi kumu",
  "acil pet ürünü",
  "acil evcil hayvan maması",
  "gece petshop",
  "gece pet market",
  "24 saat pet market",
  "7/24 petshop",
  "7/24 pet market",
  "hafta sonu petshop",
  "cumartesi açık petshop",
  "pazar açık petshop",
  "resmi tatilde açık petshop",
  "yakındaki kedi maması satan yer",
  "yakındaki köpek maması satan yer",
  "yakındaki pet market",
  "yakındaki akvaryumcu",
  "yakındaki hayvan mağazası",
  "konuma göre petshop",
  "konuma göre pet market",
  "bulunduğum yerde petshop",
  "bulunduğum yerde pet market",
  "petshop telefon numarası samsun",
  "petshop adres samsun",
  "pet market samsun atakum",
  "pet market yakınlarda",
  "petshop indirim",
  "pet market kampanya",
  "ucuz kedi maması samsun",
  "ucuz köpek maması samsun",
  "en ucuz petshop samsun",
  "en uygun pet market",
  "kedi kumu siparişi",
  "kedi kumu eve gelsin",
  "kedi kumu kapıda ödeme",
  "topaklanan kedi kumu teslimat",
  "köpek ödül maması teslimat",
  "köpek kemiği teslimat",
  "kedi ödül maması teslimat",
  "kedi konservesi teslimat",
  "köpek konservesi teslimat",
  "yaş mama teslimat",
  "kuru mama teslimat",
  "yavru kedi maması teslimat",
  "yavru köpek maması teslimat",
  "yetişkin köpek maması teslimat",
  "sterilised kedi maması teslimat",
  "hassas sindirim mama teslimat",
  "veteriner mama teslimat",
  "royal canin eve teslim",
  "pro plan eve teslim",
  "hills eve teslim",
  "reflex eve teslim",
  "brit care eve teslim",
  "lavital eve teslim",
  "nd mama eve teslim",
  "prochoice eve teslim",
  "mama market samsun",
  "evcil dost market",
  "pet alışveriş teslimat",
  "petshop kurye hizmeti",
  "evcil hayvan mağazası teslimat",
  "evime mama getir",
  "kedi maması getir",
  "köpek maması getir",
  "yakınımdaki mama satan yer",
  "en yakın mama market",
  "mama market yakın",
  "evcil hayvan ürünleri yakın",
  "petshop teslimat hizmeti",
  "pet market kurye hizmeti",
  "samsun evcil hayvan mağazası",
  "atakum evcil hayvan mağazası",
  "samsun kedi kumu siparişi",
  "atakum kedi kumu siparişi",
  "samsun mama kapıya teslim",
  "evcil hayvan ihtiyaçları samsun",
  "evcil hayvan ihtiyaçları atakum",
  "petshop online alışveriş",
  "pet market online alışveriş",
  "online kedi maması siparişi",
  "online köpek maması siparişi",
  "evcil hayvan marketi samsun",
  "evcil hayvan marketi atakum",
  "petshop şimdi açık",
  "pet market şimdi açık",
  "bana en yakın mama satan yer",
  "evime en yakın petshop",
  "evime en yakın pet market",
  "petshop yakınlarda açık",
  "yakındaki açık pet market",
  "samsun petshop eve teslim",
  "atakum petshop eve teslim",
  "samsun hızlı mama teslimatı",
  "atakum hızlı mama teslimatı",
  "petshop 1 saat teslimat",
  "pet market 1 saat teslimat",
  "evcil hayvan ürünleri 1 saat teslimat",
  "mama siparişi aynı gün",
  "mama siparişi kapıya teslim",
  "hızlı mama siparişi",
  "petshop hızlı sipariş",
  "pet market hızlı sipariş",
];

function slugify(s: string): string {
  return s
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function trTitle(s: string): string {
  return s
    .split(" ")
    .map((w) => (w.length ? w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1) : w))
    .join(" ");
}

// Cümle başında büyük harf (Türkçe).
function trCap(s: string): string {
  return s.length ? s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1) : s;
}

type Category =
  | "brand" | "akvaryum" | "acil" | "acik" | "hiz" | "yakin"
  | "teslimat" | "fiyat" | "siparis" | "market" | "genel";

function classify(kw: string): Category {
  const k = kw.toLocaleLowerCase("tr-TR");
  if (/(royal canin|pro plan|hills|reflex|brit care|lavital|nd mama|prochoice)/.test(k)) return "brand";
  if (/(akvaryum)/.test(k)) return "akvaryum";
  if (/(acil|hemen|nöbetçi)/.test(k)) return "acil";
  if (/(açık|şu an|bugün|hafta sonu|pazar|gece|24 saat)/.test(k)) return "acik";
  if (/(1 saat|bir saatte|hızlı|express|aynı gün|kurye)/.test(k)) return "hiz";
  if (/(yakın|yakınımda|yakınlarda|bana yakın|konumuma|burada|evime|bulunduğum|çevre)/.test(k)) return "yakin";
  if (/(eve teslim|kapıya teslim|kapıda ödeme|getir|gelsin|teslimat|eve servis|kapında)/.test(k)) return "teslimat";
  if (/(ucuz|uygun|indirim|kampanya|gross market)/.test(k)) return "fiyat";
  if (/(telefon|whatsapp|adres|yol tarifi|online|sipariş|numara)/.test(k)) return "siparis";
  if (/(pet market|evcil hayvan|mağaza|pet ürünleri|en iyi|en büyük|merkez)/.test(k)) return "market";
  return "genel";
}

function regionLabel(kw: string): string {
  const k = kw.toLocaleLowerCase("tr-TR");
  if (k.includes("atakum")) return "Atakum";
  if (k.includes("samsun")) return "Samsun";
  return "Samsun ve Atakum";
}

const ORDER_LINE =
  "jetgomarket.com üzerinden ürünleri seçin, sepete ekleyin ve WhatsApp ile tek tıkla siparişinizi onaylayın.";
const SPEED_LINE = "Aynı gün, ortalama 1-3 saat içinde siparişiniz kapınızda olur.";
const PAY_LINE =
  "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz; nakit ödemede ekstra avantajlı fiyat ve her siparişte %5 Para Puan.";
const REGION_DELIVERY = "Atakum, İlkadım, Canik ve Tekkeköy'ün tüm mahallelerine teslimat yapıyoruz.";

const PRODUCT_LIST = [
  "Kedi maması: Royal Canin, Hill's, N&D, Pro Plan, Reflex",
  "Köpek maması: Royal Canin, Hill's, Pro Plan, Reflex, ProChoice",
  "Kedi kumu: Van Cat, Biokat's, Sanicat",
  "Kuş ve kemirgen yem, kafes ve aksesuarları",
  "Bakım ürünleri: şampuan, tarak, çiş pedi, vitamin",
];

interface Flavor {
  angle: string;
  secH2: string;
  secP: string[];
  faqQ: string;
  faqA: string;
}

function flavorFor(cat: Category, kw: string, region: string): Flavor {
  const K = trCap(kw);
  switch (cat) {
    case "brand":
      return {
        angle: `${region}'da ${kw} arayanlar için orijinal ürün ve hızlı teslimat`,
        secH2: `${K} Neden JETGO'dan Alınır?`,
        secP: [
          `${K} ihtiyacınızda JETGO orijinal ürün garantisi ile yanınızdadır. Son kullanma tarihi uzun, doğru saklanmış ürünleri kapınıza getiriyoruz.`,
          `Mama bitmeden sipariş verin, dostunuz aç kalmasın. ${SPEED_LINE}`,
        ],
        faqQ: `${K} orijinal mi?`,
        faqA: `Evet, tüm ürünlerimiz orijinal ve faturalıdır. Son kullanma tarihi uzun ürünleri kapınıza teslim ediyoruz.`,
      };
    case "akvaryum":
      return {
        angle: `${region}'da ${kw} kapıya teslim`,
        secH2: `${K} Çeşitleri`,
        secP: [
          `Akvaryum kurulumundan günlük bakıma kadar ihtiyacınız olan ürünler JETGO'da. Balık yemi, filtre, ısıtıcı, su düzenleyici ve dekor ürünleri tek adreste.`,
          `${K} için dükkan gezmenize gerek yok; online seçin, kapınızda teslim alın. ${SPEED_LINE}`,
        ],
        faqQ: `${region}'da ${kw} kapıya teslim var mı?`,
        faqA: `Evet, akvaryum ekipmanı ve balık yemi ürünlerini aynı gün kapınıza getiriyoruz.`,
      };
    case "acil":
      return {
        angle: `${region}'da ${kw} - hemen kapınızda`,
        secH2: `${K} İçin Hızlı Çözüm`,
        secP: [
          `Acil durumda zaman önemlidir. ${K} ihtiyacınızda JETGO hemen devreye girer, siparişinizi en kısa sürede kapınıza ulaştırır.`,
          `${ORDER_LINE} ${SPEED_LINE}`,
        ],
        faqQ: `${K} ne kadar sürede gelir?`,
        faqA: `Ortalama 1-3 saat içinde siparişiniz kapınızda olur. Acil ihtiyaçlarda önceliklendirme yapıyoruz.`,
      };
    case "acik":
      return {
        angle: `${region}'da ${kw} - hafta sonu dahil sipariş`,
        secH2: `Sipariş Saatleri ve ${K}`,
        secP: [
          `JETGO her gün, hafta sonu ve pazar günü dahil sipariş alır. Gündüz verdiğiniz siparişler aynı gün kapınıza ulaşır.`,
          `Gece geç saatte bıraktığınız siparişleri ertesi günün ilk teslimat rotasında getiririz. ${region}'da ${kw} arayışınızda 7 gün yanınızdayız.`,
        ],
        faqQ: `${K} mevcut mu?`,
        faqA: `JETGO her gün sipariş alır ve kapınıza teslim eder; hafta sonu ve pazar günü dahil hizmetinizdeyiz.`,
      };
    case "hiz":
      return {
        angle: `${region}'da ${kw} - aynı gün kapıda`,
        secH2: `${K} Nasıl Çalışır?`,
        secP: [
          `${K} ile ürünleriniz hızla kapınızda. Kurye ekibimiz siparişinizi apartman katınıza kadar getirir, ağır çuval taşımazsınız.`,
          `${ORDER_LINE} ${SPEED_LINE}`,
        ],
        faqQ: `${K} gerçekten aynı gün mü?`,
        faqA: `Evet, ortalama 1-3 saat içinde teslimat yapıyoruz. Sabah verilen siparişler öğleden sonra elinizde olur.`,
      };
    case "yakin":
      return {
        angle: `${region}'da ${kw} - mağazaya gitme, kapına gelsin`,
        secH2: `${K} Neden JETGO?`,
        secP: [
          `${K} ararken mesafe, açık olup olmaması ve fiyat önemlidir. JETGO kapıya teslim modeliyle nerede olursanız olun yanınıza gelir.`,
          `Haritada gezmek yerine online sipariş verin. ${SPEED_LINE} ${PAY_LINE}`,
        ],
        faqQ: `${K} hangisi?`,
        faqA: `JETGO, bulunduğunuz konuma kapıya teslim hizmeti verdiği için en pratik seçenektir. ${REGION_DELIVERY}`,
      };
    case "teslimat":
      return {
        angle: `${region}'da ${kw}`,
        secH2: `${K} Nasıl Çalışır?`,
        secP: [
          `${K} hizmeti ile ürünleriniz kurye ekibimizle kapınıza kadar gelir. Ağır mama çuvalları ve kedi kumu paketlerini taşıma derdine son.`,
          `${ORDER_LINE} ${SPEED_LINE}`,
        ],
        faqQ: `${K} kapıda ödeme kabul ediyor mu?`,
        faqA: `Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz.`,
      };
    case "fiyat":
      return {
        angle: `${region}'da ${kw} - uygun fiyat ve kampanya`,
        secH2: `${K} Fiyat Avantajları`,
        secP: [
          `${K} arayanlar için rekabetçi fiyat politikası uyguluyoruz. Nakit ödemede ekstra indirim, kampanyalı ürünler ve %5 Para Puan ile tasarruf edersiniz.`,
          `Premium markaları uygun fiyata kapınıza getiriyoruz; kaliteden ödün vermeden alışveriş yapın.`,
        ],
        faqQ: `${K} kaliteli mi?`,
        faqA: `Evet, uygun fiyatı orijinal ve kaliteli ürünlerle birlikte sunuyoruz. Nakit ödemede ekstra avantaj sağlıyoruz.`,
      };
    case "siparis":
      return {
        angle: `${region}'da ${kw} - tek tıkla kolay sipariş`,
        secH2: `${K} Nasıl Verilir?`,
        secP: [
          `${ORDER_LINE} Dilerseniz telefon üzerinden de bilgi ve destek alabilirsiniz.`,
          `JETGO kapıya teslim çalışır; mağaza adresine gitmenize gerek yok, siparişiniz bulunduğunuz adrese getirilir. ${SPEED_LINE}`,
        ],
        faqQ: `${K} nasıl yapılır?`,
        faqA: `Ürünleri sepete ekleyip WhatsApp ile onaylayın; siparişiniz aynı gün kapınıza gelir. Kapıda ödeme seçenekleri mevcuttur.`,
      };
    case "market":
      return {
        angle: `${region}'da ${kw} - 900+ ürün kapıda`,
        secH2: `${K} Ürün Yelpazesi`,
        secP: [
          `JETGO, 900'den fazla ürün çeşidiyle ${region}'ın en kapsamlı kapıya teslim pet market'idir. Kedi, köpek, kuş ve kemirgen ürünleri tek adreste.`,
          `Mağaza mağaza gezmek yerine online inceleyin, fiyatları karşılaştırın ve aynı gün kapınızda teslim alın.`,
        ],
        faqQ: `${K} hangisi?`,
        faqA: `JETGO, geniş ürün yelpazesi ve kapıya teslim modeliyle ${region}'ın en pratik pet market'lerinden biridir.`,
      };
    default:
      return {
        angle: `${region}'da ${kw} - hızlı ve güvenilir`,
        secH2: `${K} Neden JETGO?`,
        secP: [
          `${K} ihtiyacınızda JETGO geniş ürün yelpazesi, hızlı teslimat ve uygun fiyat avantajı sunar.`,
          `${ORDER_LINE} ${SPEED_LINE} ${PAY_LINE}`,
        ],
        faqQ: `${K} için JETGO nasıl yardımcı olur?`,
        faqA: `Ürünleri online seçin, kapınıza teslim alın. ${REGION_DELIVERY}`,
      };
  }
}

const LINK_POOL: { text: string; href: string }[] = [
  { text: "Samsun Pet Shop", href: "/samsun-petshop" },
  { text: "Atakum Pet Shop", href: "/atakum-petshop" },
  { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
  { text: "Kapıda Ödeme Petshop", href: "/kapida-odeme-petshop" },
  { text: "Getir Petshop", href: "/getir-petshop" },
  { text: "Kapıya Teslim Petshop", href: "/kapiya-teslim-petshop-samsun" },
  { text: "Online Petshop Samsun", href: "/online-petshop-samsun" },
  { text: "Kedi Maması", href: "/kedi-mamasi" },
  { text: "Köpek Maması", href: "/kopek-mamasi" },
  { text: "Kedi Kumu", href: "/kedi-kumu" },
];

function buildKeywordPage(kw: string, related: { text: string; href: string }[]): SeoPageData {
  const slug = slugify(kw);
  const cat = classify(kw);
  const region = regionLabel(kw);
  const K = trTitle(kw);
  const f = flavorFor(cat, kw, region);

  const metaTitle = `${K} | ${region} Kapıya Teslim Petshop - JETGO`;
  const metaDescription = `${trCap(kw)} mı arıyorsunuz? JETGO ${region}'da kedi maması, köpek maması, kedi kumu ve tüm pet ürünlerini aynı gün kapınıza getirir. Kapıda ödeme, uygun fiyat.`;

  const intro = [
    `${trCap(kw)} arıyorsanız doğru yerdesiniz. JETGO, ${f.angle}. ${REGION_DELIVERY}`,
    `${ORDER_LINE} ${SPEED_LINE}`,
    `${PAY_LINE}`,
  ];

  return {
    slug,
    type: "keyword",
    availability: "localOnly",
    title: K,
    metaTitle,
    metaDescription,
    keywords: `${kw}, ${kw} samsun, ${kw} atakum, ${kw} kapıda ödeme, ${kw} eve teslim`,
    h1: `${K}: ${region} Kapıya Teslim`,
    intro,
    sections: [
      { h2: f.secH2, paragraphs: f.secP },
      {
        h2: `${region} Pet Ürünleri ve Teslimat`,
        paragraphs: [
          `Kedi, köpek, kuş ve kemirgenler için ihtiyacınız olan tüm ürünler stoklarımızda. ${region}'ın tüm mahallelerine kurye ile teslimat yapıyoruz.`,
        ],
        list: PRODUCT_LIST,
      },
    ],
    features: [
      "900+ ürün çeşidi - kedi, köpek, kuş, kemirgen",
      "Aynı gün, ortalama 1-3 saat teslimat",
      "Kapıda nakit, POS ve QR ödeme",
      `${region} tüm mahallelere teslimat`,
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: f.faqQ, a: f.faqA },
      { q: `${K} teslimatı ne kadar sürer?`, a: "Ortalama 1-3 saat içinde siparişiniz kapınızda olur. Sabah verilen siparişler öğleden sonra elinizde." },
      { q: `${K} için kapıda ödeme var mı?`, a: "Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz. Nakit ödemede avantajlı fiyat sunuyoruz." },
    ],
    internalLinks: related,
  };
}

// ---------------------------------------------------------------------------
// CARGO model: truthful online-order + kargo + online-payment landing pages.
// Built in cargo voice by construction (no post-hoc commercify rewrite needed).
// Placeholders ("JETGO" / "jetgomarket.com") are brandified per cargo domain.
// ---------------------------------------------------------------------------

const CARGO_ORDER_LINE =
  "jetgomarket.com üzerinden ürünleri seçin, sepete ekleyin ve güvenli online ödeme ile siparişinizi tamamlayın.";
const CARGO_SPEED_LINE =
  "Siparişiniz özenle paketlenip hızla kargoya verilir; anlaşmalı kargo ile 1-3 iş günü içinde adresinize teslim edilir.";
const CARGO_PAY_LINE =
  "Ödemenizi kredi veya banka kartı ile güvenli şekilde online yaparsınız; her siparişte %5 Para Puan kazanırsınız.";
const CARGO_REGION_DELIVERY =
  "Türkiye'nin her iline anlaşmalı kargo ile gönderim yapıyoruz.";

// Cargo-native keywords (online + kargo intent). These produce cargoOnly pages
// and recover the SEO footprint lost by hiding the local-only pages.
const CARGO_KEYWORDS: string[] = [
  "online petshop",
  "online pet market",
  "online petshop kargo",
  "türkiye geneli petshop",
  "kargo ile kedi maması",
  "kargo ile köpek maması",
  "kargo ile kedi kumu",
  "online kedi maması",
  "online köpek maması",
  "online kedi kumu",
  "kapıya teslim kedi maması",
  "kapıya teslim köpek maması",
  "kapıya teslim kedi kumu",
  "online mama siparişi",
  "online kedi maması siparişi",
  "online köpek maması siparişi",
  "internetten kedi maması",
  "internetten köpek maması",
  "online evcil hayvan mağazası",
  "online pet ürünleri",
  "pet ürünleri kargo",
  "uygun fiyat online petshop",
  "ucuz kedi maması online",
  "ucuz köpek maması online",
  "indirimli online petshop",
  "güvenli online petshop",
  "hızlı kargo petshop",
  "online akvaryum malzemeleri",
  "online kuş yemi",
  "online kemirgen ürünleri",
  "royal canin online sipariş",
  "pro plan online sipariş",
  "hills mama online",
  "reflex mama online",
  "nd mama online",
  "prochoice mama online",
  "brit care online",
  "lavital mama online",
  "royal canin kargo",
  "pro plan kargo",
  "yavru kedi maması online",
  "yavru köpek maması online",
  "yetişkin köpek maması online",
  "kısırlaştırılmış kedi maması online",
  "tahılsız kedi maması online",
  "yaş mama online sipariş",
  "kuru mama online sipariş",
  "köpek ödül maması online",
  "kedi ödül maması online",
  "topaklanan kedi kumu online",
  "premium kedi maması online",
  "büyük irk köpek maması online",
  "hassas sindirim mama online",
  "veteriner maması online",
];

const CARGO_LINK_POOL: { text: string; href: string }[] = [
  { text: "Online Petshop", href: "/online-petshop" },
  { text: "Kargo ile Kedi Maması", href: "/kargo-ile-kedi-mamasi" },
  { text: "Kargo ile Köpek Maması", href: "/kargo-ile-kopek-mamasi" },
  { text: "Kapıya Teslim Kedi Kumu", href: "/kapiya-teslim-kedi-kumu" },
  { text: "Online Mama Siparişi", href: "/online-mama-siparisi" },
  { text: "Türkiye Geneli Petshop", href: "/turkiye-geneli-petshop" },
  { text: "Hızlı Kargo Petshop", href: "/hizli-kargo-petshop" },
];

function cargoFlavor(cat: Category, kw: string): Flavor {
  const K = trCap(kw);
  switch (cat) {
    case "brand":
      return {
        angle: `${kw} için orijinal ürün ve hızlı kargo`,
        secH2: `${K} Neden JETGO'dan Alınır?`,
        secP: [
          `${K} ihtiyacınızda JETGO orijinal ürün garantisi sunar. Son kullanma tarihi uzun, doğru saklanmış ürünleri özenle paketleyip kargoluyoruz.`,
          `Mama bitmeden online sipariş verin, dostunuz aç kalmasın. ${CARGO_SPEED_LINE}`,
        ],
        faqQ: `${K} orijinal mi?`,
        faqA: `Evet, tüm ürünlerimiz orijinal ve faturalıdır. Ürünleri güvenle kargoya veriyoruz.`,
      };
    case "akvaryum":
      return {
        angle: `${kw} online sipariş ve kargo`,
        secH2: `${K} Çeşitleri`,
        secP: [
          `Akvaryum kurulumundan günlük bakıma kadar ihtiyacınız olan ürünler JETGO'da. Balık yemi, filtre, ısıtıcı, su düzenleyici ve dekor ürünleri tek adreste.`,
          `${K} için online seçin, güvenle ödeyin. ${CARGO_SPEED_LINE}`,
        ],
        faqQ: `${kw} kargoyla gönderiliyor mu?`,
        faqA: `Evet, akvaryum ekipmanı ve balık yemi ürünlerini anlaşmalı kargo ile Türkiye'nin her yerine gönderiyoruz.`,
      };
    case "fiyat":
      return {
        angle: `${kw} - uygun fiyat ve güvenli online alışveriş`,
        secH2: `${K} Fiyat Avantajları`,
        secP: [
          `${K} arayanlar için rekabetçi fiyat politikası uyguluyoruz. Kampanyalı ürünler ve %5 Para Puan ile tasarruf edersiniz.`,
          `Premium markaları uygun fiyata kapınıza kargolarız; kaliteden ödün vermeden online alışveriş yapın.`,
        ],
        faqQ: `${K} kaliteli mi?`,
        faqA: `Evet, uygun fiyatı orijinal ve kaliteli ürünlerle birlikte sunuyoruz.`,
      };
    case "market":
      return {
        angle: `${kw} - 900+ ürün online`,
        secH2: `${K} Ürün Yelpazesi`,
        secP: [
          `JETGO, 900'den fazla ürün çeşidiyle kapsamlı bir online pet market'tir. Kedi, köpek, kuş ve kemirgen ürünleri tek adreste.`,
          `Mağaza gezmek yerine online inceleyin, fiyatları karşılaştırın ve hızlı kargoyla teslim alın.`,
        ],
        faqQ: `${kw} nedir?`,
        faqA: `JETGO, geniş ürün yelpazesi ve Türkiye geneli kargo modeliyle pratik bir online pet market'tir.`,
      };
    default:
      return {
        angle: `${kw} için online sipariş ve hızlı kargo`,
        secH2: `${K} Nasıl Çalışır?`,
        secP: [
          `${K} için ihtiyacınız olan ürünleri online seçin, güvenle ödeyin; gerisini biz hallederiz. Ağır mama çuvallarını taşımanıza gerek yok.`,
          `${CARGO_ORDER_LINE} ${CARGO_SPEED_LINE}`,
        ],
        faqQ: `${K} nasıl sipariş edilir?`,
        faqA: `Ürünleri sepete ekleyip güvenli online ödeme ile siparişinizi tamamlayın; ${CARGO_REGION_DELIVERY}`,
      };
  }
}

function buildCargoKeywordPage(kw: string, related: { text: string; href: string }[]): SeoPageData {
  const slug = slugify(kw);
  const cat = classify(kw);
  const K = trTitle(kw);
  const f = cargoFlavor(cat, kw);

  const metaTitle = `${K} | Online Sipariş ve Hızlı Kargo - JETGO`;
  const metaDescription = `${trCap(kw)} mı arıyorsunuz? JETGO ile kedi maması, köpek maması, kedi kumu ve tüm pet ürünleri güvenli online ödeme ve hızlı kargoyla Türkiye'nin her yerine gelsin.`;

  const intro = [
    `${trCap(kw)} arıyorsanız doğru yerdesiniz. JETGO, ${f.angle}. ${CARGO_REGION_DELIVERY}`,
    `${CARGO_ORDER_LINE} ${CARGO_SPEED_LINE}`,
    `${CARGO_PAY_LINE}`,
  ];

  return {
    slug,
    type: "keyword",
    availability: "cargoOnly",
    title: K,
    metaTitle,
    metaDescription,
    keywords: `${kw}, ${kw} online, ${kw} kargo, ${kw} online sipariş, ${kw} kapıya teslim`,
    h1: `${K}: Online Sipariş, Hızlı Kargo`,
    intro,
    sections: [
      { h2: f.secH2, paragraphs: f.secP },
      {
        h2: `Pet Ürünleri ve Kargo`,
        paragraphs: [
          `Kedi, köpek, kuş ve kemirgenler için ihtiyacınız olan tüm ürünler stoklarımızda. Siparişlerinizi anlaşmalı kargo ile Türkiye'nin her yerine gönderiyoruz.`,
        ],
        list: PRODUCT_LIST,
      },
    ],
    features: [
      "900+ ürün çeşidi - kedi, köpek, kuş, kemirgen",
      "Hızlı kargo - 1-3 iş günü içinde teslim",
      "Güvenli online kart ile ödeme",
      "Türkiye'nin her yerine gönderim",
      "Her siparişte %5 Para Puan",
    ],
    faq: [
      { q: f.faqQ, a: f.faqA },
      { q: `${K} ne kadar sürede gelir?`, a: "Siparişiniz hızla kargoya verilir ve anlaşmalı kargo ile 1-3 iş günü içinde adresinize ulaşır." },
      { q: `${K} ödeme nasıl yapılır?`, a: "Ödemenizi kredi veya banka kartı ile güvenli şekilde online yapabilirsiniz." },
    ],
    internalLinks: related,
  };
}

// A keyword is "universal" (also valid in the cargo model) when it has no
// geo / proximity / same-day-courier / door-payment / local-channel intent.
const LOCAL_INTENT_RE =
  /(samsun|atakum|i̇lkad|ilkad|canik|tekkek|yakın|yakin|konum|bulunduğum|çevre|burada|evime|kapıda ödeme|kapida odeme|kurye|getir|gelsin|eve teslim|eve servis|eve gelsin|kapında|kapinda|whatsapp|telefon|nöbetçi|nobetci|gece|24 saat|7\/24|hemen|aynı gün|ayni gun|1 saat|bir saat|express|anında|aninda|hızlı teslim|hizli teslim|açık|acik|hafta sonu|pazar|cumartesi|acil)/;

function isUniversalKeyword(kw: string, cat: Category): boolean {
  if (cat === "acil" || cat === "acik" || cat === "hiz" || cat === "yakin") return false;
  const k = kw.toLocaleLowerCase("tr-TR");
  return !LOCAL_INTENT_RE.test(k);
}

// Tüm benzersiz girişleri hesapla (slug bazında tekilleştir).
interface KwEntry { kw: string; slug: string; cat: Category; title: string; }

function buildEntries(keywords: string[]): KwEntry[] {
  const seen = new Set<string>();
  const entries: KwEntry[] = [];
  for (const kw of keywords) {
    const slug = slugify(kw);
    if (seen.has(slug)) continue;
    seen.add(slug);
    entries.push({ kw, slug, cat: classify(kw), title: trTitle(kw) });
  }
  return entries;
}

function groupByCat(entries: KwEntry[]): Map<Category, KwEntry[]> {
  const byCat = new Map<Category, KwEntry[]>();
  for (const e of entries) {
    const arr = byCat.get(e.cat) ?? [];
    arr.push(e);
    byCat.set(e.cat, arr);
  }
  return byCat;
}

// Her sayfa için iç bağlantılar ("her birine link ver"): listede bir sonraki
// sayfa (hiçbir sayfa öksüz kalmasın diye her sayfa en az bir yerden linklenir),
// aynı kategoriden kardeş sayfalar ve hub sayfaları. Bağlantı havuzu modele
// özgüdür; kargo sayfaları yalnızca kargo/all hub'larına bağlanır.
function makeRelatedFor(
  entries: KwEntry[],
  byCat: Map<Category, KwEntry[]>,
  linkPool: { text: string; href: string }[],
) {
  return (globalIdx: number): { text: string; href: string }[] => {
    const e = entries[globalIdx];
    const out: { text: string; href: string }[] = [];
    const push = (l: { text: string; href: string }) => {
      if (l.href === `/${e.slug}`) return;
      if (out.some((o) => o.href === l.href)) return;
      out.push(l);
    };
    if (entries.length > 1) {
      const next = entries[(globalIdx + 1) % entries.length];
      push({ text: next.title, href: `/${next.slug}` });
    }
    const sibs = byCat.get(e.cat) ?? [];
    if (sibs.length > 1) {
      const sIdx = sibs.findIndex((s) => s.slug === e.slug);
      for (let i = 1; i <= 4 && out.length < 5; i++) {
        const s = sibs[(sIdx + i) % sibs.length];
        push({ text: s.title, href: `/${s.slug}` });
      }
    }
    for (const h of linkPool) {
      if (out.length >= 7) break;
      push(h);
    }
    return out;
  };
}

// LOCAL model: every keyword -> localOnly page (current same-day behaviour).
const _localEntries = buildEntries(KEYWORDS);
const _localByCat = groupByCat(_localEntries);
const _localRelated = makeRelatedFor(_localEntries, _localByCat, LINK_POOL);
export const LOCAL_KEYWORD_PAGES: SeoPageData[] = _localEntries.map((e, i) =>
  buildKeywordPage(e.kw, _localRelated(i)),
);

// CARGO model: universal local keywords (same slug, cargo voice) + cargo-native
// keywords -> cargoOnly pages. Purely-local keywords get no cargo variant.
const _cargoEntries = buildEntries([
  ...KEYWORDS.filter((kw) => isUniversalKeyword(kw, classify(kw))),
  ...CARGO_KEYWORDS,
]);
const _cargoByCat = groupByCat(_cargoEntries);
const _cargoRelated = makeRelatedFor(_cargoEntries, _cargoByCat, CARGO_LINK_POOL);
export const CARGO_KEYWORD_PAGES: SeoPageData[] = _cargoEntries.map((e, i) =>
  buildCargoKeywordPage(e.kw, _cargoRelated(i)),
);

// Combined set consumed by seo-data assembly. localOnly + cargoOnly entries may
// share a slug; per-store resolution leaves exactly one per model.
export const KEYWORD_AUTO_PAGES: SeoPageData[] = [
  ...LOCAL_KEYWORD_PAGES,
  ...CARGO_KEYWORD_PAGES,
];
