// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for ATAKUM PET
// (atakumpet.com, store id "samsun") — the 10th corpus in the family and the
// THIRD built for a CARGO store.
//
// Atakum Pet is a Türkiye-geneli (national) online pet shop that ships from a
// Samsun-based warehouse via contracted cargo, with ONLINE-ONLY card payment. It
// must read UNIQUE-by-CONTENT versus:
//   • the SHARED jetgomarket.com keyword pages,
//   • the jetgo-markalar / jetgo-diger pages (storeId "jetgo", LOCAL voice) that
//     consume the SAME markalar+diger keyword universe,
//   • the karadeniz-all corpus (karadenizpetshop.com), the SIBLING cargo brand
//     that consumes the IDENTICAL markalar+diger universe — so the same slugs
//     resolve on both and the prose must diverge page-by-page, AND
//   • the markapet-all / jetgoshop-all / atakumbiz-all corpora.
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
// uses a local-intent-STRIPPED label so the page describes only what Atakum Pet
// actually offers: online order + güvenli kart ödemesi + Türkiye geneli anlaşmalı
// kargo. Pages carrying a 24h/gece cue get a truthful "online sipariş 7/24,
// fiziksel mağaza yok" disclaimer.
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
import { SAMSUN_ALL_KEYWORDS } from "./samsun-all-keywords";
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

