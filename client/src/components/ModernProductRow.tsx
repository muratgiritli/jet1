import { useState } from "react";
import { Link } from "wouter";
import { Star, Truck, Calendar, Eye, ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productUrl } from "@/lib/data";
import FavoriteButton from "@/components/FavoriteButton";
import ProductImage from "@/components/ProductImage";
import {
  cleanName,
  deriveSubtitle,
  sizeBadgeLabel,
  formatSkt,
  representativeReviewCount,
} from "@/lib/product-display";

export function StarRating({ count, size = "sm" }: { count?: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex items-center gap-1.5" data-testid="rating-stars">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`${cls} fill-amber-400 text-amber-400`} />
        ))}
      </span>
      {typeof count === "number" && <span className="text-xs text-gray-400">({count})</span>}
    </span>
  );
}

export interface ModernRowProduct {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number | null;
  img?: string | null;
  skt?: string | null;
  stock?: number | null;
}

interface ModernProductRowProps {
  product: ModernRowProduct;
  quantity?: number;
  /** Returns true when the +1 was blocked (out of stock). */
  onUpdate?: (id: string, delta: number) => boolean;
  /** Legacy flag: the old card rendered a detail link instead of inline qty. */
  showDetailLink?: boolean;
  /** Legacy flag: animals where inline add-to-cart is not offered. */
  forceOrderLink?: boolean;
}

const ORANGE = "#e65100";

export default function ModernProductRow({
  product,
  quantity = 0,
  onUpdate,
  showDetailLink,
  forceOrderLink,
}: ModernProductRowProps) {
  const [warn, setWarn] = useState(false);
  const id = String(product.id);
  const name = cleanName(product.name);
  const subtitle = deriveSubtitle(product.name);
  const size = sizeBadgeLabel(product.name);
  const skt = formatSkt(product.skt);
  const reviews = representativeReviewCount(product.id);
  const inStock = (product.stock ?? 0) > 0;
  const canQuickAdd = inStock && !!onUpdate && !forceOrderLink && !showDetailLink;
  const href = productUrl(product.id, product.name);

  const tryAdd = () => {
    if (!onUpdate) return;
    const blocked = onUpdate(id, 1);
    if (blocked) {
      setWarn(true);
      setTimeout(() => setWarn(false), 2500);
    }
  };

  return (
    <div
      className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3"
      data-testid={`row-product-${id}`}
    >
      <div className="relative shrink-0">
        <Link href={href}>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-muted/30 cursor-pointer">
            <ProductImage src={product.img} alt={name} className="w-full h-full object-contain" />
          </div>
        </Link>
        {size && (
          <span
            className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded"
            data-testid={`badge-size-${id}`}
          >
            {size}
          </span>
        )}
        {!inStock && (
          <span className="absolute top-1 left-1 text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
            Tükendi
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-2">
          <Link href={href} className="min-w-0 flex-1">
            <h3
              className="text-sm font-bold leading-snug line-clamp-2 text-gray-900"
              data-testid={`text-name-${id}`}
            >
              {name}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" data-testid={`text-subtitle-${id}`}>
                {subtitle}
              </p>
            )}
          </Link>
          <FavoriteButton
            product={{ id, name, price: product.price, img: product.img }}
            size="sm"
            className="shrink-0"
          />
        </div>

        <div className="mt-1">
          <StarRating count={reviews} />
        </div>

        <div
          className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600"
          data-testid={`text-delivery-${id}`}
        >
          <Truck className="w-3.5 h-3.5 shrink-0" />
          Atakum İçi 1 Saatte Kapında
        </div>

        {skt && (
          <div
            className="mt-0.5 flex items-center gap-1 text-xs text-gray-400"
            data-testid={`text-skt-${id}`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            Son Kullanma: {skt}
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end justify-between gap-2 text-right w-28 sm:w-36">
        <div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-xs text-gray-400 line-through">
              {product.originalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
            </div>
          )}
          <div className="text-lg font-extrabold leading-tight" style={{ color: ORANGE }} data-testid={`text-price-${id}`}>
            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-xs">TL</span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-1.5 w-full">
          <Link href={href} className="w-full">
            <Button
              className="w-full h-9 font-bold text-xs sm:text-sm"
              style={{ backgroundColor: ORANGE, color: "#fff" }}
              data-testid={`button-detail-${id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ürünü İncele
            </Button>
          </Link>

          {canQuickAdd &&
            (quantity === 0 ? (
              <Button
                variant="outline"
                className="w-full h-8 text-xs font-semibold"
                onClick={tryAdd}
                data-testid={`button-quickadd-${id}`}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Sepete Ekle
              </Button>
            ) : (
              <div className="flex items-center justify-between gap-1 w-full" data-testid={`qty-control-${id}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onUpdate && onUpdate(id, -1)}
                  data-testid={`btn-minus-${id}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="flex-1 text-center font-bold text-primary text-sm" data-testid={`text-qty-${id}`}>
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={tryAdd}
                  data-testid={`btn-plus-${id}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

          {warn && <span className="text-[10px] text-red-600 font-medium">Stok kalmadı!</span>}
        </div>
      </div>
    </div>
  );
}
