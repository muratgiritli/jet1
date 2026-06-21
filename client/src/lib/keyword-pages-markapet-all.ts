// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for MARKA.PET
// (marka.pet, store id "markapet") — the 8th corpus in the family and the FIRST
// built for a CARGO store.
//
// marka.pet is a Türkiye-geneli (national) online pet shop that ships from a
// Samsun-based warehouse via contracted cargo, with ONLINE-ONLY card payment.
// It must read UNIQUE-by-CONTENT versus:
//   • the SHARED jetgomarket.com keyword pages,
//   • the atakum-all corpus (atakumpetshop.com),
//   • the atakumbiz-all corpus (atakum.biz), AND
//   • the jetgoshop-all corpus (jetgo.shop).
//
// CARGO TRUTHFULNESS is the load-bearing invariant. A cargo store CANNOT
// truthfully claim any LOCAL trait, so this generator NEVER affirms:
//   • aynı gün / 1 saat / acil / hemen teslimat
//   • kapıda ödeme / kapıda nakit
//   • kurye / mahalleye teslimat
//   • "en yakın mağaza" / nöbetçi / gece açık / fiziksel mağaza ziyareti
// Local-intent search terms ARE targeted for SEO, but ONLY the URL slug keeps the
// raw keyword. Every served surface — title, metaTitle, keywords meta, AND every
// line of RENDERED BODY COPY (h1, intro, sections, FAQ answers, description) —
// uses a local-intent-STRIPPED label so the
// page describes only what marka.pet actually offers: online order + güvenli
// kart ödemesi + Türkiye geneli anlaşmalı kargo. Pages carrying a 24h/gece cue
// get a truthful "online sipariş 7/24, fiziksel mağaza yok" disclaimer.
//
// Classification + truthfulness reuse the shared keyword-truthfulness engine, so
// live-animal / service / retailer / price intents are framed safely:
//   live    → "canlı hayvan satışı yapmaz" + responsible-adoption guidance
//   service → "... hizmeti vermiyoruz" (a shop, not a service provider)
//   retailer→ "bağımsız bir işletmeyiz; resmi bir bağlantımız yok"
//   price   → never a fabricated number next to ₺/TL/lira.
//
// Consumed by seo-data.ts as a SEPARATE integration loop. Every page is tagged
// availability "cargoOnly" EXPLICITLY (the auto-classifier would otherwise mark
// the local-intent slugs localOnly and drop them from the cargo store). Do not
// hand-edit.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { MARKAPET_ALL_KEYWORDS } from "./markapet-all-keywords";
import { slugify, trTitle, trCap } from "./keyword-pages";
import {
  type Attr,
  analyze,
  animalWord,
  categoryNoun,
  detectFoodBrand,
  NOISE_RE,
  RESERVED_SLUGS,
} from "./keyword-truthfulness";

const STORE_ID = "markapet";
const BRAND = "marka.pet";
const PHONE = "0850 840 39 59";
const ORIGIN = "Samsun";
const SUPPORT_HOURS = "09:00–18:00";

// Türkiye-geneli coverage footprint. A DELIBERATELY cargo-flavoured list of
// provinces (not Atakum neighbourhoods) so it never lines up with any local
// sibling corpus.
const REGIONS = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya",
  "Gaziantep", "Kayseri", "Trabzon", "Samsun", "Eskişehir", "Diyarbakır",
  "Mersin", "Denizli", "Şanlıurfa", "Malatya", "Erzurum", "Van", "Sivas",
];

const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;

// Local-intent search cues. A keyword matching this is STILL targeted for SEO,
// but its rendered body copy must be reframed truthfully (cargo only).
const LOCAL_INTENT_RE =
  /aynı gün|ayni gun|1 saat|bir saat|2 saat|\bacil\b|hemen|anında|aninda|kurye|kapıda|kapida|mahalle|en yakın|en yakin|nöbet|nobet|gece|7\s*\/?\s*24|24 saat|eve teslim|eve servis|getir|gelsin|hafta sonu/i;

// Tokens stripped from the rendered label so NO served surface affirms a local
// trait. The stripped label feeds title, metaTitle, keywords meta, body and
// internal-link text alike; only the URL slug retains the raw keyword.
const STRIP_RE =
  /(aynı gün(?:ü|lük)?|ayni gun|1 saat(?:te|lik)?|bir saat(?:te|lik)?|2 saat(?:te)?|acil|hemen|anında|aninda|kurye ?(?:ile|li)?|kapıda ödeme|kapida odeme|kapıda nakit|kapida nakit|kapıda|kapida|mahalleye|mahalle|en yakın|en yakin|nöbetçi|nobetci|gece|geç saat|7\s*\/?\s*24|24 saat|eve teslimat|eve teslim|eve servis|hızlı teslimat|hizli teslimat|getir|gelsin|hafta sonu)/gi;

