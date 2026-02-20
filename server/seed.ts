import { db } from "./storage";
import { brandCategories, products, breedStats } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import brandDataJson from "./brand_data.json";

interface BrandProductData {
  brandName: string;
  brandSlug: string;
  animal: string;
  subcategory: string;
  products: {
    name: string;
    price: number;
    originalPrice?: number;
    skt?: string;
    img?: string;
    stock?: number;
  }[];
}

const EXTRA_BRAND_DATA: BrandProductData[] = brandDataJson as BrandProductData[];

const SEED_BRAND_DATA: BrandProductData[] = [
  {
    brandName: "Brit Care",
    brandSlug: "brit-care",
    animal: "kedi",
    subcategory: "kedi-mamasi",
    products: [
      { name: "Brit Care Tahılsız Tavuk Etli Kısırlaştırılmış Üriner Destekli Yetişkin Kedi Maması 2 kg", price: 968.37, originalPrice: 1320, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-tavuk-etli-kisirlastirilmis-uriner-destekli-yetiskin-kedi-mamasi-2-kg-1066453-98-O.jpg" },
      { name: "Brit Care Urinary Tavuklu Tahılsız Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2425.23, originalPrice: 2640, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-urinary-tavuklu-tahilsiz-kisirlastirilmis-yetiskin-kedi-mamasi-7-kg-1043638-98-O.jpg" },
      { name: "Brit Care Sensitive Hipoalerjenik Hindili ve Somonlu Tahılsız Yetişkin Kedi Maması 2 kg", price: 930.62, originalPrice: 1320, skt: "06.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-fresh-hypoallergenic-hindili-ve-somonlu-kedi-mamasi-2-kg-1054420-18-O.jpg" },
      { name: "Brit Care Immunity Prebiotik İçerikli Domuzlu Kısırlaştırılmış Kedi Maması 7 kg", price: 2480.17, originalPrice: 2860, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-care-immunity-prebiotik-icerikli-domuzlu-kisirlastirilmis-kedi-mamasi-7-kg-1043687-11-O.jpg" },
      { name: "Brit Care Immunity Prebiotik İçerikli Domuzlu Kısırlaştırılmış Kedi Maması 2 kg", price: 1007.21, originalPrice: 1072.50, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-care-immunity-prebiotik-icerikli-domuzlu-kisirlastirilmis-kedi-mamasi-2-kg-1066475-11-O.jpg" },
      { name: "Brit Care Tahılsız Indoor Anti Stress Tavuklu Kedi Maması 2 kg", price: 935.52, originalPrice: 979, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-indoor-anti-stress-tavuklu-kedi-mamasi-2-kg-1066474-10-O.jpg" },
      { name: "Brit Care Haircare Hipoalerjenik Deri ve Tüy Sağlığı için Tahılsız Yetişkin Kedi Maması 2 kg", price: 935.04, originalPrice: 1385.89, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-care-haircare-hypo-allergenic-deri-ve-tuy-sagligi-icin-tahilsiz-yetiskin-kedi-mamasi-2-kg-1066175-98-O.jpg" },
      { name: "Brit Care Tahılsız Senior Weight Control Tavuklu Yaşlı Kedi Maması 2 kg", price: 879.37, originalPrice: 979, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-senior-weight-control-tavuklu-yasli-kedi-mamasi-2-kg-1061769-98-O.jpg" },
      { name: "Brit Care Sensitive Hipoalerjenik Böcek Proteinli Tahılsız Yetişkin Kedi Maması 7 kg", price: 2392.47, originalPrice: 2860, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-hypo-allergenic-bocek-proteinli-tahilsiz-yetiskin-kedi-mamasi-7-kg-1066110-65-O.jpg" },
      { name: "Brit Premium Hipoalerjenik Sensitive Kuzu Etli Yetişkin Kedi Maması 8 kg", price: 2076.10, originalPrice: 2585, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-hypo-allergenic-sensitive-kuzu-etli-yetiskin-kedi-mamasi-8-kg-1055109-62-O.jpg" },
      { name: "Brit Premium Tavuk Etli Kısırlaştırılmış Yetişkin Kedi Maması 8 kg", price: 1895.11, originalPrice: 2420, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-kisirlastirilmis-tavuk-etli-yetiskin-kedi-mamasi-8-kg-1056623-61-O.jpg" },
      { name: "Brit Care Hindili ve Somonlu Tahılsız Yetişkin Kedi Maması 7 kg", price: 2530.25, originalPrice: 2860, skt: "09.2026", img: "https://www.mamatoptancisi.com/brit-care-hindili-ve-somonlu-tahilsiz-yetiskin-kedi-mamasi-7-kg-1067621-59-O.jpg" },
      { name: "Brit Care Tahılsız Tavşan Etli Kısırlaştırılmış Yetişkin Kedi Maması 2 kg", price: 1034.31, originalPrice: 1078, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-tavsan-etli-kisirlastirilmis-yetiskin-kedi-mamasi-2-kg-1066468-58-O.jpg" },
      { name: "Brit Care Deri ve Tüy Sağlığı İçin Tahılsız Kedi Maması 7 kg", price: 2542.01, originalPrice: 2860, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-deri-ve-tuy-sagligi-icin-tahilsiz-kedi-mamasi-7-kg-1055844-58-O.jpg" },
      { name: "Brit Care Sensitive Tavşanlı Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2604.18, originalPrice: 2970, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sterilised-sensitive-tavsanli-yetiskin-kedi-mamasi-7-kg-1033811-56-O.jpg" },
      { name: "Brit Premium Tavuklu Yavru Kedi Maması 8 kg", price: 1957.28, originalPrice: 2200, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-premium-tavuklu-yavru-kedi-mamasi-8-kg-1043762-55-O.jpg" },
      { name: "Brit Premium Kuzu Etli Kısırlaştırılmış Yetişkin Kedi Maması 8 kg", price: 2241.52, originalPrice: 2585, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-premium-kisirlastirilmis-kuzu-etli-yetiskin-kedi-mamasi-8-kg-1065059-55-O.jpg" },
      { name: "Brit Care Tahılsız Ördek ve Hindi Etli Kısırlaştırılmış Diyet Yetişkin Kedi Maması 2 kg", price: 901.21, originalPrice: 979, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-ordek-ve-hindi-etli-kisirlastirilmis-diyet-yetiskin-kedi-mamasi-2-kg-1058354-48-O.jpg" },
      { name: "Brit Care Ördekli Kilo Kontrollü Kısırlaştırılmış Yetişkin Kedi Maması 7 kg", price: 2425.23, originalPrice: 2640, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-ordekli-kisirlastririlmis-kilo-kontrollu-yetiskin-kedi-mamasi-7-kg-1063572-48-O.jpg" },
      { name: "Brit Care Gıda Toleransı Olan Kediler İçin Larva Proteinli Tahılsız Yetişkin Kedi Maması 2 kg", price: 891.13, originalPrice: 1034, skt: "05.2027", img: "https://www.mamatoptancisi.com/brit-care-allerji-kontrolu-tahilsiz-yetiskin-kedi-mamasi-2-kg-1043637-45-O.jpg" },
    ],
  },
  {
    brandName: "Hill's Science Plan",
    brandSlug: "hills",
    animal: "kedi",
    subcategory: "kedi-mamasi",
    products: [
      { name: "Hill's Science Plan +7 Somonlu Yaşlı Kedi Maması 1,5 kg", price: 941.08, originalPrice: 1699.90, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-somonlu-yasli-kedi-mamasi-15-kg-1066801-10-O.jpg" },
      { name: "Hill's Science Plan Somonlu Kısırlaştırılmış Yetişkin Kedi Maması 3 kg", price: 1410.97, originalPrice: 1870, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-somonlu-kisirlastirilmis-yetiskin-kedi-mamasi-3-kg-1067992-97-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Tavuklu Kedi Maması 3 kg", price: 1811.54, originalPrice: 2675, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-tavuklu-kedi-mamasi-3-kg-1067654-97-O.jpg" },
      { name: "Hill's Science Plan Ton Balıklı Yavru Kedi Maması 5 kg + 2 kg", price: 2851.57, originalPrice: 3630, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-ton-balikli-yavru-kedi-mamasi-5-kg-2-kg-1050690-97-O.jpg" },
      { name: "Hill's Science Plan Hypoallergenic Yumurta ve Böcek Proteinli Yetişkin Kedi Maması 7 kg", price: 4899.21, originalPrice: 6945, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-hypoallergenic-yumurta-ve-bocek-proteinli-yetiskin-kedi-mamasi-7-kg-1067968-65-O.jpg" },
      { name: "Hill's Science Plan Hypoallergenic Yumurta ve Böcek Proteinli Yetişkin Kedi Maması 1,5 kg", price: 1185.46, originalPrice: 1745, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-hypoallergenic-yumurta-ve-bocek-proteinli-yetiskin-kedi-mamasi-15-kg-1068763-65-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Tavuklu Yavru Kedi Maması 1,5 kg", price: 1021.96, originalPrice: 1798.38, skt: "12.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-tavuklu-yavru-kedi-mamasi-3-kg-5907-1063371-59-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Somonlu Kedi Maması 8 kg + 2 kg", price: 4416.63, originalPrice: 5615, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-somonlu-kedi-mamasi-82kg-1066171-54-O.jpg" },
      { name: "Hill's Science Plan Tavuklu Yavru Kedi Maması 1,5 kg", price: 956.56, originalPrice: 1415, skt: "05.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-tavuklu-yavru-kedi-mamasi-15kg-1067151-53-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Ördekli Kedi Maması 8 kg + 2 kg", price: 4379.71, originalPrice: 5615, skt: "12.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-ordekli-kedi-mamasi-82-kg-5371-1061411-53-O.jpg" },
      { name: "Hill's Science Plan Ton Balıklı Yavru Kedi Maması 1,5 kg", price: 726.75, originalPrice: 1078.98, skt: "05.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-ton-balikli-yavru-kedi-mamasi-5368-1068060-53-O.jpg" },
      { name: "Hill's Science Plan Yetişkin Tavuklu Kedi Maması 1,5 kg", price: 914.06, originalPrice: 1345, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-tavuklu-kedi-mamasi-5367-1057246-53-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Ördekli Kedi Maması 3 kg", price: 1811.54, originalPrice: 2675, skt: "03.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-ordekli-kedi-mamasi-3-kg-5364-1066139-53-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Ördekli Kedi Maması 1,5 kg", price: 1074.93, originalPrice: 1580, skt: "03.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-ordekli-kedi-mamasi-5364-1054381-53-O.jpg" },
      { name: "Hill's Science Plan Yetişkin Kuzulu Kedi Maması 8 + 2 kg", price: 3834.27, originalPrice: 4915, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-kuzulu-kedi-mamasi-82-kg-5360-1066131-53-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Somonlu Kedi Maması 1,5 kg", price: 1054.48, originalPrice: 1565, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-yetiskin-somon-balikli-kedi-mamasi-1-kg-1066165-53-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Yetişkin Tavuklu Kedi Maması 1,5 kg", price: 865.30, originalPrice: 1560, skt: "05.2027", img: "https://www.mamatoptancisi.com/hills-tavuklu-kisirlastirilmis-kedi-mamasi-15-kg-1067650-53-O.jpg" },
      { name: "Hill's Science Plan +7 Yaşlı Tavuklu Kedi Maması 3 kg", price: 1593.17, originalPrice: 2350, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-yasli-tavuklu-kedi-mamasi-3-kg-1067145-53-O.jpg" },
      { name: "Hill's Science Plan +7 Yaşlı Tavuklu Kedi Maması 1,5 kg", price: 941.07, originalPrice: 1385, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-yasli-tavuklu-kedi-mamasi-1-1067143-53-O.jpg" },
      { name: "Hill's Science Plan Mature +7 Ton Balıklı Yaşlı Kedi Maması 1,5 kg", price: 941.07, originalPrice: 1385, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-7-yasli-ton-balikli-kedi-mamasi-1-1067147-53-O.jpg" },
      { name: "Hill's Science Plan Yetişkin Ton Balıklı Kedi Maması 1,5 kg", price: 914.06, originalPrice: 1345, skt: "04.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-ton-balikli-kedi-mamasi-1-1067149-53-O.jpg" },
      { name: "Hill's Science Plan Kısırlaştırılmış Tavuklu Yavru Kedi Maması 3 kg", price: 1730.65, originalPrice: 2555, skt: "10.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-kisirlastirilmis-tavuklu-yavru-kedi-mamasi-3-kg-1063369-59-O.jpg" },
      { name: "Hill's Science Plan Üriner Sağlık +1 Yetişkin Tavuklu Kedi Maması 1,5 kg", price: 1087.45, originalPrice: 1615, skt: "01.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-uriner-saglik-1-yetiskin-tavuklu-kedi-mamasi-1-1067159-53-O.jpg" },
      { name: "Hill's Science Plan Tavuklu Yavru Kedi Maması 5 Kg (+2 kg Hediyeli)", price: 2851.57, originalPrice: 3630, skt: "12.2026", img: "https://www.mamatoptancisi.com/hills-science-plan-tavuklu-yavru-kedi-mamasi-52-kg-1043579-26-O.jpg" },
      { name: "Hill's Science Plan Yetişkin Kuzulu Kedi Maması 1,5 kg", price: 904.23, originalPrice: 1330, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-kuzulu-kedi-mamasi-1-1037656-22-O.jpg" },
      { name: "Hill's Science Plan Yetişkin Kuzulu Kedi Maması 3 kg", price: 1517.03, originalPrice: 2235, skt: "02.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-kuzulu-kedi-mamasi-3-kg-1064343-21-O.jpg" },
      { name: "Hill's Science Plan Tavuklu Yetişkin Kedi Maması 8 kg + 2 kg", price: 3837.28, originalPrice: 4915, skt: "05.2027", img: "https://www.mamatoptancisi.com/hills-science-plan-yetiskin-tavuklu-kedi-mamasi-82-kg-1059587-18-O.jpg" },
      { name: "Hill's Science Plan Tüy Yumağı Önleyici Mükemmel Tüyler İçin Tavuklu Kedi Maması 1,5 kg", price: 1073.25, originalPrice: 1580, skt: "10.2026", img: "https://www.mamatoptancisi.com/hills-hairball-perfect-coat-tavuklu-kedi-mamasi-1-1037598-20-O.jpg" },
    ],
  },
];

const KEDI_KUMU_DATA: BrandProductData = {
  brandName: "Kedi Kumu",
  brandSlug: "kedi-kumu",
  animal: "kedi",
  subcategory: "kedi-kumu",
  products: [
    { name: "Van Cat Naturel Kokusuz İnce Taneli Topaklanan Bentonit Kedi Kumu 10 Lt", price: 218, originalPrice: 472, img: "https://www.mamatoptancisi.com/van-cat-naturel-kokusuz-ince-taneli-topaklanan-bentonit-kedi-kumu-10-lt-1063756-22-O.jpg" },
    { name: "Proline Marsilya Sabun Kokulu İnce Taneli Topaklanan Bentonit Kedi Kumu 10 lt", price: 175, originalPrice: 275, img: "https://www.mamatoptancisi.com/proline-marsilya-sabun-kokulu-bentonit-kedi-kumu-10-lt-1045282-30-O.jpg" },
    { name: "Biokats Micro Bianco Fresh Topaklaşan Kedi Kumu 6 lt", price: 150, originalPrice: 333, img: "https://www.mamatoptancisi.com/biokats-micro-bianco-fresh-topaklasan-kedi-kumu-6lt-1053519-12-O.jpg" },
    { name: "Proline Bebek Pudralı İnce Taneli Topaklanan Bentonit Kedi Kumu 10 lt", price: 170, originalPrice: 275, img: "https://www.mamatoptancisi.com/proline-dogal-topaklanan-baby-powder-kokulu-kedi-kumu-kalin-taneli-10-lt-1038710-91-O.jpg" },
    { name: "Proline Kokusuz İnce Taneli Topaklanan Bentonit Kedi Kumu 10 lt", price: 170, originalPrice: 275, img: "https://www.mamatoptancisi.com/proline-parfumsuz-ince-taneli-topaklasan-bentonit-kedi-kumu-10-l-1038711-71-O.jpg" },
  ],
};

const YAS_MAMA_DATA: BrandProductData = {
  brandName: "Yaş Mama",
  brandSlug: "yas-mama",
  animal: "kedi",
  subcategory: "yas-mama",
  products: [
    { name: "Proplan Yavru Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_26b590fe701c4ca3a2dfa8e636d0d0a0~mv2.webp" },
    { name: "Proplan Adult Tavuklu Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_3e1f871338284c54adc3c4f8e5c2a6e7~mv2.png" },
    { name: "Proplan Kısır Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_516bafdef93c4d3b8cb8d05675278d8c~mv2.webp" },
    { name: "Proplan Delicate Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_fba74f727181409e89f53da0ed0d82d0~mv2.webp" },
    { name: "Gourmet Ton Balıklı Püre Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_0daffe01618148baa58f15e27e7bb5e9~mv2.webp" },
    { name: "Gourmet Sığır Etli Püre Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_7f12a63f285743bca4ae6029fc29a1c3~mv2.webp" },
    { name: "Gourmet Tavuklu Püre Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_5b6aaa07a5054d25a28d4b3b6e7a36ee~mv2.webp" },
    { name: "Gourmet Somonlu Püre Yaş Mama", price: 35, img: "https://static.wixstatic.com/media/63853e_c6b29e2f8e4648e8a4f366a5424a1e3a~mv2.webp" },
    { name: "Reflex Plus Tavuklu Yetişkin Kedi Pouch 85 gr", price: 32 },
    { name: "Reflex Plus Somonlu Kısır Kedi Pouch 85 gr", price: 32 },
  ],
};

const MALT_MACUN_DATA: BrandProductData = {
  brandName: "Malt & Vitamin",
  brandSlug: "malt-vitamin",
  animal: "kedi",
  subcategory: "malt-vitamin",
  products: [
    { name: "Gimcat Multi Vitamin Paste Kedi Macunu 20 gr", price: 61.62, originalPrice: 105.09, img: "https://www.mamatoptancisi.com/gimcat-multi-vitamin-paste-kedi-macunu-20-gr-1068817-73-O.jpg" },
    { name: "Gimcat Malt Soft Extra 100 gr", price: 300.17, originalPrice: 535.05, img: "https://www.mamatoptancisi.com/gimcat-malt-soft-extra-100-gr-1071695-63-O.jpg" },
    { name: "Gimcat Multivitamin Paste Kedi Macunu 100 gr", price: 317.15, originalPrice: 605, img: "https://www.mamatoptancisi.com/gimcat-kedi-multivitamin-100-gr-1070292-25-O.jpg" },
    { name: "Gimcat Anti-Hairball Duo Paste Peynirli Malt 50 gr", price: 172.43, img: "https://www.mamatoptancisi.com/gimcat-anti-hairball-duo-paste-peynirli-malt-50-gr-1070261-97-O.jpg" },
    { name: "Gimcat Derma Paste Deri ve Tüy Sağlığı 50 gr", price: 153.23, originalPrice: 194.21, img: "https://www.mamatoptancisi.com/gimcat-kedi-macunu-derma-paste-50-gr-1068943-25-O.jpg" },
    { name: "Gimcat Kitten Yavru Kedi Vitamin Paste 50 gr", price: 169.64, originalPrice: 251.87, img: "https://www.mamatoptancisi.com/gimcat-kedi-macunu-kitten-paste-50-gr-1066887-26-O.jpg" },
    { name: "Garden Mix Anti Hairball Kedi Malt Macunu 100 gr", price: 85, originalPrice: 120, img: "https://www.mamatoptancisi.com/garden-mix-anti-hairball-kedi-malt-macunu-100-gram-1069744-51-O.jpg" },
    { name: "Garden Mix Kedi Multivitamin Macun 100 gr", price: 87.53, originalPrice: 150, img: "https://www.mamatoptancisi.com/garden-mix-kedi-multivitamin-macun-100-gram-1057836-51-O.jpg" },
    { name: "Garden Mix Kedi Steril Multivitamin Macun 100 gr", price: 75.05, originalPrice: 102.63, img: "https://www.mamatoptancisi.com/garden-mix-kedi-steril-multivitamin-macun-100-gram-1045262-51-O.jpg" },
    { name: "Gimcat Paste Extra Taurin Kedi Malt Macunu 50 gr", price: 160.79, originalPrice: 194.21, img: "https://www.mamatoptancisi.com/gimcat-paste-extra-taurin-kedi-malt-macunu-50-gr-1051680-41-O.jpg" },
  ],
};

const ODUL_DATA: BrandProductData = {
  brandName: "Ödül",
  brandSlug: "odul",
  animal: "kedi",
  subcategory: "odul",
  products: [
    { name: "Dreamies Tavuklu Kedi Ödül Maması 60 gr", price: 42, img: "https://www.mamatoptancisi.com/dreamies-tavuklu-kedi-odul-mamasi-60-gr-1064369-10-O.jpg" },
    { name: "Dreamies Somonlu Kedi Ödül Maması 60 gr", price: 42, img: "https://www.mamatoptancisi.com/dreamies-somonlu-kedi-odul-mamasi-60-gr-1064371-97-O.jpg" },
    { name: "Dreamies Peynirli Kedi Ödül Maması 60 gr", price: 42, img: "https://www.mamatoptancisi.com/dreamies-peynirli-kedi-odul-mamasi-60-gr-1064373-10-O.jpg" },
    { name: "Reflex Plus Somonlu Kedi Ödül Çubuğu 3x5 gr", price: 25, img: "https://www.mamatoptancisi.com/reflex-plus-somonlu-kedi-odul-cubugu-3x5-gr-1064570-10-O.jpg" },
    { name: "Reflex Plus Tavuklu Kedi Ödül Çubuğu 3x5 gr", price: 25, img: "https://www.mamatoptancisi.com/reflex-plus-tavuklu-kedi-odul-cubugu-3x5-gr-1064568-10-O.jpg" },
    { name: "GimCat Sticks Somonlu Alabalıklı Kedi Ödül 4x20 gr", price: 89, img: "https://www.mamatoptancisi.com/gimcat-sticks-somonlu-ve-alabalikli-kedi-odul-4lu-1044099-53-O.jpg" },
  ],
};

const BAKIM_SAGLIK_DATA: BrandProductData = {
  brandName: "Bakım ve Sağlık",
  brandSlug: "bakim-saglik",
  animal: "kedi",
  subcategory: "bakim-saglik",
  products: [
    { name: "Garden Mix Kedi Tüy Sağlığı Damlası 50 ml", price: 75, img: "https://www.mamatoptancisi.com/garden-mix-kedi-tuy-sagligi-damlasi-50-ml-1066124-51-O.jpg" },
    { name: "Garden Mix Kedi ve Köpek Somon Yağı 200 ml", price: 115, img: "https://www.mamatoptancisi.com/garden-mix-kedi-ve-kopek-somon-yagi-200-ml-1053454-51-O.jpg" },
    { name: "Bioline Kedi Tüy Yumağı Önleyici Malt 100 gr", price: 79, img: "https://www.mamatoptancisi.com/bioline-kedi-tuy-yumagi-onleyici-malt-100-gr-1068823-10-O.jpg" },
    { name: "Prochoice Dermal Biotinli Kedi Macunu 100 ml", price: 175, img: "https://www.mamatoptancisi.com/prochoice-dermal-biotinli-kedi-macunu-100-ml-1064962-86-O.jpg" },
    { name: "Beaphar Kedi Vitamin Tableti 180 Adet", price: 289, img: "https://www.mamatoptancisi.com/beaphar-kedi-vitamin-tableti-180-adet-1040032-10-O.jpg" },
    { name: "Trixie Kedi Pire Tarağı Metal", price: 65, img: "https://www.mamatoptancisi.com/trixie-kedi-pire-taragi-metal-1051098-10-O.jpg" },
  ],
};

const KEDI_TUVALETI_DATA: BrandProductData = {
  brandName: "Kedi Tuvaleti",
  brandSlug: "kedi-tuvaleti",
  animal: "kedi",
  subcategory: "kedi-tuvaleti",
  products: [
    { name: "Şenyayla Küçük Lüx Kapalı Kedi Tuvaleti Karışık Renk 37x40x49 cm", price: 303, originalPrice: 2059, img: "https://www.mamatoptancisi.com/senyayla-kucuk-lux-kapali-kedi-tuvaleti-karisik-renk-37x40x49-cm-1051337-94-O.jpg" },
    { name: "Şenyayla Orta Lüx Çekmeceli Kapalı Kedi Tuvaleti Karışık Renk 55x47x35 cm", price: 612, originalPrice: 1328, img: "https://www.mamatoptancisi.com/senyayla-orta-lux-cekmeceli-kapali-kedi-tuvaleti-karisik-renk-55x47x35-cm-1055735-94-O.jpg" },
    { name: "Stefanplast Cathy Filter Kapalı Kedi Tuvaleti Mavi", price: 662, img: "https://www.mamatoptancisi.com/stefanplast-cathy-filter-kapali-kedi-tuvaleti-mavi-1071936-10-O.jpg" },
    { name: "Stefanplast Cathy Easy Clean Kapalı Kedi Tuvaleti Mavi", price: 856, img: "https://www.mamatoptancisi.com/stefanplast-cathy-easy-clean-kapali-kedi-tuvaleti-mavi-1071935-10-O.jpg" },
    { name: "Stefanplast Griffe Baskılı Kapalı Kedi Tuvaleti Mavi/Beyaz", price: 863, img: "https://www.mamatoptancisi.com/stefanplast-griffe-baskili-kapali-kedi-tuvaleti-mavi-beyaz-1071934-10-O.jpg" },
    { name: "Stefanplast Cathy Comfort Kapalı Kedi Tuvaleti Gri", price: 1078, img: "https://www.mamatoptancisi.com/stefanplast-cathy-comfort-kapali-kedi-tuvaleti-gri-1071937-10-O.jpg" },
    { name: "Beeztees Kapalı Kedi Tuvaleti Koku Filtreli Açık Mavi Antrasit 57x39x41 cm", price: 1146, originalPrice: 1993, img: "https://www.mamatoptancisi.com/beeztees-kapali-kedi-tuvaleti-koku-filtreli-acik-mavi-antrasit-57x39x41cm-1060688-73-O.jpg" },
    { name: "Moderna Smart Kapalı Kedi Tuvaleti Gri 53 cm", price: 1304, originalPrice: 1999, img: "https://www.mamatoptancisi.com/moderna-smart-kapali-kedi-tuvaleti-gri-53-cm-1045803-99-O.jpg" },
    { name: "M-Pets Eco Tıma Kapalı Kedi Tuvaleti M 52,3x39,7x38 cm Yeşil", price: 1051, originalPrice: 1951, img: "https://www.mamatoptancisi.com/m-pets-eco-tima-kapali-kedi-tuvaleti-m-523x397x38-cm-yesil-1052142-87-O.jpg", stock: 0 },
    { name: "M-Pets Eco Tanta Üstten Girişli Kedi Tuvaleti 63x49x42 cm Yeşil", price: 1154, originalPrice: 2098, img: "https://www.mamatoptancisi.com/m-pets-eco-tanta-ustten-girisli-kedi-tuvaleti-63x49x42-cm-yesil-1052140-87-O.jpg", stock: 0 },
    { name: "M-Pets Eco Tıma Kapalı Kedi Tuvaleti L 60,2x45,1x42,4 cm Yeşil", price: 1363, originalPrice: 2394, img: "https://www.mamatoptancisi.com/m-pets-eco-tima-kapali-kedi-tuvaleti-l-602x451x424-cm-yesil-1052143-87-O.jpg", stock: 0 },
    { name: "Beeztees Kapalı Kedi Tuvaleti Koku Filtreli Bej Gri 56x39x39 cm", price: 1584, originalPrice: 2755, img: "https://www.mamatoptancisi.com/beeztees-kapali-kedi-tuvaleti-koku-filtreli-bej-gri-56x39x39cm-1060696-73-O.jpg", stock: 0 },
    { name: "Beeztees Kapalı Köşe Kedi Tuvaleti Koku Filtreli Gri Beyaz 58x45x40 cm", price: 1804, originalPrice: 3137, img: "https://www.mamatoptancisi.com/beeztees-kapali-kose-kedi-tuvaleti-koku-filtreli-gri-beyaz-58x45x40cm-1060700-73-O.jpg", stock: 0 },
    { name: "M-Pets Suez Sailor Kapalı Kedi Tuvaleti 69x42x41 cm", price: 1927, originalPrice: 3362, img: "https://www.mamatoptancisi.com/m-pets-suez-sailor-kapali-kedi-tuvaleti-69x42x41-cm-1052146-87-O.jpg", stock: 0 },
    { name: "Beeztees Kapalı Kedi Tuvaleti Koku Filtreli Siyah Mermer Antrasit 56x39x39 cm", price: 2007, originalPrice: 3491, img: "https://www.mamatoptancisi.com/beeztees-kapali-kedi-tuvaleti-koku-filtreli-siyah-mermer-antrasit-56x39x39cm-1060703-73-O.jpg", stock: 0 },
    { name: "Imac Zuma Antrasit Çekmeceli Kapalı Kedi Tuvaleti 40x42,5x56 cm", price: 2622, img: "https://www.mamatoptancisi.com/imac-zuma-antrasit-cekmeceli-kapali-kedi-tuvaleti-40-x-425-x-56-cm-8937-1051511-89-O.jpg", stock: 0 },
    { name: "Imac Frida Üstten Girişli Çekmeceli Kedi Tuvaleti Bej 56x40x43,5 cm", price: 2550, originalPrice: 2999, img: "https://www.mamatoptancisi.com/imac-frida-ustten-girisli-cekmeceli-kedi-tuvaleti-bej-56x40x435-cm-1051499-89-O.jpg", stock: 0 },
    { name: "Dr. Sacchi Plastik Kedi Kumu Küreği 19 cm", price: 25, originalPrice: 65, stock: 0 },
    { name: "Natura Deliksiz Kedi Kum ve Mama Küreği 23 cm", price: 30, originalPrice: 75, stock: 0 },
    { name: "Dream Cat Aktif Karbonlu Kedi Kumu Koku Giderici 200 gr", price: 103, originalPrice: 169, stock: 0 },
    { name: "Reflex Care Vanilya Kokulu Kedi Kumu Torbası 82x50 cm 7 Adet", price: 110, originalPrice: 129, stock: 0 },
    { name: "Simple Solution Kedi Kumu Koku Giderici 600 gr", price: 350, originalPrice: 499, stock: 0 },
  ],
};

const KEDI_TASIMA_DATA: BrandProductData = {
  brandName: "Kedi Taşıma",
  brandSlug: "kedi-tasima",
  animal: "kedi",
  subcategory: "kedi-tasima",
  products: [
    { name: "Beeztees Kedi Taşıma Kabı Gri/Pembe 51x34,5x33 cm", price: 1289, originalPrice: 2242, img: "https://www.mamatoptancisi.com/beeztees-kopek-veya-kedi-tasima-kabi-gripembe-51x345x33cm-1024436-78-O.jpg" },
    { name: "Skudo Iata 2 Kedi ve Köpek Plastik Taşıma Çantası 55 cm", price: 1264, originalPrice: 2000, img: "https://www.mamatoptancisi.com/skudo-iata-no2-kedi-ve-kopek-plastik-tasima-cantasi-55-cm-1075551-10-O.jpg" },
    { name: "Moderna Roadrunner Kedi ve Küçük Irk Köpek Taşıma Çantası Gri 56x37x35 cm", price: 1335, originalPrice: 1699, img: "https://www.mamatoptancisi.com/moderna-roadrunner-kedi-ve-kucuk-irk-kopek-tasima-cantasi-gri-56x37x35-cm-1045788-87-O.jpg" },
    { name: "Ferplast Atlas 20 Kedi ve Köpekler İçin Taşıma Çantası Mavi 37x58x32 cm", price: 1390, originalPrice: 2250, img: "https://www.mamatoptancisi.com/ferplast-atlas-20-kedi-ve-kopekler-icin-tasima-cantasi-mavi-37x58x32-cm-1044968-10-O.jpg" },
    { name: "Skudo Iata 3 Kedi Köpek Taşıma Kafesi 60 cm", price: 1614, originalPrice: 2000, img: "https://www.mamatoptancisi.com/skudo-iata-3-kedi-kopek-tasima-kafesi-60-cm-1075555-10-O.jpg", stock: 0 },
    { name: "Skudo Iata 5 Kedi Köpek Taşıma Kafesinin Uçuş Seti", price: 1716, originalPrice: 2200, img: "https://www.mamatoptancisi.com/skudo-iata-5-kedi-kopek-tasima-kafesinin-ucus-seti-1075565-10-O.jpg", stock: 0 },
    { name: "Skudo Iata 4 Kedi Köpek Taşıma Kafesinin Uçuş Seti", price: 1747, originalPrice: 2200, img: "https://www.mamatoptancisi.com/skudo-iata-4-kedi-kopek-tasima-kafesinin-ucus-seti-1075562-10-O.jpg", stock: 0 },
    { name: "Beeztees Kedi Taşıma Kabı 8Kg Koyu Gri/Gri 55x36x35 cm", price: 2278, originalPrice: 3961, img: "https://www.mamatoptancisi.com/beeztees-kopek-veya-kedi-tasima-kabi-8kgye-kadar-koyu-grigri-55x36x35cm-935794-78-O.jpg", stock: 0 },
    { name: "Beeztees Kedi Taşıma Kabı Çift Girişli Gri/Beyaz 55x35x34 cm", price: 2337, originalPrice: 4065, img: "https://www.mamatoptancisi.com/beeztees-kopek-veya-kedi-tasima-kabi-cift-girisli-gribeyaz-55x35x34cm-935793-78-O.jpg", stock: 0 },
    { name: "Skudo Iata 3 Tuvaletli Kedi Köpek Seyahat Kafesi 60 cm", price: 2497, originalPrice: 3800, img: "https://www.mamatoptancisi.com/skudo-iata-3-kedi-kopek-seyahat-kafesi-60-cm-tuvaletli-1075559-10-O.jpg", stock: 0 },
    { name: "Beeztees Kedi Taşıma Çantası 5Kg Antrasit 40x20x29 cm", price: 2722, originalPrice: 4734, img: "https://www.mamatoptancisi.com/beeztees-kopek-veya-kedi-tasima-cantasi-5kgye-kadar-antrasit-40x20x29cm-1060708-73-O.jpg", stock: 0 },
    { name: "Beeztees Kedi Taşıma Kabı 12Kg Koyu Gri/Gri 61x40x38 cm", price: 2725, originalPrice: 4739, img: "https://www.mamatoptancisi.com/beeztees-kopek-veya-kedi-tasima-kabi-12kgye-kadar-koyu-grigri-61x40x38cm-994724-78-O.jpg", stock: 0 },
    { name: "Ferplast Voyager 400 Kedi ve Köpek Kumaş Taşıma Çantası Gri 33x23x41 cm", price: 2777, originalPrice: 3999, stock: 0 },
    { name: "Ferplast Voyager 350 Kedi ve Köpek Kumaş Taşıma Çantası Gri 45x30x33 cm", price: 2936, originalPrice: 4299, stock: 0 },
    { name: "Ferplast Voyager 450 Kedi ve Köpek Kumaş Taşıma Çantası Siyah 55x33x37 cm", price: 3092, originalPrice: 4499, stock: 0 },
    { name: "Skudo Iata 4 Kedi Köpek Taşıma Kafesi 68 cm", price: 3410, originalPrice: 4900, img: "https://www.mamatoptancisi.com/skudo-iata-4-kedi-kopek-tasima-kafesi-68-cm-1075557-10-O.jpg", stock: 0 },
    { name: "Ferplast Trolley Tekerlekli Sırt Taşıma Çantası 32x28x51 cm", price: 4120, originalPrice: 5499, stock: 0 },
    { name: "Skudo Iata 5 Kedi Köpek Taşıma Kafesi 79 cm", price: 4864, originalPrice: 8000, img: "https://www.mamatoptancisi.com/skudo-iata-5-kedi-kopek-tasima-kafesi-79-cm-1075560-10-O.jpg", stock: 0 },
    { name: "Ferplast Voyager 450 Kedi ve Köpek Tekerlekli Taşıma Çantası Siyah 46x26x48 cm", price: 5655, originalPrice: 7599, stock: 0 },
  ],
};

const KEDI_KONSERVE_DATA: BrandProductData = {
  brandName: "Kedi Konserve",
  brandSlug: "kedi-konserve",
  animal: "kedi",
  subcategory: "kedi-konserve",
  products: [
    { name: "Royal Canin Sensory Smell Gravy Balıklı Yetişkin Kedi Konservesi 85 gr", price: 58, originalPrice: 80, img: "https://www.mamatoptancisi.com/royal-canin-sensory-smell-gravy-balikli-yetiskin-kedi-konservesi-85-gr-1024698-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Ton Balıklı Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-ton-balikli-yetiskin-kedi-konservesi-70-gr-1050272-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Ton Balıklı ve Kalamarlı Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-ton-balikli-ve-kalamarli-yetiskin-kedi-konservesi-70-gr-1050269-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Ton Balıklı ve Somonlu Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-ton-balikli-ve-somonlu-yetiskin-kedi-konservesi-70-gr-1050270-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Ton Balıklı ve Midyeli Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-ton-balikli-ve-midyeli-yetiskin-kedi-konservesi-70-gr-1050271-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Tavuk Göğüslü Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-tavuk-goguslu-yetiskin-kedi-konservesi-70-gr-1050268-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Tavuk Göğsü ve Karidesli Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-tavuk-gogsu-ve-karidesli-yetiskin-kedi-konservesi-70-gr-1050267-10-O.jpg" },
    { name: "Supreme Cat Purrfect Tiftiklenmiş Tavuk Göğsü ve Somonlu Kedi Konservesi 70 gr", price: 61, originalPrice: 79, img: "https://www.mamatoptancisi.com/supreme-cat-purrfect-tiftiklenmis-tavuk-gogsu-ve-somonlu-yetiskin-kedi-konservesi-70-gr-1058831-10-O.jpg" },
    { name: "Schesir Pouch Jöle İçinde Tavuk Filetolu Kedi Konservesi 85 gr", price: 109, originalPrice: 159, img: "https://www.mamatoptancisi.com/schesir-pouch-jole-icinde-tavuk-filetolu-yetiskin-kedi-konservesi-85-gr-1065641-99-O.jpg" },
    { name: "Schesir Jöle İçinde Ton Balığı ile Çipuralı Kedi Konservesi 6x50 gr", price: 518, originalPrice: 999, img: "https://www.mamatoptancisi.com/schesir-jole-icinde-ton-baligi-ve-cipurali-yetiskin-kedi-konservesi-6-x-50-gr-1035653-99-O.jpg" },
    { name: "Schesir Jöle İçinde Ton Balığı ile Levrekli Kedi Konservesi 6x50 gr", price: 518, originalPrice: 999, img: "https://www.mamatoptancisi.com/schesir-jole-icinde-ton-baligi-ve-levrekli-yetiskin-kedi-konservesi-6-x-50-gr-1035654-99-O.jpg" },
    { name: "Schesir Jöle İçinde Ton Balığı ve Tavuklu Kedi Konservesi 6x50 gr", price: 518, originalPrice: 999, img: "https://www.mamatoptancisi.com/schesir-jole-icinde-ton-baligi-ve-tavuklu-yetiskin-kedi-konservesi-6-x-50-gr-1035655-99-O.jpg" },
    { name: "Schesir Pişirme Suyunda Ton Balıklı Kedi Konservesi 6x50 gr", price: 557, originalPrice: 999, img: "https://www.mamatoptancisi.com/schesir-pisirme-suyunda-ton-balikli-yetiskin-kedi-konservesi-6-x-50-gr-1035656-99-O.jpg" },
    { name: "Felix Jöle İçinde Sığır Etli Kedi Konservesi 85 gr X 26 Adet", price: 552, originalPrice: 1000, img: "https://www.mamatoptancisi.com/felix-jole-icinde-sigir-etli-yetiskin-kedi-konservesi-85-gr-x-26-adet-1069678-99-O.jpg" },
    { name: "Gourmet Gold Parça Etli ve Soslu Somon Tavuk Kedi Konservesi 85 gr 24 Adet", price: 777, originalPrice: 1800, img: "https://www.mamatoptancisi.com/gourmet-gold-parca-etli-ve-soslu-somon-tavuk-kedi-konservesi-85-gr-24-adet-1059374-10-O.jpg" },
    { name: "Gourmet Gold Parça Sığır Etli Soslu Kedi Konservesi 85 gr 24 Adet", price: 999, originalPrice: 1500, img: "https://www.mamatoptancisi.com/gourmet-gold-parca-sigir-etli-soslu-yetiskin-kedi-konservesi-85-gr-x-24-adet-1059375-10-O.jpg" },
  ],
};

const BRIT_CARE_KOPEK: BrandProductData = {
  brandName: "Brit Care",
  brandSlug: "brit-care",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Brit Care Hipoalerjenik Kuzulu Küçük Irk Yetişkin Köpek Maması 3 kg", price: 1127, originalPrice: 1385, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-hipoalerjenik-kuzulu-kucuk-irk-yetiskin-kopek-mamasi-3-kg-1077084-98-O.jpg", stock: 10 },
    { name: "Brit Care Hipoalerjenik Weight Loss Tavşan Etli Diyet Köpek Maması 3 kg", price: 1088, originalPrice: 1430, skt: "11.2026", img: "https://www.mamatoptancisi.com/brit-care-hipoalerjenik-weight-loss-tavsan-etli-kilo-dengeleyici-diyet-yetiskin-kopek-mamasi-3-kg-1066455-98-O.jpg", stock: 10 },
    { name: "Brit Care Hipoallerjenik Kuzu Etli Yetişkin Köpek Maması 12 kg", price: 3612, originalPrice: 4015, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-care-hipoallerjenik-kuzu-etli-yetiskin-kopek-mamasi-12-kg-1066470-98-O.jpg", stock: 10 },
    { name: "Brit Premium Sensitive Kuzu Etli Yetişkin Köpek Maması 15+3 Kg", price: 3347, originalPrice: 3999, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-premium-by-nature-sensitive-kuzu-etli-ve-pirincli-yetiskin-kopek-mamasi-15-kg-3-kg-hediyeli-1062917-95-O.jpg", stock: 10 },
    { name: "Brit Care Mini Light Kısırlaştırılmış Tahılsız Köpek Maması 2 kg", price: 1084, originalPrice: 1650, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-mini-light-sterilised-kilolu-kisirlastirilmis-kopekler-icin-tahilsiz-hipoalerjenik-kopek-mamasi-2-kg-1066449-98-O.jpg", stock: 10 },
    { name: "Brit Care Mini Sensitive Geyik Etli Yetişkin Köpek Maması 2 kg", price: 1074, originalPrice: 1155, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-mini-sensitive-geyik-etli-yetiskin-kopek-mamasi-2-kg-1066451-98-O.jpg", stock: 10 },
    { name: "Brit Premium Sensitive Kuzu Etli Pirinçli Yetişkin Köpek Maması 15 kg", price: 3441, originalPrice: 3575, skt: "01.2027", img: "https://www.mamatoptancisi.com/brit-premium-by-nature-sensitive-kuzu-etli-pirincli-yetiskin-kopek-mamasi-15-kg-1033085-98-O.jpg", stock: 10 },
    { name: "Brit Premium Nature Tavuklu Orta Irk Yetişkin Köpek Maması 15 kg", price: 2151, originalPrice: 2530, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-by-nature-adult-m-tavuklu-orta-irk-yetiskin-kopek-mamasi-15-kg-1033083-98-O.jpg", stock: 10 },
    { name: "Brit Care Hipoalerjenik Kuzu Etli Yaşlı Köpek Maması 12 kg", price: 3488, originalPrice: 4180, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-hipoalerjenik-kuzu-etli-yasli-kopek-mamasi-12kg-1066473-98-O.jpg", stock: 10 },
    { name: "Brit Care Hipoalerjenik Kuzu Etli Yaşlı Köpek Maması 3 kg", price: 1162, originalPrice: 1348, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-care-hipoalerjenik-kuzu-etli-yasli-kopek-mamasi-3kg-1066472-98-O.jpg", stock: 10 },
    { name: "Brit Care Sensitive Geyikli Patatesli Tahılsız Köpek Maması 3 kg", price: 1320, originalPrice: 1650, skt: "04.2027", img: "https://www.mamatoptancisi.com/brit-care-sensitive-geyikli-ve-patatesli-tahilsiz-kopek-mamasi-3kg-1066461-98-O.jpg", stock: 10 },
    { name: "Brit Care Skin & Coat Tahılsız Somonlu Yavru Köpek Maması 12 kg", price: 3786, originalPrice: 4510, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-skin-coat-tahilisz-somonlu-yavru-kopek-mamasi-12-kg-1074221-89-O.jpg", stock: 10 },
    { name: "Brit Care Skin & Coat Tahılsız Somonlu Orta Irk Yetişkin Köpek Maması 12 kg", price: 3544, originalPrice: 4235, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-skin-coat-tahilsiz-somonlu-orta-irk-yetiskin-kopek-mamasi-12-kg-1066465-98-O.jpg", stock: 10 },
    { name: "Brit Care Skin & Coat Tahılsız Büyük Irk Yavru Köpek Maması 12 kg", price: 3436, originalPrice: 4400, skt: "02.2027", img: "https://www.mamatoptancisi.com/brit-care-skin-coat-tahilsiz-buyuk-irk-yavru-kopek-mamasi-12-kg-1066459-98-O.jpg", stock: 10 },
    { name: "Brit Care Champion Somonlu Ringa Balıklı Yetişkin Köpek Maması 3 kg", price: 1070, originalPrice: 1375, skt: "10.2026", img: "https://www.mamatoptancisi.com/brit-care-champion-hipoallerjenic-calisan-kopek-mamasi-3-kg-1066453-98-O.jpg", stock: 10 },
    { name: "Brit Care Tahılsız Somonlu Yaşlı Köpek Maması 3 kg", price: 1163, originalPrice: 1293, skt: "03.2027", img: "https://www.mamatoptancisi.com/brit-care-tahilsiz-somonlu-hassas-deri-yapisina-sahip-yasli-kopek-mamasi-3-kg-1066476-98-O.jpg", stock: 10 },
    { name: "Brit Care Skin & Coat Tahılsız Somonlu Orta Irk Yetişkin Köpek Maması 3 kg", price: 1131, originalPrice: 1293, skt: "10.2026", img: "https://www.mamatoptancisi.com/brit-care-skin-coat-adult-tahilsiz-somonlu-orta-irk-yetiskin-kopek-mamasi-3-kg-1066464-98-O.jpg", stock: 10 },
  ],
};

const ECONATURE_KOPEK: BrandProductData = {
  brandName: "Econature",
  brandSlug: "econature",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Econature Plus Kuzu Etli Yetişkin Köpek Maması 13+2 Kg", price: 981, originalPrice: 1499, skt: "08.2026", img: "https://www.mamatoptancisi.com/econature-plus-kuzu-etli-yetiskin-kopek-mamasi-13-kg-2-kg-bonus-paket-1066089-67-O.jpg", stock: 10 },
    { name: "Econature Kuzu Etli Yavru Köpek Maması 13+2 Kg", price: 1193, originalPrice: 1540, skt: "08.2026", img: "https://www.mamatoptancisi.com/econature-fish-formula-gurme-yavru-kopek-mamasi-15-kg-1073071-59-O.jpg", stock: 10 },
    { name: "Econature Plus Somonlu Yetişkin Köpek Maması 15 kg", price: 1184, originalPrice: 1671, skt: "05.2027", img: "https://www.mamatoptancisi.com/econature-somonlu-yetiskin-kopek-mamasi-15-kg-1044399-59-O.jpg", stock: 10 },
    { name: "Econature Lamb Formula Kuzu Etli Yetişkin Köpek Maması 15 kg", price: 565, originalPrice: 1650, skt: "04.2027", img: "https://www.mamatoptancisi.com/econature-lamb-formula-kuzu-etli-yetiskin-kopek-mamasi-15-kg-1077756-59-O.jpg", stock: 10 },
  ],
};

const ENJOY_KOPEK: BrandProductData = {
  brandName: "Enjoy",
  brandSlug: "enjoy",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Enjoy Biftekli Yetişkin Köpek Maması 15 kg", price: 606, originalPrice: 999, skt: "02.2027", img: "https://www.mamatoptancisi.com/enjoy-biftekli-yetiskin-kopek-mamasi-15-kg-1044535-92-O.jpg", stock: 0 },
  ],
};

const KOPEK_ACIK_MAMA_PROPLAN: BrandProductData = {
  brandName: "Pro Plan",
  brandSlug: "pro-plan",
  animal: "kopek",
  subcategory: "acik-mama",
  products: [
    { name: "Pro Plan Yetişkin Köpek Tavuklu Açık Mama 1 KG", price: 189, originalPrice: 250, img: "https://www.mamatoptancisi.com/pro-plan-yetiskin-kopek-tavuklu-acik-mama-1-kg-1060001-10-O.jpg", stock: 10 },
    { name: "Pro Plan Yavru Köpek Tavuklu Açık Mama 1 KG", price: 199, originalPrice: 265, img: "https://www.mamatoptancisi.com/pro-plan-yavru-kopek-tavuklu-acik-mama-1-kg-1060002-10-O.jpg", stock: 10 },
    { name: "Pro Plan Hassas Sindirimli Köpek Kuzulu Açık Mama 1 KG", price: 209, originalPrice: 280, img: "https://www.mamatoptancisi.com/pro-plan-hassas-sindirimli-kopek-kuzulu-acik-mama-1-kg-1060003-10-O.jpg", stock: 10 },
  ],
};

const KOPEK_ACIK_MAMA_HILLS: BrandProductData = {
  brandName: "Hill's",
  brandSlug: "hills",
  animal: "kopek",
  subcategory: "acik-mama",
  products: [
    { name: "Hill's Science Plan Yetişkin Köpek Tavuklu Açık Mama 1 KG", price: 219, originalPrice: 300, img: "https://www.mamatoptancisi.com/hills-yetiskin-kopek-tavuklu-acik-mama-1-kg-1060004-10-O.jpg", stock: 10 },
    { name: "Hill's Science Plan Yavru Köpek Tavuklu Açık Mama 1 KG", price: 229, originalPrice: 310, img: "https://www.mamatoptancisi.com/hills-yavru-kopek-tavuklu-acik-mama-1-kg-1060005-10-O.jpg", stock: 10 },
    { name: "Hill's Science Plan Küçük Irk Köpek Tavuklu Açık Mama 1 KG", price: 239, originalPrice: 320, img: "https://www.mamatoptancisi.com/hills-kucuk-irk-kopek-tavuklu-acik-mama-1-kg-1060006-10-O.jpg", stock: 10 },
  ],
};

const KOPEK_ACIK_MAMA_ROYALCANIN: BrandProductData = {
  brandName: "Royal Canin",
  brandSlug: "royal-canin",
  animal: "kopek",
  subcategory: "acik-mama",
  products: [
    { name: "Royal Canin Maxi Adult Yetişkin Köpek Açık Mama 1 KG", price: 199, originalPrice: 270, img: "https://www.mamatoptancisi.com/royal-canin-maxi-adult-kopek-acik-mama-1-kg-1060007-10-O.jpg", stock: 10 },
    { name: "Royal Canin Mini Adult Yetişkin Köpek Açık Mama 1 KG", price: 209, originalPrice: 285, img: "https://www.mamatoptancisi.com/royal-canin-mini-adult-kopek-acik-mama-1-kg-1060008-10-O.jpg", stock: 10 },
    { name: "Royal Canin Medium Puppy Yavru Köpek Açık Mama 1 KG", price: 219, originalPrice: 295, img: "https://www.mamatoptancisi.com/royal-canin-medium-puppy-kopek-acik-mama-1-kg-1060009-10-O.jpg", stock: 10 },
  ],
};

const KOPEK_ACIK_MAMA_REFLEX: BrandProductData = {
  brandName: "Reflex",
  brandSlug: "reflex",
  animal: "kopek",
  subcategory: "acik-mama",
  products: [
    { name: "Reflex Yetişkin Köpek Kuzulu Açık Mama 1 KG", price: 99, originalPrice: 140, img: "https://www.mamatoptancisi.com/reflex-yetiskin-kopek-kuzulu-acik-mama-1-kg-1060010-10-O.jpg", stock: 10 },
    { name: "Reflex Yavru Köpek Tavuklu Açık Mama 1 KG", price: 109, originalPrice: 150, img: "https://www.mamatoptancisi.com/reflex-yavru-kopek-tavuklu-acik-mama-1-kg-1060011-10-O.jpg", stock: 10 },
    { name: "Reflex Yetişkin Köpek Somonlu Açık Mama 1 KG", price: 109, originalPrice: 145, img: "https://www.mamatoptancisi.com/reflex-yetiskin-kopek-somonlu-acik-mama-1-kg-1060012-10-O.jpg", stock: 10 },
  ],
};

const ALL_BRAND_DATA = [...SEED_BRAND_DATA, ...EXTRA_BRAND_DATA, KEDI_KUMU_DATA, YAS_MAMA_DATA, MALT_MACUN_DATA, ODUL_DATA, BAKIM_SAGLIK_DATA, KEDI_TUVALETI_DATA, KEDI_TASIMA_DATA, KEDI_KONSERVE_DATA, BRIT_CARE_KOPEK, ECONATURE_KOPEK, ENJOY_KOPEK, KOPEK_ACIK_MAMA_PROPLAN, KOPEK_ACIK_MAMA_HILLS, KOPEK_ACIK_MAMA_ROYALCANIN, KOPEK_ACIK_MAMA_REFLEX];

export async function seedDatabase() {
  console.log("Checking database for missing brand data...");

  for (const brand of ALL_BRAND_DATA) {
    const existing = await db.select().from(brandCategories).where(
      and(
        eq(brandCategories.brandSlug, brand.brandSlug),
        eq(brandCategories.animal, brand.animal),
        eq(brandCategories.subcategory, brand.subcategory)
      )
    );

    if (existing.length > 0) {
      console.log(`Brand ${brand.brandName} (${brand.animal}/${brand.subcategory}) already exists, skipping...`);
      continue;
    }

    const [category] = await db.insert(brandCategories).values({
      brandName: brand.brandName,
      brandSlug: brand.brandSlug,
      animal: brand.animal,
      subcategory: brand.subcategory,
    }).returning();

    for (const product of brand.products) {
      await db.insert(products).values({
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        skt: product.skt,
        img: product.img,
        stock: product.stock !== undefined ? product.stock : 10,
        brandCategoryId: category.id,
      });
    }

    console.log(`Seeded ${brand.products.length} products for ${brand.brandName} (${brand.animal}/${brand.subcategory})`);
  }

  await seedBreedStats();
  console.log("Database seeding complete!");
}

const KEDI_BREEDS = [
  { name: "Tekir Kedi", color: "#FF6B35" },
  { name: "British Shorthair", color: "#4A90D9" },
  { name: "Scottish Fold", color: "#7B68EE" },
  { name: "Sarman", color: "#FFA726" },
  { name: "İran (Persian)", color: "#E91E63" },
  { name: "Ankara Kedisi", color: "#26A69A" },
  { name: "Ragdoll", color: "#AB47BC" },
  { name: "Maine Coon", color: "#8D6E63" },
  { name: "Siyam", color: "#42A5F5" },
  { name: "Van Kedisi", color: "#EF5350" },
  { name: "Tuxedo (Smokin) Kedi", color: "#78909C" },
  { name: "Bombay", color: "#333333" },
  { name: "Diğer", color: "#9E9E9E" },
];

const KOPEK_BREEDS = [
  { name: "Golden Retriever", color: "#FFB300" },
  { name: "Labrador", color: "#795548" },
  { name: "Alman Çoban", color: "#424242" },
  { name: "French Bulldog", color: "#E91E63" },
  { name: "Poodle", color: "#7B68EE" },
  { name: "Beagle", color: "#4CAF50" },
  { name: "Husky", color: "#90A4AE" },
  { name: "Border Collie", color: "#FF7043" },
  { name: "Yorkshire Terrier", color: "#AB47BC" },
  { name: "Cocker Spaniel", color: "#26A69A" },
  { name: "Kangal", color: "#D84315" },
  { name: "Diğer", color: "#9E9E9E" },
];

function getBreedDistribution(productName: string, isKopek: boolean): { breedIndex: number; pct: number }[] {
  const name = productName.toLowerCase();
  const breeds = isKopek ? KOPEK_BREEDS : KEDI_BREEDS;
  const total = breeds.length;
  let topIndices: number[];

  if (name.includes("yavru") || name.includes("kitten") || name.includes("puppy")) {
    topIndices = isKopek ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 3, 2, 6, 7, 4];
  } else if (name.includes("kısır") || name.includes("sterilised") || name.includes("kisirlast")) {
    topIndices = isKopek ? [3, 4, 1, 0, 2, 5, 6] : [0, 2, 1, 3, 4, 6, 5];
  } else if (name.includes("hassas") || name.includes("sensitive") || name.includes("delicate")) {
    topIndices = isKopek ? [4, 8, 9, 0, 1, 5, 6] : [4, 8, 6, 0, 1, 2, 3];
  } else if (name.includes("yaşlı") || name.includes("senior") || name.includes("ageing") || name.includes("mature")) {
    topIndices = isKopek ? [0, 1, 2, 4, 9, 5, 3] : [4, 1, 7, 0, 2, 3, 5];
  } else {
    topIndices = isKopek ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 6, 5];
  }

  const hash = productName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const numBreeds = 6 + (hash % 3);
  const selected = topIndices.slice(0, Math.min(numBreeds, topIndices.length));

  const basePcts = [28, 23, 18, 12, 8, 6, 5];
  let result: { breedIndex: number; pct: number }[] = [];
  let sum = 0;

  for (let i = 0; i < selected.length; i++) {
    const variation = ((hash + i * 7) % 5) - 2;
    const pct = Math.max(3, (basePcts[i] || 4) + variation);
    result.push({ breedIndex: selected[i], pct });
    sum += pct;
  }

  const diff = 100 - sum;
  result[0].pct += diff;

  return result;
}

async function seedBreedStats() {
  const existingCount = await db.select({ count: sql<number>`count(*)` }).from(breedStats);
  if (Number(existingCount[0].count) > 0) {
    console.log("Breed stats already exist, skipping...");
    return;
  }

  console.log("Seeding breed stats for all mama products...");

  const allProducts = await db.select().from(products);
  const allCategories = await db.select().from(brandCategories);
  const catMap = new Map(allCategories.map(c => [c.id, c]));

  let count = 0;
  for (const product of allProducts) {
    const cat = catMap.get(product.brandCategoryId);
    if (!cat) continue;

    const isKedi = cat.animal === "kedi" && (cat.subcategory === "kedi-mamasi" || cat.subcategory === "acik-mama");
    const isKopek = cat.animal === "kopek" && (cat.subcategory === "mama-markalari" || cat.subcategory === "kopek-mamasi" || cat.subcategory === "acik-mama");
    if (!isKedi && !isKopek) continue;

    const breeds = isKopek ? KOPEK_BREEDS : KEDI_BREEDS;
    const distribution = getBreedDistribution(product.name, isKopek);

    for (let i = 0; i < distribution.length; i++) {
      const d = distribution[i];
      await db.insert(breedStats).values({
        productId: product.id,
        breedName: breeds[d.breedIndex].name,
        percentage: d.pct,
        color: breeds[d.breedIndex].color,
        sortOrder: i + 1,
      });
      count++;
    }
  }

  console.log(`Seeded ${count} breed stats across mama products.`);
}
