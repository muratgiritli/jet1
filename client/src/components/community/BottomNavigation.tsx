import { useState } from "react";
import { Home, MessagesSquare, Plus, Users, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { useCommunityI18n } from "@/lib/community-i18n";
import { SOCIAL_PHOTOS } from "@shared/social";
import { socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { requireAuth } = useAuthPrompt();
  const { t } = useCommunityI18n();
  const tabs = [
    { name: t("navFeed"), href: "/", icon: Home, testId: "nav-akis" },
    { name: t("navForum"), href: "/forum", icon: MessagesSquare, testId: "nav-forum" },
    { name: "+", href: "__compose", icon: Plus, testId: "nav-compose" },
    { name: t("navClubs"), href: "/kulupler", icon: Users, testId: "nav-kulupler" },
    { name: t("navProfile"), href: "/profil", icon: User, testId: "nav-profil" },
  ] as const;
  const [composeOpen, setComposeOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string>(SOCIAL_PHOTOS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href === "/forum") return location === "/forum" || location.startsWith("/forum/");
    if (href === "/kulupler") return location === "/kulupler" || location.startsWith("/kulupler/");
    if (href === "/profil") return location === "/profil" || location.startsWith("/uye/");
    return location === href || location.startsWith(`${href}?`);
  };

  const share = async () => {
    setBusy(true);
    setError("");
    try {
      await socialSend("POST", "/api/social/posts", { caption, image });
      setCaption("");
      setComposeOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      setLocation("/");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("shareFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#EEEAF4]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      data-testid="community-bottom-nav"
    >
      <div className="max-w-lg mx-auto h-14 flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const compose = tab.href === "__compose";
          const active = !compose && isActive(tab.href);

          if (compose) {
            return (
              <button
                key={tab.testId}
                type="button"
                onClick={() => {
                  if (requireAuth()) {
                    setError("");
                    setComposeOpen(true);
                  }
                }}
                className="-mt-4 h-12 w-12 rounded-full bg-[#8E7CC3] text-white shadow-[0_6px_16px_rgba(142,124,195,0.35)] flex items-center justify-center"
                aria-label={t("composeAria")}
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
              <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.6] text-[#8E7CC3]" : ""}`} />
              <span className={`text-[12px] leading-none ${active ? "font-semibold text-[#8E7CC3]" : "font-medium"}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-[320px] rounded-2xl p-5" data-testid="dialog-compose">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-[18px] text-[#1C1B1F]">{t("newPost")}</DialogTitle>
            <DialogDescription className="text-[13px] text-[#5F5B66]">
              {t("newPostHint")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-1.5">
            {SOCIAL_PHOTOS.map((photo) => (
              <button
                key={photo}
                type="button"
                onClick={() => setImage(photo)}
                className={`rounded-lg overflow-hidden ring-2 ${image === photo ? "ring-[#8E7CC3]" : "ring-transparent"}`}
              >
                <img src={photo} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder={t("captionPlaceholder")}
            className="w-full rounded-xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 text-sm text-[#1C1B1F] placeholder:text-[#8A8494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5E8]"
            data-testid="input-compose-caption"
          />
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => void share()}
            disabled={busy}
            className="h-11 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold disabled:opacity-60"
            data-testid="btn-compose-share"
          >
            {busy ? t("sharing") : t("share")}
          </button>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
