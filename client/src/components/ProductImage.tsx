import { useState, useRef, useEffect } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  "data-testid"?: string;
}

export default function ProductImage({ src, alt, className = "", loading = "lazy", ...rest }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(loading === "eager");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading === "eager" || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loading]);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-muted/40 ${className}`} {...rest}>
        <Package className="w-1/3 h-1/3 text-muted-foreground/40" />
      </div>
    );
  }

  const thumbSrc = src.includes("/api/product-image/")
    ? `${src}?w=40`
    : src;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} {...rest}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
