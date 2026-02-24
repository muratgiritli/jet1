import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toggleFavorite, isFavorite } from "@/pages/favorites";
import { useCustomer } from "@/contexts/CustomerContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    img?: string | null;
  };
  size?: "sm" | "md";
  className?: string;
}

export default function FavoriteButton({ product, size = "sm", className = "" }: FavoriteButtonProps) {
  const [localFav, setLocalFav] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn } = useCustomer();

  const { data: serverFavIds = [] } = useQuery<number[]>({
    queryKey: ["/api/customer/favorites"],
    enabled: isLoggedIn,
    staleTime: 30000,
  });

  const isServerFav = isLoggedIn && serverFavIds.includes(Number(product.id));

  useEffect(() => {
    if (!isLoggedIn) {
      setLocalFav(isFavorite(product.id));
    }
    const handler = () => {
      if (!isLoggedIn) setLocalFav(isFavorite(product.id));
    };
    window.addEventListener("favorites-changed", handler);
    return () => window.removeEventListener("favorites-changed", handler);
  }, [product.id, isLoggedIn]);

  const fav = isLoggedIn ? isServerFav : localFav;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggedIn) {
      const newState = !fav;
      try {
        if (newState) {
          await apiRequest("POST", "/api/customer/favorites", { productId: Number(product.id) });
        } else {
          await apiRequest("DELETE", `/api/customer/favorites/${product.id}`);
        }
        queryClient.invalidateQueries({ queryKey: ["/api/customer/favorites"] });
      } catch {}
      toast({
        description: newState ? "Favorilere eklendi" : "Favorilerden cikarildi",
        duration: 1500,
      });
    } else {
      const added = toggleFavorite(product);
      setLocalFav(added);
      toast({
        description: added ? "Favorilere eklendi" : "Favorilerden cikarildi",
        duration: 1500,
      });
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const btnSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleToggle}
      className={`${btnSize} rounded-full flex items-center justify-center transition-colors ${
        fav ? "bg-red-50 text-red-500" : "bg-white/80 text-gray-400 hover:text-red-400"
      } ${className}`}
      data-testid={`btn-fav-${product.id}`}
    >
      <Heart className={`${iconSize} ${fav ? "fill-red-500" : ""}`} />
    </motion.button>
  );
}
