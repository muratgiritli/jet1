import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import SEO, { SITE_DOMAIN, BREADCRUMB_JSONLD } from "@/components/SEO";
import catDog from "@/assets/images/cat-dog.webp";
import catCat from "@/assets/images/cat-cat.webp";
import catBird from "@/assets/images/cat-bird.webp";
import catRabbit from "@/assets/images/cat-rabbit.webp";

const CATEGORIES = [
  {
    name: "Köpek",
    subtitle: "Mama, aksesuar ve bakım",
    image: catDog,
    href: "/kategori/kopek",
    gradient: "from-amber-500 to-orange-600",
    emoji: "🐕",
  },
  {
    name: "Kedi",
    subtitle: "Mama, kum ve oyuncak",
    image: catCat,
    href: "/kategori/kedi",
    gradient: "from-purple-500 to-indigo-600",
    emoji: "🐈",
  },
  {
    name: "Kuş",
    subtitle: "Yem, kafes ve vitamin",
    image: catBird,
    href: "/kategori/kus",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "🦜",
  },
  {
    name: "Kemirgen",
    subtitle: "Yem, kafes ve aksesuar",
    image: catRabbit,
    href: "/kategori/kemirgen",
    gradient: "from-pink-500 to-rose-600",
    emoji: "🐹",
  },
];

export default function CategoriesOverview() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 md:pb-8">
      <SEO
        title="Evcil Hayvan Kategorileri | JETGO Pet Shop Samsun"
        description="Kedi, köpek, kuş ve kemirgen için mama, aksesuar, bakım ürünleri. Samsun'da aynı gün teslimat ile evcil hayvan ürünleri online sipariş."
        canonical={`${SITE_DOMAIN}/kategori`}
        jsonLd={BREADCRUMB_JSONLD([
          { name: "Ana Sayfa", url: SITE_DOMAIN },
          { name: "Kategoriler", url: `${SITE_DOMAIN}/kategori` },
        ])}
      />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" data-testid="text-categories-title">
            Kategoriler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Evcil dostunuz için en iyi ürünleri keşfedin
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
            >
              <Link href={cat.href}>
                <div
                  className="cursor-pointer group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                  data-testid={`card-cat-${cat.name}`}
                >
                  <div className="aspect-[4/5] relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-50`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl md:text-3xl mb-1 block">{cat.emoji}</span>
                        <h3 className="text-white font-bold text-lg md:text-xl leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-white/80 text-[11px] md:text-xs mt-0.5 leading-snug">
                          {cat.subtitle}
                        </p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 group-hover:bg-white/40 transition-colors">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