function stripLocalIntent(kw: string): string {
  return kw.replace(STRIP_RE, " ").replace(/\s{2,}/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Stable-hash variation helpers — deterministic per slug, but neighbouring slugs
// land on different phrasings and section orders. The mixing constants and salt
// range (4xx) are distinct from ALL sibling corpora (atakum djb2 / jetgoshop
// xor-FNV / atakumbiz FNV+0x2c1b3c6d), so even a coincidental shared bank string
// would still rotate apart.
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // Avalanche with constants distinct from the atakumbiz sibling.
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995) >>> 0;
  h ^= h >>> 15;
  return h >>> 0;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[((h + Math.imul(salt, 0x9e3779b1)) >>> 0) % arr.length];
}
function rotate<T>(arr: T[], h: number, salt: number): T[] {
  const n = arr.length;
  const start = ((h + Math.imul(salt, 0x85ebca6b)) >>> 0) % n;
  return arr.map((_, i) => arr[(start + i) % n]);
}
function regionsFor(h: number): string[] {
  const start = h % REGIONS.length;
  const out: string[] = [];
  for (let i = 0; i < 6; i++) out.push(REGIONS[(start + i * 5) % REGIONS.length]);
  return Array.from(new Set(out));
}

// ---------------------------------------------------------------------------
// Attribute → natural Turkish fragments.
// ---------------------------------------------------------------------------

function stagePhrase(stage: string): string {
  switch (stage) {
    case "yavru": return "yavru";
    case "yetişkin": return "yetişkin";
    case "yaşlı": return "yaşlı (senior)";
    case "anne": return "gebe ya da emziren anne";
    default: return "";
  }
}
function joinNice(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return items.slice(0, -1).join(", ") + " ve " + items[items.length - 1];
}

// ---------------------------------------------------------------------------
// Phrase banks — fresh cargo "marka.pet" voice: Türkiye geneli kargo, güvenli
// online ödeme. No line is shared with any sibling bank, and NONE affirms a
// local trait (same-day / door-payment / courier / local presence).
// ---------------------------------------------------------------------------

const SHIP_LINES = [
  `marka.pet siparişlerini Türkiye'nin her yerine anlaşmalı kargoyla ulaştırır; sipariş hazırlanıp kargoya verildikten sonra çoğu il 1–3 iş gününde teslim alır.`,
  `Siparişiniz titizlikle paketlenip anlaşmalı kargoya teslim edilir; Türkiye geneli teslimat süresi genellikle 1–3 iş günüdür.`,
  `Kargo bizden, takip sizden: siparişiniz yola çıktığında kargo takip numaranızı paylaşır, Türkiye'nin her yerine güvenle göndeririz.`,
  `Stoktaki ürünler en geç ertesi iş günü kargoya verilir; Türkiye'nin tüm illerine anlaşmalı kargoyla gönderim yapıyoruz.`,
];
const ORDER_LINES = [
  `Sipariş vermek çok kolay: ürünü web sitemizde sepete ekleyin ve güvenli online ödemeyle siparişinizi tamamlayın.`,
  `Dilerseniz online mağazamızdan sepetinizi hazırlayın, dilerseniz ${PHONE} sipariş hattımızı arayın; size hangisi kolaysa.`,
  `${PHONE} numaralı sipariş hattımızı arayın ya da online mağazamızdan sepete ekleyin; siparişiniz hemen hazırlanmaya başlar.`,
  `Aradığınız ürünü bize iletmeniz yeterli; online mağazamız ve ${PHONE} hattımız siparişinizi anında açar.`,
];
const PAY_LINES = [
  "Ödeme tamamen online ve güvenli: kredi ya da banka kartınızla 3D Secure altyapısı üzerinden ödersiniz.",
  "Güvenli online ödeme altyapımızla kartınızdan kolayca ödersiniz; her siparişte harcamanızın %5'i Para Puan olarak birikir.",
  "Kartla güvenli online ödeme yapar, biriken %5 Para Puan'ı bir sonraki siparişinizde indirim olarak kullanırsınız.",
  "Siparişinizi güvenli online ödeme ile tamamlarsınız; belirli tutar üzeri siparişlerde kargo ücretsizdir.",
];
const TRUST_LINES = [
  "Gönderdiğimiz her ürün orijinal ve faturalıdır; özellikle mamalarda son kullanma tarihini kargoya vermeden önce tek tek kontrol ederiz.",
  "Yalnızca güvendiğimiz tedarikçilerle çalışırız; kırılabilir ürünleri darbeye karşı özenle paketler, içiniz rahat şekilde göndeririz.",
  "Tarihi yaklaşmış ya da ambalajı bozuk ürünü asla kargoya vermeyiz; ne aldığınızı bilerek güvenle alışveriş yaparsınız.",
];
const STOCK_LINES = [
  `Stok gün içinde hızla değişir; aradığınız ürünü ayırtmak için ${PHONE} numaralı hattımızdan kısa bir teyit almanızı öneririz.`,
  `Bir ürün tükendiyse benzer içerikte ve bütçede bir muadil öneririz; güncel durumu ${PHONE} üzerinden öğrenebilirsiniz.`,
  `Ürünün stokta olup olmadığını en hızlı ${PHONE} numarasından öğrenir, yoksa en uygun alternatifini birlikte buluruz.`,
];
const REGION_LINES = [
  "Türkiye'nin dört bir yanına — İstanbul, Ankara, İzmir, Bursa, Antalya ve tüm illere — anlaşmalı kargoyla gönderim yapıyoruz.",
  "Hangi ilde olursanız olun siparişiniz kapınıza kadar gelir; Türkiye geneli kargo ağımız 81 ili kapsar.",
  "Büyük şehirlerden en uzak ilçelere kadar Türkiye'nin her noktasına güvenli kargoyla ulaşıyoruz.",
];
const STORY_LINES = [
  `marka.pet, ${ORIGIN} merkezli ama Türkiye'nin tamamına hizmet veren bir online pet shoptur; doğru ürünü dürüstçe öneririz.`,
  "Hedefimiz hızlı, güvenilir ve şeffaf bir online pet shop olmak: kaliteli ürün, güvenli ödeme ve Türkiye geneli kargo.",
  "Büyük mağaza çeşitliliğini online alışverişin rahatlığıyla buluşturuyoruz; sormaktan çekinmeyin, bildiğimizi paylaşırız.",
];

