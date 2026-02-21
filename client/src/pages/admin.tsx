import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackNavigation from "@/components/BackNavigation";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Dog,
  Cat,
  Bird,
  Rabbit,
  AlertTriangle,
  Star,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, BrandCategory, CrossSellSection, CrossSellItem, Order, BreedStat } from "@shared/schema";

const ANIMALS = [
  { id: "kedi", name: "Kedi", icon: Cat },
  { id: "kopek", name: "Köpek", icon: Dog },
  { id: "kus", name: "Kuş", icon: Bird },
  { id: "kemirgen", name: "Kemirgen", icon: Rabbit },
];

const SUBCATEGORIES: Record<string, { slug: string; name: string }[]> = {
  kedi: [
    { slug: "kedi-mamasi", name: "Kedi Maması" },
    { slug: "kedi-kumu", name: "Kedi Kumu" },
    { slug: "kedi-malti", name: "Kedi Maltı" },
    { slug: "kedi-odulu", name: "Kedi Ödülleri" },
    { slug: "kedi-bakim-saglik", name: "Bakım ve Aksesuar" },
    { slug: "kedi-tasima", name: "Kedi Taşıma" },
    { slug: "kedi-tuvaleti", name: "Kedi Tuvaleti" },
    { slug: "kedi-konserve", name: "Kedi Yaş Maması" },
    { slug: "uygun-cuval", name: "Uygun Çuval Mamalar" },
  ],
  kopek: [
    { slug: "mama-markalari", name: "Mama Markaları" },
    { slug: "acik-mama", name: "Açık Mama" },
    { slug: "tuvalet-malzemeleri", name: "Tuvalet Malzemeleri" },
    { slug: "yas-mama", name: "Yaş Mama" },
    { slug: "odul-kemik", name: "Ödül Kemik" },
    { slug: "tasima-kulube", name: "Taşıma ve Kulübeler" },
    { slug: "bakim-saglik", name: "Bakım ve Sağlık" },
    { slug: "uygun-cuval", name: "Uygun Çuval Mamalar" },
  ],
  kus: [
    { slug: "kus-yemi", name: "Kuş Yemi" },
    { slug: "kus-kafesi", name: "Kuş Kafesi" },
    { slug: "kus-vitamin", name: "Kuş Vitaminleri" },
    { slug: "bakim-aksesuar", name: "Bakım ve Aksesuar" },
  ],
  kemirgen: [
    { slug: "kemirgen-yemi", name: "Kemirgen Yemleri" },
    { slug: "kemirgen-kafesi", name: "Kemirgen Kafesleri" },
    { slug: "bakim-aksesuar", name: "Bakım ve Aksesuar" },
    { slug: "vitamin-takviye", name: "Vitamin ve Takviye" },
  ],
};

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/login", { username, password });
    },
    onSuccess: () => {
      onLogin();
    },
    onError: () => {
      setError("Kullanıcı adı veya şifre hatalı");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle data-testid="text-admin-login-title">Admin Paneli</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" data-testid="text-login-error">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="btn-admin-login"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductForm({
  categories,
  product,
  onSave,
  isPending,
}: {
  categories: BrandCategory[];
  product?: Product;
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const existingCat = product
    ? categories.find((c) => c.id === product.brandCategoryId)
    : null;

  const [selectedAnimal, setSelectedAnimal] = useState(existingCat?.animal || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(existingCat?.subcategory || "");
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() || "");
  const [skt, setSkt] = useState(product?.skt || "");
  const [img, setImg] = useState(product?.img || "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "10");
  const [brandCategoryId, setBrandCategoryId] = useState(
    product?.brandCategoryId?.toString() || ""
  );

  const availableSubcategories = SUBCATEGORIES[selectedAnimal] || [];

  const filteredCategories = categories.filter(
    (c) => c.animal === selectedAnimal && c.subcategory === selectedSubcategory
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          skt: skt || null,
          img: img || null,
          brandCategoryId: parseInt(brandCategoryId),
          stock: parseInt(stock) || 0,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Ana Kategori</Label>
          <Select
            value={selectedAnimal}
            onValueChange={(val) => {
              setSelectedAnimal(val);
              setSelectedSubcategory("");
              setBrandCategoryId("");
            }}
          >
            <SelectTrigger data-testid="select-animal">
              <SelectValue placeholder="Hayvan seçin" />
            </SelectTrigger>
            <SelectContent>
              {ANIMALS.map((a) => (
                <SelectItem key={a.id} value={a.id} data-testid={`option-animal-${a.id}`}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Alt Kategori</Label>
          <Select
            value={selectedSubcategory}
            onValueChange={(val) => {
              setSelectedSubcategory(val);
              setBrandCategoryId("");
            }}
            disabled={!selectedAnimal}
          >
            <SelectTrigger data-testid="select-subcategory">
              <SelectValue placeholder="Alt kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((sc) => (
                <SelectItem key={sc.slug} value={sc.slug} data-testid={`option-subcategory-${sc.slug}`}>
                  {sc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Marka</Label>
        <Select
          value={brandCategoryId}
          onValueChange={setBrandCategoryId}
          disabled={!selectedSubcategory}
        >
          <SelectTrigger data-testid="select-brand-category">
            <SelectValue placeholder={filteredCategories.length === 0 ? "Bu alt kategoride marka yok" : "Marka seçin"} />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} data-testid={`option-category-${c.id}`}>
                {c.brandName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSubcategory && filteredCategories.length === 0 && (
          <p className="text-xs text-muted-foreground">Bu alt kategoride henüz marka eklenmemiş</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Ürün Adı</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-product-name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Fiyat (TL)</Label>
          <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required data-testid="input-product-price" />
        </div>
        <div className="space-y-2">
          <Label>Eski Fiyat (TL)</Label>
          <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} data-testid="input-product-original-price" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>SKT</Label>
          <Input value={skt} onChange={(e) => setSkt(e.target.value)} placeholder="03.2027" data-testid="input-product-skt" />
        </div>
        <div className="space-y-2">
          <Label>Stok</Label>
          <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} data-testid="input-product-stock" />
        </div>
        <div className="space-y-2">
          <Label>Görsel URL</Label>
          <Input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://..." data-testid="input-product-img" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !brandCategoryId} data-testid="btn-save-product">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : product ? "Güncelle" : "Ekle"}
      </Button>
    </form>
  );
}

function CategoryForm({
  onSave,
  isPending,
}: {
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [animal, setAnimal] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const availableSubcategories = SUBCATEGORIES[animal] || [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const slug = brandSlug || brandName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        onSave({ brandName, brandSlug: slug, animal, subcategory });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Ana Kategori</Label>
          <Select value={animal} onValueChange={(val) => { setAnimal(val); setSubcategory(""); }}>
            <SelectTrigger data-testid="input-category-animal">
              <SelectValue placeholder="Hayvan seçin" />
            </SelectTrigger>
            <SelectContent>
              {ANIMALS.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Alt Kategori</Label>
          <Select value={subcategory} onValueChange={setSubcategory} disabled={!animal}>
            <SelectTrigger data-testid="input-category-subcategory">
              <SelectValue placeholder="Alt kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((sc) => (
                <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Marka Adı</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} required data-testid="input-category-brand-name" />
        </div>
        <div className="space-y-2">
          <Label>Marka Slug (opsiyonel)</Label>
          <Input value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} placeholder="otomatik oluşturulur" data-testid="input-category-brand-slug" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !animal || !subcategory || !brandName} data-testid="btn-save-category">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kategori Ekle"}
      </Button>
    </form>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>("all");
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>("all");
  const [expandedAnimals, setExpandedAnimals] = useState<Record<string, boolean>>({});

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
  });

  const { data: categories = [] } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
  });

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "all"],
    queryFn: async () => {
      const res = await fetch("/api/products?all=true", { credentials: "include" });
      return res.json();
    },
  });

  const filteredProducts = useMemo(() => {
    let products = allProducts;
    if (selectedAnimalFilter !== "all") {
      const catIds = categories
        .filter((c) => c.animal === selectedAnimalFilter)
        .map((c) => c.id);
      products = products.filter((p) => catIds.includes(p.brandCategoryId));
    }
    if (selectedSubcategoryFilter !== "all") {
      const catIds = categories
        .filter((c) => c.subcategory === selectedSubcategoryFilter)
        .map((c) => c.id);
      products = products.filter((p) => catIds.includes(p.brandCategoryId));
    }
    return products;
  }, [allProducts, selectedAnimalFilter, selectedSubcategoryFilter, categories]);

  const sktWarningProducts = useMemo(() => {
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    return allProducts.filter((p) => {
      if (!p.skt || p.stock === 0) return false;
      const parts = p.skt.split(".");
      if (parts.length < 2) return false;
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);
      if (isNaN(month) || isNaN(year)) return false;
      const fullYear = year < 100 ? 2000 + year : year;
      const sktDate = new Date(fullYear, month - 1, 1);
      return sktDate <= threeMonthsFromNow;
    }).sort((a, b) => {
      const parseDate = (skt: string) => {
        const parts = skt.split(".");
        const m = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        return new Date(y < 100 ? 2000 + y : y, m - 1, 1);
      };
      return parseDate(a.skt!).getTime() - parseDate(b.skt!).getTime();
    });
  }, [allProducts]);

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setAddDialogOpen(false);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brand-products"] });
      setEditDialogOpen(false);
      setEditingProduct(null);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brand-products"] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/brand-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-categories"] });
      setCategoryDialogOpen(false);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/products/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brand-products"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/brand-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const [crossSellDialogOpen, setCrossSellDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("Sıklıkla Birlikte Alınan Ürünler");
  const [newSectionSortOrder, setNewSectionSortOrder] = useState("0");
  const [newSectionForProductId, setNewSectionForProductId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const [breedStatsDialogOpen, setBreedStatsDialogOpen] = useState(false);
  const [breedStatsProductId, setBreedStatsProductId] = useState<number | null>(null);
  const [newBreedName, setNewBreedName] = useState("");
  const [newBreedPercentage, setNewBreedPercentage] = useState("");
  const [newBreedColor, setNewBreedColor] = useState("#e65100");
  const [newBreedSortOrder, setNewBreedSortOrder] = useState("0");

  const { data: crossSellSections = [] } = useQuery<(CrossSellSection & { items: CrossSellItem[] })[]>({
    queryKey: ["/api/cross-sell-sections"],
  });

  const createSectionMutation = useMutation({
    mutationFn: async (data: { title: string; sortOrder: number; isActive: boolean; forProductId?: number | null }) => {
      await apiRequest("POST", "/api/admin/cross-sell-sections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-sell-sections"] });
      setCrossSellDialogOpen(false);
      setNewSectionTitle("Sıklıkla Birlikte Alınan Ürünler");
      setNewSectionSortOrder("0");
      setNewSectionForProductId("");
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/cross-sell-sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-sell-sections"] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: { sectionId: number; productId: number; sortOrder: number }) => {
      await apiRequest("POST", "/api/admin/cross-sell-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-sell-sections"] });
      setAddItemDialogOpen(false);
      setSelectedProductId("");
      setSelectedSectionId(null);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/cross-sell-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-sell-sections"] });
    },
  });

  const { data: breedStatsForProduct = [] } = useQuery<BreedStat[]>({
    queryKey: ["/api/breed-stats", breedStatsProductId],
    enabled: !!breedStatsProductId,
  });

  const addBreedStatMutation = useMutation({
    mutationFn: async (data: { productId: number; breedName: string; percentage: number; color: string; sortOrder: number }) => {
      await apiRequest("POST", "/api/admin/breed-stats", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breed-stats", breedStatsProductId] });
      setNewBreedName("");
      setNewBreedPercentage("");
      setNewBreedColor("#e65100");
      setNewBreedSortOrder("0");
    },
  });

  const deleteBreedStatMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/breed-stats/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breed-stats", breedStatsProductId] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: onLogout,
  });

  const getCategoryName = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.brandName : "Bilinmeyen";
  };

  const getSubcategoryName = (animal: string, slug: string) => {
    const subs = SUBCATEGORIES[animal] || [];
    const sc = subs.find((s) => s.slug === slug);
    return sc ? sc.name : slug;
  };

  const toggleAnimalExpand = (animalId: string) => {
    setExpandedAnimals((prev) => ({ ...prev, [animalId]: !prev[animalId] }));
  };

  const categoriesByAnimal = useMemo(() => {
    const grouped: Record<string, Record<string, BrandCategory[]>> = {};
    for (const cat of categories) {
      if (!grouped[cat.animal]) grouped[cat.animal] = {};
      if (!grouped[cat.animal][cat.subcategory]) grouped[cat.animal][cat.subcategory] = [];
      grouped[cat.animal][cat.subcategory].push(cat);
    }
    return grouped;
  }, [categories]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-[9999] border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold tracking-tight" data-testid="text-admin-header">
              <span style={{ color: "#2ecc40" }}>JET</span>
              <span className="text-foreground">GO</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">Admin</span>
            </h1>
          </div>
          <Button variant="outline" onClick={() => logoutMutation.mutate()} data-testid="btn-admin-logout">
            <LogOut className="w-4 h-4" />
            Çıkış
          </Button>
        </div>
      </header>

      <BackNavigation />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold" data-testid="text-section-orders">Gelen Siparisler</h2>
              <Badge className="no-default-hover-elevate no-default-active-elevate" data-testid="badge-order-count">
                {allOrders.length}
              </Badge>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : allOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-orders">Henuz siparis yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3" data-testid="list-orders">
              {allOrders.map((order) => {
                const statusColors: Record<string, string> = {
                  yeni: "#2196F3",
                  hazirlaniyor: "#FF9800",
                  tamamlandi: "#4CAF50",
                  iptal: "#F44336",
                };
                const statusBg = statusColors[order.status] || "#9E9E9E";

                return (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                            Siparis #{order.id}
                          </span>
                          <span className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                            {new Date(order.createdAt).toLocaleDateString("tr-TR")} {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <Badge
                          className="no-default-hover-elevate no-default-active-elevate"
                          style={{ backgroundColor: statusBg, color: "#fff" }}
                          data-testid={`badge-order-status-${order.id}`}
                        >
                          {order.status}
                        </Badge>
                      </div>

                      <div className="space-y-1" data-testid={`list-order-items-${order.id}`}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                            <span data-testid={`text-order-item-${order.id}-${idx}`}>
                              {item.quantity} x {item.name}
                            </span>
                            <span className="text-muted-foreground" data-testid={`text-order-item-total-${order.id}-${idx}`}>
                              {(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-2 space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Odeme:</span>
                          <span data-testid={`text-order-payment-${order.id}`}>{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Ara Toplam:</span>
                          <span data-testid={`text-order-subtotal-${order.id}`}>{order.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Kargo:</span>
                          <span data-testid={`text-order-shipping-${order.id}`}>{order.shipping.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">Indirim:</span>
                            <span data-testid={`text-order-discount-${order.id}`}>-{order.discount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 font-bold">
                          <span>Toplam:</span>
                          <span data-testid={`text-order-grand-total-${order.id}`}>{order.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                        </div>
                      </div>

                      <div className="border-t pt-2 flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-sm text-muted-foreground">Durum Degistir:</span>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatusMutation.mutate({ id: order.id, status: value })}
                        >
                          <SelectTrigger className="w-[180px]" data-testid={`select-order-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yeni" data-testid={`option-status-yeni-${order.id}`}>yeni</SelectItem>
                            <SelectItem value="hazirlaniyor" data-testid={`option-status-hazirlaniyor-${order.id}`}>hazirlaniyor</SelectItem>
                            <SelectItem value="tamamlandi" data-testid={`option-status-tamamlandi-${order.id}`}>tamamlandi</SelectItem>
                            <SelectItem value="iptal" data-testid={`option-status-iptal-${order.id}`}>iptal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-bold" data-testid="text-section-categories">Kategoriler</h2>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-category">
                  <Plus className="w-4 h-4" />
                  Yeni Marka Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Marka Ekle</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  onSave={(data) => createCategoryMutation.mutate(data)}
                  isPending={createCategoryMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3" data-testid="grid-categories">
            {ANIMALS.map((animalInfo) => {
              const animalCats = categoriesByAnimal[animalInfo.id] || {};
              const totalBrands = Object.values(animalCats).flat().length;
              const totalProducts = allProducts.filter(
                (p) => categories.find((c) => c.id === p.brandCategoryId)?.animal === animalInfo.id
              ).length;
              const isExpanded = expandedAnimals[animalInfo.id];
              const AnimalIcon = animalInfo.icon;

              return (
                <Card key={animalInfo.id} data-testid={`card-animal-${animalInfo.id}`}>
                  <CardContent className="p-0">
                    <button
                      className="w-full p-4 flex items-center justify-between gap-3 text-left"
                      onClick={() => toggleAnimalExpand(animalInfo.id)}
                      data-testid={`btn-expand-${animalInfo.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2ecc40" }}>
                          <AnimalIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-base">{animalInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{totalBrands} marka, {totalProducts} ürün</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        {(SUBCATEGORIES[animalInfo.id] || []).map((sc) => {
                          const brands = animalCats[sc.slug] || [];
                          if (brands.length === 0) return null;
                          return (
                            <div key={sc.slug} className="rounded-lg bg-muted/30 p-3" data-testid={`section-subcategory-${sc.slug}`}>
                              <p className="text-sm font-semibold mb-2">{sc.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {brands.map((brand) => {
                                  const count = allProducts.filter((p) => p.brandCategoryId === brand.id).length;
                                  return (
                                    <div key={brand.id} className="flex items-center gap-1.5 bg-background rounded-md px-2.5 py-1.5 border" data-testid={`brand-tag-${brand.id}`}>
                                      <span className="text-xs font-medium">{brand.brandName}</span>
                                      <Badge variant="secondary" className="text-[10px] no-default-hover-elevate no-default-active-elevate">
                                        {count}
                                      </Badge>
                                      <button
                                        className="text-muted-foreground/50 ml-0.5"
                                        onClick={() => {
                                          if (confirm(`"${brand.brandName}" markası ve tüm ürünleri silinecek. Emin misiniz?`)) {
                                            deleteCategoryMutation.mutate(brand.id);
                                          }
                                        }}
                                        data-testid={`btn-delete-category-${brand.id}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(animalCats).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">Bu kategoride henüz marka yok</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {sktWarningProducts.length > 0 && (
          <section className="mb-6" data-testid="section-skt-warnings">
            <Card className="border-2" style={{ borderColor: "#ff9800" }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" style={{ color: "#e65100" }} />
                  <h3 className="text-base font-bold" style={{ color: "#e65100" }} data-testid="text-skt-warning-title">
                    SKT Uyarisi ({sktWarningProducts.length} urun)
                  </h3>
                </div>
                <div className="space-y-2">
                  {sktWarningProducts.map((p) => {
                    const parts = p.skt!.split(".");
                    const month = parseInt(parts[0]);
                    const year = parseInt(parts[1]);
                    const fullYear = year < 100 ? 2000 + year : year;
                    const sktDate = new Date(fullYear, month - 1, 1);
                    const now = new Date();
                    const isExpired = sktDate <= now;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-md"
                        style={{ backgroundColor: isExpired ? "#ffebee" : "#fff3e0" }}
                        data-testid={`skt-warning-item-${p.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {p.img && <img src={p.img} alt="" className="w-8 h-8 rounded object-contain" />}
                          <span className="text-sm font-medium truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            className="text-[10px] no-default-hover-elevate"
                            style={{
                              backgroundColor: isExpired ? "#d32f2f" : "#ff9800",
                              color: "#fff",
                            }}
                          >
                            SKT: {p.skt} {isExpired ? "(GECMIS)" : "(YAKIN)"}
                          </Badge>
                          <Badge
                            className="text-[10px] no-default-hover-elevate"
                            style={{ backgroundColor: "#1976d2", color: "#fff" }}
                          >
                            Stok: {p.stock}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold" data-testid="text-section-products">
                Ürünler
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredProducts.length})
                </span>
              </h2>
              <Select value={selectedAnimalFilter} onValueChange={(val) => { setSelectedAnimalFilter(val); setSelectedSubcategoryFilter("all"); }}>
                <SelectTrigger className="w-[140px]" data-testid="select-filter-animal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {ANIMALS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAnimalFilter !== "all" && (
                <Select value={selectedSubcategoryFilter} onValueChange={setSelectedSubcategoryFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-subcategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Alt Kategoriler</SelectItem>
                    {(SUBCATEGORIES[selectedAnimalFilter] || []).map((sc) => (
                      <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-product">
                  <Plus className="w-4 h-4" />
                  Yeni Ürün
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                </DialogHeader>
                <ProductForm
                  categories={categories}
                  onSave={(data) => createProductMutation.mutate(data)}
                  isPending={createProductMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground" data-testid="text-no-products">Henüz ürün eklenmemiş</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2" data-testid="list-admin-products">
              {filteredProducts.map((product) => {
                const discount = product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;
                const cat = categories.find((c) => c.id === product.brandCategoryId);

                return (
                  <Card key={product.id} data-testid={`card-admin-product-${product.id}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      {product.img && (
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-14 h-14 object-contain rounded-md bg-muted/30 shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" data-testid={`text-admin-product-name-${product.id}`}>
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm font-bold text-foreground">
                            {product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {product.originalPrice.toLocaleString("tr-TR")} TL
                            </span>
                          )}
                          {discount > 0 && (
                            <Badge
                              className="text-[10px] no-default-hover-elevate no-default-active-elevate"
                              style={{ backgroundColor: "#e53935", color: "#fff" }}
                            >
                              %{discount}
                            </Badge>
                          )}
                          {cat && (
                            <Badge variant="secondary" className="text-[10px] no-default-hover-elevate no-default-active-elevate">
                              {cat.brandName}
                            </Badge>
                          )}
                          {cat && (
                            <span className="text-[10px] text-muted-foreground">
                              {ANIMALS.find((a) => a.id === cat.animal)?.name} / {getSubcategoryName(cat.animal, cat.subcategory)}
                            </span>
                          )}
                          {product.isActive ? (
                            <Badge className="text-[10px] no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#2ecc40", color: "#fff" }}>
                              Aktif
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#ff9800", color: "#fff" }}>
                              Yakında Gelecek
                            </Badge>
                          )}
                          <Badge
                            className="text-[10px] no-default-hover-elevate no-default-active-elevate"
                            style={{
                              backgroundColor: product.stock > 0 ? "#1976d2" : "#d32f2f",
                              color: "#fff",
                            }}
                            data-testid={`badge-stock-${product.id}`}
                          >
                            Stok: {product.stock}
                          </Badge>
                          {product.skt && (
                            <span className="text-[10px] text-muted-foreground">
                              SKT: {product.skt}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleActiveMutation.mutate({ id: product.id, isActive: !product.isActive })}
                          title={product.isActive ? "Yakında Gelecek olarak işaretle" : "Aktif et"}
                          data-testid={`btn-toggle-active-${product.id}`}
                        >
                          {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setEditDialogOpen(true);
                          }}
                          data-testid={`btn-edit-product-${product.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm(`"${product.name}" silinecek. Emin misiniz?`)) {
                              deleteProductMutation.mutate(product.id);
                            }
                          }}
                          data-testid={`btn-delete-product-${product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ürün Düzenle</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm
                categories={categories}
                product={editingProduct}
                onSave={(data) =>
                  updateProductMutation.mutate({ id: editingProduct.id, data })
                }
                isPending={updateProductMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-bold" data-testid="text-section-cross-sell">Sıklıkla Birlikte Alınan Ürünler</h2>
            <Dialog open={crossSellDialogOpen} onOpenChange={setCrossSellDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-cross-sell-section">
                  <Plus className="w-4 h-4" />
                  Yeni Bölüm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Öneri Bölümü</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createSectionMutation.mutate({
                      title: newSectionTitle,
                      sortOrder: parseInt(newSectionSortOrder) || 0,
                      isActive: true,
                      forProductId: newSectionForProductId ? parseInt(newSectionForProductId) : null,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Hangi Ürünün Sayfasında Gösterilsin?</Label>
                    <Select value={newSectionForProductId} onValueChange={setNewSectionForProductId}>
                      <SelectTrigger data-testid="select-cross-sell-for-product">
                        <SelectValue placeholder="Ürün seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map((p: Product) => (
                          <SelectItem key={p.id} value={String(p.id)} data-testid={`option-for-product-${p.id}`}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bölüm Başlığı</Label>
                    <Input
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      required
                      data-testid="input-cross-sell-section-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sıralama</Label>
                    <Input
                      type="number"
                      value={newSectionSortOrder}
                      onChange={(e) => setNewSectionSortOrder(e.target.value)}
                      data-testid="input-cross-sell-section-sort-order"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createSectionMutation.isPending} data-testid="btn-save-cross-sell-section">
                    {createSectionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bölüm Ekle"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3" data-testid="list-cross-sell-sections">
            {crossSellSections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground" data-testid="text-no-cross-sell-sections">Henüz öneri bölümü eklenmemiş</p>
                </CardContent>
              </Card>
            ) : (
              crossSellSections.map((section) => (
                <Card key={section.id} data-testid={`card-cross-sell-section-${section.id}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" data-testid={`text-cross-sell-section-title-${section.id}`}>{section.title}</span>
                          <Badge variant="secondary" className="text-xs no-default-hover-elevate no-default-active-elevate" data-testid={`badge-cross-sell-item-count-${section.id}`}>
                            {section.items.length} ürün
                          </Badge>
                        </div>
                        {section.forProductId && (
                          <span className="text-xs text-muted-foreground" data-testid={`text-cross-sell-for-product-${section.id}`}>
                            Ürün: {allProducts.find((p: Product) => p.id === section.forProductId)?.name || `#${section.forProductId}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedSectionId(section.id);
                            setAddItemDialogOpen(true);
                          }}
                          data-testid={`btn-add-item-to-section-${section.id}`}
                        >
                          <Plus className="w-4 h-4" />
                          Ürün Ekle
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm(`"${section.title}" bölümü silinecek. Emin misiniz?`)) {
                              deleteSectionMutation.mutate(section.id);
                            }
                          }}
                          data-testid={`btn-delete-cross-sell-section-${section.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {section.items.length > 0 && (
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const product = allProducts.find((p) => p.id === item.productId);
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-3 py-1 px-2 rounded-md bg-muted/30" data-testid={`row-cross-sell-item-${item.id}`}>
                              <span className="text-sm truncate" data-testid={`text-cross-sell-item-name-${item.id}`}>
                                {product ? product.name : `Ürün #${item.productId}`}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeItemMutation.mutate(item.id)}
                                data-testid={`btn-remove-cross-sell-item-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <Dialog open={addItemDialogOpen} onOpenChange={(open) => {
          setAddItemDialogOpen(open);
          if (!open) {
            setSelectedProductId("");
            setSelectedSectionId(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bölüme Ürün Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ürün Seçin</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger data-testid="select-cross-sell-product">
                    <SelectValue placeholder="Ürün seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} data-testid={`option-cross-sell-product-${p.id}`}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={!selectedProductId || addItemMutation.isPending}
                onClick={() => {
                  if (selectedSectionId && selectedProductId) {
                    addItemMutation.mutate({
                      sectionId: selectedSectionId,
                      productId: parseInt(selectedProductId),
                      sortOrder: 0,
                    });
                  }
                }}
                data-testid="btn-confirm-add-cross-sell-item"
              >
                {addItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-bold" data-testid="text-section-breed-stats">Kedi Türü İstatistikleri</h2>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Ürün Seçin</Label>
                <Select
                  value={breedStatsProductId ? String(breedStatsProductId) : ""}
                  onValueChange={(val) => setBreedStatsProductId(parseInt(val))}
                >
                  <SelectTrigger data-testid="select-breed-stats-product">
                    <SelectValue placeholder="İstatistik eklemek istediğiniz ürünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} data-testid={`option-breed-product-${p.id}`}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {breedStatsProductId && (
                <>
                  {breedStatsForProduct.length > 0 && (
                    <div className="space-y-2" data-testid="list-breed-stats">
                      <Label className="text-sm font-semibold">Mevcut İstatistikler</Label>
                      {breedStatsForProduct
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((stat) => (
                        <div key={stat.id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/30" data-testid={`row-admin-breed-stat-${stat.id}`}>
                          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                          <span className="text-sm font-medium flex-1">{stat.breedName}</span>
                          <span className="text-sm font-bold">{stat.percentage}%</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteBreedStatMutation.mutate(stat.id)}
                            data-testid={`btn-delete-breed-stat-${stat.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-3">
                    <Label className="text-sm font-semibold">Yeni İstatistik Ekle</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Kedi Türü</Label>
                        <Input
                          value={newBreedName}
                          onChange={(e) => setNewBreedName(e.target.value)}
                          placeholder="Tekir Yavru"
                          data-testid="input-breed-name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Yüzde (%)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={newBreedPercentage}
                          onChange={(e) => setNewBreedPercentage(e.target.value)}
                          placeholder="34"
                          data-testid="input-breed-percentage"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Renk</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newBreedColor}
                            onChange={(e) => setNewBreedColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border"
                            data-testid="input-breed-color"
                          />
                          <Input
                            value={newBreedColor}
                            onChange={(e) => setNewBreedColor(e.target.value)}
                            placeholder="#e65100"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Sıralama</Label>
                        <Input
                          type="number"
                          value={newBreedSortOrder}
                          onChange={(e) => setNewBreedSortOrder(e.target.value)}
                          data-testid="input-breed-sort-order"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      disabled={!newBreedName || !newBreedPercentage || addBreedStatMutation.isPending}
                      onClick={() => {
                        if (breedStatsProductId && newBreedName && newBreedPercentage) {
                          addBreedStatMutation.mutate({
                            productId: breedStatsProductId,
                            breedName: newBreedName,
                            percentage: parseInt(newBreedPercentage),
                            color: newBreedColor,
                            sortOrder: parseInt(newBreedSortOrder) || 0,
                          });
                        }
                      }}
                      data-testid="btn-add-breed-stat"
                    >
                      {addBreedStatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "İstatistik Ekle"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const { data: user, isLoading, refetch } = useQuery<{ username: string } | null>({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (res.status === 401) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={() => refetch()} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        queryClient.setQueryData(["/api/admin/me"], null);
      }}
    />
  );
}
