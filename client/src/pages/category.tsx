import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ShoppingCart, Bell, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import { productUrl } from "@/lib/data";
import ProductImage from "@/components/ProductImage";
import FavoriteButton from "@/components/FavoriteButton";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";

import SEO, { SITE_DOMAIN, BREADCRUMB_JSONLD, LOCAL_BUSINESS_JSONLD } from "@/components/SEO";

interface Subcategory {
  id: number;
  animal: string;
  slug: string;
  displayName: string;
  color: string;
  hasBrands: boolean;
  sortOrder: number;
}

const ANIMAL_META: Record<string, {
  title: string;
  emoji: string;
  gradient: string;
  bgGradient: string;
}> = {
  kopek: {
    title: "Köpek",
    emoji: "🐕",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
  },
  kedi: {
    title: "Kedi",
    emoji: "🐈",
    gradient: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-50 to-indigo-50",
  },
  kus: {
    title: "Kuş",
    emoji: "🦜",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
  },
  kemirgen: {
    title: "Kemirgen",
    emoji: "🐹",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-50 to-rose-50",
  },
  akvaryum: {
    title: "Akvaryum",
    emoji: "🐠",
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-50 to-blue-50",
  },
  veteriner: {
    title: "Veteriner Mama",
    emoji: "🩺",
    gradient: "from-blue-600 to-indigo-700",
    bgGradient: "from-blue-50 to-indigo-50",
  },
};

const SUBCATEGORY_ICONS: Record<string, string> = {
  "kopek-kuru-mama": "🍖",
  "mama-markalari": "🦴",
  "kedi-mamasi": "🐟",
  "kopek-mamasi": "🐕",
  "acik-mama": "🥣",
  "kedi-kumu": "🪣",
  "yas-mama": "🥫",
  "kedi-konserve": "🥫",
  "malt-vitamin": "💊",
  "odul": "🎁",
  "odul-kemik": "🦴",
  "bakim-saglik": "🩺",
  "kedi-tuvaleti": "🚽",
  "kedi-tasima": "👜",
  "tasima-kulube": "🏠",
  "tuvalet-malzemeleri": "🧹",
  "uygun-cuval": "📦",
  "kus-yemi": "🌾",
  "kus-kafesi": "🏡",
  "kus-vitamin": "💊",
  "kemirgen-yemi": "🌾",
  "kemirgen-kafesi": "🏡",
  "vitamin-takviye": "💊",
  "bakim-aksesuar": "✨",
  "akvaryumlar": "🐠",
  "ic-filtre": "💧",
  "aski-selale-filtre": "🌊",
  "tepe-filtre": "🔝",
  "dis-filtre": "🛢️",
  "uretim-filtre": "🐣",
  "sirkulasyon-sump-motoru": "🔄",
  "hava-motoru": "💨",
  "filtre-malzemesi": "🧽",
  "otomatik-yemleme": "🍽️",
  "balik-yemi": "🦐",
  "su-hazirlayici-ve-ilaclar": "💊",
  "akvaryum-dekor": "🪸",
  "akvaryum-kumu": "🟫",
  "plastik-bitki": "🌿",
  "akvaryum-arka-fon": "🖼️",
  "akvaryum-ekipmanlari": "🔧",
  "akvaryum-aydinlatma": "💡",
  "renal-kedi-mamalari": "🫘",
  "renal-kopek-mamalari": "🫘",
  "gastrointestinal-kedi-mamalari": "🦠",
  "gastrointestinal-kopek-mamalari": "🦠",
  "diabetic-obesity-diyet-kedi-mamalari": "⚖️",
  "diabetic-obesity-diyet-kopek-mamalari": "⚖️",
  "uriner-sistem-kedi-mamalari": "💧",
  "uriner-sistem-kopek-mamalari": "💧",
  "hepatic-kedi-mamalari": "🩺",
  "hepatic-kopek-mamalari": "🩺",
  "hipoalerjik-deri-ve-tuy-sagligi-kedi-mamalari": "🐾",
  "hipoalerjik-deri-ve-tuy-destegi-kopek-mamalari": "🐾",
  "cardiac-kedi-mamalari": "❤️",
  "cardiac-kopek-mamalari": "❤️",
  "veteriner-seri-kedi-mamalari": "🏥",
  "veteriner-seri-kopek-mamalari": "🏥",
};