const WHY_POINTS = [
  "Türkiye'nin her yerine anlaşmalı kargoyla teslimat",
  "Güvenli online ödeme (3D Secure kredi/banka kartı)",
  "Kedi, köpek, kuş, kemirgen ve akvaryum için geniş ürün yelpazesi",
  "Premium ve ekonomik markalar bir arada",
  "Orijinal ve faturalı ürün güvencesi",
  "Her alışverişte %5 Para Puan",
  "Kargo takip numarasıyla siparişinizi adım adım izleme",
  "Belirli tutar üzeri ücretsiz kargo",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function shipSection(Kp: string, regions: string[], h: number): Section {
  return {
    h2: pick(
      [
        `${Kp} Kaç Günde Kargoda?`,
        `${Kp} Siparişiniz Ne Zaman Elinizde?`,
        `${Kp} İçin Türkiye Geneli Kargo`,
      ],
      h,
      401,
    ),
    paragraphs: [
      pick(SHIP_LINES, h, 402),
      `${Kp} siparişiniz onaylandıktan sonra titizlikle paketlenir ve anlaşmalı kargoya teslim edilir; ${joinNice(regions)} başta olmak üzere Türkiye'nin tüm illerine gönderim yapıyoruz.`,
    ],
    list: regions.map((r) => `${r}: anlaşmalı kargoyla 1–3 iş günü`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Online Sipariş Nasıl Verilir?", "Dakikalar İçinde Online Sipariş", "Sipariş ve Güvenli Ödeme"],
      h,
      411,
    ),
    paragraphs: [
      pick(ORDER_LINES, h, 412),
      `${pick(PAY_LINES, h, 413)} ${pick(STOCK_LINES, h, 414)}`,
    ],
  };
}

function bolgeSection(regions: string[], h: number): Section {
  const a = regions[0] ?? "İstanbul";
  const b = regions[1] ?? "Ankara";
  return {
    h2: pick(
      ["Türkiye'nin Her Yerine Kargo", "Hangi İllere Gönderim Yapıyoruz?", "Türkiye Geneli Teslimat Ağımız"],
      h,
      421,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere Türkiye'nin 81 iline anlaşmalı kargoyla düzenli gönderim yapıyoruz.`,
          `${a} ile ${b} dahil tüm illere kargo gönderdiğimiz için teslimat süremiz hem öngörülebilir hem güvenlidir.`,
          `${a}, ${b} ve çevresi dahil Türkiye'nin her noktasına ulaşıyoruz; nerede olursanız olun siparişiniz kapınıza gelir.`,
        ],
        h,
        422,
      ),
      pick(REGION_LINES, h, 423),
      pick(TRUST_LINES, h, 424),
    ],
  };
}

