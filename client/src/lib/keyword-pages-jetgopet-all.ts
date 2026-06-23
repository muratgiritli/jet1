// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for JETGO PET
// (store id "jetgopet") — a sibling corpus in the JETGO family.
//
// The JETGO pet site shares the JETGO brand word, theme and logo with
// jetgomarket.com (store "jetgo") and the JETGO shop (store "jetgoshop"). It
// cannot differentiate by brand or NAP the way atakumpetshop.com does. So the
// UNIQUENESS of this corpus vs its JETGO siblings comes ENTIRELY from the
// prose: a wholly separate phrase bank, different section archetypes/headings,
// a different intro/meta rhythm and FAQ wording, and a different rotation
// scheme — never a copy of the atakum, jetgo or jetgoshop generators. The same
// URL on each JETGO host resolves to a genuinely different article (each
// self-canonical to its own host).
//
// Classification + truthfulness reuse the shared keyword-truthfulness engine
// UNCHANGED, so live-animal / service / retailer / price intents stay safe:
//   live    → "canlı hayvan satışı yapmaz" + responsible-adoption guidance
//   service → "... hizmeti vermiyoruz" (a shop, not a service provider)
//   retailer→ "bağımsız bir işletmeyiz; resmi bir bağlantımız yok"
//   price   → never a fabricated number next to ₺/TL/lira.
//
// Brandify note: this content refers to the store ONLY by the safe brand token
// "JETGO" and to the website generically — it never writes the bare domain
// literal (brandifyFor's /jetgo/g pass would corrupt it). Canonical/og:url
// carry the real domain via the SEO layer.
//
// Consumed by seo-data.ts as a SEPARATE integration loop. Do not hand-edit.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { JETGOPET_ALL_KEYWORDS } from "./jetgopet-all-keywords";
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

const STORE_ID = "jetgopet";
const BRAND = "JETGO Pet Shop";
const PHONE = "0850 840 39 59";
const ADDR = "Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A, Atakum / Samsun";
const HOURS = "09:00–21:00";

// Samsun-wide delivery footprint (İlkadım + Canik + Atakum) — intentionally a
// DIFFERENT neighbourhood set from the Atakum-centric atakum-all corpus.
const NEIGHBORHOODS = [
  "Denizevler", "Mimarsinan", "Atakent", "Esenevler", "Aksu", "Cumhuriyet",
  "Yeşilyurt", "Körfez", "İncesu", "Taflan", "Balaç", "Çatalçam",
  "Kılıçdede", "Çiftlik", "Bahçelievler", "Hançerli", "Pazar", "Mevlana",
  "Liman", "Karşıyaka",
];
const DISTRICTS = ["Atakum", "İlkadım", "Canik"];

const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;

// ---------------------------------------------------------------------------
// Stable-hash variation helpers — deterministic per slug, but neighbouring slugs
// land on different phrasings and section orders. (Distinct salts from atakum.)
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16; h = Math.imul(h, 0x21f0aaad) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0xd35a2d97) >>> 0;
  h ^= h >>> 15;
  return h >>> 0;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[((h + Math.imul(salt, 0x7feb352d)) >>> 0) % arr.length];
}
function rotate<T>(arr: T[], h: number, salt: number): T[] {
  const n = arr.length;
  const start = ((h + Math.imul(salt, 0x846ca68b)) >>> 0) % n;
  return arr.map((_, i) => arr[(start + i) % n]);
}
function hoodsFor(h: number): string[] {
  const start = h % NEIGHBORHOODS.length;
  const out: string[] = [];
  for (let i = 0; i < 6; i++) out.push(NEIGHBORHOODS[(start + i * 4) % NEIGHBORHOODS.length]);
  return Array.from(new Set(out));
}

// ---------------------------------------------------------------------------
// Attribute → natural Turkish fragments.
// ---------------------------------------------------------------------------

function stagePhrase(stage: string): string {
  switch (stage) {
    case "yavru": return "yavru";
    case "yetişkin": return "yetişkin";
    case "yaşlı": return "ileri yaş (senior)";
    case "anne": return "gebe veya emziren anne";
    default: return "";
  }
}
function joinNice(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return items.slice(0, -1).join(", ") + " ve " + items[items.length - 1];
}

// ---------------------------------------------------------------------------
// Phrase banks (fresh JETGO Samsun voice — no overlap with atakum/jetgo copy).
// ---------------------------------------------------------------------------

