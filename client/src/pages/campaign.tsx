import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Eye, Cat, Dog, Bird } from "lucide-react";
import ProductImage from "@/components/ProductImage";
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
  animal?: string | null;
}

function CampaignProductCard({ item }: { item: CampaignProduct }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-testid={`campaign-product-${item.product_id}`}>
      <Link href={productUrl(item.product_id, item.name) + "?kampanya=1"}>
        <div className="relative aspect-square bg-gray-50 p-2 cursor-pointer">
          <ProductImage
            src={item.img}
            alt={item.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
          <Badge
            className="absolute top-2 left-2 text-[10px] font-bold"
            style={{ backgroundColor: "#6B3480", color: "#fff" }}
          >
            KAMPANYA
          </Badge>
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
          <Link href={productUrl(item.product_id, item.name) + "?kampanya=1"}>
            <Button
              className="w-full h-8 text-xs font-bold"
              style={{ backgroundColor: "#6B3480" }}
              data-testid={`btn-inspect-${item.product_id}`}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              İncele
            </Button>
          </Link>
        ) : (
          <div className="text-center text-[11px] font-semibold py-1.5 rounded-md" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>
            Tükendi
          </div>
        )}
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
  });

  const [animalFilter, setAnimalFilter] = useState<string>("all");

  const mainItems = useMemo(() => {
    const mains = items.filter((i) => i.item_type === "main");
    if (animalFilter === "all") return mains;
    return mains.filter((i) => i.animal === animalFilter);
  }, [items, animalFilter]);

  const availableAnimals = useMemo(() => {
    const animals = new Set(items.filter(i => i.item_type === "main" && i.animal).map(i => i.animal!));
    return animals;
  }, [items]);

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

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar" data-testid="campaign-animal-filters">
          {ANIMAL_FILTERS.filter(f => f.id === "all" || availableAnimals.has(f.id)).map((f) => {
            const Icon = f.icon;
            const isActive = animalFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setAnimalFilter(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-700"
                }`}
                style={isActive ? { backgroundColor: "#6B3480" } : undefined}
                data-testid={`btn-filter-${f.id}`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
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
            {mainItems.length > 0 ? (
              <section data-testid="section-main-products">
                <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" style={{ color: "#ff6f00" }} />
                  Kampanya Ürünleri
                  <span className="text-xs font-normal text-muted-foreground">({mainItems.length})</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {mainItems.map((item) => (
                    <CampaignProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Bu kategoride kampanyalı ürün bulunmuyor.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
