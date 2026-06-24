// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for SAMSUN PET SHOP
// (store id "samsunpet") — one corpus in the family, built for a TRUE LOCAL
// SAME-DAY store.
//
// Samsun Pet Shop is part of ONE Samsun-based pet shop. It delivers SAME-DAY
// within the Samsun area (Atakum, İlkadım, Canik, Tekkeköy ve çevre
// mahalleler) with KAPIDA ÖDEME (nakit / kart / QR) via kurye. Delivery
// is strictly Samsun-only and same-day; there is no nationwide shipping and no
// online-only payment requirement.
// It must read UNIQUE-by-CONTENT versus the 8 sibling corpora:
//   • the SHARED jetgomarket.com keyword pages,
//   • the jetgo-markalar / jetgo-diger pages (storeId "jetgo") that consume the
//     SAME markalar+diger keyword universe,
//   • the samsun-all / karadeniz-all / markapet-all corpora — the SIBLING local
//     brands that consume the IDENTICAL markalar+diger universe, so the same
//     slugs resolve on all of them and the prose must diverge page-by-page.
//
// THIS corpus's DISTINCT ANGLE: SAMSUN-WIDE NEIGHBORHOOD COVERAGE, RELIABILITY-
// LED — "şehrin her mahallesine aynı gün kurye", geniş Samsun ilçe + mahalle
// kapsaması (İlkadım merkez, Canik, Atakum, Tekkeköy), güvenilir teslimat.
//
// LOCAL TRUTHFULNESS is the load-bearing invariant. This is a real local store,
// so the generator AFFIRMS the local traits it genuinely offers:
//   • aynı gün teslimat (Samsun içi, çalışma saatleri içinde)
//   • kapıda ödeme — nakit / kart / QR
//   • kurye ile kapınıza / mahallenize teslim
// The raw keyword renders on every served surface — title, metaTitle, keywords
// meta, h1, intro, sections, FAQ answers, description — because the page truly
// describes what Samsun Pet Shop offers. Pages carrying a 24h/gece cue get an
// honest hours note: "online sipariş günün her saati alınır; Samsun içi aynı
// gün teslimat çalışma saatleri içinde".
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
import { SAMSUNPET_ALL_KEYWORDS } from "./samsunpet-all-keywords";
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

const STORE_ID = "samsunpet";
const BRAND = "Samsun Pet Shop";
const PHONE = "0850 840 39 59";
const ORIGIN = "Samsun";
const SUPPORT_HOURS = "09:00–18:00";

// Samsun-içi coverage footprint. A DELIBERATELY local list of Samsun ilçe +
// mahalle (geniş ilçe + bol mahalle vurgusu) in an order distinct from every
// sibling corpus so it never lines up.
const REGIONS = [
  "İlkadım", "Atakum", "Canik", "Tekkeköy", "Esenevler", "Mimarsinan", "Denizevleri",
  "Körfez", "Atakent", "Kurupelit", "Çatalçam", "Yeşilkent", "Cumhuriyet",
  "Kadıköy", "Güzelyalı", "Aydınlıkevler", "Yenimahalle", "Kılıçdede",
  "Bahçelievler", "Çiftlik",
];

const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;

// Local-intent search cues. A keyword matching this gets the dedicated isLocal
// section that AFFIRMS same-day Samsun delivery (it is genuinely true now).
const LOCAL_INTENT_RE =
  /aynı gün|ayni gun|1 saat|bir saat|2 saat|\bacil\b|hemen|anında|aninda|kurye|kapıda|kapida|mahalle|en yakın|en yakin|nöbet|nobet|gece|7\s*\/?\s*24|24 saat|eve teslim|eve servis|getir|gelsin|hafta sonu/i;

// This is a real local store, so the raw keyword renders on every served
// surface unchanged — passthrough.
function stripLocalIntent(kw: string): string {
  return kw;
}

