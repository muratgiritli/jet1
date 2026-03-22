# JETGO - Hızlı Sipariş

## Overview
Pet shop quick ordering application built with React/TypeScript. Customers browse pet products, add items to cart, and submit orders via WhatsApp. Admin panel allows dynamic product management. AI-powered pet care Q&A chatbot on landing page (OpenAI via Replit AI Integrations).

## Architecture
- **Frontend**: React + TypeScript with shadcn/ui components, Tailwind CSS, framer-motion
- **Backend**: Express with session-based auth (bcryptjs + express-session + connect-pg-simple), NetGSM SMS OTP for customer auth
- **Database**: PostgreSQL (Drizzle ORM) - subcategories, brand_categories, products, product_images, cross_sell_sections, cross_sell_items, orders, breed_stats, installment_rates, customers, customer_favorites, customer_addresses, pet_profiles, loyalty_points, reorder_reminders, delivery_neighborhoods tables
- **Product Images**: Stored as base64 in `product_images` table (PostgreSQL), served via `/api/product-image/:id` endpoint. No filesystem dependency — images survive deployments. Admin uploads via multipart form, external URLs auto-downloaded and converted to WebP (800x800, quality 80).
- **Loyalty Points**: Para Puan system - customers earn 5% of subtotal on each order, can spend points on future orders (auto-applied at checkout)
- **Food Calculator**: Akıllı Mama Hesaplama - calculates daily food needs based on pet weight/age, shows how many days a package lasts, allows setting reorder reminders
- **Reorder Reminders**: Customers set reminders via food calculator, admin sees upcoming/overdue reminders with one-click WhatsApp messaging
- **Subcategories**: Dynamic from `subcategories` table — admin can add/delete subcategories per animal, each with slug, color, hasBrands flag, sortOrder
- **Static data**: CATEGORIES in client/src/lib/data.ts (category tab names only, no products), CONFIG, PAYMENT_OPTIONS
- **Dynamic data**: All products and categories served from database via API (no static product lists or category lists)
- **Cross-sell**: Reusable recommendation sections linked to products via junction table, displayed on product detail pages
- **Campaign System**: campaign_items table with main/extra products. Campaign page at /kampanya (purple theme), campaign banner on landing. Product detail campaign mode via ?kampanya=1 hides taksit/points/hemen-al. Checkout campaign mode: only Kapıda Nakit payment, 4000 TL free shipping, no discount/points, requires min 1 main + 1 extra. Server-side campaign validation in /api/orders. Max 1 main product per order (all others locked when one selected). Kedi kumu (IDs 461,474,473) max 1 per order. Admin campaign management: search & add products, publish/unpublish toggle, category-based filtering for extras, sort order management.
- **Delivery Slots**: Checkout has delivery time slot selection (Hemen, Bugün 12-14, Bugün 16-19, Yarın Sabah 10-12). Stored as `delivery_slot` in orders table, shown in WhatsApp message and admin order detail.
- **Order Notes**: Checkout has optional order note textarea (max 500 chars). Stored as `customer_note` in orders table, shown in WhatsApp message and admin order detail.
- **Delivery Neighborhoods**: Mahalle-based delivery pricing. Admin creates neighborhoods with individual min order, shipping fee, and free shipping thresholds. Checkout shows neighborhood selector; when selected, overrides global CONFIG values for that order. Stored in `delivery_neighborhoods` table.
- **Order Counter**: Landing page shows time-based daily order counter (10:00-20:00). Varies by time of day with deterministic daily seed for consistency.
- **SEO**: Custom SEO component (`client/src/components/SEO.tsx`) with per-page title, description, keywords, canonical URLs, Open Graph, Twitter Cards, structured data (Schema.org). Sitemap index with district-based sub-sitemaps (sitemap-atakum.xml, sitemap-ilkadim.xml, etc.), robots.txt, FAQ/Product/BreadcrumbList/LocalBusiness/WebSite JSON-LD. Google site verification active. Only Inter font loaded (optimized from 30+ fonts).
- **SEO Landing Pages**: 26 neighborhood/district SEO pages with unique article content, FAQ, internal links, breadcrumbs, category links, CTA sections. Data in `client/src/lib/seo-pages.ts`, component in `client/src/pages/seo-landing.tsx`. URL pattern: `/:slug` (e.g., `/atakum-petshop`, `/denizevleri-petshop`, `/ilkadim-kadikoy-petshop`). Districts: Samsun, Atakum (12 mahalle), İlkadım (6 mahalle), Canik (4 mahalle), Tekkeköy (2 mahalle).

