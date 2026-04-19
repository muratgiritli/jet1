import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Image as ImageLucide,
  BarChart3,
  Send,
  ChevronUp,
  ScanLine,
  Camera,
  Save,
  Settings,
  LogIn,
  ThumbsUp,
  Mail,
  Trash2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, BrandCategory, CrossSellSection, CrossSellItem, Order, BreedStat, StockAlert, Subcategory } from "@shared/schema";

const ANIMALS = [
  { id: "kedi", name: "Kedi", icon: Cat },
  { id: "kopek", name: "Köpek", icon: Dog },
  { id: "kus", name: "Kuş", icon: Bird },
  { id: "kemirgen", name: "Kemirgen", icon: Rabbit },
];

function useSubcategories() {
  const { data: allSubs = [] } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories", "all"],
    queryFn: () => fetch("/api/subcategories?all=true").then(r => r.json()),
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

function BrandTag({ brand, count, onDelete, onUpdate }: { brand: any; count: number; onDelete: () => void; onUpdate: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(brand.brandName);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 bg-background rounded-md px-2 py-1 border border-blue-300" data-testid={`brand-tag-${brand.id}`}>
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-6 text-xs w-28 px-1.5"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && editName.trim()) { onUpdate(editName.trim()); setEditing(false); }
            if (e.key === "Escape") { setEditName(brand.brandName); setEditing(false); }
          }}
          data-testid={`input-edit-brand-${brand.id}`}
        />
        <button
          className="text-green-600 hover:text-green-700"
          onClick={(e) => { e.stopPropagation(); if (editName.trim()) { onUpdate(editName.trim()); setEditing(false); } }}
          data-testid={`btn-save-brand-${brand.id}`}
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); setEditName(brand.brandName); setEditing(false); }}
          data-testid={`btn-cancel-edit-brand-${brand.id}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-background rounded-md px-2.5 py-1.5 border" data-testid={`brand-tag-${brand.id}`}>
      <span className="text-xs font-medium">{brand.brandName}</span>
      <Badge variant="secondary" className="text-[10px] no-default-hover-elevate no-default-active-elevate">
        {count}
      </Badge>
      <button
        className="text-muted-foreground/50 hover:text-blue-600 ml-0.5"
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        data-testid={`btn-edit-brand-${brand.id}`}
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        className="text-muted-foreground/50 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`"${brand.brandName}" markası ve tüm ürünleri silinecek. Emin misiniz?`)) {
            onDelete();
          }
        }}
        data-testid={`btn-delete-category-${brand.id}`}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

function ProductForm({
  categories,
  product,
  onSave,
  isPending,
  subcategoriesByAnimal,
  campaignInfo,
  onCampaignPriceChange,
}: {
  categories: BrandCategory[];
  product?: Product;
  onSave: (data: any) => void;
  isPending: boolean;
  subcategoriesByAnimal: Record<string, { slug: string; name: string }[]>;
  campaignInfo?: { id: number; itemType: string; campaignPrice: string | null } | null;
  onCampaignPriceChange?: (campaignItemId: number, price: string | null) => void;
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
  const [barcode, setBarcode] = useState(product?.barcode || "");
  const [costPrice, setCostPrice] = useState(product?.costPrice?.toString() || "");
  const [mamaType, setMamaType] = useState(product?.mamaType || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [brandCategoryId, setBrandCategoryId] = useState(
    product?.brandCategoryId?.toString() || ""
  );
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLoading, setNewBrandLoading] = useState(false);
  const { toast } = useToast();

  const availableSubcategories = subcategoriesByAnimal[selectedAnimal] || [];

  const filteredCategories = categories.filter(
    (c) => c.animal === selectedAnimal && c.subcategory === selectedSubcategory
  );

  const handleAddNewBrand = async () => {
    if (!newBrandName.trim() || !selectedAnimal || !selectedSubcategory) return;
    setNewBrandLoading(true);
    try {
      const slug = newBrandName.trim().toLowerCase()
        .replace(/ö/g,"o").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ç/g,"c")
        .replace(/ı/g,"i").replace(/ğ/g,"g").replace(/İ/g,"i").replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const res = await apiRequest("POST", "/api/admin/brand-categories", {
        brandName: newBrandName.trim(),
        brandSlug: slug,
        animal: selectedAnimal,
        subcategory: selectedSubcategory,
      });
      const created = await res.json();
      queryClient.setQueryData(["/api/brand-categories"], (old: any[]) =>
        old ? [...old, created] : [created]
      );
      setBrandCategoryId(String(created.id));
      setNewBrandName("");
      setShowNewBrand(false);
      toast({ title: `"${created.brandName}" markası eklendi` });
    } catch (err: any) {
      let msg = "Marka eklenemedi";
      try { msg = JSON.parse(err.message.replace(/^\d+:\s*/, "")).message; } catch {}
      toast({ title: msg, variant: "destructive" });
    } finally {
      setNewBrandLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          skt: skt || null,
          img: img || null,
          brandCategoryId: parseInt(brandCategoryId),
          stock: parseInt(stock) || 0,
          barcode: barcode.trim() || null,
          mamaType: mamaType || null,
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

      {selectedSubcategory && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Marka</Label>
            {selectedAnimal && selectedSubcategory && !showNewBrand && (
              <button
                type="button"
                onClick={() => setShowNewBrand(true)}
                className="text-xs font-medium flex items-center gap-1 hover:underline"
                style={{ color: "#6B3480" }}
                data-testid="btn-add-new-brand"
              >
                <Plus className="w-3 h-3" /> Yeni Marka Ekle
              </button>
            )}
          </div>
          {filteredCategories.length > 0 && !showNewBrand && (
            <Select
              value={brandCategoryId}
              onValueChange={setBrandCategoryId}
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
          )}
          {filteredCategories.length === 0 && !showNewBrand && (
            <p className="text-xs text-amber-600">Bu alt kategoride henüz marka yok. Yeni marka ekleyebilirsiniz.</p>
          )}
          {showNewBrand && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Marka adı girin"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddNewBrand(); } }}
                  data-testid="input-new-brand-name"
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddNewBrand}
                disabled={newBrandLoading || !newBrandName.trim()}
                style={{ backgroundColor: "#6B3480" }}
                data-testid="btn-save-new-brand"
              >
                {newBrandLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setShowNewBrand(false); setNewBrandName(""); }}
                data-testid="btn-cancel-new-brand"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Ürün Adı</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-product-name" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Satış Fiyatı (TL)</Label>
          <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required data-testid="input-product-price" />
        </div>
        <div className="space-y-2">
          <Label>Eski Fiyat (TL)</Label>
          <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} data-testid="input-product-original-price" />
        </div>
        <div className="space-y-2">
          <Label>Alış Fiyatı (TL)</Label>
          <Input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="Maliyet" data-testid="input-product-cost-price" />
        </div>
      </div>
      {campaignInfo && (
        <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#fff3e0", border: "1px solid #ffe0b2" }}>
          <Label className="text-orange-800 font-bold flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            Kampanya Fiyatı (TL) — {campaignInfo.itemType === "main" ? "Ana Ürün" : "Ek Ürün"}
          </Label>
          <Input
            type="number"
            step="0.01"
            defaultValue={campaignInfo.campaignPrice || ""}
            onBlur={(e) => {
              const val = e.target.value.trim();
              onCampaignPriceChange?.(campaignInfo.id, val === "" ? null : val);
            }}
            placeholder="Kampanya fiyatı girin"
            className="border-orange-300 focus:border-orange-500"
            data-testid="input-campaign-price"
          />
          {campaignInfo.campaignPrice && price && (
            <p className="text-xs text-orange-700">
              İndirim: %{Math.round((1 - Number(campaignInfo.campaignPrice) / Number(price)) * 100)} — Normal: {Number(price).toLocaleString("tr-TR")} TL → Kampanya: {Number(campaignInfo.campaignPrice).toLocaleString("tr-TR")} TL
            </p>
          )}
        </div>
      )}
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Barkod Numarası</Label>
          <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="8690000000000" className="font-mono" data-testid="input-product-barcode" />
        </div>
        <div className="space-y-2">
          <Label>Mama Türü</Label>
          <Select value={mamaType || "none"} onValueChange={(v) => setMamaType(v === "none" ? "" : v)}>
            <SelectTrigger data-testid="select-mama-type">
              <SelectValue placeholder="Seçiniz (opsiyonel)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Seçim Yok</SelectItem>
              <SelectItem value="yavru">Yavru</SelectItem>
              <SelectItem value="yetiskin">Yetişkin</SelectItem>
              <SelectItem value="kisir">Kısır</SelectItem>
              <SelectItem value="yasli">Yaşlı</SelectItem>
              <SelectItem value="ozel-seri">Özel Seri</SelectItem>
              <SelectItem value="veteriner">Veteriner</SelectItem>
              <SelectItem value="hipoalerjenik">Hipoalerjenik</SelectItem>
              <SelectItem value="mini-irk">Mini Irk</SelectItem>
              <SelectItem value="buyuk-irk">Büyük Irk</SelectItem>
            </SelectContent>
          </Select>
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
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<string>("none");
  const [sortMode, setSortMode] = useState<string>("default");
  const [expandedAnimals, setExpandedAnimals] = useState<Record<string, boolean>>({});
  const [bulkPriceDialogOpen, setBulkPriceDialogOpen] = useState(false);
  const [bulkPricePercent, setBulkPricePercent] = useState("");
  const [bulkPriceMode, setBulkPriceMode] = useState<"percent" | "individual">("individual");
  const [individualPrices, setIndividualPrices] = useState<Record<number, string>>({});
  const [bulkStockDialogOpen, setBulkStockDialogOpen] = useState(false);
  const [individualStocks, setIndividualStocks] = useState<Record<number, string>>({});
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [campaignExpanded, setCampaignExpanded] = useState(false);
  const [campaignAddType, setCampaignAddType] = useState<"main" | "extra">("main");
  const [campaignProductId, setCampaignProductId] = useState("");
  const [campaignSortOrder, setCampaignSortOrder] = useState("1");
  const [campaignAddDialogOpen, setCampaignAddDialogOpen] = useState(false);
  const [campaignAddProductId, setCampaignAddProductId] = useState<number | null>(null);
  const [campaignParentProductId, setCampaignParentProductId] = useState<number | null>(null);
  const [extraSearchQuery, setExtraSearchQuery] = useState("");
  const [extraAnimalFilter, setExtraAnimalFilter] = useState<string>("all");
  const [extraSubcategoryFilter, setExtraSubcategoryFilter] = useState<string>("all");
  const [orderTab, setOrderTab] = useState<"gelen" | "giden" | "bekleyen">("gelen");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [phoneHistoryDialog, setPhoneHistoryDialog] = useState<string | null>(null);
  const [orderSearchPhone, setOrderSearchPhone] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "campaign" | "normal">("all");
  const [orderDetailDialog, setOrderDetailDialog] = useState<Order | null>(null);
  const [neighborhoodExpanded, setNeighborhoodExpanded] = useState(false);
  const [nhDialogOpen, setNhDialogOpen] = useState(false);
  const [editingNh, setEditingNh] = useState<any | null>(null);
  const [nhDistrict, setNhDistrict] = useState("Atakum");
  const [nhName, setNhName] = useState("");
  const [nhDistance, setNhDistance] = useState("");
  const [nhMinOrder, setNhMinOrder] = useState("700");
  const [nhShipFee, setNhShipFee] = useState("89");
  const [nhFreeShipLimit, setNhFreeShipLimit] = useState("2000");
  const [nhSortOrder, setNhSortOrder] = useState("0");
  const [nhDistrictFilter, setNhDistrictFilter] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<string>("yonetim");
  const [yonetimSub, setYonetimSub] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<{id: number; customerName: string; grandTotal: number; paymentMethod: string} | null>(null);
  const lastKnownOrderIdRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(i === 1 ? 880 : 660, now + i * 0.3);
        gain.gain.setValueAtTime(0.3, now + i * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.25);
        osc.start(now + i * 0.3);
        osc.stop(now + i * 0.3 + 0.25);
      }
    } catch (e) {
      console.error("Audio play error:", e);
    }
  }, []);

  const baselineLoadedRef = useRef(false);

  useEffect(() => {
    if (!notificationEnabled) return;
    const checkOrders = async () => {
      try {
        const res = await fetch("/api/admin/new-order-check", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!baselineLoadedRef.current) {
          lastKnownOrderIdRef.current = data.lastId || 0;
          baselineLoadedRef.current = true;
          return;
        }
        if (data.hasNew && data.lastId > lastKnownOrderIdRef.current) {
          playNotificationSound();
          setNewOrderAlert(data.latest);
          queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
          lastKnownOrderIdRef.current = data.lastId;
          setTimeout(() => setNewOrderAlert(null), 15000);
        }
      } catch {}
    };
    checkOrders();
    const interval = setInterval(checkOrders, 10000);
    return () => clearInterval(interval);
  }, [notificationEnabled, playNotificationSound]);

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

  const bulkStockUpdateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: { id: number; stock: number }[] }) => {
      await apiRequest("POST", "/api/admin/products/bulk-stock-update", { updates });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setBulkStockDialogOpen(false);
      setIndividualStocks({});
      toast({ title: "Başarılı", description: `${variables.updates.length} ürün stoğu güncellendi.` });
    },
    onError: () => {
      toast({ title: "Hata", description: "Stok güncellenirken bir hata oluştu.", variant: "destructive" });
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

  const { data: productCampaignIds = [] } = useQuery<number[]>({
    queryKey: ["/api/admin/campaign-product-ids"],
    queryFn: async () => {
      const res = await fetch("/api/admin/campaign-items", { credentials: "include" });
      const items = await res.json();
      return items.filter((i: any) => i.is_active).map((i: any) => i.product_id);
    },
  });
  const campaignIdSet = useMemo(() => new Set(productCampaignIds), [productCampaignIds]);

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
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.trim().toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
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
    if (quickFilter === "preorder") {
      products = products.filter((p) => p.preorderEnabled);
    } else if (quickFilter === "out-of-stock") {
      products = products.filter((p) => p.stock === 0);
    } else if (quickFilter === "inactive") {
      products = products.filter((p) => !p.isActive);
    } else if (quickFilter === "campaign") {
      products = products.filter((p) => campaignIdSet.has(p.id));
    } else if (quickFilter === "has-skt") {
      products = products.filter((p) => p.skt);
    } else if (quickFilter === "low-stock") {
      products = products.filter((p) => p.stock > 0 && p.stock <= 3);
    }
    if (sortMode === "skt-asc") {
      const parseSkt = (skt: string | null) => {
        if (!skt) return Infinity;
        const parts = skt.split(".");
        const m = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        return (y < 100 ? 2000 + y : y) * 100 + m;
      };
      products = [...products].sort((a, b) => parseSkt(a.skt) - parseSkt(b.skt));
    } else if (sortMode === "price-asc") {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sortMode === "price-desc") {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (sortMode === "stock-asc") {
      products = [...products].sort((a, b) => a.stock - b.stock);
    } else if (sortMode === "name-asc") {
      products = [...products].sort((a, b) => a.name.localeCompare(b.name, "tr"));
    } else if (sortMode === "weight") {
      const extractWeight = (name: string): number => {
        const kgMatch = name.match(/(\d+[\.,]?\d*)\s*kg/i);
        if (kgMatch) return parseFloat(kgMatch[1].replace(",", "."));
        const grMatch = name.match(/(\d+[\.,]?\d*)\s*gr/i);
        if (grMatch) return parseFloat(grMatch[1].replace(",", ".")) / 1000;
        return 0;
      };
      products = [...products].sort((a, b) => extractWeight(b.name) - extractWeight(a.name));
    }
    return products;
  }, [allProducts, selectedAnimalFilter, selectedSubcategoryFilter, selectedBrandFilter, categories, productSearchQuery, quickFilter, sortMode, campaignIdSet]);

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
      const res = await apiRequest("POST", "/api/admin/brand-categories", data);
      return await res.json();
    },
    onSuccess: (created: any) => {
      queryClient.setQueryData(["/api/brand-categories"], (old: any[]) =>
        old ? [...old, created] : [created]
      );
      setCategoryDialogOpen(false);
      toast({ title: `"${created.brandName}" markası eklendi` });
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

  const togglePreorderMutation = useMutation({
    mutationFn: async ({ id, preorderEnabled }: { id: number; preorderEnabled: boolean }) => {
      await apiRequest("PATCH", `/api/admin/products/${id}`, { preorderEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Güncellendi", description: "Ön sipariş durumu değiştirildi." });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/brand-categories/${id}`);
      return id;
    },
    onSuccess: async (deletedId) => {
      queryClient.setQueryData(["/api/brand-categories"], (old: any[]) =>
        old ? old.filter((c: any) => c.id !== deletedId) : []
      );
      toast({ title: "Marka silindi" });
    },
    onError: () => {
      toast({ title: "Marka silinemedi", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, brandName }: { id: number; brandName: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/brand-categories/${id}`, { brandName });
      return await res.json();
    },
    onSuccess: async (updated: any) => {
      queryClient.setQueryData(["/api/brand-categories"], (old: any[]) =>
        old ? old.map((c: any) => c.id === updated.id ? { ...c, brandName: updated.brandName } : c) : []
      );
      toast({ title: "Marka güncellendi" });
    },
    onError: () => {
      toast({ title: "Marka güncellenemedi", variant: "destructive" });
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

  const toggleSubcategoryMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/subcategories/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcategories"] });
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
  const [quickCrossSellProductId, setQuickCrossSellProductId] = useState<number | null>(null);
  const [quickCrossSellSearch, setQuickCrossSellSearch] = useState("");

  const [breedStatsDialogOpen, setBreedStatsDialogOpen] = useState(false);
  const [breedStatsProductId, setBreedStatsProductId] = useState<number | null>(null);
  const [newBreedName, setNewBreedName] = useState("");
  const [newBreedPercentage, setNewBreedPercentage] = useState("");
  const [newBreedColor, setNewBreedColor] = useState("#e65100");
  const [newBreedSortOrder, setNewBreedSortOrder] = useState("0");

  const [dogBreedStatsProductId, setDogBreedStatsProductId] = useState<number | null>(null);
  const [newDogBreedName, setNewDogBreedName] = useState("");
  const [newDogBreedPercentage, setNewDogBreedPercentage] = useState("");
  const [newDogBreedColor, setNewDogBreedColor] = useState("#1565c0");
  const [newDogBreedSortOrder, setNewDogBreedSortOrder] = useState("0");

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
      if (quickCrossSellProductId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/product-cross-sell", quickCrossSellProductId] });
      }
    },
  });

  const quickCrossSellMutation = useMutation({
    mutationFn: async (data: { forProductId: number; addProductId: number }) => {
      await apiRequest("POST", "/api/admin/quick-cross-sell", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-sell-sections"] });
      if (quickCrossSellProductId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/product-cross-sell", quickCrossSellProductId] });
      }
    },
  });

  const { data: currentProductCrossSellItems = [] } = useQuery<{ id: number; productId: number; product: Product }[]>({
    queryKey: ["/api/admin/product-cross-sell", quickCrossSellProductId],
    queryFn: async () => {
      if (!quickCrossSellProductId) return [];
      const res = await fetch(`/api/admin/product-cross-sell/${quickCrossSellProductId}`, { credentials: "include" });
      return res.json();
    },
    enabled: !!quickCrossSellProductId,
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

  const { data: dogBreedStatsForProduct = [] } = useQuery<BreedStat[]>({
    queryKey: ["/api/breed-stats", dogBreedStatsProductId],
    enabled: !!dogBreedStatsProductId,
  });

  const addDogBreedStatMutation = useMutation({
    mutationFn: async (data: { productId: number; breedName: string; percentage: number; color: string; sortOrder: number }) => {
      await apiRequest("POST", "/api/admin/breed-stats", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breed-stats", dogBreedStatsProductId] });
      setNewDogBreedName("");
      setNewDogBreedPercentage("");
      setNewDogBreedColor("#1565c0");
      setNewDogBreedSortOrder("0");
    },
  });

  const deleteDogBreedStatMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/breed-stats/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/breed-stats", dogBreedStatsProductId] });
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

  interface CampaignItem {
    id: number;
    product_id: number;
    item_type: string;
    sort_order: number;
    is_active: boolean;
    parent_product_id: number | null;
    campaign_price: string | null;
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
    mutationFn: async (data: { productId: number; itemType: string; sortOrder: number; parentProductId?: number | null }) => {
      await apiRequest("POST", "/api/admin/campaign-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-items"] });
      setCampaignProductId("");
      setCampaignSortOrder("1");
      setCampaignAddDialogOpen(false);
      setCampaignAddProductId(null);
    },
  });

  const toggleCampaignItemMutation = useMutation({
    mutationFn: async ({ id, isActive, campaignPrice }: { id: number; isActive?: boolean; campaignPrice?: string | null }) => {
      const body: any = {};
      if (isActive !== undefined) body.isActive = isActive;
      if (campaignPrice !== undefined) body.campaignPrice = campaignPrice;
      await apiRequest("PATCH", `/api/admin/campaign-items/${id}`, body);
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

  const { data: adminNeighborhoods = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/delivery-neighborhoods"],
  });

  const createNhMutation = useMutation({
    mutationFn: async (data: { district: string; name: string; distance?: number; minOrder: number; shippingFee: number; freeShippingLimit: number; sortOrder: number }) => {
      await apiRequest("POST", "/api/admin/delivery-neighborhoods", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-neighborhoods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-neighborhoods"] });
      setNhDialogOpen(false);
      setNhDistrict("Atakum");
      setNhName("");
      setNhDistance("");
      setNhMinOrder("700");
      setNhShipFee("89");
      setNhFreeShipLimit("2000");
      setNhSortOrder("0");
      toast({ title: "Başarılı", description: "Mahalle eklendi" });
    },
  });

  const updateNhMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; minOrder?: number; shippingFee?: number; freeShippingLimit?: number; isActive?: boolean; sortOrder?: number }) => {
      await apiRequest("PATCH", `/api/admin/delivery-neighborhoods/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-neighborhoods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-neighborhoods"] });
      setNhDialogOpen(false);
      setEditingNh(null);
      toast({ title: "Başarılı", description: "Mahalle güncellendi" });
    },
  });

  const deleteNhMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/delivery-neighborhoods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-neighborhoods"] });
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-neighborhoods"] });
      toast({ title: "Başarılı", description: "Mahalle silindi" });
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
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight" data-testid="text-admin-header">
              <span style={{ color: "#6B3480" }}>JET</span>
              <span className="text-foreground">GO</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1 sm:ml-2">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotificationEnabled(prev => !prev)}
              className={`relative p-1.5 rounded-full transition-colors ${notificationEnabled ? "text-green-600 bg-green-100" : "text-gray-400 bg-gray-100"}`}
              title={notificationEnabled ? "Bildirimler açık" : "Bildirimler kapalı"}
              data-testid="btn-toggle-notification"
            >
              <Bell className="w-4 h-4" />
              {notificationEnabled && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </button>
            <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} data-testid="btn-admin-logout">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Çıkış</span>
            </Button>
          </div>
        </div>
      </header>

      {newOrderAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[10000] animate-bounce" data-testid="new-order-alert">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
            <div className="bg-white/20 rounded-full p-2">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Yeni Sipariş #{newOrderAlert.id}</p>
              <p className="text-xs opacity-90">{newOrderAlert.customerName}</p>
              <p className="text-xs font-bold">{newOrderAlert.grandTotal.toLocaleString("tr-TR")} ₺ - {newOrderAlert.paymentMethod}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewOrderAlert(null);
                setActiveSection("yonetim");
                setYonetimSub("siparisler");
                setOrdersExpanded(true);
              }}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
              data-testid="btn-view-new-order"
            >
              Görüntüle
            </button>
            <button type="button" onClick={() => setNewOrderAlert(null)} className="text-white/70 hover:text-white" data-testid="btn-dismiss-alert">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="border-b bg-background/95 backdrop-blur sticky top-[49px] sm:top-[57px] z-[9998]">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5">
          {[
            { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { key: "yonetim", label: "Yönetim", icon: <Package className="w-3.5 h-3.5" /> },
            { key: "kuponlar", label: "Kuponlar", icon: <Tag className="w-3.5 h-3.5" /> },
            { key: "musteriler", label: "Müşteri", icon: <Users className="w-3.5 h-3.5" /> },
            { key: "bildirim", label: "Bildirim", icon: <Bell className="w-3.5 h-3.5" /> },
            { key: "banner", label: "Banner", icon: <ImageLucide className="w-3.5 h-3.5" /> },
            { key: "raporlama", label: "Raporlama", icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { key: "stoksayim", label: "Stok Sayım", icon: <ScanLine className="w-3.5 h-3.5" /> },
            { key: "skttakip", label: "SKT Takip", icon: <Calendar className="w-3.5 h-3.5" /> },
            { key: "yorumlar", label: "Yorumlar", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { key: "iletisim", label: "İletişim", icon: <Mail className="w-3.5 h-3.5" /> },
            { key: "ayarlar", label: "Ayarlar", icon: <Settings className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveSection(tab.key); setYonetimSub(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === tab.key
                  ? "text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
              style={activeSection === tab.key ? { backgroundColor: "#6B3480" } : {}}
              data-testid={`btn-section-${tab.key}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <BackNavigation />

      <main className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {activeSection === "dashboard" && <DashboardSection />}
        {activeSection === "kuponlar" && <CouponsSection />}
        {activeSection === "musteriler" && <CustomersSection />}
        {activeSection === "bildirim" && <NotificationsSection />}
        {activeSection === "banner" && <BannersSection />}
        {activeSection === "raporlama" && <ReportsSection />}
        {activeSection === "stoksayim" && <StokSayimSection />}
        {activeSection === "skttakip" && <SktTakipSection />}
        {activeSection === "yorumlar" && <ReviewManagementSection />}
        {activeSection === "iletisim" && <ContactMessagesSection />}
        {activeSection === "ayarlar" && <SettingsSection />}
        {activeSection === "yonetim" && <>
          {!yonetimSub && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="yonetim-buttons">
              {[
                { key: "kampanya", label: "Kampanya Yönetimi", icon: <Tag className="w-6 h-6" />, color: "text-purple-600" },
                { key: "siparisler", label: "Sipariş Yönetimi", icon: <ShoppingBag className="w-6 h-6" />, color: "text-blue-600" },
                { key: "mahalleler", label: "Mahalle Yönetimi", icon: <MapPin className="w-6 h-6" />, color: "text-green-600" },
                { key: "kategoriler", label: "Kategoriler", icon: <Package className="w-6 h-6" />, color: "text-orange-600" },
                { key: "altkategoriler", label: "Alt Kategori Yönetimi", icon: <ChevronRight className="w-6 h-6" />, color: "text-indigo-600" },
                { key: "stokbildirimleri", label: "Stok Bildirimleri", icon: <Bell className="w-6 h-6" />, color: "text-red-600" },
                { key: "parapuan", label: "Para Puan Yönetimi", icon: <Star className="w-6 h-6" />, color: "text-amber-600" },
                { key: "urunler", label: "Ürünler", icon: <Package className="w-6 h-6" />, color: "text-cyan-600" },
                { key: "crosssell", label: "Sıklıkla Birlikte Alınan", icon: <ShoppingBag className="w-6 h-6" />, color: "text-pink-600" },
                { key: "kediturustats", label: "Kedi Türü İstatistikleri", icon: <BarChart3 className="w-6 h-6" />, color: "text-violet-600" },
                { key: "kopekturustats", label: "Köpek Türü İstatistikleri", icon: <BarChart3 className="w-6 h-6" />, color: "text-blue-600" },
                { key: "hatirlatmalar", label: "Tekrar Sipariş Hatırlatmaları", icon: <Clock className="w-6 h-6" />, color: "text-teal-600" },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setYonetimSub(item.key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center"
                  data-testid={`btn-yonetim-${item.key}`}
                >
                  <div className={`${item.color}`}>{item.icon}</div>
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {yonetimSub && (
            <button
              onClick={() => setYonetimSub(null)}
              className="flex items-center gap-1.5 mb-4 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
              data-testid="btn-yonetim-back"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Yönetim Menüsüne Dön
            </button>
          )}

          {yonetimSub === "kampanya" && <section>
          <button
            onClick={() => setCampaignExpanded(!campaignExpanded)}
            className="flex items-center gap-2 mb-4 w-full text-left"
            data-testid="btn-toggle-campaign"
          >
            <Tag className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold" data-testid="text-section-campaign">Kampanya Yönetimi</h2>
            <Badge className="no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#6B3480", color: "#fff" }} data-testid="badge-campaign-count">
              {campaignItems.filter(i => i.is_active && i.item_type === "main").length} ana / {campaignItems.filter(i => i.is_active && i.item_type === "extra").length} ek aktif
            </Badge>
            <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${campaignExpanded ? "rotate-180" : ""}`} />
          </button>

          {campaignExpanded && (
            <div className="space-y-5">
              {(() => {
                const mainItems = campaignItems.filter(i => i.item_type === "main").sort((a, b) => a.sort_order - b.sort_order);
                if (mainItems.length === 0) {
                  return <p className="text-sm text-gray-400 text-center py-6">Henüz ana ürün eklenmemiş</p>;
                }
                return mainItems.map(mainItem => {
                  const extras = campaignItems
                    .filter(i => i.item_type === "extra" && i.parent_product_id === mainItem.product_id)
                    .sort((a, b) => a.sort_order - b.sort_order);
                  return (
                    <div key={mainItem.id} className="rounded-xl border bg-white overflow-hidden">
                      <div className="bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span className="font-bold text-sm sm:text-base">Ana Ürün</span>
                        <span className="ml-auto text-xs sm:text-sm opacity-90">{extras.length} sıklıkla alınan</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 transition-all ${mainItem.is_active ? "" : "opacity-40 bg-gray-50"}`}
                        data-testid={`row-campaign-item-${mainItem.id}`}
                      >
                        <span className="text-xs font-mono text-gray-400 w-6 text-center flex-shrink-0">{mainItem.sort_order}</span>
                        {mainItem.img ? (
                          <img src={mainItem.img} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" data-testid={`text-campaign-item-name-${mainItem.id}`}>{mainItem.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-500">Normal: {mainItem.price} TL</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-purple-600 font-bold">Kampanya:</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Fiyat"
                                defaultValue={mainItem.campaign_price || ""}
                                className="w-20 h-6 text-xs border rounded px-1.5 text-purple-700 font-bold focus:ring-1 focus:ring-purple-400 outline-none"
                                data-testid={`input-campaign-price-${mainItem.id}`}
                                onBlur={(e) => {
                                  const val = e.target.value;
                                  toggleCampaignItemMutation.mutate({ id: mainItem.id, campaignPrice: val === "" ? null : val });
                                }}
                                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              />
                              <span className="text-xs text-purple-600 font-bold">TL</span>
                            </div>
                            {mainItem.stock <= 0 && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">STOK YOK</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                              mainItem.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            onClick={() => toggleCampaignItemMutation.mutate({ id: mainItem.id, isActive: !mainItem.is_active })}
                            disabled={toggleCampaignItemMutation.isPending}
                            data-testid={`btn-toggle-campaign-item-${mainItem.id}`}
                          >
                            {mainItem.is_active ? (
                              <><Eye className="w-3.5 h-3.5" /> Yayında</>
                            ) : (
                              <><EyeOff className="w-3.5 h-3.5" /> Durduruldu</>
                            )}
                          </button>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => {
                              if (confirm(`"${mainItem.name}" kampanyadan silinsin mi?`)) {
                                removeCampaignItemMutation.mutate(mainItem.id);
                              }
                            }}
                            disabled={removeCampaignItemMutation.isPending}
                            data-testid={`btn-remove-campaign-item-${mainItem.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {extras.length > 0 && (
                        <div className="border-t">
                          <div className="bg-green-50 px-4 py-2 flex items-center gap-2 border-b">
                            <Package className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-bold text-green-700">SIKLIKLA ALINAN ÜRÜNLER</span>
                          </div>
                          <div className="divide-y">
                            {extras.map(extra => (
                              <div
                                key={extra.id}
                                className={`flex items-center gap-3 p-3 pl-8 transition-all ${extra.is_active ? "" : "opacity-40 bg-gray-50"}`}
                                data-testid={`row-campaign-item-${extra.id}`}
                              >
                                <span className="text-xs font-mono text-gray-400 w-6 text-center flex-shrink-0">{extra.sort_order}</span>
                                {extra.img ? (
                                  <img src={extra.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate" data-testid={`text-campaign-item-name-${extra.id}`}>{extra.name}</p>
                                  <span className="text-xs font-bold text-green-700">{extra.price} TL</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                      extra.is_active
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                                    onClick={() => toggleCampaignItemMutation.mutate({ id: extra.id, isActive: !extra.is_active })}
                                    disabled={toggleCampaignItemMutation.isPending}
                                    data-testid={`btn-toggle-campaign-item-${extra.id}`}
                                  >
                                    {extra.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    type="button"
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    onClick={() => {
                                      if (confirm(`"${extra.name}" bu ana üründen kaldırılsın mı?`)) {
                                        removeCampaignItemMutation.mutate(extra.id);
                                      }
                                    }}
                                    disabled={removeCampaignItemMutation.isPending}
                                    data-testid={`btn-remove-campaign-item-${extra.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t p-3">
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-colors text-sm font-medium"
                          onClick={() => {
                            setCampaignParentProductId(mainItem.product_id);
                            setExtraSearchQuery("");
                          }}
                          data-testid={`btn-add-extra-${mainItem.product_id}`}
                        >
                          <Plus className="w-4 h-4" />
                          Sıklıkla Alınan Ürün Ekle
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {campaignParentProductId && (
            <Dialog open={true} onOpenChange={(open) => {
              if (!open) { setCampaignParentProductId(null); setExtraSearchQuery(""); setCampaignSortOrder("1"); setExtraAnimalFilter("all"); setExtraSubcategoryFilter("all"); }
            }}>
              <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Sıklıkla Alınan Ürün Ekle
                  </DialogTitle>
                </DialogHeader>
                {(() => {
                  const parentProduct = allProducts.find(p => p.id === campaignParentProductId);
                  const existingExtraIds = campaignItems
                    .filter(i => i.item_type === "extra" && i.parent_product_id === campaignParentProductId)
                    .map(i => i.product_id);
                  const campaignMainIds = campaignItems.filter(i => i.item_type === "main").map(i => i.product_id);
                  const mamaSubcats = new Set(["kedi-mamasi", "mama-markalari", "kopek-kuru-mama", "acik-mama"]);
                  const mamaCatIds = new Set(categories.filter(c => mamaSubcats.has(c.subcategory)).map(c => c.id));
                  let availableProducts = allProducts.filter(p =>
                    p.id !== campaignParentProductId &&
                    p.isActive &&
                    !existingExtraIds.includes(p.id) &&
                    !campaignMainIds.includes(p.id) &&
                    !mamaCatIds.has(p.brandCategoryId) &&
                    (extraSearchQuery === "" ||
                      p.name.toLowerCase().includes(extraSearchQuery.toLowerCase()))
                  );
                  if (extraAnimalFilter !== "all") {
                    const catIds = new Set(categories.filter(c => c.animal === extraAnimalFilter).map(c => c.id));
                    availableProducts = availableProducts.filter(p => catIds.has(p.brandCategoryId));
                  }
                  if (extraSubcategoryFilter !== "all") {
                    const catIds = new Set(categories.filter(c => c.subcategory === extraSubcategoryFilter).map(c => c.id));
                    availableProducts = availableProducts.filter(p => catIds.has(p.brandCategoryId));
                  }
                  const extraAvailableSubcats = subcategoriesByAnimal[extraAnimalFilter] || [];
                  return (
                    <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                      {parentProduct && (
                        <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                          {parentProduct.img ? (
                            <img src={parentProduct.img} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{parentProduct.name}</p>
                            <p className="text-[10px] text-purple-600">Ana Ürün</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Select value={extraAnimalFilter} onValueChange={(val) => { setExtraAnimalFilter(val); setExtraSubcategoryFilter("all"); }}>
                          <SelectTrigger className="w-[100px] h-8 text-xs" data-testid="select-extra-animal">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            {ANIMALS.map((a) => (
                              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {extraAnimalFilter !== "all" && extraAvailableSubcats.length > 0 && (
                          <Select value={extraSubcategoryFilter} onValueChange={setExtraSubcategoryFilter}>
                            <SelectTrigger className="flex-1 h-8 text-xs" data-testid="select-extra-subcategory">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tüm Kategoriler</SelectItem>
                              {extraAvailableSubcats.filter(sc => !mamaSubcats.has(sc.slug)).map((sc) => (
                                <SelectItem key={sc.slug} value={sc.slug}>{sc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <Input
                        placeholder="Ürün adı ara..."
                        value={extraSearchQuery}
                        onChange={(e) => setExtraSearchQuery(e.target.value)}
                        data-testid="input-extra-search"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">Sıra:</Label>
                        <Input
                          type="number"
                          value={campaignSortOrder}
                          onChange={(e) => setCampaignSortOrder(e.target.value)}
                          className="w-20"
                          data-testid="input-extra-sort-order"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y border rounded-lg max-h-[40vh]">
                        {availableProducts.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">Ürün bulunamadı</p>
                        ) : (
                          availableProducts.slice(0, 50).map(p => (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-2 hover:bg-green-50 transition-colors cursor-pointer"
                              onClick={() => {
                                addCampaignItemMutation.mutate({
                                  productId: p.id,
                                  itemType: "extra",
                                  sortOrder: parseInt(campaignSortOrder) || 1,
                                  parentProductId: campaignParentProductId,
                                });
                              }}
                              data-testid={`btn-select-extra-${p.id}`}
                            >
                              {p.img ? (
                                <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover border flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{p.name}</p>
                                <p className="text-xs text-gray-500">{p.price} TL</p>
                              </div>
                              <Plus className="w-4 h-4 text-green-500 flex-shrink-0" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </DialogContent>
            </Dialog>
          )}
        </section>}

        {yonetimSub === "siparisler" && <section>
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
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto no-scrollbar" data-testid="tabs-order-filter">
              {([
                { key: "gelen" as const, label: "Gelen", statuses: ["yeni"] },
                { key: "bekleyen" as const, label: "Bekleyen", statuses: ["onaylandi", "hazirlaniyor"] },
                { key: "giden" as const, label: "Giden", statuses: ["tamamlandi", "iptal"] },
              ]).map((tab) => {
                const count = allOrders.filter((o) => tab.statuses.includes(o.status)).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setOrderTab(tab.key)}
                    className={`flex-1 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${orderTab === tab.key ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    data-testid={`tab-order-${tab.key}`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={orderDateFrom}
                onChange={(e) => setOrderDateFrom(e.target.value)}
                className="flex-1 min-w-[130px] max-w-[160px]"
                placeholder="Başlangıç"
                data-testid="input-order-date-from"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <Input
                type="date"
                value={orderDateTo}
                onChange={(e) => setOrderDateTo(e.target.value)}
                className="flex-1 min-w-[130px] max-w-[160px]"
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

          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
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
          <div className="flex items-center gap-2 mb-4 flex-wrap overflow-x-auto">
            <span className="text-xs text-muted-foreground shrink-0">Tip:</span>
            {([
              { key: "all", label: "Tümü" },
              { key: "campaign", label: "Kampanya" },
              { key: "normal", label: "Normal" },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setOrderTypeFilter(opt.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  orderTypeFilter === opt.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
                data-testid={`btn-order-type-${opt.key}`}
              >
                {opt.label}
              </button>
            ))}
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
                if (orderTypeFilter === "campaign") return (o as any).isCampaign === true;
                if (orderTypeFilter === "normal") return !(o as any).isCampaign;
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
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setOrderDetailDialog(order)}
                            className="font-bold text-sm sm:text-base text-primary hover:underline cursor-pointer"
                            data-testid={`btn-order-detail-${order.id}`}
                          >
                            #{order.isCampaign ? `K${String(order.id).padStart(2, "0")}` : order.id}
                          </button>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span data-testid={`text-order-date-${order.id}`}>
                              {new Date(order.createdAt).toLocaleDateString("tr-TR")} {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {order.customerName && (
                            <span className="text-xs sm:text-sm font-medium" data-testid={`text-order-customer-name-${order.id}`}>{order.customerName}</span>
                          )}
                          {order.customerPhone && (
                            <button
                              onClick={() => setPhoneHistoryDialog(order.customerPhone)}
                              className="text-xs sm:text-sm text-primary hover:underline cursor-pointer"
                              data-testid={`btn-phone-history-${order.id}`}
                            >
                              {order.customerPhone}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-bold text-sm sm:text-base" data-testid={`text-order-grand-total-${order.id}`}>
                            {order.grandTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                          </span>
                          <Badge
                            className="no-default-hover-elevate no-default-active-elevate text-[10px] sm:text-xs"
                            style={{ backgroundColor: statusColors[order.status] || "#9E9E9E", color: "#fff" }}
                            data-testid={`badge-order-status-${order.id}`}
                          >
                            {statusLabels[order.status] || order.status}
                          </Badge>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatusMutation.mutate({ id: order.id, status: value })}
                          >
                            <SelectTrigger className="w-[120px] sm:w-[150px] h-7 sm:h-8 text-xs sm:text-sm" data-testid={`select-order-status-${order.id}`}>
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
        </section>}

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
                            <span className="font-semibold text-sm">#{order.isCampaign ? `K${String(order.id).padStart(2, "0")}` : order.id}</span>
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
                    <div className="space-y-2">
                      {order.items.map((item: any, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {item.img ? (
                            <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm leading-tight line-clamp-2">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.quantity} adet × {item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</div>
                          </div>
                          <span className="font-medium whitespace-nowrap">{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
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

                  {(order as any).deliverySlot && (
                    <div className="text-sm bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                      <span className="font-medium">Teslimat Zamanı: </span>
                      {({
                        hemen: "Hemen (En kısa sürede)",
                        bugun_ogle: "Bugün 12:00-14:00",
                        bugun_aksam: "Bugün 16:00-19:00",
                        yarin_sabah: "Yarın Sabah 10:00-12:00",
                      } as Record<string, string>)[(order as any).deliverySlot] || (order as any).deliverySlot}
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

        {yonetimSub === "mahalleler" && <section>
          <button
            onClick={() => setNeighborhoodExpanded(!neighborhoodExpanded)}
            className="flex items-center gap-2 mb-4 w-full text-left"
            data-testid="btn-toggle-neighborhoods"
          >
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold" data-testid="text-section-neighborhoods">Mahalle Yönetimi</h2>
            <Badge className="no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#2563eb", color: "#fff" }} data-testid="badge-nh-count">
              {adminNeighborhoods.filter((n: any) => n.isActive).length} aktif
            </Badge>
            <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${neighborhoodExpanded ? "rotate-180" : ""}`} />
          </button>

          {neighborhoodExpanded && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1">
                  {["all", "Atakum", "İlkadım", "Canik"].map((d) => (
                    <Button
                      key={d}
                      variant={nhDistrictFilter === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNhDistrictFilter(d)}
                      data-testid={`btn-filter-district-${d}`}
                    >
                      {d === "all" ? "Tümü" : d}
                      {d !== "all" && (
                        <span className="ml-1 text-xs opacity-70">
                          ({adminNeighborhoods.filter((n: any) => n.district === d).length})
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="ml-auto">
                  <Dialog open={nhDialogOpen} onOpenChange={(open) => {
                    setNhDialogOpen(open);
                    if (!open) {
                      setEditingNh(null);
                      setNhDistrict("Atakum");
                      setNhName("");
                      setNhDistance("");
                      setNhMinOrder("700");
                      setNhShipFee("89");
                      setNhFreeShipLimit("2000");
                      setNhSortOrder("0");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button data-testid="btn-add-neighborhood" size="sm">
                        <Plus className="w-4 h-4" />
                        Yeni Mahalle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingNh ? "Mahalle Düzenle" : "Yeni Mahalle Ekle"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <Label>İlçe</Label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={nhDistrict}
                            onChange={(e) => setNhDistrict(e.target.value)}
                            data-testid="select-nh-district"
                          >
                            <option value="Atakum">Atakum</option>
                            <option value="İlkadım">İlkadım</option>
                            <option value="Canik">Canik</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Mahalle Adı</Label>
                            <Input
                              value={nhName}
                              onChange={(e) => setNhName(e.target.value)}
                              placeholder="Örn: Körfez"
                              data-testid="input-nh-name"
                            />
                          </div>
                          <div>
                            <Label>Mesafe (km)</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={nhDistance}
                              onChange={(e) => setNhDistance(e.target.value)}
                              placeholder="Örn: 2.5"
                              data-testid="input-nh-distance"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Min. Sipariş (TL)</Label>
                            <Input
                              type="number"
                              value={nhMinOrder}
                              onChange={(e) => setNhMinOrder(e.target.value)}
                              data-testid="input-nh-min-order"
                            />
                          </div>
                          <div>
                            <Label>Teslimat Ücreti (TL)</Label>
                            <Input
                              type="number"
                              value={nhShipFee}
                              onChange={(e) => setNhShipFee(e.target.value)}
                              data-testid="input-nh-ship-fee"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Ücretsiz Teslimat (TL)</Label>
                            <Input
                              type="number"
                              value={nhFreeShipLimit}
                              onChange={(e) => setNhFreeShipLimit(e.target.value)}
                              data-testid="input-nh-free-ship"
                            />
                          </div>
                          <div>
                            <Label>Sıralama</Label>
                            <Input
                              type="number"
                              value={nhSortOrder}
                              onChange={(e) => setNhSortOrder(e.target.value)}
                              data-testid="input-nh-sort"
                            />
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          disabled={!nhName.trim() || createNhMutation.isPending || updateNhMutation.isPending}
                          onClick={() => {
                            const data: any = {
                              district: nhDistrict,
                              name: nhName.trim(),
                              minOrder: parseFloat(nhMinOrder) || 700,
                              shippingFee: parseFloat(nhShipFee) || 89,
                              freeShippingLimit: parseFloat(nhFreeShipLimit) || 2000,
                              sortOrder: parseInt(nhSortOrder) || 0,
                            };
                            if (nhDistance) data.distance = parseFloat(nhDistance);
                            if (editingNh) {
                              updateNhMutation.mutate({ id: editingNh.id, ...data });
                            } else {
                              createNhMutation.mutate(data);
                            }
                          }}
                          data-testid="btn-save-neighborhood"
                        >
                          {(createNhMutation.isPending || updateNhMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          {editingNh ? "Güncelle" : "Ekle"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {adminNeighborhoods.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Henüz mahalle eklenmemiş.</p>
                    <p className="text-xs mt-1">Mahalle ekleyerek her bölge için farklı teslimat koşulları belirleyin.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {(nhDistrictFilter === "all" ? ["Atakum", "İlkadım", "Canik"] : [nhDistrictFilter]).map((district) => {
                    const districtNhs = adminNeighborhoods.filter((n: any) => n.district === district);
                    if (districtNhs.length === 0) return null;
                    return (
                      <div key={district}>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm text-blue-700">{district} İlçesi</h3>
                          <Badge variant="secondary" className="text-[10px]">{districtNhs.length} mahalle</Badge>
                        </div>
                        <div className="space-y-1.5">
                          {districtNhs.map((nh: any) => (
                            <Card key={nh.id} className={!nh.isActive ? "opacity-60" : ""} data-testid={`nh-card-${nh.id}`}>
                              <CardContent className="p-2.5 sm:p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                                    <span className="font-medium text-xs sm:text-sm truncate">{nh.name}</span>
                                    {nh.distance && <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">{nh.distance} km</Badge>}
                                    {!nh.isActive && <Badge variant="secondary" className="text-[10px]">Pasif</Badge>}
                                  </div>
                                  <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-1.5 sm:px-3 text-[10px] sm:text-xs"
                                      onClick={() => updateNhMutation.mutate({ id: nh.id, isActive: !nh.isActive })}
                                      data-testid={`btn-toggle-nh-${nh.id}`}
                                    >
                                      {nh.isActive ? "Pasifle" : "Aktifle"}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingNh(nh);
                                        setNhDistrict(nh.district || "Atakum");
                                        setNhName(nh.name);
                                        setNhDistance(nh.distance ? String(nh.distance) : "");
                                        setNhMinOrder(String(nh.minOrder));
                                        setNhShipFee(String(nh.shippingFee));
                                        setNhFreeShipLimit(String(nh.freeShippingLimit));
                                        setNhSortOrder(String(nh.sortOrder));
                                        setNhDialogOpen(true);
                                      }}
                                      data-testid={`btn-edit-nh-${nh.id}`}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => {
                                        if (confirm(`"${nh.name}" mahallesini silmek istediğinize emin misiniz?`)) {
                                          deleteNhMutation.mutate(nh.id);
                                        }
                                      }}
                                      data-testid={`btn-delete-nh-${nh.id}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                  <span>Min: <strong className="text-foreground">{nh.minOrder} TL</strong></span>
                                  <span>Teslimat: <strong className="text-foreground">{nh.shippingFee} TL</strong></span>
                                  <span>Ücretsiz: <strong className="text-foreground">{nh.freeShippingLimit} TL+</strong></span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>}

        {yonetimSub === "kategoriler" && <section>
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
                                    <BrandTag
                                      key={brand.id}
                                      brand={brand}
                                      count={count}
                                      onDelete={() => deleteCategoryMutation.mutate(brand.id)}
                                      onUpdate={(newName) => updateCategoryMutation.mutate({ id: brand.id, brandName: newName })}
                                    />
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
        </section>}

        {yonetimSub === "altkategoriler" && <section className="mb-6" data-testid="section-subcategory-management">
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
                        <div key={sub.id} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 border ${!sub.isActive ? "opacity-50 bg-gray-50" : ""}`} data-testid={`subcategory-tag-${sub.id}`}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span className="text-xs font-medium">{sub.displayName.replace(/\n/g, " ")}</span>
                          {sub.hasBrands && <Badge variant="secondary" className="text-[9px] no-default-hover-elevate no-default-active-elevate">Marka</Badge>}
                          <button
                            className={`ml-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${sub.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            onClick={() => toggleSubcategoryMutation.mutate({ id: sub.id, isActive: !sub.isActive })}
                            data-testid={`btn-toggle-subcategory-${sub.id}`}
                          >
                            {sub.isActive ? "Yayında" : "Durduruldu"}
                          </button>
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
        </section>}

        {yonetimSub === "stokbildirimleri" && sktWarningProducts.length > 0 && (
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

        {yonetimSub === "stokbildirimleri" && <section className="mb-6" data-testid="section-stock-alerts">
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
        </section>}

        {yonetimSub === "parapuan" && <section className="mb-6" data-testid="section-loyalty-points">
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
        </section>}

        {yonetimSub === "urunler" && <section>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold" data-testid="text-section-products">
                Ürünler
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredProducts.length})
                </span>
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Ürün adı ile ara..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
                data-testid="input-product-search"
              />
              {productSearchQuery && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setProductSearchQuery("")}
                  data-testid="btn-clear-product-search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedAnimalFilter} onValueChange={(val) => { setSelectedAnimalFilter(val); setSelectedSubcategoryFilter("all"); setSelectedBrandFilter("all"); }}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs sm:text-sm" data-testid="select-filter-animal">
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
                  <SelectTrigger className="w-[130px] sm:w-[180px] h-8 text-xs sm:text-sm" data-testid="select-filter-subcategory">
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
                  <SelectTrigger className="w-[130px] sm:w-[180px] h-8 text-xs sm:text-sm" data-testid="select-filter-brand">
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

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "none", label: "Tümü", icon: "📋" },
                { id: "out-of-stock", label: "Stokta Yok", icon: "🔴" },
                { id: "low-stock", label: "Az Stok", icon: "🟡" },
                { id: "inactive", label: "Yayında Değil", icon: "⚫" },
                { id: "preorder", label: "Ön Sipariş", icon: "🕐" },
                { id: "campaign", label: "Kampanya", icon: "🏷️" },
                { id: "has-skt", label: "SKT'li", icon: "📅" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setQuickFilter(quickFilter === f.id ? "none" : f.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${quickFilter === f.id ? "bg-purple-100 border-purple-400 text-purple-800" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}
                  data-testid={`btn-quick-filter-${f.id}`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-medium">Sırala:</span>
              <Select value={sortMode} onValueChange={setSortMode}>
                <SelectTrigger className="w-[160px] h-7 text-xs" data-testid="select-sort-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Varsayılan</SelectItem>
                  <SelectItem value="weight">Kilo (Büyük-Küçük)</SelectItem>
                  <SelectItem value="skt-asc">SKT (Yakın-Uzak)</SelectItem>
                  <SelectItem value="price-asc">Fiyat (Düşük-Yüksek)</SelectItem>
                  <SelectItem value="price-desc">Fiyat (Yüksek-Düşük)</SelectItem>
                  <SelectItem value="stock-asc">Stok (Az-Çok)</SelectItem>
                  <SelectItem value="name-asc">İsim (A-Z)</SelectItem>
                </SelectContent>
              </Select>
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
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
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

              <Dialog open={bulkStockDialogOpen} onOpenChange={(open) => { setBulkStockDialogOpen(open); if (!open) setIndividualStocks({}); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={filteredProducts.length === 0} data-testid="btn-bulk-stock">
                    <Package className="w-4 h-4" />
                    Toplu Stok Güncelle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Toplu Stok Güncelleme</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Seçili filtredeki <span className="font-bold text-foreground">{filteredProducts.length}</span> ürün
                    </p>
                  </DialogHeader>
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="overflow-y-auto flex-1 border rounded-lg" style={{ maxHeight: "50vh" }}>
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background border-b">
                          <tr>
                            <th className="text-left p-2 font-medium">Ürün</th>
                            <th className="text-right p-2 font-medium w-24">Mevcut</th>
                            <th className="text-right p-2 font-medium w-32">Yeni Stok</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/30 ${p.stock === 0 ? "bg-red-50" : ""}`}>
                              <td className="p-2 text-xs leading-tight" data-testid={`text-stock-product-${p.id}`}>{p.name}</td>
                              <td className="p-2 text-right text-xs whitespace-nowrap">
                                <span className={p.stock === 0 ? "text-red-500 font-bold" : p.stock <= 5 ? "text-orange-500 font-semibold" : "text-muted-foreground"}>
                                  {p.stock}
                                </span>
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  step="1"
                                  min="0"
                                  placeholder={String(p.stock)}
                                  value={individualStocks[p.id] || ""}
                                  onChange={(e) => setIndividualStocks(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  className="h-8 text-sm text-right w-28"
                                  data-testid={`input-stock-${p.id}`}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        {Object.values(individualStocks).filter(v => v !== "" && !isNaN(parseInt(v))).length} ürün değiştirildi
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allZero: Record<number, string> = {};
                            filteredProducts.forEach(p => { allZero[p.id] = "0"; });
                            setIndividualStocks(allZero);
                          }}
                          data-testid="btn-stock-all-zero"
                        >
                          Tümünü 0 Yap
                        </Button>
                        <Button
                          disabled={Object.values(individualStocks).filter(v => v !== "" && !isNaN(parseInt(v))).length === 0 || bulkStockUpdateMutation.isPending}
                          onClick={() => {
                            const updates = Object.entries(individualStocks)
                              .filter(([_, v]) => v !== "" && !isNaN(parseInt(v)))
                              .map(([id, v]) => ({ id: parseInt(id), stock: parseInt(v) }));
                            if (updates.length > 0) bulkStockUpdateMutation.mutate({ updates });
                          }}
                          data-testid="btn-save-bulk-stock"
                        >
                          {bulkStockUpdateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>Stokları Kaydet</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
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
                          {product.costPrice != null && product.costPrice > 0 && (
                            <span className="text-[10px] text-blue-600 font-medium">
                              A: {product.costPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                              ({Math.round(((product.price - product.costPrice) / product.costPrice) * 100)}%)
                            </span>
                          )}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {product.originalPrice.toLocaleString("tr-TR")} TL
                            </span>
                          )}
                          {(() => {
                            const ci = campaignItems.find(c => c.product_id === product.id && c.is_active);
                            if (!ci?.campaign_price) return null;
                            return (
                              <span className="text-[10px] font-bold" style={{ color: "#e65100" }}>
                                K: {Number(ci.campaign_price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                              </span>
                            );
                          })()}
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
                          {product.preorderEnabled && (
                            <Badge className="text-[10px] no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#1565c0", color: "#fff" }} data-testid={`badge-preorder-${product.id}`}>
                              Ön Sipariş Açık
                            </Badge>
                          )}
                          {product.skt && (
                            <span className="text-[10px] text-muted-foreground">
                              SKT: {product.skt}
                            </span>
                          )}
                          {product.barcode && (
                            <span className="text-[10px] text-muted-foreground font-mono" data-testid={`text-barcode-${product.id}`}>
                              {product.barcode}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          title={product.preorderEnabled ? "Ön Siparişi Kapat" : "Ön Siparişi Aç"}
                          className={product.preorderEnabled ? "border-blue-400 text-blue-600 bg-blue-50" : "border-gray-300 text-gray-400"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePreorderMutation.mutate({ id: product.id, preorderEnabled: !product.preorderEnabled });
                          }}
                          data-testid={`btn-toggle-preorder-${product.id}`}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Sıklıkla Alınan Ürün Ekle"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickCrossSellProductId(product.id);
                            setQuickCrossSellSearch("");
                          }}
                          data-testid={`btn-cross-sell-${product.id}`}
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        {(() => {
                          const ci = campaignItems.find(c => c.product_id === product.id);
                          return ci ? (
                            <Badge className="text-[10px] no-default-hover-elevate no-default-active-elevate" style={{ backgroundColor: "#6B3480", color: "#fff" }}>
                              {ci.item_type === "main" ? "Kampanya Ana" : "Kampanya Ek"}
                            </Badge>
                          ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            title="Kampanyaya Ekle"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCampaignAddProductId(product.id);
                              setCampaignAddDialogOpen(true);
                            }}
                            data-testid={`btn-campaign-add-${product.id}`}
                          >
                            <Tag className="w-4 h-4" />
                          </Button>
                          );
                        })()}
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
        </section>}

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
                campaignInfo={(() => {
                  const ci = campaignItems.find(c => c.product_id === editingProduct.id && c.is_active);
                  if (!ci) return null;
                  return { id: ci.id, itemType: ci.item_type, campaignPrice: ci.campaign_price };
                })()}
                onCampaignPriceChange={(ciId, val) => {
                  toggleCampaignItemMutation.mutate({ id: ciId, campaignPrice: val });
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {campaignAddDialogOpen && campaignAddProductId && (
          <Dialog open={true} onOpenChange={(open) => {
            if (!open) { setCampaignAddDialogOpen(false); setCampaignAddProductId(null); setCampaignAddType("main"); setCampaignSortOrder("1"); setCampaignParentProductId(null); }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  Kampanyaya Ekle
                </DialogTitle>
              </DialogHeader>
              {(() => {
                const p = allProducts.find(x => x.id === campaignAddProductId);
                if (!p) return <p>Ürün bulunamadı</p>;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      {p.img ? (
                        <img src={p.img} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-sm text-purple-700 font-semibold mt-0.5">{p.price} TL</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Kampanya Türü</Label>
                        <Select value={campaignAddType} onValueChange={(v) => setCampaignAddType(v as "main" | "extra")}>
                          <SelectTrigger data-testid="trigger-campaign-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Ana Ürün</SelectItem>
                            <SelectItem value="extra">Ek Ürün (İlave)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Sıra No</Label>
                        <Input
                          type="number"
                          value={campaignSortOrder}
                          onChange={(e) => setCampaignSortOrder(e.target.value)}
                          data-testid="input-campaign-sort-order"
                        />
                      </div>
                    </div>
                    {campaignAddType === "extra" && (
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Bağlı Ana Ürün</Label>
                        <Select value={campaignParentProductId ? String(campaignParentProductId) : ""} onValueChange={(v) => setCampaignParentProductId(v ? parseInt(v) : null)}>
                          <SelectTrigger data-testid="trigger-campaign-parent">
                            <SelectValue placeholder="Ana ürün seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {campaignItems.filter(ci => ci.item_type === "main" && ci.is_active).map(ci => (
                              <SelectItem key={ci.product_id} value={String(ci.product_id)}>{ci.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      style={{ backgroundColor: "#6B3480" }}
                      disabled={addCampaignItemMutation.isPending || (campaignAddType === "extra" && !campaignParentProductId)}
                      onClick={() => {
                        addCampaignItemMutation.mutate({
                          productId: p.id,
                          itemType: campaignAddType,
                          sortOrder: parseInt(campaignSortOrder) || 1,
                          parentProductId: campaignAddType === "extra" ? campaignParentProductId : null,
                        });
                      }}
                      data-testid="btn-confirm-campaign-add"
                    >
                      {addCampaignItemMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Tag className="w-4 h-4 mr-2" />
                          Kampanyaya Ekle
                        </>
                      )}
                    </Button>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}

        {quickCrossSellProductId && (
          <Dialog open={true} onOpenChange={(open) => {
            if (!open) { setQuickCrossSellProductId(null); setQuickCrossSellSearch(""); }
          }}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Sıklıkla Birlikte Alınan Ürünler
                </DialogTitle>
              </DialogHeader>
              {(() => {
                const mainProduct = allProducts.find(p => p.id === quickCrossSellProductId);
                const existingIds = currentProductCrossSellItems.map(i => i.productId);
                const availableProducts = allProducts.filter(p =>
                  p.id !== quickCrossSellProductId &&
                  p.isActive &&
                  !existingIds.includes(p.id) &&
                  (quickCrossSellSearch === "" ||
                    p.name.toLowerCase().includes(quickCrossSellSearch.toLowerCase()))
                );
                return (
                  <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                    {mainProduct && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        {mainProduct.img ? (
                          <img src={mainProduct.img} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{mainProduct.name}</p>
                          <p className="text-[10px] text-blue-600">{mainProduct.price} TL</p>
                        </div>
                      </div>
                    )}

                    {currentProductCrossSellItems.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-green-50 px-3 py-1.5 border-b">
                          <span className="text-xs font-bold text-green-700">MEVCUT ÜRÜNLER ({currentProductCrossSellItems.length})</span>
                        </div>
                        <div className="divide-y max-h-[20vh] overflow-y-auto">
                          {currentProductCrossSellItems.map(item => (
                            <div key={item.id} className="flex items-center gap-2 p-2">
                              {item.product?.img ? (
                                <img src={item.product.img} alt="" className="w-8 h-8 rounded object-cover border flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-3 h-3 text-gray-300" />
                                </div>
                              )}
                              <p className="text-xs font-medium truncate flex-1">{item.product?.name}</p>
                              <button
                                type="button"
                                className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                                onClick={() => removeItemMutation.mutate(item.id)}
                                disabled={removeItemMutation.isPending}
                                data-testid={`btn-remove-cross-sell-item-${item.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Input
                      placeholder="Eklenecek ürünü ara..."
                      value={quickCrossSellSearch}
                      onChange={(e) => setQuickCrossSellSearch(e.target.value)}
                      data-testid="input-quick-cross-sell-search"
                    />
                    <div className="flex-1 overflow-y-auto divide-y border rounded-lg max-h-[30vh]">
                      {availableProducts.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Ürün bulunamadı</p>
                      ) : (
                        availableProducts.slice(0, 50).map(p => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 p-2 hover:bg-green-50 transition-colors cursor-pointer"
                            onClick={() => {
                              quickCrossSellMutation.mutate({
                                forProductId: quickCrossSellProductId!,
                                addProductId: p.id,
                              });
                            }}
                            data-testid={`btn-add-cross-sell-item-${p.id}`}
                          >
                            {p.img ? (
                              <img src={p.img} alt="" className="w-10 h-10 rounded-lg object-cover border flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.price} TL</p>
                            </div>
                            <Plus className="w-4 h-4 text-green-500 flex-shrink-0" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}

        {yonetimSub === "crosssell" && <section>
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
        </section>}

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

        {yonetimSub === "kediturustats" && <section>
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
                    {allProducts.filter(p => p.animal === "kedi").map((p) => (
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
        </section>}

        {yonetimSub === "kopekturustats" && <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-bold" data-testid="text-section-dog-breed-stats">Köpek Türü İstatistikleri</h2>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Ürün Seçin</Label>
                <Select
                  value={dogBreedStatsProductId ? String(dogBreedStatsProductId) : ""}
                  onValueChange={(val) => setDogBreedStatsProductId(parseInt(val))}
                >
                  <SelectTrigger data-testid="select-dog-breed-stats-product">
                    <SelectValue placeholder="İstatistik eklemek istediğiniz köpek ürünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.filter(p => p.animal === "kopek").map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} data-testid={`option-dog-breed-product-${p.id}`}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dogBreedStatsProductId && (
                <>
                  {dogBreedStatsForProduct.length > 0 && (
                    <div className="space-y-2" data-testid="list-dog-breed-stats">
                      <Label className="text-sm font-semibold">Mevcut İstatistikler</Label>
                      {dogBreedStatsForProduct
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((stat) => (
                        <div key={stat.id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/30" data-testid={`row-admin-dog-breed-stat-${stat.id}`}>
                          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                          <span className="text-sm font-medium flex-1">{stat.breedName}</span>
                          <span className="text-sm font-bold">{stat.percentage}%</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteDogBreedStatMutation.mutate(stat.id)}
                            data-testid={`btn-delete-dog-breed-stat-${stat.id}`}
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
                        <Label className="text-xs">Köpek Türü</Label>
                        <Input
                          value={newDogBreedName}
                          onChange={(e) => setNewDogBreedName(e.target.value)}
                          placeholder="Golden Retriever"
                          data-testid="input-dog-breed-name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Yüzde (%)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={newDogBreedPercentage}
                          onChange={(e) => setNewDogBreedPercentage(e.target.value)}
                          placeholder="28"
                          data-testid="input-dog-breed-percentage"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Renk</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newDogBreedColor}
                            onChange={(e) => setNewDogBreedColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border"
                            data-testid="input-dog-breed-color"
                          />
                          <Input
                            value={newDogBreedColor}
                            onChange={(e) => setNewDogBreedColor(e.target.value)}
                            placeholder="#1565c0"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Sıralama</Label>
                        <Input
                          type="number"
                          value={newDogBreedSortOrder}
                          onChange={(e) => setNewDogBreedSortOrder(e.target.value)}
                          data-testid="input-dog-breed-sort-order"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      disabled={!newDogBreedName || !newDogBreedPercentage || addDogBreedStatMutation.isPending}
                      onClick={() => {
                        if (dogBreedStatsProductId && newDogBreedName && newDogBreedPercentage) {
                          addDogBreedStatMutation.mutate({
                            productId: dogBreedStatsProductId,
                            breedName: newDogBreedName,
                            percentage: parseInt(newDogBreedPercentage),
                            color: newDogBreedColor,
                            sortOrder: parseInt(newDogBreedSortOrder) || 0,
                          });
                        }
                      }}
                      data-testid="btn-add-dog-breed-stat"
                    >
                      {addDogBreedStatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "İstatistik Ekle"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>}

        {yonetimSub === "hatirlatmalar" && <ReorderRemindersSection />}
        </>}
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

function DashboardSection() {
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/admin/dashboard-stats"] });
  const [segmentTab, setSegmentTab] = useState<"vip" | "dormant" | "risky">("vip");
  const [smsTarget, setSmsTarget] = useState<{ phone: string; name: string } | null>(null);
  const [smsText, setSmsText] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const { toast } = useToast();

  const sendSingleSms = async () => {
    if (!smsTarget || !smsText.trim()) return;
    setSmsSending(true);
    try {
      await apiRequest("POST", "/api/admin/send-sms", { phones: [smsTarget.phone], message: smsText });
      toast({ title: "SMS gönderildi" });
      setSmsTarget(null);
      setSmsText("");
    } catch { toast({ title: "SMS gönderilemedi", variant: "destructive" }); }
    setSmsSending(false);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!stats) return null;

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };
  const todayVsYesterday = pctChange(stats.today.revenue, stats.yesterday?.revenue || 0);
  const weekVsPrev = pctChange(stats.week.revenue, stats.prevWeek?.revenue || 0);
  const seg = stats.segments || {};

  return (
    <div className="space-y-5" data-testid="section-dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Bugün", value: `${stats.today.revenue.toLocaleString("tr-TR")} ₺`, sub: `${stats.today.orders} sipariş`, color: "#6B3480", avg: stats.today.avgBasket, change: todayVsYesterday, changeLabel: "düne göre" },
          { label: "Bu Hafta", value: `${stats.week.revenue.toLocaleString("tr-TR")} ₺`, sub: `${stats.week.orders} sipariş`, color: "#2563eb", avg: stats.week.avgBasket, change: weekVsPrev, changeLabel: "önceki haftaya göre" },
          { label: "Bu Ay", value: `${stats.month.revenue.toLocaleString("tr-TR")} ₺`, sub: `${stats.month.orders} sipariş`, color: "#16a34a", avg: stats.month.avgBasket },
          { label: "Toplam", value: `${stats.total.revenue.toLocaleString("tr-TR")} ₺`, sub: `${stats.total.orders} sipariş`, color: "#ea580c" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
              {s.avg !== undefined && s.avg > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">Ort. sepet: {s.avg.toLocaleString("tr-TR")} ₺</p>
              )}
              {s.change !== undefined && (
                <p className={`text-[10px] font-medium mt-0.5 ${s.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {s.change >= 0 ? "↑" : "↓"} %{Math.abs(s.change)} {s.changeLabel}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Bekleyen Sipariş</p><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Tamamlanan</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Toplam Müşteri</p><p className="text-2xl font-bold text-blue-600">{stats.total.customers}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Aktif Ürün</p><p className="text-2xl font-bold text-purple-600">{stats.total.products}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Müşteri Segmentasyonu</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex gap-2 mb-3">
            {([
              { key: "vip" as const, label: "VIP", count: seg.vipCount || 0, color: "bg-amber-100 text-amber-800", activeColor: "bg-amber-500 text-white" },
              { key: "dormant" as const, label: "Pasif", count: seg.dormantCount || 0, color: "bg-blue-100 text-blue-800", activeColor: "bg-blue-500 text-white" },
              { key: "risky" as const, label: "Riskli", count: seg.riskyCount || 0, color: "bg-red-100 text-red-800", activeColor: "bg-red-500 text-white" },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setSegmentTab(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${segmentTab === t.key ? t.activeColor : t.color}`}
                data-testid={`btn-segment-${t.key}`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {segmentTab === "vip" && (
            <div className="space-y-1.5" data-testid="segment-vip-list">
              <p className="text-[10px] text-muted-foreground mb-1">3.000 ₺ üstü harcama yapan müşteriler</p>
              {(seg.vip || []).length === 0 && <p className="text-xs text-muted-foreground">Henüz VIP müşteri yok</p>}
              {(seg.vip || []).map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 text-xs bg-amber-50 rounded p-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground">{c.count} sipariş</span>
                  <span className="font-bold text-amber-700">{c.total.toLocaleString("tr-TR")} ₺</span>
                </div>
              ))}
            </div>
          )}

          {segmentTab === "dormant" && (
            <div className="space-y-1.5" data-testid="segment-dormant-list">
              <p className="text-[10px] text-muted-foreground mb-1">30+ gündür sipariş vermeyen müşteriler</p>
              {(seg.dormant || []).length === 0 && <p className="text-xs text-muted-foreground">Tüm müşteriler aktif!</p>}
              {(seg.dormant || []).map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 text-xs bg-blue-50 rounded p-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{c.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {c.daysSince !== null ? `${c.daysSince} gündür sipariş yok` : "Hiç sipariş vermedi"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px] text-blue-600 shrink-0"
                    onClick={() => { setSmsTarget({ phone: c.phone, name: c.name }); setSmsText(`Merhaba ${c.name}, sizi özledik! 🐾 JETGO'da yeni ürünler sizi bekliyor. Hemen sipariş verin, kapınıza getirelim! jetgo.pet`); }}
                    data-testid={`btn-remind-${c.id}`}
                  >
                    <Send className="w-3 h-3 mr-0.5" /> SMS
                  </Button>
                </div>
              ))}
            </div>
          )}

          {segmentTab === "risky" && (
            <div className="space-y-1.5" data-testid="segment-risky-list">
              <p className="text-[10px] text-muted-foreground mb-1">2+ sipariş iptali olan müşteriler</p>
              {(seg.risky || []).length === 0 && <p className="text-xs text-muted-foreground">Riskli müşteri yok</p>}
              {(seg.risky || []).map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 text-xs bg-red-50 rounded p-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="font-medium flex-1 truncate">{c.name}</span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{c.cancellations} iptal</Badge>
                  <span className="text-muted-foreground">{c.total.toLocaleString("tr-TR")} ₺</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={smsTarget !== null} onOpenChange={(open) => { if (!open) setSmsTarget(null); }}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Hatırlatma SMS Gönder</DialogTitle>
          </DialogHeader>
          {smsTarget && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground"><strong>{smsTarget.name}</strong> ({smsTarget.phone})</p>
              <textarea
                className="w-full border rounded-lg p-2.5 text-sm min-h-[80px] resize-none"
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
                data-testid="input-reminder-sms"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setSmsTarget(null)}>İptal</Button>
                <Button size="sm" onClick={sendSingleSms} disabled={smsSending || !smsText.trim()} data-testid="btn-send-reminder-sms">
                  {smsSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1" /> Gönder</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {stats.topProducts?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">En Çok Satan 10 Ürün</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {stats.topProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-muted-foreground font-mono text-xs">{i + 1}.</span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-muted-foreground text-xs">{p.qty} adet</span>
                  <span className="font-semibold text-xs">{p.revenue.toLocaleString("tr-TR")} ₺</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {stats.lowStockProducts?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Düşük Stok ({stats.lowStockProducts.length})</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-1">
              {stats.lowStockProducts.slice(0, 20).map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{p.name}</span>
                  <Badge variant={p.stock === 0 ? "destructive" : "secondary"} className="text-xs">{p.stock} adet</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CustomersSection() {
  const { data: customers = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/customers"] });
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const { toast } = useToast();

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, address }: { id: number; name: string; address: string }) => {
      await apiRequest("PATCH", `/api/admin/customers/${id}`, { name, address });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setEditingCustomer(null);
      toast({ title: "Müşteri güncellendi" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setDeleteConfirmId(null);
      toast({ title: "Müşteri silindi" });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/impersonate/${id}`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: `${data.name} hesabına geçildi` });
      window.open("/hesabim", "_blank");
    },
  });

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4" data-testid="section-customers">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Ad veya telefon ara..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" data-testid="input-customer-search" />
        </div>
        <Badge variant="secondary">{filtered.length} müşteri</Badge>
      </div>
      <div className="space-y-2">
        {filtered.slice(0, 50).map(c => {
          const isExpanded = expandedId === c.id;
          return (
          <Card key={c.id}>
            <CardContent className="p-3">
              {editingCustomer?.id === c.id ? (
                <div className="space-y-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ad Soyad" className="h-8 text-sm" />
                  <Input value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Adres" className="h-8 text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateMutation.mutate({ id: c.id, name: editName, address: editAddress })} disabled={updateMutation.isPending}>Kaydet</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCustomer(null)}>İptal</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 cursor-pointer flex-1" onClick={() => setExpandedId(isExpanded ? null : c.id)} data-testid={`btn-expand-customer-${c.id}`}>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm" style={{ color: "#e65100" }}>{c.name}</p>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        {c.isBlacklisted && <Badge variant="destructive" className="text-[10px] px-1 py-0">Kara Liste</Badge>}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{c.orderCount} sipariş</span>
                        <span>{c.totalSpent.toLocaleString("tr-TR")} ₺</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingCustomer(c); setEditName(c.name); setEditAddress(c.address || ""); }} data-testid={`btn-edit-customer-${c.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <a href={`https://wa.me/90${c.phone}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600"><SiWhatsapp className="w-3.5 h-3.5" /></Button>
                      </a>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => setDeleteConfirmId(c.id)} data-testid={`btn-delete-customer-${c.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-3" data-testid={`detail-customer-${c.id}`}>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">Ad Soyad:</span>
                        </div>
                        <span>{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">Telefon:</span>
                        </div>
                        <a href={`tel:${c.phone}`} className="text-blue-600">{c.phone}</a>
                        {c.email && (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium ml-5">E-posta:</span>
                            </div>
                            <span>{c.email}</span>
                          </>
                        )}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">Adres:</span>
                        </div>
                        <span className="break-words">{c.address || "—"}</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">Kayıt:</span>
                        </div>
                        <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("tr-TR") : "—"}</span>
                      </div>

                      {c.addresses && c.addresses.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Kayıtlı Adresler</p>
                          <div className="space-y-1">
                            {c.addresses.map((a: any) => (
                              <div key={a.id} className="text-xs bg-gray-50 rounded p-2">
                                <span className="font-medium">{a.label}:</span> {a.address}
                                {a.district && <span className="text-muted-foreground"> ({a.district})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Siparişler ({c.orderCount})</p>
                          <span className="text-xs font-bold" style={{ color: "#e65100" }}>{c.totalSpent.toLocaleString("tr-TR")} ₺</span>
                        </div>
                        {c.orders && c.orders.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {c.orders.map((o: any) => (
                              <div key={o.id} className="text-xs bg-gray-50 rounded p-2 flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-medium">#{o.id}</span>
                                  <span className="text-muted-foreground ml-1.5">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</span>
                                  <span className="text-muted-foreground ml-1.5">{o.itemCount} ürün</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={o.status === "delivered" ? "default" : o.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                                    {o.status === "pending" ? "Bekliyor" : o.status === "delivered" ? "Teslim" : o.status === "cancelled" ? "İptal" : o.status}
                                  </Badge>
                                  <span className="font-bold">{o.grandTotal?.toLocaleString("tr-TR")} ₺</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Henüz sipariş yok</p>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs gap-1.5"
                          onClick={() => impersonateMutation.mutate(c.id)}
                          disabled={impersonateMutation.isPending}
                          data-testid={`btn-impersonate-customer-${c.id}`}
                        >
                          {impersonateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                          Üye Hesabına Geç
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Üye Sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bu müşteriyi silmek istediğinize emin misiniz? Tüm verileri (favoriler, adresler, puanlar, evcil hayvanlar) kalıcı olarak silinecektir.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} data-testid="btn-cancel-delete-customer">İptal</Button>
            <Button variant="destructive" size="sm" onClick={() => { if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId); }} disabled={deleteMutation.isPending} data-testid="btn-confirm-delete-customer">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sil"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationsSection() {
  const { data: customers = [] } = useQuery<any[]>({ queryKey: ["/api/admin/customers"] });
  const { data: orders = [] } = useQuery<any[]>({ queryKey: ["/api/admin/orders"] });
  const { data: allProducts = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: categories = [] } = useQuery<BrandCategory[]>({ queryKey: ["/api/brand-categories"] });
  const [message, setMessage] = useState("");
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [segment, setSegment] = useState<string>("all");
  const { toast } = useToast();

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const segmentedCustomers = useMemo(() => {
    if (segment === "all") return customers;
    if (segment === "blacklisted") return customers.filter((c: any) => c.is_blacklisted || c.isBlacklisted);

    const animalFilter = segment;
    const customerPhonesWithAnimal = new Set<string>();
    for (const order of orders) {
      if (order.status === "iptal") continue;
      const items = order.items as any[];
      if (!items) continue;
      for (const item of items) {
        const product = allProducts.find(p => p.id === parseInt(String(item.productId)));
        if (product) {
          const cat = catMap.get(product.brandCategoryId);
          if (cat && cat.animal === animalFilter && order.customerPhone) {
            customerPhonesWithAnimal.add(order.customerPhone);
          }
        }
      }
    }
    return customers.filter((c: any) => customerPhonesWithAnimal.has(c.phone));
  }, [segment, customers, orders, allProducts, catMap]);

  const handleSegmentChange = (val: string) => {
    setSegment(val);
    setSelectedPhones([]);
    setSelectAll(false);
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedPhones([]);
      setSelectAll(false);
    } else {
      setSelectedPhones(segmentedCustomers.map((c: any) => c.phone));
      setSelectAll(true);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || selectedPhones.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await apiRequest("POST", "/api/admin/send-sms", { phones: selectedPhones, message: message.trim() });
      const data = await res.json();
      setResult(data);
      toast({ title: `${data.sent} SMS gönderildi`, description: data.failed > 0 ? `${data.failed} başarısız` : undefined });
    } catch {
      toast({ title: "SMS gönderilemedi", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const quickTemplates = [
    { label: "Yeni Ürün", text: "JETGO'da yeni ürünler geldi! Hemen inceleyin: jetgo.pet" },
    { label: "Kampanya", text: "JETGO'da büyük kampanya başladı! Kaçırmayın: jetgo.pet" },
    { label: "Kargo Ücretsiz", text: "Bugüne özel kargo bedava! Sipariş verin: jetgo.pet" },
  ];

  return (
    <div className="space-y-4" data-testid="section-notifications">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Toplu SMS Gönder</CardTitle></CardHeader>
        <CardContent className="p-3 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Hedef Kitle</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "Tümü" },
                { key: "kedi", label: "🐱 Kedi Sahipleri" },
                { key: "kopek", label: "🐶 Köpek Sahipleri" },
                { key: "kus", label: "🐦 Kuş Sahipleri" },
                { key: "kemirgen", label: "🐹 Kemirgen Sahipleri" },
                { key: "balik", label: "🐠 Balık Sahipleri" },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSegmentChange(s.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    segment === s.key ? "text-white" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                  style={segment === s.key ? { backgroundColor: "#6B3480" } : {}}
                  data-testid={`btn-segment-${s.key}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{segmentedCustomers.length} müşteri bu segmentte</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Hazır Şablonlar</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {quickTemplates.map(t => (
                <button key={t.label} onClick={() => setMessage(t.text)} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors" data-testid={`btn-template-${t.label}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mesaj ({message.length}/300)</label>
            <textarea className="w-full border rounded-md p-2 text-sm mt-1 min-h-[80px] resize-none" maxLength={300} value={message} onChange={e => setMessage(e.target.value)} placeholder="Kampanya mesajınızı yazın..." data-testid="input-sms-message" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={selectAll} onChange={handleToggleAll} className="rounded" />
              Tüm {segment !== "all" ? "filtrelenen" : ""} müşteriler ({segmentedCustomers.length})
            </label>
            <Badge variant="secondary">{selectedPhones.length} seçili</Badge>
          </div>
          {!selectAll && (
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
              {segmentedCustomers.map((c: any) => (
                <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPhones.includes(c.phone)}
                    onChange={e => {
                      if (e.target.checked) setSelectedPhones(prev => [...prev, c.phone]);
                      else setSelectedPhones(prev => prev.filter(p => p !== c.phone));
                    }}
                    className="rounded"
                  />
                  {c.name} ({c.phone})
                </label>
              ))}
            </div>
          )}
          <Button onClick={handleSend} disabled={sending || !message.trim() || selectedPhones.length === 0} className="w-full" style={{ backgroundColor: "#6B3480" }} data-testid="btn-send-sms">
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {sending ? "Gönderiliyor..." : `${selectedPhones.length} kişiye SMS Gönder`}
          </Button>
          {result && (
            <div className="p-2 rounded-md bg-green-50 border border-green-200 text-sm">
              <Check className="w-4 h-4 inline text-green-600 mr-1" />
              {result.sent} başarılı{result.failed > 0 ? `, ${result.failed} başarısız` : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BannersSection() {
  const { data: allBanners = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/banners"] });
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("linkUrl", linkUrl);
      formData.append("sortOrder", sortOrder);
      if (imageFile) formData.append("image", imageFile);
      const res = await fetch("/api/admin/banners", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      setTitle(""); setLinkUrl(""); setSortOrder("0"); setImageFile(null);
      toast({ title: "Banner eklendi" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/banners/${id}`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/banners/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banner silindi" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4" data-testid="section-banners">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Yeni Banner Ekle</CardTitle></CardHeader>
        <CardContent className="p-3 space-y-2">
          <Input placeholder="Banner başlığı" value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" data-testid="input-banner-title" />
          <Input placeholder="Link URL (opsiyonel)" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="h-8 text-sm" />
          <div className="flex gap-2">
            <Input type="number" placeholder="Sıra" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="h-8 text-sm w-20" />
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-xs flex-1" />
          </div>
          <Button size="sm" onClick={() => createMutation.mutate()} disabled={!title.trim() || createMutation.isPending}>
            <Plus className="w-3.5 h-3.5 mr-1" />Ekle
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {allBanners.map(b => (
          <Card key={b.id}>
            <CardContent className="p-3 flex items-center gap-3">
              {b.imageData && <img src={b.imageData} alt={b.title} className="w-16 h-10 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{b.title}</p>
                {b.linkUrl && <p className="text-xs text-muted-foreground truncate">{b.linkUrl}</p>}
              </div>
              <Badge variant={b.isActive ? "default" : "secondary"} className="cursor-pointer text-xs" onClick={() => toggleMutation.mutate({ id: b.id, isActive: !b.isActive })}>
                {b.isActive ? "Aktif" : "Pasif"}
              </Badge>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteMutation.mutate(b.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {allBanners.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Henüz banner eklenmemiş</p>}
      </div>
    </div>
  );
}

function CouponsSection() {
  const { data: coupons, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/coupons"] });
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setCode("");
    setDiscountType("fixed");
    setDiscountValue("");
    setMinOrderAmount("");
    setMaxUses("");
    setExpiresAt("");
    setIsActive(true);
  };

  const startEdit = (coupon: any) => {
    setEditId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(String(coupon.discountValue));
    setMinOrderAmount(String(coupon.minOrderAmount));
    setMaxUses(coupon.maxUses ? String(coupon.maxUses) : "");
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "");
    setIsActive(coupon.isActive);
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editId) {
        await apiRequest("PATCH", `/api/admin/coupons/${editId}`, data);
      } else {
        await apiRequest("POST", "/api/admin/coupons", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: editId ? "Kupon güncellendi" : "Kupon oluşturuldu" });
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Kupon silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kupon silinemedi", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      await apiRequest("PATCH", `/api/admin/coupons/${id}`, { isActive: active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kupon güncellenemedi", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!code.trim() || !discountValue) {
      toast({ title: "Kupon kodu ve indirim değeri gerekli", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive,
    });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold">Kupon Yönetimi</h2>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} data-testid="btn-add-coupon">
            <Plus className="w-4 h-4 mr-1" /> Yeni Kupon
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">{editId ? "Kuponu Düzenle" : "Yeni Kupon"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kupon Kodu</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ör: YENI2024" data-testid="input-coupon-code" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">İndirim Tipi</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger data-testid="select-coupon-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Sabit (TL)</SelectItem>
                    <SelectItem value="percentage">Yüzde (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">İndirim Değeri {discountType === "fixed" ? "(TL)" : "(%)"}</Label>
                <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="50" data-testid="input-coupon-value" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min. Sipariş Tutarı (TL)</Label>
                <Input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} placeholder="0" data-testid="input-coupon-min" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Kullanım (boş=sınırsız)</Label>
                <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Sınırsız" data-testid="input-coupon-max" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Son Kullanım Tarihi</Label>
                <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} data-testid="input-coupon-expiry" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="coupon-active" data-testid="check-coupon-active" />
              <label htmlFor="coupon-active" className="text-sm">Aktif</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={createMutation.isPending} className="flex-1" data-testid="btn-save-coupon">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                {editId ? "Güncelle" : "Oluştur"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Vazgeç</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {coupons && coupons.length > 0 ? coupons.map((coupon: any) => (
          <Card key={coupon.id} className="rounded-xl" data-testid={`card-coupon-${coupon.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{coupon.code}</code>
                  <Badge variant={coupon.isActive ? "default" : "secondary"} className="text-xs">
                    {coupon.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleActiveMutation.mutate({ id: coupon.id, active: !coupon.isActive })} data-testid={`btn-toggle-coupon-${coupon.id}`}>
                    {coupon.isActive ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(coupon)} data-testid={`btn-edit-coupon-${coupon.id}`}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => deleteMutation.mutate(coupon.id)} data-testid={`btn-delete-coupon-${coupon.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>İndirim: <span className="font-medium text-foreground">{coupon.discountType === "percentage" ? `%${coupon.discountValue}` : `${coupon.discountValue} TL`}</span></div>
                <div>Min. Sipariş: <span className="font-medium text-foreground">{coupon.minOrderAmount} TL</span></div>
                <div>Kullanım: <span className="font-medium text-foreground">{coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : " (sınırsız)"}</span></div>
                <div>Son Tarih: <span className="font-medium text-foreground">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("tr-TR") : "Yok"}</span></div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8 text-muted-foreground text-sm">Henüz kupon oluşturulmamış</div>
        )}
      </div>
    </section>
  );
}

function SettingsSection() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const [form, setForm] = useState({
    pet_base_points: "",
    pet_streak_divisor: "",
    pet_max_points: "",
    pet_base_exp: "",
    pet_streak_exp_bonus: "",
    loyalty_percent: "",
    admin_phone: "",
    order_notification_sms: "1",
    payment_eft_enabled: "0",
    campaign_hero_title: "",
    campaign_hero_subtitle: "",
    campaign_end_date: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        pet_base_points: settings.pet_base_points || "1",
        pet_streak_divisor: settings.pet_streak_divisor || "3",
        pet_max_points: settings.pet_max_points || "5",
        pet_base_exp: settings.pet_base_exp || "10",
        pet_streak_exp_bonus: settings.pet_streak_exp_bonus || "2",
        loyalty_percent: settings.loyalty_percent || "5",
        admin_phone: settings.admin_phone || "",
        order_notification_sms: settings.order_notification_sms ?? "1",
        payment_eft_enabled: settings.payment_eft_enabled ?? "0",
        campaign_hero_title: settings.campaign_hero_title || "",
        campaign_hero_subtitle: settings.campaign_hero_subtitle || "",
        campaign_end_date: settings.campaign_end_date || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Ayarlar kaydedildi" });
    },
    onError: () => {
      toast({ title: "Kaydetme hatası", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const fields = [
    { key: "loyalty_percent", label: "Sipariş Para Puan Oranı (%)", desc: "Her siparişte toplam tutarın yüzde kaçı Para Puan olarak kazanılır", icon: "💰" },
    { key: "pet_base_points", label: "Besleme Temel Puan", desc: "Her besleme için verilecek minimum puan", icon: "🐾" },
    { key: "pet_streak_divisor", label: "Seri Bölen", desc: "Kaç günde bir bonus puan artar (ör: 3 = her 3 günde +1 puan)", icon: "🔥" },
    { key: "pet_max_points", label: "Maksimum Günlük Puan", desc: "Bir beslemede kazanılabilecek en yüksek puan", icon: "⭐" },
    { key: "pet_base_exp", label: "Besleme Temel XP", desc: "Her beslemede kazanılan deneyim puanı", icon: "📊" },
    { key: "pet_streak_exp_bonus", label: "Seri XP Bonusu", desc: "Seri gün başına ek deneyim puanı (seri × bu değer)", icon: "✨" },
  ];

  return (
    <div className="space-y-4" data-testid="section-ayarlar">
      <h2 className="text-lg font-bold">Puan & Besleme Ayarları</h2>

      <Card>
        <CardContent className="pt-4 space-y-4">
          {fields.map(f => (
            <div key={f.key} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
              <span className="text-xl mt-1">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-bold">{f.label}</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-20 text-center font-bold"
                data-testid={`input-setting-${f.key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-bold mb-2">Puan Formülü Önizleme</h3>
          <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
            <p><strong>Sipariş kazanımı:</strong> Toplam tutar × %{form.loyalty_percent || 5}</p>
            <p><strong>Besleme puanı:</strong> {form.pet_base_points || 1} + (seri gün ÷ {form.pet_streak_divisor || 3}), maks {form.pet_max_points || 5}</p>
            <p><strong>Deneyim:</strong> {form.pet_base_exp || 10} + (seri gün × {form.pet_streak_exp_bonus || 2})</p>
            <div className="border-t pt-2 mt-2">
              <p className="text-muted-foreground">Örnek: 500 TL sipariş = <strong>{Math.round(500 * (Number(form.loyalty_percent || 5) / 100))} puan</strong></p>
              <p className="text-muted-foreground">Örnek: 10. gün besleme = <strong>{Math.min(Number(form.pet_base_points || 1) + Math.floor(10 / Math.max(Number(form.pet_streak_divisor || 3), 1)), Number(form.pet_max_points || 5))} puan</strong>, {Number(form.pet_base_exp || 10) + 10 * Number(form.pet_streak_exp_bonus || 2)} XP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">📱 Sipariş Bildirim Ayarları</h3>
          <div className="flex items-start gap-3 pb-3 border-b">
            <span className="text-xl mt-1">📞</span>
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-bold">Admin Telefon Numarası</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">Yeni sipariş geldiğinde SMS bildirim alacak numara</p>
            </div>
            <Input
              type="tel"
              placeholder="5XXXXXXXXX"
              value={form.admin_phone}
              onChange={e => setForm(prev => ({ ...prev, admin_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
              className="w-32 text-center font-bold"
              data-testid="input-admin-phone"
            />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl mt-1">✉️</span>
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-bold">SMS Bildirimi</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">Yeni siparişlerde SMS bildirim gönderilsin mi?</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, order_notification_sms: prev.order_notification_sms === "1" ? "0" : "1" }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.order_notification_sms === "1" ? "bg-green-500" : "bg-gray-300"}`}
              data-testid="toggle-sms-notification"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.order_notification_sms === "1" ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <Label className="text-sm font-bold">Banka Havalesi (EFT) Ödeme</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">Checkout'ta EFT/Havale seçeneği görünsün mü?</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, payment_eft_enabled: prev.payment_eft_enabled === "true" ? "0" : "true" }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.payment_eft_enabled === "true" ? "bg-green-500" : "bg-gray-300"}`}
              data-testid="toggle-eft-payment"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.payment_eft_enabled === "true" ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">🔥 Kampanya Sayfası Yönetimi</h3>
          <p className="text-[11px] text-muted-foreground">/kampanya sayfasının üst kısmındaki başlık, alt başlık ve geri sayım için bitiş tarihi.</p>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Kampanya Başlığı</Label>
            <Input
              type="text"
              placeholder="Kaçırılmaz Kampanyalar"
              value={form.campaign_hero_title}
              onChange={e => setForm(prev => ({ ...prev, campaign_hero_title: e.target.value.slice(0, 80) }))}
              data-testid="input-campaign-title"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Alt Başlık</Label>
            <Input
              type="text"
              placeholder="Sınırlı stoklarla özel indirimler — kapıda nakit · 3 günde teslim"
              value={form.campaign_hero_subtitle}
              onChange={e => setForm(prev => ({ ...prev, campaign_hero_subtitle: e.target.value.slice(0, 200) }))}
              data-testid="input-campaign-subtitle"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Kampanya Bitiş Tarihi (Geri Sayım)</Label>
            <Input
              type="datetime-local"
              value={form.campaign_end_date}
              onChange={e => setForm(prev => ({ ...prev, campaign_end_date: e.target.value }))}
              data-testid="input-campaign-end-date"
            />
            <p className="text-[11px] text-muted-foreground">Boş bırakılırsa geri sayım gösterilmez. Tarih geçince otomatik gizlenir.</p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="w-full"
        style={{ backgroundColor: "#6B3480" }}
        data-testid="btn-save-settings"
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Ayarları Kaydet
      </Button>
    </div>
  );
}

interface ContactMessageRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function ContactMessagesSection() {
  const { toast } = useToast();
  const { data: messages = [], isLoading } = useQuery<ContactMessageRow[]>({
    queryKey: ["/api/admin/contact-messages"],
  });

  const markRead = useMutation({
    mutationFn: async ({ id, isRead }: { id: number; isRead: boolean }) => {
      await apiRequest("PATCH", `/api/admin/contact-messages/${id}`, { isRead });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages/unread-count"] });
    },
  });

  const deleteMsg = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/contact-messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages/unread-count"] });
      toast({ title: "Mesaj silindi" });
    },
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-3" data-testid="section-contact-messages">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">İletişim Mesajları</h2>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white" data-testid="badge-unread-count">
              {unreadCount} yeni
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Toplam {messages.length} mesaj</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Henüz mesaj yok.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <Card
              key={m.id}
              className={!m.isRead ? "border-l-4 border-l-red-500 bg-red-50/30" : ""}
              data-testid={`contact-message-${m.id}`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" data-testid={`contact-name-${m.id}`}>{m.name}</span>
                      {!m.isRead && <Badge className="bg-red-500 text-white text-[10px]">YENİ</Badge>}
                      {m.subject && <Badge variant="outline" className="text-[11px]">{m.subject}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-primary" data-testid={`contact-phone-${m.id}`}>
                        <Phone className="w-3 h-3" />
                        {m.phone}
                      </a>
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-primary" data-testid={`contact-email-${m.id}`}>
                          <Mail className="w-3 h-3" />
                          {m.email}
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(m.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700" data-testid={`contact-message-text-${m.id}`}>
                      {m.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant={m.isRead ? "outline" : "default"}
                      onClick={() => markRead.mutate({ id: m.id, isRead: !m.isRead })}
                      disabled={markRead.isPending}
                      data-testid={`btn-toggle-read-${m.id}`}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      {m.isRead ? "Okunmadı" : "Okundu"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Mesaj silinsin mi?")) deleteMsg.mutate(m.id);
                      }}
                      disabled={deleteMsg.isPending}
                      data-testid={`btn-delete-msg-${m.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewManagementSection() {
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "all"],
    queryFn: async () => {
      const res = await fetch("/api/products?all=true", { credentials: "include" });
      return res.json();
    },
  });
  const { data: categories = [] } = useQuery<BrandCategory[]>({
    queryKey: ["/api/brand-categories"],
  });
  const { data: subcats = [] } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories"],
  });
  const { data: reviews = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const [filterProduct, setFilterProduct] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editReview, setEditReview] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formProductId, setFormProductId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState("5");
  const [formComment, setFormComment] = useState("");
  const [formHelpful, setFormHelpful] = useState("0");
  const [formDate, setFormDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  });
  const [formPublished, setFormPublished] = useState(true);
  const [formAnimal, setFormAnimal] = useState("");
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formProductSearch, setFormProductSearch] = useState("");

  const categoryMap = useMemo(() => {
    const map = new Map<number, BrandCategory>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  const animalLabels: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kemirgen: "Kemirgen", kus: "Kuş", akvaryum: "Akvaryum" };
  const animalOptions = useMemo(() => {
    const set = new Set<string>();
    categories.forEach(c => set.add(c.animal));
    return Array.from(set);
  }, [categories]);

  const subcatOptions = useMemo(() => {
    if (!formAnimal) return [];
    return subcats.filter(s => s.animal === formAnimal && s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [subcats, formAnimal]);

  const brandOptions = useMemo(() => {
    if (!formAnimal || !formSubcategory) return [];
    const set = new Set<string>();
    categories.filter(c => c.animal === formAnimal && c.subcategory === formSubcategory).forEach(c => set.add(c.brandName));
    return Array.from(set).sort();
  }, [categories, formAnimal, formSubcategory]);

  const formFilteredProducts = useMemo(() => {
    let result = allProducts;
    if (formAnimal) {
      const catIds = new Set(categories.filter(c => c.animal === formAnimal).map(c => c.id));
      result = result.filter(p => catIds.has(p.brandCategoryId));
    }
    if (formSubcategory) {
      const catIds = new Set(categories.filter(c => c.animal === formAnimal && c.subcategory === formSubcategory).map(c => c.id));
      result = result.filter(p => catIds.has(p.brandCategoryId));
    }
    if (formBrand) {
      const catIds = new Set(categories.filter(c => c.brandName === formBrand && c.animal === formAnimal && c.subcategory === formSubcategory).map(c => c.id));
      result = result.filter(p => catIds.has(p.brandCategoryId));
    }
    if (formProductSearch.trim()) {
      const q = formProductSearch.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [allProducts, categories, formAnimal, formSubcategory, formBrand, formProductSearch]);

  const productMap = useMemo(() => {
    const map = new Map<number, string>();
    allProducts.forEach(p => map.set(p.id, p.name));
    return map;
  }, [allProducts]);

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (filterProduct) {
      const pid = parseInt(filterProduct);
      result = result.filter(r => r.productId === pid);
    }
    if (filterStatus === "published") result = result.filter(r => r.isPublished);
    if (filterStatus === "draft") result = result.filter(r => !r.isPublished);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(r => r.reviewerName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q) || (productMap.get(r.productId) || "").toLowerCase().includes(q));
    }
    return result;
  }, [reviews, filterProduct, filterStatus, searchQuery, productMap]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      setAddDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/reviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      setEditReview(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      await apiRequest("PATCH", `/api/admin/reviews/${id}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
  });

  function resetForm() {
    setFormProductId("");
    setFormName("");
    setFormRating("5");
    setFormComment("");
    setFormHelpful("0");
    setFormDate(new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }));
    setFormPublished(true);
    setFormAnimal("");
    setFormSubcategory("");
    setFormBrand("");
    setFormProductSearch("");
  }

  function openEditDialog(r: any) {
    setEditReview(r);
    setFormProductId(String(r.productId));
    setFormName(r.reviewerName);
    setFormRating(String(r.rating));
    setFormComment(r.comment);
    setFormHelpful(String(r.helpfulCount));
    setFormDate(r.reviewDate);
    setFormPublished(r.isPublished);
    const cat = categoryMap.get(allProducts.find(p => p.id === r.productId)?.brandCategoryId ?? 0);
    setFormAnimal(cat?.animal || "");
    setFormSubcategory(cat?.subcategory || "");
    setFormBrand(cat?.brandName || "");
    setFormProductSearch("");
  }

  function handleSubmit() {
    const data = {
      productId: parseInt(formProductId),
      reviewerName: formName.trim(),
      rating: parseInt(formRating),
      comment: formComment.trim(),
      helpfulCount: parseInt(formHelpful) || 0,
      reviewDate: formDate.trim(),
      isPublished: formPublished,
    };
    if (!data.productId || !data.reviewerName || !data.comment || !data.reviewDate) return;
    if (editReview) {
      updateMutation.mutate({ id: editReview.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const formValid = formProductId && formName.trim() && formComment.trim() && formDate.trim();

  const reviewForm = (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-bold">Ana Kategori</Label>
        <Select value={formAnimal} onValueChange={(v) => { setFormAnimal(v); setFormSubcategory(""); setFormBrand(""); setFormProductId(""); }}>
          <SelectTrigger className="h-8 text-xs" data-testid="select-review-animal">
            <SelectValue placeholder="Kategori seçin..." />
          </SelectTrigger>
          <SelectContent>
            {animalOptions.map(a => (
              <SelectItem key={a} value={a}>{animalLabels[a] || a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {formAnimal && subcatOptions.length > 0 && (
        <div>
          <Label className="text-xs font-bold">Alt Kategori</Label>
          <Select value={formSubcategory} onValueChange={(v) => { setFormSubcategory(v); setFormBrand(""); setFormProductId(""); }}>
            <SelectTrigger className="h-8 text-xs" data-testid="select-review-subcategory">
              <SelectValue placeholder="Alt kategori seçin..." />
            </SelectTrigger>
            <SelectContent>
              {subcatOptions.map(s => (
                <SelectItem key={s.slug} value={s.slug}>{s.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {formAnimal && formSubcategory && brandOptions.length > 0 && (
        <div>
          <Label className="text-xs font-bold">Marka</Label>
          <Select value={formBrand} onValueChange={(v) => { setFormBrand(v); setFormProductId(""); }}>
            <SelectTrigger className="h-8 text-xs" data-testid="select-review-brand">
              <SelectValue placeholder="Marka seçin..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {brandOptions.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {formAnimal && formSubcategory && (
        <div>
          <Label className="text-xs font-bold">Ürün Ara</Label>
          <Input
            value={formProductSearch}
            onChange={e => setFormProductSearch(e.target.value)}
            placeholder="Ürün adı ile ara..."
            className="h-8 text-xs"
            data-testid="input-review-product-search"
          />
        </div>
      )}
      {formAnimal && formSubcategory && (
        <div>
          <Label className="text-xs font-bold">Ürün ({formFilteredProducts.length})</Label>
          <Select value={formProductId} onValueChange={setFormProductId}>
            <SelectTrigger className="h-9 text-xs" data-testid="select-review-product">
              <SelectValue placeholder="Ürün seçin..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {formFilteredProducts.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-bold">Yorum Yazan</Label>
          <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ayşe Y." className="h-9 text-xs" data-testid="input-review-name" />
        </div>
        <div>
          <Label className="text-xs font-bold">Yorum Tarihi</Label>
          <Input value={formDate} onChange={e => setFormDate(e.target.value)} placeholder="14 Nisan 2026" className="h-9 text-xs" data-testid="input-review-date" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-bold">Puan (1-5)</Label>
          <Select value={formRating} onValueChange={setFormRating}>
            <SelectTrigger className="h-9 text-xs" data-testid="select-review-rating">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 4, 3, 2, 1].map(r => (
                <SelectItem key={r} value={String(r)}>{"⭐".repeat(r)} ({r})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-bold">Faydalı Bulan</Label>
          <Input type="number" min="0" value={formHelpful} onChange={e => setFormHelpful(e.target.value)} className="h-9 text-xs" data-testid="input-review-helpful" />
        </div>
      </div>
      <div>
        <Label className="text-xs font-bold">Yorum</Label>
        <textarea
          className="w-full border rounded-lg p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#6B3480]/20"
          rows={3}
          value={formComment}
          onChange={e => setFormComment(e.target.value)}
          placeholder="Ürün ve hizmet hakkında yorum..."
          data-testid="textarea-review-comment"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFormPublished(!formPublished)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formPublished ? "bg-green-500" : "bg-gray-300"}`}
          data-testid="toggle-review-published"
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formPublished ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
        <Label className="text-xs">{formPublished ? "Yayında" : "Taslak"}</Label>
      </div>
      <Button
        className="w-full"
        style={{ backgroundColor: "#6B3480" }}
        disabled={!formValid || createMutation.isPending || updateMutation.isPending}
        onClick={handleSubmit}
        data-testid="btn-save-review"
      >
        {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
        {editReview ? "Güncelle" : "Yorum Ekle"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4" data-testid="section-review-management">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Yorum Yönetimi
          <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
        </h2>
        <Button size="sm" style={{ backgroundColor: "#6B3480" }} onClick={() => { resetForm(); setAddDialogOpen(true); }} data-testid="btn-add-review">
          <Plus className="w-4 h-4 mr-1" />
          Yorum Ekle
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Ara (yorum, isim, ürün)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-8 text-xs w-[200px]"
          data-testid="input-search-reviews"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-review-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={(open) => { if (!open) { setAddDialogOpen(false); resetForm(); } else setAddDialogOpen(true); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Yeni Yorum Ekle</DialogTitle>
          </DialogHeader>
          {reviewForm}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editReview} onOpenChange={(open) => { if (!open) { setEditReview(null); resetForm(); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Yorumu Düzenle</DialogTitle>
          </DialogHeader>
          {reviewForm}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {reviews.length === 0 ? "Henüz yorum eklenmedi" : "Filtreye uygun yorum bulunamadı"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReviews.map((r: any) => (
            <Card key={r.id} className={`${!r.isPublished ? "opacity-60 border-dashed" : ""}`} data-testid={`review-card-${r.id}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold">{r.reviewerName}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{r.reviewDate}</span>
                      {!r.isPublished && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">Taslak</Badge>
                      )}
                      {r.helpfulCount > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <ThumbsUp className="w-2.5 h-2.5" /> {r.helpfulCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-1 font-medium truncate" data-testid={`review-product-${r.id}`}>
                      {productMap.get(r.productId) || `Ürün #${r.productId}`}
                    </p>
                    <p className="text-xs text-gray-700 line-clamp-2">{r.comment}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublishMutation.mutate({ id: r.id, isPublished: !r.isPublished })}
                      className={`px-2 py-1 rounded text-[10px] font-semibold ${r.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      data-testid={`btn-toggle-publish-${r.id}`}
                    >
                      {r.isPublished ? "Yayında" : "Yayınla"}
                    </button>
                    <button
                      onClick={() => openEditDialog(r)}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-blue-100 text-blue-700"
                      data-testid={`btn-edit-review-${r.id}`}
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => { if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) deleteMutation.mutate(r.id); }}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-red-100 text-red-700"
                      data-testid={`btn-delete-review-${r.id}`}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SktTakipSection() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/products", "all"],
    queryFn: async () => {
      const res = await fetch("/api/products?all=true", { credentials: "include" });
      return res.json();
    },
  });

  const monthNames = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

  const months = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (p.skt && typeof p.skt === "string" && p.skt.includes(".")) {
        const clean = p.skt.replace(/\.+$/, "").trim();
        if (/^\d{2}\.\d{4}$/.test(clean)) set.add(clean);
      }
    });
    return Array.from(set).sort((a, b) => {
      const [ma, ya] = a.split(".").map(Number);
      const [mb, yb] = b.split(".").map(Number);
      return ya !== yb ? ya - yb : ma - mb;
    });
  }, [products]);

  useEffect(() => {
    if (months.length > 0 && (!selectedMonth || !months.includes(selectedMonth))) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  const activeMonth = selectedMonth || months[0] || "";

  const filtered = useMemo(() => {
    if (!activeMonth) return [];
    return products
      .filter((p: any) => {
        if (!p.skt) return false;
        const clean = p.skt.replace(/\.+$/, "").trim();
        return clean === activeMonth;
      })
      .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", "tr"));
  }, [products, activeMonth]);

  const now = new Date();
  const getMonthStatus = (month: string) => {
    if (!month) return { isExpired: true, isNearExpiry: false, diffDays: 0 };
    const [m, y] = month.split(".").map(Number);
    const d = new Date(y, m - 1);
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { isExpired: diff < 0, isNearExpiry: diff >= 0 && diff <= 90, diffDays: diff };
  };

  const { isExpired, isNearExpiry, diffDays } = getMonthStatus(activeMonth);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-bold flex items-center gap-2" data-testid="text-skt-title">
          <Calendar className="w-5 h-5 text-orange-600" />
          SKT Takip
        </h2>
        {months.length > 0 ? (
          <select
            value={activeMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-orange-400 outline-none min-w-[160px]"
            data-testid="select-skt-month"
          >
            {months.map((m) => {
              const [mm, yy] = m.split(".");
              const st = getMonthStatus(m);
              return (
                <option key={m} value={m}>
                  {monthNames[parseInt(mm) - 1]} {yy} {st.isExpired ? "⚠️ GEÇMİŞ" : st.isNearExpiry ? "⏰" : ""}
                </option>
              );
            })}
          </select>
        ) : (
          <span className="text-sm text-gray-400">Henüz SKT girilmiş ürün yok</span>
        )}
        {activeMonth && (
          <>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              isExpired ? "bg-red-100 text-red-700" : isNearExpiry ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            }`}>
              {isExpired ? "SÜRESİ DOLMUŞ" : `${diffDays} gün kaldı`}
            </span>
            <span className="text-sm text-gray-500 ml-auto">{filtered.length} ürün</span>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : months.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Henüz hiçbir ürüne SKT girilmemiş</p>
          <p className="text-xs mt-1">Ürünlere SKT ekledikçe burada görünecek</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Bu ayda SKT'si olan ürün bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p: any) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isExpired ? "bg-red-50 border-red-200" : isNearExpiry ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
              }`}
              data-testid={`row-skt-product-${p.id}`}
            >
              {p.img ? (
                <img src={p.img} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-500">Fiyat: {p.price} TL</span>
                  <span className="text-xs text-gray-500">Stok: {p.stock}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isExpired ? "bg-red-100 text-red-700" : isNearExpiry ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}>
                    SKT: {p.skt}
                  </span>
                  {!p.isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">PASİF</span>
                  )}
                </div>
              </div>
              {p.barcode && (
                <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">{p.barcode}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CameraBarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [detected, setDetected] = useState(false);
  const [detectedCode, setDetectedCode] = useState("");
  const [boxW, setBoxW] = useState(260);
  const boxH = Math.floor(boxW * 0.32);

  const cleanup = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (!mounted) { cleanup(); return; }
        setReady(true);

        const cropCanvas = document.createElement("canvas");
        const cropCtx = cropCanvas.getContext("2d")!;

        const cropFrame = () => {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const cw = Math.floor(vw * 0.7);
          const ch = Math.floor(cw * 0.32);
          const cx = Math.floor((vw - cw) / 2);
          const cy = Math.floor((vh - ch) / 2);
          cropCanvas.width = cw;
          cropCanvas.height = ch;
          cropCtx.drawImage(video, cx, cy, cw, ch, 0, 0, cw, ch);
          return cropCanvas;
        };

        const hasBD = typeof (window as any).BarcodeDetector !== "undefined";
        if (hasBD) {
          const detector = new (window as any).BarcodeDetector({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "codabar", "itf", "qr_code"]
          });
          timerRef.current = setInterval(async () => {
            if (doneRef.current || !video || video.readyState < 2) return;
            try {
              const frame = cropFrame();
              const results = await detector.detect(frame);
              if (results.length > 0 && !doneRef.current) {
                doneRef.current = true;
                setDetected(true);
                setDetectedCode(results[0].rawValue);
                setTimeout(() => { cleanup(); onDetected(results[0].rawValue); }, 500);
              }
            } catch {}
          }, 100);
        } else {
          const { Html5Qrcode } = await import("html5-qrcode");
          const tmpDiv = document.createElement("div");
          tmpDiv.id = "hqr-tmp-" + Date.now();
          tmpDiv.style.display = "none";
          document.body.appendChild(tmpDiv);
          const hqr = new Html5Qrcode(tmpDiv.id, { verbose: false });

          timerRef.current = setInterval(async () => {
            if (doneRef.current || !video || video.readyState < 2) return;
            cropFrame();
            try {
              const blob = await new Promise<Blob | null>(r => cropCanvas.toBlob(r, "image/jpeg", 0.85));
              if (!blob || doneRef.current) return;
              const file = new File([blob], "f.jpg", { type: "image/jpeg" });
              const text = await hqr.scanFile(file, false);
              if (text && !doneRef.current) {
                doneRef.current = true;
                setDetected(true);
                setDetectedCode(text);
                setTimeout(() => { cleanup(); tmpDiv.remove(); onDetected(text); }, 500);
              }
            } catch {}
          }, 300);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(String(err));
      }
    };

    start();
    return () => { mounted = false; cleanup(); };
  }, []);

  const handleClose = () => {
    doneRef.current = true;
    cleanup();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 99999 }}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ zIndex: 100000, background: "#000" }}>
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Camera className="w-4 h-4" /> Barkod Tara
        </span>
        <div
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleClose(); }}
          className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center select-none"
          style={{ zIndex: 100001, WebkitTapHighlightColor: "transparent", cursor: "pointer" }}
          data-testid="btn-close-camera"
        >
          <X className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />

        {ready && !detected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{ width: boxW, height: boxH, border: "3px solid #22c55e", borderRadius: 8, boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }} />
          </div>
        )}

        {detected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 100003 }}>
            <div className="absolute inset-0 bg-red-500/40" />
            <div className="bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg z-10">
              Barkod Okundu!
            </div>
            <div className="bg-white/90 text-black px-4 py-2 rounded-lg mt-3 font-mono text-sm z-10">
              {detectedCode}
            </div>
          </div>
        )}
      </div>

      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 99998 }}>
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-black" style={{ zIndex: 100002, position: "relative" }}>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <div onPointerDown={handleClose} className="py-2 bg-red-500 text-white rounded-lg text-sm font-medium cursor-pointer text-center">Kapat</div>
          </div>
        </div>
      )}

      {ready && !detected && (
        <div className="px-4 py-2 bg-black space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 shrink-0">Çerçeve:</span>
            <input type="range" min={150} max={350} value={boxW} onChange={(e) => setBoxW(Number(e.target.value))} className="flex-1 h-1 accent-green-500" data-testid="slider-box-scale" />
            <span className="text-xs text-white/60 shrink-0 font-mono">{boxW}x{boxH}</span>
          </div>
          <p className="text-center text-xs text-white/50">Barkodu yeşil çerçeveye hizalayın</p>
        </div>
      )}
    </div>
  );
}

function StokSayimSection() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [foundProduct, setFoundProduct] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [editStock, setEditStock] = useState("");
  const [editSkt, setEditSkt] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [scanLog, setScanLog] = useState<Array<{ id: number; name: string; stock: number; skt: string; time: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const { data: allProducts = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q))).slice(0, 10);
  }, [searchQuery, allProducts]);

  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  const handleBarcodeSearch = async (code?: string) => {
    const barcode = code || barcodeInput.trim();
    if (!barcode) return;
    setSearching(true);
    setLastScannedBarcode(barcode);
    try {
      const res = await fetch(`/api/admin/product-by-barcode/${encodeURIComponent(barcode)}`, { credentials: "include" });
      if (res.ok) {
        const product = await res.json();
        setFoundProduct(product);
        setEditStock(String(product.stock));
        setEditSkt(product.skt || "");
        setEditBarcode(product.barcode || "");
        setLastScannedBarcode(null);
      } else {
        toast({ title: "Barkod bulunamadı: " + barcode, description: "Ürünü isimle arayıp barkodu atayabilirsiniz.", variant: "destructive" });
        setFoundProduct(null);
      }
    } catch {
      toast({ title: "Arama hatası", variant: "destructive" });
    } finally {
      setSearching(false);
      setBarcodeInput("");
    }
  };

  const selectProductDirect = (product: Product) => {
    setFoundProduct(product);
    setEditStock(String(product.stock));
    setEditSkt(product.skt || "");
    setEditBarcode(lastScannedBarcode && !product.barcode ? lastScannedBarcode : (product.barcode || ""));
    setSearchQuery("");
    if (lastScannedBarcode && !product.barcode) {
      toast({ title: "Barkod atandı", description: `"${lastScannedBarcode}" barkodu bu ürüne atanacak. Kaydetmeyi unutmayın.` });
    }
    setLastScannedBarcode(null);
  };

  const handleUpdate = async () => {
    if (!foundProduct) return;
    try {
      const res = await apiRequest("PATCH", `/api/admin/product-quick-update/${foundProduct.id}`, {
        stock: parseInt(editStock),
        skt: editSkt || null,
        barcode: editBarcode || null,
      });
      const updated = await res.json();
      setScanLog(prev => [{
        id: updated.id,
        name: updated.name || foundProduct.name,
        stock: parseInt(editStock),
        skt: editSkt,
        time: new Date().toLocaleTimeString("tr-TR"),
      }, ...prev].slice(0, 50));
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Güncellendi", description: `${foundProduct.name} — Stok: ${editStock}, SKT: ${editSkt || "—"}` });
      setFoundProduct(null);
    } catch {
      toast({ title: "Güncelleme hatası", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4" data-testid="section-stoksayim">
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><ScanLine className="w-4 h-4 text-blue-600" /> Barkod ile Ürün Bul</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Barkod okutun veya girin..."
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleBarcodeSearch()}
              autoFocus
              className="flex-1 text-lg font-mono"
              data-testid="input-barcode"
            />
            <Button onClick={() => handleBarcodeSearch()} disabled={searching || !barcodeInput.trim()} style={{ backgroundColor: "#6B3480" }} data-testid="btn-barcode-search">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => setCameraOpen(true)}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              data-testid="btn-camera-scan"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          {cameraOpen && (
            <CameraBarcodeScanner
              onDetected={(code) => {
                setCameraOpen(false);
                setBarcodeInput(code);
                handleBarcodeSearch(code);
              }}
              onClose={() => setCameraOpen(false)}
            />
          )}
          {lastScannedBarcode && !foundProduct && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-bold text-orange-700 mb-1">Barkod okundu: <span className="font-mono text-sm">{lastScannedBarcode}</span></p>
              <p className="text-xs text-orange-600">Bu barkoda kayıtlı ürün yok. Aşağıdan ürünü isimle bulun, barkod otomatik atanacak.</p>
            </div>
          )}
          <div className="relative">
            <Input
              placeholder="Veya ürün adıyla arayın..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-sm"
              data-testid="input-product-search"
            />
            {filteredProducts.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                {filteredProducts.map(p => (
                  <button key={p.id} onClick={() => selectProductDirect(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex justify-between items-center" data-testid={`search-result-${p.id}`}>
                    <span className="truncate flex-1">{p.name}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground ml-2">
                      <span>Stok: {p.stock}</span>
                      {p.barcode && <span className="font-mono">{p.barcode}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {foundProduct && (
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              {foundProduct.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Stok Adedi</Label>
                <Input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="mt-1 text-lg font-bold" data-testid="input-edit-stock" />
              </div>
              <div>
                <Label className="text-xs">SKT (AA/YYYY)</Label>
                <Input value={editSkt} onChange={e => setEditSkt(e.target.value)} placeholder="05/2027" className="mt-1" data-testid="input-edit-skt" />
              </div>
              <div>
                <Label className="text-xs">Barkod</Label>
                <Input value={editBarcode} onChange={e => setEditBarcode(e.target.value)} placeholder="8690000000000" className="mt-1 font-mono" data-testid="input-edit-barcode" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1" style={{ backgroundColor: "#6B3480" }} data-testid="btn-save-product">
                <Save className="w-4 h-4 mr-2" /> Kaydet
              </Button>
              <Button variant="outline" onClick={() => setFoundProduct(null)} data-testid="btn-cancel-edit">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {scanLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Sayım Geçmişi ({scanLog.length})</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-1">
              {scanLog.map((log, i) => (
                <div key={`${log.id}-${i}`} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-1.5 rounded bg-muted/30 gap-0.5">
                  <span className="truncate font-medium">{log.name}</span>
                  <div className="flex gap-2 text-muted-foreground shrink-0">
                    <span>Stok: <strong className="text-foreground">{log.stock}</strong></span>
                    {log.skt && <span>SKT: <strong className="text-foreground">{log.skt}</strong></span>}
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportsSection() {
  const { data: reports, isLoading } = useQuery<any>({ queryKey: ["/api/admin/reports"] });
  const [reportTab, setReportTab] = useState<string>("genel");

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!reports) return null;

  const reportTabs = [
    { key: "genel", label: "Genel" },
    { key: "ciro", label: "Ciro" },
    { key: "bestsellers", label: "En Çok Satanlar" },
    { key: "heatmap", label: "Isı Haritası" },
    { key: "blacklist", label: "Kara Liste" },
  ];

  return (
    <div className="space-y-4" data-testid="section-reports">
      <div className="flex flex-wrap gap-1.5">
        {reportTabs.map(t => (
          <button key={t.key} onClick={() => setReportTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${reportTab === t.key ? "text-white" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`} style={reportTab === t.key ? { backgroundColor: "#6B3480" } : {}} data-testid={`btn-report-${t.key}`}>{t.label}</button>
        ))}
      </div>

      {reportTab === "genel" && <>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Toplam Müşteri</p><p className="text-lg sm:text-xl font-bold text-blue-600">{reports.totalCustomers}</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Aktif Ürün</p><p className="text-lg sm:text-xl font-bold text-green-600">{reports.totalProducts}</p></CardContent></Card>
          <Card className="col-span-2 sm:col-span-1"><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Toplam Sipariş</p><p className="text-lg sm:text-xl font-bold text-purple-600">{reports.totalOrders}</p></CardContent></Card>
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Ödeme Yöntemleri</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {reports.paymentMethods?.map((pm: any) => (
                <div key={pm.method} className="flex items-center justify-between text-sm">
                  <span>{pm.method}</span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{pm.count} sipariş</span>
                    <span className="font-semibold text-foreground">{pm.total.toLocaleString("tr-TR")} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Sipariş Durumları</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(reports.statusCounts || {}).map(([status, count]) => (
                <div key={status} className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold">{count as number}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">En İyi 15 Müşteri</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {reports.topCustomers?.map((c: any, i: number) => (
                <div key={c.phone} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-muted-foreground font-mono text-xs">{i + 1}.</span>
                  <span className="flex-1 truncate">{c.name || c.phone}</span>
                  <span className="text-xs text-muted-foreground">{c.count} sipariş</span>
                  <span className="font-semibold text-xs">{c.total.toLocaleString("tr-TR")} ₺</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>}

      {reportTab === "ciro" && <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-green-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" /> Bugünkü Ciro</CardTitle></CardHeader>
            <CardContent className="p-3">
              <p className="text-2xl font-bold text-green-600">{reports.dailyCiro?.total?.toLocaleString("tr-TR")} ₺</p>
              <div className="mt-2 space-y-1">
                {reports.dailyCiro?.byMethod?.map((m: any) => (
                  <div key={m.method} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{m.method}</span>
                    <span className="font-semibold">{m.total.toLocaleString("tr-TR")} ₺</span>
                  </div>
                ))}
                {(!reports.dailyCiro?.byMethod || reports.dailyCiro.byMethod.length === 0) && <p className="text-xs text-muted-foreground">Bugün henüz sipariş yok</p>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Haftalık Ciro</CardTitle></CardHeader>
            <CardContent className="p-3">
              <p className="text-2xl font-bold text-blue-600">{reports.weeklyCiro?.total?.toLocaleString("tr-TR")} ₺</p>
              <div className="mt-2 space-y-1">
                {reports.weeklyCiro?.byMethod?.map((m: any) => (
                  <div key={m.method} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{m.method}</span>
                    <span className="font-semibold">{m.total.toLocaleString("tr-TR")} ₺</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {reports.monthlyData?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Aylık Ciro Trendi</CardTitle></CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {reports.monthlyData.map((m: any) => {
                  const maxRev = Math.max(...reports.monthlyData.map((d: any) => d.revenue), 1);
                  const pct = (m.revenue / maxRev) * 100;
                  return (
                    <div key={m.month}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{m.month}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-muted-foreground">{m.orders} sipariş</span>
                          <span className="font-semibold">{m.revenue.toLocaleString("tr-TR")} ₺</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </>}

      {reportTab === "bestsellers" && <>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> En Çok Kar Ettiren 20 Ürün</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-semibold text-muted-foreground border-b pb-1">
                <span className="col-span-1">#</span>
                <span className="col-span-4">Ürün</span>
                <span className="col-span-2 text-right">Adet</span>
                <span className="col-span-2 text-right">Ciro</span>
                <span className="col-span-2 text-right">Kar</span>
                <span className="col-span-1 text-right">%</span>
              </div>
              {reports.bestSellers?.map((p: any, i: number) => (
                <div key={p.productId} className="grid grid-cols-12 gap-1 text-xs items-center" data-testid={`bestseller-${i}`}>
                  <span className="col-span-1 text-muted-foreground font-mono">{i + 1}.</span>
                  <span className="col-span-4 truncate font-medium">{p.name}</span>
                  <span className="col-span-2 text-right">{p.quantity}</span>
                  <span className="col-span-2 text-right">{p.revenue.toLocaleString("tr-TR")} ₺</span>
                  <span className="col-span-2 text-right font-semibold text-green-600">{p.profit.toLocaleString("tr-TR")} ₺</span>
                  <span className={`col-span-1 text-right font-bold ${p.marginPercent >= 30 ? "text-green-600" : p.marginPercent >= 15 ? "text-yellow-600" : "text-red-600"}`}>{p.marginPercent}%</span>
                </div>
              ))}
              {(!reports.bestSellers || reports.bestSellers.length === 0) && <p className="text-xs text-muted-foreground text-center py-4">Henüz satış verisi yok</p>}
            </div>
          </CardContent>
        </Card>
      </>}

      {reportTab === "heatmap" && <>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" /> Sipariş Isı Haritası</CardTitle></CardHeader>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-3">Renk yoğunluğu sipariş sayısıyla orantılıdır. En çok sipariş alan mahalle en koyu renktedir.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reports.heatmapData?.map((n: any) => {
                const r = Math.round(107 + (1 - n.intensity / 100) * 148);
                const g = Math.round(52 + (1 - n.intensity / 100) * 203);
                const b = Math.round(128 + (1 - n.intensity / 100) * 127);
                const textColor = n.intensity > 50 ? "#fff" : "#333";
                return (
                  <div key={n.name} className="rounded-lg p-3 text-center transition-transform hover:scale-105" style={{ backgroundColor: `rgb(${r},${g},${b})`, color: textColor }} data-testid={`heatmap-${n.name}`}>
                    <p className="text-xs font-bold truncate">{n.name.replace(" Mah.", "").replace(" Mahallesi", "")}</p>
                    <p className="text-lg font-bold">{n.count}</p>
                    <p className="text-[10px] opacity-80">sipariş</p>
                    <p className="text-[10px] font-semibold">{n.total.toLocaleString("tr-TR")} ₺</p>
                  </div>
                );
              })}
              {(!reports.heatmapData || reports.heatmapData.length === 0) && <p className="text-xs text-muted-foreground col-span-full text-center py-4">Henüz mahalle verisi yok</p>}
            </div>
          </CardContent>
        </Card>
        {reports.neighborhoodStats?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Mahalle Detay Listesi</CardTitle></CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {reports.neighborhoodStats.map((n: any, i: number) => {
                  const maxTotal = reports.neighborhoodStats[0]?.total || 1;
                  const pct = (n.total / maxTotal) * 100;
                  return (
                    <div key={n.name} data-testid={`neighborhood-stat-${i}`}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="truncate flex-1 font-medium">{n.name}</span>
                        <div className="flex gap-3 text-xs ml-2">
                          <span className="text-muted-foreground">{n.count} sipariş</span>
                          <span className="font-semibold">{n.total.toLocaleString("tr-TR")} ₺</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </>}

      {reportTab === "blacklist" && <BlacklistSection reports={reports} />}
    </div>
  );
}

function BlacklistSection({ reports }: { reports: any }) {
  const { data: customers = [], refetch } = useQuery<any[]>({ queryKey: ["/api/admin/customers"] });
  const { data: blacklisted = [], refetch: refetchBl } = useQuery<any[]>({ queryKey: ["/api/admin/blacklisted-customers"] });
  const [reason, setReason] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { toast } = useToast();

  const blacklistMutation = useMutation({
    mutationFn: async ({ customerId, reason }: { customerId: number; reason: string }) => {
      await apiRequest("POST", `/api/admin/blacklist/${customerId}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blacklisted-customers"] });
      setSelectedCustomerId(null);
      setReason("");
      toast({ title: "Kara listeye eklendi" });
    },
  });

  const unblacklistMutation = useMutation({
    mutationFn: async (customerId: number) => {
      await apiRequest("POST", `/api/admin/unblacklist/${customerId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blacklisted-customers"] });
      toast({ title: "Kara listeden çıkarıldı" });
    },
  });

  return (
    <div className="space-y-4">
      {reports.problemCustomers?.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Sorunlu Müşteriler (2+ İptal)</CardTitle></CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {reports.problemCustomers.map((c: any) => (
                <div key={c.phone} className="flex items-center justify-between text-sm p-2 rounded-md bg-orange-50">
                  <div>
                    <span className="font-medium">{c.name || c.phone}</span>
                    <span className="text-xs text-muted-foreground ml-2">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">{c.cancelCount} iptal</Badge>
                    <span className="text-xs">{c.count} sipariş</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Kara Liste</CardTitle></CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCustomerId?.toString() || ""} onValueChange={v => setSelectedCustomerId(parseInt(v))}>
              <SelectTrigger className="flex-1 text-xs"><SelectValue placeholder="Müşteri seçin..." /></SelectTrigger>
              <SelectContent>
                {customers.filter((c: any) => !c.is_blacklisted && !c.isBlacklisted).map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.phone})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Sebep..." value={reason} onChange={e => setReason(e.target.value)} className="flex-1 text-xs" data-testid="input-blacklist-reason" />
            <Button size="sm" variant="destructive" disabled={!selectedCustomerId || blacklistMutation.isPending} onClick={() => selectedCustomerId && blacklistMutation.mutate({ customerId: selectedCustomerId, reason })} data-testid="btn-add-blacklist">
              Engelle
            </Button>
          </div>

          {blacklisted.length > 0 ? (
            <div className="space-y-2">
              {blacklisted.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-red-50 border border-red-100">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone} — {c.blacklist_reason || c.blacklistReason}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => unblacklistMutation.mutate(c.id)} disabled={unblacklistMutation.isPending} data-testid={`btn-unblacklist-${c.id}`}>
                    Kaldır
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-3">Kara listede kimse yok</p>
          )}
        </CardContent>
      </Card>
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
