import { 
  Truck, 
  CreditCard, 
  Package, 
  Gift, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  ChevronRight, 
  Smartphone, 
  Banknote
} from "lucide-react";

export default function DemoLanding() {
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto text-slate-800 shadow-xl overflow-x-hidden relative pb-10">
      
      <header className="flex items-center justify-between p-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30">
            J
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-900 leading-none">JETGO</h1>
            <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase">Hızlı Petshop</span>
          </div>
        </div>
        <button className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors">
          <Truck className="w-5 h-5" />
        </button>
      </header>

      <section className="relative px-4 pt-6 pb-12 bg-gradient-to-br from-orange-50 via-amber-100/50 to-white overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-gradient-to-tr from-yellow-300/20 to-amber-500/20 rounded-full blur-2xl" />
        
        <div className="absolute right-[-10%] top-1/4 opacity-[0.03] transform rotate-12 pointer-events-none">
          <span className="text-[180px]">🐾</span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-4 shadow-sm border border-orange-200/50">
            <MapPin className="w-3.5 h-3.5" />
            Sadece Atakum'da
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] mb-6">
            Samsun Atakum'da <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              60 Dakikada
            </span> <br />
            Kapında Petshop
          </h2>

          <div className="flex flex-wrap justify-center gap-2 mb-8 w-full max-w-[320px]">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-semibold text-slate-700 w-full justify-center">
              <Truck className="w-4 h-4 text-orange-500" />
              1 Saat Teslimat
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-semibold text-slate-700 w-[calc(50%-4px)] justify-center">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Kapıda Ödeme
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100 text-xs font-semibold text-slate-700 w-[calc(50%-4px)] justify-center">
              <MapPin className="w-4 h-4 text-blue-500" />
              Atakum İçi Aktif
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" data-testid="btn-demo-order">
            Hemen Sipariş Ver
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <div className="px-4 -mt-5 relative z-20 mb-8">
        <div className="bg-emerald-500 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            <div className="absolute w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="font-semibold text-sm">Bugün 120+ sipariş teslim edildi</span>
        </div>
      </div>

      <section className="pl-4 mb-10 overflow-x-auto pb-4 pt-1 flex gap-3 snap-x">
        <div className="min-w-[140px] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 snap-start shrink-0">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm">1 Saat Teslimat</h3>
          <p className="text-[10px] text-slate-500">Beklemek yok</p>
        </div>
        
        <div className="min-w-[140px] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 snap-start shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm">900+ Ürün</h3>
          <p className="text-[10px] text-slate-500">Geniş yelpaze</p>
        </div>
        
        <div className="min-w-[140px] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 snap-start shrink-0">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-1">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm">Kapıda Ödeme</h3>
          <p className="text-[10px] text-slate-500">Güvenli alışveriş</p>
        </div>
        
        <div className="min-w-[140px] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 snap-start shrink-0 pr-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-1">
            <Gift className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm">Para Puan Kazan</h3>
          <p className="text-[10px] text-slate-500">Her siparişte</p>
        </div>
      </section>

      <section className="px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Kategoriler</h2>
          <button className="text-sm font-bold text-orange-500 flex items-center">
            Tümü <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="group bg-white rounded-2xl p-[2px] bg-gradient-to-br from-orange-200 to-orange-400 hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-white rounded-[14px] p-4 h-full flex flex-col items-center justify-center gap-3">
              <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🐶</div>
              <span className="font-bold text-slate-800">Köpek</span>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-[2px] bg-gradient-to-br from-amber-200 to-yellow-400 hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-white rounded-[14px] p-4 h-full flex flex-col items-center justify-center gap-3">
              <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🐱</div>
              <span className="font-bold text-slate-800">Kedi</span>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-[2px] bg-gradient-to-br from-sky-200 to-blue-400 hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-white rounded-[14px] p-4 h-full flex flex-col items-center justify-center gap-3">
              <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🦜</div>
              <span className="font-bold text-slate-800">Kuş</span>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-[2px] bg-gradient-to-br from-emerald-200 to-green-400 hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-white rounded-[14px] p-4 h-full flex flex-col items-center justify-center gap-3">
              <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🐹</div>
              <span className="font-bold text-slate-800">Kemirgen</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mb-10">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/30 flex justify-between items-center cursor-pointer transform hover:scale-[1.01] transition-transform">
          <div>
            <div className="inline-block bg-white/20 px-2 py-1 rounded text-xs font-bold mb-2 backdrop-blur-sm">
              FIRSAT
            </div>
            <h3 className="text-xl font-black mb-1">Kampanyalı Ürünler</h3>
            <p className="text-purple-100 text-sm font-medium">Ana mama + ek ürün fırsatları</p>
          </div>
          <div className="w-12 h-12 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-inner shrink-0">
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
      </section>

      <section className="px-4 mb-10">
        <h2 className="text-xl font-black text-slate-900 mb-4">Ödeme Seçenekleri</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-700 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm leading-tight text-slate-800">Kapıda<br/>QR</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-700 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm leading-tight text-slate-800">Kapıda<br/>POS</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-700 shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm leading-tight text-slate-800">Kapıda<br/>Nakit</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-700 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm leading-tight text-slate-800">Kredi Kartına<br/>Taksit</span>
          </div>
        </div>
      </section>

      <section className="px-4 mb-12">
        <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
          <h3 className="font-bold text-center text-slate-300 mb-6 uppercase tracking-wider text-xs">Neden Biz?</h3>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-orange-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Hızlı Teslimat (1 Saat)</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Siparişiniz yola çıktığında anında kapınızda. Beklemek yok.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Güvenli Alışveriş (SSL)</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Tüm verileriniz 256-bit SSL sertifikası ile korunmaktadır.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-yellow-400 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Müşteri Memnuniyeti (4.9)</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Binlerce mutlu evcil hayvan ve sahibi bizi tercih ediyor.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 pt-8 pb-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-full mx-auto">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">256-BIT SSL GÜVENLİ BAĞLANTI</span>
        </div>
        
        <p className="text-sm font-semibold text-slate-800 mb-1">Sizpa İnternet Tic. Ltd. Şti.</p>
        <p className="text-xs text-slate-500 mb-6">Mimar Sinan Mah. Atakum / Samsun</p>
        
        <p className="text-[10px] text-slate-400">© 2025 Sizpa İnternet Tic. Ltd. Şti. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
