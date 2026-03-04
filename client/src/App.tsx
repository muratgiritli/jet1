import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { motion, AnimatePresence } from "framer-motion";
import BottomTabBar from "@/components/BottomTabBar";
import FloatingCartBar from "@/components/FloatingCartBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Landing from "@/pages/landing";
import Checkout from "@/pages/checkout";
import CategoryPage from "@/pages/category";
import CategoriesOverview from "@/pages/categories-overview";
import BrandsPage from "@/pages/brands";
import BrandProductsPage from "@/pages/brand-products";
import AdminPage from "@/pages/admin";
import ProductDetailPage from "@/pages/product-detail";
import AcikMamaPage from "@/pages/acik-mama";
import OrderTrackingPage from "@/pages/order-tracking";
import FavoritesPage from "@/pages/favorites";
import AuthPage from "@/pages/auth";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Switch location={location}>
          <Route path="/" component={Landing} />
          <Route path="/kategori" component={CategoriesOverview} />
          <Route path="/acik-mama/:animal" component={AcikMamaPage} />
          <Route path="/urun/:id/:slug?" component={ProductDetailPage} />
          <Route path="/siparis/:animal/:subcategory/:brand" component={BrandProductsPage} />
          <Route path="/kategori/:animal/:subcategory" component={BrandsPage} />
          <Route path="/kategori/:animal" component={CategoryPage} />
          <Route path="/odeme" component={Checkout} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/siparis-takip" component={OrderTrackingPage} />
          <Route path="/favoriler" component={FavoritesPage} />
          <Route path="/giris" component={AuthPage} />
          <Route path="/hesabim" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <Router />
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingCartBar />}
      {!isAdmin && <BottomTabBar />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CustomerProvider>
          <CartProvider>
            <Toaster />
            <AppShell />
          </CartProvider>
        </CustomerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
