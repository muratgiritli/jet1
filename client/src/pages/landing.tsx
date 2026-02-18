import { Link } from "wouter";
import { motion } from "framer-motion";

import bannerScooter from "@/assets/images/banner-scooter.png";
import bannerCity from "@/assets/images/banner-city.png";
import catDog from "@/assets/images/cat-dog.png";
import catCat from "@/assets/images/cat-cat.png";
import catBird from "@/assets/images/cat-bird.png";
import catRabbit from "@/assets/images/cat-rabbit.png";

const CATEGORIES = [
  { name: "Köpek", image: catDog, href: "/siparis" },
  { name: "Kedi", image: catCat, href: "/siparis" },
  { name: "Kuş", image: catBird, href: "/siparis" },
  { name: "Kemirgen", image: catRabbit, href: "/siparis" },
];

const NAV_ITEMS = ["Kedi", "Köpek", "Kuş", "Kemirgen"];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f5f5" }}>
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#2ecc40" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-3xl font-extrabold tracking-tight" data-testid="text-brand-logo">
            <span style={{ color: "#ffffff" }}>JET</span>
            <span style={{ color: "#1a7a1a" }}>GO</span>
          </h1>
        </div>
      </header>

      <nav className="sticky top-[52px] z-[9998]" style={{ backgroundColor: "#7c4dff" }}>
        <div className="max-w-lg mx-auto px-2">
          <ul className="flex items-center justify-center gap-0 py-1.5 flex-wrap" data-testid="nav-categories">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <Link href="/siparis">
                  <button
                    className="px-4 py-1 text-sm font-medium text-white/90 hover:text-white transition-colors"
                    data-testid={`nav-link-${item}`}
                  >
                    {item}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="flex-1 max-w-lg mx-auto px-3 w-full">
        <section className="mt-3 grid grid-cols-2 gap-2.5" data-testid="section-banners">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/siparis">
              <div className="relative rounded-xl overflow-hidden aspect-square cursor-pointer" data-testid="banner-delivery">
                <img
                  src={bannerScooter}
                  alt="Sen İste Jet İle Gelsin"
                  className="w-full h-full object-cover"
                  data-testid="img-banner-delivery"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
                  <p className="text-white font-extrabold text-base leading-tight drop-shadow-lg" data-testid="text-banner-slogan">
                    Sen İste<br />Jet İle Gelsin
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link href="/siparis">
              <div className="relative rounded-xl overflow-hidden aspect-square cursor-pointer" data-testid="banner-promo">
                <img
                  src={bannerCity}
                  alt="JetGo Şimdi Samsun'da"
                  className="w-full h-full object-cover"
                  data-testid="img-banner-promo"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  <p className="font-extrabold text-2xl leading-none drop-shadow-lg" style={{ color: "#2ecc40" }} data-testid="text-banner-brand">
                    JETGO
                  </p>
                  <p className="font-bold text-sm mt-1 drop-shadow-lg" style={{ color: "#d32f2f" }} data-testid="text-banner-city">
                    Şimdi SAMSUN'DA
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>

        <section className="mt-4 mb-4">
          <div className="grid grid-cols-2 gap-3" data-testid="grid-categories">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 * i }}
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

      <footer style={{ backgroundColor: "#2ecc40" }} className="py-5 px-4 text-center">
        <p className="text-white font-semibold text-sm leading-relaxed" data-testid="text-delivery-info">
          Samsun içinde kapınıza getiriyoruz..
        </p>
        <p className="text-white/90 text-sm mt-1" data-testid="text-payment-methods">
          Havale / Kapıda nakit / Kapıda kredi kartı / QR ödeme
        </p>
      </footer>

      <div style={{ backgroundColor: "#333" }} className="py-4 px-4 text-center">
        <p className="text-white font-bold text-sm" data-testid="text-footer-brand">
          Tüm Petshop Ürünleri
        </p>
        <Link href="/siparis">
          <p className="text-white/80 text-sm mt-0.5 cursor-pointer hover:text-white transition-colors" data-testid="text-footer-cta">
            Sipariş Ver - Hemen Kapına Gelsin
          </p>
        </Link>
      </div>
    </div>
  );
}
