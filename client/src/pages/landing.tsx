import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Banknote, CreditCard, QrCode, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import bannerDelivery from "@/assets/images/banner-delivery.png";
import bannerPromo from "@/assets/images/banner-promo.png";
import categoryDog from "@/assets/images/category-dog.jpg";
import categoryCat from "@/assets/images/category-cat.jpg";
import categoryBird from "@/assets/images/category-bird.jpg";
import categoryRabbit from "@/assets/images/category-rabbit.jpg";

const ANIMAL_CATEGORIES = [
  { name: "Kedi", image: categoryCat, href: "/siparis" },
  { name: "Köpek", image: categoryDog, href: "/siparis" },
  { name: "Kuş", image: categoryBird, href: "/siparis" },
  { name: "Kemirgen", image: categoryRabbit, href: "/siparis" },
];

const NAV_ITEMS = ["Kedi", "Köpek", "Kuş", "Kemirgen"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-[9999] bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="text-brand-logo">
            JET<span className="text-primary-foreground/80">GO</span>
          </h1>
        </div>
      </header>

      <nav className="bg-muted border-b sticky top-[52px] z-[9998]">
        <div className="max-w-4xl mx-auto px-4">
          <ul className="flex items-center justify-center gap-1 py-2 flex-wrap" data-testid="nav-categories">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <Link href="/siparis">
                  <Button variant="ghost" size="sm" data-testid={`nav-link-${item}`}>
                    {item}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 w-full">
        <section className="mt-4 grid grid-cols-2 gap-3" data-testid="section-banners">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-md overflow-hidden aspect-square"
          >
            <img
              src={bannerDelivery}
              alt="Sen İste Jet İle Gelsin"
              className="w-full h-full object-cover"
              data-testid="img-banner-delivery"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <p className="text-white font-bold text-sm leading-tight drop-shadow-lg" data-testid="text-banner-slogan">
                Sen İste<br />Jet İle Gelsin
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-md overflow-hidden aspect-square"
          >
            <img
              src={bannerPromo}
              alt="JetGo Şimdi Samsun'da"
              className="w-full h-full object-cover"
              data-testid="img-banner-promo"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <div>
                <p className="text-white font-extrabold text-base leading-tight drop-shadow-lg">JETGO</p>
                <p className="text-white/90 font-semibold text-xs drop-shadow-lg" data-testid="text-banner-city">
                  Şimdi Samsun'da
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-8 mb-6">
          <h2 className="text-lg font-bold text-center mb-4" data-testid="text-categories-heading">
            Kategoriler
          </h2>
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={stagger}
            initial="hidden"
            animate="show"
            data-testid="grid-categories"
          >
            {ANIMAL_CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={fadeUp}>
                <Link href={cat.href}>
                  <Card className="overflow-visible hover-elevate cursor-pointer" data-testid={`card-category-${cat.name}`}>
                    <div className="relative aspect-square overflow-hidden rounded-t-md">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        data-testid={`img-category-${cat.name}`}
                      />
                    </div>
                    <div className="p-3 text-center">
                      <span className="text-lg font-bold" data-testid={`text-category-name-${cat.name}`}>
                        {cat.name}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mb-6">
          <Link href="/siparis">
            <Button className="w-full" size="lg" data-testid="btn-order-now">
              <Truck className="w-5 h-5" />
              Hemen Sipariş Ver
            </Button>
          </Link>
        </section>

        <section className="mb-8">
          <Card>
            <div className="p-5 text-center space-y-4">
              <p className="text-sm font-semibold text-primary" data-testid="text-delivery-info">
                Samsun içinde kapınıza getiriyoruz..
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap" data-testid="list-payment-methods">
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Havale</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Kapıda nakit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Kapıda kredi kartı</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">QR ödeme</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge variant="secondary" className="no-default-hover-elevate" data-testid="badge-min-order">Min. 500 TL</Badge>
                <Badge variant="secondary" className="no-default-hover-elevate" data-testid="badge-free-shipping">1000 TL üzeri ücretsiz teslimat</Badge>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center space-y-3">
          <p className="font-bold text-lg" data-testid="text-footer-brand">
            JetGo - Tüm Petshop Ürünleri
          </p>
          <p className="text-sm text-primary-foreground/80" data-testid="text-footer-tagline">
            Sipariş Ver - Hemen Kapına Gelsin
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="https://wa.me/908508403959"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp"
            >
              <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground" data-testid="btn-whatsapp">
                <SiWhatsapp className="w-4 h-4" />
                WhatsApp
              </Button>
            </a>
            <a href="tel:+908508403959" data-testid="link-phone">
              <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground" data-testid="btn-phone">
                <Phone className="w-4 h-4" />
                Ara
              </Button>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