const SPEED_LINES = [
  `${joinNice(DISTRICTS)} sınırları içinde verdiğiniz siparişleri, mümkün olduğunca aynı gün taze taze elinize ulaştırıyoruz.`,
  `JETGO kurye kadrosu ${joinNice(DISTRICTS)} hattında gün boyu yola çıkar; sabahki siparişiniz çoğu zaman aynı gün size kavuşur.`,
  `Vakti dar olanlar için Samsun merkezinde aynı gün teslimat var; semte göre süre oynasa da sizi bekletmeyiz.`,
  `Atakum, İlkadım ve Canik'te kuralımız aynı gün teslimat; günlerce süren kargo derdine girmeden ürün kapıya gelir.`,
];
const ORDER_LINES = [
  `Sipariş açmak gayet kolay: beğendiğinizi işaretleyin, WhatsApp'a düşün veya ${PHONE} hattını arayın; ardından bize bırakın.`,
  `Dilerseniz siteden sepetinizi doldurun, dilerseniz ${PHONE} numarasından sözlü iletin — hangisi kolayınıza gidiyorsa.`,
  `${PHONE} hattını arayarak ya da WhatsApp'a yazarak anında sipariş başlatır, adresinizi bırakıp keyfinize bakarsınız.`,
  `Tek yapmanız gereken istediğiniz ürünü bildirmek; ${PHONE} hattı ve WhatsApp ekibimiz siparişi sizin için hazırlar.`,
];
const PAY_LINES = [
  "Ödemenizi kapıda nakitle, kredi kartıyla (POS) ya da QR ile tamamlayabilirsiniz; nakit verenlere ufak bir indirim tanıyoruz.",
  "Kapıda nakit de kart da QR da geçerli; üstelik her siparişte harcamanızın %5'i Para Puan olarak hesabınıza yazılıyor.",
  "Kapıda ister kartla ister nakitle, tercih sizin; nakdi seçenlere fiyatta minik bir avantaj sağlıyoruz.",
  "Teslimatta nakit, kart ya da QR fark etmez; toplanan %5 Para Puan'ı bir sonraki alışverişinizde indirim olarak kullanırsınız.",
];
const TRUST_LINES = [
  "Rafımızdaki her ürün orijinal ve faturalı; bilhassa mamalarda son kullanma tarihini ve saklama şartlarını titizlikle takip ederiz.",
  "Yalnızca güvendiğimiz tedarikçilerle yola devam ediyoruz; gıda tarafında tazelikten asla taviz vermeyiz.",
  "Sattığımız ürünlerin hepsi orijinaldir; ambalajı açılmış ya da tarihi yaklaşmış bir ürünü rafa hiç koymayız.",
];
const STOCK_LINES = [
  `Stok gün içinde değiştiği için, istediğiniz ürünü ayırtmak adına ${PHONE} ya da WhatsApp'tan kısa bir onay almanız faydalı olur.`,
  `Bir ürün anlık tükendiyse aynı bütçeye, benzer içeriğe sahip bir alternatif sunarız; güncel durumu ${PHONE} hattından öğrenebilirsiniz.`,
  `Elimizdekini hemen öğrenmek için ${PHONE} numarasını arayın; stokta yoksa en yakın eşdeğerini sizinle beraber belirleriz.`,
];
const AREA_LINES = [
  "Samsun'un caddelerini, trafiğini ve teslimat saatlerini iyi tanıyoruz; bu da kapınıza ulaşma süremizi kısaltıyor.",
  "Her semte tek tek dağıtım yaptığımızdan güzergâhlarımız netleşti; siparişiniz kuyrukta beklemez.",
  "Yerli bir ekibiz; Samsun içinde nereye hangi saatte gidileceğini avucumuzun içi gibi biliriz.",
];
const WHY_LINES = [
  "Kocaman bir zincir değil, Samsunlu bir esnafız; her müşteriyle birebir ilgilenir, en doğru ürünü içtenlikle öneririz.",
  "Hedefimiz mahalle esnafı samimiyetinde fakat çağdaş bir pet shop olmak: hızlı teslimat, sıcak destek ve açık sözlü tavsiye.",
  "Zincir mağaza hızını yerel esnaf sıcaklığıyla buluşturuyoruz; sormaktan çekinmeyin, bilgimizi memnuniyetle aktarırız.",
];

