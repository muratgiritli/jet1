// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for ATAKUM PET
// (atakum.biz, store id "atakumbiz") — the 7th corpus in the family.
//
// atakum.biz is a LOCAL same-day storefront that shares the "Atakum Pet" brand
// WORD with the cargo `samsun` store (atakumpet.com) but is its OWN store. Its
// selling angle is the fastest one in the family: "Atakum içinde 1 saatte,
// İlkadım / Canik / Tekkeköy'e aynı gün". It must read UNIQUE-by-CONTENT versus
//   • the SHARED jetgomarket.com keyword pages,
//   • the atakum-all corpus (atakumpetshop.com), AND
//   • the jetgoshop-all corpus (jetgo.shop).
//
// Distinctness comes ENTIRELY from this generator: a different brand token
// ("Atakum Pet", not "Atakum Pet Shop" / "JETGO Pet Shop"), a different hash +
// salt scheme, a different Atakum neighbourhood set, and wholly fresh phrase
// banks / headings / meta / FAQ. The facts (NAP, 1-saat angle, the three nearby
// districts) are necessarily shared with atakum, so the uniqueness invariant is
// on the PROSE, never the facts.
//
// Classification + truthfulness reuse the shared keyword-truthfulness engine,
// so live-animal / service / retailer / price intents are framed safely:
//   live    → "canlı hayvan satışı yapmaz" + responsible-adoption guidance
//   service → "... hizmeti vermiyoruz" (a shop, not a service provider)
//   retailer→ "bağımsız bir işletmeyiz; resmi bir bağlantımız yok"
//   price   → never a fabricated number next to ₺/TL/lira.
//
// Consumed by seo-data.ts as a SEPARATE integration loop. Do not hand-edit.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { ATAKUMBIZ_ALL_KEYWORDS } from "./atakumbiz-all-keywords";
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

const STORE_ID = "atakumbiz";
const BRAND = "Atakum Pet";
const PHONE = "0850 840 39 59";
const ADDR = "Atatürk 3. Kısım Bulvarı No:113, Atakum / Samsun";
const HOURS = "09:00–21:00";

// Atakum-first delivery footprint: 1 saatte Atakum içi, aynı gün üç komşu ilçe.
// A DELIBERATELY different Atakum neighbourhood set (coast + campus + west)
// from the atakum-all corpus, so the mahalle lists never line up.
const NEIGHBORHOODS = [
  "Kurupelit", "Çamlıca", "Mevlana", "İstiklal", "Büyükoyumca", "Küçükoyumca",
  "Çobanlı", "Yeşildere", "Denizevleri", "Güzelyalı", "Cumhuriyet", "Atakent",
  "Mimar Sinan", "Esenevler", "Taflan", "İncesu", "Aksu", "Balaç",
  "Körfez", "Kamalı",
];
const NEAR_DISTRICTS = ["İlkadım", "Canik", "Tekkeköy"];

const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;

