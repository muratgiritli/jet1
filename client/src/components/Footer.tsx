import { Link } from "wouter";
import { Phone, Mail, MapPin, HelpCircle, FileText, Shield, Cookie, BookOpen, Info } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const FOOTER_LINKS = [
  { label: "Sıkça Sorulan Sorular", href: "/sss", icon: HelpCircle },
  { label: "Kişisel Verilerin Korunması", href: "/kvkk", icon: Shield },
  { label: "Gizlilik Politikası", href: "/gizlilik", icon: FileText },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari", icon: BookOpen },
  { label: "Çerez Politikası", href: "/cerez-politikasi", icon: Cookie },
  { label: "İşlem Rehberi", href: "/islem-rehberi", icon: Info },
];

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-900 text-gray-300 mt-8" data-testid="footer-desktop">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Yardıma mı ihtiyacın var?</h3>
            <p className="text-gray-400 text-sm mb-4">Sorularınız için bize ulaşabilirsiniz.</p>
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
            <Link href="/hakkimizda" className="text-white font-bold text-lg mb-4 block hover:underline" data-testid="footer-hakkimizda">Hakkımızda</Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-3">
              Sizpa İnternet Tic. Ltd. Şti. olarak Samsun'da evcil hayvan ürünleri alanında hizmet vermekteyiz. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat ile her zaman yanınızdayız.
            </p>
            <p className="text-xs text-gray-500 font-medium">Sizpa İnternet Tic. Ltd. Şti.</p>
          </div>

          <div>
            <Link href="/iletisim" className="text-white font-bold text-lg mb-4 block hover:underline" data-testid="footer-iletisim">İletişim</Link>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</span>
              </li>
              <li>
                <a href="tel:+908508403959" className="flex items-center gap-2.5 text-sm hover:text-white transition-colors" data-testid="footer-phone">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  +90 850 840 3959
                </a>
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
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex items-center justify-between">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Sizpa İnternet Tic. Ltd. Şti. Tüm hakları saklıdır.</p>
          <p className="text-xs text-gray-500">JETGO - Samsun Pet Shop</p>
        </div>
      </div>
    </footer>
  );
}
