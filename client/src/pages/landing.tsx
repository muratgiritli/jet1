import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  Truck, CreditCard, Banknote, Smartphone, Building2,
  ArrowRight, ChevronRight, ChevronLeft, Star, Clock, Shield,
  Gift, MapPin, Phone, Mail, BookOpen, MessageSquare,
  PackageCheck, Zap,
  Stethoscope, ShoppingBag, Heart, Sparkles
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useCustomer } from "@/contexts/CustomerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import SEO, { LOCAL_BUSINESS_JSONLD, WEBSITE_JSONLD, SITE_DOMAIN } from "@/components/SEO";
import SignupBonusBanner from "@/components/SignupBonusBanner";
import ContactDialog from "@/components/ContactDialog";
import WelcomeCouponBanner from "@/components/WelcomeCouponBanner";
import catDog from "@/assets/images/cat-dog.webp";
import catCat from "@/assets/images/cat-cat.webp";
import catBird from "@/assets/images/cat-bird.webp";
import catRabbit from "@/assets/images/cat-rabbit.webp";
import catFish from "@assets/cat-fish.png";
import desktopHeroBanner from "@assets/B1_1776879216390.png";
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
    title: "İnternetten Bekleme\nJetgo'dan Aynı Gün Gelsin 🚀",
    subtitle: "Orijinal ürün – kapıda kontrol – anında teslim",
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
  { name: "Köpek", img: catDog, href: "/kategori/kopek", color: "from-amber-400 to-orange-500", emoji: "🐕" },
  { name: "Kedi", img: catCat, href: "/kategori/kedi", color: "from-pink-400 to-rose-500", emoji: "🐱" },
  { name: "Kuş", img: catBird, href: "/kategori/kus", color: "from-sky-400 to-blue-500", emoji: "🐦" },
  { name: "Kemirgen", img: catRabbit, href: "/kategori/kemirgen", color: "from-lime-400 to-green-500", emoji: "🐹" },
  { name: "Akvaryum", img: catFish, href: "/kategori/akvaryum", color: "from-cyan-400 to-blue-500", emoji: "🐠" },
];