// ---------------------------------------------------------------------------
// Stable-hash variation helpers — deterministic per slug, but neighbouring
// slugs land on different phrasings and section orders. The mixing constants and
// salt range are distinct from BOTH sibling corpora (atakum djb2 / jetgoshop
// xor-FNV), so even a coincidental shared bank string would still rotate apart.
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // Extra avalanche so the value distribution differs from the plain-FNV sibling.
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d) >>> 0;
  h ^= h >>> 12;
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
function hoodsFor(h: number): string[] {
  const start = h % NEIGHBORHOODS.length;
  const out: string[] = [];
  for (let i = 0; i < 6; i++) out.push(NEIGHBORHOODS[(start + i * 5) % NEIGHBORHOODS.length]);
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
// Phrase banks — fresh "Atakum Pet" voice: komşu esnaf tonu, 1-saat vurgusu.
// No line is shared with the atakum-all or jetgoshop-all banks.
// ---------------------------------------------------------------------------

const SPEED_LINES = [
  `Atakum'un içindeyseniz siparişiniz çoğu zaman 1 saatte kapınızda; ${joinNice(NEAR_DISTRICTS)} için aynı gün yola çıkıyoruz.`,
  `Kuryemiz Atakum sınırları içinde ortalama bir saatte ulaşır; komşu üç ilçeye (${joinNice(NEAR_DISTRICTS)}) ise aynı gün teslim ederiz.`,
  `Acil mama bitti diye dert etmeyin: Atakum içi tek saatlik teslimat, ${joinNice(NEAR_DISTRICTS)} geneli aynı gün bizim standardımız.`,
  `Atakum'da bir telefon kadar yakınız — siparişler genelde 60 dakikada elinizde; çevre ilçelere gün içinde getiriyoruz.`,
];
const ORDER_LINES = [
  `Sipariş vermek dakikalar sürer: ürünü seçip WhatsApp'tan iletin ya da ${PHONE} hattımızı arayın, kalanını biz hallederiz.`,
  `Dilerseniz online mağazamızdan sepetinizi hazırlayın, dilerseniz ${PHONE} numarasından söyleyin; size hangisi kolaysa o.`,
  `${PHONE} numaralı hattımızdan ya da WhatsApp üzerinden adresinizi bırakın; siparişiniz hemen hazırlanmaya başlar.`,
  `Aradığınızı bize iletmeniz yeterli; ${PHONE} ekibimiz ve WhatsApp hattımız siparişinizi anında açar.`,
];
const PAY_LINES = [
  "Kapıda nakit, kart (POS) ve QR ile ödeyebilirsiniz; nakit ödeyenlere ufak bir fiyat avantajı tanıyoruz.",
  "Ödeme tamamen size kalmış: kapıda nakit, kart veya QR — üstelik her siparişte harcamanızın %5'i Para Puan olarak birikiyor.",
  "Teslimatta nakit de kart da QR da geçerli; biriken %5 Para Puan'ı bir sonraki alışverişinizde indirim olarak kullanırsınız.",
  "Kapıda nakitle ödeyin, küçük bir indirim kazanın; kartla ödemek isterseniz POS cihazımız kuryede hazır.",
];
const TRUST_LINES = [
  "Rafımızdaki her ürün orijinal ve faturalıdır; özellikle mamalarda tarihe ve saklama koşullarına gözümüz gibi bakarız.",
  "Yalnızca güvendiğimiz tedarikçilerle çalışırız; gıdada tazelik bizim için tartışılmaz bir kuraldır.",
  "Tarihi yaklaşmış veya açık bir ürünü asla rafa koymayız; ne aldığınızı bilerek, içiniz rahat alışveriş yaparsınız.",
];
const STOCK_LINES = [
  `Stok gün içinde hızla değişir; aradığınız ürünü ayırtmak için ${PHONE} ya da WhatsApp'tan kısa bir teyit almanızı öneririz.`,
  `Bir ürün o an tükendiyse aynı bütçede, benzer içerikte bir muadil öneriyoruz; güncel durumu ${PHONE} üzerinden öğrenebilirsiniz.`,
  `Elimizde olup olmadığını en hızlı ${PHONE} numarasından öğrenirsiniz; yoksa size en yakın alternatifini birlikte buluruz.`,
];
const NEIGHBOR_LINES = [
  "Atakum'un yokuşunu, sahil bandını ve kampüs çevresini avucumuzun içi gibi biliriz; bu da kapıya varış süresini kısaltır.",
  "Mahalle mahalle teslimat yaptığımız için rotalarımız oturmuştur; siparişiniz sırada beklemez, yola hemen çıkar.",
  "Biz de bu mahallelerin komşusuyuz; nereye, hangi saatte nasıl gidileceğini ezbere biliyoruz.",
];
const STORY_LINES = [
  "Biz dev bir zincir değil, Atakumlu bir esnafız; her müşteriyle tek tek ilgilenir, doğru ürünü dürüstçe söyleriz.",
  "Hedefimiz komşu sıcaklığında ama hızı modern bir pet shop olmak: tek saatlik teslimat, samimi destek ve şeffaf öneri.",
  "Mahalle esnafının güler yüzünü, büyük mağazanın hızıyla buluşturuyoruz; sormaktan çekinmeyin, bildiğimizi paylaşırız.",
];

const WHY_POINTS = [
  "Atakum içinde ortalama 1 saatte kapıda teslim",
  "Kapıda nakit, kart (POS) ve QR ödeme rahatlığı",
  "Kedi, köpek, kuş ve kemirgen için geniş ürün yelpazesi",
  "Premium ve ekonomik markalar yan yana",
  "Orijinal ve faturalı ürün güvencesi",
  "Her alışverişte %5 Para Puan",
  `Her gün ${HOURS} arası açık sipariş hattı`,
  "Atakum'u ve komşu ilçeleri tanıyan yerel ekip",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function teslimSection(K: string, hoods: string[], h: number): Section {
  return {
    h2: pick(
      [
        `Atakum'da ${K} Kaç Saatte Gelir?`,
        `${K} Siparişiniz Hangi Hızda Kapıda?`,
        `${K} İçin 1 Saatlik Atakum Teslimatı`,
      ],
      h,
      301,
    ),
    paragraphs: [
      pick(SPEED_LINES, h, 302),
      `${K} için adresinizi iletmeniz yeterli: Atakum'un mahallelerine motorlu kuryeyle, ${joinNice(NEAR_DISTRICTS)} ilçelerine ise aynı gün içinde ulaştırıyoruz.`,
    ],
    list: hoods.map((n) => `${n}: 1 saatte Atakum içi teslimat`),
  };
}

function siparisSection(h: number): Section {
  return {
    h2: pick(
      ["Dakikalar İçinde Sipariş", "Nasıl Sipariş Veririm?", "Sipariş Verme ve Ödeme"],
      h,
      311,
    ),
    paragraphs: [
      pick(ORDER_LINES, h, 312),
      `${pick(PAY_LINES, h, 313)} ${pick(STOCK_LINES, h, 314)}`,
    ],
  };
}

function mahalleSection(hoods: string[], h: number): Section {
  const a = hoods[0] ?? "Atakum";
  const b = hoods[1] ?? "Denizevleri";
  return {
    h2: pick(
      ["Atakum'da Komşunuzuz", "Mahallenize En Yakın Pet Shop", "Atakum'u Sokak Sokak Biliriz"],
      h,
      321,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} başta olmak üzere Atakum'un birçok mahallesine her gün teslimat yapıyoruz; bu sıklık işi hızlandırıyor.`,
          `${a} ile ${b} arasındaki adresleri ezbere bildiğimiz için teslimat sürelerimiz hem kısa hem öngörülebilir.`,
          `${a}, ${b} ve çevresine sık uğradığımızdan kuryemiz kapınıza vakit kaybetmeden varıyor.`,
        ],
        h,
        322,
      ),
      pick(NEIGHBOR_LINES, h, 323),
      pick(TRUST_LINES, h, 324),
    ],
  };
}

