import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toggleFavorite, isFavorite } from "@/pages/favorites";
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
  const [fav, setFav] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFav(isFavorite(product.id));
    const handler = () => setFav(isFavorite(product.id));
    window.addEventListener("favorites-changed", handler);
    return () => window.removeEventListener("favorites-changed", handler);
  }, [product.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavorite(product);
    setFav(added);
    toast({
      description: added ? "Favorilere eklendi" : "Favorilerden çıkarıldı",
      duration: 1500,
    });
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
