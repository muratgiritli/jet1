import { useQuery } from "@tanstack/react-query";
import {
  Search, ShoppingCart, Heart, User, MapPin, Phone, Clock,
  Truck, ShieldCheck, Banknote, CreditCard, Zap, Award,
  ChevronRight, Star, Flame, Sparkles, Gift, PackageCheck,
  ArrowRight, Tag,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  img?: string | null;
  stock?: number;
  category?: string;
  brand?: string;
  isActive?: boolean;
};

const BRAND = "#6B3480";
const ACCENT = "#FFC107";

const categories = [
  { key: "kopek", name: "Köpek", img: "/images/category-dog.webp", color: "from-amber-50 to-orange-100", ring: "ring-orange-200" },
  { key: "kedi", name: "Kedi", img: "/images/category-cat.webp", color: "from-purple-50 to-fuchsia-100", ring: "ring-purple-200" },
  { key: "kus", name: "Kuş", img: "/images/category-bird.webp", color: "from-sky-50 to-cyan-100", ring: "ring-sky-200" },
  { key: "kemirgen", name: "Kemirgen", img: "/images/category-rabbit.webp", color: "from-rose-50 to-pink-100", ring: "ring-pink-200" },
  { key: "akvaryum", name: "Akvaryum", img: "/images/cat-fish.webp", color: "from-teal-50 to-emerald-100", ring: "ring-teal-200" },
  { key: "supurge", name: "Sokak Canlıları", img: "/images/category-dog.webp", color: "from-amber-50 to-yellow-100", ring: "ring-amber-200" },
];

const brands = [
  { name: "Royal Canin", img: "/images/brands/royal-canin.webp" },
  { name: "Pro Plan", img: "/images/brands/pro-plan.webp" },
  { name: "Hill's", img: "/images/brands/hills.webp" },
  { name: "N&D", img: "/images/brands/nd.webp" },
  { name: "Reflex", img: "/images/brands/reflex.webp" },
  { name: "Profine", img: "/images/brands/profine.webp" },
];

