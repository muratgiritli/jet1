import { useState } from "react";
import { Gift, X, Copy, Check } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { Link } from "wouter";

export default function WelcomeCouponBanner() {
  const { customer, isLoggedIn } = useCustomer();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isLoggedIn || !customer?.welcomeCoupon || dismissed) return null;

  const coupon = customer.welcomeCoupon;
  const expiresDate = coupon.expiresAt ? new Date(coupon.expiresAt) : null;
  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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
            Min. {coupon.minOrderAmount} TL siparis
            {daysLeft !== null && ` | ${daysLeft} gun kaldi`}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="bg-white text-green-700 font-black text-xs px-2.5 py-0.5 rounded-lg tracking-wider" data-testid="text-coupon-code">{coupon.code}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-lg hover:bg-white/30 transition-colors"
              data-testid="btn-copy-coupon"
            >
              {copied ? <><Check className="w-3 h-3" /> Kopyalandi</> : <><Copy className="w-3 h-3" /> Kopyala</>}
            </button>
            <Link href="/sepet" className="text-xs bg-yellow-400 text-gray-900 font-bold px-2.5 py-0.5 rounded-lg" data-testid="link-use-coupon">
              Kullan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
