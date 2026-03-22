import { lazy, Suspense } from "react";
import { useParams, Link } from "wouter";
import { getSeoPageBySlug, getRelatedPages, SEO_PAGES, type SeoPage } from "@/lib/seo-pages";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import { MapPin, Truck, Clock, Phone, ShoppingCart, Home, ChevronRight, Star, Shield, Zap, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

function generateArticleContent(page: SeoPage): { sections: { title: string; content: string }[] } {
  const loc = page.neighborhood ? `${page.neighborhood} mahallesi (${page.district})` : `${page.district}`;
  const locShort = page.neighborhood || page.district;
  const locFull = page.neighborhood ? `${page.district} ${page.neighborhood}` : page.district;
  const isSamsun = page.district === "Samsun" && !page.neighborhood;

  const sections = [
    {
      title: `${locShort} Pet Shop Kapıda Teslim Hizmeti`,
      content: `${locFull} bölgesinde yaşayan evcil hayvan sahipleri için JETGO Pet Shop olarak kapıda teslim hizmeti sunuyoruz. ${loc} ve çevresine aynı gün teslimat garantisi ile kedi maması, köpek maması, kedi kumu ve tüm evcil hayvan ürünlerini kapınıza kadar getiriyoruz. Artık ${locShort}'da pet shop aramak, ağır mama poşetlerini taşımak zorunda değilsiniz. WhatsApp üzerinden kolayca sipariş verin, biz kapınıza getirelim.`
    },
    {
      title: `${locShort} Kedi Maması ve Köpek Maması Siparişi`,
      content: `${locFull} bölgesine Royal Canin, ProPlan, N&D, Acana, Orijen, Reflex ve daha birçok premium marka kedi maması ve köpek maması teslim ediyoruz. ${locShort}'da en uygun fiyatlarla mama siparişi verebilirsiniz. Kuru mama, yaş mama, yavru mama, kısırlaştırılmış mama ve diyet mama çeşitlerimizle evcil hayvanınızın beslenme ihtiyaçlarını eksiksiz karşılıyoruz. ${isSamsun ? "Samsun genelinde" : `${loc}'deki`} tüm müşterilerimize ücretsiz kargo fırsatı sunuyoruz.`
    },
    {
      title: `${locShort} Kedi Kumu ve Evcil Hayvan Ürünleri`,
      content: `Kedi kumu çeşitlerimiz arasında topaklaşan kum, silika kum, doğal kum ve kokusuz kum seçenekleri bulunmaktadır. ${locFull} bölgesine ağır kedi kumlarını taşıma derdi olmadan kapınıza teslim ediyoruz. Bunun yanı sıra kedi ve köpek oyuncakları, tasma ve gezdirme ürünleri, mama ve su kapları, yataklar, kafesler, kuş yemi, kemirgen yemi ve tüm evcil hayvan bakım ürünlerini de bulabilirsiniz.`
    },
    {
      title: `Neden ${locShort}'da JETGO Pet Shop'u Tercih Etmelisiniz?`,
      content: `JETGO Pet Shop, ${isSamsun ? "Samsun" : page.district} bölgesinin en güvenilir ve en hızlı online pet shop'udur. 900'den fazla ürün çeşidi, uygun fiyat garantisi ve aynı gün kapıda teslim hizmeti ile ${loc} sakinlerine kesintisiz hizmet veriyoruz. WhatsApp üzerinden 7/24 sipariş alıyoruz. Kapıda nakit veya kredi kartı ile ödeme yapabilirsiniz. Taksitli ödeme seçeneklerimiz de mevcuttur. Para Puan sistemi ile her alışverişinizde puan kazanın, bir sonraki siparişinizde kullanın.`
    },
    {
      title: `${locShort} Hızlı Pet Shop Teslimat Bölgeleri`,
      content: `${locFull} ve çevresindeki tüm mahallelere hızlı teslimat yapıyoruz. ${page.district === "Atakum" ? "Denizevleri, Güzelyalı, Kurupelit, Atakent, Yeni Mahalle, İncesu, Balaç, Çakırlar, Mimar Sinan, Körfez, Soğuksu ve Taflan" : page.district === "İlkadım" ? "Kadıköy, Rasathane, Kılıçdede, Kalkancı, Baruthane ve Ulugazi" : page.district === "Canik" ? "Karşıyaka, Gaziosmanpaşa, Yenimahalle ve Kuzeyyıldızı" : page.district === "Tekkeköy" ? "19 Mayıs ve Sanayi bölgeleri" : "Atakum, İlkadım, Canik ve Tekkeköy ilçeleri"} başta olmak üzere geniş bir teslimat ağına sahibiz. Minimum sipariş tutarı ve kargo ücreti mahalle bazında değişiklik gösterebilir.`
    },
    {
      title: `${locShort} Online Pet Shop Sipariş Nasıl Verilir?`,
      content: `${locFull}'dan JETGO Pet Shop'a sipariş vermek çok kolay! Sitemizden istediğiniz ürünleri sepetinize ekleyin, teslimat bilgilerinizi girin ve WhatsApp üzerinden siparişinizi onaylayın. Aynı gün içinde ürünleriniz kapınıza teslim edilir. Hızlı sipariş için WhatsApp hattımızı kullanabilir veya doğrudan sitemizden alışveriş yapabilirsiniz. ${isSamsun ? "Samsun" : page.district} genelinde güvenli ve hızlı teslimat garantisi veriyoruz.`
    },
  ];

  return { sections };
}

function SeoTopBar() {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#6B3480] to-[#8B5A9E] text-white shadow-lg" data-testid="seo-top-bar">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/20 gap-2 font-semibold" data-testid="btn-homepage">
            <Home className="w-4 h-4" />
            Ana Sayfa
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/kategori">
            <Button variant="ghost" className="text-white hover:bg-white/20 gap-2 text-sm" data-testid="btn-categories">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Ürünler</span>
            </Button>
          </Link>
          <Link href="/odeme">
            <Button className="bg-white text-[#6B3480] hover:bg-gray-100 gap-2 font-bold shadow" data-testid="btn-order">
              <ShoppingCart className="w-4 h-4" />
              Sipariş Ver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCards() {
  const features = [
    { icon: Truck, title: "Kapıda Teslim", desc: "Aynı gün kapınıza teslim" },
    { icon: Clock, title: "Hızlı Teslimat", desc: "Sipariş verin, hemen gelsin" },
    { icon: Shield, title: "Güvenli Ödeme", desc: "Kapıda nakit veya kart" },
    { icon: Star, title: "900+ Ürün", desc: "En geniş ürün yelpazesi" },
    { icon: Heart, title: "Para Puan", desc: "%5 kazanç her alışverişte" },
    { icon: Zap, title: "WhatsApp Sipariş", desc: "7/24 kolay sipariş" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 my-8">
      {features.map((f, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow" data-testid={`feature-card-${i}`}>
          <f.icon className="w-8 h-8 text-[#6B3480] mx-auto mb-2" />
          <h3 className="font-bold text-sm text-gray-900">{f.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

function Breadcrumb({ page }: { page: SeoPage }) {
  const crumbs = [
    { label: "Ana Sayfa", href: "/" },
    ...(page.neighborhood ? [{ label: `${page.district} Pet Shop`, href: `/${SEO_PAGES.find(p => p.district === page.district && !p.neighborhood)?.slug || "samsun-petshop"}` }] : []),
    { label: page.neighborhood ? `${page.neighborhood} Pet Shop` : `${page.district} Pet Shop`, href: `/${page.slug}` },
  ];

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap" data-testid="breadcrumb">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {i < crumbs.length - 1 ? (
            <Link href={c.href} className="hover:text-[#6B3480] transition-colors">{c.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function RelatedLinks({ currentSlug }: { currentSlug: string }) {
  const related = getRelatedPages(currentSlug);
  if (related.length === 0) return null;

  const current = getSeoPageBySlug(currentSlug);
  const sameDistrict = related.filter(p => p.district === current?.district);
  const otherDistrict = related.filter(p => p.district !== current?.district);

  return (
    <div className="mt-10 mb-8">
      {sameDistrict.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6B3480]" />
            {current?.district} Diğer Mahalle Pet Shop Sayfaları
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sameDistrict.map(p => (
              <Link key={p.slug} href={`/${p.slug}`}>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-[#6B3480] hover:bg-purple-50 transition-all cursor-pointer" data-testid={`link-${p.slug}`}>
                  <ChevronRight className="w-4 h-4 text-[#6B3480] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{p.h1}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {otherDistrict.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6B3480]" />
            Diğer Bölge Pet Shop Sayfaları
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {otherDistrict.map(p => (
              <Link key={p.slug} href={`/${p.slug}`}>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-[#6B3480] hover:bg-purple-50 transition-all cursor-pointer" data-testid={`link-${p.slug}`}>
                  <ChevronRight className="w-4 h-4 text-[#6B3480] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{p.h1}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryLinks() {
  const categories = [
    { label: "Köpek Ürünleri", href: "/kategori/kopek", icon: "🐕" },
    { label: "Kedi Ürünleri", href: "/kategori/kedi", icon: "🐱" },
    { label: "Kuş Ürünleri", href: "/kategori/kus", icon: "🐦" },
    { label: "Kemirgen Ürünleri", href: "/kategori/kemirgen", icon: "🐹" },
    { label: "Kampanyalı Ürünler", href: "/kampanya", icon: "🔥" },
  ];

  return (
    <div className="my-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Ürün Kategorileri</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map(c => (
          <Link key={c.href} href={c.href}>
            <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer border border-gray-100" data-testid={`cat-link-${c.href.replace(/\//g, "-")}`}>
              <span className="text-2xl block mb-1">{c.icon}</span>
              <span className="text-xs font-medium text-gray-700">{c.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CTASection({ page }: { page: SeoPage }) {
  const loc = page.neighborhood || page.district;
  return (
    <div className="my-8 bg-gradient-to-r from-[#6B3480] to-[#8B5A9E] rounded-xl p-6 md:p-8 text-white text-center">
      <h2 className="text-xl md:text-2xl font-bold mb-3">{loc} Pet Shop Siparişi Hemen Verin!</h2>
      <p className="text-white/80 mb-5 text-sm md:text-base">WhatsApp'tan veya sitemizden kolayca sipariş verin, aynı gün kapınıza teslim edelim.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer">
          <Button className="bg-green-500 hover:bg-green-600 text-white gap-2 font-bold px-6 py-3" data-testid="btn-whatsapp">
            <Phone className="w-4 h-4" />
            WhatsApp Sipariş
          </Button>
        </a>
        <Link href="/kategori">
          <Button className="bg-white text-[#6B3480] hover:bg-gray-100 gap-2 font-bold px-6 py-3" data-testid="btn-browse">
            <ShoppingCart className="w-4 h-4" />
            Ürünleri İncele
          </Button>
        </Link>
      </div>
    </div>
  );
}

function FAQSection({ page }: { page: SeoPage }) {
  const loc = page.neighborhood ? `${page.neighborhood} (${page.district})` : page.district;
  const locShort = page.neighborhood || page.district;

  const faqs = [
    { q: `${locShort}'da pet shop kapıda teslim var mı?`, a: `Evet, JETGO Pet Shop olarak ${loc} bölgesine aynı gün kapıda teslim hizmeti sunuyoruz. WhatsApp'tan veya sitemizden sipariş verebilirsiniz.` },
    { q: `${locShort}'a mama siparişi ne kadar sürede gelir?`, a: `${loc} bölgesine siparişler genellikle aynı gün içinde teslim edilmektedir. Sipariş yoğunluğuna göre teslimat süresi değişebilir.` },
    { q: `${locShort} pet shop minimum sipariş tutarı nedir?`, a: `Minimum sipariş tutarı mahallenize göre değişmektedir. Sipariş sırasında mahalle seçiminize göre minimum tutar ve kargo ücreti otomatik olarak hesaplanır.` },
    { q: `${locShort}'da hangi mama markaları bulunuyor?`, a: `Royal Canin, ProPlan, N&D, Acana, Orijen, Reflex, Brit, Gimcat, Felix ve daha birçok premium marka mama çeşidimiz bulunmaktadır.` },
  ];

  return (
    <div className="my-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{locShort} Pet Shop Sıkça Sorulan Sorular</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4" data-testid={`faq-${i}`}>
            <h3 className="font-semibold text-gray-900 text-sm mb-2">{faq.q}</h3>
            <p className="text-sm text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getSeoPageBySlug(slug) : undefined;

  if (!page) {
    const NotFound = lazy(() => import("@/pages/not-found"));
    return <Suspense fallback={null}><NotFound /></Suspense>;
  }

  const { sections } = generateArticleContent(page);
  const loc = page.neighborhood || page.district;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": SITE_DOMAIN },
      ...(page.neighborhood ? [{ "@type": "ListItem", "position": 2, "name": `${page.district} Pet Shop`, "item": `${SITE_DOMAIN}/${SEO_PAGES.find(p => p.district === page.district && !p.neighborhood)?.slug || "samsun-petshop"}` }] : []),
      { "@type": "ListItem", "position": page.neighborhood ? 3 : 2, "name": `${loc} Pet Shop`, "item": `${SITE_DOMAIN}/${page.slug}` },
    ]
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    "name": `JETGO Pet Shop ${loc}`,
    "description": page.description,
    "url": `${SITE_DOMAIN}/${page.slug}`,
    "telephone": "+908508403959",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": page.district,
      "addressRegion": "Samsun",
      "addressCountry": "TR"
    },
    "areaServed": {
      "@type": "Place",
      "name": `${loc}, Samsun`
    },
    "priceRange": "₺₺",
    "openingHours": "Mo-Su 09:00-21:00",
    "paymentAccepted": "Nakit, Kredi Kartı",
    "currenciesAccepted": "TRY"
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${loc}'da pet shop kapıda teslim var mı?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Evet, JETGO Pet Shop olarak ${loc} bölgesine aynı gün kapıda teslim hizmeti sunuyoruz.` }
      },
      {
        "@type": "Question",
        "name": `${loc}'a mama siparişi ne kadar sürede gelir?`,
        "acceptedAnswer": { "@type": "Answer", "text": `${loc} bölgesine siparişler genellikle aynı gün içinde teslim edilmektedir.` }
      },
    ]
  };

  return (
    <>
      <SEO
        title={page.title}
        description={page.description}
        canonical={`${SITE_DOMAIN}/${page.slug}`}
        keywords={page.keywords.join(", ")}
        jsonLd={[breadcrumbJsonLd, localBusinessJsonLd, faqJsonLd]}
      />
      <SeoTopBar />
      <article className="max-w-3xl mx-auto px-4 py-6 pb-28">
        <Breadcrumb page={page} />

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2" data-testid="seo-h1">{page.h1}</h1>
        <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {page.neighborhood ? `${page.district}, ${page.neighborhood} - Samsun` : `${page.district}, Samsun`}
        </p>

        <FeatureCards />

        {sections.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">{section.content}</p>
          </section>
        ))}

        <CTASection page={page} />
        <CategoryLinks />
        <FAQSection page={page} />
        <RelatedLinks currentSlug={page.slug} />

        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
          <p>JETGO Pet Shop - Sizpa İnternet Tic. Ltd. Şti. | Atakum, Samsun</p>
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            <Link href="/hakkimizda" className="hover:text-[#6B3480]">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-[#6B3480]">İletişim</Link>
            <Link href="/teslimat-iade" className="hover:text-[#6B3480]">Teslimat</Link>
            <Link href="/sss" className="hover:text-[#6B3480]">SSS</Link>
            <Link href="/kvkk" className="hover:text-[#6B3480]">KVKK</Link>
          </div>
        </div>
      </article>
    </>
  );
}
