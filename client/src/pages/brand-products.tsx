import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import FloatingCartBar from "@/components/FloatingCartBar";
import BackNavigation from "@/components/BackNavigation";

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
      className={`overflow-visible transition-all duration-200 ${isActive ? "ring-2 ring-primary ring-offset-1" : ""}`}
      data-testid={`card-product-${pid}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
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
