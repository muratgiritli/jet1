// "Popüler Atakum Aramaları" homepage internal links (atakumpetshop.com only).
// Single source of truth shared by the landing page component and the
// store-scoping test, which asserts every href resolves in atakum's served
// SEO page set (guards against a link silently 404-ing if a keyword is dropped).
export interface AtakumPopularSearch {
  name: string;
  href: string;
}

export const ATAKUM_POPULAR_SEARCHES: AtakumPopularSearch[] = [
  { name: "Atakum Pet Shop", href: "/atakum-petshop" },
  { name: "Atakum Kedi Maması", href: "/atakum-kedi-mamasi" },
  { name: "Atakum Köpek Maması", href: "/atakum-kopek-mamasi" },
  { name: "Atakum Kedi Kumu", href: "/atakum-kedi-kumu" },
  { name: "Atakum Mama Siparişi", href: "/atakum-mama-siparisi" },
  { name: "Eve Teslim Petshop", href: "/atakum-petshop-eve-teslim" },
  { name: "Royal Canin Atakum", href: "/royal-canin-kedi-mamasi-atakum" },
  { name: "Pro Plan Atakum", href: "/pro-plan-kedi-mamasi-atakum" },
  { name: "Hill's Atakum", href: "/hills-kedi-mamasi-atakum" },
  { name: "Kapıda Ödeme", href: "/kapida-odeme-petshop" },
  { name: "Atakum Mahalleleri", href: "/atakum-mahalleler" },
  { name: "Pet Aksesuar", href: "/pet-aksesuar" },
];
