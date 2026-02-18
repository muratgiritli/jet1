import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubCategory {
  name: string;
  slug: string;
  color: string;
}

interface AnimalCategory {
  title: string;
  titleHighlight: string;
  subtitle: string;
  subcategories: SubCategory[];
}

const ANIMAL_CATEGORIES: Record<string, AnimalCategory> = {
  kopek: {
    title: "Köpek",
    titleHighlight: "Kategorileri",
    subtitle: "LÜTFEN KATEGORİ SEÇİNİZ",
    subcategories: [
      { name: "Mama\nMarkaları", slug: "mama-markalari", color: "#2196F3" },
      { name: "Açık Mama\nÇeşitleri", slug: "acik-mama", color: "#00BFA5" },
      { name: "Tuvalet\nMalzemeleri", slug: "tuvalet-malzemeleri", color: "#7B1FA2" },
      { name: "Yaş Mama\nÇeşitleri", slug: "yas-mama", color: "#FF9800" },
      { name: "Ödül Kemik\nÇeşitleri", slug: "odul-kemik", color: "#F44336" },
      { name: "Taşıma ve\nKulübeler", slug: "tasima-kulube", color: "#37474F" },
      { name: "Bakım ve\nSağlık", slug: "bakim-saglik", color: "#4CAF50" },
      { name: "Uygun Çuval\nMamalar", slug: "uygun-cuval", color: "#1A237E" },
    ],
  },
  kedi: {
    title: "Kedi",
    titleHighlight: "Kategorileri",
    subtitle: "LÜTFEN KATEGORİ SEÇİNİZ",
    subcategories: [
      { name: "Mama\nMarkaları", slug: "mama-markalari", color: "#E91E63" },
      { name: "Kedi Kumu\nÇeşitleri", slug: "kedi-kumu", color: "#00BCD4" },
      { name: "Yaş Mama\nÇeşitleri", slug: "yas-mama", color: "#FF5722" },
      { name: "Ödül ve\nÇeşitleri", slug: "odul", color: "#9C27B0" },
      { name: "Malt\nMacunları", slug: "malt", color: "#3F51B5" },
      { name: "Bakım ve\nAksesuar", slug: "bakim-aksesuar", color: "#009688" },
      { name: "Bakım ve\nSağlık", slug: "bakim-saglik", color: "#4CAF50" },
      { name: "Uygun Çuval\nMamalar", slug: "uygun-cuval", color: "#37474F" },
    ],
  },
  kus: {
    title: "Kuş",
    titleHighlight: "Kategorileri",
    subtitle: "LÜTFEN KATEGORİ SEÇİNİZ",
    subcategories: [
      { name: "Kuş Yemi\nÇeşitleri", slug: "kus-yemi", color: "#2196F3" },
      { name: "Kuş Kafesi\nÇeşitleri", slug: "kus-kafesi", color: "#FF9800" },
      { name: "Kuş\nVitaminleri", slug: "kus-vitamin", color: "#4CAF50" },
      { name: "Bakım ve\nAksesuar", slug: "bakim-aksesuar", color: "#9C27B0" },
    ],
  },
  kemirgen: {
    title: "Kemirgen",
    titleHighlight: "Kategorileri",
    subtitle: "LÜTFEN KATEGORİ SEÇİNİZ",
    subcategories: [
      { name: "Kemirgen\nYemleri", slug: "kemirgen-yemi", color: "#4CAF50" },
      { name: "Kemirgen\nKafesleri", slug: "kemirgen-kafesi", color: "#2196F3" },
      { name: "Bakım ve\nAksesuar", slug: "bakim-aksesuar", color: "#FF9800" },
      { name: "Vitamin ve\nTakviye", slug: "vitamin-takviye", color: "#9C27B0" },
    ],
  },
};

export default function CategoryPage() {
  const [, params] = useRoute("/kategori/:animal");
  const animalSlug = params?.animal || "kopek";
  const category = ANIMAL_CATEGORIES[animalSlug];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground" data-testid="text-category-not-found">Kategori bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f2f5" }}>
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white" data-testid="btn-back">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-brand-logo">
            <span style={{ color: "#ffffff" }}>JET</span>
            <span style={{ color: "#1a7a1a" }}>GO</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold" data-testid="text-category-title">
            <span className="text-foreground">{category.title} </span>
            <span style={{ color: "#2196F3" }}>{category.titleHighlight}</span>
          </h2>
          <p className="text-sm text-muted-foreground font-semibold tracking-wider mt-1" data-testid="text-category-subtitle">
            {category.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3" data-testid="grid-subcategories">
          {category.subcategories.map((sub, i) => (
            <motion.div
              key={sub.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <Link href={`/siparis?kategori=${animalSlug}&alt=${sub.slug}`}>
                <div
                  className="rounded-xl p-5 cursor-pointer flex items-center justify-center min-h-[90px]"
                  style={{ backgroundColor: sub.color }}
                  data-testid={`btn-subcategory-${sub.slug}`}
                >
                  <span className="text-white font-bold text-base text-center leading-tight whitespace-pre-line" data-testid={`text-subcategory-${sub.slug}`}>
                    {sub.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <footer style={{ backgroundColor: "#2ecc40" }} className="py-4 px-4 text-center">
        <p className="text-white font-semibold text-sm" data-testid="text-delivery-info">
          Samsun içinde kapınıza getiriyoruz..
        </p>
        <p className="text-white/90 text-xs mt-1" data-testid="text-payment-methods">
          Havale / Kapıda nakit / Kapıda kredi kartı / QR ödeme
        </p>
      </footer>
    </div>
  );
}
