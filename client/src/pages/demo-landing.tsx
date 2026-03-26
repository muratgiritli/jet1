import { useState, useEffect } from "react";
import { 
  Truck, 
  CreditCard, 
  Package, 
  Gift, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  ChevronRight, 
  Smartphone, 
  Banknote,
  Home,
  Search,
  ShoppingBag,
  User,
  Bell
} from "lucide-react";

export default function DemoLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gray-50 max-w-md mx-auto text-slate-800 overflow-x-hidden relative select-none" style={{ WebkitTapHighlightColor: "transparent" }}>
      
      <header className={`flex items-center justify-between px-4 h-14 sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100/80" : "bg-white"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/25">
            J
          </div>
          <div className="leading-none">
            <h1 className="font-black text-lg tracking-tight text-slate-900">JETGO</h1>
            <span className="text-[9px] font-bold text-orange-500 tracking-[0.15em] uppercase">Hızlı Petshop</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform">
            <Bell className="w-4.5 h-4.5 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">2</span>
          </button>
          <button className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center active:scale-90 transition-transform">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center gap-2">
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="font-semibold text-[11px] text-white tracking-wide">Teslimat aktif — Atakum bölgesinde hizmet veriyoruz</span>
      </div>

      <section className="relative px-4 pt-8 pb-14 bg-gradient-to-b from-orange-50 via-amber-50/60 to-gray-50 overflow-hidden">
        <div className="absolute top-0 right-[-15%] w-72 h-72 bg-gradient-to-br from-amber-300/15 to-orange-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-15%] w-56 h-56 bg-gradient-to-tr from-yellow-200/15 to-amber-400/15 rounded-full blur-3xl" />
        
        <div className="absolute right-2 top-8 opacity-[0.04] pointer-events-none">
          <span className="text-[140px] leading-none">🐾</span>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-[11px] font-bold tracking-wide mb-5 border border-orange-500/15">
            <MapPin className="w-3 h-3" />
            Samsun Atakum
          </div>

          <h2 className="text-[28px] font-black text-slate-900 leading-[1.15] mb-2">
            60 Dakikada
          </h2>
          <h2 className="text-[28px] font-black leading-[1.15] mb-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Kapında</span>{" "}
            <span className="text-slate-900">Petshop</span>
          </h2>
          <p className="text-slate-500 text-sm mt-3 mb-6 leading-relaxed max-w-[280px]">
            Evcil dostun için ihtiyacın olan her şey, bir tıkla kapında.
          </p>

          <div className="flex gap-2 mb-6">
            {[
              { icon: Truck, text: "1 Saat", color: "text-orange-500", bg: "bg-orange-500/8" },
              { icon: CreditCard, text: "Kapıda Ödeme", color: "text-emerald-600", bg: "bg-emerald-500/8" },
              { icon: MapPin, text: "Atakum Aktif", color: "text-blue-500", bg: "bg-blue-500/8" },
            ].map((b, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-2.5 py-2 ${b.bg} rounded-xl text-[11px] font-semibold ${b.color}`}>
                <b.icon className="w-3.5 h-3.5" />
                {b.text}
              </div>
            ))}
          </div>

          <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-[15px] py-3.5 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-[0.97] transition-transform flex items-center justify-center gap-2" data-testid="btn-demo-order">
            Hemen Sipariş Ver
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="px-4 -mt-6 relative z-20 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1 flex gap-1">
          {[
            { icon: Clock, label: "1 Saat\nTeslimat", color: "text-orange-500" },
            { icon: Package, label: "900+\nÜrün", color: "text-blue-500" },
            { icon: CreditCard, label: "Kapıda\nÖdeme", color: "text-emerald-500" },
            { icon: Gift, label: "Para\nPuan", color: "text-purple-500" },
          ].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl active:bg-slate-50 transition-colors">
              <v.icon className={`w-5 h-5 ${v.color}`} />
              <span className="text-[10px] font-bold text-slate-700 text-center leading-tight whitespace-pre-line">{v.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-slate-900">Kategoriler</h2>
          <button className="text-xs font-bold text-orange-500 flex items-center gap-0.5 active:opacity-70">
            Tümü <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "🐶", name: "Köpek", gradient: "from-amber-100 to-orange-100" },
            { emoji: "🐱", name: "Kedi", gradient: "from-pink-100 to-rose-100" },
            { emoji: "🦜", name: "Kuş", gradient: "from-sky-100 to-blue-100" },
            { emoji: "🐹", name: "Kemirgen", gradient: "from-lime-100 to-green-100" },
          ].map((cat) => (
            <div key={cat.name} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform cursor-pointer">
              <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                <span className="text-3xl">{cat.emoji}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mb-6">
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 rounded-2xl p-4 text-white flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -left-3 -bottom-3 w-14 h-14 rounded-full bg-white/5" />
          <div className="relative z-10">
            <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold mb-1.5 backdrop-blur-sm">FIRSAT</span>
            <h3 className="text-base font-black mb-0.5">Kampanyalı Ürünler</h3>
            <p className="text-purple-200 text-[11px] font-medium">Mama + ek ürün fırsatları</p>
          </div>
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shrink-0 relative z-10">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </section>

      <section className="px-4 mb-6">
        <h2 className="text-base font-extrabold text-slate-900 mb-3">Ödeme Seçenekleri</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Smartphone, label: "Kapıda\nQR", color: "#0284c7", bg: "bg-sky-50" },
            { icon: CreditCard, label: "Kapıda\nPOS", color: "#7c3aed", bg: "bg-purple-50" },
            { icon: Banknote, label: "Kapıda\nNakit", color: "#059669", bg: "bg-emerald-50" },
            { icon: CreditCard, label: "Kredi\nTaksit", color: "#ea580c", bg: "bg-orange-50" },
          ].map((p, i) => (
            <div key={i} className={`${p.bg} rounded-xl p-2.5 flex flex-col items-center gap-1.5 active:scale-90 transition-transform`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color + "12" }}>
                <p.icon className="w-4 h-4" style={{ color: p.color }} />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight whitespace-pre-line" style={{ color: p.color }}>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-center">Neden JETGO?</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { icon: Truck, title: "1 Saat Teslimat", desc: "Siparişin anında kapında", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Shield, title: "Güvenli Alışveriş", desc: "256-bit SSL koruması", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Star, title: "4.9 Müşteri Puanı", desc: "Binlerce mutlu müşteri", color: "text-amber-500", bg: "bg-amber-50" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 active:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800">{t.title}</h4>
                  <p className="text-[11px] text-slate-400">{t.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 mb-6">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4 flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="absolute w-10 h-10 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <div>
            <p className="text-[11px] text-emerald-600 font-medium">Bugün şu ana kadar</p>
            <p className="text-lg font-extrabold text-emerald-800">120+ sipariş <span className="text-sm font-medium text-emerald-600">teslim edildi</span></p>
          </div>
        </div>
      </section>

      <footer className="px-4 pt-6 pb-28 text-center">
        <div className="inline-flex items-center gap-1.5 mb-3 text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
          <Shield className="w-3 h-3" />
          SSL Güvenli
        </div>
        <p className="text-xs font-semibold text-slate-600 mb-0.5">Sizpa İnternet Tic. Ltd. Şti.</p>
        <p className="text-[10px] text-slate-400">Mimar Sinan Mah. Atakum / Samsun</p>
        <p className="text-[9px] text-slate-300 mt-3">© 2025 Tüm hakları saklıdır.</p>
      </footer>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-slate-200/80 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { id: "home", icon: Home, label: "Ana Sayfa" },
            { id: "categories", icon: Search, label: "Keşfet" },
            { id: "cart", icon: ShoppingBag, label: "Sepet", badge: 3 },
            { id: "profile", icon: User, label: "Hesabım" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 w-16 py-1 rounded-xl transition-colors active:scale-90 ${
                activeTab === tab.id ? "" : ""
              }`}
            >
              <div className="relative">
                <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? "text-orange-500" : "text-slate-400"}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{tab.badge}</span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${activeTab === tab.id ? "text-orange-500" : "text-slate-400"}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
