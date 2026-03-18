import { useState, useEffect } from "react";
import {
  Search, Truck, CreditCard, Banknote, Smartphone, Tag,
  ArrowRight, ChevronRight, Star, Clock, Shield, Sparkles,
  Heart, MessageCircle, PawPrint, Gift, Zap, MapPin
} from "lucide-react";

const HERO_SLIDES = [
  {
    title: "Mama Bitti\nPanik Yok! 🐾",
    subtitle: "Samsun'da 1 saatte kapına gelsin",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    accent: "#ff6f00",
  },
  {
    title: "Büyük\nKampanya 🎉",
    subtitle: "Ana mama + ekstra ürün fırsatları",
    gradient: "from-purple-600 via-violet-500 to-fuchsia-400",
    accent: "#7c3aed",
  },
  {
    title: "Yeni Üyelere\nÖzel Fırsat ✨",
    subtitle: "İlk siparişte %5 para puan kazan",
    gradient: "from-emerald-500 via-teal-500 to-cyan-400",
    accent: "#059669",
  },
];

const CATEGORIES = [
  { name: "Köpek", emoji: "🐕", img: "/__mockup/images/cat-dog.webp", color: "from-amber-400 to-orange-500" },
  { name: "Kedi", emoji: "🐱", img: "/__mockup/images/cat-cat.webp", color: "from-pink-400 to-rose-500" },
  { name: "Kuş", emoji: "🐦", img: "/__mockup/images/cat-bird.webp", color: "from-sky-400 to-blue-500" },
  { name: "Kemirgen", emoji: "🐹", img: "/__mockup/images/cat-rabbit.webp", color: "from-lime-400 to-green-500" },
];

const QUICK_ACTIONS = [
  { icon: Truck, label: "1 Saatte\nTeslimat", color: "#ff6f00", bg: "bg-orange-50" },
  { icon: CreditCard, label: "12 Ay\nTaksit", color: "#7c3aed", bg: "bg-purple-50" },
  { icon: Banknote, label: "Kapıda\nÖdeme", color: "#059669", bg: "bg-emerald-50" },
  { icon: Smartphone, label: "QR ile\nÖdeme", color: "#0284c7", bg: "bg-sky-50" },
];

