import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldCheck, Truck, Clock, Flame, Banknote, AlertTriangle,
  Heart, Share2, ChevronLeft, Star, Check, Info, Lock, Zap, MapPin,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  img: string | null;
  originalPrice?: number | null;
  skt?: string | null;
}

function CountdownStrip() {
  const [time, setTime] = useState({ d: 1, h: 8, m: 14, s: 33 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((p) => {
        let { d, h, m, s } = p;
        s--; if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2.5 shadow-md">
      <Flame className="w-5 h-5 animate-pulse" />
      <span className="text-sm font-bold">Kampanya bitmesine:</span>
      <div className="flex gap-1.5">
        {[
          { v: time.d, l: "G" }, { v: time.h, l: "S" },
          { v: time.m, l: "DK" }, { v: time.s, l: "SN" },
        ].map((b, i) => (
          <div key={i} className="bg-white/20 rounded px-1.5 py-0.5 text-center min-w-[34px]">
            <div className="text-xs font-extrabold leading-tight">{String(b.v).padStart(2, "0")}</div>
            <div className="text-[8px] opacity-80">{b.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartCashDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (o: boolean) => void; product: ApiProduct }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-cart-cash">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Check className="w-5 h-5 text-green-600" />
            Kampanya ürünü sepete eklendi
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-600 pt-1">
            Bu ürün kampanya kapsamında olduğu için ödeme yöntemi otomatik seçilmiştir.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-center mt-2">
          <div className="w-14 h-14 bg-white rounded-lg p-1 border">
            <ProductImage src={product.img} alt={product.name} className="w-full h-full object-contain" loading="eager" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 line-clamp-2">{product.name}</p>
            <p className="text-sm font-extrabold text-purple-700 mt-0.5">{product.price.toLocaleString("tr-TR")} TL</p>
          </div>
          <Badge className="bg-purple-100 text-purple-800 text-[10px]">x1</Badge>
        </div>

        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 mt-3">
          <p className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Geçerli ödeme yöntemi
          </p>
          <div className="bg-white rounded-lg border-2 border-green-500 p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-green-900">Kapıda Nakit Ödeme</p>
              <p className="text-[11px] text-green-700">Sadece bu yöntem ile ödenebilir</p>
            </div>
            <Check className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="text-[11px] text-gray-500 flex items-start gap-1.5 mt-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Diğer ödeme seçenekleri (kredi kartı, EFT, QR) bu kampanya için <strong>devre dışı</strong>dır.
        </div>

        <div className="flex gap-2 mt-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} data-testid="btn-continue-shopping">
            Alışverişe Devam Et
          </Button>
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => onOpenChange(false)} data-testid="btn-go-checkout">
            Ödemeye Git
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CampaignProductDemoPage() {
  const [showCart, setShowCart] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data: allProducts = [] } = useQuery<ApiProduct[]>({ queryKey: ["/api/products"] });
  const product = allProducts.find(p => p.img && p.price > 0);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const oldPrice = Math.round(product.price / (1 - 32 / 100));
  const savings = oldPrice - product.price;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <p className="text-xs font-bold text-yellow-900">
          🎨 DEMO — Kampanya Ürün Detay Sayfası (Sadece 1 Adet · Sadece Nakit · Para Puan Yok)
        </p>
      </div>

      {/* Üst nav */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/kampanya-demo">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-700 font-semibold" data-testid="btn-back">
              <ChevronLeft className="w-4 h-4" />
              Kampanyalara Dön
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol: Görsel */}
          <div>
            <div className="relative bg-white rounded-2xl border-2 border-purple-100 overflow-hidden shadow-sm">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-extrabold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                  %32
                </div>
                <Badge className="bg-purple-700 text-white text-xs font-extrabold px-3 py-1.5">
                  <Flame className="w-3 h-3 mr-1" />
                  KAMPANYA
                </Badge>
              </div>
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
                  data-testid="btn-fav"
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50" data-testid="btn-share">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="aspect-square p-8">
                <ProductImage src={product.img} alt={product.name} className="w-full h-full object-contain" loading="eager" />
              </div>
            </div>
          </div>

          {/* Sağ: Bilgi */}
          <div className="space-y-4">
            {/* Geri sayım */}
            <CountdownStrip />

            {/* Başlık */}
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight" data-testid="text-product-title">
              {product.name}
            </h1>

            {/* Yıldız + sosyal */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                <span className="ml-1 font-semibold">4.8 (124 değerlendirme)</span>
              </div>
            </div>

            {/* Fiyat alanı */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-4 shadow-sm">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-purple-700" data-testid="text-price">
                  {product.price.toLocaleString("tr-TR")} TL
                </span>
                <span className="text-base text-gray-400 line-through">
                  {oldPrice.toLocaleString("tr-TR")} TL
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
                <Zap className="w-3.5 h-3.5" />
                {savings.toLocaleString("tr-TR")} TL tasarruf ediyorsun
              </div>
            </div>

            {/* KAMPANYA KOŞULLARI */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-extrabold text-amber-900">Kampanya Koşulları</h3>
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-extrabold text-amber-900">1</span>
                  </div>
                  <div className="text-xs text-amber-900">
                    <strong>Kişi başı sadece 1 adet</strong> alınabilir. Sepete sadece 1 adet ekleyebilirsiniz.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Banknote className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <strong>Yalnızca kapıda nakit ödeme</strong> ile alınabilir. Kredi kartı, EFT, QR kabul edilmez.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <strong>Para Puan kazanılmaz</strong>. Bu kampanyaya özel indirim sebebiyle puan birikmez.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Truck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <strong>Ön sipariş — 3 iş günü</strong> içinde adresinize teslim edilir.
                  </div>
                </li>
              </ul>
            </div>

            {/* Teslimat */}
            <div className="bg-white border rounded-xl p-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-gray-900">Samsun · Atakum</p>
                <p className="text-gray-500">Bölgenize 3 iş günü içinde teslim</p>
              </div>
            </div>

            {/* Sepete ekle */}
            <Button
              onClick={() => setShowCart(true)}
              className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base rounded-2xl shadow-lg"
              data-testid="btn-add-cart"
            >
              <Banknote className="w-5 h-5 mr-2" />
              Sepete Ekle (1 Adet · Nakit)
            </Button>

            {/* Güven badge'leri */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center text-[10px] text-gray-600 bg-white border rounded-lg p-2">
                <ShieldCheck className="w-4 h-4 mx-auto text-green-600 mb-1" />
                <span className="font-semibold">Orijinal Ürün</span>
              </div>
              <div className="text-center text-[10px] text-gray-600 bg-white border rounded-lg p-2">
                <Truck className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <span className="font-semibold">3 Gün Teslim</span>
              </div>
              <div className="text-center text-[10px] text-gray-600 bg-white border rounded-lg p-2">
                <Banknote className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <span className="font-semibold">Kapıda Nakit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Açıklama bölümü */}
        <div className="mt-8 bg-white rounded-2xl border p-5">
          <h2 className="text-base font-extrabold text-gray-900 mb-3">Ürün Açıklaması</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Yetişkin kediler için özel olarak formüle edilmiştir. Yüksek kaliteli protein kaynakları, dengeli vitamin ve mineral içeriği ile kediniz için ideal beslenme. Tahılsız yapısı ve kolay sindirilebilir formülü sayesinde hassas mide yapısına sahip kediler için de uygundur.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {["Tahılsız", "Yüksek Protein", "Hassas Mide", "Premium Kalite"].map(t => (
              <div key={t} className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-center">
                ✓ {t}
              </div>
            ))}
          </div>
        </div>

        {/* Önemli uyarı */}
        <div className="mt-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 leading-relaxed">
            <strong className="block mb-1">Önemli kampanya kuralları:</strong>
            Bu ürün kampanya kapsamındadır. Sepetinize <strong>en fazla 1 adet</strong> ekleyebilirsiniz. Çıkış sırasında <strong>yalnızca "Kapıda Nakit" ödeme</strong> seçeneği görüntülenecektir. Bu sipariş için Para Puan kazanılmaz.
          </div>
        </div>
      </div>

      <CartCashDialog open={showCart} onOpenChange={setShowCart} product={product} />
    </div>
  );
}
