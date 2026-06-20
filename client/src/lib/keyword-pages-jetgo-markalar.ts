// ---------------------------------------------------------------------------
// JETGO-EXCLUSIVE "diğer markalar" (other brands) pet-food keyword landing pages.
//
// jetgomarket.com (store id "jetgo", a LOCAL same-day Atakum/Samsun store) gets
// its OWN dedicated SEO landing page for every keyword in
// attached_assets/DIGER_MARKALAR_1781965552655.txt (see markalar-keywords.ts).
//
// Unlike the Pro Plan / Royal Canin corpora this set is MULTI-BRAND: Hill's,
// N&D / Farmina, GimCat, Reflex, Enjoy, Pronature, LaVital, ProChoice,
// ProPerformance, GranCarno, Cibau, plus a lot of bare barcodes. The analyzer
// detects the ACTUAL brand per keyword and frames the page truthfully around it;
// when no brand is recognised (e.g. a bare barcode) the page stays generic.
//
// They are tagged `storeId: "jetgo"` so they are served ONLY on jetgomarket.com.
// Slugs are NEW (not in the shared corpus); seo-data.ts pushes them while skipping
// any slug that would clobber a hand-authored NON-keyword curated page and
// de-duplicating against the Pro Plan + Royal Canin jetgo corpora (same store).
//
// TRUTHFULNESS RULES (load-bearing — keep them):
//  - We sell many brands but stock varies, so we NEVER guarantee a specific item
//    is in stock. Wording is always "stok durumuna göre / sipariş öncesi teyit
//    edin", never "stokta / hemen satın al".
//  - Each page is framed around the REAL detected brand; we never present one
//    brand's keyword as a different brand. Comparison keywords ("hills royal
//    canin") are framed neutrally; we never disparage a brand or invent results.
//  - GimCat (and bare malt/paste/vitamin/milk keywords) are TREATS / pastes /
//    supplements — framed as "macun / ödül / takviye", NEVER as staple "mama".
//  - Hill's veterinary/prescription diets (z/d, i/d, k/d, c/d, j/d, l/d, metabolic,
//    derm, anallergenic ...) are nutritional SUPPORT to be used under veterinary
//    guidance — NEVER a cure.
//  - Barcode keywords help IDENTIFY a product / suggest a suitable alternative; no
//    brand claim, no stock guarantee.
//  - Retailer keywords are framed as LOCAL ALTERNATIVE; we never claim affiliation.
//  - "fiyat / ucuz" pages NEVER state fabricated prices; "yorum" pages never
//    fabricate reviews.
//  - Non-pet noise keywords (Spanish "Spectrum" telecom terms) are SKIPPED — see
//    MARKALAR_SKIPPED_NOISE.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { MARKALAR_KEYWORDS } from "./markalar-keywords";
import { slugify, trTitle, trCap } from "./keyword-pages";

const STORE_ID = "jetgo";
const PHONE = "0850 840 39 59";
const ADDR = "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun";
const DOMAIN = "jetgomarket.com";

const SPEED_LINE =
  "Atakum içinde ortalama 1 saatte, Samsun (İlkadım, Canik, Tekkeköy) geneline aynı gün siparişiniz kapınızda olur.";
const ORDER_LINE = `${DOMAIN} üzerinden ürünleri seçip sepete ekleyin; WhatsApp ile tek tıkla ya da ${PHONE} numaralı hattımızı arayarak siparişinizi onaylayın.`;
const PAY_LINE =
  "Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilir; nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan kazanırsınız.";
const STORE_LINE = `JETGO Pet Shop ${ADDR} adresinden Atakum ve Samsun geneline kapınıza teslimat yapar.`;
const ORIGINAL_LINE =
  "Tüm ürünlerimiz orijinal ve faturalıdır; son kullanma tarihi uzun, doğru saklanmış ürünleri tercih ederiz.";
const STOCK_LINE = `Stok durumu zamanla değiştiğinden, aradığınız ürünün güncel mevcudiyetini sipariş öncesi WhatsApp veya ${PHONE} üzerinden teyit etmenizi öneririz; ürün yoksa aynı segmentte uygun bir alternatif sunarız.`;

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
type Kind = "mama" | "treat";

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
  brand: string;
  brandKnown: boolean;
  compareBrand: string;
  kind: Kind;
  treatLabel: string;
  treatDesc: string;
}

// Non-pet noise — Spanish "Spectrum" telecom autocomplete that leaked into the
// keyword export. We skip these entirely (no pet landing page).
const NOISE_RE = /\bspectrum\b|\bpaquetes\b|promociones|sin contrato|com calificado/;

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
  [/french bulldog/, "Fransız Bulldog"],
  [/bulldog/, "Bulldog"],
  [/cane corso/, "Cane Corso"],
  [/teckel|dachshund/, "Teckel (Dachshund)"],
  [/poodle/, "Poodle"],
  [/boxer/, "Boxer"],
  [/german shepherd|alman çoban|alman coban/, "Alman Çoban Köpeği"],
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
];

function detectBreed(k: string): { breed: string; animal: Animal } {
  for (const [re, name] of CAT_BREEDS) if (re.test(k)) return { breed: name, animal: "kedi" };
  for (const [re, name] of DOG_BREEDS) if (re.test(k)) return { breed: name, animal: "köpek" };
  return { breed: "", animal: "genel" };
}

// Dog SIZE LINES (segmentation by adult bodyweight). Order matters.
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

