// ---------------------------------------------------------------------------
// "Tüm anahtar kelimeler" broad SEO landing-page generator for ATAKUM
// (atakumpetshop.com, store id "atakum") — the 5th corpus in the family and the
// FIRST broad NEW-SLUG corpus dedicated to atakum (the legacy atakum generator,
// keyword-pages-atakum.ts, only OVERRIDES shared keyword slugs; this one ADDS
// brand-new slugs for the long-tail keyword list).
//
// Goals:
//  - One substantive page per keyword, storeId "atakum", localOnly, type keyword.
//  - Content that reads HUMAN-written and is DISTINCT from jetgomarket's diger
//    corpus: every copy slot is chosen from a phrase bank by a stable slug hash,
//    and the supporting-section ORDER is rotated, so no two neighbouring pages
//    share the same skeleton.
//  - Classification + truthfulness reuse the shared keyword-truthfulness engine,
//    so live-animal / service / retailer / price intents are framed safely:
//      live    → "canlı hayvan satışı yapmaz" + responsible-adoption guidance
//      service → "... hizmeti vermez" (a shop, not a service provider)
//      retailer→ "bağımsız bir işletmedir; resmi bir bağlantımız yok"
//      price   → never a fabricated number next to ₺/TL/lira.
//
// Consumed by seo-data.ts (a SEPARATE 2nd integration loop, AFTER the legacy
// override-only atakum block). Do not hand-edit; regenerate.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { ATAKUM_ALL_KEYWORDS } from "./atakum-all-keywords";
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

const STORE_ID = "atakum";
const DOMAIN = "atakumpetshop.com";
const PHONE = "0850 840 39 59";
const ADDR = "Atatürk 3. Kısım Bulvarı No:113, Atakum / Samsun";
const HOURS = "09:00–21:00";

// Real Atakum neighbourhoods (+ the three nearby Samsun districts we also serve).
const NEIGHBORHOODS = [
  "Denizevler", "Mimarsinan", "Körfez", "Cumhuriyet", "Atakent", "Balaç",
  "Yenimahalle", "Esenevler", "Kesilik", "Çatalçam", "Aksu", "Taflan",
  "İncesu", "Güzelyalı", "Alanlı", "Çamlıyazı", "Kamalı", "Beypınar",
  "Sarıtaş", "Elmaçukuru", "Yeşiltepe", "Karakavuk",
];
const DISTRICTS = ["İlkadım", "Canik", "Tekkeköy"];

const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;

// ---------------------------------------------------------------------------
// Stable-hash variation helpers — same content for the same slug across builds,
// but neighbouring slugs land on different phrasings and section orders.
// ---------------------------------------------------------------------------

function H(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  return h;
}
function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[((h + salt) >>> 0) % arr.length];
}
// Rotate an array by a hash-derived offset (varies order AND, when sliced, which
// members appear) — used to vary the supporting-section rhythm per page.
function rotate<T>(arr: T[], h: number, salt: number): T[] {
  const n = arr.length;
  const start = ((h + salt) >>> 0) % n;
  return arr.map((_, i) => arr[(start + i) % n]);
}
function hoodsFor(h: number): string[] {
  const start = h % NEIGHBORHOODS.length;
  const out: string[] = [];
  for (let i = 0; i < 6; i++) out.push(NEIGHBORHOODS[(start + i * 3) % NEIGHBORHOODS.length]);
  return Array.from(new Set(out));
}

// ---------------------------------------------------------------------------
// Attribute → natural Turkish fragments.
// ---------------------------------------------------------------------------

function stagePhrase(stage: string): string {
  switch (stage) {
    case "yavru": return "yavru dönemindeki";
    case "yetişkin": return "yetişkin";
    case "yaşlı": return "yaşlı (senior)";
    case "anne": return "gebe ve emziren anne";
    default: return "";
  }
}
function joinNice(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return items.slice(0, -1).join(", ") + " ve " + items[items.length - 1];
}

// ---------------------------------------------------------------------------
// Shared phrase banks (non-sensitive supporting copy).
// ---------------------------------------------------------------------------