const STORE_ID = "samsun";
const BRAND = "Atakum Pet";
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
// land on different phrasings and section orders. The mixing constants (murmur3
// fmix32 finalizer) and salt range (6xx) are distinct from ALL sibling corpora
// (atakum djb2 / jetgoshop xor-FNV / atakumbiz FNV+0x2c1b3c6d / markapet
// FNV+0x5bd1e995 / karadeniz lowbias32 + 5xx salts), so even a coincidental
// shared bank string would still rotate apart.
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // murmur3 fmix32 avalanche — distinct from every sibling corpus finalizer.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[((h + Math.imul(salt, 0x2545f491)) >>> 0) % arr.length];
}
function rotate<T>(arr: T[], h: number, salt: number): T[] {
  const n = arr.length;
  const start = ((h + Math.imul(salt, 0x9e3779b9)) >>> 0) % n;
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
// Phrase banks — fresh cargo "Atakum Pet" voice: Türkiye geneli anlaşmalı kargo,
// güvenli online ödeme. No line is shared with any sibling bank (karadeniz in
// particular, which consumes the identical universe), and NONE affirms a local
// trait (same-day / door-payment / courier / local presence).
// ---------------------------------------------------------------------------

const SHIP_LINES = [
  `Atakum Pet, siparişinizi Samsun'daki deposunda hazırlayıp anlaşmalı kargoya teslim eder; paket yola çıktıktan sonra illerin çoğunda 1–3 iş gününde elinizde olur.`,
  `Siparişiniz titizlikle paketlenip anlaşmalı kargo firmasına bırakılır; ülke genelinde ortalama teslimat çoğunlukla 1–3 iş gününü bulur.`,
  `Ürün depodan çıkar çıkmaz kargo takip numaranızı iletiriz; gönderinizi yola çıktığı andan adresinize ulaşana kadar adım adım izleyebilirsiniz.`,
  `Hazır stoktaki ürünleri vakit kaybetmeden paketler, 81 ilin tamamına anlaşmalı kargo ağımızla ulaştırırız.`,
];
const ORDER_LINES = [
  `Sipariş vermek çok kolay: istediğiniz ürünü web sitemizde sepete ekleyip güvenli online ödeme adımıyla siparişinizi tamamlayın.`,
  `Dilerseniz online mağazamızdan sepetinizi hazırlar, dilerseniz ${PHONE} numaralı sipariş hattımızdan bize ulaşırsınız; tercih sizin.`,
  `${PHONE} sipariş hattımızı arayabilir ya da online mağazamızdan sepete ekleyebilirsiniz; siparişiniz hızla hazırlığa alınır.`,
  `İhtiyacınız olan ürünü iletmeniz yeterli; online mağazamız ya da ${PHONE} hattımız siparişinizi hemen oluşturur.`,
];
const PAY_LINES = [
  "Ödemenin tamamı online ve güvenlidir: kredi veya banka kartınızla 3D Secure korumalı altyapı üzerinden işlem yaparsınız.",
  "Kartınızla güvenli online ödeme altyapımızdan rahatça ödersiniz; her alışverişte tutarın %5'i Para Puan olarak hesabınıza eklenir.",
  "Güvenli online ödemeyle kartınızdan ödersiniz; biriken %5 Para Puan'ı bir sonraki siparişinizde indirim olarak kullanırsınız.",
  "Siparişinizi güvenli online ödeme ile tamamlarsınız; belirli tutarın üzerindeki siparişlerde kargo bizden.",
];
const TRUST_LINES = [
  "Yolladığımız her ürün orijinal ve faturalıdır; özellikle mamalarda son kullanma tarihini paketlemeden önce tek tek kontrol ederiz.",
  "Sadece güvendiğimiz tedarikçilerden alır, kırılabilecek ürünleri darbelere karşı sağlamca paketler, içiniz rahat olsun diye özenle yola çıkarırız.",
  "Son kullanma tarihi yaklaşan ya da ambalajı hasarlı ürünü kesinlikle göndermeyiz; ne satın aldığınızı net görerek güvenle alışveriş edersiniz.",
];
const STOCK_LINES = [
  `Stok durumu gün içinde değişebildiğinden, istediğiniz ürünü ayırtmak için ${PHONE} numaralı hattımızdan kısa bir teyit almanızı öneririz.`,
  `Bir ürün tükenmişse benzer içerikte ve bütçeye uygun muadilini öneririz; güncel stoğu ${PHONE} numarasından sorabilirsiniz.`,
  `Ürünün stokta olup olmadığını en hızlı şekilde ${PHONE} numarasından öğrenir, yoksa size en uygun alternatifi birlikte belirleriz.`,
];
const REGION_LINES = [
  "Ülkenin her köşesine — İstanbul, Ankara, İzmir, Bursa, Antalya ve diğer tüm illere — anlaşmalı kargoyla gönderi yapıyoruz.",
  "Hangi ilde yaşarsanız yaşayın siparişiniz adresinize gelir; Türkiye geneli kargo ağımız 81 ilin tamamını kapsar.",
  "Büyükşehirlerden en uzak ilçelere kadar Türkiye'nin her noktasına güvenli kargoyla ulaşıyoruz.",
];
const STORY_LINES = [
  `Atakum Pet, ${ORIGIN} merkezli olsa da Türkiye'nin tamamına gönderi yapan bir online pet shoptur; size doğru ürünü dürüstçe öneririz.`,
  "Hedefimiz hızlı, güvenilir ve şeffaf bir online pet shop sunmak: kaliteli ürün, güvenli ödeme ve Türkiye geneli kargo bir arada.",
  "Zengin ürün çeşitliliğini online alışverişin konforuyla buluşturuyoruz; aklınıza takılanı sorun, bildiğimizi açık yüreklilikle paylaşalım.",
];

const WHY_POINTS = [
  "Türkiye'nin tüm illerine anlaşmalı kargoyla gönderi",
  "3D Secure korumalı güvenli online kart ödemesi",
  "Kedi, köpek, kuş, kemirgen ve akvaryum için geniş ürün seçenekleri",
  "Premium ve ekonomik markalar tek adreste",
  "Orijinal ve faturalı ürün garantisi",
  "Her siparişte %5 Para Puan kazancı",
  "Kargo takip numarasıyla gönderinizi adım adım takip",
  "Belirli tutarın üzerinde ücretsiz kargo",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function shipSection(Kp: string, regions: string[], h: number): Section {
  return {
    h2: pick(
      [
        `${Kp} Kaç Günde Teslim Edilir?`,
        `${Kp} Ne Zaman Elinize Ulaşır?`,
        `${Kp} İçin Türkiye Geneli Gönderim`,
      ],
      h,
      601,
    ),
    paragraphs: [
      pick(SHIP_LINES, h, 602),
      `${Kp} siparişiniz onayınızın ardından özenle paketlenip anlaşmalı kargoya verilir; ${joinNice(regions)} başta olmak üzere Türkiye'nin bütün illerine gönderi sağlıyoruz.`,
    ],
    list: regions.map((r) => `${r}: anlaşmalı kargo ile 1–3 iş günü`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Nasıl Online Sipariş Verilir?", "Dakikalar İçinde Online Sipariş", "Sipariş ve Güvenli Ödeme Adımları"],
      h,
      611,
    ),
    paragraphs: [
      pick(ORDER_LINES, h, 612),
      `${pick(PAY_LINES, h, 613)} ${pick(STOCK_LINES, h, 614)}`,
    ],
  };
}

function bolgeSection(regions: string[], h: number): Section {
  const a = regions[0] ?? "İstanbul";
  const b = regions[1] ?? "Ankara";
  return {
    h2: pick(
      ["Türkiye'nin Tamamına Gönderi", "Hangi İllere Kargo Gönderiyoruz?", "Türkiye Geneli Kargo Ağımız"],
      h,
      621,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere 81 ilin tamamına anlaşmalı kargoyla düzenli gönderi yapıyoruz.`,
          `${a} ile ${b} dahil bütün illere kargo gönderdiğimizden teslim sürelerimiz hem öngörülebilir hem güvenilirdir.`,
          `${a}, ${b} ve çevre iller dahil Türkiye'nin her köşesine erişiyoruz; nerede olursanız olun siparişiniz adresinize ulaşır.`,
        ],
        h,
        622,
      ),
      pick(REGION_LINES, h, 623),
      pick(TRUST_LINES, h, 624),
    ],
  };
}