const DIRECT_PRODUCT_ANIMALS = ["kemirgen", "akvaryum"];

function KemirgenProductCard({ product }: { product: Product }) {
  const pid = String(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className="transition-all duration-200"
      data-testid={`card-product-${pid}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <Link href={productUrl(product.id, product.name)} className="w-full flex flex-col items-center gap-2">
          <div className="w-full aspect-square flex items-center justify-center rounded-md overflow-hidden bg-muted/30 relative" data-testid={`img-container-${pid}`}>
            <ProductImage
              src={product.img}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
              data-testid={`img-product-${pid}`}
            />
            {discount > 0 && (
              <Badge
                className="absolute top-1 right-1 text-[10px] no-default-hover-elevate no-default-active-elevate"
                style={{ backgroundColor: "#e53935", color: "#fff" }}
                data-testid={`badge-discount-${pid}`}
              >
                %{discount}
              </Badge>
            )}
            <FavoriteButton
              product={{ id: pid, name: product.name, price: product.price, img: product.img || null }}
              className="absolute bottom-1 right-1 shadow-sm"
            />
          </div>
          <p className="text-xs font-semibold text-center leading-tight line-clamp-3 min-h-[3rem]" data-testid={`text-name-${pid}`}>
            {product.name}
          </p>
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through" data-testid={`text-original-price-${pid}`}>
              {product.originalPrice.toLocaleString("tr-TR")} TL
            </span>
          )}
          <span className="text-sm font-bold text-foreground" data-testid={`text-price-${pid}`}>
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
          </span>
          {!(product.stock === 0 && product.preorderEnabled) && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full" data-testid={`text-cash-price-${pid}`}>
            Nakit: {(product.price * 0.9).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL
          </span>
          )}
          {product.skt && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" data-testid={`badge-skt-${pid}`}>
              S.K.T: {product.skt}
            </span>
          )}
        </div>
        <Link href={productUrl(product.id, product.name)} className="w-full">
          <Button variant="default" size="sm" className="w-full" style={{ backgroundColor: "#6B3480" }} data-testid={`btn-order-${pid}`}>
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Sipariş Ver
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function CategoryPage() {
  const [, params] = useRoute("/kategori/:animal");
  const animalSlug = params?.animal || "kopek";
  const animalMeta = ANIMAL_META[animalSlug];

  const [, setLocation] = useLocation();
  const [vetAnimal, setVetAnimal] = useState<"kedi" | "kopek">("kedi");

  const isDirectProductAnimal = DIRECT_PRODUCT_ANIMALS.includes(animalSlug);

  const { data: subcategories = [], isLoading } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories", animalSlug],
    queryFn: () => fetch(`/api/subcategories/${animalSlug}`).then(r => r.json()),
    enabled: !isDirectProductAnimal,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/animal-products", animalSlug],
    queryFn: () => fetch(`/api/animal-products/${animalSlug}`).then(r => r.json()),
    enabled: isDirectProductAnimal,
  });

  if (animalSlug === "kus") {
    setLocation("/siparis/kus/kus-yemi/kus-yemi", { replace: true });
    return null;
  }

  if (!animalMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground" data-testid="text-category-not-found">Kategori bulunamadı</p>
      </div>
    );
  }

  if (isDirectProductAnimal) {
    return (
      <div className={`min-h-screen flex flex-col pb-16 md:pb-0 bg-gradient-to-b ${animalMeta.bgGradient}`}>
        <SEO
          title={`${animalMeta.title} Ürünleri Samsun - Aynı Gün Kapıya Teslim | JETGO Pet Shop`}
          description={`Samsun'da ${animalMeta.title.toLowerCase()} yemleri, kafesleri ve bakım ürünleri aynı gün kapıya teslim. En uygun fiyatlarla online sipariş JETGO.`}
          canonical={`${SITE_DOMAIN}/kategori/${animalSlug}`}
          keywords={`${animalMeta.title.toLowerCase()} yemi samsun, ${animalMeta.title.toLowerCase()} kafesi samsun, ${animalMeta.title.toLowerCase()} ürünleri, samsun petshop ${animalMeta.title.toLowerCase()}`}
          jsonLd={[
            BREADCRUMB_JSONLD([
              { name: "Ana Sayfa", url: SITE_DOMAIN },
              { name: "Kategoriler", url: `${SITE_DOMAIN}/kategori` },
              { name: `${animalMeta.title} Ürünleri Samsun`, url: `${SITE_DOMAIN}/kategori/${animalSlug}` },
            ]),
            LOCAL_BUSINESS_JSONLD,
          ]}
        />

        <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6 pb-28 md:pb-8">
          <div className="text-center mb-6">
            <span className="text-4xl md:text-5xl block mb-2">{animalMeta.emoji}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="text-category-title">
              <span className="text-foreground">{animalMeta.title} </span>
              <span className={`bg-gradient-to-r ${animalMeta.gradient} bg-clip-text text-transparent`}>
                Ürünleri
              </span>
            </h1>
            {animalSlug !== "veteriner" && (
              <p className="text-xs text-muted-foreground mt-1 tracking-wide" data-testid="text-category-subtitle">
                Samsun'da aynı gün kapıya teslim
              </p>
            )}
          </div>

          {productsLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm" data-testid="text-no-products">Henüz ürün eklenmedi</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2" data-testid="grid-direct-products">
              {products.map((product) => (
                <KemirgenProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col pb-16 md:pb-0 bg-gradient-to-b ${animalMeta.bgGradient}`}>
      <SEO
        title={`${animalMeta.title} Maması Samsun - Aynı Gün Kapıya Teslim ${animalMeta.title} Ürünleri | JETGO Pet Shop`}
        description={`Samsun'da ${animalMeta.title.toLowerCase()} maması aynı gün kapıya teslim. ${animalMeta.title} maması, bakım ürünleri ve aksesuar çeşitleri en uygun fiyatlarla. Aynı gün teslimat, kapıda nakit/POS ödeme. Online sipariş JETGO.`}
        canonical={`${SITE_DOMAIN}/kategori/${animalSlug}`}
        keywords={`${animalMeta.title.toLowerCase()} maması samsun, ${animalMeta.title.toLowerCase()} maması atakum, ${animalMeta.title.toLowerCase()} ürünleri samsun, ${animalMeta.title.toLowerCase()} maması kapıya teslim, samsun petshop ${animalMeta.title.toLowerCase()}`}
        jsonLd={[
          BREADCRUMB_JSONLD([
            { name: "Ana Sayfa", url: SITE_DOMAIN },
            { name: "Kategoriler", url: `${SITE_DOMAIN}/kategori` },
            { name: `${animalMeta.title} Ürünleri Samsun`, url: `${SITE_DOMAIN}/kategori/${animalSlug}` },
          ]),
          LOCAL_BUSINESS_JSONLD,
        ]}
      />

      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6">
        <FreeShippingBanner className="mb-4" />
        <div className="text-center mb-6">
          <span className="text-4xl md:text-5xl block mb-2">{animalMeta.emoji}</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="text-category-title">
            <span className="text-foreground">{animalMeta.title} </span>
            <span className={`bg-gradient-to-r ${animalMeta.gradient} bg-clip-text text-transparent`}>
              Ürünleri Samsun
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide" data-testid="text-category-subtitle">
            {animalSlug === "veteriner"
              ? "Önce hayvanınızı seçin, ardından tedavi/diyet türünü belirleyin"
              : "Samsun'da aynı gün kapıya teslim - Kategori seçerek ürünleri keşfedin"}
          </p>
        </div>

        {animalSlug === "veteriner" && (
          <div className="grid grid-cols-2 gap-3 mb-6" data-testid="tabs-vet-animal">
            {([
              { key: "kedi", label: "Kedi", emoji: "🐈", grad: "linear-gradient(135deg, #9B8FB8 0%, #5848A3 100%)" },
              { key: "kopek", label: "Köpek", emoji: "🐕", grad: "linear-gradient(135deg, #D9925A 0%, #A0531F 100%)" },
            ] as const).map((opt) => {
              const active = vetAnimal === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setVetAnimal(opt.key)}
                  className={`rounded-2xl py-4 flex flex-col items-center justify-center gap-1 font-bold text-base transition-all duration-200 ${active ? "text-white shadow-lg scale-[1.02]" : "text-foreground bg-white/70 shadow-sm hover:shadow-md"}`}
                  style={active ? { background: opt.grad } : undefined}
                  data-testid={`tab-vet-${opt.key}`}
                  aria-pressed={active}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl h-[110px] bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={`grid gap-3 ${animalSlug === "veteriner" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`} data-testid="grid-subcategories">
            {subcategories.filter(sub => {
              if (animalSlug === "kedi" && (sub.slug === "malt-vitamin" || sub.slug === "yas-mama")) return false;
              if (animalSlug === "kopek" && sub.slug === "mama-markalari") return false;
              if (animalSlug === "veteriner") {
                if (sub.slug === "kedi-serisi" || sub.slug === "kopek-serisi") return false;
                return sub.slug.includes(vetAnimal);
              }
              return true;
            }).map((sub, i) => {
              const href = animalSlug === "veteriner"
                ? `/veteriner/${sub.slug}`
                : sub.hasBrands
                  ? (sub.slug === "acik-mama" ? `/acik-mama/${animalSlug}` : `/kategori/${animalSlug}/${sub.slug}`)
                  : `/siparis/${animalSlug}/${sub.slug}/${sub.slug}`;

              const icon = SUBCATEGORY_ICONS[sub.slug] || "📦";

              const VET_PALETTE = [
                "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                "linear-gradient(135deg, #F43F5E 0%, #C81E3A 100%)",
                "linear-gradient(135deg, #FBBF24 0%, #E08C0A 100%)",
                "linear-gradient(135deg, #34D399 0%, #059669 100%)",
                "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)",
                "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
                "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
                "linear-gradient(135deg, #F472B6 0%, #DB2777 100%)",
              ];
              const isVet = animalSlug === "veteriner";
              const cardStyle: React.CSSProperties = isVet
                ? { background: VET_PALETTE[i % VET_PALETTE.length] }
                : { backgroundColor: sub.color };
              const cardHeight = isVet ? "h-[130px] md:h-[110px]" : "h-[110px]";
              const cardLabel = isVet
                ? sub.displayName.replace(/\s*(Kedi|Köpek|Kopek)\s*Maması/i, "").trim()
                : sub.displayName;

              return (
                <div key={sub.id}>
                  <Link href={href}>
                    <div
                      className={`group cursor-pointer rounded-2xl p-4 ${cardHeight} flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300`}
                      style={cardStyle}
                      data-testid={`btn-subcategory-${sub.slug}`}
                    >
                      <div className="absolute -right-3 -top-3 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">
                        {icon}
                      </div>
                      <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/10" />

                      <span className="text-2xl mb-2">{icon}</span>
                      <div className="flex items-end justify-between">
                        <span
                          className="text-white font-bold text-sm md:text-xs leading-tight pr-4"
                          data-testid={`text-subcategory-${sub.slug}`}
                        >
                          {cardLabel}
                        </span>
                        <div className="bg-white/20 rounded-full p-1 shrink-0 group-hover:bg-white/40 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