const WHY_POINTS = [
  "Samsun içinde aynı gün kapı teslimatı",
  "Kapıda nakit, kart (POS) ve QR seçenekleri",
  "Kedi, köpek, kuş ve kemirgen için geniş ürün çeşidi",
  "Premium ile ekonomik seçenekler bir arada",
  "Orijinal ve faturalı ürün garantisi",
  "Her alışverişe %5 Para Puan iadesi",
  `Her gün ${HOURS} arasında açık sipariş hattı`,
  "Samsun'u bilen, kolay ulaşılan yerel ekip",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function teslimatSection(K: string, hoods: string[], h: number): Section {
  return {
    h2: pick(
      [
        `${K} Samsun İçi Dağıtımı`,
        `${K} Siparişiniz Kapınıza Ne Vakit Ulaşır?`,
        `${K} İçin Aynı Gün Teslimat Nasıl Yürür?`,
      ],
      h,
      101,
    ),
    paragraphs: [
      pick(SPEED_LINES, h, 102),
      `${K} için tek yapmanız gereken adresinizi iletmek; ${joinNice(DISTRICTS)} ilçelerindeki mahallelere gün içinde, dış noktalara ise gün boyu dağıtım programlıyoruz.`,
    ],
    list: hoods.map((n) => `${n}: aynı gün teslimat`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Dakikalar İçinde Sipariş", "Siparişi Nasıl Verirsiniz?", "Sipariş ve Ödeme Akışı"],
      h,
      111,
    ),
    paragraphs: [
      pick(ORDER_LINES, h, 112),
      `${pick(PAY_LINES, h, 113)} ${pick(STOCK_LINES, h, 114)}`,
    ],
  };
}

function bolgeSection(hoods: string[], h: number): Section {
  const a = hoods[0] ?? "Atakum";
  const b = hoods[1] ?? "İlkadım";
  return {
    h2: pick(
      ["Samsun'da Yerel Olmanın Getirisi", "Semtinizdeki JETGO", "Samsun'u Avucumuzun İçi Gibi Biliriz"],
      h,
      121,
    ),
    paragraphs: [
      pick(
        [
          `Başta ${a} ve ${b} olmak üzere Samsun'un pek çok semtine düzenli dağıtım yapıyoruz; bu da süreci epey hızlandırıyor.`,
          `${a} ile ${b} arasındaki adresleri ezberlemiş durumdayız; bu sayede teslimat sürelerimiz hem kısa hem tahmin edilebilir.`,
          `${a}, ${b} ve çevresine sıkça uğradığımız için JETGO kuryesi kapınıza zaman kaybetmeden varıyor.`,
        ],
        h,
        122,
      ),
      pick(AREA_LINES, h, 123),
      pick(TRUST_LINES, h, 124),
    ],
  };
}

function nedenSection(h: number): Section {
  return {
    h2: pick(
      ["Neden JETGO Pet Shop'u Seçmeli?", "JETGO'yu Ayıran Yön", "Bizi Diğerlerinden Ayıran Ne?"],
      h,
      131,
    ),
    paragraphs: [pick(WHY_LINES, h, 132)],
    list: rotate(WHY_POINTS, h, 133).slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// Category-specific MAIN section (the substantive answer to the keyword).
// ---------------------------------------------------------------------------

function mainSection(a: Attr, kw: string, K: string, h: number): Section {
  const noun = categoryNoun(a);
  const animalW = animalWord(a.animal);
  const lc = trCap(kw);

  // --- Truthfulness-sensitive buckets (always lead with the disclaimer). -----
  if (a.cat === "live") {
    return {
      h2: pick(
        [`${K}: Önce Şunu Hatırlatalım`, `${K} ve Bilinçli Sahiplenme`, `${K} İçin İçten Bir Uyarı`],
        h,
        201,
      ),
      paragraphs: [
        "JETGO Pet Shop canlı hayvan satışı yapmaz; mağazamızda sadece mama, bakım ürünü ve aksesuar yer alır.",
        pick(
          [
            "Evinize bir dost katmaya niyetliyseniz, ilk adım olarak barınakları ve güvenilir sahiplendirme gönüllülerini değerlendirin; sahiplenmek, satın almaya kıyasla çok daha vicdanlı bir tercihtir.",
            "Yeni bir can yoldaşı için en uygun kapı barınaklar ve bilinçli sahiplendirme ağlarıdır; siz sahiplendikten sonra mama ve bakım kısmında biz hep yanınızdayız.",
            "Canlı hayvan alım satımı yerine sahiplenmeyi öne çıkarıyoruz; eve katılan dostunuzun beslenme ve bakım gereksinimini Samsun içinde çabucak tamamlarız.",
          ],
          h,
          202,
        ),
        `Sahiplendiğiniz ${animalW} için gereken mama, kum, kafes, oyuncak ve bakım ürünlerinin hepsine JETGO'dan ulaşabilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${K} Konusunda Doğru Adres`, `${K} İçin Kısa Not`, `${K} Üzerine`], h, 201),
      paragraphs: [
        `JETGO Pet Shop bir evcil hayvan ürünleri mağazasıdır; ${kw} hizmeti vermiyoruz. Yani bu, bizim sunduğumuz bir hizmet değil.`,
        pick(
          [
            "Bu konuda en sağlıklısı bölgenizdeki uzman bir kişiye ya da kuruluşa başvurmanızdır; bizler yalnızca süreç boyunca lazım olacak ürünleri tedarik ederiz.",
            "Hizmetin kendisi için sahasında deneyimli birine yönelmenizi tavsiye ederiz; mama, bakım ve aksesuar tarafındaki her ihtiyaçta ise destekçinizizdir.",
            "Söz konusu hizmeti ehil bir yerden almanız gerekir; ihtiyaç duyduğunuz ürünleri Samsun içinde süratle kapınıza getirmek bizim alanımız.",
          ],
          h,
          202,
        ),
        `Lazım olacak ürünleri (mama, bakım malzemesi, aksesuar) JETGO'dan hızlı teslimatla tedarik edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${K} Yerine Samsun'da Yerel Adres`, `${K}: Yakın ve Hızlı Alternatif`, `${K} mi, Yerel Esnaf mı?`], h, 201),
      paragraphs: [
        `JETGO Pet Shop bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Samsun'da yerel, hızlı ve yüz yüze destekli bir alternatif olarak sunuyoruz.`,
        pick(
          [
            "İnternet pazaryerinde kargo beklemekle uğraşmadan, Samsun içinde ürünü aynı gün teslim alırsınız; iade veya değişimde karşınızda gerçek bir muhatap olur.",
            "Fiyat karşılaştırırken şunu hatırda tutun: bizden alışverişte kargo süresi diye bir şey yok, bir aksilik çıkarsa muhatap alacağınız bir esnaf hep var.",
            "Yerelden alışveriş; ürünü anında kullanmaya başlamak, bir sorunda yüz yüze çözüme kavuşmak ve Samsun esnafına destek olmak anlamına gelir.",
          ],
          h,
          202,
        ),
        pick(STOCK_LINES, h, 203),
      ],
    };
  }

  // --- Product / info buckets. ----------------------------------------------
  const intro = pick(
    [
      `${noun} tercih ederken ${animalW}'ınızın yaşını, kilosunu ve günlük alışkanlıklarını dikkate almak uzun vadede en doğrusudur; aceleyle yapılan seçim çoğu kez geri teper.`,
      `İsabetli bir ${noun}, ${animalW}'ınızın gün içindeki rahatını doğrudan etkiler; o yüzden trende değil, gerçek ihtiyaca göre karar vermek gerekir.`,
      `${lc} bakarken seçeneklerin çokluğunda kaybolmak kolaydır; birkaç sade ölçüte odaklandığınızda ${animalW}'ınıza en uygun ${noun} kendiliğinden belirginleşir.`,
    ],
    h,
    201,
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
        : "İçerik listesinin başında net tanımlı bir et/protein kaynağı görmek genelde iyi bir işarettir.";
      return {
        h2: pick([`${K} Nasıl Belirlenir?`, `İsabetli ${K} İçin Pratik Ölçütler`, `${K} Seçim Kılavuzu`], h, 203),
        paragraphs: [
          intro,
          `${crit} Rafımızda ${a.brand ? `${a.brand} dahil ` : ""}hem premium hem ekonomik pek çok markayı bir arada tuttuğumuz için, kararsız kaldığınızda önce küçük paketi deneyip memnun kalınca büyük boya geçebilirsiniz.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayın, eskisiyle yavaş yavaş harmanlayın",
          "Suyunu her gün yenileyin, mama kabını sık sık yıkayın",
          "Açılmış paketi serin, kuru ve ağzı kapalı biçimde muhafaza edin",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${K} Seçimi ve Kullanım Notları`, `${K} İçin Bilinmesi Gerekenler`, `${K} Nasıl Kullanılmalı?`], h, 203),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}belirleyici üç ölçüt topaklaşma performansı, toz miktarı ve koku tutma gücüdür. JETGO'da topaklanan (bentonit), kristal (silika) ve doğal kum türlerini bir arada inceleyebilirsiniz.`,
        ],
        list: [
          "Kap derinliğini 5–7 cm aralığında tutun, topakları gün aşırı değil her gün alın",
          "Haftada bir kabı tümüyle boşaltıp yıkayın",
          "Kediniz kumu benimsemezse yeni türe yavaş yavaş geçirin",
        ],
      };
    }
    case "bird":
      return {
        h2: pick([`${K} İçin Tavsiyeler`, `${K} Nasıl Belirlenir?`, `${K} Hakkında Notlar`], h, 203),
        paragraphs: [
          intro,
          "Tohum karışımının taze olması, kafesin temizliği ve mineral blok ya da gaga taşı gibi tamamlayıcılar kuşların formunu korumasında belirleyicidir. Yem, kafes ve aksesuarları tek çatı altında bulundururuz.",
        ],
        list: [
          "Yemliği aksatmadan temizleyin, küfe zemin hazırlamayın",
          "Suyu gün aşırı değil her gün tazeleyin, suluğu çalkalayın",
          "Mineral blok ve gaga taşını hiç eksik bırakmayın",
        ],
      };
    case "collar":
      return {
        h2: pick([`${K} Alırken Nelere Dikkat Etmeli?`, `İsabetli ${K} Nasıl Olur?`, `${K} Kılavuzu`], h, 203),
        paragraphs: [
          intro,
          "Tasma ve koşumda en belirleyici nokta doğru bedendir: boyun ya da göğüs çevresini ölçün, altından iki parmak rahatça geçebilmeli. JETGO'da çeşitli beden, malzeme ve kilit tipinde modeller bulabilirsiniz.",
        ],
        list: [
          "Boyun/göğüs çevresini bir mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) tasmadan yana olun",
          "Dikişlerin ve klipsin ne kadar sağlam olduğunu sınayın",
        ],
      };
    case "bed":
      return {
        h2: pick([`${K} Nasıl Belirlenir?`, `Konforlu Bir ${K} İçin İpuçları`, `${K} Seçim Notu`], h, 203),
        paragraphs: [
          intro,
          "Yatakta dostunuzun uzandığı boy, tercih ettiği uyku pozisyonu ve yıkanabilirlik öne çıkan unsurlardır. Çeşitli boy ve dolguda, kılıfı sökülüp makinede yıkanabilen modeller raflarımızda var.",
        ],
        list: [
          "Uzandığında rahatça yerleşeceği bir boy belirleyin",
          "Kılıfı çıkıp yıkanabilen modellerden yana olun",
          "Sessiz, köşede bir noktaya konumlandırın",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${K} Tercihi`, `${K} Nasıl Olmalı?`, `${K} İçin Tavsiyeler`], h, 203),
        paragraphs: [
          intro,
          "Taşıma çantası ve kafeslerinde yeterli havalandırma, kilitlenen sağlam bir kapak ve uygun boy belirleyicidir. Veteriner ziyaretleri ve yolculuklar için farklı boy ve tiplerde seçenekler sunarız.",
        ],
        list: [
          "İçinde ayakta dönebileceği bir boy seçin",
          "Kapak kilidinin güvenle kapandığını teyit edin",
          "İlk seyahatten evvel çantaya alışmasına imkân tanıyın",
        ],
      };
    case "bowl":
      return {
        h2: pick([`${K} Alırken`, `${K} Üzerine`, `İsabetli ${K} Nasıl Olur?`], h, 203),
        paragraphs: [
          intro,
          "Mama ve su kaplarında kullanılan malzeme (paslanmaz çelik ya da seramik) ve kolay temizlenebilirlik belirleyicidir. Devrilmeyen tabanlı çelik ve seramik modelleri bir arada görebilirsiniz.",
        ],
        list: [
          "Paslanmaz çelik veya seramik daha hijyenik bir tercihtir",
          "Kabı her gün yıkayarak biyofilm oluşumunu engelleyin",
          "Tabanı devrilmeyen modellerden yana olun",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${K} Nasıl Kullanılır?`, `${K} İçin Püf Noktaları`, `${K} Hakkında`], h, 203),
        paragraphs: [
          intro,
          "Bakım sırasında tüy yapısına göre seçilmiş şampuan ile doğru tarak veya fırça, tüy sağlığını ayakta tutar. Aksatılmadan yapılan tarama hem keçeleşmeyi hem de dökülmeyi azaltır.",
        ],
        list: [
          "Tüy yapısına uygun şampuan ve fırçayı belirleyin",
          "Banyodan sonra iyice durulayıp kurutun",
          "Aksatmadan yapılan tarama dökülmeyi belirgin biçimde azaltır",
        ],
      };
    case "toy":
      return {
        h2: pick([`${K} Neden Gerekli?`, `${K} Tercihi`, `${K} ile Daha Keyifli Bir Dost`], h, 203),
        paragraphs: [
          intro,
          "Oyuncaklar fazla enerjinin atılması ve zihnin uyarılması açısından vazgeçilmezdir. Boyuna uygun, kolay kolay parçalanmayan ve güvenli malzemeden üretilmiş ürünleri yeğleyin.",
        ],
        list: [
          "Boyuna uygun, yutulması imkânsız oyuncaklardan seçin",
          "Oyuncakları zaman zaman değiştirin ki ilgisi canlı kalsın",
          "Yıpranan oyuncağı vakit kaybetmeden yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${K} İçin Doğru Beden`, `${K} Nasıl Belirlenir?`, `${K} Kılavuzu`], h, 203),
        paragraphs: [
          intro,
          "Kıyafette esas olan doğru beden ve serbest hareket alanıdır; sırt uzunluğu ile göğüs çevresini ölçün. Soğuk günler için su geçirmeyen ve içi astarlı modeller işinizi fazlasıyla görür.",
        ],
        list: [
          "Sırt uzunluğu ile göğüs çevresini ölçüp bedeni netleştirin",
          "Hareketini ve tuvaletini kısıtlamayan bir modelden yana olun",
          "Soğukta su geçirmeyen/astarlı modellerden yana olun",
        ],
      };
    case "health":
      return {
        h2: pick([`${K} Üzerine`, `${K} Nasıl Kullanılır?`, `${K} İçin Notlar`], h, 203),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri rutin bakımın bir parçasıdır; ne var ki hiçbiri veteriner muayenesinin ya da tedavinin yerine geçmez. En ufak bir kuşkuda önce veterinerinize başvurun.",
        ],
        list: [
          "Ürünü etiketinde yazan talimatlar doğrultusunda uygulayın",
          "Sağlığa dair bir kuşkuda ilk olarak veterinere başvurun",
          "Takviyeyi dengeli beslenmeyi tamamlayan bir unsur olarak görün",
        ],
      };
    case "guide":
      return {
        h2: pick([`${K}: Kısa Bir Özet`, `${K} Hakkında Notlar`, `${K} Üzerine`], h, 203),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok sorulanları JETGO olarak bir araya topladık; isabetli ürün ve uygulanabilir bilgilerle dostunuzun gündelik hayatını kolaylaştırmayı amaçlıyoruz.`,
              `${lc} ile ilgili kullanışlı bilgileri tek yerde derledik; ihtiyaç duyduğunuz ürünleri ise Samsun içinde süratle kapınıza ulaştırıyoruz.`,
            ],
            h,
            203,
          ),
          "Aklınıza takılan bir konu çıkarsa ürün seçiminde de bizimle konuşun; tecrübemizi gönülden paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`Samsun'da ${K}`, `${K} mı Bakıyorsunuz?`, `${K}: Size En Yakın Nokta`], h, 203),
        paragraphs: [
          pick(
            [
              `Samsun'da ${kw} dendiğinde, ${ADDR} adresindeki JETGO Pet Shop hem fiziki mağazasıyla hem de hızlı kapı teslimatıyla yanı başınızda.`,
              `${lc} için ta uzaklara gitmeye gerek yok; JETGO geniş ürün yelpazesini her gün ${HOURS} arasında hizmetinize açıyor.`,
            ],
            h,
            203,
          ),
          `Dilerseniz mağazaya uğrayın, dilerseniz telefonla sipariş verin; Samsun içinde aynı gün teslim ediyoruz. ${PHONE}.`,
        ],
      };
    default:
      return {
        h2: `${K} Üzerine`,
        paragraphs: [
          intro,
          `Size en uygun ${noun} için JETGO'daki seçenekleri gözden geçirebilir, kararsız kaldığınızda bizimle konuşabilirsiniz.`,
        ],
      };
  }
}

