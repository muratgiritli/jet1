import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";

export default function FloatingCartBar() {
  const { itemCount, subtotal, hasCampaignItems, campaignExtraCount } = useCart();
  const [location] = useLocation();
  const [showWarning, setShowWarning] = useState(false);

  const isCampaignPage = location === "/kampanya" || window.location.search.includes("kampanya=1");
  const needsExtra = isCampaignPage && hasCampaignItems && campaignExtraCount < 1;

  const handleCampaignBlock = (e: React.MouseEvent) => {
    if (needsExtra) {
      e.preventDefault();
      e.stopPropagation();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
      const el = document.getElementById("campaign-extras-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AnimatePresence>
      {itemCount > 0 && location !== "/odeme" && (
        <>
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed left-2 right-2 z-[9999] md:hidden"
                style={{ bottom: "calc(130px + env(safe-area-inset-bottom, 0px))" }}
              >
                <div
                  className="rounded-xl px-4 py-3 text-center text-sm font-bold shadow-lg"
                  style={{ backgroundColor: "#ffebee", border: "2px solid #ef5350", color: "#c62828" }}
                  data-testid="text-float-campaign-warning"
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                  Kampanyadan yararlanmak için en az yukarıdaki seçeneklerden bir ürün eklemeniz gerekmektedir!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed left-2 right-2 z-[9999] hidden md:block bottom-16"
              >
                <div
                  className="max-w-lg mx-auto rounded-xl px-4 py-3 text-center text-sm font-bold shadow-lg"
                  style={{ backgroundColor: "#ffebee", border: "2px solid #ef5350", color: "#c62828" }}
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                  Kampanyadan yararlanmak için en az yukarıdaki seçeneklerden bir ürün eklemeniz gerekmektedir!
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
                    {Math.round(subtotal * 0.95)} TL
                  </span>
                </div>
              </div>
              {needsExtra ? (
                <Button variant="default" size="sm" onClick={handleCampaignBlock} data-testid="btn-float-go-cart">
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Sepete Git
                </Button>
              ) : (
                <Link href="/odeme">
                  <Button variant="default" size="sm" data-testid="btn-float-go-cart">
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                    Sepete Git
                  </Button>
                </Link>
              )}
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
                    {Math.round(subtotal * 0.95)} TL
                  </span>
                </div>
              </div>
              {needsExtra ? (
                <Button variant="default" size="sm" onClick={handleCampaignBlock} data-testid="btn-float-go-cart-desktop">
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Sepete Git
                </Button>
              ) : (
                <Link href="/odeme">
                  <Button variant="default" size="sm" data-testid="btn-float-go-cart-desktop">
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                    Sepete Git
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
