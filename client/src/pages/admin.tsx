import { useState } from "react";
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
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, BrandCategory, CrossSellSection, CrossSellItem } from "@shared/schema";

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
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() || "");
  const [skt, setSkt] = useState(product?.skt || "");
  const [img, setImg] = useState(product?.img || "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "10");
  const [brandCategoryId, setBrandCategoryId] = useState(
    product?.brandCategoryId?.toString() || ""
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
      <div className="space-y-2">
        <Label>Marka Kategorisi</Label>
        <Select value={brandCategoryId} onValueChange={setBrandCategoryId}>
          <SelectTrigger data-testid="select-brand-category">
            <SelectValue placeholder="Kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} data-testid={`option-category-${c.id}`}>
                {c.brandName} ({c.animal} / {c.subcategory})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <Button type="submit" className="w-full" disabled={isPending} data-testid="btn-save-product">
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ brandName, brandSlug, animal, subcategory });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Marka Adı</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} required data-testid="input-category-brand-name" />
        </div>
        <div className="space-y-2">
          <Label>Marka Slug</Label>
          <Input value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} required placeholder="brit-care" data-testid="input-category-brand-slug" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Hayvan</Label>
          <Input value={animal} onChange={(e) => setAnimal(e.target.value)} required placeholder="kedi" data-testid="input-category-animal" />
        </div>
        <div className="space-y-2">
          <Label>Alt Kategori</Label>
          <Input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required placeholder="kedi-mamasi" data-testid="input-category-subcategory" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending} data-testid="btn-save-category">
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

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

  const filteredProducts =
    selectedCategoryFilter === "all"
      ? allProducts
      : allProducts.filter((p) => String(p.brandCategoryId) === selectedCategoryFilter);

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
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionSortOrder, setNewSectionSortOrder] = useState("0");
  const [selectedProductId, setSelectedProductId] = useState("");

  const { data: crossSellSections = [] } = useQuery<(CrossSellSection & { items: CrossSellItem[] })[]>({
    queryKey: ["/api/cross-sell-sections"],
  });

  const createSectionMutation = useMutation({
    mutationFn: async (data: { title: string; sortOrder: number; isActive: boolean }) => {
      await apiRequest("POST", "/api/admin/cross-sell-sections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cross-sell-sections"] });
      setCrossSellDialogOpen(false);
      setNewSectionTitle("");
      setNewSectionSortOrder("0");
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
            <h2 className="text-lg font-bold" data-testid="text-section-categories">Marka Kategorileri</h2>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-category">
                  <Plus className="w-4 h-4" />
                  Yeni Kategori
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Marka Kategorisi</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  onSave={(data) => createCategoryMutation.mutate(data)}
                  isPending={createCategoryMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="grid-categories">
            {categories.map((cat) => {
              const productCount = allProducts.filter(
                (p) => p.brandCategoryId === cat.id
              ).length;
              return (
                <Card key={cat.id} data-testid={`card-category-${cat.id}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate" data-testid={`text-category-name-${cat.id}`}>{cat.brandName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat.animal} / {cat.subcategory}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs no-default-hover-elevate no-default-active-elevate">
                        {productCount} ürün
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm(`"${cat.brandName}" kategorisi ve tüm ürünleri silinecek. Emin misiniz?`)) {
                          deleteCategoryMutation.mutate(cat.id);
                        }
                      }}
                      data-testid={`btn-delete-category-${cat.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
              <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                          <Badge variant="secondary" className="text-[10px] no-default-hover-elevate no-default-active-elevate">
                            {getCategoryName(product.brandCategoryId)}
                          </Badge>
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
            <h2 className="text-lg font-bold" data-testid="text-section-cross-sell">Ürün Sayfası Öneri Bölümleri</h2>
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
                    });
                  }}
                  className="space-y-4"
                >
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" data-testid={`text-cross-sell-section-title-${section.id}`}>{section.title}</span>
                        <Badge variant="secondary" className="text-xs no-default-hover-elevate no-default-active-elevate" data-testid={`badge-cross-sell-item-count-${section.id}`}>
                          {section.items.length} ürün
                        </Badge>
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