// ---------------------------------------------------------------------------
// FAQ.
// ---------------------------------------------------------------------------

function faqFor(a: Attr, kw: string, K: string, h: number): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];

  if (ALWAYS_OPEN_RE.test(kw)) {
    out.push({
      q: `${K} için JETGO gece veya 7/24 hizmet veriyor mu?`,
      a: `JETGO Pet Shop 7/24 ya da gece açık değildir; her gün ${HOURS} saatleri arasında siparişlerinizi alır ve Samsun içinde aynı gün kapınıza ulaştırırız.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `JETGO, ${kw} kapsamında canlı hayvan satışı yapıyor mu?`,
      a: "Hayır. JETGO Pet Shop canlı hayvan satışı yapmaz; sadece mama, bakım ürünü ve aksesuar sunarız. Yeni bir dost için yerel barınakları ve sahiplenmeyi tavsiye ederiz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `JETGO, ${kw} hizmeti sunuyor mu?`,
      a: `Hayır, ${kw} bizim verdiğimiz bir hizmet değil; bu hizmeti vermiyoruz. Sadece süreç boyunca lazım olacak ürünleri tedarik ederiz.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `JETGO, ${a.retailer || "pazaryeri"} ile bağlantılı bir kuruluş mu?`,
      a: "Hayır. Bağımsız bir işletmeyiz; resmi bir bağlantımız yok. Aynı ürünleri Samsun'da yerel ve hızlı bir alternatif olarak sunuyoruz.",
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${K} siparişi Samsun içinde kaç saatte ulaşır?`,
      a: `${joinNice(DISTRICTS)} içinde aynı gün teslim ediyoruz; sabah verilen siparişler çoğunlukla gün içinde elinize ulaşır. Süre semte göre az çok oynayabilir.`,
    },
    {
      q: `${K} alırken kapıda ödeme seçeneği var mı?`,
      a: `Evet. Kapıda nakit, kredi kartı (POS) ve QR ile ödeme alabiliyoruz; nakit ödeyene ufak indirim, her siparişe %5 Para Puan tanıyoruz. ${PHONE}.`,
    },
    {
      q: `${K} fiyatını nereden öğrenebilirim?`,
      a: `Güncel fiyat ve kampanya bilgisi için ürünü WhatsApp'tan iletin veya ${PHONE} numarasını arayın; fiyatlar stok ve kampanyaya göre değiştiği için anlık teyit almak en sağlıklısıdır.`,
    },
    {
      q: `JETGO Pet Shop hangi adreste ve hangi saatlerde açık?`,
      a: `${ADDR} adresinde bulunuyoruz; her gün ${HOURS} arası hizmetinizdeyiz. ${PHONE} numarasından bize ulaşabilirsiniz.`,
    },
  ];

  const rotated = rotate(generic, h, 141);
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
// it live ("cins"). We do NOT touch the shared engine; we re-tag it as food HERE
// when a tight food signal (a weight unit or an explicit food brand/noun) is
// present. The gate is deliberately narrow: only the "cins" fallback path.
const JETGOPET_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeJetgopet(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (JETGOPET_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Spanish-search autocomplete noise ("buscar spectrum" = "search spectrum") that
// the shared engine intentionally leaves in (it must not blanket-ban the real
// "spectrum" food brand). Drop just the Spanish "buscar" cue.
const JETGOPET_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of JETGOPET_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || JETGOPET_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeJetgopet(kw) });
}