// ---------------------------------------------------------------------------
// Stable-hash variation helpers — deterministic per slug, but neighbouring slugs
// land on different phrasings and section orders. The mixing constants
// (0x045d9f3b double-multiply finalizer) and salt range (8xx) are distinct from
// ALL sibling corpora (atakum djb2 / jetgoshop xor-FNV / atakumbiz FNV+0x2c1b3c6d
// / markapet FNV+0x5bd1e995 / samsun fmix32 6xx / karadeniz lowbias32 5xx /
// jetgopet triple32 7xx), so even a coincidental shared bank string rotates apart.
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // 0x045d9f3b double-multiply avalanche — distinct from every sibling finalizer.
  h ^= h >>> 16;
  h = Math.imul(h, 0x045d9f3b) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x045d9f3b) >>> 0;
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
// Phrase banks — local same-day "Samsun Pet Shop" voice: Samsun içi aynı gün
// kurye teslimatı, kapıda ödeme (nakit/kart/QR), şehrin her mahallesine geniş
// kapsama. No line is shared with any sibling bank (samsun / karadeniz /
// markapet in particular, which consume the identical universe), and every line
// affirms the genuine local trait: same-day Samsun delivery + door payment.
// ---------------------------------------------------------------------------

const SHIP_LINES = [
  `${BRAND}, verdiğiniz siparişi ${ORIGIN}'daki dükkânımızda özenle hazırlar ve kuryemizle aynı gün kapınıza ulaştırır; Samsun içinde mahallenize çoğunlukla saatler içinde teslim ederiz.`,
  `Siparişiniz hazırlanır hazırlanmaz kuryemiz yola çıkar; Samsun içi aynı gün teslimatla ürününüz çalışma saatleri içinde kapınızda olur.`,
  `Kuryemiz yola çıktığında size haber veririz; böylece Samsun içindeki teslimatınızı adım adım takip eder, aynı gün kapınızda teslim alırsınız.`,
  `Stokta hazır bekleyen ürünleri vakit kaybetmeden toplar, şehrin her mahallesine kendi kuryemizle aynı gün ulaştırırız.`,
];
const ORDER_LINES = [
  `Sipariş vermek son derece basit: beğendiğiniz ürünü internet sitemizde sepete ekleyin ve adresinizi girip aynı gün teslimatla siparişinizi tamamlayın.`,
  `İster online mağazamızdan sepetinizi oluşturun, ister ${PHONE} numaralı sipariş hattımızı arayın; hangisi size kolaysa onu seçin, kuryemiz aynı gün kapınızda.`,
  `${PHONE} sipariş hattımızdan bize ulaşabilir ya da sitemizden sepete ekleyebilirsiniz; talebiniz hızla hazırlanıp Samsun içinde aynı gün yola çıkar.`,
  `Almak istediğiniz ürünü iletmeniz kâfi; online mağazamız veya ${PHONE} hattımız siparişinizi alır, kuryemiz mahallenize getirir.`,
];
const PAY_LINES = [
  "Ödemeyi kapıda yaparsınız: kurye geldiğinde nakit, kart veya QR ile dilediğiniz gibi ödersiniz; isterseniz online ödeme de mümkün.",
  "Kapıda ödeme (nakit / kart / QR) ile rahatça ödersiniz.",
  "Kapıda nakit, kart ya da QR ile ödersiniz.",
  "Alışverişinizi kapıda ödeme (nakit/kart/QR) ile bitirirsiniz; Samsun içi teslimatta kurye ücretini belirli tutarın üzerinde biz üstleniriz.",
];
const TRUST_LINES = [
  "Getirdiğimiz her ürün orijinaldir ve faturalıdır; özellikle mama gruplarında son kullanma tarihini kuryeye vermeden önce tek tek gözden geçiririz.",
  "Yalnızca güvendiğimiz tedarikçilerle çalışır, kırılgan ürünleri özenle paketler, içiniz rahat olsun diye titizlikle kapınıza ulaştırırız.",
  "Tarihi yaklaşmış veya ambalajı zedelenmiş hiçbir ürünü kuryeye vermeyiz; ne aldığınızı net görerek gönül rahatlığıyla alışveriş edersiniz.",
];
const STOCK_LINES = [
  `Stok adetleri gün içinde değişebildiği için, dilediğiniz ürünü ayırtmak adına ${PHONE} numaralı hattımızdan kısa bir teyit almanızı tavsiye ederiz.`,
  `Aradığınız ürün tükendiyse benzer içerikli ve bütçenize uygun bir muadil öneririz; güncel stoğu ${PHONE} numarasından teyit edebilirsiniz.`,
  `Bir ürünün stokta olup olmadığını en pratik biçimde ${PHONE} numarasından sorabilir, yoksa size en uygun alternatifi birlikte seçebiliriz.`,
];
const REGION_LINES = [
  "Samsun'un dört bir yanına — Atakum, İlkadım, Canik, Tekkeköy ve çevre mahallelere — kuryemizle aynı gün teslimat yapıyoruz.",
  "Samsun içinde hangi mahallede olursanız olun siparişiniz aynı gün kapınızda; geniş ilçe ve mahalle kapsamamızla şehrin her köşesine ulaşıyoruz.",
  "Merkez mahallelerden çevredeki semtlere kadar Samsun'un her noktasına kendi kuryemizle aynı gün erişiyoruz.",
];
const STORY_LINES = [
  `${BRAND}, ${ORIGIN} merkezli yerel bir pet shoptur; şehrin her mahallesine aynı gün kuryeyle teslimat yapar, size en doğru ürünü içtenlikle öneririz.`,
  "Amacımız hızlı, güvenilir ve şeffaf bir yerel pet shop deneyimi sunmak: kaliteli ürün, kapıda ödeme ve Samsun içi aynı gün teslimat bir arada.",
  "Geniş ürün yelpazesini yerel alışverişin rahatlığıyla birleştiriyoruz; merak ettiğinizi sorun, bildiğimizi açık yüreklilikle anlatalım.",
];

