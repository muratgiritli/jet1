// ---------------------------------------------------------------------------
// Atakum-EXCLUSIVE keyword landing pages.
//
// atakumpetshop.com (store id "atakum") gets its OWN, independent version of
// every keyword landing page in attached_assets/PETSHOP_ANAHTAR_KELİME. These
// share the SAME slugs as the generic shared keyword pages but carry bespoke,
// Atakum-anchored first-party content (real NAP, hours, neighbourhoods, ~1h
// Atakum delivery). They are tagged `storeId: "atakum"` so they REPLACE the
// shared page ONLY on atakum; sibling local domains keep the shared version.
// See seo-data.ts (_overrideByStore / findSeoPage / getSeoPagesForStore).
// ---------------------------------------------------------------------------

import type { SeoPageData } from "./seo-data";
import { ATAKUM_KEYWORDS } from "./atakum-keywords";
import { slugify, classify, trTitle, trCap, type Category } from "./keyword-pages";

const STORE_ID = "atakum";

const ADDR = "Atatürk 3. Kısım Bulvarı No:113, Atakum / Samsun";
const PHONE = "0850 840 39 59";
const HOURS = "09:00–21:00";

const ORDER_LINE = `atakumpetshop.com üzerinden ürünleri seçip sepete ekleyin; WhatsApp ile tek tıkla ya da ${PHONE} numaralı hattımızı arayarak siparişinizi onaylayın.`;
const SPEED_LINE =
  "Atakum içinde ortalama 1 saatte, İlkadım, Canik ve Tekkeköy geneline aynı gün siparişiniz kapınızda olur.";
const PAY_LINE =
  "Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilirsiniz; nakit ödemede avantajlı fiyat sunarız.";
const STORE_LINE = `Atakum Pet Shop ${ADDR} adresinde, her gün ${HOURS} saatleri arasında hizmetinizdedir.`;

// Real Atakum neighbourhoods — rotated per page so delivery-area copy is unique.
const NEIGHBORHOODS = [
  "Denizevler", "Mimarsinan", "Körfez", "Cumhuriyet", "Atakent", "Balaç",
  "Yenimahalle", "Esenevler", "Kesilik", "Çatalçam", "Aksu", "Taflan",
  "İncesu", "Güzelyalı", "Alanlı", "Çamlıyazı", "Kamalı", "Beypınar",
  "Sarıtaş", "Elmaçukuru", "Yeşiltepe", "Karakavuk",
];

const PRODUCT_LIST = [
  "Kedi maması: Royal Canin, Hill's, Pro Plan, N&D, Reflex, Brit Care",
  "Köpek maması: Royal Canin, Hill's, Pro Plan, Reflex, ProChoice",
  "Kedi kumu: Van Cat, Biokat's, Sanicat (topaklaşan ve kristal)",
  "Kuş yemi, kemirgen yemi, kafes ve aksesuarları",
  "Bakım: şampuan, tarak, çiş pedi, vitamin, oyuncak ve tasma",
];

// Some keywords imply 24h / night / always-open service. We keep the keyword in
// the title for search intent, but every such page MUST state the truthful hours
// (09:00–21:00) so Google/AI never see a misleading 24h claim. See FAQ below.
const ALWAYS_OPEN_RE = /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz|geç\s*saat/i;
function impliesAlwaysOpen(kw: string): boolean {
  return ALWAYS_OPEN_RE.test(kw);
}

interface Flavor {
  angle: string;
  secH2: string;
  secP: string[];
  faqQ: string;
  faqA: string;
}

