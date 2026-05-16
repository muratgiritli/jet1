import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLocation } from "wouter";
import {
  Plus, Phone, MapPin, AlertTriangle, Heart, Search as SearchIcon,
  Check, Camera, Loader2, Dog, Cat, Bird
} from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";

const POST_TYPES = [
  { id: "lost", label: "Kayıp", color: "bg-red-100 text-red-700", emoji: "🔴" },
  { id: "found", label: "Bulundu", color: "bg-green-100 text-green-700", emoji: "🟢" },
  { id: "adopt", label: "Yuva Arıyor", color: "bg-blue-100 text-blue-700", emoji: "🏠" },
];

export default function LostFoundPage() {
  const { customer } = useCustomer();
  const [, navigate] = useLocation();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/lost-found"] });

  const filtered = filter === "all" ? posts : posts.filter((p: any) => p.post_type === filter);

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("PATCH", `/api/lost-found/${id}/resolve`, {}); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      toast({ title: "İlan kapatıldı" });
    },
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-28 space-y-4">
      <SEO
        title="Samsun Kayıp / Bulundu / Sahiplendirme İlanları - Atakum | JETGO"
        description="Samsun Atakum, İlkadım, Canik bölgesinde kayıp kedi köpek, bulunan hayvan ve sahiplendirme ilanları. Ücretsiz ilan ver, evcil dostuna sahip çık."
        keywords="samsun kayıp kedi, samsun kayıp köpek, atakum sahiplendirme, samsun sahiplendirme, ilkadım kayıp hayvan, samsun bulundu hayvan, atakum yavru köpek sahiplendirme"
        canonical={`${SITE_DOMAIN}/kayip-bulundu`}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" data-testid="text-lost-found-title">🐾 Sahiplendirme & Kayıp</h1>
        {customer && (
          <Button size="sm" onClick={() => setShowAdd(true)} style={{ backgroundColor: "#6B3480" }} data-testid="btn-add-post">
            <Plus className="w-4 h-4 mr-1" /> İlan Ver
          </Button>
        )}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Kayıp Hayvan mı Gördünüz?</p>
          <p className="text-xs text-red-600">Aşağıdaki ilanları kontrol edin. Eşleşme varsa hemen iletişime geçin!</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {[{ key: "all", label: "Tümü" }, ...POST_TYPES.map(t => ({ key: t.id, label: t.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f.key ? "text-white" : "bg-muted/60 text-muted-foreground"}`} style={filter === f.key ? { backgroundColor: "#6B3480" } : {}} data-testid={`btn-filter-${f.key}`}>{f.label}</button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🐾</p>
          <p className="text-sm text-muted-foreground">Henüz ilan yok</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((post: any) => {
          const typeInfo = POST_TYPES.find(t => t.id === post.post_type);
          const isOwner = customer && post.customer_id === customer.id;
          return (
            <Card key={post.id} className={post.post_type === "lost" ? "border-red-200" : post.post_type === "adopt" ? "border-blue-200" : "border-green-200"} data-testid={`post-${post.id}`}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {post.photo_data ? (
                    <img src={post.photo_data} alt={post.pet_name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-3xl flex-shrink-0">
                      {post.pet_type === "kedi" ? "🐱" : post.pet_type === "kopek" ? "🐶" : "🐾"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm">{post.pet_name}</p>
                        <Badge className={`text-[10px] ${typeInfo?.color || ""}`}>{typeInfo?.emoji} {typeInfo?.label}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{post.pet_type}{post.breed ? ` • ${post.breed}` : ""}{post.color ? ` • ${post.color}` : ""}</p>
                    <p className="text-xs mt-1 line-clamp-2">{post.description}</p>
                    {post.last_seen_location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {post.last_seen_location}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <a href={`tel:${post.contact_phone}`} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-green-100 text-green-700" data-testid={`btn-call-${post.id}`}>
                        <Phone className="w-3 h-3" /> {post.contact_phone}
                      </a>
                      <a href={`https://wa.me/90${post.contact_phone.replace(/\D/g, "").replace(/^0+/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-700" data-testid={`btn-wa-${post.id}`}>
                        WhatsApp
                      </a>
                      {isOwner && (
                        <button onClick={() => resolveMutation.mutate(post.id)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600" data-testid={`btn-resolve-${post.id}`}>
                          <Check className="w-3 h-3" /> Kapat
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {post.customer_name && `${post.customer_name} • `}{new Date(post.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!customer && (
        <Card className="text-center py-4">
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">İlan vermek için giriş yapın</p>
            <Button onClick={() => navigate("/giris")} style={{ backgroundColor: "#6B3480" }} data-testid="btn-login-lf">Giriş Yap</Button>
          </CardContent>
        </Card>
      )}

      {showAdd && <AddPostDialog open={showAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddPostDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [postType, setPostType] = useState("lost");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("kedi");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/lost-found", { postType, petName, petType, breed: breed || null, color: color || null, lastSeenLocation: lastSeenLocation || null, description, contactPhone, photoData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      onClose();
      toast({ title: "İlan oluşturuldu" });
    },
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast({ title: "Maks. 3MB", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoData(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Yeni İlan Oluştur</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {POST_TYPES.map(t => (
              <button key={t.id} onClick={() => setPostType(t.id)} className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${postType === t.id ? "bg-[#6B3480] text-white" : "bg-muted text-muted-foreground"}`} data-testid={`btn-post-type-${t.id}`}>{t.emoji} {t.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Hayvan Adı *</Label><Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Pamuk" data-testid="input-lf-name" /></div>
            <div>
              <Label className="text-xs">Tür *</Label>
              <select value={petType} onChange={e => setPetType(e.target.value)} className="w-full h-9 rounded-md border px-2 text-sm" data-testid="select-lf-type">
                <option value="kedi">Kedi</option>
                <option value="kopek">Köpek</option>
                <option value="kus">Kuş</option>
                <option value="kemirgen">Kemirgen</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Cins</Label><Input value={breed} onChange={e => setBreed(e.target.value)} placeholder="British" data-testid="input-lf-breed" /></div>
            <div><Label className="text-xs">Renk</Label><Input value={color} onChange={e => setColor(e.target.value)} placeholder="Sarı-beyaz" data-testid="input-lf-color" /></div>
          </div>
          {postType === "lost" && (
            <div><Label className="text-xs">Son Görüldüğü Yer</Label><Input value={lastSeenLocation} onChange={e => setLastSeenLocation(e.target.value)} placeholder="Atakum Sahil" data-testid="input-lf-location" /></div>
          )}
          <div>
            <Label className="text-xs">Açıklama *</Label>
            <textarea className="w-full border rounded-md p-2 text-sm min-h-[60px] resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder={postType === "lost" ? "Kaybolma detayları..." : postType === "adopt" ? "Karakter, alışkanlıklar..." : "Bulunma detayları..."} data-testid="input-lf-desc" />
          </div>
          <div><Label className="text-xs">İletişim Telefonu *</Label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="05XX XXX XX XX" data-testid="input-lf-phone" /></div>
          <div>
            <Label className="text-xs">Fotoğraf</Label>
            <label className="flex items-center gap-2 mt-1 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{photoData ? "Fotoğraf seçildi ✓" : "Fotoğraf ekle"}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" data-testid="input-lf-photo" />
            </label>
          </div>
          <Button onClick={() => addMutation.mutate()} disabled={!petName || !description || !contactPhone || addMutation.isPending} className="w-full" style={{ backgroundColor: postType === "lost" ? "#dc2626" : "#6B3480" }} data-testid="btn-create-post">
            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : postType === "lost" ? "🔴 ACİL Kayıp İlanı Ver" : "İlan Oluştur"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
