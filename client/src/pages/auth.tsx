import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Lock, User, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useCustomer();
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
        await register(normalized, password, name.trim());
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
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Sifre (4 haneli dogum yiliniz)
                </label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPassword(val);
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder="ornegin: 1990"
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
