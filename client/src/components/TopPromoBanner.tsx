import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { X, Download } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import defaultBanner from "@assets/ust_banner_1778677072320.png";

type TopBanner = { enabled: boolean; image: string; link: string };

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type GuideType = null | "ios-safari" | "ios-other-browser" | "desktop-no-prompt";

export default function TopPromoBanner() {
  const { isLoggedIn } = useCustomer();
  const { data } = useQuery<TopBanner>({ queryKey: ["/api/public/top-banner"] });
  const [closed, setClosed] = useState(false);

  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [guide, setGuide] = useState<GuideType>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("topBannerClosed") === "1") setClosed(true);

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(ios);
    setIsIOSSafari(ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(ua));
    if (ios) setCanInstall(true);

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isLoggedIn || !data || !data.enabled || closed || isStandalone) return null;

  const img = data.image || defaultBanner;
  const link = data.link || "/giris";

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isIOS) {
      setGuide(isIOSSafari ? "ios-safari" : "ios-other-browser");
      return;
    }
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") {
        setClosed(true);
        sessionStorage.setItem("topBannerClosed", "1");
      }
      deferredPrompt.current = null;
    } else {
      setGuide("desktop-no-prompt");
    }
  };

  const handleClose = () => {
    setClosed(true);
    sessionStorage.setItem("topBannerClosed", "1");
  };

  return (
    <>
      <div className="relative w-full bg-black" data-testid="banner-top-promo">
        <Link href={link}>
          <a className="block w-full max-w-7xl mx-auto">
            <img
              src={img}
              alt="Yeni üye olana 100 TL bonus"
              className="w-full h-auto block cursor-pointer"
              loading="eager"
            />
          </a>
        </Link>

        {canInstall && (
          <button
            type="button"
            onClick={handleInstall}
            className="absolute bottom-1.5 right-1.5 md:bottom-3 md:right-3 flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg bg-white text-[#6B3480] text-[10px] md:text-xs font-bold shadow-lg active:scale-95 transition-transform"
            data-testid="btn-install-from-banner"
          >
            <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>Uygulamayı İndir</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
          aria-label="Kapat"
          data-testid="button-close-top-banner"
        >
          <X className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>

      {guide && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50"
          onClick={() => setGuide(null)}
          data-testid="install-guide-modal"
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl px-5 pt-6 sm:m-4 space-y-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {guide === "ios-safari" && (
              <>
                <h4 className="text-base font-bold text-gray-900 text-center">Ana Ekrana Ekle</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">1.</span> Safari'de alt barda{" "}
                    <span className="inline-block text-lg leading-none align-middle">⬆</span>{" "}
                    (Paylaş) butonuna dokunun
                  </p>
                  <p>
                    <span className="font-semibold">2.</span> Aşağı kaydırıp{" "}
                    <span className="font-semibold">"Ana Ekrana Ekle"</span> seçeneğini bulun
                  </p>
                  <p>
                    <span className="font-semibold">3.</span>{" "}
                    <span className="font-semibold">"Ekle"</span> butonuna dokunun
                  </p>
                </div>
              </>
            )}

            {guide === "ios-other-browser" && (
              <>
                <h4 className="text-base font-bold text-gray-900 text-center">
                  Safari'de Açmanız Gerekiyor
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    iPhone'da uygulama indirmek için <span className="font-semibold">Safari</span>{" "}
                    tarayıcısı kullanılmalı. Şu an Chrome / başka tarayıcı kullanıyorsunuz.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[13px]">
                    <p className="font-semibold mb-1">Yapılacaklar:</p>
                    <p>1. Bu sayfayı Safari'de açın</p>
                    <p>
                      2. Adres çubuğuna{" "}
                      <span className="font-mono font-semibold">jetgomarket.com</span> yazın
                    </p>
                    <p>3. Alt menüden Paylaş → Ana Ekrana Ekle</p>
                  </div>
                </div>
              </>
            )}

            {guide === "desktop-no-prompt" && (
              <>
                <h4 className="text-base font-bold text-gray-900 text-center">
                  Tarayıcı Adres Çubuğundan Yükleyin
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    Chrome / Edge kullanıyorsanız adres çubuğunun sağ tarafındaki{" "}
                    <span className="font-semibold">yükle ikonu</span>na tıklayarak masaüstüne app
                    olarak kurabilirsiniz.
                  </p>
                  <p className="text-xs text-gray-500">
                    İkon görünmüyorsa: Tarayıcı menüsü (⋮) → "JETGO'yu Yükle" / "Install JETGO"
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setGuide(null)}
              className="w-full py-2.5 rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: "#6B3480" }}
              data-testid="btn-close-install-guide"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
