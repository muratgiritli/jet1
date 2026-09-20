import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthPromptContextValue = {
  requireAuth: () => boolean;
  openAuthPrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function useAuthPrompt() {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) {
    throw new Error("useAuthPrompt must be used within AuthPromptProvider");
  }
  return ctx;
}

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSocialAuth();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const openAuthPrompt = useCallback(() => setOpen(true), []);

  const requireAuth = useCallback(() => {
    if (isLoggedIn) return true;
    setOpen(true);
    return false;
  }, [isLoggedIn]);

  const go = (href: string) => {
    setOpen(false);
    setLocation(href);
  };

  const redirect = encodeURIComponent(location || "/");

  return (
    <AuthPromptContext.Provider value={{ requireAuth, openAuthPrompt }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[320px] rounded-2xl p-5" data-testid="dialog-auth-prompt">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-[18px] text-[#1C1B1F]">YourPoodle'a katıl</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-[#5F5B66]">
              Beğenmek, yorum yapmak, kaydetmek veya paylaşmak için giriş yapın ya da üye olun.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={() => go(`/yp-giris?redirect=${redirect}`)}
              className="h-11 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold"
              data-testid="btn-auth-login"
            >
              Giriş yap
            </button>
            <button
              type="button"
              onClick={() => go(`/yp-giris?tab=register&redirect=${redirect}`)}
              className="h-11 rounded-full border border-[#D9D0EC] bg-[#F6F3FB] text-[#5B4B86] text-sm font-semibold"
              data-testid="btn-auth-register"
            >
              Üye ol
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthPromptContext.Provider>
  );
}