const CAT_LINE_RE = /\bkitten\b|\bqueen\b|sterilised|sterilized|indoor|shinycat|kedi maması|kısırlaştırılmış kedi|kisir kedi|kısır kedi/;
const DOG_LINE_RE = /\bpuppy\b|\bmaxi\b|\bmedium\b|\bgiant\b|x ?small|xsmall|\bmini\b|cane corso|rottweiler|labrador|retriever|french bulldog|köpek maması|kopek mamasi/;

function detectAnimal(k: string, breedAnimal: Animal): Animal {
  if (breedAnimal !== "genel") return breedAnimal;
  if (/\bkedi\b|kitten|\bqueen\b|\bcat\b|gatos|shinycat|kedi maması/.test(k)) return "kedi";
  if (/\bköpek\b|\bkopek\b|puppy|\bdog\b|köpek maması|kopek mamasi/.test(k)) return "köpek";
  if (CAT_LINE_RE.test(k)) return "kedi";
  if (DOG_LINE_RE.test(k)) return "köpek";
  return "genel";
}

function detectStage(k: string): Stage {
  if (/\banne\b|hamile|gebe|emziren|\bqueen\b/.test(k)) return "anne";
  if (/ageing|\bsenior\b|yaşl|yasl|\bmature\b|mature 7|7\s*\+|\b11\b|\b7\b(?! ?kg)/.test(k)) return "yaşlı";
  if (/yavru|kitten|puppy|junior|starter|growth|\bbaby\b/.test(k)) return "yavru";
  if (/yetişkin|yetiskin|\badult\b|adulto|\bprime\b(?! kitten)|\bfit\b/.test(k)) return "yetişkin";
  return "";
}

function detectFlavor(k: string): string {
  if (/tavuk|chicken/.test(k)) return "tavuklu";
  if (/kuzu|lamb/.test(k)) return "kuzu etli";
  if (/biftek|sığır|sigir|dana|\bbeef\b|parça etli|parca etli/.test(k)) return "biftekli";
  if (/somon|salmon|losos|alabalık|alabalik/.test(k)) return "somonlu";
  if (/morina|okyanus|ringa|deniz ürün|\bocean\b|balık|balik|\bfish\b/.test(k)) return "balıklı";
  if (/hindi|turkey/.test(k)) return "hindili";
  if (/tahılsız|tahilsiz|grain free|low grain|düşük tahıl|dusuk tahil/.test(k)) return "tahılsız";
  if (/pumpkin|balkabağı|balkabagi/.test(k)) return "balkabaklı";
  if (/quinoa|kinoa/.test(k)) return "kinoalı";
  return "";
}

function detectSize(k: string): string {
  const kgDec = k.match(/(\d{1,3})[.,](\d)\s*(kg|kilo)/);
  if (kgDec) return `${kgDec[1]}.${kgDec[2]} kg`;
  const kg = k.match(/\b(\d{1,3})\s*(kg|kilo)\b/);
  if (kg) return `${kg[1]} kg`;
  const gr = k.match(/\b(\d{2,4})\s*(gr|gram)\b/);
  if (gr) return `${gr[1]} gr`;
  return "";
}

// Generic veterinary / functional diets (brand-agnostic). Order matters.
const DIETS: Array<[RegExp, string, string]> = [
  [/anallergenic|anallergic|analergic/, "anallergenic", "şiddetli gıda alerjisi için hidrolize protein içeren (Anallergenic) diyet"],
  [/gastro ?intestinal|gastrointestinal|\bgastro\b|digestive|sindirim/, "gastro", "sindirim sistemi desteği (Gastrointestinal / Digestive)"],
  [/urinary|idrar|üriner|uriner/, "urinary", "idrar yolu sağlığı desteği (Urinary)"],
  [/renal|böbrek|bobrek/, "renal", "böbrek fonksiyonu desteği (Renal)"],
  [/hepatic|karaciğer|karaciger/, "hepatic", "karaciğer desteği (Hepatic)"],
  [/mobility|\beklem\b|\bjoint\b/, "mobility", "eklem ve hareket desteği (Mobility)"],
  [/metabolic|satiety|tokluk|weight management|weight care/, "satiety", "kilo yönetimi ve tokluk desteği (Metabolic / Weight)"],
  [/recovery|convalescence|nekahat/, "recovery", "iyileşme ve nekahat dönemi beslenmesi (Recovery)"],
  [/dental|oral care|ağız|diş sağlığı/, "dental", "diş ve ağız sağlığı desteği (Dental)"],
  [/dermatosis|derm complet|derm defens|skin ?& ?coat|skin coat|hair ?& ?skin|deri|cilt/, "derma", "deri ve tüy sağlığı desteği (Derm / Skin & Coat)"],
  [/hypoallergenic|food sensitiv|sensitivity control|gıda hassas|gida hassas/, "hypo", "gıda alerjisi/hassasiyeti yönetimi (Hypoallergenic / Sensitivity)"],
  [/sterilised|sterilized|sterilize|kısırlaş|kisirlas|kısır|kisir|neutered/, "sterilised", "kısırlaştırılmış kedi/köpekler için kilo dengeli formül"],
  [/light weight|\blight\b|low fat|düşük yağ|dusuk yag|obez|kilo kontrol/, "light", "kilo kontrolü / ideal ağırlık için light formül"],
  [/sensible|sensitive|hassas|delicate/, "sensitive", "hassas sindirim veya seçici damak tadı için (Sensitive)"],
  [/indoor/, "indoor", "ev içinde yaşayan, daha az hareket eden kediler için (Indoor)"],
];

