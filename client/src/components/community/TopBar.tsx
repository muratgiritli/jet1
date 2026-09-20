import { Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCustomer } from "@/contexts/CustomerContext";

export default function TopBar() {
  const { isLoggedIn } = useCustomer();
  const [, setLocation] = useLocation();

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EEEAF4]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      data-testid="community-topbar"
    >
      <div className="h-12 px-3 flex items-center gap-2 max-w-lg mx-auto">
        <Link href="/" className="flex items-center gap-1.5 min-w-0 shrink" data-testid="link-logo">
          <span className="w-7 h-7 rounded-full overflow-hidden bg-[#F3EFFA] shrink-0 ring-1 ring-[#D9D0EC]">
            <img src="/assets/poodle-face.jpg" alt="" className="w-full h-full object-cover" />
          </span>
          <span className="text-[16px] font-extrabold tracking-tight text-[#1C1B1F] truncate">
            Your<span className="text-[#8E7CC3]">Poodle</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setLocation("/ara")}
          className="ml-auto h-9 w-9 rounded-full flex items-center justify-center text-[#3F3A4A] hover:bg-[#F6F3FB]"
          aria-label="Ara"
          data-testid="btn-search"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
        {isLoggedIn ? (
          <Link
            href="/profil"
            className="h-8 px-3 rounded-full bg-[#F6F3FB] text-[#5B4B86] text-xs font-semibold flex items-center"
            data-testid="btn-topbar-profile"
          >
            Profil
          </Link>
        ) : (
          <Link
            href="/giris?redirect=/"
            className="h-8 px-3 rounded-full bg-[#8E7CC3] text-white text-xs font-semibold flex items-center"
            data-testid="btn-guest-login"
          >
            Giriş
          </Link>
        )}
      </div>
    </header>
  );
}
