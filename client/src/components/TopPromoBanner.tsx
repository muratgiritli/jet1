import { useState, useEffect, useRef } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type GuideType = null | "ios-safari" | "ios-other-browser" | "desktop-no-prompt";

export default function TopPromoBanner() {
  const [closed, setClosed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [guide, setGuide] = useState<GuideType>(null);

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

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (closed || isStandalone) return null;

  const handleInstall = async () => {
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
      <div
        className="relative w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(110deg, #8B0000 0%, #C81E1E 45%, #E63946 100%)",
        }}
        data-testid="banner-top-promo"
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #FFD700 1.5px, transparent 2px), radial-gradient(circle at 70% 60%, #FF6B9D 1.5px, transparent 2px), radial-gradient(circle at 85% 20%, #FFD700 1px, transparent 1.5px), radial-gradient(circle at 40% 80%, #FFD700 1px, transparent 1.5px), radial-gradient(circle at 10% 70%, #FF6B9D 1.2px, transparent 1.8px)",
            backgroundSize: "180px 120px",
          }}
        />

        <div className="relative flex items-center gap-2.5 px-3 py-2.5 max-w-7xl mx-auto">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
            <Smartphone className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>

          <div className="flex-1 min-w-0 pr-7">
            <div className="text-white font-bold text-[13px] leading-tight">
              Uygulamayı İndir ve Hemen Üye Ol
            </div>
            <div className="text-white/85 text-[11px] leading-tight mt-0.5">
              <span className="font-bold text-yellow-300">100 TL bonus</span> hesabında...
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#C81E1E] text-xs font-extrabold shadow-md active:scale-95 transition-transform"
            data-testid="btn-install-banner"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2.8} />
            <span>İNDİR</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="absolute top-1 right-1.5 text-white/70 hover:text-white p-0.5"
            aria-label="Kapat"
            data-testid="button-close-top-banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
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
                    tarayıcısı kullanılmalı.
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
