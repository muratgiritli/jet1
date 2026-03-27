import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Camera, Heart, Trophy, Upload, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

interface ContestEntry {
  id: number;
  petName: string;
  petType: string;
  votes: number;
  customerName: string | null;
  description: string | null;
  isWinner: boolean;
  createdAt: string;
}

function getWeekLabel() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

export default function PetContestPage() {
  const { isLoggedIn } = useCustomer();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [winner, setWinner] = useState<ContestEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("kedi");
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/pet-contest").then(r => r.json()),
      fetch("/api/pet-contest/winner").then(r => r.json()),
    ]).then(([contestData, winnerData]) => {
      setEntries(contestData.entries || []);
      setWinner(winnerData.winner || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Dosya çok büyük", description: "Maksimum 5MB yükleyebilirsiniz", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!petName || !photoData) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pet-contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ petName, petType, photo: photoData, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Hata", description: data.message, variant: "destructive" });
      } else {
        toast({ title: "Başarılı!", description: "Petiniz yarışmaya katıldı!" });
        setShowUpload(false);
        setPetName(""); setDescription(""); setPhotoPreview(null); setPhotoData(null);
        const updated = await fetch("/api/pet-contest").then(r => r.json());
        setEntries(updated.entries || []);
      }
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleVote = async (entryId: number) => {
    if (votedIds.has(entryId)) return;
    try {
      const res = await fetch(`/api/pet-contest/${entryId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setVotedIds(prev => new Set([...prev, entryId]));
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, votes: e.votes + 1 } : e));
        toast({ title: "Oy verildi!", description: data.message });
      } else {
        toast({ title: "Uyarı", description: data.message, variant: "destructive" });
        setVotedIds(prev => new Set([...prev, entryId]));
      }
    } catch {
      toast({ title: "Hata", description: "Oy verilemedi", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      <SEO title="En Tatlı Pet Yarışması | JETGO" description="Haftalık en tatlı pet yarışması! Petinizin fotoğrafını yükleyin, oy verin ve ödül kazanın." />

      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" data-testid="btn-back">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-extrabold" data-testid="text-page-title">🏆 En Tatlı Pet Yarışması</h1>
            <p className="text-[10px] text-muted-foreground">{getWeekLabel()}</p>
          </div>
          {isLoggedIn && (
            <Button
              size="sm"
              onClick={() => setShowUpload(true)}
              className="text-xs"
              style={{ backgroundColor: "#e65100" }}
              data-testid="btn-open-upload"
            >
              <Camera className="w-3.5 h-3.5 mr-1" /> Katıl
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {winner && (
          <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)", border: "2px solid #ffb300" }} data-testid="section-winner">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-extrabold text-amber-800">Geçen Haftanın Şampiyonu</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-100 shrink-0">
                  <img src={`/api/pet-contest/photo/${winner.id}`} alt={winner.petName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{winner.petName}</p>
                  <p className="text-[11px] text-amber-700">{winner.customerName || "Anonim"} • {winner.votes} oy</p>
                  {winner.description && <p className="text-[10px] text-gray-500 mt-0.5">{winner.description}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl p-4 mb-4" style={{ background: "linear-gradient(135deg, #6B3480 0%, #9C27B0 100%)" }}>
          <p className="text-sm font-bold text-white mb-1">Nasıl Çalışır?</p>
          <div className="space-y-1.5">
            {[
              "📸 Petinizin fotoğrafını yükleyin",
              "❤️ Diğer petlere oy verin",
              "🏆 En çok oy alan pet vitrine çıkar",
              "🎁 Kazanana sürpriz ödül maması!",
            ].map((t, i) => (
              <p key={i} className="text-[11px] text-white/90">{t}</p>
            ))}
          </div>
        </div>

        {showUpload && (
          <div className="rounded-2xl border-2 border-dashed border-orange-300 p-4 mb-6 bg-orange-50/50" data-testid="section-upload">
            <p className="text-sm font-bold text-gray-800 mb-3">Petini Yarışmaya Ekle</p>
            <div className="space-y-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full h-40 rounded-xl bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 transition-colors overflow-hidden"
                data-testid="btn-select-photo"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Fotoğraf seç (max 5MB)</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} data-testid="input-photo" />

              <div className="flex gap-2">
                {[
                  { t: "kedi", e: "🐱", l: "Kedi" },
                  { t: "kopek", e: "🐶", l: "Köpek" },
                  { t: "kus", e: "🐦", l: "Kuş" },
                  { t: "diger", e: "🐾", l: "Diğer" },
                ].map(p => (
                  <button
                    key={p.t}
                    onClick={() => setPetType(p.t)}
                    className={`flex-1 rounded-lg p-2 text-center text-xs font-bold transition-all ${petType === p.t ? "ring-2 ring-orange-400 bg-orange-50" : "bg-white border border-gray-200"}`}
                    data-testid={`btn-type-${p.t}`}
                  >
                    {p.e} {p.l}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Petinin adı"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                data-testid="input-pet-name"
              />
              <Input
                placeholder="Kısa açıklama (opsiyonel)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                data-testid="input-description"
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowUpload(false)} className="flex-1" data-testid="btn-cancel-upload">İptal</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !petName || !photoData}
                  className="flex-1 text-white"
                  style={{ backgroundColor: "#e65100" }}
                  data-testid="btn-submit-entry"
                >
                  {submitting ? "Yükleniyor..." : "Yarışmaya Katıl 🐾"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-4 text-center">
            <p className="text-xs text-blue-700">
              Yarışmaya katılmak için{" "}
              <Link href="/giris?redirect=/yarisma" className="font-bold underline" data-testid="link-login">giriş yapın</Link>
            </p>
          </div>
        )}

        <h2 className="text-sm font-extrabold text-gray-800 mb-3" data-testid="text-entries-heading">
          Bu Haftanın Yarışmacıları ({entries.length})
        </h2>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <span className="text-4xl block mb-3">🐾</span>
            <p className="text-sm font-bold text-gray-600">Henüz yarışmacı yok</p>
            <p className="text-xs text-gray-400 mt-1">İlk katılan sen ol!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                data-testid={`contest-entry-${entry.id}`}
              >
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={`/api/pet-contest/photo/${entry.id}`}
                    alt={entry.petName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {idx === 0 && entries.length > 1 && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> 1. Sıra
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {entry.petType === "kopek" ? "🐶" : entry.petType === "kus" ? "🐦" : entry.petType === "diger" ? "🐾" : "🐱"}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-gray-800 truncate">{entry.petName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{entry.customerName || "Anonim"}</p>
                  {entry.description && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{entry.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" fill={votedIds.has(entry.id) ? "#f87171" : "none"} />
                      {entry.votes}
                    </span>
                    <button
                      onClick={() => handleVote(entry.id)}
                      disabled={votedIds.has(entry.id)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                        votedIds.has(entry.id)
                          ? "bg-gray-100 text-gray-400"
                          : "bg-red-50 text-red-500 hover:bg-red-100 active:scale-95"
                      }`}
                      data-testid={`btn-vote-${entry.id}`}
                    >
                      {votedIds.has(entry.id) ? "Oy Verildi" : "❤️ Oy Ver"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
