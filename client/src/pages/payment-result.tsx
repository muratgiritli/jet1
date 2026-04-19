import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { queryClient } from "@/lib/queryClient";

export default function PaymentResult() {
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oid = params.get("orderId");
    const fail = params.get("fail");
    const success = params.get("success");
    const id = oid ? parseInt(oid) : null;
    setOrderId(id);

    if (fail === "1") {
      setStatus("fail");
      return;
    }
    if (success === "1") {
      setStatus("success");
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
      return;
    }
    if (!id) {
      setStatus("fail");
      return;
    }
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/orders/${id}/payment-status`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.paymentStatus === "paid") {
            setStatus("success");
            clearCart();
            queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
            return;
          }
          if (data.paymentStatus === "failed") {
            setStatus("fail");
            return;
          }
        }
      } catch {}
      if (attempts < 20) setTimeout(poll, 2000);
      else setStatus("fail");
    };
    poll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-10">
      <SEO title="Ödeme Sonucu | JETGO" description="Ödeme işleminizin sonucu" noindex />
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" data-testid="icon-loading" />
              <h1 className="text-xl font-bold mb-2" data-testid="text-payment-loading">Ödeme Doğrulanıyor</h1>
              <p className="text-sm text-muted-foreground">Ödeme sonucu kontrol ediliyor, lütfen bekleyin...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" data-testid="icon-success" />
              <h1 className="text-2xl font-bold mb-2 text-green-700" data-testid="text-payment-success">Ödeme Başarılı!</h1>
              <p className="text-sm text-muted-foreground mb-2">
                {orderId ? `#${orderId} numaralı siparişiniz alındı.` : "Siparişiniz başarıyla alındı."}
              </p>
              <p className="text-sm text-muted-foreground mb-6">Siparişiniz en kısa sürede hazırlanıp adresinize gönderilecektir.</p>
              <div className="space-y-2">
                <Button asChild className="w-full" data-testid="btn-go-orders">
                  <Link href="/hesabim?tab=orders">
                    Siparişlerim <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" data-testid="btn-go-home">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" /> Ana Sayfa
                  </Link>
                </Button>
              </div>
            </>
          )}
          {status === "fail" && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" data-testid="icon-fail" />
              <h1 className="text-2xl font-bold mb-2 text-red-700" data-testid="text-payment-fail">Ödeme Başarısız</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Ödemeniz tamamlanamadı. Sipariş iptal edildi. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi seçin.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full" data-testid="btn-retry">
                  <Link href="/odeme">
                    Sepete Dön
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" data-testid="btn-go-home-fail">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" /> Ana Sayfa
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
