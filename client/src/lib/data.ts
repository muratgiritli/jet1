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
  { id: "nakit", name: "Kapıda Nakit", disc: -0.10, tag: "%10 İndirim" },
  { id: "eft", name: "Banka Havalesi", disc: 0, tag: "Peşin" },
  { id: "qr", name: "Kapıda QR Ödeme", disc: 0, tag: "Peşin" },
  { id: "pos", name: "Kapıda Kredi Kartı", disc: 0, tag: "Peşin" },
  { id: "online", name: "Online Kredi Kartı", disc: 0, tag: "Anında" },
];

export const INSTALLMENT_BANKS = [
  "AXESS",
  "Maximum",
  "Bonus",
  "WORLD",
  "QNB",
];