export const JETGOPET_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

const CORE_LINKS: { text: string; href: string }[] = [
  { text: "JETGO Pet Shop", href: "/samsun-petshop" },
  { text: "En Yakın Pet Shop", href: "/en-yakin-petshop" },
  { text: "Kapıda Ödeme", href: "/kapida-odeme-petshop" },
  { text: "Kedi Maması", href: "/kedi-mamasi" },
  { text: "Köpek Maması", href: "/kopek-mamasi" },
  { text: "Kedi Kumu", href: "/kedi-kumu" },
  { text: "Atakum Pet Shop", href: "/atakum-petshop" },
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
  "Samsun İçinde Aynı Gün Kapıda",
  "Samsun'da Süratli Kapı Teslimi",
  "Atakum, İlkadım ve Canik'e Aynı Gün",
  "Kapıda Ödeme ile Hızlı Teslim",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | JETGO Pet Shop — Bilinçli Sahiplenme`;
  if (a.cat === "retailer") return `${K} | JETGO Pet Shop — Yerel Adres`;
  if (a.cat === "service") return `${K} | JETGO Pet Shop — Kısa Bilgi Notu`;
  return `${K} | JETGO Pet Shop — ${pick(META_SUFFIX, h, 151)}`;
}

function metaDescFor(a: Attr, kw: string, K: string, h: number): string {
  if (a.cat === "live") {
    return `${trCap(kw)}: JETGO Pet Shop canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünleri Samsun'da aynı gün teslimat. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${trCap(kw)}: JETGO bu hizmeti vermiyor; ihtiyacınız olan ürünleri Samsun içinde aynı gün kapınıza getiririz. Kapıda ödeme, ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${trCap(kw)}: JETGO bağımsız bir yerel seçenektir. Aynı ürünler Samsun'da aynı gün kapıda, kapıda ödemeyle. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${trCap(kw)} mı bakıyorsunuz? ${trCap(noun)} ve aklınızdaki tüm pet ürünleri Samsun içinde aynı gün kapınızda. Kapıda ödeme, %5 Para Puan. ${PHONE}.`,
      `${trCap(kw)} denince JETGO Pet Shop: zengin ürün çeşidi, Samsun içinde aynı gün teslimat ve kapıda ödeme. ${PHONE}.`,
      `${trCap(kw)} — Atakum, İlkadım ve Canik'e süratli teslimat. ${trCap(noun)} dahil yüzlerce ürün, kapıda nakit/kart/QR. ${PHONE}.`,
    ],
    h,
    152,
  );
}

