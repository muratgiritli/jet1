import { Home, Grid3X3, ShoppingCart, Mail, User } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { motion, AnimatePresence } from "framer-motion";
import ContactDialog from "@/components/ContactDialog";

export default function BottomTabBar() {
  const [location, setLocation] = useLocation();
  const { itemCount } = useCart();
  const { isLoggedIn } = useCustomer();
  const [contactOpen, setContactOpen] = useState(false);

  if (location.startsWith("/admin")) return null;

  const TABS = [
    { name: "Ana Sayfa", href: "/", icon: Home, testId: "tab-home" },
    { name: "Kategoriler", href: "/kategori", icon: Grid3X3, testId: "tab-categories" },
    { name: "Sepet", href: "/odeme", icon: ShoppingCart, testId: "tab-cart" },
    { name: "İletişim", href: "__contact", icon: Mail, testId: "tab-contact" },
    { name: isLoggedIn ? "Hesabım" : "Giriş", href: isLoggedIn ? "/hesabim" : "/giris", icon: User, testId: "tab-account" },
  ];

  const isActive = (href: string) => {
    if (href === "__contact") return false;
    if (href === "/") return location === "/";
    if (href === "/kategori") return location.startsWith("/kategori");
    if (href === "/hesabim" || href === "/giris") return location === "/hesabim" || location === "/giris";
    const basePath = href.split("?")[0];
    return location.startsWith(basePath);
  };

  return (
    <>
    <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-lg border-t safe-area-bottom md:hidden"
      data-testid="bottom-tab-bar"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <button
              key={tab.testId}
              onClick={() => tab.href === "__contact" ? setContactOpen(true) : setLocation(tab.href)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[56px] relative transition-colors ${
                active ? "text-[#6B3480]" : "text-muted-foreground"
              }`}
              data-testid={tab.testId}
            >
              <div className="relative">
                <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <AnimatePresence>
                  {tab.href === "/odeme" && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                      data-testid="badge-cart-count"
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight ${active ? "font-semibold" : "font-medium"}`}>
                {tab.name}
              </span>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#6B3480]"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
}
