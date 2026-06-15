import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ShoppingBag, Menu, Zap, Clock, ShieldCheck, CreditCard,
  Gift, Heart, ChevronRight, CheckCircle2, Grid3X3, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import SEO, { LOCAL_BUSINESS_JSONLD, WEBSITE_JSONLD, SITE_DOMAIN } from "@/components/SEO";
import heroImg from "@/assets/images/atakum-hiz-hero.png";
import askidaImg from "@/assets/images/atakum-hiz-askida.png";
import catDog from "@/assets/images/category-dog.webp";
import catCat from "@/assets/images/category-cat.webp";
import catBird from "@/assets/images/category-bird.webp";
import catRabbit from "@/assets/images/category-rabbit.webp";

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  img?: string | null;
  category?: string;
  isActive?: boolean;
};

const CATEGORIES = [
  { name: "Köpek", img: catDog, href: "/kategori/kopek", color: "bg-blue-100" },
  { name: "Kedi", img: catCat, href: "/kategori/kedi", color: "bg-orange-100" },
  { name: "Kuş", img: catBird, href: "/kategori/kus", color: "bg-emerald-100" },
  { name: "Kemirgen", img: catRabbit, href: "/kategori/kemirgen", color: "bg-pink-100" },
  { name: "Akvaryum", img: catBird, href: "/kategori/akvaryum", color: "bg-cyan-100" },
  { name: "Vet. Mama", img: catDog, href: "/kategori/veteriner", color: "bg-slate-200" },
];

function fmt(n: number) {
  return n.toLocaleString("tr-TR");
}

