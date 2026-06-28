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
import SocialProofToast from "@/components/SocialProofToast";
import { CURRENT_STORE } from "@/lib/store";
const Landing = lazy(() => import("@/pages/landing"));
const AdLanding = lazy(() => import("@/pages/ad-landing"));

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
const ProductDetailDemoPage = lazy(() => import("@/pages/product-detail-demo"));
const AcikMamaPage = lazy(() => import("@/pages/acik-mama"));
const VeterinerSubPage = lazy(() => import("@/pages/veteriner-sub"));
const OrderTrackingPage = lazy(() => import("@/pages/order-tracking"));
const FavoritesPage = lazy(() => import("@/pages/favorites"));
const AuthPage = lazy(() => import("@/pages/auth"));
const SokakCanlariPage = lazy(() => import("@/pages/sokak-canlari"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const AbonePage = lazy(() => import("@/pages/abone"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CampaignPage = lazy(() => import("@/pages/campaign"));
const CampaignDemoPage = lazy(() => import("@/pages/campaign-demo"));
const CampaignProductDemoPage = lazy(() => import("@/pages/campaign-product-demo"));
const PetContestPage = lazy(() => import("@/pages/pet-contest"));
const PetDashboardPage = lazy(() => import("@/pages/pet-dashboard"));
const LostFoundPage = lazy(() => import("@/pages/lost-found"));
const PatiBlogPage = lazy(() => import("@/pages/pati-blog"));
const PaymentResultPage = lazy(() => import("@/pages/payment-result"));

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
const MagazaPage = lazy(() => import("@/pages/static-pages").then(m => ({ default: m.MagazaPage })));
const DemoLanding = lazy(() => import("@/pages/demo-landing"));
const Demo1Page = lazy(() => import("@/pages/demo1"));
const Demo2Page = lazy(() => import("@/pages/demo2"));
const DemoAnasayfaPage = lazy(() => import("@/pages/demo-anasayfa"));
const DemoKampanyaPage = lazy(() => import("@/pages/demo-kampanya"));
const DemoKampanyaUrunPage = lazy(() => import("@/pages/demo-kampanya").then(m => ({ default: m.DemoKampanyaUrun })));
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

function useVisitTracking() {
  const [location] = useLocation();
  useEffect(() => {
    try {
      if (/^\/admin/i.test(location)) return;
      let entryReferrer = sessionStorage.getItem("jg_entry_ref");
      let utmSource = sessionStorage.getItem("jg_utm_src");
      if (entryReferrer === null) {
        const params = new URLSearchParams(window.location.search);
        utmSource = params.get("utm_source") || "";
        entryReferrer = document.referrer || "";
        sessionStorage.setItem("jg_entry_ref", entryReferrer);
        sessionStorage.setItem("jg_utm_src", utmSource);
      }
      fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: location, referrer: entryReferrer, utmSource }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, [location]);
}

function Router() {
  useVisitTracking();
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/">{() => <Landing />}</Route>
        <Route path="/petshop">{() => <Landing />}</Route>
        <Route path="/en-yakin-petshop" component={AdLanding} />
        <Route path="/en-yakin-petshoplar" component={AdLanding} />
        <Route path="/kapida-odeme-petshop" component={AdLanding} />
        <Route path="/petshop-kapida-odeme" component={AdLanding} />
        <Route path="/getir-petshop" component={AdLanding} />
        <Route path="/kategori" component={CategoriesOverview} />
        <Route path="/acik-mama/:animal" component={AcikMamaPage} />
        <Route path="/veteriner/:subcategory" component={VeterinerSubPage} />
        <Route path="/urun/:id/:slug?" component={ProductDetailPage} />
        <Route path="/urun-demo/:id/:slug?" component={ProductDetailDemoPage} />
        <Route path="/siparis/:animal/:subcategory/:brand" component={BrandProductsPage} />
        <Route path="/kategori/:animal/:subcategory/:brand" component={BrandProductsPage} />
        <Route path="/kategori/:animal/:subcategory" component={BrandsPage} />
        <Route path="/kategori/:animal" component={CategoryPage} />
        <Route path="/odeme" component={Checkout} />
        <Route path="/odeme-sonuc" component={PaymentResultPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/siparis-takip" component={OrderTrackingPage} />
        <Route path="/favoriler" component={FavoritesPage} />
        <Route path="/giris" component={AuthPage} />
        <Route path="/sokak-canlari" component={SokakCanlariPage} />
        <Route path="/hesabim" component={ProfilePage} />
        <Route path="/abone" component={AbonePage} />
        <Route path="/demo" component={DemoLanding} />
        <Route path="/demo1" component={Demo1Page} />
        <Route path="/demo2" component={Demo2Page} />
        <Route path="/demo-anasayfa" component={DemoAnasayfaPage as any} />
        <Route path="/demo-kampanya" component={DemoKampanyaPage} />
        <Route path="/demo-kampanya/urun/:id" component={DemoKampanyaUrunPage} />
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
        <Route path="/magaza" component={MagazaPage} />
        <Route path="/teslimat-iade" component={TeslimatIadePage} />
        <Route path="/gizlilik-sozlesmesi" component={GizlilikSozlesmesiPage} />
        <Route path="/mesafeli-satis" component={MesafeliSatisSozlesmesiPage} />
        <Route path="/:slug" component={SeoPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

const LANDING_LIKE_ROUTES = new Set([
  "/",
  "/petshop",
  "/en-yakin-petshop",
  "/en-yakin-petshoplar",
  "/kapida-odeme-petshop",
  "/petshop-kapida-odeme",
  "/getir-petshop",
]);

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const isDemo = location === "/demo" || location.startsWith("/demo-kampanya") || location === "/demo1" || location === "/demo2" || location === "/demo-anasayfa";
  const isLandingLike = LANDING_LIKE_ROUTES.has(location);

  useEffect(() => {
    if (isLandingLike) {
      const t = setTimeout(() => {
        importCategory();
        importBrands();
        importBrandProducts();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [location, isLandingLike]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return (
    <>
      {!isAdmin && !isDemo && (
        <div className={isLandingLike ? "md:hidden" : ""}>
          <Header />
        </div>
      )}
      <ErrorBoundary><Router /></ErrorBoundary>
      {!isAdmin && !isDemo && isLandingLike && (
        <div className={CURRENT_STORE.id === "jetgo" ? "" : "md:hidden"}><Footer /></div>
      )}
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
