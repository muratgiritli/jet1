import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "wouter";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Package,
  Check,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import {
  CONFIG,
  PAYMENT_OPTIONS,
} from "@/lib/data";
import { useCart } from "@/contexts/CartContext";

const paymentIcons: Record<string, typeof CreditCard> = {
  nakit: Banknote,
  eft: Wallet,
  qr: QrCode,
  pos: CreditCard,
};

export default function Checkout() {
  const {
    paymentId,
    setPaymentId,
    updateQty,
    subtotal,
    selectedProducts,
    shipping,
    discount,
    grandTotal,
    minReached,
    itemCount,
    minPerc,
    shipPerc,
  } = useCart();

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/siparis">
              <Button variant="ghost" size="icon" data-testid="btn-back-to-products">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight" data-testid="text-checkout-title">Sepetim</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-checkout-subtitle">
                {itemCount > 0 ? `${itemCount} ürün` : "Sepet boş"}
              </p>
            </div>
          </div>
          {itemCount > 0 && (
            <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-checkout-total-badge">
              {grandTotal.toFixed(0)} TL
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {selectedProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2" data-testid="text-empty-checkout">Sepetiniz boş</p>
            <p className="text-sm mb-6">Ürün eklemek için mağazaya gidin</p>
            <Link href="/siparis">
              <Button variant="default" size="lg" data-testid="btn-go-shopping">
                <ShoppingCart className="w-4 h-4" />
                Alışverişe Başla
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-cart-items">
                Sepetinizdeki Ürünler
              </h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3" data-testid="list-checkout-items">
                    <AnimatePresence>
                      {selectedProducts.map(({ product, qty }) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 py-2 border-b border-dashed last:border-0 flex-wrap"
                          data-testid={`row-checkout-item-${product.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" data-testid={`text-checkout-name-${product.id}`}>
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-checkout-unit-${product.id}`}>
                              {product.price} TL / adet
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQty(String(product.id), -1)}
                              data-testid={`btn-checkout-minus-${product.id}`}
                            >
                              {qty === 1 ? <Trash2 /> : <Minus />}
                            </Button>
                            <span className="w-8 text-center text-sm font-bold" data-testid={`text-checkout-qty-${product.id}`}>
                              {qty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQty(String(product.id), 1)}
                              data-testid={`btn-checkout-plus-${product.id}`}
                            >
                              <Plus />
                            </Button>
                          </div>
                          <span className="text-sm font-bold shrink-0 min-w-[70px] text-right" data-testid={`text-checkout-linetotal-${product.id}`}>
                            {qty * product.price} TL
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
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

            <section className="mt-6">
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

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-summary">
                Sipariş Özeti
              </h2>
              <Card>
                <CardContent className="p-5">
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

                  <Button
                    className="w-full mt-5"
                    variant="default"
                    size="lg"
                    disabled={!minReached || selectedProducts.length === 0}
                    onClick={handleOrder}
                    data-testid="btn-order-whatsapp"
                  >
                    <SiWhatsapp className="w-5 h-5" />
                    Siparişi Ver
                  </Button>

                  {!minReached && selectedProducts.length > 0 && (
                    <p className="text-xs text-center mt-2 text-muted-foreground" data-testid="text-min-warning">
                      Minimum sipariş tutarı {CONFIG.minLimit} TL'dir
                    </p>
                  )}

                  <Link href="/siparis">
                    <Button
                      className="w-full mt-3"
                      variant="outline"
                      size="lg"
                      data-testid="btn-go-home"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Alışverişe Devam Et
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
