import { useEffect, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import { ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart, Truck, ShieldCheck, CreditCard } from "lucide-react";

const BANNER_IMG = "/images/campaign-banner-sample.png";

const CAMPAIGNS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Kampanya #${i + 1}`,
  productName: i === 0
    ? "Yeni Model Çekmeceli Kedi Tuvaleti - Orta Boy"
    : `Kampanyalı Ürün ${i + 1}`,
  price: [999, 749, 1299, 449, 199, 89, 549, 1799, 329, 879, 1499, 259, 699, 949, 419, 1199, 379, 599, 829, 1099][i],
  oldPrice: [1499, 1199, 1899, 699, 299, 139, 849, 2499, 499, 1299, 2199, 399, 999, 1399, 649, 1799, 599, 899, 1199, 1599][i],
  img: BANNER_IMG,
}));

export default function DemoKampanya() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col" data-testid="demo-kampanya-page">
      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <Link href="/">
          <button className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-sm font-semibold px-3 py-2 rounded-full border border-white/20" data-testid="button-close">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
          </button>
        </Link>
        <div className="text-white text-sm font-bold bg-black/40 backdrop-blur px-3 py-1.5 rounded-full" data-testid="text-page-title">
          Kampanyalar · {activeIdx + 1}/{CAMPAIGNS.length}
        </div>
        <div className="w-[88px]" />
      </div>

      {/* CAROUSEL */}
      <div
        ref={scrollerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none" }}
        data-testid="carousel-banners"
      >
        {CAMPAIGNS.map((c) => (
          <Link key={c.id} href={`/demo-kampanya/urun/${c.id}`}>
            <div className="snap-center shrink-0 w-screen h-full flex items-center justify-center cursor-pointer relative" data-testid={`banner-${c.id}`}>
              <img
                src={c.img}
                alt={c.title}
                className="max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
              {/* Click hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-purple-900 font-extrabold text-sm px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 animate-pulse">
                <ShoppingCart className="w-4 h-4" /> Ürünü İncele
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PREV / NEXT BUTTONS (desktop) */}
      <button
        onClick={() => scrollBy(-1)}
        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md items-center justify-center text-white border border-white/20"
        data-testid="button-prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scrollBy(1)}
        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md items-center justify-center text-white border border-white/20"
        data-testid="button-next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* BOTTOM NAV BAR — mobile prev/next + dots */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/60 to-transparent pt-6 pb-3">
        <div className="flex items-center gap-2 px-3">
          <button
            onClick={() => scrollBy(-1)}
            disabled={activeIdx === 0}
            className="shrink-0 flex items-center gap-1 bg-white/15 hover:bg-white/30 disabled:opacity-30 backdrop-blur-md text-white text-sm font-bold px-3 py-2.5 rounded-full border border-white/20"
            data-testid="button-prev-mobile"
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>

          <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar">
            {CAMPAIGNS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  const el = scrollerRef.current;
                  if (!el) return;
                  el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                }}
                className={`shrink-0 transition-all rounded-full ${i === activeIdx ? "w-6 h-1.5 bg-yellow-400" : "w-1.5 h-1.5 bg-white/50"}`}
                data-testid={`dot-${c.id}`}
              />
            ))}
          </div>

          <button
            onClick={() => scrollBy(1)}
            disabled={activeIdx === CAMPAIGNS.length - 1}
            className="shrink-0 flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 text-purple-900 text-sm font-extrabold px-3 py-2.5 rounded-full"
            data-testid="button-next-mobile"
          >
            Sonraki <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoKampanyaUrun() {
  const [, params] = useRoute("/demo-kampanya/urun/:id");
  const id = Number(params?.id || 1);
  const c = CAMPAIGNS.find((x) => x.id === id) || CAMPAIGNS[0];
  const discount = Math.round((1 - c.price / c.oldPrice) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center justify-between">
          <Link href="/demo-kampanya">
            <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-3.5 py-2 rounded-full shadow" data-testid="button-back-to-campaigns">
              <ArrowLeft className="w-4 h-4" /> Kampanyalara Dön
            </button>
          </Link>
          <div className="text-sm font-bold text-gray-700" data-testid="text-current-campaign">
            Kampanya #{c.id} / {CAMPAIGNS.length}
          </div>
        </div>
      </div>

      {/* PRODUCT */}
      <div className="max-w-3xl mx-auto p-3">
        <div className="bg-white rounded-3xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3">
            <img src={c.img} alt={c.productName} className="w-full max-h-[520px] object-contain" data-testid={`img-product-${c.id}`} />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">%{discount} İNDİRİM</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">JETGO Kampanya</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 leading-tight" data-testid="text-product-name">{c.productName}</h1>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-black text-purple-700" data-testid="text-product-price">{c.price} TL</div>
              <div className="text-base text-gray-400 line-through">{c.oldPrice} TL</div>
            </div>
            <div className="mt-2 text-sm font-semibold text-emerald-700">
              Kredi kartına 6 taksit · Vade farksız
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-purple-50 rounded-xl p-2">
                <Truck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-gray-700">1 Saatte Teslim</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-gray-700">Kapıda Kontrol</div>
              </div>
              <div className="bg-sky-50 rounded-xl p-2">
                <CreditCard className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <div className="text-[11px] font-bold text-gray-700">6 Taksit</div>
              </div>
            </div>

            <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2" data-testid="button-add-to-cart">
              <ShoppingCart className="w-5 h-5" /> Sepete Ekle - {c.price} TL
            </button>
          </div>
        </div>

        {/* OTHER CAMPAIGNS */}
        <div className="mt-5">
          <h2 className="text-sm font-extrabold text-gray-700 mb-2 px-1">Diğer Kampanyalar</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CAMPAIGNS.filter((x) => x.id !== c.id).slice(0, 12).map((other) => (
              <Link key={other.id} href={`/demo-kampanya/urun/${other.id}`}>
                <div className="shrink-0 w-[140px] bg-white rounded-2xl shadow border border-gray-100 overflow-hidden cursor-pointer hover-elevate" data-testid={`other-campaign-${other.id}`}>
                  <img src={other.img} alt={other.title} className="w-full h-[140px] object-cover" />
                  <div className="p-2">
                    <div className="text-[11px] font-bold text-gray-800 truncate">{other.productName}</div>
                    <div className="text-sm font-black text-purple-700 mt-0.5">{other.price} TL</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/demo-kampanya">
            <button className="mt-3 w-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5" data-testid="button-back-to-campaigns-bottom">
              <ArrowLeft className="w-4 h-4" /> Tüm Kampanyalara Dön
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
