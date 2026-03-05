import { Link } from "wouter";
import { Bike, CreditCard, Banknote, QrCode } from "lucide-react";
import SEO, { LOCAL_BUSINESS_JSONLD, SITE_DOMAIN } from "@/components/SEO";
import SearchBar from "@/components/SearchBar";

import catDog from "@/assets/images/cat-dog.webp";
import catCat from "@/assets/images/cat-cat.webp";
import catBird from "@/assets/images/cat-bird.webp";
import catRabbit from "@/assets/images/cat-rabbit.webp";

const CATEGORIES = [
  { name: "Köpek", image: catDog, href: "/kategori/kopek" },
  { name: "Kedi", image: catCat, href: "/kategori/kedi" },
  { name: "Kuş", image: catBird, href: "/kategori/kus" },
  { name: "Kemirgen", image: catRabbit, href: "/kategori/kemirgen" },
];

const FEATURES = [
  { icon: CreditCard, text: "12 Taksit" },
  { icon: Bike, text: "1 Saat Teslimat" },
  { icon: Banknote, text: "Kapıda Ödeme" },
  { icon: QrCode, text: "QR / Kapıda Kart" },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <SEO
        title="Samsun Pet Shop - Kedi Köpek Maması Online Sipariş | JETGO"
        description="Samsun pet shop JETGO - Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri. Samsun içi aynı gün kapıya teslimat, kapıda ödeme. En uygun fiyatlarla online sipariş."
        canonical={`${SITE_DOMAIN}/`}
        jsonLd={LOCAL_BUSINESS_JSONLD}
      />
      <main className="flex-1 max-w-lg mx-auto w-full">

        <section className="px-3 pt-3 pb-2" data-testid="section-search">
          <SearchBar />
        </section>

        <section data-testid="section-hero-banner">
          <div className="relative w-full overflow-hidden" data-testid="banner-hero">
            <img
              src="/banner-jetgo.webp"
              alt="JETGO - Sen İste Jet İle Gelsin | Şimdi Samsun'da"
              className="w-full h-auto object-contain rounded-lg"
              data-testid="img-hero-banner"
            />
          </div>
        </section>

        <section className="px-3 py-3" data-testid="section-features">
          <div className="grid grid-cols-4 gap-2">
            {FEATURES.map((f, i) => (
              <div
                key={f.text}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg"
                style={{ backgroundColor: "#f0faf0" }}
                data-testid={`feature-${i}`}
              >
                <f.icon className="w-5 h-5" style={{ color: "#2ecc40" }} />
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: "#333" }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-3 pb-4">
          <h2 className="text-base font-bold mb-2.5 text-center" style={{ color: "#333" }} data-testid="text-categories-heading">
            Kategoriler
          </h2>
          <div className="grid grid-cols-2 gap-3" data-testid="grid-categories">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <Link href={cat.href}>
                  <div className="cursor-pointer" data-testid={`card-category-${cat.name}`}>
                    <div className="rounded-xl overflow-hidden aspect-square shadow-sm">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        data-testid={`img-category-${cat.name}`}
                      />
                    </div>
                    <p className="text-center font-bold text-lg mt-1.5" style={{ color: "#333" }} data-testid={`text-category-name-${cat.name}`}>
                      {cat.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
