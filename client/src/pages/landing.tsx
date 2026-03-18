import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Truck, CreditCard, Banknote, Smartphone,
  ArrowRight, ChevronRight, Star, Clock, Shield,
  Gift, MapPin
} from "lucide-react";
import SEO, { LOCAL_BUSINESS_JSONLD, SITE_DOMAIN } from "@/components/SEO";
import PetAIChat from "@/components/PetAIChat";

import catDog from "@/assets/images/cat-dog.webp";
import catCat from "@/assets/images/cat-cat.webp";
import catBird from "@/assets/images/cat-bird.webp";
import catRabbit from "@/assets/images/cat-rabbit.webp";

const HERO_SLIDES = [
  {
    title: "Mama Bitti\nPanik Yok! 🐾",
    subtitle: "Samsun'da 1 saatte kapına gelsin",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
  },
  {
    title: "Büyük\nKampanya 🎉",
    subtitle: "Ana mama + ekstra ürün fırsatları",
    gradient: "from-purple-600 via-violet-500 to-fuchsia-400",
    href: "/kampanya",
  },
  {
    title: "Yeni Üyelere\nÖzel Fırsat ✨",
    subtitle: "İlk siparişte %5 para puan kazan",
    gradient: "from-emerald-500 via-teal-500 to-cyan-400",
    href: "/giris",
  },
];

const CATEGORIES = [
  { name: "Köpek", img: catDog, href: "/kategori/kopek", color: "from-amber-400 to-orange-500" },
  { name: "Kedi", img: catCat, href: "/kategori/kedi", color: "from-pink-400 to-rose-500" },
  { name: "Kuş", img: catBird, href: "/kategori/kus", color: "from-sky-400 to-blue-500" },
  { name: "Kemirgen", img: catRabbit, href: "/kategori/kemirgen", color: "from-lime-400 to-green-500" },
];

