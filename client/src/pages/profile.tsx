import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  User, Phone, MapPin, LogOut, Loader2, Check, Edit2,
  Package, Heart, Home, PawPrint, Bell, Lock,
  Plus, Trash2, Star, ChevronRight, Eye, EyeOff,
  ShoppingCart
} from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { productUrl } from "@/lib/data";
import jet55Logo from "@assets/Ekran_görüntüsü_2026-02-24_020948_1771888203864.png";

type TabKey = "profile" | "orders" | "favorites" | "addresses" | "pets" | "notifications" | "password";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "profile", label: "Profilim", icon: User },
  { key: "orders", label: "Siparişlerim", icon: Package },
  { key: "favorites", label: "Favorilerim", icon: Heart },
  { key: "addresses", label: "Adreslerim", icon: Home },
  { key: "pets", label: "Evcil Hayvanlarım", icon: PawPrint },
  { key: "notifications", label: "Bildirimler", icon: Bell },
  { key: "password", label: "Şifre Değiştir", icon: Lock },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  yeni: { label: "Yeni", color: "bg-blue-100 text-blue-700" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-700" },
  tamamlandi: { label: "Tamamlandı", color: "bg-green-100 text-green-700" },
  iptal: { label: "İptal", color: "bg-red-100 text-red-700" },
};

const PET_TYPES = [
  { value: "kopek", label: "Kopek" },
  { value: "kedi", label: "Kedi" },
  { value: "kus", label: "Kus" },
  { value: "kemirgen", label: "Kemirgen" },
];

