// ---------------------------------------------------------------------------
// JETGO-EXCLUSIVE "diğer anahtar kelimeler" (broad pet-shop) keyword landing
// pages — the 4th jetgo corpus after Pro Plan, Royal Canin and "diğer markalar".
//
// jetgomarket.com (store id "jetgo", a LOCAL same-day Atakum/Samsun store) gets
// its OWN dedicated SEO landing page for every keyword in
// attached_assets/DİĞER_ANAHTAR_KELİMELER_1781966780764.txt (see diger-keywords.ts).
//
// Unlike the prior three (food-only) corpora this set is BROAD and MULTI-CATEGORY:
// cat/dog food, bird & small-pet supplies, litter, collars/leashes, beds/houses,
// carriers/cages, bowls/feeders, grooming products, toys, clothing, health
// supplements — PLUS several TRUTHFULNESS-SENSITIVE intents. A priority classifier
// routes each keyword to a category-appropriate, truthful template.
//
// They are tagged `storeId: "jetgo"` so they are served ONLY on jetgomarket.com.
// Slugs are NEW; seo-data.ts pushes them while skipping any slug that would clobber
// a hand-authored NON-keyword curated page and de-duplicating against the Pro Plan
// + Royal Canin + markalar jetgo corpora (same store, earlier corpora win).
//
// TRUTHFULNESS RULES (load-bearing — keep them):
//  - Stock varies, so we NEVER guarantee a specific item is in stock. Wording is
//    always "stok durumuna göre / sipariş öncesi teyit edin", never "stokta".
//  - Each page is framed around the REAL product CATEGORY. We never put feeding /
//    mama copy on a collar, litter, bed or accessory page, and vice-versa.
//  - RETAILER / marketplace keywords (Trendyol, Migros, BİM, Akakçe, Cimri ...) are
//    framed as a LOCAL ALTERNATIVE; we NEVER claim affiliation with them.
//  - LIVE-ANIMAL / "köpek fiyatları / yavru kedi / sahiplenme" keywords: pet shops
//    in Türkiye do not sell live cats and dogs. We NEVER offer live animals for
//    sale; we point to responsible adoption (sahiplenme) and supply everything the
//    new pet needs.
//  - SERVICE keywords (kuaför, pansiyon/otel, eğitim merkezi, bakım evi): JETGO is
//    a SUPPLY shop. We do NOT claim to provide grooming/boarding/training services
//    unless the business confirms it; we provide the supporting products.
//  - "fiyat / ucuz" pages NEVER state fabricated prices; "yorum" pages never
//    fabricate reviews. Health/supplement pages make no medical/cure claims.
//  - Non-pet noise keywords are SKIPPED — see DIGER_SKIPPED_NOISE.
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { DIGER_KEYWORDS } from "./diger-keywords";
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
  "Tüm ürünlerimiz orijinal ve faturalıdır; gıda ürünlerinde son kullanma tarihi uzun, doğru saklanmış ürünleri tercih ederiz.";
const STOCK_LINE = `Stok durumu zamanla değiştiğinden, aradığınız ürünün güncel mevcudiyetini sipariş öncesi WhatsApp veya ${PHONE} üzerinden teyit etmenizi öneririz; ürün yoksa aynı segmentte uygun bir alternatif sunarız.`;

const NEIGHBORHOODS = [
  "Denizevleri", "Atakent", "Mimar Sinan", "Yenimahalle", "Kurupelit", "Cumhuriyet",
  "Körfez", "Esenevler", "Çatalçam", "Aksu", "Taflan", "Balaç", "Güzelyalı",
  "İncesu", "Alanlı", "Kamalı", "Beypınar", "Yeşiltepe", "Karakavuk", "Elmaçukuru",
  "İlkadım", "Canik", "Tekkeköy", "Bafra yolu çevresi",
];

// ---------------------------------------------------------------------------
// Taxonomy.
// ---------------------------------------------------------------------------

type Animal = "kedi" | "köpek" | "kuş" | "kemirgen" | "balık" | "genel";
type Intent = "product" | "fiyat" | "info";
type Cat =
  | "retailer"
  | "live"
  | "service"
  | "litter"
  | "bird"
  | "collar"
  | "bed"
  | "carrier"
  | "bowl"
  | "grooming"
  | "toy"
  | "clothing"
  | "health"
  | "guide"
  | "food"
  | "shop";

interface Attr {
  cat: Cat;
  animal: Animal;
  intent: Intent;
  retailer: string;
  // food sub-attributes
  isTreat: boolean;
  stage: string; // yavru | yetişkin | yaşlı | anne | ""
  flavor: string;
  size: string;
  dietKey: string;
  brand: string;
  // litter / service / live descriptors
  litterKind: string;
  serviceKind: string;
  liveKind: string;
}

// Non-pet noise. This broad pet-shop export is essentially clean; we keep a
// conservative guard (foreign telecom autocomplete that has leaked into other
// exports) and export the count for the tests. NOTE: "spectrum" here is the pet
// FOOD brand (spectrum kedi maması), so it is deliberately NOT treated as noise.
const NOISE_RE = /\bpaquetes\b|promociones|sin contrato|com calificado|iphone|samsung galaxy|kontör|fatura öde|elektrik faturas/;

// Slugs reserved by real client app routes (App.tsx). A generated SEO slug that
// equals one of these would shadow the app route and break the orphan-link
// invariant on stores where the keyword page is not served (e.g. "açık mama" is
// the Askıda Mama donation feature at /acik-mama/:animal, not a sellable SKU).
// Such keywords are dropped from the corpus.
const RESERVED_SLUGS = new Set<string>([
  "petshop", "kategori", "veteriner", "urun", "urun-demo", "siparis", "odeme",
  "odeme-sonuc", "admin", "siparis-takip", "favoriler", "giris", "abone",
  "sokak-canlari", "hesabim", "kampanya", "yarisma", "ozel-patiler", "kayip-ilan",
  "pati-blog", "blog", "sss", "kvkk", "gizlilik", "kullanim-kosullari",
  "cerez-politikasi", "islem-rehberi", "hakkimizda", "iletisim", "magaza",
  "teslimat-iade", "gizlilik-sozlesmesi", "mesafeli-satis", "acik-mama", "n",
]);

// ---------------------------------------------------------------------------
// Detectors (priority order is enforced in detectCat).
// ---------------------------------------------------------------------------

const RETAILERS: Array<[RegExp, string]> = [
  [/hepsiburada|hepsi burada/, "Hepsiburada"],
  [/trendyol/, "Trendyol"],
  [/\bn11\b/, "n11"],
  [/gittigidiyor/, "GittiGidiyor"],
  [/amazon/, "Amazon"],
  [/migros/, "Migros"],
  [/\bbim\b/, "BİM"],
  [/\ba ?101\b/, "A101"],
  [/\bşok\b|şok market/, "ŞOK"],
  [/carrefour/, "CarrefourSA"],
  [/akakçe|akakce/, "Akakçe"],
  [/cimri/, "Cimri"],
  [/çiçeksepeti|ciceksepeti/, "Çiçeksepeti"],
  [/petlebi/, "Petlebi"],
  [/pet ?çantam|petçantam/, "Petçantam"],
];

function detectRetailer(k: string): string {
  for (const [re, name] of RETAILERS) if (re.test(k)) return name;
  return "";
}

// Product / category nouns. If ANY of these appear, the keyword is about a
// PRODUCT/CATEGORY, not a live animal — used to guard the live-animal classifier.
// NOTE: dental-product cue is `diş(?!i)` so "diş bakımı / diş fırçası / diş
// macunu" still classify as products, while "dişi" (FEMALE animal, e.g. "dişi
// muhabbet kuşu satılık") is NOT swallowed as a product — that is a live-animal
// query and must reach the live classifier below. The ASCII fallback is `\bdis\b`
// so it never matches inside "disi" either.
const PRODUCT_NOUN_RE =
  /mama|mamas|kumu|\bkum\b|tasma|yatağ|yatak|minder|kafes|çanta|canta|oyuncak|kuaför|kuafor|eğitim|egitim|şampuan|sampuan|vitamin|takviye|mama kab|su kab|\bkab[ıi]\b|suluk|\byem\b|yemi|tuvalet|kemik|ödül|odul|macun|malt(?![a-z])|tarak|fırça|firca|tırmalama|tirmalama|aksesuar|malzeme|ürün|urun|kıyafet|kiyafet|yağmurluk|yagmurluk|sakinleştir|sakinlestir|\bpire\b|\bkene\b|damla|şampu|bakım ürün|bakim urun|çorba|corba|konserve|biskü|biscu|gaga|tüy|tuy|pati|kulak|diş(?!i)|\bdis\b|isimlik/;