const QUICK_ACTIONS = [
  { icon: Smartphone, label: "Kapıda\nQR", color: "#0284c7", bg: "bg-sky-50" },
  { icon: CreditCard, label: "Kapıda\nPos", color: "#7c3aed", bg: "bg-purple-50" },
  { icon: Banknote, label: "Kapıda\nNakit", color: "#059669", bg: "bg-emerald-50" },
  { icon: Building2, label: "Banka\nHavalesi", color: "#0369a1", bg: "bg-blue-50" },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[current];

  const content = (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl" data-testid="hero-carousel">
      <div
        className={`bg-gradient-to-br ${slide.gradient} p-4 md:p-8 lg:p-12 transition-all duration-700 flex flex-col justify-center`}
        style={{ minHeight: "clamp(140px, 20vw, 320px)" }}
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl md:text-4xl lg:text-5xl font-black text-white whitespace-pre-line leading-tight drop-shadow-sm">
            {slide.title}
          </h1>
          <p className="text-white/90 text-xs md:text-lg lg:text-xl mt-1.5 md:mt-3 font-medium line-clamp-2">{slide.subtitle}</p>
          {slide.badges && (
            <div className="flex flex-wrap gap-1 md:gap-2 mt-2 md:mt-4">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-sm font-bold px-2 md:px-4 py-1 md:py-1.5 rounded-full border border-white/25">
                <Truck className="w-3 h-3 md:w-4 md:h-4" /> Aynı Gün Teslimat
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-sm font-bold px-2 md:px-4 py-1 md:py-1.5 rounded-full border border-white/25">
                <CreditCard className="w-3 h-3 md:w-4 md:h-4" /> Kapıda Ödeme
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-sm font-bold px-2 md:px-4 py-1 md:py-1.5 rounded-full border border-white/25">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" /> Atakum İçi Aktif
              </span>
            </div>
          )}
          {!slide.badges && (
            <span className="mt-2 md:mt-4 bg-white/20 backdrop-blur-md text-white text-[11px] md:text-base font-bold px-3 md:px-6 py-1.5 md:py-2.5 rounded-full border border-white/30 inline-flex items-center gap-1.5 hover:bg-white/30 transition-colors">
              Hemen Keşfet <ArrowRight className="w-3 h-3 md:w-5 md:h-5" />
            </span>
          )}
        </div>
        <div className="absolute right-3 md:right-12 bottom-2 md:bottom-6 opacity-20 text-7xl md:text-[140px] select-none pointer-events-none">
          🐾
        </div>
      </div>
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`h-1.5 md:h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 md:w-10 bg-white" : "w-1.5 md:w-2.5 bg-white/40"
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
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/public-settings"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 30_000,
  });
  const enabled = settings?.daily_cargo_widget_enabled === "true";
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) { setCount(0); return; }
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
    <div className="rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3 md:p-5 flex items-center gap-3 md:gap-4" data-testid="section-order-counter">
      <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5 md:w-7 md:h-7 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm text-emerald-700 font-medium">Bugün şu ana kadar</p>
        <p className="text-lg md:text-2xl font-extrabold text-emerald-800">
          {count}+ sipariş <span className="text-sm md:text-base font-medium text-emerald-600">teslim edildi</span>
        </p>
      </div>
      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
    </div>
  );
}

function QuickActions() {
  return (
    <div data-testid="section-quick-actions">
      <div className="grid grid-cols-4 gap-1.5 md:gap-4">
        {QUICK_ACTIONS.map((a, i) => (
          <div
            key={i}
            className={`${a.bg} rounded-lg md:rounded-2xl p-1.5 md:p-5 flex flex-col items-center gap-1 md:gap-3 md:hover:shadow-lg md:transition-shadow md:cursor-default`}
            data-testid={`quick-action-${i}`}
          >
            <div
              className="w-7 h-7 md:w-14 md:h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: a.color + "15" }}
            >
              <a.icon className="w-3.5 h-3.5 md:w-7 md:h-7" style={{ color: a.color }} />
            </div>
            <span
              className="text-[8px] md:text-sm font-bold text-center leading-tight whitespace-pre-line"
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

type BannerItem = { id: number; title: string; imageData: string | null; linkUrl: string | null; sortOrder: number; position?: string; device?: string };

function matchesDevice(b: BannerItem, isMobile: boolean) {
  const d = b.device || "both";
  if (d === "both") return true;
  return isMobile ? d === "mobile" : d === "desktop";
}

function BannerStrip({ position, max, gridClass, testId }: { position: string; max: number; gridClass: string; testId: string }) {
  const isMobile = useIsMobile();
  const { data: banners = [] } = useQuery<BannerItem[]>({
    queryKey: ["/api/banners", position],
    queryFn: () => fetch(`/api/banners?position=${position}`).then(r => r.json()),
  });
  const items = banners.filter(b => b.imageData && matchesDevice(b, isMobile)).slice(0, max);
  if (items.length === 0) return null;
  return (
    <div className={gridClass} data-testid={testId}>
      {items.map((b) => {
        const inner = (
          <div className="relative w-full overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer" data-testid={`${testId}-${b.sortOrder}`}>
            <img src={b.imageData!} alt={b.title} className="w-full h-auto object-cover" loading="lazy" />
          </div>
        );
        const raw = (b.linkUrl || "").trim();
        if (!raw) return <div key={b.id}>{inner}</div>;
        const sameDomain = raw.match(/^https?:\/\/(www\.)?jetgomarket\.com(\/.*)?$/i);
        if (sameDomain) {
          const path = sameDomain[2] || "/";
          return <Link key={b.id} href={path}>{inner}</Link>;
        }
        if (/^https?:\/\//i.test(raw)) {
          return <a key={b.id} href={raw} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>;
        }
        return <Link key={b.id} href={raw}>{inner}</Link>;
      })}
    </div>
  );
}

function HomeBanners() {
  return <BannerStrip position="home_top" max={2} gridClass="grid grid-cols-1 md:grid-cols-2 gap-0.5 md:gap-1" testId="section-home-banners" />;
}

function HomeBannersBelowCategory() {
  return <BannerStrip position="home_below_category" max={4} gridClass="grid grid-cols-1 md:grid-cols-2 gap-0.5 md:gap-1" testId="section-home-banners-below" />;
}

function HomeBottomCarousel() {
  const isMobile = useIsMobile();
  const { data: banners = [] } = useQuery<BannerItem[]>({
    queryKey: ["/api/banners", "home_bottom_carousel"],
    queryFn: () => fetch(`/api/banners?position=home_bottom_carousel`).then(r => r.json()),
  });
  const items = banners.filter(b => b.imageData && matchesDevice(b, isMobile));
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  useEffect(() => { if (idx >= items.length) setIdx(0); }, [items.length, idx]);
  if (items.length === 0) return null;
  const current = items[idx];
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) next(); else prev();
    }
    touchStartX.current = null;
  };

  const rawLinkRaw = (current.linkUrl || "").trim();
  const sameDomainMatch = rawLinkRaw.match(/^https?:\/\/(www\.)?jetgomarket\.com(\/.*)?$/i);
  const rawLink = sameDomainMatch ? (sameDomainMatch[2] || "/") : rawLinkRaw;
  const isExternal = !sameDomainMatch && /^https?:\/\//i.test(rawLink);
  const hasLink = rawLink.length > 0;

  const imageEl = (
    <img
      src={current.imageData!}
      alt={current.title}
      className="w-full h-auto object-cover block select-none pointer-events-none"
      loading="lazy"
      draggable={false}
      data-testid={`bottom-banner-${current.sortOrder}`}
    />
  );

  const buyButton = (
    <span
      className="absolute left-1/2 bottom-3 md:bottom-4 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-purple-700 text-xs md:text-sm font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-full shadow-md inline-flex items-center gap-1.5 hover:bg-white transition-colors"
      data-testid={`button-buy-${current.sortOrder}`}
    >
      <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
      Satın Al
      <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
    </span>
  );

  const wrapWithLink = (children: React.ReactNode) => {
    if (!hasLink) return children;
    if (isExternal) {
      return (
        <a
          href={rawLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
          data-testid={`link-bottom-banner-${current.sortOrder}`}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={rawLink} className="block w-full" data-testid={`link-bottom-banner-${current.sortOrder}`}>
        {children}
      </Link>
    );
  };

  return (
    <div data-testid="section-home-bottom-carousel">
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-gray-50 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {wrapWithLink(
          <div className="relative cursor-pointer">
            {imageEl}
            {hasLink && buyButton}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          onClick={prev}
          disabled={items.length < 2}
          className="flex items-center gap-1 bg-white border-2 border-purple-300 text-purple-700 text-sm font-bold px-3 py-2 rounded-full shadow disabled:opacity-40"
          data-testid="button-bottom-prev"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={3} /> Önceki
        </button>

        <div className="flex items-center gap-1.5">
          {items.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? "w-6 h-2 bg-purple-600" : "w-2 h-2 bg-gray-300"}`}
              data-testid={`bottom-dot-${i}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={items.length < 2}
          className="flex items-center gap-1 bg-purple-600 text-white text-sm font-extrabold px-3 py-2 rounded-full shadow disabled:opacity-40"
          data-testid="button-bottom-next"
        >
          Sonraki <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function CampaignBanner() {
  return (
    <div data-testid="section-campaign-banner">
      <Link href="/kampanya">
        <div
          className="relative overflow-hidden rounded-xl md:rounded-2xl p-3.5 md:p-6 flex items-center gap-3 md:gap-5 cursor-pointer active:scale-[0.98] hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(135deg, #6B3480 0%, #9b59b6 50%, #c39bd3 100%)" }}
          data-testid="banner-campaign"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -right-6 -top-6 w-24 md:w-40 h-24 md:h-40 rounded-full bg-white" />
            <div className="absolute -left-4 -bottom-4 w-16 md:w-28 h-16 md:h-28 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex items-center gap-3 md:gap-5 flex-1">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm md:text-xl font-extrabold">Kampanyalı Ürünler</p>
              <p className="text-yellow-300 text-[11px] md:text-base mt-0.5 font-bold">Alış fiyatına ürünler</p>
            </div>
            <ChevronRight className="w-5 h-5 md:w-7 md:h-7 text-white/60 shrink-0" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function CategoryGrid() {
  return (
    <div data-testid="section-categories">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h3 className="text-base md:text-2xl font-extrabold text-gray-900" data-testid="text-categories-heading">Kategoriler</h3>
        <Link href="/kategori" className="text-xs md:text-sm text-orange-500 font-semibold flex items-center gap-0.5 hover:text-orange-600 transition-colors" data-testid="link-all-categories">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-6 md:grid-cols-5 gap-2.5 md:gap-5" data-testid="grid-categories">
        {CATEGORIES.map((cat, idx) => {
          const animal = cat.href.split("/").pop() || "";
          const prefetchCategory = () => {
            import("@/pages/category");
            queryClient.prefetchQuery({ queryKey: ["/api/subcategories", animal], queryFn: () => fetch(`/api/subcategories/${animal}`).then(r => r.json()) });
          };
          const mobileSpan = idx < 2 ? "col-span-3" : "col-span-2";
          return (
            <Link key={cat.name} href={cat.href} className={`${mobileSpan} md:col-span-1`}>
              <div
                className="flex flex-col items-center gap-1.5 md:gap-3 cursor-pointer active:scale-95 md:hover:scale-105 transition-transform group"
                data-testid={`card-category-${cat.name}`}
                onTouchStart={prefetchCategory}
                onMouseEnter={prefetchCategory}
              >
                <div className={`w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br ${cat.color} p-[3px] md:p-1 md:shadow-lg md:group-hover:shadow-xl transition-shadow`}>
                  <div className="w-full h-full rounded-[13px] md:rounded-[20px] overflow-hidden bg-white">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" loading="lazy" data-testid={`img-category-${cat.name}`} />
                  </div>
                </div>
                <span className="text-xs md:text-base font-bold text-gray-800" data-testid={`text-category-name-${cat.name}`}>{cat.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SokakCanlariBanner() {
  return (
    <div className="my-4 md:my-6" data-testid="section-sokak-banner">
      <Link href="/sokak-canlari">
        <a className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow active:scale-[0.99] md:hover:scale-[1.005] transition-transform" data-testid="link-sokak-canlari">
          <img
            src={new URL("@assets/CUVAL_MAMA_1778678246834.png", import.meta.url).href}
            alt="Sokak Canları için Çuval Mama Kampanyası"
            className="w-full h-auto block"
            loading="lazy"
          />
        </a>
      </Link>
    </div>
  );
}

interface BreedBannerItem { image: string; link: string; alt: string; enabled?: boolean }
interface BreedBannersData {
  enabled: boolean;
  b1: BreedBannerItem; b2: BreedBannerItem; b3: BreedBannerItem; b4: BreedBannerItem;
  b5: BreedBannerItem; b6: BreedBannerItem;
  b7: BreedBannerItem; b8: BreedBannerItem;
  b9: BreedBannerItem; b10: BreedBannerItem;
}
function BreedBannersRow() {
  const { data } = useQuery<BreedBannersData>({ queryKey: ["/api/public/breed-banners"] });
  if (data && !data.enabled) return null;
  const defaults = [
    { img: new URL("@assets/maltase_1778698301344.png", import.meta.url).href, alt: "Maltese Özel Mamaları", href: "/kategori/kopek/maltese-mamalari" },
    { img: new URL("@assets/poodle_1778698301344.png", import.meta.url).href, alt: "Toy Poodle Özel Mamaları", href: "/kategori/kopek/toy-poodle-mamalari" },
    { img: new URL("@assets/CAVALIER_KING_1778699500262.png", import.meta.url).href, alt: "Cavalier King Charles Özel Mamaları", href: "/kategori/kopek/cavalier-king-charles-mamalari" },
    { img: new URL("@assets/SHIH_TZU_1778699500263.png", import.meta.url).href, alt: "Shih Tzu Özel Mamaları", href: "/kategori/kopek/shih-tzu-mamalari" },
    { img: new URL("@assets/CHIU_1778700169348.png", import.meta.url).href, alt: "Chihuahua Özel Mamaları", href: "/kategori/kopek/chihuahua-mamalari" },
    { img: new URL("@assets/PEKINESE_1778700169348.png", import.meta.url).href, alt: "Pekinese Özel Mamaları", href: "/kategori/kopek/pekinese-mamalari" },
    { img: new URL("@assets/1PUG_1778700278187.png", import.meta.url).href, alt: "Pug Özel Mamaları", href: "/kategori/kopek/pug-mamalari" },
    { img: new URL("@assets/1TERRIER_1778700278188.png", import.meta.url).href, alt: "Yorkshire Terrier Özel Mamaları", href: "/kategori/kopek/yorkshire-terrier-mamalari" },
    { img: new URL("@assets/2COCKER_1778700290439.png", import.meta.url).href, alt: "Cocker Spaniel Özel Mamaları", href: "/kategori/kopek/cocker-spaniel-mamalari" },
    { img: new URL("@assets/2POMERAİN_1778700290440.png", import.meta.url).href, alt: "Pomeranian Özel Mamaları", href: "/kategori/kopek/pomeranian-mamalari" },
  ];
  const slots: BreedBannerItem[] = data ? [data.b1, data.b2, data.b3, data.b4, data.b5, data.b6, data.b7, data.b8, data.b9, data.b10] : [];
  const breeds = defaults
    .map((d, i) => ({
      img: slots[i]?.image || d.img,
      alt: slots[i]?.alt || d.alt,
      href: slots[i]?.link || d.href,
      enabled: slots[i] ? slots[i].enabled !== false : true,
      testid: `link-breed-${i + 1}`,
    }))
    .filter(b => b.enabled);
  if (breeds.length === 0) return null;
  return (
    <div className="my-4 md:my-6 grid grid-cols-2 gap-2 md:gap-4" data-testid="section-breed-banners">
      {breeds.map((b, i) => (
        <Link key={i} href={b.href}>
          <a
            className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow active:scale-[0.99] md:hover:scale-[1.01] transition-transform"
            data-testid={b.testid}
          >
            <img src={b.img} alt={b.alt} className="w-full h-auto block" loading="lazy" />
          </a>
        </Link>
      ))}
    </div>
  );
}

function VeterinerMamaBanner() {
  return (
    <div className="my-4 md:my-6" data-testid="section-veteriner-banner">
      <Link href="/kategori/veteriner">
        <a className="block rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow active:scale-[0.99] md:hover:scale-[1.005] transition-transform" data-testid="link-veteriner-mama">
          <img
            src={new URL("@assets/veteriner_mama-web_1778689310732.webp", import.meta.url).href}
            alt="Veteriner Mamaları - Güvenilir Markalar"
            className="w-full h-auto block"
            loading="lazy"
          />
        </a>
      </Link>
    </div>
  );
}

function WhyJetgo() {
  const items = [
    { emoji: "🚚", title: "1 Saat İçinde Kapında", desc: "Sipariş ver, 1 saat içinde kapına gelsin. İnternetten günlerce bekleme derdi yok.", color: "#f59e0b", bg: "from-amber-50 to-orange-50", border: "border-amber-200" },
    { emoji: "💳", title: "Esnek Ödeme Seçenekleri", desc: "Kapıda nakit ödeme, POS cihazı ile kart, QR ile ödeme, banka havalesi. Sana hangisi uygunsa öyle öde.", color: "#6B3480", bg: "from-purple-50 to-fuchsia-50", border: "border-purple-200" },
    { emoji: "📅", title: "Son Kullanma Tarihini Görerek Al", desc: "Tüm mamalarda son kullanma tarihini gör. Güvenle, gönül rahatlığıyla alışveriş yap.", color: "#10b981", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200" },
  ];

  return (
    <div data-testid="section-why-jetgo">
      <h3 className="text-base md:text-2xl font-extrabold text-gray-900 mb-3 md:mb-6">Neden Jetgo?</h3>
      <div className="space-y-2.5 md:hidden">
        {items.map((item, i) => (
          <div key={i} className={`bg-gradient-to-r ${item.bg} rounded-xl p-3 flex items-center gap-3 border ${item.border}`} data-testid={`why-jetgo-${i}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ backgroundColor: item.color + "15" }}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">{item.title}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:grid md:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.bg} rounded-2xl p-6 border ${item.border} hover:shadow-lg transition-shadow group`} data-testid={`why-jetgo-desktop-${i}`}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl" style={{ backgroundColor: item.color + "15" }}>
              {item.emoji}
            </div>
            <p className="text-base font-bold text-gray-800 mb-1.5">{item.title}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileFooter() {
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  return (
    <section className="md:hidden" data-testid="section-mobile-footer">
      <ContactDialog open={mobileContactOpen} onOpenChange={setMobileContactOpen} />
      <div className="bg-gray-900 rounded-xl p-4 space-y-4 text-gray-300">
        <div>
          <h4 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-400" />
            Müşteri Hizmetleri
          </h4>
          <div className="space-y-1.5">
            {[
              { label: "Sıkça Sorulan Sorular", href: "/sss" },
              { label: "İşlem Rehberi", href: "/islem-rehberi" },
              { label: "Teslimat ve İade Şartları", href: "/teslimat-iade" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2 text-[12px] text-gray-300 hover:text-white py-1 cursor-pointer transition-colors" data-testid={`mobile-footer-${l.href.slice(1)}`}>
                <ChevronRight className="w-3 h-3 text-gray-500" />
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-3">
          <Link href="/iletisim" className="text-sm font-bold text-white mb-2.5 flex items-center gap-2 hover:underline" data-testid="mobile-footer-iletisim">
            <MapPin className="w-4 h-4 text-emerald-400" />
            İletişim
          </Link>
          <div className="space-y-2">
            <div className="flex items-start gap-2 ml-6">
              <span className="text-[11px] text-gray-400 leading-relaxed">Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun</span>
            </div>
            <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 ml-6 text-[12px] text-green-400 hover:text-green-300 transition-colors" data-testid="mobile-footer-whatsapp">
              <SiWhatsapp className="w-3.5 h-3.5" />
              WhatsApp ile ulaşın
            </a>
            <button
              type="button"
              onClick={() => setMobileContactOpen(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-extrabold text-sm py-2.5 px-3 rounded-lg transition-colors shadow-md"
              data-testid="mobile-footer-iletisime-gec"
            >
              <MessageSquare className="w-4 h-4" />
              İletişime Geç
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5" data-testid="mobile-ssl-badge">
            <Shield className="w-3 h-3 text-green-500" />
            <span className="text-[9px] text-green-400 font-semibold">SSL Güvenli</span>
          </div>
          <p className="text-[9px] text-gray-500">© {new Date().getFullYear()} Sizpa İnternet Tic. Ltd. Şti.</p>
        </div>
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
      <h3 className="text-base md:text-2xl font-extrabold text-gray-900 mb-3 md:mb-6" data-testid="text-brands-heading">Markalarımız</h3>
      <div className="flex gap-3 md:hidden overflow-x-auto pb-2 scrollbar-hide">
        {BRANDS.map((brand) => (
          <div key={brand.name} className="flex flex-col items-center gap-1.5 shrink-0 group" data-testid={`brand-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow bg-white flex items-center justify-center p-1.5">
              <img src={brand.img} alt={`${brand.name} - Samsun pet shop`} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600 text-center w-16 truncate">{brand.name}</span>
          </div>
        ))}
      </div>
      <div className="hidden md:grid md:grid-cols-7 gap-4">
        {BRANDS.map((brand) => (
          <div key={brand.name} className="flex flex-col items-center gap-2.5 group" data-testid={`brand-desktop-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center p-3 hover:shadow-lg hover:border-gray-200 transition-all cursor-default">
              <img src={brand.img} alt={`${brand.name} - Samsun pet shop`} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className="text-xs font-semibold text-gray-600 text-center truncate w-full">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogPreview() {
  return (
    <div data-testid="section-blog-preview">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h3 className="text-base md:text-2xl font-extrabold text-gray-900" data-testid="text-blog-heading">Pet Bakım Rehberi</h3>
        <Link href="/blog" className="text-xs md:text-sm text-orange-500 font-semibold flex items-center gap-0.5 hover:text-orange-600 transition-colors" data-testid="link-all-blog">
          Tümü <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        {[
          { title: "Kedi Maması Nasıl Seçilir?", slug: "kedi-mamasi-nasil-secilir", category: "Kedi Bakımı", color: "bg-purple-100 text-purple-700", desc: "Yaşına, cinsine ve sağlık durumuna göre en doğru mama seçimi rehberi." },
          { title: "Köpek Maması Seçim Rehberi", slug: "kopek-mamasi-secim-rehberi", category: "Köpek Bakımı", color: "bg-amber-100 text-amber-700", desc: "Köpeğinizin yaşına ve boyutuna uygun mama seçimi için kapsamlı rehber." },
          { title: "Kedi Kumu Seçim Rehberi", slug: "kedi-kumu-secim-rehberi", category: "Kedi Bakımı", color: "bg-purple-100 text-purple-700", desc: "Topaklaşan, silika ve doğal kum çeşitleri arasında doğru seçim yapın." },
        ].map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full" data-testid={`blog-preview-${post.slug}`}>
              <span className={`text-[9px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full ${post.color}`}>{post.category}</span>
              <h4 className="text-sm md:text-lg font-bold mt-2 md:mt-3 group-hover:text-[#6B3480] transition-colors">{post.title}</h4>
              <p className="hidden md:block text-sm text-gray-500 mt-2 leading-relaxed">{post.desc}</p>
              <div className="flex items-center gap-1 mt-2 md:mt-4 text-[10px] md:text-sm text-gray-400 group-hover:text-[#6B3480] transition-colors">
                <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
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
      <h3 className="text-base md:text-2xl font-extrabold text-gray-900 mb-3 md:mb-6">Bölgeler & Ürünler</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-5">
        {regions.map((r) => (
          <Link key={r.href} href={r.href}>
            <div className="bg-gradient-to-br from-[#6B3480]/5 to-[#6B3480]/10 rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer hover:shadow-md transition-shadow border border-[#6B3480]/10 h-full" data-testid={`link-region-${r.href.slice(1)}`}>
              <div className="flex items-center gap-1.5 mb-1 md:mb-2">
                <MapPin className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#6B3480]" />
                <span className="text-xs md:text-base font-bold text-gray-800">{r.name}</span>
              </div>
              <span className="text-[10px] md:text-sm text-gray-500">{r.desc}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {categories.map((c) => (
          <Link key={c.href} href={c.href}>
            <span className="inline-flex items-center gap-1 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full bg-orange-50 text-orange-600 text-xs md:text-sm font-semibold hover:bg-orange-100 transition-colors cursor-pointer border border-orange-100" data-testid={`link-cat-${c.href.slice(1)}`}>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DesktopDeliveryInfo() {
  return (
    <div className="hidden md:block" data-testid="section-desktop-delivery">
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-emerald-500 animate-ping opacity-20"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">Teslimat Aktif</p>
            </div>
            <p className="text-lg font-bold text-emerald-800">Samsun Atakum'da aynı gün teslimat</p>
            <p className="text-sm text-emerald-600/70 mt-1">Kapıda nakit, POS ve QR ödeme seçenekleri</p>
          </div>
          <Link href="/kampanya">
            <span className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2" data-testid="btn-desktop-shop-now">
              <ShoppingBag className="w-4 h-4" />
              Alışverişe Başla
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DesktopContactStrip() {
  return (
    <div className="hidden md:block" data-testid="section-desktop-contact">
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <SiWhatsapp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">WhatsApp</p>
              <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-green-600 transition-colors">Hemen yaz</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">E-posta</p>
              <a href="mailto:info@sizpa.com" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">info@sizpa.com</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[#6B3480]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Adres</p>
              <p className="text-sm text-gray-500">Atakum, Samsun</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopStatsBar() {
  return (
    <div className="hidden md:grid md:grid-cols-4 gap-5" data-testid="section-stats-bar">
      {[
        { icon: ShoppingBag, value: "900+", label: "Ürün Çeşidi", color: "#6B3480", bg: "bg-purple-50" },
        { icon: Truck, value: "Aynı Gün", label: "Teslimat", color: "#059669", bg: "bg-emerald-50" },
        { icon: Star, value: "%5", label: "Para Puan", color: "#f59e0b", bg: "bg-amber-50" },
        { icon: Shield, value: "Güvenli", label: "Ödeme", color: "#2563eb", bg: "bg-blue-50" },
      ].map((stat, i) => (
        <div key={i} className={`${stat.bg} rounded-2xl p-5 flex items-center gap-4 border border-transparent hover:border-gray-200 transition-colors`}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + "15" }}>
            <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyCargoWidget() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/public-settings"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 30_000,
  });
  const enabled = settings?.daily_cargo_widget_enabled === "true";
  const { data } = useQuery<{ count: number }>({
    queryKey: ["/api/public/daily-cargo-count"],
    enabled,
    refetchInterval: 60_000,
  });
  if (!enabled) return null;
  const count = data?.count ?? 0;
  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 md:px-4 md:py-3"
      data-testid="widget-daily-cargo"
    >
      <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        <PackageCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-700" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] md:text-xs text-gray-500 leading-tight">Bugün şu ana kadar</div>
        <div className="text-sm md:text-base font-extrabold text-emerald-800 leading-tight mt-0.5" data-testid="text-daily-cargo-count">
          {count}+ sipariş teslim edildi
        </div>
      </div>
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function WelcomeBonusPopup() {
  const { isLoggedIn } = useCustomer();
  const [open, setOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoggedIn) return;
    if (sessionStorage.getItem("welcome_bonus_dismissed") === "1") return;
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (standalone) setCanInstall(false);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!open) return null;

  const close = () => {
    try { sessionStorage.setItem("welcome_bonus_dismissed", "1"); } catch {}
    setOpen(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      try {
        await deferredPrompt.current.prompt();
        await deferredPrompt.current.userChoice;
      } catch {}
      deferredPrompt.current = null;
      setCanInstall(false);
    }
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={close}
      data-testid="popup-welcome-bonus-backdrop"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-2xl border-2 border-orange-200"
        onClick={e => e.stopPropagation()}
        data-testid="popup-welcome-bonus"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 z-10"
          aria-label="Kapat"
          data-testid="button-close-welcome-bonus"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <div className="mb-1 inline-block rounded-full bg-orange-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-700">
            Hoş Geldin Hediyesi
          </div>
          <h3 className="mb-1 text-2xl font-extrabold text-gray-900" data-testid="text-welcome-bonus-amount">
            100 TL BONUS
          </h3>
          <p className="text-sm font-semibold text-gray-800">
            Hemen Üye Ol & Uygulamayı İndir
          </p>
          <div className="my-3 flex items-center justify-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">✓</span>
              Şart Yok
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">✓</span>
              Hemen Kullan
            </span>
          </div>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Link
              href="/giris"
              onClick={close}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-extrabold text-white shadow-md hover:from-orange-600 hover:to-amber-600 transition"
              data-testid="button-welcome-bonus-signup"
            >
              HEMEN ÜYE OL — 100 TL AL
            </Link>
            {canInstall && (
              <button
                type="button"
                onClick={handleInstall}
                className="w-full rounded-xl border-2 border-orange-500 bg-white py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition"
                data-testid="button-welcome-bonus-install"
              >
                📲 Uygulamayı İndir
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="text-[11px] text-gray-500 hover:text-gray-700 mt-1"
              data-testid="button-welcome-bonus-later"
            >
              Daha sonra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isLoggedIn } = useCustomer();
  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      <SEO
        title="Atakum Petshop & Samsun Pet Shop - Aynı Gün Teslimat | JETGO"
        description="Atakum, Samsun, İlkadım, Canik, Tekkeköy'e aynı gün petshop teslimatı. Kedi maması, köpek maması, kedi kumu, ödül maması kapıda ödeme. JETGO Pet Shop Samsun: 09:00-21:00 hizmet, +90 850 840 39 59. Mahalleye en yakın petshop."
        keywords="atakum petshop, samsun petshop, samsun pet shop, atakum pet shop, samsun kedi maması, samsun köpek maması, samsun kedi kumu, atakum aynı gün petshop teslimatı, samsun acil kedi kumu, ilkadım petshop, canik petshop, tekkeköy petshop, kapıda ödeme petshop samsun, denizevleri petshop, güzelyalı petshop, kurupelit petshop, atakent petshop, mimar sinan petshop"
        canonical={`${SITE_DOMAIN}/`}
        jsonLd={[LOCAL_BUSINESS_JSONLD, WEBSITE_JSONLD]}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        {/* MOBILE-ONLY: welcome coupon banner for logged-in users */}
        {isLoggedIn && (
          <div className="mt-2 md:hidden">
            <WelcomeCouponBanner />
          </div>
        )}

        {/* DESKTOP/TABLET: promo banner image directly under header */}
        <div className="hidden md:block mt-6">
          <img
            src={desktopHeroBanner}
            alt="Petshop'a gitmeden 1 saatte kapında - Atakum içi 1 saatte teslim"
            className="w-full h-auto rounded-2xl shadow-md"
            loading="eager"
            data-testid="img-desktop-hero-banner"
          />
        </div>

        <div className="mt-1 md:hidden">
          <HomeBanners />
        </div>

        {/* CATEGORIES: mobile untouched; desktop centered & narrower so cards aren't gigantic */}
        <div className="mt-1 md:mt-10">
          <div className="md:max-w-4xl md:mx-auto">
            <CategoryGrid />
          </div>
        </div>

        <div className="md:max-w-5xl md:mx-auto">
          <SokakCanlariBanner />
          <BreedBannersRow />
          <VeterinerMamaBanner />
        </div>

        {/* DESKTOP STATS BAR */}
        <div className="hidden md:block mt-10">
          <DesktopStatsBar />
        </div>

        {/* ORDER COUNTER: mobile full-width; desktop centered */}
        <div className="mt-3 md:mt-10">
          <div className="md:max-w-3xl md:mx-auto">
            <OrderCounter />
          </div>
        </div>

        <div className="mt-1 md:hidden">
          <HomeBannersBelowCategory />
        </div>

        {/* WHY JETGO – desktop benefits row */}
        <div className="hidden md:block mt-12">
          <WhyJetgo />
        </div>

        <div className="hidden md:block mt-12">
          <BlogPreview />
        </div>

        <div className="hidden md:block mt-12">
          <RegionLinks />
        </div>

        <div className="mt-5 md:mt-12">
          <DesktopContactStrip />
        </div>

        <div className="mt-5 md:hidden">
          <HomeBottomCarousel />
        </div>
      </main>
    </div>
  );
}
