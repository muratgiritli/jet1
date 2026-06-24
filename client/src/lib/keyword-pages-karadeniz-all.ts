// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for KARADENIZ PET
// SHOP (karadenizpetshop.com, store id "karadeniz") — the 9th corpus in the
// family, a LOCAL same-day Samsun store.
//
// Karadeniz Pet Shop is ONE Samsun-based pet shop that delivers SAME-DAY within
// the Samsun area (Atakum, İlkadım, Canik, Tekkeköy) by its own kurye, with
// KAPIDA ÖDEME (nakit / kart / QR). There is NO national shipping and NO
// online-only payment. The voice is warm, neighbourly and köklü — "Samsunlu komşunuz,
// güvenilir yerel pet shop". It must read UNIQUE-by-CONTENT versus:
//   • the SHARED jetgomarket.com keyword pages,
//   • the jetgo-markalar / jetgo-diger pages (storeId "jetgo", LOCAL voice) that
//     consume the SAME markalar+diger keyword universe,
//   • the markapet-all corpus (marka.pet, a sibling brand), AND
//   • the jetgoshop-all / atakumbiz-all corpora.
//
// LOCAL TRUTHFULNESS is the load-bearing invariant. Because same-day local
// delivery is genuinely TRUE here, this generator AFFIRMS:
//   • aynı gün teslimat (Samsun içi, çalışma saatleri içinde)
//   • kapıda ödeme (nakit / kart / QR)
//   • kurye ile kapınızda / mahallenize teslim
//   • Atakum / İlkadım / Canik / Tekkeköy kapsama alanı
// Every served surface — title, metaTitle, keywords meta, AND every line of
// RENDERED BODY COPY (h1, intro, sections, FAQ answers, description) — carries
// the REAL keyword and describes what Karadeniz Pet Shop actually offers: yerel
// aynı gün teslimat + kapıda ödeme. Pages carrying a 24h/gece cue get an HONEST
// hours note: online sipariş günün her saati alınır, Samsun içi aynı gün
// teslimat çalışma saatleri içinde gerçekleşir.
//
// Classification + truthfulness reuse the shared keyword-truthfulness engine, so
// live-animal / service / retailer / price intents are framed safely:
//   live    → "canlı hayvan satışı yapmaz" + responsible-adoption guidance
//   service → "... hizmeti vermiyoruz" (a shop, not a service provider)
//   retailer→ "bağımsız bir işletmeyiz; resmi bir bağlantımız yok"
//   price   → never a fabricated number next to ₺/TL/lira.
//
// Consumed by seo-data.ts as a SEPARATE integration loop. Every page is tagged
// availability "localOnly" EXPLICITLY. Do not hand-edit.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { KARADENIZ_ALL_KEYWORDS } from "./karadeniz-all-keywords";
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

const STORE_ID = "karadeniz";
const BRAND = "Karadeniz Pet Shop";
const PHONE = "0850 840 39 59";
const ORIGIN = "Samsun";
const SUPPORT_HOURS = "09:00–18:00";

// Samsun same-day coverage footprint. İlçe + mahalle örnekleri — komşuluk
// ölçeğinde, yerel kapsama alanımız. Aynı gün teslimat bu bölgelerde geçerlidir.
const REGIONS = [
  "Atakum", "İlkadım", "Canik", "Tekkeköy", "Bafra", "Mimarsinan",
  "Denizevleri", "Körfez", "Atakent", "Kurupelit", "Çatalçam", "Yeşilkent",
  "Cumhuriyet", "Mevlana", "Aydınlık", "Yenimahalle", "Kılıçdede", "Kalkancı",
  "Esenevler", "Çiftlik",
];

const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;

// Local-intent search cues. Same-day local delivery is genuinely TRUE here, so a
// keyword matching this triggers the AFFIRMING local-delivery branch in
// mainSection (not a deflection).
const LOCAL_INTENT_RE =
  /aynı gün|ayni gun|1 saat|bir saat|2 saat|\bacil\b|hemen|anında|aninda|kurye|kapıda|kapida|mahalle|en yakın|en yakin|nöbet|nobet|gece|7\s*\/?\s*24|24 saat|eve teslim|eve servis|getir|gelsin|hafta sonu/i;

