import { useState, useEffect, useRef } from "react";
import { Gift, Phone, ArrowRight, Loader2, X, Check, PartyPopper } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { apiRequest } from "@/lib/queryClient";

type BannerStep = "idle" | "phone" | "otp" | "name" | "success";

export default function SignupBonusBanner() {
  const { isLoggedIn } = useCustomer();
  const [step, setStep] = useState<BannerStep>("idle");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
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

  if (isLoggedIn || dismissed) return null;

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
        setStep("name");
      } else if (data.isNewUser) {
        setStep("name");
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
    if (!name.trim()) { setError("Ad soyad girin"); return; }
    setError("");
    setLoading(true);
    try {
      await apiRequest("PATCH", "/api/customer/profile", { name: name.trim() });
      setStep("success");
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: any) {
      let msg = "Bir hata oluştu";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
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
            <p className="text-sm text-white/90">100 TL bonus kuponun hazır!</p>
            {welcomeCoupon && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="bg-white text-green-700 font-black text-sm px-3 py-1 rounded-lg tracking-wider" data-testid="text-welcome-coupon">{welcomeCoupon}</span>
                <span className="text-xs text-white/80">Min. 500 TL | 30 gün geçerli</span>
              </div>
            )}
          </div>
        </div>
      </div>
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

      {step === "name" && (
        <div className="px-4 py-4">
          <p className="font-bold text-sm mb-2 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Numara doğrulandı! Ad soyadınızı girin
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="flex-1 px-3 py-2.5 rounded-xl text-gray-900 text-sm font-medium outline-none"
              autoFocus
              data-testid="input-bonus-name"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-yellow-400 text-gray-900 font-bold text-sm px-4 rounded-xl flex items-center gap-1 disabled:opacity-60 active:scale-[0.98] transition-transform flex-shrink-0"
              data-testid="btn-bonus-register"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gift className="w-4 h-4" /> Kaydol</>}
            </button>
          </div>
          {error && <p className="text-yellow-200 text-xs mt-1.5" data-testid="text-bonus-name-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
