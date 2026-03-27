import { Link } from "wouter";
import { Phone, Mail, MapPin, HelpCircle, FileText, Shield, Cookie, BookOpen, Info, Truck, Lock, ShieldCheck, ScrollText } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiFacebook } from "react-icons/si";

const FOOTER_LINKS_COL1 = [
  { label: "Sıkça Sorulan Sorular", href: "/sss", icon: HelpCircle },
  { label: "İşlem Rehberi", href: "/islem-rehberi", icon: Info },
  { label: "Teslimat ve İade Şartları", href: "/teslimat-iade", icon: Truck },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis", icon: ScrollText },
];

const FOOTER_LINKS_COL2 = [
  { label: "Kişisel Verilerin Korunması", href: "/kvkk", icon: Shield },
  { label: "Gizlilik Politikası", href: "/gizlilik", icon: FileText },
  { label: "Gizlilik Sözleşmesi", href: "/gizlilik-sozlesmesi", icon: Lock },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari", icon: BookOpen },
  { label: "Çerez Politikası", href: "/cerez-politikasi", icon: Cookie },
];

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-900 text-gray-300 mt-8" data-testid="footer-desktop">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Müşteri Hizmetleri</h3>
            <p className="text-gray-400 text-sm mb-4">Sorularınız için bize ulaşın</p>
            <ul className="space-y-2">
              {FOOTER_LINKS_COL1.map((link) => {
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
            <h3 className="text-white font-bold text-lg mb-1">Yasal</h3>
            <p className="text-gray-400 text-sm mb-4">Sözleşme ve politikalar</p>
            <ul className="space-y-2">
              {FOOTER_LINKS_COL2.map((link) => {
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
            <Link href="/hakkimizda" className="text-white font-bold text-lg mb-4 block hover:underline" data-testid="footer-hakkimizda">Hakkımızda</Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-3">
              Samsun'da evcil hayvan ürünleri, hızlı teslimat ve uygun fiyatlarla yanınızdayız.
            </p>
            <p className="text-xs text-gray-500 font-medium">Sizpa İnternet Tic. Ltd. Şti.</p>
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
                <a href="mailto:info@sizpa.net" className="flex items-center gap-2.5 text-sm hover:text-white transition-colors" data-testid="footer-email">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  info@sizpa.net
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.instagram.com/jetgo.pet" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center transition-all" data-testid="footer-instagram">
                <SiInstagram className="w-4.5 h-4.5 text-gray-300" />
              </a>
              <a href="https://www.facebook.com/jetgo.pet" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all" data-testid="footer-facebook">
                <SiFacebook className="w-4.5 h-4.5 text-gray-300" />
              </a>
              <a href="https://wa.me/908508403959" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-all" data-testid="footer-whatsapp-icon">
                <SiWhatsapp className="w-4.5 h-4.5 text-gray-300" />
              </a>
            </div>
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
            <p className="text-xs text-gray-500">Bu web sitesi, <a href="https://www.sizpa.net/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors underline">Sizpa Yazılım</a> tarafından tasarlanmış ve geliştirilmiştir.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