export default function ProfilePage() {
  const { customer, isLoggedIn, isLoading, logout, updateProfile, refetch } = useCustomer();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/giris");
    }
  }, [isLoading, isLoggedIn, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    await logout();
    toast({ title: "Çıkış yapıldı" });
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#6B3480" }}>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center">
          <Link href="/">
            <img src={jet55Logo} alt="JET55" className="h-10 object-contain cursor-pointer" data-testid="img-profile-logo" />
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold" data-testid="text-profile-title">Hesabım</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={handleLogout}
            data-testid="btn-profile-logout"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Çıkış
          </Button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide" data-testid="tabs-profile">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={isActive ? { backgroundColor: "#6B3480" } : undefined}
                data-testid={`tab-${tab.key}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "profile" && <ProfileSection customer={customer!} updateProfile={updateProfile} toast={toast} />}
        {activeTab === "orders" && <OrdersSection />}
        {activeTab === "favorites" && <FavoritesSection />}
        {activeTab === "addresses" && <AddressesSection />}
        {activeTab === "pets" && <PetsSection />}
        {activeTab === "notifications" && <NotificationsSection customer={customer!} refetch={refetch} toast={toast} />}
        {activeTab === "password" && <PasswordSection toast={toast} />}
      </div>
    </div>
  );
}

function ProfileSection({ customer, updateProfile, toast }: { customer: any; updateProfile: any; toast: any }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setEditName(customer.name || "");
    setEditAddress(customer.address || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      toast({ title: "Hata", description: "Ad soyad boş bırakılamaz", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: editName.trim(), address: editAddress.trim() });
      setEditing(false);
      toast({ title: "Bilgiler güncellendi" });
    } catch {
      toast({ title: "Hata", description: "Bilgiler güncellenemedi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Kişisel Bilgiler</h2>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={startEdit} data-testid="btn-profile-edit">
              <Edit2 className="w-4 h-4 mr-1" /> Düzenle
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" /> Telefon
          </label>
          <p className="text-sm font-medium" data-testid="text-profile-phone">+90 {customer.phone}</p>
        </div>

        {editing ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Ad Soyad
              </label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} data-testid="input-profile-name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> Adres
              </label>
              <Textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Teslimat adresiniz" rows={3} data-testid="input-profile-address" />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={saving} className="flex-1" style={{ backgroundColor: "#6B3480" }} data-testid="btn-profile-save">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Kaydet
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} data-testid="btn-profile-cancel">Vazgeç</Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Ad Soyad
              </label>
              <p className="text-sm font-medium" data-testid="text-profile-name">{customer.name}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> Adres
              </label>
              <p className="text-sm" data-testid="text-profile-address">
                {customer.address || <span className="text-muted-foreground italic">Henüz adres eklenmemiş</span>}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OrdersSection() {
  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/orders"],
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Henüz siparişiniz yok</p>
        <Link href="/">
          <Button variant="outline" className="mt-4" data-testid="btn-browse-orders">Alışverişe Başla</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order: any) => {
        const status = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
        const date = new Date(order.createdAt);
        return (
          <Card key={order.id} data-testid={`card-order-${order.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">#{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {date.toLocaleDateString("tr-TR")}
                </span>
              </div>
              <div className="space-y-1">
                {order.items.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="truncate flex-1">{item.quantity}x {item.name}</span>
                    <span className="font-medium ml-2">{(item.price * item.quantity).toFixed(0)} TL</span>
                  </div>
                ))}
                {order.items.length > 3 && <p className="text-xs text-muted-foreground">+{order.items.length - 3} ürün daha</p>}
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t">
                <span className="text-xs text-muted-foreground">{order.paymentMethod === "credit_card" ? "Kredi Kartı" : order.paymentMethod === "cash" ? "Kapıda Nakit" : order.paymentMethod}</span>
                <span className="text-sm font-bold">{order.grandTotal.toFixed(0)} TL</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FavoritesSection() {
  const { data: favoriteIds, isLoading } = useQuery<number[]>({
    queryKey: ["/api/customer/favorites"],
  });

  const { data: allProducts } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/customer/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/favorites"] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const favoriteProducts = allProducts?.filter(p => favoriteIds?.includes(p.id)) || [];

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Henüz favori ürününüz yok</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">Ürünlere Göz At</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favoriteProducts.map((product: any) => (
        <Card key={product.id} data-testid={`card-fav-${product.id}`}>
          <CardContent className="p-3 flex items-center gap-3">
            <Link href={productUrl(product.id, product.name)}>
              {product.img ? (
                <img src={product.img} alt={product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={productUrl(product.id, product.name)}>
                <p className="text-sm font-semibold truncate cursor-pointer">{product.name}</p>
              </Link>
              <p className="text-sm font-bold mt-0.5" style={{ color: "#6B3480" }}>{product.price} TL</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 h-8 w-8 p-0 flex-shrink-0"
              onClick={() => removeMutation.mutate(product.id)}
              disabled={removeMutation.isPending}
              data-testid={`btn-remove-fav-${product.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AddressesSection() {
  const { data: addresses, isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/addresses"],
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: { label: string; address: string; isDefault: boolean }) => {
      await apiRequest("POST", "/api/customer/addresses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/addresses"] });
      resetForm();
      toast({ title: "Adres eklendi" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/customer/addresses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/addresses"] });
      resetForm();
      toast({ title: "Adres güncellendi" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customer/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/addresses"] });
      toast({ title: "Adres silindi" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/customer/addresses/${id}`, { isDefault: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/addresses"] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setLabel("");
    setAddress("");
    setIsDefault(false);
  };

  const startEdit = (addr: any) => {
    setEditId(addr.id);
    setLabel(addr.label);
    setAddress(addr.address);
    setIsDefault(addr.isDefault);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!label.trim() || !address.trim()) {
      toast({ title: "Hata", description: "Etiket ve adres gerekli", variant: "destructive" });
      return;
    }
    if (editId) {
      updateMutation.mutate({ id: editId, data: { label: label.trim(), address: address.trim(), isDefault } });
    } else {
      createMutation.mutate({ label: label.trim(), address: address.trim(), isDefault });
    }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      {!showForm && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => { resetForm(); setShowForm(true); }}
          data-testid="btn-add-address"
        >
          <Plus className="w-4 h-4 mr-1" /> Yeni Adres Ekle
        </Button>
      )}

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">{editId ? "Adresi Düzenle" : "Yeni Adres"}</h3>
            <Input placeholder="Etiket (Ev, İş vb.)" value={label} onChange={(e) => setLabel(e.target.value)} data-testid="input-address-label" />
            <Textarea placeholder="Adres detayı" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} data-testid="input-address-detail" />
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isDefault} onCheckedChange={setIsDefault} data-testid="switch-address-default" />
              Varsayılan adres olarak ayarla
            </label>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
                style={{ backgroundColor: "#6B3480" }}
                data-testid="btn-save-address"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Kaydet
              </Button>
              <Button variant="outline" onClick={resetForm}>Vazgeç</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {addresses && addresses.length > 0 ? (
        addresses.map((addr: any) => (
          <Card key={addr.id} data-testid={`card-address-${addr.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{addr.label}</span>
                    {addr.isDefault && <Badge variant="secondary" className="text-xs">Varsayılan</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.address}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!addr.isDefault && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDefaultMutation.mutate(addr.id)} data-testid={`btn-setdefault-${addr.id}`}>
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(addr)} data-testid={`btn-edit-address-${addr.id}`}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => deleteMutation.mutate(addr.id)} data-testid={`btn-delete-address-${addr.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : !showForm ? (
        <div className="text-center py-8">
          <Home className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Kayıtlı adresiniz yok</p>
        </div>
      ) : null}
    </div>
  );
}

function PetsSection() {
  const { data: pets, isLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/pets"],
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("kopek");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/customer/pets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pets"] });
      resetForm();
      toast({ title: "Evcil hayvan eklendi" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/customer/pets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pets"] });
      resetForm();
      toast({ title: "Bilgiler güncellendi" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customer/pets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/pets"] });
      toast({ title: "Evcil hayvan silindi" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setPetName("");
    setPetType("kopek");
    setBreed("");
    setAge("");
    setWeight("");
  };

  const startEdit = (pet: any) => {
    setEditId(pet.id);
    setPetName(pet.name);
    setPetType(pet.type);
    setBreed(pet.breed || "");
    setAge(pet.age?.toString() || "");
    setWeight(pet.weight?.toString() || "");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!petName.trim() || !petType) {
      toast({ title: "Hata", description: "İsim ve tür gerekli", variant: "destructive" });
      return;
    }
    const data: any = { name: petName.trim(), type: petType };
    if (breed.trim()) data.breed = breed.trim();
    if (age) data.age = parseInt(age);
    if (weight) data.weight = parseFloat(weight);

    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      {!showForm && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => { resetForm(); setShowForm(true); }}
          data-testid="btn-add-pet"
        >
          <Plus className="w-4 h-4 mr-1" /> Evcil Hayvan Ekle
        </Button>
      )}

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">{editId ? "Düzenle" : "Yeni Evcil Hayvan"}</h3>
            <Input placeholder="İsim" value={petName} onChange={(e) => setPetName(e.target.value)} data-testid="input-pet-name" />
            <div className="grid grid-cols-4 gap-2">
              {PET_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setPetType(pt.value)}
                  className={`p-2 rounded-lg border text-center text-xs font-medium transition-colors ${
                    petType === pt.value ? "border-purple-400 bg-purple-50" : "border-muted hover:border-muted-foreground/30"
                  }`}
                  data-testid={`btn-pet-type-${pt.value}`}
                >
                  <PawPrint className="w-5 h-5 mx-auto mb-0.5 text-muted-foreground" />
                  {pt.label}
                </button>
              ))}
            </div>
            <Input placeholder="Irk (opsiyonel)" value={breed} onChange={(e) => setBreed(e.target.value)} data-testid="input-pet-breed" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Yaş" type="number" value={age} onChange={(e) => setAge(e.target.value)} data-testid="input-pet-age" />
              <Input placeholder="Kilo (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} data-testid="input-pet-weight" />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
                style={{ backgroundColor: "#6B3480" }}
                data-testid="btn-save-pet"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Kaydet
              </Button>
              <Button variant="outline" onClick={resetForm}>Vazgeç</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pets && pets.length > 0 ? (
        pets.map((pet: any) => {
          const petTypeInfo = PET_TYPES.find((pt) => pt.value === pet.type);
          return (
            <Card key={pet.id} data-testid={`card-pet-${pet.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <PawPrint className="w-5 h-5" style={{ color: "#6B3480" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {petTypeInfo?.label || pet.type}
                        {pet.breed ? ` · ${pet.breed}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pet.age ? `${pet.age} yaş` : ""}
                        {pet.age && pet.weight ? " · " : ""}
                        {pet.weight ? `${pet.weight} kg` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(pet)} data-testid={`btn-edit-pet-${pet.id}`}>
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => deleteMutation.mutate(pet.id)} data-testid={`btn-delete-pet-${pet.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : !showForm ? (
        <div className="text-center py-8">
          <PawPrint className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Henüz evcil hayvan eklenmemiş</p>
        </div>
      ) : null}
    </div>
  );
}

function NotificationsSection({ customer, refetch, toast }: { customer: any; refetch: any; toast: any }) {
  const [notifyStock, setNotifyStock] = useState(customer.notifyStock ?? true);
  const [notifyCampaign, setNotifyCampaign] = useState(customer.notifyCampaign ?? true);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    if (key === "stock") setNotifyStock(value);
    if (key === "campaign") setNotifyCampaign(value);
    setSaving(true);
    try {
      await apiRequest("PATCH", "/api/customer/preferences", {
        notifyStock: key === "stock" ? value : notifyStock,
        notifyCampaign: key === "campaign" ? value : notifyCampaign,
      });
      await refetch();
      toast({ title: "Tercihler güncellendi" });
    } catch {
      toast({ title: "Hata", description: "Tercihler güncellenemedi", variant: "destructive" });
      if (key === "stock") setNotifyStock(!value);
      if (key === "campaign") setNotifyCampaign(!value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h2 className="font-semibold">Bildirim Tercihleri</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Stok Bildirimleri</p>
            <p className="text-xs text-muted-foreground">İstediğiniz ürün stoğa girince haber verin</p>
          </div>
          <Switch
            checked={notifyStock}
            onCheckedChange={(v) => handleToggle("stock", v)}
            disabled={saving}
            data-testid="switch-notify-stock"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Kampanya Bildirimleri</p>
            <p className="text-xs text-muted-foreground">İndirim ve kampanyalardan haberdar olun</p>
          </div>
          <Switch
            checked={notifyCampaign}
            onCheckedChange={(v) => handleToggle("campaign", v)}
            disabled={saving}
            data-testid="switch-notify-campaign"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PasswordSection({ toast }: { toast: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Hata", description: "Tüm alanları doldurun", variant: "destructive" });
      return;
    }
    if (newPassword.length < 4) {
      toast({ title: "Hata", description: "Yeni şifre en az 4 karakter olmalı", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await apiRequest("PATCH", "/api/customer/password", { currentPassword, newPassword });
      const data = await res.json();
      toast({ title: data.message || "Şifre değiştirildi" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      const msg = e?.message || "Şifre değiştirilemedi";
      toast({ title: "Hata", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="font-semibold">Şifre Değiştir</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mevcut Şifre</label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              data-testid="input-current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Yeni Şifre</label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-testid="input-new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Yeni Şifre (Tekrar)</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            data-testid="input-confirm-password"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full"
          style={{ backgroundColor: "#6B3480" }}
          data-testid="btn-change-password"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Lock className="w-4 h-4 mr-1" />}
          Şifreyi Değiştir
        </Button>
      </CardContent>
    </Card>
  );
}
