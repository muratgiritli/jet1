import { Link, useRoute } from "wouter";
import { MapPin, Truck, Phone, ChevronRight, Star, ShieldCheck, Clock, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO, { SITE_DOMAIN, BREADCRUMB_JSONLD, FAQ_JSONLD, LOCAL_BUSINESS_JSONLD } from "@/components/SEO";
import { SEO_PAGES, type SeoPageData } from "@/lib/seo-data";
import NotFound from "@/pages/not-found";

function SeoPageContent({ page }: { page: SeoPageData }) {
  const breadcrumbs = [
    { name: "Ana Sayfa", url: SITE_DOMAIN },
    ...(page.type === "district" || page.type === "mahalle-block"
      ? [{ name: "Samsun Pet Shop", url: `${SITE_DOMAIN}/samsun-petshop` }]
      : []),
    { name: page.title, url: `${SITE_DOMAIN}/${page.slug}` },
  ];

  const jsonLd = [
    BREADCRUMB_JSONLD(breadcrumbs),
    FAQ_JSONLD(page.faq.map(f => ({ question: f.q, answer: f.a }))),
    LOCAL_BUSINESS_JSONLD,
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={page.metaTitle}
        description={page.metaDescription}
        canonical={`${SITE_DOMAIN}/${page.slug}`}
        keywords={page.keywords}
        jsonLd={jsonLd}
      />

      <div className="bg-gradient-to-br from-[#6B3480] to-[#7c4dff] text-white py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center gap-1 text-xs text-white/70 mb-4 flex-wrap" data-testid="breadcrumb">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            {page.type === "district" || page.type === "mahalle-block" ? (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href="/samsun-petshop" className="hover:text-white">Samsun Pet Shop</Link>
              </>
            ) : null}
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{page.title}</span>
          </nav>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4" data-testid="seo-h1">{page.h1}</h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">{page.intro[0]}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {page.type === "core" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Package, label: "900+ Ürün", desc: "Geniş ürün yelpazesi" },
              { icon: Truck, label: "Aynı Gün", desc: "Hızlı teslimat" },
              { icon: Star, label: "Para Puan", desc: "%5 geri kazanım" },
              { icon: ShieldCheck, label: "Güvenli", desc: "Kapıda ödeme" },
            ].map((item) => (
              <Card key={item.label} className="text-center">
                <CardContent className="p-4">
                  <item.icon className="w-6 h-6 mx-auto mb-2 text-[#6B3480]" />
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <section>
          {page.intro.slice(1).map((p, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
        </section>

        {page.features && page.features.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4" data-testid="seo-h2-features">
              {page.type === "blog" ? "Marka Detayları" : page.type === "category" ? "Markalar ve Ürünler" : "Hizmetlerimiz"}
            </h2>
            <div className="grid gap-3">
              {page.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-[#6B3480]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronRight className="w-3.5 h-3.5 text-[#6B3480]" />
                  </div>
                  <p className="text-sm text-muted-foreground">{f}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {page.mahalleler && page.mahalleler.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4" data-testid="seo-h2-mahalleler">
              <MapPin className="w-5 h-5 inline mr-2 text-[#6B3480]" />
              Teslimat Yapılan {page.type === "mahalle-block" ? "Mahalleler" : "Bölgeler"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {page.mahalleler.map((m) => (
                <div key={m} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-[#6B3480] shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {page.type === "core" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Bölge Pet Shop Sayfaları</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: "Atakum Pet Shop", href: "/atakum-petshop", desc: "Denizevleri, Güzelyalı, Kurupelit" },
                { name: "İlkadım Pet Shop", href: "/ilkadim-petshop", desc: "Kadıköy, Rasathane, Kılıçdede" },
                { name: "Canik Pet Shop", href: "/canik-petshop", desc: "Karşıyaka, Gaziosmanpaşa" },
              ].map((d) => (
                <Link key={d.href} href={d.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-1">{d.name}</h3>
                      <p className="text-xs text-muted-foreground">{d.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4" data-testid="seo-h2-faq">Sıkça Sorulan Sorular</h2>
          <div className="space-y-3">
            {page.faq.map((item, i) => (
              <details key={i} className="group border rounded-lg overflow-hidden" data-testid={`faq-${i}`}>
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-sm hover:bg-muted/50 transition-colors">
                  {item.q}
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-2" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">İlgili Sayfalar</h2>
          <div className="flex flex-wrap gap-2">
            {page.internalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#6B3480]/10 text-[#6B3480] text-sm font-medium hover:bg-[#6B3480]/20 transition-colors cursor-pointer">
                  <ChevronRight className="w-3 h-3" />
                  {link.text}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#6B3480] to-[#7c4dff] rounded-2xl p-6 md:p-8 text-white text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Hemen Sipariş Verin!</h2>
          <p className="text-sm text-white/80 mb-5 max-w-md mx-auto">
            900'den fazla ürün, aynı gün teslimat, nakit ödemede avantajlı fiyat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/kategori/kedi">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto" data-testid="cta-kedi">
                Kedi Ürünleri
              </Button>
            </Link>
            <Link href="/kategori/kopek">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto" data-testid="cta-kopek">
                Köpek Ürünleri
              </Button>
            </Link>
            <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" data-testid="cta-whatsapp">
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp Sipariş
              </Button>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SeoPage() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug;
  const page = SEO_PAGES.find((p) => p.slug === slug);

  if (!page) {
    return <NotFound />;
  }

  return <SeoPageContent page={page} />;
}