// The real keyword renders on every surface, so this is a passthrough; the slug
// and the rendered label stay identical to the searched term.
function stripLocalIntent(kw: string): string {
  return kw;
}

// ---------------------------------------------------------------------------
// Stable-hash variation helpers — deterministic per slug, but neighbouring slugs
// land on different phrasings and section orders. The mixing constants (lowbias32
// finalizer) and salt range (5xx) are distinct from ALL sibling corpora (atakum
// djb2 / jetgoshop xor-FNV / atakumbiz FNV+0x2c1b3c6d / markapet FNV+0x5bd1e995),
// so even a coincidental shared bank string would still rotate apart.
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // lowbias32 avalanche — distinct from every sibling corpus finalizer.
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[((h + Math.imul(salt, 0x27d4eb2f)) >>> 0) % arr.length];
}
function rotate<T>(arr: T[], h: number, salt: number): T[] {
  const n = arr.length;
  const start = ((h + Math.imul(salt, 0x165667b1)) >>> 0) % n;
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
// Phrase banks — warm, neighbourly "Karadeniz Pet Shop" voice: Samsunlu komşunuz,
// Samsun içi aynı gün teslimat, kurye ile kapınızda, kapıda ödeme (nakit/kart/QR).
// No line is shared with any sibling bank, and every line speaks the LOCAL truth.
// ---------------------------------------------------------------------------

const SHIP_LINES = [
  `Karadeniz Pet Shop, Samsun içi siparişinizi kendi kuryesiyle aynı gün kapınıza getirir; çalışma saatleri içinde verdiğiniz siparişler genellikle birkaç saat içinde mahallenize ulaşır.`,
  `Siparişiniz özenle hazırlanır ve Samsun içinde aynı gün kuryeyle teslim edilir; Atakum, İlkadım, Canik ve Tekkeköy'e kapınıza kadar getiriyoruz.`,
  `Hazırlık bizden, takip telefonla: ürün yola çıktığında kuryemiz sizi arar ve aynı gün kapınıza ulaştırır.`,
  `Stoktaki ürünler aynı gün yola çıkar; Samsun içi aynı gün teslimatı komşunuz olarak kendi kuryemizle yapıyoruz.`,
];
const ORDER_LINES = [
  `Sipariş vermek çok kolay: beğendiğiniz ürünü sepete ekleyin, Samsun içi aynı gün teslimat ve kapıda ödeme ile siparişinizi onaylayın.`,
  `İster online mağazamızdan sepetinizi oluşturun, ister ${PHONE} numaralı sipariş hattımızı arayın; hangisi size kolaysa.`,
  `${PHONE} sipariş hattımıza ulaşın veya online mağazamızdan sepete ekleyin; siparişiniz anında hazırlığa girer.`,
  `Aradığınız ürünü bize bildirmeniz kâfi; online mağazamız ve ${PHONE} hattımız siparişinizi hemen oluşturur.`,
];
const PAY_LINES = [
  "Ödemeyi kapıda yaparsınız: kurye kapınıza geldiğinde nakit, kart ya da QR ile dilediğiniz gibi ödersiniz.",
  "Kapıda ödeme (nakit/kart/QR) ile rahatça ödersiniz; her siparişte tutarın %5'i Para Puan olarak hesabınıza işlenir.",
  "Kapıda nakit, kart veya QR ile ödeme yapar, biriken %5 Para Puan'ı sonraki alışverişinizde indirim olarak değerlendirirsiniz.",
  "Siparişinizi kapıda ödeme ile kapatırsınız; ürünü elinizde görüp kuryeye nakit, kart ya da QR ile ödersiniz.",
];
const TRUST_LINES = [
  "Getirdiğimiz her ürün orijinal ve faturalıdır; özellikle mamalarda son kullanma tarihini kapınıza çıkmadan önce tek tek gözden geçiririz.",
  "Yalnızca güvendiğimiz tedarikçilerle çalışır, ürünleri özenle hazırlar ve komşunuz olarak içiniz rahat şekilde kapınıza getiririz.",
  "Tarihi yaklaşmış veya ambalajı zedelenmiş ürünü asla göndermeyiz; ürünü kapıda görüp ne aldığınızı net bilerek alışveriş yaparsınız.",
];
const STOCK_LINES = [
  `Stok gün içinde hızla değişebilir; istediğiniz ürünü ayırtmak için ${PHONE} hattımızdan kısa bir teyit almanızı tavsiye ederiz.`,
  `Bir ürün tükendiyse benzer içerik ve bütçedeki muadilini öneririz; güncel durumu ${PHONE} numarasından öğrenebilirsiniz.`,
  `Ürünün stokta olup olmadığını en hızlı ${PHONE} numarasından teyit eder, yoksa en uygun alternatifi birlikte seçeriz.`,
];
const REGION_LINES = [
  "Samsun'un dört bir yanına — Atakum, İlkadım, Canik, Tekkeköy ve çevre mahallelere — aynı gün teslimat yapıyoruz.",
  "Samsun içinde hangi mahallede olursanız olun siparişiniz aynı gün kapınıza ulaşır; kapsama alanımız Atakum, İlkadım, Canik ve Tekkeköy.",
  "Atakum sahilinden Canik sırtlarına dek Samsun'un her mahallesine kendi kuryemizle aynı gün ulaşıyoruz.",
];
const STORY_LINES = [
  `Karadeniz Pet Shop, ${ORIGIN} merkezli, mahallenizin güvenilir yerel pet shopudur; Samsunlu komşunuz olarak doğru ürünü dürüstçe öneririz.`,
  "Amacımız samimi, güvenilir ve hızlı bir yerel pet shop olmak: kaliteli ürün, kapıda ödeme ve Samsun içi aynı gün teslimat.",
  "Geniş ürün çeşitliliğini komşuluk sıcaklığıyla birleştiriyoruz; merak ettiğinizi sorun, bildiğimizi açıkça paylaşırız.",
];

const WHY_POINTS = [
  "Samsun içi aynı gün teslimat (Atakum / İlkadım / Canik / Tekkeköy)",
  "Kapıda ödeme: nakit, kart veya QR",
  "Kedi, köpek, kuş, kemirgen ve akvaryum için zengin ürün yelpazesi",
  "Premium ve ekonomik markalar bir arada",
  "Orijinal ve faturalı ürün güvencesi",
  "Her alışverişte %5 Para Puan",
  "Kurye ile kapınızda, mahallenize teslim",
  "Samsunlu komşunuz, güvenilir yerel pet shop",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function shipSection(Kp: string, regions: string[], h: number): Section {
  return {
    h2: pick(
      [
        `${Kp} Aynı Gün Kapınızda mı?`,
        `${Kp} Siparişiniz Ne Zaman Elinizde?`,
        `${Kp} İçin Samsun İçi Aynı Gün Teslimat`,
      ],
      h,
      501,
    ),
    paragraphs: [
      pick(SHIP_LINES, h, 502),
      `${Kp} siparişiniz onaylandıktan sonra titizlikle hazırlanır ve kendi kuryemize verilir; ${joinNice(regions)} başta olmak üzere Samsun içinde aynı gün kapınıza getiriyoruz.`,
    ],
    list: regions.map((r) => `${r}: aynı gün kuryeyle kapınızda`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Sipariş Nasıl Verilir?", "Birkaç Dakikada Sipariş", "Sipariş ve Kapıda Ödeme"],
      h,
      511,
    ),
    paragraphs: [
      pick(ORDER_LINES, h, 512),
      `${pick(PAY_LINES, h, 513)} ${pick(STOCK_LINES, h, 514)}`,
    ],
  };
}

function bolgeSection(regions: string[], h: number): Section {
  const a = regions[0] ?? "Atakum";
  const b = regions[1] ?? "İlkadım";
  return {
    h2: pick(
      ["Samsun'un Her Mahallesine Teslimat", "Hangi Bölgelere Aynı Gün Getiriyoruz?", "Samsun İçi Aynı Gün Teslimat Ağımız"],
      h,
      521,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere Samsun'un tüm mahallelerine aynı gün kuryeyle düzenli teslimat yapıyoruz.`,
          `${a} ile ${b} dahil Samsun içindeki her adrese aynı gün gittiğimiz için teslimat süremiz hem öngörülebilir hem güvenlidir.`,
          `${a}, ${b} ve çevresi dahil Samsun'un her noktasına ulaşıyoruz; mahallenizde olun, siparişiniz aynı gün kapınıza gelir.`,
        ],
        h,
        522,
      ),
      pick(REGION_LINES, h, 523),
      pick(TRUST_LINES, h, 524),
    ],
  };
}

