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
import { productUrl, TESLIMAT_MAHALLELERI } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from "@/components/Logo";
import ProductImage from "@/components/ProductImage";

type TabKey = "profile" | "points" | "orders" | "favorites" | "addresses" | "pets" | "notifications" | "password";

const TABS: { key: TabKey; label: string; icon: any; emoji: string }[] = [
  { key: "profile", label: "Profilim", icon: User, emoji: "👤" },
  { key: "points", label: "Para Puanlarım", icon: Star, emoji: "⭐" },
  { key: "orders", label: "Siparişlerim", icon: Package, emoji: "📦" },
  { key: "favorites", label: "Favorilerim", icon: Heart, emoji: "❤️" },
  { key: "addresses", label: "Adreslerim", icon: Home, emoji: "🏠" },
  { key: "pets", label: "Evcil Hayvanlarım", icon: PawPrint, emoji: "🐾" },
  { key: "notifications", label: "Bildirimler", icon: Bell, emoji: "🔔" },
  { key: "password", label: "Şifre Değiştir", icon: Lock, emoji: "🔒" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  yeni: { label: "Bekliyor", color: "bg-blue-100 text-blue-700" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "bg-yellow-100 text-yellow-700" },
  onaylandi: { label: "Onaylandı", color: "bg-emerald-100 text-emerald-700" },
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
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && TABS.some(t => t.key === tab)) return tab as TabKey;
    return "profile";
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/giris?redirect=/hesabim");
    }
  }, [isLoading, isLoggedIn, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-8">
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

  const activeTabInfo = TABS.find(t => t.key === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 to-background pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-3 py-4 md:px-6 md:py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: "linear-gradient(135deg, #6B3480, #9b59b6)" }}>
              {customer?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-lg font-bold" data-testid="text-profile-title">
                {customer?.name || "Hesabım"}
              </h1>
              <p className="text-xs text-muted-foreground">+90 {customer?.phone}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl"
            onClick={handleLogout}
            data-testid="btn-profile-logout"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Çıkış
          </Button>
        </div>

        <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide" data-testid="tabs-profile">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "text-white border-transparent shadow-lg shadow-purple-200"
                    : "bg-white border-gray-100 text-gray-600 hover:border-purple-200 hover:text-purple-700 shadow-sm"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #6B3480, #9b59b6)" } : undefined}
                data-testid={`tab-${tab.key}`}
              >
                <span className="text-sm">{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="md:flex md:gap-6">
          <div className="hidden md:block md:w-56 md:flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1 sticky top-4" data-testid="tabs-profile-desktop">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? "text-white shadow-md shadow-purple-200"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                    style={isActive ? { background: "linear-gradient(135deg, #6B3480, #9b59b6)" } : undefined}
                    data-testid={`tab-${tab.key}`}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:flex-1 md:min-w-0">
            <div className="hidden md:flex items-center gap-2 mb-4">
              <span className="text-lg">{activeTabInfo?.emoji}</span>
              <h2 className="text-lg font-bold text-gray-800">{activeTabInfo?.label}</h2>
            </div>
            {activeTab === "profile" && <ProfileSection customer={customer!} updateProfile={updateProfile} toast={toast} />}
            {activeTab === "points" && <LoyaltyPointsSection />}
            {activeTab === "orders" && <OrdersSection />}
            {activeTab === "favorites" && <FavoritesSection />}
            {activeTab === "addresses" && <AddressesSection />}
            {activeTab === "pets" && <PetsSection />}
            {activeTab === "notifications" && <NotificationsSection customer={customer!} refetch={refetch} toast={toast} />}
            {activeTab === "password" && <PasswordSection toast={toast} />}
          </div>
        </div>
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
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base">Kişisel Bilgiler</h2>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEdit} className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50" data-testid="btn-profile-edit">
              <Edit2 className="w-4 h-4 mr-1" /> Düzenle
            </Button>
          )}
        </div>

        <div className="space-y-1.5 bg-gray-50 rounded-xl p-3">
          <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" /> Telefon
          </label>
          <p className="text-sm font-semibold" data-testid="text-profile-phone">+90 {customer.phone}</p>
        </div>

        {editing ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Ad Soyad
              </label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" data-testid="input-profile-name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> Adres
              </label>
              <Textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Teslimat adresiniz" rows={3} className="rounded-xl" data-testid="input-profile-address" />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={saving} className="flex-1 rounded-xl" style={{ background: "linear-gradient(135deg, #6B3480, #9b59b6)" }} data-testid="btn-profile-save">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Kaydet
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl" data-testid="btn-profile-cancel">Vazgeç</Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5 bg-gray-50 rounded-xl p-3">
              <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <User className="w-3.5 h-3.5" /> Ad Soyad
              </label>
              <p className="text-sm font-semibold" data-testid="text-profile-name">{customer.name}</p>
            </div>
            <div className="space-y-1.5 bg-gray-50 rounded-xl p-3">
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
          <Card key={order.id} className="rounded-2xl border-gray-100 shadow-sm" data-testid={`card-order-${order.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">#{order.id}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
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
        <Card key={product.id} className="rounded-2xl border-gray-100 shadow-sm" data-testid={`card-fav-${product.id}`}>
          <CardContent className="p-3 flex items-center gap-3">
            <Link href={productUrl(product.id, product.name)}>
              {product.img ? (
                <ProductImage src={product.img} alt={product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
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
  const [mahalle, setMahalle] = useState("");
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
    setMahalle("");
    setAddress("");
    setIsDefault(false);
  };

  const startEdit = (addr: any) => {
    setEditId(addr.id);
    setLabel(addr.label);
    const savedAddress = addr.address || "";
    const foundMahalle = TESLIMAT_MAHALLELERI.find(m => savedAddress.startsWith(m));
    if (foundMahalle) {
      setMahalle(foundMahalle);
      setAddress(savedAddress.replace(foundMahalle + ", ", "").replace(foundMahalle, "").trim());
    } else {
      setMahalle("");
      setAddress(savedAddress);
    }
    setIsDefault(addr.isDefault);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!label.trim()) {
      toast({ title: "Hata", description: "Etiket gerekli", variant: "destructive" });
      return;
    }
    if (!mahalle) {
      toast({ title: "Hata", description: "Mahalle seçimi gerekli", variant: "destructive" });
      return;
    }
    if (!address.trim()) {
      toast({ title: "Hata", description: "Adres detayı gerekli", variant: "destructive" });
      return;
    }
    const fullAddress = mahalle + ", " + address.trim();
    if (editId) {
      updateMutation.mutate({ id: editId, data: { label: label.trim(), address: fullAddress, isDefault } });
    } else {
      createMutation.mutate({ label: label.trim(), address: fullAddress, isDefault });
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
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Mahalle</label>
              <Select value={mahalle} onValueChange={setMahalle}>
                <SelectTrigger data-testid="select-address-mahalle">
                  <SelectValue placeholder="Mahalle seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {TESLIMAT_MAHALLELERI.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Sokak, cadde, bina no, daire no..." value={address} onChange={(e) => setAddress(e.target.value)} rows={3} data-testid="input-address-detail" />
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isDefault} onCheckedChange={setIsDefault} data-testid="switch-address-default" />
              Varsayılan adres olarak ayarla
            </label>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 rounded-xl"
                style={{ background: "linear-gradient(135deg, #6B3480, #9b59b6)" }}
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
          <Card key={addr.id} className="rounded-2xl border-gray-100 shadow-sm" data-testid={`card-address-${addr.id}`}>
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
                className="flex-1 rounded-xl"
                style={{ background: "linear-gradient(135deg, #6B3480, #9b59b6)" }}
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
            <Card key={pet.id} className="rounded-2xl border-gray-100 shadow-sm" data-testid={`card-pet-${pet.id}`}>
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
          className="w-full rounded-xl"
          style={{ background: "linear-gradient(135deg, #6B3480, #9b59b6)" }}
          data-testid="btn-change-password"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Lock className="w-4 h-4 mr-1" />}
          Şifreyi Değiştir
        </Button>
      </CardContent>
    </Card>
  );
}

function LoyaltyPointsSection() {
  const { data, isLoading } = useQuery<{ balance: number; history: any[] }>({
    queryKey: ["/api/customer/loyalty-points"],
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const balance = data?.balance || 0;
  const history = data?.history || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fef3e2" }}>
              <Star className="w-6 h-6" style={{ color: "#e65100" }} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Para Puanınız</p>
              <p className="text-2xl font-bold" style={{ color: "#e65100" }} data-testid="text-points-balance">
                {balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Her siparişinizde %5 Para Puan kazanırsınız. Biriken puanlarınız sonraki siparişlerinizde otomatik indirim olarak uygulanır.
          </p>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Puan Geçmişi</h3>
            <div className="space-y-3">
              {history.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0" data-testid={`points-history-${item.id}`}>
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: item.amount >= 0 ? "#2e7d32" : "#d32f2f" }}
                  >
                    {item.amount >= 0 ? "+" : ""}{item.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {history.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Star className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz puan kazanımınız yok.</p>
            <p className="text-xs text-muted-foreground mt-1">İlk siparişinizde %5 Para Puan kazanmaya başlayın!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
