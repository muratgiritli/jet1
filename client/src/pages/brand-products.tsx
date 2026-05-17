import { useState, useMemo, useRef, useEffect } from "react";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute, useLocation } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell, ChevronDown, Eye, ShieldCheck, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import FastDeliveryBanner, { shouldShowFastDelivery } from "@/components/FastDeliveryBanner";
import { CATEGORIES, productUrl } from "@/lib/data";
import FavoriteButton from "@/components/FavoriteButton";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import ProductImage from "@/components/ProductImage";

interface SubcategoryInfo {
  name: string;
  slug: string;
  hasBrands?: boolean;
  staticCategory?: string;
}

function isFoodSubcategory(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return (
    s.includes("mama") ||
    s.includes("yem") ||
    s.includes("konserve") ||
    s.includes("cuval") ||
    s.includes("odul-kemik") ||
    s.includes("odul") ||
    s.includes("malt-vitamin")
  );
}

function isStrictMamaSubcategory(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return s.includes("mama") || s.includes("konserve") || s.includes("cuval") || s.includes("yem");
}

const ANIMAL_SUBCATEGORIES: Record<string, SubcategoryInfo[]> = {
  kopek: [
    { name: "Kopek Kuru Mama", slug: "kopek-kuru-mama", hasBrands: true },
    { name: "Kopek Mamasi", slug: "mama-markalari", hasBrands: true },
    { name: "Acik Mama", slug: "acik-mama", hasBrands: true },
    { name: "Tuvalet Malzemeleri", slug: "tuvalet-malzemeleri" },
    { name: "Yas Mama", slug: "yas-mama", hasBrands: true },
    { name: "Odul Kemik", slug: "odul-kemik" },
    { name: "Tasima ve Kulubeler", slug: "tasima-kulube" },
    { name: "Bakim ve Saglik", slug: "bakim-saglik" },
  ],
  kedi: [
    { name: "Kedi Mamasi", slug: "kedi-mamasi", hasBrands: true },
    { name: "Açık Mama", slug: "acik-mama", hasBrands: true },
    { name: "Kum", slug: "kedi-kumu", staticCategory: "KUM" },
    { name: "Ödül", slug: "kedi-odulu", staticCategory: "ÖDÜL" },
    { name: "Bakım ve Sağlık", slug: "kedi-bakim-saglik", staticCategory: "BAKIM VE SAĞLIK" },
    { name: "Taşıma", slug: "kedi-tasima" },
    { name: "Tuvalet", slug: "kedi-tuvaleti" },
    { name: "Yaş Mama", slug: "kedi-konserve", hasBrands: true },
  ],
  kus: [
    { name: "Kus Yemi", slug: "kus-yemi" },
    { name: "Kus Kafesi", slug: "kus-kafesi" },
    { name: "Kus Vitaminleri", slug: "kus-vitamin" },
    { name: "Bakim ve Aksesuar", slug: "bakim-aksesuar" },
  ],
  kemirgen: [
    { name: "Kemirgen Yemleri", slug: "kemirgen-yemi" },
    { name: "Kemirgen Kafesleri", slug: "kemirgen-kafesi" },
    { name: "Bakim ve Aksesuar", slug: "bakim-aksesuar" },
    { name: "Vitamin ve Takviye", slug: "vitamin-takviye" },
  ],
};

function QuantityControl({
  productId,
  quantity,
  onUpdate,
}: {
  productId: string;
  quantity: number;
  onUpdate: (id: string, delta: number) => boolean;
}) {
  const [showStockWarn, setShowStockWarn] = useState(false);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-0" data-testid={`qty-control-${productId}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate(productId, -1)}
          data-testid={`btn-minus-${productId}`}
        >
          <Minus />
        </Button>
        <div
          className="flex items-center justify-center font-bold text-primary w-8 text-sm"
          data-testid={`text-qty-${productId}`}
        >
          {quantity}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const blocked = onUpdate(productId, 1);
            if (blocked) {
              setShowStockWarn(true);
              setTimeout(() => setShowStockWarn(false), 3000);
            }
          }}
          data-testid={`btn-plus-${productId}`}
        >
          <Plus />
        </Button>
      </div>
      {showStockWarn && (
        <span className="text-[10px] text-red-600 font-medium" data-testid="text-stock-limit-warning">Stok kalmadı!</span>
      )}
    </div>
  );
}

