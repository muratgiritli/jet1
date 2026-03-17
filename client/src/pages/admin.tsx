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
  Bell,
  TrendingUp,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  User,
  ShoppingBag,
  X,
  Search,
  Check,
  ImageIcon,
  Upload,
  Tag,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, BrandCategory, CrossSellSection, CrossSellItem, Order, BreedStat, StockAlert, InstallmentRate, Subcategory } from "@shared/schema";

const ANIMALS = [
  { id: "kedi", name: "Kedi", icon: Cat },
  { id: "kopek", name: "Köpek", icon: Dog },
  { id: "kus", name: "Kuş", icon: Bird },
  { id: "kemirgen", name: "Kemirgen", icon: Rabbit },
];

function useSubcategories() {
  const { data: allSubs = [] } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories"],
  });
  const byAnimal: Record<string, { slug: string; name: string }[]> = {};
  for (const s of allSubs) {
    if (!byAnimal[s.animal]) byAnimal[s.animal] = [];
    byAnimal[s.animal].push({ slug: s.slug, name: s.displayName.replace(/\n/g, " ") });
  }
  return { allSubs, byAnimal };
}

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
  subcategoriesByAnimal,
}: {
  categories: BrandCategory[];
  product?: Product;
  onSave: (data: any) => void;
  isPending: boolean;
  subcategoriesByAnimal: Record<string, { slug: string; name: string }[]>;
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [brandCategoryId, setBrandCategoryId] = useState(
    product?.brandCategoryId?.toString() || ""
  );

  const availableSubcategories = subcategoriesByAnimal[selectedAnimal] || [];

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
              const matching = categories.filter(c => c.animal === selectedAnimal && c.subcategory === val);
              if (matching.length === 1) {
                setBrandCategoryId(String(matching[0].id));
              } else {
                setBrandCategoryId("");
              }
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

      {filteredCategories.length > 1 && (
        <div className="space-y-2">
          <Label>Marka</Label>
          <Select
            value={brandCategoryId}
            onValueChange={setBrandCategoryId}
            disabled={!selectedSubcategory}
          >
            <SelectTrigger data-testid="select-brand-category">
              <SelectValue placeholder="Marka seçin" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} data-testid={`option-category-${c.id}`}>
                  {c.brandName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {selectedSubcategory && filteredCategories.length === 0 && (
        <p className="text-xs text-red-500 text-sm">Bu alt kategoride henüz marka eklenmemiş</p>
      )}

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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>SKT</Label>
          <Input value={skt} onChange={(e) => setSkt(e.target.value)} placeholder="03.2027" data-testid="input-product-skt" />
        </div>
        <div className="space-y-2">
          <Label>Stok</Label>
          <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} data-testid="input-product-stock" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Ürün Görseli</Label>
        <div className="flex gap-2 items-center">
          {img && (
            <img
              src={img}
              alt="Önizleme"
              className="w-12 h-12 object-cover rounded border flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 space-y-2">
            {product && (
              <div>
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${uploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  data-testid="btn-upload-image"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Yükleniyor..." : "Resim Yükle"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !product) return;
                      setUploading(true);
                      setUploadError("");
                      try {
                        const formData = new FormData();
                        formData.append("image", file);
                        const res = await fetch(`/api/admin/products/${product.id}/image`, {
                          method: "POST",
                          body: formData,
                          credentials: "include",
                        });
                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(err.message || "Yükleme başarısız");
                        }
                        const updated = await res.json();
                        setImg(updated.img);
                        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                      } catch (err: any) {
                        setUploadError(err.message || "Resim yüklenemedi");
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              </div>
            )}
            <Input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://... veya önce ürünü kaydedin" className="flex-1" data-testid="input-product-img" />
          </div>
        </div>
        {!product && <p className="text-xs text-muted-foreground">Resim yüklemek için önce ürünü kaydedin, sonra düzenleyin.</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !brandCategoryId} data-testid="btn-save-product">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : product ? "Güncelle" : "Ekle"}
      </Button>
    </form>
  );
}

function SubcategoryForm({
  onSave,
  isPending,
}: {
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const [animal, setAnimal] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#607D8B");
  const [hasBrands, setHasBrands] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const finalSlug = slug || displayName.toLowerCase().replace(/\n/g, " ").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ç/g,"c").replace(/ı/g,"i").replace(/ğ/g,"g").replace(/İ/g,"i").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        onSave({ animal, displayName, slug: finalSlug, color, hasBrands, sortOrder: parseInt(sortOrder) || 0 });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Hayvan</Label>
          <Select value={animal} onValueChange={setAnimal}>
            <SelectTrigger data-testid="input-subcategory-animal">
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
          <Label>Görünen İsim</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Örn: Köpek Maması" required data-testid="input-subcategory-name" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Slug (opsiyonel)</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="otomatik" data-testid="input-subcategory-slug" />
        </div>
        <div className="space-y-2">
          <Label>Renk</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} data-testid="input-subcategory-color" />
        </div>
        <div className="space-y-2">
          <Label>Sıra</Label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} data-testid="input-subcategory-order" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={hasBrands} onChange={(e) => setHasBrands(e.target.checked)} id="hasBrands" data-testid="input-subcategory-has-brands" />
        <Label htmlFor="hasBrands">Marka sayfası var (alt markalar gösterilsin)</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !animal || !displayName} data-testid="btn-save-subcategory">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Alt Kategori Ekle"}
      </Button>
    </form>
  );
}