function nedenSection(h: number): Section {
  return {
    h2: pick(
      ["Neden marka.pet?", "marka.pet'i Tercih Sebepleri", "Neden Bizden Sipariş Vermelisiniz?"],
      h,
      431,
    ),
    paragraphs: [pick(STORY_LINES, h, 432)],
    list: rotate(WHY_POINTS, h, 433).slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// Category-specific MAIN section (the substantive answer to the keyword).
// ---------------------------------------------------------------------------

function mainSection(a: Attr, kwP: string, Kp: string, h: number, isLocal: boolean): Section {
  const noun = categoryNoun(a);
  const animalW = animalWord(a.animal);
  const lc = trCap(kwP);

  // --- Truthfulness-sensitive buckets (always lead with the disclaimer). -----
  if (a.cat === "live") {
    return {
      h2: pick(
        [`${Kp}: Önce Şu Notu Okuyun`, `${Kp} ve Sahiplenme Önerisi`, `${Kp} Hakkında Açık Konuşalım`],
        h,
        441,
      ),
      paragraphs: [
        "marka.pet canlı hayvan satışı yapmaz; mağazamızda yalnızca mama, bakım ürünü ve aksesuar bulunur.",
        pick(
          [
            "Hayatınıza bir dost katacaksanız önce barınakları ve güvenilir sahiplendirme gönüllülerini düşünün; sahiplenmek, satın almaktan çok daha doğru bir yoldur.",
            "Yeni bir dostun en doğru adresi barınaklar ve sorumlu sahiplendirme ağlarıdır; siz sahiplendikten sonra mama ve bakım tarafında biz yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplenmeyi destekliyoruz; eve gelen dostunuzun beslenme ve bakım ihtiyacını Türkiye'nin her yerine kargoyla karşılarız.",
          ],
          h,
          442,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve bakım ürünlerinin tamamını marka.pet'ten Türkiye geneli kargoyla sipariş edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${Kp} İçin Yönlendirme`, `${Kp} Hakkında Bilgi Notu`, `${Kp}: Kısa Bir Açıklama`], h, 441),
      paragraphs: [
        `marka.pet bir online evcil hayvan ürünleri mağazasıdır; ${kwP} hizmeti vermiyoruz. Bu, bizim sunduğumuz bir mağaza hizmeti değildir.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman kişi veya kuruluşlara başvurmanız en doğrusu olur; biz yalnızca süreçte ihtiyacınız olan ürünleri sağlarız.",
            "İşin kendisi için alanında yetkin bir adrese yönelmenizi öneririz; mama, bakım ve aksesuar tarafındaki her şeyde ise yanınızdayız.",
            "İlgili işi profesyonel birinden almanız gerekir; gereken ürünleri Türkiye'nin her yerine kargoyla göndermek bizim işimizdir.",
          ],
          h,
          442,
        ),
        `İhtiyaç duyacağınız ürünleri (mama, bakım malzemesi, aksesuar) marka.pet'ten güvenli online ödeme ve Türkiye geneli kargoyla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${Kp} Yerine marka.pet`, `${Kp}: Kargolu Alternatif`, `${Kp} mi, marka.pet mi?`], h, 441),
      paragraphs: [
        `marka.pet bağımsız bir işletmeyiz; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Türkiye geneli kargo ve güvenli online ödemeyle bağımsız bir alternatif olarak sunuyoruz.`,
        pick(
          [
            "Bizden sipariş verince ürün orijinal ve faturalı gelir; bir aksilikte muhatap bulamamak yerine doğrudan bize ulaşırsınız.",
            "Fiyatı araştırırken şunu unutmayın: bizden alınca ürün güvenli paketlenir, kargo takibi paylaşılır ve destek için gerçek bir ekip karşınızda olur.",
            "Bağımsız bir online pet shop olarak; orijinal ürün, güvenli ödeme ve Türkiye geneli kargo sözümüzün arkasında dururuz.",
          ],
          h,
          442,
        ),
        pick(STOCK_LINES, h, 443),
      ],
    };
  }

  // --- Local-intent reframe: never affirm same-day/door-payment/local pickup. -
  if (isLocal) {
    return {
      h2: pick(
        [`${Kp}: Türkiye Geneli Kargo`, `${Kp} Nasıl Gönderiliyor?`, `${Kp} İçin Online Sipariş ve Kargo`],
        h,
        441,
      ),
      paragraphs: [
        "marka.pet, Türkiye'nin her yerine anlaşmalı kargoyla gönderim yapan online bir pet shoptur. Siparişiniz onaylandıktan sonra hızlıca hazırlanır ve kargoya verilir; çoğu adrese 1–3 iş günü içinde ulaşır.",
        "Ödemeyi güvenli online altyapımızdan kredi veya banka kartıyla yaparsınız; her siparişte harcamanızın %5'i Para Puan olarak birikir.",
        pick(STOCK_LINES, h, 442),
      ],
    };
  }

  // --- Product / info buckets. ----------------------------------------------
  const intro = pick(
    [
      `${noun} seçerken ${animalW}'ınızın yaşını, kilosunu ve alışkanlıklarını gözetmek uzun vadede en sağlıklısıdır; aceleyle verilen karar çoğu zaman geri döner.`,
      `Doğru ${noun}, ${animalW}'ınızın gündelik konforunu doğrudan belirler; bu yüzden moda olana değil, gerçek ihtiyaca göre seçmek gerekir.`,
      `${lc} ararken seçenek bolluğunda kaybolmak kolaydır; birkaç net kritere bakınca ${animalW}'ınıza en uygun ${noun} kendiliğinden öne çıkar.`,
    ],
    h,
    441,
  );

  switch (a.cat) {
    case "food": {
      const bits: string[] = [];
      const sp = stagePhrase(a.stage);
      if (sp) bits.push(`paketin ${sp} dönem için uygun olduğunu doğrulayın`);
      if (a.flavor) bits.push(`${a.flavor} gibi sevdiği bir tadı seçmek geçişi kolaylaştırır`);
      if (a.size) bits.push(`${a.size} gibi paketler düzenli tüketimde daha hesaplı kalır`);
      const crit = bits.length
        ? `${trCap(joinNice(bits))}.`
        : "İçerik listesinin en başında net tanımlı bir et/protein kaynağı görmek genelde iyi bir işarettir.";
      return {
        h2: pick([`${Kp} Nasıl Seçilir?`, `Doğru ${Kp} İçin Pratik Kriterler`, `${Kp} Seçim Rehberi`], h, 443),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dahil ` : ""}premium ve ekonomik birçok markayı bir arada tuttuğumuz için, kararsızsanız küçük paketle deneyip beğendiğinizde büyüğüne geçebilirsiniz; tümünü Türkiye geneli kargoyla göndeririz.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayın, eskisiyle kademeli karıştırın",
          "Suyunu her gün tazeleyin, mama kabını sık yıkayın",
          "Açtığınız paketi serin, kuru ve ağzı kapalı saklayın",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${Kp} Seçimi ve Kullanımı`, `${Kp} Hakkında Bilmeniz Gerekenler`, `${Kp} Nasıl Kullanılır?`], h, 443),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}belirleyici üç başlık topaklaşma gücü, toz oranı ve koku kontrolüdür. marka.pet'te topaklaşan (bentonit), kristal (silika) ve doğal kum çeşitlerini bir arada bulur, Türkiye'nin her yerine kargoyla sipariş edersiniz.`,
        ],
        list: [
          "Kabın derinliğini 5–7 cm tutun, topakları her gün toplayın",
          "Haftada bir kabı tamamen boşaltıp yıkayın",
          "Kediniz kumu sevmezse yeni türe kademeli geçin",
        ],
      };
    }
    case "bird":
      return {
        h2: pick([`${Kp} İçin Öneriler`, `${Kp} Nasıl Seçilir?`, `${Kp} Üzerine Notlar`], h, 443),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formda kalmasında belirleyicidir. Yem, kafes ve aksesuarları bir arada sunar, Türkiye geneli kargoyla göndeririz.",
        ],
        list: [
          "Yemliği düzenli temizleyin, küflenmeye fırsat vermeyin",
          "Suyu her gün değiştirin, suluğu durulayın",
          "Mineral blok ve gaga taşını eksik etmeyin",
        ],
      };
    case "collar":
      return {
        h2: pick([`${Kp} Seçerken Nelere Bakmalı?`, `Doğru ${Kp} Nasıl Olmalı?`, `${Kp} Rehberi`], h, 443),
        paragraphs: [
          intro,
          "Tasma ve koşumda en kritik konu doğru bedendir: boyun ya da göğüs çevresini ölçün, altından iki parmak rahat geçmeli. Farklı beden, malzeme ve kilit tipinde modelleri bulundururuz.",
        ],
        list: [
          "Boyun/göğüs çevresini mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) tasmayı seçin",
          "Dikişlerin ve klipsin sağlamlığını kontrol edin",
        ],
      };
    case "bed":
      return {
        h2: pick([`${Kp} Nasıl Seçilir?`, `Rahat Bir ${Kp} İçin İpuçları`, `${Kp} Seçim Notları`], h, 443),
        paragraphs: [
          intro,
          "Yatak seçerken dostunuzun uzanmış boyu, uyku pozisyonu ve yıkanabilirlik öne çıkar. Farklı boy ve dolguda, kılıfı çıkıp makinede yıkanabilen modeller mevcuttur.",
        ],
        list: [
          "Uzandığında rahatça sığacağı boyu seçin",
          "Kılıfı çıkıp yıkanabilen modelleri tercih edin",
          "Sakin, köşe bir noktaya yerleştirin",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${Kp} Seçimi`, `${Kp} Nasıl Olmalı?`, `${Kp} İçin Öneriler`], h, 443),
        paragraphs: [
          intro,
          "Taşıma çantası ve kafeslerinde havalandırma, sağlam kapak kilidi ve uygun boy önemlidir. Veteriner ziyareti ve seyahat için farklı boy ve tiplerde seçenekler sunuyoruz.",
        ],
        list: [
          "Ayakta dönebileceği boyu seçin",
          "Kapak kilidinin güvenli kapandığından emin olun",
          "İlk yolculuktan önce çantaya alışmasını sağlayın",
        ],
      };
    case "bowl":
      return {
        h2: pick([`${Kp} Seçerken`, `${Kp} Hakkında`, `Doğru ${Kp} Nasıl Olur?`], h, 443),
        paragraphs: [
          intro,
          "Mama ve su kaplarında malzeme (paslanmaz çelik / seramik) ve kolay temizlik belirleyicidir. Devrilmeyen tabanlı çelik ve seramik modelleri bir arada bulursunuz.",
        ],
        list: [
          "Paslanmaz çelik ya da seramik daha hijyeniktir",
          "Kabı her gün yıkayıp biyofilmi önleyin",
          "Devrilmeyen tabanlı modelleri seçin",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${Kp} Kullanımı`, `${Kp} İçin İpuçları`, `${Kp} Üzerine`], h, 443),
        paragraphs: [
          intro,
          "Bakımda tüy yapısına uygun şampuan ve doğru tarak/fırça seçimi tüy sağlığını korur. Düzenli tarama hem yumaklaşmayı hem dökülmeyi azaltır.",
        ],
        list: [
          "Tüy tipine uygun şampuan ve fırça seçin",
          "Banyo sonrası iyice durulayıp kurulayın",
          "Düzenli tarama dökülmeyi gözle görülür azaltır",
        ],
      };
    case "toy":
      return {
        h2: pick([`${Kp} Neden Önemli?`, `${Kp} Seçimi`, `${Kp} ile Daha Mutlu Bir Dost`], h, 443),
        paragraphs: [
          intro,
          "Oyuncaklar enerji atmak ve zihinsel uyarım için şarttır. Boyuna uygun, kolay parçalanmayan ve güvenli malzemeden ürünleri tercih edin.",
        ],
        list: [
          "Boyuna uygun, yutulmayacak oyuncak seçin",
          "Oyuncakları ara ara değiştirin, ilgisi sürsün",
          "Yıpranan oyuncağı zamanında yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${Kp} Seçerken Beden`, `${Kp} Nasıl Seçilir?`, `${Kp} Rehberi`], h, 443),
        paragraphs: [
          intro,
          "Kıyafette doğru beden ve hareket serbestliği esastır; sırt uzunluğu ile göğüs çevresini ölçün. Soğuk havalar için su geçirmez ve içi astarlı modeller işinizi görür.",
        ],
        list: [
          "Sırt uzunluğu ve göğüs çevresini ölçüp bedene karar verin",
          "Hareketini ve tuvaletini engellemeyen modeli seçin",
          "Soğukta su geçirmez/astarlı modelleri tercih edin",
        ],
      };
    case "health":
      return {
        h2: pick([`${Kp} Hakkında`, `${Kp} Kullanımı`, `${Kp} İçin Notlar`], h, 443),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri düzenli bakımın bir parçasıdır; ancak hiçbiri veteriner muayenesinin veya tedavisinin yerini tutmaz. Şüphedeyseniz önce veterinerinize danışın.",
        ],
        list: [
          "Ürünü etiketindeki talimata göre uygulayın",
          "Bir sağlık şüphesinde önce veterinere danışın",
          "Takviyeyi dengeli beslenmenin tamamlayıcısı görün",
        ],
      };
    case "guide":
      return {
        h2: pick([`${Kp}: Kısa Bir Bakış`, `${Kp} Üzerine Notlar`, `${Kp} Hakkında`], h, 443),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok merak edilenleri marka.pet olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun gününü kolaylaştırmak istiyoruz.`,
              `${lc} ile ilgili işe yarayan bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Türkiye'nin her yerine kargoyla gönderiyoruz.`,
            ],
            h,
            443,
          ),
          "Takıldığınız bir nokta olursa ürün seçiminde de bize danışın; deneyimimizi seve seve paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`${Kp} İçin Online Adres`, `${Kp} mı Arıyorsunuz?`, `${Kp}: Türkiye Geneli Online Pet Shop`], h, 443),
        paragraphs: [
          pick(
            [
              `${lc} için marka.pet online mağazasından sipariş verin; ürünlerinizi Türkiye'nin her yerine anlaşmalı kargoyla gönderiyoruz.`,
              `${lc} deyince marka.pet: geniş ürün yelpazesi, güvenli online ödeme ve Türkiye geneli hızlı kargo bir arada.`,
            ],
            h,
            443,
          ),
          `İster web sitemizden sepetinizi hazırlayın, ister ${PHONE} sipariş hattımızı arayın; gerisini biz hallederiz.`,
        ],
      };
    default:
      return {
        h2: `${Kp} Hakkında`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için marka.pet'teki seçenekleri değerlendirebilir, emin olamadığınızda bize danışabilirsiniz; tüm siparişleri Türkiye geneli kargoyla göndeririz.`,
        ],
      };
  }
}

