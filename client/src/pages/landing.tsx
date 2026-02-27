import { Link } from "wouter";
import { motion } from "framer-motion";
import { Truck, CreditCard, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import SEO, { LOCAL_BUSINESS_JSONLD } from "@/components/SEO";

import heroBanner from "@assets/banner_2_1771940597464.png";
import jet55Logo from "@assets/Ekran_görüntüsü_2026-02-24_020948_1771888203864.png";
import catDog from "@/assets/images/cat-dog.png";
import catCat from "@/assets/images/cat-cat.png";
import catBird from "@/assets/images/cat-bird.png";
import catRabbit from "@/assets/images/cat-rabbit.png";

const CATEGORIES = [
  { name: "Köpek", image: catDog, href: "/kategori/kopek" },
  { name: "Kedi", image: catCat, href: "/kategori/kedi" },
  { name: "Kuş", image: catBird, href: "/kategori/kus" },
  { name: "Kemirgen", image: catRabbit, href: "/kategori/kemirgen" },
];

const NAV_ITEMS = [
  { name: "Kedi", href: "/kategori/kedi" },
  { name: "Köpek", href: "/kategori/kopek" },
  { name: "Kuş", href: "/kategori/kus" },
  { name: "Kemirgen", href: "/kategori/kemirgen" },
];

const FEATURES = [
  { icon: Truck, text: "Samsun İçi Teslimat" },
  { icon: MapPin, text: "Kapınıza Kadar" },
  { icon: CreditCard, text: "Kapıda Ödeme" },
  { icon: SiWhatsapp, text: "0850 840 3959" },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <SEO
        title="JET55 Pet Shop - Kedi ve Köpek Maması | Samsun Hızlı Sipariş"
        description="Samsun'da kedi ve köpek maması, kum, ödül maması, malt ve bakım ürünlerini en uygun fiyatlarla sipariş edin. Kapıda ödeme, hızlı teslimat."
        canonical="https://jet55.app/"
        jsonLd={LOCAL_BUSINESS_JSONLD}
      />
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#6B3480" }}>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center">
          <Link href="/">
            <img src={jet55Logo} alt="JET55" className="h-10 object-contain cursor-pointer" data-testid="img-brand-logo" />
          </Link>
        </div>
      </header>

      <nav className="sticky top-[52px] z-[9998]" style={{ backgroundColor: "#7c4dff" }}>
        <div className="max-w-lg mx-auto px-2">
          <ul className="flex items-center justify-center gap-0 py-1.5 flex-wrap" data-testid="nav-categories">
            {NAV_ITEMS.map((item) => (
              <li key={item.name}>
                <Link href={item.href}
                  className="px-4 py-1 text-sm font-medium text-white/90"
                  data-testid={`nav-link-${item.name}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full">

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          data-testid="section-hero-banner"
        >
          <div className="relative w-full overflow-hidden" data-testid="banner-hero">
            <img
              src={heroBanner}
              alt="JET55 - Sen İste Jet İle Gelsin"
              className="w-full h-auto object-contain"
              data-testid="img-hero-banner"
            />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="px-3 py-3"
          data-testid="section-features"
        >
          <div className="grid grid-cols-4 gap-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + 0.05 * i }}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg"
                style={{ backgroundColor: "#f0faf0" }}
                data-testid={`feature-${i}`}
              >
                <f.icon className="w-5 h-5" style={{ color: "#2ecc40" }} />
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: "#333" }}>
                  {f.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <section className="px-3 pb-4">
          <h2 className="text-base font-bold mb-2.5 text-center" style={{ color: "#333" }} data-testid="text-categories-heading">
            Kategoriler
          </h2>
          <div className="grid grid-cols-2 gap-3" data-testid="grid-categories">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 + 0.08 * i }}
              >
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
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: "#7c4dff" }} className="py-5 px-4 text-center">
        <p className="text-white font-semibold text-sm leading-relaxed" data-testid="text-delivery-info">
          Samsun içinde kapınıza getiriyoruz
        </p>
        <p className="text-white/90 text-sm mt-1" data-testid="text-payment-methods">
          Havale / Kapıda nakit / Kapıda kredi kartı / QR ödeme
        </p>
      </footer>

      <div style={{ backgroundColor: "#5c35c9" }} className="py-4 px-4 text-center">
        <p className="text-white font-bold text-sm" data-testid="text-footer-brand">
          Tüm Petshop Ürünleri
        </p>
        <Link href="/kategori">
          <p className="text-white/80 text-sm mt-0.5 cursor-pointer" data-testid="text-footer-cta">
            Sipariş Ver - Hemen Kapına Gelsin
          </p>
        </Link>
      </div>
    </div>
  );
}
