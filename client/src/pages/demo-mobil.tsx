import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Search, ShoppingCart, Heart, Menu, MapPin, Bell,
  Gift, ChevronRight, Star, Flame, Truck, ShieldCheck,
  Sparkles, Download, Smartphone, X, ArrowRight, Zap,
} from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

const APP_STORE_URL = "https://apps.apple.com/";
const PLAY_STORE_URL = "https://play.google.com/store";

const categories = [
  { key: "kopek", name: "Köpek", emoji: "🐶", color: "from-amber-100 to-orange-200" },
  { key: "kedi", name: "Kedi", emoji: "🐱", color: "from-purple-100 to-fuchsia-200" },
  { key: "kus", name: "Kuş", emoji: "🦜", color: "from-sky-100 to-cyan-200" },
  { key: "kemirgen", name: "Kemirgen", emoji: "🐹", color: "from-rose-100 to-pink-200" },
  { key: "akvaryum", name: "Akvaryum", emoji: "🐠", color: "from-teal-100 to-emerald-200" },
  { key: "sokak", name: "Sokak", emoji: "🐾", color: "from-amber-100 to-yellow-200" },
];

const mockProducts = [
  { id: 1, name: "Royal Canin Kedi Maması 2kg", price: 489, oldPrice: 620, img: "🐱" },
  { id: 2, name: "Pro Plan Köpek Maması 3kg", price: 549, oldPrice: 680, img: "🐶" },
  { id: 3, name: "Hill's Yavru Kedi 1.5kg", price: 399, oldPrice: 460, img: "🍖" },
  { id: 4, name: "N&D Tahılsız Köpek 2.5kg", price: 645, oldPrice: 790, img: "🥩" },
];

