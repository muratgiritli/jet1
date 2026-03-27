import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Truck, CreditCard, Banknote, Smartphone,
  ArrowRight, ChevronRight, Star, Clock, Shield,
  Gift, MapPin, Phone, Mail, BookOpen
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import SEO, { LOCAL_BUSINESS_JSONLD, WEBSITE_JSONLD, SITE_DOMAIN } from "@/components/SEO";
import catDog from "@/assets/images/cat-dog.webp";
import catCat from "@/assets/images/cat-cat.webp";
import catBird from "@/assets/images/cat-bird.webp";
import catRabbit from "@/assets/images/cat-rabbit.webp";
import brandRoyalCanin from "@/assets/images/brands/royal-canin.webp";
import brandHills from "@/assets/images/brands/hills.webp";
import brandNd from "@/assets/images/brands/nd.webp";
import brandProPlan from "@/assets/images/brands/pro-plan.webp";
import brandReflex from "@/assets/images/brands/reflex.webp";
import brandProfine from "@/assets/images/brands/profine.webp";
import brandPronature from "@/assets/images/brands/pronature.webp";
import brandBrit from "@/assets/images/brands/brit.webp";
import brandAcana from "@/assets/images/brands/acana.webp";
import brandOrijen from "@/assets/images/brands/orijen.webp";
import brandReflexPlus from "@/assets/images/brands/reflex-plus.webp";
import brandProchoice from "@/assets/images/brands/prochoice.webp";
import brandGoody from "@/assets/images/brands/goody.webp";
import brandBonus from "@/assets/images/brands/bonus.webp";

const HERO_SLIDES = [
  {
    title: "60 Dakikada\nKapında Petshop 🐾",
    subtitle: "Samsun Atakum'da evcil dostun için her şey, bir tıkla kapında",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    badges: true,
  },
  {
    title: "Her Siparişte\n%5 Para Puan 🎁",
    subtitle: "Alışveriş yaptıkça kazan, sonraki siparişinde kullan",
    gradient: "from-indigo-500 via-violet-500 to-purple-400",
    href: "/giris",
  },
  {
    title: "Büyük\nKampanya 🎉",
    subtitle: "Mama Çeşitleri + ekstra ürün fırsatları",
    gradient: "from-purple-600 via-violet-500 to-fuchsia-400",
    href: "/kampanya",
  },
];

const CATEGORIES = [
  { name: "Köpek", img: catDog, href: "/kategori/kopek", color: "from-amber-400 to-orange-500" },
  { name: "Kedi", img: catCat, href: "/kategori/kedi", color: "from-pink-400 to-rose-500" },
  { name: "Kuş", img: catBird, href: "/kategori/kus", color: "from-sky-400 to-blue-500" },
  { name: "Kemirgen", img: catRabbit, href: "/kategori/kemirgen", color: "from-lime-400 to-green-500" },
];

