// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for JETGO SHOP
// (jetgo.shop, store id "jetgoshop") — the 6th corpus in the family.
//
// jetgo.shop shares the JETGO brand word, theme and logo with jetgomarket.com
// (store "jetgo") and jetgo.pet (store "jetgopet"). It cannot differentiate by
// brand or NAP the way atakumpetshop.com does. So the UNIQUENESS of this corpus
// vs jetgomarket.com comes ENTIRELY from the prose: a wholly separate phrase
// bank, different section archetypes/headings, a different intro/meta rhythm and
// FAQ wording, and a different rotation scheme — never a copy of the atakum or
// jetgo generators. Same URL on jetgo.shop and jetgomarket.com resolves to two
// genuinely different articles (each self-canonical to its own host).
//
// Classification + truthfulness reuse the shared keyword-truthfulness engine
// UNCHANGED, so live-animal / service / retailer / price intents stay safe:
//   live    → "canlı hayvan satışı yapmaz" + responsible-adoption guidance
//   service → "... hizmeti vermiyoruz" (a shop, not a service provider)
//   retailer→ "bağımsız bir işletmeyiz; resmi bir bağlantımız yok"
//   price   → never a fabricated number next to ₺/TL/lira.
//
// Brandify note: this content NEVER writes a literal "jetgo.shop" (brandifyFor's
// /jetgo/g pass would corrupt it into "JETGO.shop"). It refers to the store by
// the safe brand token "JETGO" and to the website generically; canonical/og:url
// carry the real domain via the SEO layer.
//
// Consumed by seo-data.ts as a SEPARATE integration loop. Do not hand-edit.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { JETGOSHOP_ALL_KEYWORDS } from "./jetgoshop-all-keywords";
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

const STORE_ID = "jetgoshop";
const BRAND = "JETGO Pet Shop";
const PHONE = "0850 840 39 59";
const ADDR = "Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A, Atakum / Samsun";
const HOURS = "09:00–21:00";

