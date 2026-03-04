import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface BrandCategory {
  id: number;
  brandName: string;
  brandSlug: string;
  animal: string;
  subcategory: string;
}

const SUBCATEGORY_TITLES: Record<string, string> = {
  "mama-markalari": "Mama Markaları",
  "kedi-mamasi": "Kedi Maması",
  "acik-mama": "Açık Mama",
  "yas-mama": "Yaş Mama",
};

const BRAND_COLORS: Record<string, string> = {
  "royal-canin": "#C62828",
  "pro-plan": "#1565C0",
  "hills": "#2E7D32",
  "prochoice": "#00838F",
  "reflex-mama": "#F57F17",
  "reflex-plus": "#FF9800",
  "reflex": "#F57F17",
  "nd": "#4CAF50",
  "lavital": "#3F51B5",
  "pronature": "#FF5722",
  "properformance": "#E91E63",
  "wanpy": "#FF6F00",
  "brit-care": "#0277BD",
  "econature": "#689F38",
  "felicia": "#9C27B0",
  "enjoy": "#E91E63",
  "dogs-favorite": "#795548",
};

function getBrandColor(slug: string): string {
  return BRAND_COLORS[slug] || "#607D8B";
}

export default function BrandsPage() {
  const [, params] = useRoute("/kategori/:animal/:subcategory");
  const animalSlug = params?.animal || "";
  const subSlug = params?.subcategory || "";

  const { data: allCategories = [], isLoading } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
  });

  const brands = allCategories.filter(
    (c) => c.animal === animalSlug && c.subcategory === subSlug
  );

  const animalLabel = animalSlug === "kopek" ? "Köpek" : animalSlug === "kedi" ? "Kedi" : animalSlug === "kus" ? "Kuş" : "Kemirgen";
  const title = SUBCATEGORY_TITLES[subSlug] || subSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-16">
        <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
          <div className="text-center mb-6">
            <div className="h-8 w-48 mx-auto bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="flex flex-col gap-2.5 items-center">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-full max-w-[280px] h-12 bg-gray-200 animate-pulse rounded-md" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-16">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Bu kategoride henüz marka eklenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16">
      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold" data-testid="text-brands-title">
            <span style={{ color: "#2196F3" }}>{animalLabel} {title}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-brands-subtitle">
            Buradan markanızı seçebilirsiniz.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 items-center" data-testid="list-brands">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * i }}
              className="w-full max-w-[280px]"
            >
              <Link href={`/siparis/${animalSlug}/${subSlug}/${brand.brandSlug}`}>
                <div
                  className="rounded-md overflow-visible hover-elevate active-elevate-2 flex items-center justify-center py-3 px-4"
                  style={{ backgroundColor: getBrandColor(brand.brandSlug) }}
                  data-testid={`card-brand-${brand.brandSlug}`}
                >
                  <span className="text-white font-bold text-base tracking-wide" data-testid={`text-brand-name-${brand.brandSlug}`}>
                    {brand.brandName}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <footer style={{ backgroundColor: "#6B3480" }} className="py-4 px-4 text-center">
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
