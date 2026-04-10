import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevOverflow = useRef<string>("");

  const stableClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableClose();
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow.current;
      window.removeEventListener("keydown", handleKey);
    };
  }, [stableClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={stableClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      data-testid="lightbox-overlay"
    >
      <button
        ref={closeRef}
        onClick={(e) => { e.stopPropagation(); stableClose(); }}
        className="absolute top-4 right-4 z-[10000] bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
        data-testid="lightbox-close"
        aria-label="Kapat"
      >
        <X className="w-6 h-6 text-gray-800" />
      </button>
      <div
        className="relative max-w-[90vw] max-h-[85vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white"
          data-testid="lightbox-image"
        />
        <p className="text-center text-white text-sm mt-3 font-medium drop-shadow-md line-clamp-2">
          {alt}
        </p>
      </div>
    </div>
  );
}