function ProductCard({ p, badge }: { p: Product; badge?: string }) {
  const discount = p.oldPrice && p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  return (
    <a
      href={`/urun/${p.id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
      data-testid={`card-demo-product-${p.id}`}
    >
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-purple-50/40 overflow-hidden">
          {badge && (
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg">
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 z-10 bg-[#FFC107] text-[#6B3480] text-[11px] font-black px-2.5 py-1 rounded-full shadow">
              %{discount}
            </span>
          )}
          {p.img ? (
            <img
              src={p.img}
              alt={p.name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <PackageCheck className="w-16 h-16" />
            </div>
          )}
          <button
            className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-pink-50"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Heart className="w-4 h-4 text-pink-500" />
          </button>
        </div>
        <div className="p-3.5 flex-1 flex flex-col">
          <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wide mb-1 truncate">
            {p.brand || p.category || "JETGO"}
          </div>
          <div className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] leading-snug group-hover:text-purple-700">
            {p.name}
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">(12)</span>
          </div>
          <div className="mt-2.5 flex items-end justify-between">
            <div>
              {p.oldPrice && p.oldPrice > p.price && (
                <div className="text-[11px] text-gray-400 line-through leading-none">{p.oldPrice} TL</div>
              )}
              <div className="text-lg font-black text-[#6B3480] leading-none mt-0.5">{p.price} TL</div>
            </div>
            <button
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B3480] to-[#8B47A8] text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all"
              onClick={(e) => { e.preventDefault(); }}
              data-testid={`btn-demo-add-${p.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </a>
  );
}

export default function DemoAnasayfa() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const active = products.filter(p => p.isActive !== false && p.img && p.price > 0);
  const featured = active.slice(0, 10);
  const popular = active.slice(10, 20);
  const deals = active.filter(p => p.oldPrice && p.oldPrice > p.price).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-white">
      {/* Top promo strip */}
      <div className="bg-gradient-to-r from-[#4a1d96] via-[#6B3480] to-[#4a1d96] text-white text-[12px] font-medium">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 0850 XXX XX XX</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Atakum / Samsun</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 09:00 - 22:00</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#FFC107] font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-[#FFC107]" /> Atakum içi 1 SAATTE teslim
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <a href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-[#FFC107] text-3xl leading-none">🐾</span>
            <span className="text-[#6B3480] font-black text-3xl tracking-tight leading-none">jetgo</span>
          </a>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Mama, kum, oyuncak, marka ara..."
                className="w-full pl-12 pr-32 py-3.5 bg-purple-50/60 border-2 border-purple-100 rounded-2xl text-sm font-medium focus:border-[#6B3480] focus:bg-white outline-none transition-all"
                data-testid="input-demo-search"
              />
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6B3480] to-[#8B47A8] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                Ara
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex flex-col items-center px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-colors">
              <User className="w-5 h-5 text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Giriş</span>
            </button>
            <button className="flex flex-col items-center px-3 py-1.5 hover:bg-purple-50 rounded-xl transition-colors">
              <Heart className="w-5 h-5 text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Favori</span>
            </button>
            <button className="relative flex items-center gap-2 bg-gradient-to-r from-[#6B3480] to-[#8B47A8] text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
              <ShoppingCart className="w-5 h-5" />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium opacity-90">Sepetim</div>
                <div className="text-sm font-bold">0,00 TL</div>
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-[#FFC107] text-[#6B3480] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Mega nav */}
        <nav className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 text-sm">
            {["Köpek", "Kedi", "Kuş", "Kemirgen", "Akvaryum", "Markalar", "Kampanyalar", "Sokak Canlıları", "Blog"].map((c) => (
              <a
                key={c}
                href="#"
                className="px-4 py-3 font-semibold text-gray-700 hover:text-[#6B3480] hover:bg-purple-50/60 transition-colors border-b-2 border-transparent hover:border-[#6B3480]"
              >
                {c}
              </a>
            ))}
            <span className="ml-auto bg-gradient-to-r from-red-500 to-rose-600 text-white text-[12px] font-extrabold px-3 py-1 rounded-full">
              🔥 İndirimler
            </span>
          </div>
        </nav>
      </header>

      {/* HERO + Side panels */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Main hero */}
          <div className="col-span-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#4a1d96] via-[#6B3480] to-[#3b1378] p-10 min-h-[380px] shadow-2xl shadow-purple-300/40">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,193,7,0.4),transparent_60%)]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl" />
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#FFC107]/20 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-md">
              <div className="inline-flex items-center gap-1.5 bg-[#FFC107] text-[#3b1378] px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide mb-4">
                <Sparkles className="w-3.5 h-3.5" /> SADECE ATAKUM İÇİ
              </div>
              <h1 className="text-white font-black text-5xl leading-[1.05] tracking-tight">
                Patilerine en hızlı<br />
                <span className="text-[#FFC107]">teslimat</span> burada.
              </h1>
              <p className="text-purple-100 mt-4 text-base leading-relaxed">
                Mama, kum, oyuncak ve daha fazlası kapında 1 saat içinde. 100+ marka, kapıda ödeme, sıfır endişe.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button className="bg-[#FFC107] hover:bg-yellow-300 text-[#3b1378] font-black px-7 py-3.5 rounded-2xl shadow-xl shadow-yellow-900/20 transition-all hover:scale-105 flex items-center gap-2">
                  Hemen Sipariş Ver <ArrowRight className="w-4 h-4" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/20 font-bold px-6 py-3.5 rounded-2xl transition-all">
                  Kampanyalar
                </button>
              </div>
              <div className="mt-7 flex items-center gap-5 text-white/90 text-[12px] font-medium">
                <span className="flex items-center gap-1.5"><PackageCheck className="w-4 h-4 text-[#FFC107]" /> 1000+ Ürün</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#FFC107]" /> 100+ Marka</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" /> 4.9 / 5</span>
              </div>
            </div>

            <div className="absolute right-8 bottom-6 text-[200px] leading-none opacity-90 select-none pointer-events-none">
              🐶
            </div>
          </div>

          {/* Side promos */}
          <div className="col-span-4 flex flex-col gap-4">
            <div className="flex-1 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600 p-6 relative shadow-xl shadow-rose-200/50">
              <div className="absolute -right-6 -top-6 text-[120px] opacity-90 select-none">🦴</div>
              <div className="relative z-10">
                <span className="inline-block bg-white/25 backdrop-blur text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">YENİ GELEN</span>
                <div className="mt-2 text-white font-black text-2xl leading-tight">Köpek<br />Ödülleri</div>
                <div className="text-white/90 text-[12px] mt-1">%30'a varan indirim</div>
                <button className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-full">
                  İncele <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-6 relative shadow-xl shadow-teal-200/50">
              <div className="absolute -right-6 -top-6 text-[120px] opacity-90 select-none">🐱</div>
              <div className="relative z-10">
                <span className="inline-block bg-white/25 backdrop-blur text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">EN ÇOK SATAN</span>
                <div className="mt-2 text-white font-black text-2xl leading-tight">Kedi<br />Kumları</div>
                <div className="text-white/90 text-[12px] mt-1">Aynı gün teslim</div>
                <button className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-full">
                  İncele <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-7 h-7" />, t: "1 Saatte Teslim", s: "Atakum içi hızlı kargo" },
            { icon: <Banknote className="w-7 h-7" />, t: "Kapıda Ödeme", s: "Nakit, kart veya QR" },
            { icon: <ShieldCheck className="w-7 h-7" />, t: "Güvenli Alışveriş", s: "256-bit SSL koruma" },
            { icon: <Gift className="w-7 h-7" />, t: "Para Puan", s: "Her alışverişe %5" },
          ].map((b, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-[#6B3480]">
                {b.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">{b.t}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{b.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[12px] font-bold text-[#6B3480] uppercase tracking-wider mb-1">Kategoriler</div>
            <h2 className="text-3xl font-black text-gray-900">Patin için her şey</h2>
          </div>
          <a href="#" className="text-sm font-bold text-[#6B3480] hover:underline flex items-center gap-1">
            Tüm kategoriler <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {categories.map((c) => (
            <a
              key={c.key}
              href="#"
              className={`group bg-gradient-to-br ${c.color} rounded-3xl p-5 flex flex-col items-center justify-center aspect-square hover:scale-105 hover:shadow-xl transition-all duration-300 ring-4 ${c.ring} ring-offset-2`}
            >
              <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="mt-3 text-sm font-bold text-gray-800">{c.name}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Flash deals row */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="rounded-3xl bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Flame className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <div className="text-white font-black text-2xl">Şimşek İndirimler</div>
                  <div className="text-white/90 text-[12px]">Stoklarla sınırlı, kaçırma!</div>
                </div>
              </div>
              <a href="#" className="bg-white text-rose-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-105 transition-transform flex items-center gap-1">
                Tüm fırsatlar <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {deals.map(p => <ProductCard key={p.id} p={p} badge="FLAŞ" />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[12px] font-bold text-[#6B3480] uppercase tracking-wider mb-1">Öne Çıkanlar</div>
            <h2 className="text-3xl font-black text-gray-900">Editör seçimleri</h2>
          </div>
          <div className="flex gap-2">
            {["Tümü", "Köpek", "Kedi", "Yeni"].map((t, i) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  i === 0 ? "bg-[#6B3480] text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-[#6B3480] hover:text-[#6B3480]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {featured.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      {/* Banner CTA - feeding calculator */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#6B3480] via-purple-700 to-indigo-800 p-8 relative overflow-hidden min-h-[200px]">
            <div className="absolute -right-4 -bottom-4 text-[150px] opacity-90 select-none">🐾</div>
            <div className="relative z-10">
              <div className="inline-block bg-[#FFC107] text-[#3b1378] text-[10px] font-black px-2 py-1 rounded-full">AKILLI ARAÇ</div>
              <h3 className="mt-3 text-white font-black text-2xl leading-tight">Mama Hesaplayıcı</h3>
              <p className="mt-2 text-purple-100 text-sm">Patinin ihtiyacı kadar mama. Tartı + yaş gir, sana özel hesap çıksın.</p>
              <button className="mt-4 bg-white text-[#6B3480] font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                Hesapla →
              </button>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-8 relative overflow-hidden min-h-[200px]">
            <div className="absolute -right-4 -bottom-4 text-[150px] opacity-90 select-none">🎁</div>
            <div className="relative z-10">
              <div className="inline-block bg-white text-orange-700 text-[10px] font-black px-2 py-1 rounded-full">YENİ ÜYELERE ÖZEL</div>
              <h3 className="mt-3 text-white font-black text-2xl leading-tight">100 TL Hoşgeldin</h3>
              <p className="mt-2 text-white/95 text-sm">İlk siparişinde kullanabileceğin 100 TL'lik hediye kupon seni bekliyor.</p>
              <button className="mt-4 bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                Üye Ol →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular products */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[12px] font-bold text-[#6B3480] uppercase tracking-wider mb-1">Çok Satanlar</div>
            <h2 className="text-3xl font-black text-gray-900">Herkesin tercihi</h2>
          </div>
          <a href="#" className="text-sm font-bold text-[#6B3480] hover:underline flex items-center gap-1">
            Tümünü gör <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        {!isLoading && (
          <div className="grid grid-cols-5 gap-4">
            {popular.map(p => <ProductCard key={p.id} p={p} badge="POPÜLER" />)}
          </div>
        )}
      </section>

      {/* Brands strip */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white border border-gray-100 rounded-3xl p-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[12px] font-bold text-[#6B3480] uppercase tracking-wider mb-1">Markalarımız</div>
              <h2 className="text-2xl font-black text-gray-900">Güvenilir 100+ marka</h2>
            </div>
            <a href="#" className="text-sm font-bold text-[#6B3480] hover:underline flex items-center gap-1">
              Tüm markalar <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {brands.map(b => (
              <a key={b.name} href="#" className="bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 rounded-2xl p-4 aspect-[3/2] flex items-center justify-center transition-all hover:scale-105">
                <img src={b.img} alt={b.name} className="max-h-full max-w-full object-contain" onError={(e) => { const el = e.target as HTMLImageElement; el.outerHTML = `<div class='text-sm font-bold text-gray-600'>${b.name}</div>`; }} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-1 mb-3">
                <span className="text-[#FFC107] text-3xl leading-none">🐾</span>
                <span className="text-white font-black text-3xl tracking-tight">jetgo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Atakum'un en hızlı pet shop teslimatı. 1000+ ürün, 100+ marka, 1 saatte kapında.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="bg-white/10 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Visa</span>
                <span className="bg-white/10 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Mastercard</span>
                <span className="bg-white/10 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Kapıda</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Kurumsal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white">İletişim</a></li>
                <li><a href="#" className="hover:text-white">Mağazamız</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Müşteri Hizmetleri</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Sipariş Takip</a></li>
                <li><a href="#" className="hover:text-white">İade & Teslimat</a></li>
                <li><a href="#" className="hover:text-white">SSS</a></li>
                <li><a href="#" className="hover:text-white">Kampanyalar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">İletişim</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FFC107]" /> Atakum, Samsun</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#FFC107]" /> 0850 XXX XX XX</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#FFC107]" /> 09:00 - 22:00</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
            <div>© 2026 JETGO — Sizpa LTD. Tüm hakları saklıdır.</div>
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full text-purple-300">
              <Tag className="w-3 h-3" /> DEMO TASARIM • Sadece önizleme
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
