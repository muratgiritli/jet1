import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame, Gift, Clock, TrendingUp, Sparkles, Eye,
  Zap, Heart, Truck, Cat, Dog, Bird, Filter,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { productUrl } from "@/lib/data";

const CATEGORIES = [
  { id: "all", label: "Tümü", icon: Sparkles, color: "bg-purple-600" },
  { id: "kedi", label: "Kedi", icon: Cat, color: "bg-purple-500" },
  { id: "kopek", label: "Köpek", icon: Dog, color: "bg-orange-500" },
  { id: "kus", label: "Kuş", icon: Bird, color: "bg-yellow-500" },
];

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  img: string | null;
}

const CAMPAIGN_OVERRIDES = [
  { discount: 32, tag: "SÜPER FIRSAT", color: "from-red-500 to-orange-500", socialProof: "Bu hafta en çok tercih edilen" },
  { discount: 23, tag: "ÖN SİPARİŞ - 3 GÜN", color: "from-blue-500 to-cyan-500", socialProof: "Stoğa özel sipariş" },
  { discount: 29, tag: "ÇOKLU PAKET", color: "from-emerald-500 to-teal-500", socialProof: "Yaş mama severlerin tercihi" },
  { discount: 21, tag: "SEPETE ÖZEL", color: "from-indigo-500 to-violet-500", socialProof: "Sepet tutarına özel indirim" },
  { discount: 17, tag: "YENİ ÜYE", color: "from-pink-500 to-rose-500", socialProof: "Yeni üyelere özel" },
  { discount: 28, tag: "ÇOK SATAN", color: "from-amber-500 to-yellow-500", socialProof: "Aylık en çok satılan ürün" },
  { discount: 15, tag: "SEZON SONU", color: "from-slate-600 to-gray-700", socialProof: "Sezon sonu indirimi" },
  { discount: 35, tag: "BÜYÜK İNDİRİM", color: "from-fuchsia-500 to-purple-600", socialProof: "Sınırlı sayıda kampanya" },
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

function CampaignCard({ product, override }: { product: ApiProduct; override: typeof CAMPAIGN_OVERRIDES[0] }) {
  const [liked, setLiked] = useState(false);
  const oldPrice = Math.round(product.price / (1 - override.discount / 100));
  const savings = oldPrice - product.price;
  const href = productUrl(product.id, product.name);

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover-elevate transition-all duration-200 shadow-sm hover:shadow-lg"
      data-testid={`demo-campaign-${product.id}`}
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <div className={`bg-gradient-to-br ${override.color} text-white text-xs font-extrabold w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
          %{override.discount}
        </div>
      </div>

      <button
        onClick={() => setLiked(!liked)}
        className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white"
        data-testid={`btn-fav-${product.id}`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
      </button>

      <Link href={href}>
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative overflow-hidden cursor-pointer">
          <ProductImage
            src={product.img}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2 right-2">
            <div className={`bg-gradient-to-r ${override.color} text-white text-[10px] font-bold px-3 py-1.5 rounded-lg text-center shadow-lg`}>
              {override.tag}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3 space-y-2.5">
        <Link href={href}>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-purple-700" data-testid={`text-title-${product.id}`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-purple-700">
            {product.price.toLocaleString("tr-TR")} TL
          </span>
          <span className="text-xs text-gray-400 line-through">
            {oldPrice.toLocaleString("tr-TR")} TL
          </span>
        </div>

        <div className="pt-1 space-y-2">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1.5 rounded-md border border-green-200 w-full">
            <Zap className="w-3.5 h-3.5" />
            {savings.toLocaleString("tr-TR")} TL TASARRUF
          </div>
          <Link href={href}>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 rounded-xl shadow-md"
              data-testid={`btn-incele-${product.id}`}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CampaignDemoPage() {
  const [activeCat, setActiveCat] = useState("all");
  const { data: allProducts = [], isLoading } = useQuery<ApiProduct[]>({
    queryKey: ["/api/products"],
  });

  const filtered = useMemo(() => {
    let pool = allProducts.filter(p => p.img && p.price > 0);
    if (activeCat !== "all") {
      const keywords: Record<string, string[]> = {
        kedi: ["kedi", "cat"],
        kopek: ["köpek", "kopek", "dog"],
        kus: ["kuş", "kus", "muhabbet", "kanarya"],
      };
      const kws = keywords[activeCat] || [];
      pool = pool.filter(p => kws.some(k => p.name.toLowerCase().includes(k)));
    }
    return pool.slice(0, 8);
  }, [allProducts, activeCat]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <p className="text-xs font-bold text-yellow-900">
          🎨 DEMO SAYFA — Onay verirseniz canlı kampanya sayfasına uygulanacak
        </p>
      </div>

      {/* HERO */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className="bg-yellow-400 text-purple-900 font-extrabold text-sm px-3 py-1">
              <Flame className="w-4 h-4 mr-1" /> KAMPANYA HAFTASI
            </Badge>
            <Badge className="bg-white/20 backdrop-blur text-white font-bold text-xs px-3 py-1">
              📦 Ön Sipariş — 3 Günde Teslim
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight">
            Kampanyalı Ürünlere<br/>
            <span className="text-yellow-300">%50'ye Varan İndirim!</span>
          </h1>
          <p className="text-sm md:text-base text-white/90 mb-5">
            Tüm kampanya ürünleri ön siparişle alınır — siparişiniz 3 iş günü içinde teslim edilir.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-[11px] font-semibold text-white/70 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> KAMPANYA BİTMESİNE
              </p>
              <CountdownTimer />
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

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Bu kategoride ürün bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p, i) => (
              <CampaignCard
                key={p.id}
                product={p}
                override={CAMPAIGN_OVERRIDES[i % CAMPAIGN_OVERRIDES.length]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ön sipariş bilgi kutusu */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-blue-900 mb-1">Ön Sipariş Nasıl Çalışır?</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                Kampanyalı ürünleri ön siparişle alabilirsin. Sipariş onaylandıktan sonra ürün özel olarak hazırlanır ve <strong>3 iş günü içinde adresine teslim edilir.</strong> Teslimat günü öncesinde SMS ile bilgilendirilirsin.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 text-center">
        <p className="text-xs text-gray-500">
          Tüm kampanyalar PayTR güvenli ödeme ile · 3 taksit + 9 ay taksit imkanı
        </p>
      </div>
    </div>
  );
}
