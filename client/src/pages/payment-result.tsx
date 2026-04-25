import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PaymentResultPage() {
  const [location] = useLocation();
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    if (typeof window !== "undefined") {
      setParams(new URLSearchParams(window.location.search));
    }
  }, [location]);

  const status = params.get("status") || "";
  const orderId = params.get("order");
  const reason = params.get("msg") || "";
  const isSuccess = status === "success";

  const { data: order, isLoading } = useQuery<any>({
    queryKey: ["/api/orders", orderId, "payment-status"],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/payment-status`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const color = isSuccess ? "text-emerald-500" : "text-red-500";
  const title = isSuccess ? "Ödemeniz Başarıyla Alındı" : "Ödeme Tamamlanamadı";
  const subtitle = isSuccess
    ? "Siparişiniz hazırlanmaya başlandı. Sipariş detaylarını hesabımdan görüntüleyebilirsiniz."
    : "Ödeme işlemi tamamlanamadı. Stoklarınız iade edildi, dilerseniz farklı bir ödeme yöntemi ile tekrar deneyebilirsiniz.";

  const reasonText = useMemo(() => {
    if (!reason || isSuccess) return "";
    const map: Record<string, string> = {
      "token-missing": "Ödeme tokeni alınamadı.",
      "token-not-found": "Ödeme oturumu bulunamadı.",
      "config-missing": "Ödeme servisi geçici olarak kapalı.",
      "callback-error": "Sunucu hatası oluştu.",
      "payment-failed": "Banka ödemeyi onaylamadı.",
    };
    return map[reason] || reason;
  }, [reason, isSuccess]);

  return (
    <div className="max-w-md mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center text-center" data-testid="page-payment-result">
      <Icon className={`w-20 h-20 ${color} mb-4`} />
      <h1 className="text-2xl font-bold mb-2" data-testid="text-payment-title">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{subtitle}</p>

      {reasonText && (
        <div className="mb-4 px-3 py-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300" data-testid="text-payment-reason">
          {reasonText}
        </div>
      )}

      {orderId && (
        <div className="w-full bg-muted/40 rounded-lg p-4 mb-6 text-left" data-testid="card-order-summary">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sipariş Bilgisi</span>
          </div>
          <div className="text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Sipariş No:</span>
              <span className="font-bold">#{orderId}</span>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Detaylar yükleniyor...
              </div>
            ) : order && (
              <>
                {order.grandTotal !== undefined && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Tutar:</span>
                    <span className="font-bold">{Number(order.grandTotal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                  </div>
                )}
                {order.paymentStatus && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Ödeme Durumu:</span>
                    <span className={`font-bold ${order.paymentStatus === "completed" ? "text-emerald-600" : order.paymentStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>
                      {order.paymentStatus === "completed" ? "Tamamlandı" : order.paymentStatus === "failed" ? "Başarısız" : order.paymentStatus}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Link href="/hesabim?tab=orders">
          <a className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold text-center block" data-testid="link-my-orders">
            Siparişlerim
          </a>
        </Link>
        {!isSuccess && (
          <Link href="/odeme">
            <a className="flex-1 px-4 py-3 rounded-lg border text-sm font-bold text-center block" data-testid="link-retry-payment">
              Tekrar Dene
            </a>
          </Link>
        )}
        <Link href="/">
          <a className="flex-1 px-4 py-3 rounded-lg border text-sm font-bold text-center block" data-testid="link-home">
            Ana Sayfa
          </a>
        </Link>
      </div>
    </div>
  );
}
