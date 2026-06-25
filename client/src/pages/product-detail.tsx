import { useMemo, useEffect, useState } from "react";
import { brandify, useStore } from "@/lib/store";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useRoute, useSearch, useLocation } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell, ChevronDown, CreditCard, X, Gift, Tag, AlertTriangle, Share2, Clock, HelpCircle, MessageSquare, Stethoscope, FileText, Users, Package, Banknote, Truck, ShieldCheck, Calendar, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import type { Product, BrandCategory, CrossSellSection, BreedStat } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import FastDeliveryBanner, { shouldShowFastDelivery } from "@/components/FastDeliveryBanner";
import { CATEGORIES, productUrl, cardPrice } from "@/lib/data";
import { useSurchargeRate, surchargeLabel } from "@/hooks/useSurchargeRate";
import FavoriteButton from "@/components/FavoriteButton";
import ImageZoom from "@/components/ImageZoom";
import ProductImage from "@/components/ProductImage";
import { ProductDetailSkeleton } from "@/components/ProductSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { addRecentlyViewed, useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import SEO, { SITE_DOMAIN, PRODUCT_JSONLD, BREADCRUMB_JSONLD, LOCAL_BUSINESS_JSONLD } from "@/components/SEO";
import ProductReviews from "@/components/ProductReviews";
import ProductPopup from "@/components/ProductPopup";
import { StarRating } from "@/components/ModernProductRow";
import { cleanName, deriveSubtitle, sizeBadgeLabel, pricePerKgLabel, formatSkt, representativeReviewCount } from "@/lib/product-display";
import { SiWhatsapp, SiFacebook, SiX } from "react-icons/si";

type ProductDetailData = {
  product: Product;
  category: BrandCategory | null;
  crossSellSections: (CrossSellSection & { products: Product[] })[];
  breedStats?: BreedStat[];
};