function detectDiet(k: string): { diet: string; dietKey: string } {
  for (const [re, key, label] of DIETS) {
    if (re.test(k)) return { diet: label, dietKey: key };
  }
  return { diet: "", dietKey: "" };
}

// Hill's prescription / veterinary diet letter codes (z/d, i/d, k/d ...). These
// run ONLY for Hill's keywords and only when no generic diet was already matched.
// The "s_ d" forms catch the common "hill's z/d" mis-spacing ("hill sz d").
const HILLS_CODES: Array<[RegExp, string, string]> = [
  [/metabolic/, "satiety", "kilo yönetimine yönelik (Metabolic) diyet"],
  [/kidney|\bk ?\/? ?d\b|\bkd\b|sk ?\/? ?d\b/, "renal", "böbrek desteğine yönelik (k/d) diyet"],
  [/\bi ?\/? ?d\b|\bid\b|si ?\/? ?d\b/, "gastro", "sindirim desteğine yönelik (i/d) diyet"],
  [/\bz ?\/? ?d\b|\bzd\b|hillszd|sz ?\/? ?d\b/, "hypo", "gıda/cilt hassasiyetine yönelik (z/d) diyet"],
  [/\bc ?\/? ?d\b|\bcd\b|sc ?\/? ?d\b/, "urinary", "idrar yolu sağlığına yönelik (c/d) diyet"],
  [/\bj ?\/? ?d\b|\bjd\b|sj ?\/? ?d\b/, "mobility", "eklem/hareket desteğine yönelik (j/d) diyet"],
  [/\bl ?\/? ?d\b|\bld\b|sl ?\/? ?d\b/, "hepatic", "karaciğer desteğine yönelik (l/d) diyet"],
  [/\bw ?\/? ?d\b|\bwd\b|sw ?\/? ?d\b/, "satiety", "kilo/sindirim yönetimine yönelik (w/d) diyet"],
  [/\br ?\/? ?d\b|\brd\b|sr ?\/? ?d\b/, "light", "kilo verme desteğine yönelik (r/d) diyet"],
  [/\bs ?\/? ?d\b|\bsd\b/, "urinary", "idrar yolu (struvit) yönetimine yönelik (s/d) diyet"],
  [/\bu ?\/? ?d\b|\bud\b/, "urinary", "idrar yolu yönetimine yönelik (u/d) diyet"],
  [/\bt ?\/? ?d\b|\btd\b/, "dental", "diş/ağız sağlığına yönelik (t/d) diyet"],
  [/\ba ?\/? ?d\b|\bad\b/, "recovery", "iyileşme/nekahat dönemine yönelik (a/d) diyet"],
];

function detectHillsCode(k: string): { diet: string; dietKey: string } | null {
  for (const [re, key, label] of HILLS_CODES) {
    if (re.test(k)) return { diet: label, dietKey: key };
  }
  return null;
}

const RETAILERS: Array<[RegExp, string]> = [
  [/hepsiburada/, "Hepsiburada"], [/trendyol/, "Trendyol"], [/\bn11\b/, "n11"],
  [/amazon/, "Amazon"], [/migros/, "Migros"], [/carrefour/, "CarrefourSA"],
  [/akakçe|akakce/, "Akakçe"], [/cimri/, "Cimri"], [/petlebi/, "Petlebi"],
];

