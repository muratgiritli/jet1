import { useState, useEffect, useRef } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const wasDismissed = sessionStorage.getItem("install_banner_dismissed");
    if (standalone || wasDismissed) return;

    if (ios) {
      setDismissed(false);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || isStandalone) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("install_banner_dismissed", "1");
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") {
        handleDismiss();
      }
      deferredPrompt.current = null;
    }
  };

  return (
    <>
      <div
        className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200"
        data-testid="install-banner"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight" data-testid="text-install-title">
            JETGO Pet Shop
          </p>
          <p className="text-xs text-gray-500 leading-tight">Hızlı sipariş için yükle</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-bold"
          style={{ backgroundColor: "#6B3480" }}
          data-testid="btn-install-app"
        >
          <Download className="w-3.5 h-3.5" />
          Uygulamayı İndir
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400"
          data-testid="btn-dismiss-install"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIOSGuide && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowIOSGuide(false)}
          data-testid="ios-install-guide"
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl px-5 py-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
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
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: "#6B3480" }}
              data-testid="btn-close-ios-guide"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