## Key Files
- `client/src/pages/campaign.tsx` - Campaign product listing page with main/extra sections
- `shared/schema.ts` - Drizzle schema: users, brandCategories, products, crossSellSections, crossSellItems, orders, breedStats, stockAlerts, campaignItems tables
- `server/storage.ts` - DatabaseStorage class with CRUD operations
- `server/routes.ts` - API routes (public + admin with session auth)
- `server/seed.ts` - Seeds database with initial brand product data
- `client/src/pages/landing.tsx` - Landing/home page with category cards, banners, search bar, footer
- `client/src/pages/category.tsx` - Animal category pages (Köpek, Kedi, Kuş, Kemirgen)
- `client/src/pages/brand-products.tsx` - Brand product listing (fetches from API)
- `client/src/pages/product-detail.tsx` - Individual product detail page with cross-sell sections, stock alerts, food calculator
- `client/src/components/FoodCalculator.tsx` - Smart food calculator with reorder reminder
- `client/src/components/PetAIChat.tsx` - AI pet care Q&A chatbot (landing page, OpenAI integration)
- `client/src/pages/home.tsx` - Product browsing page with catalog (static products)
- `client/src/pages/checkout.tsx` - Cart/checkout page with payment options, customer info, WhatsApp order (opens new tab), redirects to member panel
- `client/src/pages/order-tracking.tsx` - Order tracking by phone number
- `client/src/pages/auth.tsx` - Customer login/register (phone + birth year as 4-digit password)
- `client/src/pages/admin.tsx` - Admin panel with login, product/category CRUD, SKT warnings
- `client/src/components/SearchBar.tsx` - Debounced product search with dropdown results
- `client/src/contexts/CartContext.tsx` - Global cart state provider (fetches from API)
- `client/src/components/FloatingCartBar.tsx` - Floating cart indicator (above bottom tab bar)
- `client/src/components/BottomTabBar.tsx` - Fixed bottom navigation (Ana Sayfa, Kategoriler, Favoriler, Sepet, Takip)
- `client/src/components/Footer.tsx` - Desktop-only footer (hidden on mobile via `hidden md:block`), shows company info, legal links, contact details
- `client/src/components/Header.tsx` - Global header with logo, back button, auth button, category nav bar
- `client/src/components/FavoriteButton.tsx` - Heart toggle button for products
- `client/src/components/ImageZoom.tsx` - Pinch-to-zoom image viewer for product photos
- `client/src/components/ProductSkeleton.tsx` - Skeleton loading components
- `client/src/pages/favorites.tsx` - Favorites page (localStorage-based)
- `client/src/pages/categories-overview.tsx` - Categories overview page
- `client/src/hooks/useRecentlyViewed.ts` - Recently viewed products tracking (localStorage)
- `client/src/lib/data.ts` - Static product data, categories, payment options, config
- `client/src/App.tsx` - Root component with routing, page transitions (framer-motion)
- `client/src/pages/static-pages.tsx` - Static content pages: SSS, KVKK, Gizlilik, Kullanım Koşulları, Çerez Politikası, İşlem Rehberi, Hakkımızda, İletişim, Teslimat/İade, Gizlilik Sözleşmesi, Mesafeli Satış Sözleşmesi. Company info centralized in COMPANY constant (Tic.Sicil:29458, MERSİS:0772071161700010, Vergi:Gaziler/7720711617)

