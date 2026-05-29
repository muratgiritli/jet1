import { useMemo, useEffect, useState } from "react";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useRoute, useLocation } from "wouter";
import { ShoppingCart, Gift, Star, ChevronDown, MessageSquare, Plus, Minus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Product, BrandCategory } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import FastDeliveryBanner, { shouldShowFastDelivery } from "@/components/FastDeliveryBanner";
import { productUrl } from "@/lib/data";
import FavoriteButton from "@/components/FavoriteButton";
import ImageZoom from "@/components/ImageZoom";
import ProductImage from "@/components/ProductImage";
import { ProductDetailSkeleton } from "@/components/ProductSkeleton";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import InstallmentBanner from "@/components/InstallmentBanner";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ProductDetailData = {
  product: Product;
  category: BrandCategory | null;
  crossSellSections: any[];
};

interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  reviewDate: string;
  isPublished: boolean;
}

function StarRow({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

function ReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: number | string;
  productName: string;
}) {
  const { isLoggedIn, customer } = useCustomer();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/reviews/${productId}`, {
        reviewerName: customer?.name || "Misafir",
        rating,
        comment: text.trim(),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", productId] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Yorumunuz gönderilemedi.", variant: "destructive" });
    },
  });

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setText("");
      setRating(5);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yorum Yaz — {productName}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-sm font-semibold text-emerald-600 mb-1">Yorumunuz alındı!</p>
            <p className="text-xs text-muted-foreground mb-4">
              Yorumunuz <strong>admin onayından</strong> sonra yayınlanacaktır.
            </p>
            <Button onClick={close} data-testid="btn-review-done-demo">Tamam</Button>
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Yorum yazmak için üye girişi yapmalısınız.</p>
            <Button variant="outline" onClick={close}>Kapat</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-1 justify-center" role="group" aria-label="Puan seçin">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none"
                  data-testid={`btn-star-demo-${s}`}
                >
                  <Star className={`w-8 h-8 transition-colors ${s <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6B3480]/20 focus:border-[#6B3480]"
              rows={4}
              placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid="input-review-text-demo"
            />
            <p className="text-[11px] text-muted-foreground">
              Yorumunuz <strong>admin onayından</strong> sonra yayınlanacaktır.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                style={{ backgroundColor: "#6B3480" }}
                disabled={text.trim().length < 10 || submit.isPending}
                onClick={() => submit.mutate()}
                data-testid="btn-submit-review-demo"
              >
                {submit.isPending ? "Gönderiliyor..." : "Gönder"}
              </Button>
              <Button variant="outline" onClick={close}>İptal</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AccordionItem({
  title,
  defaultOpen = false,
  children,
  testId,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  testId?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden bg-white" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm hover:bg-gray-50 transition-colors"
        data-testid={testId ? `${testId}-toggle` : undefined}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-700 leading-relaxed">{children}</div>}
    </div>
  );
}

function FBTCard({
  product,
  selected,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-col items-center text-center border-2 rounded-lg p-2 transition-all ${
        selected ? "border-orange-600 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-400"
      }`}
      data-testid={`btn-fbt-${product.id}`}
    >
      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted/30 mb-1">
        <ProductImage src={product.img} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
      </div>
      <p className="text-[11px] font-medium line-clamp-2 leading-tight mb-1">{product.name}</p>
      <p className="text-xs font-bold text-primary">{product.price.toLocaleString("tr-TR")} TL</p>
      <div className={`mt-1.5 w-4 h-4 rounded border-2 flex items-center justify-center ${selected ? "bg-orange-600 border-orange-600" : "border-gray-300"}`}>
        {selected && <span className="text-white text-[10px]">✓</span>}
      </div>
    </button>
  );
}

export default function ProductDetailDemoPage() {
  const [, params] = useRoute("/urun-demo/:id/:slug?");
  const productId = params?.id || "";

  const { basket, updateQty, setVariant, getVariant, updateStock } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ProductDetailData>({
    queryKey: ["/api/product-detail", productId],
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews", productId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${productId}`);
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : [];
    },
    enabled: !!productId,
  });

  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string | null>(null);
  const [variantInitialized, setVariantInitialized] = useState(false);
  const [paraPuanOpen, setParaPuanOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [fbtSelected, setFbtSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data?.product) updateStock(String(data.product.id), data.product.stock ?? 0);
  }, [data, updateStock]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Ürün bulunamadı</p>
        </div>
      </div>
    );
  }

  const { product, category, crossSellSections } = data;
  const pid = String(product.id);
  const productVariants = ((product as any).variants || []) as { label: string; price: number }[];
  const hasVariants = productVariants.length > 0;

  if (!variantInitialized) {
    const existing = getVariant(pid);
    if (existing && productVariants.some((v) => v.label === existing.label)) {
      setSelectedVariantLabel(existing.label);
    }
    setVariantInitialized(true);
  }

  const selectedVariant = hasVariants
    ? productVariants.find((v) => v.label === selectedVariantLabel) || null
    : null;
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = product.originalPrice;
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;
  const quantity = basket[pid] || 0;
  const paraPuan = displayPrice * 0.05;

  const fbtProducts = (crossSellSections || []).flatMap((s: any) => s.products || []).slice(0, 4);
  const fbtTotal =
    displayPrice +
    fbtProducts.filter((p: Product) => fbtSelected[String(p.id)]).reduce((a: number, p: Product) => a + p.price, 0);

  const addBundleToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast({ title: "Lütfen seçenek belirleyin", variant: "destructive" });
      return;
    }
    if (quantity === 0) updateQty(pid, 1, false, selectedVariant ?? undefined);
    fbtProducts.forEach((p: Product) => {
      if (fbtSelected[String(p.id)] && !(basket[String(p.id)] > 0)) {
        updateQty(String(p.id), 1, false);
      }
    });
    toast({ title: "Sepete eklendi" });
  };

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const relatedKeywords = [
    `${product.name} fiyat`,
    `${product.name} Samsun`,
    `${category?.brandName || "pet shop"} ürünleri`,
    `kapıda ödeme ${category?.animal === "kedi" ? "kedi" : category?.animal === "kopek" ? "köpek" : "evcil hayvan"} ürünleri`,
    "Samsun pet shop",
    "aynı gün teslimat pet shop",
  ];

  const faqs = [
    {
      q: "Kargo süresi ne kadar?",
      a: "Samsun içi siparişlerinizi aynı gün veya en geç 1 iş günü içinde teslim ediyoruz. Stoktaki ürünler için 3 iş günü içinde teslimat garantilidir.",
    },
    {
      q: "Kapıda ödeme yapabilir miyim?",
      a: "Evet. Nakit, kapıda kredi kartı (POS) ve kapıda QR ile ödeme yapabilirsiniz. Ayrıca online kredi kartı ve banka havalesi seçenekleri de mevcuttur.",
    },
    {
      q: "Para Puan nasıl kazanırım?",
      a: "Yaptığınız her alışverişin %5'i Para Puan olarak hesabınıza yüklenir. Bir sonraki siparişinizde indirim olarak otomatik uygulanır.",
    },
    {
      q: "İade ve değişim koşulları nelerdir?",
      a: "Açılmamış ve kullanılmamış ürünleri 14 gün içinde iade edebilirsiniz. Mama ürünlerinde son kullanma tarihi geçmemiş ve ambalajı açılmamış olma şartı aranır.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <SEO
        title={`${product.name} | JETGO Pet Shop Samsun`}
        description={`${product.name} - Samsun JETGO Pet Shop. Aynı gün teslimat, kapıda ödeme.`}
        canonical={`${SITE_DOMAIN}/urun-demo/${product.id}`}
      />

      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6 pb-28 md:pb-8">
        <div className="mb-3 px-3 py-2 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-800" data-testid="demo-banner">
          <strong>DEMO SAYFA</strong> — Yeni ürün sayfası düzeni. Mevcut sayfa <code>/urun/{product.id}</code> adresinde değişmedi.
        </div>

        <FreeShippingBanner className="mb-4" />

        <div className="flex flex-col md:flex-row gap-6">
          <ImageZoom src={product.img || ""} alt={product.name} className="md:w-1/2 w-full">
            <div className="aspect-square flex items-center justify-center rounded-lg overflow-hidden bg-muted/30 relative">
              <ProductImage src={product.img} alt={product.name} className="w-full h-full object-contain" />
              {discount > 0 && (
                <Badge className="absolute top-2 right-2" style={{ backgroundColor: "#e53935", color: "#fff" }}>
                  %{discount}
                </Badge>
              )}
              <FavoriteButton
                product={{ id: pid, name: product.name, price: product.price, img: product.img }}
                size="md"
                className="absolute bottom-2 right-2 shadow-md"
              />
            </div>
          </ImageZoom>

          <div className="md:w-1/2 w-full flex flex-col gap-3">
            <h1 className="text-xl font-bold leading-tight" data-testid="text-product-name-demo">
              {product.name}
            </h1>

            {category && (
              <Link
                href={`/siparis/${category.animal}/${category.subcategory}/${category.brandSlug}`}
                className="text-sm text-primary hover:underline w-fit"
              >
                {category.brandName}
              </Link>
            )}

            {/* Yıldız ve yorum yazma — başlığın hemen altında */}
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="flex items-center gap-2 group w-fit"
              data-testid="btn-open-review-dialog"
            >
              <StarRow value={avgRating} />
              <span className="text-sm text-gray-700 group-hover:text-primary">
                {reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} yorum)` : "Henüz yorum yok"}
              </span>
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Yorum Yaz
              </span>
            </button>

            {/* SEÇENEKLER — Para Puan'dan ÖNCE */}
            {hasVariants && (
              <div className="space-y-2" data-testid="section-variants-demo">
                <div className="text-sm font-semibold text-gray-700">
                  Seçenek <span className="text-red-500">*</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productVariants.map((v) => {
                    const isSel = selectedVariantLabel === v.label;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        onClick={() => {
                          setSelectedVariantLabel(v.label);
                          if (quantity > 0) setVariant(pid, v);
                        }}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSel
                            ? "border-orange-600 bg-orange-50 text-orange-900"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                        data-testid={`btn-variant-demo-${v.label.replace(/\s+/g, "-")}`}
                      >
                        <span className="font-semibold">{v.label}</span>
                        <span className="ml-2 text-xs opacity-80">
                          {v.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!selectedVariant && (
                  <p className="text-xs text-amber-700">Lütfen bir seçenek belirleyin.</p>
                )}
              </div>
            )}

            {/* Fiyat */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-2xl font-extrabold" data-testid="text-price-demo">
                {displayPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-base text-gray-400 line-through">
                  {displayOriginalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </span>
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Nakit: {(displayPrice * 0.9).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
            </div>

            {/* Para Puan — seçenek seçimine göre dinamik */}
            <div data-testid="text-loyalty-points-demo">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: "#fef3e2", border: "1px solid #ffe0b2" }}
              >
                <Gift className="w-4 h-4 shrink-0" style={{ color: "#e65100" }} />
                <span style={{ color: "#bf360c" }}>
                  {hasVariants && !selectedVariant ? (
                    <>Seçenek belirleyince <strong>%5</strong> Para Puan kazancınız hesaplanır.</>
                  ) : (
                    <>
                      Bu seçenek için{" "}
                      <strong>{paraPuan.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>{" "}
                      Para Puan kazanırsınız (%5).
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setParaPuanOpen(true)}
                className="mt-1.5 ml-1 text-xs font-semibold"
                style={{ color: "#e65100" }}
                data-testid="btn-para-puan-info-demo"
              >
                Para Puan nedir?
              </button>
            </div>

            <InstallmentBanner variant="compact" pricePerInstallment={displayPrice / 3} />

            {/* Adet ve butonlar */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground font-medium">ADET</span>
                <div className="flex items-center gap-0">
                  <Button variant="outline" size="sm" onClick={() => updateQty(pid, -1)} data-testid="btn-qty-minus-demo">
                    <Minus />
                  </Button>
                  <div className="flex items-center justify-center font-bold text-primary w-10 text-base">
                    {quantity}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => updateQty(pid, 1)} data-testid="btn-qty-plus-demo">
                    <Plus />
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  className="flex-1"
                  style={{ backgroundColor: "#e65100" }}
                  disabled={hasVariants && !selectedVariant}
                  onClick={() => {
                    if (hasVariants && !selectedVariant) {
                      toast({ title: "Lütfen seçenek belirleyin", variant: "destructive" });
                      return;
                    }
                    if (quantity === 0) updateQty(pid, 1, false, selectedVariant ?? undefined);
                  }}
                  data-testid="btn-add-cart-demo"
                >
                  SEPETE EKLE
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex-1"
                  disabled={hasVariants && !selectedVariant}
                  onClick={() => {
                    if (hasVariants && !selectedVariant) {
                      toast({ title: "Lütfen seçenek belirleyin", variant: "destructive" });
                      return;
                    }
                    if (quantity === 0) updateQty(pid, 1, false, selectedVariant ?? undefined);
                    setLocation("/odeme");
                  }}
                  data-testid="btn-buy-now-demo"
                >
                  HEMEN AL
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER */}
        {fbtProducts.length > 0 && (
          <Card className="mt-8" data-testid="section-fbt-demo">
            <CardContent className="p-4">
              <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Sıkça Birlikte Alınanlar
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 items-stretch">
                <FBTCard product={product} selected onToggle={() => {}} />
                {fbtProducts.map((p: Product) => (
                  <FBTCard
                    key={p.id}
                    product={p}
                    selected={!!fbtSelected[String(p.id)]}
                    onToggle={() => setFbtSelected((s) => ({ ...s, [String(p.id)]: !s[String(p.id)] }))}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3 flex-wrap gap-2">
                <span className="text-sm">
                  Toplam: <strong className="text-base">{fbtTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>
                </span>
                <Button onClick={addBundleToCart} style={{ backgroundColor: "#6B3480" }} data-testid="btn-add-bundle-demo">
                  Seçilenleri Sepete Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ÜRÜN AÇIKLAMASI */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="text-base font-extrabold mb-2">Ürün Açıklaması</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {(product as any).description ||
                `${product.name}, JETGO Pet Shop'ta uygun fiyat ve hızlı teslimatla satışta. Samsun içi aynı gün teslimat ve kapıda ödeme imkanı sunulmaktadır.`}
            </p>
          </CardContent>
        </Card>

        {/* AKERDEON ALANLAR — SEO + Mobil */}
        <div className="mt-6 space-y-2" data-testid="section-accordions-demo">
          <AccordionItem title="Ne işe yarar?" defaultOpen testId="accordion-ne-ise-yarar">
            <p>
              <strong>{product.name}</strong>, evcil hayvanınızın günlük ihtiyaçlarını karşılamak için özel olarak formüle edilmiştir.
              {category?.animal === "kedi" && " Kedilerde tüy parlaklığı, deri sağlığı ve sindirim sistemine destek olmaya yardımcı olur."}
              {category?.animal === "kopek" && " Köpeklerde enerji, eklem desteği ve genel sağlık için faydalıdır."}
            </p>
            <ul className="mt-2 space-y-1">
              <li>✅ Günlük bakım rutininize uygun</li>
              <li>✅ Sindirim sistemini destekler</li>
              <li>✅ Tüy ve deri sağlığına katkı sağlar</li>
              <li>✅ {category?.animal === "kedi" ? "Kedi" : category?.animal === "kopek" ? "Köpek" : "Evcil hayvan"} kullanımına uygundur</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Kullanım şekli" testId="accordion-kullanim">
            <p>Üreticinin önerdiği günlük dozu aşmayınız. {category?.animal === "kedi" ? "Kedinin" : "Hayvanın"} kilosuna göre ambalaj üzerindeki tabloyu takip ediniz. Açtıktan sonra serin ve kuru yerde saklayınız.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Yemek saatinde veya mama üstüne ekleyerek kullanabilirsiniz.</li>
              <li>İlk kullanımda küçük dozdan başlayıp yavaş yavaş artırın.</li>
              <li>Bol su erişimi sağladığınızdan emin olun.</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="İçerik" testId="accordion-icerik">
            <p>Detaylı içerik bilgileri ürün ambalajının arka yüzünde yer almaktadır. Ürünün geldiği parti numarasına göre içerik küçük farklılıklar gösterebilir.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Kaliteli hammadde</li>
              <li>Yapay renklendirici ve koruyucu içermez</li>
              <li>Veteriner kontrolünden geçmiş formül</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Kimler kullanmalı?" testId="accordion-kimler">
            <p>
              {category?.animal === "kedi" && "Her yaştaki sağlıklı yetişkin kediler için uygundur. Yavru, hamile veya yaşlı kedilerde kullanmadan önce veterinerinize danışınız."}
              {category?.animal === "kopek" && "Yetişkin köpeklerde günlük kullanıma uygundur. Yavru, hamile ve hasta köpeklerde veteriner kontrolünde kullanılmalıdır."}
              {!category?.animal && "Evcil hayvanınızın yaşı, kilosu ve sağlık durumuna uygunsa kullanılabilir. Şüpheniz varsa veterinerinize danışınız."}
            </p>
          </AccordionItem>

          <AccordionItem title="Veteriner önerisi" testId="accordion-veteriner">
            <p>
              Bu ürün <strong>besin desteği / bakım ürünü</strong> niteliğindedir, hastalık tedavisi yerine geçmez. Kronik bir rahatsızlığı olan hayvanlarda veya başka bir tedavi gören evcil hayvanlarda kullanmadan önce mutlaka veterinerinizle görüşünüz.
            </p>
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              JETGO Pet Shop, ürün hakkındaki sorularınız için <strong>veteriner danışma hattı</strong> sunmaktadır. Sipariş notuna sorunuzu yazabilirsiniz.
            </p>
          </AccordionItem>

          <AccordionItem title="Sıkça Sorulan Sorular (SSS)" testId="accordion-faq">
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} data-testid={`faq-item-${i}`}>
                  <p className="font-semibold text-gray-900">{f.q}</p>
                  <p className="text-gray-600 mt-0.5">{f.a}</p>
                </div>
              ))}
            </div>
          </AccordionItem>

          <AccordionItem title="Kargo, İade ve Değişim" testId="accordion-shipping-returns">
            <p><strong>Kargo:</strong> Samsun içi siparişler aynı gün veya en geç 1 iş günü içinde teslim edilir. Şehir dışı kargo 2-3 iş günü içinde ulaşır.</p>
            <p className="mt-2"><strong>İade:</strong> Açılmamış ürünleri 14 gün içinde iade edebilirsiniz. Mama ve gıda ürünlerinde ambalajın açılmamış olması gerekmektedir.</p>
          </AccordionItem>

          <AccordionItem title="Ürün Detayları" testId="accordion-item-details">
            <ul className="space-y-1.5">
              <li><strong>Ürün adı:</strong> {product.name}</li>
              {category && <li><strong>Marka:</strong> {category.brandName}</li>}
              {product.barcode && <li><strong>Barkod:</strong> {product.barcode}</li>}
              {product.skt && <li><strong>S.K.T:</strong> {product.skt}</li>}
              <li><strong>Stok durumu:</strong> {product.stock && product.stock > 0 ? "Stokta" : "Tükendi"}</li>
              {hasVariants && (
                <li><strong>Seçenekler:</strong> {productVariants.map((v) => v.label).join(", ")}</li>
              )}
            </ul>
          </AccordionItem>

          <AccordionItem title="İlgili Aramalar" testId="accordion-related">
            <div className="flex flex-wrap gap-2">
              {relatedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200"
                  data-testid={`related-keyword-${i}`}
                >
                  {kw}
                </span>
              ))}
            </div>
          </AccordionItem>

          {reviews.length > 0 && (
            <AccordionItem title={`Müşteri Yorumları (${reviews.length})`} testId="accordion-reviews">
              <div className="space-y-3">
                {reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="border-b pb-2 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.reviewerName}</span>
                      <span className="text-[11px] text-muted-foreground">{r.reviewDate}</span>
                    </div>
                    <StarRow value={r.rating} size="w-3 h-3" />
                    <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}
        </div>
      </main>

      {/* Para Puan dialog */}
      <Dialog open={paraPuanOpen} onOpenChange={setParaPuanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" style={{ color: "#e65100" }} />
              Para Puan Nedir?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Para Puan</strong>, her alışverişte kazandığınız sadakat puanıdır.</p>
            <div className="rounded-lg p-3" style={{ backgroundColor: "#fef3e2", border: "1px solid #ffe0b2" }}>
              <p className="font-semibold" style={{ color: "#e65100" }}>Nasıl Kazanılır?</p>
              <p className="mt-1">Her siparişinizde toplam tutarın <strong>%5'i</strong> kadar Para Puan kazanırsınız.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