function atakumFlavor(cat: Category, kw: string, K: string): Flavor {
  switch (cat) {
    case "brand":
      return {
        angle: `${kw} için Atakum'da orijinal ürün ve hızlı teslimat sunar`,
        secH2: `${K} Neden Atakum Pet Shop'tan Alınır?`,
        secP: [
          `${K} ihtiyacınızı Atakum Pet Shop orijinal ürün ve fatura garantisiyle karşılar. Son kullanma tarihi uzun, doğru saklanmış ürünleri stoklarımızda bulundurur, Atakum içinde aynı gün kapınıza getiririz.`,
          `Mama bitmeden sipariş verin, dostunuz aç kalmasın. ${SPEED_LINE}`,
        ],
        faqQ: `${K} orijinal ve faturalı mı?`,
        faqA: `Evet, Atakum Pet Shop'taki tüm markalı ürünler orijinal ve faturalıdır. Son kullanma tarihi uzun ürünleri Atakum'da kapınıza teslim ediyoruz.`,
      };
    case "akvaryum":
      return {
        angle: `${kw} ürünlerini Atakum'da kapıya teslim eder`,
        secH2: `Atakum'da ${K} Çeşitleri`,
        secP: [
          `Akvaryum kurulumundan günlük bakıma kadar ihtiyacınız olan her şey Atakum Pet Shop'ta. Balık yemi, filtre, ısıtıcı, su düzenleyici ve dekor ürünlerini tek adresten temin edin.`,
          `${K} için dükkân dükkân gezmeyin; online seçin, Atakum içinde aynı gün kapınızda teslim alın.`,
        ],
        faqQ: `Atakum'da ${kw} kapıya teslim ediliyor mu?`,
        faqA: `Evet, akvaryum ekipmanı ve balık yemi ürünlerini Atakum içinde aynı gün kapınıza getiriyoruz.`,
      };
    case "acil":
      return {
        angle: `${kw} durumunda Atakum'da hemen devreye girer`,
        secH2: `${K} İçin Atakum'da Hızlı Çözüm`,
        secP: [
          `Acil durumda her dakika önemlidir. ${K} ihtiyacınızda Atakum Pet Shop siparişinizi önceliklendirir ve en kısa sürede kapınıza ulaştırır.`,
          `${ORDER_LINE} ${SPEED_LINE}`,
        ],
        faqQ: `${K} ne kadar sürede gelir?`,
        faqA: `Atakum içinde ortalama 1 saatte siparişiniz kapınızda olur; acil ihtiyaçlarda önceliklendirme yaparız.`,
      };
    case "acik":
      return {
        angle: `${kw} arayışınızda hafta sonu dahil her gün açıktır`,
        secH2: `Sipariş Saatleri ve ${K}`,
        secP: [
          `Atakum Pet Shop hafta sonu ve pazar günü dahil her gün ${HOURS} saatleri arasında sipariş alır. Gündüz verdiğiniz siparişler aynı gün kapınıza ulaşır.`,
          `Geç saatte bıraktığınız siparişleri ertesi günün ilk teslimat rotasında getiririz. ${K} ihtiyacınızda 7 gün Atakum'da yanınızdayız.`,
        ],
        faqQ: `${K} şu an mevcut mu?`,
        faqA: `Atakum Pet Shop her gün ${HOURS} açıktır ve kapınıza teslim eder; hafta sonu ve pazar günü dahil hizmetinizdedir.`,
      };
    case "hiz":
      return {
        angle: `${kw} ile ürünlerinizi Atakum'da aynı gün kapıya getirir`,
        secH2: `Atakum'da ${K} Nasıl Çalışır?`,
        secP: [
          `${K} ile siparişiniz hızla kapınızda. Kurye ekibimiz ürünleri apartman katınıza kadar getirir; ağır mama çuvalı taşımazsınız.`,
          `${ORDER_LINE} ${SPEED_LINE}`,
        ],
        faqQ: `${K} gerçekten aynı gün mü?`,
        faqA: `Evet, Atakum içinde ortalama 1 saatte teslimat yaparız; sabah verilen siparişler öğleden sonra elinizde olur.`,
      };
    case "yakin":
      return {
        angle: `${kw} aradığınızda mağazaya gitmeden kapınıza gelir`,
        secH2: `${K} İçin Neden Atakum Pet Shop?`,
        secP: [
          `${K} ararken mesafe, mağazanın açık olup olmaması ve fiyat önemlidir. Atakum Pet Shop kapıya teslim modeliyle Atakum'da nerede olursanız olun yanınıza gelir.`,
          `Haritada gezmek yerine online sipariş verin. ${SPEED_LINE} ${PAY_LINE}`,
        ],
        faqQ: `Atakum'da ${kw} hangisi?`,
        faqA: `Atakum Pet Shop, bulunduğunuz konuma kapıya teslim hizmeti verdiği için Atakum'daki en pratik seçenektir.`,
      };
    case "teslimat":
      return {
        angle: `${kw} hizmetini Atakum'un her mahallesine sunar`,
        secH2: `Atakum'da ${K} Nasıl Çalışır?`,
        secP: [
          `${K} ile ürünleriniz kurye ekibimizle kapınıza kadar gelir. Ağır mama çuvalları ve kedi kumu paketlerini taşıma derdine son.`,
          `${ORDER_LINE} ${SPEED_LINE}`,
        ],
        faqQ: `${K} kapıda ödeme kabul ediyor mu?`,
        faqA: `Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme yapabilirsiniz.`,
      };
    case "fiyat":
      return {
        angle: `${kw} için Atakum'da uygun fiyat ve kampanya sunar`,
        secH2: `Atakum'da ${K} Fiyat Avantajları`,
        secP: [
          `${K} arayanlar için rekabetçi fiyat politikası uyguluyoruz. Nakit ödemede ekstra indirim ve kampanyalı ürünler ile tasarruf edersiniz.`,
          `Premium markaları uygun fiyata Atakum'da kapınıza getiriyoruz; kaliteden ödün vermeden alışveriş yapın.`,
        ],
        faqQ: `${K} kaliteli mi?`,
        faqA: `Evet, uygun fiyatı orijinal ve kaliteli ürünlerle birlikte sunuyoruz. Nakit ödemede ekstra avantaj sağlıyoruz.`,
      };
    case "siparis":
      return {
        angle: `${kw} için tek tıkla kolay sipariş imkânı sunar`,
        secH2: `Atakum'da ${K} Nasıl Verilir?`,
        secP: [
          `${ORDER_LINE} Dilerseniz ${PHONE} numarasından bilgi ve destek alabilirsiniz.`,
          `Atakum Pet Shop kapıya teslim çalışır; mağaza adresine gitmenize gerek yok, siparişiniz bulunduğunuz adrese getirilir. ${SPEED_LINE}`,
        ],
        faqQ: `${K} nasıl yapılır?`,
        faqA: `Ürünleri sepete ekleyip WhatsApp ile ya da ${PHONE} numarasını arayarak onaylayın; siparişiniz Atakum içinde aynı gün kapınıza gelir.`,
      };
    case "market":
      return {
        angle: `${kw} ihtiyacınıza 900+ ürünle Atakum'da cevap verir`,
        secH2: `Atakum Pet Shop ${K} Ürün Yelpazesi`,
        secP: [
          `Atakum Pet Shop, 900'den fazla ürün çeşidiyle Atakum'un en kapsamlı kapıya teslim pet market'idir. Kedi, köpek, kuş ve kemirgen ürünleri tek adreste.`,
          `Mağaza mağaza gezmek yerine online inceleyin, fiyatları karşılaştırın ve Atakum içinde aynı gün kapınızda teslim alın.`,
        ],
        faqQ: `Atakum'da ${kw} hangisi?`,
        faqA: `Atakum Pet Shop, geniş ürün yelpazesi ve kapıya teslim modeliyle Atakum'un en pratik pet market'lerinden biridir.`,
      };
    default:
      return {
        angle: `${kw} için Atakum'da hızlı ve güvenilir hizmet sunar`,
        secH2: `${K} İçin Neden Atakum Pet Shop?`,
        secP: [
          `${K} ihtiyacınızda Atakum Pet Shop geniş ürün yelpazesi, hızlı teslimat ve uygun fiyat avantajı sunar.`,
          `${ORDER_LINE} ${SPEED_LINE} ${PAY_LINE}`,
        ],
        faqQ: `${K} için Atakum Pet Shop nasıl yardımcı olur?`,
        faqA: `Ürünleri online seçin, Atakum içinde kapınıza teslim alın. ${STORE_LINE}`,
      };
  }
}