function nedenSection(h: number): Section {
  return {
    h2: pick(
      ["Neden Karadeniz Pet Shop?", "Karadeniz Pet Shop'u Tercih Sebepleri", "Neden Komşunuzdan Sipariş Vermelisiniz?"],
      h,
      531,
    ),
    paragraphs: [pick(STORY_LINES, h, 532)],
    list: rotate(WHY_POINTS, h, 533).slice(0, 5),
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
        [`${Kp}: Önce Şunu Bilin`, `${Kp} ve Sahiplendirme`, `${Kp} Konusunda Açık Olalım`],
        h,
        541,
      ),
      paragraphs: [
        "Karadeniz Pet Shop canlı hayvan satışı yapmaz; mağazamızda sadece mama, bakım ürünü ve aksesuar yer alır.",
        pick(
          [
            "Hayatınıza bir dost katmak istiyorsanız önce barınakları ve güvenilir sahiplendirme gönüllülerini düşünün; sahiplenmek, satın almaktan çok daha doğru bir tercihtir.",
            "Yeni bir dostun en doğru kaynağı barınaklar ve sorumlu sahiplendirme ağlarıdır; siz sahiplendikten sonra mama ve bakım tarafında biz yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplendirmeyi destekliyoruz; eve gelen dostunuzun beslenme ve bakım ihtiyaçlarını Samsun içinde aynı gün kapınıza getiririz.",
          ],
          h,
          542,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve bakım ürünlerinin tümünü Karadeniz Pet Shop'tan Samsun içi aynı gün teslimatla sipariş edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${Kp} İçin Yönlendirme`, `${Kp} Hakkında Kısa Not`, `${Kp}: Açıklama`], h, 541),
      paragraphs: [
        `Karadeniz Pet Shop bir evcil hayvan ürünleri mağazasıdır; ${kwP} hizmeti vermiyoruz. Bu, bizim sunduğumuz bir mağaza hizmeti değildir.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman kişi ya da kuruluşlara başvurmanız en sağlıklısı olur; biz yalnızca süreçte gereken ürünleri sağlarız.",
            "İşin kendisi için alanında yetkin bir adrese yönelmenizi öneririz; mama, bakım ve aksesuar tarafındaki her konuda ise yanınızdayız.",
            "İlgili işi profesyonel birinden almanız gerekir; gerekli ürünleri Samsun içinde aynı gün kapınıza ulaştırmak bizim işimizdir.",
          ],
          h,
          542,
        ),
        `İhtiyaç duyacağınız ürünleri (mama, bakım malzemesi, aksesuar) Karadeniz Pet Shop'tan kapıda ödeme (nakit/kart/QR) ve Samsun içi aynı gün teslimatla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${Kp} Yerine Karadeniz Pet Shop`, `${Kp}: Bağımsız Alternatif`, `${Kp} mı, Karadeniz Pet Shop mu?`], h, 541),
      paragraphs: [
        `Karadeniz Pet Shop bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Samsun içi aynı gün teslimat ve kapıda ödeme (nakit/kart/QR) ile yerel bir alternatif olarak sunuyoruz.`,
        pick(
          [
            "Bizden sipariş verdiğinizde ürün orijinal ve faturalı gelir; bir aksilikte muhatapsız kalmak yerine doğrudan komşunuz olan bize ulaşırsınız.",
            "Fiyat araştırırken şunu unutmayın: bizden alınca ürünü kapıda görür, aynı gün kuryeyle alır ve destek için gerçek bir ekibi karşınızda bulursunuz.",
            "Samsunlu yerel bir pet shop olarak orijinal ürün, kapıda ödeme ve aynı gün teslimat sözümüzün arkasında dururuz.",
          ],
          h,
          542,
        ),
        pick(STOCK_LINES, h, 543),
      ],
    };
  }

  // --- Local-intent affirm: same-day local delivery is genuinely TRUE here. ----
  if (isLocal) {
    return {
      h2: pick(
        [`${Kp}: Samsun İçi Aynı Gün`, `${Kp} Nasıl Teslim Edilir?`, `${Kp} İçin Aynı Gün Teslimat ve Kapıda Ödeme`],
        h,
        541,
      ),
      paragraphs: [
        "Karadeniz Pet Shop, Samsun içinde aynı gün teslimat yapan yerel bir pet shoptur. Siparişiniz onaylandıktan sonra hızla hazırlanıp kendi kuryemize verilir; Atakum, İlkadım, Canik ve Tekkeköy'e aynı gün kapınıza ulaşır.",
        "Ödemeyi kapıda yaparsınız: kurye kapınıza geldiğinde nakit, kart ya da QR ile ödersiniz; her siparişte harcamanızın %5'i Para Puan olarak birikir.",
        pick(STOCK_LINES, h, 542),
      ],
    };
  }

  // --- Product / info buckets. ----------------------------------------------
  const intro = pick(
    [
      `${noun} seçerken ${animalW}'ınızın yaşını, kilosunu ve alışkanlıklarını göz önünde tutmak uzun vadede en sağlıklı yoldur; aceleyle alınan karar çoğu zaman geri döner.`,
      `Doğru ${noun}, ${animalW}'ınızın günlük konforunu doğrudan etkiler; bu nedenle moda olana değil gerçek ihtiyaca göre seçim yapmak gerekir.`,
      `${lc} ararken seçenek bolluğu içinde kaybolmak kolaydır; birkaç net ölçüte bakınca ${animalW}'ınıza en uygun ${noun} kendiliğinden belirginleşir.`,
    ],
    h,
    541,
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
        : "İçerik listesinin en başında net tanımlı bir et/protein kaynağı görmek genelde olumlu bir işarettir.";
      return {
        h2: pick([`${Kp} Nasıl Seçilir?`, `Doğru ${Kp} İçin Pratik Ölçütler`, `${Kp} Seçim Rehberi`], h, 543),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dahil ` : ""}premium ve ekonomik birçok markayı bir arada tuttuğumuzdan, kararsızsanız küçük paketle deneyip beğendiğinizde büyüğüne geçebilirsiniz; tümünü Samsun içinde aynı gün kapınıza getiririz.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayın, eskisiyle kademeli harmanlayın",
          "Suyunu her gün tazeleyin, mama kabını düzenli yıkayın",
          "Açtığınız paketi serin, kuru ve ağzı kapalı muhafaza edin",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${Kp} Seçimi ve Kullanımı`, `${Kp} Hakkında Bilmeniz Gerekenler`, `${Kp} Nasıl Kullanılır?`], h, 543),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}belirleyici üç başlık topaklaşma gücü, toz oranı ve koku kontrolüdür. Karadeniz Pet Shop'ta topaklaşan (bentonit), kristal (silika) ve doğal kum çeşitlerini bir arada bulur, Samsun içinde aynı gün kapınıza sipariş edersiniz.`,
        ],
        list: [
          "Kabın derinliğini 5–7 cm tutun, topakları her gün toplayın",
          "Haftada bir kabı tümüyle boşaltıp yıkayın",
          "Kediniz kumu benimsemezse yeni türe kademeli geçin",
        ],
      };
    }
    case "bird":
      return {
        h2: pick([`${Kp} İçin Öneriler`, `${Kp} Nasıl Seçilir?`, `${Kp} Üzerine Notlar`], h, 543),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formda kalmasında belirleyicidir. Yem, kafes ve aksesuarları bir arada sunar, Samsun içinde aynı gün kapınıza getiririz.",
        ],
        list: [
          "Yemliği düzenli temizleyin, küflenmeye fırsat tanımayın",
          "Suyu her gün değiştirin, suluğu durulayın",
          "Mineral blok ve gaga taşını eksik etmeyin",
        ],
      };
    case "collar":
      return {
        h2: pick([`${Kp} Seçerken Nelere Dikkat Edilir?`, `Doğru ${Kp} Nasıl Olmalı?`, `${Kp} Rehberi`], h, 543),
        paragraphs: [
          intro,
          "Tasma ve koşumda en kritik konu doğru bedendir: boyun ya da göğüs çevresini ölçün, altından iki parmak rahatça geçmeli. Farklı beden, malzeme ve kilit tipinde modelleri bulundururuz.",
        ],
        list: [
          "Boyun/göğüs çevresini mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) tasmayı seçin",
          "Dikişlerin ve klipsin sağlamlığını kontrol edin",
        ],
      };
    case "bed":
      return {
        h2: pick([`${Kp} Nasıl Seçilir?`, `Rahat Bir ${Kp} İçin İpuçları`, `${Kp} Seçim Notları`], h, 543),
        paragraphs: [
          intro,
          "Yatak seçerken dostunuzun uzanmış boyu, uyku pozisyonu ve yıkanabilirlik öne çıkar. Farklı boy ve dolguda, kılıfı çıkarılıp makinede yıkanabilen modeller mevcuttur.",
        ],
        list: [
          "Uzandığında rahatça sığacağı boyu seçin",
          "Kılıfı çıkarılıp yıkanabilen modelleri tercih edin",
          "Sakin, köşe bir noktaya yerleştirin",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${Kp} Seçimi`, `${Kp} Nasıl Olmalı?`, `${Kp} İçin Öneriler`], h, 543),
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
        h2: pick([`${Kp} Seçerken`, `${Kp} Hakkında`, `Doğru ${Kp} Nasıl Olur?`], h, 543),
        paragraphs: [
          intro,
          "Mama ve su kaplarında malzeme (paslanmaz çelik / seramik) ve kolay temizlik belirleyicidir. Devrilmeyen tabanlı çelik ve seramik modelleri bir arada bulursunuz.",
        ],
        list: [
          "Paslanmaz çelik ya da seramik daha hijyeniktir",
          "Kabı her gün yıkayıp biyofilm oluşumunu önleyin",
          "Devrilmeyen tabanlı modelleri seçin",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${Kp} Kullanımı`, `${Kp} İçin İpuçları`, `${Kp} Üzerine`], h, 543),
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
        h2: pick([`${Kp} Neden Önemli?`, `${Kp} Seçimi`, `${Kp} ile Daha Mutlu Bir Dost`], h, 543),
        paragraphs: [
          intro,
          "Oyuncaklar enerji atmak ve zihinsel uyarım için şarttır. Boyuna uygun, kolay parçalanmayan ve güvenli malzemeden üretilmiş ürünleri tercih edin.",
        ],
        list: [
          "Boyuna uygun, yutulmayacak oyuncak seçin",
          "Oyuncakları ara ara değiştirin, ilgisi sürsün",
          "Yıpranan oyuncağı zamanında yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${Kp} Seçerken Beden`, `${Kp} Nasıl Seçilir?`, `${Kp} Rehberi`], h, 543),
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
        h2: pick([`${Kp} Hakkında`, `${Kp} Kullanımı`, `${Kp} İçin Notlar`], h, 543),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri düzenli bakımın bir parçasıdır; ancak hiçbiri veteriner muayenesinin veya tedavisinin yerini tutmaz. Şüphedeyseniz önce veterinerinize danışın.",
        ],
        list: [
          "Ürünü etiketindeki talimata göre uygulayın",
          "Bir sağlık şüphesinde önce veterinere danışın",
          "Takviyeyi dengeli beslenmenin tamamlayıcısı olarak görün",
        ],
      };
    case "guide":
      return {
        h2: pick([`${Kp}: Kısa Bir Bakış`, `${Kp} Üzerine Notlar`, `${Kp} Hakkında`], h, 543),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok merak edilenleri Karadeniz Pet Shop olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun gününü kolaylaştırmak istiyoruz.`,
              `${lc} ile ilgili işe yarayan bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Samsun içinde aynı gün kapınıza getiriyoruz.`,
            ],
            h,
            543,
          ),
          "Takıldığınız bir nokta olursa ürün seçiminde de bize danışın; deneyimimizi seve seve paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`${Kp} İçin Yerel Adres`, `${Kp} mı Arıyorsunuz?`, `${Kp}: Samsun'un Yerel Pet Shopu`], h, 543),
        paragraphs: [
          pick(
            [
              `${lc} için Karadeniz Pet Shop'tan sipariş verin; ürünlerinizi Samsun içinde aynı gün kapınıza getiriyoruz.`,
              `${lc} deyince Karadeniz Pet Shop: geniş ürün yelpazesi, kapıda ödeme (nakit/kart/QR) ve Samsun içi aynı gün teslimat bir arada.`,
            ],
            h,
            543,
          ),
          `İster web sitemizden sepetinizi hazırlayın, ister ${PHONE} sipariş hattımızı arayın; gerisini komşunuz olarak biz hallederiz.`,
        ],
      };
    default:
      return {
        h2: `${Kp} Hakkında`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için Karadeniz Pet Shop'taki seçenekleri değerlendirebilir, emin olamadığınızda bize danışabilirsiniz; tüm siparişleri Samsun içinde aynı gün kapınıza getiririz.`,
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
      q: `Karadeniz Pet Shop üzerinden her saat sipariş verebilir miyim?`,
      a: `Online sipariş günün her saati alınır. Samsun içi aynı gün teslimat ise çalışma saatleri (${SUPPORT_HOURS}) içinde gerçekleşir; bu saatler dışında verilen siparişler ertesi gün kuryeyle yola çıkar.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `Karadeniz Pet Shop ${kwP} kapsamında canlı hayvan satıyor mu?`,
      a: "Hayır. Karadeniz Pet Shop canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunarız. Bir dost için yerel barınakları ve sahiplendirmeyi öneririz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `Karadeniz Pet Shop ${kwP} hizmeti veriyor mu?`,
      a: `Hayır, ${kwP} bizim sunduğumuz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri Samsun içinde aynı gün kapınıza getiririz.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `Karadeniz Pet Shop ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: "Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız bulunmuyor. Aynı ürünleri Samsun içi aynı gün teslimat ve kapıda ödeme (nakit/kart/QR) ile sunuyoruz.",
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${Kp} siparişi ne zaman teslim edilir?`,
      a: `Siparişiniz onaylandıktan sonra hızla hazırlanıp kendi kuryemize verilir; Samsun içinde çalışma saatleri içinde verilen siparişler aynı gün kapınıza ulaşır.`,
    },
    {
      q: `${Kp} için nasıl ödeme yapabilirim?`,
      a: `Ödemeyi kapıda yaparsınız: kurye kapınıza geldiğinde nakit, kart ya da QR ile ödersiniz; her siparişte harcamanızın %5'i Para Puan olarak hesabınıza eklenir. ${PHONE}.`,
    },
    {
      q: `${Kp} fiyatını nasıl öğrenebilirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyin ya da ${PHONE} numaralı sipariş hattımızdan teyit alın; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `Karadeniz Pet Shop Samsun içinde aynı gün teslimat yapıyor mu?`,
      a: `Evet. Karadeniz Pet Shop, ${ORIGIN} merkezli yerel pet shopunuz olarak Atakum, İlkadım, Canik ve Tekkeköy'e aynı gün kuryeyle teslimat yapar. ${PHONE}.`,
    },
  ];

  const rotated = rotate(generic, h, 551);
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
// (Mirror of the markapet-all / atakum-all local re-tag.)
const KARADENIZ_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeKaradeniz(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (KARADENIZ_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Local noise the shared engine intentionally leaves in: the source still carries
// Spanish-search autocomplete ("buscar spectrum" = "search spectrum") that would
// otherwise mint a nonsensical pet-shop page. Drop just the Spanish "buscar" cue;
// bare "spectrum" stays as a legit food-brand page.
const KARADENIZ_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of KARADENIZ_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || KARADENIZ_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeKaradeniz(kw) });
}