function CategoryForm({
  onSave,
  isPending,
  subcategoriesByAnimal,
}: {
  onSave: (data: any) => void;
  isPending: boolean;
  subcategoriesByAnimal: Record<string, { slug: string; name: string }[]>;
}) {
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [animal, setAnimal] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const availableSubcategories = subcategoriesByAnimal[animal] || [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const slug = brandSlug || brandName.toLowerCase().replace(/ö/g,"o").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ç/g,"c").replace(/ı/g,"i").replace(/ğ/g,"g").replace(/İ/g,"i").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
  const { toast } = useToast();
  const { allSubs, byAnimal: subcategoriesByAnimal } = useSubcategories();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>("all");
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [expandedAnimals, setExpandedAnimals] = useState<Record<string, boolean>>({});
  const [bulkPriceDialogOpen, setBulkPriceDialogOpen] = useState(false);
  const [bulkPricePercent, setBulkPricePercent] = useState("");
  const [bulkPriceMode, setBulkPriceMode] = useState<"percent" | "individual">("individual");
  const [individualPrices, setIndividualPrices] = useState<Record<number, string>>({});
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [campaignExpanded, setCampaignExpanded] = useState(false);
  const [campaignAddType, setCampaignAddType] = useState<"main" | "extra">("main");
  const [campaignProductId, setCampaignProductId] = useState("");
  const [campaignSortOrder, setCampaignSortOrder] = useState("1");
  const [campaignSearchTerm, setCampaignSearchTerm] = useState("");
  const [campaignAnimalFilter, setCampaignAnimalFilter] = useState<string>("all");
  const [campaignSubcatFilter, setCampaignSubcatFilter] = useState<string>("all");
  const [orderTab, setOrderTab] = useState<"gelen" | "giden" | "bekleyen">("gelen");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [phoneHistoryDialog, setPhoneHistoryDialog] = useState<string | null>(null);
  const [orderSearchPhone, setOrderSearchPhone] = useState("");
  const [orderDetailDialog, setOrderDetailDialog] = useState<Order | null>(null);

  const bulkPriceUpdateMutation = useMutation({
    mutationFn: async ({ productIds, percentage }: { productIds: number[]; percentage: number }) => {
      await apiRequest("POST", "/api/admin/products/bulk-price-update", { productIds, percentage });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setBulkPriceDialogOpen(false);
      setBulkPricePercent("");
      toast({ title: "Başarılı", description: `${variables.productIds.length} ürün fiyatı %${variables.percentage} güncellendi.` });
    },
  });

  const bulkIndividualUpdateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: { id: number; price: number }[] }) => {
      await apiRequest("POST", "/api/admin/products/bulk-individual-update", { updates });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setBulkPriceDialogOpen(false);
      setIndividualPrices({});
      toast({ title: "Başarılı", description: `${variables.updates.length} ürün fiyatı güncellendi.` });
    },
  });

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

  const filteredBrands = useMemo(() => {
    let filtered = categories;
    if (selectedAnimalFilter !== "all") {
      filtered = filtered.filter((c) => c.animal === selectedAnimalFilter);
    }
    if (selectedSubcategoryFilter !== "all") {
      filtered = filtered.filter((c) => c.subcategory === selectedSubcategoryFilter);
    }
    const uniqueBrands = new Map<string, string>();
    filtered.forEach((c) => {
      if (!uniqueBrands.has(c.brandSlug)) {
        uniqueBrands.set(c.brandSlug, c.brandName);
      }
    });
    return Array.from(uniqueBrands.entries()).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [categories, selectedAnimalFilter, selectedSubcategoryFilter]);

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
    if (selectedBrandFilter !== "all") {
      const catIds = categories
        .filter((c) => c.brandSlug === selectedBrandFilter)
        .map((c) => c.id);
      products = products.filter((p) => catIds.includes(p.brandCategoryId));
    }
    return products;
  }, [allProducts, selectedAnimalFilter, selectedSubcategoryFilter, selectedBrandFilter, categories]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/brand-categories"] });
      setEditDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "Ürün güncellendi" });
    },
    onError: (err: any) => {
      toast({ title: "Hata", description: err.message || "Ürün güncellenemedi", variant: "destructive" });
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

  const createSubcategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/subcategories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcategories"] });
      toast({ title: "Alt kategori eklendi" });
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/subcategories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcategories"] });
      toast({ title: "Alt kategori silindi" });
    },
  });

  const [crossSellDialogOpen, setCrossSellDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("Sıklıkla Birlikte Alınan Ürünler");
  const [newSectionSortOrder, setNewSectionSortOrder] = useState("0");
  const [newSectionForProductId, setNewSectionForProductId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [csAnimalFilter, setCsAnimalFilter] = useState("all");
  const [csSubFilter, setCsSubFilter] = useState("all");
  const [csBrandFilter, setCsBrandFilter] = useState("all");
  const [csNewAnimal, setCsNewAnimal] = useState("all");
  const [csNewSub, setCsNewSub] = useState("all");
  const [csNewBrand, setCsNewBrand] = useState("all");

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

  const { data: stockAlerts = [], isLoading: stockAlertsLoading } = useQuery<StockAlert[]>({
    queryKey: ["/api/admin/stock-alerts"],
  });

  const { data: loyaltyCustomers = [], isLoading: loyaltyLoading } = useQuery<{ id: number; phone: string; name: string; balance: number }[]>({
    queryKey: ["/api/admin/loyalty-points"],
  });

  const [lpCustomerId, setLpCustomerId] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [lpDescription, setLpDescription] = useState("");

  const addPointsMutation = useMutation({
    mutationFn: async (data: { customerId: number; amount: number; description: string }) => {
      await apiRequest("POST", "/api/admin/loyalty-points", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loyalty-points"] });
      setLpCustomerId("");
      setLpAmount("");
      setLpDescription("");
      toast({ title: "Puan güncellendi" });
    },
  });

  const { data: installmentRates = [] } = useQuery<InstallmentRate[]>({
    queryKey: ["/api/admin/installment-rates"],
  });

  const [newInstMonths, setNewInstMonths] = useState("");
  const [newInstRate, setNewInstRate] = useState("");
  const [editingInstId, setEditingInstId] = useState<number | null>(null);
  const [editInstMonths, setEditInstMonths] = useState("");
  const [editInstRate, setEditInstRate] = useState("");

  const createInstallmentMutation = useMutation({
    mutationFn: async (data: { months: number; rate: number; sortOrder: number }) => {
      await apiRequest("POST", "/api/admin/installment-rates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/installment-rates"] });
      setNewInstMonths("");
      setNewInstRate("");
    },
  });

  const updateInstallmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { months?: number; rate?: number; isActive?: boolean } }) => {
      await apiRequest("PATCH", `/api/admin/installment-rates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/installment-rates"] });
      setEditingInstId(null);
    },
  });

  const deleteInstallmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/installment-rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/installment-rates"] });
    },
  });

  interface CampaignItem {
    id: number;
    product_id: number;
    item_type: string;
    sort_order: number;
    is_active: boolean;
    name: string;
    price: number;
    original_price: number | null;
    img: string | null;
    stock: number;
    skt: string | null;
    product_active?: boolean;
  }

  const { data: campaignItems = [] } = useQuery<CampaignItem[]>({
    queryKey: ["/api/admin/campaign-items"],
  });

  const addCampaignItemMutation = useMutation({
    mutationFn: async (data: { productId: number; itemType: string; sortOrder: number }) => {
      await apiRequest("POST", "/api/admin/campaign-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-items"] });
      setCampaignProductId("");
      setCampaignSortOrder("1");
      setCampaignSearchTerm("");
    },
  });

  const toggleCampaignItemMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/campaign-items/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-items"] });
    },
  });

  const updateCampaignItemMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; sortOrder?: number; itemType?: string }) => {
      await apiRequest("PATCH", `/api/admin/campaign-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-items"] });
    },
  });

  const removeCampaignItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/campaign-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-items"] });
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
    const subs = subcategoriesByAnimal[animal] || [];
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
              <span style={{ color: "#6B3480" }}>JET</span>
              <span className="text-foreground">55</span>
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
          <button
            onClick={() => setCampaignExpanded(!campaignExpanded)}
            className="flex items-center gap-2 mb-4 w-full text-left"
            data-testid="btn-toggle-campaign"
          >
            <Tag className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold" data-testid="text-section-campaign">Kampanya Yönetimi</h2>
            <Badge className="no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#6B3480", color: "#fff" }} data-testid="badge-campaign-count">
              {campaignItems.filter(i => i.item_type === "main").length} ana / {campaignItems.filter(i => i.item_type === "extra").length} ek
            </Badge>
            <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${campaignExpanded ? "rotate-180" : ""}`} />
          </button>

          {campaignExpanded && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Kampanyaya Ürün Ekle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={campaignAddType} onValueChange={(v) => setCampaignAddType(v as "main" | "extra")} data-testid="select-campaign-type">
                      <SelectTrigger className="w-full sm:w-40" data-testid="trigger-campaign-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Ana Ürün</SelectItem>
                        <SelectItem value="extra">Ek Ürün (İlave)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Sıra No"
                      className="w-24"
                      value={campaignSortOrder}
                      onChange={(e) => setCampaignSortOrder(e.target.value)}
                      data-testid="input-campaign-sort-order"
                    />
                  </div>

                  {campaignAddType === "extra" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={campaignAnimalFilter} onValueChange={(v) => { setCampaignAnimalFilter(v); setCampaignSubcatFilter("all"); }}>
                        <SelectTrigger className="w-full sm:w-36" data-testid="trigger-campaign-animal">
                          <SelectValue placeholder="Hayvan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Hayvanlar</SelectItem>
                          {ANIMALS.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {campaignAnimalFilter !== "all" && (
                        <Select value={campaignSubcatFilter} onValueChange={setCampaignSubcatFilter}>
                          <SelectTrigger className="w-full sm:w-48" data-testid="trigger-campaign-subcat">
                            <SelectValue placeholder="Alt Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tüm Alt Kategoriler</SelectItem>
                            {(subcategoriesByAnimal[campaignAnimalFilter] || []).map(sc => (
                              <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Ürün ara (isim veya ID)..."
                      className="pl-10"
                      value={campaignSearchTerm}
                      onChange={(e) => setCampaignSearchTerm(e.target.value)}
                      data-testid="input-campaign-search"
                    />
                  </div>

                  {campaignSearchTerm.length >= 2 && (() => {
                    const term = campaignSearchTerm.toLowerCase();
                    const existingIds = new Set(campaignItems.map(ci => ci.product_id));
                    let filtered = products.filter(p => !existingIds.has(p.id));
                    if (campaignAddType === "extra" && campaignAnimalFilter !== "all") {
                      const catIds = categories
                        .filter(c => c.animal === campaignAnimalFilter && (campaignSubcatFilter === "all" || c.subcategory === campaignSubcatFilter))
                        .map(c => c.id);
                      filtered = filtered.filter(p => p.brandCategoryId && catIds.includes(p.brandCategoryId));
                    }
                    const results = filtered
                      .filter(p => p.name.toLowerCase().includes(term) || String(p.id) === term)
                      .slice(0, 20);
                    return results.length > 0 ? (
                      <div className="border rounded-lg max-h-60 overflow-y-auto divide-y" data-testid="campaign-search-results">
                        {results.map(p => (
                          <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer" onClick={() => {
                            addCampaignItemMutation.mutate({
                              productId: p.id,
                              itemType: campaignAddType,
                              sortOrder: parseInt(campaignSortOrder) || 1,
                            });
                          }} data-testid={`campaign-search-result-${p.id}`}>
                            {p.img && <img src={p.img} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {p.id} — {getCategoryName(p.brandCategoryId || 0)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold">{p.price} TL</p>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <p className="text-xs text-muted-foreground line-through">{p.originalPrice} TL</p>
                              )}
                            </div>
                            <Plus className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">Sonuç bulunamadı</p>
                    );
                  })()}
                </CardContent>
              </Card>

              {(["main", "extra"] as const).map(type => {
                const items = campaignItems.filter(i => i.item_type === type).sort((a, b) => a.sort_order - b.sort_order);
                const activeCount = items.filter(i => i.is_active).length;
                return (
                  <Card key={type}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {type === "main" ? <Tag className="w-4 h-4 text-purple-600" /> : <Package className="w-4 h-4 text-green-600" />}
                        {type === "main" ? "Kampanya Ana Ürünleri" : "İlave Ürünler"}
                        <Badge variant="outline" className="ml-auto">{activeCount} aktif / {items.length} toplam</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Henüz ürün eklenmemiş</p>
                      ) : (
                        <div className="space-y-2">
                          {items.map(item => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-opacity ${item.is_active ? "bg-white border-gray-200" : "bg-muted/40 border-dashed border-gray-300 opacity-60"}`}
                              data-testid={`row-campaign-item-${item.id}`}
                            >
                              {item.img ? (
                                <img src={item.img} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" data-testid={`text-campaign-item-name-${item.id}`}>{item.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-primary">{item.price} TL</span>
                                  {item.original_price && item.original_price > item.price && (
                                    <span className="text-xs text-muted-foreground line-through">{item.original_price} TL</span>
                                  )}
                                  <span className="text-xs text-muted-foreground">Sıra: {item.sort_order}</span>
                                  {item.stock <= 0 && <Badge variant="destructive" className="text-[10px] h-4 no-default-hover-elevate no-default-active-elevate">Stok Yok</Badge>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant={item.is_active ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 text-xs px-2"
                                  style={item.is_active ? { backgroundColor: "#16a34a" } : {}}
                                  onClick={() => toggleCampaignItemMutation.mutate({ id: item.id, isActive: !item.is_active })}
                                  disabled={toggleCampaignItemMutation.isPending}
                                  data-testid={`btn-toggle-campaign-item-${item.id}`}
                                >
                                  {item.is_active ? (
                                    <><Eye className="w-3 h-3 mr-1" />Yayında</>
                                  ) : (
                                    <><EyeOff className="w-3 h-3 mr-1" />Durduruldu</>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeCampaignItemMutation.mutate(item.id)}
                                  disabled={removeCampaignItemMutation.isPending}
                                  data-testid={`btn-remove-campaign-item-${item.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <button
            onClick={() => setOrdersExpanded(!ordersExpanded)}
            className="flex items-center gap-2 mb-4 w-full text-left"
            data-testid="btn-toggle-orders"
          >
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold" data-testid="text-section-orders">Sipariş Yönetimi</h2>
            <Badge className="no-default-hover-elevate no-default-active-elevate" data-testid="badge-order-count">
              {allOrders.filter(o => o.status === "yeni").length} yeni / {allOrders.length} toplam
            </Badge>
            <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${ordersExpanded ? "rotate-180" : ""}`} />
          </button>

          {ordersExpanded && <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1" data-testid="tabs-order-filter">
              {([
                { key: "gelen" as const, label: "Gelen Siparişler", statuses: ["yeni"] },
                { key: "bekleyen" as const, label: "Bekleyen", statuses: ["onaylandi", "hazirlaniyor"] },
                { key: "giden" as const, label: "Giden Siparişler", statuses: ["tamamlandi", "iptal"] },
              ]).map((tab) => {
                const count = allOrders.filter((o) => tab.statuses.includes(o.status)).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setOrderTab(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${orderTab === tab.key ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    data-testid={`tab-order-${tab.key}`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={orderDateFrom}
                onChange={(e) => setOrderDateFrom(e.target.value)}
                className="w-auto"
                placeholder="Başlangıç"
                data-testid="input-order-date-from"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <Input
                type="date"
                value={orderDateTo}
                onChange={(e) => setOrderDateTo(e.target.value)}
                className="w-auto"
                placeholder="Bitiş"
                data-testid="input-order-date-to"
              />
              {(orderDateFrom || orderDateTo) && (
                <button onClick={() => { setOrderDateFrom(""); setOrderDateTo(""); }} className="text-muted-foreground hover:text-foreground" data-testid="btn-clear-date-filter">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Telefon ile ara..."
              value={orderSearchPhone}
              onChange={(e) => setOrderSearchPhone(e.target.value)}
              className="max-w-xs"
              data-testid="input-order-search-phone"
            />
            {orderSearchPhone && (
              <button onClick={() => setOrderSearchPhone("")} className="text-muted-foreground hover:text-foreground" data-testid="btn-clear-phone-search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (() => {
            const tabStatuses: Record<string, string[]> = {
              gelen: ["yeni"],
              bekleyen: ["onaylandi", "hazirlaniyor"],
              giden: ["tamamlandi", "iptal"],
            };
            const filteredOrders = allOrders
              .filter((o) => tabStatuses[orderTab]?.includes(o.status))
              .filter((o) => {
                if (!orderDateFrom && !orderDateTo) return true;
                const d = new Date(o.createdAt);
                const turkeyDate = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
                if (orderDateFrom && turkeyDate < orderDateFrom) return false;
                if (orderDateTo && turkeyDate > orderDateTo) return false;
                return true;
              })
              .filter((o) => {
                if (!orderSearchPhone) return true;
                const searchDigits = orderSearchPhone.replace(/\D/g, "");
                const phoneDigits = (o.customerPhone || "").replace(/\D/g, "");
                return phoneDigits.includes(searchDigits);
              })
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (filteredOrders.length === 0) {
              return (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground" data-testid="text-no-orders">
                      {orderTab === "gelen" ? "Yeni sipariş yok" : orderTab === "bekleyen" ? "Bekleyen sipariş yok" : "Tamamlanan sipariş yok"}
                    </p>
                  </CardContent>
                </Card>
              );
            }

            const statusColors: Record<string, string> = {
              yeni: "#2196F3",
              onaylandi: "#00BFA5",
              hazirlaniyor: "#FF9800",
              tamamlandi: "#4CAF50",
              iptal: "#F44336",
            };
            const statusLabels: Record<string, string> = {
              yeni: "Bekliyor",
              onaylandi: "Onaylandı",
              hazirlaniyor: "Hazırlanıyor",
              tamamlandi: "Tamamlandı",
              iptal: "İptal",
            };

            return (
              <div className="space-y-3" data-testid="list-orders">
                <div className="text-sm text-muted-foreground mb-2" data-testid="text-order-result-count">
                  {filteredOrders.length} sipariş gösteriliyor
                  {orderDateFrom && ` — ${new Date(orderDateFrom + "T00:00:00").toLocaleDateString("tr-TR")}'den`}
                  {orderDateTo && ` ${new Date(orderDateTo + "T00:00:00").toLocaleDateString("tr-TR")}'e kadar`}
                </div>
                {filteredOrders.map((order) => (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => setOrderDetailDialog(order)}
                            className="font-bold text-base text-primary hover:underline cursor-pointer"
                            data-testid={`btn-order-detail-${order.id}`}
                          >
                            #{order.id}
                          </button>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span data-testid={`text-order-date-${order.id}`}>
                              {new Date(order.createdAt).toLocaleDateString("tr-TR")} {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {order.customerName && (
                            <span className="text-sm font-medium" data-testid={`text-order-customer-name-${order.id}`}>{order.customerName}</span>
                          )}
                          {order.customerPhone && (
                            <button
                              onClick={() => setPhoneHistoryDialog(order.customerPhone)}
                              className="text-sm text-primary hover:underline cursor-pointer"
                              data-testid={`btn-phone-history-${order.id}`}
                            >
                              {order.customerPhone}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold" data-testid={`text-order-grand-total-${order.id}`}>
                            {order.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          </span>
                          <Badge
                            className="no-default-hover-elevate no-default-active-elevate"
                            style={{ backgroundColor: statusColors[order.status] || "#9E9E9E", color: "#fff" }}
                            data-testid={`badge-order-status-${order.id}`}
                          >
                            {statusLabels[order.status] || order.status}
                          </Badge>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatusMutation.mutate({ id: order.id, status: value })}
                          >
                            <SelectTrigger className="w-[150px] h-8 text-sm" data-testid={`select-order-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yeni">Bekliyor</SelectItem>
                              <SelectItem value="onaylandi">Onaylandı</SelectItem>
                              <SelectItem value="hazirlaniyor">Hazırlanıyor</SelectItem>
                              <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                              <SelectItem value="iptal">İptal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {order.items.length} ürün · {order.paymentMethod}
                        {order.installmentMonths && order.installmentMonths > 0 && (
                          <span> · <span className="font-medium text-blue-600 dark:text-blue-400">{order.installmentMonths} Taksit — Aylık {order.installmentMonthly?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL — Karttan {order.installmentTotal?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span></span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
          </>}
        </section>

        <Dialog open={!!phoneHistoryDialog} onOpenChange={(open) => { if (!open) setPhoneHistoryDialog(null); }}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Müşteri Sipariş Geçmişi
              </DialogTitle>
            </DialogHeader>
            {phoneHistoryDialog && (() => {
              const customerOrders = allOrders
                .filter((o) => o.customerPhone === phoneHistoryDialog)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const totalSpent = customerOrders.reduce((sum, o) => sum + o.grandTotal, 0);
              const customerName = customerOrders.find((o) => o.customerName)?.customerName;

              return (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    {customerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{customerName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{phoneHistoryDialog}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                      <span className="text-muted-foreground">Toplam Sipariş:</span>
                      <span className="font-bold">{customerOrders.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Toplam Harcama:</span>
                      <span className="font-bold">{totalSpent.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                    </div>
                  </div>

                  {customerOrders.map((order) => {
                    const statusColors: Record<string, string> = {
                      yeni: "#2196F3", hazirlaniyor: "#FF9800", onaylandi: "#00BFA5", tamamlandi: "#4CAF50", iptal: "#F44336",
                    };
                    const statusLabels: Record<string, string> = {
                      yeni: "Bekliyor", hazirlaniyor: "Hazırlanıyor", onaylandi: "Onaylandı", tamamlandi: "Tamamlandı", iptal: "İptal",
                    };
                    return (
                      <Card key={order.id} data-testid={`card-history-order-${order.id}`}>
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm">#{order.id}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString("tr-TR")} {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <Badge
                                className="no-default-hover-elevate no-default-active-elevate text-xs"
                                style={{ backgroundColor: statusColors[order.status] || "#9E9E9E", color: "#fff" }}
                              >
                                {statusLabels[order.status] || order.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="text-muted-foreground">{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm font-bold border-t pt-1">
                            <span>Toplam:</span>
                            <span>{order.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ödeme: {order.paymentMethod}
                            {order.installmentMonths && order.installmentMonths > 0 && ` — ${order.installmentMonths} Taksit`}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        <Dialog open={!!orderDetailDialog} onOpenChange={(open) => { if (!open) setOrderDetailDialog(null); }}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Sipariş Detayı #{orderDetailDialog?.id}
              </DialogTitle>
            </DialogHeader>
            {orderDetailDialog && (() => {
              const order = orderDetailDialog;
              const statusColors: Record<string, string> = {
                yeni: "#2196F3", hazirlaniyor: "#FF9800", onaylandi: "#00BFA5", tamamlandi: "#4CAF50", iptal: "#F44336",
              };
              const statusLabels: Record<string, string> = {
                yeni: "Bekliyor", hazirlaniyor: "Hazırlanıyor", onaylandi: "Onaylandı", tamamlandi: "Tamamlandı", iptal: "İptal",
              };
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <Badge
                      className="no-default-hover-elevate no-default-active-elevate"
                      style={{ backgroundColor: statusColors[order.status] || "#9E9E9E", color: "#fff" }}
                    >
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>

                  {(order.customerName || order.customerPhone || order.customerAddress) && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1.5" data-testid="section-detail-customer">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Müşteri Bilgileri</div>
                      {order.customerName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <button
                            onClick={() => { setOrderDetailDialog(null); setTimeout(() => setPhoneHistoryDialog(order.customerPhone), 200); }}
                            className="font-medium text-primary hover:underline cursor-pointer"
                          >
                            {order.customerPhone}
                          </button>
                        </div>
                      )}
                      {order.customerAddress && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{order.customerAddress}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div data-testid="section-detail-items">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ürünler</div>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                          <span>{item.quantity} x {item.name}</span>
                          <span className="font-medium">{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-1.5" data-testid="section-detail-payment">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ödeme Detayları</div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="w-3.5 h-3.5" />
                        Ödeme Yöntemi:
                      </span>
                      <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Ara Toplam:</span>
                      <span>{order.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Kargo:</span>
                      <span>{order.shipping === 0 ? "Ücretsiz" : `${order.shipping.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL`}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex items-center justify-between gap-2 text-sm text-green-600">
                        <span>İndirim:</span>
                        <span>-{order.discount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 font-bold text-base border-t pt-2 mt-2">
                      <span>Genel Toplam:</span>
                      <span>{order.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                    </div>
                  </div>

                  {order.installmentMonths && order.installmentMonths > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4" data-testid="section-detail-installment">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">
                        <CreditCard className="w-4 h-4" />
                        Taksit Detayları
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white dark:bg-background rounded-lg p-2.5 border">
                          <p className="text-xs text-muted-foreground mb-0.5">Taksit Sayısı</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{order.installmentMonths}</p>
                        </div>
                        <div className="bg-white dark:bg-background rounded-lg p-2.5 border">
                          <p className="text-xs text-muted-foreground mb-0.5">Aylık Taksit</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{order.installmentMonthly?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
                        </div>
                        <div className="bg-white dark:bg-background rounded-lg p-2.5 border">
                          <p className="text-xs text-muted-foreground mb-0.5">Karttan Çekilecek</p>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{order.installmentTotal?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.customerNote && (
                    <div className="text-sm bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3">
                      <span className="font-medium">Müşteri Notu: </span>{order.customerNote}
                    </div>
                  )}

                  <div className="border-t pt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">Durum Değiştir:</span>
                    <Select
                      value={order.status}
                      onValueChange={(value) => {
                        updateOrderStatusMutation.mutate({ id: order.id, status: value });
                        setOrderDetailDialog({ ...order, status: value });
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yeni">Bekliyor</SelectItem>
                        <SelectItem value="onaylandi">Onaylandı</SelectItem>
                        <SelectItem value="hazirlaniyor">Hazırlanıyor</SelectItem>
                        <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                        <SelectItem value="iptal">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

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
                  subcategoriesByAnimal={subcategoriesByAnimal}
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
                        {(subcategoriesByAnimal[animalInfo.id] || []).map((sc) => {
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

        <section className="mb-6" data-testid="section-subcategory-management">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold" data-testid="text-subcategory-title">Alt Kategori Yönetimi</h3>
            <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="btn-add-subcategory">
                  <Plus className="w-4 h-4 mr-1" /> Alt Kategori Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Alt Kategori Ekle</DialogTitle>
                </DialogHeader>
                <SubcategoryForm
                  onSave={(data) => {
                    createSubcategoryMutation.mutate(data);
                    setSubcategoryDialogOpen(false);
                  }}
                  isPending={createSubcategoryMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {ANIMALS.map((animalInfo) => {
              const animalSubs = allSubs.filter(s => s.animal === animalInfo.id);
              if (animalSubs.length === 0) return null;
              const AnimalIcon = animalInfo.icon;
              return (
                <Card key={animalInfo.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AnimalIcon className="w-4 h-4" />
                      <p className="font-semibold text-sm">{animalInfo.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {animalSubs.sort((a, b) => a.sortOrder - b.sortOrder).map((sub) => (
                        <div key={sub.id} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 border" data-testid={`subcategory-tag-${sub.id}`}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span className="text-xs font-medium">{sub.displayName.replace(/\n/g, " ")}</span>
                          {sub.hasBrands && <Badge variant="secondary" className="text-[9px] no-default-hover-elevate no-default-active-elevate">Marka</Badge>}
                          <button
                            className="text-muted-foreground/50 ml-0.5"
                            onClick={() => {
                              if (confirm(`"${sub.displayName.replace(/\n/g, " ")}" alt kategorisi silinecek. Emin misiniz?`)) {
                                deleteSubcategoryMutation.mutate(sub.id);
                              }
                            }}
                            data-testid={`btn-delete-subcategory-${sub.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => { setEditingProduct(p); setEditDialogOpen(true); }}
                            data-testid={`btn-skt-edit-${p.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                            Düzenle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => toggleActiveMutation.mutate({ id: p.id, isActive: !p.isActive })}
                            data-testid={`btn-skt-toggle-${p.id}`}
                          >
                            {p.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {p.isActive ? "Durdur" : "Yayınla"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              if (confirm(`"${p.name}" ürününü silmek istediğinize emin misiniz?`)) {
                                deleteProductMutation.mutate(p.id);
                              }
                            }}
                            data-testid={`btn-skt-delete-${p.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            Sil
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-6" data-testid="section-stock-alerts">
          <h2 className="text-lg font-bold mb-4" data-testid="text-section-stock-alerts">
            <Bell className="w-5 h-5 inline-block mr-2" />
            Stok Bildirimleri
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({stockAlerts.length})
            </span>
          </h2>
          {stockAlertsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : stockAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Henüz stok bildirimi yok
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stockAlerts.map((alert) => (
                <Card key={alert.id} data-testid={`stock-alert-item-${alert.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-semibold" data-testid={`text-alert-product-${alert.id}`}>
                          {alert.productName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span data-testid={`text-alert-name-${alert.id}`}>{alert.customerName}</span>
                          <span data-testid={`text-alert-phone-${alert.id}`}>{alert.phone}</span>
                          <span>{new Date(alert.createdAt).toLocaleDateString("tr-TR")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!alert.isNotified && (
                          <a
                            href={`https://wa.me/90${alert.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(`Merhaba ${alert.customerName}, ilgilendiginiz "${alert.productName}" urunu tekrar stoklarimizda! Siparis vermek icin JETGO'i ziyaret edin.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-white"
                            style={{ backgroundColor: "#25D366" }}
                            onClick={async () => {
                              try {
                                await apiRequest("POST", `/api/admin/stock-alerts/${alert.productId}/notify`, {});
                                queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-alerts"] });
                              } catch {}
                            }}
                            data-testid={`btn-notify-stock-${alert.id}`}
                          >
                            <SiWhatsapp className="w-3 h-3" />
                            Bildir
                          </a>
                        )}
                        <Badge
                          className="text-[10px] no-default-hover-elevate"
                          style={{ backgroundColor: alert.isNotified ? "#4CAF50" : "#ff9800", color: "#fff" }}
                        >
                          {alert.isNotified ? "Bildirildi" : "Bekliyor"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6" data-testid="section-loyalty-points">
          <h2 className="text-lg font-bold mb-4" data-testid="text-section-loyalty">
            <Star className="w-5 h-5 inline-block mr-2" />
            Para Puan Yönetimi
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({loyaltyCustomers.length} müşteri)
            </span>
          </h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select value={lpCustomerId} onValueChange={setLpCustomerId}>
                  <SelectTrigger data-testid="select-lp-customer">
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60">
                    {loyaltyCustomers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.phone}) - {Math.round(c.balance)} P
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Puan (+/-)"
                  value={lpAmount}
                  onChange={(e) => setLpAmount(e.target.value)}
                  data-testid="input-lp-amount"
                />
                <Input
                  placeholder="Açıklama"
                  value={lpDescription}
                  onChange={(e) => setLpDescription(e.target.value)}
                  data-testid="input-lp-description"
                />
              </div>
              <Button
                size="sm"
                disabled={!lpCustomerId || !lpAmount || isNaN(parseFloat(lpAmount)) || parseFloat(lpAmount) === 0 || addPointsMutation.isPending}
                onClick={() => {
                  addPointsMutation.mutate({
                    customerId: parseInt(lpCustomerId),
                    amount: parseFloat(lpAmount),
                    description: lpDescription || (parseFloat(lpAmount) >= 0 ? "Admin tarafından eklendi" : "Admin tarafından düşüldü"),
                  });
                }}
                data-testid="btn-add-points"
              >
                {addPointsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Puan Ekle/Düş
              </Button>

              {loyaltyLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : loyaltyCustomers.length > 0 && (
                <div className="space-y-1 mt-2 max-h-60 overflow-y-auto">
                  {loyaltyCustomers.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/30" data-testid={`row-loyalty-${c.id}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                      </div>
                      <Badge
                        className="text-xs no-default-hover-elevate shrink-0"
                        style={{ backgroundColor: c.balance > 0 ? "#4CAF50" : c.balance < 0 ? "#f44336" : "#9e9e9e", color: "#fff" }}
                      >
                        {Math.round(c.balance * 100) / 100} P
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold" data-testid="text-section-products">
                Ürünler
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredProducts.length})
                </span>
              </h2>
              <Select value={selectedAnimalFilter} onValueChange={(val) => { setSelectedAnimalFilter(val); setSelectedSubcategoryFilter("all"); setSelectedBrandFilter("all"); }}>
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
                <Select value={selectedSubcategoryFilter} onValueChange={(val) => { setSelectedSubcategoryFilter(val); setSelectedBrandFilter("all"); }}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-subcategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Alt Kategoriler</SelectItem>
                    {(subcategoriesByAnimal[selectedAnimalFilter] || []).map((sc) => (
                      <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {filteredBrands.length > 0 && (
                <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-brand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Markalar</SelectItem>
                    {filteredBrands.map((b) => (
                      <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const dbImgCount = filteredProducts.filter(p => p.img?.startsWith("/api/product-image/")).length;
                const extCount = filteredProducts.filter(p => p.img && p.img.startsWith("http")).length;
                const noImgCount = filteredProducts.filter(p => !p.img).length;
                return (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{dbImgCount} Resimli</span>
                    {extCount > 0 && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />{extCount} Dış</span>}
                    {noImgCount > 0 && <span className="flex items-center gap-1 text-muted-foreground">{noImgCount} Resim yok</span>}
                  </div>
                );
              })()}
              <Dialog open={bulkPriceDialogOpen} onOpenChange={(open) => { setBulkPriceDialogOpen(open); if (!open) { setBulkPricePercent(""); setIndividualPrices({}); } }}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={filteredProducts.length === 0} data-testid="btn-bulk-price">
                    <TrendingUp className="w-4 h-4" />
                    Toplu Fiyat Güncelle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Toplu Fiyat Güncelleme</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Seçili filtredeki <span className="font-bold text-foreground">{filteredProducts.length}</span> ürün
                    </p>
                  </DialogHeader>
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant={bulkPriceMode === "individual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBulkPriceMode("individual")}
                      data-testid="btn-mode-individual"
                    >
                      Tek Tek Güncelle
                    </Button>
                    <Button
                      variant={bulkPriceMode === "percent" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBulkPriceMode("percent")}
                      data-testid="btn-mode-percent"
                    >
                      Yüzdesel Güncelle
                    </Button>
                  </div>

                  {bulkPriceMode === "individual" ? (
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="overflow-y-auto flex-1 border rounded-lg" style={{ maxHeight: "50vh" }}>
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-background border-b">
                            <tr>
                              <th className="text-left p-2 font-medium">Ürün</th>
                              <th className="text-right p-2 font-medium w-28">Mevcut</th>
                              <th className="text-right p-2 font-medium w-32">Yeni Fiyat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((p) => (
                              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-2 text-xs leading-tight" data-testid={`text-product-name-${p.id}`}>{p.name}</td>
                                <td className="p-2 text-right text-xs text-muted-foreground whitespace-nowrap">{p.price > 0 ? `${p.price} ₺` : "—"}</td>
                                <td className="p-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={p.price > 0 ? String(p.price) : "0"}
                                    value={individualPrices[p.id] || ""}
                                    onChange={(e) => setIndividualPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                                    className="h-8 text-sm text-right w-28"
                                    data-testid={`input-price-${p.id}`}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          {Object.values(individualPrices).filter(v => v && !isNaN(parseFloat(v))).length} ürün değiştirildi
                        </p>
                        <Button
                          disabled={Object.values(individualPrices).filter(v => v && !isNaN(parseFloat(v))).length === 0 || bulkIndividualUpdateMutation.isPending}
                          onClick={() => {
                            const updates = Object.entries(individualPrices)
                              .filter(([_, v]) => v && !isNaN(parseFloat(v)))
                              .map(([id, v]) => ({ id: parseInt(id), price: parseFloat(v) }));
                            if (updates.length > 0) bulkIndividualUpdateMutation.mutate({ updates });
                          }}
                          data-testid="btn-save-individual-prices"
                        >
                          {bulkIndividualUpdateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>Fiyatları Kaydet</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Fiyat Değişim Oranı (%)</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">%</span>
                          <Input
                            type="number"
                            placeholder="Örn: 20"
                            value={bulkPricePercent}
                            onChange={(e) => setBulkPricePercent(e.target.value)}
                            data-testid="input-bulk-price-percent"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pozitif değer fiyatı artırır, negatif değer düşürür. Örn: 20 = %20 artış, -10 = %10 düşüş
                        </p>
                      </div>
                      {bulkPricePercent && !isNaN(parseFloat(bulkPricePercent)) && parseFloat(bulkPricePercent) !== 0 && (
                        <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                          <p className="text-sm font-medium">Önizleme:</p>
                          <p className="text-xs text-muted-foreground">
                            100 TL → {(100 * (1 + parseFloat(bulkPricePercent) / 100)).toFixed(2)} TL
                          </p>
                          <p className="text-xs text-muted-foreground">
                            500 TL → {(500 * (1 + parseFloat(bulkPricePercent) / 100)).toFixed(2)} TL
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1000 TL → {(1000 * (1 + parseFloat(bulkPricePercent) / 100)).toFixed(2)} TL
                          </p>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        disabled={!bulkPricePercent || isNaN(parseFloat(bulkPricePercent)) || parseFloat(bulkPricePercent) === 0 || bulkPriceUpdateMutation.isPending}
                        onClick={() => {
                          const pct = parseFloat(bulkPricePercent);
                          if (isNaN(pct) || pct === 0) return;
                          bulkPriceUpdateMutation.mutate({
                            productIds: filteredProducts.map((p) => p.id),
                            percentage: pct,
                          });
                        }}
                        data-testid="btn-confirm-bulk-price"
                      >
                        {bulkPriceUpdateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            {filteredProducts.length} Ürünü Güncelle
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="btn-add-product">
                    <Plus className="w-4 h-4" />
                    Yeni Ürün
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    categories={categories}
                    onSave={(data) => createProductMutation.mutate(data)}
                    isPending={createProductMutation.isPending}
                    subcategoriesByAnimal={subcategoriesByAnimal}
                  />
                </DialogContent>
              </Dialog>
            </div>
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
                      <div className="relative shrink-0">
                        {product.img ? (
                          <img
                            src={product.img}
                            alt={product.name}
                            className="w-14 h-14 object-contain rounded-md bg-muted/30"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-muted/30 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                        {product.img?.startsWith("/api/product-image/") ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center" title="DB Resim">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        ) : product.img ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center" title="Dış URL">
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </span>
                        ) : null}
                      </div>
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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                subcategoriesByAnimal={subcategoriesByAnimal}
              />
            )}
          </DialogContent>
        </Dialog>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-bold" data-testid="text-section-cross-sell">Sıklıkla Birlikte Alınan Ürünler</h2>
            <Dialog open={crossSellDialogOpen} onOpenChange={(open) => {
              setCrossSellDialogOpen(open);
              if (!open) { setCsNewAnimal("all"); setCsNewSub("all"); setCsNewBrand("all"); setNewSectionForProductId(""); }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-cross-sell-section">
                  <Plus className="w-4 h-4" />
                  Yeni Bölüm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
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
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <Select value={csNewAnimal} onValueChange={(val) => { setCsNewAnimal(val); setCsNewSub("all"); setCsNewBrand("all"); setNewSectionForProductId(""); }}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Hayvanlar</SelectItem>
                          {ANIMALS.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {csNewAnimal !== "all" && (
                        <Select value={csNewSub} onValueChange={(val) => { setCsNewSub(val); setCsNewBrand("all"); setNewSectionForProductId(""); }}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tüm Alt Kat.</SelectItem>
                            {(subcategoriesByAnimal[csNewAnimal] || []).map((sc) => (
                              <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {csNewSub !== "all" && (() => {
                        const brandsInSub = categories.filter(c => c.animal === csNewAnimal && c.subcategory === csNewSub);
                        return brandsInSub.length > 1 ? (
                          <Select value={csNewBrand} onValueChange={(val) => { setCsNewBrand(val); setNewSectionForProductId(""); }}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm Markalar</SelectItem>
                              {brandsInSub.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.brandName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null;
                      })()}
                    </div>
                    {(() => {
                      let filtered = allProducts;
                      if (csNewAnimal !== "all") {
                        const catIds = new Set(categories.filter(c => {
                          if (c.animal !== csNewAnimal) return false;
                          if (csNewSub !== "all" && c.subcategory !== csNewSub) return false;
                          if (csNewBrand !== "all" && String(c.id) !== csNewBrand) return false;
                          return true;
                        }).map(c => c.id));
                        filtered = filtered.filter(p => catIds.has(p.brandCategoryId));
                      }
                      return (
                        <>
                          <Select value={newSectionForProductId} onValueChange={setNewSectionForProductId}>
                            <SelectTrigger data-testid="select-cross-sell-for-product">
                              <SelectValue placeholder={`Ürün seçin (${filtered.length})`} />
                            </SelectTrigger>
                            <SelectContent>
                              {filtered.map((p: Product) => (
                                <SelectItem key={p.id} value={String(p.id)} data-testid={`option-for-product-${p.id}`}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">{filtered.length} ürün listeleniyor</p>
                        </>
                      );
                    })()}
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
            setCsAnimalFilter("all");
            setCsSubFilter("all");
            setCsBrandFilter("all");
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bölüme Ürün Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Select value={csAnimalFilter} onValueChange={(val) => { setCsAnimalFilter(val); setCsSubFilter("all"); setCsBrandFilter("all"); setSelectedProductId(""); }}>
                  <SelectTrigger className="h-9 text-xs" data-testid="select-cs-animal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Hayvanlar</SelectItem>
                    {ANIMALS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {csAnimalFilter !== "all" && (
                  <Select value={csSubFilter} onValueChange={(val) => { setCsSubFilter(val); setCsBrandFilter("all"); setSelectedProductId(""); }}>
                    <SelectTrigger className="h-9 text-xs" data-testid="select-cs-sub">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Alt Kat.</SelectItem>
                      {(subcategoriesByAnimal[csAnimalFilter] || []).map((sc) => (
                        <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {csSubFilter !== "all" && (() => {
                  const brandsInSub = categories.filter(c => c.animal === csAnimalFilter && c.subcategory === csSubFilter);
                  return brandsInSub.length > 1 ? (
                    <Select value={csBrandFilter} onValueChange={(val) => { setCsBrandFilter(val); setSelectedProductId(""); }}>
                      <SelectTrigger className="h-9 text-xs" data-testid="select-cs-brand">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Markalar</SelectItem>
                        {brandsInSub.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>{b.brandName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null;
                })()}
              </div>
              <div className="space-y-2">
                <Label>Ürün Seçin</Label>
                {(() => {
                  let filtered = allProducts;
                  if (csAnimalFilter !== "all") {
                    const catIds = new Set(categories.filter(c => {
                      if (c.animal !== csAnimalFilter) return false;
                      if (csSubFilter !== "all" && c.subcategory !== csSubFilter) return false;
                      if (csBrandFilter !== "all" && String(c.id) !== csBrandFilter) return false;
                      return true;
                    }).map(c => c.id));
                    filtered = filtered.filter(p => catIds.has(p.brandCategoryId));
                  }
                  return (
                    <>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger data-testid="select-cross-sell-product">
                          <SelectValue placeholder={`Ürün seçin (${filtered.length} ürün)`} />
                        </SelectTrigger>
                        <SelectContent>
                          {filtered.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)} data-testid={`option-cross-sell-product-${p.id}`}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{filtered.length} ürün listeleniyor</p>
                    </>
                  );
                })()}
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
            <h2 className="text-lg font-bold" data-testid="text-section-installment-rates">
              Taksit Oranları
            </h2>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {installmentRates.length > 0 && (
                <div className="space-y-2" data-testid="list-installment-rates">
                  {installmentRates
                    .sort((a, b) => a.months - b.months)
                    .map((rate) => (
                      <div
                        key={rate.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/30"
                        data-testid={`row-installment-rate-${rate.id}`}
                      >
                        {editingInstId === rate.id ? (
                          <>
                            <Input
                              type="number"
                              value={editInstMonths}
                              onChange={(e) => setEditInstMonths(e.target.value)}
                              className="w-20 h-8"
                              placeholder="Ay"
                              data-testid="input-edit-inst-months"
                            />
                            <span className="text-sm text-muted-foreground">Taksit</span>
                            <span className="text-sm text-muted-foreground">%</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={editInstRate}
                              onChange={(e) => setEditInstRate(e.target.value)}
                              className="w-24 h-8"
                              placeholder="Oran"
                              data-testid="input-edit-inst-rate"
                            />
                            <div className="flex gap-1 ml-auto">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7"
                                onClick={() => {
                                  const m = parseInt(editInstMonths);
                                  const r = parseFloat(editInstRate);
                                  if (isNaN(m) || isNaN(r) || m < 1 || r < 0) return;
                                  updateInstallmentMutation.mutate({
                                    id: rate.id,
                                    data: { months: m, rate: r },
                                  });
                                }}
                                data-testid="btn-save-inst-edit"
                              >
                                Kaydet
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={() => setEditingInstId(null)}
                                data-testid="btn-cancel-inst-edit"
                              >
                                İptal
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-bold w-16">{rate.months} Taksit</span>
                            <span className="text-sm font-medium flex-1">%{rate.rate}</span>
                            <Badge
                              variant={rate.isActive ? "default" : "secondary"}
                              className="no-default-hover-elevate cursor-pointer"
                              onClick={() =>
                                updateInstallmentMutation.mutate({
                                  id: rate.id,
                                  data: { isActive: !rate.isActive },
                                })
                              }
                              data-testid={`badge-inst-active-${rate.id}`}
                            >
                              {rate.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingInstId(rate.id);
                                setEditInstMonths(String(rate.months));
                                setEditInstRate(String(rate.rate));
                              }}
                              data-testid={`btn-edit-inst-${rate.id}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteInstallmentMutation.mutate(rate.id)}
                              data-testid={`btn-delete-inst-${rate.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                <Input
                  type="number"
                  placeholder="Ay sayısı"
                  value={newInstMonths}
                  onChange={(e) => setNewInstMonths(e.target.value)}
                  className="w-24"
                  data-testid="input-new-inst-months"
                />
                <span className="text-sm text-muted-foreground">Taksit</span>
                <span className="text-sm text-muted-foreground">%</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Oran"
                  value={newInstRate}
                  onChange={(e) => setNewInstRate(e.target.value)}
                  className="w-24"
                  data-testid="input-new-inst-rate"
                />
                <Button
                  size="sm"
                  disabled={!newInstMonths || !newInstRate || isNaN(parseInt(newInstMonths)) || isNaN(parseFloat(newInstRate)) || parseInt(newInstMonths) < 1 || parseFloat(newInstRate) < 0 || createInstallmentMutation.isPending}
                  onClick={() => {
                    const m = parseInt(newInstMonths);
                    const r = parseFloat(newInstRate);
                    if (isNaN(m) || isNaN(r) || m < 1 || r < 0) return;
                    createInstallmentMutation.mutate({
                      months: m,
                      rate: r,
                      sortOrder: installmentRates.length + 1,
                    });
                  }}
                  data-testid="btn-add-installment"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

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

        <ReorderRemindersSection />
      </main>
    </div>
  );
}

function ReorderRemindersSection() {
  const { data: reminders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reorder-reminders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/reorder-reminders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reorder-reminders"] });
    },
  });

  const now = new Date();
  const pending = reminders.filter((r: any) => r.status === "pending");
  const upcoming = pending.filter((r: any) => new Date(r.reorderDate) <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000));
  const overdue = pending.filter((r: any) => new Date(r.reorderDate) <= now);

  const buildWhatsAppLink = (r: any) => {
    const msg = `Merhaba ${r.customerName || ""}!\n\nDaha önce aldığınız *${r.productName}* mamayı yakında bitirmiş olabilirsiniz.\n\nYeni sipariş vermek ister misiniz?\n\nJETGO - Hızlı Sipariş`;
    return `https://wa.me/${r.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-lg font-bold" data-testid="text-section-reorder-reminders">
          Tekrar Sipariş Hatırlatmaları
          {overdue.length > 0 && (
            <Badge variant="destructive" className="ml-2 no-default-hover-elevate" data-testid="badge-overdue-count">
              {overdue.length} acil
            </Badge>
          )}
          {upcoming.length > 0 && upcoming.length !== overdue.length && (
            <Badge variant="secondary" className="ml-2 no-default-hover-elevate" data-testid="badge-upcoming-count">
              {upcoming.length} yaklaşan
            </Badge>
          )}
        </h2>
      </div>

      <Card>
        <CardContent className="p-4">
          {isLoading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>}

          {!isLoading && pending.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-reminders">
              Bekleyen hatırlatma yok
            </p>
          )}

          {!isLoading && pending.length > 0 && (
            <div className="space-y-3" data-testid="list-reorder-reminders">
              {pending
                .sort((a: any, b: any) => new Date(a.reorderDate).getTime() - new Date(b.reorderDate).getTime())
                .map((r: any) => {
                  const reorderDate = new Date(r.reorderDate);
                  const isOverdue = reorderDate <= now;
                  const daysLeft = Math.ceil((reorderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-lg border ${isOverdue ? "border-red-300 bg-red-50" : daysLeft <= 3 ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-white"}`}
                      data-testid={`row-reminder-${r.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold truncate">{r.productName}</span>
                            <Badge variant="outline" className="text-xs shrink-0 no-default-hover-elevate">
                              {r.animalType === "kedi" ? "Kedi" : "Köpek"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span><Phone className="w-3 h-3 inline mr-0.5" />{r.customerPhone}</span>
                            {r.customerName && <span><User className="w-3 h-3 inline mr-0.5" />{r.customerName}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                            <span className="text-muted-foreground">
                              <Calendar className="w-3 h-3 inline mr-0.5" />
                              {reorderDate.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-muted-foreground">
                              Günlük {r.dailyGrams}gr · {r.packageGrams >= 1000 ? `${r.packageGrams / 1000}kg` : `${r.packageGrams}gr`} paket · {r.estimatedDays} gün
                            </span>
                          </div>
                          <div className="mt-1">
                            {isOverdue ? (
                              <span className="text-xs font-bold text-red-600" data-testid={`text-reminder-status-${r.id}`}>
                                <AlertTriangle className="w-3 h-3 inline mr-0.5" /> Mama bitmiş olabilir!
                              </span>
                            ) : daysLeft <= 3 ? (
                              <span className="text-xs font-bold text-yellow-700" data-testid={`text-reminder-status-${r.id}`}>
                                <Clock className="w-3 h-3 inline mr-0.5" /> {daysLeft} gün kaldı
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground" data-testid={`text-reminder-status-${r.id}`}>
                                {daysLeft} gün kaldı
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <a
                            href={buildWhatsAppLink(r)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white"
                            style={{ backgroundColor: "#25D366" }}
                            onClick={() => updateStatusMutation.mutate({ id: r.id, status: "notified" })}
                            data-testid={`btn-whatsapp-reminder-${r.id}`}
                          >
                            <SiWhatsapp className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: r.id, status: "completed" })}
                            data-testid={`btn-complete-reminder-${r.id}`}
                          >
                            <Check className="w-3 h-3 mr-0.5" />
                            Tamamla
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {reminders.filter((r: any) => r.status !== "pending").length > 0 && (
            <details className="mt-4 pt-3 border-t">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                Tamamlanan hatırlatmalar ({reminders.filter((r: any) => r.status !== "pending").length})
              </summary>
              <div className="space-y-2 mt-2">
                {reminders
                  .filter((r: any) => r.status !== "pending")
                  .sort((a: any, b: any) => new Date(b.notifiedAt || b.createdAt).getTime() - new Date(a.notifiedAt || a.createdAt).getTime())
                  .slice(0, 10)
                  .map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 rounded bg-muted/30" data-testid={`row-completed-reminder-${r.id}`}>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="truncate flex-1">{r.customerPhone} - {r.productName}</span>
                      <span>{r.status === "notified" ? "Bildirildi" : "Tamamlandı"}</span>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </section>
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