// Any LIVE animal noun (all species: cats/dogs, birds, rabbits/rodents, fish,
// reptiles). Used by the live classifier so a buy/adopt/live intent on ANY
// species — not just cats and dogs — is treated as a live-animal query.
const LIVE_ANIMAL_RE =
  /\bkedi|\bköpe[kğ]|\bkopek|kitten|puppy|yavru|muhabbet|kanarya|papağan|papagan|sultan|paraket|\bfinch\b|ispinoz|\bsaka\b|forpus|jako|kakadu|kakariki|kuş|\bkus\b|tavşan|tavsan|hamster|guinea|gine domuz|ginepig|ginpig|kemirgen|şinşilla|sinsilla|gerbil|\bfare\b|sıçan|sican|balı[kğ]|balik|japon balığ|japon balig|lepistes|\bmoli\b|melek balığ|sürüngen|surungen|kaplumbağa|kaplumbaga|iguana|gekko|yılan|yilan/;

// A tangible product/object as the SUBJECT (extends PRODUCT_NOUN_RE with words
// like "ev"/"kulübe"/"yağ"/"otu" that pair with an animal noun but denote a
// PRODUCT — "kedi evi" = a cat house, "balık yağı" = fish oil, "kedi otu" =
// catnip). When the subject is a product, a buy/price cue is about that product,
// NOT a live animal — so the live classifier must bail out.
const TANGIBLE_SUBJECT_RE =
  /mama|mamas|kumu|\bkum\b|tasma|koşum|kosum|yatağ|yatak|minder|\bevi\b|köpek ev|kopek ev|kedi ev|kuş ev|kus ev|kulübe|kulube|kümes|kumes|kuluçka|kulucka|kafes|çanta|canta|oyuncak|şampuan|sampuan|vitamin|takviye|\bkab[ıi]\b|suluk|\byem\b|yemi|tuvalet|kemik|ödül|odul|macun|malt(?![a-z])|tarak|fırça|firca|tırmalama|tirmalama|kıyafet|kiyafet|yağmurluk|yagmurluk|\byağ|\byag|\botu\b|catnip|nane|zehir|kapan|tuzak|damla|konserve|biskü|biscu|isimlik|gaga|mineral|file|aksesuar|malzeme|ürün|urun/;

// Service words (JETGO does NOT provide these). For a weak (price-only) cue, a
// service noun means the price refers to a SERVICE, not to a live animal. NB:
// "eğitim/eğitimi" (training, a NOUN) is a service, but "eğitimli" (TRAINED, an
// adjective) is an animal attribute — so the cue is `eğitim(?!li)`.
const SERVICE_ANY_RE =
  /kuaför|kuafor|pansiyon|\botel\b|gezdirme|eğitim(?!li)|egitim(?!li)|eğitmen|egitmen|tıraş|tiras|bakım|bakim|kısırlaş|kisirlas|aşı|asi|veteriner|merkez/;

// Strong acquisition cue: the user explicitly wants to OBTAIN a living thing.
const STRONG_LIVE_CUE =
  /sahiplen|sahiplendir|satılık|satilik|satlık|satış|satis|satıl|satil|satan|satma|\bsat\b|satın al|satin al|alan(?=\s|$)|alanlar|alıcı|alici|\balmak\b|\balma\b|bedava|ücretsiz|ucretsiz|sahibinden|(^|\s)canl[ıi](\s|$)/;
// Weak cue: a bare price query (ambiguous between a live animal and a service/product).
const WEAK_LIVE_CUE = /fiyat|ücret|ucret|\bucuz\b|ne kadar|ka[cç] (para|tl)/;

// Animal HEAD nouns (+ their Turkish suffixes via \S*). Used to subtract the
// animal from a stripped keyword: if NOTHING meaningful remains, the subject IS
// the live animal.
const ANIMAL_HEAD_RE =
  /(muhabbet|kanarya|papağan|papagan|sultan|paraket|finch|ispinoz|saka|forpus|jako|kakadu|kakariki|kuş|kus|kedi|köpe[kğ]|kopek|kitten|puppy|tavşan|tavsan|hamster|guinea|gine|domuz|ginepig|ginpig|kemirgen|şinşilla|sinsilla|gerbil|fare|sıçan|sican|balı[kğ]|balik|lepistes|moli|melek|japon|kaplumbağa|kaplumbaga|iguana|gekko|yılan|yilan|sürüngen|surungen)\S*/g;

// Benign descriptor words (colour / breed-quality / age / origin / qualifier) that
// modify a live animal without changing the subject. Stripped before the residue
// check so "jumbo dişi muhabbet kuşu fiyatları" still resolves to a bare animal.
// NB: boundaries use Unicode letter/number lookarounds (NOT ASCII \b), because
// ASCII \b never sees a boundary between a Turkish letter (ç/ş/ı/ğ/ü/ö) and a
// space — so "\banaç\b", "\bçift\b", "\bkırmızı\b" silently fail to match.
const BENIGN_MODIFIER_RE =
  /(?<![\p{L}\p{N}])(?:jumbo|show|konuşan|konusan|eğitimli|egitimli|terbiyeli|ithal|ingiliz|evcil|süs|sus|minik|sevimli|anaç|anac|çift|cift|eş|es|eşli|esli|adet|tane|aylık|aylik|aylığ|albino|lutino|gri|beyaz|sarı|sari|mavi|yeşil|yesil|kırmızı|kirmizi|mor|siyah|kara|kanat|açık|acik|koyu|dişi|disi|erkek|yavru|yavrusu|bir|cins|cinsi|tür|turu|türü|türleri|turleri|büyük|buyuk|küçük|kucuk|pet ?shop|petshop|pahalı|pahali|güzel|guzel|sağlıklı|saglikli|temiz|sokak|jako|cennet|sevda|forpus|lop|kangal|hollanda|angora|kakadu|kakariki|amazon|alexander|pamuk|isabel|sultan|normal|cüce|cuce|teddy|bebek|ele|alışkın|aliskin|toplu|toptan|yerli|yetişkin|yetiskin|sov|şov|gerçek|gercek|uygun|en|hayvan|hayvanı|hayvani|pembe|turuncu|renkli|gökkuşağı|gokkusagi|pastel|tepeli|grey|gray|pearl|pied|mutasyon|mutant|parrot|wf|wifi|ve|çeşit|cesit|çeşitleri|cesitleri|çeşidi|cesidi|maltese|chow|hint|maskeli|monk|sevgi|sulta)(?![\p{L}\p{N}])/gu;

// Intent / availability / place words removed before the residue check (incl.
// "where to buy" phrasing: satan yerler / petshoplar / sahibinden.com).
const LIVE_INTENT_STRIP_RE =
  /fiyat\S*|ücret\S*|ucret\S*|ucuz\S*|satış\S*|satis\S*|satılık|satilik|satlık|satıl\S*|satil\S*|satan\S*|satılan\S*|satilan\S*|satma\S*|\bsat\b|satın al\S*|satin al\S*|alanlar\S*|alan(?=\s|$)|alıcı\S*|alici\S*|\balmak\b|\balma\b|\balınır\b|alinir|sahiplen\S*|bedava|ücretsiz|ucretsiz|sahibinden|nereden\S*|ne kadar|ka[cç] (para|tl)|\bka[cç]\b|en (ucuz|pahalı|pahali)|güncel|guncel|(^|\s)canl[ıi](\s|$)|petshop\S*|pet ?shop\S*|mağaza\S*|magaza\S*|dükkan\S*|dukkan\S*|\byerler\S*|\byeri\b|\byer\b|nerede\S*|\bsite\S*|\bcom\b|online/g;

