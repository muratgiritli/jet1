// ---------------------------------------------------------------------------
// JETGO-EXCLUSIVE Royal Canin / pet-food keyword landing pages.
//
// jetgomarket.com (store id "jetgo", a LOCAL same-day Atakum/Samsun store) gets
// its OWN dedicated SEO landing page for every Royal Canin keyword in
// attached_assets/ROYAL_CANIN_1781963013203.txt (see royalcanin-keywords.ts).
// These are PRODUCT/BRAND keywords (NOT geo terms), so they carry bespoke,
// product-aware, long-form content anchored to the JETGO brand + same-day
// Atakum/Samsun delivery.
//
// Royal Canin's taxonomy is breed- / size-line- / veterinary-diet-heavy, so the
// analyzer below detects dog & cat BREEDS (Labrador, Persian, Sphynx ...), the
// SIZE LINES (X-Small / Mini / Medium / Maxi / Giant) and the VETERINARY diets
// (Renal, Gastrointestinal, Urinary S/O, Anallergenic, Satiety ...) to keep each
// article genuinely Royal Canin-aware instead of a thin brand swap.
//
// They are tagged `storeId: "jetgo"` so they are served ONLY on jetgomarket.com.
// Slugs are NEW (not in the shared corpus); seo-data.ts pushes them while skipping
// any slug that would clobber a hand-authored NON-keyword curated page and
// de-duplicating against the Pro Plan jetgo corpus (same store).
//
// TRUTHFULNESS RULES (load-bearing — keep them):
//  - Retailer keywords (Hepsiburada / Trendyol / n11 / Migros / Amazon / Petlebi
//    ...) are framed as LOCAL ALTERNATIVE / price-comparison intent. We NEVER
//    claim to be, or be affiliated with, that marketplace.
//  - Comparison keywords (e.g. "hills royal canin") are framed neutrally; we never
//    disparage another brand or invent test results.
//  - Barcode keywords help IDENTIFY a product; we never guarantee exact stock.
//  - "fiyat / en ucuz" pages NEVER state fabricated prices — only our value model
//    (nakit indirim, %5 Para Puan, kampanya).
//  - "yorum / ekşi / şikayet" pages NEVER fabricate reviews, ratings or complaints.
//  - We never present veterinary diets as a cure; they are nutritional support to
//    be used under veterinary guidance.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { ROYALCANIN_KEYWORDS } from "./royalcanin-keywords";
import { slugify, trTitle, trCap } from "./keyword-pages";

const STORE_ID = "jetgo";
const PHONE = "0850 840 39 59";
const ADDR = "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun";
const DOMAIN = "jetgomarket.com";
const BRAND = "Royal Canin";
const BRAND_BLURB =
  "Royal Canin; kedi ve köpekleri ırk, boyut, yaş ve özel sağlık ihtiyaçlarına göre sınıflandıran, bilimsel beslenme odaklı premium bir mama markasıdır. Ürünlerde ırka/boyuta özel kroket tasarımı, dengeli protein, prebiyotikler ve hedeflenmiş besin profilleri öne çıkar.";

const SPEED_LINE =
  "Atakum içinde ortalama 1 saatte, Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün siparişiniz kapınızda olur.";
const ORDER_LINE = `${DOMAIN} üzerinden ürünleri seçip sepete ekleyin; WhatsApp ile tek tıkla ya da ${PHONE} numaralı hattımızı arayarak siparişinizi onaylayın.`;
const PAY_LINE =
  "Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilir; nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan kazanırsınız.";
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
  breed: string;
  sizeLine: string;
  sizeLineDesc: string;
  intent: Intent;
  retailer: string;
  compareBrand: string;
  brand: string;
  isRC: boolean;
}

const DOG_BREEDS: Array<[RegExp, string]> = [
  [/labrador/, "Labrador Retriever"],
  [/golden retriever|\bgolden\b/, "Golden Retriever"],
  [/rottweiler/, "Rottweiler"],
  [/chihuahua/, "Chihuahua"],
  [/yorkshire/, "Yorkshire Terrier"],
  [/shih ?tzu/, "Shih Tzu"],
  [/jack russell/, "Jack Russell Terrier"],
  [/cocker/, "Cocker Spaniel"],
  [/border collie/, "Border Collie"],
  [/cavalier king charles|king charles/, "Cavalier King Charles Spaniel"],
  [/french bulldog/, "Fransız Bulldog"],
  [/bulldog/, "Bulldog"],
  [/cane corso/, "Cane Corso"],
  [/teckel|dachshund/, "Teckel (Dachshund)"],
  [/poodle/, "Poodle"],
  [/boxer/, "Boxer"],
  [/setter/, "Setter"],
  [/german shepherd|alman çoban|alman coban/, "Alman Çoban Köpeği"],
  [/\bpug\b/, "Pug"],
  [/beagle/, "Beagle"],
  [/husky/, "Sibirya Kurdu (Husky)"],
  [/retriever/, "Retriever"],
];

