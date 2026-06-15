import React, { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight, Menu, MapPin, Clock, CreditCard, Heart, ChevronRight, X, Phone, Mail, Instagram } from "lucide-react";

export function Vitrin() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-up, .fade-in, .slide-in").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const categories = [
    { name: "Köpek", count: "142 Ürün", img: "/__mockup/images/category-dog.webp" },
    { name: "Kedi", count: "185 Ürün", img: "/__mockup/images/category-cat.webp" },
    { name: "Kuş", count: "45 Ürün", img: "/__mockup/images/category-bird.webp" },
    { name: "Kemirgen & Tavşan", count: "28 Ürün", img: "/__mockup/images/category-rabbit.webp" },
    { name: "Akvaryum", count: "64 Ürün", img: "/__mockup/images/category-dog.webp" }, // fallback
    { name: "Veteriner Serisi", count: "Özel Seriler", img: "/__mockup/images/category-cat.webp" }, // fallback
  ];

  const products = [
    { id: 1, name: "Royal Canin Yetişkin Kedi Maması 2kg", price: "549", tag: "En Çok Satan", brand: "Royal Canin" },
    { id: 2, name: "Pro Plan Medium Adult Köpek Maması 15kg", price: "1.249", tag: "Premium", brand: "Pro Plan" },
    { id: 3, name: "N&D Tahılsız Düşük Tahıllı Kedi Maması 1.5kg", price: "689", tag: "Gurme", brand: "N&D" },
    { id: 4, name: "Bentonit İnce Taneli Kedi Kumu 10L", price: "189", tag: "Çok Al Az Öde", brand: "Ever Clean" },
    { id: 5, name: "Deri Köpek Tasması L Beden", price: "249", tag: "El Yapımı", brand: "Atakum Butik" },
    { id: 6, name: "Kedi Oltası ve Doğal Tüy Oyuncak", price: "85", tag: "Yeni", brand: "Pet Play" },
  ];

  return (
    <div className="vitrin-theme bg-[#FDFCFB] text-[#1A1A1A] font-sans overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@300;400;500;600&display=swap');

        .vitrin-theme {
          --violet-900: #260B29;
          --violet-800: #38123C;
          --violet-600: #5D2363;
          --violet-100: #F3EAF4;
          --sand: #FDFCFB;
          
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-serif {
          font-family: 'Playfair Display', serif;
        }

        /* Animations */
        .fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .fade-in {
          opacity: 0;
          transition: opacity 1.5s ease-out;
        }
        .slide-in {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 1s ease-out, transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .is-visible {
          opacity: 1;
          transform: translate(0, 0);
        }

        /* Custom Scrollbar */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .image-mask {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          transition: clip-path 1.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .hero-clip {
          clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
        }

        .btn-editorial {
          position: relative;
          overflow: hidden;
          transition: color 0.4s ease;
          z-index: 1;
        }
        .btn-editorial::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: var(--violet-900);
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: -1;
        }
        .btn-editorial:hover {
          color: #fff;
        }
        .btn-editorial:hover::before {
          transform: translateX(100%);
        }
      `}} />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#FDFCFB]/90 backdrop-blur-md py-4 border-b border-gray-100' : 'bg-transparent py-6 text-white'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 lg:hidden">
              <Menu size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
            </button>
            <div className="hidden lg:flex gap-8 text-sm font-medium tracking-wide uppercase">
              <a href="#koleksiyon" className="hover:opacity-70 transition-opacity">Koleksiyon</a>
              <a href="#kategoriler" className="hover:opacity-70 transition-opacity">Kategoriler</a>
              <a href="#hizmet" className="hover:opacity-70 transition-opacity">Ayrıcalıklar</a>
            </div>
          </div>

          <a href="#" className={`text-2xl md:text-3xl font-serif font-bold tracking-tight ${isScrolled ? 'text-[#260B29]' : 'text-white'}`}>
            Atakum<span className="font-sans text-lg font-light ml-1">Pet Shop</span>
          </a>

          <div className="flex items-center gap-6">
            <a href="#" className={`hidden lg:flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              <MapPin size={16} />
              <span>Samsun / Atakum</span>
            </a>
            <button className={`relative p-2 flex items-center gap-2 transition-opacity hover:opacity-70 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              <span className="hidden md:block text-sm font-medium uppercase tracking-wide">Sepet</span>
              <ShoppingBag size={20} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#5D2363] text-white text-[10px] flex items-center justify-center rounded-full">0</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#260B29] z-[60] transition-transform duration-700 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="p-6 md:p-12 flex justify-between items-center text-white border-b border-white/10">
          <span className="font-serif text-2xl font-bold">Atakum Pet Shop</span>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:rotate-90 transition-transform duration-300">
            <X size={32} />
          </button>
        </div>
        <div className="p-8 md:p-16 flex flex-col gap-8 text-white">
          <a href="#koleksiyon" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl md:text-6xl hover:text-[#5D2363] transition-colors">Koleksiyon</a>
          <a href="#kategoriler" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl md:text-6xl hover:text-[#5D2363] transition-colors">Kategoriler</a>
          <a href="#hizmet" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl md:text-6xl hover:text-[#5D2363] transition-colors">Ayrıcalıklar</a>
          <a href="#askida" onClick={() => setIsMenuOpen(false)} className="font-serif text-4xl md:text-6xl hover:text-[#5D2363] transition-colors">Askıda Mama</a>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4 text-white/70">
            <p className="flex items-center gap-3"><MapPin size={20}/> Atakum, Samsun</p>
            <p className="flex items-center gap-3"><Clock size={20}/> 1 Saatte Teslimat</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[100svh] min-h-[700px] flex items-center justify-center bg-[#260B29] hero-clip overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/__mockup/images/vitrin-hero.png" 
            alt="Premium Pet Portrait" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-[10s]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#260B29]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <span className="fade-up inline-block text-white/80 tracking-[0.2em] text-sm uppercase mb-6 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            Premium Evcil Hayvan Butiği
          </span>
          <h1 className="fade-up text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-8" style={{ transitionDelay: '0.2s' }}>
            En İyisini<br />
            <span className="italic font-light text-[#F3EAF4]">Hak Edenlere.</span>
          </h1>
          <p className="fade-up text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12" style={{ transitionDelay: '0.4s' }}>
            Atakum sınırları içerisinde, evcil dostunuzun ihtiyaç duyduğu premium ürünler siparişinizden itibaren sadece 1 saat içinde kapınızda.
          </p>
          <div className="fade-up flex flex-col sm:flex-row gap-6 justify-center items-center" style={{ transitionDelay: '0.6s' }}>
            <a href="#koleksiyon" className="bg-white text-[#260B29] px-8 py-4 rounded-full font-medium tracking-wide uppercase text-sm hover:bg-[#F3EAF4] transition-colors flex items-center gap-3">
              Koleksiyonu Keşfet <ArrowRight size={18} />
            </a>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <Clock size={20} className="text-[#5D2363]" />
              <span>Atakum içi hızlı teslimat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust Ribbon */}
      <section className="py-12 bg-[#F3EAF4] border-b border-[#260B29]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-[#260B29]/10 text-center">
            <div className="fade-up py-4 md:py-0 flex flex-col items-center gap-3" style={{ transitionDelay: '0.1s' }}>
              <Clock size={32} strokeWidth={1.5} className="text-[#5D2363]" />
              <h3 className="font-serif font-semibold text-xl text-[#260B29]">1 Saatte Teslim</h3>
              <p className="text-sm text-[#260B29]/70">Atakum içi siparişlerinizde ışık hızında teslimat garantisi.</p>
            </div>
            <div className="fade-up py-4 md:py-0 flex flex-col items-center gap-3" style={{ transitionDelay: '0.2s' }}>
              <CreditCard size={32} strokeWidth={1.5} className="text-[#5D2363]" />
              <h3 className="font-serif font-semibold text-xl text-[#260B29]">Kapıda Ödeme</h3>
              <p className="text-sm text-[#260B29]/70">Teslimat sırasında nakit veya kredi kartı ile güvenle ödeyin.</p>
            </div>
            <div className="fade-up py-4 md:py-0 flex flex-col items-center gap-3" style={{ transitionDelay: '0.3s' }}>
              <Heart size={32} strokeWidth={1.5} className="text-[#5D2363]" />
              <h3 className="font-serif font-semibold text-xl text-[#260B29]">%5 Para Puan</h3>
              <p className="text-sm text-[#260B29]/70">Her alışverişinizde kazanacağınız puanlarla bir sonraki siparişte indirim.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Editorial Style */}
      <section id="koleksiyon" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl slide-in">
              <span className="text-[#5D2363] uppercase tracking-widest text-xs font-semibold mb-4 block">Seçkin Ürünler</span>
              <h2 className="font-serif text-4xl md:text-6xl text-[#260B29] font-bold leading-tight">
                Zevkli Bir<br/><span className="italic font-light">Yaşam İçin.</span>
              </h2>
            </div>
            <a href="#" className="flex items-center gap-2 text-[#260B29] border-b border-[#260B29] pb-1 font-medium hover:text-[#5D2363] hover:border-[#5D2363] transition-colors fade-in">
              Tümünü Görüntüle <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div key={product.id} className="group fade-up" style={{ transitionDelay: `${index * 0.1}s` }}>
                <div className="relative aspect-[3/4] bg-white overflow-hidden rounded-sm mb-6 border border-gray-100">
                  <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-[#260B29]">
                    {product.tag}
                  </span>
                  
                  {/* Decorative placeholder for product image */}
                  <div className="absolute inset-0 bg-[#F3EAF4] flex items-center justify-center p-12 transition-transform duration-700 group-hover:scale-105">
                     {/* We use a stylized text or generic mockup image if no real product image is available */}
                     <div className="text-center opacity-30 font-serif text-3xl italic">{product.brand}</div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-end">
                    <button className="w-full bg-white text-[#260B29] py-3 rounded uppercase text-xs font-bold tracking-widest hover:bg-[#260B29] hover:text-white transition-colors">
                      Sepete Ekle
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[#5D2363] text-xs font-medium tracking-wider uppercase">{product.brand}</span>
                  <h3 className="font-serif text-xl text-[#260B29] leading-snug line-clamp-2">{product.name}</h3>
                  <div className="text-lg font-medium text-[#260B29]">₺{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Promise - Editorial Image block */}
      <section id="hizmet" className="py-24 bg-[#260B29] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="w-full lg:w-1/2 slide-in">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-t-full border border-white/20 p-2">
                <img 
                  src="/__mockup/images/vitrin-products.png" 
                  alt="Premium Products" 
                  className="w-full h-full object-cover rounded-t-full opacity-80"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 fade-up">
              <span className="text-[#F3EAF4] uppercase tracking-[0.2em] text-sm mb-6 block border-b border-white/20 pb-4 inline-block">Zamanın Değeri</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                Sizi <br/>
                <span className="italic font-light text-[#F3EAF4]">Bekletmiyoruz.</span>
              </h2>
              <p className="text-lg font-light leading-relaxed text-white/80 mb-10 max-w-xl">
                Mama bittiğinde yaşanan o paniği biliyoruz. Atakum içi verdiğiniz tüm siparişleri, özel kuryelerimizle tam 1 saat içerisinde kapınıza getiriyoruz. Siz sadece tüylü dostunuzla geçireceğiniz keyifli anlara odaklanın.
              </p>
              
              <ul className="space-y-4 mb-12">
                {['Özenli paketleme ve güvenli taşıma', 'Güler yüzlü Atakum ekibi', 'Anlık sipariş durumu takibi'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/90">
                    <span className="w-6 h-6 rounded-full border border-[#5D2363] flex items-center justify-center text-[#5D2363]">
                      <Heart size={12} fill="currentColor" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <a href="#koleksiyon" className="inline-flex items-center gap-4 text-white font-medium uppercase tracking-widest text-sm hover:text-[#5D2363] transition-colors">
                Alışverişe Başla <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Asymmetrical */}
      <section id="kategoriler" className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20 fade-up">
            <h2 className="font-serif text-4xl md:text-6xl text-[#260B29] font-bold mb-6">Kategoriler</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Her türe, her ırka ve her ihtiyaca uygun özenle seçilmiş ürün yelpazemiz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
            {/* Büyük Köpek Kategorisi */}
            <a href="#" className="md:col-span-8 row-span-2 relative group overflow-hidden bg-gray-100 rounded-sm fade-up">
              <img src={categories[0].img} alt={categories[0].name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="font-serif text-4xl mb-2">{categories[0].name}</h3>
                <p className="font-medium tracking-wide uppercase text-sm opacity-80">{categories[0].count}</p>
              </div>
            </a>
            
            {/* Kedi Kategorisi */}
            <a href="#" className="md:col-span-4 row-span-2 relative group overflow-hidden bg-gray-100 rounded-sm fade-up" style={{ transitionDelay: '0.1s' }}>
              <img src={categories[1].img} alt={categories[1].name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="font-serif text-4xl mb-2">{categories[1].name}</h3>
                <p className="font-medium tracking-wide uppercase text-sm opacity-80">{categories[1].count}</p>
              </div>
            </a>

            {/* Küçük Kategoriler */}
            {categories.slice(2).map((cat, i) => (
              <a href="#" key={cat.name} className="md:col-span-3 row-span-1 relative group overflow-hidden bg-gray-100 rounded-sm fade-up" style={{ transitionDelay: `${(i+2)*0.1}s` }}>
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                  <h3 className="font-serif text-2xl mb-1">{cat.name}</h3>
                  <p className="text-xs tracking-wider uppercase opacity-80">{cat.count}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Askıda Mama / Community Section */}
      <section id="askida" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-[#260B29]/5 flex flex-col lg:flex-row fade-up">
            <div className="lg:w-1/2 relative min-h-[400px]">
              <img src="/__mockup/images/vitrin-charity.png" alt="Sokak Hayvanları" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3EAF4] text-[#5D2363] mb-8">
                <Heart size={32} />
              </div>
              <h2 className="font-serif text-4xl text-[#260B29] font-bold mb-6">Sokaklara <span className="italic font-light">Dokun.</span></h2>
              <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                Sıcak evlerinde uyuyan dostlarımız kadar, sokaktaki canlarımızı da düşünüyoruz. <strong>Askıda Mama</strong> uygulamasıyla sepetinize ekleyeceğiniz ufak bağışlar, Atakum sokaklarındaki patili dostlarımıza taze mama ve su olarak ulaşıyor.
              </p>
              <button className="bg-[#260B29] text-white px-8 py-4 rounded font-medium tracking-wide uppercase text-sm hover:bg-[#5D2363] transition-colors w-max">
                Askıya Mama Bırak
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vet Tip - Elegant Quote */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <span className="font-serif text-[400px] leading-none select-none text-[#260B29]">"</span>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <span className="text-[#5D2363] uppercase tracking-widest text-xs font-semibold mb-8 block">Haftanın İpucu</span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#260B29] leading-normal font-medium mb-12">
            "Mevsim geçişlerinde dostunuzun tüy bakımını aksatmamak, sadece görünümünü değil, psikolojisini de olumlu etkiler."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <img src="/__mockup/images/cat-dog.webp" alt="Vet" className="w-full h-full object-cover grayscale" />
            </div>
            <div className="text-left">
              <p className="font-bold text-[#260B29] text-sm">Uzm. Vet. Hekim</p>
              <p className="text-xs text-gray-500">Atakum Bölgesi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white pt-24 pb-12 border-t-8 border-[#5D2363]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <span className="font-serif text-3xl font-bold mb-6 block">Atakum Pet Shop</span>
              <p className="text-gray-400 max-w-sm leading-relaxed font-light mb-8">
                Atakum'un premium evcil hayvan butiği. Özenle seçilmiş ürünler, ayrıcalıklı hizmet ve patili dostlarımıza duyduğumuz sonsuz sevgi ile hizmetinizdeyiz.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#5D2363] hover:border-[#5D2363] transition-colors"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#5D2363] hover:border-[#5D2363] transition-colors"><Mail size={18} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-serif text-lg mb-6">Hızlı Menü</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Teslimat & İade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Para Puan Sistemi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Askıda Mama</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg mb-6">İletişim</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex gap-3">
                  <MapPin size={18} className="text-[#5D2363] flex-shrink-0" />
                  <span>Mimar Sinan Mah. Alparslan Bulvarı No:XX<br/>Atakum / Samsun</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-[#5D2363]" />
                  <span>0 (362) XXX XX XX</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Atakum Pet Shop. Tüm hakları saklıdır.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Vitrin;