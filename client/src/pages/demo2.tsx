import { Search, ScanLine, LogIn, UserPlus, Clock, PackageCheck, Banknote, QrCode, ShieldCheck, Truck, Tag, CreditCard, Grid3x3 } from "lucide-react";

export default function Demo2() {
  return (
    <div className="min-h-screen bg-[#f5f4fb] flex justify-center font-['Inter']">
      <div className="w-full max-w-[412px] bg-white pb-4">
        {/* HEADER */}
        <div className="relative bg-gradient-to-b from-[#4a1d96] via-[#5b21b6] to-[#6d28d9] text-white px-4 pt-3 pb-5 rounded-b-[28px] shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 text-2xl leading-none">🐾</span>
              <span className="text-yellow-400 font-black text-3xl tracking-tight leading-none">jetgo</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-white/20">
                <LogIn className="w-3.5 h-3.5" /> Giriş Yap
              </button>
              <button className="flex items-center gap-1 bg-yellow-400 text-[#3f1d80] px-3 py-1.5 rounded-full text-[12px] font-bold">
                <UserPlus className="w-3.5 h-3.5" /> Üye Ol
              </button>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="text-yellow-300 text-[13px] font-extrabold tracking-wide">ATAKUM İÇİ</div>
            <div className="text-white text-[18px] font-black tracking-wide flex items-center justify-center gap-2">
              1 SAATTE TESLİM <Clock className="w-4 h-4 text-yellow-300" strokeWidth={2.8} />
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 flex items-center bg-white rounded-2xl shadow-md overflow-hidden">
            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
            <input
              className="flex-1 px-2 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400"
              placeholder="Binlerce ürün arasında ara..."
              readOnly
            />
            <button className="bg-purple-600 hover:bg-purple-700 m-1 p-2 rounded-xl">
              <ScanLine className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="px-3 mt-4 grid grid-cols-6 gap-1.5">
          <CatCircle img="/images/category-dog.webp" label="Köpek" ring="ring-orange-300" />
          <CatCircle img="/images/category-cat.webp" label="Kedi" ring="ring-purple-300" />
          <CatCircle img="/images/category-bird.webp" label="Kuş" ring="ring-sky-300" />
          <CatCircle img="/images/category-rabbit.webp" label="Kemirgen" ring="ring-pink-300" />
          <CatCircle img="/images/cat-bird.webp" label="Akvaryum" ring="ring-orange-400" />
          <div className="flex flex-col items-center">
            <div className="w-[52px] h-[52px] rounded-full bg-purple-100 ring-4 ring-purple-200 flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-purple-700" />
            </div>
            <div className="mt-1 text-[10px] font-semibold text-gray-700">Tümü</div>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="px-3 mt-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#5b21b6] via-[#6d28d9] to-[#3b1378] p-4 shadow-xl shadow-purple-900/25 min-h-[280px]">
            {/* city blur backdrop */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.4),transparent_60%)]" />
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-pink-400/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex gap-2">
              {/* LEFT TEXT */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-400 text-base leading-none">🐾</span>
                  <span className="text-yellow-400 font-black text-xl leading-none">jetgo</span>
                </div>
                <div className="text-white font-black text-[15px] leading-tight">PET ALIŞVERİŞİ</div>
                <div className="text-yellow-300 font-black text-[15px] leading-tight">ARTIK ÇOK HIZLI!</div>

                <div className="inline-block mt-2 bg-yellow-400 text-[#3f1d80] font-extrabold text-[12px] px-3 py-1 rounded-full shadow">
                  ATAKUM İÇİ
                </div>
                <div className="mt-1 text-white font-black text-[28px] leading-[0.95] tracking-tight">
                  1 SAATTE
                </div>
                <div className="text-white font-black text-[28px] leading-[0.95] tracking-tight">
                  TESLİM!
                </div>
              </div>

              {/* RIGHT — animal stack */}
              <div className="relative w-[150px] h-[220px] shrink-0 -mr-1">
                {/* Yellow circle badge */}
                <div className="absolute -top-1 right-0 z-20 w-[78px] h-[78px] rounded-full bg-yellow-400 text-[#3f1d80] flex flex-col items-center justify-center text-center shadow-lg ring-2 ring-white">
                  <div className="text-[9px] font-black leading-tight">BİNLERCE</div>
                  <div className="text-[10px] font-black leading-tight">ÇEŞİT</div>
                  <div className="text-[7px] font-bold leading-tight mt-0.5">Kedi · Köpek</div>
                  <div className="text-[7px] font-bold leading-tight">Kuş · Balık</div>
                  <div className="text-[7px] font-bold leading-tight">Malzemeleri</div>
                </div>
                {/* Dog */}
                <img src="/images/cat-dog.webp" alt="Köpek"
                     className="absolute right-2 top-12 w-[95px] h-[95px] object-cover rounded-full ring-4 ring-white/30 shadow-lg" />
                {/* Cat */}
                <img src="/images/cat-cat.webp" alt="Kedi"
                     className="absolute left-0 top-[105px] w-[68px] h-[68px] object-cover rounded-full ring-4 ring-white/30 shadow-lg" />
                {/* Bird */}
                <img src="/images/cat-bird.webp" alt="Kuş"
                     className="absolute right-[-4px] top-[105px] w-[55px] h-[55px] object-cover rounded-full ring-4 ring-white/30 shadow-lg" />
                {/* Courier */}
                <div className="absolute right-1 bottom-0 w-[80px] h-[80px] rounded-2xl bg-purple-700 flex items-center justify-center ring-4 ring-white/20 shadow-xl">
                  <Truck className="w-10 h-10 text-yellow-300" strokeWidth={2.2} />
                </div>
              </div>
            </div>

            {/* Bottom mini icons */}
            <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
              <MiniHeroIcon icon={<PackageCheck className="w-4 h-4 text-white" />} title="ÜRÜNÜ KONTROL ET" sub="Sonra Öde" />
              <MiniHeroIcon icon={<Banknote className="w-4 h-4 text-white" />} title="KAPIDA NAKİT" sub="Ödeme" />
              <MiniHeroIcon icon={<QrCode className="w-4 h-4 text-white" />} title="QR ÖDEME" sub="Kolay ve Hızlı" />
            </div>
          </div>
        </div>

        {/* PAYMENT OPTIONS */}
        <div className="px-3 mt-4">
          <div className="text-center text-[13px] font-extrabold text-gray-700 tracking-wider mb-2">
            ───  ÖDEME SEÇENEKLERİ  ───
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PayCard
              icon={<CreditCard className="w-5 h-5 text-purple-700" />}
              title="KREDİ KARTINA"
              big="3 ve 6 TAKSİT"
              sub="VADE FARKSIZ!"
              tone="purple"
            />
            <PayCard
              icon={<Banknote className="w-5 h-5 text-emerald-700" />}
              title="KAPIDA"
              big="NAKİT ÖDEME"
              sub=""
              tone="emerald"
            />
            <PayCard
              icon={<QrCode className="w-5 h-5 text-sky-700" />}
              title="QR ÖDEME"
              big="Anında ve Güvenli"
              sub=""
              tone="sky"
              compact
            />
          </div>
        </div>

        {/* TRUST ROW */}
        <div className="px-3 mt-4 grid grid-cols-4 gap-2">
          <TrustCard
            icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
            title="GÜVENLİ ALIŞVERİŞ"
            sub="Orijinal ve kaliteli ürünler"
          />
          <TrustCard
            icon={<PackageCheck className="w-5 h-5 text-orange-600" />}
            title="ÜRÜNÜ KONTROL ET"
            sub="Son kullanma tarihine bak"
          />
          <TrustCard
            icon={<Truck className="w-5 h-5 text-rose-600" />}
            title="1 SAATTE TESLİM"
            sub="Atakum içi hızlı teslimat"
          />
          <TrustCard
            icon={<Tag className="w-5 h-5 text-emerald-600" />}
            title="KAMPANYA VE İNDİRİMLER"
            sub="Avantajları kaçırma!"
          />
        </div>
      </div>
    </div>
  );
}