const SPEED_LINES = [
  `Atakum içinde ortalama 1 saatte, ${joinNice(DISTRICTS)} geneline ise aynı gün kapınıza ulaştırıyoruz.`,
  `Siparişiniz Atakum sınırları içinde çoğunlukla 1 saat içinde, çevre ilçelere aynı gün teslim edilir.`,
  `Atakum'da kuryemiz ortalama bir saatte kapınızda; ${joinNice(DISTRICTS)} için aynı gün teslimat geçerlidir.`,
  `Aynı gün verdiğiniz siparişler Atakum'da genelde 1 saat, Samsun merkez ilçelerinde gün içinde elinizde olur.`,
];
const ORDER_LINES = [
  `${DOMAIN} üzerinden ürünü sepete ekleyip WhatsApp ile tek tıkla, ya da ${PHONE} numaralı hattımızı arayarak siparişinizi tamamlayabilirsiniz.`,
  `Sipariş için ${DOMAIN} sitesinden seçiminizi yapın; dilerseniz WhatsApp'tan, dilerseniz ${PHONE} numarasından bize ulaşın.`,
  `İster siteden sepet oluşturun, ister doğrudan ${PHONE} hattımızdan veya WhatsApp'tan söyleyin; gerisini biz hallederiz.`,
  `${PHONE} numarasından arayarak veya ${DOMAIN} üzerinden birkaç tıkla siparişinizi verebilirsiniz.`,
];
const PAY_LINES = [
  "Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilir, nakit ödemede avantajlı fiyattan yararlanırsınız.",
  "Ödemeyi kapıda nakit, POS cihazıyla kart veya QR ile yapabilirsiniz; her siparişte %5 Para Puan birikir.",
  "Kapıda nakit ve kartla ödeme açıktır; nakit tercih edenlere küçük bir fiyat avantajı sunuyoruz.",
  "Teslimatta nakit, kart ve QR seçenekleri mevcut; her alışverişinizde %5 Para Puan kazanırsınız.",
];
const TRUST_LINES = [
  "Tüm ürünlerimiz orijinal ve faturalıdır; gıdada son kullanma tarihi uzun, doğru saklanmış ürünleri tercih ederiz.",
  "Raftaki her ürün orijinaldir; özellikle mamalarda tazelik ve doğru saklama koşullarına dikkat ederiz.",
  "Sattığımız ürünler faturalı ve orijinaldir; gıda gruplarında tarih ve saklama kontrolünü titizlikle yaparız.",
];
const STOCK_LINES = [
  `Stok zamanla değişebildiği için, aradığınız ürünün güncel durumunu sipariş öncesi ${PHONE} veya WhatsApp'tan teyit etmenizi öneririz.`,
  `Bir ürün anlık olarak tükenmişse, aynı segmentte uygun bir alternatif öneriyoruz; güncel mevcudiyeti ${PHONE} üzerinden sorabilirsiniz.`,
  `Mevcudiyet günden güne değişir; ${PHONE} numarasından sorduğunuzda en güncel stok bilgisini paylaşırız.`,
];

const WHY_POINTS = [
  "Atakum içinde ortalama 1 saatte kapıda teslim",
  "Kapıda nakit, POS ve QR ödeme kolaylığı",
  "Kedi, köpek, kuş ve kemirgen için geniş ürün yelpazesi",
  "Premium ve ekonomik segmentten yan yana seçenekler",
  "Orijinal ve faturalı ürün garantisi",
  "Her siparişte %5 Para Puan",
  `Her gün ${HOURS} kesintisiz sipariş hattı`,
  "Atakum'u ve Samsun merkez ilçelerini tanıyan yerel ekip",
];

// ---------------------------------------------------------------------------
// Section model.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function deliverySection(K: string, hoods: string[], h: number): Section {
  return {
    h2: pick(
      [
        `Atakum'da ${K} Teslimatı Nasıl İşliyor?`,
        `${K} Siparişiniz Hangi Bölgelere Ulaşıyor?`,
        `Atakum ve Samsun'da ${K} Teslimat Ağı`,
      ],
      h,
      11,
    ),
    paragraphs: [
      pick(SPEED_LINES, h, 12),
      `${K} siparişlerinizi Atakum'un mahallelerine kuryeyle, ${joinNice(DISTRICTS)} ilçelerine ise gün içinde ulaştırıyoruz. Adresinizi belirtmeniz teslimat süresini netleştirmemiz için yeterli.`,
    ],
    list: hoods.map((n) => `${n}: aynı gün teslimat`),
  };
}

function whySection(h: number): Section {
  return {
    h2: pick(
      ["Neden Atakum Pet Shop?", "Atakum Pet Shop Farkı", "Bizi Tercih Etmeniz İçin Nedenler"],
      h,
      21,
    ),
    paragraphs: [
      pick(
        [
          "Yıllardır Atakum'da aynı dükkândayız; ürünü görmek isterseniz mağazaya da bekleriz, vakti olmayanlara ise kapıya getiriyoruz.",
          "Amacımız komşuluk mesafesinde, güvenilir bir pet shop olmak: hızlı teslimat, dürüst ürün önerisi ve ulaşılabilir bir hat.",
          "Büyük zincirlerin hızını yerel bir esnafın samimiyetiyle birleştiriyoruz; her müşteriyle tek tek ilgileniyoruz.",
        ],
        h,
        22,
      ),
    ],
    list: rotate(WHY_POINTS, h, 23).slice(0, 5),
  };
}

