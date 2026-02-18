import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import royalCaninLogo from "@/assets/images/brands/royal-canin.png";
import proPlanLogo from "@/assets/images/brands/pro-plan.png";
import hillsLogo from "@/assets/images/brands/hills.png";
import britLogo from "@/assets/images/brands/brit.png";
import prochoiceLogo from "@/assets/images/brands/prochoice.png";
import reflexLogo from "@/assets/images/brands/reflex.png";
import reflexPlusLogo from "@/assets/images/brands/reflex-plus.png";
import acanaLogo from "@/assets/images/brands/acana.png";
import orijenLogo from "@/assets/images/brands/orijen.png";
import gimdogLogo from "@/assets/images/brands/gimdog.png";
import pedigreeLogo from "@/assets/images/brands/pedigree.png";
import goodyLogo from "@/assets/images/brands/goody.png";
import bonusLogo from "@/assets/images/brands/bonus.png";

interface Brand {
  name: string;
  slug: string;
  logo: string;
}

interface SubcategoryBrands {
  title: string;
  subtitle: string;
  brands: Brand[];
}

const BRAND_DATA: Record<string, Record<string, SubcategoryBrands>> = {
  kopek: {
    "mama-markalari": {
      title: "Köpek Mama Markaları",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Royal Canin", slug: "royal-canin", logo: royalCaninLogo },
        { name: "Pro Plan", slug: "pro-plan", logo: proPlanLogo },
        { name: "Hills", slug: "hills", logo: hillsLogo },
        { name: "Brit", slug: "brit", logo: britLogo },
        { name: "ProChoice", slug: "prochoice", logo: prochoiceLogo },
        { name: "Reflex", slug: "reflex", logo: reflexLogo },
        { name: "Reflex Plus", slug: "reflex-plus", logo: reflexPlusLogo },
        { name: "Acana", slug: "acana", logo: acanaLogo },
        { name: "Orijen", slug: "orijen", logo: orijenLogo },
        { name: "GimDog", slug: "gimdog", logo: gimdogLogo },
        { name: "Pedigree", slug: "pedigree", logo: pedigreeLogo },
        { name: "Goody", slug: "goody", logo: goodyLogo },
        { name: "Bonus", slug: "bonus", logo: bonusLogo },
      ],
    },
  },
  kedi: {
    "mama-markalari": {
      title: "Kedi Mama Markaları",
      subtitle: "Buradan markanızı seçebilirsiniz.",
      brands: [
        { name: "Royal Canin", slug: "royal-canin", logo: royalCaninLogo },
        { name: "Pro Plan", slug: "pro-plan", logo: proPlanLogo },
        { name: "Hills", slug: "hills", logo: hillsLogo },
        { name: "Brit", slug: "brit", logo: britLogo },
        { name: "ProChoice", slug: "prochoice", logo: prochoiceLogo },
        { name: "Reflex", slug: "reflex", logo: reflexLogo },
        { name: "Reflex Plus", slug: "reflex-plus", logo: reflexPlusLogo },
        { name: "Acana", slug: "acana", logo: acanaLogo },
        { name: "Orijen", slug: "orijen", logo: orijenLogo },
        { name: "Goody", slug: "goody", logo: goodyLogo },
        { name: "Bonus", slug: "bonus", logo: bonusLogo },
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
              key={brand.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * i }}
              className="w-full max-w-[280px]"
            >
              <Link href={`/siparis?kategori=${animalSlug}&alt=${subSlug}&marka=${brand.slug}`}>
                <div
                  className="rounded-md border-2 cursor-pointer overflow-hidden transition-colors duration-200"
                  style={{ borderColor: "#64B5F6" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#EF4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#64B5F6"; }}
                  data-testid={`card-brand-${brand.slug}`}
                >
                  <div className="flex items-center justify-center bg-white">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-[52px] object-cover"
                      data-testid={`img-brand-${brand.slug}`}
                    />
                    <span className="sr-only" data-testid={`text-brand-name-${brand.slug}`}>{brand.name}</span>
                  </div>
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