// Classify a buy/price/adopt query whose SUBJECT is a live animal (any species).
// Returns "" when the subject is actually a product (kedi evi / balık yağı) or a
// service (köpek eğitimi fiyatı) — those keep their own category.
function liveKindOf(k: string): string {
  // A bare breed name ("kangal", "pug") is itself the live animal even with no
  // generic head, so it must also open the live classifier.
  if (!LIVE_ANIMAL_RE.test(k) && !BREED_RE.test(k)) return "";
  const strong = STRONG_LIVE_CUE.test(k);
  const weak = WEAK_LIVE_CUE.test(k);
  if (!strong && !weak) return "";
  // The subject is a tangible product → not a live-animal query.
  if (TANGIBLE_SUBJECT_RE.test(k)) return "";
  // A bare price over a service noun ("köpek eğitimi fiyatı") is a SERVICE price.
  // With an explicit buy/adopt cue, only "eğitimli/terbiyeli" (a trained-animal
  // ATTRIBUTE, handled by BENIGN) survives — a bare service noun stays as residue
  // below and so is never classified as a live sale.
  if (!strong && SERVICE_ANY_RE.test(k)) return "";
  let core = k.replace(LIVE_INTENT_STRIP_RE, " ");
  core = core.replace(BENIGN_MODIFIER_RE, " ").replace(/\d+/g, " ").replace(/\s+/g, " ").trim();
  const residue = core
    .replace(ANIMAL_HEAD_RE, " ")
    .replace(BREED_STRIP_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (residue !== "") return ""; // a non-animal subject remains → not a live query
  if (/sahiplen|sahiplendir/.test(k)) return "sahiplenme";
  if (strong) return "satış";
  return "fiyat";
}

// Hard service signals (grooming / boarding / vet clinic).
const SERVICE_CORE_RE =
  /kuaför|kuafor|pansiyon|\botel\b|bakım evi|bakim evi|veteriner kliniğ|veteriner klinig|aşı (yap|takvim)|asi (yap|takvim)/;

// A keyword is a SERVICE search if it hits a hard signal, OR it is about training
// (eğitim/eğitmen) that is NOT DIY toilet training, OR dog-walking (gezdirme) that
// is not a leash product. JETGO does not provide these services — we say so plainly.
function isService(k: string): boolean {
  if (SERVICE_CORE_RE.test(k)) return true;
  if (/eğitim|egitim|eğitmen|egitmen/.test(k) && !/tuvalet/.test(k)) return true;
  if (/gezdirme/.test(k) && !/tasma|kayış|kayis|koşum|kosum/.test(k)) return true;
  return false;
}

function detectService(k: string): string {
  if (/kuaför|kuafor/.test(k)) return "kuaför";
  if (/pansiyon|\botel\b|bakım evi|bakim evi/.test(k)) return "pansiyon";
  if (/eğitim|egitim|eğitmen|egitmen/.test(k)) return "eğitim";
  if (/veteriner|aşı|asi/.test(k)) return "veteriner";
  if (/gezdirme/.test(k)) return "gezdirme";
  return "hizmet";
}

const CAT_BREEDS = /persian|persan|iran kedisi|british|scottish|sphynx|maine coon|\bcoon\b|ragdoll|van kedisi|tekir|sarman|ankara kedisi|bengal/;
const DOG_BREEDS = /labrador|golden|rottweiler|chihuahua|yorkshire|shih ?tzu|jack russell|cocker|border collie|french bulldog|bulldog|cane corso|teckel|dachshund|poodle|pomeranian|boxer|german shepherd|alman çoban|alman coban|beagle|husky|retriever|terrier|kangal|akbaş|akbas|pug/;

// A breed name IS a live-animal subject even with no generic head ("kangal fiyatı",
// "pug fiyatı"). BREED_RE (non-global) gates the live classifier; BREED_STRIP_RE
// (global, + \S* for Turkish suffixes) subtracts the breed in the residue check.
const BREED_RE = new RegExp(`${CAT_BREEDS.source}|${DOG_BREEDS.source}`);
const BREED_STRIP_RE = new RegExp(`(?:${CAT_BREEDS.source}|${DOG_BREEDS.source})\\S*`, "g");

// Live-animal / adoption signals.
function detectLive(k: string): string {
  // Buy / price / adopt query whose SUBJECT is a live animal of ANY species
  // ("muhabbet kuşu fiyatları", "tavşan satışı", "kanarya almak", "eğitimli
  // muhabbet kuşu satılık"). Returns "" when the subject is really a product
  // ("kedi evi", "balık yağı") or a service ("köpek eğitimi fiyatı").
  const lk = liveKindOf(k);
  if (lk) return lk;
  if (PRODUCT_NOUN_RE.test(k)) return "";
  // The subject is a tangible product ("satılık köpek kulübesi" = a dog HOUSE for
  // sale, "balık yağı satışı" = fish OIL) — the sale/buy cue is about that product,
  // never a live animal. Must bail before the generic satılık/satın-al fallback
  // below, or the product page would wrongly carry the live-animal no-sale framing.
  if (TANGIBLE_SUBJECT_RE.test(k)) return "";
  // Sale/adopt cue without a recognised animal token (rare) — still no-sale safe.
  if (/sahiplen|sahiplendir/.test(k)) return "sahiplenme";
  if (/satılık|satilik|satlık|satin al|satın al/.test(k)) return "satış";
  // strip trailing price/intent words (incl. Turkish suffixes), then test the
  // remainder. \S* consumes suffixes like "fiyatları" that JS \b cannot, because
  // ı/ş/… are non-ASCII and break ASCII word boundaries.
  const stripped = k
    .replace(/fiyat\S*|ücret\S*|ucuz\S*|en ucuz|ne kadar|ka[cç] (para|tl)|\bka[cç]\b|cinsleri|türleri|turleri/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const bareAnimal =
    /^(süs |sus |ev |minik |sevimli |yavru )?(köpek(ler|leri)?|kedi(ler|leri)?|kopek(ler|leri)?)$/.test(stripped) ||
    /^(petshop|pet shop|petshop'?ta|akvaryum)? ?(köpek|kedi|kopek)$/.test(stripped) ||
    /^(yavru )?(köpek|kedi|kopek)$/.test(stripped) ||
    /^pet ?shop$/.test(stripped);
  if (bareAnimal) return "fiyat";
  // breed-only queries ("british kedi", "golden köpek", "scottish fold")
  if ((CAT_BREEDS.test(stripped) || DOG_BREEDS.test(stripped)) &&
      !/(mama|kumu|tasma|yatak|kafes|oyuncak|şampuan|sampuan|bakım|bakim)/.test(stripped) &&
      /(kedi|köpe[kğ]|kopek|cat|dog|fold|shorthair|terrier|retriever|bulldog|spaniel)/.test(stripped)) {
    return "cins";
  }
  return "";
}

const LITTER_RE =
  /\bkum\b|kumu|bentonit|silika|silica|kristal|topaklan|karbonlu|kedi tuvalet|tuvalet kab|elekli|kapalı tuvalet|kapali tuvalet|kürek|kurek|kepçe|kepce|less trail|magicsand|sanicat|ever ?clean|van ?cat|lindo ?cat|benty ?sandy|pisi pisi|feles|bastet|cat'?s best|cats best|pinkylux/;

function detectLitterKind(k: string): string {
  if (/bentonit/.test(k)) return "bentonit";
  if (/silika|silica|kristal/.test(k)) return "silika/kristal";
  if (/karbonlu|aktif karbon/.test(k)) return "karbonlu";
  if (/topaklan/.test(k)) return "topaklanan";
  if (/tuvalet|elekli|kapalı|kapali|kürek|kurek|kepçe|kepce/.test(k)) return "kabı";
  return "genel";
}

const BIRD_RE =
  /muhabbet|kanarya|papağan|papagan|sultan|paraket|finch|ispinoz|saka kuşu|saka kus|kuş yemi|kus yemi|kuş kafes|kus kafes|kuş gaga|gaga taşı|gaga tasi|mineral blok|kuş süt|kus sut|tavşan|tavsan|hamster|guinea|gine domuz|kemirgen|ginepig|ginpig|akvaryum|balık yemi|balik yemi|japon balığ|japon balig|lepistes|moli|melek balığ/;

function detectBirdAnimal(k: string): Animal {
  if (/muhabbet|kanarya|papağan|papagan|sultan|paraket|finch|ispinoz|saka|kuş|kus|gaga/.test(k)) return "kuş";
  if (/akvaryum|balık|balik|japon balığ|lepistes|moli|melek/.test(k)) return "balık";
  if (/tavşan|tavsan|hamster|guinea|gine|kemirgen|ginepig/.test(k)) return "kemirgen";
  return "kuş";
}

const COLLAR_RE = /tasma|tasması|tasmasi|göğüs tasm|gogus tasm|boyun tasm|gezdirme|uzatmalı tasma|uzatmali tasma|flexi|kayış|kayis|koşum|kosum|\bharness\b|havlama (önle|tasm|engel)/;
const BED_RE = /yatağ|yatak|minder|kedi evi|köpek evi|kopek evi|kulübe|kulube|tünel|tunel|peluş yatak/;
const CARRIER_RE = /taşıma çanta|tasima canta|taşıma kab|tasima kab|seyahat çanta|seyahat canta|sırt çanta|sirt canta|\bkafes\b|kedi kafes|köpek kafes|kuş kafes|kus kafes/;
const BOWL_RE = /mama kab|su kab|\bkab[ıi]\b|suluk|otomatik mama|zaman ayarlı|zaman ayarli|mama matı|mama mati|sefer tası|sefer tasi|çeşme|cesme|fıskiye|fiskiye|isimlik/;
const GROOMING_RE = /şampuan|sampuan|tüy toplay|tuy toplay|tırmalama|tirmalama|tırmık|tirmik|fırça|firca|\btarak\b|tüy döken|tuy doken|tüy dökme önley|pati bakım|pati bakim|kulak temiz|diş bakım|dis bakim|diş fırça|dis firca|pati kremi|tuydan ar|tüyden ar|parfüm|parfum|ıslak mendil|islak mendil|pet kuaför set/;
const TOY_RE = /oyuncak|catnip|kedi nane|kedi naneli|oltalı|oltali|tüy oyun|tuy oyun|top oyun|fare oyun|lazer oyun|kedi tüneli|kedi tuneli|çıngırak|cingirak/;
const CLOTHING_RE = /yağmurluk|yagmurluk|kıyafet|kiyafet|\bmont\b|elbise|patik|köpek ayakkab|kopek ayakkab|tişört|tisort|kazak|köpek bandana/;
const HEALTH_RE =
  /vitamin|takviye|sakinleştir|sakinlestir|\bpire\b|\bkene\b|\bbit\b|damla|spot ?on|paraziter|antiparaziter|solucan|iç parazit|ic parazit|dış parazit|dis parazit|biofeline|advantage|seresto|frontline|bravecto|bravento|tüy yumağı|tuy yumagi|hairball|probiyotik|omega|balık yağı|balik yagi|kalsiyum|biotin|göz damla|goz damla|tomru/;
const GUIDE_RE =
  /bakımı|bakimi|tuvalet eğitim|tuvalet egitim|eğitim|egitim|nasıl|nasil|tüy dök|tuy dok|beslenme|barf|kısırlaştırma|kisirlastirma|hamile|doğum|dogum|aşı takvim|asi takvim|ısırma|isirma|havlama (sorun|neden)|tırnak kesme|tirnak kesme/;
const SHOP_RE = /malzeme|ürünleri|urunleri|aksesuar|pet shop|petshop|\bürün\b|\burun\b|eşyalar|esyalar|reyon/;

const FOOD_RE =
  /mama|mamas|yaş mama|yas mama|kuru mama|konserve|barf|kedi yemi|köpek yemi|kopek yemi|ödül maması|odul mamasi|çorba|corba|biskü|biscu|granül|granul|kibble/;

// Recognised food brands (display names only — used to frame the page truthfully,
// not to make brand-specific claims).
const FOOD_BRANDS: Array<[RegExp, string]> = [
  [/royal ?canin/, "Royal Canin"], [/pro ?plan|proplan/, "Pro Plan"],
  [/hill ?'?s|hills/, "Hill's"], [/n ?& ?d|farmina/, "N&D (Farmina)"],
  [/whiskas/, "Whiskas"], [/friskies/, "Friskies"], [/felix/, "Felix"],
  [/gourmet/, "Gourmet"], [/sheba/, "Sheba"], [/pedigree/, "Pedigree"],
  [/acana/, "Acana"], [/orijen/, "Orijen"], [/brit ?care|brit/, "Brit"],
  [/advance/, "Advance"], [/bonacibo/, "Bonacibo"], [/reflex ?plus|reflex/, "Reflex"],
  [/\benjoy\b/, "Enjoy"], [/felicia/, "Felicia"], [/\bmito\b/, "Mito"],
  [/micho/, "Micho"], [/bozita/, "Bozita"], [/schesir/, "Schesir"],
  [/sanabelle/, "Sanabelle"], [/matisse/, "Matisse"], [/bonnie/, "Bonnie"],
  [/molly/, "Molly"], [/pro ?choice/, "ProChoice"], [/pro ?performance/, "ProPerformance"],
  [/pronature/, "Pronature"], [/lavital/, "LaVital"], [/cat ?chow/, "Cat Chow"],
  [/dog ?chow/, "Dog Chow"], [/purina ?one|purina/, "Purina"], [/cibau/, "Cibau"],
  [/temizmama|temiz mama/, "TemizMama"], [/econature|eco ?nature/, "EcoNature"],
  [/trendline/, "Trendline"], [/spectrum/, "Spectrum"], [/dr ?sacchi/, "Dr.Sacchi"],
  [/exclusion/, "Exclusion"], [/bosch/, "Bosch"], [/\bmera\b/, "Mera"],
  [/proline|pro ?line/, "Proline"], [/\bvirbac\b/, "Virbac"], [/\bmiamor\b/, "Miamor"],
];

function detectFoodBrand(k: string): string {
  for (const [re, name] of FOOD_BRANDS) if (re.test(k)) return name;
  return "";
}

function detectAnimal(k: string): Animal {
  if (BIRD_RE.test(k)) return detectBirdAnimal(k);
  if (CAT_BREEDS.test(k)) return "kedi";
  if (DOG_BREEDS.test(k)) return "köpek";
  if (/\bkedi\b|kitten|\bqueen\b|\bcat\b|kısır kedi|kisir kedi|kedi maması/.test(k)) return "kedi";
  if (/\bköpek\b|\bkopek\b|puppy|\bdog\b|köpek maması|kopek mamasi/.test(k)) return "köpek";
  return "genel";
}

function detectStage(k: string): string {
  if (/\banne\b|hamile|gebe|emziren|\bqueen\b|mother/.test(k)) return "anne";
  if (/\bsenior\b|yaşl|yasl|\bmature\b|ageing|yaşlı/.test(k)) return "yaşlı";
  if (/yavru|kitten|puppy|junior|starter|growth|\bbaby\b|bebek/.test(k)) return "yavru";
  if (/yetişkin|yetiskin|\badult\b/.test(k)) return "yetişkin";
  return "";
}

function detectFlavor(k: string): string {
  if (/tavuk|chicken/.test(k)) return "tavuklu";
  if (/kuzu|lamb/.test(k)) return "kuzu etli";
  if (/biftek|sığır|sigir|dana|\bbeef\b|parça etli|parca etli/.test(k)) return "biftekli";
  if (/somon|salmon|alabalık|alabalik/.test(k)) return "somonlu";
  if (/morina|okyanus|ringa|deniz ürün|balık|balik|\bfish\b/.test(k)) return "balıklı";
  if (/hindi|turkey/.test(k)) return "hindili";
  if (/tahılsız|tahilsiz|grain free|düşük tahıl|dusuk tahil/.test(k)) return "tahılsız";
  return "";
}

function detectSize(k: string): string {
  const kgDec = k.match(/(\d{1,3})[.,](\d)\s*(kg|kilo)/);
  if (kgDec) return `${kgDec[1]}.${kgDec[2]} kg`;
  const kg = k.match(/\b(\d{1,3})\s*(kg|kilo)\b/);
  if (kg) return `${kg[1]} kg`;
  const lt = k.match(/\b(\d{1,3})\s*(lt|litre|l)\b/);
  if (lt) return `${lt[1]} lt`;
  const gr = k.match(/\b(\d{2,4})\s*(gr|gram)\b/);
  if (gr) return `${gr[1]} gr`;
  return "";
}

function detectDietKey(k: string): string {
  if (/gastro|sindirim|digestive/.test(k)) return "gastro";
  if (/urinary|idrar|üriner|uriner/.test(k)) return "urinary";
  if (/renal|böbrek|bobrek/.test(k)) return "renal";
  if (/hypoallergenic|hipoalerj|food sensitiv|gıda hassas|gida hassas/.test(k)) return "hypo";
  if (/sterilised|sterilize|kısırlaş|kisirlas|kısır|kisir/.test(k)) return "sterilised";
  if (/light|düşük yağ|dusuk yag|kilo kontrol|diyet/.test(k)) return "light";
  if (/sensible|sensitive|hassas/.test(k)) return "sensitive";
  if (/indoor/.test(k)) return "indoor";
  return "";
}

function detectIntent(k: string): Intent {
  if (/içindekiler|icindekiler|özellik|ozellik|hakkında|hakkinda|yorum|ekşi|eksi|şikayet|sikayet|\bnedir\b|resmi site|sitesi|içerik|\bonline\b/.test(k)) {
    return "info";
  }
  if (/fiyat|ucuz|kampanya|indirim|toptan|outlet|uygun fiyat|akakçe|akakce|cimri/.test(k)) {
    return "fiyat";
  }
  return "product";
}

// PRIORITY classifier — first match wins.
function detectCat(k: string): Cat {
  if (detectRetailer(k)) return "retailer";
  // A definitive live-animal sale/adopt cue ("eğitimli ... satılık") must outrank
  // a service match; detectLive only returns truthy for genuine live queries, so
  // running it before isService is safe for real services (köpek eğitimi → "").
  if (detectLive(k)) return "live";
  if (isService(k)) return "service";
  if (LITTER_RE.test(k)) return "litter";
  if (BIRD_RE.test(k)) return "bird";
  if (COLLAR_RE.test(k)) return "collar";
  if (BED_RE.test(k)) return "bed";
  if (CARRIER_RE.test(k)) return "carrier";
  if (BOWL_RE.test(k)) return "bowl";
  if (GROOMING_RE.test(k)) return "grooming";
  if (TOY_RE.test(k)) return "toy";
  if (CLOTHING_RE.test(k)) return "clothing";
  if (HEALTH_RE.test(k)) return "health";
  if (FOOD_RE.test(k) || detectFoodBrand(k)) return "food";
  if (GUIDE_RE.test(k)) return "guide";
  if (SHOP_RE.test(k)) return "shop";
  return "shop";
}

function analyze(rawKw: string): Attr {
  const k = rawKw.toLocaleLowerCase("tr-TR");
  const cat = detectCat(k);
  const animal = cat === "bird" ? detectBirdAnimal(k) : detectAnimal(k);
  const isTreat = cat === "food" && /ödül|odul|\bsnack\b|\bstick\b|biskü|biscu|kemik|çiğneme|cigneme/.test(k);
  return {
    cat,
    animal,
    intent: detectIntent(k),
    retailer: cat === "retailer" ? detectRetailer(k) : "",
    isTreat,
    stage: cat === "food" ? detectStage(k) : "",
    flavor: cat === "food" ? detectFlavor(k) : "",
    size: detectSize(k),
    dietKey: cat === "food" ? detectDietKey(k) : "",
    brand: cat === "food" ? detectFoodBrand(k) : "",
    litterKind: cat === "litter" ? detectLitterKind(k) : "",
    serviceKind: cat === "service" ? detectService(k) : "",
    liveKind: cat === "live" ? detectLive(k) : "",
  };
}

// ---------------------------------------------------------------------------
// Helpers.
// ---------------------------------------------------------------------------

function animalWord(a: Animal): string {
  switch (a) {
    case "kedi": return "kedi";
    case "köpek": return "köpek";
    case "kuş": return "kuş";
    case "kemirgen": return "küçük dostunuz";
    case "balık": return "balığınız";
    default: return "evcil dostunuz";
  }
}

function categoryNoun(a: Attr): string {
  switch (a.cat) {
    case "litter": return "kedi kumu";
    case "collar": return a.animal === "köpek" ? "köpek tasması" : a.animal === "kedi" ? "kedi tasması" : "tasma";
    case "bed": return a.animal === "köpek" ? "köpek yatağı" : a.animal === "kedi" ? "kedi yatağı" : "evcil hayvan yatağı";
    case "carrier": return "taşıma çantası / kafesi";
    case "bowl": return "mama ve su kabı";
    case "grooming": return a.animal === "köpek" ? "köpek bakım ürünü" : "kedi bakım ürünü";
    case "toy": return a.animal === "köpek" ? "köpek oyuncağı" : "kedi oyuncağı";
    case "clothing": return "köpek kıyafeti";
    case "health": return "bakım ve takviye ürünü";
    case "bird":
      return a.animal === "balık" ? "akvaryum/balık ürünü" : a.animal === "kemirgen" ? "kemirgen/tavşan ürünü" : "kuş yemi ve ürünleri";
    case "food":
      if (a.isTreat) return a.animal === "köpek" ? "köpek ödülü" : "kedi ödülü";
      return a.animal === "köpek" ? "köpek maması" : a.animal === "kedi" ? "kedi maması" : "evcil hayvan maması";
    default: return "pet shop ürünü";
  }
}

// ---------------------------------------------------------------------------
// Section builders.
// ---------------------------------------------------------------------------

interface Section { h2: string; paragraphs: string[]; list?: string[] }

function foodExplainer(K: string, a: Attr): Section {
  const animal = animalWord(a.animal);
  const paras: string[] = [];
  if (a.isTreat) {
    paras.push(`${K}, ${animal}lerin günlük beslenmesini destekleyen bir ödül/atıştırmalıktır. Ödüller ana mamanın yerini tutmaz; günlük kalori alımının küçük bir kısmını oluşturacak şekilde, ambalajdaki talimata göre verilmelidir.`);
  } else {
    const dietLines: Record<string, string> = {
      gastro: `Sindirim sorunları yaşayan ${animal}ler için yüksek sindirilebilirliğe sahip formüller tercih edilir; akut/kronik sorunlarda veteriner önerisi esastır.`,
      urinary: `İdrar yolu sağlığını desteklemek için mineral dengesi ayarlanmış formüllerdir; veteriner kontrolünde kullanılması önerilir.`,
      renal: `Böbrek desteğine yönelik, fosfor ve protein dengesi ayarlanmış diyet mamalardır; mutlaka veteriner kontrolünde verilmelidir.`,
      hypo: `Gıda hassasiyeti olan ${animal}ler için sınırlı/seçilmiş protein kaynaklı formüllerdir; tepkimeleri azaltmayı amaçlar, veteriner önerisiyle kullanın.`,
      sterilised: `Kısırlaştırma sonrası ${animal}lerin enerji ihtiyacı düşer; dengeli kalorili formüller ideal kilonun korunmasına yardımcı olur.`,
      light: `Fazla kilolu ${animal}ler için düşük yağlı, dengeli kalorili light formüller tokluk hissini destekler.`,
      sensitive: `Hassas sindirim veya seçici damak tadına sahip ${animal}ler için sindirimi kolay içerikli formüllerdir.`,
      indoor: `Ev içinde yaşayan kediler için ayarlanmış kalori ve dışkı kokusunu azaltmaya yardımcı içerikli formüllerdir.`,
    };
    if (a.dietKey && dietLines[a.dietKey]) {
      paras.push(dietLines[a.dietKey]);
    } else {
      switch (a.stage) {
        case "yavru": paras.push(`Yavru dönemi hızlı büyüme dönemidir; yüksek protein, kalsiyum ve bağışıklık desteğiyle hazırlanan yavru formülleri sağlıklı gelişime katkı sağlar.`); break;
        case "yaşlı": paras.push(`İleri yaştaki ${animal}lerin yavaşlayan metabolizması ve eklem ihtiyacı için kolay sindirilebilir senior formüller tercih edilir.`); break;
        case "anne": paras.push(`Gebelik ve emzirme döneminde artan enerji ve besin ihtiyacını karşılamaya yönelik zenginleştirilmiş formüller kullanılır.`); break;
        default: paras.push(`${trCap(animal)}inizin günlük enerji, kas ve bağışıklık ihtiyacını dengeli karşılayan, ideal kilonun korunmasına yardımcı tam ve dengeli bir mamadır.`);
      }
    }
  }
  if (a.flavor) paras.push(`Seçtiğiniz ${a.flavor} içerik, lezzet ve kabul açısından ${animal}inize uygun bir tercih olabilir; damak tadı her hayvanda farklıdır.`);
  paras.push(`${STOCK_LINE} ${ORIGINAL_LINE}`);
  return { h2: `${K} Nedir, Kimler İçin Uygun?`, paragraphs: paras };
}

function foodUsage(K: string, a: Attr): Section {
  const animal = animalWord(a.animal);
  const paras: string[] = [];
  if (a.isTreat) {
    paras.push(`Ödülleri günlük kalori alımının yaklaşık %10'unu geçmeyecek şekilde verin; aşırıya kaçmayın ve her zaman temiz, taze su bulundurun.`);
  } else {
    paras.push(`Mama geçişini 7-10 güne yayın: yeni mamayı eskiyle kademeli karıştırarak sindirim sisteminin uyum sağlamasına izin verin. Önünde her zaman temiz, taze su bulundurun.`);
    if (a.dietKey && ["renal", "urinary", "gastro", "hypo"].includes(a.dietKey)) {
      paras.push(`Bu ürün özel/diyet beslenmeye yöneliktir; günlük miktar ve kullanım süresi için veterinerinizin önerisini esas alın. Diyet mamalar tek başına tedavi değil, beslenme desteğidir.`);
    } else {
      paras.push(`Günlük porsiyonu ${animal}inizin kilosuna ve aktivite düzeyine göre paket üzerindeki tabloya uygun ayarlayın; ideal kiloyu korumak için porsiyon ölçmeyi ihmal etmeyin.`);
    }
  }
  return { h2: `${trCap(animal)} Beslenmesinde Doğru Kullanım`, paragraphs: paras };
}

function litterExplainer(K: string, a: Attr): Section {
  const kindLines: Record<string, string> = {
    bentonit: `Bentonit (doğal kil) kumlar, idrarla temas edince hızlı topaklanır ve kürekle kolayca alınır; toz oranı düşük, iyi topaklanan ürünler tercih edilir.`,
    "silika/kristal": `Silika/kristal kumlar nemi ve kokuyu emerek uzun süre kuru kalır; daha az sıklıkla tam değişim gerektirir, kürekle ıslak kısımlar alınır.`,
    karbonlu: `Aktif karbonlu kumlar koku kontrolünü güçlendirir; çok kedili evlerde ve kapalı tuvaletlerde avantaj sağlar.`,
    topaklanan: `Topaklanan kumlar idrarı sıkı toplar; günlük kürekleme ve haftalık kontrolle hijyen kolaylaşır.`,
    kabı: `Kedi tuvaleti seçerken kedinizin rahatça dönebileceği genişlikte, açık veya kapalı bir model seçin; elekli/kapalı modeller koku ve saçılmayı azaltır.`,
    genel: `Kaliteli bir kedi kumu iyi topaklanır, az tozur ve kokuyu kontrol eder; kedinizin tercih ettiği taneciğe (ince/kalın) göre seçim yapmak kabulü artırır.`,
  };
  return {
    h2: `${K}: Nasıl Seçilir, Nasıl Kullanılır?`,
    paragraphs: [
      kindLines[a.litterKind] ?? kindLines.genel,
      `Tuvaleti sessiz, ulaşılabilir bir yere koyun; kum seviyesini 5-7 cm tutun, topakları her gün alın ve düzenli aralıklarla tamamen yenileyin. Tuvalet sayısı, ev içindeki kedi sayısından bir fazla olacak şekilde önerilir.`,
      `${STOCK_LINE}`,
    ],
  };
}

function birdExplainer(K: string, a: Attr): Section {
  const lines: Record<string, string> = {
    kuş: `Kuşların sağlığı dengeli yem ile başlar: tek tip tohum yerine vitamin/mineral takviyeli karışım yemler, ek olarak gaga taşı (mineral blok) ve temiz su önerilir. Tüy dökümü ve üreme dönemlerinde ihtiyaç değişebilir.`,
    kemirgen: `Tavşan ve kemirgenlerde lif açısından zengin (saman/pelet) beslenme ve diş aşınması için kemirme ürünleri önemlidir; ani yem değişiminden kaçının.`,
    balık: `Akvaryum balıklarında tür ve boyuta uygun pul/granül yem seçin; günde 1-2 kez, dakikalar içinde tükettikleri kadar verin ve su kalitesini düzenli kontrol edin.`,
  };
  return {
    h2: `${K}: Doğru Besleme ve Bakım`,
    paragraphs: [
      lines[a.animal as "kuş" | "kemirgen" | "balık"] ?? lines.kuş,
      `Yem ve aksesuarları serin, kuru ve ışık almayan bir yerde saklayın; küflenmiş veya bayatlamış yem vermeyin. Sağlık sorunlarında bir veteriner hekime danışın — bu sayfa tıbbi tavsiye yerine geçmez.`,
      `${STOCK_LINE}`,
    ],
  };
}

function accessoryExplainer(K: string, a: Attr): Section {
  const map: Record<string, string[]> = {
    collar: [
      `${K} seçerken en önemli kriter doğru ölçü ve güvenliktir: tasma ile boyun arasına iki parmak girmeli, ne çok sıkı ne çok gevşek olmalıdır. Çeken köpeklerde boyun yerine göğüs tasması (koşum) daha sağlıklıdır; kediler için emniyet kilidiyle açılan (breakaway) modeller tercih edilir.`,
      `Malzeme dayanıklı, dikişleri sağlam ve cilde temas eden yüzeyi yumuşak olmalıdır. Gezdirme için uzunluğu ayarlanabilen veya uzatmalı (flexi) tasmalar gündelik kullanımı kolaylaştırır.`,
    ],
    bed: [
      `${K} seçiminde ölçü belirleyicidir: ${animalWord(a.animal)}inizin uzanınca rahatça sığacağı, kenarları destekli bir model seçin. Kolay yıkanabilen, çıkarılabilir kılıflı yataklar hijyen açısından avantajlıdır.`,
      `Kışın daha yüksek kenarlı/peluş, yazın daha havadar modeller konfor sağlar; yatağı sakin, hava akımından uzak bir köşeye yerleştirin.`,
    ],
    carrier: [
      `${K} seçerken havalandırması iyi, sağlam kilitli ve ${animalWord(a.animal)}inizin ayağa kalkıp dönebileceği boyutta bir model seçin. Araç ve uçak seyahatleri için standartlara uygun, tabanı sabit modeller güvenlidir.`,
      `İlk kullanımdan önce çantayı evde açık bırakıp içine ödül koyarak alıştırma yapmak, seyahat stresini azaltır.`,
    ],
    bowl: [
      `${K} için paslanmaz çelik veya seramik kaplar hijyeniktir ve kolay temizlenir; devrilmeyen, kaymaz tabanlı modeller tercih edilir. Yüksek tabanlı (eğimli) kaplar, bazı köpeklerde sindirim ve duruş konforu sağlar.`,
      `Otomatik/zaman ayarlı mama ve su pınarları, gün içinde evde olmadığınızda düzenli beslenmeye yardımcı olur; suyu ve hazneyi düzenli temizleyin.`,
    ],
    grooming: [
      `${K} ile düzenli bakım, sağlıklı tüy ve deri için önemlidir: tür ve tüy yapısına uygun fırça/tarak ölü tüyleri alır, yumak oluşumunu azaltır. Banyo için yalnızca evcil hayvanlara özel, pH dengeli şampuan kullanın — insan şampuanı cildi tahriş eder.`,
      `Tüy toplama aparatları ev içi temizliği kolaylaştırır; tırmalama tahtaları kedilerin tırnak bakımı ve mobilyaların korunması için faydalıdır. Kulak/diş bakımını düzenli ama nazik yapın.`,
    ],
    toy: [
      `${K} ${animalWord(a.animal)}inizin fiziksel ve zihinsel olarak aktif kalmasını sağlar; can sıkıntısına bağlı davranış sorunlarını azaltır. Kedilerde oltalı/tüylü ve catnip'li oyuncaklar, köpeklerde dayanıklı çiğneme ve getir-götür oyuncakları popülerdir.`,
      `Oyuncakları boyut ve dayanıklılık açısından ${animalWord(a.animal)}inize uygun seçin; küçük, kopabilen parçalardan kaçının ve oyun sırasında gözlem yapın.`,
    ],
    clothing: [
      `${K} özellikle kısa tüylü ve küçük ırk köpeklerde soğuk/yağmurlu havalarda işe yarar. Doğru beden için sırt uzunluğu ve göğüs çevresini ölçün; hareketi kısıtlamayan, çıkarması kolay modeller tercih edilir.`,
      `Kıyafet bir zorunluluk değil konfor ve koruma amaçlıdır; köpeğiniz rahatsız oluyorsa zorlamayın.`,
    ],
    health: [
      `${K} bir bakım/takviye ürünüdür ve hastalık tedavisi için bir ilaç ya da veteriner muayenesinin yerine geçmez. Vitamin, tüy yumağı (hairball) macunu, parazit (pire/kene) kovucu gibi ürünler düzenli koruyucu bakım için kullanılır.`,
      `Ürünü ${animalWord(a.animal)}inizin kilosuna ve yaşına uygun seçin, ambalajdaki dozu aşmayın. Gebelik, kronik hastalık veya başka ilaç kullanımı varsa uygulamadan önce veterinerinize danışın.`,
    ],
    shop: [
      `${K} kapsamında kedi, köpek ve diğer evcil dostlar için mama, kum, tasma, yatak, oyuncak ve bakım ürünlerini tek noktadan bulabilirsiniz. İhtiyacınızı netleştirmek için tür, yaş ve boyut bilgisini paylaşın; doğru ürünü birlikte seçelim.`,
      `${STOCK_LINE}`,
    ],
  };
  const paras = map[a.cat] ?? map.shop;
  return { h2: `${K}: Doğru Seçim İçin İpuçları`, paragraphs: paras };
}

function retailerSection(K: string, a: Attr): Section {
  const r = a.retailer || "pazaryerleri";
  return {
    h2: `${r} Yerine JETGO ile Aynı Gün Yerel Teslimat`,
    paragraphs: [
      `${r} üzerinde "${K}" araştıranlar için JETGO, Samsun'un yerel ve hızlı pet shop alternatifidir. ${r} gibi platformlardan bağımsız bir işletmeyiz ve ${r} ile resmi bir bağlantımız yoktur. Avantajımız, aracı kargo beklemeden Atakum ve Samsun içinde aynı gün, kapınıza teslimattır.`,
      `Fiyatları farklı platformlarda karşılaştırabilirsiniz; JETGO'da orijinal ve faturalı ürünü kapıda ödeme ve %5 Para Puan avantajıyla, ürün elinize ulaştıktan sonra ödeyerek alırsınız. Güncel fiyat ve stok için ${PHONE}.`,
    ],
  };
}

function liveSection(K: string, a: Attr): Section {
  const paras: string[] = [];
  if (a.liveKind === "sahiplenme") {
    paras.push(`Bir dost sahiplenmek isteyenler için en doğru yol barınaklardan, belediye hayvan bakımevlerinden ve güvenilir sahiplendirme platformlarından sorumlu bir şekilde sahiplenmektir. JETGO bir pet shop'tur; canlı hayvan satışı yapmaz, sahiplenmeyi destekler.`);
  } else {
    paras.push(`"${K}" araştırıyor olabilirsiniz; bilmenizi isteriz ki Türkiye'de pet shop'lar kedi ve köpek gibi canlı hayvan satamaz ve JETGO da canlı hayvan satışı yapmaz. Bunun yerine sorumlu sahiplenmeyi (barınak ve güvenilir sahiplendirme kaynakları) öneririz.`);
  }
  paras.push(`Yeni bir dostu eve aldığınızda ihtiyaç duyacağı her şeyi — yaşına uygun mama, kedi kumu ve tuvaleti, mama/su kabı, yatak, tasma, taşıma çantası ve oyuncak — JETGO'dan temin edebilir, Atakum ve Samsun geneline aynı gün kapınıza getirtebilirsiniz.`);
  paras.push(`Sağlık, aşı ve genel bakım için bir veteriner hekimle çalışmanızı öneririz; bu sayfa tıbbi tavsiye yerine geçmez.`);
  return { h2: `${K}: Satın Almak Yerine Sorumlu Sahiplenme`, paragraphs: paras };
}

function serviceSection(K: string, a: Attr): Section {
  const lines: Record<string, string[]> = {
    kuaför: [
      `"${K}" arayan birçok kişi profesyonel tüy bakımı/tıraşı için bir kuaför hizmeti aramaktadır. JETGO bir pet shop'tur; kuaför hizmeti vermeyiz, ancak evde düzenli bakım için ihtiyacınız olan ürünleri sağlarız.`,
      `Evde bakım için pH dengeli şampuan, tüy açıcı sprey, tür ve tüy yapısına uygun fırça/tarak, tırnak makası ve kulak temizleme ürünlerini Atakum ve Samsun geneline aynı gün ulaştırabiliriz.`,
    ],
    pansiyon: [
      `"${K}" genellikle bir hayvan pansiyonu/oteli aramasıdır. JETGO konaklama/pansiyon hizmeti vermez; bu konuda yetkili işletmelerle çalışmanızı öneririz.`,
      `Konaklama veya seyahat sürecinde gereken mama, taşıma çantası, su/mama kabı ve oyuncak gibi ürünleri ise hızlıca kapınıza getirebiliriz.`,
    ],
    eğitim: [
      `"${K}" arayanlar profesyonel bir eğitmen/eğitim merkezi arıyor olabilir. JETGO eğitim hizmeti vermez; bu alanda uzman eğitmenlerden destek almanızı öneririz.`,
      `Evde temel komut ve ödül bazlı çalışma için ihtiyaç duyacağınız ödül mamaları, klikır (clicker), tasma ve oyuncak gibi yardımcı ürünleri JETGO'dan temin edebilirsiniz.`,
    ],
    veteriner: [
      `Sağlık, aşı ve muayene konuları bir veteriner hekimin alanıdır; JETGO veterinerlik/klinik hizmeti vermez. Sağlık sorunlarında mutlaka bir veteriner hekime başvurun.`,
      `Veteriner önerisiyle kullanacağınız diyet mama, takviye ve bakım ürünlerini ise orijinal ve faturalı olarak kapınıza ulaştırabiliriz.`,
    ],
    gezdirme: [
      `"${K}" bir gezdirme hizmeti araması olabilir. JETGO bu hizmeti sunmaz; ancak gezdirme için ihtiyaç duyacağınız tasma, koşum (göğüs tasması), uzatmalı tasma ve dışkı poşeti gibi ürünleri sağlarız.`,
      `Doğru tasma/koşum seçimi köpeğinizin konforu ve güvenliği için önemlidir; ölçü konusunda WhatsApp üzerinden danışabilirsiniz.`,
    ],
    hizmet: [
      `"${K}" bir hizmet araması olabilir. JETGO bir pet shop'tur ve hizmet değil, ürün sağlar; aradığınız hizmeti veren yetkili işletmelere yönlendirebiliriz.`,
      `İlgili ürün ihtiyaçlarınızı ise Atakum ve Samsun geneline aynı gün kapınıza ulaştırabiliriz.`,
    ],
  };
  return { h2: `${K}: JETGO Ne Sağlar?`, paragraphs: lines[a.serviceKind] ?? lines.hizmet };
}

function guideSection(K: string, a: Attr): Section {
  const animal = animalWord(a.animal);
  return {
    h2: `${K}: Pratik Bilgiler`,
    paragraphs: [
      `${K} konusunda doğru yaklaşım, ${animal}inizin yaşına, ırkına ve ihtiyacına göre değişir. Sabırlı, tutarlı ve ödül odaklı bir yöntem; dengeli beslenme ve düzenli bakım, sağlıklı bir yaşamın temelidir. Ciddi sağlık veya davranış sorunlarında bir veteriner hekime ya da uzmana danışmanızı öneririz.`,
      `JETGO bu süreçte ihtiyaç duyacağınız ürünleri — uygun mama, ödül, bakım ve hijyen ürünleri, oyuncak ve aksesuar — orijinal ve faturalı olarak, Atakum ve Samsun geneline aynı gün kapınıza ulaştırır.`,
    ],
  };
}

function whyJetgoSection(K: string): Section {
  return {
    h2: `${K} için Neden JETGO?`,
    paragraphs: [
      `${K} ihtiyacınızı JETGO Pet Shop orijinal ürün ve fatura garantisiyle karşılar. Sipariş verin; ağır paketleri taşımayın, kurye ekibimiz apartman katınıza kadar getirsin. ${SPEED_LINE}`,
      `${ORDER_LINE} ${PAY_LINE}`,
    ],
    list: [
      "Orijinal ve faturalı ürün",
      "Atakum içinde ortalama 1 saatte, Samsun geneline aynı gün teslimat",
      "Kapıda nakit, kredi kartı (POS) ve QR ile ödeme",
      "Her siparişte %5 Para Puan",
      `Ücretsiz ürün danışmanlığı — WhatsApp ve ${PHONE}`,
    ],
  };
}

function priceSection(K: string, a: Attr): Section {
  return {
    h2: `${K} için JETGO'da Fiyat Avantajı`,
    paragraphs: [
      `${K} arayanlar için JETGO uygun fiyat ve şeffaf alışveriş sunar. Güncel fiyat ve kampanyalar dönemsel değişebildiğinden en doğru tutarı ürün sayfasında görebilir ya da WhatsApp / ${PHONE} üzerinden teyit edebilirsiniz.`,
      `Nakit ödemede avantajlı fiyat, her siparişte %5 Para Puan ve kapıda ödeme imkânıyla bütçenizi korursunuz.`,
    ],
  };
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
  if (a.cat === "retailer" && a.retailer) {
    out.push({
      q: `JETGO, ${a.retailer} mi veya ${a.retailer} ile bağlantılı mı?`,
      a: `Hayır. JETGO, Samsun merkezli bağımsız bir yerel pet shop'tur ve ${a.retailer} ile resmi bir bağlantısı yoktur. Farkımız; aracı kargo beklemeden Atakum ve Samsun içinde aynı gün kapıya teslimat ve kapıda ödeme sunmamızdır.`,
    });
  }
  if (a.cat === "live") {
    out.push({
      q: `JETGO'dan canlı hayvan satın alabilir miyim?`,
      a: `Hayır. JETGO canlı hayvan satışı yapmaz. Bir dost edinmek isterseniz barınaklardan ve güvenilir sahiplendirme kaynaklarından sorumlu sahiplenmeyi öneririz; yeni dostunuz için gereken tüm mama, kum, yatak ve aksesuarı ise kapınıza ulaştırırız.`,
    });
  }
  if (a.cat === "service") {
    out.push({
      q: `JETGO ${K.toLocaleLowerCase("tr-TR")} hizmeti veriyor mu?`,
      a: `JETGO bir pet shop'tur ve bu hizmeti sunmaz; bu alandaki yetkili işletmelere yönlendiririz. İlgili bakım/ürün ihtiyaçlarınızı ise Atakum ve Samsun geneline aynı gün kapınıza ulaştırırız.`,
    });
  }
  if (a.cat === "health") {
    out.push({
      q: `${K} bir ilaç veya tedavi mi?`,
      a: `Hayır. Bu bir bakım/takviye ürünüdür; hastalık tedavisinin veya veteriner muayenesinin yerine geçmez. Dozu ambalaja göre uygulayın, kronik durumlarda veterinerinize danışın.`,
    });
  }
  if (a.cat === "litter") {
    out.push({
      q: `${K} ne sıklıkla değiştirilmeli?`,
      a: `Topakları her gün alın, kum seviyesini koruyun ve kullanım yoğunluğuna göre düzenli aralıklarla tamamen yenileyin. Stok ve seçenekler için ${PHONE} üzerinden bilgi alabilirsiniz.`,
    });
  }
  if (a.cat === "food") {
    out.push({
      q: `${K} JETGO'da var mı?`,
      a: `Stok durumu değişebildiğinden ${a.brand ? `${a.brand} ürününün` : "ürünün"} anlık mevcudiyetini WhatsApp veya ${PHONE} üzerinden teyit edebilirsiniz. Ürün yoksa aynı segmentte uygun bir alternatif öneririz ve siparişinizi aynı gün kapınıza ulaştırırız.`,
    });
    if (a.isTreat) {
      out.push({
        q: `${K} ana mamanın yerine geçer mi?`,
        a: `Hayır. Bu bir ödül/atıştırmalıktır; günlük beslenmenin küçük bir kısmını oluşturacak şekilde, ambalajdaki talimata göre verilmelidir.`,
      });
    }
  }
  if (a.intent === "fiyat") {
    out.push({
      q: `${K} fiyatı ne kadar?`,
      a: `Güncel fiyat ve kampanyalar dönemsel değişebilir; en doğru tutarı ürün sayfasında veya ${PHONE} / WhatsApp üzerinden öğrenebilirsiniz. Nakit ödemede avantajlı fiyat ve her siparişte %5 Para Puan kazanırsınız.`,
    });
  }
  if (!["live", "service", "retailer"].includes(a.cat)) {
    out.push({
      q: `${K} orijinal ve faturalı mı?`,
      a: `Evet, JETGO'daki tüm ürünler orijinal ve faturalıdır. Atakum ve Samsun'da kapınıza teslim ediyoruz.`,
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

let _skipped = 0;
const _entries: Ent[] = [];
const _seen = new Set<string>();
for (const kw of DIGER_KEYWORDS) {
  const k = kw.toLocaleLowerCase("tr-TR");
  if (NOISE_RE.test(k)) { _skipped++; continue; }
  const slug = slugify(kw);
  if (!slug || _seen.has(slug)) continue;
  if (RESERVED_SLUGS.has(slug)) { _skipped++; continue; }
  _seen.add(slug);
  const a = analyze(kw);
  const cluster = `${a.cat}|${a.animal}|${a.litterKind || a.serviceKind || a.dietKey || a.stage || a.brand || a.intent}`;
  _entries.push({ kw, slug, a, cluster });
}

export const DIGER_SKIPPED_NOISE = _skipped;

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
    const x = _entries[(globalIdx + off * 11) % _entries.length];
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
  switch (a.cat) {
    case "retailer": return `${K} | JETGO Samsun Yerel Alternatif — Aynı Gün`;
    case "live": return `${K} | JETGO Samsun — Sorumlu Sahiplenme`;
    case "service": return `${K} | JETGO Samsun Pet Shop`;
    default:
      if (a.intent === "fiyat") return `${K} | JETGO Samsun — Uygun Fiyat, Kapıda Ödeme`;
      if (a.intent === "info") return `${K} | JETGO Samsun Pet Shop`;
      return `${K} | JETGO Pet Shop — Samsun'a Aynı Gün Kapıda`;
  }
}

function metaDescFor(kwCap: string, K: string, a: Attr): string {
  if (a.cat === "retailer" && a.retailer) {
    return `${kwCap} mi arıyorsunuz? ${a.retailer} yerine JETGO Samsun: orijinal ve faturalı ürün, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslim. Kapıda ödeme, %5 Para Puan. ${PHONE}.`;
  }
  if (a.cat === "live") {
    return `${kwCap}: JETGO canlı hayvan satmaz; sorumlu sahiplenmeyi öneririz. Yeni dostunuz için mama, kum, yatak ve aksesuarı Atakum ve Samsun'a aynı gün kapıda. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${kwCap}: JETGO bu hizmeti vermez; ilgili bakım ürünlerini Atakum'da 1 saatte, Samsun'a aynı gün kapınıza ulaştırır. Kapıda ödeme, %5 Para Puan. ${PHONE}.`;
  }
  if (a.intent === "fiyat") {
    return `${kwCap} için JETGO: uygun fiyat, nakit indirimi ve %5 Para Puan. Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat, kapıda ödeme. ${PHONE}.`;
  }
  const noun = categoryNoun(a);
  return `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun: ${noun} ihtiyacınız orijinal ve faturalı, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat. Güncel stok için ${PHONE}.`;
}

function keywordsFor(kw: string, a: Attr): string {
  const base = [kw, `${kw} jetgo`, `${kw} samsun`, `${kw} atakum`, `${kw} kapıda ödeme`, `${kw} aynı gün teslimat`];
  if (a.cat !== "retailer" && a.cat !== "live" && a.cat !== "service") base.push(`${kw} fiyat`);
  return base.join(", ");
}

function introFor(kwCap: string, a: Attr): string {
  if (a.cat === "retailer") {
    return `${kwCap} mı arıyorsunuz? JETGO, ${a.retailer || "pazaryerleri"} yerine Samsun'un yerel ve hızlı pet shop alternatifidir; orijinal ve faturalı ürünü aracı kargo beklemeden kapınıza getirir.`;
  }
  if (a.cat === "live") {
    return `${kwCap} mı araştırıyorsunuz? JETGO canlı hayvan satışı yapmaz; sorumlu sahiplenmeyi öneririz ve yeni dostunuzun ihtiyaç duyacağı her şeyi Atakum ve Samsun geneline aynı gün kapınıza ulaştırırız.`;
  }
  if (a.cat === "service") {
    return `${kwCap} mı arıyorsunuz? JETGO bir pet shop'tur; bu hizmeti vermeyiz ancak ihtiyacınız olan bakım ve ürünleri Atakum ve Samsun geneline hızlı teslimatla sağlarız.`;
  }
  const noun = categoryNoun(a);
  return `${kwCap} mı arıyorsunuz? JETGO Pet Shop Samsun; ${noun} ihtiyacınızı orijinal ve faturalı ürünle, stok durumuna göre Atakum ve Samsun geneline hızlı teslimatla karşılar.`;
}

function mainSection(K: string, a: Attr): Section {
  switch (a.cat) {
    case "retailer": return retailerSection(K, a);
    case "live": return liveSection(K, a);
    case "service": return serviceSection(K, a);
    case "litter": return litterExplainer(K, a);
    case "bird": return birdExplainer(K, a);
    case "guide": return guideSection(K, a);
    case "food": return foodExplainer(K, a);
    default: return accessoryExplainer(K, a);
  }
}

function secondSection(K: string, a: Attr): Section | null {
  if (a.cat === "food") return foodUsage(K, a);
  if (a.intent === "fiyat" && !["live", "service"].includes(a.cat)) return priceSection(K, a);
  return null;
}

function buildJetgoPage(e: Ent, idx: number, related: Array<{ text: string; href: string }>): SeoPageData {
  const { kw, slug, a } = e;
  const K = trTitle(kw);
  const kwCap = trCap(kw);

  const hoods = Array.from({ length: 6 }, (_, i) => NEIGHBORHOODS[(idx * 3 + i) % NEIGHBORHOODS.length]);
  const uniqueHoods: string[] = [];
  for (const h of hoods) if (!uniqueHoods.includes(h)) uniqueHoods.push(h);

  const sections: Section[] = [mainSection(K, a)];
  const second = secondSection(K, a);
  if (second) sections.push(second);
  sections.push(whyJetgoSection(K), deliverySection(K, uniqueHoods));

  return {
    slug,
    type: "keyword",
    storeId: STORE_ID,
    availability: "localOnly",
    title: K,
    metaTitle: metaTitleFor(K, a),
    metaDescription: metaDescFor(kwCap, K, a),
    keywords: keywordsFor(kw, a),
    h1: `${K} — JETGO Pet Shop'tan Samsun'a Aynı Gün Kapıda`,
    intro: [
      introFor(kwCap, a),
      `${ORDER_LINE} ${SPEED_LINE}`,
      `${PAY_LINE} ${STORE_LINE}`,
    ],
    sections,
    features: [
      "Orijinal ve faturalı ürün",
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

export const DIGER_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildJetgoPage(e, i, relatedFor(e, i)),
);

