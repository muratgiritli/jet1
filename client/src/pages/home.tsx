import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link, useSearch } from "wouter";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import {
  MAIN_PRODUCTS,
  CATEGORIES,
  type Product,
} from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import BackNavigation from "@/components/BackNavigation";

const SLUG_TO_CATEGORY: Record<string, string> = {
  "kedi-malti": "KEDİ MALT",
  "kedi-bakim-saglik": "BAKIM VE AKSESUAR",
  "uygun-cuval": "KEDİ UYGUN ÇUVAL",
  "kedi-tuvaleti": "KEDİ KUMU",
  "acik-mama": "KEDİ KUMU",
  "tuvalet-malzemeleri": "KEDİ KUMU",
  "yas-mama": "KEDİ YAŞ MAMASI",
  "odul-kemik": "KEDİ ÖDÜLLERİ",
  "bakim-saglik": "BAKIM VE AKSESUAR",
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
      className={`overflow-visible transition-all duration-200 ${isActive ? "ring-2 ring-primary ring-offset-1" : ""}`}
      data-testid={`card-product-${product.id}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        {product.img && (
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30" data-testid={`img-container-${product.id}`}>
            <img
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              data-testid={`img-product-${product.id}`}
            />
          </div>
        )}
        <p className="text-xs font-semibold text-center leading-tight line-clamp-2 min-h-[2rem]" data-testid={`text-name-${product.id}`}>
          {product.name}
        </p>
        <span className="text-sm font-bold text-foreground" data-testid={`text-price-${product.id}`}>
          {product.price} TL
        </span>
        <QuantityControl
          productId={product.id}
          quantity={quantity}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
}

function MainProductRow({
  product,
  quantity,
  onUpdate,
}: {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
}) {
  return (
    <Card data-testid={`card-main-${product.id}`}>
      <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-base" data-testid={`text-main-name-${product.id}`}>{product.name}</span>
          <span className="text-primary font-bold text-lg" data-testid={`text-main-price-${product.id}`}>{product.price} TL</span>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="btn-back">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight" data-testid="text-brand">JetGo</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-brand-subtitle">Hızlı Sipariş</p>
            </div>
          </div>
          {itemCount > 0 && (
            <Link href="/odeme">
              <Button variant="outline" data-testid="btn-go-to-cart">
                <ShoppingCart className="w-4 h-4" />
                <span data-testid="text-cart-count">{itemCount} ürün</span>
                <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-cart-total">{grandTotal.toFixed(0)} TL</Badge>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <BackNavigation />

      <main className="max-w-2xl mx-auto px-4 pb-24">
        <section className="mt-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-main">
            Ana Ürün
          </h2>
          <div className="space-y-3">
            {MAIN_PRODUCTS.map((p) => (
              <MainProductRow
                key={p.id}
                product={p}
                quantity={basket[p.id] || 0}
                onUpdate={updateQty}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
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
                  {grandTotal.toFixed(0)} TL
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
