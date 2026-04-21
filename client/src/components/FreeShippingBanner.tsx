import { Truck } from "lucide-react";
import { CONFIG } from "@/lib/data";

export function FreeShippingBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-800 px-4 py-2.5 ${className}`}
      data-testid="banner-free-shipping"
      role="status"
    >
      <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 text-center">
        {CONFIG.shipLimit} TL ve üzeri alışverişlerinizde <span className="font-bold">ücretsiz kargo</span>!
      </p>
    </div>
  );
}
