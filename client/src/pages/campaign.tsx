import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Tag, Gift, ArrowRight, Lock } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/contexts/CartContext";
import { productUrl } from "@/lib/data";
import SEO, { SITE_DOMAIN } from "@/components/SEO";


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
}

function CampaignProductCard({ item }: { item: CampaignProduct }) {
  const { basket, updateQty, campaignMainInCart, isKediKumu } = useCart();
  const pid = String(item.product_id);
  const qty = basket[pid] || 0;
  const isMain = item.item_type === "main";
  const maxQty = isKediKumu(pid) ? 2 : 99;
  const isLockedMain = isMain && campaignMainInCart !== null && campaignMainInCart !== pid;
  const discount = item.original_price
    ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
    : 0;

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isLockedMain ? "border-gray-200 opacity-60" : "border-gray-100"}`} data-testid={`campaign-product-${item.product_id}`}>
      <Link href={productUrl(item.product_id, item.name) + "?kampanya=1"}>
        <div className="relative aspect-square bg-gray-50 p-2 cursor-pointer">
          <ProductImage
            src={item.img}
            alt={item.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge
              className="absolute top-2 right-2 text-xs font-bold"
              style={{ backgroundColor: "#e53935", color: "#fff" }}
              data-testid={`badge-discount-${item.product_id}`}
            >
              %{discount}
            </Badge>
          )}
          {isMain && (
            <Badge
              className="absolute top-2 left-2 text-[10px] font-bold"
              style={{ backgroundColor: "#6B3480", color: "#fff" }}
            >
              KAMPANYA
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-3 space-y-2">
        <Link href={productUrl(item.product_id, item.name) + "?kampanya=1"}>
          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[2rem] cursor-pointer hover:text-primary" data-testid={`text-name-${item.product_id}`}>
            {item.name}
          </h3>
        </Link>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary" data-testid={`text-price-${item.product_id}`}>
              {item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
            {item.original_price && item.original_price > item.price && (
              <span className="text-[10px] text-gray-400 line-through">
                {item.original_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
            )}
          </div>
          {item.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 w-fit">
              S.K.T: {item.skt}
            </span>
          )}
        </div>
        {item.stock > 0 ? (
          isLockedMain ? (
            <div className="text-center text-[11px] font-semibold py-1.5 rounded-md flex items-center justify-center gap-1" style={{ backgroundColor: "#f5f5f5", color: "#9e9e9e" }} data-testid={`locked-${item.product_id}`}>
              <Lock className="w-3 h-3" />
              Başka ürün seçildi
            </div>
          ) : qty > 0 ? (
            (isMain || isKediKumu) ? (
              <div className="text-center text-[11px] font-semibold py-1.5 rounded-md" style={{ backgroundColor: "#f3e5f9", color: "#6B3480" }} data-testid={`qty-added-${item.product_id}`}>
                Sepette ✓
                <button
                  className="ml-2 underline text-[10px]"
                  onClick={() => updateQty(pid, -1)}
                  data-testid={`btn-remove-${item.product_id}`}
                >
                  Çıkar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-0" data-testid={`qty-control-${item.product_id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateQty(pid, -1)}
                  data-testid={`btn-minus-${item.product_id}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <div className="flex items-center justify-center font-bold text-primary w-10 text-base">
                  {qty}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => { if (qty < maxQty) updateQty(pid, 1); }}
                  disabled={qty >= maxQty}
                  data-testid={`btn-plus-${item.product_id}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          ) : (
            <Button
              className="w-full h-8 text-xs font-bold"
              style={{ backgroundColor: "#6B3480" }}
              onClick={() => updateQty(pid, 1)}
              data-testid={`btn-add-${item.product_id}`}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              Sepete Ekle
            </Button>
          )
        ) : (
          <div className="text-center text-[11px] font-semibold py-1.5 rounded-md" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>
            Tükendi
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignPage() {
  const { data: items = [], isLoading } = useQuery<CampaignProduct[]>({
    queryKey: ["/api/campaign-items"],
  });

  const mainItems = items.filter((i) => i.item_type === "main");
  const extraItems = items.filter((i) => i.item_type === "extra");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0">
      <SEO
        title="Kampanyalı Ürünler | JETGO Pet Shop Samsun"
        description="JETGO Pet Shop kampanyalı mama ve evcil hayvan ürünleri. Özel fiyatlarla kedi ve köpek mamaları."
        canonical={`${SITE_DOMAIN}/kampanya`}
      />
      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-4">
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{ background: "linear-gradient(135deg, #6B3480 0%, #8e44ad 50%, #9b59b6 100%)" }}
          data-testid="campaign-hero"
        >
          <div className="flex items-center justify-center gap-2">
            <Tag className="w-6 h-6 text-white" />
            <h1 className="text-xl font-extrabold text-white">Kampanyalı Ürünler</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-1" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {mainItems.length > 0 && (
              <section className="mb-6" data-testid="section-main-products">
                <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" style={{ color: "#ff6f00" }} />
                  Kampanya Ürünleri
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {mainItems.map((item) => (
                    <CampaignProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {extraItems.length > 0 && (
              <section data-testid="section-extra-products">
                <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" style={{ color: "#2e7d32" }} />
                  Ek Ürünler
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {extraItems.map((item) => (
                    <CampaignProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