// ---------------------------------------------------------------------------
// FAQ.
// ---------------------------------------------------------------------------

function faqFor(
  a: Attr,
  kwP: string,
  Kp: string,
  h: number,
  flags: { isAlwaysOpen: boolean },
): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];

  if (flags.isAlwaysOpen) {
    out.push({
      q: `marka.pet üzerinden her saat sipariş verebilir miyim?`,
      a: `Online mağazamızdan günün her saati sipariş oluşturabilirsiniz. Siparişler iş günlerinde hazırlanıp anlaşmalı kargoya teslim edilir; fiziksel bir mağaza işletmiyoruz.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `marka.pet ${kwP} kapsamında canlı hayvan satıyor mu?`,
      a: "Hayır. marka.pet canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunarız. Bir dost için yerel barınakları ve sahiplenmeyi öneririz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `marka.pet ${kwP} hizmeti veriyor mu?`,
      a: `Hayır, ${kwP} bizim sunduğumuz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri Türkiye geneli kargoyla göndeririz.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `marka.pet ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: "Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız yok. Aynı ürünleri Türkiye geneli kargo ve güvenli online ödemeyle sunuyoruz.",
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${Kp} siparişi kaç günde teslim edilir?`,
      a: `Siparişiniz onaylandıktan sonra hızlıca hazırlanıp anlaşmalı kargoya verilir; Türkiye genelinde çoğu adrese 1–3 iş günü içinde ulaşır.`,
    },
    {
      q: `${Kp} için nasıl ödeme yapabilirim?`,
      a: `Ödemeyi güvenli online altyapımız üzerinden kredi veya banka kartıyla yaparsınız; her siparişte harcamanızın %5'i Para Puan olarak hesabınıza eklenir. ${PHONE}.`,
    },
    {
      q: `${Kp} fiyatını nasıl öğrenebilirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyin ya da ${PHONE} numaralı sipariş hattımızdan teyit alın; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `marka.pet Türkiye'nin her yerine kargo gönderiyor mu?`,
      a: `Evet. marka.pet, ${ORIGIN} merkezli deposundan Türkiye'nin her iline anlaşmalı kargoyla gönderim yapar. ${PHONE}.`,
    },
  ];

  const rotated = rotate(generic, h, 451);
  for (const f of rotated) {
    if (out.length >= 3) break;
    out.push(f);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Entry collection + de-dup.
// ---------------------------------------------------------------------------

interface Ent { kw: string; slug: string; a: Attr }

// A breed-named FOOD SKU ("royal canin british shorthair 10 kg en ucuz") carries
// a breed head-confirm token, so the shared classifier's breed-only fallback tags
// it live ("cins") and would put a no-sale disclaimer on what is really a bag of
// food. We do NOT touch the shared engine; instead we re-tag it as food here when
// a tight food signal — a weight unit or an explicit food brand/noun — is present.
// (Mirror of the atakum-all / atakumbiz-all local re-tag.)
const MARKAPET_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeMarkapet(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (MARKAPET_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Local noise the shared engine intentionally leaves in: the source still carries
// Spanish-search autocomplete ("buscar spectrum" = "search spectrum") that would
// otherwise mint a nonsensical pet-shop page. Drop just the Spanish "buscar" cue;
// bare "spectrum" stays as a legit food-brand page.
const MARKAPET_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of MARKAPET_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || MARKAPET_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeMarkapet(kw) });
}

export const MARKAPET_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

// Cargo-safe core links: every href is a SHARED cargoOnly slug already served on
// marka.pet (verified present in the cargo corpus), so none ever dangles. The
// seo-data integration additionally filters any link that does not resolve in the
// markapet slug space, so generic localOnly slugs can never leak in.
const CORE_LINKS: { text: string; href: string }[] = [
  { text: "Kedi Maması Siparişi", href: "/kedi-mamasi-siparis" },
  { text: "Köpek Maması Siparişi", href: "/kopek-mamasi-siparis" },
  { text: "Online Pet Shop", href: "/online-petshop" },
  { text: "Kedi Kumu Siparişi", href: "/kedi-kumu-siparis" },
  { text: "Uygun Fiyat Pet Shop", href: "/uygun-fiyat-petshop" },
  { text: "Türkiye Geneli Kedi Maması", href: "/turkiye-geneli-kedi-mamasi" },
  { text: "Kargo ile Mama", href: "/kargo-ile-mama" },
];

function relatedFor(e: Ent, idx: number): { text: string; href: string }[] {
  const out: { text: string; href: string }[] = [];
  const hrefs = new Set<string>();
  const push = (l: { text: string; href: string }) => {
    if (l.href === `/${e.slug}` || hrefs.has(l.href)) return;
    hrefs.add(l.href);
    out.push(l);
  };
  const sibs = _byCat.get(e.a.cat) ?? [];
  const sIdx = sibs.findIndex((s) => s.slug === e.slug);
  for (let off = 1; off <= sibs.length && out.length < 4; off++) {
    const sib = sibs[(sIdx + off) % sibs.length];
    push({ text: trTitle(stripLocalIntent(sib.kw) || categoryNoun(sib.a)), href: `/${sib.slug}` });
  }
  push(CORE_LINKS[idx % CORE_LINKS.length]);
  push(CORE_LINKS[(idx + 2) % CORE_LINKS.length]);
  push(CORE_LINKS[(idx + 4) % CORE_LINKS.length]);
  return out.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Page assembly.
// ---------------------------------------------------------------------------

const META_SUFFIX = [
  "Türkiye Geneli Hızlı Kargo",
  "Tüm Türkiye'ye Güvenli Kargo",
  "Online Sipariş, Kapınıza Kargo",
  "Türkiye'nin Her Yerine Kargo",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | marka.pet — Sahiplenme Önerisi`;
  if (a.cat === "retailer") return `${K} | marka.pet — Kargolu Alternatif`;
  if (a.cat === "service") return `${K} | marka.pet — Hizmet Notu`;
  return `${K} | marka.pet — ${pick(META_SUFFIX, h, 461)}`;
}

function metaDescFor(a: Attr, kwP: string, h: number): string {
  const lc = trCap(kwP);
  if (a.cat === "live") {
    return `${lc}: marka.pet canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünlerini Türkiye'nin her yerine kargoyla gönderiyoruz. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${lc}: marka.pet bu hizmeti vermiyoruz; ihtiyacınız olan ürünleri Türkiye'nin her yerine kargoyla göndeririz. Güvenli online ödeme, ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${lc}: marka.pet bağımsız bir online pet shoptur. Aynı ürünler Türkiye geneli kargo ve güvenli online ödemeyle. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${lc} mı arıyorsunuz? ${trCap(noun)} ve tüm pet ürünleri Türkiye'nin her yerine hızlı kargoyla kapınızda. Güvenli online ödeme, ${PHONE}.`,
      `${lc} için marka.pet: geniş ürün yelpazesi, Türkiye geneli kargo ve güvenli online ödeme. ${PHONE}.`,
      `${lc} — Türkiye'nin her yerine anlaşmalı kargo. ${trCap(noun)} dahil yüzlerce ürün, güvenli kart ödemesi. ${PHONE}.`,
    ],
    h,
    462,
  );
}