function LongDescriptionAccordions({ html, singleSection = false }: { html: string; singleSection?: boolean }) {
  const { sections, fullHtml } = useMemo(() => {
    let clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["h2","h3","h4","p","ul","ol","li","strong","em","u","s","a","blockquote","br","span","div"],
      ALLOWED_ATTR: ["href","target","rel","style","class"],
      ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:|\/)/i,
    });

    const KNOWN_HEADINGS = [
      "Genel Bilgiler","Ürün Açıklaması","Ürün Hakkında","Ürün Özellikleri","Özellikler",
      "İçerik","İçindekiler","Bileşenler","Analiz Raporu","Analiz","Besin Katkı Maddeleri",
      "Besin Değerleri","Katkı Maddeleri","Besleme Rehberi","Beslenme Rehberi","Beslenme Önerisi",
      "Kullanım","Kullanım Şekli","Kullanım Talimatı","Uyarılar","Saklama Koşulları",
      "Faydaları","Yararları","Açıklama","Marka","Kategori","Menşei","Barkod","Ağırlık",
      "Kilo Yönetimi","Üriner Sistem Sağlığı","Yüksek Protein İçeriği","L-Karnitin ile Zenginleştirilmiş",
    ];
    const headingRegex = new RegExp(
      "^(?:\\s|&nbsp;|:|–|-)*(" +
        KNOWN_HEADINGS.map((h) => h.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|") +
      ")(?:\\s|&nbsp;|:|–|-)*$",
      "i"
    );

    const decodeEntities = (s: string) =>
      s
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");

    // Convert <p>(<strong>)?HEADING(</strong>)?</p> → <h3>HEADING</h3>
    clean = clean.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (full, inner) => {
      const stripped = decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
      if (!stripped) return full;
      // Known heading text
      const m = stripped.match(headingRegex);
      if (m) return `<h3>${m[1]}</h3>`;
      // Whole-paragraph bold + short → treat as heading
      const onlyBold = inner.trim().match(/^<(strong|b)[^>]*>([\s\S]*?)<\/\1>$/i);
      if (onlyBold) {
        const text = decodeEntities(onlyBold[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
        const wordCount = text.split(/\s+/).length;
        if (text && wordCount <= 6 && text.length <= 60 && !/[.!?]$/.test(text)) {
          return `<h3>${text}</h3>`;
        }
      }
      return full;
    });

    const parts = clean.split(/(<h3[^>]*>[\s\S]*?<\/h3>)/i).filter((p) => p && p.trim());
    const result: { title: string; body: string }[] = [];
    let pending: string | null = null;
    for (const part of parts) {
      const m = part.match(/^<h3[^>]*>([\s\S]*?)<\/h3>$/i);
      if (m) {
        if (pending !== null) result.push({ title: pending, body: "" });
        pending = decodeEntities(m[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
      } else {
        if (pending !== null) {
          result.push({ title: pending, body: part });
          pending = null;
        } else {
          result.push({ title: "Ürün Açıklaması", body: part });
        }
      }
    }
    if (pending !== null) result.push({ title: pending, body: "" });
    return { sections: result, fullHtml: clean };
  }, [html]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (sections.length === 0) return null;

  if (singleSection) {
    return (
      <section className="mt-2" data-testid="section-long-description">
        <div
          className="prose-product text-sm md:text-base"
          data-testid="text-longdesc-single"
          dangerouslySetInnerHTML={{ __html: fullHtml }}
        />
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-2" data-testid="section-long-description">
      {sections.map((s, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border rounded-lg overflow-hidden bg-white" data-testid={`acc-longdesc-${i}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm md:text-base hover:bg-gray-50 transition-colors"
              data-testid={`btn-longdesc-toggle-${i}`}
              aria-expanded={isOpen}
            >
              <span>{s.title}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div
                className="prose-product text-sm md:text-base px-4 pb-4"
                data-testid={`text-longdesc-${i}`}
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
            )}
          </div>
        );
      })}
    </section>
  );
}

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
    <div className="flex flex-col items-center md:items-start gap-1">
      <div className="flex items-center gap-2" data-testid={`qty-control-${productId}`}>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 md:h-11 md:w-11"
          onClick={() => onUpdate(productId, -1)}
          data-testid={`btn-minus-${productId}`}
        >
          <Minus className="w-6 h-6 md:w-5 md:h-5" />
        </Button>
        <div
          className="flex items-center justify-center font-bold text-primary w-14 md:w-12 text-2xl md:text-xl"
          data-testid={`text-qty-${productId}`}
        >
          {quantity}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 md:h-11 md:w-11"
          onClick={() => {
            const blocked = onUpdate(productId, 1);
            if (blocked) {
              setShowStockWarn(true);
              setTimeout(() => setShowStockWarn(false), 3000);
            }
          }}
          data-testid={`btn-plus-${productId}`}
        >
          <Plus className="w-6 h-6 md:w-5 md:h-5" />
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
  product: Product & { subcategoryName?: string | null };
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
}) {
  const pid = String(product.id);
  const isActive = quantity > 0;
  const [showPopup, setShowPopup] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
    <Card className={`overflow-visible transition-all duration-200 ${isActive ? "ring-2 ring-primary shadow-md" : ""}`} data-testid={`card-cross-sell-${pid}`}>
      {product.subcategoryName && (
        <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wide truncate text-center" style={{ color: "#6B3480" }} data-testid={`text-cross-sell-cat-${pid}`}>
          {product.subcategoryName}
        </div>
      )}
      <CardContent className="p-2 pt-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative cursor-pointer"
            onClick={() => setShowPopup(true)}
            data-testid={`img-cross-sell-${pid}`}
          >
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
        <p
          className="text-[11px] font-semibold text-center leading-tight line-clamp-2 min-h-[1.5rem] cursor-pointer"
          onClick={() => setShowPopup(true)}
        >
          {product.name}
        </p>
        <span className="text-xs font-bold text-foreground">
          {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
        </span>
        {product.stock === 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }}>
              <Clock className="w-2.5 h-2.5" />
              Sipariş Ver
            </div>
            <div className="flex items-center gap-0" data-testid={`qty-control-preorder-${pid}`}>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => onUpdate(pid, -1)}><Minus className="w-3 h-3" /></Button>
              <div className="flex items-center justify-center font-bold text-blue-700 w-7 text-sm">{quantity}</div>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => onUpdate(pid, 1)}><Plus className="w-3 h-3" /></Button>
            </div>
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
    {showPopup && (
      <ProductPopup
        product={product}
        quantity={quantity}
        onUpdate={onUpdate}
        onClose={() => setShowPopup(false)}
      />
    )}
    </>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/urun/:id/:slug?");
  const productId = params?.id || "";
  const isNumericId = /^\d+$/.test(productId);
  const searchStr = useSearch();
  const isCampaignMode = new URLSearchParams(searchStr).get("kampanya") === "1";

  const { basket, updateQty, grandTotal, itemCount, updateStock, setVariant, getVariant } = useCart();
  const { isLoggedIn } = useCustomer();
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
    } as unknown as ProductDetailData;
  }, [staticProduct]);

  const { data: campaignCheck } = useQuery<{ isCampaign: boolean; campaignPrice?: number | null }>({
    queryKey: ["/api/campaign-check", productId],
    enabled: !!productId && isNumericId && isCampaignMode,
  });

  const isKediMama = data?.category?.animal === "kedi" && (data?.category?.subcategory === "kedi-mamasi" || data?.category?.subcategory === "acik-mama");
  const isKediKumu = data?.category?.animal === "kedi" && data?.category?.subcategory === "kedi-kumu";
  const isMamaCategory = (() => {
    const a = data?.category?.animal;
    const s = (data?.category?.subcategory || "").toLowerCase();
    if (a !== "kedi" && a !== "kopek") return false;
    if (s === "acik-mama") return false;
    return s.includes("mama") || s.includes("konserve") || s.includes("cuval") || s.includes("yem");
  })();
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

  const { data: publicSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/public-settings"],
  });
  const crossSellEnabled = (publicSettings?.cross_sell_enabled ?? "true") !== "false";
  const cardRate = useSurchargeRate();

  const isVeteriner = data?.category?.animal === "veteriner";
  const vetSubcategory = data?.category?.subcategory || "";
  const { data: allProductsForVet } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isVeteriner,
  });
  const { data: allBrandCatsForVet } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
    enabled: isVeteriner,
  });
  const similarVetProducts = useMemo(() => {
    if (!isVeteriner || !allProductsForVet || !allBrandCatsForVet) return [];
    const sameSubIds = new Set(
      allBrandCatsForVet
        .filter((b) => b.animal === "veteriner" && b.subcategory === vetSubcategory)
        .map((b) => b.id),
    );
    const brandNameById = new Map(allBrandCatsForVet.map((b) => [b.id, b.brandName]));
    const currentBrand = data?.product?.brandCategoryId
      ? brandNameById.get(data.product.brandCategoryId)
      : null;
    return allProductsForVet
      .filter(
        (p) =>
          sameSubIds.has(p.brandCategoryId) &&
          p.id !== data?.product?.id &&
          p.isActive &&
          (!currentBrand || brandNameById.get(p.brandCategoryId) !== currentBrand),
      )
      .map((p) => ({ ...p, subcategoryName: brandNameById.get(p.brandCategoryId) || null }))
      .slice(0, 24);
  }, [isVeteriner, allProductsForVet, allBrandCatsForVet, vetSubcategory, data?.product?.id, data?.product?.brandCategoryId]);

  const resolvedData = isNumericId ? data : staticData;

  useEffect(() => {
    if (resolvedData?.product) {
      const p = resolvedData.product;
      updateStock(String(p.id), p.stock ?? 0);
    }
  }, [resolvedData, updateStock]);

  useEffect(() => {
    if (resolvedData?.product && typeof window !== "undefined" && (window as any).gtag) {
      const p = resolvedData.product;
      try {
        (window as any).gtag("event", "view_item", {
          currency: "TRY",
          value: p.price,
          items: [{
            item_id: String(p.id),
            item_name: p.name,
            price: p.price,
          }],
        });
      } catch {}
    }
  }, [resolvedData?.product?.id]);

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

  const campaignExtras: Product[] = [];

  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string | null>(null);
  const [variantInitialized, setVariantInitialized] = useState(false);
  const [stockName, setStockName] = useState("");
  const [stockPhone, setStockPhone] = useState("");
  const [stockAlertSent, setStockAlertSent] = useState(false);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [activeCrossSellTab, setActiveCrossSellTab] = useState<string>("");
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [campaignWarning, setCampaignWarning] = useState(false);

  const hasExtraInCart = useMemo(() => {
    if (!isCampaignMode) return false;
    const extraIds = campaignExtras.map((e) => String(e.id));
    return extraIds.some((eid) => (basket[eid] || 0) > 0);
  }, [isCampaignMode, campaignExtras, basket]);

  const { toast } = useToast();

  const seoData = useMemo(() => {
    if (!resolvedData) return null;
    const p = resolvedData.product as any;
    const catName = resolvedData.category?.brandName || "";
    const autoTitle = `${p.name} Samsun Fiyatı ${Math.round(p.price)} TL | ${catName ? catName + " - " : ""}JETGO Pet Shop`;
    const autoDescription = `${p.name} Samsun'da en uygun fiyatla ${Math.round(p.price)} TL${p.originalPrice ? ` (liste fiyatı ${Math.round(p.originalPrice)} TL)` : ""}. Samsun içi aynı gün teslimat, kapıda ödeme. Online sipariş JETGO Pet Shop.`;
    const title = (p.metaTitle && p.metaTitle.trim()) || autoTitle;
    const description = (p.metaDescription && p.metaDescription.trim()) || autoDescription;
    const keywords = (p.metaKeywords && p.metaKeywords.trim()) || undefined;
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
    return { title, description, keywords, canonical, ogImage: p.img || undefined, jsonLd: [jsonLd, breadcrumbLd, LOCAL_BUSINESS_JSONLD] };
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
  const productVariants = ((product as any).variants || []) as { label: string; price: number }[];
  const hasVariants = productVariants.length > 0;
  if (!variantInitialized) {
    const existingVariant = getVariant(pid);
    if (existingVariant && productVariants.some(v => v.label === existingVariant.label)) {
      setSelectedVariantLabel(existingVariant.label);
    }
    setVariantInitialized(true);
  }
  const selectedVariant = hasVariants
    ? productVariants.find(v => v.label === selectedVariantLabel) || null
    : null;
  const campaignFiyat = isCampaignMode && campaignCheck?.campaignPrice ? campaignCheck.campaignPrice : null;
  const displayPrice = campaignFiyat ?? selectedVariant?.price ?? product.price;
  const displayOriginalPrice = campaignFiyat ? product.price : product.originalPrice;
  const detailStore = useStore();
  const storePreorderEnabled = detailStore.commerce.preorderEnabled;
  const isPreorder = storePreorderEnabled && product.stock === 0 && product.preorderEnabled;
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;
  const useModernLayout = detailStore.id === "jetgo" && !!detailStore.commerce.modernCatalogUI && !isCampaignMode;
  const modernName = cleanName(product.name);
  const modernSubtitle = useModernLayout ? deriveSubtitle(product.name) : null;
  const modernSizeLabel = useModernLayout ? sizeBadgeLabel(product.name) : null;
  const modernPerKg = useModernLayout ? pricePerKgLabel(displayPrice, product.name) : null;
  const modernSkt = formatSkt(product.skt);
  const modernReviews = representativeReviewCount(product.id);
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
          keywords={seoData.keywords}
          canonical={seoData.canonical}
          ogImage={seoData.ogImage}
          jsonLd={seoData.jsonLd}
        />
      )}
      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6 pb-28 md:pb-8">
        {!isCampaignMode && <FreeShippingBanner className="mb-4" />}
        <div>
          <div className="flex flex-col md:flex-row gap-6">
              <ImageZoom src={product.img || ""} alt={`${product.name} - Samsun ${brandify("JETGO Pet Shop")}`} className="md:w-1/2 w-full">
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
                  {useModernLayout && modernSizeLabel && (
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-white bg-black/70 px-2 py-0.5 rounded" data-testid="badge-size-detail">
                      {modernSizeLabel}
                    </span>
                  )}
                </div>
              </ImageZoom>

            <div className="md:w-1/2 w-full flex flex-col gap-3">
              {useModernLayout ? (
                <>
                  {category && (
                    <Link
                      href={`/siparis/${category.animal}/${category.subcategory}/${category.brandSlug}`}
                      className="text-xs font-extrabold uppercase tracking-wider text-gray-500 hover:text-gray-700 w-fit"
                      data-testid="link-brand-category"
                    >
                      {category.brandName}
                    </Link>
                  )}
                  <h1 className="text-lg md:text-xl font-extrabold leading-snug text-gray-900" data-testid="text-product-name">
                    {modernName}
                  </h1>
                  {modernSubtitle && (
                    <p className="text-sm text-gray-500 -mt-1" data-testid="text-product-subtitle">
                      {modernSubtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap mt-0.5">
                    <StarRating count={modernReviews} size="md" />
                  </div>
                  <div className="flex items-end gap-2 flex-wrap mt-1">
                    <span className="text-3xl font-extrabold" style={{ color: "#e65100" }} data-testid="text-pesin-price">
                      {displayPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-base">TL</span>
                    </span>
                    {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                      <span className="text-base text-gray-400 line-through mb-1">
                        {displayOriginalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded mb-1.5" style={{ backgroundColor: "#e53935" }}>
                        %{discount}
                      </span>
                    )}
                  </div>
                  {modernPerKg && (
                    <p className="text-xs text-gray-500 -mt-1" data-testid="text-price-per-kg">{modernPerKg}</p>
                  )}
                  {!isPreorder && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium w-fit bg-gray-50 text-gray-600 border border-gray-200" data-testid="text-card-price">
                      Kart / Havale / QR: {cardPrice(displayPrice, cardRate).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                      <span className="text-[11px] font-medium text-gray-400">({surchargeLabel(cardRate)})</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {product.stock > 0 ? (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600" data-testid="text-stock-status">
                        <Check className="w-4 h-4" />
                        Stokta var ({product.stock} adet)
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-red-500" data-testid="text-stock-status">
                        <AlertTriangle className="w-4 h-4" />
                        Tükendi
                      </div>
                    )}
                    {modernSkt && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500" data-testid="text-skt-detail">
                        <Calendar className="w-4 h-4" />
                        Son Kullanma Tarihi: {modernSkt}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500" data-testid="text-original-guarantee">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Orijinal Ürün Garantisi
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-base md:text-lg font-bold leading-snug" data-testid="text-product-name">
                    {product.name}
                  </h1>

                  {category && (
                    <Link
                      href={`/siparis/${category.animal}/${category.subcategory}/${category.brandSlug}`}
                      className="text-sm text-primary hover:underline w-fit"
                      data-testid="link-brand-category"
                    >
                      {category.brandName}
                    </Link>
                  )}
                </>
              )}


              {hasVariants && (
                <div className="space-y-2" data-testid="section-variants">
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
                          data-testid={`btn-variant-${v.label.replace(/\s+/g, "-")}`}
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
                    <p className="text-xs text-amber-700" data-testid="text-variant-required">
                      Lütfen bir seçenek belirleyin.
                    </p>
                  )}
                </div>
              )}

              {!useModernLayout && (
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
              )}

              {!useModernLayout && !isPreorder && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium w-fit bg-gray-50 text-gray-600 border border-gray-200"
                  data-testid="text-card-price"
                >
                  Kart / Havale / QR: {cardPrice(displayPrice, cardRate).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  <span className="text-[11px] font-medium text-gray-400">({surchargeLabel(cardRate)})</span>
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

              {storePreorderEnabled && product.stock === 0 && (product.preorderEnabled || !isMamaCategory) ? (
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }}>
                    <Clock className="w-4 h-4" />
                    Ön Sipariş — Ortalama 3 iş günü içinde teslimat
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                      <span className="text-sm text-muted-foreground font-medium">ADET</span>
                      <QuantityControl productId={pid} quantity={quantity} onUpdate={(id, delta) => {
                        if (delta > 0 && hasVariants && !selectedVariant) {
                          toast({ title: "Lütfen önce seçenek belirleyin", variant: "destructive" });
                          return false;
                        }
                        return updateQty(id, delta, isCampaignMode, selectedVariant ?? undefined);
                      }} />
                    </div>
                    {(() => {
                      const qty = Math.max(quantity || 1, 1);
                      const total = displayPrice * qty;
                      return (
                        <div className="rounded-lg border-2 p-3 space-y-2" style={{ borderColor: "#1565c0", backgroundColor: "#e3f2fd" }} data-testid="preorder-deposit-box">
                          <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: "#0d47a1" }}>
                            <CreditCard className="w-4 h-4" />
                            Ödeme: Online Kredi Kartı
                          </div>
                          <p className="text-[11px] text-gray-700 leading-snug">
                            Ön sipariş ürünleri yalnızca <strong>online kredi kartı</strong> (vade farksız 3-6 taksit) ile ödenir.
                          </p>
                          <div className="border-t pt-2 mt-1" style={{ borderColor: "#90caf9" }}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">Ödenecek Tutar:</span>
                              <strong style={{ color: "#0d47a1" }} data-testid="text-preorder-total">{total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {quantity === 0 ? (
                      <Button
                        className="w-full"
                        style={{ backgroundColor: "#1565c0" }}
                        disabled={hasVariants && !selectedVariant}
                        onClick={() => {
                          if (hasVariants && !selectedVariant) {
                            toast({ title: "Lütfen seçenek belirleyin", variant: "destructive" });
                            return;
                          }
                          const blocked = updateQty(pid, 1, isCampaignMode, selectedVariant ?? undefined);
                          if (!blocked) setLocation(`/odeme?preorder=1`);
                        }}
                        data-testid="btn-preorder-add"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ön Sipariş Ver
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        style={{ backgroundColor: "#2e7d32" }}
                        onClick={() => setLocation(`/odeme?preorder=1`)}
                        data-testid="btn-preorder-go-cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ödemeye Geç ({quantity})
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg border p-3 space-y-2" style={{ backgroundColor: "#f5f9ff", borderColor: "#bbdefb" }} data-testid="preorder-info-section">
                    <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: "#1565c0" }}>
                      <HelpCircle className="w-4 h-4" />
                      Ön Sipariş Bilgilendirmesi
                    </h4>
                    <p className="text-xs leading-relaxed text-gray-700">
                      Bu ürün şu anda <strong>stokta bulunmamaktadır</strong>. Ön sipariş vererek ürün sizin için özel olarak tedarik edilir.
                    </p>
                    <p className="text-xs leading-relaxed text-gray-700">
                      ⏳ Ortalama tedarik süresi: <strong>3 iş günüdür</strong>.
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Sipariş süreci boyunca tarafınıza bilgilendirme yapılacaktır.
                    </p>
                  </div>
                </div>
              ) : product.stock === 0 ? (
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
              ) : null}

              {useModernLayout && product.stock > 0 && (
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground font-medium">ADET</span>
                    <QuantityControl
                      productId={pid}
                      quantity={quantity}
                      onUpdate={(id, delta) => {
                        if (delta > 0 && hasVariants && !selectedVariant) {
                          toast({ title: "Lütfen önce seçenek belirleyin", variant: "destructive" });
                          return false;
                        }
                        return updateQty(id, delta, isCampaignMode, selectedVariant ?? undefined);
                      }}
                    />
                  </div>
                  <Button
                    className="w-full h-12 font-bold text-base"
                    style={{ backgroundColor: "#e65100", color: "#fff" }}
                    onClick={() => {
                      if (hasVariants && !selectedVariant) {
                        toast({ title: "Lütfen önce bir seçenek belirleyin", variant: "destructive" });
                        return;
                      }
                      if (quantity === 0) {
                        const blocked = updateQty(pid, 1, isCampaignMode, selectedVariant ?? undefined);
                        if (blocked) {
                          toast({ title: "Stok kalmadı!", variant: "destructive" });
                          return;
                        }
                      }
                      if (isLoggedIn) {
                        setLocation("/odeme");
                      } else {
                        setConfirmDialogOpen(true);
                      }
                    }}
                    data-testid="button-order-now"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    HEMEN SİPARİŞ VER
                  </Button>
                  <FavoriteButton
                    product={{ id: pid, name: product.name, price: product.price, img: product.img }}
                    label="Favorilere Ekle"
                  />
                </div>
              )}

            </div>
          </div>
        </div>

        {useModernLayout && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6" data-testid="section-feature-badges">
            <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white">
              <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-800">1 Saatte Kapında</p>
                <p className="text-[11px] text-gray-500">Atakum içi hızlı teslimat</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-800">Orijinal Ürün</p>
                <p className="text-[11px] text-gray-500">Yetkili satıcı garantisi</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-800">Taze Ürün</p>
                <p className="text-[11px] text-gray-500">Son kullanma tarihli</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white">
              <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-800">Kapıda Ödeme</p>
                <p className="text-[11px] text-gray-500">Nakit, POS, QR, Havale</p>
              </div>
            </div>
          </div>
        )}

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

        {!isCampaignMode && (product as any).longDescription && (product as any).longDescription.trim() && (
          useModernLayout ? (
            <div className="mt-8" data-testid="section-modern-description">
              <div className="mb-3 border-b-2 border-orange-500 pb-2 inline-block" data-testid="header-modern-description">
                <h2 className="text-lg font-extrabold text-gray-900">Ürün Açıklaması</h2>
              </div>
              <LongDescriptionAccordions html={(product as any).longDescription} singleSection />
            </div>
          ) : (
            <LongDescriptionAccordions html={(product as any).longDescription} />
          )
        )}

        {!isCampaignMode && <ProductReviews productId={product.id} />}

        {!isCampaignMode && isVeteriner && similarVetProducts.length > 0 && (
          <div className="mt-8" data-testid="section-similar-vet">
            <h3 className="text-lg font-extrabold mb-4" data-testid="text-similar-vet-title">
              Benzer Veteriner Ürünleri
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" data-testid="grid-similar-vet">
              {similarVetProducts.map((p) => (
                <CrossSellProductCard
                  key={p.id}
                  product={p as any}
                  quantity={basket[String(p.id)] || 0}
                  onUpdate={updateQty}
                />
              ))}
            </div>
          </div>
        )}

        {(() => {
          if (isCampaignMode) return null;
          if (product.stock === 0 && product.preorderEnabled) return null;
          if (!crossSellEnabled) return null;
          const combined: { id: string; title: string; products: Product[] }[] = [];
          if (needsCrossSell) {
            alsoBoughtCategories.forEach((c, i) => {
              if (c.products.length > 0) combined.push({ id: `ab-${i}`, title: c.title, products: c.products });
            });
          }
          crossSellSections.forEach((s) => {
            if (s.products.length > 0) combined.push({ id: `cs-${s.id}`, title: s.title, products: s.products as any });
          });
          if (combined.length === 0) return null;
          const currentTab = combined.find((c) => c.id === activeCrossSellTab) ? activeCrossSellTab : combined[0].id;
          return (
            <div className="mt-8" data-testid="section-frequently-bought">
              <h3 className="text-lg font-extrabold mb-4" data-testid="text-frequently-bought-title">
                Sıklıkla Birlikte Alınan Ürünler
              </h3>
              <Tabs value={currentTab} onValueChange={setActiveCrossSellTab}>
                <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-muted/40 p-1">
                  {combined.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="text-xs font-bold data-[state=active]:text-white"
                      style={currentTab === cat.id ? { backgroundColor: "#6B3480" } : undefined}
                      data-testid={`tab-cross-sell-${cat.id}`}
                    >
                      {cat.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {combined.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-3">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" data-testid={`grid-cross-sell-${cat.id}`}>
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
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          );
        })()}


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

      {product.stock > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
          data-testid="bar-buy"
        >
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {useModernLayout && (
              <div className="flex items-center gap-2 min-w-0 max-w-[45%]">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted/30 shrink-0">
                  <ProductImage src={product.img} alt={modernName} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight" data-testid="text-buy-bar-name">{modernName}</span>
              </div>
            )}
            <div className="flex flex-col leading-tight">
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-xs text-gray-400 line-through" data-testid="text-buy-bar-original-price">
                  {displayOriginalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                </span>
              )}
              <span className="text-xl font-extrabold text-primary" data-testid="text-buy-bar-price">
                {displayPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
            </div>
            <div className="ml-auto">
              {quantity === 0 ? (
                <Button
                  size="lg"
                  className="font-bold px-8 h-12 text-base"
                  style={{ backgroundColor: "#e65100", color: "#fff" }}
                  onClick={() => {
                    if (hasVariants && !selectedVariant) {
                      toast({ title: "Lütfen önce bir seçenek belirleyin", variant: "destructive" });
                      return;
                    }
                    const blocked = updateQty(pid, 1, isCampaignMode, selectedVariant ?? undefined);
                    if (blocked) {
                      toast({ title: "Stok kalmadı!", variant: "destructive" });
                    }
                  }}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Sepete Ekle
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="font-bold px-8 h-12 text-base"
                  style={{ backgroundColor: "#e65100", color: "#fff" }}
                  onClick={() => {
                    if (isLoggedIn) {
                      setLocation("/odeme");
                    } else {
                      setConfirmDialogOpen(true);
                    }
                  }}
                  data-testid="button-confirm-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Sepeti Onayla
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-base">Hesabınız yok mu?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Üye olmadan devam edebilir ya da giriş yaparak avantajlardan yararlanabilirsiniz.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full h-12 font-bold"
              style={{ backgroundColor: "#e65100", color: "#fff" }}
              onClick={() => {
                setConfirmDialogOpen(false);
                setLocation("/giris");
              }}
              data-testid="button-go-login"
            >
              Giriş Yap
            </Button>
            <Button
              className="w-full h-12 font-bold"
              style={{ backgroundColor: "#2e7d32", color: "#fff" }}
              onClick={() => {
                setConfirmDialogOpen(false);
                setLocation("/giris?tab=register");
              }}
              data-testid="button-go-register"
            >
              Yeni Üye Ol
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 font-bold"
              onClick={() => {
                setConfirmDialogOpen(false);
                setLocation("/odeme");
              }}
              data-testid="button-guest-checkout"
            >
              Üye Olmadan Devam Et
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}