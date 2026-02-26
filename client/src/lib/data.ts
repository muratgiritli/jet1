export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productUrl(id: string | number, name: string): string {
  return `/urun/${id}/${toSlug(name)}`;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  img?: string;
  skt?: string;
  originalPrice?: number;
}

export interface Category {
  title: string;
  items: Product[];
}

export interface PaymentOption {
  id: string;
  name: string;
  disc: number;
  tag: string;
}

export const CONFIG = {
  phone: "+908508403959",
  shipLimit: 1000,
  minLimit: 500,
  shipFee: 89,
  bankInfo:
    "\n\n*BANKA HESAP NO :* TR54 0006 2001 0550 0006 2959 82 \n*BANKA HESAP ADI :* SİZPA İNTERNET TİCARET LİMİTED ŞİRKETİ",
};

export const MAIN_PRODUCTS: Product[] = [
  { id: "rc15", name: "Brit Kitten (yavru) 2 Kg", price: 1260 },
];

export const CATEGORIES: Category[] = [
  {
    title: "KUM",
    items: [],
  },
  {
    title: "ÖDÜL",
    items: [],
  },
  {
    title: "YAŞ MAMA",
    items: [],
  },
  {
    title: "BAKIM VE SAĞLIK",
    items: [],
  },
];

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "nakit", name: "Kapıda Nakit", disc: 0.05, tag: "%5 İndirim" },
  { id: "eft", name: "Banka Havalesi", disc: 0, tag: "Net" },
  { id: "qr", name: "Kapıda QR Ödeme", disc: 0, tag: "Net" },
  { id: "pos", name: "Kapıda Kredi Kartı", disc: 0, tag: "Net" },
  { id: "taksit", name: "Kredi Kartına Taksit", disc: 0, tag: "Taksitli" },
];

export interface BrandProductCategory {
  brandName: string;
  brandSlug: string;
  animal: string;
  subcategory: string;
  products: Product[];
}

