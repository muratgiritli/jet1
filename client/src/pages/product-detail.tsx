import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useRoute, useSearch, useLocation } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell, ChevronDown, CreditCard, X, Gift, Tag, AlertTriangle, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory, CrossSellSection, BreedStat } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import FastDeliveryBanner, { shouldShowFastDelivery } from "@/components/FastDeliveryBanner";
import { CATEGORIES, productUrl } from "@/lib/data";
import FavoriteButton from "@/components/FavoriteButton";
import ImageZoom from "@/components/ImageZoom";
import ProductImage from "@/components/ProductImage";
import { ProductDetailSkeleton } from "@/components/ProductSkeleton";
import { addRecentlyViewed, useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import SEO, { SITE_DOMAIN, PRODUCT_JSONLD, BREADCRUMB_JSONLD, LOCAL_BUSINESS_JSONLD } from "@/components/SEO";
import ProductReviews from "@/components/ProductReviews";
import { SiWhatsapp, SiFacebook, SiX } from "react-icons/si";

type ProductDetailData = {
  product: Product;
  category: BrandCategory | null;
  crossSellSections: (CrossSellSection & { products: Product[] })[];
  breedStats?: BreedStat[];
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
    <div className="flex flex-col items-start gap-1">
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
        <span className="text-xs text-red-600 font-medium" data-testid="text-stock-limit-warning">Stok kalmadı!</span>
      )}
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
  const isActive = quantity > 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className={`overflow-visible transition-all duration-200 ${isActive ? "ring-2 ring-primary shadow-md" : ""}`} data-testid={`card-cross-sell-${pid}`}>
      <CardContent className="p-2 flex flex-col items-center gap-1.5">
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative">
            <ProductImage
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
          <div className="flex items-center gap-0" data-testid={`qty-control-cross-${pid}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onUpdate(pid, -1)}
              data-testid={`btn-minus-cross-${pid}`}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <div
              className="flex items-center justify-center font-bold text-primary w-7 text-sm"
              data-testid={`text-qty-cross-${pid}`}
            >
              {quantity}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onUpdate(pid, 1)}
              data-testid={`btn-plus-cross-${pid}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/urun/:id/:slug?");
  const productId = params?.id || "";
  const isNumericId = /^\d+$/.test(productId);
  const searchStr = useSearch();
  const isCampaignMode = new URLSearchParams(searchStr).get("kampanya") === "1";

  const { basket, updateQty, grandTotal, itemCount, updateStock } = useCart();
  const [, setLocation] = useLocation();

  const staticProduct = useMemo(() => {
    if (isNumericId) return null;
    for (const cat of CATEGORIES) {
      const found = cat.items.find((item) => item.id === productId);
      if (found) return found;
    }
    return null;
  }, [productId, isNumericId]);

  const { data, isLoading } = useQuery<ProductDetailData>({
    queryKey: ["/api/product-detail", productId],
    enabled: !!productId && isNumericId,
  });

  const staticData = useMemo(() => {
    if (!staticProduct) return null;
    return {
      product: {
        id: staticProduct.id as any,
        name: staticProduct.name,
        price: staticProduct.price,
        originalPrice: staticProduct.originalPrice || null,
        img: staticProduct.img || null,
        skt: staticProduct.skt || null,
        barcode: null,
        stock: 100,
        isActive: true,
        brandCategoryId: 0,
      },
      category: null,
      crossSellSections: [],
    } as ProductDetailData;
  }, [staticProduct]);

  const { data: campaignCheck } = useQuery<{ isCampaign: boolean; campaignPrice?: number | null }>({
    queryKey: ["/api/campaign-check", productId],
    enabled: !!productId && isNumericId && isCampaignMode,
  });

  const isKediMama = data?.category?.animal === "kedi" && (data?.category?.subcategory === "kedi-mamasi" || data?.category?.subcategory === "acik-mama");
  const isKediKumu = data?.category?.animal === "kedi" && data?.category?.subcategory === "kedi-kumu";
  const needsCrossSell = isKediMama || isKediKumu;

  const { data: kumData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "kedi-kumu", "kedi-kumu"],
    enabled: isKediMama,
  });

  const { data: odulData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "odul", "odul"],
    enabled: needsCrossSell,
  });

  const { data: yasMamaData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "yas-mama", "yas-mama"],
    enabled: needsCrossSell,
  });

  const { data: bakimData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "bakim-saglik", "bakim-saglik"],
    enabled: needsCrossSell,
  });

  const alsoBoughtCategories = useMemo(() => {
    if (!needsCrossSell) return [];
    const cats: { title: string; products: Product[] }[] = [];
    if (isKediMama && kumData?.products?.length) cats.push({ title: "KUM", products: kumData.products });
    if (odulData?.products?.length) cats.push({ title: "ÖDÜL", products: odulData.products });
    if (yasMamaData?.products?.length) cats.push({ title: "YAŞ MAMA", products: yasMamaData.products });
    if (bakimData?.products?.length) cats.push({ title: "BAKIM VE SAĞLIK", products: bakimData.products });
    return cats;
  }, [needsCrossSell, isKediMama, kumData, odulData, yasMamaData, bakimData]);

  const resolvedData = isNumericId ? data : staticData;

  useEffect(() => {
    if (resolvedData?.product) {
      const p = resolvedData.product;
      updateStock(String(p.id), p.stock ?? 0);
    }
  }, [resolvedData, updateStock]);

  interface CampaignItem {
    id: number;
    product_id: number;
    item_type: string;
    parent_product_id: number | null;
    name: string;
    price: number;
    original_price: number | null;
    img: string | null;
    stock: number;
  }

  const { data: campaignItems = [] } = useQuery<CampaignItem[]>({
    queryKey: ["/api/campaign-items"],
    enabled: isCampaignMode,
  });

  const campaignExtras = useMemo(() => {
    const product = resolvedData?.product;
    if (!isCampaignMode || !product) return [];
    const specificExtras = campaignItems.filter((i) => i.item_type === "extra" && i.parent_product_id === product.id);
    const extras = specificExtras.length > 0
      ? specificExtras
      : campaignItems.filter((i) => i.item_type === "extra" && !i.parent_product_id);
    return extras
      .map((i) => ({
        id: i.product_id,
        name: i.name,
        price: i.price,
        originalPrice: i.original_price,
        img: i.img,
        stock: i.stock,
        isActive: true,
        brandCategoryId: 0,
        skt: null,
        barcode: null,
        originalImg: null,
      } as Product));
  }, [isCampaignMode, campaignItems, resolvedData]);

  useEffect(() => {
    for (const extra of campaignExtras) {
      updateStock(String(extra.id), extra.stock ?? 0);
    }
  }, [campaignExtras, updateStock]);

  const [stockName, setStockName] = useState("");
  const [stockPhone, setStockPhone] = useState("");
  const [stockAlertSent, setStockAlertSent] = useState(false);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [paraPuanInfoOpen, setParaPuanInfoOpen] = useState(false);
  const [campaignWarning, setCampaignWarning] = useState(false);

  const hasExtraInCart = useMemo(() => {
    if (!isCampaignMode) return false;
    const extraIds = campaignExtras.map((e) => String(e.id));
    return extraIds.some((eid) => (basket[eid] || 0) > 0);
  }, [isCampaignMode, campaignExtras, basket]);

  const { toast } = useToast();

  const seoData = useMemo(() => {
    if (!resolvedData) return null;
    const p = resolvedData.product;
    const catName = resolvedData.category?.brandName || "";
    const title = `${p.name} Samsun Fiyatı ${Math.round(p.price)} TL | ${catName ? catName + " - " : ""}JETGO Pet Shop`;
    const description = `${p.name} Samsun'da en uygun fiyatla ${Math.round(p.price)} TL${p.originalPrice ? ` (liste fiyatı ${Math.round(p.originalPrice)} TL)` : ""}. Samsun içi aynı gün teslimat, kapıda ödeme. Online sipariş JETGO Pet Shop.`;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const canonical = `${SITE_DOMAIN}/urun/${p.id}/${slug}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "image": p.img || undefined,
      "description": description,
      "sku": String(p.id),
      "brand": { "@type": "Brand", "name": catName || "JETGO" },
      "offers": {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "TRY",
        "price": p.price,
        "availability": p.stock && p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": { "@type": "Organization", "name": "JETGO Pet Shop Samsun" },
        "areaServed": { "@type": "City", "name": "Samsun" },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "TR",
            "addressRegion": "Samsun",
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
            "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
          },
        },
      },
    };
    const breadcrumbLd = BREADCRUMB_JSONLD([
      { name: "Ana Sayfa", url: SITE_DOMAIN },
      ...(catName ? [{ name: catName, url: `${SITE_DOMAIN}/kategori` }] : []),
      { name: p.name, url: canonical },
    ]);
    return { title, description, canonical, ogImage: p.img || undefined, jsonLd: [jsonLd, breadcrumbLd, LOCAL_BUSINESS_JSONLD] };
  }, [resolvedData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    if (resolvedData?.product) {
      const p = resolvedData.product;
      addRecentlyViewed({ id: p.id, name: p.name, price: p.price, img: p.img });
    }
  }, [resolvedData]);

  const recentlyViewed = useRecentlyViewed(resolvedData?.product?.id);

  if (isLoading && isNumericId) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!resolvedData) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Urun bulunamadi</p>
        </div>
      </div>
    );
  }

  const { product, category, crossSellSections, breedStats } = resolvedData;
  const pid = String(product.id);
  const campaignFiyat = isCampaignMode && campaignCheck?.campaignPrice ? campaignCheck.campaignPrice : null;
  const displayPrice = campaignFiyat ?? product.price;
  const displayOriginalPrice = campaignFiyat ? product.price : product.originalPrice;
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;
  const quantity = basket[pid] || 0;

  const handleStockAlert = async () => {
    if (!stockName || !stockPhone || stockPhone.length < 7 || stockAlertLoading) return;
    setStockAlertLoading(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, customerName: stockName, phone: stockPhone, productName: product.name }),
      });
      if (!res.ok) throw new Error("Failed");
      setStockAlertSent(true);
      toast({ title: "Kaydedildi", description: "Ürün stoğa girdiğinde size haber vereceğiz." });
    } catch {
      toast({ title: "Hata", description: "Lütfen tekrar deneyin.", variant: "destructive" });
    } finally {
      setStockAlertLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      {seoData && (
        <SEO
          title={seoData.title}
          description={seoData.description}
          canonical={seoData.canonical}
          ogImage={seoData.ogImage}
          jsonLd={seoData.jsonLd}
        />
      )}
      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6 pb-28 md:pb-8">
        <div>
          <div className="flex flex-col md:flex-row gap-6">
              <ImageZoom src={product.img || ""} alt={`${product.name} - Samsun JETGO Pet Shop`} className="md:w-1/2 w-full">
                <div className="aspect-square flex items-center justify-center rounded-lg overflow-hidden bg-muted/30 relative" data-testid="img-product-detail">
                  <ProductImage
                    src={product.img}
                    alt={`${product.name} - Samsun kapıya teslim`}
                    className="w-full h-full object-contain"
                    data-testid="img-product"
                  />
                  {discount > 0 && (
                    <Badge
                      className="absolute top-2 right-2 no-default-hover-elevate no-default-active-elevate"
                      style={{ backgroundColor: "#e53935", color: "#fff" }}
                      data-testid="badge-discount"
                    >
                      %{discount}
                    </Badge>
                  )}
                  <FavoriteButton
                    product={{ id: String(product.id), name: product.name, price: product.price, img: product.img }}
                    size="md"
                    className="absolute bottom-2 right-2 shadow-md"
                  />
                </div>
              </ImageZoom>

            <div className="md:w-1/2 w-full flex flex-col gap-3">
              <h1 className="text-xl font-bold leading-tight" data-testid="text-product-name">
                {product.name}
              </h1>

              {category && (
                <p className="text-sm text-muted-foreground" data-testid="text-brand-name">
                  {category.brandName}
                </p>
              )}


              {!isCampaignMode && category && shouldShowFastDelivery(category.animal, category.subcategory) && (
                <FastDeliveryBanner />
              )}

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {campaignFiyat && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#6B3480", color: "#fff" }}>KAMPANYA FİYATI</span>
                )}
                <span className="text-2xl font-extrabold text-black dark:text-white" data-testid="text-pesin-price">
                  {displayPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </span>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {displayOriginalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </span>
                )}
                {product.skt && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" data-testid="text-skt-detail">
                    S.K.T: {product.skt}
                  </span>
                )}
                {product.barcode && (
                  <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200" data-testid="text-barcode-detail">
                    Barkod: {product.barcode}
                  </span>
                )}
              </div>

              {!isCampaignMode && (
                <div data-testid="text-loyalty-points-earn">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: "#fef3e2", border: "1px solid #ffe0b2" }}
                  >
                    <Gift className="w-4 h-4 shrink-0" style={{ color: "#e65100" }} />
                    <span style={{ color: "#bf360c" }}>
                      Bu ürünü satın aldığınızda{" "}
                      <strong>{(product.price * 0.05).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>{" "}
                      değerinde Para Puan kazanacaksınız.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParaPuanInfoOpen(true)}
                    className="mt-1.5 ml-1 text-xs font-semibold animate-pulse hover:animate-none transition-all"
                    style={{ color: "#e65100" }}
                    data-testid="btn-para-puan-info"
                  >
                    Para Puan nedir?
                  </button>
                </div>
              )}

              {isCampaignMode && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: "#fff3e0", border: "1px solid #ffcc80" }}
                  data-testid="text-campaign-badge"
                >
                  <Tag className="w-4 h-4 shrink-0" style={{ color: "#e65100" }} />
                  <span className="font-semibold" style={{ color: "#bf360c" }}>
                    Kampanya Ürünü — Sadece 1 adet alabilirsiniz.
                  </span>
                </div>
              )}

              <Dialog open={paraPuanInfoOpen} onOpenChange={setParaPuanInfoOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" style={{ color: "#e65100" }} />
                      Para Puan Nedir?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>Para Puan</strong>, JETGO Pet Shop'ta yaptığınız her alışverişte kazandığınız sadakat puanıdır.
                    </p>
                    <div className="rounded-lg p-3" style={{ backgroundColor: "#fef3e2", border: "1px solid #ffe0b2" }}>
                      <p className="font-semibold" style={{ color: "#e65100" }}>Nasıl Kazanılır?</p>
                      <p className="mt-1">Her siparişinizde toplam tutarın <strong>%5'i</strong> kadar Para Puan kazanırsınız. Örneğin 1.000 TL'lik alışverişte <strong>50 TL</strong> Para Puan!</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ backgroundColor: "#e8f5e9", border: "1px solid #c8e6c9" }}>
                      <p className="font-semibold" style={{ color: "#2e7d32" }}>Nasıl Kullanılır?</p>
                      <p className="mt-1">Biriken puanlarınız bir sonraki siparişinizde otomatik olarak indirim olarak uygulanır. Sepetinizde Para Puan bakiyeniz görünür.</p>
                    </div>
                    <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
                      <p className="font-semibold text-gray-800">Önemli Bilgiler</p>
                      <ul className="mt-1 space-y-1 list-disc list-inside text-gray-600">
                        <li>Para Puan kazanmak için üye girişi yapmanız gerekir.</li>
                        <li>Puanlarınız hesabınızda birikir ve istediğiniz zaman kullanabilirsiniz.</li>
                        <li>Kampanyalı ürünlerde Para Puan geçerli değildir.</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {product.stock === 0 ? (
                <div className="mt-2 space-y-2">
                  {stockAlertSent ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }} data-testid="text-stock-alert-success">
                      <Bell className="w-4 h-4" />
                      Kaydedildi! Ürün stoğa girince size haber vereceğiz.
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      style={{ backgroundColor: "#e65100" }}
                      onClick={() => setStockDialogOpen(true)}
                      data-testid="btn-open-stock-dialog"
                    >
                      <Bell className="w-4 h-4" />
                      Gelince Haber Ver
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground font-medium">ADET</span>
                    <QuantityControl productId={pid} quantity={quantity} onUpdate={isCampaignMode ? (id, delta) => updateQty(id, delta, true) : updateQty} />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      className={isCampaignMode ? "w-full" : "flex-1"}
                      style={{ backgroundColor: "#e65100" }}
                      onClick={() => {
                        if (quantity === 0) updateQty(pid, 1, isCampaignMode);
                        if (isCampaignMode && !hasExtraInCart) {
                          setCampaignWarning(true);
                          setTimeout(() => {
                            const el = document.getElementById("campaign-extras-section");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 200);
                        }
                      }}
                      data-testid="btn-add-to-cart"
                    >
                      SEPETE EKLE
                    </Button>
                    {isCampaignMode && hasExtraInCart && quantity > 0 && (
                      <Button
                          className="w-full"
                          style={{ backgroundColor: "#2e7d32" }}
                          data-testid="btn-campaign-go-cart"
                          onClick={() => setLocation("/odeme")}
                        >
                          SEPETE GİT
                        </Button>
                    )}
                    {!isCampaignMode && (
                      <Button
                          variant="outline"
                          className="w-full flex-1"
                          onClick={() => { if (quantity === 0) updateQty(pid, 1); setLocation("/odeme"); }}
                          data-testid="btn-buy-now"
                        >
                          HEMEN AL
                        </Button>
                    )}
                  </div>
                </div>
              )}

              {isCampaignMode && campaignWarning && !hasExtraInCart && (
                <div
                  className="mt-3 px-4 py-3 rounded-lg text-center text-sm font-bold animate-pulse"
                  style={{ backgroundColor: "#ffebee", border: "2px solid #ef5350", color: "#c62828" }}
                  data-testid="text-campaign-warning"
                >
                  ⚠️ Kampanyadan yararlanmak için aşağıdan bir ürün eklemeniz gerekmektedir!
                </div>
              )}

            </div>
          </div>
        </div>


        {!isCampaignMode && breedStats && breedStats.length > 0 && (
          <div
            className="mt-8"
            data-testid="section-breed-stats"
          >
            <Card>
              <CardContent className="p-5">
                <h3 className="text-base font-bold text-center mb-1" data-testid="text-breed-stats-title">
                  Bu ürünü hangi ırk (cins) {category?.animal === "kopek" ? "köpekler" : "kediler"} tüketiyor?
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-4" data-testid="text-breed-stats-subtitle">
                  {product.name}
                </p>
                <div className="space-y-3">
                  {breedStats.map((stat, i) => (
                    <div key={stat.id} className="flex items-center gap-3" data-testid={`row-breed-stat-${stat.id}`}>
                      <span className="text-sm font-medium w-28 text-right shrink-0" data-testid={`text-breed-name-${stat.id}`}>
                        {stat.breedName}
                      </span>
                      <div className="flex-1 h-5 bg-muted/40 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          transition={{ duration: 0.6, delay: 0.1 * i, ease: "easeOut" }}
                          data-testid={`bar-breed-stat-${stat.id}`}
                        />
                      </div>
                      <span className="text-sm font-bold w-10 text-right shrink-0" data-testid={`text-breed-pct-${stat.id}`}>
                        {stat.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {isCampaignMode && campaignExtras.length > 0 && (
          <div className="mt-8" id="campaign-extras-section" data-testid="section-campaign-extras">
            <h3 className="text-base font-extrabold text-gray-800 mb-1 flex items-center gap-1.5">
              <Gift className="w-5 h-5" style={{ color: "#2e7d32" }} />
              SIKLIKLA ALINAN ÜRÜNLER
            </h3>
            <div className="flex items-start gap-1.5 mb-3 p-2.5 rounded-lg" style={{ backgroundColor: "#fff3e0", border: "1px solid #ffe0b2" }} data-testid="campaign-extra-warning">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#e65100" }} />
              <p className="text-[11px] font-semibold" style={{ color: "#e65100" }}>
                Kampanyadan yararlanmak için aşağıdan en az 1 ürün satın almanız gerekmektedir.
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {campaignExtras.map((p) => (
                <div key={p.id}>
                  <CrossSellProductCard
                    product={p}
                    quantity={basket[String(p.id)] || 0}
                    onUpdate={(id, delta) => updateQty(id, delta, true)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isCampaignMode && needsCrossSell && alsoBoughtCategories.length > 0 && (
          <div className="mt-8" data-testid="section-also-bought">
            <h3 className="text-lg font-extrabold mb-4" data-testid="text-also-bought-title">
              Bu ürünü alanlar bunları da aldı
            </h3>
            <div className="space-y-6">
              {alsoBoughtCategories.map((cat) => (
                <div key={cat.title} data-testid={`section-also-bought-${cat.title}`}>
                  <h4 className="text-sm font-bold text-white px-3 py-1.5 rounded-t-lg" style={{ backgroundColor: "#6B3480" }} data-testid={`text-cat-title-${cat.title}`}>
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {cat.products.map((p) => (
                      <div key={p.id}>
                        <CrossSellProductCard
                          product={p}
                          quantity={basket[String(p.id)] || 0}
                          onUpdate={updateQty}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isCampaignMode && crossSellSections.length > 0 && (
          <div className="mt-8" data-testid="section-cross-sell-all">
            <h3 className="text-lg font-extrabold mb-4" data-testid="text-cross-sell-title">
              Bu ürünü alanlar bunları da aldı
            </h3>
            <div className="space-y-6">
              {crossSellSections.map((section) => (
                <div key={section.id} data-testid={`section-cross-sell-${section.id}`}>
                  <h4 className="text-sm font-bold text-white px-3 py-1.5 rounded-t-lg" style={{ backgroundColor: "#6B3480" }} data-testid={`text-section-title-${section.id}`}>
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {section.products.map((p) => (
                      <div key={p.id}>
                        <CrossSellProductCard
                          product={p}
                          quantity={basket[String(p.id)] || 0}
                          onUpdate={updateQty}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        <ProductReviews productId={product.id} />

        {recentlyViewed.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-3" data-testid="text-recently-viewed-title">
              Son Görüntülenenler
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.slice(0, 6).map((rp) => (
                <Link key={rp.id} href={productUrl(rp.id, rp.name)}>
                  <div className="flex-shrink-0 w-24 cursor-pointer" data-testid={`recent-product-${rp.id}`}>
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted/30">
                        <ProductImage src={rp.img} alt={rp.name} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    <p className="text-[10px] font-medium text-center mt-1 line-clamp-2 leading-tight">{rp.name}</p>
                    <p className="text-[10px] font-bold text-primary text-center">{rp.price} TL</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Bell className="w-5 h-5" style={{ color: "#e65100" }} />
              Gelince Haber Ver
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-semibold">{product.name}</span> stoğa girdiğinde sizi haberdar edelim.
          </p>
          <div className="space-y-3">
            <Input
              placeholder="Ad Soyad"
              value={stockName}
              onChange={e => setStockName(e.target.value)}
              data-testid="input-stock-name"
            />
            <Input
              placeholder="Telefon numaranız"
              value={stockPhone}
              onChange={e => setStockPhone(e.target.value)}
              data-testid="input-stock-phone"
            />
            <Button
              onClick={async () => {
                await handleStockAlert();
                if (stockName && stockPhone.length >= 7) {
                  setStockDialogOpen(false);
                }
              }}
              disabled={stockAlertLoading || !stockName || stockPhone.length < 7}
              className="w-full"
              style={{ backgroundColor: "#e65100" }}
              data-testid="btn-stock-alert"
            >
              {stockAlertLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Gönder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}