// ---------------------------------------------------------------------------
// JETGO-EXCLUSIVE Pro Plan / pet-food keyword landing pages.
//
// jetgomarket.com (store id "jetgo", a LOCAL same-day Atakum/Samsun store) gets
// its OWN dedicated SEO landing page for every Pro Plan / pet-food keyword in
// attached_assets/PROPLAN_1781957074906.txt (see proplan-keywords.ts). These are
// PRODUCT/BRAND keywords (NOT geo terms), so they carry bespoke, product-aware,
// long-form content anchored to the JETGO brand + same-day Atakum/Samsun delivery.
//
// They are tagged `storeId: "jetgo"` so they are served ONLY on jetgomarket.com
// (sibling JETGO domains jetgo.pet / jetgo.shop and every cargo domain never see
// them). Slugs are NEW (not in the shared corpus); seo-data.ts pushes them while
// skipping any slug that would clobber a hand-authored NON-keyword curated page.
//
// TRUTHFULNESS RULES (load-bearing — keep them):
//  - Retailer keywords (Hepsiburada / Trendyol / n11 / Migros / Amazon ...) are
//    framed as LOCAL ALTERNATIVE / price-comparison intent. We NEVER claim to be,
//    or be affiliated with, that marketplace.
//  - Barcode keywords help IDENTIFY a product; we never guarantee exact stock.
//  - "fiyat / en ucuz" pages NEVER state fabricated prices — only our value model
//    (nakit indirim, kampanya).
//  - "yorum / ekşi / şikayet" pages NEVER fabricate reviews, ratings or complaints.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { PROPLAN_KEYWORDS } from "./proplan-keywords";
import { slugify, trTitle, trCap } from "./keyword-pages";

const STORE_ID = "jetgo";
const PHONE = "0850 840 39 59";
const ADDR = "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun";
const DOMAIN = "jetgomarket.com";

const SPEED_LINE =
  "Atakum içinde ortalama 1 saatte, Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün siparişiniz kapınızda olur.";
const ORDER_LINE = `${DOMAIN} üzerinden ürünleri seçip sepete ekleyin; WhatsApp ile tek tıkla ya da ${PHONE} numaralı hattımızı arayarak siparişinizi onaylayın.`;
const PAY_LINE =
  "Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilirsiniz; nakit ödemede avantajlı fiyat sunarız.";
const STORE_LINE = `JETGO Pet Shop ${ADDR} adresinden Atakum ve Samsun geneline kapınıza teslimat yapar.`;
const ORIGINAL_LINE =
  "Tüm ürünlerimiz orijinal ve faturalıdır; son kullanma tarihi uzun, doğru saklanmış ürünleri stoklarımızda bulundururuz.";

// Atakum + Samsun mahalle/ilçe — rotated per page so delivery copy stays unique.
const NEIGHBORHOODS = [
  "Denizevleri", "Atakent", "Mimar Sinan", "Yenimahalle", "Kurupelit", "Cumhuriyet",
  "Körfez", "Esenevler", "Çatalçam", "Aksu", "Taflan", "Balaç", "Güzelyalı",
  "İncesu", "Alanlı", "Kamalı", "Beypınar", "Yeşiltepe", "Karakavuk", "Elmaçukuru",
  "İlkadım", "Canik", "Tekkeköy", "Bafra yolu çevresi",
];

// ---------------------------------------------------------------------------
// Product-attribute analysis.
// ---------------------------------------------------------------------------

type Animal = "kedi" | "köpek" | "genel";
type Stage = "yavru" | "yetişkin" | "yaşlı" | "anne" | "";
type Intent = "product" | "fiyat" | "retailer" | "info" | "barcode";

interface Attr {
  animal: Animal;
  stage: Stage;
  flavor: string;
  size: string;
  diet: string;
  dietKey: string;
  intent: Intent;
  retailer: string;
  brand: string;
  isProplan: boolean;
}

function detectAnimal(k: string): Animal {
  const dog = k.search(/köpek|kopek|puppy|husky|labrador|rottweiler|poodle|terrier|alman kurd|\bpug\b|new dog|maxi|robust/);
  const cat = k.search(/kedi|kitten|maine coon|british|coon|hairball|uzun tüylü/);
  if (dog === -1 && cat === -1) return "genel";
  if (dog === -1) return "kedi";
  if (cat === -1) return "köpek";
  return dog < cat ? "köpek" : "kedi";
}

