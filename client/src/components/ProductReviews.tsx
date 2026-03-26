import { useState, useMemo } from "react";
import { Star, ThumbsUp, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEMALE_NAMES = [
  "Ayşe Y.", "Fatma K.", "Zeynep A.", "Elif D.", "Merve T.",
  "Esra B.", "Derya Ö.", "Seda C.", "Gülşen M.", "Hülya S.",
  "Pınar E.", "Serap N.", "Büşra K.", "Gamze İ.", "Sibel A.",
  "Deniz H.", "Burcu Ç.", "Özlem G.", "Aslı P.", "Nurgül T.",
  "Sevgi D.", "Yeliz K.", "Canan B.", "Dilek M.", "Hatice Y.",
  "Melek Ö.", "Gizem S.", "Tuğba A.", "Filiz C.", "Emine R.",
  "Selma K.", "Bahar İ.", "Nilgün T.", "Serpil H.", "Füsun E.",
  "Zehra D.", "Şeyma B.", "Aylin G.", "Gonca N.", "İrem P.",
];

const MALE_NAMES = [
  "Mehmet A.", "Ahmet K.", "Mustafa D.", "Ali B.", "Emre T.",
  "Burak S.", "Murat Ç.", "Serkan Y.",
];

const DELIVERY_COMMENTS = [
  "Sipariş verdikten 1 saat sonra kapıdaydı, inanılmaz hızlı teslimat!",
  "Aynı gün içinde teslim aldım, çok memnunum. Kapıya kadar getirdiler.",
  "Teslimat ekibi çok nazik ve hızlıydı. 2 saat içinde elime ulaştı.",
  "Sabah sipariş verdim, öğleden sonra kapıda. Harika bir hizmet!",
  "Kargo takibi çok güzel, WhatsApp'tan bilgi verdiler. Süper hızlı geldi.",
  "Atakum'a 1 saat gibi kısa sürede getirdiler, çok teşekkürler.",
  "Denizevleri'ne teslimat çok hızlı oldu, 45 dakikada kapıdaydı.",
  "Güzelyalı'ya aynı gün teslim aldım. Mağazaya gitmek zorunda kalmıyorum artık.",
  "Kurupelit'e bile aynı gün getirdiler, beklentimin üzerinde hız.",
];

const PAYMENT_COMMENTS = [
  "Kapıda nakit ödedim, çok pratik. Herhangi bir sorun yaşamadım.",
  "POS cihazı ile kapıda ödedim, taksit de yapılıyor. Süper kolaylık.",
  "QR ile ödeme yaptım, teknolojik ve hızlı. Modern bir pet shop!",
  "Nakit ödeme fiyatı gerçekten avantajlı, başka yerde bu fiyata bulamadım.",
  "Kapıda kredi kartıyla taksit yaptırdım, ödeme çok kolay.",
  "Para puan sistemi harika, her siparişte birikiyor. Bir sonraki siparişte kullandım.",
];

const PRODUCT_COMMENTS = [
  "Ürün kalitesi mükemmel, tam beklediğim gibi geldi. Tekrar sipariş vereceğim.",
  "Fiyatı piyasaya göre çok uygun, üstelik kapıya kadar getiriyorlar.",
  "Her zaman buradan alıyorum, hiç sorun yaşamadım. Tavsiye ederim.",
  "Kedim çok sevdi, iştahla yiyor. Kesinlikle devam edeceğiz.",
  "Köpeğim bu mamayı çok beğeniyor, sindirimi de gayet iyi.",
  "Son kullanma tarihi çok uzak geldi, taze ürün gönderiyorlar.",
  "Paket sağlam geldi, hiç hasar yoktu. Paketleme çok dikkatli.",
  "Mağazadan daha ucuz fiyata kapıma kadar geldi, müthiş kolaylık.",
  "Büyük çuvalı taşımaktan kurtuldum, JETGO ile hayat çok kolay.",
  "Her siparişte para puan kazanıyorum, birikiyor ve indirimi güzel oluyor.",
  "Stokta her zaman var, hiç 'yok' denmedi. Güvenilir tedarik.",
  "WhatsApp'tan sipariş çok kolay, hemen cevap veriyorlar.",
];

const SERVICE_COMMENTS = [
  "Müşteri hizmeti çok ilgili, sorularıma hemen cevap verdiler.",
  "JETGO'yu keşfettiğim için çok mutluyum, artık mağazaya gitmiyorum.",
  "Pet shop'a gitmeye gerek kalmıyor, her şey kapıya geliyor. Mükemmel!",
  "Ürün çeşitliliği çok iyi, her marka var. Beğenerek alışveriş yapıyorum.",
  "Samsun'da böyle bir hizmet olması çok güzel. Tavsiye ediyorum herkese.",
  "Komşuma da söyledim, o da sipariş vermeye başladı. Çok memnunuz.",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateReviewsForProduct(productId: number | string): Review[] {
  const id = typeof productId === "string" ? hashString(productId) : productId;
  const rand = seededRandom(id * 31 + 7);
  const count = Math.floor(rand() * 8) + 3;

  const allComments = [...DELIVERY_COMMENTS, ...PAYMENT_COMMENTS, ...PRODUCT_COMMENTS, ...SERVICE_COMMENTS];
  const allNames = [...FEMALE_NAMES, ...MALE_NAMES];
  const used = new Set<number>();
  const reviews: Review[] = [];

  const now = Date.now();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    let commentIdx: number;
    do {
      commentIdx = Math.floor(rand() * allComments.length);
    } while (used.has(commentIdx) && used.size < allComments.length);
    used.add(commentIdx);

    const nameIdx = Math.floor(rand() * allNames.length);
    const isFemale = nameIdx < FEMALE_NAMES.length;
    const name = allNames[nameIdx];
    const parts = name.split(" ");
    const initials = parts.map(p => p.charAt(0).toUpperCase()).join(".");

    const rating = rand() > 0.15 ? 5 : 4;
    const daysAgo = Math.floor(rand() * 28) + 1;
    const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    const likes = Math.floor(rand() * 12) + 1;

    reviews.push({
      id: `${id}-${i}`,
      initials,
      name,
      rating,
      date: dateStr,
      comment: allComments[commentIdx],
      likes,
      isFemale,
    });
  }

  return reviews.sort((a, b) => b.likes - a.likes);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface Review {
  id: string;
  initials: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  isFemale: boolean;
}

const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

function ReviewForm({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm font-semibold text-emerald-600 mb-1">Yorumunuz alındı!</p>
          <p className="text-xs text-muted-foreground">İncelendikten sonra yayınlanacaktır.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onClose} data-testid="btn-review-done">
            Tamam
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h4 className="text-sm font-bold">Yorum Yazın</h4>
        <div className="flex gap-1" role="group" aria-label="Puan seçin">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${s} yıldız`}
              className="focus:outline-none"
              data-testid={`btn-star-${s}`}
            >
              <Star className={`w-6 h-6 transition-colors ${s <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            </button>
          ))}
        </div>
        <textarea
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6B3480]/20 focus:border-[#6B3480]"
          rows={3}
          placeholder="Ürün ve hizmet hakkında yorumunuzu yazın..."
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="Yorum metni"
          data-testid="input-review-text"
        />
        <div className="flex gap-2">
          <Button
            className="flex-1"
            style={{ backgroundColor: "#6B3480" }}
            disabled={text.trim().length < 10}
            onClick={() => setSubmitted(true)}
            data-testid="btn-submit-review"
          >
            Gönder
          </Button>
          <Button variant="outline" onClick={onClose} data-testid="btn-cancel-review">
            İptal
          </Button>
        </div>
        {text.trim().length > 0 && text.trim().length < 10 && (
          <p className="text-[10px] text-muted-foreground">En az 10 karakter yazınız.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductReviews({ productId }: { productId: number | string }) {
  const reviews = useMemo(() => generateReviewsForProduct(productId), [productId]);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, 3);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-8" data-testid="section-reviews">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-extrabold" data-testid="text-reviews-title">Müşteri Yorumları</h3>
          <span className="text-sm text-muted-foreground">({reviews.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold" data-testid="text-avg-rating">{avgRating}</span>
        </div>
      </div>

      <div className="space-y-3">
        {displayed.map((review, idx) => (
          <Card key={review.id} className="overflow-hidden" data-testid={`card-review-${idx}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                  {review.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold truncate" data-testid={`text-reviewer-${idx}`}>{review.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-review-comment-${idx}`}>
                    {review.comment}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{review.likes} kişi faydalı buldu</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length > 3 && !showAll && (
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={() => setShowAll(true)}
          data-testid="btn-show-all-reviews"
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          Tüm Yorumları Gör ({reviews.length})
        </Button>
      )}

      <div className="mt-4">
        {!showForm ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowForm(true)}
            data-testid="btn-write-review"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Yorum Yaz
          </Button>
        ) : (
          <ReviewForm onClose={() => setShowForm(false)} />
        )}
      </div>
    </div>
  );
}
