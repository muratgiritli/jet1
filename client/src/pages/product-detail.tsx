import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory, CrossSellSection, BreedStat } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import FloatingCartBar from "@/components/FloatingCartBar";
import BackNavigation from "@/components/BackNavigation";
import { CATEGORIES, productUrl } from "@/lib/data";

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
  const isActive = quantity > 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className={`overflow-visible transition-all duration-200 ${isActive ? "ring-2 ring-primary shadow-md" : ""}`} data-testid={`card-cross-sell-${pid}`}>
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

  const { basket, updateQty, grandTotal, itemCount } = useCart();

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
        stock: 100,
        isActive: true,
        brandCategoryId: 0,
      },
      category: null,
      crossSellSections: [],
    } as ProductDetailData;
  }, [staticProduct]);

  const isKediMama = data?.category?.animal === "kedi" && (data?.category?.subcategory === "kedi-mamasi" || data?.category?.subcategory === "acik-mama");

  const { data: kumData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "kedi-kumu", "kedi-kumu"],
    enabled: isKediMama,
  });

  const { data: odulData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "odul", "odul"],
    enabled: isKediMama,
  });

  const { data: maltData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "malt-vitamin", "malt-vitamin"],
    enabled: isKediMama,
  });

  const { data: yasMamaData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "yas-mama", "yas-mama"],
    enabled: isKediMama,
  });

  const { data: bakimData } = useQuery<{ category: BrandCategory; products: Product[] }>({
    queryKey: ["/api/brand-products", "kedi", "bakim-saglik", "bakim-saglik"],
    enabled: isKediMama,
  });

  const alsoBoughtCategories = useMemo(() => {
    if (!isKediMama) return [];
    const cats: { title: string; products: Product[] }[] = [];
    if (kumData?.products?.length) cats.push({ title: "KUM", products: kumData.products });
    if (odulData?.products?.length) cats.push({ title: "ÖDÜL", products: odulData.products });
    if (maltData?.products?.length) cats.push({ title: "MALT", products: maltData.products });
    if (yasMamaData?.products?.length) cats.push({ title: "YAŞ MAMA", products: yasMamaData.products });
    if (bakimData?.products?.length) cats.push({ title: "BAKIM VE SAĞLIK", products: bakimData.products });
    return cats;
  }, [isKediMama, kumData, odulData, maltData, yasMamaData, bakimData]);

  const resolvedData = isNumericId ? data : staticData;

  useEffect(() => {
    if (!resolvedData) return;
    const p = resolvedData.product;
    const catName = resolvedData.category?.brandName || "";
    const title = `${p.name} - ${catName ? catName + " | " : ""}JetGo Pet Shop`;
    document.title = title;

    const desc = `${p.name} en uygun fiyatla JetGo Pet Shop'ta. ${Math.round(p.price)} TL${p.originalPrice ? ` (eski fiyat ${Math.round(p.originalPrice)} TL)` : ""}. Hızlı sipariş ve kapıda ödeme.`;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = desc;

    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!ogTitle) { ogTitle = document.createElement("meta"); ogTitle.setAttribute("property", "og:title"); document.head.appendChild(ogTitle); }
    ogTitle.content = title;

    let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (!ogDesc) { ogDesc = document.createElement("meta"); ogDesc.setAttribute("property", "og:description"); document.head.appendChild(ogDesc); }
    ogDesc.content = desc;

    if (p.img) {
      let ogImg = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (!ogImg) { ogImg = document.createElement("meta"); ogImg.setAttribute("property", "og:image"); document.head.appendChild(ogImg); }
      ogImg.content = p.img;
    }

    return () => { document.title = "JetGo Pet Shop"; };
  }, [resolvedData]);

  if (isLoading && isNumericId) {
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

  if (!resolvedData) {
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

  const { product, category, crossSellSections, breedStats } = resolvedData;
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
                <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-cart-total">{Math.round(grandTotal)} TL</Badge>
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

        {breedStats && breedStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
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
          </motion.div>
        )}

        {isKediMama && alsoBoughtCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8"
            data-testid="section-also-bought"
          >
            <h3 className="text-lg font-extrabold mb-4" data-testid="text-also-bought-title">
              Bu ürünü alanlar bunları da aldı
            </h3>
            <div className="space-y-6">
              {alsoBoughtCategories.map((cat, catIdx) => (
                <div key={cat.title} data-testid={`section-also-bought-${cat.title}`}>
                  <h4 className="text-sm font-bold text-white px-3 py-1.5 rounded-t-lg" style={{ backgroundColor: "#2ecc40" }} data-testid={`text-cat-title-${cat.title}`}>
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {cat.products.map((p, i) => (
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
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

      </main>

      <FloatingCartBar />
    </div>
  );
}