// Samsun-wide delivery footprint (İlkadım + Canik + Atakum) — intentionally a
// DIFFERENT neighbourhood set from the Atakum-centric atakum-all corpus.
const NEIGHBORHOODS = [
  "Kılıçdede", "Çiftlik", "Bahçelievler", "Hançerli", "Pazar", "Mevlana",
  "Liman", "Gaziosmanpaşa", "Selahiye", "Ulugazi", "Gazi", "Karşıyaka",
  "Hasköy", "Soğuksu", "Devgeriş", "Denizevler", "Mimarsinan", "Atakent",
  "Esenevler", "Aksu",
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
  return h >>> 0;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[((h ^ (salt * 2654435761)) >>> 0) % arr.length];
}
function rotate<T>(arr: T[], h: number, salt: number): T[] {
  const n = arr.length;
  const start = ((h ^ (salt * 40503)) >>> 0) % n;
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
  `Samsun içinde — ${joinNice(DISTRICTS)} — siparişlerinizi çoğunlukla aynı gün, sıcağı sıcağına kapınıza getiriyoruz.`,
  `JETGO'nun motorlu kuryeleri ${joinNice(DISTRICTS)} hattında gün içinde teslimat yapar; sabah verdiğiniz sipariş genelde aynı gün elinizde olur.`,
  `Acelesi olan dostlar için Samsun merkezde aynı gün teslimat sunuyoruz; mahalleye göre süre değişse de bekletmiyoruz.`,
  `Atakum, İlkadım ve Canik'te aynı gün teslimat standardımız; uzayan kargo süreleriyle uğraşmadan ürün hızlıca kapınızda.`,
];
const ORDER_LINES = [
  `Sipariş vermek çok basit: ürünü seçin, WhatsApp'tan yazın ya da ${PHONE} numaralı hattımızı arayın; gerisini biz halledelim.`,
  `İster web sitemizden sepet oluşturun, ister ${PHONE} numarasından sesli söyleyin — size en kolay geleni seçin.`,
  `Telefonla (${PHONE}) ya da WhatsApp mesajıyla saniyeler içinde sipariş açabilir, adresinizi bırakıp rahatınıza bakabilirsiniz.`,
  `Aklınızdaki ürünü bize iletmeniz yeterli; ${PHONE} hattımız ve WhatsApp ekibimiz siparişinizi hemen oluşturur.`,
];
const PAY_LINES = [
  "Ödemeyi kapıda nakit, kredi kartı (POS) veya QR ile yapabilirsiniz; nakit ödeyenlere küçük bir indirim uyguluyoruz.",
  "Kapıda nakit, kart ve QR seçeneklerinin hepsi açık.",
  "Kapıda kart ya da nakit, nasıl isterseniz; nakit tercih edenler için fiyatta ufak bir avantaj var.",
  "Teslimatta nakit/kart/QR fark etmeksizin ödeyebilirsiniz.",
];
const TRUST_LINES = [
  "Raftaki ürünlerin tamamı orijinal ve faturalı; özellikle mamalarda son kullanma tarihine ve saklama koşullarına ayrı özen gösteriyoruz.",
  "Sadece güvendiğimiz tedarikçilerle çalışıyoruz; gıda gruplarında tazelik bizim için pazarlık konusu değil.",
  "Sattığımız her ürün orijinaldir; açık ya da tarihi geçmek üzere ürünü asla rafa koymayız.",
];
const STOCK_LINES = [
  `Stoklar gün içinde hareket ettiği için, aradığınız ürünü ayırtmak adına ${PHONE} veya WhatsApp'tan kısa bir teyit almanız iyi olur.`,
  `Bir ürün o an tükenmişse aynı bütçede, benzer içerikte bir alternatif öneriyoruz; güncel durumu ${PHONE} üzerinden sorabilirsiniz.`,
  `Mevcudu hızlıca öğrenmek için ${PHONE} numarasını arayın; elimizde yoksa en yakın muadilini birlikte seçeriz.`,
];
const AREA_LINES = [
  "Samsun'un sokaklarını, trafiğini ve teslimat saatlerini biliyoruz; bu da kapıya varma süremizi kısaltıyor.",
  "Mahalle mahalle teslimat yaptığımız için rotalarımız oturmuş durumda; siparişiniz sırada beklemiyor.",
  "Yerel bir ekibiz; Samsun içinde nereye, ne zaman gidileceğini ezbere biliyoruz.",
];
const WHY_LINES = [
  "Biz büyük bir zincir değil, Samsunlu bir esnafız; her müşteriyle tek tek ilgilenir, doğru ürünü dürüstçe öneririz.",
  "Amacımız mahalle bakkalı sıcaklığında ama modern bir pet shop olmak: hızlı teslimat, samimi destek ve şeffaf öneri.",
  "Bir zincir mağazanın hızını, yerel esnafın güler yüzüyle birleştiriyoruz; soru sormaktan çekinmeyin, deneyimimizi paylaşırız.",
];

