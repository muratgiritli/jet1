import { useMemo } from "react";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { Loader2, Plus, Minus, Clock, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory, Subcategory } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import ProductImage from "@/components/ProductImage";
import { productUrl } from "@/lib/data";
import SEO, { SITE_DOMAIN } from "@/components/SEO";

const BRAND_COLORS: Record<string, string> = {
  "pro-plan": "#1565C0",
  "hills": "#2E7D32",
  "royal-canin": "#C62828",
  "prochoice": "#00838F",
  "nd": "#4CAF50",
  "reflex": "#F57F17",
  "enjoy": "#E91E63",
  "brit": "#0277BD",
  "brit-care": "#0277BD",
  "virbac": "#0D47A1",
  "spectrum": "#6A1B9A",
};

const FALLBACK_COLORS = [
  "#A47864", "#5F8FAF", "#5848A3", "#3E7C5A",
  "#D97757", "#4C5578", "#7B1E3C", "#A07418",
];

function brandColor(slug: string, idx: number) {
  if (BRAND_COLORS[slug]) return BRAND_COLORS[slug];
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

function ProductCard({ product, quantity, onUpdate }: { product: Product; quantity: number; onUpdate: (id: string, delta: number) => void }) {
  const pid = String(product.id);
  const isActive = quantity > 0;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className={`transition-all duration-200 ${isActive ? "ring-2 ring-inset ring-primary" : ""}`}
      data-testid={`card-vet-product-${pid}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <Link href={productUrl(product.id, product.name)} className="w-full block">
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative cursor-pointer">
            <ProductImage
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            {discount > 0 && (
              <Badge
                className="absolute top-1 right-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
                style={{ backgroundColor: "#e53935", color: "#fff" }}
              >
                %{discount}
              </Badge>
            )}
          </div>
        </Link>
        <Link href={productUrl(product.id, product.name)} className="w-full">
          <p className="text-xs font-semibold text-center leading-tight line-clamp-3 min-h-[3rem] hover:text-primary cursor-pointer" data-testid={`text-vet-name-${pid}`}>
            {product.name}
          </p>
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through">
              {product.originalPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span className="text-sm font-bold text-foreground" data-testid={`text-vet-price-${pid}`}>
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </span>
          {product.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              S.K.T: {product.skt}
            </span>
          )}
        </div>
        <Link href={productUrl(product.id, product.name)} className="w-full">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            style={{ backgroundColor: "#1565c0" }}
            data-testid={`btn-vet-order-${pid}`}
          >
            <Clock className="w-3.5 h-3.5" />
            Sipariş Ver
          </Button>
        </Link>
        {quantity > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => onUpdate(pid, -1)} data-testid={`btn-vet-minus-${pid}`}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-bold text-sm" style={{ color: "#16a34a" }}>{quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => onUpdate(pid, 1)} data-testid={`btn-vet-plus-${pid}`}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VeterinerSubPage() {
  const [, params] = useRoute("/veteriner/:subcategory");
  const subSlug = params?.subcategory || "";
  const { basket, updateQty } = useCart();

  const { data: subs } = useQuery<Subcategory[]>({ queryKey: ["/api/subcategories"] });
  const { data: allCategories, isLoading: catLoading } = useQuery<BrandCategory[]>({ queryKey: ["/api/brand-categories"] });
  const { data: allProducts, isLoading: prodLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const sub = subs?.find(s => s.animal === "veteriner" && s.slug === subSlug);
  const title = sub?.displayName || subSlug.replace(/-/g, " ");

  const brandGroups = useMemo(() => {
    if (!allCategories || !allProducts) return [];
    const cats = allCategories.filter(bc => bc.animal === "veteriner" && bc.subcategory === subSlug);
    return cats.map(bc => ({
      brand: bc,
      products: allProducts.filter(p => p.brandCategoryId === bc.id && p.isActive),
    })).filter(g => g.products.length > 0);
  }, [allCategories, allProducts, subSlug]);

  const isLoading = catLoading || prodLoading;

  const scrollToBrand = (slug: string) => {
    const el = document.getElementById(`vet-brand-${slug}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0" style={{ backgroundColor: "#f0f2f5" }}>
      <SEO
        title={`${title} - Veteriner Mama Samsun | JETGO Pet Shop`}
        description={`${title} veteriner mama çeşitleri Samsun'da aynı gün kapıya teslim. Güvenilir markalar, uygun fiyatlar.`}
        canonical={`${SITE_DOMAIN}/veteriner/${subSlug}`}
      />
      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
        <Link href="/kategori/veteriner">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 mb-4 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            data-testid="btn-back-veteriner"
          >
            <ArrowLeft className="w-4 h-4" />
            Veteriner Sayfasına Dön
          </button>
        </Link>
        <FreeShippingBanner className="mb-4" />
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold" data-testid="text-vet-title">
            <span style={{ color: "#5848A3" }}>{title}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Veteriner mama - Marka altında ürünleri keşfedin
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : brandGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-products">Henüz marka veya ürün eklenmedi</p>
          </div>
        ) : (
          <>
            {brandGroups.length > 1 && (
              <div
                className="sticky top-0 z-20 -mx-4 px-4 py-2 mb-5 backdrop-blur border-b border-slate-200"
                style={{ backgroundColor: "rgba(240,242,245,0.95)" }}
                data-testid="bar-vet-brands"
              >
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {brandGroups.map((g, gi) => (
                    <button
                      key={g.brand.id}
                      onClick={() => scrollToBrand(g.brand.brandSlug)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: brandColor(g.brand.brandSlug, gi) }}
                      data-testid={`chip-vet-brand-${g.brand.brandSlug}`}
                    >
                      {g.brand.brandName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          <div className="space-y-8">
            {brandGroups.map((group, gi) => (
              <motion.section
                key={group.brand.id}
                id={`vet-brand-${group.brand.brandSlug}`}
                style={{ scrollMarginTop: 70 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 * gi }}
                data-testid={`section-vet-brand-${group.brand.brandSlug}`}
              >
                <div
                  className="rounded-lg px-4 py-2.5 mb-3"
                  style={{ backgroundColor: brandColor(group.brand.brandSlug, gi) }}
                >
                  <h3 className="text-white font-bold text-base tracking-wide text-center" data-testid={`text-vet-brand-${group.brand.brandSlug}`}>
                    {group.brand.brandName}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.products.map((product, pi) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.03 * Math.min(pi, 10) }}
                    >
                      <ProductCard product={product} quantity={basket[String(product.id)] || 0} onUpdate={updateQty} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
          </>
        )}
      </main>
    </div>
  );
}