function nedenSection(h: number): Section {
  return {
    h2: pick(
      ["Neden Atakum Pet?", "Atakum Pet'i Tercih Sebepleri", "Bizi Komşunuz Yapan Ne?"],
      h,
      331,
    ),
    paragraphs: [pick(STORY_LINES, h, 332)],
    list: rotate(WHY_POINTS, h, 333).slice(0, 5),
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
        [`${K}: Önce Şu Notu Okuyun`, `${K} ve Sahiplenme Çağrısı`, `${K} Hakkında Açık Konuşalım`],
        h,
        341,
      ),
      paragraphs: [
        "Atakum Pet canlı hayvan satışı yapmaz; mağazamızda yalnızca mama, bakım ürünü ve aksesuar bulunur.",
        pick(
          [
            "Hayatınıza bir dost katacaksanız önce barınakları ve güvenilir sahiplendirme gönüllülerini düşünün; sahiplenmek, satın almaktan çok daha doğru bir yoldur.",
            "Yeni bir dostun en doğru adresi barınaklar ve sorumlu sahiplendirme ağlarıdır; siz sahiplendikten sonra mama ve bakım tarafında biz yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplenmeyi destekliyoruz; eve gelen dostunuzun beslenme ve bakım ihtiyacını Atakum içinde hemen karşılarız.",
          ],
          h,
          342,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve bakım ürünlerinin tamamını Atakum Pet'te bulabilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${K} İçin Yönlendirme`, `${K} Hakkında Bilgi Notu`, `${K}: Kısa Bir Açıklama`], h, 341),
      paragraphs: [
        `Atakum Pet bir evcil hayvan ürünleri mağazasıdır; ${kw} hizmeti vermiyoruz. Bu, bizim sunduğumuz bir mağaza hizmeti değildir.`,
        pick(
          [
            "Bu iş için bölgenizdeki uzman kişi veya kuruluşlara başvurmanız en doğrusu olur; biz yalnızca süreçte ihtiyacınız olan ürünleri sağlarız.",
            "İşin kendisi için alanında yetkin bir adrese yönelmenizi öneririz; mama, bakım ve aksesuar tarafındaki her şeyde ise yanınızdayız.",
            "İlgili işi profesyonel birinden almanız gerekir; gereken ürünleri Atakum içinde hızlıca kapınıza getirmek bizim işimizdir.",
          ],
          h,
          342,
        ),
        `İhtiyaç duyacağınız ürünleri (mama, bakım malzemesi, aksesuar) Atakum Pet'ten hızlı teslimatla temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${K} Yerine Atakum'da Yerel Esnaf`, `${K}: Hızlı ve Yerel Alternatif`, `${K} mi, Mahalle Esnafı mı?`], h, 341),
      paragraphs: [
        `Atakum Pet bağımsız bir işletmeyiz; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Atakum'da yerel, hızlı ve yüz yüze destekli bir seçenek olarak sunuyoruz.`,
        pick(
          [
            "Pazaryerinde kargo beklemek yerine ürünü Atakum içinde 1 saatte elinize alırsınız; iade ya da değişimde de karşınızda gerçek bir komşu esnaf olur.",
            "Fiyatı araştırırken şunu unutmayın: bizden alınca kargo süresi yoktur, bir aksilikte konuşacağınız bir esnaf vardır.",
            "Yerelden almak; ürünü hemen kullanmaya başlamak, sorun çıkınca yüz yüze çözmek ve Atakum esnafını desteklemek demektir.",
          ],
          h,
          342,
        ),
        pick(STOCK_LINES, h, 343),
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
    341,
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
        h2: pick([`${K} Nasıl Seçilir?`, `Doğru ${K} İçin Pratik Kriterler`, `${K} Seçim Rehberi`], h, 343),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dahil ` : ""}premium ve ekonomik birçok markayı bir arada tuttuğumuz için, kararsızsanız küçük paketle deneyip beğendiğinizde büyüğüne geçebilirsiniz.`,
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
        h2: pick([`${K} Seçimi ve Kullanımı`, `${K} Hakkında Bilmeniz Gerekenler`, `${K} Nasıl Kullanılır?`], h, 343),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kumda ` : "Kedi kumunda "}belirleyici üç başlık topaklaşma gücü, toz oranı ve koku kontrolüdür. Atakum Pet'te topaklaşan (bentonit), kristal (silika) ve doğal kum çeşitlerini yan yana bulursunuz.`,
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
        h2: pick([`${K} İçin Öneriler`, `${K} Nasıl Seçilir?`, `${K} Üzerine Notlar`], h, 343),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral blok / gaga taşı gibi tamamlayıcılar kuşların formda kalmasında belirleyicidir. Yem, kafes ve aksesuarları bir arada sunuyoruz.",
        ],
        list: [
          "Yemliği düzenli temizleyin, küflenmeye fırsat vermeyin",
          "Suyu her gün değiştirin, suluğu durulayın",
          "Mineral blok ve gaga taşını eksik etmeyin",
        ],
      };
    case "collar":
      return {
        h2: pick([`${K} Seçerken Nelere Bakmalı?`, `Doğru ${K} Nasıl Olmalı?`, `${K} Rehberi`], h, 343),
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
        h2: pick([`${K} Nasıl Seçilir?`, `Rahat Bir ${K} İçin İpuçları`, `${K} Seçim Notları`], h, 343),
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
        h2: pick([`${K} Seçimi`, `${K} Nasıl Olmalı?`, `${K} İçin Öneriler`], h, 343),
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
        h2: pick([`${K} Seçerken`, `${K} Hakkında`, `Doğru ${K} Nasıl Olur?`], h, 343),
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
        h2: pick([`${K} Kullanımı`, `${K} İçin İpuçları`, `${K} Üzerine`], h, 343),
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
        h2: pick([`${K} Neden Önemli?`, `${K} Seçimi`, `${K} ile Daha Mutlu Bir Dost`], h, 343),
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
        h2: pick([`${K} Seçerken Beden`, `${K} Nasıl Seçilir?`, `${K} Rehberi`], h, 343),
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
        h2: pick([`${K} Hakkında`, `${K} Kullanımı`, `${K} İçin Notlar`], h, 343),
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
        h2: pick([`${K}: Kısa Bir Bakış`, `${K} Üzerine Notlar`, `${K} Hakkında`], h, 343),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en çok merak edilenleri Atakum Pet olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun gününü kolaylaştırmak istiyoruz.`,
              `${lc} ile ilgili işe yarayan bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Atakum içinde 1 saatte kapınıza getiriyoruz.`,
            ],
            h,
            343,
          ),
          "Takıldığınız bir nokta olursa ürün seçiminde de bize danışın; deneyimimizi seve seve paylaşırız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`Atakum'da ${K}`, `${K} mı Arıyorsunuz?`, `${K}: En Yakın Adres`], h, 343),
        paragraphs: [
          pick(
            [
              `Atakum'da ${kw} deyince, ${ADDR} adresindeki Atakum Pet hem mağaza hem de 1 saatlik kapı teslimatıyla yanınızda.`,
              `${lc} için uzağa gitmenize gerek yok; Atakum Pet geniş ürün yelpazesini her gün ${HOURS} arası kapınıza taşır.`,
            ],
            h,
            343,
          ),
          `İster mağazaya uğrayın, ister telefonla sipariş verin; Atakum içinde ortalama 1 saatte teslim ediyoruz. ${PHONE}.`,
        ],
      };
    default:
      return {
        h2: `${K} Hakkında`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için Atakum Pet'teki seçenekleri değerlendirebilir, emin olamadığınızda bize danışabilirsiniz.`,
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
      q: `${K} için Atakum Pet 7/24 açık mı?`,
      a: `Atakum Pet 7/24 ya da gece açık değildir; her gün ${HOURS} saatleri arasında sipariş alır ve Atakum içinde ortalama 1 saatte kapınıza teslim ederiz.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `Atakum Pet ${kw} kapsamında canlı hayvan satıyor mu?`,
      a: "Hayır. Atakum Pet canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunarız. Bir dost için yerel barınakları ve sahiplendirmeyi öneririz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `Atakum Pet ${kw} hizmeti veriyor mu?`,
      a: `Hayır, ${kw} bizim sunduğumuz bir hizmet değil; bu hizmeti vermiyoruz. Yalnızca süreçte ihtiyaç duyacağınız ürünleri sağlarız.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `Atakum Pet ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: "Hayır. Bağımsız bir işletmeyiz, resmi bir bağlantımız yok. Aynı ürünleri Atakum'da yerel ve hızlı bir seçenek olarak sunuyoruz.",
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `${K} siparişi Atakum'da kaç saatte gelir?`,
      a: `Atakum içinde ortalama 1 saatte, ${joinNice(NEAR_DISTRICTS)} geneline ise aynı gün teslim ediyoruz. Sabah verilen siparişler çoğunlukla öğleden sonra elinizde olur.`,
    },
    {
      q: `${K} için kapıda ödeme yapabilir miyim?`,
      a: `Evet. Kapıda nakit, kart (POS) ve QR ile ödeyebilirsiniz; nakit ödemede ufak bir avantaj ve her siparişte %5 Para Puan var. ${PHONE}.`,
    },
    {
      q: `${K} fiyatını nasıl öğrenebilirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyip WhatsApp'tan ya da ${PHONE} numarasından teyit alın; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `Atakum Pet'in adresi ve çalışma saatleri nedir?`,
      a: `${ADDR} adresindeyiz ve her gün ${HOURS} saatleri arasında açığız. ${PHONE} numarasından bize ulaşabilirsiniz.`,
    },
  ];

  const rotated = rotate(generic, h, 351);
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
// (Mirror of the atakum-all / jetgoshop-all local re-tag.)
const ATAKUMBIZ_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeAtakumbiz(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (ATAKUMBIZ_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Local noise the shared engine intentionally leaves in: the atakum source still
// carries Spanish-search autocomplete ("buscar spectrum" = "search spectrum")
// that would otherwise mint a nonsensical pet-shop page. Drop just the Spanish
// "buscar" cue; bare "spectrum" stays as a legit food-brand page.
const ATAKUMBIZ_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of ATAKUMBIZ_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || ATAKUMBIZ_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeAtakumbiz(kw) });
}

