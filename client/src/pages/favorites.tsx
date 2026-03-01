import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Logo from "@/components/Logo";
import { productUrl } from "@/lib/data";

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  img?: string | null;
}

export function getFavorites(): FavoriteProduct[] {
  try {
    return JSON.parse(localStorage.getItem("jet55_favorites") || "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(product: FavoriteProduct): boolean {
  const favorites = getFavorites();
  const index = favorites.findIndex((f) => f.id === product.id);
  if (index >= 0) {
    favorites.splice(index, 1);
    localStorage.setItem("jet55_favorites", JSON.stringify(favorites));
    window.dispatchEvent(new Event("favorites-changed"));
    return false;
  } else {
    favorites.push(product);
    localStorage.setItem("jet55_favorites", JSON.stringify(favorites));
    window.dispatchEvent(new Event("favorites-changed"));
    return true;
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export default function FavoritesPage() {
  const [localFavorites, setLocalFavorites] = useState<FavoriteProduct[]>(getFavorites());
  const { basket, updateQty } = useCart();
  const { isLoggedIn } = useCustomer();

  const { data: serverFavIds } = useQuery<number[]>({
    queryKey: ["/api/customer/favorites"],
    enabled: isLoggedIn,
  });

  const { data: allProducts } = useQuery<any[]>({
    queryKey: ["/api/products"],
    enabled: isLoggedIn,
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/customer/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/favorites"] });
    },
  });

  useEffect(() => {
    const handler = () => setLocalFavorites(getFavorites());
    window.addEventListener("favorites-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("favorites-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const removeLocalFavorite = (id: string) => {
    const product = localFavorites.find((f) => f.id === id);
    if (product) toggleFavorite(product);
  };

  const serverFavorites: FavoriteProduct[] = isLoggedIn && serverFavIds && allProducts
    ? allProducts.filter(p => serverFavIds.includes(p.id)).map(p => ({
        id: String(p.id),
        name: p.name,
        price: p.price,
        img: p.img,
      }))
    : [];

  const favorites = isLoggedIn ? serverFavorites : localFavorites;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-[9999]" style={{ backgroundColor: "#6B3480" }}>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-center">
          <Logo className="text-3xl" linkTo="/" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-3 py-4">
        <h1 className="text-lg font-bold flex items-center gap-2 mb-4" data-testid="text-favorites-title">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          Favorilerim
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Henüz favori ürün eklemediniz</p>
            <Link href="/">
              <Button variant="outline" className="mt-4" data-testid="btn-browse-products">
                Ürünlere Göz At
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {favorites.map((product) => {
                const qty = basket[product.id] || 0;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card data-testid={`card-fav-${product.id}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <Link href={productUrl(Number(product.id), product.name)}>
                          {product.img ? (
                            <img
                              src={product.img}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              data-testid={`img-fav-${product.id}`}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={productUrl(Number(product.id), product.name)}>
                            <p className="text-sm font-semibold truncate cursor-pointer" data-testid={`text-fav-name-${product.id}`}>
                              {product.name}
                            </p>
                          </Link>
                          <p className="text-sm font-bold text-primary mt-0.5" data-testid={`text-fav-price-${product.id}`}>
                            {product.price} TL
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {qty > 0 ? (
                              <div className="flex items-center gap-0">
                                <Button variant="outline" size="sm" onClick={() => updateQty(product.id, -1)} className="h-7 w-7 p-0">
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-7 text-center text-xs font-bold">{qty}</span>
                                <Button variant="outline" size="sm" onClick={() => updateQty(product.id, 1)} className="h-7 w-7 p-0">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => updateQty(product.id, 1)}
                                data-testid={`btn-add-fav-${product.id}`}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Sepete Ekle
                              </Button>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => {
                            if (isLoggedIn) {
                              removeMutation.mutate(Number(product.id));
                            } else {
                              removeLocalFavorite(product.id);
                            }
                          }}
                          data-testid={`btn-remove-fav-${product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
