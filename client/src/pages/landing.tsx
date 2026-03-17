import { Link } from "wouter";
import { Bike, CreditCard, Banknote, Smartphone, Tag, ArrowRight } from "lucide-react";
import SEO, { LOCAL_BUSINESS_JSONLD, SITE_DOMAIN } from "@/components/SEO";
import SearchBar from "@/components/SearchBar";
import PetAIChat from "@/components/PetAIChat";

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
  { icon: Bike, text: "1 Saatte\nTeslimat", pulse: true },
  { icon: CreditCard, text: "Tüm Kartlara\n12 Ay Taksit", pulse: false },
  { icon: Banknote, text: "Kapıda Nakit\nBanka Havalesi", pulse: false },
  { icon: Smartphone, text: "Kapıda POS\nveya QR Ödeme", pulse: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
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

        <div className="px-3 pb-2" data-testid="section-hook-banner">
          <div
            className="animate-heartbeat rounded-lg py-2 px-3 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #ff6f00 0%, #ff9100 100%)" }}
          >
            <span className="text-white text-xs font-extrabold tracking-wide text-center">
              Mama Bitti Panik Yok 🚚 1 Saatte Kapında!
            </span>
          </div>
        </div>

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

        <section className="px-3 pb-2" data-testid="section-campaign-banner">
          <Link href="/kampanya">
            <div
              className="rounded-xl p-3 flex items-center gap-3 cursor-pointer shadow-sm border border-orange-200"
              style={{ background: "linear-gradient(135deg, #ff6f00 0%, #ff9100 50%, #ffa726 100%)" }}
              data-testid="banner-campaign"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-extrabold">Kampanyali Urunler</p>
                <p className="text-white/80 text-[10px] font-medium">Ozel fiyatlarla mama firsatlari!</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
            </div>
          </Link>
        </section>

        <section className="px-3 py-3" data-testid="section-features">
          <div className="grid grid-cols-4 gap-2">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-lg ${f.pulse ? "animate-heartbeat" : ""}`}
                style={{ backgroundColor: f.pulse ? "#fff3e0" : "#f0faf0" }}
                data-testid={`feature-${i}`}
              >
                <f.icon className="w-5 h-5" style={{ color: f.pulse ? "#e65100" : "#2ecc40" }} />
                <span
                  className="text-[9px] font-bold text-center leading-tight whitespace-pre-line"
                  style={{ color: f.pulse ? "#e65100" : "#333" }}
                >
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

        <PetAIChat />

        <section className="px-3 pt-2 pb-4 md:hidden" data-testid="section-mobile-footer">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-4">
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
                  <Link key={l.href} href={l.href} className="text-[11px] text-gray-500 py-1" data-testid={`mobile-footer-${l.href.slice(1)}`}>
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
                  <Link key={l.href} href={l.href} className="text-[11px] text-gray-500 py-1" data-testid={`mobile-footer-${l.href.slice(1)}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5" data-testid="mobile-ssl-badge">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[10px] text-green-700 font-semibold">SSL Güvenli</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="text-[11px] font-bold tracking-wider" style={{ color: "#1a1f71" }}>VISA</span>
                <span className="text-[11px] font-bold tracking-wider" style={{ color: "#eb001b" }}>master<span style={{ color: "#f79e1b" }}>card</span></span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-center">© {new Date().getFullYear()} Sizpa İnternet Tic. Ltd. Şti.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
