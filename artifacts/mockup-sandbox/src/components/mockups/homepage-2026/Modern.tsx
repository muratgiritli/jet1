import { useState } from "react";

const NAV_ITEMS = ["Kedi", "Köpek", "Kuş", "Kemirgen", "Akvaryum"];

const BRANDS = [
  { name: "Royal Canin", color: "#E2001A" },
  { name: "Pro Plan", color: "#003DA5" },
  { name: "N&D", color: "#2E7D32" },
  { name: "Hill's", color: "#1565C0" },
  { name: "Reflex", color: "#F57C00" },
  { name: "Felicia", color: "#7B1FA2" },
];

const CATEGORIES = [
  { icon: "🐱", name: "Kedi Maması", count: 320, color: "#FF6B35", bg: "from-orange-50 to-orange-100" },
  { icon: "🐶", name: "Köpek Maması", count: 280, color: "#2563EB", bg: "from-blue-50 to-blue-100" },
  { icon: "🐦", name: "Kuş Yemi", count: 85, color: "#16A34A", bg: "from-green-50 to-green-100" },
  { icon: "🐹", name: "Kemirgen", count: 60, color: "#9333EA", bg: "from-purple-50 to-purple-100" },
  { icon: "🐠", name: "Akvaryum", count: 45, color: "#0891B2", bg: "from-cyan-50 to-cyan-100" },
  { icon: "🧴", name: "Bakım & Sağlık", count: 150, color: "#DB2777", bg: "from-pink-50 to-pink-100" },
];

const PRODUCTS = [
  { name: "Royal Canin Indoor 27 Kedi Maması 10 kg", price: 2890, oldPrice: 3450, brand: "Royal Canin", rating: 4.8, reviews: 124, img: "🐱", badge: "En Çok Satan" },
  { name: "Pro Plan Somonlu Yetişkin Köpek Maması 14 kg", price: 3250, oldPrice: 3890, brand: "Pro Plan", rating: 4.7, reviews: 89, img: "🐶", badge: "İndirimli" },
  { name: "N&D Tavuklu Kısırlaştırılmış Kedi Maması 10 kg", price: 3150, oldPrice: 3800, brand: "N&D", rating: 4.9, reviews: 156, img: "🐱", badge: "Yeni" },
  { name: "Hill's Science Plan Kuzu Etli Köpek Maması 14 kg", price: 3680, oldPrice: 4200, brand: "Hill's", rating: 4.6, reviews: 67, img: "🐶", badge: null },
  { name: "Reflex Plus Somonlu Kedi Maması 15 kg", price: 1890, oldPrice: 2350, brand: "Reflex", rating: 4.5, reviews: 203, img: "🐱", badge: "Fırsat" },
  { name: "Felicia Kuzu Etli Köpek Maması 15 kg", price: 2450, oldPrice: 2890, brand: "Felicia", rating: 4.4, reviews: 78, img: "🐶", badge: null },
];

const FEATURES = [
  { icon: "🚀", title: "1 Saat Teslimat", desc: "Siparişiniz 1 saat içinde kapınızda" },
  { icon: "💳", title: "Kapıda Ödeme", desc: "Nakit, kart veya QR ile ödeme" },
  { icon: "🎁", title: "%5 Para Puan", desc: "Her alışverişte puan kazanın" },
  { icon: "🔒", title: "Orijinal Ürün", desc: "Garantili orijinal ürünler" },
];