export const KARADENIZ_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

// Local-safe core links: every href is a SHARED generic slug already served on
// karadenizpetshop.com (verified present in the corpus), so none ever dangles.
// The seo-data integration additionally filters any link that does not resolve
// in the karadeniz slug space, so unrelated slugs can never leak.
const CORE_LINKS: { text: string; href: string }[] = [
  { text: "Kedi Maması Siparişi", href: "/kedi-mamasi-siparis" },
  { text: "Köpek Maması Siparişi", href: "/kopek-mamasi-siparis" },
  { text: "Online Pet Shop", href: "/online-petshop" },
  { text: "Kedi Kumu Siparişi", href: "/kedi-kumu-siparis" },
  { text: "Uygun Fiyat Pet Shop", href: "/uygun-fiyat-petshop" },
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
    push({ text: trTitle(sib.kw), href: `/${sib.slug}` });
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
  "Samsun İçi Aynı Gün Teslimat",
  "Atakum / İlkadım / Canik / Tekkeköy",
  "Aynı Gün Kapıda Ödeme",
  "Samsun'un Yerel Pet Shopu",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | Karadeniz Pet Shop — Sahiplendirme Rehberi`;
  if (a.cat === "retailer") return `${K} | Karadeniz Pet Shop — Bağımsız Yerel Adres`;
  if (a.cat === "service") return `${K} | Karadeniz Pet Shop — Yönlendirme Notu`;
  return `${K} | Karadeniz Pet Shop — ${pick(META_SUFFIX, h, 561)}`;
}

function metaDescFor(a: Attr, kwP: string, h: number): string {
  const lc = trCap(kwP);
  if (a.cat === "live") {
    return `${lc}: Karadeniz Pet Shop canlı hayvan satışı yapmaz; sahiplendirme için yerel barınakları öneririz. Mama ve bakım ürünlerini Samsun içinde aynı gün kapınıza getiriyoruz. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${lc}: Karadeniz Pet Shop bu hizmeti vermiyoruz; ihtiyacınız olan ürünleri Samsun içinde aynı gün kapınıza getiririz. Kapıda ödeme (nakit/kart/QR), ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${lc}: Karadeniz Pet Shop bağımsız, yerel bir pet shoptur. Aynı ürünler Samsun içi aynı gün teslimat ve kapıda ödeme ile. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${lc} mı arıyorsunuz? ${trCap(noun)} ve tüm pet ürünleri Samsun içinde aynı gün kuryeyle kapınızda. Kapıda ödeme (nakit/kart/QR), ${PHONE}.`,
      `${lc} için Karadeniz Pet Shop: geniş ürün yelpazesi, Samsun içi aynı gün teslimat ve kapıda ödeme. ${PHONE}.`,
      `${lc} — Atakum, İlkadım, Canik, Tekkeköy'e aynı gün teslimat. ${trCap(noun)} dahil yüzlerce ürün, kapıda ödeme. ${PHONE}.`,
    ],
    h,
    562,
  );
}

