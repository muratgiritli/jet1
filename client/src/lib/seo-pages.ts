export interface SeoPage {
  slug: string;
  district: string;
  neighborhood?: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
}

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "samsun-petshop",
    district: "Samsun",
    title: "Samsun Pet Shop | Kapıda Teslim Mama Siparişi | JETGO",
    h1: "Samsun Pet Shop - Kapıda Teslim Evcil Hayvan Ürünleri",
    description: "Samsun pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Samsun'un en hızlı online pet shop'u JETGO ile WhatsApp sipariş verin.",
    keywords: ["samsun petshop", "samsun petshop kapıda teslim", "samsun kedi maması sipariş", "samsun köpek maması sipariş", "samsun mama kapıya gelsin", "samsun hızlı petshop", "samsun online petshop", "samsun petshop eve teslim", "samsun mama siparişi hızlı", "samsun kedi kumu siparişi", "samsun petshop express", "samsun mama getir", "samsun petshop whatsapp sipariş"],
  },
  {
    slug: "atakum-petshop",
    district: "Atakum",
    title: "Atakum Pet Shop | Kapıda Teslim Hızlı Teslimat | JETGO",
    h1: "Atakum Pet Shop - Hızlı Teslimat ile Kapınıza Gelsin",
    description: "Atakum pet shop kapıda teslim ve hızlı teslimat. Online kedi maması, köpek maması, kedi kumu siparişi. Atakum'un en hızlı pet shop'u JETGO ile aynı gün teslim alın.",
    keywords: ["atakum petshop", "atakum pet shop", "atakum petshop kapıda teslim", "atakum petshop hızlı teslimat", "atakum online petshop", "atakum kedi maması", "atakum köpek maması", "atakum petshop sipariş", "atakum petshop eve teslim", "atakum en yakın petshop", "atakum mama siparişi", "atakum kedi kumu siparişi", "atakum petshop express", "atakum jet petshop", "atakum hızlı mama siparişi", "atakum evcil hayvan ürünleri", "atakum petshop online sipariş", "atakum petshop indirim"],
  },
  {
    slug: "yeni-mahalle-petshop",
    district: "Atakum",
    neighborhood: "Yeni Mahalle",
    title: "Yeni Mahalle Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Yeni Mahalle Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Yeni Mahalle pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Yeni Mahalle'ye hızlı pet shop teslimatı.",
    keywords: ["yeni mahalle petshop", "atakum yeni mahalle petshop", "yeni mahalle kedi maması", "yeni mahalle köpek maması", "yeni mahalle petshop kapıda", "yeni mahalle mama siparişi", "yeni mahalle kedi kumu", "yeni mahalle petshop hızlı teslim", "yeni mahalle online petshop", "yeni mahalle petshop eve teslim"],
  },
  {
    slug: "denizevleri-petshop",
    district: "Atakum",
    neighborhood: "Denizevleri",
    title: "Denizevleri Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Denizevleri Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Denizevleri pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Denizevleri'ne hızlı pet shop teslimatı.",
    keywords: ["denizevleri petshop", "atakum denizevleri petshop", "denizevleri kedi maması", "denizevleri köpek maması", "denizevleri petshop sipariş", "denizevleri petshop kapıda teslim", "denizevleri mama siparişi", "denizevleri kedi kumu", "denizevleri online petshop", "denizevleri hızlı petshop"],
  },
  {
    slug: "guzelyali-petshop",
    district: "Atakum",
    neighborhood: "Güzelyalı",
    title: "Güzelyalı Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Güzelyalı Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Güzelyalı pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Güzelyalı'ya hızlı pet shop teslimatı.",
    keywords: ["güzelyalı petshop", "atakum güzelyalı petshop", "güzelyalı kedi maması", "güzelyalı köpek maması", "güzelyalı petshop kapıda teslim", "güzelyalı mama siparişi", "güzelyalı kedi kumu", "güzelyalı online petshop", "güzelyalı hızlı teslim petshop", "güzelyalı petshop eve teslim"],
  },
  {
    slug: "kurupelit-petshop",
    district: "Atakum",
    neighborhood: "Kurupelit",
    title: "Kurupelit Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Kurupelit Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Kurupelit pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Kurupelit'e hızlı pet shop teslimatı.",
    keywords: ["kurupelit petshop", "atakum kurupelit petshop", "kurupelit kedi maması", "kurupelit köpek maması", "kurupelit petshop kapıda", "kurupelit mama siparişi", "kurupelit kedi kumu", "kurupelit online petshop", "kurupelit hızlı petshop", "kurupelit eve teslim petshop"],
  },
  {
    slug: "atakent-petshop",
    district: "Atakum",
    neighborhood: "Atakent",
    title: "Atakent Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Atakent Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Atakent pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Atakent'e hızlı pet shop teslimatı.",
    keywords: ["atakent petshop", "atakum atakent petshop", "atakent kedi maması", "atakent köpek maması", "atakent petshop kapıda teslim", "atakent mama siparişi", "atakent kedi kumu", "atakent online petshop", "atakent hızlı petshop", "atakent eve teslim petshop"],
  },
  {
    slug: "incesu-petshop",
    district: "Atakum",
    neighborhood: "İncesu",
    title: "İncesu Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "İncesu Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum İncesu pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. İncesu'ya hızlı pet shop teslimatı.",
    keywords: ["incesu petshop", "atakum incesu petshop", "incesu kedi maması", "incesu köpek maması", "incesu petshop kapıda teslim", "incesu mama siparişi", "incesu kedi kumu", "incesu online petshop", "incesu hızlı petshop", "incesu eve teslim petshop"],
  },
  {
    slug: "balac-petshop",
    district: "Atakum",
    neighborhood: "Balaç",
    title: "Balaç Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Balaç Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Balaç pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Balaç'a hızlı pet shop teslimatı.",
    keywords: ["balaç petshop", "atakum balaç petshop", "balaç kedi maması", "balaç köpek maması", "balaç petshop kapıda", "balaç mama siparişi", "balaç kedi kumu", "balaç online petshop", "balaç hızlı petshop", "balaç eve teslim petshop"],
  },
  {
    slug: "cakirlar-petshop",
    district: "Atakum",
    neighborhood: "Çakırlar",
    title: "Çakırlar Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Çakırlar Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Çakırlar pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Çakırlar'a hızlı pet shop teslimatı.",
    keywords: ["çakırlar petshop", "atakum çakırlar petshop", "çakırlar kedi maması", "çakırlar köpek maması", "çakırlar petshop kapıda teslim", "çakırlar mama siparişi", "çakırlar kedi kumu", "çakırlar online petshop", "çakırlar hızlı petshop", "çakırlar eve teslim petshop"],
  },
  {
    slug: "mimar-sinan-petshop",
    district: "Atakum",
    neighborhood: "Mimar Sinan",
    title: "Mimar Sinan Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Mimar Sinan Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Mimar Sinan pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Mimar Sinan'a hızlı pet shop teslimatı.",
    keywords: ["mimar sinan petshop", "atakum mimar sinan petshop", "mimar sinan kedi maması", "mimar sinan köpek maması", "mimar sinan petshop kapıda", "mimar sinan mama siparişi", "mimar sinan kedi kumu", "mimar sinan online petshop", "mimar sinan hızlı petshop", "mimar sinan eve teslim petshop"],
  },
  {
    slug: "korfez-petshop",
    district: "Atakum",
    neighborhood: "Körfez",
    title: "Körfez Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Körfez Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Körfez pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Körfez'e hızlı pet shop teslimatı.",
    keywords: ["körfez petshop", "atakum körfez petshop", "körfez kedi maması", "körfez köpek maması", "körfez petshop kapıda teslim", "körfez mama siparişi", "körfez kedi kumu", "körfez online petshop", "körfez hızlı petshop", "körfez eve teslim petshop"],
  },
  {
    slug: "soguksu-petshop",
    district: "Atakum",
    neighborhood: "Soğuksu",
    title: "Soğuksu Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Soğuksu Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Soğuksu pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Soğuksu'ya hızlı pet shop teslimatı.",
    keywords: ["soğuksu petshop", "atakum soğuksu petshop", "soğuksu kedi maması", "soğuksu köpek maması", "soğuksu petshop kapıda teslim", "soğuksu mama siparişi", "soğuksu kedi kumu", "soğuksu online petshop", "soğuksu hızlı petshop", "soğuksu eve teslim petshop"],
  },
  {
    slug: "taflan-petshop",
    district: "Atakum",
    neighborhood: "Taflan",
    title: "Taflan Petshop Atakum | Kapıda Teslim | JETGO",
    h1: "Taflan Pet Shop - Atakum Kapıda Teslim",
    description: "Atakum Taflan pet shop kapıda teslim. Kedi maması, köpek maması, kedi kumu siparişi aynı gün teslimat. Taflan'a hızlı pet shop teslimatı.",
    keywords: ["taflan petshop", "atakum taflan petshop", "taflan kedi maması", "taflan köpek maması", "taflan petshop kapıda teslim", "taflan mama siparişi", "taflan kedi kumu", "taflan online petshop", "taflan hızlı petshop", "taflan eve teslim petshop"],
  },
  {
    slug: "ilkadim-kadikoy-petshop",
    district: "İlkadım",
    neighborhood: "Kadıköy",
    title: "Kadıköy Petshop İlkadım | Kapıda Teslim | JETGO",
    h1: "Kadıköy Pet Shop - İlkadım Kapıda Teslim",
    description: "İlkadım Kadıköy pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Kadıköy'e hızlı pet shop teslimatı.",
    keywords: ["ilkadım kadıköy petshop", "ilkadım kadıköy petshop kapıda teslim", "ilkadım kadıköy kedi maması", "ilkadım kadıköy köpek maması", "ilkadım kadıköy mama siparişi"],
  },
  {
    slug: "ilkadim-rasathane-petshop",
    district: "İlkadım",
    neighborhood: "Rasathane",
    title: "Rasathane Petshop İlkadım | Kapıda Teslim | JETGO",
    h1: "Rasathane Pet Shop - İlkadım Kapıda Teslim",
    description: "İlkadım Rasathane pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Rasathane'ye hızlı pet shop teslimatı.",
    keywords: ["ilkadım rasathane petshop", "ilkadım rasathane petshop kapıda teslim", "ilkadım rasathane kedi maması", "ilkadım rasathane köpek maması", "ilkadım rasathane mama siparişi"],
  },
  {
    slug: "ilkadim-kilicdede-petshop",
    district: "İlkadım",
    neighborhood: "Kılıçdede",
    title: "Kılıçdede Petshop İlkadım | Kapıda Teslim | JETGO",
    h1: "Kılıçdede Pet Shop - İlkadım Kapıda Teslim",
    description: "İlkadım Kılıçdede pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Kılıçdede'ye hızlı pet shop teslimatı.",
    keywords: ["ilkadım kılıçdede petshop", "ilkadım kılıçdede petshop kapıda teslim", "ilkadım kılıçdede kedi maması", "ilkadım kılıçdede köpek maması", "ilkadım kılıçdede mama siparişi"],
  },
  {
    slug: "ilkadim-kalkanci-petshop",
    district: "İlkadım",
    neighborhood: "Kalkancı",
    title: "Kalkancı Petshop İlkadım | Kapıda Teslim | JETGO",
    h1: "Kalkancı Pet Shop - İlkadım Kapıda Teslim",
    description: "İlkadım Kalkancı pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Kalkancı'ya hızlı pet shop teslimatı.",
    keywords: ["ilkadım kalkancı petshop", "ilkadım kalkancı petshop kapıda teslim", "ilkadım kalkancı kedi maması", "ilkadım kalkancı köpek maması", "ilkadım kalkancı mama siparişi"],
  },
  {
    slug: "ilkadim-baruthane-petshop",
    district: "İlkadım",
    neighborhood: "Baruthane",
    title: "Baruthane Petshop İlkadım | Kapıda Teslim | JETGO",
    h1: "Baruthane Pet Shop - İlkadım Kapıda Teslim",
    description: "İlkadım Baruthane pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Baruthane'ye hızlı pet shop teslimatı.",
    keywords: ["ilkadım baruthane petshop", "ilkadım baruthane petshop kapıda teslim", "ilkadım baruthane kedi maması", "ilkadım baruthane köpek maması", "ilkadım baruthane mama siparişi"],
  },
  {
    slug: "ilkadim-ulugazi-petshop",
    district: "İlkadım",
    neighborhood: "Ulugazi",
    title: "Ulugazi Petshop İlkadım | Kapıda Teslim | JETGO",
    h1: "Ulugazi Pet Shop - İlkadım Kapıda Teslim",
    description: "İlkadım Ulugazi pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Ulugazi'ye hızlı pet shop teslimatı.",
    keywords: ["ilkadım ulugazi petshop", "ilkadım ulugazi petshop kapıda teslim", "ilkadım ulugazi kedi maması", "ilkadım ulugazi köpek maması", "ilkadım ulugazi mama siparişi"],
  },
  {
    slug: "canik-karsiyaka-petshop",
    district: "Canik",
    neighborhood: "Karşıyaka",
    title: "Karşıyaka Petshop Canik | Kapıda Teslim | JETGO",
    h1: "Karşıyaka Pet Shop - Canik Kapıda Teslim",
    description: "Canik Karşıyaka pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Karşıyaka'ya hızlı pet shop teslimatı.",
    keywords: ["canik karşıyaka petshop", "canik karşıyaka petshop kapıda teslim", "canik karşıyaka kedi maması", "canik karşıyaka köpek maması", "canik karşıyaka mama siparişi"],
  },
  {
    slug: "canik-gaziosmanpasa-petshop",
    district: "Canik",
    neighborhood: "Gaziosmanpaşa",
    title: "Gaziosmanpaşa Petshop Canik | Kapıda Teslim | JETGO",
    h1: "Gaziosmanpaşa Pet Shop - Canik Kapıda Teslim",
    description: "Canik Gaziosmanpaşa pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Gaziosmanpaşa'ya hızlı pet shop teslimatı.",
    keywords: ["canik gaziosmanpaşa petshop", "canik gaziosmanpaşa petshop kapıda teslim", "canik gaziosmanpaşa kedi maması", "canik gaziosmanpaşa köpek maması", "canik gaziosmanpaşa mama siparişi"],
  },
  {
    slug: "canik-yenimahalle-petshop",
    district: "Canik",
    neighborhood: "Yenimahalle",
    title: "Yenimahalle Petshop Canik | Kapıda Teslim | JETGO",
    h1: "Yenimahalle Pet Shop - Canik Kapıda Teslim",
    description: "Canik Yenimahalle pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Yenimahalle'ye hızlı pet shop teslimatı.",
    keywords: ["canik yenimahalle petshop", "canik yenimahalle petshop kapıda teslim", "canik yenimahalle kedi maması", "canik yenimahalle köpek maması", "canik yenimahalle mama siparişi"],
  },
  {
    slug: "canik-kuzeyyildizi-petshop",
    district: "Canik",
    neighborhood: "Kuzeyyıldızı",
    title: "Kuzeyyıldızı Petshop Canik | Kapıda Teslim | JETGO",
    h1: "Kuzeyyıldızı Pet Shop - Canik Kapıda Teslim",
    description: "Canik Kuzeyyıldızı pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Kuzeyyıldızı'na hızlı pet shop teslimatı.",
    keywords: ["canik kuzeyyıldızı petshop", "canik kuzeyyıldızı petshop kapıda teslim", "canik kuzeyyıldızı kedi maması", "canik kuzeyyıldızı köpek maması", "canik kuzeyyıldızı mama siparişi"],
  },
  {
    slug: "tekkekoy-19mayis-petshop",
    district: "Tekkeköy",
    neighborhood: "19 Mayıs",
    title: "19 Mayıs Petshop Tekkeköy | Kapıda Teslim | JETGO",
    h1: "19 Mayıs Pet Shop - Tekkeköy Kapıda Teslim",
    description: "Tekkeköy 19 Mayıs pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. 19 Mayıs'a hızlı pet shop teslimatı.",
    keywords: ["tekkeköy 19 mayıs petshop", "tekkeköy 19 mayıs petshop kapıda teslim", "tekkeköy 19 mayıs kedi maması", "tekkeköy 19 mayıs köpek maması", "tekkeköy 19 mayıs mama siparişi"],
  },
  {
    slug: "tekkekoy-sanayi-petshop",
    district: "Tekkeköy",
    neighborhood: "Sanayi",
    title: "Sanayi Petshop Tekkeköy | Kapıda Teslim | JETGO",
    h1: "Sanayi Pet Shop - Tekkeköy Kapıda Teslim",
    description: "Tekkeköy Sanayi pet shop kapıda teslim. Kedi maması, köpek maması siparişi aynı gün teslimat. Sanayi bölgesine hızlı pet shop teslimatı.",
    keywords: ["tekkeköy sanayi petshop", "tekkeköy sanayi petshop kapıda teslim", "tekkeköy sanayi kedi maması", "tekkeköy sanayi köpek maması", "tekkeköy sanayi mama siparişi"],
  },
];

export function getSeoPageBySlug(slug: string): SeoPage | undefined {
  return SEO_PAGES.find(p => p.slug === slug);
}

export function getRelatedPages(currentSlug: string): SeoPage[] {
  const current = getSeoPageBySlug(currentSlug);
  if (!current) return [];
  const sameDistrict = SEO_PAGES.filter(p => p.district === current.district && p.slug !== currentSlug);
  const otherDistricts = SEO_PAGES.filter(p => p.district !== current.district && !p.neighborhood);
  return [...sameDistrict, ...otherDistricts].slice(0, 12);
}

export function getDistrictPages(district: string): SeoPage[] {
  return SEO_PAGES.filter(p => p.district === district);
}

export const DISTRICTS = ["Samsun", "Atakum", "İlkadım", "Canik", "Tekkeköy"] as const;
