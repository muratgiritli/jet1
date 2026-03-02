import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useLocation } from "wouter";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Package,
  Check,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Search,
  MapPin,
  CheckCircle2,
  Home,
  ChevronDown,
  X,
  LogIn,
  Star,
  Navigation,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiWhatsapp } from "react-icons/si";
import {
  CONFIG,
  PAYMENT_OPTIONS,
  TESLIMAT_MAHALLELERI,
} from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BackNavigation from "@/components/BackNavigation";
import { useCustomer } from "@/contexts/CustomerContext";
import type { InstallmentRate } from "@shared/schema";

const paymentIcons: Record<string, typeof CreditCard> = {
  nakit: Banknote,
  eft: Wallet,
  qr: QrCode,
  pos: CreditCard,
  taksit: CreditCard,
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [orderLoading, setOrderLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [editingInfo, setEditingInfo] = useState(false);
  const [usePoints, setUsePoints] = useState(true);
  const [selectedMahalle, setSelectedMahalle] = useState(() => {
    return localStorage.getItem("jet55_mahalle") || "";
  });
  const [mahalleSaved, setMahalleSaved] = useState(() => !!localStorage.getItem("jet55_mahalle"));
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authAddress, setAuthAddress] = useState("");
  const [authMahalle, setAuthMahalle] = useState("");
  const [authLocation, setAuthLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [authLocationLoading, setAuthLocationLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const { toast } = useToast();
  const { customer, isLoggedIn, login, register, updateProfile } = useCustomer();

  const { data: installmentRates = [] } = useQuery<InstallmentRate[]>({
    queryKey: ["/api/installment-rates"],
  });

  const { data: loyaltyData } = useQuery<{ balance: number }>({
    queryKey: ["/api/customer/loyalty-points"],
    enabled: isLoggedIn,
  });

  const pointsBalance = loyaltyData?.balance || 0;

  const { data: savedAddresses = [] } = useQuery<any[]>({
    queryKey: ["/api/customer/addresses"],
    enabled: isLoggedIn,
  });

  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [addressInitialized, setAddressInitialized] = useState(false);

  useEffect(() => {
    if (isLoggedIn && customer && !addressInitialized) {
      setCustomerPhone(customer.phone);
      setCustomerName(customer.name);
      if (customer.address) {
        const mahalleMatch = TESLIMAT_MAHALLELERI.find((m) => customer.address!.includes(m));
        if (mahalleMatch && !selectedMahalle) {
          setSelectedMahalle(mahalleMatch);
          localStorage.setItem("jet55_mahalle", mahalleMatch);
          setMahalleSaved(true);
        }
      }
      const defaultAddr = savedAddresses.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setCustomerAddress(defaultAddr.address);
        setAddressInitialized(true);
      } else if (customer.address) {
        setCustomerAddress(customer.address);
        setAddressInitialized(true);
      } else if (savedAddresses.length > 0) {
        setAddressInitialized(true);
      }
      setIsReturningCustomer(true);
      setLookupDone(true);
    }
  }, [isLoggedIn, customer, savedAddresses, addressInitialized]);


  const formatAuthPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  };

  const handleAuthPhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 11) setAuthPhone(formatAuthPhone(digits));
  };

  const handleAuthLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Tarayıcınız konum paylaşımını desteklemiyor", variant: "destructive" });
      return;
    }
    setAuthLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAuthLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAuthLocationLoading(false);
        toast({ title: "Konum alındı" });
      },
      () => {
        setAuthLocationLoading(false);
        toast({ title: "Konum alınamadı", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAuthSubmit = async () => {
    const normalized = authPhone.replace(/\D/g, "");
    if (normalized.length < 10) {
      toast({ title: "Geçerli bir telefon numarası girin", variant: "destructive" });
      return;
    }
    if (authPassword.length < 4) {
      toast({ title: "Şifre en az 4 karakter olmalı", variant: "destructive" });
      return;
    }
    if (authMode === "register" && !authName.trim()) {
      toast({ title: "Ad soyad girin", variant: "destructive" });
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "login") {
        await login(normalized, authPassword);
        toast({ title: "Hos geldiniz!" });
      } else {
        await register(normalized, authPassword, authName.trim());
        const fullAddress = authMahalle
          ? (authAddress.trim() ? `${authMahalle}, ${authAddress.trim()}` : authMahalle)
          : authAddress.trim();
        if (fullAddress) {
          try { await updateProfile({ address: fullAddress }); } catch {}
        }
        if (authMahalle) {
          localStorage.setItem("jet55_mahalle", authMahalle);
          setSelectedMahalle(authMahalle);
          setMahalleSaved(true);
        }
        if (authLocation) {
          setCustomerLocation(authLocation);
        }
        toast({ title: "Kayit basarili!" });
      }
      setShowAuthModal(false);
    } catch (err: any) {
      const msg = err.message || "Bir hata olustu";
      const cleaned = msg.replace(/^\d+:\s*/, "");
      try {
        const parsed = JSON.parse(cleaned);
        toast({ title: "Hata", description: parsed.message || cleaned, variant: "destructive" });
      } catch {
        toast({ title: "Hata", description: cleaned, variant: "destructive" });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const lookupCustomer = useCallback(async (phone: string) => {
    if (isLoggedIn) return;
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setLookupDone(false);
      setIsReturningCustomer(false);
      return;
    }
    setLookupLoading(true);
    try {
      setIsReturningCustomer(false);
    } catch {
      setIsReturningCustomer(false);
    } finally {
      setLookupDone(true);
      setLookupLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) return;
    const normalized = customerPhone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setLookupDone(false);
      setIsReturningCustomer(false);
      return;
    }
    const timer = setTimeout(() => lookupCustomer(customerPhone), 500);
    return () => clearTimeout(timer);
  }, [customerPhone, lookupCustomer, isLoggedIn]);
  const {
    paymentId,
    setPaymentId,
    updateQty,
    subtotal,
    selectedProducts,
    shipping,
    discount,
    grandTotal,
    minReached,
    itemCount,
    minPerc,
    shipPerc,
    clearCart,
  } = useCart();

  const pointsDiscount = isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, grandTotal) : 0;
  const displayTotal = pointsDiscount > 0 ? Math.max(0, grandTotal - pointsDiscount) : grandTotal;

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Tarayıcınız konum paylaşımını desteklemiyor", variant: "destructive" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
        toast({ title: "Konum alındı" });
      },
      () => {
        setLocationLoading(false);
        toast({ title: "Konum alınamadı. Lütfen konum iznini kontrol edin.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOrder = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!minReached || selectedProducts.length === 0 || orderLoading || !selectedMahalle) {
      if (!selectedMahalle) {
        toast({ title: "Hesabınızda mahalle bilgisi yok. Lütfen profilinizden mahallenizi güncelleyin.", variant: "destructive" });
      }
      return;
    }
    const pay = PAYMENT_OPTIONS.find((p) => p.id === paymentId)!;

    setOrderLoading(true);
    try {
      const orderItems = selectedProducts.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        img: product.img || undefined,
      }));

      const pointsUsed = isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, grandTotal) : 0;
      const finalTotal = pointsUsed > 0 ? Math.max(0, grandTotal - pointsUsed) : grandTotal;

      const orderPayload: Record<string, unknown> = {
        items: orderItems,
        subtotal,
        shipping,
        discount,
        grandTotal: finalTotal,
        paymentMethod: pay.name,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: selectedMahalle + (customerAddress.trim() ? ", " + customerAddress.trim() : ""),
        usedPoints: pointsUsed > 0 ? pointsUsed : undefined,
      };

      if ((pay.id === "taksit" || pay.id === "pos") && selectedInstallment) {
        const instRate = installmentRates.find((r) => r.months === selectedInstallment);
        if (instRate) {
          const instTotal = finalTotal * (1 + instRate.rate / 100);
          const instMonthly = instTotal / instRate.months;
          orderPayload.installmentMonths = instRate.months;
          orderPayload.installmentRate = instRate.rate;
          orderPayload.installmentMonthly = Math.round(instMonthly * 100) / 100;
          orderPayload.installmentTotal = Math.round(instTotal * 100) / 100;
        }
      }

      await apiRequest("POST", "/api/orders", orderPayload);

      if (isLoggedIn && customerAddress.trim() && (!customer?.address || customer.address !== customerAddress.trim())) {
        try {
          await updateProfile({ address: customerAddress.trim() });
        } catch {}
      }

      let msg = `*JETGO Sipariş*\n\n`;
      if (customerName.trim()) msg += `*Ad Soyad:* ${customerName.trim()}\n`;
      if (customerPhone.trim()) msg += `*Telefon:* ${customerPhone.trim()}\n`;
      msg += `*Mahalle:* ${selectedMahalle}\n`;
      if (customerAddress.trim()) msg += `*Adres Detayı:* ${customerAddress.trim()}\n`;
      if (customerLocation) msg += `*Konum:* https://www.google.com/maps?q=${customerLocation.lat},${customerLocation.lng}\n`;
      if (customerName.trim() || customerPhone.trim()) msg += `\n`;
      selectedProducts.forEach(({ product, qty }) => {
        msg += `${qty}x ${product.name} — ${Math.round(qty * product.price)} TL\n`;
      });
      msg += `\n*Ara Toplam:* ${Math.round(subtotal)} TL`;
      if (discount > 0) msg += `\n*İndirim (${pay.tag}):* -${Math.round(discount)} TL`;
      if (pointsUsed > 0) msg += `\n*Para Puan İndirimi:* -${pointsUsed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL`;
      msg += `\n*Teslimat:* ${shipping === 0 ? "Ücretsiz" : shipping + " TL"}`;
      msg += `\n*Genel Toplam:* ${Math.round(finalTotal)} TL`;
      msg += `\n*Ödeme:* ${pay.name}`;
      if ((pay.id === "taksit" || pay.id === "pos") && selectedInstallment) {
        const instRate = installmentRates.find((r) => r.months === selectedInstallment);
        if (instRate) {
          const instTotal = finalTotal * (1 + instRate.rate / 100);
          const monthly = instTotal / instRate.months;
          msg += `\n*Taksit:* ${selectedInstallment} Taksit`;
          msg += `\n*Aylık Ödeme:* ${monthly.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
          msg += `\n*Taksitli Toplam:* ${instTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
        }
      }
      if (pay.id === "eft") msg += CONFIG.bankInfo;

      const url = `https://wa.me/${CONFIG.phone.replace("+", "")}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");

      clearCart();
      toast({ title: "Sipariş kaydedildi", description: "WhatsApp üzerinden siparişiniz iletiliyor." });

      if (isLoggedIn) {
        setLocation("/hesabim?tab=orders");
      } else {
        setLocation("/giris?redirect=" + encodeURIComponent("/hesabim?tab=orders"));
      }
    } catch {
      toast({ title: "Hata", description: "Siparis kaydedilemedi, lutfen tekrar deneyin.", variant: "destructive" });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="btn-back-to-products">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight" data-testid="text-checkout-title">Sepetim</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-checkout-subtitle">
                {itemCount > 0 ? `${itemCount} ürün` : "Sepet boş"}
              </p>
            </div>
          </div>
          {itemCount > 0 && (
            <Badge variant="secondary" className="no-default-hover-elevate" data-testid="text-checkout-total-badge">
              {Math.round(displayTotal)} TL
            </Badge>
          )}
        </div>
      </header>

      <BackNavigation />

      <AnimatePresence>
        {showAuthModal && !isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
              data-testid="modal-auth"
            >
              <div className="sticky top-0 z-10 bg-background rounded-t-2xl border-b px-4 pt-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold" data-testid="text-auth-modal-title">Devam etmek için</h2>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="p-1 rounded-full hover:bg-accent"
                    data-testid="btn-close-auth-modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex rounded-lg bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${authMode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    data-testid="btn-auth-tab-login"
                  >
                    Üye Girişi
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${authMode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    data-testid="btn-auth-tab-register"
                  >
                    Üye Ol
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {authMode === "register" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Ad Soyad</label>
                    <Input
                      type="text"
                      placeholder="Ad Soyad"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="h-10"
                      data-testid="input-auth-name"
                    />
                  </div>
                )}

                {authMode === "register" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Adres</label>
                      <Textarea
                        placeholder="Sokak, bina no, daire no..."
                        value={authAddress}
                        onChange={(e) => setAuthAddress(e.target.value)}
                        rows={2}
                        className="text-sm"
                        data-testid="input-auth-address"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Mahalle</label>
                      <Select value={authMahalle} onValueChange={setAuthMahalle}>
                        <SelectTrigger data-testid="select-auth-mahalle" className={`h-10 text-sm ${!authMahalle ? "text-muted-foreground" : ""}`}>
                          <SelectValue placeholder="Mahallenizi seçiniz" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px] z-[10001]">
                          {TESLIMAT_MAHALLELERI.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      {authLocation ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-green-200 bg-green-50">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-xs text-green-700">Konum alındı</span>
                          <button type="button" onClick={() => setAuthLocation(null)} className="ml-auto text-muted-foreground">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleAuthLocation}
                          disabled={authLocationLoading}
                          data-testid="btn-auth-location"
                        >
                          {authLocationLoading ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4 mr-1.5" />
                          )}
                          {authLocationLoading ? "Konum alınıyor..." : "Konum Ekle"}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Telefon</label>
                  <Input
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={authPhone}
                    onChange={(e) => handleAuthPhoneChange(e.target.value)}
                    className="h-10"
                    data-testid="input-auth-phone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {authMode === "register" ? "Doğum Yılı (Şifreniz olacak)" : "Şifre (Doğum yılınız)"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showAuthPassword ? "text" : "password"}
                      placeholder="Örn: 1990"
                      value={authPassword}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setAuthPassword(val);
                      }}
                      maxLength={4}
                      inputMode="numeric"
                      className="h-10 pr-10"
                      data-testid="input-auth-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full h-11 font-semibold"
                  style={{ backgroundColor: "#6B3480" }}
                  onClick={handleAuthSubmit}
                  disabled={authLoading}
                  data-testid="btn-auth-submit"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  {authMode === "login" ? "Giriş Yap" : "Üye Ol ve Devam Et"}
                </Button>

                {authMode === "login" && (
                  <p className="text-center text-xs text-muted-foreground">
                    Henüz üyeliğiniz yok mu?{" "}
                    <button type="button" onClick={() => setAuthMode("register")} className="font-semibold underline" style={{ color: "#6B3480" }}>
                      Üye Ol
                    </button>
                  </p>
                )}
                {authMode === "register" && (
                  <p className="text-center text-xs text-muted-foreground">
                    Zaten üyeniz var mı?{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="font-semibold underline" style={{ color: "#6B3480" }}>
                      Giriş Yap
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {selectedProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2" data-testid="text-empty-checkout">Sepetiniz boş</p>
            <p className="text-sm mb-6">Ürün eklemek için mağazaya gidin</p>
            <Link href="/">
              <Button variant="default" size="lg" data-testid="btn-go-shopping">
                <ShoppingCart className="w-4 h-4" />
                Alışverişe Başla
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-cart-items">
                Sepetinizdeki Ürünler
              </h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3" data-testid="list-checkout-items">
                    <AnimatePresence>
                      {selectedProducts.map(({ product, qty }) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 py-2 border-b border-dashed last:border-0 flex-wrap"
                          data-testid={`row-checkout-item-${product.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" data-testid={`text-checkout-name-${product.id}`}>
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-checkout-unit-${product.id}`}>
                              {product.price} TL / adet
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQty(String(product.id), -1)}
                              data-testid={`btn-checkout-minus-${product.id}`}
                            >
                              {qty === 1 ? <Trash2 /> : <Minus />}
                            </Button>
                            <span className="w-8 text-center text-sm font-bold" data-testid={`text-checkout-qty-${product.id}`}>
                              {qty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQty(String(product.id), 1)}
                              data-testid={`btn-checkout-plus-${product.id}`}
                            >
                              <Plus />
                            </Button>
                          </div>
                          <span className="text-sm font-bold shrink-0 min-w-[70px] text-right" data-testid={`text-checkout-linetotal-${product.id}`}>
                            {Math.round(qty * product.price)} TL
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </section>


            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-payment">
                Ödeme Seçenekleri
              </h2>
              <Card>
                <CardContent className="p-4">
                  <RadioGroup value={paymentId} onValueChange={(val) => { setPaymentId(val); if (val !== "taksit" && val !== "pos") { setSelectedInstallment(null); } }} data-testid="radio-payment">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const Icon = paymentIcons[opt.id] || CreditCard;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors flex-wrap ${paymentId === opt.id ? "bg-accent" : ""}`}
                          data-testid={`radio-payment-${opt.id}`}
                        >
                          <RadioGroupItem value={opt.id} data-testid={`input-radio-${opt.id}`} />
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium" data-testid={`text-payment-name-${opt.id}`}>{opt.name}</span>
                          {opt.disc > 0 && (
                            <span className="flex-1 text-sm font-bold text-center" data-testid={`text-payment-discounted-${opt.id}`}>
                              {opt.tag}
                            </span>
                          )}
                          {!opt.disc && <span className="flex-1" />}
                          <Badge
                            variant={opt.disc > 0 ? "default" : "secondary"}
                            className="no-default-hover-elevate shrink-0"
                            data-testid={`badge-payment-tag-${opt.id}`}
                          >
                            {opt.disc > 0 ? `${Math.round(displayTotal * (1 - opt.disc))} TL` : opt.id === "taksit" ? opt.tag : `${Math.round(displayTotal)} TL`}
                          </Badge>
                        </label>
                      );
                    })}
                  </RadioGroup>

                  {(paymentId === "taksit" || paymentId === "pos") && installmentRates.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t overflow-hidden"
                      data-testid="section-installments"
                    >
                      <p className="text-sm font-medium text-muted-foreground mb-3">Taksit seçeneğinizi belirleyin:</p>
                      <RadioGroup
                        value={selectedInstallment ? `taksit-${selectedInstallment}` : "tek-cekim"}
                        onValueChange={(val) => {
                          if (val === "tek-cekim") {
                            setSelectedInstallment(null);
                          } else {
                            const months = parseInt(val.replace("taksit-", ""));
                            setSelectedInstallment(months);
                          }
                        }}
                        data-testid="radio-installments"
                      >
                        <div className="rounded-lg border" data-testid="table-installments">
                          <div className="grid grid-cols-3 gap-0 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 p-3 rounded-t-lg">
                            <span>Taksit</span>
                            <span className="text-center">Aylık Ödeme</span>
                            <span className="text-right">Toplam</span>
                          </div>

                          <label
                            className={`grid grid-cols-3 gap-0 p-3 cursor-pointer transition-colors border-b ${selectedInstallment === null ? "bg-primary/5" : "hover:bg-muted/30"}`}
                            data-testid="row-installment-tek"
                          >
                            <span className="flex items-center gap-2">
                              <RadioGroupItem value="tek-cekim" />
                              <span className="text-sm font-medium">Tek Çekim</span>
                            </span>
                            <span className="text-sm text-center font-medium">
                              {displayTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                            </span>
                            <span className="text-sm text-right font-bold">
                              {displayTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                            </span>
                          </label>

                          {installmentRates
                            .sort((a, b) => a.months - b.months)
                            .map((rate) => {
                              const totalWithRate = displayTotal * (1 + rate.rate / 100);
                              const monthly = totalWithRate / rate.months;
                              return (
                                <label
                                  key={rate.id}
                                  className={`grid grid-cols-3 gap-0 p-3 cursor-pointer transition-colors border-b last:border-0 ${selectedInstallment === rate.months ? "bg-primary/5" : "hover:bg-muted/30"}`}
                                  data-testid={`row-installment-${rate.months}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <RadioGroupItem value={`taksit-${rate.months}`} />
                                    <span className="text-sm font-medium">{rate.months} Taksit</span>
                                  </span>
                                  <span className="text-sm text-center font-medium">
                                    {monthly.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                                  </span>
                                  <span className="text-sm text-right font-bold">
                                    {totalWithRate.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      </RadioGroup>

                      {selectedInstallment && (() => {
                        const rate = installmentRates.find((r) => r.months === selectedInstallment);
                        if (!rate) return null;
                        const totalCharged = displayTotal * (1 + rate.rate / 100);
                        const monthlyPayment = totalCharged / rate.months;
                        return (
                          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20" data-testid="text-selected-installment">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Taksit Sayısı</p>
                                <p className="text-base font-bold text-primary">{selectedInstallment}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Aylık Taksit</p>
                                <p className="text-base font-bold text-primary">{monthlyPayment.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Karttan Çekilecek</p>
                                <p className="text-base font-bold text-primary">{totalCharged.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-progress">
                İlerleme Durumu
              </h2>
              <Card>
                <CardContent className="p-4 space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        <span className="text-sm font-medium" data-testid="text-min-label">Minimum Sipariş</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground" data-testid="text-min-progress">
                        {Math.round(subtotal)}/{CONFIG.minLimit} TL
                      </span>
                    </div>
                    <Progress
                      value={minPerc}
                      className="h-2 [&>div]:bg-amber-500 dark:[&>div]:bg-amber-400"
                      data-testid="bar-min"
                    />
                    <p className="text-xs font-medium mt-1.5 text-muted-foreground" data-testid="text-min-hint">
                      {subtotal >= CONFIG.minLimit ? (
                        <span className="text-chart-2 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Minimum tutar aşıldı
                        </span>
                      ) : (
                        `Minimum sipariş için ${Math.round(CONFIG.minLimit - subtotal)} TL daha ekleyin`
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Truck className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium" data-testid="text-ship-label">Ücretsiz Teslimat</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground" data-testid="text-ship-progress">
                        {Math.round(subtotal)}/{CONFIG.shipLimit} TL
                      </span>
                    </div>
                    <Progress
                      value={shipPerc}
                      className="h-2"
                      data-testid="bar-ship"
                    />
                    <p className="text-xs font-medium mt-1.5 text-muted-foreground" data-testid="text-ship-hint">
                      {subtotal >= CONFIG.shipLimit ? (
                        <span className="text-chart-2 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ücretsiz teslimat kazandınız!
                        </span>
                      ) : (
                        `Ücretsiz teslimat için ${Math.round(CONFIG.shipLimit - subtotal)} TL daha ekleyin`
                      )}
                    </p>
                    {subtotal < CONFIG.shipLimit && (
                      <Link href="/">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 font-bold border-primary text-primary hover:bg-primary hover:text-white"
                          data-testid="btn-continue-shopping"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          ALIŞVERİŞE DEVAM ET
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-summary">
                Sipariş Özeti
              </h2>
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="text-muted-foreground">Ara Toplam</span>
                      <span className="font-medium" data-testid="text-subtotal">{Math.round(subtotal)} TL</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between gap-3 text-chart-2 flex-wrap">
                        <span data-testid="text-discount-label">İndirim ({PAYMENT_OPTIONS.find((p) => p.id === paymentId)?.tag})</span>
                        <span className="font-medium" data-testid="text-discount">-{Math.round(discount)} TL</span>
                      </div>
                    )}
                    {isLoggedIn && pointsBalance > 0 && (
                      <div className="flex justify-between items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-sm"
                          onClick={() => setUsePoints(!usePoints)}
                          data-testid="btn-toggle-points"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${usePoints ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                            {usePoints && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <Star className="w-3.5 h-3.5" style={{ color: "#e65100" }} />
                          <span style={{ color: "#e65100" }}>Para Puan ({pointsBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL)</span>
                        </button>
                        {usePoints && pointsDiscount > 0 && (
                          <span className="font-medium" style={{ color: "#2e7d32" }} data-testid="text-points-discount">
                            -{pointsDiscount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="text-muted-foreground">Teslimat Ücreti</span>
                      <span className="font-medium" data-testid="text-shipping">
                        {shipping === 0 ? (
                          <span className="text-chart-2">Ücretsiz</span>
                        ) : (
                          `${shipping} TL`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t flex-wrap">
                    <span className="text-lg font-bold">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-primary" data-testid="text-total">
                      {Math.round(displayTotal)} TL
                    </span>
                  </div>

                  <Button
                    className="w-full mt-5"
                    variant="default"
                    size="lg"
                    disabled={!minReached || selectedProducts.length === 0 || orderLoading}
                    onClick={handleOrder}
                    data-testid="btn-order-whatsapp"
                  >
                    {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SiWhatsapp className="w-5 h-5" />}
                    {orderLoading ? "Kaydediliyor..." : "Siparişi Ver"}
                  </Button>

                  {!minReached && selectedProducts.length > 0 && (
                    <p className="text-xs text-center mt-2 text-muted-foreground" data-testid="text-min-warning">
                      Minimum sipariş tutarı {CONFIG.minLimit} TL'dir
                    </p>
                  )}

                  <Link href="/">
                    <Button
                      className="w-full mt-3"
                      variant="outline"
                      size="lg"
                      data-testid="btn-go-home"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Alışverişe Devam Et
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>

            <div className="mt-6 text-center">
              <Link href="/siparis-takip">
                <Button variant="ghost" size="sm" data-testid="link-order-tracking">
                  <Search className="w-4 h-4" />
                  Sipariş Takip
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
