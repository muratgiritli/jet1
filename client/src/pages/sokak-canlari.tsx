import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Heart, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import bannerImg from "@assets/CUVAL_MAMA_1778678246834.png";
import SEO, { SITE_DOMAIN, FAQ_JSONLD } from "@/components/SEO";

interface StreetProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  img: string | null;
  stock: number;
  isActive: boolean;
}

export default function SokakCanlariPage() {
  const { data: products = [], isLoading } = useQuery<StreetProduct[]>({
    queryKey: ["/api/street-animals"],
  });
  const { basket, updateQty, itemCount } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-32">
      <SEO
        title="Sokak Hayvanları için Askıda Mama - Samsun | JETGO Pet Shop"
        description="Samsun sokak hayvanlarına yardım et. Çuval mama bağışı yap, askıda mama kampanyasına katıl. Atakum, İlkadım, Canik bölgesinde hayvanseverlerin yanındayız."
        keywords="samsun sokak hayvanları, askıda mama samsun, çuval mama bağışı, atakum sokak hayvanları, samsun hayvan bağışı, sokak kedileri samsun, sokak köpekleri samsun"
        canonical={`${SITE_DOMAIN}/sokak-canlari`}
        jsonLd={FAQ_JSONLD([
          { question: "Askıda mama nedir?", answer: "Müşterilerin sokak hayvanları için bağışladığı mamadır. JETGO bu mamaları Samsun'daki sokak hayvanlarına dağıtır." },
          { question: "Nasıl bağış yapabilirim?", answer: "Bu sayfadan çuval mama ürünlerini sepete ekleyip sipariş verirsiniz. Bağışınız Samsun'daki sokak hayvanlarına ulaştırılır." },
        ])}
      />
      <div className="max-w-6xl mx-auto px-3 md:px-6 pt-3 md:pt-6">
        <div className="rounded-2xl overflow-hidden shadow-md">
          <img src={bannerImg} alt="Sokak Canları için Çuval Mama" className="w-full h-auto block" data-testid="img-sokak-banner" />
        </div>

        <div className="mt-4 md:mt-6 bg-white rounded-2xl p-4 md:p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h1 className="text-lg md:text-2xl font-extrabold text-gray-900" data-testid="text-page-title">Sokak Canları İçin Çuval Mama</h1>
          </div>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Bir çuval mama, birçok cana umut olur. Aşağıdaki ürünleri sepete ekleyerek normal şekilde satın alabilirsin —
            tüm ödeme yöntemleri (kapıda nakit, kredi kartı, havale, online ödeme) geçerli.
          </p>
        </div>

        <div className="mt-4 md:mt-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-12" data-testid="text-loading">Yükleniyor...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border" data-testid="text-empty">
              Şu anda burada gösterilecek ürün yok. Yakında eklenecek.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map(p => {
                const qty = basket[String(p.id)] || 0;
                const outOfStock = (p.stock ?? 0) <= 0;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                    data-testid={`card-street-product-${p.id}`}
                  >
                    <Link href={`/urun/${p.id}`} className="block aspect-square bg-white flex items-center justify-center overflow-hidden p-2 cursor-pointer" data-testid={`link-img-${p.id}`}>
                      {p.img ? (
                        <img src={p.img} alt={p.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                      ) : (
                        <div className="text-gray-300 text-xs">Görsel yok</div>
                      )}
                    </Link>
                    <div className="p-2.5 md:p-3 flex flex-col flex-1">
                      <Link href={`/urun/${p.id}`} className="cursor-pointer hover:text-orange-600 transition-colors" data-testid={`link-name-${p.id}`}>
                        <h3 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-3 mb-1.5 hover:text-orange-600" data-testid={`text-name-${p.id}`}>
                          {p.name}
                        </h3>
                      </Link>
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1.5 mb-2">
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] md:text-xs text-gray-400 line-through" data-testid={`text-orig-price-${p.id}`}>
                              {p.originalPrice.toFixed(2)}₺
                            </span>
                          )}
                          <span className="text-base md:text-lg font-extrabold text-orange-600" data-testid={`text-price-${p.id}`}>
                            {p.price.toFixed(2)}₺
                          </span>
                        </div>
                        {outOfStock ? (
                          <Button disabled size="sm" className="w-full h-8 text-xs" data-testid={`button-out-${p.id}`}>
                            Tükendi
                          </Button>
                        ) : qty > 0 ? (
                          <div className="flex items-center justify-between gap-1 bg-orange-50 rounded-lg p-1">
                            <button
                              onClick={() => updateQty(String(p.id), -1)}
                              className="w-7 h-7 rounded-md bg-white border border-orange-200 flex items-center justify-center text-orange-600 hover:bg-orange-100"
                              data-testid={`button-decrease-${p.id}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-sm text-gray-900" data-testid={`text-qty-${p.id}`}>{qty}</span>
                            <button
                              onClick={() => updateQty(String(p.id), 1)}
                              disabled={qty >= p.stock}
                              className="w-7 h-7 rounded-md bg-white border border-orange-200 flex items-center justify-center text-orange-600 hover:bg-orange-100 disabled:opacity-40"
                              data-testid={`button-increase-${p.id}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => updateQty(String(p.id), 1)}
                            size="sm"
                            className="w-full h-8 text-xs bg-orange-500 hover:bg-orange-600"
                            data-testid={`button-add-${p.id}`}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Sepete Ekle
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {itemCount > 0 && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40">
            <Link href="/odeme" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-full shadow-lg" data-testid="link-checkout">
              <ShoppingCart className="w-4 h-4" /> Sepete Git ({itemCount}) <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