function nedenSection(h: number): Section {
  return {
    h2: pick(
      ["Neden Atakum Pet?", "Atakum Pet'i Tercih Etme Nedenleri", "Neden Bizi Tercih Etmelisiniz?"],
      h,
      631,
    ),
    paragraphs: [pick(STORY_LINES, h, 632)],
    list: rotate(WHY_POINTS, h, 633).slice(0, 5),
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
        [`${Kp}: Önemli Bir Hatırlatma`, `${Kp} ve Sahiplenme`, `${Kp} Hakkında Açık Konuşalım`],
        h,
        641,
      ),
      paragraphs: [
        "Atakum Pet canlı hayvan satışı yapmaz; mağazamızda yalnızca mama, bakım ürünü ve aksesuar bulunur.",
        pick(
          [
            "Yaşamınıza yeni bir dost katmayı düşünüyorsanız önce barınaklara ve güvenilir sahiplenme gönüllülerine göz atın; sahiplenmek, satın almaya kıyasla çok daha doğru bir yoldur.",
            "Yeni bir dostun en sağlıklı kaynağı barınaklar ve sorumlu sahiplenme ağlarıdır; siz sahiplendikten sonra mama ve bakım tarafında biz yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplenmeyi destekliyoruz; eve gelen dostunuzun beslenme ve bakım ihtiyaçlarını Türkiye'nin her yerine kargoyla karşılarız.",
          ],
          h,
          642,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve bakım ürünlerinin tamamını Atakum Pet'ten Türkiye geneli kargoyla sipariş edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${Kp} İçin Bilgilendirme`, `${Kp} Hakkında Kısa Açıklama`, `${Kp}: Not`], h, 641),
      paragraphs: [
        `Atakum Pet bir online evcil hayvan ürünleri mağazasıdır; ${kwP} hizmeti vermiyoruz. Bu, mağazamızın sunduğu bir hizmet değildir.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman bir kişiye ya da kuruluşa başvurmanız en doğrusu olur; biz yalnızca süreçte ihtiyaç duyacağınız ürünleri sağlarız.",
            "İşin kendisini alanında yetkin bir adresten almanızı tavsiye ederiz; mama, bakım ve aksesuar tarafındaki her ihtiyaçta ise yanınızdayız.",
            "İlgili işi profesyonel birinden almanız gerekir; gereken ürünleri Türkiye'nin her yerine kargoyla ulaştırmaksa bizim işimizdir.",
          ],
          h,
          642,
        ),
        `Gerekli ürünleri (mama, bakım malzemesi, aksesuar) Atakum Pet'ten güvenli online ödeme ve Türkiye geneli kargoyla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${Kp} Yerine Atakum Pet`, `${Kp}: Bağımsız Seçenek`, `${Kp} mı, Atakum Pet mi?`], h, 641),
      paragraphs: [
        `Atakum Pet bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Türkiye geneli kargo ve güvenli online ödeme ile bağımsız bir alternatif olarak sunuyoruz.`,
        pick(
          [
            "Bizden sipariş verdiğinizde ürün orijinal ve faturalı gelir; bir aksilik olduğunda muhatapsız kalmaz, doğrudan bize ulaşırsınız.",
            "Fiyat araştırırken şunu unutmayın: bizden alındığında ürün güvenli paketlenir, kargo takibi iletilir ve destek için gerçek bir ekip yanınızdadır.",
            "Bağımsız bir online pet shop olarak orijinal ürün, güvenli ödeme ve Türkiye geneli kargo sözümüzün arkasındayız.",
          ],
          h,
          642,
        ),
        pick(STOCK_LINES, h, 643),
      ],
    };
  }

  // --- Local-intent reframe: never affirm same-day/door-payment/local pickup. -
  if (isLocal) {
    return {
      h2: pick(
        [`${Kp}: Türkiye Geneline Gönderi`, `${Kp} Nasıl Kargolanır?`, `${Kp} İçin Online Sipariş ve Teslimat`],
        h,
        641,
      ),
      paragraphs: [
        "Atakum Pet, Türkiye'nin her yerine anlaşmalı kargoyla gönderi yapan bir online pet shoptur. Siparişiniz onaylandıktan sonra hızla hazırlanıp kargoya verilir; çoğu adrese 1–3 iş günü içinde ulaşır.",
        "Ödemenizi güvenli online altyapımızdan kredi ya da banka kartıyla yaparsınız; her siparişte harcadığınız tutarın %5'i Para Puan olarak hesabınıza birikir.",
        pick(STOCK_LINES, h, 642),
      ],
    };
  }

  // --- Product / info buckets. ----------------------------------------------
  const intro = pick(
    [
      `${noun} seçerken ${animalW}'ınızın yaşını, kilosunu ve alışkanlıklarını dikkate almak uzun vadede en doğru yaklaşımdır; aceleyle verilen karar çoğu kez geri teper.`,
      `Doğru ${noun}, ${animalW}'ınızın gündelik rahatını doğrudan belirler; bu yüzden moda olana göre değil gerçek ihtiyaca göre seçim yapmak gerekir.`,
      `${lc} ararken bol seçenek arasında kaybolmak işten değildir; birkaç net kritere bakınca ${animalW}'ınıza en uygun ${noun} kendiliğinden öne çıkar.`,
    ],
    h,
    641,
  );

  switch (a.cat) {
    case "food": {
      const bits: string[] = [];
      const sp = stagePhrase(a.stage);
      if (sp) bits.push(`paketin ${sp} dönemine uygun olduğunu doğrulayın`);
      if (a.flavor) bits.push(`${a.flavor} gibi sevdiği bir aromayı tercih etmek geçişi kolaylaştırır`);
      if (a.size) bits.push(`${a.size} gibi paketler düzenli kullanımda daha ekonomik olur`);
      const crit = bits.length
        ? `${trCap(joinNice(bits))}.`
        : "İçindekiler listesinin başında açıkça tanımlanmış bir et/protein kaynağı görmek çoğunlukla olumlu bir işarettir.";
      return {
        h2: pick([`${Kp} Seçiminde Nelere Bakmalı?`, `Doğru ${Kp} İçin Pratik İpuçları`, `${Kp} Seçim Kılavuzu`], h, 643),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dahil ` : ""}premium ve ekonomik pek çok markayı bir arada bulundurduğumuzdan, kararsız kaldıysanız küçük paketle deneyip beğendiğinizde büyük boya geçebilirsiniz; hepsini Türkiye geneli kargoyla göndeririz.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayıp eski mamayla kademeli karıştırın",
          "Suyunu her gün değiştirin, mama kabını düzenli olarak yıkayın",
          "Açılan paketi serin, kuru ve ağzı kapalı şekilde saklayın",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${Kp} Nasıl Seçilir ve Kullanılır?`, `${Kp} İçin Bilmeniz Gerekenler`, `${Kp} Kullanım Önerileri`], h, 643),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}en belirleyici üç ölçüt topaklaşma gücü, toz miktarı ve koku kontrolüdür. Atakum Pet'te topaklaşan (bentonit), kristal (silika) ve doğal kum türlerini bir arada bulur, Türkiye'nin her yerine kargoyla sipariş edersiniz.`,
        ],
        list: [
          "Kap derinliğini 5–7 cm aralığında tutun, topakları her gün temizleyin",
          "Haftada bir kabı tamamen boşaltıp yıkayın",
          "Kediniz kuma alışmazsa yeni türe kademeli olarak geçin",
        ],
      };
    }
    case "bird":
      return {
        h2: pick([`${Kp} İçin Tavsiyeler`, `${Kp} Nasıl Seçilmeli?`, `${Kp} Üzerine Kısa Notlar`], h, 643),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes temizliği ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formunu korumada belirleyicidir. Yem, kafes ve aksesuarları bir arada sunar, Türkiye geneli kargoyla yollarız.",
        ],
        list: [
          "Yemliği düzenli temizleyip küflenmeye fırsat vermeyin",
          "Suyu her gün tazeleyin, suluğu iyice durulayın",
          "Mineral blok ve gaga taşını hiç eksik etmeyin",
        ],
      };
    case "collar":
      return {
        h2: pick([`${Kp} Seçerken Nelere Dikkat Etmeli?`, `İyi Bir ${Kp} Nasıl Olmalı?`, `${Kp} Kılavuzu`], h, 643),
        paragraphs: [
          intro,
          "Tasma ve koşumda en önemli nokta doğru bedendir: boyun veya göğüs çevresini ölçün, altından iki parmak rahatça geçebilmeli. Farklı beden, malzeme ve kilit tipine sahip modeller bulundururuz.",
        ],
        list: [
          "Boyun ve göğüs çevresini mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) modeli tercih edin",
          "Dikişlerin ve klips kısmının sağlamlığını kontrol edin",
        ],
      };
    case "bed":
      return {
        h2: pick([`${Kp} Nasıl Seçilmeli?`, `Konforlu Bir ${Kp} İçin İpuçları`, `${Kp} Seçerken Notlar`], h, 643),
        paragraphs: [
          intro,
          "Yatak seçerken dostunuzun boylu boyunca uzanmış hâli, uyuma pozisyonu ve yıkanabilirlik öne çıkar. Farklı boy ve dolgu seçenekleriyle, kılıfı çıkarılıp makinede yıkanabilen modeller mevcuttur.",
        ],
        list: [
          "Boylu boyunca uzandığında rahatça sığacağı boyu seçin",
          "Kılıfı sökülüp yıkanabilen modelleri tercih edin",
          "Sakin ve köşe bir noktaya konumlandırın",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${Kp} Nasıl Seçilir?`, `İyi Bir ${Kp} Nelere Sahip Olmalı?`, `${Kp} İçin Tavsiyeler`], h, 643),
        paragraphs: [
          intro,
          "Taşıma çantası ve kafeslerinde havalandırma, sağlam kapak kilidi ve uygun boyut önemlidir. Veteriner ziyareti ve seyahat için farklı boy ve tipte seçenekler sunuyoruz.",
        ],
        list: [
          "İçinde ayakta dönebileceği boyu seçin",
          "Kapak kilidinin güvenle kapandığından emin olun",
          "İlk yolculuk öncesi çantaya alışmasını sağlayın",
        ],
      };
    case "bowl":
      return {
        h2: pick([`${Kp} Seçerken Nelere Bakmalı?`, `${Kp} Üzerine`, `İyi Bir ${Kp} Nasıl Olur?`], h, 643),
        paragraphs: [
          intro,
          "Mama ve su kaplarında malzeme (paslanmaz çelik / seramik) ve kolay temizlenebilirlik belirleyicidir. Devrilmeyi önleyen tabanlı çelik ve seramik modelleri bir arada bulursunuz.",
        ],
        list: [
          "Paslanmaz çelik veya seramik daha hijyeniktir",
          "Kabı her gün yıkayarak biyofilm oluşumunu engelleyin",
          "Devrilmeyi önleyen tabanlı modelleri seçin",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${Kp} Nasıl Kullanılır?`, `${Kp} İçin Pratik İpuçları`, `${Kp} Üzerine Notlar`], h, 643),
        paragraphs: [
          intro,
          "Bakımda tüy yapısına uygun şampuan ve doğru tarak/fırça seçimi tüy sağlığını destekler. Düzenli tarama hem keçeleşmeyi hem de dökülmeyi azaltır.",
        ],
        list: [
          "Tüy tipine uygun şampuan ve fırçayı seçin",
          "Banyo sonrası iyice durulayıp güzelce kurulayın",
          "Düzenli tarama dökülmeyi belirgin biçimde azaltır",
        ],
      };
    case "toy":
      return {
        h2: pick([`${Kp} Neden Gerekli?`, `${Kp} Nasıl Seçilir?`, `${Kp} ile Daha Keyifli Bir Dost`], h, 643),
        paragraphs: [
          intro,
          "Oyuncaklar enerji atmak ve zihinsel canlılık için şarttır. Boyuna uygun, kolay parçalanmayan ve güvenli malzemeden üretilmiş ürünleri tercih edin.",
        ],
        list: [
          "Boyuna uygun, yutulmayacak büyüklükte oyuncak seçin",
          "Oyuncakları zaman zaman değiştirin, ilgisi taze kalsın",
          "Yıpranmış oyuncağı vaktinde yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${Kp} Seçiminde Beden`, `${Kp} Nasıl Seçilmeli?`, `${Kp} Kılavuzu`], h, 643),
        paragraphs: [
          intro,
          "Kıyafette doğru beden ve rahat hareket esastır; sırt uzunluğu ile göğüs çevresini ölçün. Soğuk havalar için su geçirmez ve içi astarlı modeller iş görür.",
        ],
        list: [
          "Sırt uzunluğunu ve göğüs çevresini ölçerek bedene karar verin",
          "Hareketini ve tuvaletini kısıtlamayan modeli seçin",
          "Soğuk havada su geçirmez/astarlı modelleri tercih edin",
        ],
      };
    case "health":
      return {
        h2: pick([`${Kp} Üzerine`, `${Kp} Nasıl Kullanılır?`, `${Kp} İçin Kısa Notlar`], h, 643),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri düzenli bakımın bir parçasıdır; ancak hiçbiri veteriner muayenesi veya tedavisinin yerine geçmez. Tereddüt ettiğinizde önce veterinerinize danışın.",
        ],
        list: [
          "Ürünü etiketteki talimata uygun şekilde uygulayın",
          "Bir sağlık kaygısında önce veterinere danışın",
          "Takviyeyi dengeli beslenmenin tamamlayıcısı olarak değerlendirin",
        ],
      };
    case "guide":
      return {
        h2: pick([`${Kp}: Kısa Bir Özet`, `${Kp} Üzerine Kısa Notlar`, `${Kp} Üzerine`], h, 643),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok merak edilenleri Atakum Pet olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun gününü kolaylaştırmayı amaçlıyoruz.`,
              `${lc} hakkında işe yarar bilgileri bir araya topladık; ihtiyaç duyduğunuz ürünleri de Türkiye'nin her yerine kargoyla yolluyoruz.`,
            ],
            h,
            643,
          ),
          "Aklınıza takılan olursa ürün seçiminde de bize danışın; deneyimimizi memnuniyetle paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`${Kp} İçin Online Adresiniz`, `${Kp} Arayanlar İçin`, `${Kp}: Türkiye'ye Online Pet Shop`], h, 643),
        paragraphs: [
          pick(
            [
              `${lc} için Atakum Pet online mağazasından sipariş verin; ürünlerinizi Türkiye'nin her yerine anlaşmalı kargoyla yolluyoruz.`,
              `${lc} deyince Atakum Pet: geniş ürün yelpazesi, güvenli online ödeme ve Türkiye geneli hızlı kargo bir arada.`,
            ],
            h,
            643,
          ),
          `Dilerseniz web sitemizden sepetinizi hazırlayın, dilerseniz ${PHONE} sipariş hattımızı arayın; gerisini biz hallederiz.`,
        ],
      };
    default:
      return {
        h2: `${Kp} Üzerine`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için Atakum Pet'teki seçenekleri inceleyebilir, emin olamadığınızda bize danışabilirsiniz; tüm siparişleri Türkiye geneli kargoyla göndeririz.`,
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
      q: `Atakum Pet üzerinden günün her saati sipariş verebilir miyim?`,
      a: `Online mağazamızdan günün her saati sipariş oluşturabilirsiniz. Siparişler iş günlerinde hazırlanıp anlaşmalı kargoya verilir; fiziksel bir mağaza işletmiyoruz.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `Atakum Pet ${kwP} kapsamında canlı hayvan satıyor mu?`,
      a: "Hayır. Atakum Pet canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunarız. Bir dost için yerel barınakları ve sahiplenmeyi öneririz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `Atakum Pet ${kwP} hizmeti veriyor mu?`,
      a: `Hayır, ${kwP} bizim sunduğumuz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri Türkiye geneli kargoyla yollarız.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `Atakum Pet ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: "Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız yok. Aynı ürünleri Türkiye geneli kargo ve güvenli online ödeme ile sunuyoruz.",
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${Kp} siparişi kaç günde elime ulaşır?`,
      a: `Siparişiniz onaylandıktan sonra hızla hazırlanıp anlaşmalı kargoya verilir; Türkiye genelinde çoğu adrese 1–3 iş günü içinde ulaşır.`,
    },
    {
      q: `${Kp} için nasıl ödeme yapabilirim?`,
      a: `Ödemenizi güvenli online altyapımız üzerinden kredi ya da banka kartıyla yaparsınız; her siparişte harcadığınız tutarın %5'i Para Puan olarak hesabınıza eklenir. ${PHONE}.`,
    },
    {
      q: `${Kp} fiyatını nasıl öğrenebilirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyin ya da ${PHONE} numaralı sipariş hattımızdan bilgi alın; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `Atakum Pet Türkiye'nin her yerine kargo gönderiyor mu?`,
      a: `Evet. Atakum Pet, ${ORIGIN} merkezli deposundan Türkiye'nin her iline anlaşmalı kargoyla gönderim yapar. ${PHONE}.`,
    },
  ];

  const rotated = rotate(generic, h, 651);
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
// (Mirror of the karadeniz-all / markapet-all / atakum-all local re-tag.)
const SAMSUN_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeSamsun(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (SAMSUN_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Local noise the shared engine intentionally leaves in: the source still carries
// Spanish-search autocomplete ("buscar spectrum" = "search spectrum") that would
// otherwise mint a nonsensical pet-shop page. Drop just the Spanish "buscar" cue;
// bare "spectrum" stays as a legit food-brand page.
const SAMSUN_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of SAMSUN_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || SAMSUN_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeSamsun(kw) });
}