function detectStage(k: string): Stage {
  if (/\banne\b|hamile|gebe|emziren/.test(k)) return "anne";
  if (/yaşl|senior|optiage|longevis|after care|7\+|adult 7/.test(k)) return "yaşlı";
  if (/yavru|kitten|puppy|junior|optistart|original kitten|new born|yeni doğan/.test(k)) return "yavru";
  if (/yetişkin|yetiskin|adult|adulte/.test(k)) return "yetişkin";
  return "";
}

function detectFlavor(k: string): string {
  if (/tavuk/.test(k)) return "tavuklu";
  if (/kuzu/.test(k)) return "kuzu etli";
  if (/biftek|sığır|sigir|dana|parça etli|parca etli/.test(k)) return "biftekli";
  if (/somon|losos|alabalık|alabalik/.test(k)) return "somonlu";
  if (/morina|okyanus|balık|balik|deniz ürün/.test(k)) return "balıklı";
  if (/hindi/.test(k)) return "hindili";
  if (/zeytinyağ|zeytinyag/.test(k)) return "zeytinyağlı";
  return "";
}

function detectSize(k: string): string {
  const kgDec = k.match(/(\d{1,3})[.,](\d)\s*(kg|kilo)/);
  if (kgDec) return `${kgDec[1]}.${kgDec[2]} kg`;
  const kgSp = k.match(/\b(\d{1,3})\s+(\d)\s*(kg|kilo)\b/);
  if (kgSp) return `${kgSp[1]}.${kgSp[2]} kg`;
  const kg = k.match(/\b(\d{1,3})\s*(kg|kilo)\b/);
  if (kg) return `${kg[1]} kg`;
  const gr = k.match(/\b(\d{2,4})\s*(gr|gram)\b/);
  if (gr) return `${gr[1]} gr`;
  return "";
}

const DIETS: Array<[RegExp, string, string]> = [
  [/liveclear|live clear|lıveclear|new clear/, "liveclear", "LiveClear — kedi tüyündeki başlıca alerjeni azaltmaya yardımcı"],
  [/kısırlaş|kisirlas|sterilised|sterilized|sterilize/, "sterilised", "kısırlaştırılmış kedi ve köpekler için kilo dengeli"],
  [/hypoallergenic|\bha\b|\bvd ha\b|anti alerjik|alerjik|alerjen|alerji/, "hypo", "alerji ve gıda hassasiyeti yönetimi (hypoallergenic)"],
  [/gastrointestinal|gastro|opti digest|sindirim/, "gastro", "sindirim sistemi desteği (gastrointestinal)"],
  [/urinary|idrar|üriner|uriner/, "urinary", "idrar yolu sağlığı desteği (urinary)"],
  [/renal|böbrek|bobrek/, "renal", "böbrek fonksiyonu desteği (renal)"],
  [/hepatic|karaciğer|karaciger/, "hepatic", "karaciğer desteği (hepatic)"],
  [/cardiac|kalp/, "cardiac", "kalp sağlığı desteği (cardiac)"],
  [/diyabet|diabet/, "diyabet", "kan şekeri yönetimi desteği (diyabet)"],
  [/mobility|\bjm\b|eklem/, "mobility", "eklem ve hareket desteği (Mobility)"],
  [/derma|dermatosis|dermacare|drm|opti derma/, "derma", "deri ve tüy sağlığı desteği (derma)"],
  [/hairball/, "hairball", "tüy yumağı kontrolü (hairball)"],
  [/sensitive|hassas|delicate|seçici|secici|sensible|sensitif|elegant/, "sensitive", "hassas sindirim ve deri için (sensitive)"],
  [/light|fit 32|obes|obez|diyet|kilo kontrol/, "light", "kilo kontrolü için light formül"],
  [/duo delice|duo délice|duo delıce/, "duo", "Duo Délice — etli yumuşak parçacıklı çıtır mama"],
  [/nutrisavour|opti savour|optisavour|ıslak|islak|yaş mama|yas mama|sachet|konserve|pouch|gravy|gourmet/, "yas", "yaş/ıslak mama"],
  [/forti ?flora|probiyotik|probiotik|probiotic|\bflora\b/, "flora", "FortiFlora bağırsak florası/probiyotik takviyesi"],
  [/hydracare/, "hydra", "su tüketimini destekleyen (Hydracare)"],
  [/optistart/, "optistart", "OptiStart — yavruda bağışıklık ve gelişim desteği"],
  [/recovery|convalescence|nekahat/, "recovery", "iyileşme ve nekahat dönemi beslenmesi"],
];

function detectDiet(k: string): { diet: string; dietKey: string } {
  for (const [re, key, label] of DIETS) {
    if (re.test(k)) return { diet: label, dietKey: key };
  }
  return { diet: "", dietKey: "" };
}

