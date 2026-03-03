import { Link, useLocation } from "wouter";
import { ArrowLeft, User, UserPlus } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import Logo from "@/components/Logo";

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
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center relative">
          {!isHome && (
            <button
              onClick={() => window.history.back()}
              className="absolute left-3 text-white/80 hover:text-white transition-colors p-1"
              data-testid="btn-header-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Logo className="text-3xl" />
          <Link href={isLoggedIn ? "/hesabim" : "/giris"} className="absolute right-4">
            <button
              className="flex flex-col items-center justify-center text-white/80 hover:text-white transition-colors"
              data-testid="btn-header-auth"
            >
              <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                {isLoggedIn ? (
                  <User className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </div>
              <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">
                {isLoggedIn ? (customer?.name?.split(" ")[0] || "Hesabım") : "Giriş"}
              </span>
            </button>
          </Link>
        </div>
      </header>

      <nav className="sticky top-[52px] z-[9998]" style={{ backgroundColor: "#7c4dff" }}>
        <div className="max-w-lg mx-auto px-2">
          <ul className="flex items-center justify-center gap-0 py-1.5 flex-wrap" data-testid="nav-categories">
            {NAV_ITEMS.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="px-4 py-1 text-sm font-medium text-white/90"
                  data-testid={`nav-link-${item.name}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