## API Routes
- `GET /api/products` - All products from database
- `GET /api/brand-categories` - All brand categories
- `GET /api/brand-categories/:id/products` - Products by category ID
- `GET /api/brand-products/:animal/:subcategory/:brandSlug` - Products by brand slug
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Check auth status
- `POST /api/admin/products` - Create product (auth required)
- `PATCH /api/admin/products/:id` - Update product (auth required)
- `POST /api/admin/products/:id/image` - Upload product image (multipart/form-data, auth required, converts to WebP)
- `DELETE /api/admin/products/:id` - Delete product (auth required)
- `POST /api/admin/brand-categories` - Create category (auth required)
- `DELETE /api/admin/brand-categories/:id` - Delete category (auth required)
- `GET /api/product-detail/:id` - Product detail with category and cross-sell sections
- `GET /api/cross-sell-sections` - All cross-sell sections with items
- `POST /api/admin/cross-sell-sections` - Create cross-sell section (auth required)
- `DELETE /api/admin/cross-sell-sections/:id` - Delete cross-sell section (auth required)
- `POST /api/admin/cross-sell-items` - Add product to cross-sell section (auth required)
- `DELETE /api/admin/cross-sell-items/:id` - Remove product from cross-sell section (auth required)
- `POST /api/pet-ask` - AI pet care Q&A (OpenAI, Turkish responses, max 300 tokens)
- `POST /api/orders` - Create new order (requires phone+name, decrements stock, saves installment info)
- `GET /api/admin/orders` - List all orders (auth required)
- `PATCH /api/admin/orders/:id/status` - Update order status (auth required)
- `GET /api/breed-stats/:productId` - Get breed stats for a product
- `POST /api/admin/breed-stats` - Create breed stat (auth required)
- `DELETE /api/admin/breed-stats/:id` - Delete breed stat (auth required)
- `GET /api/products/search?q=` - Search products by name
- `POST /api/otp/send` - Send SMS OTP to phone (NetGSM), returns isExisting flag
- `POST /api/otp/verify` - Verify OTP code, auto-login or create new customer
- `POST /api/customer/register` - Customer registration (phone+password+name) (legacy fallback)
- `POST /api/customer/login` - Customer login (phone+password)
- `POST /api/customer/logout` - Customer logout
- `GET /api/customer/me` - Get current customer (session-based)
- `PATCH /api/customer/profile` - Update customer name/address (auth required)
- `POST /api/stock-alerts` - Register stock notification (public)
- `GET /api/orders/track` - Track orders (customer auth required, uses session phone)
- `POST /api/admin/stock-alerts/:productId/notify` - Notify stock alert subscribers (admin auth)
- `GET /api/customer/orders` - Customer order history (customer auth required)
- `GET /api/campaign-items` - Get all active campaign items with product details (public)
- `GET /api/campaign-check/:productId` - Check if a product is a campaign item (public)
- `GET /api/admin/campaign-items` - All campaign items including inactive (auth required)
- `POST /api/admin/campaign-items` - Add product to campaign (auth required)
- `PATCH /api/admin/campaign-items/:id` - Update campaign item (toggle active, sort order, type) (auth required)
- `DELETE /api/admin/campaign-items/:id` - Remove product from campaign (auth required)
- `GET /api/delivery-neighborhoods` - Get active delivery neighborhoods (public)
- `GET /api/admin/delivery-neighborhoods` - All delivery neighborhoods (auth required)
- `POST /api/admin/delivery-neighborhoods` - Create delivery neighborhood (auth required)
- `PATCH /api/admin/delivery-neighborhoods/:id` - Update delivery neighborhood (auth required)
- `DELETE /api/admin/delivery-neighborhoods/:id` - Delete delivery neighborhood (auth required)
- `GET /api/installment-rates` - Get active installment rates (public)
- `GET /api/admin/installment-rates` - All installment rates (auth required)
- `POST /api/admin/installment-rates` - Create installment rate (auth required)
- `PATCH /api/admin/installment-rates/:id` - Update installment rate (auth required)
- `DELETE /api/admin/installment-rates/:id` - Delete installment rate (auth required)

## Frontend Routes
- `/` - Landing page (vitrin)
- `/kategori/:animal` - Animal category page (kopek, kedi, kus, kemirgen)
- `/kategori/:animal/:subcategory` - Brand listing for subcategory
- `/siparis/:animal/:subcategory/:brand` - Brand product page (from DB)
- `/urun/:id` - Product detail page with cross-sell recommendations
- `/siparis` - Product browsing page with static catalog
- `/odeme` - Cart/checkout page with payment, summary, WhatsApp order
- `/siparis-takip` - Order tracking (requires login)
- `/favoriler` - Favorites page (localStorage)
- `/kampanya` - Campaign products page (main + extra items)
- `/kategori` - Categories overview page
- `/giris` - Customer login/register page (phone+password)
- `/hesabim` - Customer profile page (edit name, address)
- `/admin` - Admin panel (login required)
- `/sss` - Sıkça Sorulan Sorular (FAQ)
- `/kvkk` - Kişisel Verilerin Korunması (KVKK)
- `/gizlilik` - Gizlilik Politikası
- `/kullanim-kosullari` - Kullanım Koşulları
- `/cerez-politikasi` - Çerez Politikası
- `/islem-rehberi` - İşlem Rehberi
- `/hakkimizda` - Hakkımızda
- `/iletisim` - İletişim
- `/teslimat-iade` - Teslimat ve İade Şartları
- `/gizlilik-sozlesmesi` - Gizlilik Sözleşmesi
- `/mesafeli-satis` - Mesafeli Satış Sözleşmesi

## Admin Panel
- Default credentials: admin / jetgo2024
- Manage brand categories (add/delete)
- Manage products (add/edit/delete with stock management) with category filter
- Manage cross-sell sections (create/delete sections, add/remove products)
- View incoming orders with status management (yeni/hazirlaniyor/tamamlandi/iptal)
- SKT expiration warnings (products expiring within 3 months shown at top)
- Para Puan (loyalty points) management - view balances, add/deduct points manually
- Stock alert notifications - WhatsApp notify customers when product is back in stock
- Session-based authentication with PostgreSQL session store

## Config
- Phone: +908508403959
- Min order: 500 TL
- Free shipping: 1000 TL
- Shipping fee: 89 TL