export function Modern() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [activeNav, setActiveNav] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span>📍</span> Samsun / Atakum
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Teslimat Aktif
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-300">
            <span>📞 0850 123 45 67</span>
            <span>•</span>
            <span>Her gün 10:00 - 19:00</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white text-lg font-black">J</span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">JETGO</span>
              <p className="text-[10px] text-gray-400 -mt-0.5 font-medium tracking-widest uppercase">Pet Shop</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onMouseEnter={() => setActiveNav(item)}
                onMouseLeave={() => setActiveNav(null)}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-200"
                style={activeNav === item ? { backgroundColor: "#FFF7ED", color: "#EA580C" } : {}}
              >
                {item}
                {activeNav === item && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
            <button className="px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg shadow-purple-200 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              Kampanya
            </button>
          </nav>

          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Ürün, marka veya kategori ara..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span>👤</span> Giriş Yap
            </button>
            <button className="relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-orange-200 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
              <span>🛒</span> Sepet
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">3</span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 40%, #F0FDF4 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-40 w-64 h-64 bg-green-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur rounded-full text-sm font-medium text-orange-700 shadow-sm border border-orange-100 mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Aynı gün teslimat aktif
              </div>
              <h1 className="text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                Evcil Dostunuz
                <br />
                İçin <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">En İyisi</span>
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-md">
                900+ orijinal ürün, aynı gün teslimat. Evcil hayvanınızın ihtiyaçlarını bir tıkla karşılayın.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <button className="px-8 py-4 text-base font-bold text-white rounded-2xl shadow-xl shadow-orange-200 transition-all hover:shadow-2xl hover:shadow-orange-300 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
                  Alışverişe Başla →
                </button>
                <button className="px-8 py-4 text-base font-semibold text-gray-700 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  Kampanyaları Gör
                </button>
              </div>
              <div className="mt-10 flex items-center gap-8">
                {[
                  { val: "900+", label: "Ürün" },
                  { val: "1 Saat", label: "Teslimat" },
                  { val: "4.8★", label: "Müşteri Puanı" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-gray-900">{s.val}</p>
                    <p className="text-sm text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full aspect-square bg-gradient-to-br from-orange-100 to-amber-50 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-orange-100/50 border border-orange-100/50">
                <div className="text-[180px] leading-none">🐕</div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">✅</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Orijinal Ürün</p>
                    <p className="text-xs text-gray-400">Garantili & Güvenilir</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">🚀</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">1 Saat Teslimat</p>
                    <p className="text-xs text-gray-400">Kapınıza kadar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2">Kategoriler</p>
            <h2 className="text-3xl font-black text-gray-900">Ne Arıyorsunuz?</h2>
          </div>
          <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            Tümünü Gör →
          </button>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${cat.bg} border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <span className="text-5xl block mb-4">{cat.icon}</span>
              <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
              <p className="text-xs mt-1" style={{ color: cat.color }}>{cat.count} ürün</p>
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <span className="text-xs">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2">Popüler Ürünler</p>
              <h2 className="text-3xl font-black text-gray-900">Çok Satanlar</h2>
            </div>
            <div className="flex items-center gap-2">
              {["Tümü", "Kedi", "Köpek"].map((tab) => (
                <button key={tab} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "Tümü" ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {PRODUCTS.map((p, i) => {
              const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredProduct(i)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 flex items-center justify-center">
                    <span className="text-8xl transition-transform duration-300 group-hover:scale-110">{p.img}</span>
                    {p.badge && (
                      <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded-lg shadow"
                        style={{ background: p.badge === "En Çok Satan" ? "#F97316" : p.badge === "Yeni" ? "#16A34A" : p.badge === "İndirimli" ? "#EF4444" : "#7C3AED" }}>
                        {p.badge}
                      </span>
                    )}
                    <span className="absolute top-4 right-4 px-2 py-1 text-xs font-bold text-red-600 bg-red-50 rounded-lg border border-red-100">
                      %{discount}
                    </span>
                    <div className={`absolute bottom-4 right-4 flex gap-2 transition-all duration-300 ${hoveredProduct === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                      <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100">
                        ❤️
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 font-medium mb-1">{p.brand}</p>
                    <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-medium text-gray-700">{p.rating}</span>
                      <span className="text-xs text-gray-400">({p.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-xl font-black text-gray-900">{p.price.toLocaleString("tr-TR")} ₺</span>
                        <span className="text-sm text-gray-400 line-through ml-2">{p.oldPrice.toLocaleString("tr-TR")} ₺</span>
                      </div>
                      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 transition-transform hover:scale-110"
                        style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2">Güvenilir Markalar</p>
          <h2 className="text-3xl font-black text-gray-900">Popüler Markalar</h2>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {BRANDS.map((b) => (
            <div key={b.name} className="group p-6 bg-white rounded-2xl border border-gray-100 text-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:border-orange-200">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white text-xl font-black mb-3 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)` }}>
                {b.name.charAt(0)}
              </div>
              <p className="font-bold text-gray-900 text-sm">{b.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl p-12" style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)" }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative grid grid-cols-2 items-center gap-12">
            <div>
              <h2 className="text-4xl font-black text-white leading-tight">
                İlk Siparişine<br />
                <span className="text-amber-200">100 ₺ İndirim!</span>
              </h2>
              <p className="mt-4 text-orange-100 text-lg">Hemen üye ol, hoş geldin kuponu senin olsun.</p>
              <button className="mt-8 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                Hemen Üye Ol →
              </button>
            </div>
            <div className="text-center">
              <span className="text-[120px]">🎁</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-black">J</span>
                </div>
                <span className="text-xl font-black text-white">JETGO</span>
              </div>
              <p className="text-sm leading-relaxed">Samsun'un en hızlı pet shop teslimat servisi. Evcil dostlarınız için en iyisi.</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4">Hızlı Linkler</p>
              {["Hakkımızda", "SSS", "Kargo Bilgileri", "İade Politikası"].map(l => (
                <p key={l} className="text-sm py-1.5 hover:text-white cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4">Kategoriler</p>
              {["Kedi Maması", "Köpek Maması", "Kuş Yemi", "Kemirgen", "Akvaryum"].map(l => (
                <p key={l} className="text-sm py-1.5 hover:text-white cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4">İletişim</p>
              <p className="text-sm py-1.5">📍 Atakum, Samsun</p>
              <p className="text-sm py-1.5">📞 0850 123 45 67</p>
              <p className="text-sm py-1.5">✉️ info@jetgo.pet</p>
              <div className="flex gap-3 mt-4">
                {["📘", "📸", "🐦"].map((s, i) => (
                  <span key={i} className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-lg cursor-pointer hover:bg-gray-700 transition-colors">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex items-center justify-between">
            <p className="text-sm">© 2026 JETGO Pet Shop. Tüm hakları saklıdır.</p>
            <p className="text-sm">Sizpa İnternet Tic. Ltd. Şti.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}