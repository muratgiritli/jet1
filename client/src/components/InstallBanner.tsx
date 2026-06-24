import { useState, useEffect, useRef } from "react";
import { brandify } from "@/lib/store";
import { X, Download, Gift, Sparkles } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type GuideType = null | "ios-safari" | "ios-other-browser" | "desktop-no-prompt";

export default function InstallBanner() {
  const { isLoggedIn } = useCustomer();
  const [dismissed, setDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [guide, setGuide] = useState<GuideType>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(ios);
    const iosSafari = ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(ua);
    setIsIOSSafari(iosSafari);

    const wasDismissed = sessionStorage.getItem("install_banner_dismissed");
    if (standalone || wasDismissed) return;

    if (ios) {
      setDismissed(false);
      return;
    }

    const existing = (window as any).__deferredInstallPrompt as BeforeInstallPromptEvent | null;
    if (existing) {
      deferredPrompt.current = existing;
      setDismissed(false);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setDismissed(false);
    };
    const readyHandler = () => {
      const p = (window as any).__deferredInstallPrompt as BeforeInstallPromptEvent | null;
      if (p) {
        deferredPrompt.current = p;
        setDismissed(false);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwaInstallReady", readyHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwaInstallReady", readyHandler);
    };
  }, []);

  if (dismissed || isStandalone || isLoggedIn) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("install_banner_dismissed", "1");
  };

  const handleInstall = async () => {
    if (isIOS) {
      setGuide(isIOSSafari ? "ios-safari" : "ios-other-browser");
      return;
    }

    const promptEvent =
      deferredPrompt.current ||
      ((window as any).__deferredInstallPrompt as BeforeInstallPromptEvent | null);
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") handleDismiss();
      deferredPrompt.current = null;
      (window as any).__deferredInstallPrompt = null;
    } else {
      setGuide("desktop-no-prompt");
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-50 border-b border-amber-200"
        data-testid="install-banner"
      >
        <div
          className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: "#6B3480" }}
        >
          <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] sm:text-sm font-bold text-gray-900 leading-tight flex items-center gap-1"
            data-testid="text-install-title"
          >
            {brandify("JETGO")} Uygulamasını İndir
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          </p>
          <p className="text-[11px] sm:text-xs text-gray-700 leading-tight mt-0.5">
            Tek dokunuşla hızlı sipariş
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-transform"
          style={{ backgroundColor: "#6B3480" }}
          data-testid="btn-install-app"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>İndir</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
          data-testid="btn-dismiss-install"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {guide && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/40"
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
                      <span className="font-mono font-semibold">{brandify("jetgomarket.com")}</span> yazın
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
                    İkon görünmüyorsa: Tarayıcı menüsü (⋮) → "{brandify("JETGO")}'yu Yükle" / "Install {brandify("JETGO")}"
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
