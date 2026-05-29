import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCustomer } from "@/contexts/CustomerContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import {
  Plus, Trash2, Heart, Camera, Calendar, Weight, Syringe, Pill, ChevronLeft, ChevronRight,
  ShoppingBag, Edit, AlertTriangle, Dog, Cat, Bird, Loader2, X
} from "lucide-react";

const PET_TYPES = [
  { id: "kedi", label: "Kedi", icon: Cat, emoji: "🐱" },
  { id: "kopek", label: "Köpek", icon: Dog, emoji: "🐶" },
  { id: "kus", label: "Kuş", icon: Bird, emoji: "🐦" },
  { id: "kemirgen", label: "Kemirgen", emoji: "🐹" },
  { id: "balik", label: "Balık", emoji: "🐠" },
];

const HEALTH_RECORD_TYPES = [
  { id: "vaccine", label: "Aşı", icon: Syringe, color: "text-blue-600" },
  { id: "parasite", label: "Parazit Uygulaması", icon: Pill, color: "text-green-600" },
  { id: "checkup", label: "Kontrol", icon: Heart, color: "text-red-600" },
  { id: "other", label: "Diğer", icon: Calendar, color: "text-gray-600" },
];

export default function PetDashboard() {
  const { customer } = useCustomer();
  const [, navigate] = useLocation();
  const [activePetIndex, setActivePetIndex] = useState(0);
  const [showAddPet, setShowAddPet] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("profil");
  const { toast } = useToast();

  const { data: pets = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/pet-profiles"],
    enabled: !!customer,
  });

  const { data: purchaseHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/customer/purchase-history"],
    enabled: !!customer,
  });

  if (!customer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-6xl mb-4">🐾</p>
        <h2 className="text-xl font-bold mb-2">Özel Patiler</h2>
        <p className="text-muted-foreground mb-4">Pet profillerinizi görmek için giriş yapın.</p>
        <Button onClick={() => navigate("/giris")} style={{ backgroundColor: "#6B3480" }} data-testid="btn-login-pets">Giriş Yap</Button>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#6B3480]" /></div>;

  const activePet = pets[activePetIndex];
  const petType = PET_TYPES.find(t => t.id === activePet?.type);

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" data-testid="text-pet-dashboard-title">🐾 Özel Patiler</h1>
        <Button size="sm" variant="outline" onClick={() => setShowAddPet(true)} data-testid="btn-add-pet">
          <Plus className="w-4 h-4 mr-1" /> Pet Ekle
        </Button>
      </div>

      {pets.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-4xl mb-3">🐾</p>
            <p className="font-semibold mb-1">Henüz pet profiliniz yok</p>
            <p className="text-sm text-muted-foreground mb-3">İlk patili dostunuzu ekleyin!</p>
            <Button onClick={() => setShowAddPet(true)} style={{ backgroundColor: "#6B3480" }} data-testid="btn-first-pet">Pet Ekle</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {pets.length > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setActivePetIndex(Math.max(0, activePetIndex - 1))} disabled={activePetIndex === 0} className="p-1 rounded-full hover:bg-muted disabled:opacity-30" data-testid="btn-prev-pet"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex gap-1.5">
                {pets.map((_: any, i: number) => (
                  <button key={i} onClick={() => setActivePetIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activePetIndex ? "bg-[#6B3480]" : "bg-gray-300"}`} data-testid={`btn-pet-dot-${i}`} />
                ))}
              </div>
              <button onClick={() => setActivePetIndex(Math.min(pets.length - 1, activePetIndex + 1))} disabled={activePetIndex === pets.length - 1} className="p-1 rounded-full hover:bg-muted disabled:opacity-30" data-testid="btn-next-pet"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}

          {activePet && (
            <>
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-[#6B3480] to-[#9B59B6] p-4 text-white">
                  <div className="flex items-center gap-3">
                    {activePet.photo_data ? (
                      <img src={activePet.photo_data} alt={activePet.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">{petType?.emoji || "🐾"}</div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-lg font-bold" data-testid="text-pet-name">{activePet.name}</h2>
                      <p className="text-sm opacity-90">{petType?.label || activePet.type} {activePet.breed ? `• ${activePet.breed}` : ""}</p>
                      {activePet.birthday && <p className="text-xs opacity-75">🎂 {activePet.birthday}</p>}
                      {activePet.weight && <p className="text-xs opacity-75">⚖️ {activePet.weight} kg</p>}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {[
                  { key: "profil", label: "Profil" },
                  { key: "saglik", label: "Sağlık" },
                  { key: "beslenme", label: "Beslenme" },
                  { key: "galeri", label: "Galeri" },
                  { key: "kilo", label: "Kilo" },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === t.key ? "text-white" : "bg-muted/60 text-muted-foreground"}`} style={activeTab === t.key ? { backgroundColor: "#6B3480" } : {}} data-testid={`btn-pet-tab-${t.key}`}>{t.label}</button>
                ))}
              </div>

              {activeTab === "profil" && <PetProfileTab pet={activePet} />}
              {activeTab === "saglik" && <HealthTab petId={activePet.id} />}
              {activeTab === "beslenme" && <NutritionTab petId={activePet.id} petName={activePet.name} purchaseHistory={purchaseHistory} />}
              {activeTab === "galeri" && <GalleryTab petId={activePet.id} />}
              {activeTab === "kilo" && <WeightTab petId={activePet.id} petName={activePet.name} />}
            </>
          )}
        </>
      )}

      {showAddPet && <AddPetDialog open={showAddPet} onClose={() => setShowAddPet(false)} />}
    </div>
  );
}