const RETAILERS: Array<[RegExp, string]> = [
  [/hepsiburada/, "Hepsiburada"], [/trendyol/, "Trendyol"], [/\bn11\b/, "n11"],
  [/amazon/, "Amazon"], [/migros/, "Migros"], [/carrefour/, "CarrefourSA"],
  [/akakçe|akakce/, "Akakçe"], [/cimri/, "Cimri"], [/petlebi/, "Petlebi"],
  [/obivan/, "ObiVan"], [/baykal/, "Baykal Pet Shop"], [/gittigidiyor/, "GittiGidiyor"],
];

const OTHER_BRANDS: Array<[RegExp, string]> = [
  [/royal canin/, "Royal Canin"], [/hill'?s|hills/, "Hill's"], [/bonacibo/, "Bonacibo"],
  [/sanabelle/, "Sanabelle"], [/spectrum/, "Spectrum"], [/n&d|nd mama/, "N&D"],
  [/reflex|refleks/, "Reflex"], [/brit care/, "Brit Care"], [/prochoice/, "ProChoice"],
  [/dog chow/, "Dog Chow"], [/pro performance/, "Pro Performance"], [/pro line/, "Pro Line"],
  [/mystic/, "Mystic"], [/new dog/, "New Dog"], [/unique/, "Unique"], [/temizmama/, "Temizmama"],
  [/markamama|marka mama/, "Markamama"], [/bozita/, "Bozita"], [/acana/, "Acana"],
];

function detectIntent(k: string): { intent: Intent; retailer: string } {
  if (/^\d{6,}$/.test(k.replace(/\s/g, ""))) return { intent: "barcode", retailer: "" };
  for (const [re, name] of RETAILERS) {
    if (re.test(k)) return { intent: "retailer", retailer: name };
  }
  if (/içindekiler|icindekiler|özellik|ozellik|hakkında|hakkinda|yorum|ekşi|eksi|şikayet|sikayet|nedir|resmi site|web site|sitesi|\bsite\b|numune|içerik|içerig|içindeki/.test(k)) {
    return { intent: "info", retailer: "" };
  }
  if (/fiyat|ucuz|kampanya|indirim|toptan|outlet|fabrika satış|fabrika satis|en ucuz|uygun fiyat/.test(k)) {
    return { intent: "fiyat", retailer: "" };
  }
  return { intent: "product", retailer: "" };
}

function detectBrand(k: string, isProplan: boolean): string {
  if (isProplan) return "Pro Plan";
  for (const [re, name] of OTHER_BRANDS) {
    if (re.test(k)) return name;
  }
  return "";
}

function analyze(rawKw: string): Attr {
  const k = rawKw.toLocaleLowerCase("tr-TR");
  const isProplan = /pro ?plan|purina|optistart|nutrisavour|duo delice|liveclear|opti ?derma|opti ?digest|forti ?flora/.test(k);
  const { intent, retailer } = detectIntent(k);
  const { diet, dietKey } = detectDiet(k);
  return {
    animal: detectAnimal(k),
    stage: detectStage(k),
    flavor: detectFlavor(k),
    size: detectSize(k),
    diet,
    dietKey,
    intent,
    retailer,
    brand: detectBrand(k, isProplan),
    isProplan,
  };
}

// ---------------------------------------------------------------------------
// Content helpers.
// ---------------------------------------------------------------------------

function animalWord(a: Animal): string {
  return a === "kedi" ? "kedi" : a === "köpek" ? "köpek" : "evcil dostunuz";
}

function stageWord(s: Stage): string {
  switch (s) {
    case "yavru": return "yavru";
    case "yetişkin": return "yetişkin";
    case "yaşlı": return "yaşlı (senior)";
    case "anne": return "anne/gebe";
    default: return "";
  }
}

// A human, truthful one-line product descriptor built from the parsed attributes.
function descriptor(a: Attr): string {
  const bits: string[] = [];
  if (a.stage) bits.push(stageWord(a.stage));
  if (a.flavor) bits.push(a.flavor);
  const brand = a.brand || (a.isProplan ? "Pro Plan" : "");
  if (brand) bits.push(brand);
  if (a.animal === "kedi") bits.push("kedi maması");
  else if (a.animal === "köpek") bits.push("köpek maması");
  else bits.push("evcil hayvan maması");
  let s = bits.join(" ");
  if (a.size) s += ` (${a.size})`;
  return s;
}

// Stage / diet aware benefit paragraph used in the product explainer.
function benefitParagraph(a: Attr): string {
  const animal = animalWord(a.animal);
  if (a.dietKey) {
    const dietLines: Record<string, string> = {
      sterilised: `Kısırlaştırma sonrası ${animal}lerin enerji ihtiyacı düşer ve kilo alma eğilimi artar. Bu ürün dengeli kalori ve destekleyici besin profiliyle ideal kilonun korunmasına yardımcı olur.`,
      light: `Fazla kilolu ${animal}ler için düşük yağlı, dengeli kalorili light formül; tokluk hissini destekleyip ideal kiloya ulaşmayı kolaylaştırmayı amaçlar.`,
      sensitive: `Hassas sindirim sistemi veya hassas derisi olan ${animal}ler için seçilmiş, sindirimi kolay içerikli formül; cilt ve tüy sağlığını destekler.`,
      gastro: `Sindirim sorunları yaşayan ${animal}ler için kolay sindirilebilir, mideyi yormayan içerikli bir formüldür. Veteriner önerisiyle kullanılması tavsiye edilir.`,
      urinary: `İdrar yolu sağlığını desteklemek için tasarlanmış formül, mesane sağlığına katkı sağlayacak şekilde dengelenmiştir. Veteriner önerisini dikkate alın.`,
      hypo: `Gıda alerjisi ve hassasiyeti olan ${animal}ler için sınırlı/seçilmiş protein kaynaklı formül; tepkimeleri azaltmaya yardımcı olmayı amaçlar.`,
      renal: `Böbrek desteğine ihtiyaç duyan ${animal}ler için ayarlanmış mineral ve protein dengesine sahip diyet mamadır; mutlaka veteriner kontrolünde verilmelidir.`,
      hepatic: `Karaciğer desteğine yönelik formül; ${animal}inizin tedavi sürecinde veteriner önerisiyle kullanılması gereken bir diyet mamadır.`,
      cardiac: `Kalp sağlığını desteklemeye yönelik dengeli mineral profili sunan diyet mama; veteriner kontrolünde tercih edilmelidir.`,
      diyabet: `Kan şekeri dengesini desteklemeye yönelik formül; diyabet yönetiminde veteriner önerisiyle kullanılması önerilir.`,
      mobility: `Eklem ve hareket sağlığını desteklemeye yönelik içeriklerle, aktif veya ileri yaştaki ${animal}lerin konforuna katkı sağlamayı amaçlar.`,
      derma: `Deri ve tüy sağlığını desteklemek için omega yağ asitleri açısından dengelenmiş formül; sağlıklı ve parlak tüyleri destekler.`,
      hairball: `Tüy yumağı oluşumunu azaltmaya yardımcı lif dengesiyle, özellikle uzun tüylü kedilerin sindirim konforunu destekler.`,
      duo: `Çıtır kroketler ile yumuşak etli parçacıkları birleştiren Duo Délice; seçici damak tadına sahip ${animal}ler için iştah açıcı bir seçenektir.`,
      yas: `Yüksek su içeriğiyle yaş/ıslak mama, ${animal}inizin sıvı alımını ve damak keyfini destekler; kuru mamayla birlikte de kullanılabilir.`,
      flora: `Bağırsak florasını ve sindirim dengesini desteklemeye yönelik probiyotik takviyesi; hassas sindirimli ${animal}ler için faydalı bir destektir.`,
      hydra: `Su tüketimini artırmaya yardımcı içerikle, özellikle yeterince su içmeyen kedilerde idrar yolu konforunu destekler.`,
      optistart: `Anne sütündeki kolostrum esinli OptiStart desteğiyle, yavruların bağışıklık sistemine ve sağlıklı gelişimine katkı sağlamayı amaçlar.`,
      liveclear: `LiveClear teknolojisi, kedi tüyü ve tükürüğündeki başlıca alerjeni azaltmaya yardımcı olarak alerjisi olan ev halkı için daha konforlu bir ortam hedefler.`,
      recovery: `Ameliyat sonrası veya iyileşme döneminde, yoğun besin ve enerji ihtiyacını karşılamaya yönelik formül; veteriner önerisiyle kullanın.`,
    };
    return dietLines[a.dietKey] ?? `${trCap(animal)}inizin ihtiyacına yönelik özel formüllü bir üründür.`;
  }
  switch (a.stage) {
    case "yavru":
      return `Yavru dönemi hızlı büyüme ve gelişim dönemidir. Yüksek protein, kemik-diş gelişimi için kalsiyum ve bağışıklık desteğiyle yavru ${animal}inizin sağlıklı büyümesine katkı sağlar.`;
    case "yaşlı":
      return `İleri yaştaki ${animal}lerin yavaşlayan metabolizması ve eklem ihtiyacı göz önünde bulundurularak hazırlanmış, kolay sindirilebilir senior formül; yaşam kalitesini desteklemeyi amaçlar.`;
    case "anne":
      return `Gebelik ve emzirme döneminde anne ${animal}lerin artan enerji ve besin ihtiyacını karşılamaya yönelik zenginleştirilmiş formüldür.`;
    case "yetişkin":
      return `Yetişkin ${animal}lerin günlük enerji, kas ve bağışıklık ihtiyacını dengeli şekilde karşılayan, ideal kilonun korunmasına yardımcı tam ve dengeli bir mamadır.`;
    default:
      return `${trCap(animal)}inizin günlük beslenmesinde dengeli protein, vitamin ve mineral profiliyle sağlıklı bir seçenektir.`;
  }
}

function flavorParagraph(a: Attr): string | null {
  if (!a.flavor) return null;
  const animal = animalWord(a.animal);
  const map: Record<string, string> = {
    "tavuklu": `Tavuklu içeriği, yüksek kaliteli hayvansal protein kaynağı olarak ${animal}ler tarafından sevilen, lezzetli ve kolay kabul gören bir seçenektir.`,
    "kuzu etli": `Kuzu etli formül, sindirimi kolay protein arayan ve tavuğa karşı seçici olan ${animal}ler için lezzetli bir alternatiftir.`,
    "biftekli": `Biftek/sığır etli içeriği, yoğun et aromasıyla iştahlı ${animal}lerin damak tadına hitap eder.`,
    "somonlu": `Somon/alabalık içeriği omega yağ asitleri açısından zengindir; deri ve tüy sağlığını destekler, balık sevenler için idealdir.`,
    "balıklı": `Balıklı (morina/okyanus balığı) içeriği, omega yağ asitleri ve sevilen deniz aroması sunarak hem lezzet hem deri-tüy desteği sağlar.`,
    "hindili": `Hindili formül, yağ oranı düşük yalın bir protein kaynağı arayanlar için hafif ve lezzetli bir seçenektir.`,
    "zeytinyağlı": `Zeytinyağı ile zenginleştirilmiş içerik, tüy sağlığına katkı sağlayan sağlıklı yağ profili sunar.`,
  };
  return map[a.flavor] ?? null;
}

// ---------------------------------------------------------------------------
// Section builders by intent.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function explainerSection(K: string, a: Attr): Section {
  const paras: string[] = [];
  if (a.intent === "retailer") {
    const r = a.retailer || "pazaryerleri";
    paras.push(
      `${r} üzerinde "${K}" araştıranlar için JETGO, Samsun'un yerel ve hızlı pet shop alternatifidir. ${r} gibi pazaryerlerinden bağımsız bir işletmeyiz; ${r} ile resmi bir bağlantımız yoktur. Avantajımız aracı kargo beklemeden Atakum ve Samsun içinde aynı gün, kapınıza teslimattır.`,
      `Fiyatları farklı platformlarda karşılaştırabilirsiniz; JETGO'da orijinal ve faturalı ürünü kapıda ödeme avantajıyla, ürün elinize ulaştıktan sonra ödeyerek alırsınız. ${benefitParagraph(a)}`,
    );
    return { h2: `${r} Yerine JETGO ile Aynı Gün Yerel Teslimat`, paragraphs: paras };
  }
  if (a.intent === "barcode") {
    paras.push(
      `Aradığınız barkod, bir Pro Plan ürününü tanımlamaya yarayan numaradır. Doğru varyantı (kedi/köpek, yaş grubu, tat ve gramaj) seçtiğinizden emin olmak için sipariş sırasında barkodu bizimle WhatsApp üzerinden paylaşabilirsiniz; JETGO ekibi doğru ürünü teyit eder.`,
      `Stok durumu zamanla değişebileceğinden belirli bir barkodun her zaman mevcut olduğunu garanti etmeyiz; güncel stok için ${PHONE} hattından bilgi alabilirsiniz. ${ORIGINAL_LINE}`,
    );
    return { h2: `Barkod ile Doğru Pro Plan Ürününü Bulun`, paragraphs: paras };
  }
  if (a.intent === "info") {
    paras.push(
      `${K} hakkında bilgi arıyorsanız: Pro Plan, Purina'nın bilimsel beslenme odaklı premium serisidir. Ürünlerde genellikle birincil protein kaynağı (tavuk, kuzu, somon vb.), prebiyotikler, omega-3/omega-6 yağ asitleri ve yaş grubuna uygun vitamin-mineral dengesi bulunur.`,
      `Kesin analitik değerler (protein/yağ oranı, içindekiler listesi) ürün ambalajında ve üreticinin resmi bilgilerinde yer alır; satın almadan önce ambalaj bilgisini kontrol etmenizi öneririz. ${benefitParagraph(a)}`,
    );
    return { h2: `${K}: Bilmeniz Gerekenler`, paragraphs: paras };
  }
  if (a.intent === "fiyat") {
    paras.push(
      `${K} arayanlar için JETGO uygun fiyat ve şeffaf alışveriş sunar. Güncel fiyat ve kampanyalar dönemsel değişebildiğinden en doğru tutarı ürün sayfasında görebilir ya da WhatsApp / ${PHONE} üzerinden teyit edebilirsiniz.`,
      `Nakit ödemede avantajlı fiyat ve kapıda ödeme imkânıyla bütçenizi korursunuz. ${benefitParagraph(a)}`,
    );
    return { h2: `${K} için JETGO'da Fiyat Avantajı`, paragraphs: paras };
  }
  // product
  const fp = flavorParagraph(a);
  paras.push(`${benefitParagraph(a)}`);
  if (fp) paras.push(fp);
  else paras.push(`${ORIGINAL_LINE} Doğru ürünü seçmekte tereddüt yaşarsanız WhatsApp hattımızdan ücretsiz öneri alabilirsiniz.`);
  return { h2: `${K} Özellikleri ve Kimler İçin Uygun?`, paragraphs: paras };
}

