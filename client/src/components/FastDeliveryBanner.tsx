import { useState, useEffect } from "react";
import { Truck } from "lucide-react";

const MAMA_SUBCATEGORIES = [
  "mama-markalari",
  "acik-mama",
  "yas-mama",
  "kedi-mamasi",
  "kedi-konserve",
];

function isFastDeliveryActive(): boolean {
  const now = new Date();
  const turkeyTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const hour = turkeyTime.getHours();
  const day = turkeyTime.getDay();
  return day !== 0 && hour >= 12 && hour < 18;
}

export function shouldShowFastDelivery(animal: string, subcategory: string): boolean {
  if (animal !== "kedi" && animal !== "kopek") return false;
  if (!MAMA_SUBCATEGORIES.includes(subcategory)) return false;
  return isFastDeliveryActive();
}

export default function FastDeliveryBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isFastDeliveryActive());
    const interval = setInterval(() => {
      setVisible(isFastDeliveryActive());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-bold"
      style={{ backgroundColor: "#e65100" }}
      data-testid="banner-fast-delivery"
    >
      <Truck className="w-5 h-5 shrink-0" />
      <span>Şimdi Sipariş Ver Gün İçinde Kapında</span>
    </div>
  );
}
