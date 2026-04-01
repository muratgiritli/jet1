import { useState } from "react";
import { Gift, X } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

export default function WelcomeCouponBanner() {
  const { customer, isLoggedIn } = useCustomer();
  const [dismissed, setDismissed] = useState(false);

  if (!isLoggedIn || !customer?.welcomeCoupon || dismissed) return null;

  const coupon = customer.welcomeCoupon;
  const expiresDate = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl px-4 py-3 overflow-hidden" data-testid="welcome-coupon-banner">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 z-10 p-1 text-white/70 hover:text-white" data-testid="btn-dismiss-welcome-coupon">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">{coupon.discountValue} TL Hos Geldin Bonusun Var! 🎉</p>
          <p className="text-xs text-white/80 mt-0.5">
            Ilk siparisinde otomatik uygulanacak
            {daysLeft !== null && ` | ${daysLeft} gun kaldi`}
          </p>
        </div>
      </div>
    </div>
  );
}
