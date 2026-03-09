import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import BottomTabBar from "@/components/BottomTabBar";
import FloatingCartBar from "@/components/FloatingCartBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallBanner from "@/components/InstallBanner";
import Landing from "@/pages/landing";

const Checkout = lazy(() => import("@/pages/checkout"));
const CategoryPage = lazy(() => import("@/pages/category"));
const CategoriesOverview = lazy(() => import("@/pages/categories-overview"));
const BrandsPage = lazy(() => import("@/pages/brands"));
const BrandProductsPage = lazy(() => import("@/pages/brand-products"));
const AdminPage = lazy(() => import("@/pages/admin"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail"));
const AcikMamaPage = lazy(() => import("@/pages/acik-mama"));
const OrderTrackingPage = lazy(() => import("@/pages/order-tracking"));
const FavoritesPage = lazy(() => import("@/pages/favorites"));
const AuthPage = lazy(() => import("@/pages/auth"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));
const StaticPages = lazy(() => import("@/pages/static-pages"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-[#6B3480] rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
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
        <Route path="/sss">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="sss" /></Suspense>}</Route>
        <Route path="/kvkk">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="kvkk" /></Suspense>}</Route>
        <Route path="/gizlilik">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="gizlilik" /></Suspense>}</Route>
        <Route path="/kullanim-kosullari">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="kullanim" /></Suspense>}</Route>
        <Route path="/cerez-politikasi">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="cerez" /></Suspense>}</Route>
        <Route path="/islem-rehberi">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="islem" /></Suspense>}</Route>
        <Route path="/hakkimizda">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="hakkimizda" /></Suspense>}</Route>
        <Route path="/iletisim">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="iletisim" /></Suspense>}</Route>
        <Route path="/teslimat-iade">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="teslimat-iade" /></Suspense>}</Route>
        <Route path="/gizlilik-sozlesmesi">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="gizlilik-sozlesmesi" /></Suspense>}</Route>
        <Route path="/mesafeli-satis">{() => <Suspense fallback={<PageLoader />}><StaticPageWrapper page="mesafeli-satis" /></Suspense>}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function StaticPageWrapper({ page }: { page: string }) {
  const LazyStatic = lazy(() =>
    import("@/pages/static-pages").then((mod) => {
      const map: Record<string, any> = {
        sss: mod.SSSPage,
        kvkk: mod.KVKKPage,
        gizlilik: mod.GizlilikPage,
        kullanim: mod.KullanimKosullariPage,
        cerez: mod.CerezPage,
        islem: mod.IslemRehberiPage,
        hakkimizda: mod.HakkimizdaPage,
        iletisim: mod.IletisimPage,
        "teslimat-iade": mod.TeslimatIadePage,
        "gizlilik-sozlesmesi": mod.GizlilikSozlesmesiPage,
        "mesafeli-satis": mod.MesafeliSatisSozlesmesiPage,
      };
      return { default: map[page] };
    })
  );
  return <LazyStatic />;
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      {!isAdmin && <InstallBanner />}
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
