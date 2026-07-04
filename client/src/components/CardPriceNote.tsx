import { cardPrice } from "@/lib/data";
import { useSurchargeRate, useSurchargeOverrides, effectiveSurchargeRate, surchargeLabel } from "@/hooks/useSurchargeRate";

interface CardPriceNoteProps {
  price: number;
  productId?: number | string;
  className?: string;
  testId?: string;
}

export default function CardPriceNote({ price, productId, className = "", testId = "text-card-price" }: CardPriceNoteProps) {
  const baseRate = useSurchargeRate();
  const overrides = useSurchargeOverrides();
  const rate = effectiveSurchargeRate(productId, baseRate, overrides);
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium text-gray-500 ${className}`}
      data-testid={testId}
    >
      Kart / Havale / QR: {cardPrice(price, rate).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
      <span className="text-gray-400">({surchargeLabel(rate)})</span>
    </span>
  );
}
