import { Link, useRoute, useLocation } from "wouter";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ShoppingCart, Plus, Minus, Clock, Bell, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { productUrl } from "@/lib/data";
import ProductImage from "@/components/ProductImage";
import FavoriteButton from "@/components/FavoriteButton";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";

import SEO, { SITE_DOMAIN, BREADCRUMB_JSONLD, LOCAL_BUSINESS_JSONLD } from "@/components/SEO";

interface Subcategory {
  id: number;
  animal: string;
  slug: string;
  displayName: string;
  color: string;
  hasBrands: boolean;
  sortOrder: number;
}

const ANIMAL_META: Record<string, {
  title: string;
  emoji: string;
  gradient: string;
  bgGradient: string;
}> = {
  kopek: {
    title: "Köpek",
    emoji: "🐕",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
  },
  kedi: {
    title: "Kedi",
    emoji: "🐈",
    gradient: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-50 to-indigo-50",
  },
  kus: {
    title: "Kuş",
    emoji: "🦜",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
  },
  kemirgen: {
    title: "Kemirgen",
    emoji: "🐹",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-50 to-rose-50",
  },
  akvaryum: {
    title: "Akvaryum",
    emoji: "🐠",
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-50 to-blue-50",
  },
};

const SUBCATEGORY_ICONS: Record<string, string> = {
  "kopek-kuru-mama": "🍖",
  "mama-markalari": "🦴",
  "kedi-mamasi": "🐟",
  "kopek-mamasi": "🐕",
  "acik-mama": "🥣",
  "kedi-kumu": "🪣",
  "yas-mama": "🥫",
  "kedi-konserve": "🥫",
  "malt-vitamin": "💊",
  "odul": "🎁",
  "odul-kemik": "🦴",
  "bakim-saglik": "🩺",
  "kedi-tuvaleti": "🚽",
  "kedi-tasima": "👜",
  "tasima-kulube": "🏠",
  "tuvalet-malzemeleri": "🧹",
  "uygun-cuval": "📦",
  "kus-yemi": "🌾",
  "kus-kafesi": "🏡",
  "kus-vitamin": "💊",
  "kemirgen-yemi": "🌾",
  "kemirgen-kafesi": "🏡",
  "vitamin-takviye": "💊",
  "bakim-aksesuar": "✨",
  "akvaryumlar": "🐠",
  "ic-filtre": "💧",
  "aski-selale-filtre": "🌊",
  "tepe-filtre": "🔝",
  "dis-filtre": "🛢️",
  "uretim-filtre": "🐣",
  "sirkulasyon-sump-motoru": "🔄",
  "hava-motoru": "💨",
  "filtre-malzemesi": "🧽",
  "otomatik-yemleme": "🍽️",
  "balik-yemi": "🦐",
  "su-hazirlayici-ve-ilaclar": "💊",
  "akvaryum-dekor": "🪸",
  "akvaryum-kumu": "🟫",
  "plastik-bitki": "🌿",
  "akvaryum-arka-fon": "🖼️",
  "akvaryum-ekipmanlari": "🔧",
  "akvaryum-aydinlatma": "💡",
};

const DIRECT_PRODUCT_ANIMALS = ["kemirgen", "akvaryum"];