const CAT_BREEDS: Array<[RegExp, string]> = [
  [/persian|persan|iran kedisi/, "Persian (İran Kedisi)"],
  [/british shorthair|british/, "British Shorthair"],
  [/sphynx/, "Sphynx"],
  [/maine coon|\bcoon\b/, "Maine Coon"],
  [/ragdoll/, "Ragdoll"],
  [/norwegian forest|norwegian/, "Norveç Orman Kedisi"],
  [/siamese|siyam/, "Siyam"],
  [/bengal/, "Bengal"],
];

function detectBreed(k: string): { breed: string; animal: Animal } {
  for (const [re, name] of CAT_BREEDS) if (re.test(k)) return { breed: name, animal: "kedi" };
  for (const [re, name] of DOG_BREEDS) if (re.test(k)) return { breed: name, animal: "köpek" };
  return { breed: "", animal: "genel" };
}

// Royal Canin dog SIZE LINES (segmentation by adult bodyweight). Order matters:
// check x-small/xsmall before "small", and the explicit lines before generics.
const SIZE_LINES: Array<[RegExp, string, string]> = [
  [/x ?small|xsmall|\bxs\b/, "X-Small", "çok küçük ırk (yetişkin ağırlığı ~4 kg'a kadar)"],
  [/\bmini\b/, "Mini", "küçük ırk (yetişkin ağırlığı ~1-10 kg)"],
  [/\bmedium\b/, "Medium", "orta ırk (yetişkin ağırlığı ~11-25 kg)"],
  [/\bmaxi\b/, "Maxi", "büyük ırk (yetişkin ağırlığı ~26-44 kg)"],
  [/\bgiant\b/, "Giant", "dev ırk (yetişkin ağırlığı 45 kg ve üzeri)"],
  [/large dog|\blarge\b/, "Large", "büyük ırk"],
  [/small dog|\bsmall\b/, "Small", "küçük ırk"],
];

function detectSizeLine(k: string): { sizeLine: string; sizeLineDesc: string } {
  for (const [re, label, desc] of SIZE_LINES) {
    if (re.test(k)) return { sizeLine: label, sizeLineDesc: desc };
  }
  return { sizeLine: "", sizeLineDesc: "" };
}

// Cat-only product lines (used to disambiguate animal when no breed/explicit word).
const CAT_LINE_RE = /\bkitten\b|babycat|\bqueen\b|fit 32|regular fit|indoor 27|sensible 33|sterilised 37|hair ?& ?skin|hair skin|oral care|intense beauty|savour exigent|aroma exigent|protein exigent|\bexigent\b|home life indoor|\boutdoor\b|ageing 12|sphynx/;
const DOG_LINE_RE = /\bpuppy\b|babydog|\bmaxi\b|\bmedium\b|\bgiant\b|x ?small|xsmall|\bmini\b|dermacomfort|mother ?& ?babydog|mother and babydog|ageing 8|\bdr21\b|cane corso|rottweiler|labrador|retriever|french bulldog|jack russell|border collie|teckel|cocker|chihuahua|yorkshire|shih ?tzu/;

function detectAnimal(k: string, breedAnimal: Animal): Animal {
  if (breedAnimal !== "genel") return breedAnimal;
  if (/\bkedi\b|kitten|babycat|\bqueen\b|\bcat\b|gatos/.test(k)) return "kedi";
  if (/\bköpek\b|\bkopek\b|puppy|babydog|\bdog\b/.test(k)) return "köpek";
  if (CAT_LINE_RE.test(k)) return "kedi";
  if (DOG_LINE_RE.test(k)) return "köpek";
  return "genel";
}

