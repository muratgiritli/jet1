import { useState } from "react";
import { Star, ThumbsUp, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  reviewDate: string;
  isPublished: boolean;
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

function getInitials(name: string): string {
  return name.split(" ").map(p => p.charAt(0).toUpperCase()).join(".");
}

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
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews", productId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${productId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (reviews.length === 0) return null;

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
        {displayed.map((review, idx) => {
          const initials = getInitials(review.reviewerName);
          return (
            <Card key={review.id} className="overflow-hidden" data-testid={`card-review-${idx}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold truncate" data-testid={`text-reviewer-${idx}`}>{review.reviewerName}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{review.reviewDate}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-review-comment-${idx}`}>
                      {review.comment}
                    </p>
                    {review.helpfulCount > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{review.helpfulCount} kişi faydalı buldu</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
