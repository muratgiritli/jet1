import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, Plus, Minus, Tag, Lock, Cat, Dog, Bird, Clock,
  Flame, Eye, Zap, Gift, Truck, ShieldCheck, Banknote,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/contexts/CartContext";
import { productUrl } from "@/lib/data";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";

interface CampaignProduct {
  id: number;
  product_id: number;
  item_type: string;
  sort_order: number;
  name: string;
  price: number;
  original_price: number | null;
  img: string | null;
  stock: number;
  skt: string | null;
  animal?: string | null;
  preorder_enabled?: boolean;
}

interface PublicSettings {
  campaign_hero_title?: string;
  campaign_hero_subtitle?: string;
  campaign_end_date?: string;
}

function CampaignTopBanner() {
  const isMobile = useIsMobile();
  const { data: banners = [] } = useQuery<any[]>({
    queryKey: ["/api/banners", { position: "campaign_top" }],
    queryFn: async () => {
      const r = await fetch("/api/banners?position=campaign_top");
      if (!r.ok) return [];
      return r.json();
    },
  });
  const visible = banners.filter((b: any) => {
    const d = b.device || "both";
    if (d === "both") return true;
    return isMobile ? d === "mobile" : d === "desktop";
  });
  if (!visible.length) return null;
  const banner = visible[0];
  if (!banner.imageData) return null;
  const Img = (
    <img
      src={banner.imageData}
      alt={banner.title || "Kampanya banner"}
      className="w-full h-auto max-w-[1000px] mx-auto rounded-2xl shadow-md block"
      style={{ aspectRatio: "1000 / 650" }}
      loading="eager"
      data-testid="img-campaign-top-banner"
    />
  );
  const raw = (banner.linkUrl || "").trim();
  const sameDomain = raw.match(/^https?:\/\/(www\.)?jetgomarket\.com(\/.*)?$/i);
  const internalPath = sameDomain ? (sameDomain[2] || "/") : null;
  const isExternal = !sameDomain && /^https?:\/\//i.test(raw);
  return (
    <div className="mb-4">
      {!raw ? Img : isExternal ? (
        <a href={raw} target="_blank" rel="noopener noreferrer" className="block" data-testid="link-campaign-top-banner">{Img}</a>
      ) : (
        <Link href={internalPath || raw} data-testid="link-campaign-top-banner">{Img}</Link>
      )}
    </div>
  );
}