export default function DemoMobil() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [topAppBannerOpen, setTopAppBannerOpen] = useState(true);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const storeUrl = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
  const storeName = platform === "ios" ? "App Store" : "Google Play";
  const StoreIcon = platform === "ios" ? SiApple : SiGoogleplay;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-white max-w-md mx-auto relative pb-32" data-testid="page-demo-mobil">
      {/* Smart App Banner — iOS/Android style top */}
      {topAppBannerOpen && (
        <div className="bg-gradient-to-r from-[#4a1d96] to-[#6B3480] text-white px-3 py-2.5 flex items-center gap-2 sticky top-0 z-50 shadow-md" data-testid="banner-smart-app">
          <button onClick={() => setTopAppBannerOpen(false)} className="p-0.5" data-testid="button-close-smart-banner">
            <X className="w-4 h-4 text-white/70" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center text-xl">🐾</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold leading-tight">JETGO Mobil</div>
            <div className="text-[10px] text-white/80 leading-tight flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-[#FFC107] text-[#FFC107]" />
              <span>4.9 · Ücretsiz</span>
            </div>
          </div>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FFC107] text-[#3b1378] font-black text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1"
            data-testid="link-smart-banner-install"
          >
            <Download className="w-3 h-3" /> AÇ
          </a>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" style={{ top: topAppBannerOpen ? 56 : 0 }}>
        <div className="px-3 py-3 flex items-center gap-2">
          <button className="p-1.5" data-testid="button-menu">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <Link href="/demo-mobil" className="flex items-center gap-0.5 shrink-0">
            <span className="text-[#FFC107] text-2xl leading-none">🐾</span>
            <span className="text-[#6B3480] font-black text-2xl tracking-tight leading-none">jetgo</span>
          </Link>
          <div className="flex-1" />
          <button className="p-1.5 relative" data-testid="button-notifications">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-1.5 relative" data-testid="button-cart">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <span className="absolute -top-0.5 -right-0.5 bg-[#FFC107] text-[#6B3480] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">2</span>
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Mama, kum, oyuncak ara..."
              className="w-full pl-9 pr-3 py-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-sm font-medium focus:border-[#6B3480] focus:bg-white outline-none transition-all"
              data-testid="input-search-mobile"
            />
          </div>
        </div>
        <div className="px-3 pb-2 flex items-center gap-1.5 text-[11px] text-gray-600">
          <MapPin className="w-3 h-3 text-[#6B3480]" />
          <span className="font-semibold">Atakum, Samsun'a teslimat</span>
          <span className="text-[#FFC107]">·</span>
          <span className="text-emerald-600 font-bold">1 saatte kapında</span>
        </div>
      </header>

      {/* HERO: 100 TL Bonus banner */}
      <section className="px-3 pt-3">
        <Link
          href="/abone"
          className="block relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#4a1d96] via-[#6B3480] to-[#3b1378] p-4 shadow-xl shadow-purple-300/40"
          data-testid="banner-welcome-bonus"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#FFC107]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-pink-400/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 bg-[#FFC107] text-[#3b1378] px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide">
              <Sparkles className="w-3 h-3" /> YENİ ÜYELERE ÖZEL
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div>
                <div className="text-white font-black text-[42px] leading-none">100<span className="text-2xl ml-1">TL</span></div>
                <div className="text-[#FFC107] font-black text-lg leading-tight mt-0.5">BONUS</div>
              </div>
              <div className="flex-1 ml-2 mb-1">
                <div className="text-white font-bold text-sm leading-tight">Yeni üye ol,<br />ilk siparişinde kullan.</div>
              </div>
              <div className="text-5xl">🎁</div>
            </div>
            <div className="mt-3 bg-[#FFC107] text-[#3b1378] font-black text-sm py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
              ÜYE OL — 100 TL KAZAN <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* APP DOWNLOAD BANNER (platform aware) */}
      <section className="px-3 pt-3">
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 shadow-lg relative"
          data-testid="banner-app-download"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FFC107]/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B3480] to-[#3b1378] flex items-center justify-center shadow-lg shrink-0">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[#FFC107] uppercase tracking-wider">JETGO Mobil Uygulama</div>
              <div className="text-white font-black text-base leading-tight mt-0.5">
                {platform === "ios"
                  ? "App Store'dan indir"
                  : platform === "android"
                  ? "Google Play'den indir"
                  : "Uygulamayı indir"}
              </div>
              <div className="text-gray-400 text-[11px] mt-0.5">%10 ekstra indirim · push bildirim</div>
            </div>
          </div>
          <div className="relative z-10 mt-3 flex items-center gap-2">
            {platform === "other" ? (
              <>
                <div className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold text-xs py-2.5 rounded-xl">
                  <SiApple className="w-4 h-4" /> App Store
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold text-xs py-2.5 rounded-xl">
                  <SiGoogleplay className="w-4 h-4" /> Google Play
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-black text-sm py-3 rounded-xl shadow-md">
                <StoreIcon className="w-5 h-5" /> {storeName}'dan İndir
              </div>
            )}
          </div>
        </a>
      </section>

      {/* Categories scroll */}
      <section className="px-3 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-gray-900 text-base">Kategoriler</h2>
          <Link href="/kategori" className="text-[11px] font-bold text-[#6B3480]">Tümü ›</Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(c => (
            <Link
              key={c.key}
              href={c.key === "sokak" ? "/sokak-canlari" : `/kategori/${c.key}`}
              className={`bg-gradient-to-br ${c.color} rounded-2xl p-3 flex flex-col items-center justify-center aspect-square hover:scale-105 transition-transform`}
              data-testid={`link-cat-${c.key}`}
            >
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-1.5 text-[12px] font-bold text-gray-800">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash deals */}
      <section className="px-3 pt-5">
        <div className="rounded-2xl bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 p-3 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white">
              <Flame className="w-5 h-5 fill-[#FFC107] text-[#FFC107]" />
              <div>
                <div className="font-black text-sm leading-tight">Flaş İndirim</div>
                <div className="text-[10px] opacity-90">02:14:55 kaldı</div>
              </div>
            </div>
            <Link href="/kampanya" className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              Tümü ›
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {mockProducts.map(p => (
              <div key={p.id} className="bg-white rounded-xl p-2 w-32 shrink-0">
                <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-4xl">{p.img}</div>
                <div className="mt-1.5 text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight h-7">{p.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[#6B3480] font-black text-sm">{p.price}₺</span>
                  <span className="text-gray-400 text-[10px] line-through">{p.oldPrice}₺</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-3 pt-5 grid grid-cols-2 gap-2">
        {[
          { icon: <Truck className="w-5 h-5" />, t: "1 Saatte Teslim", s: "Atakum içi" },
          { icon: <ShieldCheck className="w-5 h-5" />, t: "Güvenli Ödeme", s: "256-bit SSL" },
          { icon: <Gift className="w-5 h-5" />, t: "Para Puan", s: "Her satın almada" },
          { icon: <Zap className="w-5 h-5" />, t: "Kapıda Ödeme", s: "Nakit / kart" },
        ].map((b, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-2.5 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-[#6B3480]">{b.icon}</div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-gray-800 leading-tight">{b.t}</div>
              <div className="text-[10px] text-gray-500 leading-tight">{b.s}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom: Big app download CTA */}
      <section className="px-3 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#6B3480] via-purple-700 to-indigo-800 p-5 text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-8xl opacity-20 select-none">📱</div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 bg-[#FFC107] text-[#3b1378] px-2 py-0.5 rounded-full text-[10px] font-black">
              <Sparkles className="w-3 h-3" /> UYGULAMA AVANTAJI
            </div>
            <h3 className="mt-3 text-white font-black text-xl leading-tight">
              JETGO uygulamasını indir,<br /><span className="text-[#FFC107]">%10 ekstra</span> indirim kazan
            </h3>
            <p className="mt-2 text-purple-100 text-[12px]">
              Sadece uygulamaya özel kampanyalar, hızlı sipariş ve anında bildirim.
            </p>

            {platform === "ios" && (
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-black text-white font-bold py-3.5 rounded-2xl shadow-lg"
                data-testid="link-download-ios"
              >
                <SiApple className="w-5 h-5" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-medium opacity-80">İndir</div>
                  <div className="text-sm font-black">App Store</div>
                </div>
              </a>
            )}

            {platform === "android" && (
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-black text-white font-bold py-3.5 rounded-2xl shadow-lg"
                data-testid="link-download-android"
              >
                <SiGoogleplay className="w-5 h-5" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-medium opacity-80">İndir</div>
                  <div className="text-sm font-black">Google Play</div>
                </div>
              </a>
            )}

            {platform === "other" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-black text-white font-bold py-3 rounded-2xl shadow"
                  data-testid="link-download-ios"
                >
                  <SiApple className="w-4 h-4" />
                  <div className="text-left leading-tight">
                    <div className="text-[8px] font-medium opacity-80">İndir</div>
                    <div className="text-[12px] font-black">App Store</div>
                  </div>
                </a>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-black text-white font-bold py-3 rounded-2xl shadow"
                  data-testid="link-download-android"
                >
                  <SiGoogleplay className="w-4 h-4" />
                  <div className="text-left leading-tight">
                    <div className="text-[8px] font-medium opacity-80">İndir</div>
                    <div className="text-[12px] font-black">Google Play</div>
                  </div>
                </a>
              </div>
            )}

            <div className="mt-3 flex items-center justify-center gap-3 text-white/80 text-[10px]">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" /> 4.9</span>
              <span>·</span>
              <span>10K+ indirme</span>
              <span>·</span>
              <span>Ücretsiz</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky bottom platform-aware download button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white/95 backdrop-blur border-t border-gray-100 px-3 py-3 shadow-2xl">
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full inline-flex items-center justify-center gap-2 font-black py-3.5 rounded-2xl shadow-lg ${
            platform === "ios"
              ? "bg-black text-white"
              : platform === "android"
              ? "bg-gradient-to-r from-[#34A853] to-[#1A73E8] text-white"
              : "bg-gradient-to-r from-[#6B3480] to-[#8B47A8] text-white"
          }`}
          data-testid="link-bottom-download"
        >
          {platform === "ios" && <><SiApple className="w-5 h-5" /> <span className="text-sm">App Store'dan İndir</span></>}
          {platform === "android" && <><SiGoogleplay className="w-5 h-5" /> <span className="text-sm">Google Play'den İndir</span></>}
          {platform === "other" && <><Download className="w-5 h-5" /> <span className="text-sm">Uygulamayı İndir</span></>}
        </a>
      </div>

      {/* DEMO ribbon */}
      <div className="fixed top-2 right-2 z-[60] bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg pointer-events-none">
        DEMO
      </div>
    </div>
  );
}
