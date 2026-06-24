import { useState } from "react";
import { Link } from "wouter";
import { Cat, Dog, CheckCircle2, Loader2, ArrowLeft, Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";

export default function AbonePage() {
  const [phone, setPhone] = useState("");
  const [petType, setPetType] = useState<"kedi" | "kopek" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    const parts = [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 8),
      digits.slice(8, 10),
    ].filter(Boolean);
    return parts.join(" ");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (!/^5\d{9}$/.test(digits)) {
      setError("Geçerli bir cep numarası giriniz. (5XX XXX XX XX)");
      return;
    }
    if (!petType) {
      setError("Lütfen evcil hayvanınızı seçin.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/abone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, petType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Kayıt oluşturulamadı");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center px-4 py-4">
        <SEO title="Kayıt Başarılı - JETGO" description="Açılış ve kampanya haberleri için kaydınız alındı." />
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 text-center" data-testid="abone-success">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Teşekkür Ederiz!</h1>
          <p className="text-gray-700 text-sm leading-relaxed">
            Açılışımızdan ve kampanyalarımızdan <strong className="text-purple-700">ilk siz haberdar</strong> olacaksınız.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mt-2 mb-5">
            Size SMS ile bilgi verilecektir.
          </p>
          <Link href="/">
            <Button className="w-full h-11 text-sm bg-purple-700 hover:bg-purple-800" data-testid="button-home">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-3 py-3 sm:py-8">
      <SEO
        title="Haberdar Ol - JETGO Pet Shop"
        description="JETGO açılış ve kampanyalarından ilk siz haberdar olun. Kedi ve köpek sahipleri için."
      />
      <div className="max-w-md mx-auto">
        <Link href="/">
          <button className="text-purple-700 text-xs flex items-center gap-1 mb-2" data-testid="link-back">
            <ArrowLeft className="w-3.5 h-3.5" /> Ana Sayfa
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white px-4 py-3 flex items-center gap-3 relative overflow-hidden">
            <Sparkles className="absolute top-1 right-2 w-4 h-4 opacity-30" />
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] opacity-90 uppercase tracking-wide">Açılış & Kampanya Haberleri</p>
              <p className="text-lg font-extrabold">İlk Siz Haberdar Olun</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Cep Numarası
              </label>
              <div className="flex items-stretch rounded-xl border-2 border-gray-200 focus-within:border-purple-500 transition-colors overflow-hidden">
                <span className="bg-gray-50 px-3 flex items-center text-gray-600 text-sm font-medium border-r border-gray-200">
                  +90
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="5XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="border-0 focus-visible:ring-0 h-12 text-base flex-1"
                  data-testid="input-phone"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Evcil Hayvanınız
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPetType("kedi")}
                  className={`relative flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all ${
                    petType === "kedi"
                      ? "border-purple-600 bg-purple-50 shadow-md scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  data-testid="radio-pet-kedi"
                >
                  <Cat className={`w-9 h-9 ${petType === "kedi" ? "text-purple-700" : "text-gray-500"}`} />
                  <span className={`text-sm font-semibold ${petType === "kedi" ? "text-purple-800" : "text-gray-700"}`}>
                    Kedi
                  </span>
                  {petType === "kedi" && (
                    <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-purple-600" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPetType("kopek")}
                  className={`relative flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all ${
                    petType === "kopek"
                      ? "border-purple-600 bg-purple-50 shadow-md scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  data-testid="radio-pet-kopek"
                >
                  <Dog className={`w-9 h-9 ${petType === "kopek" ? "text-purple-700" : "text-gray-500"}`} />
                  <span className={`text-sm font-semibold ${petType === "kopek" ? "text-purple-800" : "text-gray-700"}`}>
                    Köpek
                  </span>
                  {petType === "kopek" && (
                    <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-purple-600" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" data-testid="text-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-13 py-3.5 text-base font-bold bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 shadow-lg"
              data-testid="button-submit"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Kaydediliyor...</>
              ) : (
                <>Beni Haberdar Et</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
