import { Link, useLocation } from "wouter";
import { ArrowLeft, User, LogIn, UserPlus, Store } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useCustomer } from "@/contexts/CustomerContext";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import { CURRENT_STORE } from "@/lib/store";

const NAV_ITEMS = [
  { name: "Kedi", href: "/kategori/kedi" },
  { name: "Köpek", href: "/kategori/kopek" },
  { name: "Kuş", href: "/kategori/kus" },
  { name: "Kemirgen", href: "/kategori/kemirgen" },
  { name: "Akvaryum", href: "/kategori/akvaryum" },
  { name: "Veteriner", href: "/kategori/veteriner" },
];

export default function Header() {
  const [location] = useLocation();
  const { isLoggedIn, customer } = useCustomer();

  const isHome = location === "/";
  const whatsappDigits = CURRENT_STORE.phone.replace(/\D/g, "");

  return (
    <>
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: CURRENT_STORE.theme.topBar }}>
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button
                onClick={() => window.history.back()}
                className="text-white/80 hover:text-white transition-colors p-1 md:hidden"
                data-testid="btn-header-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Logo className="text-3xl" linkTo="/" />
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/hesabim">
                <button
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  data-testid="btn-header-account"
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">
                    Hesabım
                  </span>
                </button>
              </Link>
            ) : (
              <>
                <Link href="/giris">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs md:text-sm font-medium transition-colors"
                    data-testid="btn-header-login"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Giriş Yap</span>
                  </button>
                </Link>
                <Link href="/giris?tab=register">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs md:text-sm font-semibold hover:bg-white/90 transition-colors"
                    style={{ color: CURRENT_STORE.theme.topBar }}
                    data-testid="btn-header-register"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Üye Ol</span>
                    <span className="sm:hidden">Üye Ol</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="sticky top-[52px] z-[9998]" style={{ backgroundColor: CURRENT_STORE.theme.navBar }}>
        <div className="max-w-6xl mx-auto px-3 md:px-4">
          <ul className="flex items-center justify-start gap-0.5 md:gap-2 py-1 md:py-1.5 flex-nowrap whitespace-nowrap" data-testid="nav-categories">
            {NAV_ITEMS.map((item) => {
              const isHighlight = "highlight" in item && item.highlight;
              const isActive = location.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`px-1 md:px-6 py-0.5 md:py-1.5 text-[15px] md:text-base font-semibold transition-colors rounded-md md:rounded-lg ${
                      isHighlight
                        ? `font-bold animate-pulse ${isActive ? "bg-yellow-400 text-gray-900" : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"}`
                        : `text-white/90 hover:text-white hover:bg-white/10 ${isActive ? "text-white bg-white/15 font-semibold" : ""}`
                    }`}
                    data-testid={`nav-link-${item.name}`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-2 flex items-center justify-center gap-2 md:gap-3 flex-nowrap">
          <a
            href="https://www.enuygun.pet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-5 py-1.5 md:py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-[11px] md:text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
            data-testid="btn-header-physical-store"
          >
            <Store className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="md:hidden">Fiziki Mağaza</span>
            <span className="hidden md:inline">FİZİKİ MAĞAZAMIZA GİT</span>
          </a>
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-5 py-1.5 md:py-2 rounded-full bg-white border border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-800 text-[11px] md:text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
            data-testid="btn-header-whatsapp"
          >
            <SiWhatsapp className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600 shrink-0" />
            <span className="md:hidden">{CURRENT_STORE.phoneDisplay}</span>
            <span className="hidden md:inline">WHATSAPP: {CURRENT_STORE.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </>
  );
}