function orderSection(h: number): Section {
  return {
    h2: pick(
      ["Sipariş ve Ödeme", "Nasıl Sipariş Verilir?", "Sipariş Adımları ve Ödeme Seçenekleri"],
      h,
      31,
    ),
    paragraphs: [pick(ORDER_LINES, h, 32), `${pick(PAY_LINES, h, 33)} ${pick(STOCK_LINES, h, 34)}`],
  };
}

function localSection(hoods: string[], h: number): Section {
  const a = hoods[0] ?? "Atakum";
  const b = hoods[1] ?? "Denizevler";
  return {
    h2: pick(
      ["Atakum'da Yerel Hizmet", "Mahallenize En Yakın Çözüm", "Atakum'u Biliyoruz"],
      h,
      41,
    ),
    paragraphs: [
      pick(
        [
          `${a} ve ${b} gibi mahalleleri, sahil bandını ve kampüs çevresini iyi tanıyoruz; bu da teslimatı hızlandırıyor.`,
          `Atakum'un trafiğini ve mahalle yollarını bildiğimiz için ${a} ile ${b} arasındaki adreslere bile çabuk ulaşıyoruz.`,
          `${a}, ${b} ve çevre mahallelerde sık teslimat yaptığımızdan rotalarımız oturmuş durumda; siparişiniz beklemede kalmıyor.`,
        ],
        h,
        42,
      ),
      `${pick(TRUST_LINES, h, 43)}`,
    ],
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
        [`${K} Hakkında Bilmeniz Gerekenler`, `${K}: Sorumlu Sahiplenme Rehberi`, `${K} ve Doğru Yaklaşım`],
        h,
        51,
      ),
      paragraphs: [
        "Atakum Pet Shop canlı hayvan satışı yapmaz; mağazamız yalnızca evcil hayvan maması, bakım ürünleri ve aksesuar bulundurur.",
        pick(
          [
            "Bir dostu hayatınıza katmak istiyorsanız, yerel barınakları ve sorumlu sahiplendirme yapan kişileri değerlendirmenizi öneririz; sahiplenmek satın almaktan daha doğru bir yoldur.",
            "Yeni bir dost için en doğru adres barınaklar ve güvenilir sahiplendirme ağlarıdır; biz de sahiplendiğiniz dostunuzun mama ve bakım ihtiyacında yanınızdayız.",
            "Canlı hayvan ticareti yerine sahiplenmeyi destekliyoruz; sahiplendikten sonra beslenme ve bakım malzemelerini Atakum içinde hızlıca kapınıza getiririz.",
          ],
          h,
          52,
        ),
        `Sahiplendiğiniz ${animalW} için mama, kum, kafes, oyuncak ve bakım ürünlerini ${DOMAIN} üzerinden bulabilirsiniz.`,
      ],
    };
  }

  if (a.cat === "service") {
    return {
      h2: pick([`${K} İçin Bilgilendirme`, `${K} Konusunda Yönlendirme`, `${K} Hakkında`], h, 51),
      paragraphs: [
        `Atakum Pet Shop bir evcil hayvan ürünleri mağazasıdır; ${kw} hizmeti vermez. Bu, sunduğumuz bir mağaza hizmeti değildir.`,
        pick(
          [
            "Bu konuda bölgenizdeki uzman kişilere veya kuruluşlara başvurmanızı öneririz; biz yalnızca bu süreçte ihtiyaç duyacağınız ürünleri sağlarız.",
            "İlgili hizmet için alanında uzman bir yetkiliyle görüşmeniz en doğrusu olur; ürün tarafındaki tüm ihtiyaçlarınızda ise yanınızdayız.",
            "Hizmetin kendisi için profesyonel bir adrese yönelmenizi tavsiye ederiz; gerekli mama, bakım ve aksesuar ürünlerini biz tedarik ederiz.",
          ],
          h,
          52,
        ),
        `İlgili ürünleri (mama, bakım malzemeleri, aksesuar) Atakum içinde hızlı teslimatla ${DOMAIN} üzerinden temin edebilirsiniz.`,
      ],
    };
  }

  if (a.cat === "retailer") {
    const r = a.retailer || "büyük pazaryerleri";
    return {
      h2: pick([`${K} Yerine Atakum'da Yerel Alternatif`, `${K}: Yerel ve Hızlı Seçenek`, `${K} mi, Yerel Esnaf mı?`], h, 51),
      paragraphs: [
        `Atakum Pet Shop bağımsız bir işletmedir; ${r} ile resmi bir bağlantımız yok. Aynı ürünleri Atakum'da yerel, hızlı ve yüz yüze destekli bir alternatif olarak sunuyoruz.`,
        pick(
          [
            "Online pazaryerlerinde kargo beklemek yerine, Atakum içinde aynı gün hatta çoğu zaman bir saatte ürünü kapınızda bulabilirsiniz.",
            "Pazaryeri fiyatlarını araştırırken, bizden alınca kargo süresini beklemediğinizi ve sorun olursa muhatap bulabileceğinizi unutmayın.",
            "Yerelden almak demek; ürünü hemen elinize almak, iade/değişimde gerçek bir muhatapla konuşmak ve mahalle esnafını desteklemek demektir.",
          ],
          h,
          52,
        ),
        `${pick(STOCK_LINES, h, 53)}`,
      ],
    };
  }

  // --- Product / info buckets. ----------------------------------------------
  const intro = pick(
    [
      `${noun} seçerken acele etmeyin; ${animalW}'ınızın yaşına, kilosuna ve alışkanlıklarına uygun olanı belirlemek uzun vadede en doğrusu.`,
      `Doğru ${noun}, ${animalW}'ınızın günlük konforunu doğrudan etkiler; bu yüzden ihtiyaca göre seçim yapmak önemli.`,
      `${lc} ararken kafanız karışmasın; birkaç basit kritere bakarak ${animalW}'ınıza en uygun ${noun} seçeneğini bulabilirsiniz.`,
    ],
    h,
    51,
  );

  switch (a.cat) {
    case "food": {
      const bits: string[] = [];
      const sp = stagePhrase(a.stage);
      if (sp) bits.push(`paketteki yaş aralığının ${sp} dostunuzla uyuştuğundan emin olun`);
      if (a.flavor) bits.push(`${a.flavor} gibi sevdiği bir tadı tercih edin`);
      if (a.size) bits.push(`${a.size} gibi paketler düzenli tüketimde daha ekonomik olur`);
      const crit = bits.length
        ? `${trCap(joinNice(bits))}.`
        : "İçindekiler listesinde ilk sırada tanımlı bir et/protein kaynağı bulunması iyi bir işarettir.";
      return {
        h2: pick([`${K} Nasıl Seçilir?`, `${K} Seçim Rehberi`, `Doğru ${K} İçin İpuçları`], h, 53),
        paragraphs: [
          intro,
          `${crit} ${a.brand ? `${a.brand} dahil ` : ""}premium ve ekonomik birçok markayı yan yana bulunduruyoruz; emin değilseniz küçük paketle deneyip beğendiğinizde büyük pakete geçebilirsiniz.`,
        ],
        list: [
          "Yeni mamaya geçişi 5–7 güne yayın, eskiyle kademeli karıştırın",
          "Suyu her gün tazeleyin, mama kabını düzenli yıkayın",
          "Açılan paketi serin, kuru ve ağzı kapalı şekilde saklayın",
        ],
      };
    }
    case "litter": {
      const kind = a.litterKind ? `${a.litterKind} ` : "";
      return {
        h2: pick([`${K} Seçimi ve Kullanımı`, `${K} Hakkında Pratik Bilgiler`, `${K} Nasıl Kullanılır?`], h, 53),
        paragraphs: [
          intro,
          `${kind ? `${trCap(kind)}kum, ` : ""}topaklaşma gücü, toz oranı ve koku kontrolü en çok dikkat edilen üç noktadır. Atakum Pet Shop'ta topaklaşan (bentonit), kristal (silika) ve doğal kum çeşitlerini bir arada bulabilirsiniz.`,
        ],
        list: [
          "Kabın derinliğini 5–7 cm tutun, topakları her gün alın",
          "Haftada bir kabı tamamen boşaltıp yıkayın",
          "Kediniz kumu beğenmezse kademeli olarak yeni türe geçin",
        ],
      };
    }
    case "bird":
      return {
        h2: pick([`${K} İçin Öneriler`, `${K} Nasıl Seçilir?`, `${K} Rehberi`], h, 53),
        paragraphs: [
          intro,
          "Tohum karışımının tazeliği, kafes hijyeni ve mineral/gaga taşı gibi tamamlayıcılar kuşların sağlıklı kalması için önemlidir. Yem, kafes ve aksesuarları bir arada sunuyoruz.",
        ],
        list: [
          "Yemliği düzenli temizleyin, küflenmeyi önleyin",
          "Suyu her gün değiştirin, suluğu durulayın",
          "Mineral blok ve gaga taşını eksik etmeyin",
        ],
      };
    case "collar":
      return {
        h2: pick([`${K} Seçerken Dikkat`, `Doğru ${K} Nasıl Olmalı?`, `${K} Rehberi`], h, 53),
        paragraphs: [
          intro,
          "Tasma ve koşumda en kritik nokta doğru beden: boyun/göğüs çevresini ölçün, iki parmak rahatça girebilmeli. Atakum Pet Shop'ta farklı beden, malzeme ve kilit tipinde seçenekler bulunur.",
        ],
        list: [
          "Boyun veya göğüs çevresini mezurayla ölçün",
          "Kediler için güvenlik kilitli (breakaway) tasmaları tercih edin",
          "Dikişlerin ve klipsin sağlamlığını kontrol edin",
        ],
      };
    case "bed":
      return {
        h2: pick([`${K} Nasıl Seçilir?`, `${K} Seçim İpuçları`, `Rahat Bir ${K} İçin`], h, 53),
        paragraphs: [
          intro,
          "Yatak seçiminde dostunuzun uzanmış haldeki boyu, uyku pozisyonu ve yıkanabilirlik öne çıkar. Farklı boy ve dolgularda, kılıfı çıkarılıp yıkanabilen modeller mevcut.",
        ],
        list: [
          "Yatağı, uzandığında rahatça sığacağı boyda seçin",
          "Kılıfı çıkıp makinede yıkanabilen modelleri tercih edin",
          "Köşeye, sakin bir noktaya yerleştirin",
        ],
      };
    case "carrier":
      return {
        h2: pick([`${K} Seçimi`, `${K} Nasıl Olmalı?`, `${K} İçin Öneriler`], h, 53),
        paragraphs: [
          intro,
          "Taşıma çantası ve kafeslerinde havalandırma, sağlam kapak kilidi ve uygun boy önemlidir. Veteriner ziyaretleri ve seyahat için farklı boy ve tiplerde ürünler sunuyoruz.",
        ],
        list: [
          "Dostunuzun ayakta dönebileceği boyu seçin",
          "Kapak kilidinin güvenli kapandığından emin olun",
          "İlk kullanımdan önce çantaya alışmasını sağlayın",
        ],
      };
    case "bowl":
      return {
        h2: pick([`${K} Seçerken`, `${K} Hakkında`, `Doğru ${K}`], h, 53),
        paragraphs: [
          intro,
          "Mama ve su kaplarında malzeme (paslanmaz çelik/seramik) ve kolay temizlik öne çıkar. Devrilmeyen tabanlı, çelik ve seramik modelleri bir arada bulabilirsiniz.",
        ],
        list: [
          "Paslanmaz çelik veya seramik daha hijyeniktir",
          "Kabı her gün yıkayın, biyofilm oluşumunu önleyin",
          "Devrilmeyen tabanlı modelleri tercih edin",
        ],
      };
    case "grooming":
      return {
        h2: pick([`${K} Kullanımı`, `${K} İçin İpuçları`, `${K} Rehberi`], h, 53),
        paragraphs: [
          intro,
          "Bakım ürünlerinde tüy yapısına uygun şampuan ve doğru tarak/fırça seçimi tüy sağlığını korur. Düzenli tarama tüy yumağını ve dökülmeyi azaltır.",
        ],
        list: [
          "Tüy tipine uygun şampuan ve fırça seçin",
          "Banyo sonrası iyice durulayıp kurulayın",
          "Düzenli tarama dökülmeyi belirgin azaltır",
        ],
      };
    case "toy":
      return {
        h2: pick([`${K} Neden Önemli?`, `${K} Seçimi`, `${K} ile Oyun`], h, 53),
        paragraphs: [
          intro,
          "Oyuncaklar dostunuzun enerjisini atması ve zihinsel uyarım için önemlidir. Boyutuna uygun, parçalanmayan ve güvenli malzemeden ürünleri tercih edin.",
        ],
        list: [
          "Boyutuna uygun, yutulmayacak oyuncaklar seçin",
          "Oyuncakları zaman zaman değiştirin, ilgisi sürsün",
          "Yıpranan oyuncakları zamanında yenileyin",
        ],
      };
    case "clothing":
      return {
        h2: pick([`${K} Seçerken Beden`, `${K} Nasıl Seçilir?`, `${K} Rehberi`], h, 53),
        paragraphs: [
          intro,
          "Kıyafette doğru beden ve hareket özgürlüğü esastır; sırt uzunluğu ile göğüs çevresini ölçün. Soğuk havalar için su geçirmez ve içi astarlı modeller işinizi görür.",
        ],
        list: [
          "Sırt uzunluğu ve göğüs çevresini ölçüp bedene karar verin",
          "Hareketi kısıtlamayan, tuvaletini engellemeyen modeller seçin",
          "Soğukta su geçirmez/astarlı modelleri tercih edin",
        ],
      };
    case "health":
      return {
        h2: pick([`${K} Hakkında`, `${K} Kullanımı`, `${K} İçin Notlar`], h, 53),
        paragraphs: [
          intro,
          "Bakım ve takviye ürünleri düzenli bakımın bir parçasıdır; ancak hiçbiri veteriner muayenesinin ya da tedavisinin yerine geçmez. Şüpheniz varsa önce veterinerinize danışın.",
        ],
        list: [
          "Ürünü etiketindeki kullanım talimatına göre uygulayın",
          "Bir sağlık şüphesinde önce veterinerinize danışın",
          "Takviyeleri dengeli beslenmenin tamamlayıcısı olarak görün",
        ],
      };
    case "guide":
      return {
        h2: pick([`${K}: Kısa Bir Bakış`, `${K} Hakkında Bilgi`, `${K} Üzerine`], h, 53),
        paragraphs: [
          pick(
            [
              `${lc} konusunda en sık merak edilenleri Atakum Pet Shop olarak derledik; doğru ürün ve pratik bilgiyle dostunuzun günlük yaşamını kolaylaştırmayı amaçlıyoruz.`,
              `${lc} ile ilgili pratik bilgileri bir araya getirdik; ihtiyaç duyduğunuz ürünleri de Atakum içinde hızlıca kapınıza getiriyoruz.`,
            ],
            h,
            53,
          ),
          "Aklınıza takılan bir soru olursa, ürün seçiminde de bize danışabilirsiniz; deneyimimizi paylaşmaktan memnuniyet duyarız.",
        ],
      };
    case "shop":
      return {
        h2: pick([`Atakum'da ${K}`, `${K} Arıyorsanız`, `${K}: En Yakın Adres`], h, 53),
        paragraphs: [
          pick(
            [
              `Atakum'da ${kw} dediğinizde, ${ADDR} adresindeki Atakum Pet Shop hem mağaza hem de hızlı kapı teslimatıyla yanınızda.`,
              `${lc} için uzağa gitmenize gerek yok; Atakum Pet Shop geniş ürün yelpazesini ${HOURS} saatleri arasında hizmetinize sunar.`,
            ],
            h,
            53,
          ),
          `İster mağazaya uğrayın, ister ${DOMAIN} üzerinden sipariş verin; Atakum içinde ortalama 1 saatte teslim ediyoruz.`,
        ],
      };
    default:
      return {
        h2: `${K} Hakkında`,
        paragraphs: [
          intro,
          `İhtiyacınıza en uygun ${noun} için Atakum Pet Shop'taki seçenekleri değerlendirebilir, emin olamadığınızda bize danışabilirsiniz.`,
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
      q: `${K} gerçekten 24 saat / 7-24 açık mı?`,
      a: `Atakum Pet Shop 24 saat açık değildir; her gün ${HOURS} saatleri arasında sipariş alır ve Atakum içinde ortalama 1 saatte kapınıza teslim eder.`,
    });
  }

  if (a.cat === "live") {
    out.push({
      q: `Atakum Pet Shop ${kw} kapsamında canlı hayvan satıyor mu?`,
      a: "Hayır. Atakum Pet Shop canlı hayvan satışı yapmaz; yalnızca mama, bakım ürünü ve aksesuar sunar. Sahiplenmek için yerel barınakları öneririz.",
    });
  } else if (a.cat === "service") {
    out.push({
      q: `Atakum Pet Shop ${kw} hizmeti veriyor mu?`,
      a: `Hayır, ${kw} bizim sunduğumuz bir hizmet değildir. Bu hizmeti vermeyiz; yalnızca süreçte ihtiyaç duyacağınız ürünleri sağlarız.`,
    });
  } else if (a.cat === "retailer") {
    out.push({
      q: `Atakum Pet Shop ${a.retailer || "pazaryeri"} ile bağlantılı mı?`,
      a: `Hayır. Bağımsız bir işletmeyiz ve resmi bir bağlantımız yok. Aynı ürünleri Atakum'da yerel ve hızlı bir alternatif olarak sunuyoruz.`,
    });
  }

  const generic: { q: string; a: string }[] = [
    {
      q: `Atakum'da ${K} teslimatı ne kadar sürer?`,
      a: `Atakum içinde ortalama 1 saatte, ${joinNice(DISTRICTS)} geneline aynı gün teslim ediyoruz. Sabah verilen siparişler genelde öğleden sonra elinizde olur.`,
    },
    {
      q: `${K} için kapıda ödeme yapabilir miyim?`,
      a: `Evet. Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilirsiniz; nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan sunuyoruz. ${PHONE}.`,
    },
    {
      q: `${K} fiyatını nasıl öğrenirim?`,
      a: `Güncel fiyat ve kampanyalar için ürünü sepete ekleyip WhatsApp'tan ya da ${PHONE} numarasından teyit alabilirsiniz; fiyatlar stok ve kampanyaya göre değişebilir.`,
    },
    {
      q: `Atakum Pet Shop'un adresi ve çalışma saatleri nedir?`,
      a: `${ADDR} adresindeyiz ve her gün ${HOURS} saatleri arasında açığız. ${PHONE} numarasından bize ulaşabilirsiniz.`,
    },
  ];

  const rotated = rotate(generic, h, 61);
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
// a breed head-confirm token (shorthair/fold/…), so the shared classifier's
// breed-only fallback tags it live (liveKind "cins") and slaps a no-sale
// disclaimer on what is really a bag of food. We do NOT touch the shared engine
// (diger must stay byte-identical); instead we re-tag it as food here when a tight
// food signal — a weight unit or an explicit food brand/noun — is present. The
// gate is deliberately narrow: only the "cins" fallback path, and only signals
// that cannot appear in a bare breed query ("british shorthair kedi" has neither
// a weight nor "royal canin", so it stays live).
// Note the tr dotless-ı variants ("royal canın", common in autocomplete typos).
const ATAKUM_FOOD_SKU_RE =
  /\d\s*(kg|kilo|gr|gram)\b|royal ?can[iı]n|pro ?plan|proplan|hill'?s|hills|farmina|acana|or[iı]jen|\bn ?& ?d\b|mama|kuru mama|yaş mama|konserve|kibble/;