const WHY_POINTS = [
  "Samsun'un bütün mahallelerine aynı gün kuryeyle teslimat",
  "Kapıda ödeme — nakit, kart veya QR ile",
  "Kedi, köpek, kuş, kemirgen ve akvaryum için zengin ürün yelpazesi",
  "Premium ve ekonomik markalar tek çatı altında",
  "Orijinal ve faturalı ürün güvencesi",
  "Kurye yola çıkınca bilgilendirme ve takip",
  "Belirli tutarın üzerinde ücretsiz Samsun içi teslimat",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function shipSection(Kp: string, regions: string[], h: number): Section {
  return {
    h2: pick(
      [
        `${Kp} Aynı Gün Teslim Edilir mi?`,
        `${Kp} Kapıma Ne Zaman Ulaşır?`,
        `${Kp} İçin Samsun İçi Aynı Gün Teslimat`,
      ],
      h,
      801,
    ),
    paragraphs: [
      pick(SHIP_LINES, h, 802),
      `${Kp} siparişiniz onay verir vermez özenle hazırlanıp kuryemize verilir; ${joinNice(regions)} başta olmak üzere Samsun'un tüm mahallelerine aynı gün teslimat yapıyoruz.`,
    ],
    list: regions.map((r) => `${r}: kuryemizle aynı gün teslimat`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Sipariş Nasıl Verilir?", "Birkaç Adımda Sipariş", "Sipariş ve Kapıda Ödeme Nasıl İşler?"],
      h,
      811,
    ),
    paragraphs: [
      pick(ORDER_LINES, h, 812),
      `${pick(PAY_LINES, h, 813)} ${pick(STOCK_LINES, h, 814)}`,
    ],
  };
}

function bolgeSection(regions: string[], h: number): Section {
  const a = regions[0] ?? "Atakum";
  const b = regions[1] ?? "İlkadım";
  return {
    h2: pick(
      ["Samsun'un Her Mahallesine Teslimat", "Hangi Mahallelere Gidiyoruz?", "Samsun İçi Aynı Gün Kapsama Alanımız"],
      h,
      821,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere Samsun'un tüm mahallelerine kuryemizle aynı gün düzenli teslimat gerçekleştiriyoruz.`,
          `${a} ile ${b} dâhil her mahalleye teslimat yaptığımızdan teslim sürelerimiz hem öngörülebilir hem de güvenilirdir.`,
          `${a}, ${b} ve komşu semtler dâhil Samsun'un her köşesine erişiyoruz; nerede olursanız olun siparişiniz aynı gün kapınıza gelir.`,
        ],
        h,
        822,
      ),
      pick(REGION_LINES, h, 823),
      pick(TRUST_LINES, h, 824),
    ],
  };
}

