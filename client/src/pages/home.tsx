import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Package,
  Check,
  Cat,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import {
  CONFIG,
  MAIN_PRODUCTS,
  CATEGORIES,
  PAYMENT_OPTIONS,
  getAllProducts,
  type Product,
} from "@/lib/data";

type BasketItems = Record<string, number>;

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

const paymentIcons: Record<string, typeof CreditCard> = {
  nakit: Banknote,
  eft: Wallet,
  qr: QrCode,
  pos: CreditCard,
};

export default function Home() {
  const [basket, setBasket] = useState<BasketItems>({});
  const [paymentId, setPaymentId] = useState("nakit");
  const summaryRef = useRef<HTMLDivElement>(null);

  const updateQty = useCallback((id: string, delta: number) => {
    setBasket((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  }, []);

  const allProducts = useMemo(() => getAllProducts(), []);

  const { subtotal, selectedProducts, shipping, discount, grandTotal, minReached } = useMemo(() => {
    let sub = 0;
    const selected: { product: Product; qty: number }[] = [];
    allProducts.forEach((p) => {
      const qty = basket[p.id] || 0;
      if (qty > 0) {
        sub += qty * p.price;
        selected.push({ product: p, qty });
      }
    });

    const pay = PAYMENT_OPTIONS.find((p) => p.id === paymentId)!;
    const disc = sub * pay.disc;
    const afterDisc = sub - disc;
    const ship = afterDisc >= CONFIG.shipLimit ? 0 : CONFIG.shipFee;
    const total = afterDisc + ship;
    const min = sub >= CONFIG.minLimit;

    return {
      subtotal: sub,
      selectedProducts: selected,
      shipping: ship,
      discount: disc,
      grandTotal: total,
      minReached: min,
    };
  }, [basket, paymentId, allProducts]);

  const minPerc = Math.min((subtotal / CONFIG.minLimit) * 100, 100);
  const shipPerc = Math.min((subtotal / CONFIG.shipLimit) * 100, 100);
  const itemCount = Object.values(basket).reduce((a, b) => a + b, 0);

  const handleOrder = () => {
    if (!minReached || selectedProducts.length === 0) return;
    const pay = PAYMENT_OPTIONS.find((p) => p.id === paymentId)!;
    let msg = `*JetGo Sipariş*\n\n`;
    selectedProducts.forEach(({ product, qty }) => {
      msg += `${qty}x ${product.name} — ${qty * product.price} TL\n`;
    });
    msg += `\n*Ara Toplam:* ${subtotal} TL`;
    if (discount > 0) msg += `\n*İndirim (${pay.tag}):* -${discount.toFixed(0)} TL`;
    msg += `\n*Teslimat:* ${shipping === 0 ? "Ücretsiz" : shipping + " TL"}`;
    msg += `\n*Genel Toplam:* ${grandTotal.toFixed(0)} TL`;
    msg += `\n*Ödeme:* ${pay.name}`;
    if (pay.id === "eft") msg += CONFIG.bankInfo;

    const url = `https://wa.me/${CONFIG.phone.replace("+", "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const defaultTab = CATEGORIES[0]?.title || "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground">
              <Cat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight" data-testid="text-brand">JetGo</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-brand-subtitle">Hızlı Sipariş</p>
            </div>
          </div>
          {itemCount > 0 && (
            <Button variant="outline" onClick={scrollToSummary} data-testid="btn-go-to-cart">
              <ShoppingCart className="w-4 h-4" />
              <span data-testid="text-cart-count">{itemCount} ürün</span>
              <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-cart-total">{grandTotal.toFixed(0)} TL</Badge>
            </Button>
          )}
        </div>
      </header>

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
          <Tabs defaultValue={defaultTab}>
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

        <section className="mt-8">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-payment">
            Ödeme Seçenekleri
          </h2>
          <Card>
            <CardContent className="p-4">
              <RadioGroup value={paymentId} onValueChange={setPaymentId} data-testid="radio-payment">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = paymentIcons[opt.id] || CreditCard;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors flex-wrap ${paymentId === opt.id ? "bg-accent" : ""}`}
                      data-testid={`radio-payment-${opt.id}`}
                    >
                      <RadioGroupItem value={opt.id} data-testid={`input-radio-${opt.id}`} />
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm font-medium" data-testid={`text-payment-name-${opt.id}`}>{opt.name}</span>
                      <Badge
                        variant={opt.disc > 0 ? "default" : "secondary"}
                        className="no-default-hover-elevate"
                        data-testid={`badge-payment-tag-${opt.id}`}
                      >
                        {opt.tag}
                      </Badge>
                    </label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-progress">
            İlerleme Durumu
          </h2>
          <Card>
            <CardContent className="p-4 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span className="text-sm font-medium" data-testid="text-min-label">Minimum Sipariş</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground" data-testid="text-min-progress">
                    {subtotal}/{CONFIG.minLimit} TL
                  </span>
                </div>
                <Progress
                  value={minPerc}
                  className="h-2 [&>div]:bg-amber-500 dark:[&>div]:bg-amber-400"
                  data-testid="bar-min"
                />
                <p className="text-xs font-medium mt-1.5 text-muted-foreground" data-testid="text-min-hint">
                  {subtotal >= CONFIG.minLimit ? (
                    <span className="text-chart-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Minimum tutar aşıldı
                    </span>
                  ) : (
                    `Minimum sipariş için ${CONFIG.minLimit - subtotal} TL daha ekleyin`
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Truck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium" data-testid="text-ship-label">Ücretsiz Teslimat</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground" data-testid="text-ship-progress">
                    {subtotal}/{CONFIG.shipLimit} TL
                  </span>
                </div>
                <Progress
                  value={shipPerc}
                  className="h-2"
                  data-testid="bar-ship"
                />
                <p className="text-xs font-medium mt-1.5 text-muted-foreground" data-testid="text-ship-hint">
                  {subtotal >= CONFIG.shipLimit ? (
                    <span className="text-chart-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ücretsiz teslimat kazandınız!
                    </span>
                  ) : (
                    `Ücretsiz teslimat için ${CONFIG.shipLimit - subtotal} TL daha ekleyin`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 mb-8" ref={summaryRef}>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-summary">
            Sipariş Özeti
          </h2>
          <Card>
            <CardContent className="p-5">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-cart">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sepetiniz boş</p>
                  <p className="text-xs mt-1">Yukarıdan ürün ekleyerek başlayın</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 pb-4 border-b border-dashed" data-testid="list-basket-items">
                    <AnimatePresence>
                      {selectedProducts.map(({ product, qty }) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between gap-2 py-1 flex-wrap"
                          data-testid={`row-basket-item-${product.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" data-testid={`text-basket-name-${product.id}`}>{product.name}</p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-basket-detail-${product.id}`}>
                              {qty} x {product.price} TL
                            </p>
                          </div>
                          <span className="text-sm font-bold shrink-0" data-testid={`text-basket-total-${product.id}`}>
                            {qty * product.price} TL
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="text-muted-foreground">Ara Toplam</span>
                      <span className="font-medium" data-testid="text-subtotal">{subtotal} TL</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between gap-3 text-chart-2 flex-wrap">
                        <span data-testid="text-discount-label">İndirim ({PAYMENT_OPTIONS.find((p) => p.id === paymentId)?.tag})</span>
                        <span className="font-medium" data-testid="text-discount">-{discount.toFixed(0)} TL</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="text-muted-foreground">Teslimat Ücreti</span>
                      <span className="font-medium" data-testid="text-shipping">
                        {shipping === 0 ? (
                          <span className="text-chart-2">Ücretsiz</span>
                        ) : (
                          `${shipping} TL`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t flex-wrap">
                    <span className="text-lg font-bold">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-primary" data-testid="text-total">
                      {grandTotal.toFixed(0)} TL
                    </span>
                  </div>
                </>
              )}

              <Button
                className="w-full mt-5"
                variant="default"
                size="lg"
                disabled={!minReached || selectedProducts.length === 0}
                onClick={handleOrder}
                data-testid="btn-order-whatsapp"
              >
                <SiWhatsapp className="w-5 h-5" />
                Siparişi Onayla
              </Button>

              {!minReached && selectedProducts.length > 0 && (
                <p className="text-xs text-center mt-2 text-muted-foreground" data-testid="text-min-warning">
                  Minimum sipariş tutarı {CONFIG.minLimit} TL'dir
                </p>
              )}
            </CardContent>
          </Card>
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
              <Button
                variant="default"
                disabled={!minReached || selectedProducts.length === 0}
                onClick={handleOrder}
                data-testid="btn-sticky-order"
              >
                <SiWhatsapp className="w-4 h-4" />
                Siparişi Onayla
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
