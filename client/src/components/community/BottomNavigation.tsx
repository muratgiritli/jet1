import { useState } from "react";
import { Home, MessagesSquare, Plus, Users, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TABS = [
  { name: "Akış", href: "/", icon: Home, testId: "nav-akis" },
  { name: "Forum", href: "/forum", icon: MessagesSquare, testId: "nav-forum" },
  { name: "+", href: "__compose", icon: Plus, testId: "nav-compose" },
  { name: "Kulüpler", href: "/kulupler", icon: Users, testId: "nav-kulupler" },
  { name: "Profil", href: "/profil", icon: User, testId: "nav-profil" },
] as const;

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { requireAuth } = useAuthPrompt();
  const [composeOpen, setComposeOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [posted, setPosted] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href === "/forum") return location === "/forum" || location.startsWith("/forum/");
    return location === href || location.startsWith(`${href}?`);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#EEEAF4]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      data-testid="community-bottom-nav"
    >
      <div className="max-w-lg mx-auto h-14 flex items-center justify-around px-1">
        {TABS.map((tab) => {
          const compose = tab.href === "__compose";
          const active = !compose && isActive(tab.href);

          if (compose) {
            return (
              <button
                key={tab.testId}
                type="button"
                onClick={() => {
                  if (requireAuth()) {
                    setPosted(false);
                    setComposeOpen(true);
                  }
                }}
                className="-mt-4 h-12 w-12 rounded-full bg-[#8E7CC3] text-white shadow-[0_6px_16px_rgba(142,124,195,0.35)] flex items-center justify-center"
                aria-label="Yeni gönderi"
                data-testid={tab.testId}
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={tab.testId}
              type="button"
              onClick={() => setLocation(tab.href)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-14 gap-0.5 ${
                active ? "text-[#8E7CC3]" : "text-[#7A7484]"
              }`}
              data-testid={tab.testId}
            >
              <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.4]" : ""}`} />
              <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-[320px] rounded-2xl p-5" data-testid="dialog-compose">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-[18px] text-[#1C1B1F]">Yeni gönderi</DialogTitle>
            <DialogDescription className="text-[13px] text-[#5F5B66]">
              Poodle’ının anını toplulukla paylaş.
            </DialogDescription>
          </DialogHeader>
          {posted ? (
            <p className="text-sm text-[#5B4B86]" data-testid="text-compose-done">
              Gönderin kuyruğa alındı. Onaydan sonra akışta görünecek.
            </p>
          ) : (
            <>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="Ne anlatmak istersin?"
                className="w-full rounded-xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 text-sm text-[#1C1B1F] placeholder:text-[#8A8494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5E8]"
                data-testid="input-compose-caption"
              />
              <button
                type="button"
                onClick={() => setPosted(true)}
                className="h-11 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold"
                data-testid="btn-compose-share"
              >
                Paylaş
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
}