function whyJetgoSection(K: string): Section {
  return {
    h2: `${K} için Neden JETGO?`,
    paragraphs: [
      `${K} ihtiyacınızı JETGO Pet Shop orijinal ürün ve fatura garantisiyle karşılar. Mama bitmeden sipariş verin; ağır mama çuvalını taşımayın, kurye ekibimiz apartman katınıza kadar getirsin. ${SPEED_LINE}`,
      `${ORDER_LINE} ${PAY_LINE}`,
    ],
    list: [
      "Orijinal ve faturalı ürün, uzun son kullanma tarihi",
      "Atakum içinde ortalama 1 saatte, Samsun geneline aynı gün teslimat",
      "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme",
      `Ücretsiz ürün danışmanlığı — WhatsApp ve ${PHONE}`,
    ],
  };
}

function feedingSection(K: string, a: Attr): Section {
  const animal = animalWord(a.animal);
  const paras: string[] = [];
  paras.push(
    `Mama geçişini 7-10 güne yayarak yapın: yeni mamayı eski mamaya kademeli olarak ekleyin; böylece sindirim sistemi yeni formüle yumuşak bir geçiş yapar. Önünde her zaman temiz ve taze su bulundurun.`,
  );
  if (a.stage === "yavru") {
    paras.push(`Yavru ${animal}ler günde küçük porsiyonlarla, sık aralıklarla beslenir. Paket üzerindeki yaşa/kiloya göre porsiyon tablosunu takip edin ve büyüme hızını veterinerinizle değerlendirin.`);
  } else if (a.dietKey && ["renal", "hepatic", "urinary", "gastro", "cardiac", "diyabet", "recovery", "hypo"].includes(a.dietKey)) {
    paras.push(`Bu ürün özel/diyet ihtiyaçlara yöneliktir; günlük miktar ve kullanım süresi için mutlaka veterinerinizin önerisini esas alın. Diyet mamalar tek başına tedavi değildir, beslenme desteğidir.`);
  } else {
    paras.push(`Günlük porsiyonu ${animal}inizin kilosuna ve aktivite düzeyine göre paket üzerindeki tabloya uygun ayarlayın. İdeal kiloyu korumak için porsiyon ölçmeyi ihmal etmeyin.`);
  }
  return { h2: `${trCap(animal)} Beslenmesinde Doğru Kullanım`, paragraphs: paras };
}

