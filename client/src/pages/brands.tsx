import { Link, useRoute } from "wouter";
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
  "kopek-kuru-mama": "Kuru Mama",
  "kedi-mamasi": "Kedi Maması",
  "kopek-mamasi": "Köpek Maması",
  "acik-mama": "Açık Mama",
  "yas-mama": "Yaş Mama",
};

const SUBCATEGORY_SLUG_MAP: Record<string, string> = {
  "kedi-odulu": "odul",
  "kedi-bakim-saglik": "bakim-saglik",
  "kedi-konserve": "kedi-konserve",
  "malt-macun": "malt-macun",
  "malt-vitamin": "malt-vitamin",
  "kopek-mamasi": "mama-markalari",
  "kopek-kuru-mama": "mama-markalari",
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

const FALLBACK_COLORS = [
  "#D32F2F", "#7B1FA2", "#303F9F", "#0288D1", "#00796B",
  "#388E3C", "#F57C00", "#5D4037", "#455A64", "#C2185B",
  "#512DA8", "#1976D2", "#0097A7", "#689F38", "#E64A19",
  "#6D4C41", "#37474F", "#AD1457", "#283593", "#00695C",
];

function getBrandColor(slug: string): string {
  if (BRAND_COLORS[slug]) return BRAND_COLORS[slug];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export default function BrandsPage() {
  const [, params] = useRoute("/kategori/:animal/:subcategory");
  const animalSlug = params?.animal || "";
  const subSlug = params?.subcategory || "";

  const { data: allCategories = [], isLoading } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
  });

  const mappedSubSlug = SUBCATEGORY_SLUG_MAP[subSlug] || subSlug;
  const brands = allCategories.filter(
    (c) => c.animal === animalSlug && c.subcategory === mappedSubSlug
  );

  const animalLabel = animalSlug === "kopek" ? "Köpek" : animalSlug === "kedi" ? "Kedi" : animalSlug === "kus" ? "Kuş" : "Kemirgen";
  const title = SUBCATEGORY_TITLES[subSlug] || subSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
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
      <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Bu kategoride henüz marka eklenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
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
          {brands.map((brand) => (
            <div key={brand.id} className="w-full max-w-[280px]">
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
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
