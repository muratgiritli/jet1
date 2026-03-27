import { motion, AnimatePresence } from "framer-motion";
import ProductImage from "@/components/ProductImage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import {
  CATEGORIES,
  type Product,
} from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import BackNavigation from "@/components/BackNavigation";

const SLUG_TO_CATEGORY: Record<string, string> = {
  "kedi-bakim-saglik": "BAKIM VE SAĞLIK",
  "kedi-tuvaleti": "KUM",
  "acik-mama": "KUM",
  "tuvalet-malzemeleri": "KUM",
  "yas-mama": "YAŞ MAMA",
  "odul-kemik": "ÖDÜL",
  "kedi-odulu": "ÖDÜL",
  "bakim-saglik": "BAKIM VE SAĞLIK",
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

function ProductCard({
  product,
  quantity,
  onUpdate,
}: {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
}) {
  const isActive = quantity > 0;
  return (
    <Card
      className={`transition-all duration-200 ${isActive ? "ring-2 ring-inset ring-primary" : ""}`}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30" data-testid={`img-container-${product.id}`}>
            <ProductImage
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              data-testid={`img-product-${product.id}`}
            />
          </div>
        <p className="text-xs font-semibold text-center leading-tight line-clamp-2 min-h-[2rem]" data-testid={`text-name-${product.id}`}>
          {product.name}
        </p>
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <span className="text-sm font-bold text-foreground" data-testid={`text-price-${product.id}`}>
              {product.price} TL
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                {product.originalPrice} TL
              </span>
            )}
          </div>
          {product.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" data-testid={`badge-skt-${product.id}`}>
              S.K.T: {product.skt}
            </span>
          )}
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

export default function Home() {
  const {
    basket,
    updateQty,
    grandTotal,
    itemCount,
  } = useCart();

  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const altSlug = params.get("alt") || "";
  const mappedCategory = SLUG_TO_CATEGORY[altSlug] || "";
  const defaultTab = (mappedCategory && CATEGORIES.find(c => c.title === mappedCategory)) ? mappedCategory : (CATEGORIES[0]?.title || "");

  const directSlugs: Record<string, { title: string; heading: string; subtitle: string; dbSlug?: string }> = {
    "kedi-odulu": { title: "ÖDÜL", heading: "Kedi Ödülü", subtitle: "Ödül & Atıştırmalık", dbSlug: "odul" },
    "kedi-bakim-saglik": { title: "BAKIM VE SAĞLIK", heading: "Kedi Bakım & Sağlık", subtitle: "Bakım ve Sağlık Ürünleri", dbSlug: "bakim-saglik" },
  };
  const directInfo = directSlugs[altSlug] || null;
  const directCategory = directInfo ? CATEGORIES.find(c => c.title === directInfo.title) : null;

  const dbSlug = directInfo?.dbSlug || null;
  const { data: dbProducts } = useQuery<{ category: any; products: any[] }>({
    queryKey: ["/api/brand-products", "kedi", dbSlug, dbSlug],
    enabled: !!dbSlug,
  });

  const mergedDirectItems = (() => {
    const staticItems = directCategory?.items || [];
    if (!dbProducts?.products?.length) return staticItems;
    const dbMapped: Product[] = dbProducts.products.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      skt: p.skt || undefined,
      img: p.img || "",
    }));
    const staticIds = new Set(staticItems.map(i => i.name.toLowerCase()));
    const uniqueDb = dbMapped.filter(p => !staticIds.has(p.name.toLowerCase()));
    return [...uniqueDb, ...staticItems];
  })();

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="btn-back">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight" data-testid="text-brand">{directInfo ? directInfo.heading : "JETGO"}</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-brand-subtitle">{directInfo ? directInfo.subtitle : "Hızlı Sipariş"}</p>
            </div>
          </div>
          {itemCount > 0 && (
            <Link href="/odeme">
              <Button variant="outline" data-testid="btn-go-to-cart">
                <ShoppingCart className="w-4 h-4" />
                <span data-testid="text-cart-count">{itemCount} ürün</span>
                <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-cart-total">{Math.round(grandTotal)} TL</Badge>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <BackNavigation />

      <main className="max-w-2xl mx-auto px-4 pb-24 md:pb-8">
        <section className="mt-6">
          {directCategory ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mergedDirectItems.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  quantity={basket[item.id] || 0}
                  onUpdate={updateQty}
                />
              ))}
            </div>
          ) : (
          <Tabs defaultValue={defaultTab} key={defaultTab}>
            <TabsList className="w-full flex-wrap h-auto gap-1 p-1" data-testid="tabs-categories">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.title}
                  value={cat.title}
                  className="text-xs flex-1 min-w-[90px]"
                  data-testid={`tab-${cat.title}`}
                >
                  {cat.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.title} value={cat.title}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {cat.items.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      quantity={basket[item.id] || 0}
                      onUpdate={updateQty}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          )}
        </section>
      </main>

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t p-3"
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground" data-testid="text-sticky-count">{itemCount} ürün</span>
                <span className="text-lg font-extrabold text-primary" data-testid="text-sticky-total">
                  {Math.round(grandTotal)} TL
                </span>
              </div>
              <Link href="/odeme">
                <Button
                  variant="default"
                  data-testid="btn-sticky-checkout"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Siparişi Onayla
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