function nedenSection(h: number): Section {
  return {
    h2: pick(
      [`Neden ${BRAND}?`, `${BRAND}'u Tercih Etmenin Nedenleri`, "Neden Bizimle Alışveriş Yapmalısınız?"],
      h,
      831,
    ),
    paragraphs: [pick(STORY_LINES, h, 832)],
    list: rotate(WHY_POINTS, h, 833).slice(0, 5),
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
        [`${Kp}: Önemli Bir Not`, `${Kp} ve Sahiplenme Süreci`, `${Kp} Konusunda Açık Olalım`],
        h,
        841,
      ),
      paragraphs: [
        `${BRAND} canlı hayvan satışı yapmaz; mağazamızda yalnızca mama, bakım ürünü ve aksesuar yer alır.`,
        pick(
          [
            "Hayatınıza yeni bir dost katmak istiyorsanız önce barınaklara ve güvenilir sahiplenme gönüllülerine göz atın; sahiplenmek, satın almaktan çok daha doğru bir tercihtir.",
            "Yeni bir dostun en sağlıklı kaynağı barınaklar ve sorumlu sahiplenme ağlarıdır; siz dostunuzu sahiplendikten sonra mama ve bakım tarafında biz yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplenmeyi savunuyoruz; eve katılan dostunuzun beslenme ve bakım ihtiyaçlarını Samsun içinde aynı gün kuryeyle karşılarız.",
          ],
          h,
          842,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve tüm bakım ürünlerini ${BRAND}'tan Samsun içi aynı gün teslimatla sipariş edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${Kp} İçin Kısa Açıklama`, `${Kp} Hakkında Notumuz`, `${Kp}: Durum`], h, 841),
      paragraphs: [
        `${BRAND} bir evcil hayvan ürünleri mağazasıdır; ${kwP} hizmeti vermiyoruz. Bu, mağazamızın sunduğu bir hizmet değildir.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman bir kişiye ya da kuruluşa başvurmanız en doğrusudur; biz yalnızca süreçte gerekecek ürünleri sağlarız.",
            "İşin kendisini alanında yetkin bir adresten almanızı öneririz; mama, bakım ve aksesuar tarafındaki her ihtiyaçta ise yanınızdayız.",
            "İlgili işi profesyonel birinden almanız gerekir; gereken ürünleri Samsun içinde aynı gün kuryeyle ulaştırmaksa bizim işimiz.",
          ],
          h,
          842,
        ),
        `Gerekli ürünleri (mama, bakım malzemesi, aksesuar) ${BRAND}'tan kapıda ödeme (nakit/kart/QR) ve Samsun içi aynı gün teslimatla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${Kp} Yerine ${BRAND}`, `${Kp}: Bağımsız Bir Seçenek`, `${Kp} mı, ${BRAND} mu?`], h, 841),
      paragraphs: [
        `${BRAND} bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Samsun içi aynı gün teslimat ve kapıda ödeme (nakit/kart/QR) ile bağımsız bir alternatif olarak sunarız.`,
        pick(
          [
            "Bizden sipariş verdiğinizde ürün orijinal ve faturalı gelir; bir aksilik çıktığında muhatapsız kalmaz, doğrudan bize ulaşırsınız.",
            "Fiyat araştırırken şunu unutmayın: bizden alındığında ürün güvenle paketlenir, kurye yola çıkınca haber verilir ve destek için gerçek bir ekip yanınızdadır.",
            "Bağımsız bir yerel pet shop olarak orijinal ürün, kapıda ödeme ve Samsun içi aynı gün teslimat sözümüzün arkasındayız.",
          ],
          h,
          842,
        ),
        pick(STOCK_LINES, h, 843),
      ],
    };
  }

  // --- Local-intent affirm: same-day Samsun delivery + door payment are TRUE. -
  if (isLocal) {
    return {
      h2: pick(
        [`${Kp}: Samsun İçi Aynı Gün Teslimat`, `${Kp} Nasıl Teslim Edilir?`, `${Kp} İçin Sipariş ve Aynı Gün Teslimat`],
        h,
        841,
      ),
      paragraphs: [
        `${BRAND}, Samsun'un her mahallesine kendi kuryesiyle aynı gün teslimat yapan yerel bir pet shoptur. Siparişiniz onaylandıktan sonra hızla hazırlanıp yola çıkar; çalışma saatleri içinde aynı gün kapınızda olur.`,
        "Ödemeyi kapıda yaparsınız: kurye geldiğinde nakit, kart veya QR ile rahatça ödersiniz.",
        pick(STOCK_LINES, h, 842),
      ],
    };
  }

  // --- Product / info buckets. ----------------------------------------------
  const intro = pick(
    [
      `${noun} seçerken ${animalW}'ınızın yaşını, kilosunu ve alışkanlıklarını göz önünde bulundurmak uzun vadede en isabetli yoldur; aceleyle verilen kararlar çoğu zaman geri teper.`,
      `Doğru ${noun}, ${animalW}'ınızın gündelik konforunu doğrudan etkiler; bu yüzden moda olana göre değil gerçek ihtiyaca göre karar vermek gerekir.`,
      `${lc} ararken onlarca seçenek arasında bunalmak olağandır; birkaç net ölçüte odaklandığınızda ${animalW}'ınıza en uygun ${noun} kendiliğinden belirginleşir.`,
    ],
    h,
    841,
  );

  switch (a.cat) {
    case "food": {
      const bits: string[] = [];
      const sp = stagePhrase(a.stage);
      if (sp) bits.push(`paketin ${sp} dönemine uygun olduğunu doğrulayın`);
      if (a.flavor) bits.push(`${a.flavor} gibi sevdiği bir aromayı seçmek geçişi kolaylaştırır`);
      if (a.size) bits.push(`${a.size} gibi paketler düzenli kullanımda daha hesaplı olur`);
      const crit = bits.length
        ? `${trCap(joinNice(bits))}.`
        : "İçindekiler listesinin en başında açıkça tanımlı bir et/protein kaynağı görmek çoğunlukla iyiye işarettir.";
      return {
        h2: pick([`${Kp} Seçiminde Nelere Dikkat Etmeli?`, `Doğru ${Kp} İçin Pratik Öneriler`, `${Kp} Seçim Rehberi`], h, 843),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dâhil ` : ""}premium ve ekonomik pek çok markayı bir arada bulundurduğumuzdan, kararsızsanız küçük paketle deneyip beğendiğinizde büyük boya geçebilirsiniz; hepsini Samsun içinde aynı gün kuryeyle yollarız.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayıp eski mamayla kademeli harmanlayın",
          "Suyunu her gün tazeleyin, mama kabını düzenli olarak yıkayın",
          "Açtığınız paketi serin, kuru ve ağzı kapalı şekilde muhafaza edin",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${Kp} Nasıl Seçilir ve Kullanılır?`, `${Kp} Hakkında Bilmeniz Gerekenler`, `${Kp} Kullanım Tavsiyeleri`], h, 843),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}en belirleyici üç ölçüt topaklanma gücü, toz oranı ve koku kontrolüdür. ${BRAND}'ta topaklanan (bentonit), kristal (silika) ve doğal kum türlerini bir arada bulur, Samsun içinde aynı gün teslimatla sipariş edersiniz.`,
        ],
        list: [
          "Kap derinliğini 5–7 cm aralığında tutun, topakları her gün ayıklayın",
          "Haftada bir kabı tamamen boşaltıp yıkayın",
          "Kediniz kuma alışmazsa yeni türe kademeli olarak geçirin",
        ],
      };
    }
    case "bird":
      return {
        h2: pick([`${Kp} İçin Öneriler`, `${Kp} Nasıl Seçilmeli?`, `${Kp} Üzerine Kısa Notlar`], h, 843),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formunu korumada belirleyicidir. Yem, kafes ve aksesuarları bir arada sunar, Samsun içinde aynı gün kuryeyle göndeririz.",
        ],
        list: [
          "Yemliği düzenli temizleyip küflenmeye fırsat vermeyin",
          "Suyu her gün değiştirin, suluğu iyice durulayın",
          "Mineral blok ve gaga taşını hiç eksik bırakmayın",
        ],
      };
    case "collar":
      return {
        h2: pick([`${Kp} Seçerken Nelere Dikkat Etmeli?`, `İyi Bir ${Kp} Nasıl Olmalı?`, `${Kp} Rehberi`], h, 843),
        paragraphs: [
          intro,
          "Tasma ve koşumda en kritik nokta doğru bedendir: boyun ya da göğüs çevresini ölçün, altından iki parmak rahatça geçebilmeli. Farklı beden, malzeme ve kilit tipinde modeller bulundururuz.",
        ],
        list: [
          "Boyun ve göğüs çevresini mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) modeli seçin",
          "Dikişlerin ve klips kısmının sağlamlığını kontrol edin",
        ],
      };
    case "bed":
      return {
        h2: pick([`${Kp} Nasıl Seçilmeli?`, `Konforlu Bir ${Kp} İçin Öneriler`, `${Kp} Seçerken Notlar`], h, 843),
        paragraphs: [
          intro,
          "Yatak seçerken dostunuzun boylu boyunca uzanmış hâli, uyku pozisyonu ve yıkanabilirlik öne çıkar. Farklı boy ve dolgu seçenekleriyle, kılıfı çıkarılıp makinede yıkanabilen modeller mevcuttur.",
        ],
        list: [
          "Boylu boyunca uzandığında rahatça sığacağı boyu seçin",
          "Kılıfı sökülüp yıkanabilen modelleri yeğleyin",
          "Sakin ve köşe bir noktaya yerleştirin",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${Kp} Nasıl Seçilir?`, `İyi Bir ${Kp} Nelere Sahip Olmalı?`, `${Kp} İçin Öneriler`], h, 843),
        paragraphs: [
          intro,
          "Taşıma çantası ve kafeslerinde havalandırma, sağlam kapak kilidi ve uygun ölçü önemlidir. Veteriner ziyareti ve seyahat için farklı boy ve tipte seçenekler sunarız.",
        ],
        list: [
          "İçinde ayakta dönebileceği boyu seçin",
          "Kapak kilidinin güvenle kapandığından emin olun",
          "İlk yolculuk öncesi çantaya alışmasını sağlayın",
        ],
      };
    case "bowl":
      return {
        h2: pick([`${Kp} Seçerken Nelere Bakmalı?`, `${Kp} Üzerine`, `İyi Bir ${Kp} Nasıl Olur?`], h, 843),
        paragraphs: [
          intro,
          "Mama ve su kaplarında malzeme (paslanmaz çelik / seramik) ve kolay temizlenebilirlik belirleyicidir. Devrilmeyi önleyen tabanlı çelik ve seramik modelleri bir arada bulursunuz.",
        ],
        list: [
          "Paslanmaz çelik veya seramik daha hijyeniktir",
          "Kabı her gün yıkayarak biyofilm oluşumunu önleyin",
          "Devrilmeyi önleyen tabanlı modelleri seçin",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${Kp} Nasıl Kullanılır?`, `${Kp} İçin Pratik Öneriler`, `${Kp} Üzerine Notlar`], h, 843),
        paragraphs: [
          intro,
          "Bakımda tüy yapısına uygun şampuan ve doğru tarak/fırça seçimi tüy sağlığını destekler. Düzenli tarama hem keçeleşmeyi hem de dökülmeyi azaltır.",
        ],
        list: [
          "Tüy tipine uygun şampuan ve fırçayı belirleyin",
          "Banyo sonrası iyice durulayıp güzelce kurutun",
          "Düzenli tarama dökülmeyi belirgin biçimde azaltır",
        ],
      };
    case "toy":
      return {
        h2: pick([`${Kp} Neden Gerekli?`, `${Kp} Nasıl Seçilir?`, `${Kp} ile Daha Keyifli Bir Dost`], h, 843),
        paragraphs: [
          intro,
          "Oyuncaklar enerji atmak ve zihinsel canlılık için şarttır. Boyuna uygun, kolay parçalanmayan ve güvenli malzemeden üretilmiş ürünleri yeğleyin.",
        ],
        list: [
          "Boyuna uygun, yutulmayacak büyüklükte oyuncak seçin",
          "Oyuncakları zaman zaman değiştirip ilgisini taze tutun",
          "Yıpranmış oyuncağı zamanında yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${Kp} Seçiminde Beden`, `${Kp} Nasıl Seçilmeli?`, `${Kp} Rehberi`], h, 843),
        paragraphs: [
          intro,
          "Kıyafette doğru beden ve rahat hareket esastır; sırt uzunluğu ile göğüs çevresini ölçün. Soğuk havalar için su geçirmez ve içi astarlı modeller iş görür.",
        ],
        list: [
          "Sırt uzunluğunu ve göğüs çevresini ölçerek bedene karar verin",
          "Hareketini ve tuvaletini kısıtlamayan modeli seçin",
          "Soğuk havada su geçirmez/astarlı modelleri yeğleyin",
        ],
      };
    case "health":
      return {
        h2: pick([`${Kp} Üzerine`, `${Kp} Nasıl Kullanılır?`, `${Kp} İçin Kısa Notlar`], h, 843),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri düzenli bakımın bir parçasıdır; ancak hiçbiri veteriner muayenesinin ya da tedavisinin yerini tutmaz. Tereddüt ettiğinizde önce veterinerinize danışın.",
        ],
        list: [
          "Ürünü etiketteki talimata uygun şekilde uygulayın",
          "Bir sağlık kaygısında ilk olarak veterinere danışın",
          "Takviyeyi dengeli beslenmenin tamamlayıcısı sayın",
        ],
      };
    case "guide":
      return {
        h2: pick([`${Kp}: Kısa Bir Özet`, `${Kp} Üzerine Kısa Notlar`, `${Kp} Üzerine`], h, 843),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok merak edilenleri ${BRAND} olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun gününü kolaylaştırmayı hedefliyoruz.`,
              `${lc} hakkında işe yarar bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Samsun içinde aynı gün kuryeyle gönderiyoruz.`,
            ],
            h,
            843,
          ),
          "Aklınıza bir soru takılırsa ürün seçiminde de bize danışın; deneyimimizi memnuniyetle paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`${Kp} İçin Online Adresiniz`, `${Kp} Arayanlar İçin`, `${Kp}: Samsun'un Yerel Pet Shopu`], h, 843),
        paragraphs: [
          pick(
            [
              `${lc} için ${BRAND} online mağazasından sipariş verin; ürünlerinizi Samsun'un her mahallesine aynı gün kuryeyle yolluyoruz.`,
              `${lc} deyince ${BRAND}: geniş ürün yelpazesi, kapıda ödeme (nakit/kart/QR) ve Samsun içi aynı gün teslimat bir arada.`,
            ],
            h,
            843,
          ),
          `Dilerseniz web sitemizden sepetinizi hazırlayın, dilerseniz ${PHONE} sipariş hattımızı arayın; gerisini biz hallederiz.`,
        ],
      };
    default:
      return {
        h2: `${Kp} Üzerine`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için ${BRAND}'taki seçenekleri inceleyebilir, emin olamadığınızda bize danışabilirsiniz; tüm siparişleri Samsun içinde aynı gün kuryeyle göndeririz.`,
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
      q: `${BRAND}'tan günün her saati sipariş verebilir miyim?`,
      a: `Online sipariş günün her saati alınır; Samsun içi aynı gün teslimat ise çalışma saatleri içinde yapılır. Çalışma saatleri dışında verilen siparişler ilk teslimat saatinde yola çıkar.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `${BRAND} ${kwP} kapsamında canlı hayvan satıyor mu?`,
      a: `Hayır. ${BRAND} canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunarız. Yeni bir dost için yerel barınakları ve sahiplenmeyi öneririz.`,
    });
  } else if (a.cat === "service") {
    out.push({
      q: `${BRAND} ${kwP} hizmeti veriyor mu?`,
      a: `Hayır, ${kwP} bizim verdiğimiz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri Samsun içinde aynı gün kuryeyle yollarız.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `${BRAND} ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: `Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız yok. Aynı ürünleri Samsun içi aynı gün teslimat ve kapıda ödeme (nakit/kart/QR) ile sunarız.`,
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${Kp} siparişim ne zaman elime ulaşır?`,
      a: `Siparişiniz onaylandığı an hızla hazırlanıp kuryemize verilir; Samsun içinde çoğu mahalleye çalışma saatleri içinde aynı gün ulaşır.`,
    },
    {
      q: `${Kp} için nasıl ödeme yaparım?`,
      a: `Ödemeyi kapıda yaparsınız: kurye geldiğinde nakit, kart veya QR ile ödersiniz. ${PHONE}.`,
    },
    {
      q: `${Kp} fiyatını nasıl öğrenirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyin ya da ${PHONE} numaralı sipariş hattımızdan bilgi alın; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `${BRAND} Samsun'un her mahallesine teslimat yapıyor mu?`,
      a: `Evet. ${BRAND}, ${ORIGIN} içindeki Atakum, İlkadım, Canik ve Tekkeköy başta olmak üzere tüm mahallelere kendi kuryesiyle aynı gün teslimat yapar. ${PHONE}.`,
    },
  ];

  const rotated = rotate(generic, h, 851);
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
// (Mirror of the samsun-all / karadeniz-all / markapet-all local re-tag.)
const SAMSUNPET_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeSamsunpet(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (SAMSUNPET_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Local noise the shared engine intentionally leaves in: the source still carries
// Spanish-search autocomplete ("buscar spectrum" = "search spectrum") that would
// otherwise mint a nonsensical pet-shop page. Drop just the Spanish "buscar" cue;
// bare "spectrum" stays as a legit food-brand page.
const SAMSUNPET_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of SAMSUNPET_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || SAMSUNPET_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeSamsunpet(kw) });
}

