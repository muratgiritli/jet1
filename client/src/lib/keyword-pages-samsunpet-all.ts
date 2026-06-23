// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for SAMSUN PET SHOP
// (store id "samsunpet") — the 11th corpus in the family and the FOURTH built
// for a CARGO store.
//
// Samsun Pet Shop is a Türkiye-geneli (national) online pet shop that ships from
// a Samsun-based warehouse via contracted cargo, with ONLINE-ONLY card payment.
// It must read UNIQUE-by-CONTENT versus:
//   • the SHARED jetgomarket.com keyword pages,
//   • the jetgo-markalar / jetgo-diger pages (storeId "jetgo", LOCAL voice) that
//     consume the SAME markalar+diger keyword universe,
//   • the samsun-all / karadeniz-all / markapet-all corpora — the SIBLING cargo
//     brands that consume the IDENTICAL markalar+diger universe, so the same
//     slugs resolve on all of them and the prose must diverge page-by-page.
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
// uses a local-intent-STRIPPED label so the page describes only what Samsun Pet
// Shop actually offers: online order + güvenli kart ödemesi + Türkiye geneli
// anlaşmalı kargo. Pages carrying a 24h/gece cue get a truthful "online sipariş
// 7/24, fiziksel mağaza yok" disclaimer.
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