function KemirgenProductCard({ product }: { product: Product }) {
  const { basket, updateQty, isKediKumu } = useCart();
  const pid = String(product.id);
  const quantity = basket[pid] || 0;
  const maxQty = isKediKumu(pid) ? 2 : 99;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className={`transition-all duration-200 ${quantity > 0 ? "ring-2 ring-inset ring-primary" : ""}`}
      data-testid={`card-product-${pid}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <Link href={productUrl(product.id, product.name)} className="w-full flex flex-col items-center gap-2">
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative" data-testid={`img-container-${pid}`}>
            <ProductImage
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              data-testid={`img-product-${pid}`}
            />
            {discount > 0 && (
              <Badge
                className="absolute top-1 right-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
                style={{ backgroundColor: "#e53935", color: "#fff" }}
                data-testid={`badge-discount-${pid}`}
              >
                %{discount}
              </Badge>
            )}
            <FavoriteButton
              product={{ id: pid, name: product.name, price: product.price, img: product.img || null }}
              className="absolute bottom-1 right-1 shadow-sm"
            />
          </div>
          <p className="text-xs font-semibold text-center leading-tight line-clamp-2 min-h-[2rem]" data-testid={`text-name-${pid}`}>
            {product.name}
          </p>
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through" data-testid={`text-original-price-${pid}`}>
              {product.originalPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span className="text-sm font-bold text-foreground" data-testid={`text-price-${pid}`}>
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </span>
          {product.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" data-testid={`badge-skt-${pid}`}>
              S.K.T: {product.skt}
            </span>
          )}
        </div>
        {product.stock === 0 && product.preorderEnabled ? (
          <Link href={productUrl(product.id, product.name)} className="w-full">
            <Button variant="default" size="sm" className="w-full" style={{ backgroundColor: "#1565c0" }} data-testid={`btn-preorder-${pid}`}>
              <Clock className="w-3.5 h-3.5" />
              Sipariş Ver
            </Button>
          </Link>
        ) : product.stock === 0 ? (
          <Link href={productUrl(product.id, product.name)} className="w-full">
            <Button variant="default" size="sm" className="w-full" style={{ backgroundColor: "#e65100" }} data-testid={`btn-stock-alert-${pid}`}>
              <Bell className="w-3.5 h-3.5" />
              Gelince Haber Ver
            </Button>
          </Link>
        ) : quantity > 0 ? (
          <div className="flex items-center justify-center gap-0 w-full" data-testid={`qty-control-${pid}`}>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQty(pid, -1)} data-testid={`btn-minus-${pid}`}>
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <div className="flex items-center justify-center font-bold text-primary w-10 text-base">{quantity}</div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => { if (quantity < maxQty) updateQty(pid, 1); }} disabled={quantity >= maxQty} data-testid={`btn-plus-${pid}`}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            style={{ backgroundColor: "#6B3480" }}
            onClick={() => updateQty(pid, 1)}
            data-testid={`btn-add-${pid}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Sepete Ekle
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function CategoryPage() {
  const [, params] = useRoute("/kategori/:animal");
  const animalSlug = params?.animal || "kopek";
  const animalMeta = ANIMAL_META[animalSlug];

  const [, setLocation] = useLocation();

  const isDirectProductAnimal = DIRECT_PRODUCT_ANIMALS.includes(animalSlug);

  const { data: subcategories = [], isLoading } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories", animalSlug],
    queryFn: () => fetch(`/api/subcategories/${animalSlug}`).then(r => r.json()),
    enabled: !isDirectProductAnimal,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/animal-products", animalSlug],
    queryFn: () => fetch(`/api/animal-products/${animalSlug}`).then(r => r.json()),
    enabled: isDirectProductAnimal,
  });

  if (animalSlug === "kus") {
    setLocation("/siparis/kus/kus-yemi/kus-yemi", { replace: true });
    return null;
  }

  if (!animalMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground" data-testid="text-category-not-found">Kategori bulunamadı</p>
      </div>
    );
  }

  if (isDirectProductAnimal) {
    return (
      <div className={`min-h-screen flex flex-col pb-16 md:pb-0 bg-gradient-to-b ${animalMeta.bgGradient}`}>
        <SEO
          title={`${animalMeta.title} Ürünleri Samsun - Aynı Gün Kapıya Teslim | JETGO Pet Shop`}
          description={`Samsun'da ${animalMeta.title.toLowerCase()} yemleri, kafesleri ve bakım ürünleri aynı gün kapıya teslim. En uygun fiyatlarla online sipariş JETGO.`}
          canonical={`${SITE_DOMAIN}/kategori/${animalSlug}`}
          keywords={`${animalMeta.title.toLowerCase()} yemi samsun, ${animalMeta.title.toLowerCase()} kafesi samsun, ${animalMeta.title.toLowerCase()} ürünleri, samsun petshop ${animalMeta.title.toLowerCase()}`}
          jsonLd={[
            BREADCRUMB_JSONLD([
              { name: "Ana Sayfa", url: SITE_DOMAIN },
              { name: "Kategoriler", url: `${SITE_DOMAIN}/kategori` },
              { name: `${animalMeta.title} Ürünleri Samsun`, url: `${SITE_DOMAIN}/kategori/${animalSlug}` },
            ]),
            LOCAL_BUSINESS_JSONLD,
          ]}
        />

        <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6 pb-28 md:pb-8">
          <div className="text-center mb-6">
            <span className="text-4xl md:text-5xl block mb-2">{animalMeta.emoji}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="text-category-title">
              <span className="text-foreground">{animalMeta.title} </span>
              <span className={`bg-gradient-to-r ${animalMeta.gradient} bg-clip-text text-transparent`}>
                Ürünleri
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide" data-testid="text-category-subtitle">
              Samsun'da aynı gün kapıya teslim
            </p>
          </div>

          {productsLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm" data-testid="text-no-products">Henüz ürün eklenmedi</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2" data-testid="grid-direct-products">
              {products.map((product) => (
                <KemirgenProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col pb-16 md:pb-0 bg-gradient-to-b ${animalMeta.bgGradient}`}>
      <SEO
        title={`${animalMeta.title} Maması Samsun - Aynı Gün Kapıya Teslim ${animalMeta.title} Ürünleri | JETGO Pet Shop`}
        description={`Samsun'da ${animalMeta.title.toLowerCase()} maması aynı gün kapıya teslim. ${animalMeta.title} maması, bakım ürünleri ve aksesuar çeşitleri en uygun fiyatlarla. Aynı gün teslimat, kapıda nakit/POS ödeme. Online sipariş JETGO.`}
        canonical={`${SITE_DOMAIN}/kategori/${animalSlug}`}
        keywords={`${animalMeta.title.toLowerCase()} maması samsun, ${animalMeta.title.toLowerCase()} maması atakum, ${animalMeta.title.toLowerCase()} ürünleri samsun, ${animalMeta.title.toLowerCase()} maması kapıya teslim, samsun petshop ${animalMeta.title.toLowerCase()}`}
        jsonLd={[
          BREADCRUMB_JSONLD([
            { name: "Ana Sayfa", url: SITE_DOMAIN },
            { name: "Kategoriler", url: `${SITE_DOMAIN}/kategori` },
            { name: `${animalMeta.title} Ürünleri Samsun`, url: `${SITE_DOMAIN}/kategori/${animalSlug}` },
          ]),
          LOCAL_BUSINESS_JSONLD,
        ]}
      />

      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6">
        <FreeShippingBanner className="mb-4" />
        <div className="text-center mb-6">
          <span className="text-4xl md:text-5xl block mb-2">{animalMeta.emoji}</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="text-category-title">
            <span className="text-foreground">{animalMeta.title} </span>
            <span className={`bg-gradient-to-r ${animalMeta.gradient} bg-clip-text text-transparent`}>
              Ürünleri Samsun
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide" data-testid="text-category-subtitle">
            Samsun'da aynı gün kapıya teslim - Kategori seçerek ürünleri keşfedin
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl h-[110px] bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="grid-subcategories">
            {subcategories.filter(sub => {
              if (animalSlug === "kedi" && (sub.slug === "malt-vitamin" || sub.slug === "yas-mama")) return false;
              if (animalSlug === "kopek" && sub.slug === "mama-markalari") return false;
              return true;
            }).map((sub, i) => {
              const href = sub.hasBrands
                ? (sub.slug === "acik-mama" ? `/acik-mama/${animalSlug}` : `/kategori/${animalSlug}/${sub.slug}`)
                : `/siparis/${animalSlug}/${sub.slug}/${sub.slug}`;

              const icon = SUBCATEGORY_ICONS[sub.slug] || "📦";

              return (
                <div key={sub.id}>
                  <Link href={href}>
                    <div
                      className="group cursor-pointer rounded-2xl p-4 h-[110px] flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      style={{ backgroundColor: sub.color }}
                      data-testid={`btn-subcategory-${sub.slug}`}
                    >
                      <div className="absolute -right-3 -top-3 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">
                        {icon}
                      </div>
                      <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/10" />

                      <span className="text-2xl mb-2">{icon}</span>
                      <div className="flex items-end justify-between">
                        <span
                          className="text-white font-bold text-sm md:text-base leading-tight pr-4"
                          data-testid={`text-subcategory-${sub.slug}`}
                        >
                          {sub.displayName}
                        </span>
                        <div className="bg-white/20 rounded-full p-1 shrink-0 group-hover:bg-white/40 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
