import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame, Gift, Clock, TrendingUp, Sparkles, Plus, Minus,
  ShoppingCart, Zap, Users, Package, Star, Bell, Share2,
  Cat, Dog, Bird, Filter, ChevronRight, Heart, Award,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "Tümü", icon: Sparkles, color: "bg-purple-600" },
  { id: "kedi", label: "Kedi", icon: Cat, color: "bg-purple-500" },
  { id: "kopek", label: "Köpek", icon: Dog, color: "bg-orange-500" },
  { id: "kus", label: "Kuş", icon: Bird, color: "bg-yellow-500" },
];

const DEMO_CAMPAIGNS = [
  {
    id: 1, badge: "🔥 SÜPER FIRSAT", category: "kedi",
    title: "Pro Plan Kedi Maması 10kg + 1.5kg HEDİYE",
    img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    oldPrice: 1890, newPrice: 1290, discount: 32,
    stock: 4, soldToday: 47, savings: 600,
    socialProof: "Son 3 saatte 12 kişi aldı",
    tag: "10kg + 1.5kg HEDİYE", color: "from-red-500 to-orange-500",
  },
  {
    id: 2, badge: "🎁 2 AL 1 ÖDE", category: "kedi",
    title: "Catsy Topaklanan Kedi Kumu 10L",
    img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400",
    oldPrice: 358, newPrice: 179, discount: 50,
    stock: 22, soldToday: 89, savings: 179,
    socialProof: "Bu hafta en çok satan",
    tag: "2 AL 1 BEDAVA", color: "from-purple-500 to-pink-500",
  },
  {
    id: 3, badge: "⚡ FLAŞ İNDİRİM", category: "kopek",
    title: "Royal Canin Maxi Adult 15kg",
    img: "https://images.unsplash.com/photo-1601758228055-6c91d6f2d4cc?w=400",
    oldPrice: 2450, newPrice: 1890, discount: 23,
    stock: 8, soldToday: 23, savings: 560,
    socialProof: "Ahmet K. 5 dk önce sipariş verdi",
    tag: "Sadece bugün", color: "from-yellow-500 to-amber-500",
  },
  {
    id: 4, badge: "📦 ÇOKLU PAKET", category: "kedi",
    title: "Reflex Plus Kuzulu 15kg + 2 Konserve",
    img: "https://images.unsplash.com/photo-1574231164645-d6f0e8553590?w=400",
    oldPrice: 1690, newPrice: 1199, discount: 29,
    stock: 15, soldToday: 31, savings: 491,
    socialProof: "9 kişi sepete ekledi",
    tag: "+ 2 KONSERVE HEDİYE", color: "from-blue-500 to-cyan-500",
  },
  {
    id: 5, badge: "💰 SEPETE ÖZEL", category: "kopek",
    title: "Hill's Science Plan Köpek 12kg",
    img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    oldPrice: 1899, newPrice: 1499, discount: 21,
    stock: 11, soldToday: 18, savings: 400,
    socialProof: "1500 TL üstü = Kum HEDİYE",
    tag: "1500 TL+ KUM HEDİYE", color: "from-green-500 to-emerald-500",
  },
  {
    id: 6, badge: "🆕 YENİ ÜYE", category: "kedi",
    title: "N&D Tahılsız Kedi Maması 10kg",
    img: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400",
    oldPrice: 1750, newPrice: 1450, discount: 17,
    stock: 18, soldToday: 12, savings: 300,
    socialProof: "100 TL hoşgeldin kuponun aktif",
    tag: "+ 100 TL KUPON", color: "from-indigo-500 to-violet-500",
  },
];