const TRENDING = [
  { name: "Royal Canin Fit 32 Kedi Maması 15 kg", price: "4.950", oldPrice: "5.507", img: "/__mockup/images/cat-cat.webp", discount: 10 },
  { name: "N&D Tavuklu Köpek Maması 12 kg", price: "4.200", oldPrice: "4.900", img: "/__mockup/images/cat-dog.webp", discount: 14 },
  { name: "Van Cat Karbonlu Kedi Kumu 10 Lt", price: "243", oldPrice: "326", img: "/__mockup/images/cat-cat.webp", discount: 25 },
  { name: "Hill's Science Plan Kedi 7 kg", price: "4.899", oldPrice: "6.945", img: "/__mockup/images/cat-cat.webp", discount: 29 },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative overflow-hidden rounded-2xl mx-3 mt-2">
      <div
        className={`bg-gradient-to-br ${slide.gradient} p-5 pb-6 transition-all duration-700`}
        style={{ minHeight: 160 }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white whitespace-pre-line leading-tight drop-shadow-sm">
            {slide.title}
          </h2>
          <p className="text-white/90 text-sm mt-2 font-medium">{slide.subtitle}</p>
          <button className="mt-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 flex items-center gap-1.5 active:scale-95 transition-transform">
            Hemen Keşfet <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="absolute right-3 bottom-2 opacity-20 text-8xl">
          🐾
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SearchSection() {
  return (
    <div className="mx-3 mt-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
        <input
          type="text"
          placeholder="Ürün, marka veya kategori ara..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200/80 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300 transition-all"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-orange-500 text-white rounded-lg p-1.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="mx-3 mt-4">
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((a, i) => (
          <div
            key={i}
            className={`${a.bg} rounded-xl p-2.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform cursor-pointer`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: a.color + "15" }}
            >
              <a.icon className="w-4.5 h-4.5" style={{ color: a.color }} />
            </div>
            <span
              className="text-[10px] font-bold text-center leading-tight whitespace-pre-line"
              style={{ color: a.color }}
            >
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignBanner() {
  return (
    <div className="mx-3 mt-4">
      <div
        className="relative overflow-hidden rounded-xl p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
        style={{ background: "linear-gradient(135deg, #6B3480 0%, #9b59b6 50%, #c39bd3 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-extrabold">Kampanyalı Ürünler</p>
            <p className="text-white/70 text-[11px] mt-0.5">Ana mama + ek ürün fırsatları</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function CategoryGrid() {
  return (
    <div className="mx-3 mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold text-gray-900">Kategoriler</h3>
        <button className="text-xs text-orange-500 font-semibold flex items-center gap-0.5">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
            <div className={`w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${cat.color} p-[3px]`}>
              <div className="w-full h-full rounded-[13px] overflow-hidden bg-white">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-xs font-bold text-gray-800">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingProducts() {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mx-3 mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-orange-500" />
          <h3 className="text-base font-extrabold text-gray-900">Popüler Ürünler</h3>
        </div>
        <button className="text-xs text-orange-500 font-semibold flex items-center gap-0.5">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-3 pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {TRENDING.map((p, i) => (
          <div key={i} className="min-w-[150px] max-w-[150px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0 cursor-pointer active:scale-[0.97] transition-transform">
            <div className="relative aspect-square bg-gray-50 p-2">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover rounded-lg" />
              {p.discount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  %{p.discount}
                </span>
              )}
              <button className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
                <Heart className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight min-h-[28px]">
                {p.name}
              </p>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-sm font-extrabold text-gray-900">{p.price} ₺</span>
                {p.oldPrice && (
                  <span className="text-[10px] text-gray-400 line-through">{p.oldPrice} ₺</span>
                )}
              </div>
              <button className="w-full mt-2 bg-orange-500 text-white text-[11px] font-bold py-1.5 rounded-lg active:bg-orange-600 transition-colors flex items-center justify-center gap-1">
                <PawPrint className="w-3 h-3" /> Sepete Ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="mx-3 mt-5">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-3.5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Hızlı Teslimat", sub: "1 saat içinde", color: "#f59e0b" },
            { icon: Shield, label: "Güvenli Alışveriş", sub: "256-bit SSL", color: "#10b981" },
            { icon: Star, label: "Müşteri Memnuniyeti", sub: "4.9 puan", color: "#6366f1" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 text-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: b.color + "15" }}
              >
                <b.icon className="w-4 h-4" style={{ color: b.color }} />
              </div>
              <span className="text-[10px] font-bold text-gray-800">{b.label}</span>
              <span className="text-[9px] text-gray-400">{b.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocationBanner() {
  return (
    <div className="mx-3 mt-4">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 flex items-center gap-3 border border-emerald-100">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800">Samsun İçi Teslimat</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Atakum, İlkadım, Canik bölgelerine teslimat</p>
        </div>
      </div>
    </div>
  );
}

function AIChatTeaser() {
  return (
    <div className="mx-3 mt-4">
      <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 rounded-xl p-4 overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-extrabold">Yapay Zeka Asistanı</p>
            <p className="text-white/70 text-[11px] mt-0.5 leading-relaxed">Evcil hayvanınız hakkında sorularınızı cevaplayalım</p>
            <button className="mt-2.5 bg-white/20 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Soru Sor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileFooter() {
  return (
    <div className="mx-3 mt-5 mb-20">
      <div className="bg-gray-50 rounded-xl border border-gray-200/80 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            "SSS", "İletişim", "Hakkımızda", "Teslimat ve İade",
            "KVKK", "Gizlilik", "Kullanım Koşulları", "Çerez Politikası"
          ].map((l) => (
            <span key={l} className="text-[11px] text-gray-500 py-0.5 cursor-pointer hover:text-gray-700 transition-colors">
              {l}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-green-700 font-semibold">SSL Güvenli</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-[10px] font-bold" style={{ color: "#1a1f71" }}>VISA</span>
            <span className="text-[10px] font-bold" style={{ color: "#eb001b" }}>MC</span>
          </div>
        </div>
        <p className="text-[9px] text-gray-400 text-center">© 2026 Sizpa İnternet Tic. Ltd. Şti.</p>
      </div>
    </div>
  );
}

function BottomNav() {
  const tabs = [
    { icon: PawPrint, label: "Ana Sayfa", active: true },
    { icon: Search, label: "Kategoriler", active: false },
    { icon: Heart, label: "Favoriler", active: false },
    { icon: Tag, label: "Sepet", active: false },
    { icon: Truck, label: "Takip", active: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 px-2 py-1 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((t, i) => (
          <button key={i} className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-[56px] cursor-pointer">
            <div className={`p-1.5 rounded-xl transition-all ${t.active ? "bg-orange-500 shadow-lg shadow-orange-500/30" : ""}`}>
              <t.icon className={`w-4.5 h-4.5 ${t.active ? "text-white" : "text-gray-400"}`} />
            </div>
            <span className={`text-[9px] font-bold ${t.active ? "text-orange-500" : "text-gray-400"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Modern() {
  return (
    <div className="min-h-screen bg-white" style={{ maxWidth: 430 }}>
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900 tracking-tight">JETGO</h1>
              <p className="text-[9px] text-gray-400 font-medium -mt-0.5">Sen İste, Jet İle Gelsin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
              <Heart className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 relative">
              <Tag className="w-4 h-4 text-orange-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>
          </div>
        </div>
      </div>

      <SearchSection />
      <HeroCarousel />
      <QuickActions />
      <CampaignBanner />
      <CategoryGrid />
      <TrendingProducts />
      <LocationBanner />
      <AIChatTeaser />
      <TrustBadges />
      <MobileFooter />
      <BottomNav />
    </div>
  );
}