function deliverySection(K: string, hoods: string[]): Section {
  return {
    h2: `${K} Atakum ve Samsun'a Teslimat`,
    paragraphs: [
      `${K} siparişlerinizi Atakum'un tüm mahallelerine kurye ile ulaştırıyoruz. Aşağıdaki bölgelere Atakum içinde ortalama 1 saatte; İlkadım, Canik ve Tekkeköy geneline aynı gün teslimat yapıyoruz. ${STORE_LINE}`,
    ],
    list: hoods.map((n) => `${n} bölgesine hızlı teslimat`),
  };
}

// ---------------------------------------------------------------------------
// FAQ.
// ---------------------------------------------------------------------------

function faqFor(K: string, a: Attr): Array<{ q: string; a: string }> {
  const out: Array<{ q: string; a: string }> = [];
  if (a.intent === "retailer" && a.retailer) {
    out.push({
      q: `JETGO, ${a.retailer} mi veya ${a.retailer} ile bağlantılı mı?`,
      a: `Hayır. JETGO, Samsun merkezli bağımsız bir yerel pet shop'tur ve ${a.retailer} ile resmi bir bağlantısı yoktur. Farkımız, aracı kargo beklemeden Atakum ve Samsun içinde aynı gün kapıya teslimat ve kapıda ödeme sunmamızdır.`,
    });
  }
  if (a.intent === "barcode") {
    out.push({
      q: `Bu barkodun ürünü stokta mı?`,
      a: `Stok durumu değişebildiği için garanti vermiyoruz. Barkodu WhatsApp'tan veya ${PHONE} numarasından iletin; doğru varyantı ve güncel stoğu teyit edip aynı gün kapınıza gönderelim.`,
    });
  }
  if (a.intent === "fiyat") {
    out.push({
      q: `${K} fiyatı ne kadar?`,
      a: `Güncel fiyat ve kampanyalar dönemsel değişebilir; en doğru tutarı ürün sayfasında veya ${PHONE} / WhatsApp üzerinden öğrenebilirsiniz. Nakit ödemede avantajlı fiyat sunarız.`,
    });
  }
  if (a.intent === "info") {
    out.push({
      q: `${K} içindekiler ve özellikleri nelerdir?`,
      a: `Kesin içindekiler listesi ve analitik değerler ürün ambalajında ve üreticinin resmi bilgilerinde yer alır. JETGO olarak orijinal ve faturalı ürün sağlar, doğru ürün seçiminde ücretsiz danışmanlık veririz.`,
    });
  }
  if (a.dietKey && ["renal", "hepatic", "urinary", "gastro", "cardiac", "diyabet", "recovery"].includes(a.dietKey)) {
    out.push({
      q: `${K} veteriner önerisi gerektirir mi?`,
      a: `Evet, bu ürün özel/diyet beslenmeye yöneliktir; kullanım süresi ve miktarı için veterinerinizin önerisini esas alın. JETGO bu ürünü orijinal ve faturalı olarak kapınıza ulaştırır.`,
    });
  }
  if (out.length < 1 || a.intent === "product") {
    out.push({
      q: `${K} orijinal ve faturalı mı?`,
      a: `Evet, JETGO'daki tüm ürünler orijinal ve faturalıdır. Son kullanma tarihi uzun, doğru saklanmış ürünleri Atakum ve Samsun'da kapınıza teslim ediyoruz.`,
    });
  }
  out.push({
    q: `${K} teslimatı ne kadar sürer?`,
    a: `Atakum içinde ortalama 1 saatte, Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün siparişiniz kapınızda olur. Sabah verilen siparişler genellikle öğleden sonra elinizdedir.`,
  });
  out.push({
    q: `${K} için kapıda ödeme var mı?`,
    a: `Evet. Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilirsiniz; nakit ödemede avantajlı fiyat sunuyoruz. Sipariş ve destek için ${PHONE}.`,
  });
  return out;
}