// Recognised brands. N&D / Farmina are normalised together (N&D is Farmina's
// line). Order inside detectBrand puts the N&D family first so a keyword naming
// both becomes "N&D (Farmina)". A second distinct brand becomes compareBrand.
const BRAND_PATTERNS: Array<[RegExp, string]> = [
  [/hill ?'?s|hills/, "Hill's"],
  [/gim ?cat/, "GimCat"],
  [/reflex ?plus|reflex/, "Reflex"],
  [/\benjoy\b/, "Enjoy"],
  [/pronature|pro ?nature/, "Pronature"],
  [/lavital/, "LaVital"],
  [/prochoice|pro ?choice/, "ProChoice"],
  [/properformance|pro ?performance/, "ProPerformance"],
  [/grancarno|gran carno/, "GranCarno"],
  [/cibau/, "Cibau"],
  [/royal ?canin/, "Royal Canin"],
  [/pro ?plan|proplan/, "Pro Plan"],
];

function detectBrand(k: string): { brand: string; brandKnown: boolean; compareBrand: string } {
  const hits: string[] = [];
  const hasND = /n ?& ?d/.test(k) || /(^|[^0-9a-zçğıöşü&])nd([^a-zçğıöşü]|$)/.test(k) || /(^|[^0-9a-zçğıöşü])n d([^a-zçğıöşü]|$)/.test(k);
  const hasFarmina = /farmina/.test(k);
  if (hasND) hits.push("N&D (Farmina)");
  else if (hasFarmina) hits.push("Farmina");
  for (const [re, name] of BRAND_PATTERNS) if (re.test(k)) hits.push(name);
  const uniq = Array.from(new Set(hits));
  if (uniq.length === 0) return { brand: "", brandKnown: false, compareBrand: "" };
  return { brand: uniq[0], brandKnown: true, compareBrand: uniq[1] ?? "" };
}

// Treat / paste / supplement detection (GimCat-type products + bare malt/paste
// keywords). These are NOT staple food.
const TREAT_RE = /malt|macun|\bpaste\b|\bpasta\b|shinycat|shiny ?cat|multivitamin|multi ?vitamin|\bvitamin\b|\bmilk\b|cat milk|milk bits|\bsüt\b|yoghurt|yogurt|\bsnack\b|ödül|\bstick\b|sticks|\btabs\b|denta|relax|energy paste|mint tips|\blatte\b|duo paste|ut balance|\bfilet\b|in jelly|\bjelly\b|kitten paste|senior paste/;

function treatInfo(k: string): { label: string; desc: string } {
  if (/malt/.test(k)) return { label: "malt macunu", desc: "tüy yumağı (hairball) oluşumunu azaltmaya yardımcı olan, kedilerin yuttuğu tüyleri sindirim sisteminden geçirmesini kolaylaştıran malt içerikli bir bakım macunudur." };
  if (/multivitamin|multi ?vitamin|\bvitamin\b/.test(k)) return { label: "vitamin macunu", desc: "günlük vitamin ve iz mineral takviyesi sağlayan, ek desteğe ihtiyaç duyan kediler için kullanılan bir takviye macunudur." };
  if (/relax/.test(k)) return { label: "sakinleştirici macun", desc: "stresli dönemlerde (yolculuk, yeni ortam) kedilerin sakin kalmasına yardımcı olmak için hazırlanmış destekleyici bir macundur." };
  if (/denta/.test(k)) return { label: "diş bakım ödülü", desc: "çiğneme sırasında diş yüzeyini destekleyen, ağız bakımına katkı sağlayan ödül/tabletlerdir." };
  if (/\bmilk\b|cat milk|milk bits|\bsüt\b|\blatte\b/.test(k)) return { label: "kedi sütü", desc: "laktozu azaltılmış, yavru ve yetişkin kediler için uygun süt/süt takviyesidir." };
  if (/yoghurt|yogurt/.test(k)) return { label: "yoğurtlu ödül", desc: "yoğurt bazlı, kedilerin sevdiği hafif bir ödül/takviyedir." };
  if (/shinycat|shiny ?cat|\bfilet\b|in jelly|\bjelly\b/.test(k)) return { label: "yaş kedi ödülü", desc: "jöle/sos içinde fileto parçaları sunan, ek nem ve lezzet sağlayan yaş ödül ürünüdür." };
  if (/ut balance/.test(k)) return { label: "idrar yolu destek macunu", desc: "idrar yolu sağlığını desteklemeye yönelik içeriklerle hazırlanmış bir bakım macunudur." };
  if (/gastro/.test(k)) return { label: "sindirim destek macunu", desc: "sindirim sistemini desteklemeye yönelik içeriklerle hazırlanmış bir bakım macunudur." };
  if (/energy/.test(k)) return { label: "enerji macunu", desc: "ek enerji ve besin desteğine ihtiyaç duyan kediler için hazırlanmış bir takviye macunudur." };
  if (/mint tips/.test(k)) return { label: "naneli ödül", desc: "kedilerin sevdiği naneli, hafif bir ödül ürünüdür." };
  return { label: "kedi ödülü / takviyesi", desc: "kedilerin günlük beslenmesini destekleyen bir ödül/takviye ürünüdür; ana mamanın yerine geçmez, tamamlayıcı olarak kullanılır." };
}

function detectKind(k: string, brand: string): Kind {
  if (brand === "GimCat") return "treat";
  if (TREAT_RE.test(k)) return "treat";
  return "mama";
}

function detectIntent(k: string): { intent: Intent; retailer: string } {
  if (/^\d{6,}$/.test(k.replace(/\s/g, ""))) return { intent: "barcode", retailer: "" };
  for (const [re, name] of RETAILERS) {
    if (re.test(k)) return { intent: "retailer", retailer: name };
  }
  if (/içindekiler|icindekiler|özellik|ozellik|hakkında|hakkinda|yorum|ekşi|eksi|şikayet|sikayet|nedir|resmi site|web site|sitesi|\bsite\b|içerik|\bonline\b/.test(k)) {
    return { intent: "info", retailer: "" };
  }
  if (/fiyat|ucuz|kampanya|indirim|toptan|outlet|en ucuz|uygun fiyat/.test(k)) {
    return { intent: "fiyat", retailer: "" };
  }
  return { intent: "product", retailer: "" };
}

function analyze(rawKw: string): Attr {
  const k = rawKw.toLocaleLowerCase("tr-TR");
  const { breed, animal: breedAnimal } = detectBreed(k);
  const { intent, retailer } = detectIntent(k);
  const { brand, brandKnown, compareBrand } = detectBrand(k);
  const kind = detectKind(k, brand);
  let { diet, dietKey } = detectDiet(k);
  if (!dietKey && brand === "Hill's") {
    const h = detectHillsCode(k);
    if (h) { diet = h.diet; dietKey = h.dietKey; }
  }
  const { sizeLine, sizeLineDesc } = detectSizeLine(k);
  const ti = kind === "treat" ? treatInfo(k) : { label: "", desc: "" };
  let animal = detectAnimal(k, breedAnimal);
  if (kind === "treat" && animal === "genel") animal = "kedi"; // treats here are cat products
  return {
    animal,
    stage: detectStage(k),
    flavor: detectFlavor(k),
    size: detectSize(k),
    diet,
    dietKey,
    breed,
    sizeLine: kind === "mama" ? sizeLine : "",
    sizeLineDesc: kind === "mama" ? sizeLineDesc : "",
    intent,
    retailer,
    brand,
    brandKnown,
    compareBrand,
    kind,
    treatLabel: ti.label,
    treatDesc: ti.desc,
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

function productNoun(a: Attr): string {
  if (a.kind === "treat") return a.treatLabel;
  if (a.animal === "kedi") return "kedi maması";
  if (a.animal === "köpek") return "köpek maması";
  return "evcil hayvan maması";
}

const BRAND_BLURB: Record<string, string> = {
  "Hill's": "Hill's; veteriner hekimlerle geliştirilen, bilimsel beslenme odaklı bir kedi-köpek maması markasıdır. Günlük bakım (Science Plan) ve veteriner diyet (Prescription Diet) serileriyle bilinir.",
  "N&D (Farmina)": "N&D (Farmina); yüksek hayvansal protein oranıyla öne çıkan, düşük tahıllı, tahılsız ve fonksiyonel (Pumpkin, Quinoa, Ocean) serileri bulunan İtalyan menşeli premium bir markadır.",
  "Farmina": "Farmina; başta N&D olmak üzere bilimsel beslenme odaklı serileriyle bilinen İtalyan menşeli premium bir kedi-köpek maması markasıdır.",
  "GimCat": "GimCat; kedilere yönelik malt macunları, vitamin takviyeleri, ödüller ve süt gibi TAMAMLAYICI bakım ürünleriyle bilinen bir markadır (ana mama değil, tamamlayıcı ürünler).",
  "Reflex": "Reflex; Türkiye'de yaygın, geniş ürün yelpazesine sahip, erişilebilir fiyatlı bir kedi-köpek maması markasıdır.",
  "Enjoy": "Enjoy; günlük beslenme için ekonomik ve erişilebilir bir kedi-köpek maması markasıdır.",
  "Pronature": "Pronature; doğal içerik vurgusu olan Kanada menşeli bir kedi-köpek maması markasıdır.",
  "LaVital": "LaVital; Türkiye'de üretilen, uygun fiyatlı bir kedi-köpek maması markasıdır.",
  "ProChoice": "ProChoice; kedi-köpek maması ve kedi kumu ürünleriyle bilinen bir markadır.",
  "ProPerformance": "Pro Performance; aktif ve çalışan köpekler için enerji odaklı formülleriyle bilinen bir mama markasıdır.",
  "GranCarno": "GranCarno (Animonda); yüksek et oranlı yaş köpek maması serileriyle bilinen Alman menşeli bir markadır.",
  "Cibau": "Cibau (Farmina); günlük beslenme için dengeli ve erişilebilir bir kedi-köpek maması serisidir.",
  "Royal Canin": "Royal Canin; ırk, boyut, yaş ve özel ihtiyaca göre sınıflandıran, bilimsel beslenme odaklı premium bir markadır.",
  "Pro Plan": "Pro Plan (Purina); bilimsel beslenme odaklı, yaşam evresi ve özel ihtiyaçlara göre formüle edilen premium bir markadır.",
};
const GENERIC_BLURB = "Aradığınız ürün, kedi/köpek beslenmesinde tercih edilen mama ve bakım ürünlerinden biridir.";

function brandBlurb(a: Attr): string {
  if (!a.brand) return GENERIC_BLURB;
  return BRAND_BLURB[a.brand] ?? `${a.brand}, kedi-köpek beslenmesinde tercih edilen bir markadır.`;
}

function descriptor(a: Attr): string {
  const bits: string[] = [];
  if (a.kind === "mama") {
    if (a.stage) bits.push(stageWord(a.stage));
    if (a.breed) bits.push(a.breed);
    else if (a.sizeLine) bits.push(`${a.sizeLine} boyut serisi`);
    if (a.flavor) bits.push(a.flavor);
    if (a.brand) bits.push(a.brand);
    bits.push(a.animal === "kedi" ? "kedi maması" : a.animal === "köpek" ? "köpek maması" : "evcil hayvan maması");
  } else {
    if (a.brand) bits.push(a.brand);
    bits.push(a.treatLabel);
  }
  let s = bits.join(" ");
  if (a.size) s += ` (${a.size})`;
  return s;
}

function benefitParagraph(a: Attr): string {
  const animal = animalWord(a.animal);
  if (a.kind === "treat") return a.treatDesc;
  if (a.dietKey) {
    const dietLines: Record<string, string> = {
      anallergenic: `Anallergenic, çok şiddetli gıda alerjisi olan ${animal}ler için hidrolize (parçalanmış) protein kaynağı içerir; bağışıklık sisteminin tepki verme olasılığını en aza indirmeyi amaçlar. Mutlaka veteriner yönetiminde kullanılmalıdır.`,
      gastro: `Sindirim sorunları yaşayan ${animal}ler için yüksek sindirilebilirliğe sahip, mideyi yormayan bir formüldür. Akut/kronik sindirim sorunlarında veteriner önerisiyle kullanılması tavsiye edilir.`,
      urinary: `İdrar yolu sağlığını desteklemek için mineral dengesi ayarlanmış formüldür; struvit gibi taşların yönetimine katkı sağlamayı amaçlar. Veteriner kontrolünde kullanın.`,
      renal: `Böbrek desteğine ihtiyaç duyan ${animal}ler için fosfor ve protein dengesi ayarlanmış diyet mamadır; mutlaka veteriner kontrolünde verilmelidir.`,
      hepatic: `Karaciğer desteğine yönelik formül; ${animal}inizin tedavi sürecinde veteriner önerisiyle kullanılması gereken bir diyet mamadır.`,
      satiety: `Kilo vermesi gereken ${animal}ler için yüksek lif ve protein dengesiyle tokluk hissini destekleyen formül; kontrollü kilo kaybı için veteriner takibiyle kullanılır.`,
      mobility: `Eklem ve hareket sağlığını desteklemeye yönelik içeriklerle, aktif veya ileri yaştaki ${animal}lerin hareket konforuna katkı sağlamayı amaçlar.`,
      recovery: `Ameliyat sonrası veya iyileşme döneminde yoğun besin ve enerji ihtiyacını karşılamaya yönelik, kolay tüketilebilen formül; veteriner önerisiyle kullanın.`,
      dental: `Özel kroket yapısı çiğneme sırasında diş yüzeyine mekanik temizlik etkisi sağlayarak diş taşı ve plak oluşumunu azaltmaya yardımcı olur (Dental / Oral Care).`,
      derma: `Deri ve tüy sağlığını desteklemek için omega yağ asitleri açısından dengelenmiş formül; sağlıklı, parlak tüy ve güçlü deri bariyerini destekler.`,
      hypo: `Gıda alerjisi/hassasiyeti olan ${animal}ler için sınırlı ve seçilmiş protein kaynaklı formül; tepkimeleri azaltmaya yardımcı olmayı amaçlar. Veteriner önerisiyle kullanın.`,
      sterilised: `Kısırlaştırma sonrası ${animal}lerin enerji ihtiyacı düşer ve kilo alma eğilimi artar. Bu ürün dengeli kalori ve destekleyici besin profiliyle ideal kilonun korunmasına yardımcı olur.`,
      light: `Fazla kilolu ${animal}ler için düşük yağlı, dengeli kalorili light formül; tokluk hissini destekleyip ideal kiloya ulaşmayı kolaylaştırmayı amaçlar.`,
      sensitive: `Hassas sindirim sistemi veya seçici damak tadına sahip ${animal}ler için seçilmiş, sindirimi kolay içerikli formül; iştahı ve sindirim konforunu destekler.`,
      indoor: `Ev içinde yaşayan, daha az hareket eden kediler için ayarlanmış kalori ve dışkı kokusunu azaltmaya yardımcı içerikle hazırlanmış formül (Indoor).`,
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
  if (!a.flavor || a.kind === "treat") return null;
  const animal = animalWord(a.animal);
  const map: Record<string, string> = {
    "tavuklu": `Tavuklu içeriği, yüksek kaliteli hayvansal protein kaynağı olarak ${animal}ler tarafından sevilen, lezzetli ve kolay kabul gören bir seçenektir.`,
    "kuzu etli": `Kuzu etli formül, sindirimi kolay protein arayan ve tavuğa karşı seçici olan ${animal}ler için lezzetli bir alternatiftir.`,
    "biftekli": `Biftek/sığır etli içeriği, yoğun et aromasıyla iştahlı ${animal}lerin damak tadına hitap eder.`,
    "somonlu": `Somon/alabalık içeriği omega yağ asitleri açısından zengindir; deri ve tüy sağlığını destekler, balık sevenler için idealdir.`,
    "balıklı": `Balıklı (morina/okyanus/ringa) içeriği, omega yağ asitleri ve sevilen deniz aromasıyla hem lezzet hem deri-tüy desteği sağlar.`,
    "hindili": `Hindili formül, yağ oranı düşük yalın bir protein kaynağı arayanlar için hafif ve lezzetli bir seçenektir.`,
    "tahılsız": `Tahılsız (veya düşük tahıllı) formül, tahıl hassasiyeti olan ya da daha yüksek hayvansal protein tercih eden ${animal}ler için uygun bir seçenektir.`,
    "balkabaklı": `Balkabağı (Pumpkin) içeriği, sindirimi destekleyen lif kaynağıdır; hassas sindirim sistemine sahip ${animal}ler için tercih edilir.`,
    "kinoalı": `Kinoa (Quinoa) içerikli fonksiyonel seri, belirli ihtiyaçlara (deri, sindirim, kilo) yönelik bitkisel destek sunmayı amaçlar.`,
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
      `Aradığınız barkod/ürün kodu, belirli bir ürünü tanımlamaya yarayan numaradır. Doğru varyantı (kedi/köpek, yaş grubu, tat ve gramaj) seçtiğinizden emin olmak için sipariş sırasında kodu WhatsApp üzerinden bizimle paylaşın; JETGO ekibi doğru ürünü ya da uygun bir muadili teyit etsin.`,
      `Stok durumu zamanla değiştiğinden belirli bir kodun her zaman mevcut olduğunu garanti etmiyoruz; güncel durum için ${PHONE} hattından bilgi alabilirsiniz. ${ORIGINAL_LINE}`,
    );
    return { h2: `Barkod / Ürün Kodu ile Doğru Ürünü Bulun`, paragraphs: paras };
  }
  if (a.intent === "info") {
    paras.push(
      `${K} hakkında bilgi arıyorsanız: ${brandBlurb(a)}`,
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
  // product
  const fp = flavorParagraph(a);
  paras.push(benefitParagraph(a));
  if (fp) paras.push(fp);
  paras.push(`${STOCK_LINE} ${ORIGINAL_LINE}`);
  if (a.compareBrand) {
    paras.push(
      `${a.compareBrand} ile ${a.brand} karşılaştırması yapıyorsanız: her iki marka da kendi segmentinde yaygın tercih edilir ve farklı ihtiyaçlara yönelik ürün yelpazesi sunar. Doğru tercih ${animalWord(a.animal)}inizin yaşı, ırkı/boyutu ve varsa özel sağlık ihtiyacına göre değişir. Emin değilseniz veterinerinize danışın; JETGO olarak orijinal ürün ve ücretsiz danışmanlık sağlarız.`,
    );
  }
  const h2 = a.kind === "treat" ? `${K} Nedir, Nasıl Seçilir?` : `${K} Özellikleri ve Kimler İçin Uygun?`;
  return { h2, paragraphs: paras };
}

function breedSizeSection(K: string, a: Attr): Section | null {
  if (a.kind !== "mama") return null;
  const paras: string[] = [];
  const brandLabel = a.brand ? `${a.brand} ` : "";
  if (a.breed) {
    paras.push(
      `${a.breed} ırkı için ${brandLabel}formüllerinde bu ırkın tipik ihtiyaçları göz önünde bulundurulur: çene ve diş yapısına uygun kroket tasarımı, ırka özgü enerji düzeyi ve deri-tüy, eklem veya sindirim gibi öne çıkan hassasiyetlere yönelik besin desteği. ${a.breed} için doğru yaş grubunu (yavru/yetişkin/yaşlı) seçmek sağlıklı gelişim ve ideal kilo için önemlidir.`,
    );
  }
  if (a.sizeLine) {
    paras.push(
      `"${a.sizeLine}" boyut serisi ${a.sizeLineDesc} köpekler için tasarlanır. Köpeğin erişkin boyutu, büyüme süresi ve metabolizması ırk boyutuna göre değiştiğinden boyuta uygun mama seçmek; kemik-eklem gelişimi, kroket boyutu ve sindirim konforu açısından faydalıdır. Yavru döneminde büyüme süresi küçük ırklarda daha kısa, büyük/dev ırklarda daha uzundur ve mama seçimi buna göre yapılmalıdır.`,
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
  if (a.kind === "treat") {
    paras.push(
      `Ödül, macun ve takviye ürünleri ana mamanın yerini tutmaz; günlük beslenmenin yalnızca küçük bir kısmını oluşturmalıdır. Önerilen günlük miktarı ürün ambalajındaki kullanım talimatına göre ayarlayın ve her zaman temiz, taze su bulundurun.`,
    );
    if (/malt/.test(K.toLocaleLowerCase("tr-TR"))) {
      paras.push(`Malt macunu özellikle tüy dökme dönemlerinde ve uzun tüylü kedilerde düzenli kullanılabilir; aşırı kullanımdan kaçının ve kalıcı sindirim sorunlarında veterinerinize danışın.`);
    } else {
      paras.push(`Yeni bir takviyeye başlarken küçük miktarla başlayıp ${animal}inizin tepkisini gözlemleyin. Kronik bir sağlık sorunu varsa kullanım öncesi veterinerinize danışmanız önerilir.`);
    }
    return { h2: `${K} Nasıl Kullanılır?`, paragraphs: paras };
  }
  paras.push(
    `Mama geçişini 7-10 güne yayarak yapın: yeni mamayı eski mamaya kademeli olarak ekleyin; böylece sindirim sistemi yeni formüle yumuşak bir geçiş yapar. Önünde her zaman temiz ve taze su bulundurun.`,
  );
  if (a.stage === "yavru") {
    paras.push(`Yavru ${animal}ler günde küçük porsiyonlarla, sık aralıklarla beslenir. Paket üzerindeki yaşa/kiloya (büyük ırklarda hedef erişkin ağırlığına) göre porsiyon tablosunu takip edin ve büyüme hızını veterinerinizle değerlendirin.`);
  } else if (a.dietKey && ["renal", "hepatic", "urinary", "gastro", "recovery", "hypo", "anallergenic", "satiety", "mobility"].includes(a.dietKey)) {
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
      q: `Bu barkodun/ürün kodunun ürünü stokta mı?`,
      a: `Stok durumu değişebildiği için garanti vermiyoruz. Kodu WhatsApp'tan veya ${PHONE} numarasından iletin; doğru varyantı ve güncel stoğu teyit edip uygun ürünü ya da muadilini aynı gün kapınıza gönderelim.`,
    });
  }
  if (a.intent === "product" || a.intent === "info") {
    out.push({
      q: `${K} JETGO'da var mı?`,
      a: `Stok durumu değişebildiğinden ${a.brand ? `${a.brand} ürününün` : "ürünün"} anlık mevcudiyetini WhatsApp veya ${PHONE} üzerinden teyit edebilirsiniz. Aradığınız ürün yoksa aynı segmentte uygun bir alternatif öneririz; siparişinizi Atakum ve Samsun içinde aynı gün kapınıza ulaştırırız.`,
    });
  }
  if (a.kind === "treat") {
    out.push({
      q: `${K} ana mama yerine geçer mi?`,
      a: `Hayır. Bu ürün bir ödül/macun/takviyedir ve ana mamanın yerini tutmaz; günlük beslenmenin küçük bir kısmını oluşturacak şekilde, ambalajdaki talimata göre kullanılmalıdır.`,
    });
  }
  if (a.intent === "fiyat") {
    out.push({
      q: `${K} fiyatı ne kadar?`,
      a: `Güncel fiyat ve kampanyalar dönemsel değişebilir; en doğru tutarı ürün sayfasında veya ${PHONE} / WhatsApp üzerinden öğrenebilirsiniz. Nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan kazanırsınız.`,
    });
  }
  if (a.compareBrand) {
    out.push({
      q: `${a.brand} mı ${a.compareBrand} mı daha iyi?`,
      a: `Tek bir doğru yanıt yoktur; her iki marka da farklı ihtiyaçlara yönelik ürünler sunar. Doğru tercih ${animalWord(a.animal)}inizin yaşı, ırkı/boyutu ve varsa özel sağlık ihtiyacına göre değişir. Emin değilseniz veterinerinize danışın; JETGO her iki markada da orijinal ürün ve ücretsiz danışmanlık sağlar.`,
    });
  }
  if (a.dietKey && ["renal", "hepatic", "urinary", "gastro", "recovery", "anallergenic", "satiety", "mobility", "hypo"].includes(a.dietKey)) {
    out.push({
      q: `${K} veteriner önerisi gerektirir mi?`,
      a: `Evet, bu ürün özel/veteriner diyet beslenmeye yöneliktir ve bir tedavi değil beslenme desteğidir; kullanım süresi ve miktarı için veterinerinizin önerisini esas alın. JETGO bu ürünü orijinal ve faturalı olarak kapınıza ulaştırır.`,
    });
  }
  out.push({
    q: `${K} orijinal ve faturalı mı?`,
    a: `Evet, JETGO'daki tüm ürünler orijinal ve faturalıdır. Son kullanma tarihi uzun, doğru saklanmış ürünleri Atakum ve Samsun'da kapınıza teslim ediyoruz.`,
  });
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

let _skipped = 0;
const _entries: Ent[] = [];
const _seen = new Set<string>();
for (const kw of MARKALAR_KEYWORDS) {
  const k = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(k)) { _skipped++; continue; }
  const slug = slugify(kw);
  if (!slug || _seen.has(slug)) continue;
  _seen.add(slug);
  const a = analyze(kw);
  const cluster = `${a.animal}|${a.kind}|${a.dietKey || a.breed || a.sizeLine || a.stage || a.flavor || a.brand || a.intent}`;
  _entries.push({ kw, slug, a, cluster });
}

export const MARKALAR_SKIPPED_NOISE = _skipped;

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
    case "barcode": return `${K} — Ürün Kodu | JETGO Samsun Pet Shop`;
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
  if (a.intent === "barcode") {
    return `${kwCap} ürün kodunu mu arıyorsunuz? JETGO Samsun ekibi barkodla doğru ürünü/muadili tespit eder; Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat. ${PHONE}.`;
  }
  const b = a.brand ? `${a.brand} ve premium alternatifler` : "geniş mama yelpazesi";
  return `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun: ${b}, orijinal ve faturalı, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat. Güncel stok için ${PHONE}.`;
}

function keywordsFor(kw: string, a: Attr): string {
  const base = [kw, `${kw} jetgo`, `${kw} samsun`, `${kw} atakum`, `${kw} kapıda ödeme`, `${kw} aynı gün teslimat`];
  if (a.intent !== "retailer") base.push(`${kw} fiyat`);
  return base.join(", ");
}

function introFor(kwCap: string, a: Attr): string {
  if (a.intent === "barcode") {
    return `${kwCap} (ürün kodu) mu arıyorsunuz? Barkodu bizimle paylaşın; JETGO ekibi doğru ürünü veya uygun bir muadili tespit edip Atakum ve Samsun geneline hızlıca ulaştırsın.`;
  }
  if (a.kind === "treat") {
    return `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun; ${a.brand ? `${a.brand} ` : ""}${a.treatLabel} ve diğer kedi bakım ürünlerini stok durumuna göre, Atakum ve Samsun geneline hızlı teslimatla kapınıza ulaştırır.`;
  }
  if (a.brandKnown) {
    return `${kwCap} mı arıyorsunuz? JETGO Pet Shop, ${descriptor(a)} ihtiyacınızı orijinal ve faturalı ürünle, stok durumuna göre Atakum ve Samsun geneline hızlı teslimatla karşılar.`;
  }
  return `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun; geniş mama yelpazesi ve hızlı teslimatla yanınızda. Aradığınız ürünü veya dengi premium alternatifleri stok durumuna göre aynı gün kapınıza ulaştırabiliriz.`;
}

function buildJetgoPage(e: Ent, idx: number, related: Array<{ text: string; href: string }>): SeoPageData {
  const { kw, slug, a } = e;
  const K = trTitle(kw);
  const kwCap = trCap(kw);

  const hoods = Array.from({ length: 6 }, (_, i) => NEIGHBORHOODS[(idx * 3 + i) % NEIGHBORHOODS.length]);
  const uniqueHoods: string[] = [];
  for (const h of hoods) if (!uniqueHoods.includes(h)) uniqueHoods.push(h);

  const sections: Section[] = [explainerSection(K, a)];
  const bs = breedSizeSection(K, a);
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
      introFor(kwCap, a),
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

export const MARKALAR_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildJetgoPage(e, i, relatedFor(e, i)),
);