function analyzeAtakum(kw: string): Attr {
  const a = analyze(kw);
  if (a.cat === "live" && a.liveKind === "cins") {
    const k = kw.toLocaleLowerCase("tr-TR");
    if (ATAKUM_FOOD_SKU_RE.test(k)) {
      return { ...a, cat: "food", liveKind: "", brand: detectFoodBrand(k) };
    }
  }
  return a;
}

// Local noise the shared engine intentionally leaves in (it must not drop the real
// "spectrum kedi/köpek maması" food brand, so it does not blanket-ban "spectrum").
// Atakum's source still carries Spanish-search autocomplete ("buscar spectrum" =
// "search spectrum") that would otherwise mint a nonsensical pet-shop page. Drop
// just the Spanish "buscar" cue; bare "spectrum" stays as a legit food-brand page.
const ATAKUM_EXTRA_NOISE_RE = /\bbuscar\b/;

const _entries: Ent[] = [];
const _seen = new Set<string>();
let _skippedNoise = 0;

for (const raw of ATAKUM_ALL_KEYWORDS) {
  const kw = raw.trim();
  if (!kw) continue;
  const _lk = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(_lk) || ATAKUM_EXTRA_NOISE_RE.test(_lk)) {
    _skippedNoise++;
    continue;
  }
  const slug = slugify(kw);
  if (!slug || RESERVED_SLUGS.has(slug)) continue;
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, a: analyzeAtakum(kw) });
}

