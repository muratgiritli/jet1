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
  stock?: number;
  preorderEnabled?: boolean;
}

export interface Category {
  title: string;
  items: Product[];
}

export const CARD_SURCHARGE = 0.05;
export const roundMoney = (n: number) => Math.round(n * 100) / 100;
export const cardPrice = (cash: number, rate: number = CARD_SURCHARGE) => roundMoney(cash * (1 + rate));
export const isCashPaymentMethod = (method: string) => /nakit/i.test(method || "");

export interface PaymentOption {
  id: string;
  name: string;
  surcharge: number;
  tag: string;
}

export const CONFIG = {
  phone: "+908508403959",
  shipLimit: 1000,
  minLimit: 0,
  shipFee: 89,
  bankInfo:
    "\n\n*BANKA HESAP NO :* TR54 0006 2001 0550 0006 2959 82 \n*BANKA HESAP ADI :* SİZPA İNTERNET TİCARET LİMİTED ŞİRKETİ",
};

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

export const TESLIMAT_MAHALLELERI = [
  "Atakent Mahallesi",
  "Balaç Mahallesi",
  "Beypınar Mahallesi",
  "Büyükkolpınar Mahallesi",
  "Büyükoyumca Mahallesi",
  "Camii Mahallesi",
  "Cumhuriyet Mahallesi",
  "Çakırlar Yalı Mahallesi",
  "Çobanlı Mahallesi",
  "Çobanözü Mahallesi",
  "Denizevleri Mahallesi",
  "Esenevler Mahallesi",
  "Güzelyalı Mahallesi",
  "İncesu Yalı Mahallesi",
  "İstiklal Mahallesi",
  "Körfez Mahallesi",
  "Küçükkolpınar Mahallesi",
  "Mevlana Mahallesi",
  "Mimarsinan Mahallesi",
  "Taflan Mahallesi",
  "Yalı Mahallesi",
  "Yenimahalle Mahallesi",
  "Yeşildere Mahallesi",
  "Yeşilyurt Mahallesi",
];

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "nakit", name: "Kapıda Nakit", surcharge: 0, tag: "En uygun" },
  { id: "eft", name: "Banka Havalesi", surcharge: CARD_SURCHARGE, tag: "+%5" },
  { id: "qr", name: "Kapıda QR Ödeme", surcharge: CARD_SURCHARGE, tag: "+%5" },
  { id: "pos", name: "Kapıda Kredi Kartı", surcharge: CARD_SURCHARGE, tag: "+%5" },
  { id: "online", name: "Online Kredi Kartı", surcharge: CARD_SURCHARGE, tag: "+%5" },
];

export const INSTALLMENT_BANKS = [
  "AXESS",
  "Maximum",
  "Bonus",
  "WORLD",
  "QNB",
];