function CountdownStrip({ endDate }: { endDate?: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!endDate) return null;
  const target = new Date(endDate).getTime();
  if (isNaN(target)) return null;
  const diff = Math.max(0, target - now);
  if (diff === 0) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex items-center justify-center gap-2 bg-red-600/95 text-white rounded-xl px-3 py-2 shadow-md mt-3">
      <Flame className="w-4 h-4 animate-pulse" />
      <span className="text-xs font-bold">Kampanya bitmesine:</span>
      <div className="flex gap-1">
        {[{ v: d, l: "G" }, { v: h, l: "S" }, { v: m, l: "DK" }, { v: s, l: "SN" }].map((b, i) => (
          <div key={i} className="bg-white/20 rounded px-1.5 py-0.5 text-center min-w-[30px]">
            <div className="text-xs font-extrabold leading-tight">{String(b.v).padStart(2, "0")}</div>
            <div className="text-[8px] opacity-80">{b.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignProductCard({ item }: { item: CampaignProduct }) {
  const { basket, updateQty, campaignMainInCart, isKediKumu } = useCart();
  const pid = String(item.product_id);
  const qty = basket[pid] || 0;
  const isMain = item.item_type === "main";
  const maxQty = isKediKumu(pid) ? 2 : 99;
  const isLockedMain = isMain && campaignMainInCart !== null && campaignMainInCart !== pid;
  const href = productUrl(item.product_id, item.name) + "?kampanya=1";

  const oldPrice = item.original_price && item.original_price > item.price ? item.original_price : null;
  const discountPct = oldPrice ? Math.round(((oldPrice - item.price) / oldPrice) * 100) : 0;
  const savings = oldPrice ? oldPrice - item.price : 0;

  return (
    <div
      className={`bg-white rounded-2xl border-2 overflow-hidden flex flex-col transition-all ${
        isLockedMain ? "border-gray-200 opacity-60" : "border-purple-100 hover:border-purple-300 hover:shadow-md"
      }`}
      data-testid={`campaign-product-${item.product_id}`}
    >
      {discountPct > 0 && (
        <div className="absolute z-10 m-2">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-[11px] font-extrabold w-11 h-11 rounded-full flex items-center justify-center shadow-md">
            %{discountPct}
          </div>
        </div>
      )}

      <Link href={href}>
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-3 relative overflow-hidden cursor-pointer">
          <ProductImage
            src={item.img}
            alt={item.name}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-2.5 flex flex-col gap-2 flex-1">
        <Link href={href}>
          <h3
            className="text-xs font-bold text-gray-900 line-clamp-3 min-h-[3.375rem] cursor-pointer hover:text-purple-700"
            data-testid={`text-name-${item.product_id}`}
          >
            {item.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-extrabold text-purple-700" data-testid={`text-price-${item.product_id}`}>
            {item.price.toLocaleString("tr-TR")} TL
          </span>
          {oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              {oldPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
        </div>

        {savings > 0 && (
          <div className="inline-flex items-center justify-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 self-start">
            <Zap className="w-2.5 h-2.5" />
            {savings.toLocaleString("tr-TR")} TL TASARRUF
          </div>
        )}

        {item.skt && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 w-fit">
            S.K.T: {item.skt}
          </span>
        )}

        <div className="mt-auto pt-1">
          {item.stock > 0 ? (
            isLockedMain ? (
              <div className="text-center text-[10px] font-semibold py-1.5 rounded-md flex items-center justify-center gap-1 bg-gray-100 text-gray-500" data-testid={`locked-${item.product_id}`}>
                <Lock className="w-3 h-3" />
                Başka ürün seçildi
              </div>
            ) : qty > 0 ? (
              isMain || isKediKumu(pid) === false ? (
                <div className="flex items-center justify-center gap-0" data-testid={`qty-control-${item.product_id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => updateQty(pid, -1, true)}
                    data-testid={`btn-minus-${item.product_id}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <div className="flex items-center justify-center font-bold text-purple-700 w-10 text-base">
                    {qty}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => { if (qty < (isMain ? 1 : maxQty)) updateQty(pid, 1, true); }}
                    disabled={qty >= (isMain ? 1 : maxQty)}
                    data-testid={`btn-plus-${item.product_id}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-[11px] font-semibold py-2 rounded-md bg-purple-50 text-purple-800" data-testid={`qty-added-${item.product_id}`}>
                  Sepette ✓
                  <button className="ml-2 underline text-[10px]" onClick={() => updateQty(pid, -1, true)} data-testid={`btn-remove-${item.product_id}`}>
                    Çıkar
                  </button>
                </div>
              )
            ) : (
              <Link href={href} className="w-full">
                <Button
                  className="w-full h-9 text-xs font-bold bg-purple-600 hover:bg-purple-700 rounded-xl"
                  data-testid={`btn-add-${item.product_id}`}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Satın Al
                </Button>
              </Link>
            )
          ) : item.preorder_enabled ? (
            <Link href={href} className="w-full">
              <Button
                className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl"
                data-testid={`btn-preorder-${item.product_id}`}
              >
                <Clock className="w-3.5 h-3.5 mr-1" />
                Sipariş Ver
              </Button>
            </Link>
          ) : (
            <div className="text-center text-[11px] font-semibold py-2 rounded-md bg-orange-50 text-orange-700">
              Tükendi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ANIMAL_FILTERS = [
  { id: "all", label: "Tümü", icon: Tag },
  { id: "kedi", label: "Kedi", icon: Cat },
  { id: "kopek", label: "Köpek", icon: Dog },
  { id: "kus", label: "Kuş", icon: Bird },
] as const;

export default function CampaignPage() {
  const { data: items = [], isLoading } = useQuery<CampaignProduct[]>({
    queryKey: ["/api/campaign-items"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const { data: settings = {} } = useQuery<PublicSettings>({
    queryKey: ["/api/public-settings"],
  });

  const [animalFilter, setAnimalFilter] = useState<string>("all");

  const heroTitle = settings.campaign_hero_title || "Kaçırılmaz Kampanyalar";
  const heroSubtitle = settings.campaign_hero_subtitle || "Sınırlı stoklarla özel indirimler — kapıda nakit · 3 günde teslim";

  const mainItems = useMemo(() => {
    const mains = items.filter((i) => i.item_type === "main");
    if (animalFilter === "all") return mains;
    return mains.filter((i) => i.animal === animalFilter);
  }, [items, animalFilter]);

  const availableAnimals = useMemo(() => {
    return new Set(items.filter(i => i.item_type === "main" && i.animal).map(i => i.animal!));
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-white pb-20 md:pb-8">
      <SEO
        title="Kampanyalı Ürünler | JETGO Pet Shop Samsun"
        description="JETGO Pet Shop kampanyalı mama ve evcil hayvan ürünleri. Özel fiyatlarla kedi ve köpek mamaları."
        canonical={`${SITE_DOMAIN}/kampanya`}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 py-4">
        <CampaignTopBanner />
        {settings.campaign_end_date && (
          <div className="mb-4 flex justify-center">
            <CountdownStrip endDate={settings.campaign_end_date} />
          </div>
        )}

        {/* Animal filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 md:overflow-x-auto md:no-scrollbar" data-testid="campaign-animal-filters">
          {ANIMAL_FILTERS.filter(f => f.id === "all" || availableAnimals.has(f.id)).map((f) => {
            const Icon = f.icon;
            const isActive = animalFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setAnimalFilter(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive ? "bg-purple-700 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-700"
                }`}
                data-testid={`btn-filter-${f.id}`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : mainItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Bu kategoride kampanyalı ürün bulunmuyor.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3" data-testid="grid-campaign-products">
            {mainItems.map((item) => <CampaignProductCard key={item.id} item={item} />)}
          </div>
        )}
      </main>
    </div>
  );
}
