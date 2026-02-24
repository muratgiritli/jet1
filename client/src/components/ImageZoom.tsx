import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ImageZoom({ src, alt, className = "", children }: ImageZoomProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleOpen = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.min(4, Math.max(1, scale * (dist / lastTouchDist.current)));
      setScale(newScale);
      lastTouchDist.current = dist;
      if (newScale <= 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      setPosition((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    lastTouchDist.current = null;
    isDragging.current = false;
    if (scale <= 1) setPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  return (
    <>
      <div className={`relative cursor-zoom-in ${className}`} onClick={handleOpen}>
        {children}
        <div className="absolute bottom-2 left-2 bg-black/40 rounded-full p-1.5" data-testid="btn-zoom-hint">
          <ZoomIn className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget && scale <= 1) setOpen(false); }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 rounded-full p-2"
              data-testid="btn-close-zoom"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div
              className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleTap}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transition: isDragging.current ? "none" : "transform 0.2s ease",
                }}
                draggable={false}
                data-testid="img-zoomed"
              />
            </div>

            {scale <= 1 && (
              <p className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-xs">
                Yakınlaştırmak için çift dokunun
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