interface Ent {
  kw: string;
  slug: string;
  cat: Category;
}

const _entries: Ent[] = [];
const _seen = new Set<string>();
for (const kw of ATAKUM_KEYWORDS) {
  const slug = slugify(kw);
  if (_seen.has(slug)) continue;
  _seen.add(slug);
  _entries.push({ kw, slug, cat: classify(kw) });
}

const _byCat = new Map<Category, Ent[]>();
for (const e of _entries) {
  const arr = _byCat.get(e.cat);
  if (arr) arr.push(e);
  else _byCat.set(e.cat, [e]);
}

const CORE_LINKS: { text: string; href: string }[] = [
  { text: "Atakum Pet Shop", href: "/atakum-petshop" },
  { text: "En Yakın Petshop", href: "/en-yakin-petshop" },
  { text: "Kapıda Ödeme Petshop", href: "/kapida-odeme-petshop" },
  { text: "Kedi Maması", href: "/kedi-mamasi" },
  { text: "Köpek Maması", href: "/kopek-mamasi" },
  { text: "Kedi Kumu", href: "/kedi-kumu" },
];

function relatedFor(e: Ent, globalIdx: number): { text: string; href: string }[] {
  const out: { text: string; href: string }[] = [];
  const hrefs = new Set<string>();
  const push = (l: { text: string; href: string }) => {
    if (l.href === `/${e.slug}` || hrefs.has(l.href)) return;
    hrefs.add(l.href);
    out.push(l);
  };
  const sibs = _byCat.get(e.cat) ?? [];
  const sIdx = sibs.findIndex((s) => s.slug === e.slug);
  for (let off = 1; off <= sibs.length && out.length < 4; off++) {
    const sib = sibs[(sIdx + off) % sibs.length];
    push({ text: trTitle(sib.kw), href: `/${sib.slug}` });
  }
  push(CORE_LINKS[globalIdx % CORE_LINKS.length]);
  push(CORE_LINKS[(globalIdx + 3) % CORE_LINKS.length]);
  return out.slice(0, 6);
}