export const ATAKUM_ALL_SKIPPED_NOISE = _skippedNoise;

const _byCat = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.a.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.a.cat, [e]);
}

const CORE_LINKS: { text: string; href: string }[] = [
  { text: "Atakum Pet Shop", href: "/atakum-petshop" },
  { text: "Atakum Mahalleleri", href: "/atakum-mahalleler" },
  { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
  { text: "Kapıda Ödeme", href: "/kapida-odeme-petshop" },
  { text: "Kedi Maması", href: "/kedi-mamasi" },
  { text: "Köpek Maması", href: "/kopek-mamasi" },
  { text: "Kedi Kumu", href: "/kedi-kumu" },
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
  push(CORE_LINKS[(idx + 3) % CORE_LINKS.length]);
  push(CORE_LINKS[(idx + 5) % CORE_LINKS.length]);
  return out.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Page assembly.
// ---------------------------------------------------------------------------

const META_SUFFIX = [
  "Atakum'a Aynı Gün Teslimat",
  "Atakum'da 1 Saatte Kapıda",
  "Atakum & Samsun Hızlı Teslimat",
  "Kapıda Ödeme, Hızlı Teslimat",
];

function metaTitleFor(a: Attr, K: string, h: number): string {
  if (a.cat === "live") return `${K} | Atakum Pet Shop — Sahiplenme Rehberi`;
  if (a.cat === "retailer") return `${K} | Atakum Pet Shop — Yerel Alternatif`;
  if (a.cat === "service") return `${K} | Atakum Pet Shop — Bilgilendirme`;
  return `${K} | Atakum Pet Shop — ${pick(META_SUFFIX, h, 71)}`;
}

function metaDescFor(a: Attr, kw: string, K: string, h: number): string {
  if (a.cat === "live") {
    return `${trCap(kw)}: Atakum Pet Shop canlı hayvan satışı yapmaz; sahiplenme için yerel barınakları öneririz. Mama ve bakım ürünleri Atakum'da hızlı teslimat. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${trCap(kw)}: Atakum Pet Shop bu hizmeti vermez; ihtiyacınız olan ürünleri Atakum içinde aynı gün kapınıza getiririz. Kapıda ödeme, ${PHONE}.`;
  }
  if (a.cat === "retailer") {
    return `${trCap(kw)}: Atakum Pet Shop bağımsız bir yerel alternatiftir. Aynı ürünler Atakum'da 1 saatte kapıda, kapıda ödemeyle. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return pick(
    [
      `${trCap(kw)} mı arıyorsunuz? ${trCap(noun)} ve tüm pet ürünleri Atakum içinde ortalama 1 saatte kapınızda. Kapıda ödeme, ${PHONE}.`,
      `${trCap(kw)} için Atakum Pet Shop: geniş ürün yelpazesi, Atakum'a aynı gün teslimat ve kapıda ödeme. ${PHONE}.`,
      `${trCap(kw)} — Atakum ve Samsun'da hızlı teslimat. ${trCap(noun)} dahil yüzlerce ürün, kapıda nakit/kart/QR. ${PHONE}.`,
    ],
    h,
    72,
  );
}

function buildPage(e: Ent, idx: number, related: { text: string; href: string }[]): SeoPageData {
  const { kw, slug, a } = e;
  const h = H(slug);
  const K = trTitle(kw);
  const hoods = hoodsFor(h);

  const main = mainSection(a, kw, K, h);
  const support = rotate([deliverySection(K, hoods, h), whySection(h), orderSection(h), localSection(hoods, h)], h, 81).slice(0, 3);

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
    keywords: `${kw}, ${kw} atakum, atakum ${kw}, ${kw} samsun, ${kw} kapıda ödeme, ${kw} aynı gün teslimat`,
    h1: pick(
      [
        `${K} — Atakum Pet Shop`,
        `${K} | Atakum'da Hızlı Teslimat`,
        `${K} — Atakum & Samsun`,
      ],
      h,
      82,
    ),
    intro: [
      pick(
        [
          `${trCap(kw)} mı arıyorsunuz? Atakum Pet Shop, ${ADDR} adresinden Atakum'un tüm mahallelerine teslimat yapan yerel bir pet shop.`,
          `Atakum ve Samsun'da ${kw} deyince akla gelen adreslerden biri olmayı hedefliyoruz; ihtiyacınızı hızlıca kapınıza getiriyoruz.`,
          `${trCap(kw)} konusunda doğru ürün ve hızlı teslimat için Atakum Pet Shop yanınızda.`,
        ],
        h,
        91,
      ),
      `${pick(ORDER_LINES, h, 92)} ${pick(SPEED_LINES, h, 93)}`,
      `${pick(PAY_LINES, h, 94)} Atakum Pet Shop her gün ${HOURS} saatleri arasında hizmetinizdedir.`,
    ],
    sections: [main, ...support],
    features: [
      ...rotate(WHY_POINTS, h, 95).slice(0, 4),
      catFeature,
      `${ADDR} — ${PHONE}`,
    ],
    faq: faqFor(a, kw, K, h),
    internalLinks: related,
  };
}

export const ATAKUM_ALL_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildPage(e, i, relatedFor(e, i)),
);