export const SAMSUNPET_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

// Local-safe core links: every href is a SHARED generic slug already served on
// samsunpet, so none ever dangles. The seo-data integration additionally filters
// any link that does not resolve in the samsunpet slug space.
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
  "Samsun'un Tüm Mahallelerine Aynı Gün Teslimat",
  "Aynı Gün Teslimat ve Kapıda Ödeme",
  "Samsun İçi Aynı Gün Kurye",
  "Atakum / İlkadım / Canik / Tekkeköy Teslimat",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | ${BRAND} — Sorumlu Sahiplenme`;
  if (a.cat === "retailer") return `${K} | ${BRAND} — Bağımsız Yerel Mağaza`;
  if (a.cat === "service") return `${K} | ${BRAND} — Bilgilendirme`;
  return `${K} | ${BRAND} — ${pick(META_SUFFIX, h, 861)}`;
}

function metaDescFor(a: Attr, kwP: string, h: number): string {
  const lc = trCap(kwP);
  if (a.cat === "live") {
    return `${lc}: ${BRAND} canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünlerini Samsun içinde aynı gün kuryeyle yolluyoruz. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${lc}: ${BRAND} bu hizmeti vermiyoruz; ihtiyacınız olan ürünleri Samsun içinde aynı gün kuryeyle göndeririz. Kapıda ödeme (nakit/kart/QR), ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${lc}: ${BRAND} bağımsız bir yerel pet shoptur. Aynı ürünler Samsun içi aynı gün teslimat ve kapıda ödemeyle. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${lc} mı arıyorsunuz? ${trCap(noun)} ve tüm evcil hayvan ürünleri Samsun'un her mahallesine aynı gün kuryeyle kapınıza gelir. Kapıda ödeme, ${PHONE}.`,
      `${lc} için ${BRAND}: geniş ürün yelpazesi, Samsun içi aynı gün teslimat ve kapıda ödeme (nakit/kart/QR) bir arada. ${PHONE}.`,
      `${lc} — Samsun'un her mahallesine aynı gün kurye. ${trCap(noun)} dâhil yüzlerce ürün, kapıda ödeme. ${PHONE}.`,
    ],
    h,
    862,
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
    871,
  ).slice(0, 3);

  const catFeature =
    a.cat === "live"
      ? "Canlı hayvan satışı yapılmaz — yalnızca ürün"
      : a.cat === "service"
        ? "Hizmet sunulmaz — yalnızca ürün tedariği"
        : `İhtiyacınıza uygun ${categoryNoun(a)} çeşitleri`;

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
        `${Kp} — ${BRAND}`,
        `${BRAND} ile ${Kp}`,
        `${Kp} | ${BRAND} Samsun İçi Aynı Gün Teslimat`,
      ],
      h,
      872,
    ),
    intro: [
      pick(
        [
          `${trCap(kwP)} mı arıyorsunuz? ${BRAND}, ${ORIGIN} merkezli, şehrin her mahallesine kuryesiyle aynı gün teslimat yapan yerel bir pet shoptur.`,
          `${trCap(kwP)} için doğru ürün ve Samsun içi aynı gün teslimat bir arada; siparişinizi gönül rahatlığıyla verin, gerisini bize bırakın.`,
          `${BRAND} ile ${kwP} ihtiyacınızı sipariş edin, Samsun'un her köşesine aynı gün kuryeyle kapınıza ulaşsın.`,
        ],
        h,
        881,
      ),
      `${pick(ORDER_LINES, h, 882)} ${pick(SHIP_LINES, h, 883)}`,
      `${pick(PAY_LINES, h, 884)} Sipariş hattımıza ${SUPPORT_HOURS} saatleri arasında ulaşabilirsiniz.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 885).slice(0, 4),
      catFeature,
      `${BRAND} — ${PHONE}`,
    ],
    faq: faqFor(a, kwP, Kp, h, { isAlwaysOpen }),
    internalLinks: related,
  };
}

export const SAMSUNPET_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