const QUICK_ACTIONS = [
  { icon: Smartphone, label: "Kapıda\nQR", color: "#0284c7", bg: "bg-sky-50" },
  { icon: CreditCard, label: "Kapıda\nPos", color: "#7c3aed", bg: "bg-purple-50" },
  { icon: Banknote, label: "Kapıda\nNakit", color: "#059669", bg: "bg-emerald-50" },
  { icon: CreditCard, label: "Kredi Kartına\nKapıda 12 Taksit", color: "#ff6f00", bg: "bg-orange-50" },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[current];

  const content = (
    <div className="relative overflow-hidden rounded-2xl" data-testid="hero-carousel">
      <div
        className={`bg-gradient-to-br ${slide.gradient} p-5 md:p-8 lg:p-10 transition-all duration-700`}
        style={{ minHeight: slide.badges ? 220 : 160 }}
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white whitespace-pre-line leading-tight drop-shadow-sm">
            {slide.title}
          </h1>
          <p className="text-white/90 text-sm md:text-lg mt-2 md:mt-3 font-medium">{slide.subtitle}</p>
          {slide.badges && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[11px] md:text-xs font-bold px-2.5 md:px-3 py-1.5 rounded-full border border-white/25">
                <Truck className="w-3 h-3 md:w-3.5 md:h-3.5" /> 1 Saat Teslimat
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[11px] md:text-xs font-bold px-2.5 md:px-3 py-1.5 rounded-full border border-white/25">
                <CreditCard className="w-3 h-3 md:w-3.5 md:h-3.5" /> Kapıda Ödeme
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[11px] md:text-xs font-bold px-2.5 md:px-3 py-1.5 rounded-full border border-white/25">
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" /> Atakum İçi Aktif
              </span>
            </div>
          )}
          {!slide.badges && (
            <span className="mt-3 md:mt-5 bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-full border border-white/30 inline-flex items-center gap-1.5">
              Hemen Keşfet <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </span>
          )}
        </div>
        <div className="absolute right-3 md:right-8 bottom-2 md:bottom-4 opacity-20 text-8xl md:text-[120px] select-none pointer-events-none">
          🐾
        </div>
      </div>
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 md:w-8 bg-white" : "w-1.5 md:w-2 bg-white/40"
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

function OrderCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const getOrderCount = () => {
      const trTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
      const hour = trTime.getHours();
      const minute = trTime.getMinutes();
      const timeInMinutes = hour * 60 + minute;

      if (timeInMinutes < 600 || timeInMinutes >= 1200) return 0;

      const seed = trTime.getFullYear() * 10000 + (trTime.getMonth() + 1) * 100 + trTime.getDate();
      const rng = (n: number) => {
        let x = Math.sin(seed * 9301 + n * 49297 + 233280) * 49297;
        return x - Math.floor(x);
      };

      const elapsed = timeInMinutes - 600;
      const maxOrders = 160 + Math.round(rng(0) * 30);
      const totalMinutes = 600;

      let progress = 0;
      if (elapsed <= 60) progress = (elapsed / totalMinutes) * 0.06;
      else if (elapsed <= 240) progress = 0.06 + ((elapsed - 60) / totalMinutes) * 0.25;
      else if (elapsed <= 360) progress = 0.31 + ((elapsed - 240) / totalMinutes) * 0.30;
      else if (elapsed <= 480) progress = 0.61 + ((elapsed - 360) / totalMinutes) * 0.25;
      else progress = 0.86 + ((elapsed - 480) / totalMinutes) * 0.14;

      return Math.round(maxOrders * Math.min(progress, 1));
    };

    setCount(getOrderCount());
    const t = setInterval(() => setCount(getOrderCount()), 60000);
    return () => clearInterval(t);
  }, []);

  if (count === 0) return null;

  return (
    <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3 flex items-center gap-3" data-testid="section-order-counter">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-emerald-700 font-medium">Bugün şu ana kadar</p>
        <p className="text-lg font-extrabold text-emerald-800">
          {count}+ sipariş <span className="text-sm font-medium text-emerald-600">teslim edildi</span>
        </p>
      </div>
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
    </div>
  );
}

