import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const wasDismissed = sessionStorage.getItem("install_banner_dismissed");
    if (!wasDismissed && !standalone) {
      setDismissed(false);
    }
  }, []);

  if (dismissed || isStandalone) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("install_banner_dismissed", "1");
  };

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handleInstall = () => {
    if (isAndroid) {
      const link = document.createElement("a");
      link.href = window.location.origin;
      link.click();
    }
    if (isIOS) {
      alert("Safari'de paylaş butonuna (⬆) dokunun, ardından 'Ana Ekrana Ekle' seçin.");
    }
  };

  return (
    <div
      className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200"
      data-testid="install-banner"
    >
      <img
        src="/logo-jetgo.webp"
        alt="JETGO"
        className="w-10 h-10 rounded-lg flex-shrink-0"
        data-testid="img-install-logo"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight" data-testid="text-install-title">JETGO Pet Shop</p>
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
        Yükle
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
        data-testid="btn-dismiss-install"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