function buildAtakumPage(
  e: Ent,
  idx: number,
  related: { text: string; href: string }[],
): SeoPageData {
  const { kw, slug, cat } = e;
  const K = trTitle(kw);
  const f = atakumFlavor(cat, kw, K);

  const hoods = Array.from({ length: 6 }, (_, i) => NEIGHBORHOODS[(idx * 3 + i) % NEIGHBORHOODS.length]);
  const uniqueHoods: string[] = [];
  for (const h of hoods) if (!uniqueHoods.includes(h)) uniqueHoods.push(h);

  return {
    slug,
    type: "keyword",
    storeId: STORE_ID,
    availability: "localOnly",
    title: K,
    metaTitle: `${K} | Atakum Pet Shop — Atakum'a 1 Saatte Kapıda Teslim`,
    metaDescription: `${trCap(kw)} için Atakum Pet Shop: kedi maması, köpek maması, kedi kumu ve tüm pet ürünleri Atakum içinde ortalama 1 saatte kapınızda. Kapıda ödeme, ${PHONE}.`,
    keywords: `${kw}, ${kw} atakum, atakum ${kw}, ${kw} samsun, ${kw} kapıda ödeme, ${kw} aynı gün teslimat`,
    h1: `${K} — Atakum Pet Shop'tan 1 Saatte Kapıda`,
    intro: [
      `${trCap(kw)} mı arıyorsunuz? Atakum Pet Shop, ${f.angle}. ${ADDR} adresinden Atakum'un tüm mahallelerine teslimat yapıyoruz.`,
      `${ORDER_LINE} ${SPEED_LINE}`,
      `${PAY_LINE} ${STORE_LINE}`,
    ],
    sections: [
      { h2: f.secH2, paragraphs: f.secP },
      {
        h2: `Atakum'da ${K} Teslimat Bölgeleri`,
        paragraphs: [
          `${K} siparişlerinizi Atakum'un tüm mahallelerine kurye ile ulaştırıyoruz. Aşağıdaki bölgelere ortalama 1 saatte, Atakum dışındaki İlkadım, Canik ve Tekkeköy ilçelerine aynı gün teslimat yapıyoruz.`,
        ],
        list: uniqueHoods.map((n) => `${n} Mahallesi'ne aynı gün teslimat`),
      },
    ],
    features: [
      "900+ ürün çeşidi — kedi, köpek, kuş, kemirgen",
      "Atakum içinde ortalama 1 saatte kapıda teslim",
      "Kapıda nakit, POS ve QR ödeme",
      `Atakum tüm mahallelere teslimat — ${ADDR}`,
      `Her gün ${HOURS} açık — ${PHONE}`,
    ],
    faq: [
      ...(impliesAlwaysOpen(kw)
        ? [
            {
              q: `${K} gerçekten 24 saat / 7-24 açık mı?`,
              a: `Atakum Pet Shop 24 saat açık değildir; her gün ${HOURS} saatleri arasında sipariş alır ve Atakum içinde ortalama 1 saatte kapınıza teslim eder. Gündüz verdiğiniz siparişler aynı gün elinizde olur.`,
            },
          ]
        : []),
      { q: f.faqQ, a: f.faqA },
      {
        q: `Atakum'da ${K} teslimatı ne kadar sürer?`,
        a: `Atakum içinde ortalama 1 saatte, İlkadım, Canik ve Tekkeköy geneline aynı gün siparişiniz kapınızda olur. Sabah verilen siparişler öğleden sonra elinizde.`,
      },
      {
        q: `${K} için kapıda ödeme ve çalışma saatleri nedir?`,
        a: `Kapıda nakit, kredi kartı (POS) ve QR ile ödeyebilirsiniz; nakit ödemede avantajlı fiyat sunuyoruz. Atakum Pet Shop her gün ${HOURS} açıktır, ${PHONE}.`,
      },
    ],
    internalLinks: related,
  };
}

export const ATAKUM_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildAtakumPage(e, i, relatedFor(e, i)),
);