function buildPage(e: Ent, idx: number, related: { text: string; href: string }[]): SeoPageData {
  const { kw, slug, a } = e;
  const h = H(slug);
  const K = trTitle(kw);
  const kwP = stripLocalIntent(kw) || categoryNoun(a);
  const Kp = trTitle(kwP);
  const isLocal = LOCAL_INTENT_RE.test(kw);
  const isAlwaysOpen = ALWAYS_OPEN_RE.test(kw);
  const regions = regionsFor(h);

  const main = mainSection(a, kwP, Kp, h, isLocal);
  const support = rotate(
    [shipSection(Kp, regions, h), nedenSection(h), siparisSection(h), bolgeSection(regions, h)],
    h,
    471,
  ).slice(0, 3);

  const catFeature =
    a.cat === "live"
      ? "Canlı hayvan satışı yapılmaz — yalnızca ürün"
      : a.cat === "service"
        ? "Hizmet sağlanmaz — yalnızca ürün tedariki"
        : `İhtiyacınıza uygun ${categoryNoun(a)} seçenekleri`;

  return {
    slug,
    type: "keyword",
    storeId: STORE_ID,
    availability: "cargoOnly",
    title: Kp,
    metaTitle: metaTitleFor(a, Kp, h),
    metaDescription: metaDescFor(a, kwP, h),
    keywords: `${kwP}, ${kwP} kargo, kargo ile ${kwP}, ${kwP} türkiye geneli, ${kwP} online sipariş, ${kwP} hızlı kargo`,
    h1: pick(
      [
        `${Kp} — marka.pet`,
        `${Kp} | Türkiye Geneli Kargo`,
        `${Kp} — Hızlı ve Güvenli Kargo`,
      ],
      h,
      472,
    ),
    intro: [
      pick(
        [
          `${trCap(kwP)} mı arıyorsunuz? marka.pet, ${ORIGIN} merkezli deposundan Türkiye'nin her yerine anlaşmalı kargoyla gönderim yapan online bir pet shop.`,
          `${trCap(kwP)} için doğru ürün ve Türkiye geneli hızlı kargo bir arada; siparişinizi güvenle verin, gerisini biz halledelim.`,
          `marka.pet ile ${kwP} ihtiyacınızı online sipariş verin, Türkiye'nin her yerine kargoyla kapınıza ulaşsın.`,
        ],
        h,
        481,
      ),
      `${pick(ORDER_LINES, h, 482)} ${pick(SHIP_LINES, h, 483)}`,
      `${pick(PAY_LINES, h, 484)} Sipariş hattımıza ${SUPPORT_HOURS} arası ulaşabilirsiniz.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 485).slice(0, 4),
      catFeature,
      `${BRAND} — ${PHONE}`,
    ],
    faq: faqFor(a, kwP, Kp, h, { isAlwaysOpen }),
    internalLinks: related,
  };
}

export const MARKAPET_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