const WHY_POINTS = [
  "Samsun içi aynı gün kapıda teslimat",
  "Kapıda nakit, kart (POS) ve QR ile ödeme",
  "Kedi, köpek, kuş ve kemirgen için zengin ürün yelpazesi",
  "Premium ve ekonomik seçenekler yan yana",
  "Orijinal ve faturalı ürün güvencesi",
  `Her gün ${HOURS} arası açık sipariş hattı`,
  "Samsun'u tanıyan, ulaşılabilir yerel ekip",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function teslimatSection(K: string, hoods: string[], h: number): Section {
  return {
    h2: pick(
      [
        `Samsun'da ${K} Teslimatı`,
        `${K} Siparişiniz Ne Zaman Elinizde?`,
        `Aynı Gün ${K} Teslimatı Nasıl İşliyor?`,
      ],
      h,
      101,
    ),
    paragraphs: [
      pick(SPEED_LINES, h, 102),
      `${K} için adresinizi belirtmeniz yeterli; ${joinNice(DISTRICTS)} ilçelerinin mahallelerine gün içinde, çevre noktalara ise gün boyu teslimat planlıyoruz.`,
    ],
    list: hoods.map((n) => `${n}: aynı gün teslimat`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Birkaç Dakikada Sipariş", "Nasıl Sipariş Verebilirsiniz?", "Sipariş ve Ödeme Adımları"],
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
      ["Samsun'da Yerel Avantaj", "Mahallenizdeki JETGO", "Samsun'u İyi Biliyoruz"],
      h,
      121,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere Samsun'un birçok mahallesine düzenli teslimat yapıyoruz; bu da işleri hızlandırıyor.`,
          `${a} ile ${b} arasındaki adresleri ezbere biliyoruz; bu yüzden teslimat sürelerimiz öngörülebilir ve kısa.`,
          `${a}, ${b} ve çevresine sık gittiğimiz için JETGO kuryesi kapınıza vakit kaybetmeden ulaşıyor.`,
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
      ["Neden JETGO Pet Shop?", "JETGO Farkı", "Bizi Farklı Kılan Ne?"],
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
        [`${K}: Önce Şunu Bilin`, `${K} ve Sorumlu Sahiplenme`, `${K} Hakkında Dürüst Bir Not`],
        h,
        201,
      ),
      paragraphs: [
        "JETGO Pet Shop canlı hayvan satışı yapmaz; dükkânımızda yalnızca mama, bakım ürünü ve aksesuar bulunur.",
        pick(
          [
            "Hayatınıza bir dost katmak istiyorsanız önce barınakları ve güvenilir sahiplendirme gönüllülerini düşünmenizi öneririz; sahiplenmek, satın almaktan çok daha doğru bir yol.",
            "Yeni bir dostun en doğru adresi barınaklar ve sorumlu sahiplendirme ağlarıdır; siz sahiplendikten sonra mama ve bakım tarafında biz yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplenmeyi savunuyoruz; eve gelen dostunuzun beslenme ve bakım ihtiyacını Samsun içinde hızlıca karşılarız.",
          ],
          h,
          202,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve bakım ürünlerinin tamamını JETGO'da bulabilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${K} Konusunda Yönlendirme`, `${K} İçin Kısa Bilgi`, `${K} Hakkında`], h, 201),
      paragraphs: [
        `JETGO Pet Shop bir evcil hayvan ürünleri mağazasıdır; ${kw} hizmeti vermiyoruz. Bu, bizim sunduğumuz bir hizmet değil.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman kişi ya da kuruluşlara başvurmanız en doğrusu; biz yalnızca süreçte ihtiyaç duyacağınız ürünleri sağlarız.",
            "Hizmetin kendisi için alanında profesyonel birine yönelmenizi öneririz; mama, bakım ve aksesuar tarafındaki her şeyde ise yanınızdayız.",
            "İlgili hizmeti yetkin bir adresten almanız gerekir; gereken ürünleri Samsun içinde hızlıca size ulaştırmak bizim işimiz.",
          ],
          h,
          202,
        ),
        `İhtiyaç duyacağınız ürünleri (mama, bakım malzemesi, aksesuar) JETGO'dan hızlı teslimatla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${K} Yerine Samsun'da Yerel Seçenek`, `${K}: Yerel ve Hızlı Alternatif`, `${K} mi, Mahalle Esnafı mı?`], h, 201),
      paragraphs: [
        `JETGO Pet Shop bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Samsun'da yerel, hızlı ve yüz yüze destekli bir seçenek olarak sunuyoruz.`,
        pick(
          [
            "Online pazaryerinde kargo beklemek yerine, Samsun içinde aynı gün ürünü elinize alırsınız; iade ya da değişimde de gerçek bir muhatap bulursunuz.",
            "Fiyat araştırırken şunu unutmayın: bizden alınca kargo süresi yok, bir aksilik olursa konuşacağınız bir esnaf var.",
            "Yerelden almak; ürünü hemen kullanmaya başlamak, sorun olduğunda yüz yüze çözmek ve Samsun esnafını desteklemek demek.",
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
      `${noun} seçerken ${animalW}'ınızın yaşını, kilosunu ve alışkanlıklarını gözetmek uzun vadede en sağlıklısı; acele bir seçim çoğu zaman geri döner.`,
      `Doğru ${noun}, ${animalW}'ınızın gündelik konforunu doğrudan belirler; bu yüzden moda olana değil, ihtiyaca göre karar vermek gerekir.`,
      `${lc} ararken seçenek bolluğunda boğulmak kolay; birkaç net kritere bakınca ${animalW}'ınıza en uygun ${noun} kendiliğinden öne çıkar.`,
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
        h2: pick([`${K} Nasıl Seçilir?`, `Doğru ${K} İçin Pratik Kriterler`, `${K} Seçim Rehberi`], h, 203),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dahil ` : ""}premium ve ekonomik birçok markayı bir arada bulundurduğumuz için, kararsızsanız küçük paketle deneyip beğendiğinizde büyüğüne geçebilirsiniz.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayın, eskiyle kademeli karıştırın",
          "Suyunu her gün tazeleyin, mama kabını sık yıkayın",
          "Açtığınız paketi serin, kuru ve ağzı kapalı şekilde saklayın",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${K} Seçimi ve Kullanımı`, `${K} Hakkında Bilmeniz Gerekenler`, `${K} Nasıl Kullanılır?`], h, 203),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}öne çıkan üç başlık topaklaşma gücü, toz oranı ve koku kontrolüdür. JETGO'da topaklaşan (bentonit), kristal (silika) ve doğal kum çeşitlerini yan yana bulabilirsiniz.`,
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
        h2: pick([`${K} İçin Öneriler`, `${K} Nasıl Seçilir?`, `${K} Üzerine Notlar`], h, 203),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formda kalması için önemli. Yem, kafes ve aksesuarları bir arada sunuyoruz.",
        ],
        list: [
          "Yemliği düzenli temizleyin, küflenmeye fırsat vermeyin",
          "Suyu her gün değiştirin, suluğu durulayın",
          "Mineral blok ve gaga taşını eksik etmeyin",
        ],
      };
    case "collar":
      return {
        h2: pick([`${K} Seçerken Nelere Bakmalı?`, `Doğru ${K} Nasıl Olmalı?`, `${K} Rehberi`], h, 203),
        paragraphs: [
          intro,
          "Tasma ve koşumda en kritik konu doğru beden: boyun veya göğüs çevresini ölçün, altından iki parmak rahat geçmeli. JETGO'da farklı beden, malzeme ve kilit tipinde modeller bulunur.",
        ],
        list: [
          "Boyun/göğüs çevresini mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) tasmayı tercih edin",
          "Dikişlerin ve klipsin sağlamlığını kontrol edin",
        ],
      };
    case "bed":
      return {
        h2: pick([`${K} Nasıl Seçilir?`, `Rahat Bir ${K} İçin İpuçları`, `${K} Seçim Notları`], h, 203),
        paragraphs: [
          intro,
          "Yatak seçerken dostunuzun uzanmış boyu, uyku pozisyonu ve yıkanabilirlik öne çıkar. Farklı boy ve dolguda, kılıfı çıkıp makinede yıkanabilen modeller mevcut.",
        ],
        list: [
          "Uzandığında rahatça sığacağı boyu seçin",
          "Kılıfı çıkarılıp yıkanabilen modelleri tercih edin",
          "Sakin, köşe bir noktaya yerleştirin",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${K} Seçimi`, `${K} Nasıl Olmalı?`, `${K} İçin Öneriler`], h, 203),
        paragraphs: [
          intro,
          "Taşıma çantası ve kafeslerinde havalandırma, sağlam kapak kilidi ve uygun boy önemli. Veteriner ziyareti ve seyahat için farklı boy ve tiplerde seçenekler sunuyoruz.",
        ],
        list: [
          "Ayakta dönebileceği boyu seçin",
          "Kapak kilidinin güvenli kapandığından emin olun",
          "İlk yolculuktan önce çantaya alışmasını sağlayın",
        ],
      };
    case "bowl":
      return {
        h2: pick([`${K} Seçerken`, `${K} Hakkında`, `Doğru ${K} Nasıl Olur?`], h, 203),
        paragraphs: [
          intro,
          "Mama ve su kaplarında malzeme (paslanmaz çelik / seramik) ve kolay temizlik belirleyici. Devrilmeyen tabanlı çelik ve seramik modelleri bir arada bulabilirsiniz.",
        ],
        list: [
          "Paslanmaz çelik ya da seramik daha hijyeniktir",
          "Kabı her gün yıkayıp biyofilmi önleyin",
          "Devrilmeyen tabanlı modelleri seçin",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${K} Kullanımı`, `${K} İçin İpuçları`, `${K} Üzerine`], h, 203),
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
        h2: pick([`${K} Neden Önemli?`, `${K} Seçimi`, `${K} ile Daha Mutlu Bir Dost`], h, 203),
        paragraphs: [
          intro,
          "Oyuncaklar enerjiyi atmak ve zihinsel uyarım için şart. Boyuna uygun, kolay parçalanmayan ve güvenli malzemeden ürünleri tercih edin.",
        ],
        list: [
          "Boyuna uygun, yutulmayacak oyuncak seçin",
          "Oyuncakları ara ara değiştirin, ilgisi sürsün",
          "Yıpranan oyuncağı zamanında yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${K} Seçerken Beden`, `${K} Nasıl Seçilir?`, `${K} Rehberi`], h, 203),
        paragraphs: [
          intro,
          "Kıyafette doğru beden ve hareket serbestliği esas; sırt uzunluğu ile göğüs çevresini ölçün. Soğuk havalar için su geçirmez ve içi astarlı modeller işinizi görür.",
        ],
        list: [
          "Sırt uzunluğu ve göğüs çevresini ölçüp bedene karar verin",
          "Hareketi ve tuvaletini engellemeyen modeli seçin",
          "Soğukta su geçirmez/astarlı modelleri tercih edin",
        ],
      };
    case "health":
      return {
        h2: pick([`${K} Hakkında`, `${K} Kullanımı`, `${K} İçin Notlar`], h, 203),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri düzenli bakımın bir parçası; ancak hiçbiri veteriner muayenesinin ya da tedavisinin yerini tutmaz. Şüphedeyseniz önce veterinerinize danışın.",
        ],
        list: [
          "Ürünü etiketindeki talimata göre uygulayın",
          "Bir sağlık şüphesinde önce veterinere danışın",
          "Takviyeyi dengeli beslenmenin tamamlayıcısı görün",
        ],
      };
    case "guide":
      return {
        h2: pick([`${K}: Kısa Bir Bakış`, `${K} Üzerine Notlar`, `${K} Hakkında`], h, 203),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok merak edilenleri JETGO olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun günlük yaşamını kolaylaştırmak istiyoruz.`,
              `${lc} ile ilgili işe yarar bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Samsun içinde hızlıca kapınıza getiriyoruz.`,
            ],
            h,
            203,
          ),
          "Takıldığınız bir nokta olursa ürün seçiminde de bize danışın; deneyimimizi seve seve paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`Samsun'da ${K}`, `${K} mı Arıyorsunuz?`, `${K}: En Yakın Adres`], h, 203),
        paragraphs: [
          pick(
            [
              `Samsun'da ${kw} deyince, ${ADDR} adresindeki JETGO Pet Shop hem mağaza hem de hızlı kapı teslimatıyla yanınızda.`,
              `${lc} için uzağa gitmenize gerek yok; JETGO geniş ürün yelpazesini her gün ${HOURS} arasında hizmetinize sunuyor.`,
            ],
            h,
            203,
          ),
          `İster mağazaya uğrayın, ister telefonla sipariş verin; Samsun içinde aynı gün teslim ediyoruz. ${PHONE}.`,
        ],
      };
    default:
      return {
        h2: `${K} Hakkında`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için JETGO'daki seçenekleri değerlendirebilir, emin olamadığınızda bize danışabilirsiniz.`,
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
      q: `${K} için JETGO 7/24 açık mı?`,
      a: `JETGO Pet Shop 7/24 ya da gece açık değildir; her gün ${HOURS} saatleri arasında sipariş alır ve Samsun içinde aynı gün kapınıza teslim ederiz.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `JETGO ${kw} kapsamında canlı hayvan satıyor mu?`,
      a: "Hayır. JETGO Pet Shop canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunarız. Bir dost için yerel barınakları ve sahiplendirmeyi öneririz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `JETGO ${kw} hizmeti veriyor mu?`,
      a: `Hayır, ${kw} bizim sunduğumuz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri sağlarız.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `JETGO ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: "Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız yok. Aynı ürünleri Samsun'da yerel ve hızlı bir seçenek olarak sunuyoruz.",
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${K} siparişi Samsun'da ne kadar sürede gelir?`,
      a: `${joinNice(DISTRICTS)} içinde aynı gün teslim ediyoruz; sabah verilen siparişler çoğunlukla gün içinde elinizde olur. Mahalleye göre süre biraz değişebilir.`,
    },
    {
      q: `${K} için kapıda ödeme yapabilir miyim?`,
      a: `Evet. Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilirsiniz; nakit ödeyene ufak indirim veriyoruz. ${PHONE}.`,
    },
    {
      q: `${K} fiyatını nasıl öğrenebilirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü WhatsApp'tan iletin ya da ${PHONE} numarasını arayın; fiyatlar stok ve kampanyaya göre değişebildiği için anlık teyit en doğrusu.`,
    },
    {
      q: `JETGO Pet Shop'un adresi ve saatleri nedir?`,
      a: `${ADDR} adresindeyiz, her gün ${HOURS} arası açığız. ${PHONE} numarasından bize ulaşabilirsiniz.`,
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
const JETGOSHOP_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeJetgoshop(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (JETGOSHOP_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Spanish-search autocomplete noise ("buscar spectrum" = "search spectrum") that
// the shared engine intentionally leaves in (it must not blanket-ban the real
// "spectrum" food brand). Drop just the Spanish "buscar" cue.
const JETGOSHOP_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of JETGOSHOP_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || JETGOSHOP_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeJetgoshop(kw) });
}

export const JETGOSHOP_ALL_SKIPPED_NOISE = _skippedNoise;

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
  "Samsun'a Aynı Gün Teslimat",
  "Samsun'da Hızlı Kapı Teslimatı",
  "Atakum, İlkadım, Canik'e Aynı Gün",
  "Kapıda Ödeme & Hızlı Teslimat",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | JETGO Pet Shop — Sorumlu Sahiplenme`;
  if (a.cat === "retailer") return `${K} | JETGO Pet Shop — Yerel Seçenek`;
  if (a.cat === "service") return `${K} | JETGO Pet Shop — Bilgilendirme`;
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
      `${trCap(kw)} mı arıyorsunuz? ${trCap(noun)} ve tüm pet ürünleri Samsun içinde aynı gün kapınızda. Kapıda ödeme. ${PHONE}.`,
      `${trCap(kw)} için JETGO Pet Shop: geniş ürün yelpazesi, Samsun'a aynı gün teslimat ve kapıda ödeme. ${PHONE}.`,
      `${trCap(kw)} — Atakum, İlkadım ve Canik'e hızlı teslimat. ${trCap(noun)} dahil yüzlerce ürün, kapıda nakit/kart/QR. ${PHONE}.`,
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
        `${K} — JETGO Pet Shop Samsun`,
        `${K} | Samsun'da Aynı Gün Teslimat`,
        `${K} — Atakum, İlkadım, Canik`,
      ],
      h,
      162,
    ),
    intro: [
      pick(
        [
          `${trCap(kw)} mı arıyorsunuz? JETGO Pet Shop, ${ADDR} adresinden Samsun'un dört bir yanına teslimat yapan yerel bir pet shop.`,
          `Samsun'da ${kw} deyince akla gelen adreslerden biri olmayı hedefliyoruz; aradığınızı vakit kaybetmeden kapınıza getiriyoruz.`,
          `${trCap(kw)} konusunda doğru ürün ve hızlı teslimat için JETGO Pet Shop yanınızda.`,
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

export const JETGOSHOP_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
