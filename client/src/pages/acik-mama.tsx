import { useMemo } from "react";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { ShoppingCart, Loader2, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, BrandCategory } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import Logo from "@/components/Logo";
import ProductImage from "@/components/ProductImage";
import { productUrl } from "@/lib/data";
import SEO, { SITE_DOMAIN, FAQ_JSONLD } from "@/components/SEO";

const BRAND_COLORS: Record<string, string> = {
  "pro-plan": "#1565C0",
  "hills": "#2E7D32",
  "royal-canin": "#C62828",
  "prochoice": "#00838F",
  "nd": "#4CAF50",
  "reflex": "#F57F17",
  "enjoy": "#E91E63",
};

function ProductCard({ product, quantity, onUpdate }: { product: Product; quantity: number; onUpdate: (id: string, delta: number) => void }) {
  const pid = String(product.id);
  const isActive = quantity > 0;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className={`transition-all duration-200 ${isActive ? "ring-2 ring-inset ring-primary" : ""}`}
      data-testid={`card-acik-product-${pid}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <Link href={productUrl(product.id, product.name)} className="w-full block" data-testid={`link-acik-product-${pid}`}>
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative cursor-pointer">
            <ProductImage
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              data-testid={`img-acik-product-${pid}`}
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
          <p className="text-xs font-semibold text-center leading-tight line-clamp-3 min-h-[3rem] hover:text-primary cursor-pointer" data-testid={`text-acik-name-${pid}`}>
            {product.name}
          </p>
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through">
              {product.originalPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span className="text-sm font-bold text-foreground" data-testid={`text-acik-price-${pid}`}>
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </span>
          {product.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              S.K.T: {product.skt}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" data-testid={`qty-control-${pid}`}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onUpdate(pid, -1)}
            disabled={quantity <= 0}
            data-testid={`btn-minus-${pid}`}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-bold text-sm" style={{ color: isActive ? "#16a34a" : undefined }} data-testid={`text-qty-${pid}`}>
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onUpdate(pid, 1)}
            data-testid={`btn-plus-${pid}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AcikMamaPage() {
  const [, params] = useRoute("/acik-mama/:animal");
  const animal = params?.animal || "kedi";

  const { basket, updateQty, itemCount, grandTotal } = useCart();

  const { data: allCategories, isLoading: catLoading } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
  });

  const { data: allProducts, isLoading: prodLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const brandGroups = useMemo(() => {
    if (!allCategories || !allProducts) return [];

    const acikCategories = allCategories.filter(
      (bc) => bc.animal === animal && bc.subcategory === "acik-mama"
    );

    return acikCategories.map((bc) => ({
      brand: bc,
      products: allProducts.filter(
        (p) => p.brandCategoryId === bc.id && p.isActive
      ),
    })).filter(group => group.products.length > 0);
  }, [allCategories, allProducts, animal]);

  const isLoading = catLoading || prodLoading;
  const title = animal === "kedi" ? "Kedi Açık Mama" : "Köpek Açık Mama";

  const animalLabel = animal === "kopek" ? "Köpek" : "Kedi";
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0" style={{ backgroundColor: "#f0f2f5" }}>
      <SEO
        title={`Samsun Açık ${animalLabel} Maması - Kg ile Satış | JETGO Pet Shop Atakum`}
        description={`Samsun Atakum'da açık ${animalLabel.toLowerCase()} maması kg ile satış. Pro Plan, Royal Canin, Hill's, N&D, Reflex açık mama çeşitleri. Aynı gün teslimat ve kapıda ödeme.`}
        keywords={`samsun açık ${animalLabel.toLowerCase()} maması, atakum açık mama, açık ${animalLabel.toLowerCase()} maması kg, ${animalLabel.toLowerCase()} maması samsun, açık mama samsun pet shop`}
        canonical={`${SITE_DOMAIN}/acik-mama/${animal}`}
        jsonLd={FAQ_JSONLD([
          { question: `Samsun'da açık ${animalLabel.toLowerCase()} maması nereden alınır?`, answer: `JETGO Pet Shop Samsun Atakum mağazasından kg ile açık ${animalLabel.toLowerCase()} maması online sipariş edebilirsiniz; Atakum, İlkadım ve Canik içi aynı gün teslimat yapılır.` },
          { question: "Açık mama nasıl saklanmalı?", answer: "Hava almayan kapaklı bir kapta, serin ve kuru ortamda saklanmalıdır. Bozulma ihtimaline karşı 4-6 hafta içinde tüketilmesi önerilir." },
          { question: "Kapıda ödeme yapabilir miyim?", answer: "Evet, kapıda nakit, kredi kartı (POS) ve QR ile ödeme seçenekleri mevcuttur." },
        ])}
      />
      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
        <FreeShippingBanner className="mb-4" />
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold" data-testid="text-acik-title">
            <span style={{ color: "#2196F3" }}>{title}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-acik-subtitle">
            Aşağıda belirtilen fiyatlar, 1 kg açık mama için geçerlidir.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : brandGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-products">Henüz ürün eklenmedi</p>
          </div>
        ) : (
          <div className="space-y-8">
            {brandGroups.map((group, gi) => (
              <motion.section
                key={group.brand.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 * gi }}
                data-testid={`section-brand-${group.brand.brandSlug}`}
              >
                <div
                  className="rounded-lg px-4 py-2.5 mb-3"
                  style={{ backgroundColor: BRAND_COLORS[group.brand.brandSlug] || "#607D8B" }}
                >
                  <h3 className="text-white font-bold text-base tracking-wide text-center" data-testid={`text-brand-header-${group.brand.brandSlug}`}>
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
        )}
      </main>

    </div>
  );
}
