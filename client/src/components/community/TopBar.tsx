import { Bell, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useSocialAuth } from "@/contexts/SocialAuthContext";

export default function TopBar() {
  const { isLoggedIn, unread } = useSocialAuth();
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
            href="/bildirimler"
            className="relative h-9 w-9 rounded-full flex items-center justify-center text-[#3F3A4A] hover:bg-[#F6F3FB]"
            aria-label="Bildirimler"
            data-testid="btn-notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#8E7CC3] text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/yp-giris?redirect=/"
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
