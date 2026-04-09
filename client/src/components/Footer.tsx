import { Link } from "wouter";
import { Phone, Mail, MapPin, HelpCircle, FileText, Shield, Cookie, BookOpen, Info, Truck, Lock, ShieldCheck, ScrollText, Gift, ChevronRight } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const FOOTER_LINKS = [
  { label: "Sıkça Sorulan Sorular", href: "/sss", icon: HelpCircle },
  { label: "İşlem Rehberi", href: "/islem-rehberi", icon: Info },
  { label: "Teslimat ve İade Şartları", href: "/teslimat-iade", icon: Truck },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis", icon: ScrollText },
];

const LEGAL_LINKS = [
  { label: "Gizlilik Politikası", href: "/gizlilik", icon: Shield },
  { label: "Çerez Politikası", href: "/cerez-politikasi", icon: Cookie },
  { label: "KVKK Sözleşmesi", href: "/kvkk", icon: Lock },
  { label: "Hakkımızda", href: "/hakkimizda", icon: BookOpen },
  { label: "İletişim", href: "/iletisim", icon: Mail },
];

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-900 text-gray-300 mt-8" data-testid="footer-desktop">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-4 gap-10">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Müşteri Hizmetleri</h3>
            <p className="text-gray-400 text-sm mb-4">Sorularınız için bize ulaşın</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href} className="flex items-center gap-2 text-sm hover:text-white transition-colors" data-testid={`footer-link-${link.href.slice(1)}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kurumsal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href} className="flex items-center gap-2 text-sm hover:text-white transition-colors" data-testid={`footer-link-${link.href.slice(1)}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <Link href="/iletisim" className="text-white font-bold text-lg mb-4 block hover:underline" data-testid="footer-iletisim">İletişim</Link>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun</span>
              </li>
              <li>
                <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm hover:text-green-400 transition-colors" data-testid="footer-whatsapp">
                  <SiWhatsapp className="w-4 h-4 flex-shrink-0 text-green-500" />
                  WhatsApp ile ulaşın
                </a>
              </li>
              <li>
                <a href="mailto:info@sizpa.com" className="flex items-center gap-2.5 text-sm hover:text-white transition-colors" data-testid="footer-email">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  info@sizpa.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kampanya</h3>
            <Link href="/kampanya">
              <div className="bg-gradient-to-br from-[#6B3480] to-[#9b59b6] rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer group" data-testid="footer-campaign-link">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold">Kampanyalı Ürünler</p>
                    <p className="text-white/60 text-xs mt-0.5">Ana mama + ek ürün fırsatları</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 pb-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            {[
              { label: "Samsun Pet Shop", href: "/samsun-petshop" },
              { label: "Atakum Pet Shop", href: "/atakum-petshop" },
              { label: "İlkadım Pet Shop", href: "/ilkadim-petshop" },
              { label: "Canik Pet Shop", href: "/canik-petshop" },
              { label: "Kedi Maması", href: "/kedi-mamasi" },
              { label: "Köpek Maması", href: "/kopek-mamasi" },
              { label: "Kedi Kumu", href: "/kedi-kumu" },
              { label: "Pet Aksesuar", href: "/pet-aksesuar" },
              { label: "En İyi Kedi Maması", href: "/kedi-mamasi-en-iyi-markalar" },
              { label: "Köpek Maması Fiyatları", href: "/kopek-mamasi-fiyatlari" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-gray-500 hover:text-white transition-colors" data-testid={`footer-seo-${l.href.slice(1)}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Sizpa İnternet Tic. Ltd. Şti. Tüm hakları saklıdır.</p>

            <div className="flex items-center gap-4" data-testid="footer-badges">
              <div className="flex items-center gap-1.5 bg-gray-800 rounded px-2.5 py-1.5" data-testid="footer-ssl-badge">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] text-green-400 font-semibold">SSL</span>
                <span className="text-[10px] text-gray-400">Güvenli Bağlantı</span>
              </div>

              <img
                src="/iyzico-band-white.png"
                alt="iyzico ile öde - Visa, Mastercard, American Express, Troy"
                className="h-5 object-contain"
                data-testid="footer-iyzico-band"
              />
            </div>

            <p className="text-xs text-gray-500">JETGO - Samsun Pet Shop</p>
            <p className="text-xs text-gray-500">Bu web sitesi, <a href="https://www.sizpa.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors underline">Sizpa Yazılım</a> tarafından tasarlanmış ve geliştirilmiştir.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
