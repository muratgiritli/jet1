import { useState, useEffect, useCallback, useRef } from "react";
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
  ShieldCheck,
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
  const [authStep, setAuthStep] = useState<"phone" | "otp" | "register">("phone");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState(["", "", "", "", "", ""]);
  const [authName, setAuthName] = useState("");
  const [authAddress, setAuthAddress] = useState("");
  const [authMahalle, setAuthMahalle] = useState("");
  const [authLocation, setAuthLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [authLocationLoading, setAuthLocationLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authIsExisting, setAuthIsExisting] = useState(false);
  const [authCountdown, setAuthCountdown] = useState(0);
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({});
  const authOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const authVerifyingRef = useRef(false);
  const { toast } = useToast();
  const { customer, isLoggedIn, loginWithOtp, updateProfile } = useCustomer();

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
      setAuthErrors((p) => ({ ...p, location: "Tarayıcınız konum paylaşımını desteklemiyor" }));
      return;
    }
    setAuthLocationLoading(true);
    setAuthErrors((p) => ({ ...p, location: "" }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAuthLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAuthLocationLoading(false);
      },
      () => {
        setAuthLocationLoading(false);
        setAuthErrors((p) => ({ ...p, location: "Konum alınamadı. Lütfen konum izni verin." }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (authCountdown <= 0) return;
    const t = setTimeout(() => setAuthCountdown(authCountdown - 1), 1000);
    return () => clearTimeout(t);
  }, [authCountdown]);

  const handleAuthSendOtp = async () => {
    const normalized = authPhone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setAuthErrors({ phone: "Geçerli bir telefon numarası girin" });
      return;
    }
    setAuthErrors({});
    setAuthLoading(true);
    try {
      const res = await apiRequest("POST", "/api/otp/send", { phone: normalized });
      const data = await res.json();
      setAuthIsExisting(data.isExisting);
      setAuthStep("otp");
      setAuthCountdown(180);
      setAuthOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => authOtpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      let msg = "SMS gönderilemedi";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setAuthErrors({ phone: msg });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...authOtpCode];
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("");
      for (let i = 0; i < 6; i++) newCode[i] = digits[i] || "";
      setAuthOtpCode(newCode);
      authOtpRefs.current[Math.min(digits.length - 1, 5)]?.focus();
      if (newCode.every(d => d !== "") && !authVerifyingRef.current) {
        authVerifyingRef.current = true;
        setTimeout(() => doAuthVerify(newCode.join("")), 150);
      }
      return;
    }
    newCode[index] = value;
    setAuthOtpCode(newCode);
    if (value && index < 5) authOtpRefs.current[index + 1]?.focus();
    if (newCode.every(d => d !== "") && !authVerifyingRef.current) {
      authVerifyingRef.current = true;
      setTimeout(() => doAuthVerify(newCode.join("")), 150);
    }
  };

  const handleAuthOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !authOtpCode[index] && index > 0) {
      authOtpRefs.current[index - 1]?.focus();
    }
  };

  const doAuthVerify = async (code: string) => {
    if (code.length !== 6) { authVerifyingRef.current = false; return; }
    setAuthErrors({});
    setAuthLoading(true);
    const normalized = authPhone.replace(/\D/g, "");
    try {
      if (authIsExisting) {
        await loginWithOtp(normalized, code);
        setShowAuthModal(false);
        setPendingOrderAfterAuth(true);
      } else {
        setAuthStep("register");
      }
    } catch (err: any) {
      let msg = "Doğrulama kodu hatalı";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setAuthErrors({ otp: msg });
    } finally {
      setAuthLoading(false);
      authVerifyingRef.current = false;
    }
  };

  const handleAuthVerifyOtp = () => doAuthVerify(authOtpCode.join(""));

  const handleAuthRegister = async () => {
    const errors: Record<string, string> = {};
    if (!authName.trim()) errors.name = "Ad soyad girin";
    if (Object.keys(errors).length > 0) { setAuthErrors(errors); return; }
    setAuthErrors({});
    setAuthLoading(true);
    const normalized = authPhone.replace(/\D/g, "");
    const code = authOtpCode.join("");
    const fullAddress = [authMahalle, authAddress.trim()].filter(Boolean).join(", ");
    try {
      await loginWithOtp(normalized, code, authName.trim(), fullAddress || undefined);
      if (authMahalle) {
        localStorage.setItem("jet55_mahalle", authMahalle);
        setSelectedMahalle(authMahalle);
        setMahalleSaved(true);
      }
      if (authLocation) {
        setCustomerLocation(authLocation);
      }
      setShowAuthModal(false);
      setPendingOrderAfterAuth(true);
    } catch (err: any) {
      let msg = "Bir hata oluştu";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setAuthErrors({ general: msg });
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
    hasCampaignItems,
    campaignMainCount,
    campaignExtraCount,
    campaignValid,
  } = useCart();

  const CAMPAIGN_SHIP_LIMIT = 4000;
  const campaignShipping = hasCampaignItems ? (subtotal >= CAMPAIGN_SHIP_LIMIT ? 0 : CONFIG.shipFee) : shipping;
  const campaignDiscount = hasCampaignItems ? 0 : discount;
  const campaignGrandTotal = hasCampaignItems ? (subtotal + campaignShipping) : grandTotal;

  const effectiveShipping = hasCampaignItems ? campaignShipping : shipping;
  const effectiveDiscount = hasCampaignItems ? campaignDiscount : discount;
  const effectiveGrandTotal = hasCampaignItems ? campaignGrandTotal : grandTotal;

  const pointsDiscount = !hasCampaignItems && isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, effectiveGrandTotal) : 0;
  const displayTotal = pointsDiscount > 0 ? Math.max(0, effectiveGrandTotal - pointsDiscount) : effectiveGrandTotal;

  const [locationError, setLocationError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [pendingOrderAfterAuth, setPendingOrderAfterAuth] = useState(false);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Tarayıcınız konum paylaşımını desteklemiyor");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationError("Konum alınamadı. Lütfen konum izni verin.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOrder = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (hasCampaignItems && !campaignValid) {
      setOrderError("Kampanyadan faydalanmak için sepete en az 1 ana ürün ve 1 ek ürün ekleyin.");
      return;
    }
    if (!minReached || selectedProducts.length === 0 || orderLoading || !selectedMahalle) {
      if (!selectedMahalle) {
        setOrderError("Mahalle seçimi yapınız.");
      }
      return;
    }
    setOrderError("");
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

      const payMethod = hasCampaignItems ? "Kapıda Nakit" : pay.name;
      const pointsUsed = !hasCampaignItems && isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, effectiveGrandTotal) : 0;
      const finalTotal = pointsUsed > 0 ? Math.max(0, effectiveGrandTotal - pointsUsed) : effectiveGrandTotal;

      const orderPayload: Record<string, unknown> = {
        items: orderItems,
        subtotal,
        shipping: effectiveShipping,
        discount: effectiveDiscount,
        grandTotal: finalTotal,
        paymentMethod: payMethod,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: selectedMahalle + (customerAddress.trim() ? ", " + customerAddress.trim() : ""),
        usedPoints: pointsUsed > 0 ? pointsUsed : undefined,
      };

      if (pay.id === "taksit" && selectedInstallment) {
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
      if (effectiveDiscount > 0) msg += `\n*İndirim (${pay.tag}):* -${Math.round(effectiveDiscount)} TL`;
      if (pointsUsed > 0) msg += `\n*Para Puan İndirimi:* -${pointsUsed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL`;
      msg += `\n*Teslimat:* ${effectiveShipping === 0 ? "Ücretsiz" : effectiveShipping + " TL"}`;
      msg += `\n*Genel Toplam:* ${Math.round(finalTotal)} TL`;
      msg += `\n*Ödeme:* ${payMethod}`;
      if (hasCampaignItems) msg += `\n*Kampanya Siparişi*`;
      if (!hasCampaignItems && pay.id === "taksit" && selectedInstallment) {
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

      if (isLoggedIn) {
        setLocation("/hesabim?tab=orders");
      } else {
        setLocation("/giris?redirect=" + encodeURIComponent("/hesabim?tab=orders"));
      }
    } catch (err: any) {
      let errorMsg = "Sipariş kaydedilemedi, lütfen tekrar deneyin.";
      try {
        const raw = err?.message || "";
        const jsonPart = raw.replace(/^\d+:\s*/, "");
        const parsed = JSON.parse(jsonPart);
        if (parsed.message) errorMsg = parsed.message;
      } catch {
        // keep default
      }
      setOrderError(errorMsg);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (pendingOrderAfterAuth && isLoggedIn && !showAuthModal) {
      setPendingOrderAfterAuth(false);
      setTimeout(() => handleOrder(), 300);
    }
  }, [pendingOrderAfterAuth, isLoggedIn, showAuthModal]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
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
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold" data-testid="text-auth-modal-title">
                    {authStep === "phone" && "Giriş / Üye Ol"}
                    {authStep === "otp" && "Doğrulama Kodu"}
                    {authStep === "register" && "Bilgilerinizi Tamamlayın"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setShowAuthModal(false); setAuthStep("phone"); setAuthErrors({}); }}
                    className="p-1 rounded-full hover:bg-accent"
                    data-testid="btn-close-auth-modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {authStep === "phone" && (
                  <>
                    <p className="text-xs text-muted-foreground text-center">Telefon numaranıza SMS ile doğrulama kodu göndereceğiz</p>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Telefon</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-medium shrink-0">+90</span>
                        <Input
                          type="tel"
                          placeholder="5XX XXX XX XX"
                          value={authPhone}
                          onChange={(e) => { handleAuthPhoneChange(e.target.value); setAuthErrors({}); }}
                          className={`h-10 ${authErrors.phone ? "border-red-400" : ""}`}
                          data-testid="input-auth-phone"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAuthSendOtp(); } }}
                        />
                      </div>
                      {authErrors.phone && <p className="text-[11px] text-red-500 mt-0.5">{authErrors.phone}</p>}
                    </div>
                    <Button
                      className="w-full h-11 font-semibold"
                      style={{ backgroundColor: "#6B3480" }}
                      onClick={handleAuthSendOtp}
                      disabled={authLoading}
                      data-testid="btn-send-otp"
                    >
                      {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      SMS Kodu Gönder
                    </Button>
                  </>
                )}

                {authStep === "otp" && (
                  <>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                      <span className="text-xs text-purple-700">+90 {authPhone} numarasına kod gönderildi</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground text-center block">Doğrulama Kodu</label>
                      <div className="flex gap-2 justify-center">
                        {authOtpCode.map((digit, i) => (
                          <Input
                            key={i}
                            ref={(el) => { authOtpRefs.current[i] = el; }}
                            value={digit}
                            onChange={(e) => handleAuthOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleAuthOtpKeyDown(i, e)}
                            onPaste={(e) => { e.preventDefault(); handleAuthOtpChange(0, e.clipboardData.getData("text").replace(/\D/g, "")); }}
                            type="tel"
                            inputMode="numeric"
                            maxLength={1}
                            className={`w-10 h-12 text-center text-lg font-bold ${authErrors.otp ? "border-red-400" : ""}`}
                            data-testid={`input-auth-otp-${i}`}
                          />
                        ))}
                      </div>
                      {authErrors.otp && <p className="text-[11px] text-red-500 text-center mt-1">{authErrors.otp}</p>}
                    </div>
                    {authCountdown > 0 && (
                      <p className="text-xs text-center text-muted-foreground">
                        Kod {Math.floor(authCountdown / 60)}:{(authCountdown % 60).toString().padStart(2, "0")} süre geçerli
                      </p>
                    )}
                    <Button
                      className="w-full h-11 font-semibold"
                      style={{ backgroundColor: "#6B3480" }}
                      onClick={handleAuthVerifyOtp}
                      disabled={authLoading || authOtpCode.join("").length !== 6}
                      data-testid="btn-verify-otp"
                    >
                      {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Doğrula
                    </Button>
                    <div className="flex items-center justify-between">
                      <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => { setAuthStep("phone"); setAuthErrors({}); }} data-testid="btn-auth-back-phone">
                        ← Numarayı Değiştir
                      </button>
                      {authCountdown <= 0 && (
                        <button type="button" className="text-xs hover:underline" style={{ color: "#6B3480" }} onClick={handleAuthSendOtp} disabled={authLoading} data-testid="btn-auth-resend">
                          Tekrar Gönder
                        </button>
                      )}
                    </div>
                  </>
                )}

                {authStep === "register" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Ad Soyad</label>
                      <Input
                        type="text"
                        placeholder="Ad Soyad"
                        value={authName}
                        onChange={(e) => { setAuthName(e.target.value); setAuthErrors((p) => ({ ...p, name: "" })); }}
                        className={`h-10 ${authErrors.name ? "border-red-400" : ""}`}
                        data-testid="input-auth-name"
                      />
                      {authErrors.name && <p className="text-[11px] text-red-500 mt-0.5">{authErrors.name}</p>}
                    </div>
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
                    <div className="lg:hidden">
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
                          {authLocationLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Navigation className="w-4 h-4 mr-1.5" />}
                          {authLocationLoading ? "Konum alınıyor..." : "Konum Ekle"}
                        </Button>
                      )}
                      {authErrors.location && <p className="text-[11px] text-red-500 mt-1">{authErrors.location}</p>}
                    </div>
                    {authErrors.general && <p className="text-[11px] text-red-500 text-center">{authErrors.general}</p>}
                    <Button
                      className="w-full h-11 font-semibold"
                      style={{ backgroundColor: "#6B3480" }}
                      onClick={handleAuthRegister}
                      disabled={authLoading}
                      data-testid="btn-auth-submit"
                    >
                      {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Üye Ol ve Devam Et
                    </Button>
                    <button type="button" className="text-xs text-muted-foreground hover:underline mx-auto block" onClick={() => { setAuthStep("phone"); setAuthErrors({}); }}>
                      ← Başa Dön
                    </button>
                  </>
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
                  {hasCampaignItems ? (
                    <div className="p-3 rounded-md bg-accent" data-testid="campaign-payment-only">
                      <div className="flex items-center gap-3">
                        <Banknote className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">Kapıda Nakit</span>
                        <span className="flex-1" />
                        <Badge variant="secondary" className="no-default-hover-elevate shrink-0">
                          {Math.round(displayTotal)} TL
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Kampanya siparislerinde sadece kapida nakit odeme gecerlidir.</p>
                    </div>
                  ) : (
                  <RadioGroup value={paymentId} onValueChange={(val) => { setPaymentId(val); if (val !== "taksit") { setSelectedInstallment(null); } }} data-testid="radio-payment">
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
                  )}

                  {paymentId === "taksit" && installmentRates.length > 0 && (
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
                        {Math.round(subtotal)}/{hasCampaignItems ? CAMPAIGN_SHIP_LIMIT : CONFIG.shipLimit} TL
                      </span>
                    </div>
                    <Progress
                      value={Math.min((subtotal / (hasCampaignItems ? CAMPAIGN_SHIP_LIMIT : CONFIG.shipLimit)) * 100, 100)}
                      className="h-2"
                      data-testid="bar-ship"
                    />
                    <p className="text-xs font-medium mt-1.5 text-muted-foreground" data-testid="text-ship-hint">
                      {subtotal >= (hasCampaignItems ? CAMPAIGN_SHIP_LIMIT : CONFIG.shipLimit) ? (
                        <span className="text-chart-2 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ücretsiz teslimat kazandınız!
                        </span>
                      ) : (
                        `Ücretsiz teslimat için ${Math.round((hasCampaignItems ? CAMPAIGN_SHIP_LIMIT : CONFIG.shipLimit) - subtotal)} TL daha ekleyin`
                      )}
                    </p>
                    {subtotal < (hasCampaignItems ? CAMPAIGN_SHIP_LIMIT : CONFIG.shipLimit) && (
                      <Link href={hasCampaignItems ? "/kampanya" : "/"}>
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

                  {hasCampaignItems && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-orange-600">Kampanya Durumu</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          {campaignMainCount >= 1 ? (
                            <Check className="w-3 h-3 text-chart-2" />
                          ) : (
                            <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
                          )}
                          <span>Ana ürün: {campaignMainCount} adet ({campaignMainCount >= 1 ? "Tamam" : "En az 1 gerekli"})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {campaignExtraCount >= 1 ? (
                            <Check className="w-3 h-3 text-chart-2" />
                          ) : (
                            <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
                          )}
                          <span>Ek ürün: {campaignExtraCount} adet ({campaignExtraCount >= 1 ? "Tamam" : "En az 1 gerekli"})</span>
                        </div>
                      </div>
                      {!campaignValid && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                          Kampanyadan faydalanmak için sepete en az 1 ana ürün ve 1 ek ürün ekleyin.
                        </p>
                      )}
                    </div>
                  )}
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
                    {effectiveDiscount > 0 && (
                      <div className="flex justify-between gap-3 text-chart-2 flex-wrap">
                        <span data-testid="text-discount-label">İndirim ({PAYMENT_OPTIONS.find((p) => p.id === paymentId)?.tag})</span>
                        <span className="font-medium" data-testid="text-discount">-{Math.round(effectiveDiscount)} TL</span>
                      </div>
                    )}
                    {!hasCampaignItems && isLoggedIn && pointsBalance > 0 && (
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
                        {effectiveShipping === 0 ? (
                          <span className="text-chart-2">Ücretsiz</span>
                        ) : (
                          `${effectiveShipping} TL`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t flex-wrap">
                    <span className="text-lg font-bold">Genel Toplam</span>
                    {paymentId === "taksit" && selectedInstallment ? (() => {
                      const rate = installmentRates.find((r) => r.months === selectedInstallment);
                      if (!rate) return <span className="text-2xl font-extrabold text-primary" data-testid="text-total">{Math.round(displayTotal)} TL</span>;
                      const totalWithRate = displayTotal * (1 + rate.rate / 100);
                      return (
                        <div className="text-right" data-testid="text-total">
                          <span className="text-2xl font-extrabold text-primary">
                            {totalWithRate.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </span>
                          <p className="text-xs text-muted-foreground">{selectedInstallment} Taksit × {(totalWithRate / selectedInstallment).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</p>
                        </div>
                      );
                    })() : (
                      <span className="text-2xl font-extrabold text-primary" data-testid="text-total">
                        {Math.round(displayTotal)} TL
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full mt-5"
                    variant="default"
                    size="lg"
                    disabled={!minReached || selectedProducts.length === 0 || orderLoading || (hasCampaignItems && !campaignValid)}
                    onClick={handleOrder}
                    data-testid="btn-order-whatsapp"
                  >
                    {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SiWhatsapp className="w-5 h-5" />}
                    {orderLoading ? "Kaydediliyor..." : "Siparişi Ver"}
                  </Button>

                  {orderError && (
                    <p className="text-[12px] text-red-500 text-center mt-2">{orderError}</p>
                  )}

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