export default function AtakumHome() {
  const store = useStore();
  const [, navigate] = useLocation();
  const { updateQty, itemCount } = useCart();
  const { isLoggedIn } = useCustomer();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState(14);
  const [search, setSearch] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => Math.max(8, Math.min(35, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const products = allProducts.filter((p) => p.isActive !== false).slice(0, 8);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search.trim() ? `/kategori?q=${encodeURIComponent(search.trim())}` : "/kategori");
  };

  const addToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const blocked = updateQty(String(p.id), 1);
    if (!blocked) {
      toast({ title: "Sepete eklendi", description: p.name });
    }
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0" data-testid="page-atakum-home">
      <SEO
        title={store.seo.title}
        description={store.seo.description}
        keywords={store.seo.keywords}
        canonical={`${SITE_DOMAIN}/`}
        jsonLd={[LOCAL_BUSINESS_JSONLD, WEBSITE_JSONLD]}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .bg-brand { background-color: #5B21B6; }
        .text-brand { color: #5B21B6; }
        .border-brand { border-color: #5B21B6; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Top Banner */}
      <div className="bg-violet-900 text-white text-xs md:text-sm font-medium py-2 px-4 flex justify-between items-center font-outfit">
        <div className="flex items-center gap-2" data-testid="text-live-users">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Şu an Atakum'da {activeUsers} kişi sipariş veriyor
        </div>
        <div className="hidden md:flex items-center gap-4 text-violet-200">
          <Link href="/kampanya"><span className="cursor-pointer hover:text-white">Haftanın Fırsatları</span></Link>
          <Link href="/siparis-takip"><span className="cursor-pointer hover:text-white">Sipariş Takibi</span></Link>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-outfit">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/kategori">
              <button className="md:hidden text-slate-600" aria-label="Kategoriler" data-testid="button-menu">
                <Menu size={24} />
              </button>
            </Link>
            <Link href="/">
              <div className="text-xl md:text-2xl font-black text-brand tracking-tight flex items-center gap-1 cursor-pointer" data-testid="link-home-logo">
                <Zap className="text-brand fill-brand" size={24} />
                {store.shortName.toUpperCase()}
              </div>
            </Link>
          </div>

          <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mama, kum, oyuncak ara..."
                className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand outline-none"
                data-testid="input-search"
              />
              <Search className="absolute left-4 top-2.5 text-slate-400" size={18} />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 font-medium">Teslimat Bölgesi</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                Atakum, Samsun <ChevronRight size={14} />
              </span>
            </div>
            <Link href="/odeme">
              <button className="relative bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 transition-colors" aria-label="Sepet" data-testid="button-cart">
                <ShoppingBag size={20} className="text-slate-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={onSearch} className="p-3 md:hidden border-t border-slate-100 bg-white">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mama, kum, oyuncak ara..."
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand outline-none"
              data-testid="input-search-mobile"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </form>
      </header>

      <main className="font-outfit max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-10 md:space-y-16">

        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-violet-950 flex flex-col md:flex-row items-center min-h-[360px] md:min-h-[480px]">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-violet-900 to-transparent z-10 md:w-2/3"></div>
          <img
            src={heroImg}
            alt="Atakum Pet Shop hızlı teslimat"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60 md:opacity-100 md:object-right"
          />
          <div className="relative z-20 p-6 md:p-12 md:w-1/2 flex flex-col items-start gap-4">
            <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 text-sm border-none uppercase tracking-wider">
              Atakum'da Tek
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              KAPIDA <span className="text-yellow-400">1 SAATTE</span> <br />
              TESLİMAT
            </h1>
            <p className="text-violet-100 text-base md:text-lg font-medium max-w-md">
              Mamanız bitti mi? Panik yok. Atakum'un her mahallesine motorlu kuryelerimizle jet hızında ulaşıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
              <Button
                size="lg"
                onClick={scrollToProducts}
                className="bg-yellow-400 hover:bg-yellow-500 text-violet-950 font-black text-lg rounded-full px-8 h-14"
                data-testid="button-order-now"
              >
                Hemen Sipariş Ver
              </Button>
              <Link href="/kategori">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-full h-14 w-full"
                  data-testid="button-browse-categories"
                >
                  Kategorilere Göz At
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-4 text-white/80 text-sm font-medium">
              <div className="flex items-center gap-1.5"><Clock size={16} className="text-yellow-400" /> Dakikalar içinde yola çıkar</div>
              <div className="hidden sm:flex items-center gap-1.5"><CreditCard size={16} className="text-yellow-400" /> Kapıda Ödeme</div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Hızlı Kategoriler</h2>
            <Link href="/kategori"><span className="text-brand font-bold text-sm flex items-center cursor-pointer">Tümü <ChevronRight size={16} /></span></Link>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-3 md:gap-6 pb-2">
            {CATEGORIES.map((cat, i) => (
              <Link key={i} href={cat.href}>
                <div className="flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px] cursor-pointer group" data-testid={`link-category-${i}`}>
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${cat.color} flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-slate-100`}>
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Rails */}
        <section ref={productsRef} className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Zap className="text-yellow-500 fill-yellow-500" /> Çok Satanlar
            </h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-3 animate-pulse">
                  <div className="aspect-square mb-3 bg-slate-100 rounded-xl" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {products.map((p) => (
                <Link key={p.id} href={`/urun/${p.id}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col group hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full" data-testid={`card-product-${p.id}`}>
                    <div className="relative aspect-square mb-3 bg-slate-50 rounded-xl p-4 flex items-center justify-center">
                      <Badge className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 border-none z-10">
                        HIZLI
                      </Badge>
                      {p.img ? (
                        <img src={p.img} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <ShoppingBag className="w-12 h-12 text-slate-200" />
                      )}
                    </div>
                    {p.category && <span className="text-xs font-bold text-slate-400 mb-1">{p.category}</span>}
                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 flex-1">{p.name}</h3>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-lg font-black text-brand">₺{fmt(p.price)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-xs font-bold text-slate-400 line-through mb-1">₺{fmt(p.originalPrice)}</span>
                      )}
                    </div>
                    <Button
                      onClick={(e) => addToCart(e, p)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10"
                      data-testid={`button-add-${p.id}`}
                    >
                      Sepete Ekle
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Benefits Strip */}
        <section className="bg-brand text-white rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="flex items-center gap-4 pt-4 md:pt-0 first:pt-0">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">Güvenli & Hızlı</h4>
                <p className="text-violet-200 text-sm font-medium">Samsun Atakum içine kendi kuryelerimizle özel teslimat.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CreditCard size={24} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">Kapıda Ödeme</h4>
                <p className="text-violet-200 text-sm font-medium">İster nakit, ister kredi kartı. Gönül rahatlığıyla ödeyin.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Gift size={24} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">%5 Para Puan</h4>
                <p className="text-violet-200 text-sm font-medium">Her alışverişinizde kazanır, bir sonrakinde harcarsınız.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Askida Mama */}
        <section className="bg-slate-100 rounded-3xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-5/12">
            <img src={askidaImg} alt="Sokak hayvanları için askıda mama" className="w-full h-full object-cover min-h-[250px]" />
          </div>
          <div className="p-6 md:p-10 md:w-7/12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-bold w-max mb-4">
              <Heart size={16} className="fill-rose-600" /> Topluluk
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">
              Askıda Mama
            </h2>
            <p className="text-slate-600 font-medium mb-6 leading-relaxed">
              Sokaktaki dostlarımızı unutmuyoruz. Siparişinize ekleyeceğiniz ufak bir bağış maması, Atakum'daki sokak hayvanlarına doğrudan ulaştırılır.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/sokak-canlari">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl h-12 px-6" data-testid="button-askida">
                  Bağış Yap
                </Button>
              </Link>
              <Link href="/sokak-canlari">
                <Button variant="outline" className="border-slate-300 text-slate-700 font-bold rounded-xl h-12">
                  Daha Fazla Bilgi
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Vet Tip */}
        <section className="bg-amber-50 rounded-3xl p-6 md:p-8 border border-amber-100 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <CheckCircle2 size={200} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-black text-amber-900 mb-2 flex items-center gap-2">
              Haftanın Vet. İpucu
            </h3>
            <p className="text-amber-800 font-medium leading-relaxed">
              <strong>Havalar ısınıyor!</strong> Köpeklerinizin patilerinin asfaltta yanmaması için sabah erken veya akşam geç saatlerde yürüyüşe çıkarmaya özen gösterin. Daima yanınızda taze su bulundurun.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 md:py-16 font-outfit border-t-4 border-brand">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1 mb-4">
                <Zap className="text-brand fill-brand" size={24} />
                {store.shortName.toUpperCase()}
              </div>
              <p className="font-medium max-w-sm mb-6">
                {store.businessDescription}
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">Hızlı Linkler</h4>
              <ul className="space-y-3 font-medium">
                <li><Link href="/kategori"><span className="hover:text-brand transition-colors cursor-pointer">Kategoriler</span></Link></li>
                <li><Link href="/sokak-canlari"><span className="hover:text-brand transition-colors cursor-pointer">Askıda Mama</span></Link></li>
                <li><Link href="/kampanya"><span className="hover:text-brand transition-colors cursor-pointer">Kampanyalar</span></Link></li>
                <li><Link href="/sss"><span className="hover:text-brand transition-colors cursor-pointer">Sıkça Sorulan Sorular</span></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">İletişim</h4>
              <ul className="space-y-3 font-medium">
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> {store.address}</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> {store.phoneDisplay}</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> {store.email}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-medium text-sm">
            <p>© {new Date().getFullYear()} {store.name}. Tüm hakları saklıdır.</p>
            <div className="flex gap-4">
              <Link href="/gizlilik"><span className="cursor-pointer hover:text-brand">Gizlilik</span></Link>
              <Link href="/kullanim-kosullari"><span className="cursor-pointer hover:text-brand">Şartlar</span></Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around p-3 z-50 font-outfit font-bold text-[10px] text-slate-500">
        <Link href="/">
          <div className="flex flex-col items-center gap-1 text-brand" data-testid="nav-home">
            <Zap size={20} className="fill-brand" />
            <span>Ana Sayfa</span>
          </div>
        </Link>
        <Link href="/kategori">
          <div className="flex flex-col items-center gap-1" data-testid="nav-categories">
            <Grid3X3 size={20} />
            <span>Keşfet</span>
          </div>
        </Link>
        <Link href="/odeme">
          <div className="flex flex-col items-center gap-1 relative" data-testid="nav-cart">
            {itemCount > 0 && (
              <div className="absolute -top-3 right-0 bg-brand text-white w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</div>
            )}
            <ShoppingBag size={20} />
            <span>Sepet</span>
          </div>
        </Link>
        <Link href={isLoggedIn ? "/hesabim" : "/giris"}>
          <div className="flex flex-col items-center gap-1" data-testid="nav-account">
            <User size={20} />
            <span>{isLoggedIn ? "Hesabım" : "Giriş"}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