function BrandProductCard({
  product,
  quantity,
  onUpdate,
  showDetailLink,
  isMama,
}: {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
  showDetailLink?: boolean;
  isMama?: boolean;
}) {
  const isActive = quantity > 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const pid = String(product.id);

  return (
    <Card
      className={`transition-all duration-200 ${isActive ? "ring-2 ring-inset ring-primary" : ""}`}
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
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <FavoriteButton
                product={{ id: pid, name: product.name, price: product.price, img: product.img || null }}
                className="absolute bottom-1 right-1 shadow-sm"
              />
            </div>
          </div>
          <p className="text-xs font-semibold text-center leading-tight line-clamp-3 min-h-[3rem] hover:underline" data-testid={`text-name-${pid}`}>
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
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full" data-testid={`text-cash-price-${pid}`}>
            Nakit: {(product.price * 0.9).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL
          </span>
          {product.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" data-testid={`badge-skt-${pid}`}>
              S.K.T: {product.skt}
            </span>
          )}
        </div>
        {product.stock === 0 && (product.preorderEnabled || !isMama) ? (
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
        ) : showDetailLink ? (
          <Link href={productUrl(product.id, product.name)} className="w-full">
            <Button variant="default" size="sm" className="w-full" data-testid={`btn-incele-${pid}`}>
              <Eye className="w-3.5 h-3.5" />
              Satın Al
            </Button>
          </Link>
        ) : (
          <QuantityControl
            productId={pid}
            quantity={quantity}
            onUpdate={onUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}

function InlineSubcategoryProductCard({
  product,
  quantity,
  onUpdate,
  showDetailLink,
  isMama,
}: {
  product: { id: string; name: string; price: number; originalPrice?: number; img?: string; skt?: string; stock?: number; preorderEnabled?: boolean };
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
  showDetailLink?: boolean;
  isMama?: boolean;
}) {
  const isActive = quantity > 0;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className={`transition-all duration-200 ${isActive ? "ring-2 ring-inset ring-primary" : ""}`}
      data-testid={`card-inline-product-${product.id}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <Link href={productUrl(product.id, product.name)} className="w-full flex flex-col items-center gap-2">
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative">
            <ProductImage
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            {product.skt && (
              <Badge
                variant="secondary"
                className="absolute top-1 left-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
              >
                SKT: {product.skt}
              </Badge>
            )}
            {discount > 0 && (
              <Badge
                className="absolute top-1 right-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
                style={{ backgroundColor: "#e53935", color: "#fff" }}
              >
                %{discount}
              </Badge>
            )}
          </div>
          <p className="text-xs font-semibold text-center leading-tight line-clamp-3 min-h-[3rem] hover:underline">
            {product.name}
          </p>
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through">
              {product.originalPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span className="text-sm font-bold text-foreground">
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
            Nakit: {(product.price * 0.9).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL
          </span>
        </div>
        {product.stock === 0 && (product.preorderEnabled || !isMama) ? (
          <Link href={productUrl(product.id, product.name)} className="w-full">
            <Button variant="default" size="sm" className="w-full" style={{ backgroundColor: "#1565c0" }} data-testid={`btn-preorder-inline-${product.id}`}>
              <Clock className="w-3.5 h-3.5" />
              Sipariş Ver
            </Button>
          </Link>
        ) : product.stock === 0 ? (
          <Link href={productUrl(product.id, product.name)} className="w-full">
            <Button variant="default" size="sm" className="w-full" style={{ backgroundColor: "#e65100" }} data-testid={`btn-stock-alert-inline-${product.id}`}>
              <Bell className="w-3.5 h-3.5" />
              Gelince Haber Ver
            </Button>
          </Link>
        ) : showDetailLink ? (
          <Link href={productUrl(product.id, product.name)} className="w-full">
            <Button variant="default" size="sm" className="w-full" data-testid={`btn-incele-inline-${product.id}`}>
              <Eye className="w-3.5 h-3.5" />
              Satın Al
            </Button>
          </Link>
        ) : (
          <QuantityControl
            productId={product.id}
            quantity={quantity}
            onUpdate={onUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}

function InlineSubcategories({
  animal,
  currentSubcategory,
  basket,
  updateQty,
}: {
  animal: string;
  currentSubcategory: string;
  basket: Record<string, number>;
  updateQty: (id: string, delta: number) => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const subcategories = (ANIMAL_SUBCATEGORIES[animal] || []).filter(
    (sc) => sc.slug !== currentSubcategory
  );

  const selectedSc = subcategories.find((sc) => sc.slug === selectedSlug);

  const { data: subcatProducts } = useQuery<Product[]>({
    queryKey: ["/api/subcategory-products", animal, selectedSc?.slug],
    queryFn: () => fetch(`/api/subcategory-products/${animal}/${selectedSc!.slug}`).then(r => r.json()),
    enabled: !!selectedSc?.hasBrands,
  });

  const inlineProducts = useMemo(() => {
    if (!selectedSc) return [];

    if (selectedSc.hasBrands && subcatProducts) {
      return subcatProducts
        .filter((p) => p.isActive)
        .map((p) => ({
          id: String(p.id),
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice ?? undefined,
          img: p.img ?? undefined,
          skt: p.skt ?? undefined,
          stock: p.stock,
          preorderEnabled: p.preorderEnabled,
        }));
    }

    if (selectedSc.staticCategory) {
      const cat = CATEGORIES.find((c) => c.title === selectedSc.staticCategory);
      if (cat) return cat.items;
    }

    return [];
  }, [selectedSc, subcatProducts, animal]);

  return (
    <section className="mt-8" data-testid="section-other-categories" ref={sectionRef}>
      <h3 className="text-sm font-bold text-center text-muted-foreground mb-3 uppercase tracking-wide" data-testid="text-other-categories-title">
        Diger Kategoriler
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {subcategories.map((sc) => (
          <Button
            key={sc.slug}
            variant={selectedSlug === sc.slug ? "default" : "outline"}
            size="sm"
            className="text-xs font-semibold whitespace-nowrap"
            onClick={() => {
              const newSlug = selectedSlug === sc.slug ? null : sc.slug;
              setSelectedSlug(newSlug);
              if (newSlug) {
                setTimeout(() => {
                  productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 350);
              }
            }}
            data-testid={`btn-subcategory-${sc.slug}`}
          >
            {sc.name}
            {selectedSlug === sc.slug && <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        ))}
      </div>

      {selectedSlug && inlineProducts.length > 0 && (
        <div
          ref={productsRef}
          className="mt-4"
          data-testid="section-inline-products"
        >
          <p className="text-xs text-muted-foreground text-center mb-3" data-testid="text-inline-count">
            {inlineProducts.length} ürün
          </p>
          <div className="grid grid-cols-2 gap-3">
            {inlineProducts.map((product) => (
              <div key={product.id}>
                <InlineSubcategoryProductCard
                  product={product}
                  quantity={basket[product.id] || 0}
                  onUpdate={updateQty}
                  showDetailLink={!!selectedSc?.hasBrands || !isFoodSubcategory(selectedSc?.slug || "")}
                  isMama={(animal === "kedi" || animal === "kopek") && isStrictMamaSubcategory(selectedSc?.slug || "")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedSlug && inlineProducts.length === 0 && !selectedSc?.hasBrands && !selectedSc?.staticCategory && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-no-inline-products">
            Bu kategoride henüz ürün bulunmuyor
          </p>
        </div>
      )}
    </section>
  );
}

const MAMA_TYPE_LABELS: Record<string, string> = {
  yavru: "Yavru",
  yetiskin: "Yetişkin",
  kisir: "Kısır",
  yasli: "Yaşlı",
  "ozel-seri": "Özel Seri",
  veteriner: "Veteriner",
  hipoalerjenik: "Hipoalerjenik",
  "mini-irk": "Mini Irk",
  "buyuk-irk": "Büyük Irk",
};

export default function BrandProductsPage() {
  const [, siparisParams] = useRoute("/siparis/:animal/:subcategory/:brand");
  const [, kategoriParams] = useRoute("/kategori/:animal/:subcategory/:brand");
  const params = siparisParams || kategoriParams;
  const animal = params?.animal || "";
  const subcategory = params?.subcategory || "";
  const brandSlug = params?.brand || "";

  const { basket, updateQty, grandTotal, itemCount } = useCart();
  const [, setLocation] = useLocation();
  const [activeMamaType, setActiveMamaType] = useState("");
  const backUrl = subcategory === brandSlug ? `/kategori/${animal}` : `/kategori/${animal}/${subcategory}`;

  const { data, isLoading } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", animal, subcategory, brandSlug],
    enabled: !!(animal && subcategory && brandSlug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-16">
        <div className="px-3 pt-4">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-16">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Bu marka henüz eklenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16">
      <SEO
        title={`${data.category.brandName} ${animal === "kedi" ? "Kedi" : animal === "kopek" ? "Köpek" : animal === "kus" ? "Kuş" : "Kemirgen"} Maması Samsun - Fiyatları ve Online Sipariş | JETGO`}
        description={`${data.category.brandName} ${animal === "kedi" ? "kedi" : animal === "kopek" ? "köpek" : animal === "kus" ? "kuş" : "kemirgen"} maması Samsun'da en uygun fiyatlarla JETGO Pet Shop'ta. Samsun içi aynı gün teslimat, kapıda ödeme. ${data.category.brandName} ürünlerini online sipariş edin.`}
        canonical={`${SITE_DOMAIN}/siparis/${animal}/${subcategory}/${brandSlug}`}
      />
      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6 pb-28 md:pb-8">
        <FreeShippingBanner className="mb-4" />
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold" data-testid="text-brand-title">
            {data.category.brandName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-product-count">
            {data.products.length} ürün
          </p>
        </div>

        {animal !== "kus" && animal !== "kemirgen" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 mb-4" data-testid="banner-orijinal-urun">
            <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400 bg-white dark:bg-green-950 shrink-0 no-default-hover-elevate">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Orijinal Urun
            </Badge>
            <span className="text-xs text-muted-foreground">
              JETGO, {data.category.brandName} yetkili satıcısıdır.
            </span>
          </div>
        )}

        {shouldShowFastDelivery(animal, subcategory) && (
          <div className="mb-4">
            <FastDeliveryBanner />
          </div>
        )}

        {(() => {
          const availableTypes = [...new Set(data.products.map(p => p.mamaType).filter(Boolean))] as string[];
          if (availableTypes.length === 0) return null;
          return (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4 pb-1" data-testid="filter-mama-types">
              <button
                type="button"
                onClick={() => setActiveMamaType("")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${!activeMamaType ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                data-testid="btn-filter-all"
              >
                Tümü
              </button>
              {availableTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveMamaType(activeMamaType === t ? "" : t)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeMamaType === t ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  data-testid={`btn-filter-${t}`}
                >
                  {MAMA_TYPE_LABELS[t] || t}
                </button>
              ))}
            </div>
          );
        })()}

        <div className="grid grid-cols-2 gap-3" data-testid="grid-products">
          {data.products
            .filter(p => !activeMamaType || p.mamaType === activeMamaType)
            .map((product) => (
            <div key={product.id}>
              <BrandProductCard
                product={product}
                quantity={basket[String(product.id)] || 0}
                onUpdate={updateQty}
                showDetailLink={subcategory !== brandSlug || !isFoodSubcategory(subcategory)}
                isMama={(animal === "kedi" || animal === "kopek") && isStrictMamaSubcategory(subcategory)}
              />
            </div>
          ))}
        </div>

      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t p-3">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground" data-testid="text-sticky-count">{itemCount} ürün</span>
              <span className="text-lg font-extrabold text-primary" data-testid="text-sticky-total">
                {Math.round(grandTotal)} TL
              </span>
            </div>
            <Button variant="default" data-testid="btn-sticky-checkout" onClick={() => setLocation("/odeme")}>
                <ShoppingCart className="w-4 h-4" />
                Siparişi Onayla
              </Button>
          </div>
        </div>
      )}
    </div>
  );
}