export const ATAKUMBIZ_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

const CORE_LINKS: { text: string; href: string }[] = [
  { text: "En Yakın Pet Shop", href: "/en-yakin-petshop" },
  { text: "Kapıda Ödeme", href: "/kapida-odeme-petshop" },
  { text: "Kedi Maması", href: "/kedi-mamasi" },
  { text: "Köpek Maması", href: "/kopek-mamasi" },
  { text: "Kedi Kumu", href: "/kedi-kumu" },
  { text: "Atakum Pet Shop", href: "/atakum-petshop" },
  { text: "Samsun Pet Shop", href: "/samsun-petshop" },
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
  "Atakum'a 1 Saatte Teslimat",
  "Atakum İçinde 1 Saatte Kapıda",
  "Atakum'da Hızlı Pet Shop",
  "Aynı Gün İlkadım, Canik, Tekkeköy",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | Atakum Pet — Sahiplenme Çağrısı`;
  if (a.cat === "retailer") return `${K} | Atakum Pet — Yerel Esnaf`;
  if (a.cat === "service") return `${K} | Atakum Pet — Bilgi Notu`;
  return `${K} | Atakum Pet — ${pick(META_SUFFIX, h, 361)}`;
}

function metaDescFor(a: Attr, kw: string, K: string, h: number): string {
  if (a.cat === "live") {
    return `${trCap(kw)}: Atakum Pet canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünleri Atakum içinde 1 saatte kapıda. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${trCap(kw)}: Atakum Pet bu hizmeti vermiyoruz; ihtiyacınız olan ürünleri Atakum'da 1 saatte kapınıza getiririz. Kapıda ödeme, ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${trCap(kw)}: Atakum Pet bağımsız bir yerel esnaftır. Aynı ürünler Atakum'da 1 saatte kapıda, kapıda ödemeyle. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${trCap(kw)} mı arıyorsunuz? ${trCap(noun)} ve tüm pet ürünleri Atakum içinde ortalama 1 saatte kapınızda. Kapıda ödeme, ${PHONE}.`,
      `${trCap(kw)} için Atakum Pet: geniş ürün yelpazesi, Atakum'a 1 saatte teslimat ve kapıda ödeme. ${PHONE}.`,
      `${trCap(kw)} — Atakum'da 1 saatte, İlkadım/Canik/Tekkeköy'e aynı gün. ${trCap(noun)} dahil yüzlerce ürün, kapıda nakit/kart/QR. ${PHONE}.`,
    ],
    h,
    362,
  );
}

