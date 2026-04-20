import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  X,
  LogIn,
  Star,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Gift,
  Home,
  User as UserIcon,
  ArrowRight,
  Phone as PhoneIcon,
  Clock,
} from "lucide-react";
import SEO from "@/components/SEO";
import InstallmentBanner from "@/components/InstallmentBanner";
import {
  CONFIG,
  PAYMENT_OPTIONS,
  TESLIMAT_MAHALLELERI,
} from "@/lib/data";
import { useCart } from "@/contexts/CartContext";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCustomer } from "@/contexts/CustomerContext";
const paymentIcons: Record<string, typeof CreditCard> = {
  online: ShieldCheck,
  nakit: Banknote,
  eft: Wallet,
  qr: QrCode,
  pos: CreditCard,
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
  const [editingInfo, setEditingInfo] = useState(false);
  const [usePoints, setUsePoints] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<"phone" | "otp" | "register">("phone");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState(["", "", "", "", "", ""]);
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authIsExisting, setAuthIsExisting] = useState(false);
  const [authCountdown, setAuthCountdown] = useState(0);
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({});
  const authOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const authVerifyingRef = useRef(false);
  const { customer, isLoggedIn, loginWithOtp, updateProfile } = useCustomer();

  const { data: loyaltyData } = useQuery<{ balance: number }>({
    queryKey: ["/api/customer/loyalty-points"],
    enabled: isLoggedIn,
  });

  const pointsBalance = loyaltyData?.balance || 0;

  const { data: publicSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/public-settings"],
  });
  const eftEnabled = publicSettings?.payment_eft_enabled === "true";

  const { data: savedAddresses = [] } = useQuery<any[]>({
    queryKey: ["/api/customer/addresses"],
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (isLoggedIn && customer) {
      setCustomerPhone(customer.phone);
      setCustomerName(customer.name);
      const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];
      const addrStr = defaultAddr?.address || customer.address || "";
      if (addrStr) {
        setCustomerAddress(addrStr);
      }
      setIsReturningCustomer(true);
      setLookupDone(true);
    }
  }, [isLoggedIn, customer, savedAddresses]);


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
      let deviceToken: string | undefined;
      try {
        const tokens = JSON.parse(localStorage.getItem("jetgo_trusted_devices") || "{}");
        deviceToken = tokens[normalized];
      } catch {}
      const res = await apiRequest("POST", "/api/otp/send", { phone: normalized, deviceToken });
      const data = await res.json();
      if (data.trustedLogin && data.customer) {
        window.location.reload();
        return;
      }
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

  useEffect(() => {
    if (authStep !== "otp") return;
    if (!("OTPCredential" in window)) return;
    const ac = new AbortController();
    (navigator as any).credentials.get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((otp: any) => {
        if (otp?.code) {
          const digits = otp.code.replace(/\D/g, "");
          if (digits.length === 6) {
            setAuthOtpCode(digits.split(""));
            if (!authVerifyingRef.current) {
              authVerifyingRef.current = true;
              setTimeout(() => doAuthVerify(digits), 150);
            }
          }
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [authStep]);

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
      } else if (authMode === "login") {
        setAuthErrors({ otp: "Bu numara kayıtlı değil. Lütfen 'Yeni Üye Ol' sekmesinden kayıt olun." });
        return;
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

  const [authMahalle, setAuthMahalle] = useState("");
  const [authCadde, setAuthCadde] = useState("");
  const [authSokak, setAuthSokak] = useState("");
  const [authKapiNo, setAuthKapiNo] = useState("");
  const [authApartmanAdi, setAuthApartmanAdi] = useState("");
  const [authKatNo, setAuthKatNo] = useState("");
  const [authDaireNo, setAuthDaireNo] = useState("");
  const [authAsansor, setAuthAsansor] = useState<"var" | "yok" | "">("");

  const handleAuthRegister = async () => {
    const errors: Record<string, string> = {};
    if (!authName.trim()) errors.name = "Ad soyad girin";
    if (Object.keys(errors).length > 0) { setAuthErrors(errors); return; }
    setAuthErrors({});
    setAuthLoading(true);
    const normalized = authPhone.replace(/\D/g, "");
    const code = authOtpCode.join("");
    const addressParts = [
      authMahalle,
      authCadde.trim() ? `Cadde: ${authCadde.trim()}` : "",
      authSokak.trim() ? `Sokak: ${authSokak.trim()}` : "",
      authKapiNo.trim() ? `Kapı No: ${authKapiNo.trim()}` : "",
      authApartmanAdi.trim() ? `Apartman: ${authApartmanAdi.trim()}` : "",
      authKatNo.trim() ? `Kat: ${authKatNo.trim()}` : "",
      authDaireNo.trim() ? `Daire: ${authDaireNo.trim()}` : "",
      authAsansor ? `Asansör: ${authAsansor === "var" ? "Var" : "Yok"}` : "",
    ].filter(Boolean).join(", ");
    try {
      await loginWithOtp(normalized, code, authName.trim(), addressParts || undefined);
      if (authMahalle) localStorage.setItem("jet55_mahalle", authMahalle);
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
  const [stockWarning, setStockWarning] = useState("");
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [paytrOrderId, setPaytrOrderId] = useState<number | null>(null);
  const [paytrPolling, setPaytrPolling] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
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
    campaignCartIds,
    isPreorderProduct,
  } = useCart();

  const [orderError, setOrderError] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("hemen");
  const [pendingOrderAfterAuth, setPendingOrderAfterAuth] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message: string; discountAmount?: number; discountType?: string; discountValue?: number } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const stdShipping = subtotal >= CONFIG.shipLimit ? 0 : CONFIG.shipFee;
  const stdMinReached = subtotal >= CONFIG.minLimit;

  const CAMPAIGN_SHIP_LIMIT = 4000;
  const campaignShipping = hasCampaignItems ? (subtotal >= CAMPAIGN_SHIP_LIMIT ? 0 : CONFIG.shipFee) : stdShipping;
  const campaignDiscount = hasCampaignItems ? 0 : discount;
  const normalGrandTotal = subtotal - discount + stdShipping;
  const campaignGrandTotal = hasCampaignItems ? (subtotal + campaignShipping) : normalGrandTotal;

  const effectiveShipping = hasCampaignItems ? campaignShipping : stdShipping;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const effectiveDiscount = (hasCampaignItems ? campaignDiscount : discount) + couponDiscountAmount;
  const effectiveGrandTotal = Math.max(0, (hasCampaignItems ? campaignGrandTotal : normalGrandTotal) - couponDiscountAmount);
  const effectiveMinReached = hasCampaignItems ? minReached : stdMinReached;

  const selectedPay = PAYMENT_OPTIONS.find((p) => p.id === paymentId);
  const paymentDiscountRate = !hasCampaignItems && selectedPay && selectedPay.disc < 0 ? Math.abs(selectedPay.disc) : 0;
  const paymentDiscountAmount = Math.round(effectiveGrandTotal * paymentDiscountRate);
  const totalAfterPaymentDisc = Math.max(0, effectiveGrandTotal - paymentDiscountAmount);

  const pointsDiscount = !hasCampaignItems && isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, totalAfterPaymentDisc) : 0;
  const displayTotal = (pointsDiscount > 0 ? Math.max(0, totalAfterPaymentDisc - pointsDiscount) : totalAfterPaymentDisc) + donationAmount;

  const [autoApplyAttemptedSubtotal, setAutoApplyAttemptedSubtotal] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !customer?.welcomeCoupon || appliedCoupon || subtotal <= 0) return;
    const wc = customer.welcomeCoupon;
    const minAmount = wc.minOrderAmount || 0;
    if (subtotal < minAmount) return;
    if (autoApplyAttemptedSubtotal !== null && subtotal <= autoApplyAttemptedSubtotal) return;
    setAutoApplyAttemptedSubtotal(subtotal);
    const code = wc.code.trim().toUpperCase();
    (async () => {
      try {
        const res = await apiRequest("POST", "/api/coupons/validate", { code, subtotal });
        const data = await res.json();
        if (data.valid) {
          setCouponCode(code);
          setAppliedCoupon({ code, discountAmount: data.discountAmount });
          setCouponResult(data);
        }
      } catch {}
    })();
  }, [isLoggedIn, customer, subtotal, appliedCoupon, autoApplyAttemptedSubtotal]);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponResult(null);
    try {
      const res = await apiRequest("POST", "/api/coupons/validate", { code, subtotal });
      const data = await res.json();
      setCouponResult(data);
      if (data.valid) {
        setAppliedCoupon({ code, discountAmount: data.discountAmount });
      } else {
        setAppliedCoupon(null);
      }
    } catch {
      setCouponResult({ valid: false, message: "Kupon doğrulanamadı" });
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponResult(null);
    setCouponCode("");
  };

  const handleOrder = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!customerName.trim()) {
      setOrderError("Lütfen ad soyad bilginizi girin.");
      return;
    }
    if (!customerPhone.trim()) {
      setOrderError("Lütfen telefon numaranızı girin.");
      return;
    }
    if (!customerAddress.trim()) {
      setOrderError("Lütfen teslimat adresinizi girin.");
      return;
    }
    if (hasCampaignItems && !campaignValid) {
      setOrderError("Kampanyadan yararlanmak için sepete en az 1 ana ürün ve 1 ek ürün eklemeniz gerekmektedir.");
      return;
    }
    if (!effectiveMinReached || selectedProducts.length === 0 || orderLoading) {
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
      const payDiscRate = !hasCampaignItems && pay.disc < 0 ? Math.abs(pay.disc) : 0;
      const payDiscAmount = Math.round(effectiveGrandTotal * payDiscRate);
      const totalAfterPayDisc = Math.max(0, effectiveGrandTotal - payDiscAmount);
      const pointsUsed = !hasCampaignItems && isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, totalAfterPayDisc) : 0;
      const finalTotal = (pointsUsed > 0 ? Math.max(0, totalAfterPayDisc - pointsUsed) : totalAfterPayDisc) + donationAmount;

      const orderPayload: Record<string, unknown> = {
        items: orderItems,
        subtotal,
        shipping: effectiveShipping,
        discount: hasCampaignItems ? 0 : discount,
        grandTotal: finalTotal,
        paymentMethod: payMethod,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        usedPoints: pointsUsed > 0 ? pointsUsed : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        donationAmount: donationAmount > 0 ? donationAmount : undefined,
        customerNote: orderNote.trim() || undefined,
        deliverySlot: deliverySlot || undefined,
        campaignProductIds: hasCampaignItems ? Array.from(campaignCartIds) : undefined,
      };

      const orderRes = await apiRequest("POST", "/api/orders", orderPayload);
      const orderJson = await orderRes.json();

      if (payMethod === "Online Kredi Kartı" && orderJson?.paytrToken) {
        window.location.href = `https://www.paytr.com/odeme/guvenli/${orderJson.paytrToken}`;
        return;
      }

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-XXXXXXXXXX/CONVERSION_LABEL",
          value: grandTotal,
          currency: "TRY",
        });
      }

      const trimmedAddress = customerAddress.trim();
      if (isLoggedIn && trimmedAddress) {
        try {
          await updateProfile({ address: trimmedAddress });
        } catch {}
        try {
          const existingMatch = savedAddresses.find((a: any) => a.address === trimmedAddress);
          if (!existingMatch) {
            await apiRequest("POST", "/api/customer/addresses", {
              label: "Ev",
              address: trimmedAddress,
              isDefault: savedAddresses.length === 0,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/customer/addresses"] });
          }
        } catch {}
      }

      clearCart();

      queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });

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
    if (pendingOrderAfterAuth && isLoggedIn && !showAuthModal && customerName.trim()) {
      setPendingOrderAfterAuth(false);
      setTimeout(() => handleOrder(), 300);
    }
  }, [pendingOrderAfterAuth, isLoggedIn, showAuthModal, customerName]);

  useEffect(() => {
    if (!paytrPolling || !paytrOrderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${paytrOrderId}/payment-status`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.paymentStatus === "paid") {
          clearInterval(interval);
          setPaytrPolling(false);
          setPaytrToken(null);
          clearCart();
          queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
          setLocation("/odeme-sonuc?orderId=" + paytrOrderId + "&success=1");
        } else if (data.paymentStatus === "failed") {
          clearInterval(interval);
          setPaytrPolling(false);
          setPaytrToken(null);
          setLocation("/odeme-sonuc?orderId=" + paytrOrderId + "&fail=1");
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [paytrPolling, paytrOrderId]);

  useEffect(() => {
    if (!paytrToken) return;
    const existing = document.getElementById("paytr-iframe-script");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "paytr-iframe-script";
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.async = true;
    script.onload = () => {
      try {
        (window as any).iFrameResize?.({ checkOrigin: false }, "#paytriframe");
      } catch {}
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [paytrToken]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <SEO
        title="Sepet ve Ödeme | JETGO Pet Shop Samsun"
        description="JETGO Pet Shop sepetiniz. Kapıda nakit, kredi kartı, havale/EFT ile ödeme. Samsun içi aynı gün teslimat."
        noindex
      />
      {paytrToken && (
        <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" data-testid="modal-paytr">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: "95vh" }}>
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <div>
                  <p className="font-bold text-sm">Güvenli Ödeme</p>
                  <p className="text-xs text-white/80">PayTR ile koruma altında</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Ödemeyi iptal etmek istediğinize emin misiniz? Siparişiniz iptal edilecektir.")) {
                    setPaytrToken(null);
                    setPaytrPolling(false);
                    setPaytrOrderId(null);
                  }
                }}
                className="p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                data-testid="btn-close-paytr"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <iframe
                id="paytriframe"
                src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                frameBorder="0"
                scrolling="no"
                style={{ width: "100%", minHeight: "600px", border: "none" }}
                data-testid="iframe-paytr"
                title="PayTR Ödeme"
              />
            </div>
            <div className="p-3 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-600 mb-2">Ödeme sayfası açılmıyor mu?</p>
              <a
                href={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                data-testid="link-paytr-newtab"
              >
                Yeni sekmede güvenli ödeme sayfasını aç
              </a>
              <p className="text-[10px] text-gray-500 mt-2">Ödemeyi tamamladıktan sonra bu sayfaya geri dönün — sipariş durumu otomatik güncellenecek.</p>
            </div>
          </div>
        </div>
      )}
      {showAuthModal && !isLoggedIn && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAuthModal(false); setAuthStep("phone"); setAuthErrors({}); }} />
            <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-blue-500 to-indigo-600 text-white" data-testid="modal-auth">
              <div className="px-5 pt-3 pb-2">
                <div className="flex justify-end mb-1">
                  <button
                    type="button"
                    onClick={() => { setShowAuthModal(false); setAuthStep("phone"); setAuthErrors({}); }}
                    className="p-1.5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                    data-testid="btn-close-auth-modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex rounded-xl overflow-hidden mb-3 bg-white/10">
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setAuthStep("phone"); setAuthErrors({}); }}
                    className={`flex-1 py-2.5 text-sm font-bold text-center transition-colors ${authMode === "login" ? "bg-yellow-400 text-gray-900" : "text-white/80 hover:text-white"}`}
                    data-testid="tab-auth-login"
                  >
                    ÜYE GİRİŞİ
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("register"); setAuthStep("phone"); setAuthErrors({}); }}
                    className={`flex-1 py-2.5 text-sm font-bold text-center transition-colors ${authMode === "register" ? "bg-yellow-400 text-gray-900" : "text-white/80 hover:text-white"}`}
                    data-testid="tab-auth-register"
                  >
                    YENİ ÜYE OL
                  </button>
                </div>
                {authMode === "register" && (
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight">Üye Ol & Bonus Kazan</p>
                      <p className="text-sm text-white/90 leading-tight">100 TL anında bonus sepetinde!</p>
                    </div>
                  </div>
                )}
                {authMode === "login" && (
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <LogIn className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight">Hoş Geldiniz</p>
                      <p className="text-sm text-white/90 leading-tight">Telefon numaranızla giriş yapın</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 space-y-3">
                {authStep === "phone" && (
                  <>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                      <PhoneIcon className="w-4 h-4" /> Cep telefon numaranı gir
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+90</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={authPhone}
                          onChange={(e) => { handleAuthPhoneChange(e.target.value); setAuthErrors({}); }}
                          placeholder="5XX XXX XX XX"
                          className="w-full pl-12 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAuthSendOtp(); } }}
                          data-testid="input-auth-phone"
                        />
                      </div>
                      <button
                        onClick={handleAuthSendOtp}
                        disabled={authLoading}
                        className="bg-yellow-400 text-gray-900 font-bold text-sm px-4 rounded-xl flex items-center gap-1 disabled:opacity-60 active:scale-[0.98] transition-transform flex-shrink-0"
                        data-testid="btn-send-otp"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Gönder</>}
                      </button>
                    </div>
                    {authErrors.phone && <p className="text-yellow-200 text-xs mt-1">{authErrors.phone}</p>}
                  </>
                )}

                {authStep === "otp" && (
                  <>
                    <p className="font-bold text-sm mb-1">SMS ile gelen 6 haneli kodu gir</p>
                    <p className="text-xs text-white/70 mb-2">
                      {authPhone} numarasına gönderildi
                      {authCountdown > 0 && <span className="ml-1">({Math.floor(authCountdown / 60)}:{String(authCountdown % 60).padStart(2, "0")})</span>}
                    </p>
                    <div className="flex gap-1.5 justify-center mb-2">
                      {authOtpCode.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { authOtpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleAuthOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleAuthOtpKeyDown(i, e)}
                          onPaste={(e) => { e.preventDefault(); handleAuthOtpChange(0, e.clipboardData.getData("text").replace(/\D/g, "")); }}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          className="w-10 h-11 text-center text-lg font-bold text-gray-900 bg-white rounded-lg outline-none"
                          data-testid={`input-auth-otp-${i}`}
                        />
                      ))}
                    </div>
                    {authLoading && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Doğrulanıyor...
                      </div>
                    )}
                    {authErrors.otp && <p className="text-yellow-200 text-xs text-center">{authErrors.otp}</p>}
                    <div className="flex items-center justify-between">
                      <button type="button" className="text-xs text-white/70 hover:text-white" onClick={() => { setAuthStep("phone"); setAuthErrors({}); }} data-testid="btn-auth-back-phone">
                        ← Numarayı Değiştir
                      </button>
                      {authCountdown <= 0 && (
                        <button type="button" className="text-xs text-yellow-300 hover:text-yellow-200" onClick={handleAuthSendOtp} disabled={authLoading} data-testid="btn-auth-resend">
                          Tekrar Gönder
                        </button>
                      )}
                    </div>
                  </>
                )}

                {authStep === "register" && (
                  <>
                    <p className="font-bold text-sm flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Numara doğrulandı! Bilgilerini tamamla
                    </p>
                    <div className="space-y-2">
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={authName}
                          onChange={(e) => { setAuthName(e.target.value); setAuthErrors((p) => ({ ...p, name: "" })); }}
                          placeholder="Adı Soyadı *"
                          className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none ${authErrors.name ? "ring-2 ring-red-400" : ""}`}
                          autoFocus
                          data-testid="input-auth-name"
                        />
                      </div>
                      {authErrors.name && <p className="text-yellow-200 text-xs">{authErrors.name}</p>}

                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={authMahalle}
                          onChange={(e) => setAuthMahalle(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none appearance-none bg-white"
                          data-testid="select-auth-mahalle"
                        >
                          <option value="">Mahalle Seçin</option>
                          {TESLIMAT_MAHALLELERI.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={authCadde}
                          onChange={(e) => setAuthCadde(e.target.value)}
                          placeholder="Cadde"
                          className="w-full px-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          data-testid="input-auth-cadde"
                        />
                        <input
                          type="text"
                          value={authSokak}
                          onChange={(e) => setAuthSokak(e.target.value)}
                          placeholder="Sokak"
                          className="w-full px-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          data-testid="input-auth-sokak"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={authKapiNo}
                          onChange={(e) => setAuthKapiNo(e.target.value)}
                          placeholder="Kapı No"
                          className="w-full px-3 py-2 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          data-testid="input-auth-kapi"
                        />
                        <input
                          type="text"
                          value={authApartmanAdi}
                          onChange={(e) => setAuthApartmanAdi(e.target.value)}
                          placeholder="Apartman Adı"
                          className="w-full px-3 py-2 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          data-testid="input-auth-apartman"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={authKatNo}
                          onChange={(e) => setAuthKatNo(e.target.value)}
                          placeholder="Kat No"
                          className="w-full px-3 py-2 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          data-testid="input-auth-kat"
                        />
                        <input
                          type="text"
                          value={authDaireNo}
                          onChange={(e) => setAuthDaireNo(e.target.value)}
                          placeholder="Daire No"
                          className="w-full px-3 py-2 rounded-xl text-gray-900 text-sm font-medium outline-none"
                          data-testid="input-auth-daire"
                        />
                        <select
                          value={authAsansor}
                          onChange={(e) => setAuthAsansor(e.target.value as "var" | "yok" | "")}
                          className="w-full px-3 py-2 rounded-xl text-gray-900 text-sm font-medium outline-none appearance-none bg-white"
                          data-testid="select-auth-asansor"
                        >
                          <option value="">Asansör</option>
                          <option value="var">Var</option>
                          <option value="yok">Yok</option>
                        </select>
                      </div>

                      {authErrors.general && <p className="text-yellow-200 text-xs text-center">{authErrors.general}</p>}
                      <button
                        onClick={handleAuthRegister}
                        disabled={authLoading}
                        className="w-full bg-yellow-400 text-gray-900 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
                        data-testid="btn-auth-submit"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gift className="w-4 h-4" /> Kaydol ve 100 TL Kazan</>}
                      </button>
                    </div>
                    <button type="button" className="text-xs text-white/70 hover:text-white mx-auto block mt-2" onClick={() => { setAuthStep("phone"); setAuthErrors({}); }}>
                      ← Başa Dön
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
            {selectedProducts.some(({ product }) => isPreorderProduct(String(product.id))) && (
              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }} data-testid="banner-preorder-checkout">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs font-medium">Sepetinizde ön siparişli ürün(ler) var. Bu ürünler ortalama 3 iş günü içinde tedarik edilip teslim edilecektir.</p>
              </div>
            )}
            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-cart-items">
                Sepetinizdeki Ürünler
              </h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3" data-testid="list-checkout-items">
                    {selectedProducts.map(({ product, qty }) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 py-2 border-b border-dashed last:border-0 flex-wrap"
                          data-testid={`row-checkout-item-${product.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium md:truncate break-words" data-testid={`text-checkout-name-${product.id}`}>
                              {product.name}
                            </p>
                            <p className="hidden md:block text-xs text-muted-foreground" data-testid={`text-checkout-unit-${product.id}`}>
                              {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL / adet
                            </p>
                            {isPreorderProduct(String(product.id)) && (
                              <span className="hidden md:inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }} data-testid={`badge-preorder-${product.id}`}>
                                <Clock className="w-2.5 h-2.5" />
                                Ön Sipariş — ~3 gün teslimat
                              </span>
                            )}
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
                              onClick={() => {
                                const blocked = updateQty(String(product.id), 1);
                                if (blocked) {
                                  setStockWarning(product.name);
                                  setTimeout(() => setStockWarning(""), 3000);
                                }
                              }}
                              data-testid={`btn-checkout-plus-${product.id}`}
                            >
                              <Plus />
                            </Button>
                          </div>
                          <span className="text-sm font-bold shrink-0 min-w-[70px] text-right" data-testid={`text-checkout-linetotal-${product.id}`}>
                            {(qty * product.price).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </span>
                        </div>
                      ))}
                  </div>
                  {stockWarning && (
                    <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2" data-testid="text-stock-warning">
                      <span className="text-red-500 text-sm">⚠️</span>
                      <span className="text-xs text-red-600 font-medium">
                        <strong>{stockWarning}</strong> için stok kalmadı, daha fazla ekleyemezsiniz.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>


            {!hasCampaignItems && (
              <section className="mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                      style={{ backgroundColor: "#fef3e2", border: "1px solid #ffe0b2" }}
                    >
                      <Gift className="w-4 h-4 shrink-0" style={{ color: "#e65100" }} />
                      <span style={{ color: "#bf360c" }} data-testid="text-checkout-points-earn">
                        Bu siparişi verdiğinizde{" "}
                        <strong>{(subtotal * 0.05).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>{" "}
                        değerinde Para Puan kazanacaksınız.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPointsDialog(true)}
                      className="text-xs font-medium underline mt-2 ml-1"
                      style={{ color: "#e65100" }}
                      data-testid="btn-checkout-points-info"
                    >
                      Para Puan nedir?
                    </button>
                  </CardContent>
                </Card>
              </section>
            )}

            <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
              <DialogContent className="max-w-[340px] sm:max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <Gift className="w-4 h-4" style={{ color: "#e65100" }} />
                    Para Puan Nedir?
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  <p>
                    <strong>Para Puan</strong>, JETGO Pet Shop'ta yaptığınız her alışverişte kazandığınız sadakat puanıdır.
                  </p>
                  <div className="rounded-lg p-2.5" style={{ backgroundColor: "#fef3e2", border: "1px solid #ffe0b2" }}>
                    <p className="font-semibold text-xs sm:text-sm" style={{ color: "#e65100" }}>Nasıl Kazanılır?</p>
                    <p className="mt-0.5">Her siparişinizde toplam tutarın <strong>%5'i</strong> kadar Para Puan kazanırsınız. Örneğin 1.000 TL'lik alışverişte <strong>50 TL</strong> Para Puan!</p>
                  </div>
                  <div className="rounded-lg p-2.5" style={{ backgroundColor: "#e8f5e9", border: "1px solid #c8e6c9" }}>
                    <p className="font-semibold text-xs sm:text-sm" style={{ color: "#2e7d32" }}>Nasıl Kullanılır?</p>
                    <p className="mt-0.5">Biriken puanlarınız bir sonraki siparişinizde otomatik olarak indirim olarak uygulanır.</p>
                  </div>
                  <div className="rounded-lg p-2.5 bg-gray-50 border border-gray-200">
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">Önemli Bilgiler</p>
                    <ul className="mt-0.5 space-y-0.5 list-disc list-inside text-gray-600">
                      <li>Para Puan kazanmak için üye girişi yapmanız gerekir.</li>
                      <li>Puanlarınız hesabınızda birikir ve istediğiniz zaman kullanabilirsiniz.</li>
                      <li>Kampanyalı ürünlerde Para Puan geçerli değildir.</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                          {subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Kampanya siparislerinde sadece kapida nakit odeme gecerlidir.
                      </p>
                    </div>
                  ) : (
                  <RadioGroup value={paymentId} onValueChange={setPaymentId} data-testid="radio-payment">
                    {PAYMENT_OPTIONS.filter((opt) => opt.id !== "eft" || eftEnabled).map((opt) => {
                      const Icon = paymentIcons[opt.id] || CreditCard;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors ${paymentId === opt.id ? "bg-accent" : ""}`}
                          data-testid={`radio-payment-${opt.id}`}
                        >
                          <RadioGroupItem value={opt.id} data-testid={`input-radio-${opt.id}`} />
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate" data-testid={`text-payment-name-${opt.id}`}>{opt.name}</span>
                          <span className="flex-1 min-w-0" />
                          {opt.disc < 0 ? (
                            <Badge
                              className="no-default-hover-elevate shrink-0 whitespace-nowrap bg-green-100 text-green-800 border border-green-300"
                              data-testid={`badge-payment-tag-${opt.id}`}
                            >
                              {opt.tag}
                            </Badge>
                          ) : opt.id === "online" ? (
                            <Badge
                              className="no-default-hover-elevate shrink-0 whitespace-nowrap bg-blue-100 text-blue-800 border border-blue-300"
                              data-testid={`badge-payment-tag-${opt.id}`}
                            >
                              {opt.tag}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="no-default-hover-elevate shrink-0 whitespace-nowrap"
                              data-testid={`badge-payment-tag-${opt.id}`}
                            >
                              {opt.tag}
                            </Badge>
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>
                  )}

                  {paymentId === "online" && !hasCampaignItems && (
                    <div className="mt-3">
                      <InstallmentBanner variant="compact" />
                    </div>
                  )}

                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-address">
                <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Teslimat Adresi
              </h2>
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Mahalle, cadde, bina no, kat, daire no..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="resize-none"
                    rows={3}
                    maxLength={500}
                    data-testid="input-customer-address"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{customerAddress.length}/500</p>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-note">
                Sipariş Notu (Opsiyonel)
              </h2>
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Teslimat zamanı, kapıya bırakın, zili çalmayın vb. notunuzu yazabilirsiniz..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="resize-none"
                    rows={3}
                    maxLength={500}
                    data-testid="input-order-note"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{orderNote.length}/500</p>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-progress">
                İlerleme Durumu
              </h2>
              <Card>
                <CardContent className="p-4 space-y-5">
                  {!hasCampaignItems && (
                  <>
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
                      value={Math.min((subtotal / CONFIG.minLimit) * 100, 100)}
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
                      value={Math.min((subtotal / CONFIG.shipLimit) * 100, 100)}
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
                  </>
                  )}

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
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-coupon">
                Kupon Kodu
              </h2>
              <Card>
                <CardContent className="p-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-3" data-testid="applied-coupon-info">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" style={{ color: "#2e7d32" }} />
                        <span className="text-sm font-bold" style={{ color: "#2e7d32" }}>{appliedCoupon.code}</span>
                        <span className="text-sm" style={{ color: "#2e7d32" }}>(-{appliedCoupon.discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL)</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-red-500 font-medium" data-testid="btn-remove-coupon">Kaldır</button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Kupon kodunuzu girin"
                          maxLength={50}
                          className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary"
                          data-testid="input-coupon-code"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg disabled:opacity-50"
                          data-testid="btn-apply-coupon"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uygula"}
                        </button>
                      </div>
                      {couponResult && !couponResult.valid && (
                        <p className="text-xs text-red-500 mt-1.5" data-testid="text-coupon-error">{couponResult.message}</p>
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
                      <span className="font-medium" data-testid="text-subtotal">{(subtotal - effectiveDiscount).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span>
                    </div>
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
                    {appliedCoupon && (
                      <div className="flex justify-between gap-3 flex-wrap">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" style={{ color: "#2e7d32" }} />
                          Kupon ({appliedCoupon.code})
                        </span>
                        <span className="font-medium" style={{ color: "#2e7d32" }} data-testid="text-coupon-discount">
                          -{appliedCoupon.discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                        </span>
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

                    {!hasCampaignItems && (
                    <>
                    <div
                      className="mt-3 rounded-xl p-3 cursor-pointer transition-all"
                      style={{
                        backgroundColor: donationAmount > 0 ? "#fff8e1" : "#f9fafb",
                        border: donationAmount > 0 ? "2px solid #ffb300" : "1px solid #e5e7eb",
                      }}
                      onClick={() => setDonationAmount(donationAmount > 0 ? 0 : 10)}
                      data-testid="btn-donation-toggle"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${donationAmount > 0 ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
                          {donationAmount > 0 && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🐾</span>
                            <span className="text-sm font-bold" style={{ color: "#e65100" }}>Askıda Mama</span>
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>+10 TL</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            Sokak hayvanları için barınak ve besleme noktalarına mama bağışla
                          </p>
                        </div>
                      </div>
                    </div>

                    {donationAmount > 0 && (
                      <div className="flex justify-between gap-3 flex-wrap mt-2">
                        <span className="text-muted-foreground flex items-center gap-1">🐾 Askıda Mama</span>
                        <span className="font-medium" style={{ color: "#e65100" }} data-testid="text-donation">+{donationAmount} TL</span>
                      </div>
                    )}
                    </>
                    )}
                  </div>


                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t flex-wrap">
                    <span className="text-lg font-bold">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-primary" data-testid="text-total">
                      {displayTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                    </span>
                  </div>

                  <Button
                    className="w-full mt-5"
                    variant="default"
                    size="lg"
                    disabled={!effectiveMinReached || selectedProducts.length === 0 || orderLoading || (hasCampaignItems && !campaignValid)}
                    onClick={handleOrder}
                    data-testid="btn-order-submit"
                  >
                    {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                    {orderLoading ? "Kaydediliyor..." : "Siparişi Ver"}
                  </Button>

                  {orderError && (
                    <p className="text-[12px] text-red-500 text-center mt-2">{orderError}</p>
                  )}

                  {!effectiveMinReached && selectedProducts.length > 0 && (
                    <p className="text-xs text-center mt-2 text-muted-foreground" data-testid="text-min-warning">
                      Minimum sipariş tutarı {CONFIG.minLimit} TL'dir
                    </p>
                  )}

                  {!hasCampaignItems && (
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
                  )}
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
