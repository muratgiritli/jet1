import React from "react";
import { ShoppingBag, Clock, Heart, ShieldCheck, MapPin, Phone, Instagram, Facebook, Star, ArrowRight, ChevronRight, Stethoscope, Gift } from "lucide-react";

export function Sicak() {
  return (
    <div className="min-h-screen bg-[#faf8fc] text-[#2d1b36] font-sans selection:bg-[#8b5cf6] selection:text-white">
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        :root {
          --brand-light: #f3e8ff;
          --brand: #8b5cf6;
          --brand-dark: #5b21b6;
          --brand-accent: #c084fc;
        }
        
        body {
          font-family: 'Quicksand', sans-serif;
        }

        .blob-bg {
          position: absolute;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.4;
          border-radius: 50%;
          animation: float 10s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08);
        }
        
        .soft-shadow {
          box-shadow: 0 10px 40px -10px rgba(139, 92, 246, 0.15);
        }
      `}} />

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-purple-50 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Clock size={14} /> Atakum içi siparişler 1 saatte kapınızda! Kapıda ödeme imkanı.
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card px-4 py-4 md:px-8 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30 transform rotate-3">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-purple-950 leading-none">Atakum Pet</h1>
            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Mahallenizin Pet Shop'u</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-semibold text-purple-900/70">
          <a href="#" className="text-purple-700 transition-colors">Ana Sayfa</a>
          <a href="#" className="hover:text-purple-700 transition-colors">Kategoriler</a>
          <a href="#" className="hover:text-purple-700 transition-colors">Askıda Mama</a>
          <a href="#" className="hover:text-purple-700 transition-colors">İletişim</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-purple-700 font-semibold hover:bg-purple-100 px-4 py-2 rounded-full transition-colors">
            Giriş Yap
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="hidden md:inline font-semibold">Sepetim</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 md:px-8 overflow-hidden">
        <div className="blob-bg w-[500px] h-[500px] bg-purple-300 top-0 right-[-100px]"></div>
        <div className="blob-bg w-[400px] h-[400px] bg-pink-200 bottom-[-100px] left-[-100px]" style={{animationDelay: '-2s'}}></div>
        
        <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold text-sm">
              <MapPin size={16} /> Atakum, Samsun
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-purple-950 leading-[1.1]">
              Sevginiz bizden, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                teslimat 1 saatte.
              </span>
            </h2>
            <p className="text-lg text-purple-900/80 font-medium max-w-md">
              Siz evdeki dostunuzla vakit geçirin. İhtiyacınız olan her şey, Atakum sınırları içinde 60 dakikada kapınızda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-purple-600 text-white px-8 py-4 rounded-[2rem] font-bold text-lg shadow-xl shadow-purple-600/30 hover:bg-purple-700 hover:shadow-purple-600/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Hemen Alışverişe Başla <ArrowRight size={20} />
              </button>
              <button className="bg-white text-purple-700 px-8 py-4 rounded-[2rem] font-bold text-lg shadow-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                <Gift size={20} /> Para Puan Kazan
              </button>
            </div>
            
            <div className="flex items-center gap-6 pt-6 text-sm font-semibold text-purple-900/60">
              <div className="flex items-center gap-2"><Clock size={18} className="text-purple-500"/> 1 Saatte Teslim</div>
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-purple-500"/> Kapıda Ödeme</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-pink-300 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-lg"></div>
            <img 
              src="/__mockup/images/sicak-hero.png" 
              alt="Mutlu evcil hayvanlar" 
              className="relative z-10 w-full h-auto object-cover rounded-[3rem] shadow-2xl"
              onError={(e) => { e.currentTarget.src = "/__mockup/images/hero-banner.webp" }}
            />
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-3xl z-20 flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Müşteri Memnuniyeti</p>
                <p className="text-lg font-bold text-gray-900">5.0 / 5.0</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center text-purple-950 mb-12">Sevimli Dostlarımız İçin</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Köpek", img: "category-dog.webp", color: "bg-orange-100" },
            { name: "Kedi", img: "category-cat.webp", color: "bg-blue-100" },
            { name: "Kuş", img: "category-bird.webp", color: "bg-yellow-100" },
            { name: "Kemirgen", img: "category-rabbit.webp", color: "bg-pink-100" },
            { name: "Akvaryum", img: "cat-cat.webp", color: "bg-cyan-100" } // Fallback image
          ].map((cat, i) => (
            <a href="#" key={i} className="group block">
              <div className={`${cat.color} rounded-[2rem] p-6 text-center transition-all duration-300 group-hover:-translate-y-2 soft-shadow h-full flex flex-col justify-center items-center gap-4`}>
                <div className="w-20 h-20 mx-auto bg-white rounded-full p-2 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                  <img src={`/__mockup/images/${cat.img}`} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-bold text-purple-900">{cat.name}</h4>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 px-4 md:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-3xl font-bold text-purple-950 mb-2">Çok Satanlar</h3>
              <p className="text-purple-600 font-medium">Mahallemizin favori ürünleri</p>
            </div>
            <a href="#" className="hidden md:flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 transition-colors">
              Tümünü Gör <ChevronRight size={20} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Royal Canin Yetişkin Kedi Maması 2kg", price: "549,00", oldPrice: "599,00", brand: "Royal Canin", tag: "Çok Satan" },
              { name: "Pro Plan Medium Adult Köpek Maması 15kg", price: "1.249,00", oldPrice: "1.450,00", brand: "Pro Plan", tag: "İndirim" },
              { name: "N&D Düşük Tahıllı Kuzu Etli Kedi Maması 1.5kg", price: "689,00", oldPrice: "", brand: "N&D", tag: "Yeni" },
              { name: "Ever Clean Extra Strong Kedi Kumu 10lt", price: "485,00", oldPrice: "520,00", brand: "Ever Clean", tag: "" },
            ].map((product, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-4 soft-shadow group hover:shadow-xl hover:shadow-purple-200 transition-all border border-purple-50 flex flex-col">
                <div className="relative bg-purple-50 rounded-[1.5rem] aspect-square mb-4 flex items-center justify-center p-4">
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                      {product.tag}
                    </span>
                  )}
                  <div className="w-full h-full bg-white/60 rounded-xl flex items-center justify-center text-purple-300 font-bold text-sm">
                    Görsel
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <p className="text-xs font-bold text-purple-400 mb-1">{product.brand}</p>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-4 group-hover:text-purple-700 transition-colors flex-1">{product.name}</h4>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      {product.oldPrice && <p className="text-xs text-gray-400 line-through">₺{product.oldPrice}</p>}
                      <p className="text-lg font-extrabold text-purple-700">₺{product.price}</p>
                    </div>
                    <button className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors">
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Askıda Mama */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto glass-card rounded-[3rem] overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart size={32} fill="currentColor" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-purple-950 mb-4">
                Sokaktaki Dostlarımızı Unutmadık
              </h3>
              <p className="text-lg text-purple-900/70 font-medium mb-8">
                "Askıda Mama" projemizle, siz alışveriş yaparken sokak hayvanlarına da destek olabilirsiniz. Bıraktığınız her mama, Atakum'daki patili dostlarımıza ulaşıyor.
              </p>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg w-fit transition-all shadow-lg shadow-pink-500/30">
                Askıya Mama Bırak
              </button>
            </div>
            <div className="h-64 md:h-auto relative">
              <img 
                src="/__mockup/images/sicak-askida.png" 
                alt="Askıda Mama" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vet Tips */}
      <section className="py-16 px-4 md:px-8 bg-purple-900 text-purple-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative rounded-[2rem] overflow-hidden h-80">
            <img 
              src="/__mockup/images/sicak-vet.png" 
              alt="Veteriner İpucu" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-7 md:pl-8">
            <div className="flex items-center gap-3 text-purple-300 font-bold mb-4">
              <Stethoscope size={24} />
              <span>Veteriner Köşesi</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">Yaz Aylarında Pati Bakımı</h3>
            <p className="text-purple-200 text-lg mb-6 leading-relaxed">
              Havalar ısınırken dostlarımızın patileri asfalt yanıklarına karşı hassaslaşır. Yürüyüşleri sabah erken veya akşam serinliğinde yapmaya özen gösterin. Su kaplarını sık sık tazelemeyi unutmayın!
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-white font-bold hover:gap-3 transition-all border-b border-purple-400 pb-1">
              Tüm İpuçlarını Oku <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: "1 Saatte Kapında", desc: "Atakum içine ışık hızında teslimat." },
            { icon: Gift, title: "Para Puan Kazan", desc: "Her alışverişinde %5 puan biriktir." },
            { icon: ShieldCheck, title: "Kapıda Ödeme", desc: "Nakit veya kredi kartı ile güvenle öde." }
          ].map((feat, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 text-center soft-shadow hover:-translate-y-1 transition-transform border border-purple-50">
              <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                <feat.icon size={28} />
              </div>
              <h4 className="text-xl font-bold text-purple-950 mb-2">{feat.title}</h4>
              <p className="text-purple-800/60 font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-950 text-purple-200 pt-20 pb-10 px-4 md:px-8 rounded-t-[3rem] mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-purple-500 text-white rounded-2xl flex items-center justify-center transform -rotate-3">
                <Heart size={20} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Atakum Pet Shop</h2>
            </div>
            <p className="text-purple-300 font-medium max-w-sm mb-6 leading-relaxed">
              Mahallenizin güvenilir pet shop'u. Evcil dostlarınızın tüm ihtiyaçları için Atakum'da hizmetinizdeyiz. 1 saatte kapınıza getiriyoruz.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center hover:bg-purple-600 transition-colors text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center hover:bg-purple-600 transition-colors text-white">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Hızlı Menü</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Askıda Mama</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Para Puan Sistemi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Teslimat Şartları</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">İletişim</h4>
            <ul className="space-y-4 font-medium">
              <li className="flex gap-3">
                <MapPin size={20} className="text-purple-400 shrink-0" />
                <span>Mimar Sinan Mah. Alparslan Bulvarı No:123 Atakum / Samsun</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={20} className="text-purple-400 shrink-0" />
                <span>0555 123 45 67</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-8 border-t border-purple-900/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium">
          <p>© 2026 Atakum Pet Shop. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-white transition-colors">Mesafeli Satış Sözleşmesi</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