function QuickActions() {
  return (
    <div data-testid="section-quick-actions">
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {QUICK_ACTIONS.map((a, i) => (
          <div
            key={i}
            className={`${a.bg} rounded-xl p-2.5 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 hover:shadow-md transition-shadow`}
            data-testid={`quick-action-${i}`}
          >
            <div
              className="w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: a.color + "15" }}
            >
              <a.icon className="w-[18px] h-[18px] md:w-6 md:h-6" style={{ color: a.color }} />
            </div>
            <span
              className="text-[10px] md:text-xs font-bold text-center leading-tight whitespace-pre-line"
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
    <div data-testid="section-campaign-banner">
      <Link href="/kampanya">
        <div
          className="relative overflow-hidden rounded-xl p-3.5 md:p-5 flex items-center gap-3 cursor-pointer active:scale-[0.98] hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #6B3480 0%, #9b59b6 50%, #c39bd3 100%)" }}
          data-testid="banner-campaign"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white" />
            <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex items-center gap-3 md:gap-4 flex-1">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm md:text-lg font-extrabold">Kampanyalı Ürünler</p>
              <p className="text-white/70 text-[11px] md:text-sm mt-0.5">Ana mama + ek ürün fırsatları</p>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white/60 shrink-0" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function CategoryGrid() {
  return (
    <div data-testid="section-categories">
      <div className="flex items-center justify-between mb-3 md:mb-5">
        <h3 className="text-base md:text-xl font-extrabold text-gray-900" data-testid="text-categories-heading">Kategoriler</h3>
        <Link href="/kategori" className="text-xs md:text-sm text-orange-500 font-semibold flex items-center gap-0.5" data-testid="link-all-categories">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:gap-5" data-testid="grid-categories">
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} href={cat.href}>
            <div className="flex flex-col items-center gap-1.5 md:gap-2.5 cursor-pointer active:scale-95 hover:scale-105 transition-transform" data-testid={`card-category-${cat.name}`}>
              <div className={`w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br ${cat.color} p-[3px] md:p-1`}>
                <div className="w-full h-full rounded-[13px] md:rounded-[20px] overflow-hidden bg-white">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" loading="lazy" data-testid={`img-category-${cat.name}`} />
                </div>
              </div>
              <span className="text-xs md:text-base font-bold text-gray-800" data-testid={`text-category-name-${cat.name}`}>{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function LocationBanner() {
  return (
    <div data-testid="section-location">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 md:p-4 flex items-center gap-3 border border-emerald-100">
        <div className="relative shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="absolute inset-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wide">Teslimat Aktif</p>
          </div>
          <p className="text-xs md:text-sm font-bold text-emerald-800">Samsun Atakum'da 60 dk teslimat</p>
          <p className="text-[10px] md:text-xs text-emerald-600/70 mt-0.5">Kapıda nakit, POS ve QR ödeme</p>
        </div>
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div data-testid="section-trust">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-3.5 md:p-6">
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {[
            { icon: Clock, label: "Hızlı Teslimat", sub: "1 saat içinde", color: "#f59e0b" },
            { icon: Shield, label: "Güvenli Alışveriş", sub: "256-bit SSL", color: "#10b981" },
            { icon: Star, label: "Müşteri Memnuniyeti", sub: "4.9 puan", color: "#6366f1" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 md:gap-2 text-center">
              <div
                className="w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: b.color + "15" }}
              >
                <b.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: b.color }} />
              </div>
              <span className="text-[10px] md:text-sm font-bold text-gray-800">{b.label}</span>
              <span className="text-[9px] md:text-xs text-gray-400">{b.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileFooter() {
  return (
    <section className="hidden" data-testid="section-mobile-footer">
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

const BRANDS = [
  { name: "Royal Canin", img: brandRoyalCanin },
  { name: "Hill's", img: brandHills },
  { name: "N&D", img: brandNd },
  { name: "Pro Plan", img: brandProPlan },
  { name: "Reflex", img: brandReflex },
  { name: "Reflex Plus", img: brandReflexPlus },
  { name: "Brit", img: brandBrit },
  { name: "Acana", img: brandAcana },
  { name: "Orijen", img: brandOrijen },
  { name: "ProChoice", img: brandProchoice },
  { name: "Profine", img: brandProfine },
  { name: "Pronature", img: brandPronature },
  { name: "Goody", img: brandGoody },
  { name: "Bonus", img: brandBonus },
];

function BrandSlider() {
  return (
    <div data-testid="section-brands">
      <h3 className="text-base md:text-xl font-extrabold text-gray-900 mb-3 md:mb-4" data-testid="text-brands-heading">Markalarımız</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {BRANDS.map((brand) => (
          <div
            key={brand.name}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
            data-testid={`brand-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow bg-white flex items-center justify-center p-1.5">
              <img
                src={brand.img}
                alt={`${brand.name} - Samsun pet shop`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-gray-600 text-center w-16 md:w-20 truncate">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogPreview() {
  return (
    <div data-testid="section-blog-preview">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-xl font-extrabold text-gray-900" data-testid="text-blog-heading">Pet Bakım Rehberi</h3>
        <Link href="/blog" className="text-xs md:text-sm text-orange-500 font-semibold flex items-center gap-0.5" data-testid="link-all-blog">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: "Kedi Maması Nasıl Seçilir?", slug: "kedi-mamasi-nasil-secilir", category: "Kedi Bakımı", color: "bg-purple-100 text-purple-700" },
          { title: "Köpek Maması Seçim Rehberi", slug: "kopek-mamasi-secim-rehberi", category: "Köpek Bakımı", color: "bg-amber-100 text-amber-700" },
          { title: "Kedi Kumu Seçim Rehberi", slug: "kedi-kumu-secim-rehberi", category: "Kedi Bakımı", color: "bg-purple-100 text-purple-700" },
        ].map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer group" data-testid={`blog-preview-${post.slug}`}>
              <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${post.color}`}>{post.category}</span>
              <h4 className="text-sm font-bold mt-2 group-hover:text-[#6B3480] transition-colors">{post.title}</h4>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                <BookOpen className="w-3 h-3" />
                <span>Rehberi Oku →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RegionLinks() {
  const regions = [
    { name: "Samsun Pet Shop", href: "/samsun-petshop", desc: "Kapıya teslim hizmet" },
    { name: "Atakum Pet Shop", href: "/atakum-petshop", desc: "Aynı gün teslimat" },
    { name: "İlkadım Pet Shop", href: "/ilkadim-petshop", desc: "Hızlı teslimat" },
    { name: "Canik Pet Shop", href: "/canik-petshop", desc: "Aynı gün teslimat" },
  ];
  const categories = [
    { name: "Kedi Maması", href: "/kedi-mamasi" },
    { name: "Köpek Maması", href: "/kopek-mamasi" },
    { name: "Kedi Kumu", href: "/kedi-kumu" },
    { name: "Pet Aksesuar", href: "/pet-aksesuar" },
  ];
  return (
    <div data-testid="section-region-links">
      <h3 className="text-base md:text-xl font-extrabold text-gray-900 mb-3 md:mb-4">Bölgeler & Ürünler</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3">
        {regions.map((r) => (
          <Link key={r.href} href={r.href}>
            <div className="bg-gradient-to-br from-[#6B3480]/5 to-[#6B3480]/10 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow border border-[#6B3480]/10" data-testid={`link-region-${r.href.slice(1)}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#6B3480]" />
                <span className="text-xs md:text-sm font-bold text-gray-800">{r.name}</span>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500">{r.desc}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link key={c.href} href={c.href}>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold hover:bg-orange-100 transition-colors cursor-pointer border border-orange-100" data-testid={`link-cat-${c.href.slice(1)}`}>
              <ChevronRight className="w-3 h-3" />
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DesktopContactStrip() {
  return (
    <div className="hidden md:block" data-testid="section-desktop-contact">
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <SiWhatsapp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">WhatsApp</p>
              <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-green-600 transition-colors">Hemen yaz</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">E-posta</p>
              <a href="mailto:info@sizpa.net" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">info@sizpa.net</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      <SEO
        title="Samsun Pet Shop - Kedi Köpek Maması Online Sipariş | JETGO"
        description="Samsun pet shop JETGO - Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri. Samsun içi aynı gün kapıya teslimat, kapıda ödeme. En uygun fiyatlarla online sipariş."
        canonical={`${SITE_DOMAIN}/`}
        keywords="samsun petshop, samsun pet shop, kedi maması samsun, köpek maması samsun, kapıya teslim petshop, online pet shop samsun, kedi kumu samsun, evcil hayvan ürünleri samsun"
        jsonLd={[LOCAL_BUSINESS_JSONLD, WEBSITE_JSONLD]}
      />


      <main className="flex-1 w-full max-w-6xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="mt-2 md:mt-6">
          <HeroCarousel />
        </div>

        <div className="mt-4 md:mt-8">
          <OrderCounter />
        </div>

        <div className="mt-4 md:mt-8">
          <QuickActions />
        </div>

        <div className="mt-4 md:mt-8">
          <LocationBanner />
        </div>

        <div className="mt-5 md:mt-10">
          <CategoryGrid />
        </div>

        <div className="mt-5 md:mt-8">
          <BrandSlider />
        </div>

        <div className="mt-5 md:mt-8">
          <BlogPreview />
        </div>

        <div className="mt-5 md:mt-8">
          <TrustBadges />
        </div>

        <div className="mt-5 mb-4 md:mb-8">
          <MobileFooter />
        </div>
      </main>
    </div>
  );
}
