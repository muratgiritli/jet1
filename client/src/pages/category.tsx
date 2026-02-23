import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingCartBar from "@/components/FloatingCartBar";
import BackNavigation from "@/components/BackNavigation";

interface SubCategory {
  name: string;
  slug: string;
  color: string;
  hasBrands?: boolean;
  directLink?: string;
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
      { name: "Köpek\nMaması", slug: "mama-markalari", color: "#2196F3", hasBrands: true },
      { name: "Açık Mama\nÇeşitleri", slug: "acik-mama", color: "#00BFA5", hasBrands: true },
      { name: "Tuvalet\nMalzemeleri", slug: "tuvalet-malzemeleri", color: "#7B1FA2", directLink: "/siparis/kopek/tuvalet-malzemeleri/tuvalet-malzemeleri" },
      { name: "Yaş Mama\nÇeşitleri", slug: "yas-mama", color: "#FF9800", directLink: "/siparis/kopek/yas-mama/yas-mama" },
      { name: "Ödül Kemik\nÇeşitleri", slug: "odul-kemik", color: "#F44336", directLink: "/siparis/kopek/odul-kemik/odul-kemik" },
      { name: "Taşıma ve\nKulübeler", slug: "tasima-kulube", color: "#37474F", directLink: "/siparis/kopek/tasima-kulube/tasima-kulube" },
      { name: "Bakım ve\nSağlık", slug: "bakim-saglik", color: "#4CAF50", directLink: "/siparis/kopek/bakim-saglik/bakim-saglik" },
      { name: "Uygun Çuval\nMamalar", slug: "uygun-cuval", color: "#1A237E", directLink: "/siparis/kopek/uygun-cuval/uygun-cuval" },
    ],
  },
  kedi: {
    title: "Kedi",
    titleHighlight: "Kategorileri",
    subtitle: "LÜTFEN KATEGORİ SEÇİNİZ",
    subcategories: [
      { name: "Kedi\nMaması", slug: "kedi-mamasi", color: "#E91E63", hasBrands: true },
      { name: "Açık\nMamalar", slug: "acik-mama", color: "#00BFA5", hasBrands: true },
      { name: "Kedi\nKumu", slug: "kedi-kumu", color: "#00BCD4", directLink: "/siparis/kedi/kedi-kumu/kedi-kumu" },
      { name: "Kedi\nMaltı", slug: "kedi-malti", color: "#3F51B5" },
      { name: "Kedi\nÖdülü", slug: "kedi-odulu", color: "#9C27B0" },
      { name: "Kedi Bakım\nSağlık", slug: "kedi-bakim-saglik", color: "#4CAF50" },
      { name: "Kedi\nTaşıma", slug: "kedi-tasima", color: "#37474F", directLink: "/siparis/kedi/kedi-tasima/kedi-tasima" },
      { name: "Kedi\nTuvaleti", slug: "kedi-tuvaleti", color: "#795548", directLink: "/siparis/kedi/kedi-tuvaleti/kedi-tuvaleti" },
      { name: "Kedi Konserve\nMamaları", slug: "kedi-konserve", color: "#FF5722", directLink: "/siparis/kedi/kedi-konserve/kedi-konserve" },
      { name: "Uygun Çuval\nMamalar", slug: "uygun-cuval", color: "#1A237E" },
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
          <Link href="/">
            <h1 className="text-xl font-extrabold tracking-tight cursor-pointer" data-testid="text-brand-logo">
              <span style={{ color: "#ffffff" }}>JET</span>
              <span style={{ color: "#1a7a1a" }}>55</span>
            </h1>
          </Link>
        </div>
      </header>

      <BackNavigation />

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
              <Link href={sub.directLink ? sub.directLink : sub.slug === "acik-mama" ? `/acik-mama/${animalSlug}` : sub.hasBrands ? `/kategori/${animalSlug}/${sub.slug}` : `/siparis?kategori=${animalSlug}&alt=${sub.slug}`}>
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
      <FloatingCartBar />
    </div>
  );
}
