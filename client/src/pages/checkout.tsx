import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation, useSearch } from "wouter";
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
  online: CreditCard,
  nakit: Banknote,
  eft: Wallet,
  qr: QrCode,
  pos: CreditCard,
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const preorderPm = useMemo(() => {
    const p = new URLSearchParams(searchStr || "").get("pm") || "nakit";
    return ["nakit", "eft", "qr", "pos"].includes(p) ? p : "nakit";
  }, [searchStr]);
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
  const [authAutoShown, setAuthAutoShown] = useState(false);
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
    staleTime: 0,
    refetchOnMount: "always",
  });
  const isEnabled = (v: string | undefined, def = true) => {
    if (v === undefined) return def;
    return v !== "0" && v !== "false";
  };
  const eftEnabled = isEnabled(publicSettings?.payment_eft_enabled);
  const nakitEnabled = isEnabled(publicSettings?.payment_nakit_enabled);
  const qrEnabled = isEnabled(publicSettings?.payment_qr_enabled);
  const posEnabled = isEnabled(publicSettings?.payment_pos_enabled);
  const installmentsEnabled = isEnabled(publicSettings?.payment_installments_enabled);
  const toslaEnabled = isEnabled(publicSettings?.payment_tosla_enabled);
  const iyzicoEnabled = isEnabled(publicSettings?.payment_iyzico_enabled);
  const onlineCardEnabled = toslaEnabled || iyzicoEnabled;
  const bankAccountName = publicSettings?.bank_account_name || "";
  const bankIban = publicSettings?.bank_iban || "";
  const bankName = publicSettings?.bank_name || "";

  const { data: deliveryNeighborhoods = [] } = useQuery<{ id: number; name: string; district: string; minOrder: number; shippingFee: number; freeShippingLimit: number; isActive: boolean }[]>({
    queryKey: ["/api/delivery-neighborhoods"],
    staleTime: 60_000,
  });

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

  const beginCheckoutFiredRef = useRef(false);


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
      if (data.isExisting && authMode === "register") {
        setAuthMode("login");
        setAuthErrors({ info: "Bu numara zaten kayıtlı. Giriş yapılıyor..." });
      } else if (!data.isExisting && authMode === "login") {
        setAuthMode("register");
        setAuthErrors({ info: "Bu numara kayıtlı değil. Üyelik oluşturulacak." });
      }
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
      const data = await loginWithOtp(normalized, code);
      if (data?.requiresRegistration) {
        setAuthMode("register");
        setAuthStep("register");
      } else {
        setShowAuthModal(false);
        setPendingOrderAfterAuth(true);
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
  const [authAdresDetay, setAuthAdresDetay] = useState("");

  const handleAuthRegister = async () => {
    const errors: Record<string, string> = {};
    if (!authName.trim()) errors.name = "Ad Soyad zorunludur";
    if (!authMahalle) errors.mahalle = "Mahalle seçimi zorunludur";
    if (!authAdresDetay.trim() || authAdresDetay.trim().length < 10) errors.adres = "Adres bilgisi zorunludur (cadde, sokak, bina vb.)";
    if (Object.keys(errors).length > 0) { setAuthErrors(errors); return; }
    setAuthErrors({});
    setAuthLoading(true);
    const normalized = authPhone.replace(/\D/g, "");
    const code = authOtpCode.join("");
    const addressParts = [authMahalle, authAdresDetay.trim()].filter(Boolean).join(", ");
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

  useEffect(() => {
    if (authAutoShown) return;
    if (isLoggedIn) { setAuthAutoShown(true); return; }
    if (selectedProducts.length === 0) return;
    setShowAuthModal(true);
    setAuthStep("phone");
    setAuthErrors({});
    setAuthAutoShown(true);
  }, [isLoggedIn, selectedProducts.length, authAutoShown]);

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
  const [donationDelivery, setDonationDelivery] = useState(false);
  const [donationRecipientName, setDonationRecipientName] = useState("");
  const [donationRecipientPhone, setDonationRecipientPhone] = useState("");
  const [donationRecipientAddress, setDonationRecipientAddress] = useState("");
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [doNotRing, setDoNotRing] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState<number>(1);
  const { data: installmentRates = [] } = useQuery<{ id: number; months: number; rate: number; isActive: boolean; sortOrder: number; noInterest?: boolean }[]>({
    queryKey: ["/api/installment-rates"],
  });
  const SLOT_TIMES = ["11:00-12:30", "12:30-14:00", "14:00-15:30", "15:30-17:00", "17:00-18:15", "18:15-19:30"];
  const TR_DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const TR_MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const slotPassed = (dateStr: string, range: string) => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (dateStr !== todayKey) return false;
    const [start] = range.split("-");
    const [hh, mm] = start.split(":").map(Number);
    const startMin = hh * 60 + mm;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= startMin;
  };
  const deliveryDays = useMemo(() => {
    const days: { key: string; dayLabel: string; dateLabel: string; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayLabel = i === 0 ? "Bugün" : i === 1 ? "Yarın" : TR_DAY_NAMES[d.getDay()];
      const dateLabel = `${d.getDate()} ${TR_MONTH_NAMES[d.getMonth()]}`;
      days.push({ key, dayLabel, dateLabel, isToday: i === 0 });
    }
    return days;
  }, []);
  const initialSlot = useMemo(() => {
    for (const d of deliveryDays) {
      for (const t of SLOT_TIMES) {
        if (!slotPassed(d.key, t)) return `${d.key}|${t}`;
      }
    }
    return `${deliveryDays[0].key}|${SLOT_TIMES[0]}`;
  }, [deliveryDays]);
  const [deliverySlot, setDeliverySlot] = useState<string>(initialSlot);
  const [selectedDay, setSelectedDay] = useState<string>(deliverySlot.split("|")[0]);
  const [pendingOrderAfterAuth, setPendingOrderAfterAuth] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message: string; discountAmount?: number; discountType?: string; discountValue?: number } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const matchedNeighborhood = useMemo(() => {
    const list = (deliveryNeighborhoods || []).filter(n => n.isActive);
    if (!list.length) return null;
    const addrLower = (customerAddress || "").toLocaleLowerCase("tr");
    if (!addrLower.trim()) return null;
    const compactAddr = addrLower.replace(/\s+/g, " ");
    const noSpaceAddr = addrLower.replace(/\s+/g, "");
    let best: typeof list[number] | null = null;
    for (const nh of list) {
      const nhLower = (nh.name || "").toLocaleLowerCase("tr");
      if (!nhLower) continue;
      const compactNb = nhLower.replace(/\s+/g, " ");
      const noSpaceNb = nhLower.replace(/\s+/g, "");
      if (compactAddr.includes(compactNb) || noSpaceAddr.includes(noSpaceNb)) {
        if (!best || nh.name.length > best.name.length) best = nh;
      }
    }
    return best;
  }, [customerAddress, deliveryNeighborhoods]);

  const effShipFee = matchedNeighborhood ? matchedNeighborhood.shippingFee : CONFIG.shipFee;
  const effShipLimit = matchedNeighborhood ? matchedNeighborhood.freeShippingLimit : CONFIG.shipLimit;
  const effMinLimit = matchedNeighborhood ? matchedNeighborhood.minOrder : CONFIG.minLimit;
  const stdShipping = subtotal >= effShipLimit ? 0 : effShipFee;
  const stdMinReached = subtotal >= effMinLimit;

  useEffect(() => {
    if (beginCheckoutFiredRef.current) return;
    if (selectedProducts.length === 0) return;
    if (typeof window === "undefined" || !(window as any).gtag) return;
    try {
      (window as any).gtag("event", "begin_checkout", {
        currency: "TRY",
        value: subtotal,
        items: selectedProducts.map(({ product, qty }) => ({
          item_id: String(product.id),
          item_name: product.name,
          price: product.price,
          quantity: qty,
        })),
      });
      beginCheckoutFiredRef.current = true;
    } catch {}
  }, [selectedProducts, subtotal]);

  const hasStreetAnimalItems = useMemo(
    () => selectedProducts.some(({ product }) => (product as any).isStreetAnimal === true),
    [selectedProducts]
  );

  useEffect(() => {
    if (!hasStreetAnimalItems && donationDelivery) setDonationDelivery(false);
  }, [hasStreetAnimalItems, donationDelivery]);

  useEffect(() => {
    if (donationDelivery && paymentId !== "eft" && paymentId !== "online") {
      setPaymentId(onlineCardEnabled ? "online" : "eft");
    }
  }, [donationDelivery, paymentId, onlineCardEnabled, setPaymentId]);

  const hasPreorderItems = selectedProducts.some(({ product }) => isPreorderProduct(String(product.id)));
  useEffect(() => {
    if (hasPreorderItems && paymentId !== "online" && paymentId !== "eft") {
      setPaymentId(onlineCardEnabled ? "online" : "eft");
    }
  }, [hasPreorderItems, paymentId, onlineCardEnabled, setPaymentId]);

  const preorderMethodLabel = useMemo(() => {
    const m: Record<string, string> = { nakit: "Kapıda Nakit", eft: "Banka Havalesi/EFT", qr: "Kapıda QR", pos: "Kapıda Kredi Kartı (POS)" };
    return m[preorderPm] || "Kapıda Nakit";
  }, [preorderPm]);
  const preorderMethodDisc = preorderPm === "nakit" ? 0.10 : 0;

  const dominantAnimal = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { product, qty } of selectedProducts) {
      const a = product.animal;
      if (!a) continue;
      counts[a] = (counts[a] || 0) + qty;
    }
    let best: string | null = null;
    let bestN = 0;
    for (const [a, n] of Object.entries(counts)) {
      if (n > bestN) { best = a; bestN = n; }
    }
    return best;
  }, [selectedProducts]);
  const animalLabels: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kus: "Kuş", akvaryum: "Akvaryum", kemirgen: "Kemirgen" };
  const categoryHref = dominantAnimal ? `/kategori/${dominantAnimal}` : "/kategori";
  const categoryLabel = dominantAnimal ? `${animalLabels[dominantAnimal] || dominantAnimal} Kategorisine Git` : "Kategorilere Git";

  const campaignShipping = hasCampaignItems ? CONFIG.shipFee : stdShipping;
  const paymentDiscount = hasCampaignItems ? 0 : discount;
  const normalGrandTotal = subtotal - paymentDiscount + stdShipping;
  const campaignGrandTotal = hasCampaignItems ? (subtotal + campaignShipping) : normalGrandTotal;

  const effectiveShipping = hasCampaignItems ? campaignShipping : stdShipping;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const effectiveDiscount = paymentDiscount + couponDiscountAmount;
  const effectiveGrandTotal = Math.max(0, (hasCampaignItems ? campaignGrandTotal : normalGrandTotal) - couponDiscountAmount);
  const effectiveMinReached = hasCampaignItems ? minReached : stdMinReached;

  const pointsDiscount = !hasCampaignItems && isLoggedIn && usePoints && pointsBalance > 0 ? Math.min(pointsBalance, effectiveGrandTotal) : 0;
  const rawDisplayTotal = Math.max(0, effectiveGrandTotal - pointsDiscount) + donationAmount;
  const preorderMethodTotal = hasPreorderItems ? Math.max(0, subtotal * (1 - preorderMethodDisc)) : 0;
  const preorderDeposit = hasPreorderItems ? preorderMethodTotal * 0.25 : 0;
  const preorderRemaining = hasPreorderItems ? preorderMethodTotal - preorderDeposit : 0;
  const displayTotal = hasPreorderItems ? preorderDeposit : rawDisplayTotal;

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
    if (donationDelivery) {
      if (!donationRecipientName.trim()) { setOrderError("Lütfen bağış alıcısının adını girin."); return; }
      if (!donationRecipientPhone.trim() || donationRecipientPhone.replace(/\D/g, "").length < 10) { setOrderError("Lütfen bağış alıcısının telefon numarasını girin."); return; }
      if (!donationRecipientAddress.trim() || donationRecipientAddress.trim().length < 10) { setOrderError("Lütfen bağış alıcısının Atakum içi adresini girin."); return; }
      if (paymentId !== "eft" && paymentId !== "online") { setOrderError("Bağış teslimatlarında sadece Banka Havalesi veya Online Kredi Kartı ile ödeme yapılabilir."); return; }
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

      const payMethod = hasCampaignItems
        ? "Kapıda Nakit"
        : hasPreorderItems
          ? `Ön Sipariş - ${preorderMethodLabel} (Kapora: ${paymentId === "eft" ? "Banka Havalesi/EFT" : "Online Kredi Kartı"})`
          : pay.name;
      const pointsUsed = pointsDiscount;
      const finalTotal = displayTotal;

      const orderPayload: Record<string, unknown> = {
        items: orderItems,
        subtotal,
        shipping: effectiveShipping,
        discount: effectiveDiscount,
        grandTotal: finalTotal,
        paymentMethod: payMethod,
        customerName: donationDelivery ? donationRecipientName.trim() : customerName.trim(),
        customerPhone: donationDelivery ? donationRecipientPhone.trim() : customerPhone.trim(),
        customerAddress: donationDelivery ? donationRecipientAddress.trim() : customerAddress.trim(),
        usedPoints: pointsUsed > 0 ? pointsUsed : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        donationAmount: donationAmount > 0 ? donationAmount : undefined,
        customerNote: ((): string | undefined => {
          const flags: string[] = [];
          if (contactlessDelivery) flags.push("Temassız Teslimat");
          if (doNotRing) flags.push("Zile Basma");
          if (donationDelivery) flags.push("BAĞIŞ TESLİMATI (Atakum içi)");
          if (hasPreorderItems) {
            const depMethod = paymentId === "eft" ? "Banka Havalesi/EFT" : "Online Kart";
            flags.push(`ÖN SİPARİŞ • Kapora %25: ${preorderDeposit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL (${depMethod}) • Teslimatta %75: ${preorderRemaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL (${preorderMethodLabel})`);
          }
          const flagText = flags.length ? `[${flags.join(" • ")}]` : "";
          const donorText = donationDelivery
            ? `Bağışçı: ${customerName.trim()} (${customerPhone.trim()}) — Fatura adresi: ${customerAddress.trim()}`
            : "";
          const combined = [flagText, donorText, orderNote.trim()].filter(Boolean).join(" | ");
          return combined || undefined;
        })(),
        deliverySlot: (selectedProducts.some(({ product }) => isPreorderProduct(String(product.id))) || hasCampaignItems) ? undefined : (deliverySlot || undefined),
        campaignProductIds: hasCampaignItems ? Array.from(campaignCartIds) : undefined,
        ...((paymentId === "pos" || paymentId === "online") && installmentMonths > 1 ? (() => {
          const rRaw = installmentRates.find(x => x.months === installmentMonths);
          const r = rRaw ? { ...rRaw, rate: rRaw.noInterest ? 0 : rRaw.rate } : rRaw;
          if (!r) return {};
          const grandTotal = displayTotal * (1 + (r.rate || 0) / 100);
          return {
            installmentMonths: r.months,
            installmentRate: r.rate,
            installmentMonthly: Math.round((grandTotal / r.months) * 100) / 100,
            installmentTotal: Math.round(grandTotal * 100) / 100,
          };
        })() : {}),
      };

      const orderRes = await apiRequest("POST", "/api/orders", orderPayload);
      const orderResult: any = await orderRes.json();

      if (paymentId === "online" && orderResult?.id) {
        const tryInit = async (endpoint: string) => {
          const initRes = await apiRequest("POST", endpoint, { orderId: orderResult.id });
          const initData = await initRes.json();
          if (initData?.paymentPageUrl) return { ok: true, url: initData.paymentPageUrl };
          throw new Error(initData?.message || "Online ödeme sayfası açılamadı");
        };
        const parseErr = (e: any) => {
          let msg = "Online ödeme başlatılamadı, lütfen başka bir ödeme yöntemi seçin.";
          let cancelled = false;
          try {
            const raw = e?.message || "";
            const jsonPart = raw.replace(/^\d+:\s*/, "");
            const parsed = JSON.parse(jsonPart);
            if (parsed.message) msg = parsed.message;
            if (parsed.cancelled) cancelled = true;
          } catch {}
          return { msg, cancelled };
        };

        const providers: string[] = [];
        if (iyzicoEnabled) providers.push("/api/iyzico/init-payment");
        if (toslaEnabled) providers.push("/api/tosla/init-payment");
        if (providers.length === 0) providers.push("/api/tosla/init-payment");

        let lastErr: any = null;
        for (let i = 0; i < providers.length; i++) {
          try {
            const r = await tryInit(providers[i]);
            queryClient.invalidateQueries({ queryKey: ["/api/customer/orders"] });
            window.location.href = r.url;
            return;
          } catch (e: any) {
            lastErr = e;
            const { cancelled } = parseErr(e);
            if (cancelled) break;
          }
        }
        const { msg, cancelled } = parseErr(lastErr);
        setOrderError(cancelled ? `${msg} Siparişiniz otomatik olarak iptal edildi, ürünleriniz sepete geri eklenebilir.` : msg);
        setOrderLoading(false);
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        return;
      }

      if (typeof window !== "undefined" && (window as any).gtag) {
        try {
          const transactionId = `JG-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
          const ga4Items = orderItems.map((it) => ({
            item_id: String(it.productId),
            item_name: it.name,
            price: it.price,
            quantity: it.quantity,
          }));
          (window as any).gtag("event", "purchase", {
            transaction_id: transactionId,
            value: finalTotal,
            currency: "TRY",
            shipping: effectiveShipping,
            items: ga4Items,
          });
        } catch {}
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

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <SEO
        title="Sepet ve Ödeme | JETGO Pet Shop Samsun"
        description="JETGO Pet Shop sepetiniz. Kapıda nakit, kredi kartı, havale/EFT ile ödeme. Samsun içi aynı gün teslimat."
        noindex
      />
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
                    {authErrors.info && (
                      <p className="text-yellow-300 text-xs text-center mb-1 font-medium" data-testid="text-auth-info">
                        {authErrors.info}
                      </p>
                    )}
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

                      <div>
                        <label className="block text-sm font-bold mb-1">Mahalle*</label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            value={authMahalle}
                            onChange={(e) => { setAuthMahalle(e.target.value); setAuthErrors((p) => ({ ...p, mahalle: "" })); }}
                            className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none appearance-none bg-white ${authErrors.mahalle ? "ring-2 ring-red-400" : ""}`}
                            data-testid="select-auth-mahalle"
                          >
                            <option value="">Seçiniz</option>
                            {TESLIMAT_MAHALLELERI.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        {authErrors.mahalle && <p className="text-yellow-200 text-xs mt-1">{authErrors.mahalle}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold">Adres*</label>
                        <p className="text-[11px] text-white/85 leading-snug mb-1.5">
                          Siparişinizin size sorunsuz bir şekilde ulaşabilmesi için mahalle, cadde, sokak, bina gibi detay bilgileri eksiksiz girdiğinizden emin olun.
                        </p>
                        <textarea
                          value={authAdresDetay}
                          onChange={(e) => { setAuthAdresDetay(e.target.value); setAuthErrors((p) => ({ ...p, adres: "" })); }}
                          placeholder="Cadde, Mahalle, Sokak ve diğer bilgileri giriniz."
                          rows={4}
                          className={`w-full px-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none resize-none ${authErrors.adres ? "ring-2 ring-red-400" : ""}`}
                          data-testid="input-auth-adres"
                        />
                        {authErrors.adres && <p className="text-yellow-200 text-xs mt-1">{authErrors.adres}</p>}
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
            {hasPreorderItems && (
              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }} data-testid="banner-preorder-checkout">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="text-xs font-medium space-y-1">
                  <p>Sepetinizde ön siparişli ürün(ler) var. Bu ürünler ortalama <strong>3 iş günü</strong> içinde tedarik edilip teslim edilecektir.</p>
                  <p>Seçtiğiniz ödeme şekli: <strong>{preorderMethodLabel}</strong>{preorderPm === "nakit" && <span> (%10 indirim uygulandı)</span>}.</p>
                  <p>Şimdi <strong>%25 kapora</strong> <strong>online kredi kartı</strong> (vade farksız 3-6 taksit) <strong>veya banka havalesi/EFT</strong> ile alınır: <strong>{preorderDeposit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>. Kalan <strong>%75</strong> ({preorderRemaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL) teslimatta <strong>{preorderMethodLabel}</strong> ile ödenir.</p>
                  <p>Ön sipariş onaylandıktan sonra <strong>fiyat değişmez</strong> ve sipariş <strong>iptal edilemez</strong>.</p>
                </div>
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
                        <strong>{((hasPreorderItems ? preorderMethodTotal : (subtotal - paymentDiscount)) * 0.05).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</strong>{" "}
                        değerinde Para Puan kazanacaksınız{hasPreorderItems && preorderPm === "nakit" ? " (Kapıda Nakit - %10 indirimli tutar üzerinden)" : paymentId === "nakit" ? " (Kapıda Nakit - %10 indirimli tutar üzerinden)" : ""}.
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


            {hasStreetAnimalItems && (
              <section className="mt-6" data-testid="section-donation-delivery">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <Gift className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Sokak Canları - Teslimat Tercihi
                </h2>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <RadioGroup
                      value={donationDelivery ? "donation" : "self"}
                      onValueChange={(v) => setDonationDelivery(v === "donation")}
                      data-testid="radio-donation-delivery"
                    >
                      <label className={`flex items-start gap-2 p-3 rounded-md cursor-pointer border ${!donationDelivery ? "bg-accent border-primary" : "border-transparent"}`}>
                        <RadioGroupItem value="self" className="mt-0.5" data-testid="input-donation-self" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Kendi adresime teslim edilsin</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Sipariş yukarıda girdiğiniz adrese gönderilir.</div>
                        </div>
                      </label>
                      <label className={`flex items-start gap-2 p-3 rounded-md cursor-pointer border ${donationDelivery ? "bg-accent border-primary" : "border-transparent"}`}>
                        <RadioGroupItem value="donation" className="mt-0.5" data-testid="input-donation-other" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Bağış yapmak istediğim kişi/kurumun adresine gönder</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Alıcı ad, telefon ve adres bilgisini aşağıya girin. <strong>Sadece Atakum içi teslimat yapılır.</strong>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>

                    {donationDelivery && (
                      <div className="space-y-2 border-t pt-3" data-testid="form-donation-recipient">
                        <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs font-medium text-amber-900 dark:text-amber-100">
                          Bağış teslimatlarında ödeme sadece <strong>Banka Havalesi/EFT</strong> veya <strong>Online Kredi Kartı</strong> ile yapılabilir. Teslimat <strong>sadece Atakum ilçesi</strong> içindir.
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1">Alıcı Adı Soyadı</label>
                          <Input
                            value={donationRecipientName}
                            onChange={(e) => setDonationRecipientName(e.target.value)}
                            placeholder="Örn. Atakum Hayvan Barınağı / Ayşe Yılmaz"
                            maxLength={100}
                            data-testid="input-donation-name"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1">Alıcı Telefonu</label>
                          <Input
                            value={donationRecipientPhone}
                            onChange={(e) => setDonationRecipientPhone(e.target.value)}
                            placeholder="05__ ___ __ __"
                            maxLength={20}
                            data-testid="input-donation-phone"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1">Alıcı Adresi (Atakum içi)</label>
                          <Textarea
                            value={donationRecipientAddress}
                            onChange={(e) => setDonationRecipientAddress(e.target.value)}
                            placeholder="Mahalle, cadde, sokak, bina no, kat, daire no..."
                            rows={3}
                            maxLength={500}
                            data-testid="input-donation-address"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-address">
                <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Teslimat Adresi {donationDelivery && <span className="text-xs font-normal text-muted-foreground">(fatura adresi)</span>}
              </h2>
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Mahalle, cadde, bina no, kat, daire no..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className={`resize-none ${customerAddress.length > 0 && customerAddress.trim().length < 15 ? "border-amber-400 focus-visible:ring-amber-400" : customerAddress.trim().length >= 15 ? "border-green-400 focus-visible:ring-green-400" : ""}`}
                    rows={3}
                    maxLength={500}
                    data-testid="input-customer-address"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {customerAddress.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Eksiksiz adres yazmanız teslimatı hızlandırır</span>
                    ) : customerAddress.trim().length < 15 ? (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400" data-testid="text-address-warn">
                        Adres çok kısa — mahalle, sokak, bina ve daire no ekleyin
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green-600 dark:text-green-500 flex items-center gap-1" data-testid="text-address-ok">
                        ✓ Adres uygun görünüyor
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground">{customerAddress.length}/500</p>
                  </div>
                  {matchedNeighborhood && (
                    <div
                      className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800"
                      data-testid="info-matched-neighborhood"
                    >
                      <span className="font-medium">{matchedNeighborhood.name} ({matchedNeighborhood.district})</span>
                      <span>Min: <strong>{matchedNeighborhood.minOrder} TL</strong></span>
                      <span>Kargo: <strong>{hasCampaignItems ? CONFIG.shipFee : matchedNeighborhood.shippingFee} TL</strong></span>
                      {!hasCampaignItems && (
                        <span>Ücretsiz: <strong>{matchedNeighborhood.freeShippingLimit} TL+</strong></span>
                      )}
                    </div>
                  )}
                  {isLoggedIn && paymentId === "nakit" && (
                    <div
                      className="mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
                      data-testid="info-nakit-fatura-adres"
                    >
                      <Banknote className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Faturanız bu adrese gönderilecektir.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {!hasCampaignItems && !selectedProducts.some(({ product }) => isPreorderProduct(String(product.id))) && (
              <section className="mt-6">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-delivery">
                  <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Teslimat Zamanı
                </h2>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {deliveryDays.map((d) => {
                        const active = selectedDay === d.key;
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setSelectedDay(d.key)}
                            className={`shrink-0 px-3 py-2 rounded-xl border text-center transition ${active ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-emerald-400"}`}
                            data-testid={`btn-day-${d.key}`}
                          >
                            <div className={`text-xs font-bold ${active ? "text-white" : ""}`}>{d.dayLabel}</div>
                            <div className={`text-[11px] ${active ? "text-white/90" : "text-muted-foreground"}`}>{d.dateLabel}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SLOT_TIMES.map((t) => {
                        const slotId = `${selectedDay}|${t}`;
                        const passed = slotPassed(selectedDay, t);
                        const active = deliverySlot === slotId;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={passed}
                            onClick={() => setDeliverySlot(slotId)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition ${passed ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800" : active ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-600 shadow-sm" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-emerald-400"}`}
                            data-testid={`btn-slot-${slotId}`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-emerald-600 bg-emerald-600" : "border-gray-300"}`}>
                              {active && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <span className="font-medium">{t}</span>
                            {passed && <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">DOLU</span>}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Teslimatlar 11:00 - 19:30 saatleri arasında yapılır.</p>
                  </CardContent>
                </Card>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-delivery-options">
                Teslimat Seçenekleri
              </h2>
              <Card>
                <CardContent className="p-4 divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="flex items-start justify-between gap-4 pb-3">
                    <div>
                      <div className="font-semibold text-sm">Temassız Teslimat</div>
                      <div className="text-xs text-muted-foreground mt-0.5">(Kuryemiz siparişinizi kapınıza bırakacaktır.)</div>
                    </div>
                    <Switch
                      checked={contactlessDelivery}
                      onCheckedChange={setContactlessDelivery}
                      data-testid="switch-contactless-delivery"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 pt-3">
                    <div>
                      <div className="font-semibold text-sm">Zile Basma</div>
                      <div className="text-xs text-muted-foreground mt-0.5">(Kuryemiz adresinize ulaştığında sizi telefonla arayacaktır.)</div>
                    </div>
                    <Switch
                      checked={doNotRing}
                      onCheckedChange={setDoNotRing}
                      data-testid="switch-do-not-ring"
                    />
                  </div>
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

            {!hasPreorderItems && (<>
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
                          placeholder="Eğer var ise kupon kodunuzu giriniz"
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
                        Bu ürün ücreti teslim sırasında sizden nakit alınacaktır.
                      </p>
                    </div>
                  ) : (
                  <RadioGroup value={paymentId} onValueChange={setPaymentId} data-testid="radio-payment">
                    {(() => {
                      const hiddenByProduct = new Set<string>();
                      for (const { product } of selectedProducts) {
                        const arr = (product as any).hiddenPaymentMethods;
                        if (Array.isArray(arr)) for (const m of arr) hiddenByProduct.add(String(m));
                      }
                      return PAYMENT_OPTIONS.filter((opt) => {
                        if (hiddenByProduct.has(opt.id)) return false;
                        if (opt.id === "pos") return false;
                        if (donationDelivery && opt.id !== "eft" && opt.id !== "online") return false;
                        if (opt.id === "nakit") return nakitEnabled;
                        if (opt.id === "eft") return eftEnabled;
                        if (opt.id === "qr") return qrEnabled;
                        const hasPreorder = selectedProducts.some(({ product }) => isPreorderProduct(String(product.id)));
                        if (hasPreorder) {
                          if (opt.id === "online") return onlineCardEnabled;
                          if (opt.id === "eft") return eftEnabled;
                          return false;
                        }
                        if (opt.id === "online") return onlineCardEnabled;
                        return true;
                      });
                    })().map((opt) => {
                      const Icon = paymentIcons[opt.id] || CreditCard;
                      const optDiscRate = opt.disc < 0 ? Math.abs(opt.disc) : 0;
                      const optDiscAmount = subtotal * optDiscRate;
                      const optTotal = Math.max(0, subtotal - optDiscAmount);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors ${paymentId === opt.id ? "bg-accent" : ""}`}
                          data-testid={`radio-payment-${opt.id}`}
                        >
                          <RadioGroupItem value={opt.id} data-testid={`input-radio-${opt.id}`} />
                          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block leading-tight" data-testid={`text-payment-name-${opt.id}`}>
                              {opt.name}
                              {opt.id === "nakit" && (
                                <span className="ml-1 font-bold" style={{ color: "#dc2626" }}> (%10 indirimli)</span>
                              )}
                            </span>
                            {opt.id === "online" && (
                              <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">
                                Vade farksız 3-6 taksit
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-extrabold text-primary tabular-nums shrink-0" data-testid={`text-payment-price-${opt.id}`}>
                            {optTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                  )}

                  {paymentId === "eft" && bankIban && (
                    <div className="mt-3 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1.5" data-testid="info-bank-transfer">
                      <div className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4" /> Banka Havalesi / EFT Bilgileri
                      </div>
                      <div className="text-xs text-blue-900 dark:text-blue-100">
                        <div><span className="font-semibold">Alıcı:</span> {bankAccountName || "SİZPA LTD"}</div>
                        {bankName && <div><span className="font-semibold">Banka:</span> {bankName}</div>}
                        <div className="font-mono"><span className="font-semibold font-sans">IBAN:</span> {bankIban}</div>
                        <div className="mt-1 text-[11px] text-blue-800 dark:text-blue-200">
                          Açıklama kısmına sipariş numaranızı yazınız. Sipariş tamamlandıktan sonra banka bilgileri SMS ile de gönderilecek ve "Hesabım → Havale Bildirimi" sekmesinden formu doldurarak bize bildirebilirsiniz.
                        </div>
                      </div>
                    </div>
                  )}

                  {!hasCampaignItems && !hasPreorderItems && posEnabled && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="text-sm font-bold mb-3 flex items-center gap-2 flex-wrap">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Kapıda Kredi Kartı ile Ödeme Yap</span>
                        {installmentRates.filter(r => r.isActive).length > 0 && installmentRates.filter(r => r.isActive).every(r => (r as any).noInterest) && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 px-2 py-0.5 rounded">VADE FARKI YOK</span>
                        )}
                      </h3>
                      <div className="space-y-2">
                        {[{ months: 1, rate: 0, isTekCekim: true, noInterest: false }, ...(installmentsEnabled ? installmentRates.filter(r => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.months - b.months).map(r => ({ months: r.months, rate: (r as any).noInterest ? 0 : r.rate, isTekCekim: false, noInterest: (r as any).noInterest || false })) : [])].map((opt) => {
                          const total = subtotal * (1 + (opt.rate || 0) / 100);
                          const monthly = total / opt.months;
                          const active = paymentId === "pos" && installmentMonths === opt.months;
                          const isPesin = opt.rate === 0;
                          return (
                            <button
                              key={opt.months}
                              type="button"
                              onClick={() => { setPaymentId("pos"); setInstallmentMonths(opt.months); }}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-sm transition ${active ? "bg-amber-50 border-amber-400 dark:bg-amber-950/30 dark:border-amber-600" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-amber-300"}`}
                              data-testid={`btn-installment-${opt.months}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${active ? "bg-amber-500 border-amber-500" : "border-gray-300 dark:border-gray-600"}`}>
                                  {active && <Check className="w-3 h-3 text-white" />}
                                </span>
                                <span className="font-medium">
                                  {opt.isTekCekim ? "Tek Çekim" : `${opt.months} Taksit`}
                                </span>
                                {opt.noInterest && !opt.isTekCekim && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 px-1.5 py-0.5 rounded">(Vade farkı yok)</span>
                                )}
                                {isPesin && !opt.noInterest && !opt.isTekCekim && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 px-1.5 py-0.5 rounded">peşin fiyatına</span>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                {opt.isTekCekim ? (
                                  <span className="font-semibold tabular-nums">{subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span>
                                ) : (
                                  <span className="text-xs">
                                    <span className="text-muted-foreground">{opt.months} x </span>
                                    <span className="font-semibold tabular-nums">{monthly.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span>
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {paymentId === "pos" && installmentMonths > 1 && (() => {
                        const rRaw = installmentRates.find(x => x.months === installmentMonths);
                        if (!rRaw) return null;
                        const r = { ...rRaw, rate: (rRaw as any).noInterest ? 0 : rRaw.rate };
                        const total = subtotal * (1 + (r.rate || 0) / 100);
                        return (
                          <p className="text-[11px] text-muted-foreground mt-2 text-center">
                            Karttan toplam çekilecek: <strong className="text-foreground">{total.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</strong>
                            {r.rate > 0 && ` (vade farkı +%${r.rate})`}
                          </p>
                        );
                      })()}
                    </div>
                  )}

                </CardContent>
              </Card>
            </section>
            </>)}

            <section className="mt-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" data-testid="text-section-summary">
                Sipariş Özeti
              </h2>
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="text-muted-foreground">
                        Sipariş Tutarı
                        {!hasPreorderItems && paymentId === "nakit" && paymentDiscount > 0 && (
                          <span className="ml-1 font-bold" style={{ color: "#dc2626" }}>(%10 indirimli)</span>
                        )}
                      </span>
                      <span className="font-medium" data-testid="text-subtotal">
                        {(hasPreorderItems ? subtotal : (subtotal - paymentDiscount)).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                      </span>
                    </div>
                    {!hasCampaignItems && !hasPreorderItems && isLoggedIn && pointsBalance > 0 && (
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
                    {!hasPreorderItems && appliedCoupon && (
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
                    {!hasPreorderItems && (
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="text-muted-foreground">Getirmesi</span>
                      <span className="font-medium" data-testid="text-shipping">
                        {effectiveShipping === 0 ? (
                          <span className="text-chart-2">Ücretsiz</span>
                        ) : (
                          `${effectiveShipping} TL`
                        )}
                      </span>
                    </div>
                    )}
                  </div>

                  {hasPreorderItems && (
                    <div className="mt-3 pt-3 border-t space-y-1.5 text-sm" data-testid="summary-preorder-breakdown">
                      <div className="flex justify-between gap-3 flex-wrap">
                        <span className="text-muted-foreground">Ürün Toplamı ({preorderMethodLabel}{preorderPm === "nakit" && " - %10 indirimli"})</span>
                        <span className="font-medium">{preorderMethodTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                      </div>
                      <div className="flex justify-between gap-3 flex-wrap">
                        <span className="text-muted-foreground">Teslimatta ({preorderMethodLabel}) - %75</span>
                        <span className="font-medium" style={{ color: "#2e7d32" }}>{preorderRemaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-lg font-bold">{hasPreorderItems ? "Şimdi Ödenecek Kapora (%25)" : "Ödenecek Tutar"}</span>
                      <span className="text-2xl font-extrabold text-primary" data-testid="text-total">
                        {displayTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                      </span>
                    </div>
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

                  {subtotal > 0 && subtotal < effShipLimit && !hasCampaignItems && (
                    <div
                      className="mt-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4"
                      data-testid="alert-free-shipping-info"
                      role="status"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                          <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-amber-900 dark:text-amber-200" data-testid="text-free-ship-title">
                            {matchedNeighborhood ? `${matchedNeighborhood.name}: ` : ""}{effShipLimit} TL ve üstü siparişlerde getirme ücreti yoktur
                          </p>
                          <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-1 leading-relaxed" data-testid="text-free-ship-msg">
                            {matchedNeighborhood
                              ? `Şu an getirmesi ${effShipFee} TL. ${(effShipLimit - subtotal).toLocaleString("tr-TR")} TL daha ekleyin, ücretsiz olsun.`
                              : "İsterseniz ürün ekleyebilirsiniz."}
                          </p>
                          <Link href={categoryHref}>
                            <a
                              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                              data-testid="link-free-ship-category"
                            >
                              {categoryLabel}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
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
