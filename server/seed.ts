import { db } from "./storage";
import { brandCategories, products } from "@shared/schema";

const BRAND_PRODUCTS_DATA = [
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

export async function seedDatabase() {
  const existingCategories = await db.select().from(brandCategories);
  if (existingCategories.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with brand products...");

  for (const brand of BRAND_PRODUCTS_DATA) {
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
        brandCategoryId: category.id,
      });
    }

    console.log(`Seeded ${brand.products.length} products for ${brand.brandName}`);
  }

  console.log("Database seeding complete!");
}
