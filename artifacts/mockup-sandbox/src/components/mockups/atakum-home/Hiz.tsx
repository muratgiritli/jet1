import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, Zap, Clock, ShieldCheck, CreditCard, Gift, Heart, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const products = [
  { id: 1, name: "Royal Canin Yetişkin Kedi Maması 2kg", price: "549", oldPrice: "620", image: "/__mockup/images/cat-cat.webp", category: "Kedi" },
  { id: 2, name: "Pro Plan Köpek Maması 15kg", price: "1.249", oldPrice: "1.450", image: "/__mockup/images/cat-dog.webp", category: "Köpek" },
  { id: 3, name: "N&D Tahılsız Kedi Maması", price: "689", oldPrice: "750", image: "/__mockup/images/cat-cat.webp", category: "Kedi" },
  { id: 4, name: "Ever Clean Kedi Kumu 10L", price: "450", oldPrice: "500", image: "/__mockup/images/cat-cat.webp", category: "Kedi" },
];

export function Hiz() {
  const [activeUsers, setActiveUsers] = useState(14);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(8, Math.min(35, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .bg-brand { background-color: #5B21B6; }
        .text-brand { color: #5B21B6; }
        .border-brand { border-color: #5B21B6; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-pulse-fast { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
      
      {/* Top Banner */}
      <div className="bg-violet-900 text-white text-xs md:text-sm font-medium py-2 px-4 flex justify-between items-center font-outfit">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Şu an Atakum'da {activeUsers} kişi sipariş veriyor
        </div>
        <div className="hidden md:flex items-center gap-4 text-violet-200">
          <span>Haftanın Fırsatları</span>
          <span>Sipariş Takibi</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-outfit">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-600">
              <Menu size={24} />
            </button>
            <div className="text-xl md:text-2xl font-black text-brand tracking-tight flex items-center gap-1">
              <Zap className="text-brand fill-brand" size={24} />
              ATAKUM PET
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Mama, kum, oyuncak ara..." 
                className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand outline-none"
              />
              <Search className="absolute left-4 top-2.5 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 font-medium">Teslimat Adresi</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                Atakum, Samsun <ChevronRight size={14} />
              </span>
            </div>
            <button className="relative bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 transition-colors">
              <ShoppingBag size={20} className="text-slate-700" />
              <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                2
              </span>
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="p-3 md:hidden border-t border-slate-100 bg-white">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Mama, kum, oyuncak ara..." 
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
      </header>

      <main className="font-outfit max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-10 md:space-y-16">
        
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-violet-950 flex flex-col md:flex-row items-center min-h-[360px] md:min-h-[480px]">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-violet-900 to-transparent z-10 md:w-2/3"></div>
          <img 
            src="/__mockup/images/hiz-hero.png" 
            alt="Hızlı Teslimat" 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60 md:opacity-100 md:object-right"
          />
          <div className="relative z-20 p-6 md:p-12 md:w-1/2 flex flex-col items-start gap-4">
            <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 text-sm border-none uppercase tracking-wider">
              Atakum'da Tek
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              KAPIDA <span className="text-yellow-400">1 SAATTE</span> <br/>
              TESLİMAT
            </h1>
            <p className="text-violet-100 text-base md:text-lg font-medium max-w-md">
              Mamanız bitti mi? Panik yok. Atakum'un her mahallesine motorlu kuryelerimizle jet hızında ulaşıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-violet-950 font-black text-lg rounded-full px-8 h-14">
                Hemen Sipariş Ver
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-full h-14">
                Uygulamayı İndir
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-white/80 text-sm font-medium">
              <div className="flex items-center gap-1.5"><Clock size={16} className="text-yellow-400" /> Dakikalar içinde yola çıkar</div>
              <div className="hidden sm:flex items-center gap-1.5"><CreditCard size={16} className="text-yellow-400" /> Kapıda Ödeme</div>
            </div>
          </div>
        </section>

        {/* Categories - App Style */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Hızlı Kategoriler</h2>
            <a href="#" className="text-brand font-bold text-sm flex items-center">Tümü <ChevronRight size={16} /></a>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-3 md:gap-6 pb-2">
            {[
              { name: "Köpek", img: "/__mockup/images/category-dog.webp", color: "bg-blue-100" },
              { name: "Kedi", img: "/__mockup/images/category-cat.webp", color: "bg-orange-100" },
              { name: "Kuş", img: "/__mockup/images/category-bird.webp", color: "bg-emerald-100" },
              { name: "Kemirgen", img: "/__mockup/images/category-rabbit.webp", color: "bg-pink-100" },
              { name: "Akvaryum", img: "/__mockup/images/category-bird.webp", color: "bg-cyan-100" }, // Reusing bird as placeholder
              { name: "Vet. Mama", img: "/__mockup/images/category-cat.webp", color: "bg-slate-200" },
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px] cursor-pointer group">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${cat.color} flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-200 shadow-sm border border-slate-100`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-bold text-slate-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Product Rails */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Zap className="text-yellow-500 fill-yellow-500" /> Çok Satanlar
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col group hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-square mb-3 bg-slate-50 rounded-xl p-4 flex items-center justify-center">
                  <Badge className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 border-none z-10">
                    HIZLI
                  </Badge>
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <span className="text-xs font-bold text-slate-400 mb-1">{p.category}</span>
                <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 flex-1">{p.name}</h3>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-lg font-black text-brand">₺{p.price}</span>
                  <span className="text-xs font-bold text-slate-400 line-through mb-1">₺{p.oldPrice}</span>
                </div>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10">
                  Sepete Ekle
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Strip */}
        <section className="bg-brand text-white rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="flex items-center gap-4 pt-4 md:pt-0 first:pt-0">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">Güvenli & Hızlı</h4>
                <p className="text-violet-200 text-sm font-medium">Samsun Atakum içine kendi kuryelerimizle özel teslimat.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CreditCard size={24} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">Kapıda Ödeme</h4>
                <p className="text-violet-200 text-sm font-medium">İster nakit, ister kredi kartı. Gönül rahatlığıyla ödeyin.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Gift size={24} className="text-yellow-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">%5 Para Puan</h4>
                <p className="text-violet-200 text-sm font-medium">Her alışverişinizde kazanır, bir sonrakinde harcarsınız.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Askida Mama */}
        <section className="bg-slate-100 rounded-3xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-5/12">
            <img src="/__mockup/images/hiz-askida.png" alt="Sokak Hayvanları" className="w-full h-full object-cover min-h-[250px]" />
          </div>
          <div className="p-6 md:p-10 md:w-7/12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-bold w-max mb-4">
              <Heart size={16} className="fill-rose-600" /> Topluluk
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">
              Askıda Mama
            </h2>
            <p className="text-slate-600 font-medium mb-6 leading-relaxed">
              Sokaktaki dostlarımızı unutmuyoruz. Siparişinize ekleyeceğiniz ufak bir bağış maması, Atakum'daki sokak hayvanlarına doğrudan ulaştırılır.
            </p>
            <div className="flex items-center gap-3">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl h-12 px-6">
                15₺ Bağış Ekle
              </Button>
              <Button variant="outline" className="border-slate-300 text-slate-700 font-bold rounded-xl h-12">
                Daha Fazla Bilgi
              </Button>
            </div>
          </div>
        </section>

        {/* Vet Tip */}
        <section className="bg-amber-50 rounded-3xl p-6 md:p-8 border border-amber-100 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <CheckCircle2 size={200} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-black text-amber-900 mb-2 flex items-center gap-2">
              Haftanın Vet. İpucu
            </h3>
            <p className="text-amber-800 font-medium leading-relaxed">
              <strong>Havalar ısınıyor!</strong> Köpeklerinizin patilerinin asfaltta yanmaması için sabah erken veya akşam geç saatlerde yürüyüşe çıkarmaya özen gösterin. Daima yanınızda taze su bulundurun.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 md:py-16 font-outfit border-t-4 border-brand">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1 mb-4">
                <Zap className="text-brand fill-brand" size={24} />
                ATAKUM PET
              </div>
              <p className="font-medium max-w-sm mb-6">
                Samsun Atakum'un mahalle pet shop'u. Evcil dostlarınızın tüm ihtiyaçları 1 saat içinde kapınızda.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">Ig</div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">Fb</div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">Tw</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Hızlı Linkler</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-brand transition-colors">Kategoriler</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Askıda Mama</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Para Puan Sistemi</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">İletişim</h4>
              <ul className="space-y-3 font-medium">
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> Türkiş, Atakum, Samsun</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> 0555 555 55 55</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> info@atakumpet.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-medium text-sm">
            <p>© 2024 Atakum Pet Shop. Tüm hakları saklıdır.</p>
            <div className="flex gap-4">
              <span>Gizlilik</span>
              <span>Şartlar</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around p-3 pb-safe z-50 font-outfit font-bold text-[10px] text-slate-500">
        <div className="flex flex-col items-center gap-1 text-brand">
          <Zap size={20} className="fill-brand" />
          <span>Ana Sayfa</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Search size={20} />
          <span>Keşfet</span>
        </div>
        <div className="flex flex-col items-center gap-1 relative">
          <div className="absolute -top-3 right-0 bg-brand text-white w-4 h-4 rounded-full flex items-center justify-center">2</div>
          <ShoppingBag size={20} />
          <span>Sepet</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Menu size={20} />
          <span>Menü</span>
        </div>
      </div>
    </div>
  );
}
