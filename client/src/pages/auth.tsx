import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Lock, User, Loader2, ArrowLeft, Eye, EyeOff, MapPin, Navigation, Home, Calendar } from "lucide-react";

const BIRTH_YEARS = Array.from({ length: 2011 - 1945 + 1 }, (_, i) => String(2011 - i));
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
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      toast({ title: "Hata", description: "Geçerli bir telefon numarası girin", variant: "destructive" });
      return;
    }
    if (password.length < 4) {
      toast({ title: "Hata", description: "Şifre en az 4 karakter olmalı", variant: "destructive" });
      return;
    }
    if (mode === "register" && !name.trim()) {
      toast({ title: "Hata", description: "Ad soyad girin", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(normalized, password);
        toast({ title: "Hoş geldiniz!" });
      } else {
        const fullAddress = [mahalle, address.trim()].filter(Boolean).join(", ");
        await register(normalized, password, name.trim(), fullAddress || undefined);
        if (mahalle) {
          localStorage.setItem("jet55_mahalle", mahalle);
        }
        if (address.trim()) {
          try { await updateProfile({ address: fullAddress }); } catch {}
        }
        toast({ title: "Kayıt başarılı!", description: "Hoş geldiniz!" });
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      setLocation(redirect);
    } catch (err: any) {
      const msg = err.message || "Bir hata oluştu";
      const cleaned = msg.replace(/^\d+:\s*/, "");
      try {
        const parsed = JSON.parse(cleaned);
        toast({ title: "Hata", description: parsed.message || cleaned, variant: "destructive" });
      } catch {
        toast({ title: "Hata", description: cleaned, variant: "destructive" });
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
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      data-testid="input-auth-name"
                    />
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
                              toast({ title: "Konum alınamadı", variant: "destructive" });
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
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="5XX XXX XX XX"
                    type="tel"
                    data-testid="input-auth-phone"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  {mode === "register" ? <Calendar className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                  {mode === "register" ? "Doğum Yılı (Şifreniz olacak)" : "Şifre (Doğum yılınız)"}
                </label>
                {mode === "register" ? (
                  <Select value={password} onValueChange={setPassword}>
                    <SelectTrigger data-testid="select-auth-birthyear" className={`h-9 text-sm ${!password ? "text-muted-foreground" : ""}`}>
                      <SelectValue placeholder="Doğum yılınızı seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      {BIRTH_YEARS.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      value={password}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setPassword(val);
                      }}
                      type={showPassword ? "text" : "password"}
                      placeholder="Doğum yılınız: 1990"
                      inputMode="numeric"
                      maxLength={4}
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
                )}
              </div>

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
