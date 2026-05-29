import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "wouter";
import { X, ShoppingCart, Tag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/ProductImage";
import { productUrl } from "@/lib/data";
import type { Product } from "@shared/schema";

interface ProductPopupProps {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
  onClose: () => void;
  isMama?: boolean;
}

export default function ProductPopup({ product, quantity, onUpdate, onClose, isMama }: ProductPopupProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevOverflow = useRef<string>("");
  const [imgZoomed, setImgZoomed] = useState(false);
  const pid = String(product.id);

  const stableClose = useCallback(() => onClose(), [onClose]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableClose();
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={stableClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      data-testid="product-popup-overlay"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="product-popup-content"
      >
        <button
          ref={closeRef}
          onClick={stableClose}
          className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors"
          data-testid="product-popup-close"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div
          className="relative w-full bg-gray-50 rounded-t-2xl overflow-hidden cursor-zoom-in"
          onClick={() => setImgZoomed(!imgZoomed)}
        >
          <div className={`w-full flex items-center justify-center p-4 transition-all duration-300 ${imgZoomed ? "aspect-auto min-h-[300px]" : "aspect-square"}`}>
            <ProductImage
              src={product.img}
              alt={product.name}
              className={`object-contain transition-transform duration-300 ${imgZoomed ? "max-h-[60vh] w-full" : "w-full h-full"}`}
              data-testid="product-popup-image"
            />
          </div>
          {discount > 0 && (
            <Badge
              className="absolute top-3 left-3 text-xs font-bold no-default-hover-elevate"
              style={{ backgroundColor: "#e53935", color: "#fff" }}
            >
              %{discount}
            </Badge>
          )}
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <Badge
              className="absolute top-3 right-12 text-[10px] font-bold no-default-hover-elevate"
              style={{ backgroundColor: "#ff9800", color: "#fff" }}
            >
              Son {product.stock} adet
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 leading-snug" data-testid="product-popup-name">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-extrabold text-primary" data-testid="product-popup-price">
              {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
            )}
          </div>
          <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" data-testid="product-popup-cash-price">
            Nakit Fiyatı: {(product.price * 0.9).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
          </span>

          {product.stock === 0 && !product.preorderEnabled && isMama ? (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>
              <Tag className="w-4 h-4" />
              Tükendi
            </div>
          ) : product.stock === 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }}>
                <Clock className="w-3.5 h-3.5" />
                Ön Sipariş — Ortalama 3 gün içinde teslimat
              </div>
              <Link href={productUrl(product.id, product.name)} className="block w-full" onClick={stableClose}>
                <Button
                  className="w-full h-10 text-sm font-semibold gap-1.5"
                  style={{ backgroundColor: "#1565c0" }}
                  data-testid="product-popup-preorder-add"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Sipariş Ver
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={productUrl(product.id, product.name)} className="block w-full" onClick={stableClose}>
              <Button
                className="w-full h-10 text-sm font-bold gap-1.5"
                data-testid="product-popup-add"
              >
                <ShoppingCart className="w-4 h-4" />
                Satın Al
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
