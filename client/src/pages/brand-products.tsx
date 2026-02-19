import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory } from "@shared/schema";
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
    { name: "Kopek Mamasi", slug: "mama-markalari", hasBrands: true },
    { name: "Acik Mama", slug: "acik-mama", hasBrands: true },
    { name: "Tuvalet Malzemeleri", slug: "tuvalet-malzemeleri" },
    { name: "Yas Mama", slug: "yas-mama", hasBrands: true },
    { name: "Odul Kemik", slug: "odul-kemik" },
    { name: "Tasima ve Kulubeler", slug: "tasima-kulube" },
    { name: "Bakim ve Saglik", slug: "bakim-saglik" },
    { name: "Uygun Cuval Mamalar", slug: "uygun-cuval" },
  ],
  kedi: [
    { name: "Kedi Mamasi", slug: "kedi-mamasi", hasBrands: true },
    { name: "Kum", slug: "kedi-kumu", staticCategory: "KUM" },
    { name: "Malt", slug: "kedi-malti", staticCategory: "MALT" },
    { name: "Ödül", slug: "kedi-odulu", staticCategory: "ÖDÜL" },
    { name: "Bakım ve Sağlık", slug: "kedi-bakim-saglik", staticCategory: "BAKIM VE SAĞLIK" },
    { name: "Taşıma", slug: "kedi-tasima" },
    { name: "Tuvalet", slug: "kedi-tuvaleti" },
    { name: "Yaş Mama", slug: "kedi-konserve", hasBrands: true },
    { name: "Çuval Mama", slug: "uygun-cuval", staticCategory: "ÇUVAL MAMA" },
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
        className="flex items-center justify-center font-bold text-primary w-8 text-sm"
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

function BrandProductCard({
  product,
  quantity,
  onUpdate,
}: {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
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
        <Link href={`/urun/${product.id}`} className="w-full flex flex-col items-center gap-2">
          {product.img && (
            <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative" data-testid={`img-container-${pid}`}>
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
                data-testid={`img-product-${pid}`}
              />
              {product.skt && (
                <Badge
                  variant="secondary"
                  className="absolute top-1 left-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
                  data-testid={`badge-skt-${pid}`}
                >
                  SKT: {product.skt}
                </Badge>
              )}
              {discount > 0 && (
                <Badge
                  className="absolute top-1 right-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
                  style={{ backgroundColor: "#e53935", color: "#fff" }}
                  data-testid={`badge-discount-${pid}`}
                >
                  %{discount}
                </Badge>
              )}
            </div>
          )}
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
        </div>
        {product.stock === 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold" style={{ backgroundColor: "#fff3e0", color: "#e65100" }} data-testid={`badge-out-of-stock-${pid}`}>
            <Bell className="w-3.5 h-3.5" />
            Gelince Haber Ver
          </div>
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

export default function BrandProductsPage() {
  const [, params] = useRoute("/siparis/:animal/:subcategory/:brand");
  const animal = params?.animal || "";
  const subcategory = params?.subcategory || "";
  const brandSlug = params?.brand || "";

  const { basket, updateQty, grandTotal, itemCount } = useCart();

  const { data, isLoading } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", animal, subcategory, brandSlug],
    enabled: !!(animal && subcategory && brandSlug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link href={`/kategori/${animal}/${subcategory}`}>
              <Button variant="ghost" size="icon" className="text-white" data-testid="btn-back">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-brand-logo">
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
      <div className="min-h-screen flex flex-col bg-white">
        <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link href={`/kategori/${animal}/${subcategory}`}>
              <Button variant="ghost" size="icon" className="text-white" data-testid="btn-back">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-brand-logo">
              <span style={{ color: "#ffffff" }}>JET</span>
              <span style={{ color: "#1a7a1a" }}>GO</span>
            </h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Bu marka henüz eklenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href={`/kategori/${animal}/${subcategory}`}>
              <Button variant="ghost" size="icon" className="text-white" data-testid="btn-back">
                <ArrowLeft />
              </Button>
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-brand-logo">
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

      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6 pb-28">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold" data-testid="text-brand-title">
            {data.category.brandName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-product-count">
            {data.products.length} ürün
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3" data-testid="grid-products">
          {data.products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.03 * i }}
            >
              <BrandProductCard
                product={product}
                quantity={basket[String(product.id)] || 0}
                onUpdate={updateQty}
              />
            </motion.div>
          ))}
        </div>

        {ANIMAL_SUBCATEGORIES[animal] && (
          <InlineSubcategories
            animal={animal}
            currentSubcategory={subcategory}
            basket={basket}
            updateQty={updateQty}
          />
        )}
      </main>

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t p-3"
          >
            <div className="max-w-lg mx-auto flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground" data-testid="text-sticky-count">{itemCount} ürün</span>
                <span className="text-lg font-extrabold text-primary" data-testid="text-sticky-total">
                  {grandTotal.toFixed(0)} TL
                </span>
              </div>
              <Link href="/odeme">
                <Button variant="default" data-testid="btn-sticky-checkout">
                  <ShoppingCart className="w-4 h-4" />
                  Siparişi Onayla
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FloatingCartBar />
    </div>
  );
}
