import { Link, useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

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

const ANIMAL_TITLES: Record<string, { title: string; titleHighlight: string }> = {
  kopek: { title: "Köpek", titleHighlight: "Kategorileri" },
  kedi: { title: "Kedi", titleHighlight: "Kategorileri" },
  kus: { title: "Kuş", titleHighlight: "Kategorileri" },
  kemirgen: { title: "Kemirgen", titleHighlight: "Kategorileri" },
};

export default function CategoryPage() {
  const [, params] = useRoute("/kategori/:animal");
  const animalSlug = params?.animal || "kopek";
  const animalInfo = ANIMAL_TITLES[animalSlug];

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

  if (!animalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground" data-testid="text-category-not-found">Kategori bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0" style={{ backgroundColor: "#f0f2f5" }}>
      <SEO
        title={`${animalInfo.title} Maması Samsun - ${animalInfo.title} Ürünleri Fiyatları | JETGO Pet Shop`}
        description={`Samsun ${animalInfo.title.toLowerCase()} maması, ${animalInfo.title.toLowerCase()} bakım ürünleri ve aksesuar çeşitleri en uygun fiyatlarla. Samsun içi aynı gün teslimat, kapıda ödeme. ${animalInfo.title} maması online sipariş.`}
        canonical={`${SITE_DOMAIN}/kategori/${animalSlug}`}
      />
      <main className="flex-1 max-w-lg mx-auto px-4 w-full py-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold" data-testid="text-category-title">
            <span className="text-foreground">{animalInfo.title} </span>
            <span style={{ color: "#2196F3" }}>{animalInfo.titleHighlight}</span>
          </h2>
          <p className="text-sm text-muted-foreground font-semibold tracking-wider mt-1" data-testid="text-category-subtitle">
            LÜTFEN KATEGORİ SEÇİNİZ
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl p-5 min-h-[90px] bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3" data-testid="grid-subcategories">
            {subcategories.map((sub) => {
              const href = sub.hasBrands
                ? (sub.slug === "acik-mama" ? `/acik-mama/${animalSlug}` : `/kategori/${animalSlug}/${sub.slug}`)
                : `/siparis/${animalSlug}/${sub.slug}/${sub.slug}`;

              return (
                <div key={sub.id}>
                  <Link href={href}>
                    <div
                      className="rounded-xl p-5 cursor-pointer flex items-center justify-center min-h-[90px]"
                      style={{ backgroundColor: sub.color }}
                      data-testid={`btn-subcategory-${sub.slug}`}
                    >
                      <span className="text-white font-bold text-base text-center leading-tight whitespace-pre-line" data-testid={`text-subcategory-${sub.slug}`}>
                        {sub.displayName}
                      </span>
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