function PetProfileTab({ pet }: { pet: any }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed || "");
  const [birthday, setBirthday] = useState(pet.birthday || "");
  const [weight, setWeight] = useState(pet.weight?.toString() || "");
  const [notes, setNotes] = useState(pet.notes || "");
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/customer/pet-profiles/${pet.id}`, { name, breed: breed || null, birthday: birthday || null, weight: weight ? parseFloat(weight) : null, notes: notes || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles"] });
      setEditing(false);
      toast({ title: "Profil güncellendi" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { await apiRequest("DELETE", `/api/customer/pet-profiles/${pet.id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles"] });
      toast({ title: "Pet profili silindi" });
    },
  });

  if (!editing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between">
            <h3 className="font-semibold">Profil Bilgileri</h3>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} data-testid="btn-edit-pet"><Edit className="w-4 h-4" /></Button>
          </div>
          {pet.breed && <p className="text-sm"><span className="text-muted-foreground">Cins:</span> {pet.breed}</p>}
          {pet.birthday && <p className="text-sm"><span className="text-muted-foreground">Doğum:</span> {pet.birthday}</p>}
          {pet.weight && <p className="text-sm"><span className="text-muted-foreground">Kilo:</span> {pet.weight} kg</p>}
          {pet.notes && <p className="text-sm"><span className="text-muted-foreground">Not:</span> {pet.notes}</p>}
          <Button size="sm" variant="destructive" className="mt-2" onClick={() => { if (confirm("Bu pet profili silinecek. Emin misiniz?")) deleteMutation.mutate(); }} data-testid="btn-delete-pet"><Trash2 className="w-3 h-3 mr-1" /> Profili Sil</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div><Label className="text-xs">İsim</Label><Input value={name} onChange={e => setName(e.target.value)} data-testid="input-pet-name" /></div>
        <div><Label className="text-xs">Cins</Label><Input value={breed} onChange={e => setBreed(e.target.value)} placeholder="British Shorthair" data-testid="input-pet-breed" /></div>
        <div><Label className="text-xs">Doğum Tarihi</Label><Input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} data-testid="input-pet-birthday" /></div>
        <div><Label className="text-xs">Kilo (kg)</Label><Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} data-testid="input-pet-weight" /></div>
        <div><Label className="text-xs">Not</Label><Input value={notes} onChange={e => setNotes(e.target.value)} data-testid="input-pet-notes" /></div>
        <div className="flex gap-2">
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="flex-1" style={{ backgroundColor: "#6B3480" }} data-testid="btn-save-pet">{updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}</Button>
          <Button variant="outline" onClick={() => setEditing(false)}>İptal</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthTab({ petId }: { petId: number }) {
  const [showAdd, setShowAdd] = useState(false);
  const [recordType, setRecordType] = useState("vaccine");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const { toast } = useToast();

  const { data: records = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/pet-profiles", petId, "health"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/customer/pet-profiles/${petId}/health`, { recordType, title, date, notes: notes || null, nextDate: nextDate || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles", petId, "health"] });
      setShowAdd(false);
      setTitle(""); setDate(""); setNotes(""); setNextDate("");
      toast({ title: "Sağlık kaydı eklendi" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/customer/pet-health/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles", petId, "health"] });
      toast({ title: "Kayıt silindi" });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">🏥 Sağlık Karnesi</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} data-testid="btn-add-health"><Plus className="w-4 h-4 mr-1" /> Kayıt Ekle</Button>
      </div>

      {showAdd && (
        <Card className="border-blue-200">
          <CardContent className="p-3 space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              {HEALTH_RECORD_TYPES.map(t => (
                <button key={t.id} onClick={() => setRecordType(t.id)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${recordType === t.id ? "bg-[#6B3480] text-white" : "bg-muted text-muted-foreground"}`} data-testid={`btn-health-type-${t.id}`}>{t.label}</button>
              ))}
            </div>
            <Input placeholder="Başlık (ör: Kuduz Aşısı)" value={title} onChange={e => setTitle(e.target.value)} data-testid="input-health-title" />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="input-health-date" />
            <Input placeholder="Not (opsiyonel)" value={notes} onChange={e => setNotes(e.target.value)} data-testid="input-health-notes" />
            <Input type="date" placeholder="Sonraki tarih" value={nextDate} onChange={e => setNextDate(e.target.value)} data-testid="input-health-next" />
            <Button onClick={() => addMutation.mutate()} disabled={!title || !date || addMutation.isPending} className="w-full" style={{ backgroundColor: "#6B3480" }} data-testid="btn-save-health">{addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>}

      {records.length === 0 && !isLoading && <p className="text-sm text-muted-foreground text-center py-4">Henüz sağlık kaydı yok</p>}

      {records.map((r: any) => {
        const type = HEALTH_RECORD_TYPES.find(t => t.id === r.record_type);
        const isUpcoming = r.next_date && new Date(r.next_date) > new Date();
        return (
          <Card key={r.id} className={r.next_date && new Date(r.next_date) <= new Date() ? "border-orange-200" : ""}>
            <CardContent className="p-3 flex items-start gap-3">
              <div className={`text-lg ${type?.color || ""}`}>{type?.id === "vaccine" ? "💉" : type?.id === "parasite" ? "💊" : type?.id === "checkup" ? "❤️" : "📋"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
                {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
                {r.next_date && (
                  <Badge variant={isUpcoming ? "secondary" : "destructive"} className="mt-1 text-[10px]">
                    {isUpcoming ? "Sonraki: " : "⚠️ Gecikmiş: "}{r.next_date}
                  </Badge>
                )}
              </div>
              <button onClick={() => deleteMutation.mutate(r.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function NutritionTab({ petId, petName, purchaseHistory }: { petId: number; petName: string; purchaseHistory: any[] }) {
  const { updateQty } = useCart();
  const { data: products = [] } = useQuery<any[]>({ queryKey: ["/api/products"] });
  const { toast } = useToast();

  const recentFoods = useMemo(() => {
    return purchaseHistory
      .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())
      .slice(0, 10);
  }, [purchaseHistory]);

  const handleReorder = (item: any) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const blocked = updateQty(String(product.id), 1);
      if (!blocked) {
        toast({ title: `${product.name} sepete eklendi` });
      }
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">🍽️ {petName}'in Beslenme Geçmişi</h3>
      {recentFoods.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Henüz satın alma geçmişi yok</p>
      ) : (
        recentFoods.map((item: any) => (
          <Card key={item.productId}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Son alım: {new Date(item.lastDate).toLocaleDateString("tr-TR")} • {item.count}x sipariş</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleReorder(item)} data-testid={`btn-reorder-${item.productId}`}>
                <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Tekrarla
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function GalleryTab({ petId }: { petId: number }) {
  const [showAdd, setShowAdd] = useState(false);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();

  const { data: photos = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/pet-profiles", petId, "photos"],
  });

  const addMutation = useMutation({
    mutationFn: async (photoData: string) => {
      await apiRequest("POST", `/api/customer/pet-profiles/${petId}/photos`, { photoData, caption: caption || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles", petId, "photos"] });
      setShowAdd(false);
      setCaption("");
      toast({ title: "Fotoğraf eklendi" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/customer/pet-photos/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles", petId, "photos"] });
      toast({ title: "Fotoğraf silindi" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Dosya çok büyük", description: "Maks. 3MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => addMutation.mutate(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">📸 Fotoğraf Galerisi</h3>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" data-testid="input-pet-photo" />
          <Button size="sm" variant="outline" asChild><span><Camera className="w-4 h-4 mr-1" /> Ekle</span></Button>
        </label>
      </div>

      {isLoading && <Loader2 className="w-5 h-5 animate-spin mx-auto" />}

      {photos.length === 0 && !isLoading && <p className="text-sm text-muted-foreground text-center py-4">Henüz fotoğraf yok</p>}

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo: any) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden">
            <img src={photo.photo_data} alt={photo.caption || ""} className="w-full h-full object-cover" />
            <button onClick={() => deleteMutation.mutate(photo.id)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`btn-delete-photo-${photo.id}`}><X className="w-3 h-3" /></button>
            {photo.caption && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">{photo.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeightTab({ petId, petName }: { petId: number; petName: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { toast } = useToast();

  const { data: logs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/pet-profiles", petId, "weight"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/customer/pet-profiles/${petId}/weight`, { weight: parseFloat(weight), date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles", petId, "weight"] });
      setShowAdd(false);
      setWeight("");
      toast({ title: "Kilo kaydı eklendi" });
    },
  });

  const maxWeight = Math.max(...logs.map((l: any) => l.weight), 1);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">⚖️ {petName}'in Kilo Takibi</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} data-testid="btn-add-weight"><Plus className="w-4 h-4 mr-1" /> Ekle</Button>
      </div>

      {showAdd && (
        <Card className="border-green-200">
          <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Kilo (kg)</Label><Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} data-testid="input-weight-value" /></div>
              <div><Label className="text-xs">Tarih</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="input-weight-date" /></div>
            </div>
            <Button onClick={() => addMutation.mutate()} disabled={!weight || addMutation.isPending} className="w-full" style={{ backgroundColor: "#6B3480" }} data-testid="btn-save-weight">{addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading && <Loader2 className="w-5 h-5 animate-spin mx-auto" />}

      {logs.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-1.5">
              {logs.slice(0, 12).map((log: any, i: number) => {
                const pct = (log.weight / maxWeight) * 100;
                const prevLog = logs[i + 1];
                const diff = prevLog ? (log.weight - prevLog.weight).toFixed(1) : null;
                return (
                  <div key={log.id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground">{log.date}</span>
                      <span className="font-semibold">{log.weight} kg {diff && <span className={parseFloat(diff) > 0 ? "text-red-500" : "text-green-500"}>({parseFloat(diff) > 0 ? "+" : ""}{diff})</span>}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-[#6B3480] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 && !isLoading && <p className="text-sm text-muted-foreground text-center py-4">Henüz kilo kaydı yok</p>}
    </div>
  );
}

function AddPetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("kedi");
  const [breed, setBreed] = useState("");
  const [birthday, setBirthday] = useState("");
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/customer/pet-profiles", { name, type, breed: breed || null, birthday: birthday || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pet-profiles"] });
      onClose();
      toast({ title: `${name} eklendi! 🐾` });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Yeni Pet Ekle 🐾</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PET_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${type === t.id ? "bg-[#6B3480] text-white" : "bg-muted text-muted-foreground"}`} data-testid={`btn-pet-type-${t.id}`}>{t.emoji} {t.label}</button>
            ))}
          </div>
          <div><Label className="text-xs">İsim *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Pamuk" data-testid="input-new-pet-name" /></div>
          <div><Label className="text-xs">Cins</Label><Input value={breed} onChange={e => setBreed(e.target.value)} placeholder="British Shorthair" data-testid="input-new-pet-breed" /></div>
          <div><Label className="text-xs">Doğum Tarihi</Label><Input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} data-testid="input-new-pet-birthday" /></div>
          <Button onClick={() => addMutation.mutate()} disabled={!name || addMutation.isPending} className="w-full" style={{ backgroundColor: "#6B3480" }} data-testid="btn-create-pet">{addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `${name || "Pet"}'i Ekle`}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
