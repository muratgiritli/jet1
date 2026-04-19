import { CreditCard, ShieldCheck } from "lucide-react";
import { INSTALLMENT_BANKS } from "@/lib/data";

interface InstallmentBannerProps {
  variant?: "full" | "compact" | "inline";
  className?: string;
}

export default function InstallmentBanner({ variant = "full", className = "" }: InstallmentBannerProps) {
  if (variant === "inline") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded ${className}`}
        data-testid="badge-installment-inline"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Peşin Fiyatına 3 Taksit
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 ${className}`}
        data-testid="banner-installment-compact"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
          <CreditCard className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-blue-900">Peşin Fiyatına 3 Taksit</p>
          <p className="text-[11px] text-blue-700 truncate">{INSTALLMENT_BANKS.join(" · ")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm ${className}`}
      data-testid="banner-installment-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900">Peşin Fiyatına 3 Taksit Fırsatı</h3>
          <p className="text-xs text-blue-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> PayTR güvenli ödeme · Ek komisyon yok
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Aşağıdaki kartlarla yapacağınız ödemelerde peşin fiyatına 3 taksit avantajından yararlanabilirsiniz:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {INSTALLMENT_BANKS.map((bank) => (
          <div
            key={bank}
            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100 shadow-sm"
            data-testid={`bank-${bank.toLowerCase()}`}
          >
            <span className="text-xs font-bold text-gray-800">{bank}</span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">3 Taksit</span>
          </div>
        ))}
      </div>
    </div>
  );
}