// ---------------------------------------------------------------------------
// Entries, clustering and internal links.
// ---------------------------------------------------------------------------

interface Ent { kw: string; slug: string; a: Attr; cluster: string }

const _entries: Ent[] = [];
const _seen = new Set<string>();
for (const kw of PROPLAN_KEYWORDS) {
  const slug = slugify(kw);
  if (!slug || _seen.has(slug)) continue;
  _seen.add(slug);
  const a = analyze(kw);
  const cluster = `${a.animal}|${a.dietKey || a.stage || a.flavor || a.intent}`;
  _entries.push({ kw, slug, a, cluster });
}

const _byCluster = new Map<string, Ent[]>();
for (const e of _entries) {
  const arr = _byCluster.get(e.cluster);
  if (arr) arr.push(e);
  else _byCluster.set(e.cluster, [e]);
}

const CORE_LINKS: Array<{ text: string; href: string }> = [
  { text: "Kedi Maması", href: "/kedi-mamasi" },
  { text: "Köpek Maması", href: "/kopek-mamasi" },
  { text: "Kedi Kumu", href: "/kedi-kumu" },
];

function relatedFor(e: Ent, globalIdx: number): Array<{ text: string; href: string }> {
  const out: Array<{ text: string; href: string }> = [];
  const hrefs = new Set<string>();
  const push = (l: { text: string; href: string }) => {
    if (l.href === `/${e.slug}` || hrefs.has(l.href)) return;
    hrefs.add(l.href);
    out.push(l);
  };
  const sibs = _byCluster.get(e.cluster) ?? [];
  const sIdx = sibs.findIndex((s) => s.slug === e.slug);
  for (let off = 1; off <= sibs.length && out.length < 4; off++) {
    const sib = sibs[(sIdx + off) % sibs.length];
    push({ text: trTitle(sib.kw), href: `/${sib.slug}` });
  }
  // Fill from the full set if the cluster is tiny.
  for (let off = 1; off <= _entries.length && out.length < 4; off++) {
    const x = _entries[(globalIdx + off * 7) % _entries.length];
    push({ text: trTitle(x.kw), href: `/${x.slug}` });
  }
  push(CORE_LINKS[globalIdx % CORE_LINKS.length]);
  push(CORE_LINKS[(globalIdx + 1) % CORE_LINKS.length]);
  return out.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Page builder.
// ---------------------------------------------------------------------------

function metaTitleFor(K: string, a: Attr): string {
  switch (a.intent) {
    case "fiyat": return `${K} | JETGO Samsun — Uygun Fiyat, Kapıda Ödeme`;
    case "retailer": return `${K} | JETGO Samsun Yerel Alternatif — Aynı Gün`;
    case "info": return `${K} | JETGO Samsun Pet Shop`;
    case "barcode": return `${K} — Pro Plan Ürün | JETGO Samsun Pet Shop`;
    default: return `${K} | JETGO Pet Shop — Samsun'a Aynı Gün Kapıda`;
  }
}

function metaDescFor(kwCap: string, a: Attr): string {
  if (a.intent === "retailer" && a.retailer) {
    return `${kwCap} mi arıyorsunuz? ${a.retailer} yerine JETGO Samsun: orijinal ve faturalı ürün, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslim. Kapıda ödeme. ${PHONE}.`;
  }
  if (a.intent === "fiyat") {
    return `${kwCap} için JETGO: uygun fiyat, nakit indirimi. Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat, kapıda ödeme. ${PHONE}.`;
  }
  return `${kwCap} JETGO Pet Shop'ta. Orijinal ve faturalı; Atakum içinde 1 saatte, Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün kapıda teslimat ve kapıda ödeme. ${PHONE}.`;
}

function keywordsFor(kw: string, a: Attr): string {
  const base = [kw, `${kw} jetgo`, `${kw} samsun`, `${kw} atakum`, `${kw} kapıda ödeme`, `${kw} aynı gün teslimat`];
  if (a.intent !== "retailer") base.push(`${kw} fiyat`);
  return base.join(", ");
}

function buildJetgoPage(e: Ent, idx: number, related: Array<{ text: string; href: string }>): SeoPageData {
  const { kw, slug, a } = e;
  const K = trTitle(kw);
  const kwCap = trCap(kw);

  const hoods = Array.from({ length: 6 }, (_, i) => NEIGHBORHOODS[(idx * 3 + i) % NEIGHBORHOODS.length]);
  const uniqueHoods: string[] = [];
  for (const h of hoods) if (!uniqueHoods.includes(h)) uniqueHoods.push(h);

  const sections: Section[] = [
    explainerSection(K, a),
    whyJetgoSection(K),
    feedingSection(K, a),
    deliverySection(K, uniqueHoods),
  ];

  return {
    slug,
    type: "keyword",
    storeId: STORE_ID,
    availability: "localOnly",
    title: K,
    metaTitle: metaTitleFor(K, a),
    metaDescription: metaDescFor(kwCap, a),
    keywords: keywordsFor(kw, a),
    h1: `${K} — JETGO Pet Shop'tan Samsun'a Aynı Gün Kapıda`,
    intro: [
      `${kwCap} mı arıyorsunuz? JETGO Pet Shop, ${descriptor(a)} ihtiyacınızı orijinal ve faturalı ürünle, Atakum ve Samsun geneline hızlı teslimatla karşılar.`,
      `${ORDER_LINE} ${SPEED_LINE}`,
      `${PAY_LINE} ${STORE_LINE}`,
    ],
    sections,
    features: [
      "Orijinal ve faturalı ürün — uzun son kullanma tarihi",
      "Atakum içinde ortalama 1 saatte kapıda teslim",
      "Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün teslimat",
      "Kapıda nakit, POS ve QR ödeme",
      `Ücretsiz ürün danışmanlığı — ${PHONE}`,
    ],
    faq: faqFor(K, a),
    internalLinks: related,
  };
}

export const JETGO_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildJetgoPage(e, i, relatedFor(e, i)),
);