function CatCircle({ img, label, ring }: { img: string; label: string; ring: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-[52px] h-[52px] rounded-full overflow-hidden ring-4 ${ring} shadow-md`}>
        <img src={img} alt={label} className="w-full h-full object-cover" />
      </div>
      <div className="mt-1 text-[10px] font-semibold text-gray-700">{label}</div>
    </div>
  );
}

function MiniHeroIcon({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-2 flex flex-col items-center text-center border border-white/15">
      <div className="w-7 h-7 rounded-full bg-purple-900/60 flex items-center justify-center mb-1">{icon}</div>
      <div className="text-[8px] font-extrabold text-white leading-tight">{title}</div>
      <div className="text-[7.5px] text-white/80 leading-tight">{sub}</div>
    </div>
  );
}

function PayCard({ icon, title, big, sub, tone, compact }: { icon: React.ReactNode; title: string; big: string; sub: string; tone: "purple" | "emerald" | "sky"; compact?: boolean }) {
  const bg = {
    purple: "bg-purple-50 border-purple-100",
    emerald: "bg-emerald-50 border-emerald-100",
    sky: "bg-sky-50 border-sky-100",
  }[tone];
  return (
    <div className={`${bg} border rounded-2xl p-2.5 flex flex-col items-center text-center shadow-sm min-h-[90px] justify-center`}>
      <div className="mb-1">{icon}</div>
      <div className="text-[8.5px] font-bold text-gray-700 leading-tight">{title}</div>
      <div className={`${compact ? "text-[9px]" : "text-[10.5px]"} font-black text-gray-900 leading-tight mt-0.5`}>{big}</div>
      {sub && <div className="text-[8px] font-bold text-orange-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function TrustCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-2 flex flex-col items-center text-center shadow-sm min-h-[92px]">
      <div className="mb-1">{icon}</div>
      <div className="text-[8.5px] font-extrabold text-gray-800 leading-tight">{title}</div>
      <div className="text-[7.5px] text-gray-500 leading-tight mt-0.5">{sub}</div>
    </div>
  );
}
