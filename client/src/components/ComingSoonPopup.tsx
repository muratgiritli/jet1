import { useEffect, useState } from "react";
import { MapPin, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "jetgo_atakum_popup_dismissed_at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default function ComingSoonPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last || Date.now() - parseInt(last) > COOLDOWN_MS) {
        const t = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={close}
      data-testid="popup-coming-soon"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md text-gray-700"
          aria-label="Kapat"
          data-testid="button-close-popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 text-white px-6 pt-8 pb-10 text-center relative overflow-hidden">
          <Sparkles className="absolute top-4 left-4 w-6 h-6 opacity-40" />
          <Sparkles className="absolute bottom-4 right-4 w-5 h-5 opacity-40" />
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 ring-4 ring-white/20">
            <MapPin className="w-10 h-10" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-90 mb-2">Çok Yakında</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            Samsun Atakum İçinde<br />Faaliyete Geçiyoruz!
          </h2>
        </div>

        <div className="px-6 py-6 text-center space-y-4">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            En kısa zamanda <strong className="text-purple-700">Samsun Atakum</strong> bölgesi içinde hizmetinizdeyiz.
            Patili dostlarınızın ihtiyaçları için hazırız!
          </p>
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-xs text-purple-900 leading-relaxed">
            Açılış kampanyalarından ilk siz haberdar olmak için bültenimize abone olun.
          </div>
          <button
            type="button"
            onClick={close}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-bold text-base shadow-lg transition-all"
            data-testid="button-popup-ok"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}