const QUICK_ACTIONS = [
  { icon: Truck, label: "1 Saatte\nTeslimat", color: "#ff6f00", bg: "bg-orange-50" },
  { icon: CreditCard, label: "12 Ay\nTaksit", color: "#7c3aed", bg: "bg-purple-50" },
  { icon: Banknote, label: "Kapıda\nÖdeme", color: "#059669", bg: "bg-emerald-50" },
  { icon: Smartphone, label: "QR ile\nÖdeme", color: "#0284c7", bg: "bg-sky-50" },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[current];

  const content = (
    <div className="relative overflow-hidden rounded-2xl mx-3 mt-2" data-testid="hero-carousel">
      <div
        className={`bg-gradient-to-br ${slide.gradient} p-5 pb-6 transition-all duration-700`}
        style={{ minHeight: 160 }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white whitespace-pre-line leading-tight drop-shadow-sm">
            {slide.title}
          </h2>
          <p className="text-white/90 text-sm mt-2 font-medium">{slide.subtitle}</p>
          <span className="mt-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 inline-flex items-center gap-1.5">
            Hemen Keşfet <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="absolute right-3 bottom-2 opacity-20 text-8xl select-none pointer-events-none">
          🐾
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
            data-testid={`hero-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );

  if (slide.href) {
    return <Link href={slide.href}>{content}</Link>;
  }
  return content;
}

function QuickActions() {
  return (
    <div className="mx-3 mt-4" data-testid="section-quick-actions">
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((a, i) => (
          <div
            key={i}
            className={`${a.bg} rounded-xl p-2.5 flex flex-col items-center gap-1.5`}
            data-testid={`quick-action-${i}`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: a.color + "15" }}
            >
              <a.icon className="w-[18px] h-[18px]" style={{ color: a.color }} />
            </div>
            <span
              className="text-[10px] font-bold text-center leading-tight whitespace-pre-line"
              style={{ color: a.color }}
            >
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignBanner() {
  return (
    <div className="mx-3 mt-4" data-testid="section-campaign-banner">
      <Link href="/kampanya">
        <div
          className="relative overflow-hidden rounded-xl p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #6B3480 0%, #9b59b6 50%, #c39bd3 100%)" }}
          data-testid="banner-campaign"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white" />
            <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-extrabold">Kampanyalı Ürünler</p>
              <p className="text-white/70 text-[11px] mt-0.5">Ana mama + ek ürün fırsatları</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 shrink-0" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function CategoryGrid() {
  return (
    <div className="mx-3 mt-5" data-testid="section-categories">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold text-gray-900" data-testid="text-categories-heading">Kategoriler</h3>
        <Link href="/kategori" className="text-xs text-orange-500 font-semibold flex items-center gap-0.5" data-testid="link-all-categories">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2.5" data-testid="grid-categories">
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} href={cat.href}>
            <div className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform" data-testid={`card-category-${cat.name}`}>
              <div className={`w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${cat.color} p-[3px]`}>
                <div className="w-full h-full rounded-[13px] overflow-hidden bg-white">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" loading="lazy" data-testid={`img-category-${cat.name}`} />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-800" data-testid={`text-category-name-${cat.name}`}>{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function LocationBanner() {
  return (
    <div className="mx-3 mt-4" data-testid="section-location">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 flex items-center gap-3 border border-emerald-100">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800">Samsun İçi Teslimat</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Atakum, İlkadım, Canik bölgelerine teslimat</p>
        </div>
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="mx-3 mt-5" data-testid="section-trust">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-3.5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Hızlı Teslimat", sub: "1 saat içinde", color: "#f59e0b" },
            { icon: Shield, label: "Güvenli Alışveriş", sub: "256-bit SSL", color: "#10b981" },
            { icon: Star, label: "Müşteri Memnuniyeti", sub: "4.9 puan", color: "#6366f1" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 text-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: b.color + "15" }}
              >
                <b.icon className="w-4 h-4" style={{ color: b.color }} />
              </div>
              <span className="text-[10px] font-bold text-gray-800">{b.label}</span>
              <span className="text-[9px] text-gray-400">{b.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileFooter() {
  return (
    <section className="mx-3 mt-5 mb-20 md:hidden" data-testid="section-mobile-footer">
      <div className="bg-gray-50 rounded-xl border border-gray-200/80 p-4 space-y-3">
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Müşteri Hizmetleri</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "SSS", href: "/sss" },
              { label: "İşlem Rehberi", href: "/islem-rehberi" },
              { label: "Teslimat ve İade", href: "/teslimat-iade" },
              { label: "Hakkımızda", href: "/hakkimizda" },
              { label: "İletişim", href: "/iletisim" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-[11px] text-gray-500 py-0.5 cursor-pointer" data-testid={`mobile-footer-${l.href.slice(1)}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Yasal</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "KVKK", href: "/kvkk" },
              { label: "Gizlilik Politikası", href: "/gizlilik" },
              { label: "Gizlilik Sözleşmesi", href: "/gizlilik-sozlesmesi" },
              { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
              { label: "Çerez Politikası", href: "/cerez-politikasi" },
              { label: "Mesafeli Satış Söz.", href: "/mesafeli-satis" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-[11px] text-gray-500 py-0.5 cursor-pointer" data-testid={`mobile-footer-${l.href.slice(1)}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5" data-testid="mobile-ssl-badge">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-green-700 font-semibold">SSL Güvenli</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-[10px] font-bold" style={{ color: "#1a1f71" }}>VISA</span>
            <span className="text-[10px] font-bold" style={{ color: "#eb001b" }}>master<span style={{ color: "#f79e1b" }}>card</span></span>
          </div>
        </div>
        <p className="text-[9px] text-gray-400 text-center">© {new Date().getFullYear()} Sizpa İnternet Tic. Ltd. Şti.</p>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      <SEO
        title="Samsun Pet Shop - Kedi Köpek Maması Online Sipariş | JETGO"
        description="Samsun pet shop JETGO - Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri. Samsun içi aynı gün kapıya teslimat, kapıda ödeme. En uygun fiyatlarla online sipariş."
        canonical={`${SITE_DOMAIN}/`}
        jsonLd={LOCAL_BUSINESS_JSONLD}
      />
      <main className="flex-1 max-w-lg mx-auto w-full">
        <HeroCarousel />
        <QuickActions />
        <CampaignBanner />
        <CategoryGrid />
        <LocationBanner />

        <div className="mt-4">
          <PetAIChat />
        </div>

        <TrustBadges />
        <MobileFooter />
      </main>
    </div>
  );
}
