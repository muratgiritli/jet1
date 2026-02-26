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

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "nakit", name: "Kapıda Nakit", disc: 0.05, tag: "%5 İndirim" },
  { id: "eft", name: "Banka Havalesi", disc: 0, tag: "Net" },
  { id: "qr", name: "Kapıda QR Ödeme", disc: 0, tag: "Net" },
  { id: "pos", name: "Kapıda Kredi Kartı", disc: 0, tag: "Net" },
  { id: "taksit", name: "Kredi Kartına Taksit", disc: 0, tag: "Taksitli" },
];

