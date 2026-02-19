import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingCartBar from "@/components/FloatingCartBar";
import BackNavigation from "@/components/BackNavigation";

interface Brand {
  name: string;
  slug: string;
  color?: string;
}

interface SubcategoryBrands {
  title: string;
  subtitle: string;
  brands: Brand[];
}

const BRAND_DATA: Record<string, Record<string, SubcategoryBrands>> = {
  kopek: {
    "mama-markalari": {
      title: "Köpek Maması",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Royal Canin", slug: "royal-canin", color: "#C62828" },
        { name: "Pro Plan", slug: "pro-plan", color: "#1565C0" },
        { name: "Hill's", slug: "hills", color: "#2E7D32" },
        { name: "Brit", slug: "brit", color: "#0277BD" },
        { name: "ProChoice", slug: "prochoice", color: "#00838F" },
        { name: "Reflex", slug: "reflex", color: "#F57F17" },
        { name: "Reflex Plus", slug: "reflex-plus", color: "#FF9800" },
        { name: "Acana", slug: "acana", color: "#4CAF50" },
        { name: "Orijen", slug: "orijen", color: "#3F51B5" },
        { name: "GimDog", slug: "gimdog", color: "#FF5722" },
        { name: "Pedigree", slug: "pedigree", color: "#E91E63" },
        { name: "Goody", slug: "goody", color: "#9C27B0" },
        { name: "Bonus", slug: "bonus", color: "#607D8B" },
        { name: "Uygun Çuval Mamalar", slug: "uygun-cuval", color: "#455A64" },
      ],
    },
    "acik-mama": {
      title: "Köpek Açık Mama",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [],
    },
    "yas-mama": {
      title: "Köpek Yaş Mama",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [],
    },
  },
  kedi: {
    "kedi-mamasi": {
      title: "Kedi Maması",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Pro Plan", slug: "pro-plan", color: "#1565C0" },
        { name: "Royal Canin", slug: "royal-canin", color: "#C62828" },
        { name: "Hills", slug: "hills", color: "#2E7D32" },
        { name: "Lavital", slug: "lavital", color: "#8BC34A" },
        { name: "Prochoice", slug: "prochoice", color: "#00838F" },
        { name: "Properformance", slug: "properformance", color: "#FF5722" },
        { name: "Enjoy", slug: "enjoy", color: "#E91E63" },
        { name: "Reflex", slug: "reflex", color: "#F57F17" },
        { name: "Pronature", slug: "pronature", color: "#4CAF50" },
        { name: "Brit Care", slug: "brit-care", color: "#0277BD" },
        { name: "Felicia", slug: "felicia", color: "#9C27B0" },
        { name: "N&D", slug: "nd", color: "#3F51B5" },
        { name: "Uygun Çuval Mamalar", slug: "uygun-cuval", color: "#607D8B" },
      ],
    },
    "kedi-kumu": {
      title: "Kedi Kumu",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Proline", slug: "proline", color: "#2196F3" },
        { name: "Vancat", slug: "vancat", color: "#00BCD4" },
        { name: "Biokats", slug: "biokats", color: "#795548" },
        { name: "Sanicat", slug: "sanicat", color: "#FF9800" },
        { name: "Diğer Markalar", slug: "diger", color: "#607D8B" },
      ],
    },
    "kedi-odulu": {
      title: "Kedi Ödülü",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Crocus", slug: "crocus", color: "#9C27B0" },
        { name: "Dreamies", slug: "dreamies", color: "#E91E63" },
        { name: "GimCat", slug: "gimcat", color: "#FF5722" },
        { name: "Me-O", slug: "me-o", color: "#2196F3" },
        { name: "Miamor", slug: "miamor", color: "#00BCD4" },
        { name: "Nutri Feline", slug: "nutri-feline", color: "#4CAF50" },
        { name: "Reflex", slug: "reflex", color: "#F57F17" },
        { name: "Wanpy", slug: "wanpy", color: "#FF9800" },
      ],
    },
    "kedi-konserve": {
      title: "Kedi Konserve Mamaları",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Felix", slug: "felix", color: "#F44336" },
        { name: "GimCat", slug: "gimcat", color: "#FF5722" },
        { name: "Gourmet Gold", slug: "gourmet-gold", color: "#FFC107" },
        { name: "Hill's", slug: "hills", color: "#2E7D32" },
        { name: "Me-O", slug: "me-o", color: "#2196F3" },
        { name: "Molly", slug: "molly", color: "#E91E63" },
        { name: "Nutri Feline", slug: "nutri-feline", color: "#4CAF50" },
        { name: "Pro Plan", slug: "pro-plan", color: "#1565C0" },
        { name: "Royal Canin", slug: "royal-canin", color: "#C62828" },
        { name: "Wanpy", slug: "wanpy", color: "#FF9800" },
        { name: "Whiskas", slug: "whiskas", color: "#7B1FA2" },
      ],
    },
  },
};

export default function BrandsPage() {
  const [, params] = useRoute("/kategori/:animal/:subcategory");
  const animalSlug = params?.animal || "";
  const subSlug = params?.subcategory || "";

  const brandData = BRAND_DATA[animalSlug]?.[subSlug];

  if (!brandData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link href={`/kategori/${animalSlug}`}>
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
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Bu kategori henüz eklenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/kategori/${animalSlug}`}>
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

      <BackNavigation />

      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold" data-testid="text-brands-title">
            <span style={{ color: "#2196F3" }}>{brandData.title}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-brands-subtitle">
            {brandData.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 items-center" data-testid="list-brands">
          {brandData.brands.map((brand, i) => (
            <motion.div
              key={brand.slug + "-" + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * i }}
              className="w-full max-w-[280px]"
            >
              <Link href={brand.slug === "uygun-cuval" ? `/siparis?kategori=${animalSlug}&alt=uygun-cuval` : `/siparis/${animalSlug}/${subSlug}/${brand.slug}`}>
                <div
                  className="rounded-md overflow-visible hover-elevate active-elevate-2 flex items-center justify-center py-3 px-4"
                  style={{ backgroundColor: brand.color || "#607D8B" }}
                  data-testid={`card-brand-${brand.slug}`}
                >
                  <span className="text-white font-bold text-base tracking-wide" data-testid={`text-brand-name-${brand.slug}`}>
                    {brand.name}
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
