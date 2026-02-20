import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import CategoryPage from "@/pages/category";
import BrandsPage from "@/pages/brands";
import BrandProductsPage from "@/pages/brand-products";
import AdminPage from "@/pages/admin";
import ProductDetailPage from "@/pages/product-detail";
import AcikMamaPage from "@/pages/acik-mama";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/acik-mama/:animal" component={AcikMamaPage} />
      <Route path="/urun/:id" component={ProductDetailPage} />
      <Route path="/siparis/:animal/:subcategory/:brand" component={BrandProductsPage} />
      <Route path="/kategori/:animal/:subcategory" component={BrandsPage} />
      <Route path="/kategori/:animal" component={CategoryPage} />
      <Route path="/siparis" component={Home} />
      <Route path="/odeme" component={Checkout} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
