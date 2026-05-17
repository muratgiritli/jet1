import { db, pool } from "./storage";
import { brandCategories, products, breedStats, crossSellSections, crossSellItems, subcategories, deliveryNeighborhoods } from "@shared/schema";
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

const FELICIA_KOPEK: BrandProductData = {
  brandName: "Felicia",
  brandSlug: "felicia",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Felicia Kuzu Etli Küçük Irk Yavru ve Hamile Köpek Maması 2X3 Kg", price: 1015, originalPrice: 1650, skt: "01.2027", img: "https://www.mamatoptancisi.com/felicia-kuzu-etli-kucuk-irk-yavru-ve-hamile-kopek-mamasi-6-kg-1044683-12-O.jpg", stock: 10 },
    { name: "Felicia Mini Somonlu Düşük Tahıllı Hipoalerjenik Köpek Maması 3 kg", price: 586, originalPrice: 715, skt: "02.2027", img: "https://www.mamatoptancisi.com/felicia-mini-somonlu-dusuk-tahilli-hipoalerjenik-kopek-mamasi-3-kg-1044676-12-O.jpg", stock: 10 },
    { name: "Felicia Kuzulu Pirinçli Düşük Tahıllı Hipoalerjenik Köpek Maması 15 kg", price: 2715, originalPrice: 3500, skt: "11.2027", img: "https://www.mamatoptancisi.com/felicia-kuzulu-pirincli-dusuk-tahilli-hipoalerjenik-kopek-mamasi-15-kg-1044639-10-O.jpg", stock: 10 },
    { name: "Felicia Somon Balıklı Düşük Tahıllı Hipoalerjenik Yetişkin Köpek Maması 15 kg", price: 2715, originalPrice: 3190, skt: "01.2027", img: "https://www.mamatoptancisi.com/felicia-somon-balikli-dusuk-tahilli-hipoalerjenik-yetiskin-kopek-mamasi-15-kg-1044627-98-O.jpg", stock: 10 },
    { name: "Felicia Kuzulu Küçük Irk Düşük Tahıllı Köpek Maması 6 kg (2X3 Kg)", price: 1072, originalPrice: 1750, skt: "03.2027", img: "https://www.mamatoptancisi.com/felicia-kuzulu-kucuk-irk-dusuk-tahilli-kopek-mamasi-6-kg-1056887-95-O.jpg", stock: 10 },
    { name: "Felicia Mini Somonlu Düşük Tahıllı Hipoalerjenik Köpek Maması 6 kg (3X2 Kg)", price: 1072, originalPrice: 1750, skt: "03.2027", img: "https://www.mamatoptancisi.com/felicia-mini-somonlu-dusuk-tahilli-hipoalerjenik-kopek-mamasi-6-kg-1057405-95-O.jpg", stock: 10 },
    { name: "Felicia Kuzu Etli Küçük Irk Yavru ve Hamile Köpek Maması 3 kg", price: 650, originalPrice: 825, skt: "03.2027", img: "https://www.mamatoptancisi.com/felicia-kuzu-etli-kucuk-irk-yavru-ve-hamile-kopek-mamasi-3-kg-1044623-95-O.jpg", stock: 10 },
    { name: "Felicia Kuzulu Pirinçli Yetişkin Düşük Tahıllı Hipoalerjenik Köpek Maması 3 kg", price: 591, originalPrice: 950, skt: "01.2027", img: "https://www.mamatoptancisi.com/felicia-kuzulu-pirincli-yetiskin-dusuk-tahilli-hipoalerjenik-kopek-mamasi-3-kg-1024987-95-O.jpg", stock: 10 },
    { name: "Felicia Kuzulu Küçük ve Orta Irk Düşük Tahıllı Köpek Maması 3 kg", price: 588, originalPrice: 935, skt: "03.2027", img: "https://www.mamatoptancisi.com/felicia-kuzulu-kucuk-ve-orta-irk-dusuk-tahilli-kopek-mamasi-3-kg-1070343-12-O.jpg", stock: 0 },
    { name: "Felicia Kuzulu Yavru Köpek Maması Orta ve Büyük Irk İçin 3 kg", price: 474, originalPrice: 825, skt: "09.2026", img: "https://www.mamatoptancisi.com/felicia-kuzulu-yavru-kopek-mamasi-orta-ve-buyuk-irk-icin-3-kg-1058119-95-O.jpg", stock: 0 },
    { name: "Felicia Somon Balıklı Düşük Tahıllı Hipoalerjenik Köpek Maması 3 kg", price: 469, originalPrice: 715, skt: "06.2026", img: "https://www.mamatoptancisi.com/felicia-somon-balikli-dusuk-tahilli-hipoalerjenik-kopek-mamasi-3-kg-1054620-95-O.jpg", stock: 0 },
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

const LAVITAL_KOPEK: BrandProductData = {
  brandName: "LaVital",
  brandSlug: "lavital",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "LaVital Mini Puppy Kuzulu Küçük Irk Yavru Köpek Maması 6+1 Kg", price: 894.83, originalPrice: 1299, skt: "02.2027", img: "https://www.mamatoptancisi.com/lavital-mini-puppy-kuzulu-kucuk-irk-yavru-kopek-mamasi-61-kg-1068247-91-O.jpg", stock: 10 },
    { name: "LaVital Kuzu Etli Küçük Irk Yetişkin Köpek Maması 2 kg", price: 298.14, originalPrice: 408, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-kuzu-etli-kucuk-irk-yetiskin-kopek-mamasi-2-kg-1052000-60-O.jpg", stock: 10 },
    { name: "LaVital Somonlu Küçük Irk Yetişkin Köpek Maması 2 kg", price: 349.35, originalPrice: 425, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-somonlu-kucuk-irk-yetiskin-kopek-mamasi-2-kg-1073795-60-O.jpg", stock: 10 },
    { name: "LaVital Kuzu Etli Küçük Irk Yetişkin Köpek Maması 7 kg", price: 839.55, originalPrice: 1143, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-kuzu-etli-kucuk-irk-yetiskin-kopek-mamasi-7-kg-1072610-60-O.jpg", stock: 10 },
    { name: "LaVital Somonlu Küçük Irk Yetişkin Köpek Maması 7 kg", price: 923.53, originalPrice: 1210, skt: "05.2027", img: "https://www.mamatoptancisi.com/lavital-somonlu-kucuk-irk-yetiskin-kopek-mamasi-7-kg-1072613-60-O.jpg", stock: 10 },
    { name: "LaVital Kuzu Etli Orta Irk Yetişkin Köpek Maması 3 kg", price: 475.19, originalPrice: 605, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-kuzu-etli-orta-irk-yetiskin-kopek-mamasi-3-kg-1052007-60-O.jpg", stock: 10 },
    { name: "LaVital Kuzu Etli Orta Irk Yetişkin Köpek Maması 12 kg", price: 1356.64, originalPrice: 1760, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-kuzu-etli-orta-irk-yetiskin-kopek-mamasi-12-kg-1072619-60-O.jpg", stock: 10 },
    { name: "LaVital Somonlu Orta Irk Yetişkin Köpek Maması 12 kg", price: 1396.48, originalPrice: 1815, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-somonlu-orta-irk-yetiskin-kopek-mamasi-12-kg-1072622-60-O.jpg", stock: 10 },
    { name: "LaVital Kuzu Etli Büyük Irk Yetişkin Köpek Maması 15 kg", price: 1474.19, originalPrice: 1859, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-kuzu-etli-buyuk-irk-yetiskin-kopek-mamasi-15-kg-1072627-60-O.jpg", stock: 10 },
    { name: "LaVital Somonlu Büyük Irk Yetişkin Köpek Maması 15 kg", price: 1570.33, originalPrice: 2126, skt: "06.2027", img: "https://www.mamatoptancisi.com/lavital-somonlu-buyuk-irk-yetiskin-kopek-mamasi-15-kg-1072628-60-O.jpg", stock: 10 },
  ],
};

const PROCHOICE_KOPEK: BrandProductData = {
  brandName: "ProChoice",
  brandSlug: "prochoice",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Prochoice Proderma Kuzu Etli Yetişkin Köpek Maması 18 kg", price: 1965.01, originalPrice: 2200, skt: "06.2027", img: "https://www.mamatoptancisi.com/prochoice-proderma-kuzu-etli-yetiskin-kopek-mamasi-18-kg-1065597-23-O.jpg", stock: 10 },
    { name: "Prochoice Sardalyalı ve Hamsili Yetişkin Köpek Konservesi 400 gr X 6 Adet", price: 330, originalPrice: 450, skt: "09.2026", stock: 10 },
    { name: "Prochoice Sensitive Skin Hassas Balıklı Yetişkin Köpek Maması 12 kg", price: 1770.88, originalPrice: 2750, skt: "05.2026", stock: 0 },
    { name: "Prochoice Kuzu Etli Yetişkin Köpek Maması 12 kg", price: 1630.42, originalPrice: 2530, skt: "06.2026", stock: 0 },
    { name: "Prochoice Sensitive Balık Etli Yetişkin Köpek Maması 3 kg", price: 603.71, originalPrice: 999.90, skt: "02.2026", stock: 0 },
    { name: "Prochoice Fit & Healthy Kuzulu Yetişkin Köpek Maması 3 kg", price: 570.66, originalPrice: 836, skt: "02.2026", stock: 0 },
    { name: "Prochoice Kuzu Etli Yavru Köpek Maması 3 kg", price: 611.97, originalPrice: 880, skt: "02.2026", stock: 0 },
    { name: "Prochoice Kuzu Etli Yavru Köpek Maması 12 kg", price: 1812.19, originalPrice: 2805, skt: "02.2026", stock: 0 },
  ],
};

const PRONATURE_KOPEK: BrandProductData = {
  brandName: "Pronature",
  brandSlug: "pronature",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Pronature Mother & Baby Kuzu Etli Mini Irk Anne ve Bebek Köpek Maması 3 Kg", price: 505.84, originalPrice: 799, skt: "06.2026", stock: 10 },
    { name: "Pronature Mother&Baby Kuzu Etli Mini Irk Anne ve Yavru Köpek Maması 10+2 kg", price: 1473.84, originalPrice: 1760, skt: "09.2026", img: "https://www.mamatoptancisi.com/pronature-daily-puppy-kuzu-etli-ve-pirincli-yavru-kopek-mamasi-12-kg-1047397-40-O.jpg", stock: 10 },
    { name: "Pronature Kuzu Etli ve Pirinçli Orta ve Büyük Irk Yavru Köpek Maması 10+2 Kg", price: 1066.42, originalPrice: 1595, skt: "05.2027", stock: 10 },
    { name: "Pronature Kuzu Etli Pirinçli Yetişkin Köpek Maması 10+2 Kg", price: 966.20, originalPrice: 1870, skt: "04.2027", stock: 10 },
    { name: "Pronature Hypo-Allergenic Kuzu Etli Enginarlı Patatesli Tahılsız 10+2 kg", price: 1473.84, originalPrice: 2200, skt: "03.2027", stock: 10 },
    { name: "Pronature Daily Kuzu Etli Küçük Irk Yetişkin Köpek Maması 3 kg", price: 353.90, originalPrice: 483.25, skt: "11.2026", stock: 10 },
    { name: "Pronature Daily Kuzu Etli Küçük Irk Yavru Köpek Maması 3 kg", price: 374.85, originalPrice: 509.34, skt: "01.2027", stock: 10 },
    { name: "Pronature Derma Shine Somonlu Pirinçli Yetişkin 10+2 Kg", price: 1051.07, originalPrice: 1650, skt: "05.2027", stock: 0 },
  ],
};

const PROPERFORMANCE_KOPEK: BrandProductData = {
  brandName: "ProPerformance",
  brandSlug: "properformance",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Pro Performance Kuzu Etli Yavru Köpek Maması 18 kg", price: 2895.84, originalPrice: 2500, skt: "12.2026", img: "https://www.mamatoptancisi.com/pro-performance-kuzu-etli-yavru-kopek-mamasi-18-kg-1047466-60-O.jpg", stock: 10 },
    { name: "Pro Performance Premium Kuzulu ve Pirinçli Yetişkin 18 kg", price: 2537.26, originalPrice: 2999, skt: "12.2027", stock: 10 },
    { name: "Pro Performance Mini Irk Kuzulu ve Yaban Mersinli Yetişkin 2 Kg", price: 546.40, originalPrice: 699, skt: "05.2027", stock: 10 },
    { name: "Pro Performance Mini Irk Somonlu ve Yaban Mersinli Yetişkin 2 Kg", price: 592.20, originalPrice: 699, skt: "11.2026", stock: 10 },
    { name: "Pro Performance Light Mini Irk Kuzulu Diyet Kısırlaştırılmış 2 Kg", price: 556.64, originalPrice: 699, skt: "07.2026", stock: 10 },
    { name: "Pro Performance Mini Irk Kuzulu ve Yaban Mersinli Yavru 2 Kg", price: 534.51, originalPrice: 699, skt: "11.2026", stock: 10 },
    { name: "Pro Performance Mini Irk Kuzulu ve Yaban Mersinli Yavru 7 Kg", price: 1356.27, originalPrice: 1699, skt: "11.2026", stock: 10 },
    { name: "Pro Performance Mini Irk Somonlu ve Yaban Mersinli Yetişkin 7 Kg", price: 1538.47, originalPrice: 1699, skt: "11.2026", stock: 10 },
    { name: "Pro Performance Light Mini Irk Kuzulu Diyet Kısırlaştırılmış 7 Kg", price: 1553.37, originalPrice: 1699, skt: "01.2027", stock: 10 },
    { name: "Pro Performance Kuzulu ve Yaban Mersinli Küçük Irk Yetişkin 2 Kg", price: 515.68, originalPrice: 899, skt: "07.2026", stock: 10 },
    { name: "Pro Performance Ultra Premium Orta Büyük Somonlu Yetişkin 12 Kg", price: 1765.76, originalPrice: 2500, skt: "11.2027", stock: 10 },
    { name: "Pro Performance Ultra Premium Orta Büyük Somonlu Yavru 12 Kg", price: 2370.15, originalPrice: 2500, skt: "06.2026", stock: 0 },
    { name: "Pro Performance Ultra Premium Orta Büyük Kuzulu Yavru 12 Kg", price: 2120.21, originalPrice: 2500, skt: "12.2026", stock: 0 },
    { name: "Pro Performance Ultra Premium Kuzulu Küçük Irk Yavru 12 Kg", price: 2933.18, originalPrice: 2700, skt: "10.2027", stock: 0 },
  ],
};

const REFLEX_KOPEK: BrandProductData = {
  brandName: "Reflex",
  brandSlug: "reflex-mama",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Reflex Kuzu Etli Pirinçli ve Sebzeli Yetişkin Köpek Maması 15 Kg", price: 2020.18, originalPrice: 2499, skt: "03.2027", img: "https://www.mamatoptancisi.com/reflex-kuzu-etli-pirincli-ve-sebzeli-yetiskin-kopek-mamasi-15-kg-1052761-92-O.jpg", stock: 10 },
    { name: "Reflex Balıklı ve Pirinçli Yetişkin Köpek Maması 15 kg", price: 1872.74, originalPrice: 2090, skt: "02.2027", img: "https://www.mamatoptancisi.com/reflex-balikli-ve-pirincli-yetiskin-kopek-mamasi-15-kg-1047672-90-O.jpg", stock: 10 },
    { name: "Reflex Duo Protein Somonlu ve Kuzulu Orta ve Büyük Irk Yetişkin Köpek Maması 10 kg", price: 1194.21, originalPrice: 1699, skt: "05.2027", img: "https://www.mamatoptancisi.com/reflex-duo-protein-somonlu-ve-kuzulu-orta-ve-buyuk-irk-yetiskin-kopek-mamasi-10-kg-1060494-94-O.jpg", stock: 0 },
    { name: "Reflex Kuzu Etli ve Pirinçli Yetişkin Köpek Maması 15 kg", price: 1850.25, originalPrice: 2750, skt: "01.2027", img: "https://www.mamatoptancisi.com/reflex-kuzu-etli-ve-pirincli-yetiskin-kopek-mamasi-15-kg-1047675-49-O.jpg", stock: 0 },
    { name: "Reflex High Quality Biftekli ve Pirinçli Yavru Köpek Maması 15 kg", price: 1143, originalPrice: 1870, skt: "08.2025", img: "https://www.mamatoptancisi.com/reflex-high-quality-biftekli-ve-pirincli-yavru-kopek-mamasi-15-kg-1047678-11-O.jpg", stock: 0 },
    { name: "Reflex High Energy Biftekli Yetişkin Köpek Maması 15 kg", price: 1704.57, originalPrice: 1320, skt: "02.2027", img: "https://www.mamatoptancisi.com/reflex-high-energy-biftekli-yetiskin-kopek-mamasi-15-kg-1058170-11-O.jpg", stock: 0 },
    { name: "Reflex Kuzu Etli ve Pirinçli Yavru Köpek Maması 15 kg", price: 1207, originalPrice: 1870, skt: "03.2026", img: "https://www.mamatoptancisi.com/reflex-kuzu-etli-ve-pirincli-yavru-kopek-mamasi-15-kg-1076580-11-O.jpg", stock: 0 },
  ],
};

const REFLEX_PLUS_KOPEK: BrandProductData = {
  brandName: "Reflex Plus",
  brandSlug: "reflex-plus",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Reflex Plus Somonlu Hipoallerjenik Orta ve Büyük Irk Yetişkin Köpek Maması 12 Kg", price: 1529.38, originalPrice: 2500, skt: "02.2027", img: "https://www.mamatoptancisi.com/reflex-plus-somonlu-orta-ve-buyuk-irk-yetiskin-kopek-mamasi-12-kg-1073778-87-O.jpg", stock: 10 },
    { name: "Reflex Plus Somonlu Mini ve Küçük Irk Yetişkin Köpek Maması 8 kg", price: 1267.12, originalPrice: 1540, skt: "04.2027", img: "https://www.mamatoptancisi.com/reflex-plus-somonlu-mini-ve-kucuk-irk-yetiskin-kopek-mamasi-8-kg-1047727-16-O.jpg", stock: 10 },
    { name: "Reflex Plus Hipoalerjenik Labrador Retriever Özel Irk Yetişkin Köpek Maması 8 kg", price: 1990.29, originalPrice: 2499, skt: "04.2027", img: "https://www.mamatoptancisi.com/reflex-plus-hipoalerjenik-labrador-retriever-ozel-irk-yetiskin-kopek-mamasi-8-kg-1047879-97-O.jpg", stock: 10 },
    { name: "Reflex Plus Hipoalerjenik German Shepherd Özel Irk Yavru Köpek Maması 8 kg", price: 1990.29, originalPrice: 2499, skt: "03.2027", stock: 10 },
    { name: "Reflex Plus Hipoalerjenik Labrador Retriever Özel Irk Yavru Köpek Maması 8 kg", price: 1990.29, originalPrice: 2499, skt: "02.2027", stock: 10 },
    { name: "Reflex Plus Hipoalerjenik Golden Retriever Özel Irk Yavru Köpek Maması 8 kg", price: 1990.29, originalPrice: 2499, skt: "03.2027", stock: 10 },
    { name: "Reflex Plus German Shepherd Alman Kurdu Özel Irk Yetişkin Köpek Maması 8 Kg", price: 2045.57, originalPrice: 2599, skt: "04.2027", stock: 10 },
    { name: "Reflex Plus Golden Retriever Özel Irk Yetişkin Köpek Maması 8 kg", price: 2085.40, originalPrice: 2599, skt: "04.2027", stock: 10 },
    { name: "Reflex Plus High Energy Biftekli Yetişkin Köpek Maması 12 kg", price: 1806.43, originalPrice: 2500, skt: "02.2027", stock: 10 },
    { name: "Reflex Plus Hypoallergenic Kuzu Orta ve Büyük Irk Köpek Maması 12 Kg", price: 1467.62, originalPrice: 2500, skt: "11.2026", stock: 10 },
    { name: "Reflex Plus Kuzu & Pirinç Küçük Irk Yetişkin Köpek Maması 8 kg", price: 1267.12, originalPrice: 1649.89, skt: "05.2027", img: "https://www.mamatoptancisi.com/reflex-plus-kuzu-pirinc-kucuk-irk-yetiskin-kopek-mamasi-8-kg-1070345-16-O.jpg", stock: 0 },
    { name: "Reflex Plus Hypoallergenic Pomeranian Özel Irk Yetişkin Köpek Maması 2 kg", price: 452, originalPrice: 699, skt: "04.2026", stock: 0 },
    { name: "Reflex Plus Yorkshire Terrier Yavru Köpek Maması 1,5 kg", price: 407, originalPrice: 407, skt: "04.2026", stock: 0 },
    { name: "Reflex Plus Pomeranian Yavru Köpek Maması 1,5 kg", price: 407, originalPrice: 989.89, skt: "04.2026", stock: 0 },
    { name: "Reflex Plus Light Kuzulu Kısırlaştırılmış Yetişkin Köpek Maması 15 kg", price: 1633.35, originalPrice: 2300, skt: "11.2026", stock: 0 },
    { name: "Reflex Plus Kuzu Etli ve Pirinçli Büyük Irk Yetişkin Köpek Maması 18 kg", price: 2099.54, originalPrice: 2420, skt: "01.2027", stock: 0 },
    { name: "Reflex Plus High Energy Biftekli Yetişkin Köpek Maması 15 kg", price: 1276.90, originalPrice: 1869.89, skt: "05.2026", stock: 0 },
  ],
};

const WANPY_KOPEK: BrandProductData = {
  brandName: "Wanpy",
  brandSlug: "wanpy",
  animal: "kopek",
  subcategory: "mama-markalari",
  products: [
    { name: "Wanpy Sığır Etli Tahılsız Yetişkin Köpek Maması 12 kg", price: 3180, originalPrice: 3800, skt: "02.2027", stock: 10 },
    { name: "Wanpy Ördekli Tahılsız Yetişkin Köpek Maması 12 kg", price: 3180, originalPrice: 3900, skt: "02.2027", stock: 10 },
    { name: "Wanpy Sığır Etli Tahılsız Yetişkin Köpek Maması 1,5 kg", price: 649, originalPrice: 950, skt: "06.2026", stock: 10 },
    { name: "Wanpy Ördekli Tahılsız Yetişkin Köpek Maması 1,5 kg", price: 649, originalPrice: 950, skt: "06.2026", stock: 10 },
    { name: "Wanpy Tavuklu Tahılsız Yetişkin Köpek Maması 1,5 kg", price: 649, originalPrice: 950, skt: "06.2026", stock: 10 },
    { name: "Wanpy Tavuklu Tahılsız Yavru Köpek Maması 1,5 kg", price: 649, originalPrice: 950, skt: "08.2026", stock: 10 },
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

const KEMIRGEN_KUS_BRAND_DATA: BrandProductData[] = [
  { brandName: "Kemirgen Yemleri", brandSlug: "kemirgen-yemi", animal: "kemirgen", subcategory: "kemirgen-yemi", products: [] },
  { brandName: "Kemirgen Kafesleri", brandSlug: "kemirgen-kafesi", animal: "kemirgen", subcategory: "kemirgen-kafesi", products: [] },
  { brandName: "Bakım ve Aksesuar", brandSlug: "bakim-aksesuar", animal: "kemirgen", subcategory: "bakim-aksesuar", products: [] },
  { brandName: "Vitamin ve Takviye", brandSlug: "vitamin-takviye", animal: "kemirgen", subcategory: "vitamin-takviye", products: [] },
  { brandName: "Akvaryumlar", brandSlug: "akvaryumlar", animal: "akvaryum", subcategory: "akvaryumlar", products: [] },
  { brandName: "İç Filtre", brandSlug: "ic-filtre", animal: "akvaryum", subcategory: "ic-filtre", products: [] },
  { brandName: "Askı Şelale Filtre", brandSlug: "aski-selale-filtre", animal: "akvaryum", subcategory: "aski-selale-filtre", products: [] },
  { brandName: "Tepe Filtre", brandSlug: "tepe-filtre", animal: "akvaryum", subcategory: "tepe-filtre", products: [] },
  { brandName: "Dış Filtre", brandSlug: "dis-filtre", animal: "akvaryum", subcategory: "dis-filtre", products: [] },
  { brandName: "Üretim Filtre", brandSlug: "uretim-filtre", animal: "akvaryum", subcategory: "uretim-filtre", products: [] },
  { brandName: "Sirkülasyon / Sump Motoru", brandSlug: "sirkulasyon-sump-motoru", animal: "akvaryum", subcategory: "sirkulasyon-sump-motoru", products: [] },
  { brandName: "Hava Motoru", brandSlug: "hava-motoru", animal: "akvaryum", subcategory: "hava-motoru", products: [] },
  { brandName: "Filtre Malzemesi", brandSlug: "filtre-malzemesi", animal: "akvaryum", subcategory: "filtre-malzemesi", products: [] },
  { brandName: "Otomatik Yemleme", brandSlug: "otomatik-yemleme", animal: "akvaryum", subcategory: "otomatik-yemleme", products: [] },
  { brandName: "Balık Yemi", brandSlug: "balik-yemi", animal: "akvaryum", subcategory: "balik-yemi", products: [] },
  { brandName: "Su Hazırlayıcı ve İlaçlar", brandSlug: "su-hazirlayici-ve-ilaclar", animal: "akvaryum", subcategory: "su-hazirlayici-ve-ilaclar", products: [] },
  { brandName: "Akvaryum Dekor", brandSlug: "akvaryum-dekor", animal: "akvaryum", subcategory: "akvaryum-dekor", products: [] },
  { brandName: "Akvaryum Kumu", brandSlug: "akvaryum-kumu", animal: "akvaryum", subcategory: "akvaryum-kumu", products: [] },
  { brandName: "Plastik Bitki", brandSlug: "plastik-bitki", animal: "akvaryum", subcategory: "plastik-bitki", products: [] },
  { brandName: "Akvaryum Arka Fon", brandSlug: "akvaryum-arka-fon", animal: "akvaryum", subcategory: "akvaryum-arka-fon", products: [] },
  { brandName: "Akvaryum Ekipmanları", brandSlug: "akvaryum-ekipmanlari", animal: "akvaryum", subcategory: "akvaryum-ekipmanlari", products: [] },
  { brandName: "Akvaryum Aydınlatma", brandSlug: "akvaryum-aydinlatma", animal: "akvaryum", subcategory: "akvaryum-aydinlatma", products: [] },
  { brandName: "Kuş Yemi Çeşitleri", brandSlug: "kus-yemi", animal: "kus", subcategory: "kus-yemi", products: [] },
  { brandName: "Kuş Kafesi Çeşitleri", brandSlug: "kus-kafesi", animal: "kus", subcategory: "kus-kafesi", products: [] },
  { brandName: "Kuş Vitaminleri", brandSlug: "kus-vitamin", animal: "kus", subcategory: "kus-vitamin", products: [] },
  { brandName: "Bakım ve Aksesuar", brandSlug: "bakim-aksesuar", animal: "kus", subcategory: "bakim-aksesuar", products: [] },
];

const ALL_BRAND_DATA = [...SEED_BRAND_DATA, ...EXTRA_BRAND_DATA, KEDI_KUMU_DATA, YAS_MAMA_DATA, MALT_MACUN_DATA, ODUL_DATA, BAKIM_SAGLIK_DATA, KEDI_TUVALETI_DATA, KEDI_TASIMA_DATA, KEDI_KONSERVE_DATA, ECONATURE_KOPEK, FELICIA_KOPEK, ENJOY_KOPEK, LAVITAL_KOPEK, PROCHOICE_KOPEK, PRONATURE_KOPEK, PROPERFORMANCE_KOPEK, REFLEX_KOPEK, REFLEX_PLUS_KOPEK, WANPY_KOPEK, KOPEK_ACIK_MAMA_PROPLAN, KOPEK_ACIK_MAMA_HILLS, KOPEK_ACIK_MAMA_ROYALCANIN, KOPEK_ACIK_MAMA_REFLEX, ...KEMIRGEN_KUS_BRAND_DATA];

const KOPEK_CROSS_SELL_SECTIONS = [
  {
    title: "TUVALET MALZEMESİ",
    forAnimal: "kopek",
    sortOrder: 1,
    productNames: [
      "Gimdog Lavanta Kokulu Köpek Çiş Pedi 60x60 cm 50'li",
      "Gimdog Köpek Çiş Pedi 60x60 cm 50'li",
      "Prochoice Yavru Köpek Çiş Eğitim Pedi 60x90 cm 30'lu",
      "Prochoice Yavru Köpek Tuvalet Eğitim Spreyi 100 ml",
      "Supravet Köpek Çiş Eğitim Pedi 60x90 cm 30'lu",
      "Gimdog Köpek Çiş Pedi 60x60 cm 10'lu",
    ],
  },
  {
    title: "YAŞ MAMA",
    forAnimal: "kopek",
    sortOrder: 2,
    productNames: [
      "Reflex Plus Sos İçinde Somonlu Yetişkin Köpek Konservesi 400 Gr",
      "Reflex Plus Sos İçinde Kuzu Etli Yetişkin Köpek Konservesi 400 Gr",
      "Wanpy Biftekli Tahılsız Yetişkin Köpek Konservesi 375 gr",
      "Challenge Pate Kuzu Etli Yavru Köpek Konservesi 400 gr",
      "Bestpet Jöle İçinde Parça Kuzu Etli Yavru Köpek Konservesi 400 gr",
      "Floki Kuzulu Yetişkin Köpek Konservesi 400 gr",
    ],
  },
  {
    title: "ÖDÜL VE KEMİK",
    forAnimal: "kopek",
    sortOrder: 3,
    productNames: [
      "Gnawlers Defense Dental Köpek Ödül Maması 15gr 7.5cm",
      "M-Pets Trusty Extra Biftekli Düğüm Köpek Ödül Kemiği 105 gr 7'li",
      "Dentalight Beefy Stick Sığır Etli Köpek Ödül Çubuğu 70 Gr",
      "Wanpy Kurutulmuş Dana Ciğeri Köpek Ödülü 40 Gr",
      "Pedigree Markies Köpek Ödül Bisküvisi 150 gr",
      "Baffs Naturals Kurutulmuş Dana Et Çubukları Köpek Ödülü 100 gr",
    ],
  },
  {
    title: "BAKIM VE SAĞLIK",
    forAnimal: "kopek",
    sortOrder: 4,
    productNames: [
      "Nunbell Kıtık Açıcı Tarak",
      "M-Pets Uzun Tüylü Köpekler İçin Şampuan 250 Ml",
      "Supravet Dış Parazit Karşıtı Köpek Şampuanı 200 ml",
      "Nunbell Dental Köpek Diş Temizleme Seti 3'lü",
      "Wahlen Kedi ve Köpekler İçin Nano Silver Temizleme Mendili 50'li",
      "Bioline Köpek Parazit Taması 60 cm",
    ],
  },
];

async function seedCrossSellSections() {
  const existingSections = await db.select().from(crossSellSections).where(eq(crossSellSections.forAnimal, "kopek"));
  if (existingSections.length >= 4) {
    console.log("Köpek cross-sell sections already exist, skipping...");
    return;
  }

  console.log("Seeding köpek cross-sell sections...");
  const allProducts = await db.select().from(products);
  const productMap = new Map(allProducts.map(p => [p.name, p.id]));

  for (const sectionData of KOPEK_CROSS_SELL_SECTIONS) {
    const existingSection = await db.select().from(crossSellSections).where(
      and(eq(crossSellSections.title, sectionData.title), eq(crossSellSections.forAnimal, "kopek"))
    );
    if (existingSection.length > 0) continue;

    const [section] = await db.insert(crossSellSections).values({
      title: sectionData.title,
      forAnimal: sectionData.forAnimal,
      sortOrder: sectionData.sortOrder,
      isActive: true,
    }).returning();

    let sortOrder = 1;
    for (const productName of sectionData.productNames) {
      const productId = productMap.get(productName);
      if (productId) {
        await db.insert(crossSellItems).values({
          sectionId: section.id,
          productId,
          sortOrder: sortOrder++,
        });
      } else {
        console.log(`Cross-sell product not found: ${productName}`);
      }
    }
    console.log(`Created cross-sell section "${sectionData.title}" with ${sortOrder - 1} products`);
  }
}

const SUBCATEGORY_SEED_DATA = [
  { animal: "kopek", slug: "kopek-kuru-mama", displayName: "Köpek Kuru\nMama", color: "#E65100", hasBrands: true, sortOrder: 0 },
  { animal: "kopek", slug: "mama-markalari", displayName: "Köpek\nMaması", color: "#FF5722", hasBrands: true, sortOrder: 1 },
  { animal: "kopek", slug: "acik-mama", displayName: "Açık Mama\nÇeşitleri", color: "#FF9800", hasBrands: true, sortOrder: 2 },
  { animal: "kopek", slug: "tuvalet-malzemeleri", displayName: "Tuvalet\nMalzemeleri", color: "#8BC34A", hasBrands: false, sortOrder: 3 },
  { animal: "kopek", slug: "yas-mama", displayName: "Yaş Mama\nÇeşitleri", color: "#E91E63", hasBrands: false, sortOrder: 4 },
  { animal: "kopek", slug: "odul-kemik", displayName: "Köpek\nÖdülleri", color: "#9C27B0", hasBrands: false, sortOrder: 5 },
  { animal: "kopek", slug: "tasima-kulube", displayName: "Taşıma ve\nKulübeler", color: "#795548", hasBrands: false, sortOrder: 6 },
  { animal: "kopek", slug: "bakim-saglik", displayName: "Bakım ve\nSağlık", color: "#00BCD4", hasBrands: false, sortOrder: 7 },
  { animal: "kopek", slug: "uygun-cuval", displayName: "Uygun Çuval\nMamalar", color: "#607D8B", hasBrands: false, sortOrder: 8 },
  { animal: "kopek", slug: "oyuncak", displayName: "Köpek\nOyuncak", color: "#3F51B5", hasBrands: false, sortOrder: 9 },
  { animal: "kopek", slug: "mama-su-kabi", displayName: "Mama Su\nKapları", color: "#0288D1", hasBrands: false, sortOrder: 10 },
  { animal: "kopek", slug: "bel-boyun-tasma", displayName: "Bel Boyun\nTasmaları", color: "#6D4C41", hasBrands: false, sortOrder: 11 },
  { animal: "kopek", slug: "tuy-toplayici", displayName: "Tüy\nToplayıcı", color: "#AD1457", hasBrands: false, sortOrder: 12 },
  { animal: "kopek", slug: "tirnak-makasi", displayName: "Tırnak\nMakasları", color: "#5D4037", hasBrands: false, sortOrder: 13 },
  { animal: "kopek", slug: "sampuan-banyo", displayName: "Şampuan ve\nBanyo", color: "#1976D2", hasBrands: false, sortOrder: 14 },
  { animal: "kopek", slug: "agiz-dis-bakim", displayName: "Ağız ve Diş\nBakımı", color: "#26A69A", hasBrands: false, sortOrder: 15 },
  { animal: "kopek", slug: "sut-tozu-biberon", displayName: "Süt Tozu ve\nBiberon", color: "#EC407A", hasBrands: false, sortOrder: 16 },
  { animal: "kopek", slug: "bit-pire-parazit", displayName: "Bit Pire\nParazit", color: "#D32F2F", hasBrands: false, sortOrder: 17 },
  { animal: "kopek", slug: "goz-kulak-bakim", displayName: "Göz ve Kulak\nBakımı", color: "#7E57C2", hasBrands: false, sortOrder: 18 },
  { animal: "kopek", slug: "cigneti-kemik", displayName: "Köpek Çiğneti\nve Kemikler", color: "#8D6E63", hasBrands: false, sortOrder: 19 },
  { animal: "kopek", slug: "kopek-aksesuari", displayName: "Köpek\nAksesuarı", color: "#455A64", hasBrands: false, sortOrder: 20 },
  { animal: "kopek", slug: "tras-ekipmanlari", displayName: "Tıraş\nEkipmanları", color: "#37474F", hasBrands: false, sortOrder: 21 },
  { animal: "kedi", slug: "kedi-mamasi", displayName: "Kedi\nMaması", color: "#FF5722", hasBrands: true, sortOrder: 1 },
  { animal: "kedi", slug: "acik-mama", displayName: "Açık\nMamalar", color: "#FF9800", hasBrands: true, sortOrder: 2 },
  { animal: "kedi", slug: "kedi-kumu", displayName: "Kedi\nKumu", color: "#8BC34A", hasBrands: false, sortOrder: 3 },
  { animal: "kedi", slug: "odul", displayName: "Kedi\nÖdülü", color: "#9C27B0", hasBrands: false, sortOrder: 4 },
  { animal: "kedi", slug: "malt-macun", displayName: "Malt &\nMacun", color: "#FF9800", hasBrands: false, sortOrder: 5 },
  { animal: "kedi", slug: "malt-vitamin", displayName: "Kedi\nMaltı", color: "#4CAF50", hasBrands: false, sortOrder: 5 },
  { animal: "kedi", slug: "bakim-saglik", displayName: "Kedi Bakım\nSağlık", color: "#00BCD4", hasBrands: false, sortOrder: 6 },
  { animal: "kedi", slug: "kedi-tasima", displayName: "Kedi\nTaşıma", color: "#795548", hasBrands: false, sortOrder: 7 },
  { animal: "kedi", slug: "kedi-tuvaleti", displayName: "Kedi\nTuvaleti", color: "#607D8B", hasBrands: false, sortOrder: 8 },
  { animal: "kedi", slug: "yas-mama", displayName: "Yaş Mama\nÇeşitleri", color: "#E91E63", hasBrands: false, sortOrder: 9 },
  { animal: "kedi", slug: "kedi-konserve", displayName: "Kedi\nKonserve", color: "#F44336", hasBrands: false, sortOrder: 10 },
  { animal: "kedi", slug: "oyuncak", displayName: "Kedi\nOyuncak", color: "#3F51B5", hasBrands: false, sortOrder: 11 },
  { animal: "kedi", slug: "firca-tras", displayName: "Tarak ve\nFırçalar", color: "#009688", hasBrands: false, sortOrder: 12 },
  { animal: "kedi", slug: "tirmalama", displayName: "Kedi\nTırmalama", color: "#FF7043", hasBrands: false, sortOrder: 13 },
  { animal: "kedi", slug: "mama-su-kabi", displayName: "Mama Su\nKapları", color: "#0288D1", hasBrands: false, sortOrder: 14 },
  { animal: "kedi", slug: "bel-boyun-tasma", displayName: "Bel Boyun\nTasmaları", color: "#6D4C41", hasBrands: false, sortOrder: 15 },
  { animal: "kedi", slug: "tuy-toplayici", displayName: "Tüy\nToplayıcı", color: "#AD1457", hasBrands: false, sortOrder: 16 },
  { animal: "kedi", slug: "tirnak-makasi", displayName: "Tırnak\nMakasları", color: "#5D4037", hasBrands: false, sortOrder: 17 },
  { animal: "kedi", slug: "sampuan-banyo", displayName: "Şampuan ve\nBanyo", color: "#1976D2", hasBrands: false, sortOrder: 18 },
  { animal: "kedi", slug: "agiz-dis-bakim", displayName: "Ağız ve Diş\nBakımı", color: "#26A69A", hasBrands: false, sortOrder: 19 },
  { animal: "kedi", slug: "sut-tozu-biberon", displayName: "Süt Tozu ve\nBiberon", color: "#EC407A", hasBrands: false, sortOrder: 20 },
  { animal: "kedi", slug: "bit-pire-parazit", displayName: "Bit Pire\nParazit", color: "#D32F2F", hasBrands: false, sortOrder: 21 },
  { animal: "kedi", slug: "goz-kulak-bakim", displayName: "Göz ve Kulak\nBakımı", color: "#7E57C2", hasBrands: false, sortOrder: 22 },
  { animal: "kedi", slug: "kedi-aksesuari", displayName: "Kedi\nAksesuarı", color: "#455A64", hasBrands: false, sortOrder: 23 },
  { animal: "kedi", slug: "tras-ekipmanlari", displayName: "Tıraş\nEkipmanları", color: "#37474F", hasBrands: false, sortOrder: 24 },
  { animal: "kus", slug: "kus-yemi", displayName: "Kuş Yemi\nÇeşitleri", color: "#FFC107", hasBrands: false, sortOrder: 1 },
  { animal: "kus", slug: "kus-kafesi", displayName: "Kuş Kafesi\nÇeşitleri", color: "#795548", hasBrands: false, sortOrder: 2 },
  { animal: "kus", slug: "kus-vitamin", displayName: "Kuş\nVitaminleri", color: "#4CAF50", hasBrands: false, sortOrder: 3 },
  { animal: "kus", slug: "bakim-aksesuar", displayName: "Bakım ve\nAksesuar", color: "#00BCD4", hasBrands: false, sortOrder: 4 },
  { animal: "kemirgen", slug: "kemirgen-yemi", displayName: "Kemirgen\nYemleri", color: "#FF9800", hasBrands: false, sortOrder: 1 },
  { animal: "kemirgen", slug: "kemirgen-kafesi", displayName: "Kemirgen\nKafesleri", color: "#795548", hasBrands: false, sortOrder: 2 },
  { animal: "kemirgen", slug: "bakim-aksesuar", displayName: "Bakım ve\nAksesuar", color: "#00BCD4", hasBrands: false, sortOrder: 3 },
  { animal: "kemirgen", slug: "vitamin-takviye", displayName: "Vitamin ve\nTakviye", color: "#4CAF50", hasBrands: false, sortOrder: 4 },
  { animal: "akvaryum", slug: "akvaryumlar", displayName: "Akvaryumlar", color: "#006064", hasBrands: false, sortOrder: 1 },
  { animal: "akvaryum", slug: "ic-filtre", displayName: "İç Filtre", color: "#00838F", hasBrands: false, sortOrder: 2 },
  { animal: "akvaryum", slug: "aski-selale-filtre", displayName: "Askı Şelale\nFiltre", color: "#0097A7", hasBrands: false, sortOrder: 3 },
  { animal: "akvaryum", slug: "tepe-filtre", displayName: "Tepe Filtre", color: "#00ACC1", hasBrands: false, sortOrder: 4 },
  { animal: "akvaryum", slug: "dis-filtre", displayName: "Dış Filtre", color: "#26C6DA", hasBrands: false, sortOrder: 5 },
  { animal: "akvaryum", slug: "uretim-filtre", displayName: "Üretim Filtre", color: "#4DD0E1", hasBrands: false, sortOrder: 6 },
  { animal: "akvaryum", slug: "sirkulasyon-sump-motoru", displayName: "Sirkülasyon /\nSump Motoru", color: "#455A64", hasBrands: false, sortOrder: 7 },
  { animal: "akvaryum", slug: "hava-motoru", displayName: "Hava Motoru", color: "#607D8B", hasBrands: false, sortOrder: 8 },
  { animal: "akvaryum", slug: "filtre-malzemesi", displayName: "Filtre\nMalzemesi", color: "#78909C", hasBrands: false, sortOrder: 9 },
  { animal: "akvaryum", slug: "otomatik-yemleme", displayName: "Otomatik\nYemleme", color: "#FF9800", hasBrands: false, sortOrder: 10 },
  { animal: "akvaryum", slug: "balik-yemi", displayName: "Balık Yemi", color: "#EF6C00", hasBrands: false, sortOrder: 11 },
  { animal: "akvaryum", slug: "su-hazirlayici-ve-ilaclar", displayName: "Su Hazırlayıcı\nve İlaçlar", color: "#5E35B1", hasBrands: false, sortOrder: 12 },
  { animal: "akvaryum", slug: "akvaryum-dekor", displayName: "Akvaryum\nDekor", color: "#00897B", hasBrands: false, sortOrder: 13 },
  { animal: "akvaryum", slug: "akvaryum-kumu", displayName: "Akvaryum\nKumu", color: "#8D6E63", hasBrands: false, sortOrder: 14 },
  { animal: "akvaryum", slug: "plastik-bitki", displayName: "Plastik Bitki", color: "#43A047", hasBrands: false, sortOrder: 15 },
  { animal: "akvaryum", slug: "akvaryum-arka-fon", displayName: "Akvaryum\nArka Fon", color: "#1E88E5", hasBrands: false, sortOrder: 16 },
  { animal: "akvaryum", slug: "akvaryum-ekipmanlari", displayName: "Akvaryum\nEkipmanları", color: "#424242", hasBrands: false, sortOrder: 17 },
  { animal: "akvaryum", slug: "akvaryum-aydinlatma", displayName: "Akvaryum\nAydınlatma", color: "#FBC02D", hasBrands: false, sortOrder: 18 },
];

async function seedSubcategories() {
  const validSlugs = new Set(SUBCATEGORY_SEED_DATA.map(s => `${s.animal}/${s.slug}`));
  const allExisting = await db.select().from(subcategories);
  for (const row of allExisting) {
    if (!validSlugs.has(`${row.animal}/${row.slug}`)) {
      await db.delete(subcategories).where(eq(subcategories.id, row.id));
      console.log(`Removed invalid subcategory: ${row.animal}/${row.slug}`);
    }
  }
  for (const sub of SUBCATEGORY_SEED_DATA) {
    const existing = await db.select().from(subcategories).where(
      and(
        eq(subcategories.animal, sub.animal),
        eq(subcategories.slug, sub.slug)
      )
    );
    if (existing.length > 0) {
      const cur = existing[0];
      if (
        cur.displayName !== sub.displayName ||
        cur.color !== sub.color ||
        cur.hasBrands !== sub.hasBrands ||
        cur.sortOrder !== sub.sortOrder
      ) {
        await db.update(subcategories).set({
          displayName: sub.displayName,
          color: sub.color,
          hasBrands: sub.hasBrands,
          sortOrder: sub.sortOrder,
        }).where(eq(subcategories.id, cur.id));
        console.log(`Updated subcategory: ${sub.animal}/${sub.slug}`);
      }
      continue;
    }
    await db.insert(subcategories).values(sub);
    console.log(`Seeded subcategory: ${sub.animal}/${sub.slug}`);
  }
}

async function seedDefaultBrandCategoriesForSubcategories() {
  const allBrands = await db.select().from(brandCategories);
  const existingKeys = new Set(
    allBrands.map(b => `${b.animal}/${b.subcategory}/${b.brandSlug}`)
  );
  for (const sub of SUBCATEGORY_SEED_DATA) {
    if (sub.hasBrands) continue;
    const displayName = sub.displayName.replace(/\n/g, " ");
    const key = `${sub.animal}/${sub.slug}/${sub.slug}`;
    const existing = allBrands.find(b => b.animal === sub.animal && b.subcategory === sub.slug && b.brandSlug === sub.slug);
    if (existing) {
      if (existing.brandName !== displayName) {
        await db.update(brandCategories).set({ brandName: displayName }).where(eq(brandCategories.id, existing.id));
        console.log(`Updated default brand_category name: ${sub.animal}/${sub.slug} -> ${displayName}`);
      }
      continue;
    }
    await db.insert(brandCategories).values({
      brandName: displayName,
      brandSlug: sub.slug,
      animal: sub.animal,
      subcategory: sub.slug,
    });
    console.log(`Seeded default brand_category: ${sub.animal}/${sub.slug}`);
  }
}

async function seedDeliveryNeighborhoods() {
  const existing = await db.select().from(deliveryNeighborhoods).limit(1);
  if (existing.length > 0) {
    console.log("Delivery neighborhoods already exist, skipping...");
    return;
  }

  const NEIGHBORHOODS = [
    { district: "Atakum", name: "Körfez", distance: 1, sortOrder: 1 },
    { district: "Atakum", name: "Denizevleri", distance: 1.5, sortOrder: 2 },
    { district: "Atakum", name: "Mimar Sinan", distance: 2, sortOrder: 3 },
    { district: "Atakum", name: "Atakent", distance: 2, sortOrder: 4 },
    { district: "Atakum", name: "Güzelyalı", distance: 2.5, sortOrder: 5 },
    { district: "Atakum", name: "Ömürevleri", distance: 2, sortOrder: 6 },
    { district: "Atakum", name: "Mevlana", distance: 2, sortOrder: 7 },
    { district: "Atakum", name: "Kurupelit", distance: 4, sortOrder: 8 },
    { district: "Atakum", name: "Esenevler", distance: 4, sortOrder: 9 },
    { district: "Atakum", name: "Balaç", distance: 5, sortOrder: 10 },
    { district: "Atakum", name: "Alanlı", distance: 6, sortOrder: 11 },
    { district: "Atakum", name: "Çakırlar", distance: 6, sortOrder: 12 },
    { district: "Atakum", name: "Küçükkolpınar", distance: 6, sortOrder: 13 },
    { district: "Atakum", name: "Büyükkolpınar", distance: 7, sortOrder: 14 },
    { district: "Atakum", name: "Atatepe", distance: 7, sortOrder: 15 },
    { district: "Atakum", name: "Kamalı", distance: 9, sortOrder: 16 },
    { district: "Atakum", name: "Çatalçam", distance: 9, sortOrder: 17 },
    { district: "Atakum", name: "Karaoyumca", distance: 8, sortOrder: 18 },
    { district: "Atakum", name: "Taflan", distance: 10.5, sortOrder: 19 },
    { district: "Atakum", name: "Yeni Mahalle", distance: 11.5, sortOrder: 20 },
    { district: "Atakum", name: "İncesu", distance: 12, sortOrder: 21 },
    { district: "İlkadım", name: "19 Mayıs", distance: 9, sortOrder: 1 },
    { district: "İlkadım", name: "Adalet", distance: 7, sortOrder: 2 },
    { district: "İlkadım", name: "Ağabali", distance: 10, sortOrder: 3 },
    { district: "İlkadım", name: "Anadolu", distance: 8, sortOrder: 4 },
    { district: "İlkadım", name: "Bahçelievler", distance: 7, sortOrder: 5 },
    { district: "İlkadım", name: "Baruthane", distance: 6, sortOrder: 6 },
    { district: "İlkadım", name: "Cedit", distance: 10, sortOrder: 7 },
    { district: "İlkadım", name: "Çatalarmut", distance: 11, sortOrder: 8 },
    { district: "İlkadım", name: "Derebahçe", distance: 11, sortOrder: 9 },
    { district: "İlkadım", name: "Fevzi Çakmak", distance: 9, sortOrder: 10 },
    { district: "İlkadım", name: "Gazi", distance: 9, sortOrder: 11 },
    { district: "İlkadım", name: "Hacınabi", distance: 10, sortOrder: 12 },
    { district: "İlkadım", name: "Hançerli", distance: 9, sortOrder: 13 },
    { district: "İlkadım", name: "İlyasköy", distance: 12, sortOrder: 14 },
    { district: "İlkadım", name: "İstasyon", distance: 10, sortOrder: 15 },
    { district: "İlkadım", name: "Kadıköy", distance: 11, sortOrder: 16 },
    { district: "İlkadım", name: "Kale", distance: 10, sortOrder: 17 },
    { district: "İlkadım", name: "Karadeniz", distance: 9, sortOrder: 18 },
    { district: "İlkadım", name: "Kılıçdede", distance: 10, sortOrder: 19 },
    { district: "İlkadım", name: "Liman", distance: 8, sortOrder: 20 },
    { district: "İlkadım", name: "Pazar", distance: 10, sortOrder: 21 },
    { district: "İlkadım", name: "Rasathane", distance: 12, sortOrder: 22 },
    { district: "İlkadım", name: "Selahiye", distance: 10, sortOrder: 23 },
    { district: "İlkadım", name: "Tepecik", distance: 11, sortOrder: 24 },
    { district: "İlkadım", name: "Ulugazi", distance: 10, sortOrder: 25 },
    { district: "İlkadım", name: "Unkapanı", distance: 10, sortOrder: 26 },
    { district: "İlkadım", name: "Yaşardoğu", distance: 11, sortOrder: 27 },
    { district: "İlkadım", name: "Zeytinlik", distance: 8, sortOrder: 28 },
    { district: "Canik", name: "Karşıyaka", distance: 9, sortOrder: 1 },
    { district: "Canik", name: "Gaziosmanpaşa", distance: 10, sortOrder: 2 },
    { district: "Canik", name: "Yavuz Selim", distance: 10, sortOrder: 3 },
    { district: "Canik", name: "Uludağ", distance: 10, sortOrder: 4 },
    { district: "Canik", name: "Orhangazi", distance: 11, sortOrder: 5 },
  ];

  for (const nh of NEIGHBORHOODS) {
    await db.insert(deliveryNeighborhoods).values({
      district: nh.district,
      name: nh.name,
      distance: nh.distance,
      minOrder: 700,
      shippingFee: 89,
      freeShippingLimit: 2000,
      isActive: true,
      sortOrder: nh.sortOrder,
    });
  }
  console.log(`Seeded ${NEIGHBORHOODS.length} delivery neighborhoods.`);
}

export async function seedDatabase() {
  await seedSubcategories();
  await seedDefaultBrandCategoriesForSubcategories();
  await seedDeliveryNeighborhoods();
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
  await seedCrossSellSections();
  await seedCampaignItems();
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
  console.log("Checking breed stats for mama products...");

  const allProducts = await db.select().from(products);
  const allCategories = await db.select().from(brandCategories);
  const catMap = new Map(allCategories.map(c => [c.id, c]));

  const existingStats = await db.select({ productId: breedStats.productId }).from(breedStats);
  const productsWithStats = new Set(existingStats.map(s => s.productId));

  let count = 0;
  for (const product of allProducts) {
    if (productsWithStats.has(product.id)) continue;

    const cat = catMap.get(product.brandCategoryId);
    if (!cat) continue;

    const isKedi = cat.animal === "kedi" && (cat.subcategory === "kedi-mamasi" || cat.subcategory === "acik-mama");
    const isKopek = cat.animal === "kopek" && (cat.subcategory === "mama-markalari" || cat.subcategory === "kopek-mamasi" || cat.subcategory === "kopek-kuru-mama" || cat.subcategory === "acik-mama" || cat.subcategory === "uygun-cuval");
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

  if (count > 0) {
    console.log(`Seeded ${count} new breed stats for mama products.`);
  } else {
    console.log("All mama products already have breed stats.");
  }
}

async function seedCampaignItems() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS campaign_items (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      item_type VARCHAR(10) NOT NULL DEFAULT 'main',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      parent_product_id INTEGER
    )
  `);
  await pool.query(`ALTER TABLE campaign_items ADD COLUMN IF NOT EXISTS parent_product_id INTEGER`);
  await pool.query(`ALTER TABLE campaign_items ADD COLUMN IF NOT EXISTS campaign_price NUMERIC`);

  const existing = await pool.query("SELECT COUNT(*) as cnt FROM campaign_items");
  if (parseInt(existing.rows[0].cnt) > 0) {
    console.log("Campaign items already exist, skipping...");
    return;
  }

  const CAMPAIGN_MAIN_PRODUCTS = [86, 103, 25, 197, 204, 28, 30, 98, 337, 365, 362, 354, 294, 292, 323, 298];
  const CAMPAIGN_EXTRA_PRODUCTS = [946, 937, 461, 936, 414, 910, 474, 473, 941, 930];

  let seeded = 0;
  for (let i = 0; i < CAMPAIGN_MAIN_PRODUCTS.length; i++) {
    const pid = CAMPAIGN_MAIN_PRODUCTS[i];
    const productExists = await pool.query("SELECT id FROM products WHERE id = $1", [pid]);
    if (productExists.rows.length > 0) {
      await pool.query(
        "INSERT INTO campaign_items (product_id, item_type, sort_order) VALUES ($1, $2, $3)",
        [pid, "main", i + 1]
      );
      seeded++;
    }
  }
  for (let i = 0; i < CAMPAIGN_EXTRA_PRODUCTS.length; i++) {
    const pid = CAMPAIGN_EXTRA_PRODUCTS[i];
    const productExists = await pool.query("SELECT id FROM products WHERE id = $1", [pid]);
    if (productExists.rows.length > 0) {
      await pool.query(
        "INSERT INTO campaign_items (product_id, item_type, sort_order) VALUES ($1, $2, $3)",
        [pid, "extra", i + 1]
      );
      seeded++;
    }
  }
  console.log(`Seeded ${seeded} campaign items.`);
}
