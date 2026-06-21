// ---------------------------------------------------------------------------
// Shared keyword classification + TRUTHFULNESS engine.
//
// Pure, store-agnostic classifier extracted from the JETGO "diğer anahtar
// kelimeler" corpus so every broad multi-category corpus (jetgo diğer, atakum
// all, …) routes keywords with ONE battle-tested set of detectors. This module
// holds NO branding and NO page copy — only the regexes, detectors and the
// `analyze()` engine that turns a raw Turkish keyword into an `Attr`. The
// per-store generators consume `Attr` to emit their own (branded) page copy.
//
// TRUTHFULNESS RULES the classifier encodes (load-bearing — keep them):
//  - RETAILER / marketplace keywords (Trendyol, Migros, BİM, Akakçe, Cimri …)
//    are detected so pages frame them as a LOCAL ALTERNATIVE, never affiliation.
//  - LIVE-ANIMAL / "köpek fiyatları / yavru kedi / sahiplenme" keywords are
//    detected (all species, breeds incl.) so pages carry no-sale / adoption
//    framing — pet shops in Türkiye do not sell live cats and dogs.
//  - SERVICE keywords (kuaför, pansiyon/otel, eğitim merkezi, bakım evi) are
//    detected so pages do NOT claim to provide the service.
//  - PRODUCT vs live/service disambiguation ("kedi evi", "balık yağı", "köpek
//    eğitimi fiyatı") is handled so product pages never get the wrong framing.
// ---------------------------------------------------------------------------

export type Animal = "kedi" | "köpek" | "kuş" | "kemirgen" | "balık" | "genel";
export type Intent = "product" | "fiyat" | "info";
export type Cat =
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

export interface Attr {
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
export const NOISE_RE = /\bpaquetes\b|promociones|sin contrato|com calificado|iphone|samsung galaxy|kontör|fatura öde|elektrik faturas/;

// Slugs reserved by real client app routes (App.tsx). A generated SEO slug that
// equals one of these would shadow the app route and break the orphan-link
// invariant on stores where the keyword page is not served (e.g. "açık mama" is
// the Askıda Mama donation feature at /acik-mama/:animal, not a sellable SKU).
// Such keywords are dropped from the corpus.
export const RESERVED_SLUGS = new Set<string>([
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

export function detectRetailer(k: string): string {
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

// Service words (the shop does NOT provide these). For a weak (price-only) cue, a
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
export function liveKindOf(k: string): string {
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
// is not a leash product. The shop does not provide these services — we say so.
export function isService(k: string): boolean {
  if (SERVICE_CORE_RE.test(k)) return true;
  if (/eğitim|egitim|eğitmen|egitmen/.test(k) && !/tuvalet/.test(k)) return true;
  if (/gezdirme/.test(k) && !/tasma|kayış|kayis|koşum|kosum/.test(k)) return true;
  return false;
}

export function detectService(k: string): string {
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
export const BREED_RE = new RegExp(`${CAT_BREEDS.source}|${DOG_BREEDS.source}`);
const BREED_STRIP_RE = new RegExp(`(?:${CAT_BREEDS.source}|${DOG_BREEDS.source})\\S*`, "g");

// Live-animal / adoption signals.
export function detectLive(k: string): string {
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

export function detectLitterKind(k: string): string {
  if (/bentonit/.test(k)) return "bentonit";
  if (/silika|silica|kristal/.test(k)) return "silika/kristal";
  if (/karbonlu|aktif karbon/.test(k)) return "karbonlu";
  if (/topaklan/.test(k)) return "topaklanan";
  if (/tuvalet|elekli|kapalı|kapali|kürek|kurek|kepçe|kepce/.test(k)) return "kabı";
  return "genel";
}

const BIRD_RE =
  /muhabbet|kanarya|papağan|papagan|sultan|paraket|finch|ispinoz|saka kuşu|saka kus|kuş yemi|kus yemi|kuş kafes|kus kafes|kuş gaga|gaga taşı|gaga tasi|mineral blok|kuş süt|kus sut|tavşan|tavsan|hamster|guinea|gine domuz|kemirgen|ginepig|ginpig|akvaryum|balık yemi|balik yemi|japon balığ|japon balig|lepistes|moli|melek balığ/;

export function detectBirdAnimal(k: string): Animal {
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

export function detectFoodBrand(k: string): string {
  for (const [re, name] of FOOD_BRANDS) if (re.test(k)) return name;
  return "";
}

export function detectAnimal(k: string): Animal {
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

export function analyze(rawKw: string): Attr {
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

export function animalWord(a: Animal): string {
  switch (a) {
    case "kedi": return "kedi";
    case "köpek": return "köpek";
    case "kuş": return "kuş";
    case "kemirgen": return "küçük dostunuz";
    case "balık": return "balığınız";
    default: return "evcil dostunuz";
  }
}

export function categoryNoun(a: Attr): string {
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