function detectStage(k: string): Stage {
  if (/mother ?& ?babycat|mother and babycat|mother ?& ?babydog|mother and babydog|\banne\b|hamile|gebe|emziren|\bqueen\b|babydog milk|babycat milk/.test(k)) return "anne";
  if (/ageing|\bsenior\b|yaşl|yasl|\bmature\b|after care|12\s*\+|ageing 12|ageing 8/.test(k)) return "yaşlı";
  if (/babycat|babydog|new ?born|yeni doğan|pediatric|growth/.test(k)) return "yavru";
  if (/yavru|kitten|puppy|junior|starter/.test(k)) return "yavru";
  if (/yetişkin|yetiskin|adult|adulte|adulto|\bfit\b|regular fit/.test(k)) return "yetişkin";
  return "";
}

function detectFlavor(k: string): string {
  if (/tavuk|chicken/.test(k)) return "tavuklu";
  if (/kuzu|lamb/.test(k)) return "kuzu etli";
  if (/biftek|sığır|sigir|dana|\bbeef\b|parça etli|parca etli/.test(k)) return "biftekli";
  if (/somon|salmon|losos|alabalık|alabalik/.test(k)) return "somonlu";
  if (/morina|okyanus|balık|balik|\bfish\b|deniz ürün/.test(k)) return "balıklı";
  if (/hindi|turkey/.test(k)) return "hindili";
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

// Veterinary / functional diets. Order matters — most specific first.
const DIETS: Array<[RegExp, string, string]> = [
  [/anallergenic|annalergenic|annallergenic|anallergic|annalergic|analergic|annalergenic|annalergic|annalergenic/, "anallergenic", "şiddetli gıda alerjisi için hidrolize protein içeren (Anallergenic) diyet"],
  [/sensitivity control/, "sensitivity", "gıda intoleransı / advers gıda reaksiyonu yönetimi (Sensitivity Control)"],
  [/gastro ?intestinal|gastrointestinal|\bgastro\b|digest sensitive|digestive care|\bdigest\b|fibre response|gastro fibre/, "gastro", "sindirim sistemi desteği (Gastrointestinal / Digestive)"],
  [/urinary|idrar|üriner|uriner|urinary so|urinary uc|\bso\b|\buc\b|\bud\b/, "urinary", "idrar yolu sağlığı desteği (Urinary S/O, U/C)"],
  [/renal/, "renal", "böbrek fonksiyonu desteği (Renal)"],
  [/hepatic|karaciğer|karaciger|\bhe\b/, "hepatic", "karaciğer desteği (Hepatic)"],
  [/cardiac|\bkalp\b/, "cardiac", "kalp sağlığı desteği (Cardiac)"],
  [/satiety|\btokluk\b|weight management|weight care|light weight care/, "satiety", "kilo verme ve tokluk hissi desteği (Satiety / Weight Care)"],
  [/diabetic|diyabet|diabet/, "diyabet", "kan şekeri yönetimi (Diabetic)"],
  [/mobility|\beklem\b|\bjoint\b/, "mobility", "eklem ve hareket desteği (Mobility)"],
  [/high fibre|fibre response|\bfibre\b|\bfiber\b|yüksek lif/, "fibre", "yüksek lif içeriğiyle bağırsak düzeni desteği (Fibre Response)"],
  [/recovery|convalescence|nekahat/, "recovery", "iyileşme ve nekahat dönemi beslenmesi (Recovery)"],
  [/dental|oral care|\boral\b|ağız|diş sağlığı/, "dental", "diş ve ağız sağlığı desteği (Dental / Oral Care)"],
  [/calm|relax care|\bcalm\b|sakinleş/, "calm", "stres ve kaygı dönemlerinde sakinleştirici destek (Calm / Relax Care)"],
  [/dermacomfort|skin ?care|skin ?& ?coat|skin coat|hair ?& ?skin|hair skin|hair & skin|coat care|\bderma\b|\bskin\b|cilt|deri sağlığı/, "derma", "deri ve tüy sağlığı desteği (Dermacomfort / Skin & Coat)"],
  [/hypoallergenic|\bhypo\b|\bha\b/, "hypo", "gıda alerjisi/hassasiyeti yönetimi (Hypoallergenic)"],
  [/sterilised|sterilized|sterilize|kısırlaş|kisirlas|neutered/, "sterilised", "kısırlaştırılmış kedi/köpekler için kilo dengeli formül"],
  [/light weight|\blight\b|fit 32|regular fit|obez|obes|kilo kontrol/, "light", "kilo kontrolü / ideal ağırlık için light formül"],
  [/sensible|sensitive|hassas|delicate|exigent|seçici|secici|savour|aroma|protein exigent|elegant/, "sensitive", "hassas sindirim veya seçici damak tadı için (Sensible / Exigent)"],
  [/indoor|home life/, "indoor", "ev içinde yaşayan, daha az hareket eden kediler için (Indoor)"],
  [/outdoor/, "outdoor", "dışarı çıkan, aktif kediler için yüksek enerjili formül (Outdoor)"],
  [/mother ?& ?babycat|mother and babycat|babycat|mother ?& ?babydog|mother and babydog|babydog|\bstarter\b/, "starter", "gebelik/emzirme ve ilk katı gıda dönemi (Starter / Mother & Baby)"],
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

// Competitor / other brands. If a keyword names one of these and does NOT also
// mention Royal Canin, we MUST NOT present it as a Royal Canin product (the source
// keyword list carries a little noise). We then frame the page truthfully around
// JETGO as a fast multi-brand local pet shop (check-stock / premium alternative),
// never claiming the item is Royal Canin. If a keyword names BOTH (e.g. "hills
// royal canin"), it is a comparison and stays Royal Canin-centric. Order matters:
// multi-word / specific patterns first.
const COMPETITOR_BRANDS: Array<[RegExp, string]> = [
  [/pro ?plan|proplan/, "Pro Plan"],
  [/hill'?s|hills/, "Hill's"],
  [/brit ?care|\bbrit\b/, "Brit Care"],
  [/n ?& ?d|\bn&d\b|nd mama/, "N&D"],
  [/acana/, "Acana"],
  [/orijen/, "Orijen"],
  [/sanabelle/, "Sanabelle"],
  [/bozita/, "Bozita"],
  [/monge/, "Monge"],
  [/whiskas|dentabites|dreamies|temptations/, "Whiskas"],
  [/sheba/, "Sheba"],
  [/felix/, "Felix"],
  [/friskies/, "Friskies"],
  [/perfect ?fit/, "Perfect Fit"],
  [/reflex ?plus|reflex/, "Reflex"],
  [/felicia/, "Felicia"],
  [/\benjoy\b/, "Enjoy"],
  [/lavital/, "LaVital"],
  [/pronature/, "Pronature"],
  [/prochoice|pro ?choice/, "ProChoice"],
  [/properformance|pro ?performance/, "ProPerformance"],
  [/crave/, "Crave"],
  [/gourmet/, "Gourmet"],
  [/matisse/, "Matisse"],
  [/farmina/, "Farmina"],
  [/josera/, "Josera"],
  [/happy ?(cat|dog)/, "Happy Cat / Happy Dog"],
  [/bonacibo/, "Bonacibo"],
  [/me-?o\b|\bmeo\b/, "Me-O"],
  [/advance/, "Advance"],
  [/purina(?! ?pro)/, "Purina"],
];

function detectBrandCtx(k: string): { brand: string; compareBrand: string; isRC: boolean } {
  const hasRC = /royal\s*canin|royalcanin|\bcanin\b/.test(k);
  let competitor = "";
  for (const [re, name] of COMPETITOR_BRANDS) {
    if (re.test(k)) { competitor = name; break; }
  }
  if (competitor && hasRC) return { brand: BRAND, compareBrand: competitor, isRC: true };
  if (competitor) return { brand: competitor, compareBrand: "", isRC: false };
  return { brand: BRAND, compareBrand: "", isRC: true };
}

function detectIntent(k: string): { intent: Intent; retailer: string } {
  if (/^\d{6,}$/.test(k.replace(/\s/g, ""))) return { intent: "barcode", retailer: "" };
  for (const [re, name] of RETAILERS) {
    if (re.test(k)) return { intent: "retailer", retailer: name };
  }
  if (/içindekiler|icindekiler|özellik|ozellik|hakkında|hakkinda|yorum|ekşi|eksi|şikayet|sikayet|nedir|resmi site|web site|sitesi|\bsite\b|numune|içerik|içindeki|\bonline\b|\bshop\b/.test(k)) {
    return { intent: "info", retailer: "" };
  }
  if (/fiyat|ucuz|kampanya|indirim|toptan|outlet|en ucuz|uygun fiyat|black friday/.test(k)) {
    return { intent: "fiyat", retailer: "" };
  }
  return { intent: "product", retailer: "" };
}

function analyze(rawKw: string): Attr {
  const k = rawKw.toLocaleLowerCase("tr-TR");
  const { breed, animal: breedAnimal } = detectBreed(k);
  const { intent, retailer } = detectIntent(k);
  const { diet, dietKey } = detectDiet(k);
  const { sizeLine, sizeLineDesc } = detectSizeLine(k);
  const { brand, compareBrand, isRC } = detectBrandCtx(k);
  return {
    animal: detectAnimal(k, breedAnimal),
    stage: detectStage(k),
    flavor: detectFlavor(k),
    size: detectSize(k),
    diet,
    dietKey,
    breed,
    sizeLine,
    sizeLineDesc,
    intent,
    retailer,
    compareBrand,
    brand,
    isRC,
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

function descriptor(a: Attr): string {
  const bits: string[] = [];
  if (a.stage) bits.push(stageWord(a.stage));
  if (a.breed) bits.push(a.breed);
  else if (a.sizeLine) bits.push(`${a.sizeLine} boyut serisi`);
  if (a.flavor) bits.push(a.flavor);
  bits.push(a.brand);
  if (a.animal === "kedi") bits.push("kedi maması");
  else if (a.animal === "köpek") bits.push("köpek maması");
  else bits.push("evcil hayvan maması");
  let s = bits.join(" ");
  if (a.size) s += ` (${a.size})`;
  return s;
}

function benefitParagraph(a: Attr): string {
  const animal = animalWord(a.animal);
  if (a.dietKey) {
    const dietLines: Record<string, string> = {
      anallergenic: `Anallergenic, çok şiddetli gıda alerjisi olan ${animal}ler için hidrolize (parçalanmış) protein kaynağı içerir; bağışıklık sisteminin tepki verme olasılığını en aza indirmeyi amaçlar. Mutlaka veteriner yönetiminde kullanılmalıdır.`,
      sensitivity: `Sensitivity Control, gıda intoleransı veya advers gıda reaksiyonu olan ${animal}ler için seçilmiş protein ve karbonhidrat kaynağıyla hazırlanır; belirtilerin yönetiminde veteriner önerisiyle kullanılır.`,
      gastro: `Sindirim sorunları yaşayan ${animal}ler için yüksek sindirilebilirliğe sahip, mideyi yormayan bir formüldür. Akut/kronik sindirim sorunlarında veteriner önerisiyle kullanılması tavsiye edilir.`,
      urinary: `İdrar yolu sağlığını desteklemek için mineral dengesi ayarlanmış formül (Urinary S/O, U/C); struvit gibi taşların yönetimine katkı sağlamayı amaçlar. Veteriner kontrolünde kullanın.`,
      renal: `Böbrek desteğine ihtiyaç duyan ${animal}ler için fosfor ve protein dengesi ayarlanmış diyet mamadır; mutlaka veteriner kontrolünde verilmelidir.`,
      hepatic: `Karaciğer desteğine yönelik formül; ${animal}inizin tedavi sürecinde veteriner önerisiyle kullanılması gereken bir diyet mamadır.`,
      cardiac: `Kalp sağlığını desteklemeye yönelik, sodyum düzeyi ayarlanmış diyet mama; veteriner kontrolünde tercih edilmelidir.`,
      satiety: `Kilo vermesi gereken ${animal}ler için yüksek lif ve protein dengesiyle tokluk hissini destekleyen formül; kontrollü kilo kaybı için veteriner takibiyle kullanılır.`,
      diyabet: `Kan şekeri dengesini desteklemeye yönelik formül; diyabet yönetiminde veteriner önerisiyle kullanılır.`,
      mobility: `Eklem ve hareket sağlığını desteklemeye yönelik içeriklerle, aktif veya ileri yaştaki ${animal}lerin hareket konforuna katkı sağlamayı amaçlar.`,
      fibre: `Yüksek lif içeriğiyle bağırsak geçişini ve dışkı kıvamını düzenlemeye yardımcı olur; kabızlık veya bağırsak düzeni sorunlarında veteriner önerisiyle kullanılır.`,
      recovery: `Ameliyat sonrası veya iyileşme döneminde yoğun besin ve enerji ihtiyacını karşılamaya yönelik, kolay tüketilebilen formül; veteriner önerisiyle kullanın.`,
      dental: `Özel kroket yapısı çiğneme sırasında diş yüzeyine mekanik temizlik etkisi sağlayarak diş taşı ve plak oluşumunu azaltmaya yardımcı olur (Dental / Oral Care).`,
      calm: `Stresli durumlarda (taşınma, yeni ortam, yolculuk) ${animal}lerin sakin kalmasını desteklemeye yönelik içeriklerle hazırlanmış formül (Calm / Relax Care).`,
      derma: `Deri ve tüy sağlığını desteklemek için omega yağ asitleri açısından dengelenmiş formül; sağlıklı, parlak tüy ve güçlü deri bariyerini destekler.`,
      hypo: `Gıda alerjisi/hassasiyeti olan ${animal}ler için sınırlı ve seçilmiş protein kaynaklı formül; tepkimeleri azaltmaya yardımcı olmayı amaçlar.`,
      sterilised: `Kısırlaştırma sonrası ${animal}lerin enerji ihtiyacı düşer ve kilo alma eğilimi artar. Bu ürün dengeli kalori ve destekleyici besin profiliyle ideal kilonun korunmasına yardımcı olur.`,
      light: `Fazla kilolu ${animal}ler için düşük yağlı, dengeli kalorili light formül; tokluk hissini destekleyip ideal kiloya ulaşmayı kolaylaştırmayı amaçlar.`,
      sensitive: `Hassas sindirim sistemi veya seçici damak tadına sahip ${animal}ler için seçilmiş, sindirimi kolay içerikli formül; iştahı ve sindirim konforunu destekler.`,
      indoor: `Ev içinde yaşayan, daha az hareket eden kediler için ayarlanmış kalori ve dışkı kokusunu azaltmaya yardımcı içerikle hazırlanmış formül (Indoor).`,
      outdoor: `Dışarı çıkan, aktif kediler için yüksek enerji ihtiyacını karşılamaya yönelik, daha yoğun kalorili formül (Outdoor).`,
      starter: `Gebelik/emzirme dönemindeki anneler ile sütten kesilen yavruların ilk katı gıdaya geçişi için zenginleştirilmiş, kolay tüketilebilen formül (Starter / Mother & Baby).`,
    };
    return dietLines[a.dietKey] ?? `${trCap(animal)}inizin özel ihtiyacına yönelik formüllü bir mamadır.`;
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
      `Fiyatları farklı platformlarda karşılaştırabilirsiniz; JETGO'da orijinal ve faturalı ürünü kapıda ödeme ve %5 Para Puan avantajıyla, ürün elinize ulaştıktan sonra ödeyerek alırsınız. ${benefitParagraph(a)}`,
    );
    return { h2: `${r} Yerine JETGO ile Aynı Gün Yerel Teslimat`, paragraphs: paras };
  }
  if (a.intent === "barcode") {
    paras.push(
      `Aradığınız barkod, bir ${a.brand} ürününü tanımlamaya yarayan numaradır. Doğru varyantı (kedi/köpek, ırk/boyut, yaş grubu, tat ve gramaj) seçtiğinizden emin olmak için sipariş sırasında barkodu bizimle WhatsApp üzerinden paylaşabilirsiniz; JETGO ekibi doğru ürünü teyit eder.`,
      `Stok durumu zamanla değişebileceğinden belirli bir barkodun her zaman mevcut olduğunu garanti etmeyiz; güncel stok için ${PHONE} hattından bilgi alabilirsiniz. ${ORIGINAL_LINE}`,
    );
    return { h2: `Barkod ile Doğru ${a.brand} Ürününü Bulun`, paragraphs: paras };
  }
  if (a.intent === "info") {
    paras.push(
      `${K} hakkında bilgi arıyorsanız: ${a.isRC ? BRAND_BLURB : `${a.brand}, evcil hayvan beslenmesinde tercih edilen mama markalarından biridir.`}`,
      `Kesin analitik değerler (protein/yağ oranı, içindekiler listesi) ürün ambalajında ve üreticinin resmi bilgilerinde yer alır; satın almadan önce ambalaj bilgisini kontrol etmenizi öneririz. ${benefitParagraph(a)}`,
    );
    return { h2: `${K}: Bilmeniz Gerekenler`, paragraphs: paras };
  }
  if (a.intent === "fiyat") {
    paras.push(
      `${K} arayanlar için JETGO uygun fiyat ve şeffaf alışveriş sunar. Güncel fiyat ve kampanyalar dönemsel değişebildiğinden en doğru tutarı ürün sayfasında görebilir ya da WhatsApp / ${PHONE} üzerinden teyit edebilirsiniz.`,
      `Nakit ödemede avantajlı fiyat, her siparişte %5 Para Puan ve kapıda ödeme imkânıyla bütçenizi korursunuz. ${benefitParagraph(a)}`,
    );
    return { h2: `${K} için JETGO'da Fiyat Avantajı`, paragraphs: paras };
  }
  if (!a.isRC) {
    paras.push(
      `${K} arıyorsanız JETGO Pet Shop, Samsun'un hızlı yerel pet shop'udur. ${a.brand} ürününü ya da aynı segmentteki premium mama alternatiflerini sunabiliriz; aradığınız ürünün güncel stok durumunu WhatsApp veya ${PHONE} üzerinden teyit edebilirsiniz.`,
      `${benefitParagraph(a)} ${ORIGINAL_LINE}`,
    );
    return { h2: `${K} için JETGO Pet Shop`, paragraphs: paras };
  }
  // product
  const fp = flavorParagraph(a);
  paras.push(`${benefitParagraph(a)}`);
  if (fp) paras.push(fp);
  else paras.push(`${ORIGINAL_LINE} Doğru ürünü seçmekte tereddüt yaşarsanız WhatsApp hattımızdan ücretsiz öneri alabilirsiniz.`);
  if (a.compareBrand) {
    paras.push(
      `${a.compareBrand} ile ${BRAND} arasında karşılaştırma yapıyorsanız: her iki marka da premium segmentte yer alır ve farklı ihtiyaçlara yönelik geniş ürün yelpazesi sunar. Doğru tercih; ${animalWord(a.animal)}inizin yaşı, ırkı/boyutu ve varsa özel sağlık ihtiyacına göre değişir. Emin değilseniz veterinerinize danışın; JETGO olarak her iki markada da orijinal ürün ve ücretsiz danışmanlık sağlarız.`,
    );
  }
  return { h2: `${K} Özellikleri ve Kimler İçin Uygun?`, paragraphs: paras };
}

function breedSizeSection(K: string, a: Attr): Section | null {
  const paras: string[] = [];
  if (a.breed) {
    paras.push(
      `${a.breed} ırkı için geliştirilen Royal Canin formüllerinde, bu ırkın tipik ihtiyaçları göz önünde bulundurulur: çene ve diş yapısına uygun kroket tasarımı, ırka özgü enerji düzeyi ve deri-tüy, eklem veya kalp gibi öne çıkan hassasiyetlere yönelik besin desteği. ${a.breed} için doğru yaş grubunu (yavru/yetişkin/yaşlı) seçmek, sağlıklı gelişim ve ideal kilo için önemlidir.`,
    );
  }
  if (a.sizeLine) {
    paras.push(
      `Royal Canin "${a.sizeLine}" serisi ${a.sizeLineDesc} köpekler için tasarlanır. Köpeğin erişkin boyutu, büyüme süresi ve metabolizması ırk boyutuna göre değiştiğinden boyuta uygun mama seçmek; kemik-eklem gelişimi, kroket boyutu ve sindirim konforu açısından faydalıdır. Yavru döneminde ise büyüme süresi küçük ırklarda daha kısa, büyük/dev ırklarda daha uzundur ve mama seçimi buna göre yapılmalıdır.`,
    );
  }
  if (!paras.length) return null;
  return { h2: `${K}: Irk ve Boyuta Özel Beslenme`, paragraphs: paras };
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
      "Her siparişte %5 Para Puan",
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
    paras.push(`Yavru ${animal}ler günde küçük porsiyonlarla, sık aralıklarla beslenir. Paket üzerindeki yaşa/kiloya (büyük ırklarda hedef erişkin ağırlığına) göre porsiyon tablosunu takip edin ve büyüme hızını veterinerinizle değerlendirin.`);
  } else if (a.dietKey && ["renal", "hepatic", "urinary", "gastro", "cardiac", "diyabet", "recovery", "hypo", "anallergenic", "sensitivity", "satiety", "fibre", "mobility"].includes(a.dietKey)) {
    paras.push(`Bu ürün özel/diyet ihtiyaçlara yöneliktir; günlük miktar ve kullanım süresi için mutlaka veterinerinizin önerisini esas alın. Veteriner diyetleri tek başına tedavi değil, beslenme desteğidir.`);
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
  if (!a.isRC) {
    out.push({
      q: `${K} JETGO'da var mı?`,
      a: `Stok durumu değişebildiğinden ${a.brand} ürününün anlık mevcudiyetini WhatsApp veya ${PHONE} üzerinden teyit edebilirsiniz. Aradığınız ürün yoksa aynı segmentte premium bir alternatif öneririz; siparişinizi Atakum ve Samsun içinde aynı gün kapınıza ulaştırırız.`,
    });
  }
  if (a.intent === "fiyat") {
    out.push({
      q: `${K} fiyatı ne kadar?`,
      a: `Güncel fiyat ve kampanyalar dönemsel değişebilir; en doğru tutarı ürün sayfasında veya ${PHONE} / WhatsApp üzerinden öğrenebilirsiniz. Nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan kazanırsınız.`,
    });
  }
  if (a.intent === "info") {
    out.push({
      q: `${K} içindekiler ve özellikleri nelerdir?`,
      a: `Kesin içindekiler listesi ve analitik değerler ürün ambalajında ve üreticinin resmi bilgilerinde yer alır. JETGO olarak orijinal ve faturalı ürün sağlar, doğru ürün seçiminde ücretsiz danışmanlık veririz.`,
    });
  }
  if (a.breed) {
    out.push({
      q: `${K} hangi yaş grubu için uygun?`,
      a: `${a.breed} için yavru, yetişkin ve yaşlı (senior) dönemlerine uygun farklı formüller bulunur. ${animalWord(a.animal) === "köpek" ? "Köpeğinizin" : "Dostunuzun"} yaşına ve kilosuna uygun varyantı seçmek için WhatsApp veya ${PHONE} üzerinden ücretsiz danışmanlık alabilirsiniz.`,
    });
  }
  if (a.dietKey && ["renal", "hepatic", "urinary", "gastro", "cardiac", "diyabet", "recovery", "anallergenic", "sensitivity", "satiety", "fibre", "mobility"].includes(a.dietKey)) {
    out.push({
      q: `${K} veteriner önerisi gerektirir mi?`,
      a: `Evet, bu ürün özel/veteriner diyet beslenmeye yöneliktir; kullanım süresi ve miktarı için veterinerinizin önerisini esas alın. JETGO bu ürünü orijinal ve faturalı olarak kapınıza ulaştırır.`,
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
for (const kw of ROYALCANIN_KEYWORDS) {
  const slug = slugify(kw);
  if (!slug || _seen.has(slug)) continue;
  _seen.add(slug);
  const a = analyze(kw);
  const cluster = `${a.animal}|${a.dietKey || a.breed || a.sizeLine || a.stage || a.flavor || a.intent}`;
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
    case "barcode": return `${K} — ${BRAND} Ürün | JETGO Samsun Pet Shop`;
    default: return `${K} | JETGO Pet Shop — Samsun'a Aynı Gün Kapıda`;
  }
}

function metaDescFor(kwCap: string, a: Attr): string {
  if (a.intent === "retailer" && a.retailer) {
    return `${kwCap} mi arıyorsunuz? ${a.retailer} yerine JETGO Samsun: orijinal ve faturalı ürün, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslim. Kapıda ödeme, %5 Para Puan. ${PHONE}.`;
  }
  if (a.intent === "fiyat") {
    return `${kwCap} için JETGO: uygun fiyat, nakit indirimi ve %5 Para Puan. Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat, kapıda ödeme. ${PHONE}.`;
  }
  if (!a.isRC) {
    return `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun: geniş mama yelpazesi, ${a.brand} ve premium alternatifler, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat. Güncel stok için ${PHONE}.`;
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

  const sections: Section[] = [explainerSection(K, a)];
  const bs = a.isRC ? breedSizeSection(K, a) : null;
  if (bs) sections.push(bs);
  sections.push(whyJetgoSection(K), feedingSection(K, a), deliverySection(K, uniqueHoods));

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
      a.isRC
        ? `${kwCap} mı arıyorsunuz? JETGO Pet Shop, ${descriptor(a)} ihtiyacınızı orijinal ve faturalı ürünle, Atakum ve Samsun geneline hızlı teslimatla karşılar.`
        : `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun; geniş mama yelpazesi ve hızlı teslimatla yanınızda. ${a.brand} ürününü veya dengi premium alternatifleri stok durumuna göre aynı gün kapınıza ulaştırabiliriz.`,
      `${ORDER_LINE} ${SPEED_LINE}`,
      `${PAY_LINE} ${STORE_LINE}`,
    ],
    sections,
    features: [
      "Orijinal ve faturalı ürün — uzun son kullanma tarihi",
      "Atakum içinde ortalama 1 saatte kapıda teslim",
      "Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün teslimat",
      "Kapıda nakit, POS ve QR ödeme",
      "Her siparişte %5 Para Puan",
      `Ücretsiz ürün danışmanlığı — ${PHONE}`,
    ],
    faq: faqFor(K, a),
    internalLinks: related,
  };
}

export const ROYALCANIN_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildJetgoPage(e, i, relatedFor(e, i)),
);
