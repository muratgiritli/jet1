import { useState, useEffect, useRef } from "react";
import { Gift, Phone, ArrowRight, Loader2, X, Check, PartyPopper, User, Download, Home, Building2 } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { apiRequest } from "@/lib/queryClient";
import { TESLIMAT_MAHALLELERI } from "@/lib/data";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type BannerStep = "idle" | "phone" | "otp" | "register" | "success";

export default function SignupBonusBanner() {
  const { isLoggedIn } = useCustomer();
  const [step, setStep] = useState<BannerStep>("idle");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [adresDetay, setAdresDetay] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; mahalle?: string; adres?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [welcomeCoupon, setWelcomeCoupon] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const isStandaloneMode =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  if (isLoggedIn || dismissed || isStandaloneMode) return null;

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 11) setPhone(formatPhone(digits));
  };

  const sendOtp = async () => {
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setError("Geçerli bir telefon numarası girin");
      return;
    }
    setError("");
    setLoading(true);
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
      setStep("otp");
      setCountdown(180);
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      let msg = "SMS gönderilemedi";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("");
      for (let i = 0; i < 6; i++) newCode[i] = digits[i] || "";
      setOtpCode(newCode);
      const lastIdx = Math.min(digits.length - 1, 5);
      otpRefs.current[lastIdx]?.focus();
      if (newCode.every(d => d !== "") && !verifyingRef.current) {
        verifyingRef.current = true;
        setTimeout(() => doVerify(newCode.join("")), 150);
      }
      return;
    }
    newCode[index] = value;
    setOtpCode(newCode);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newCode.every(d => d !== "") && !verifyingRef.current) {
      verifyingRef.current = true;
      setTimeout(() => doVerify(newCode.join("")), 150);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (step !== "otp") return;
    if (!("OTPCredential" in window)) return;
    const ac = new AbortController();
    (navigator as any).credentials.get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((otp: any) => {
        if (otp?.code) {
          const digits = otp.code.replace(/\D/g, "");
          if (digits.length === 6) {
            const newCode = digits.split("");
            setOtpCode(newCode);
            if (!verifyingRef.current) {
              verifyingRef.current = true;
              setTimeout(() => doVerify(digits), 150);
            }
          }
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [step]);

  const doVerify = async (code: string) => {
    if (code.length !== 6) { verifyingRef.current = false; return; }
    setError("");
    setLoading(true);
    const normalized = phone.replace(/\D/g, "");
    try {
      const res = await apiRequest("POST", "/api/otp/verify", { phone: normalized, code });
      const data = await res.json();
      if (data.deviceToken) {
        try {
          const tokens = JSON.parse(localStorage.getItem("jetgo_trusted_devices") || "{}");
          tokens[normalized] = data.deviceToken;
          localStorage.setItem("jetgo_trusted_devices", JSON.stringify(tokens));
        } catch {}
      }
      if (data.isNewUser && data.welcomeCouponCode) {
        setWelcomeCoupon(data.welcomeCouponCode);
        setStep("register");
      } else if (data.isNewUser) {
        setStep("register");
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      let msg = "Doğrulama kodu hatalı";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setError(msg);
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleRegister = async () => {
    const errs: { name?: string; mahalle?: string; adres?: string } = {};
    if (!name.trim()) errs.name = "Ad Soyad zorunludur";
    if (!mahalle) errs.mahalle = "Mahalle seçimi zorunludur";
    if (!adresDetay.trim() || adresDetay.trim().length < 10) errs.adres = "Adres bilgisi zorunludur (cadde, sokak, bina vb.)";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) { setError(""); return; }
    setError("");
    setLoading(true);
    const addressParts = [mahalle, adresDetay.trim()].filter(Boolean).join(", ");
    try {
      await apiRequest("PATCH", "/api/customer/profile", {
        name: name.trim(),
        address: addressParts || undefined,
      });
      if (mahalle) localStorage.setItem("jet55_mahalle", mahalle);
      setStep("success");
      setTimeout(() => window.location.reload(), 10000);
    } catch (err: any) {
      let msg = "Bir hata oluştu";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState(() => /iPhone|iPad|iPod/i.test(navigator.userAgent));
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isStandalone] = useState(() =>
    window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      await deferredPrompt.current.userChoice;
      deferredPrompt.current = null;
    }
  };

  if (step === "success") {
    return (
      <>
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-4 rounded-2xl" data-testid="signup-bonus-success">
          <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 p-1 text-white/70 hover:text-white" data-testid="btn-dismiss-bonus">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base">Hoş Geldin! 🎉</p>
              <p className="text-sm text-white/90">100 TL bonus ilk siparişine otomatik tanımlanacak!</p>
            </div>
          </div>

          {!isStandalone && (
            <button
              onClick={handleInstallApp}
              className="w-full mt-3 bg-white/20 backdrop-blur-sm text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 border border-white/30 active:scale-[0.98] transition-transform"
              data-testid="btn-install-after-signup"
            >
              <Download className="w-5 h-5" />
              Uygulamayı İndir - Bonusun Aktif Olsun!
            </button>
          )}
        </div>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40"
            onClick={() => setShowIOSGuide(false)}
            data-testid="ios-install-guide-signup"
          >
            <div
              className="w-full max-w-lg bg-white rounded-t-2xl px-5 pt-6 space-y-3"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-base font-bold text-gray-900 text-center">Ana Ekrana Ekle</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">1.</span> Safari'de alt barda <span className="inline-block text-lg leading-none align-middle">⬆</span> (Paylaş) butonuna dokunun</p>
                <p><span className="font-semibold">2.</span> Aşağı kaydırıp <span className="font-semibold">"Ana Ekrana Ekle"</span> seçeneğini bulun</p>
                <p><span className="font-semibold">3.</span> <span className="font-semibold">"Ekle"</span> butonuna dokunun</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: "#6B3480" }}
                data-testid="btn-close-ios-guide-signup"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl overflow-hidden" data-testid="signup-bonus-banner">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 z-10 p-1 text-white/70 hover:text-white" data-testid="btn-dismiss-bonus">
        <X className="w-4 h-4" />
      </button>

      {step === "idle" && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">Jetgo'ya hemen üye ol</p>
              <p className="text-sm text-white/90 leading-tight">100 TL anında bonus sepetinde</p>
            </div>
          </div>
          <button
            onClick={() => setStep("phone")}
            className="w-full mt-1 bg-white text-blue-600 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            data-testid="btn-start-signup"
          >
            HEMEN ÜYE OL
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === "phone" && (
        <div className="px-4 py-4">
          <p className="font-bold text-sm mb-2 flex items-center gap-1.5">
            <Phone className="w-4 h-4" /> Cep telefon numaranı gir
          </p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+90</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="5XX XXX XX XX"
                className="w-full pl-12 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none"
                autoFocus
                data-testid="input-bonus-phone"
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="bg-yellow-400 text-gray-900 font-bold text-sm px-4 rounded-xl flex items-center gap-1 disabled:opacity-60 active:scale-[0.98] transition-transform flex-shrink-0"
              data-testid="btn-bonus-send-otp"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Gönder</>}
            </button>
          </div>
          {error && <p className="text-yellow-200 text-xs mt-1.5" data-testid="text-bonus-error">{error}</p>}
        </div>
      )}

      {step === "otp" && (
        <div className="px-4 py-4">
          <p className="font-bold text-sm mb-1">SMS ile gelen 6 haneli kodu gir</p>
          <p className="text-xs text-white/70 mb-2">
            {phone} numarasına gönderildi
            {countdown > 0 && <span className="ml-1">({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")})</span>}
          </p>
          <div className="flex gap-1.5 justify-center mb-2">
            {otpCode.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                className="w-10 h-11 text-center text-lg font-bold text-gray-900 bg-white rounded-lg outline-none"
                data-testid={`input-bonus-otp-${i}`}
              />
            ))}
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Doğrulanıyor...
            </div>
          )}
          {error && <p className="text-yellow-200 text-xs text-center" data-testid="text-bonus-otp-error">{error}</p>}
        </div>
      )}

      {step === "register" && (
        <div className="px-4 py-4">
          <p className="font-bold text-sm mb-3 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Numara doğrulandı! Bilgilerini tamamla
          </p>
          <div className="space-y-2">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Adı Soyadı *"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none ${fieldErrors.name ? "ring-2 ring-red-400" : ""}`}
                  autoFocus
                  data-testid="input-bonus-name"
                />
              </div>
              {fieldErrors.name && <p className="text-yellow-200 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Mahalle*</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={mahalle}
                  onChange={(e) => { setMahalle(e.target.value); setFieldErrors((p) => ({ ...p, mahalle: undefined })); }}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none appearance-none bg-white ${fieldErrors.mahalle ? "ring-2 ring-red-400" : ""}`}
                  data-testid="select-bonus-mahalle"
                >
                  <option value="">Seçiniz</option>
                  {TESLIMAT_MAHALLELERI.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.mahalle && <p className="text-yellow-200 text-xs mt-1">{fieldErrors.mahalle}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold">Adres*</label>
              <p className="text-[11px] text-white/85 leading-snug mb-1.5">
                Siparişinizin size sorunsuz bir şekilde ulaşabilmesi için mahalle, cadde, sokak, bina gibi detay bilgileri eksiksiz girdiğinizden emin olun.
              </p>
              <textarea
                value={adresDetay}
                onChange={(e) => { setAdresDetay(e.target.value); setFieldErrors((p) => ({ ...p, adres: undefined })); }}
                placeholder="Cadde, Mahalle, Sokak ve diğer bilgileri giriniz."
                rows={4}
                className={`w-full px-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none resize-none ${fieldErrors.adres ? "ring-2 ring-red-400" : ""}`}
                data-testid="input-bonus-adres"
              />
              {fieldErrors.adres && <p className="text-yellow-200 text-xs mt-1">{fieldErrors.adres}</p>}
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-yellow-400 text-gray-900 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
              data-testid="btn-bonus-register"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gift className="w-4 h-4" /> Kaydol ve 100 TL Kazan</>}
            </button>
          </div>
          {error && <p className="text-yellow-200 text-xs mt-1.5" data-testid="text-bonus-register-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
