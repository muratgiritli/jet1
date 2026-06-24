import { cardPrice } from "@/lib/data";

interface CardPriceNoteProps {
  price: number;
  className?: string;
  testId?: string;
}

export default function CardPriceNote({ price, className = "", testId = "text-card-price" }: CardPriceNoteProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium text-gray-500 ${className}`}
      data-testid={testId}
    >
      Kart / Havale / QR: {cardPrice(price).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
      <span className="text-gray-400">(+%5)</span>
    </span>
  );
}
