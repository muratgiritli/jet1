import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Loader2, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";
import BackNavigation from "@/components/BackNavigation";
import Logo from "@/components/Logo";
import type { OrderItem } from "@shared/schema";

interface TrackedOrder {
  id: number;
  items: OrderItem[];
  grandTotal: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  yeni: { label: "Bekliyor", color: "bg-blue-500 text-white" },
  onaylandi: { label: "Onaylandı", color: "bg-teal-500 text-white" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "bg-orange-500 text-white" },
  tamamlandi: { label: "Tamamlandı", color: "bg-green-600 text-white" },
  iptal: { label: "İptal", color: "bg-red-500 text-white" },
};

export default function OrderTrackingPage() {
  const [, navigate] = useLocation();

  const { data: customer, isLoading: customerLoading } = useQuery<{ id: number; phone: string; name: string } | null>({
    queryKey: ["/api/customer/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/customer/me", { credentials: "include" });
        if (res.status === 401) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<TrackedOrder[]>({
    queryKey: ["/api/orders/track"],
    queryFn: async () => {
      const res = await fetch("/api/orders/track", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!customer,
  });

  const loading = customerLoading || (!!customer && ordersLoading);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-50" style={{ background: "#6B3480" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <Logo className="text-2xl" linkTo="/" />
          <h1 className="text-sm font-bold text-white/90" data-testid="text-page-title">
            Sipariş Takip
          </h1>
        </div>
      </header>

      <BackNavigation />

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && !customer && (
          <div className="text-center py-12">
            <LogIn className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm font-medium text-muted-foreground mb-4" data-testid="text-login-required">
              Siparişlerinizi görmek için giriş yapmalısınız
            </p>
            <Link href="/giris?redirect=/siparis-takip">
              <Button data-testid="button-go-login">
                <LogIn className="w-4 h-4 mr-2" />
                Giriş Yap
              </Button>
            </Link>
          </div>
        )}

        {!loading && customer && orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" data-testid="text-no-results">
              Henüz siparişiniz bulunmuyor
            </p>
          </div>
        )}

        {!loading && customer && orders.length > 0 && (
          <section className="mt-6 space-y-4" data-testid="list-orders">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.yeni;
              const date = new Date(order.createdAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Card key={order.id} data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-sm font-bold" data-testid={`text-order-id-${order.id}`}>
                        Sipariş #{order.id}
                      </span>
                      <Badge className={`no-default-hover-elevate ${cfg.color}`} data-testid={`badge-status-${order.id}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                      {date}
                    </p>
                    <div className="space-y-1">
                      {(order.items as OrderItem[]).map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground" data-testid={`text-order-item-${order.id}-${idx}`}>
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-2 border-t flex-wrap">
                      <span className="text-xs text-muted-foreground">Toplam</span>
                      <span className="text-sm font-bold" data-testid={`text-order-total-${order.id}`}>
                        {Math.round(order.grandTotal)} TL
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
