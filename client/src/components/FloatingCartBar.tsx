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
          className="fixed left-0 right-0 z-[9998] bg-background/80 backdrop-blur-lg border-t p-2.5"
          style={{ bottom: "calc(60px + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground" data-testid="text-float-count">{itemCount} ürün</span>
                <span className="text-base font-extrabold text-primary" data-testid="text-float-total">
                  {Math.round(grandTotal)} TL
                </span>
              </div>
            </div>
            <Link href="/odeme">
              <Button variant="default" size="sm" data-testid="btn-float-go-cart">
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Sepete Git
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