export const SAMSUN_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

// Cargo-safe core links: every href is a SHARED cargoOnly slug already served on
// atakumpet.com (verified present in the cargo corpus), so none ever dangles. The
// seo-data integration additionally filters any link that does not resolve in the
// samsun slug space, so generic localOnly slugs can never leak.
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
  "Türkiye Geneline Güvenli Kargo",
  "Tüm Türkiye'ye Hızlı Gönderim",
  "Online Sipariş, Kapınıza Kargo",
  "Türkiye'nin Tüm İllerine Kargo",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | Atakum Pet — Sahiplenme Rehberi`;
  if (a.cat === "retailer") return `${K} | Atakum Pet — Bağımsız Online Adres`;
  if (a.cat === "service") return `${K} | Atakum Pet — Bilgi Notu`;
  return `${K} | Atakum Pet — ${pick(META_SUFFIX, h, 661)}`;
}

function metaDescFor(a: Attr, kwP: string, h: number): string {
  const lc = trCap(kwP);
  if (a.cat === "live") {
    return `${lc}: Atakum Pet canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünlerini Türkiye'nin her yerine kargoyla gönderiyoruz. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${lc}: Atakum Pet bu hizmeti vermiyoruz; ihtiyacınız olan ürünleri Türkiye'nin her yerine kargoyla göndeririz. Güvenli online ödeme, ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${lc}: Atakum Pet bağımsız bir online pet shoptur. Aynı ürünler Türkiye geneli kargo ve güvenli online ödeme ile. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${lc} mı arıyorsunuz? ${trCap(noun)} ve tüm pet ürünleri Türkiye'nin her köşesine hızlı kargoyla adresinize gelir. Güvenli online ödeme, ${PHONE}.`,
      `${lc} için Atakum Pet: geniş ürün yelpazesi, Türkiye geneli kargo ve güvenli online ödeme bir arada. ${PHONE}.`,
      `${lc} — Türkiye'nin her iline anlaşmalı kargo. ${trCap(noun)} dahil yüzlerce ürün, güvenli kart ödemesi. ${PHONE}.`,
    ],
    h,
    662,
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
    671,
  ).slice(0, 3);

  const catFeature =
    a.cat === "live"
      ? "Canlı hayvan satışı yok — yalnızca ürün"
      : a.cat === "service"
        ? "Hizmet verilmez — yalnızca ürün tedariği"
        : `İhtiyacınıza en uygun ${categoryNoun(a)} çeşitleri`;

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
        `${Kp} — Atakum Pet`,
        `${Kp} | Tüm Türkiye'ye Kargo`,
        `${Kp} — Hızlı ve Güvenli Gönderim`,
      ],
      h,
      672,
    ),
    intro: [
      pick(
        [
          `${trCap(kwP)} mı arıyorsunuz? Atakum Pet, ${ORIGIN} merkezli deposundan Türkiye'nin her yerine anlaşmalı kargoyla gönderi yapan bir online pet shoptur.`,
          `${trCap(kwP)} için doğru ürün ve Türkiye geneli hızlı kargo bir arada; siparişinizi içiniz rahat verin, gerisini bize bırakın.`,
          `Atakum Pet ile ${kwP} ihtiyacınızı online sipariş edin, Türkiye'nin her köşesine kargoyla adresinize gelsin.`,
        ],
        h,
        681,
      ),
      `${pick(ORDER_LINES, h, 682)} ${pick(SHIP_LINES, h, 683)}`,
      `${pick(PAY_LINES, h, 684)} Sipariş hattımıza ${SUPPORT_HOURS} saatleri arasında ulaşabilirsiniz.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 685).slice(0, 4),
      catFeature,
      `${BRAND} — ${PHONE}`,
    ],
    faq: faqFor(a, kwP, Kp, h, { isAlwaysOpen }),
    internalLinks: related,
  };
}

export const SAMSUN_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