function CountdownTimer() {
  const [time, setTime] = useState({ d: 2, h: 14, m: 22, s: 47 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((p) => {
        let { d, h, m, s } = p;
        s--; if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-1.5" data-testid="countdown-timer">
      {[
        { v: time.d, l: "GÜN" }, { v: time.h, l: "SAAT" },
        { v: time.m, l: "DK" }, { v: time.s, l: "SN" },
      ].map((b, i) => (
        <div key={i} className="bg-white/20 backdrop-blur rounded-lg px-2.5 py-1.5 min-w-[44px] text-center">
          <div className="text-base md:text-xl font-extrabold leading-none">{String(b.v).padStart(2, "0")}</div>
          <div className="text-[8px] md:text-[9px] font-bold opacity-80 mt-0.5">{b.l}</div>
        </div>
      ))}
    </div>
  );
}

function CampaignCard({ c }: { c: any }) {
  const [qty, setQty] = useState(0);
  const [liked, setLiked] = useState(false);
  const lowStock = c.stock <= 10;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover-elevate transition-all duration-200 shadow-sm hover:shadow-lg"
      data-testid={`demo-campaign-${c.id}`}
    >
      {/* Sol üst indirim rozeti */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <div className={`bg-gradient-to-br ${c.color} text-white text-xs font-extrabold w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
          %{c.discount}
        </div>
      </div>

      {/* Sağ üst favori */}
      <button
        onClick={() => setLiked(!liked)}
        className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white"
        data-testid={`btn-fav-${c.id}`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
      </button>

      {/* Görsel */}
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative overflow-hidden">
        <img src={c.img} alt={c.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />
        {/* Tag overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className={`bg-gradient-to-r ${c.color} text-white text-[10px] font-bold px-3 py-1.5 rounded-lg text-center shadow-lg`}>
            {c.tag}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Sosyal kanıt */}
        <div className="flex items-center gap-1.5 text-[10px] text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
          <TrendingUp className="w-3 h-3" />
          <span className="font-semibold truncate">{c.socialProof}</span>
        </div>

        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]" data-testid={`text-title-${c.id}`}>
          {c.title}
        </h3>

        {/* Fiyat */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-purple-700">
            {c.newPrice.toLocaleString("tr-TR")} TL
          </span>
          <span className="text-xs text-gray-400 line-through">
            {c.oldPrice.toLocaleString("tr-TR")} TL
          </span>
        </div>

        {/* Tasarruf */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200 w-fit">
          <Zap className="w-3 h-3" />
          {c.savings} TL TASARRUF
        </div>

        {/* Stok */}
        {lowStock ? (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1.5 rounded-md border border-red-200">
            <Package className="w-3 h-3" />
            Sadece {c.stock} adet kaldı! · Bugün {c.soldToday} satıldı
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
            <Users className="w-3 h-3" />
            Bugün {c.soldToday} kişi aldı
          </div>
        )}

        {/* Aksiyon */}
        {qty === 0 ? (
          <Button
            onClick={() => setQty(1)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 rounded-xl shadow-md"
            data-testid={`btn-add-${c.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            Sepete Ekle
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-purple-50 border-2 border-purple-200 rounded-xl p-1.5">
            <Button
              size="sm" variant="ghost"
              onClick={() => setQty(Math.max(0, qty - 1))}
              className="h-8 w-8 p-0 rounded-lg hover:bg-purple-100"
              data-testid={`btn-minus-${c.id}`}
            >
              <Minus className="w-4 h-4 text-purple-700" />
            </Button>
            <span className="font-extrabold text-purple-900 text-base" data-testid={`text-qty-${c.id}`}>{qty}</span>
            <Button
              size="sm" variant="ghost"
              onClick={() => setQty(qty + 1)}
              className="h-8 w-8 p-0 rounded-lg hover:bg-purple-100"
              data-testid={`btn-plus-${c.id}`}
            >
              <Plus className="w-4 h-4 text-purple-700" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignDemoPage() {
  const [activeCat, setActiveCat] = useState("all");
  const filtered = useMemo(() => {
    if (activeCat === "all") return DEMO_CAMPAIGNS;
    return DEMO_CAMPAIGNS.filter(c => c.category === activeCat);
  }, [activeCat]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Demo uyarısı */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <p className="text-xs font-bold text-yellow-900">
          🎨 DEMO SAYFA — Onay verirseniz canlı kampanya sayfasına uygulanacak
        </p>
      </div>

      {/* HERO — Geri sayım */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className="bg-yellow-400 text-purple-900 font-extrabold text-sm px-3 py-1">
              <Flame className="w-4 h-4 mr-1" /> KAMPANYA HAFTASI
            </Badge>
            <Badge className="bg-white/20 backdrop-blur text-white font-bold text-xs px-3 py-1">
              🔥 {DEMO_CAMPAIGNS.length} aktif kampanya
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight">
            Kampanyalı Ürünlere<br/>
            <span className="text-yellow-300">%50'ye Varan İndirim!</span>
          </h1>
          <p className="text-sm md:text-base text-white/90 mb-5">
            Kaçırma — sınırlı stok, sınırlı süre. Hemen sepetini doldur.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-[11px] font-semibold text-white/70 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> KAMPANYA BİTMESİNE
              </p>
              <CountdownTimer />
            </div>

            <div className="hidden md:block h-12 w-px bg-white/20" />

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white text-[11px] py-1.5 px-2.5">
                <Award className="w-3 h-3 mr-1" /> %5 Para Puan
              </Badge>
              <Badge className="bg-white/20 text-white text-[11px] py-1.5 px-2.5">
                <Package className="w-3 h-3 mr-1" /> Aynı gün teslim
              </Badge>
              <Badge className="bg-white/20 text-white text-[11px] py-1.5 px-2.5">
                <Star className="w-3 h-3 mr-1" /> Kapıda ödeme
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Kategori Filtre */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  active
                    ? `${cat.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                data-testid={`filter-${cat.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bonus banner */}
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl p-4 flex items-center gap-3 cursor-pointer hover-elevate">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🎰</div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm">Çark Çevir</p>
              <p className="text-[11px] text-white/90">Günde 1 hak — kargo bedava kazan</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 flex items-center gap-3 cursor-pointer hover-elevate">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">📲</div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm">Paylaş & Kazan</p>
              <p className="text-[11px] text-white/90">WhatsApp paylaş → 25 TL Para Puan</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-4 flex items-center gap-3 cursor-pointer hover-elevate">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🔔</div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm">Kampanya Hatırlat</p>
              <p className="text-[11px] text-white/90">Yeni kampanyada SMS gönder</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Kampanya kartları */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Aktif Kampanyalar
          </h2>
          <span className="text-xs text-gray-500 font-semibold">
            {filtered.length} ürün
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((c) => <CampaignCard key={c.id} c={c} />)}
        </div>
      </div>

      {/* Mahalleli komşuların aldığı */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📍</span>
            <div>
              <h3 className="text-base font-extrabold text-purple-900">Atakum'da Bu Hafta En Çok Alınan</h3>
              <p className="text-xs text-purple-700">Komşularının seçimi — sıralama gerçek satışlara göre</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {DEMO_CAMPAIGNS.slice(0, 4).map((c) => (
              <div key={c.id} className="shrink-0 w-32 bg-white rounded-xl border border-purple-100 p-2">
                <img src={c.img} alt={c.title} className="w-full h-20 object-cover rounded-lg" />
                <p className="text-[10px] font-bold text-gray-800 mt-1.5 line-clamp-2">{c.title}</p>
                <p className="text-xs font-extrabold text-purple-700 mt-1">{c.newPrice} TL</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 mt-8 text-center">
        <p className="text-xs text-gray-500">
          Tüm kampanyalar PayTR güvenli ödeme ile · 3 taksit + 9 ay taksit imkanı
        </p>
      </div>
    </div>
  );
}
