import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useSocialAuth } from "@/contexts/SocialAuthContext";

export default function CommunityAuthPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();
  const redirect = params.get("redirect") || "/";
  const [tab, setTab] = useState<"login" | "register">(params.get("tab") === "register" ? "register" : "login");
  const { login, register } = useSocialAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [reg, setReg] = useState({ username: "", email: "", password: "", name: "", city: "", dogName: "" });

  const goAfter = () => setLocation(redirect.startsWith("/") ? redirect : "/");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(loginForm.username, loginForm.password);
      goAfter();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(reg);
      goAfter();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CommunityLayout>
      <SEO title="Giriş — YourPoodle" description="YourPoodle hesabına giriş yap veya üye ol." canonical={`${SITE_DOMAIN}/yp-giris`} />
      <div className="px-4 pt-6">
        <h1 className="text-lg font-extrabold text-[#1C1B1F]">YourPoodle hesabı</h1>
        <p className="text-[13px] text-[#6B6573] mt-1">
          Demo: <span className="font-semibold">elif / poodle123</span> · Yönetici: <span className="font-semibold">admin / YourPoodle1!</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-[#F6F3FB] p-1">
          <button type="button" onClick={() => setTab("login")} className={`h-9 rounded-full text-sm font-semibold ${tab === "login" ? "bg-white text-[#1C1B1F] shadow-sm" : "text-[#6B6573]"}`}>
            Giriş
          </button>
          <button type="button" onClick={() => setTab("register")} className={`h-9 rounded-full text-sm font-semibold ${tab === "register" ? "bg-white text-[#1C1B1F] shadow-sm" : "text-[#6B6573]"}`}>
            Üye ol
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={(e) => void onLogin(e)} className="mt-4 space-y-2" data-testid="form-social-login">
            <input value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} placeholder="Kullanıcı adı veya e-posta" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" data-testid="input-login-username" />
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} placeholder="Şifre" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" data-testid="input-login-password" />
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="h-11 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold">
              {busy ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void onRegister(e)} className="mt-4 space-y-2" data-testid="form-social-register">
            <input value={reg.name} onChange={(e) => setReg((f) => ({ ...f, name: e.target.value }))} placeholder="Adın" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" />
            <input value={reg.username} onChange={(e) => setReg((f) => ({ ...f, username: e.target.value }))} placeholder="Kullanıcı adı" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" />
            <input type="email" value={reg.email} onChange={(e) => setReg((f) => ({ ...f, email: e.target.value }))} placeholder="E-posta" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" />
            <input value={reg.city} onChange={(e) => setReg((f) => ({ ...f, city: e.target.value }))} placeholder="Şehir" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" />
            <input value={reg.dogName} onChange={(e) => setReg((f) => ({ ...f, dogName: e.target.value }))} placeholder="Köpeğinin adı" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" />
            <input type="password" value={reg.password} onChange={(e) => setReg((f) => ({ ...f, password: e.target.value }))} placeholder="Şifre" className="w-full h-11 rounded-xl border border-[#E4DCF3] px-3 text-sm" />
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="h-11 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold">
              {busy ? "Kayıt olunuyor…" : "Üye ol"}
            </button>
          </form>
        )}
        <p className="mt-4 text-[12px] text-[#6B6573]">
          Mağaza hesabı için <Link href="/giris" className="font-semibold text-[#8E7CC3]">petshop girişi</Link>.
        </p>
      </div>
    </CommunityLayout>
  );
}
