import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { CONFIG } from "@/lib/data";

export default function FloatingCartBar() {
  const { itemCount, subtotal } = useCart();
  const [location, setLocation] = useLocation();
  const [showMinWarning, setShowMinWarning] = useState(false);

  const remaining = Math.max(0, CONFIG.minLimit - subtotal);
  const minReached = remaining <= 0;

  useEffect(() => {
    if (!showMinWarning) return;
    const t = setTimeout(() => setShowMinWarning(false), 4000);
    return () => clearTimeout(t);
  }, [showMinWarning]);

  useEffect(() => {
    if (minReached) setShowMinWarning(false);
  }, [minReached]);

  const handleGoToCart = () => {
    if (!minReached) {
      setShowMinWarning(true);
      return;
    }
    setLocation("/odeme");
  };

  const minWarningText = `Minimum sipariş tutarı ${CONFIG.minLimit} TL'dir. Sepete ${remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL daha ürün eklemeniz gerekir.`;

  return (
    <AnimatePresence>
      {itemCount > 0 && location !== "/odeme" && (
        <>
          <AnimatePresence>
            {showMinWarning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed left-2 right-2 z-[9999] md:hidden"
                style={{ bottom: "calc(130px + env(safe-area-inset-bottom, 0px))" }}
              >
                <div
                  className="rounded-xl px-4 py-3 text-center text-sm font-bold shadow-lg"
                  style={{ backgroundColor: "#fff7ed", border: "2px solid #f59e0b", color: "#92400e" }}
                  data-testid="text-float-min-warning"
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                  {minWarningText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showMinWarning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed left-2 right-2 z-[9999] hidden md:block bottom-16"
              >
                <div
                  className="max-w-lg mx-auto rounded-xl px-4 py-3 text-center text-sm font-bold shadow-lg"
                  style={{ backgroundColor: "#fff7ed", border: "2px solid #f59e0b", color: "#92400e" }}
                  data-testid="text-float-min-warning-desktop"
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                  {minWarningText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed left-0 right-0 z-[9998] bg-background/80 backdrop-blur-lg border-t p-2.5 md:hidden"
            style={{ bottom: "calc(60px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground" data-testid="text-float-count">{itemCount} ürün</span>
                  <span className="text-base font-extrabold text-primary" data-testid="text-float-total">
                    {Math.round(subtotal)} TL
                  </span>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToCart}
                data-testid="btn-float-go-cart"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Sepete Git
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed left-0 right-0 z-[9998] bg-background/80 backdrop-blur-lg border-t p-2.5 hidden md:block bottom-0"
          >
            <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">{itemCount} ürün</span>
                  <span className="text-base font-extrabold text-primary">
                    {Math.round(subtotal)} TL
                  </span>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToCart}
                data-testid="btn-float-go-cart-desktop"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                Sepete Git
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
