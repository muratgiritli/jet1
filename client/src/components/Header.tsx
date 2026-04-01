import { Link, useLocation } from "wouter";
import { ArrowLeft, User, LogIn, UserPlus } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";

const NAV_ITEMS = [
  { name: "Kedi", href: "/kategori/kedi" },
  { name: "Köpek", href: "/kategori/kopek" },
  { name: "Kuş", href: "/kategori/kus" },
  { name: "Kemirgen", href: "/kategori/kemirgen" },
];

export default function Header() {
  const [location] = useLocation();
  const { isLoggedIn, customer } = useCustomer();

  const isHome = location === "/";

  return (
    <>
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#6B3480" }}>
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
            <Link href="/">
              <Logo className="text-3xl" />
            </Link>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#6B3480] text-xs md:text-sm font-semibold hover:bg-white/90 transition-colors"
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

      <nav className="sticky top-[52px] z-[9998]" style={{ backgroundColor: "#7c4dff" }}>
        <div className="max-w-6xl mx-auto px-2">
          <ul className="flex items-center justify-center gap-0 md:gap-2 py-1.5 flex-wrap" data-testid="nav-categories">
            {NAV_ITEMS.map((item) => {
              const isHighlight = "highlight" in item && item.highlight;
              const isActive = location.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`px-4 md:px-6 py-1 md:py-1.5 text-sm md:text-base font-medium transition-colors rounded-lg ${
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
    </>
  );
}
