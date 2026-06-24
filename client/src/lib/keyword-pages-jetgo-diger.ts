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
import {
  type Attr,
  analyze,
  animalWord,
  categoryNoun,
  NOISE_RE,
  RESERVED_SLUGS,
} from "./keyword-truthfulness";

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
  "Tüm ürünlerimiz orijinal ve faturalıdır; gıda ürünlerinde son kullanma tarihi uzun, doğru saklanmış ürünleri tercih ederiz.";
const STOCK_LINE = `Stok durumu zamanla değiştiğinden, aradığınız ürünün güncel mevcudiyetini sipariş öncesi WhatsApp veya ${PHONE} üzerinden teyit etmenizi öneririz; ürün yoksa aynı segmentte uygun bir alternatif sunarız.`;

const NEIGHBORHOODS = [
  "Denizevleri", "Atakent", "Mimar Sinan", "Yenimahalle", "Kurupelit", "Cumhuriyet",
  "Körfez", "Esenevler", "Çatalçam", "Aksu", "Taflan", "Balaç", "Güzelyalı",
  "İncesu", "Alanlı", "Kamalı", "Beypınar", "Yeşiltepe", "Karakavuk", "Elmaçukuru",
  "İlkadım", "Canik", "Tekkeköy", "Bafra yolu çevresi",
];

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
      `Fiyatları farklı platformlarda karşılaştırabilirsiniz; JETGO'da orijinal ve faturalı ürünü kapıda ödeme avantajıyla, ürün elinize ulaştıktan sonra ödeyerek alırsınız. Güncel fiyat ve stok için ${PHONE}.`,
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
      `Ücretsiz ürün danışmanlığı — WhatsApp ve ${PHONE}`,
    ],
  };
}

function priceSection(K: string, a: Attr): Section {
  return {
    h2: `${K} için JETGO'da Fiyat Avantajı`,
    paragraphs: [
      `${K} arayanlar için JETGO uygun fiyat ve şeffaf alışveriş sunar. Güncel fiyat ve kampanyalar dönemsel değişebildiğinden en doğru tutarı ürün sayfasında görebilir ya da WhatsApp / ${PHONE} üzerinden teyit edebilirsiniz.`,
      `Nakit ödemede avantajlı fiyat ve kapıda ödeme imkânıyla bütçenizi korursunuz.`,
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
      a: `Güncel fiyat ve kampanyalar dönemsel değişebilir; en doğru tutarı ürün sayfasında veya ${PHONE} / WhatsApp üzerinden öğrenebilirsiniz. Nakit ödemede avantajlı fiyat sunarız.`,
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
    return `${kwCap} mi arıyorsunuz? ${a.retailer} yerine JETGO Samsun: orijinal ve faturalı ürün, Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslim. Kapıda ödeme. ${PHONE}.`;
  }
  if (a.cat === "live") {
    return `${kwCap}: JETGO canlı hayvan satmaz; sorumlu sahiplenmeyi öneririz. Yeni dostunuz için mama, kum, yatak ve aksesuarı Atakum ve Samsun'a aynı gün kapıda. ${PHONE}.`;
  }
  if (a.cat === "service") {
    return `${kwCap}: JETGO bu hizmeti vermez; ilgili bakım ürünlerini Atakum'da 1 saatte, Samsun'a aynı gün kapınıza ulaştırır. Kapıda ödeme. ${PHONE}.`;
  }
  if (a.intent === "fiyat") {
    return `${kwCap} için JETGO: uygun fiyat, nakit indirimi. Atakum'da 1 saatte, Samsun'a aynı gün kapıda teslimat, kapıda ödeme. ${PHONE}.`;
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
      `Ücretsiz ürün danışmanlığı — ${PHONE}`,
    ],
    faq: faqFor(K, a),
    internalLinks: related,
  };
}

export const DIGER_KEYWORD_PAGES: SeoPageData[] = _entries.map((e, i) =>
  buildJetgoPage(e, i, relatedFor(e, i)),
);