function buildPage(e: Ent, idx: number, related: { text: string; href: string }[]): SeoPageData {
  const { kw, slug, a } = e;
  const h = H(slug);
  const K = trTitle(kw);
  const hoods = hoodsFor(h);

  const main = mainSection(a, kw, K, h);
  const support = rotate(
    [teslimatSection(K, hoods, h), siparisSection(h), bolgeSection(hoods, h), nedenSection(h)],
    h,
    161,
  ).slice(0, 3);

  const catFeature =
    a.cat === "live"
      ? "Canlı hayvan satışı yapılmaz — yalnızca ürün"
      : a.cat === "service"
        ? "Hizmet verilmez — yalnızca ürün tedariki"
        : `İhtiyacınıza uygun ${categoryNoun(a)} seçenekleri`;

  return {
    slug,
    type: "keyword",
    storeId: STORE_ID,
    availability: "localOnly",
    title: K,
    metaTitle: metaTitleFor(a, K, h),
    metaDescription: metaDescFor(a, kw, K, h),
    keywords: `${kw}, ${kw} samsun, samsun ${kw}, ${kw} atakum, ${kw} kapıda ödeme, ${kw} aynı gün teslimat`,
    h1: pick(
      [
        `${K} — Samsun JETGO Pet Shop`,
        `${K} | Samsun İçinde Aynı Gün Teslimat`,
        `${K} — Atakum, İlkadım ve Canik`,
      ],
      h,
      162,
    ),
    intro: [
      pick(
        [
          `${trCap(kw)} mı bakıyorsunuz? JETGO Pet Shop, ${ADDR} adresinden Samsun'un her köşesine dağıtım yapan yerel bir pet shop.`,
          `Samsun'da ${kw} denince ilk akla gelen adreslerden biri olmayı amaçlıyoruz; aradığınızı zaman kaybetmeden kapınıza ulaştırıyoruz.`,
          `${trCap(kw)} konusunda isabetli ürün ve süratli teslimat için JETGO Pet Shop yanı başınızda.`,
        ],
        h,
        171,
      ),
      `${pick(ORDER_LINES, h, 172)} ${pick(SPEED_LINES, h, 173)}`,
      `${pick(PAY_LINES, h, 174)} JETGO Pet Shop her gün ${HOURS} saatleri arasında hizmetinizde.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 181).slice(0, 4),
      catFeature,
      `${ADDR} — ${PHONE}`,
    ],
    faq: faqFor(a, kw, K, h),
    internalLinks: related,
  };
}

export const JETGOPET_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
