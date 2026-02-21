import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Loader2, Phone } from "lucide-react";
import { Link } from "wouter";
import BackNavigation from "@/components/BackNavigation";
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
  yeni: { label: "Yeni", color: "bg-blue-500 text-white" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "bg-orange-500 text-white" },
  tamamlandi: { label: "Tamamlandı", color: "bg-green-600 text-white" },
  iptal: { label: "İptal Edildi", color: "bg-red-500 text-white" },
};

export default function OrderTrackingPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 7) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50" style={{ background: "#2ecc40" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <Link href="/">
            <span className="text-xl font-extrabold text-white tracking-wider cursor-pointer" data-testid="link-logo">
              JETGO
            </span>
          </Link>
          <h1 className="text-sm font-bold text-white/90" data-testid="text-page-title">
            Sipariş Takip
          </h1>
        </div>
      </header>

      <BackNavigation />

      <main className="max-w-2xl mx-auto px-4 pb-8">
        <section className="mt-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                <h2 className="text-base font-bold">Telefon Numaranızı Girin</h2>
              </div>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  data-testid="input-phone"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading || phone.trim().length < 7}
                  data-testid="button-search"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Sorgula
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && searched && orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" data-testid="text-no-results">
              Bu telefon numarasına ait sipariş bulunamadı
            </p>
          </div>
        )}

        {!loading && orders.length > 0 && (
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
