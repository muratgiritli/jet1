import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory, CrossSellSection } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import FloatingCartBar from "@/components/FloatingCartBar";
import BackNavigation from "@/components/BackNavigation";
import { CATEGORIES } from "@/lib/data";

interface SubcategoryInfo {
  name: string;
  slug: string;
  hasBrands?: boolean;
  staticCategory?: string;
}

const ANIMAL_SUBCATEGORIES: Record<string, SubcategoryInfo[]> = {
  kopek: [
    { name: "Mama Markalari", slug: "mama-markalari", hasBrands: true },
    { name: "Acik Mama", slug: "acik-mama" },
    { name: "Tuvalet Malzemeleri", slug: "tuvalet-malzemeleri" },
    { name: "Yas Mama", slug: "yas-mama" },
    { name: "Odul Kemik", slug: "odul-kemik" },
    { name: "Tasima ve Kulubeler", slug: "tasima-kulube" },
    { name: "Bakim ve Saglik", slug: "bakim-saglik" },
    { name: "Uygun Cuval Mamalar", slug: "uygun-cuval" },
  ],
  kedi: [
    { name: "Kedi Mamasi", slug: "kedi-mamasi", hasBrands: true },
    { name: "Kumu", slug: "kedi-kumu", staticCategory: "KUMU" },
    { name: "Malti", slug: "kedi-malti", staticCategory: "MALT" },
    { name: "Odulleri", slug: "kedi-odulu", staticCategory: "ÖDÜLLERİ" },
    { name: "Bakim ve Aksesuar", slug: "kedi-bakim-saglik", staticCategory: "BAKIM VE AKSESUAR" },
    { name: "Tasima", slug: "kedi-tasima" },
    { name: "Tuvaleti", slug: "kedi-tuvaleti" },
    { name: "Yas Mamasi", slug: "kedi-konserve", hasBrands: true },
    { name: "Uygun Cuval Mamalar", slug: "uygun-cuval", staticCategory: "UYGUN ÇUVAL" },
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

type ProductDetailData = {
  product: Product;
  category: BrandCategory | null;
  crossSellSections: (CrossSellSection & { products: Product[] })[];
};

function QuantityControl({
  productId,
  quantity,
  onUpdate,
}: {
  productId: string;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
}) {
  return (
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
        className="flex items-center justify-center font-bold text-primary w-10 text-base"
        data-testid={`text-qty-${productId}`}
      >
        {quantity}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUpdate(productId, 1)}
        data-testid={`btn-plus-${productId}`}
      >
        <Plus />
      </Button>
    </div>
  );
}

function CrossSellProductCard({
  product,
  quantity,
  onUpdate,
}: {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
}) {
  const pid = String(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/urun/${product.id}`}>
      <Card className="overflow-visible hover-elevate cursor-pointer" data-testid={`card-cross-sell-${pid}`}>
        <CardContent className="p-2 flex flex-col items-center gap-1.5">
          {product.img && (
            <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
              {discount > 0 && (
                <Badge
                  className="absolute top-1 right-1 text-[9px] no-default-hover-elevate no-default-active-elevate"
                  style={{ backgroundColor: "#e53935", color: "#fff" }}
                >
                  %{discount}
                </Badge>
              )}
            </div>
          )}
          <p className="text-[11px] font-semibold text-center leading-tight line-clamp-2 min-h-[1.5rem]">
            {product.name}
          </p>
          <span className="text-xs font-bold text-foreground">
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
          </span>
          {product.stock === 0 ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>
              <Bell className="w-3 h-3" />
              Tukendi
            </div>
          ) : (
            <div onClick={(e) => e.preventDefault()}>
              <QuantityControl productId={pid} quantity={quantity} onUpdate={onUpdate} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function InlineSubcategoryProductCard({
  product,
  quantity,
  onUpdate,
}: {
  product: { id: string; name: string; price: number; originalPrice?: number; img?: string; skt?: string };
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
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
        {product.img && (
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative">
            <img
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
        )}
        <p className="text-xs font-semibold text-center leading-tight line-clamp-2 min-h-[2rem]">
          {product.name}
        </p>
        <div className="flex flex-col items-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through">
              {product.originalPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span className="text-sm font-bold text-foreground">
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </span>
        </div>
        <QuantityControl
          productId={product.id}
          quantity={quantity}
          onUpdate={onUpdate}
        />
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

  const { data: allBrandCategories } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
    enabled: !!selectedSc?.hasBrands,
  });

  const { data: allDbProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!selectedSc?.hasBrands,
  });

  const inlineProducts = useMemo(() => {
    if (!selectedSc) return [];

    if (selectedSc.hasBrands && allBrandCategories && allDbProducts) {
      const matchingCatIds = allBrandCategories
        .filter((bc) => bc.animal === animal && bc.subcategory === selectedSc.slug)
        .map((bc) => bc.id);
      return allDbProducts
        .filter((p) => p.isActive && p.brandCategoryId && matchingCatIds.includes(p.brandCategoryId))
        .map((p) => ({
          id: String(p.id),
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice ?? undefined,
          img: p.img ?? undefined,
          skt: p.skt ?? undefined,
        }));
    }

    if (selectedSc.staticCategory) {
      const cat = CATEGORIES.find((c) => c.title === selectedSc.staticCategory);
      if (cat) return cat.items;
    }

    return [];
  }, [selectedSc, allBrandCategories, allDbProducts, animal]);


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

      <AnimatePresence mode="wait">
        {selectedSlug && inlineProducts.length > 0 && (
          <motion.div
            ref={productsRef}
            key={selectedSlug}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
            data-testid="section-inline-products"
          >
            <p className="text-xs text-muted-foreground text-center mb-3" data-testid="text-inline-count">
              {inlineProducts.length} ürün
            </p>
            <div className="grid grid-cols-2 gap-3">
              {inlineProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.03 * Math.min(i, 10) }}
                >
                  <InlineSubcategoryProductCard
                    product={product}
                    quantity={basket[product.id] || 0}
                    onUpdate={updateQty}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {selectedSlug && inlineProducts.length === 0 && !selectedSc?.hasBrands && !selectedSc?.staticCategory && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-muted-foreground" data-testid="text-no-inline-products">
              Bu kategoride henüz ürün bulunmuyor
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/urun/:id");
  const productId = params?.id || "";

  const { basket, updateQty, grandTotal, itemCount } = useCart();

  const { data, isLoading } = useQuery<ProductDetailData>({
    queryKey: ["/api/product-detail", productId],
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => window.history.back()} data-testid="btn-back">
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-logo">
              <span style={{ color: "#ffffff" }}>JET</span>
              <span style={{ color: "#1a7a1a" }}>GO</span>
            </h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => window.history.back()} data-testid="btn-back">
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-logo">
              <span style={{ color: "#ffffff" }}>JET</span>
              <span style={{ color: "#1a7a1a" }}>GO</span>
            </h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Urun bulunamadi</p>
        </div>
      </div>
    );
  }

  const { product, category, crossSellSections } = data;
  const pid = String(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const quantity = basket[pid] || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => window.history.back()} data-testid="btn-back">
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-logo">
              <span style={{ color: "#ffffff" }}>JET</span>
              <span style={{ color: "#1a7a1a" }}>GO</span>
            </h1>
          </div>
          {itemCount > 0 && (
            <Link href="/odeme">
              <Button variant="outline" className="bg-white/90" data-testid="btn-go-to-cart">
                <ShoppingCart className="w-4 h-4" />
                <span data-testid="text-cart-count">{itemCount}</span>
                <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-cart-total">{grandTotal.toFixed(0)} TL</Badge>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <BackNavigation />

      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {product.img && (
              <div className="md:w-1/2 w-full aspect-square flex items-center justify-center rounded-lg overflow-hidden bg-muted/30 relative" data-testid="img-product-detail">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  data-testid="img-product"
                />
                {product.skt && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 no-default-hover-elevate no-default-active-elevate"
                    data-testid="badge-skt"
                  >
                    SKT: {product.skt}
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge
                    className="absolute top-2 right-2 no-default-hover-elevate no-default-active-elevate"
                    style={{ backgroundColor: "#e53935", color: "#fff" }}
                    data-testid="badge-discount"
                  >
                    %{discount}
                  </Badge>
                )}
              </div>
            )}

            <div className="md:w-1/2 w-full flex flex-col gap-3">
              <h1 className="text-xl font-bold leading-tight" data-testid="text-product-name">
                {product.name}
              </h1>

              {category && (
                <p className="text-sm text-muted-foreground" data-testid="text-brand-name">
                  {category.brandName}
                </p>
              )}

              {product.skt && (
                <p className="text-sm font-semibold" style={{ color: "#e65100" }} data-testid="text-skt-detail">
                  SKT: {product.skt}
                </p>
              )}

              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-muted-foreground line-through" data-testid="text-original-price">
                    {product.originalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </span>
                )}
                <span className="text-2xl font-extrabold" style={{ color: "#e65100" }} data-testid="text-price">
                  {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </span>
              </div>

              {product.stock === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold mt-2" style={{ backgroundColor: "#fff3e0", color: "#e65100" }} data-testid="badge-out-of-stock">
                  <Bell className="w-4 h-4" />
                  Gelince Haber Ver
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground font-medium">ADET</span>
                    <QuantityControl productId={pid} quantity={quantity} onUpdate={updateQty} />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      className="flex-1"
                      style={{ backgroundColor: "#e65100" }}
                      onClick={() => { if (quantity === 0) updateQty(pid, 1); }}
                      data-testid="btn-add-to-cart"
                    >
                      SEPETE EKLE
                    </Button>
                    <Link href="/odeme" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => { if (quantity === 0) updateQty(pid, 1); }}
                        data-testid="btn-buy-now"
                      >
                        HEMEN AL
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {product.stock > 0 && product.stock <= 3 && (
                <p className="text-xs font-semibold" style={{ color: "#d32f2f" }} data-testid="text-low-stock">
                  Son {product.stock} adet!
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {crossSellSections.length > 0 && (
          <div className="mt-10 space-y-8">
            {crossSellSections.map((section) => (
              <section key={section.id} data-testid={`section-cross-sell-${section.id}`}>
                <h3 className="text-base font-bold mb-3 border-b pb-2" data-testid={`text-section-title-${section.id}`}>
                  {section.title}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {section.products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.03 * i }}
                    >
                      <CrossSellProductCard
                        product={p}
                        quantity={basket[String(p.id)] || 0}
                        onUpdate={updateQty}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {category && ANIMAL_SUBCATEGORIES[category.animal] && (
          <InlineSubcategories
            animal={category.animal}
            currentSubcategory={category.subcategory}
            basket={basket}
            updateQty={updateQty}
          />
        )}
      </main>

      <FloatingCartBar />
    </div>
  );
}