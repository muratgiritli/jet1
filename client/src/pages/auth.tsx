import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Lock, User, Loader2, ArrowLeft, Eye, EyeOff, MapPin, Navigation, Home, Calendar } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import { TESLIMAT_MAHALLELERI } from "@/lib/data";
import Logo from "@/components/Logo";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { login, register, updateProfile } = useCustomer();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const normalized = phone.replace(/\D/g, "");

    if (mode === "register" && !name.trim()) {
      errors.name = "Ad soyad girin";
    }
    if (normalized.length < 10) {
      errors.phone = "Geçerli bir telefon numarası girin";
    }
    if (password.length < 4) {
      errors.password = "4 haneli doğum yılınızı girin";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setLoading(true);
    try {
      if (mode === "login") {
        await login(normalized, password);
      } else {
        const fullAddress = [mahalle, address.trim()].filter(Boolean).join(", ");
        await register(normalized, password, name.trim(), fullAddress || undefined);
        if (mahalle) {
          localStorage.setItem("jet55_mahalle", mahalle);
        }
        if (address.trim()) {
          try { await updateProfile({ address: fullAddress }); } catch {}
        }
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      setLocation(redirect);
    } catch (err: any) {
      const msg = err.message || "Bir hata oluştu";
      const cleaned = msg.replace(/^\d+:\s*/, "");
      let errorMsg = cleaned;
      try {
        const parsed = JSON.parse(cleaned);
        errorMsg = parsed.message || cleaned;
      } catch {}
      const lower = errorMsg.toLowerCase();
      if (lower.includes("kayıtlı") || lower.includes("zaten") || lower.includes("already") || lower.includes("registered")) {
        setFormErrors({ phone: "Bu numara zaten kayıtlı" });
      } else if (lower.includes("şifre") || lower.includes("password") || lower.includes("hatalı") || lower.includes("incorrect") || lower.includes("wrong")) {
        setFormErrors({ password: "Şifre hatalı" });
      } else if (lower.includes("bulunamadı") || lower.includes("not found") || lower.includes("kullanıcı")) {
        setFormErrors({ phone: "Bu numara ile kayıt bulunamadı" });
      } else {
        setFormErrors({ general: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#6B3480" }}>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center relative">
          <Link href="/">
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white" data-testid="btn-auth-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <Logo className="text-3xl" linkTo="/" testId="img-auth-logo" />
        </div>
      </header>

      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold" data-testid="text-auth-title">
            {mode === "login" ? "Giriş Yap" : "Üye Ol"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Telefon numaranız ve şifrenizle giriş yapın"
              : "Hızlı sipariş için üye olun"}
          </p>
        </div>

        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
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
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      Adres
                    </label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Sokak, bina no, daire no"
                      data-testid="input-auth-address"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Mahalle
                    </label>
                    <Select value={mahalle} onValueChange={setMahalle}>
                      <SelectTrigger data-testid="select-auth-mahalle" className={`h-9 text-sm ${!mahalle ? "text-muted-foreground" : ""}`}>
                        <SelectValue placeholder="Mahallenizi seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {TESLIMAT_MAHALLELERI.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
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
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Telefon Numarası
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium shrink-0">+90</span>
                  <Input
                    value={phone}
                    onChange={(e) => { handlePhoneChange(e.target.value); setFormErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder="5XX XXX XX XX"
                    type="tel"
                    className={formErrors.phone ? "border-red-400" : ""}
                    data-testid="input-auth-phone"
                  />
                </div>
                {formErrors.phone && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  {mode === "register" ? <Calendar className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  {mode === "register" ? "Doğum Yılı (Şifreniz olacak)" : "Şifre (Doğum yılınız)"}
                </label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPassword(val);
                      setFormErrors((p) => ({ ...p, password: "" }));
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Örn: 1990"
                    inputMode="numeric"
                    maxLength={4}
                    className={formErrors.password ? "border-red-400" : ""}
                    data-testid="input-auth-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="btn-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-[11px] text-red-500 mt-0.5">{formErrors.password}</p>}
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
                {mode === "login" ? "Giriş Yap" : "Üye Ol"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:underline"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setName("");
                  setPassword("");
                  setAddress("");
                  setMahalle("");
                  setCustomerLocation(null);
                  setFormErrors({});
                }}
                data-testid="btn-auth-toggle"
              >
                {mode === "login"
                  ? "Hesabınız yok mu? Hemen üye olun"
                  : "Zaten üye misiniz? Giriş yapın"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