function buildPage(e: Ent, idx: number, related: { text: string; href: string }[]): SeoPageData {
  const { kw, slug, a } = e;
  const h = H(slug);
  const K = trTitle(kw);
  const kwP = kw;
  const Kp = trTitle(kwP);
  const isLocal = LOCAL_INTENT_RE.test(kw);
  const isAlwaysOpen = ALWAYS_OPEN_RE.test(kw);
  const regions = regionsFor(h);

  const main = mainSection(a, kwP, Kp, h, isLocal);
  const support = rotate(
    [shipSection(Kp, regions, h), nedenSection(h), siparisSection(h), bolgeSection(regions, h)],
    h,
    571,
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
    availability: "localOnly",
    title: Kp,
    metaTitle: metaTitleFor(a, Kp, h),
    metaDescription: metaDescFor(a, kwP, h),
    keywords: `${kwP}, ${kwP} aynı gün, ${kwP} kapıda ödeme, ${kwP} Samsun, ${kwP} sipariş, ${kwP} Atakum`,
    h1: pick(
      [
        `${Kp} — Karadeniz Pet Shop`,
        `${Kp} | Samsun İçi Aynı Gün Teslimat`,
        `${Kp} — Aynı Gün Kapıda Ödeme`,
      ],
      h,
      572,
    ),
    intro: [
      pick(
        [
          `${trCap(kwP)} mı arıyorsunuz? Karadeniz Pet Shop, ${ORIGIN} merkezli, mahallenizin güvenilir yerel pet shopudur; Samsun içinde aynı gün kapınıza getiriyoruz.`,
          `${trCap(kwP)} için doğru ürün ve Samsun içi aynı gün teslimat bir arada; siparişinizi gönül rahatlığıyla verin, gerisini komşunuz olarak biz halledelim.`,
          `Karadeniz Pet Shop ile ${kwP} ihtiyacınızı sipariş edin, Samsun içinde aynı gün kuryeyle kapınıza gelsin.`,
        ],
        h,
        581,
      ),
      `${pick(ORDER_LINES, h, 582)} ${pick(SHIP_LINES, h, 583)}`,
      `${pick(PAY_LINES, h, 584)} Sipariş hattımıza ${SUPPORT_HOURS} arası ulaşabilirsiniz.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 585).slice(0, 4),
      catFeature,
      `${BRAND} — ${PHONE}`,
    ],
    faq: faqFor(a, kwP, Kp, h, { isAlwaysOpen }),
    internalLinks: related,
  };
}

export const KARADENIZ_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
