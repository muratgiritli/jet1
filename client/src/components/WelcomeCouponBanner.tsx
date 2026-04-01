import { useState } from "react";
import { Gift, X, Sparkles } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

export default function WelcomeCouponBanner() {
  const { customer, isLoggedIn } = useCustomer();
  const [dismissed, setDismissed] = useState(false);

  if (!isLoggedIn || !customer?.welcomeCoupon || dismissed) return null;

  const coupon = customer.welcomeCoupon;
  const expiresDate = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl px-4 py-3 md:px-8 md:py-5 overflow-hidden" data-testid="welcome-coupon-banner">
      <div className="absolute -right-8 -top-8 w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/5 pointer-events-none" />
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-1 text-white/70 hover:text-white" data-testid="btn-dismiss-welcome-coupon">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3 md:gap-5 relative z-10">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-full md:rounded-2xl flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 md:w-7 md:h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm md:text-lg leading-tight">{coupon.discountValue} TL Hos Geldin Bonusun Var! 🎉</p>
          <div className="flex items-center gap-2 mt-1">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 shrink-0" />
            <p className="text-xs md:text-sm text-white/90">
              Ilk siparisinde otomatik uygulanacak
              {daysLeft !== null && ` · ${daysLeft} gun kaldi`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
