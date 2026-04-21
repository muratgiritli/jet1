import { lazy, Suspense, Component, type ReactNode, useEffect } from "react";
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
const Landing = lazy(() => import("@/pages/landing"));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorMsg: string }> {
  state = { hasError: false, errorMsg: "" };
  static getDerivedStateFromError(error: Error) { return { hasError: true, errorMsg: error?.message || "" }; }
  componentDidCatch(error: Error) { console.error("ErrorBoundary caught:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bir hata oluştu</h2>
          <p className="text-gray-500 mb-4 text-sm">Sayfa yüklenirken bir sorun oluştu.</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }} className="px-4 py-2 bg-[#6B3480] text-white rounded-lg font-medium text-sm" data-testid="btn-error-home">Ana Sayfaya Dön</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const importCheckout = () => import("@/pages/checkout");
const importCategory = () => import("@/pages/category");
const importCategoriesOverview = () => import("@/pages/categories-overview");
const importBrands = () => import("@/pages/brands");
const importBrandProducts = () => import("@/pages/brand-products");

const Checkout = lazy(importCheckout);
const CategoryPage = lazy(importCategory);
const CategoriesOverview = lazy(importCategoriesOverview);
const BrandsPage = lazy(importBrands);
const BrandProductsPage = lazy(importBrandProducts);
const AdminPage = lazy(() => import("@/pages/admin"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail"));
const AcikMamaPage = lazy(() => import("@/pages/acik-mama"));
const OrderTrackingPage = lazy(() => import("@/pages/order-tracking"));
const FavoritesPage = lazy(() => import("@/pages/favorites"));
const AuthPage = lazy(() => import("@/pages/auth"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CampaignPage = lazy(() => import("@/pages/campaign"));
const CampaignDemoPage = lazy(() => import("@/pages/campaign-demo"));
const CampaignProductDemoPage = lazy(() => import("@/pages/campaign-product-demo"));
const PetContestPage = lazy(() => import("@/pages/pet-contest"));
const PetDashboardPage = lazy(() => import("@/pages/pet-dashboard"));
const LostFoundPage = lazy(() => import("@/pages/lost-found"));
const PatiBlogPage = lazy(() => import("@/pages/pati-blog"));

const SSSPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.SSSPage })));
const KVKKPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.KVKKPage })));
const GizlilikPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.GizlilikPage })));
const KullanimKosullariPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.KullanimKosullariPage })));
const CerezPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.CerezPage })));
const IslemRehberiPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.IslemRehberiPage })));
const HakkimizdaPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.HakkimizdaPage })));
const IletisimPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.IletisimPage })));
const TeslimatIadePage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.TeslimatIadePage })));
const GizlilikSozlesmesiPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.GizlilikSozlesmesiPage })));
const MesafeliSatisSozlesmesiPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.MesafeliSatisSozlesmesiPage })));
const DemoLanding = lazy(() => import("@/pages/demo-landing"));
const SeoPage = lazy(() => import("@/pages/seo-pages"));
const BlogListRoute = lazy(() => import("@/pages/blog").then(m => ({ default: m.BlogListRoute })));
const BlogPostRoute = lazy(() => import("@/pages/blog").then(m => ({ default: m.BlogPostRoute })));

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
        <Route path="/kategori/:animal/:subcategory/:brand" component={BrandProductsPage} />
        <Route path="/kategori/:animal/:subcategory" component={BrandsPage} />
        <Route path="/kategori/:animal" component={CategoryPage} />
        <Route path="/odeme" component={Checkout} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/siparis-takip" component={OrderTrackingPage} />
        <Route path="/favoriler" component={FavoritesPage} />
        <Route path="/giris" component={AuthPage} />
        <Route path="/hesabim" component={ProfilePage} />
        <Route path="/demo" component={DemoLanding} />
        <Route path="/kampanya" component={CampaignPage} />
        <Route path="/kampanya-demo" component={CampaignDemoPage} />
        <Route path="/kampanya-urun-demo" component={CampaignProductDemoPage} />
        <Route path="/yarisma" component={PetContestPage} />
        <Route path="/ozel-patiler" component={PetDashboardPage} />
        <Route path="/kayip-ilan" component={LostFoundPage} />
        <Route path="/pati-blog" component={PatiBlogPage} />
        <Route path="/blog/:slug" component={BlogPostRoute} />
        <Route path="/blog" component={BlogListRoute} />
        <Route path="/sss" component={SSSPage} />
        <Route path="/kvkk" component={KVKKPage} />
        <Route path="/gizlilik" component={GizlilikPage} />
        <Route path="/kullanim-kosullari" component={KullanimKosullariPage} />
        <Route path="/cerez-politikasi" component={CerezPage} />
        <Route path="/islem-rehberi" component={IslemRehberiPage} />
        <Route path="/hakkimizda" component={HakkimizdaPage} />
        <Route path="/iletisim" component={IletisimPage} />
        <Route path="/teslimat-iade" component={TeslimatIadePage} />
        <Route path="/gizlilik-sozlesmesi" component={GizlilikSozlesmesiPage} />
        <Route path="/mesafeli-satis" component={MesafeliSatisSozlesmesiPage} />
        <Route path="/:slug" component={SeoPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const isDemo = location === "/demo";

  useEffect(() => {
    if (location === "/") {
      const t = setTimeout(() => {
        importCategory();
        importBrands();
        importBrandProducts();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <>
      {!isAdmin && !isDemo && <InstallBanner />}
      {!isAdmin && !isDemo && <Header />}
      <ErrorBoundary><Router /></ErrorBoundary>
      {!isAdmin && !isDemo && location === "/" && <Footer />}
      {!isAdmin && !isDemo && <FloatingCartBar />}
      {!isAdmin && !isDemo && <BottomTabBar />}
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
