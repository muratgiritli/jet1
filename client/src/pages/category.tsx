import { Link, useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import SEO, { SITE_DOMAIN } from "@/components/SEO";

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
};

const SUBCATEGORY_ICONS: Record<string, string> = {
  "mama-markalari": "🦴",
  "kedi-mamasi": "🐟",
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
};

export default function CategoryPage() {
  const [, params] = useRoute("/kategori/:animal");
  const animalSlug = params?.animal || "kopek";
  const animalMeta = ANIMAL_META[animalSlug];

  const [, setLocation] = useLocation();

  const { data: subcategories = [], isLoading } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories", animalSlug],
    queryFn: () => fetch(`/api/subcategories/${animalSlug}`).then(r => r.json()),
  });

  if (animalSlug === "kus") {
    setLocation("/siparis/kus/kus-yemi/kus-yemi", { replace: true });
    return null;
  }

  if (animalSlug === "kemirgen") {
    setLocation("/siparis/kemirgen/kemirgen-urunleri/kemirgen-urunleri", { replace: true });
    return null;
  }

  if (!animalMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground" data-testid="text-category-not-found">Kategori bulunamadı</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col pb-16 md:pb-0 bg-gradient-to-b ${animalMeta.bgGradient}`}>
      <SEO
        title={`${animalMeta.title} Maması Samsun - ${animalMeta.title} Ürünleri Fiyatları | JETGO Pet Shop`}
        description={`Samsun ${animalMeta.title.toLowerCase()} maması, ${animalMeta.title.toLowerCase()} bakım ürünleri ve aksesuar çeşitleri en uygun fiyatlarla. Samsun içi aynı gün teslimat, kapıda ödeme. ${animalMeta.title} maması online sipariş.`}
        canonical={`${SITE_DOMAIN}/kategori/${animalSlug}`}
      />

      <main className="flex-1 max-w-2xl mx-auto px-4 w-full py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <span className="text-4xl md:text-5xl block mb-2">{animalMeta.emoji}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="text-category-title">
            <span className="text-foreground">{animalMeta.title} </span>
            <span className={`bg-gradient-to-r ${animalMeta.gradient} bg-clip-text text-transparent`}>
              Kategorileri
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide" data-testid="text-category-subtitle">
            Bir kategori seçerek ürünleri keşfedin
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl h-[100px] bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3" data-testid="grid-subcategories">
            {subcategories.map((sub, i) => {
              const href = sub.hasBrands
                ? (sub.slug === "acik-mama" ? `/acik-mama/${animalSlug}` : `/kategori/${animalSlug}/${sub.slug}`)
                : `/siparis/${animalSlug}/${sub.slug}/${sub.slug}`;

              const icon = SUBCATEGORY_ICONS[sub.slug] || "📦";

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                >
                  <Link href={href}>
                    <div
                      className="group cursor-pointer rounded-2xl p-4 min-h-[100px] flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      style={{ backgroundColor: sub.color }}
                      data-testid={`btn-subcategory-${sub.slug}`}
                    >
                      <div className="absolute -right-3 -top-3 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">
                        {icon}
                      </div>
                      <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/10" />

                      <span className="text-2xl mb-2">{icon}</span>
                      <div className="flex items-end justify-between">
                        <span
                          className="text-white font-bold text-sm md:text-base leading-tight pr-4"
                          data-testid={`text-subcategory-${sub.slug}`}
                        >
                          {sub.displayName}
                        </span>
                        <div className="bg-white/20 rounded-full p-1 shrink-0 group-hover:bg-white/40 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
