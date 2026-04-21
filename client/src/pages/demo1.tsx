import { Truck, ShieldCheck, PackageCheck, Heart, ChevronRight, CreditCard, Banknote, QrCode, MapPin, Clock } from "lucide-react";

export default function Demo1() {
  return (
    <div className="min-h-screen bg-[#f4f3fb] flex justify-center font-['Inter']">
      <div className="w-full max-w-[412px] bg-white">
        {/* TOP PROMO BANNER */}
        <div className="relative bg-gradient-to-br from-[#5a2da7] to-[#3f1d80] text-white px-3 py-2.5 flex items-center gap-2 rounded-b-2xl">
          <div className="shrink-0 w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center">
            <Truck className="w-4 h-4 text-[#3f1d80]" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[12.5px] font-extrabold">
              Sen iste <span className="text-yellow-300">jet</span> ile kapına gelsin!
            </div>
            <div className="text-[9.5px] text-white/90 flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5" /> Samsun · Atakum bölgesine özel hızlı teslimat
            </div>
            <div className="text-[8.5px] text-white/70 mt-0.5">
              Haftanın 7 günü saat 11.00-19.00 arası adrese teslimat yapılır
            </div>
          </div>
          <div className="shrink-0 w-14 h-14 rounded-full bg-white text-[#3f1d80] flex flex-col items-center justify-center text-center leading-none border-2 border-yellow-400">
            <Clock className="w-3 h-3 mb-0.5" strokeWidth={3} />
            <div className="text-[8px] font-extrabold">1 SAATTE</div>
            <div className="text-[8px] font-extrabold text-orange-500">KAPIDA</div>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="px-3 mt-3">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#6c2bd9] via-[#5a2da7] to-[#3f1d80] p-4 pb-3 shadow-lg shadow-purple-900/20">
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-400/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-pink-400/10 blur-2xl" />

            <div className="relative flex gap-2">
              {/* LEFT — text */}
              <div className="flex-1 min-w-0 z-10">
                <h1 className="text-white font-black leading-[1.05] tracking-tight">
                  <div className="text-[22px]">
                    <span className="text-yellow-300">KEDİ</span> <span className="text-white/80">·</span> <span className="text-yellow-300">KÖPEK</span>
                  </div>
                  <div className="text-[22px]">
                    <span className="text-yellow-300">KUŞ</span> <span className="text-white/80">·</span> <span className="text-yellow-300">BALIK</span>
                  </div>
                  <div className="text-[18px] mt-0.5 text-white">MALZEMELERİ</div>
                </h1>
                <div className="inline-block mt-2 bg-yellow-400 text-[#3f1d80] font-extrabold text-[12px] px-3 py-1 rounded-full shadow-md">
                  BİNLERCE ÇEŞİT
                </div>
              </div>

              {/* RIGHT — animal photo composite */}
              <div className="relative w-[160px] h-[160px] -mr-2 -mt-1 shrink-0">
                <img
                  src="/images/cat-dog.webp"
                  alt="Köpek"
                  className="absolute right-0 top-2 w-[110px] h-[110px] object-cover rounded-full ring-4 ring-white/30 shadow-xl"
                />
                <img
                  src="/images/cat-cat.webp"
                  alt="Kedi"
                  className="absolute left-0 bottom-0 w-[80px] h-[80px] object-cover rounded-full ring-4 ring-white/30 shadow-lg"
                />
                <img
                  src="/images/cat-bird.webp"
                  alt="Kuş"
                  className="absolute right-0 bottom-0 w-[60px] h-[60px] object-cover rounded-full ring-4 ring-white/30 shadow-lg"
                />
              </div>
            </div>

            {/* Floating yellow Atakum badge */}
            <div className="absolute right-3 top-3 bg-yellow-400 text-[#3f1d80] rounded-full px-2.5 py-1.5 text-[9px] font-extrabold leading-tight text-center shadow-lg max-w-[90px]">
              ATAKUM<br />VE ÇEVRESİNE<br /><span className="text-orange-600">ÖZEL HIZLI</span><br /><span className="text-orange-600">TESLİMAT</span>
            </div>

            {/* Bottom 1-saatte chip */}
            <div className="relative mt-3 inline-flex items-center gap-2 bg-white text-[#3f1d80] rounded-2xl pl-2 pr-3 py-1.5 shadow-lg">
              <div className="w-7 h-7 rounded-xl bg-[#3f1d80] flex items-center justify-center">
                <Truck className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
              </div>
              <div className="font-black text-[14px] tracking-tight">1 SAATTE KAPIDA!</div>
            </div>
          </div>
        </div>

        {/* PAYMENT PILLS */}
        <div className="px-3 mt-3 grid grid-cols-3 gap-2">
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-2 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mb-1">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div className="text-[9px] font-bold text-purple-900 leading-tight">KREDİ KARTINA</div>
            <div className="text-[10px] font-black text-purple-700 leading-tight">3 ve 6 TAKSİT</div>
            <div className="text-[8px] font-bold text-orange-600 mt-0.5">VADE FARKSIZ!</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mb-1">
              <Banknote className="w-4 h-4 text-white" />
            </div>
            <div className="text-[9px] font-bold text-emerald-900 leading-tight">KAPIDA</div>
            <div className="text-[10px] font-black text-emerald-700 leading-tight">NAKİT</div>
            <div className="text-[9px] font-bold text-emerald-700 leading-tight">ÖDEME</div>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-2 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center mb-1">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div className="text-[9px] font-bold text-sky-900 leading-tight mt-1">QR</div>
            <div className="text-[10px] font-black text-sky-700 leading-tight">ÖDEME</div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="px-3 mt-4 flex items-center justify-between">
          <h2 className="text-[15px] font-black text-gray-900">Kategoriler</h2>
          <a href="#" className="text-[12px] font-semibold text-purple-700 flex items-center gap-0.5">
            Tümü <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="px-3 mt-2 grid grid-cols-4 gap-2">
          <CategoryCard label="Köpek" img="/images/category-dog.webp" ring="ring-orange-300" badge="bg-orange-500" />
          <CategoryCard label="Kedi" img="/images/category-cat.webp" ring="ring-purple-300" badge="bg-purple-500" />
          <CategoryCard label="Kuş" img="/images/category-bird.webp" ring="ring-yellow-300" badge="bg-yellow-500" />
          <CategoryCard label="Kemirgen" img="/images/category-rabbit.webp" ring="ring-emerald-300" badge="bg-emerald-500" />
        </div>

        {/* TRUST ROW */}
        <div className="px-3 mt-4 mb-4 grid grid-cols-4 gap-2">
          <TrustCard
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            title="GÜVENLİ ALIŞVERİŞ"
            sub="Orijinal ve kaliteli ürünler"
            tone="emerald"
          />
          <TrustCard
            icon={<PackageCheck className="w-5 h-5 text-orange-600" />}
            title="ÜRÜNÜ KONTROL ET"
            sub="Son kullanma tarihine bak"
            tone="orange"
          />
          <TrustCard
            icon={<Truck className="w-5 h-5 text-purple-600" />}
            title="1 SAATTE KAPIDA"
            sub="Atakum içi hızlı teslimat"
            tone="purple"
          />
          <TrustCard
            icon={<Heart className="w-5 h-5 text-rose-600" fill="currentColor" />}
            title="MÜŞTERİ MEMNUNİYETİ"
            sub="%100 memnuniyet garantisi"
            tone="rose"
          />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ label, img, ring, badge }: { label: string; img: string; ring: string; badge: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-[78px] h-[78px] rounded-full overflow-hidden ring-4 ${ring} shadow-md`}>
        <img src={img} alt={label} className="w-full h-full object-cover" />
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${badge} ring-2 ring-white flex items-center justify-center`}>
          <span className="text-white text-[11px]">🐾</span>
        </div>
      </div>
      <div className="mt-1.5 text-[12px] font-bold text-gray-800">{label}</div>
    </div>
  );
}

function TrustCard({ icon, title, sub, tone }: { icon: React.ReactNode; title: string; sub: string; tone: "emerald" | "orange" | "purple" | "rose" }) {
  const bg = {
    emerald: "bg-emerald-50 border-emerald-100",
    orange: "bg-orange-50 border-orange-100",
    purple: "bg-purple-50 border-purple-100",
    rose: "bg-rose-50 border-rose-100",
  }[tone];
  return (
    <div className={`${bg} border rounded-2xl p-2 flex flex-col items-center text-center shadow-sm min-h-[88px]`}>
      <div className="mb-1">{icon}</div>
      <div className="text-[8.5px] font-extrabold text-gray-800 leading-tight">{title}</div>
      <div className="text-[7.5px] text-gray-500 leading-tight mt-0.5">{sub}</div>
    </div>
  );
}