// Türkiye-geneli coverage footprint. A DELIBERATELY cargo-flavoured list of
// provinces (a Marmara / Ege / Karadeniz weighting, NOT Atakum neighbourhoods)
// in an order distinct from every sibling corpus so it never lines up.
const REGIONS = [
  "İstanbul", "İzmir", "Ankara", "Kocaeli", "Bursa", "Antalya", "Muğla",
  "Aydın", "Manisa", "Balıkesir", "Tekirdağ", "Sakarya", "Samsun", "Ordu",
  "Giresun", "Rize", "Tokat", "Çorum", "Amasya", "Sinop",
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
// Phrase banks — fresh cargo "Samsun Pet Shop" voice: Türkiye geneli anlaşmalı
// kargo, güvenli online ödeme. No line is shared with any sibling bank (samsun /
// karadeniz / markapet in particular, which consume the identical universe), and
// NONE affirms a local trait (same-day / door-payment / courier / local presence).
// ---------------------------------------------------------------------------

const SHIP_LINES = [
  `${BRAND}, verdiğiniz siparişi ${ORIGIN}'daki depomuzda özenle toplar ve anlaşmalı kargoya teslim eder; gönderiniz yola çıktıktan sonra illerin çoğuna ortalama 1–3 iş gününde varır.`,
  `Paketiniz sağlam malzemeyle hazırlanıp güvenilir kargo firmamıza bırakılır; ülke genelinde ortalama teslim süresi çoğunlukla 1–3 iş günü arasında değişir.`,
  `Gönderiniz depodan ayrılır ayrılmaz kargo takip numaranız tarafınıza iletilir; böylece paketinizi yola çıktığı andan adresinize varana dek izleyebilirsiniz.`,
  `Stokta hazır bekleyen ürünleri vakit kaybetmeden hazırlar, 81 ilin tamamına anlaşmalı kargo ağımızla ulaştırırız.`,
];
const ORDER_LINES = [
  `Sipariş vermek son derece basit: beğendiğiniz ürünü internet sitemizde sepete ekleyin ve güvenli online ödeme adımıyla alışverişinizi tamamlayın.`,
  `İster online mağazamızdan sepetinizi oluşturun, ister ${PHONE} numaralı sipariş hattımızı arayın; hangisi size kolaysa onu seçin.`,
  `${PHONE} sipariş hattımızdan bize ulaşabilir ya da sitemizden sepete ekleyebilirsiniz; talebiniz hızla hazırlığa alınır.`,
  `Almak istediğiniz ürünü iletmeniz kâfi; online mağazamız veya ${PHONE} hattımız siparişinizi vakit kaybetmeden oluşturur.`,
];
const PAY_LINES = [
  "Ödemeyi tamamen internet üzerinden alırız: kredi ya da banka kartınızla 3D Secure korumalı altyapıda güvenle işlem görürsünüz.",
  "Kartınızla güvenli online ödeme yaparsınız; her alışverişte ödediğiniz tutarın %5'i Para Puan olarak hesabınıza yansır.",
  "Güvenli online ödemeyle kartınızdan ödersiniz; biriktirdiğiniz %5 Para Puan'ı bir sonraki alışverişinizde indirim olarak kullanırsınız.",
  "Alışverişinizi güvenli online ödeme ile bitirirsiniz; belirli tutarı aşan siparişlerde kargo ücretini biz üstleniriz.",
];
const TRUST_LINES = [
  "Gönderdiğimiz her ürün orijinaldir ve faturalıdır; özellikle mama gruplarında son kullanma tarihini koliye koymadan önce tek tek gözden geçiririz.",
  "Yalnızca güvendiğimiz tedarikçilerle çalışır, kırılgan ürünleri darbeye karşı çift kat korur, içiniz rahat olsun diye titizlikle yola çıkarırız.",
  "Tarihi yaklaşmış veya ambalajı zedelenmiş hiçbir ürünü kargoya vermeyiz; ne aldığınızı net görerek gönül rahatlığıyla alışveriş edersiniz.",
];
const STOCK_LINES = [
  `Stok adetleri gün içinde değişebildiği için, dilediğiniz ürünü ayırtmak adına ${PHONE} numaralı hattımızdan kısa bir teyit almanızı tavsiye ederiz.`,
  `Aradığınız ürün tükendiyse benzer içerikli ve bütçenize uygun bir muadil öneririz; güncel stoğu ${PHONE} numarasından teyit edebilirsiniz.`,
  `Bir ürünün stokta olup olmadığını en pratik biçimde ${PHONE} numarasından sorabilir, yoksa size en uygun alternatifi birlikte seçebiliriz.`,
];
const REGION_LINES = [
  "Ülkenin dört bir yanına — İstanbul, İzmir, Ankara, Bursa, Antalya ve geri kalan tüm illere — anlaşmalı kargoyla gönderim yapıyoruz.",
  "Hangi şehirde olursanız olun paketiniz adresinize ulaşır; Türkiye geneli kargo ağımız 81 ilin tamamını kapsıyor.",
  "Metropollerden en uzak ilçelere kadar Türkiye'nin her noktasına güvenli kargoyla erişiyoruz.",
];
const STORY_LINES = [
  `${BRAND}, ${ORIGIN} merkezli bir işletme olsa da Türkiye'nin tamamına gönderim yapan bir online pet shoptur; size en doğru ürünü içtenlikle öneririz.`,
  "Amacımız hızlı, güvenilir ve şeffaf bir online pet shop deneyimi sunmak: kaliteli ürün, güvenli ödeme ve Türkiye geneli kargo bir arada.",
  "Geniş ürün yelpazesini online alışverişin rahatlığıyla birleştiriyoruz; merak ettiğinizi sorun, bildiğimizi açık yüreklilikle anlatalım.",
];

const WHY_POINTS = [
  "Türkiye'nin bütün illerine anlaşmalı kargoyla gönderim",
  "3D Secure korumalı güvenli online kart ödemesi",
  "Kedi, köpek, kuş, kemirgen ve akvaryum için zengin ürün yelpazesi",
  "Premium ve ekonomik markalar tek çatı altında",
  "Orijinal ve faturalı ürün güvencesi",
  "Her siparişte %5 Para Puan kazanımı",
  "Kargo takip numarasıyla gönderini adım adım izleme",
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
        `${Kp} Kaç İş Gününde Teslim Edilir?`,
        `${Kp} Adresime Ne Zaman Ulaşır?`,
        `${Kp} İçin Türkiye Geneli Kargo`,
      ],
      h,
      801,
    ),
    paragraphs: [
      pick(SHIP_LINES, h, 802),
      `${Kp} siparişiniz onay verir vermez özenle paketlenip anlaşmalı kargoya teslim edilir; ${joinNice(regions)} başta olmak üzere Türkiye'nin tüm illerine gönderim sağlıyoruz.`,
    ],
    list: regions.map((r) => `${r}: anlaşmalı kargoyla 1–3 iş günü`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Online Sipariş Nasıl Verilir?", "Birkaç Adımda Online Sipariş", "Sipariş ve Güvenli Ödeme Nasıl İşler?"],
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
  const a = regions[0] ?? "İstanbul";
  const b = regions[1] ?? "Ankara";
  return {
    h2: pick(
      ["Türkiye'nin Tamamına Gönderim", "Kargo Hangi İllere Gidiyor?", "81 İl Kargo Ağımız"],
      h,
      821,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere 81 ilin tamamına anlaşmalı kargoyla düzenli gönderim gerçekleştiriyoruz.`,
          `${a} ile ${b} dâhil her ile kargo gönderdiğimizden teslim sürelerimiz hem öngörülebilir hem de güvenilirdir.`,
          `${a}, ${b} ve komşu iller dâhil Türkiye'nin her köşesine erişiyoruz; nerede olursanız olun siparişiniz adresinize dek gelir.`,
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
            "Canlı hayvan ticareti yerine sahiplenmeyi savunuyoruz; eve katılan dostunuzun beslenme ve bakım ihtiyaçlarını Türkiye'nin her yerine kargoyla karşılarız.",
          ],
          h,
          842,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve tüm bakım ürünlerini ${BRAND}'tan Türkiye geneli kargoyla sipariş edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${Kp} İçin Kısa Açıklama`, `${Kp} Hakkında Notumuz`, `${Kp}: Durum`], h, 841),
      paragraphs: [
        `${BRAND} bir online evcil hayvan ürünleri mağazasıdır; ${kwP} hizmeti vermiyoruz. Bu, mağazamızın sunduğu bir hizmet değildir.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman bir kişiye ya da kuruluşa başvurmanız en doğrusudur; biz yalnızca süreçte gerekecek ürünleri sağlarız.",
            "İşin kendisini alanında yetkin bir adresten almanızı öneririz; mama, bakım ve aksesuar tarafındaki her ihtiyaçta ise yanınızdayız.",
            "İlgili işi profesyonel birinden almanız gerekir; gereken ürünleri Türkiye'nin her yerine kargoyla ulaştırmaksa bizim işimiz.",
          ],
          h,
          842,
        ),
        `Gerekli ürünleri (mama, bakım malzemesi, aksesuar) ${BRAND}'tan güvenli online ödeme ve Türkiye geneli kargoyla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${Kp} Yerine ${BRAND}`, `${Kp}: Bağımsız Bir Seçenek`, `${Kp} mı, ${BRAND} mu?`], h, 841),
      paragraphs: [
        `${BRAND} bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Türkiye geneli kargo ve güvenli online ödemeyle bağımsız bir alternatif olarak sunarız.`,
        pick(
          [
            "Bizden sipariş verdiğinizde ürün orijinal ve faturalı gelir; bir aksilik çıktığında muhatapsız kalmaz, doğrudan bize ulaşırsınız.",
            "Fiyat araştırırken şunu unutmayın: bizden alındığında ürün güvenle paketlenir, kargo takibi iletilir ve destek için gerçek bir ekip yanınızdadır.",
            "Bağımsız bir online pet shop olarak orijinal ürün, güvenli ödeme ve Türkiye geneli kargo sözümüzün arkasındayız.",
          ],
          h,
          842,
        ),
        pick(STOCK_LINES, h, 843),
      ],
    };
  }

  // --- Local-intent reframe: never affirm same-day/door-payment/local pickup. -
  if (isLocal) {
    return {
      h2: pick(
        [`${Kp}: Türkiye Geneline Gönderim`, `${Kp} Nasıl Kargolanır?`, `${Kp} İçin Online Sipariş ve Teslimat`],
        h,
        841,
      ),
      paragraphs: [
        `${BRAND}, Türkiye'nin her yerine anlaşmalı kargoyla gönderim yapan bir online pet shoptur. Siparişiniz onaylandıktan sonra hızla hazırlanıp kargoya verilir; çoğu adrese 1–3 iş günü içinde ulaşır.`,
        "Ödemeyi güvenli online altyapımız üzerinden kredi veya banka kartınızla yaparsınız; harcadığınız tutarın %5'i her seferinde Para Puan olarak hesabınıza eklenir.",
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
          `${crit} ${a.brand ? `${a.brand} dâhil ` : ""}premium ve ekonomik pek çok markayı bir arada bulundurduğumuzdan, kararsızsanız küçük paketle deneyip beğendiğinizde büyük boya geçebilirsiniz; hepsini Türkiye geneli kargoyla yollarız.`,
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
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}en belirleyici üç ölçüt topaklanma gücü, toz oranı ve koku kontrolüdür. ${BRAND}'ta topaklanan (bentonit), kristal (silika) ve doğal kum türlerini bir arada bulur, Türkiye'nin her yerine kargoyla sipariş edersiniz.`,
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
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formunu korumada belirleyicidir. Yem, kafes ve aksesuarları bir arada sunar, Türkiye geneli kargoyla göndeririz.",
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
              `${lc} hakkında işe yarar bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Türkiye'nin her yerine kargoyla gönderiyoruz.`,
            ],
            h,
            843,
          ),
          "Aklınıza bir soru takılırsa ürün seçiminde de bize danışın; deneyimimizi memnuniyetle paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`${Kp} İçin Online Adresiniz`, `${Kp} Arayanlar İçin`, `${Kp}: Türkiye'ye Online Pet Shop`], h, 843),
        paragraphs: [
          pick(
            [
              `${lc} için ${BRAND} online mağazasından sipariş verin; ürünlerinizi Türkiye'nin her yerine anlaşmalı kargoyla yolluyoruz.`,
              `${lc} deyince ${BRAND}: geniş ürün yelpazesi, güvenli online ödeme ve Türkiye geneli kargo bir arada.`,
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
          `İhtiyacınıza en uygun ${noun} için ${BRAND}'taki seçenekleri inceleyebilir, emin olamadığınızda bize danışabilirsiniz; tüm siparişleri Türkiye geneli kargoyla göndeririz.`,
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
      a: `Online mağazamız gün boyu siparişe açıktır. Verdiğiniz siparişler iş günlerinde toplanıp anlaşmalı kargoya teslim edilir; fiziksel bir mağaza işletmiyoruz.`,
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
      a: `Hayır, ${kwP} bizim verdiğimiz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri Türkiye geneli kargoyla yollarız.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `${BRAND} ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: `Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız yok. Aynı ürünleri Türkiye geneli kargo ve güvenli online ödemeyle sunarız.`,
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${Kp} siparişi kaç günde elime ulaşır?`,
      a: `Siparişiniz onaylandığı an hızla hazırlanıp anlaşmalı kargoya teslim edilir; Türkiye genelinde çoğu adrese 1–3 iş günü içinde varır.`,
    },
    {
      q: `${Kp} için nasıl ödeme yaparım?`,
      a: `Ödemeyi güvenli online altyapımız üzerinden kredi ya da banka kartınızla yaparsınız; her siparişte harcadığınız tutarın %5'i Para Puan olarak hesabınıza eklenir. ${PHONE}.`,
    },
    {
      q: `${Kp} fiyatını nasıl öğrenirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyin ya da ${PHONE} numaralı sipariş hattımızdan bilgi alın; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `${BRAND} Türkiye'nin her yerine kargo gönderiyor mu?`,
      a: `Evet. ${BRAND}, ${ORIGIN} merkezli deposundan Türkiye'nin her iline anlaşmalı kargoyla gönderim yapar. ${PHONE}.`,
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

// Cargo-safe core links: every href is a SHARED cargoOnly slug already served on
// samsunpet (verified present in the cargo corpus), so none ever dangles. The
// seo-data integration additionally filters any link that does not resolve in the
// samsunpet slug space, so generic localOnly slugs can never leak.
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
  "Türkiye'nin Tüm İllerine Anlaşmalı Kargo",
  "Online Sipariş ve Güvenli Kargo",
  "Ülke Geneli Güvenli Gönderim",
  "81 İle Kargo Avantajı",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | ${BRAND} — Sorumlu Sahiplenme`;
  if (a.cat === "retailer") return `${K} | ${BRAND} — Bağımsız Online Mağaza`;
  if (a.cat === "service") return `${K} | ${BRAND} — Bilgilendirme`;
  return `${K} | ${BRAND} — ${pick(META_SUFFIX, h, 861)}`;
}

function metaDescFor(a: Attr, kwP: string, h: number): string {
  const lc = trCap(kwP);
  if (a.cat === "live") {
    return `${lc}: ${BRAND} canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünlerini Türkiye'nin her yerine kargoyla yolluyoruz. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${lc}: ${BRAND} bu hizmeti vermiyoruz; ihtiyacınız olan ürünleri Türkiye'nin her yerine kargoyla göndeririz. Güvenli online ödeme, ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${lc}: ${BRAND} bağımsız bir online pet shoptur. Aynı ürünler Türkiye geneli kargo ve güvenli online ödemeyle. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${lc} mı arıyorsunuz? ${trCap(noun)} ve tüm evcil hayvan ürünleri Türkiye'nin her köşesine güvenli kargoyla adresinize gelir. Online ödeme, ${PHONE}.`,
      `${lc} için ${BRAND}: geniş ürün yelpazesi, Türkiye geneli kargo ve güvenli online ödeme bir arada. ${PHONE}.`,
      `${lc} — Türkiye'nin her iline anlaşmalı kargo. ${trCap(noun)} dâhil yüzlerce ürün, güvenli kart ödemesi. ${PHONE}.`,
    ],
    h,
    862,
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
    availability: "cargoOnly",
    title: Kp,
    metaTitle: metaTitleFor(a, Kp, h),
    metaDescription: metaDescFor(a, kwP, h),
    keywords: `${kwP}, ${kwP} kargo, kargo ile ${kwP}, ${kwP} türkiye geneli, ${kwP} online sipariş, ${kwP} hızlı kargo`,
    h1: pick(
      [
        `${Kp} — ${BRAND}`,
        `${BRAND} ile ${Kp}`,
        `${Kp} | ${BRAND} Türkiye Geneli Kargo`,
      ],
      h,
      872,
    ),
    intro: [
      pick(
        [
          `${trCap(kwP)} mı arıyorsunuz? ${BRAND}, ${ORIGIN} merkezli deposundan Türkiye'nin her yerine anlaşmalı kargoyla gönderim yapan bir online pet shoptur.`,
          `${trCap(kwP)} için doğru ürün ve Türkiye geneli güvenli kargo bir arada; siparişinizi gönül rahatlığıyla verin, gerisini bize bırakın.`,
          `${BRAND} ile ${kwP} ihtiyacınızı online sipariş edin, Türkiye'nin her köşesine kargoyla adresinize ulaşsın.`,
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