export const BRAND_PRODUCTS: BrandProductCategory[] = [
  {
    brandName: "Brit Care",
    brandSlug: "brit-care",
    animal: "kedi",
    subcategory: "kedi-mamasi",
    products: [
      { id: "bc1", name: "Brit Care Tahılsız Tavuk Etli Kısırlaştırılmış Üriner Destekli Yetişkin Kedi Maması 2 kg", price: 968.37, originalPrice: 1320, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-tavuk-etli-kisirlastirilmis-uriner-destekli-yetiskin-kedi-mamasi-2-kg-1066453-98-O.jpg" },
      { id: "bc2", name: "Brit Care Urinary Tavuklu Tahılsız Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2425.23, originalPrice: 2640, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-urinary-tavuklu-tahilsiz-kisirlastirilmis-yetiskin-kedi-mamasi-7-kg-1043638-98-O.jpg" },
      { id: "bc3", name: "Brit Care Sensitive Hipoalerjenik Hindili ve Somonlu Tahılsız Yetişkin Kedi Maması 2 kg", price: 930.62, originalPrice: 1320, skt: "06.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-fresh-hypoallergenic-hindili-ve-somonlu-kedi-mamasi-2-kg-1054420-18-O.jpg" },
      { id: "bc4", name: "Brit Care Immunity Prebiotik İçerikli Domuzlu Kısırlaştırılmış Kedi Maması 7 kg", price: 2480.17, originalPrice: 2860, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-care-immunity-prebiotik-icerikli-domuzlu-kisirlastirilmis-kedi-mamasi-7-kg-1043687-11-O.jpg" },
      { id: "bc5", name: "Brit Care Immunity Prebiotik İçerikli Domuzlu Kısırlaştırılmış Kedi Maması 2 kg", price: 1007.21, originalPrice: 1072.50, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-care-immunity-prebiotik-icerikli-domuzlu-kisirlastirilmis-kedi-mamasi-2-kg-1066475-11-O.jpg" },
      { id: "bc6", name: "Brit Care Tahılsız Indoor Anti Stress Tavuklu Kedi Maması 2 kg", price: 935.52, originalPrice: 979, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-indoor-anti-stress-tavuklu-kedi-mamasi-2-kg-1066474-10-O.jpg" },
      { id: "bc7", name: "Brit Care Haircare Hipoalerjenik Deri ve Tüy Sağlığı için Tahılsız Yetişkin Kedi Maması 2 kg", price: 935.04, originalPrice: 1385.89, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-care-haircare-hypo-allergenic-deri-ve-tuy-sagligi-icin-tahilsiz-yetiskin-kedi-mamasi-2-kg-1066175-98-O.jpg" },
      { id: "bc8", name: "Brit Care Tahılsız Senior Weight Control Tavuklu Yaşlı Kedi Maması 2 kg", price: 879.37, originalPrice: 979, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-senior-weight-control-tavuklu-yasli-kedi-mamasi-2-kg-1061769-98-O.jpg" },
      { id: "bc9", name: "Brit Care Sensitive Hipoalerjenik Böcek Proteinli Tahılsız Yetişkin Kedi Maması 7 kg", price: 2392.47, originalPrice: 2860, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-hypo-allergenic-bocek-proteinli-tahilsiz-yetiskin-kedi-mamasi-7-kg-1066110-65-O.jpg" },
      { id: "bc10", name: "Brit Premium Hipoalerjenik Sensitive Kuzu Etli Yetişkin Kedi Maması 8 kg", price: 2076.10, originalPrice: 2585, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-hypo-allergenic-sensitive-kuzu-etli-yetiskin-kedi-mamasi-8-kg-1055109-62-O.jpg" },
      { id: "bc11", name: "Brit Premium Tavuk Etli Kısırlaştırılmış Yetişkin Kedi Maması 8 kg", price: 1895.11, originalPrice: 2420, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-kisirlastirilmis-tavuk-etli-yetiskin-kedi-mamasi-8-kg-1056623-61-O.jpg" },
      { id: "bc12", name: "Brit Care Hindili ve Somonlu Tahılsız Yetişkin Kedi Maması 7 kg", price: 2530.25, originalPrice: 2860, skt: "09.2026", img: "https://www.mamatoptancisi.com/brit-care-hindili-ve-somonlu-tahilsiz-yetiskin-kedi-mamasi-7-kg-1067621-59-O.jpg" },
      { id: "bc13", name: "Brit Care Tahılsız Tavşan Etli Kısırlaştırılmış Yetişkin Kedi Maması 2 kg", price: 1034.31, originalPrice: 1078, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-tavsan-etli-kisirlastirilmis-yetiskin-kedi-mamasi-2-kg-1066468-58-O.jpg" },
      { id: "bc14", name: "Brit Care Deri ve Tüy Sağlığı İçin Tahılsız Kedi Maması 7 kg", price: 2542.01, originalPrice: 2860, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-deri-ve-tuy-sagligi-icin-tahilsiz-kedi-mamasi-7-kg-1055844-58-O.jpg" },
      { id: "bc15", name: "Brit Care Sensitive Tavşanlı Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2604.18, originalPrice: 2970, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sterilised-sensitive-tavsanli-yetiskin-kedi-mamasi-7-kg-1033811-56-O.jpg" },
      { id: "bc16", name: "Brit Premium Tavuklu Yavru Kedi Maması 8 kg", price: 1957.28, originalPrice: 2200, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-premium-tavuklu-yavru-kedi-mamasi-8-kg-1043762-55-O.jpg" },
      { id: "bc17", name: "Brit Premium Kuzu Etli Kısırlaştırılmış Yetişkin Kedi Maması 8 kg", price: 2241.52, originalPrice: 2585, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-kisirlastirilmis-kuzu-etli-yetiskin-kedi-mamasi-8-kg-1065059-55-O.jpg" },
      { id: "bc18", name: "Brit Care Tahılsız Ördek ve Hindi Etli Kısırlaştırılmış Diyet Yetişkin Kedi Maması 2 kg", price: 901.21, originalPrice: 979, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-ordek-ve-hindi-etli-kisirlastirilmis-diyet-yetiskin-kedi-mamasi-2-kg-1058354-48-O.jpg" },
      { id: "bc19", name: "Brit Care Ördekli Kilo Kontrollü Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2425.23, originalPrice: 2640, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-ordekli-kisirlastririlmis-kilo-kontrollu-yetiskin-kedi-mamasi-7-kg-1063572-48-O.jpg" },
      { id: "bc20", name: "Brit Care Gıda Toleransı Olan Kediler İçin Larva Proteinli Tahılsız Yetişkin Kedi Maması 2 kg", price: 891.13, originalPrice: 1034, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-allerji-kontrolu-tahilsiz-yetiskin-kedi-mamasi-2-kg-1043637-45-O.jpg" },
    ],
  },
  {
    brandName: "Hill's Science Plan",
    brandSlug: "hills",
    animal: "kedi",
    subcategory: "kedi-mamasi",
    products: [
      { id: "hl1", name: "Hill's Science Plan +7 Somonlu Yaşlı Kedi Maması 1,5 kg", price: 941.08, originalPrice: 1699.90, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-somonlu-yasli-kedi-mamasi-15-kg-1066801-10-O.jpg" },
      { id: "hl2", name: "Hill's Science Plan Somonlu Kısırlaştırılmış Yetişkin Kedi Maması 3 kg", price: 1410.97, originalPrice: 1870, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-somonlu-kisirlastirilmis-yetiskin-kedi-mamasi-3-kg-1067992-97-O.jpg" },
      { id: "hl3", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Tavuklu Kedi Maması 3 kg", price: 1811.54, originalPrice: 2675, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-tavuklu-kedi-mamasi-3-kg-1067654-97-O.jpg" },
      { id: "hl4", name: "Hill's Science Plan Ton Balıklı Yavru Kedi Maması 5 kg + 2 kg", price: 2851.57, originalPrice: 3630, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-ton-balikli-yavru-kedi-mamasi-5-kg-2-kg-1050690-97-O.jpg" },
      { id: "hl5", name: "Hill's Science Plan Hypoallergenic Yumurta ve Böcek Proteinli Yetişkin Kedi Maması 7 kg", price: 4899.21, originalPrice: 6945, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-hypoallergenic-yumurta-ve-bocek-proteinli-yetiskin-kedi-mamasi-7-kg-1067968-65-O.jpg" },
      { id: "hl6", name: "Hill's Science Plan Hypoallergenic Yumurta ve Böcek Proteinli Yetişkin Kedi Maması 1,5 kg", price: 1185.46, originalPrice: 1745, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-hypoallergenic-yumurta-ve-bocek-proteinli-yetiskin-kedi-mamasi-15-kg-1068763-65-O.jpg" },
      { id: "hl7", name: "Hill's Science Plan Kısırlaştırılmış Tavuklu Yavru Kedi Maması 1,5 kg", price: 1021.96, originalPrice: 1798.38, skt: "12.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-tavuklu-yavru-kedi-mamasi-3-kg-5907-1063371-59-O.jpg" },
      { id: "hl8", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Somonlu Kedi Maması 8 kg + 2 kg", price: 4416.63, originalPrice: 5615, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-somonlu-kedi-mamasi-82kg-1066171-54-O.jpg" },
      { id: "hl9", name: "Hill's Science Plan Tavuklu Yavru Kedi Maması 1,5 kg", price: 956.56, originalPrice: 1415, skt: "05.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-tavuklu-yavru-kedi-mamasi-15kg-1067151-53-O.jpg" },
      { id: "hl10", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Ördekli Kedi Maması 8 kg + 2 kg", price: 4379.71, originalPrice: 5615, skt: "12.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-ordekli-kedi-mamasi-82-kg-5371-1061411-53-O.jpg" },
      { id: "hl11", name: "Hill's Science Plan Ton Balıklı Yavru Kedi Maması 1,5 kg", price: 726.75, originalPrice: 1078.98, skt: "05.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-ton-balikli-yavru-kedi-mamasi-5368-1068060-53-O.jpg" },
      { id: "hl12", name: "Hill's Science Plan Yetişkin Tavuklu Kedi Maması 1,5 kg", price: 914.06, originalPrice: 1345, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-tavuklu-kedi-mamasi-5367-1057246-53-O.jpg" },
      { id: "hl13", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Ördekli Kedi Maması 3 kg", price: 1811.54, originalPrice: 2675, skt: "03.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-ordekli-kedi-mamasi-3-kg-5364-1066139-53-O.jpg" },
      { id: "hl14", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Ördekli Kedi Maması 1,5 kg", price: 1074.93, originalPrice: 1580, skt: "03.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-ordekli-kedi-mamasi-5364-1054381-53-O.jpg" },
      { id: "hl15", name: "Hill's Science Plan Yetişkin Kuzulu Kedi Maması 8 + 2 kg", price: 3834.27, originalPrice: 4915, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-kuzulu-kedi-mamasi-82-kg-5360-1066131-53-O.jpg" },
      { id: "hl16", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Somonlu Kedi Maması 1,5 kg", price: 1054.48, originalPrice: 1565, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-somon-balikli-kedi-mamasi-1-kg-1066165-53-O.jpg" },
      { id: "hl17", name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Tavuklu Kedi Maması 1,5 kg", price: 865.30, originalPrice: 1560, skt: "05.2027", img: "https://www.mamatoptancisi.com/hills-tavuklu-kisirlastirilmis-kedi-mamasi-15-kg-1067650-53-O.jpg" },
      { id: "hl18", name: "Hill's Science Plan +7 Yaşlı Tavuklu Kedi Maması 3 kg", price: 1593.17, originalPrice: 2350, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-yasli-tavuklu-kedi-mamasi-3-kg-1067145-53-O.jpg" },
      { id: "hl19", name: "Hill's Science Plan +7 Yaşlı Tavuklu Kedi Maması 1,5 kg", price: 941.07, originalPrice: 1385, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-yasli-tavuklu-kedi-mamasi-1-1067143-53-O.jpg" },
      { id: "hl20", name: "Hill's Science Plan Mature +7 Ton Balıklı Yaşlı Kedi Maması 1,5 kg", price: 941.07, originalPrice: 1385, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-yasli-ton-balikli-kedi-mamasi-1-1067147-53-O.jpg" },
      { id: "hl21", name: "Hill's Science Plan Yetişkin Ton Balıklı Kedi Maması 1,5 kg", price: 914.06, originalPrice: 1345, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-ton-balikli-kedi-mamasi-1-1067149-53-O.jpg" },
      { id: "hl22", name: "Hill's Science Plan Kısırlaştırılmış Tavuklu Yavru Kedi Maması 3 kg", price: 1730.65, originalPrice: 2555, skt: "10.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-tavuklu-yavru-kedi-mamasi-3-kg-1063369-59-O.jpg" },
      { id: "hl23", name: "Hill's Science Plan Üriner Sağlık +1 Yetişkin Tavuklu Kedi Maması 1,5 kg", price: 1087.45, originalPrice: 1615, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-uriner-saglik-1-yetiskin-tavuklu-kedi-mamasi-1-1067159-53-O.jpg" },
      { id: "hl24", name: "Hill's Science Plan Tavuklu Yavru Kedi Maması 5 Kg (+2 kg Hediyeli)", price: 2851.57, originalPrice: 3630, skt: "12.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-tavuklu-yavru-kedi-mamasi-52-kg-1043579-26-O.jpg" },
      { id: "hl25", name: "Hill's Science Plan Yetişkin Kuzulu Kedi Maması 1,5 kg", price: 904.23, originalPrice: 1330, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-kuzulu-kedi-mamasi-1-1037656-22-O.jpg" },
      { id: "hl26", name: "Hill's Science Plan Yetişkin Kuzulu Kedi Maması 3 kg", price: 1517.03, originalPrice: 2235, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-kuzulu-kedi-mamasi-3-kg-1064343-21-O.jpg" },
      { id: "hl27", name: "Hill's Science Plan Tavuklu Yetişkin Kedi Maması 8 kg + 2 kg", price: 3837.28, originalPrice: 4915, skt: "05.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-tavuklu-kedi-mamasi-82-kg-1059587-18-O.jpg" },
      { id: "hl28", name: "Hill's Science Plan Tüy Yumağı Önleyici Mükemmel Tüyler İçin Tavuklu Kedi Maması 1,5 kg", price: 1073.25, originalPrice: 1580, skt: "10.2026", img: "https://www.mamatoptancisi.com/hills-hairball-perfect-coat-tavuklu-kedi-mamasi-1-1037598-20-O.jpg" },
    ],
  },
];

export function getBrandProducts(animal: string, subcategory: string, brandSlug: string): BrandProductCategory | undefined {
  return BRAND_PRODUCTS.find(
    (bp) => bp.animal === animal && bp.subcategory === subcategory && bp.brandSlug === brandSlug
  );
}

export function getAllProducts(): Product[] {
  return [...MAIN_PRODUCTS, ...CATEGORIES.flatMap((c) => c.items), ...BRAND_PRODUCTS.flatMap((bp) => bp.products)];
}
