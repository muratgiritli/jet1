import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";

export default function FloatingCartBar() {
  const { itemCount, grandTotal } = useCart();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/80 backdrop-blur-lg border-t p-3"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground" data-testid="text-float-count">{itemCount} ürün</span>
                <span className="text-lg font-extrabold text-primary" data-testid="text-float-total">
                  {grandTotal.toFixed(0)} TL
                </span>
              </div>
            </div>
            <Link href="/siparis">
              <Button variant="default" data-testid="btn-float-go-cart">
                <ShoppingCart className="w-4 h-4" />
                Sepete Git
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