function buildPage(e: Ent, idx: number, related: { text: string; href: string }[]): SeoPageData {
  const { kw, slug, a } = e;
  const h = H(slug);
  const K = trTitle(kw);
  const hoods = hoodsFor(h);

  const main = mainSection(a, kw, K, h);
  const support = rotate(
    [teslimSection(K, hoods, h), nedenSection(h), siparisSection(h), mahalleSection(hoods, h)],
    h,
    371,
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
    title: K,
    metaTitle: metaTitleFor(a, K, h),
    metaDescription: metaDescFor(a, kw, K, h),
    keywords: `${kw}, ${kw} atakum, atakum ${kw}, ${kw} 1 saatte, ${kw} kapıda ödeme, ${kw} aynı gün teslimat`,
    h1: pick(
      [
        `${K} — Atakum Pet`,
        `${K} | Atakum'da 1 Saatte`,
        `${K} — Atakum İçinde Hızlı Teslimat`,
      ],
      h,
      372,
    ),
    intro: [
      pick(
        [
          `${trCap(kw)} mı arıyorsunuz? Atakum Pet, ${ADDR} adresinden Atakum'un tüm mahallelerine 1 saatte teslimat yapan komşu bir pet shop.`,
          `Atakum'da ${kw} deyince akla gelen hızlı adres olmayı hedefliyoruz; ihtiyacınızı tek saatte kapınıza getiriyoruz.`,
          `${trCap(kw)} konusunda doğru ürün ve Atakum içinde 1 saatlik teslimat için Atakum Pet yanınızda.`,
        ],
        h,
        381,
      ),
      `${pick(ORDER_LINES, h, 382)} ${pick(SPEED_LINES, h, 383)}`,
      `${pick(PAY_LINES, h, 384)} Atakum Pet her gün ${HOURS} saatleri arasında hizmetinizdedir.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 385).slice(0, 4),
      catFeature,
      `${ADDR} — ${PHONE}`,
    ],
    faq: faqFor(a, kw, K, h),
    internalLinks: related,
  };
}

export const ATAKUMBIZ_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
