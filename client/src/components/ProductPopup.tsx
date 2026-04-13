import { useEffect, useRef, useCallback, useState } from "react";
import { X, Plus, Minus, ShoppingCart, Tag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@shared/schema";

interface ProductPopupProps {
  product: Product;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
  onClose: () => void;
}

export default function ProductPopup({ product, quantity, onUpdate, onClose }: ProductPopupProps) {
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

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-primary" data-testid="product-popup-price">
              {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </span>
            )}
          </div>

          {product.weight && (
            <p className="text-xs text-muted-foreground">{product.weight}</p>
          )}

          {product.stock === 0 && !product.preorderEnabled ? (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>
              <Tag className="w-4 h-4" />
              Tükendi
            </div>
          ) : product.stock === 0 && product.preorderEnabled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }}>
                <Clock className="w-3.5 h-3.5" />
                Ön Sipariş — Ortalama 3 gün içinde teslimat
              </div>
              <p className="text-[11px] font-medium" style={{ color: "#e65100", backgroundColor: "#fff3e0", padding: "4px 8px", borderRadius: "4px" }}>Ödemeyi ürün tesliminde yapacaksınız. Ön sipariş verirken ödeme alınmaz.</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0 border rounded-lg overflow-hidden border-blue-300" data-testid="product-popup-preorder-qty">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-none"
                    onClick={() => onUpdate(pid, -1)}
                    data-testid="product-popup-preorder-minus"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center justify-center w-10 h-9 text-sm font-bold text-blue-700">
                    {quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-none"
                    onClick={() => onUpdate(pid, 1)}
                    data-testid="product-popup-preorder-plus"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {quantity === 0 && (
                  <Button
                    className="flex-1 h-9 text-sm font-semibold"
                    style={{ backgroundColor: "#1565c0" }}
                    onClick={() => onUpdate(pid, 1)}
                    data-testid="product-popup-preorder-add"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ön Sipariş Ver
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0 border rounded-lg overflow-hidden" data-testid="product-popup-qty">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-none"
                  onClick={() => onUpdate(pid, -1)}
                  data-testid="product-popup-minus"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-center font-bold text-primary w-10 text-base" data-testid="product-popup-qty-value">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-none"
                  onClick={() => onUpdate(pid, 1)}
                  data-testid="product-popup-plus"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {quantity === 0 && (
                <Button
                  className="flex-1 h-9 text-sm font-bold gap-1.5"
                  onClick={() => onUpdate(pid, 1)}
                  data-testid="product-popup-add"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Sepete Ekle
                </Button>
              )}
              {quantity > 0 && (
                <div className="flex-1 text-center text-sm font-bold text-primary" data-testid="product-popup-in-cart">
                  Sepette: {quantity} adet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
