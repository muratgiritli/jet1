import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, User, Loader2, MapPin, Navigation, Home, ShieldCheck, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { useCustomer } from "@/contexts/CustomerContext";
import { TESLIMAT_MAHALLELERI } from "@/lib/data";
import { apiRequest } from "@/lib/queryClient";

type Step = "phone" | "otp" | "register";

export default function AuthPage() {
  const searchStr = useSearch();
  const isRegisterTab = new URLSearchParams(searchStr).get("tab") === "register";
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [adresDetay, setAdresDetay] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const { loginWithOtp, isLoggedIn } = useCustomer();
  const [, setLocation] = useLocation();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn) {
      const params = new URLSearchParams(searchStr);
      setLocation(params.get("redirect") || "/hesabim");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 11) {
      setPhone(formatPhone(digits));
    }
  };

  const sendOtp = async () => {
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setFormErrors({ phone: "Geçerli bir telefon numarası girin" });
      return;
    }
    setFormErrors({});
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
        setLocation(new URLSearchParams(window.location.search).get("redirect") || "/");
        window.location.reload();
        return;
      }
      setIsExistingUser(data.isExisting);
      setStep("otp");
      setCountdown(180);
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      let msg = "SMS gönderilemedi";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setFormErrors({ phone: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || "";
      }
      setOtpCode(newCode);
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      otpRefs.current[lastFilledIndex]?.focus();
      if (newCode.every(d => d !== "") && !verifyingRef.current) {
        verifyingRef.current = true;
        setTimeout(() => autoVerify(newCode.join("")), 150);
      }
      return;
    }
    newCode[index] = value;
    setOtpCode(newCode);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (newCode.every(d => d !== "") && !verifyingRef.current) {
      verifyingRef.current = true;
      setTimeout(() => autoVerify(newCode.join("")), 150);
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
            setOtpCode(digits.split(""));
            if (!verifyingRef.current) {
              verifyingRef.current = true;
              setTimeout(() => autoVerify(digits), 150);
            }
          }
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [step]);

  const doVerify = async (code: string) => {
    setFormErrors({});
    setLoading(true);
    setAutoVerifying(true);
    const normalized = phone.replace(/\D/g, "");
    try {
      const data = await loginWithOtp(normalized, code);
      if (data?.requiresRegistration) {
        setStep("register");
      } else {
        const params = new URLSearchParams(window.location.search);
        setLocation(params.get("redirect") || "/");
      }
    } catch (err: any) {
      let msg = "Doğrulama kodu hatalı";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setFormErrors({ otp: msg });
    } finally {
      setLoading(false);
      setAutoVerifying(false);
      verifyingRef.current = false;
    }
  };

  const autoVerify = (code: string) => {
    if (code.length === 6) doVerify(code);
    else verifyingRef.current = false;
  };

  const verifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setFormErrors({ otp: "6 haneli kodu girin" });
      return;
    }
    doVerify(code);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Ad Soyad zorunludur";
    if (!mahalle) errors.mahalle = "Mahalle seçimi zorunludur";
    if (!adresDetay.trim() || adresDetay.trim().length < 10) errors.adres = "Adres bilgisi zorunludur (cadde, sokak, bina vb.)";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setLoading(true);
    const normalized = phone.replace(/\D/g, "");
    const code = otpCode.join("");
    const fullAddress = [mahalle, adresDetay.trim()].filter(Boolean).join(", ");
    try {
      await loginWithOtp(normalized, code, name.trim(), fullAddress || undefined);
      if (mahalle) localStorage.setItem("jet55_mahalle", mahalle);
      const params = new URLSearchParams(window.location.search);
      setLocation(params.get("redirect") || "/");
    } catch (err: any) {
      let msg = "Bir hata oluştu";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      setFormErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEO
        title="Giriş Yap / Üye Ol | JETGO Pet Shop Samsun"
        description="JETGO Pet Shop üyelik girişi. Siparişlerinizi takip edin, para puan kazanın, favori ürünlerinizi kaydedin."
        noindex
      />
      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold" data-testid="text-auth-title">
            {step === "phone" && (isRegisterTab ? "Üye Ol" : "Giriş Yap / Üye Ol")}
            {step === "otp" && "Doğrulama Kodu"}
            {step === "register" && "Bilgilerinizi Tamamlayın"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "phone" && (isRegisterTab
              ? "Hızlı sipariş için üye olun — telefonunuza SMS kodu göndereceğiz"
              : "Telefon numaranıza SMS ile doğrulama kodu göndereceğiz")}
            {step === "otp" && `+90 ${phone} numarasına gönderilen 6 haneli kodu girin`}
            {step === "register" && "Sipariş için bilgilerinizi girin"}
          </p>
        </div>

        <Card>
          <CardContent className="p-5">
            {step === "phone" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Telefon Numarası
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium shrink-0">+90</span>
                    <Input
                      value={phone}
                      onChange={(e) => { handlePhoneChange(e.target.value); setFormErrors({}); }}
                      placeholder="5XX XXX XX XX"
                      type="tel"
                      className={formErrors.phone ? "border-red-400" : ""}
                      data-testid="input-auth-phone"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendOtp(); } }}
                    />
                  </div>
                  {formErrors.phone && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.phone}</p>}
                </div>

                <Button
                  onClick={sendOtp}
                  className="w-full"
                  disabled={loading}
                  style={{ backgroundColor: "#6B3480" }}
                  data-testid="btn-send-otp"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  SMS Kodu Gönder
                </Button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-700 space-y-1">
                    <div>+90 {phone} numarasına 6 haneli doğrulama kodu gönderildi</div>
                    <div className="font-medium" data-testid="text-otp-info">
                      {isExistingUser
                        ? "Bu numara kayıtlı. Kodu doğruladıktan sonra otomatik giriş yapılacaktır."
                        : "Bu numara kayıtlı değil. Kodu doğruladıktan sonra üyelik bilgilerinizi tamamlayacaksınız."}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-center block">Doğrulama Kodu</label>
                  <div className="flex gap-2 justify-center">
                    {otpCode.map((digit, i) => (
                      <Input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
                          handleOtpChange(0, pasted);
                        }}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        className={`w-11 h-12 text-center text-lg font-bold ${formErrors.otp ? "border-red-400" : ""}`}
                        data-testid={`input-otp-${i}`}
                      />
                    ))}
                  </div>
                  {formErrors.otp && <p className="text-[11px] text-red-500 text-center mt-1">{formErrors.otp}</p>}
                </div>

                {countdown > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Kod {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")} süre geçerli
                  </p>
                )}

                <Button
                  onClick={verifyOtp}
                  className="w-full"
                  disabled={loading || otpCode.join("").length !== 6}
                  style={{ backgroundColor: "#6B3480" }}
                  data-testid="btn-verify-otp"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Doğrula
                </Button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                    onClick={() => { setStep("phone"); setFormErrors({}); setOtpCode(["", "", "", "", "", ""]); }}
                    data-testid="btn-back-phone"
                  >
                    <ArrowLeft className="w-3 h-3" /> Numarayı Değiştir
                  </button>
                  {countdown <= 0 && (
                    <button
                      type="button"
                      className="text-xs text-purple-600 hover:underline"
                      onClick={sendOtp}
                      disabled={loading}
                      data-testid="btn-resend-otp"
                    >
                      Tekrar Gönder
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Ad Soyad
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFormErrors((p) => ({ ...p, name: "" })); }}
                    placeholder="Adınız Soyadınız"
                    className={formErrors.name ? "border-red-400" : ""}
                    data-testid="input-auth-name"
                  />
                  {formErrors.name && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Mahalle*
                  </label>
                  <Select value={mahalle} onValueChange={(v) => { setMahalle(v); setFormErrors((p) => ({ ...p, mahalle: "" })); }}>
                    <SelectTrigger data-testid="select-auth-mahalle" className={`h-10 text-sm ${!mahalle ? "text-muted-foreground" : ""} ${formErrors.mahalle ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="max-h-[60vh] w-[var(--radix-select-trigger-width)]">
                      {TESLIMAT_MAHALLELERI.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.mahalle && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.mahalle}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    Adres*
                  </label>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Siparişinizin size sorunsuz bir şekilde ulaşabilmesi için mahalle, cadde, sokak, bina gibi detay bilgileri eksiksiz girdiğinizden emin olun.
                  </p>
                  <textarea
                    value={adresDetay}
                    onChange={(e) => { setAdresDetay(e.target.value); setFormErrors((p) => ({ ...p, adres: "" })); }}
                    placeholder="Cadde, Mahalle, Sokak ve diğer bilgileri giriniz."
                    rows={4}
                    className={`w-full px-3 py-2 rounded-md border text-sm outline-none resize-none ${formErrors.adres ? "border-red-400" : "border-input"} bg-background`}
                    data-testid="input-auth-adres"
                  />
                  {formErrors.adres && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.adres}</p>}
                </div>

                <div className="space-y-1.5 lg:hidden">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-muted-foreground" />
                    Konum
                  </label>
                  {customerLocation ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-green-200 bg-green-50">
                      <Navigation className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs text-green-700">Konum alındı</span>
                      <button
                        type="button"
                        onClick={() => setCustomerLocation(null)}
                        className="ml-auto text-xs text-muted-foreground underline"
                        data-testid="btn-remove-location"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={locationLoading}
                      onClick={() => {
                        if (!navigator.geolocation) {
                          setFormErrors((p) => ({ ...p, location: "Tarayıcınız konum paylaşımını desteklemiyor" }));
                          return;
                        }
                        setLocationLoading(true);
                        setFormErrors((p) => ({ ...p, location: "" }));
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                            setLocationLoading(false);
                          },
                          () => {
                            setLocationLoading(false);
                            setFormErrors((p) => ({ ...p, location: "Konum alınamadı. Lütfen konum izni verin." }));
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      }}
                      data-testid="btn-get-location"
                    >
                      {locationLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Navigation className="w-4 h-4 mr-1" />}
                      Konumumu Paylaş
                    </Button>
                  )}
                  {formErrors.location && <p className="text-[11px] text-red-500 mt-1">{formErrors.location}</p>}
                </div>

                {formErrors.general && <p className="text-[11px] text-red-500 text-center">{formErrors.general}</p>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  style={{ backgroundColor: "#6B3480" }}
                  data-testid="btn-auth-submit"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Üye Ol ve Devam Et
                </Button>

                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mx-auto"
                  onClick={() => { setStep("phone"); setFormErrors({}); }}
                  data-testid="btn-back-phone-reg"
                >
                  <ArrowLeft className="w-3 h-3" /> Başa Dön
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
