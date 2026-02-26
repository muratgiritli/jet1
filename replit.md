# JET55 - Hızlı Sipariş

## Overview
Pet shop quick ordering application built with React/TypeScript. Customers browse pet products, add items to cart, and submit orders via WhatsApp. Admin panel allows dynamic product management.

## Architecture
- **Frontend**: React + TypeScript with shadcn/ui components, Tailwind CSS, framer-motion
- **Backend**: Express with session-based auth (bcryptjs + express-session + connect-pg-simple)
- **Database**: PostgreSQL (Drizzle ORM) - brand_categories, products, cross_sell_sections, cross_sell_items, orders, breed_stats, installment_rates, customers, customer_favorites, customer_addresses, pet_profiles, loyalty_points, reorder_reminders tables
- **Loyalty Points**: Para Puan system - customers earn 5% of subtotal on each order, can spend points on future orders (auto-applied at checkout)
- **Food Calculator**: Akıllı Mama Hesaplama - calculates daily food needs based on pet weight/age, shows how many days a package lasts, allows setting reorder reminders
- **Reorder Reminders**: Customers set reminders via food calculator, admin sees upcoming/overdue reminders with one-click WhatsApp messaging
- **Static data**: CATEGORIES in client/src/lib/data.ts (non-brand products remain static)
- **Dynamic data**: Brand products (Brit Care, Hill's, etc.) served from database via API
- **Cross-sell**: Reusable recommendation sections linked to products via junction table, displayed on product detail pages

## Key Files
- `shared/schema.ts` - Drizzle schema: users, brandCategories, products, crossSellSections, crossSellItems, orders, breedStats, stockAlerts tables
- `server/storage.ts` - DatabaseStorage class with CRUD operations
- `server/routes.ts` - API routes (public + admin with session auth)
- `server/seed.ts` - Seeds database with initial brand product data
- `client/src/pages/landing.tsx` - Landing/home page with category cards, banners, search bar, footer
- `client/src/pages/category.tsx` - Animal category pages (Köpek, Kedi, Kuş, Kemirgen)
- `client/src/pages/brand-products.tsx` - Brand product listing (fetches from API)
- `client/src/pages/product-detail.tsx` - Individual product detail page with cross-sell sections, stock alerts, food calculator
- `client/src/components/FoodCalculator.tsx` - Smart food calculator with reorder reminder
- `client/src/pages/home.tsx` - Product browsing page with catalog (static products)
- `client/src/pages/checkout.tsx` - Cart/checkout page with payment options, customer info, and WhatsApp order
- `client/src/pages/order-tracking.tsx` - Order tracking by phone number
- `client/src/pages/admin.tsx` - Admin panel with login, product/category CRUD, SKT warnings
- `client/src/components/SearchBar.tsx` - Debounced product search with dropdown results
- `client/src/contexts/CartContext.tsx` - Global cart state provider (fetches from API)
- `client/src/components/FloatingCartBar.tsx` - Floating cart indicator (above bottom tab bar)
- `client/src/components/BottomTabBar.tsx` - Fixed bottom navigation (Ana Sayfa, Kategoriler, Favoriler, Sepet, Takip)
- `client/src/components/FavoriteButton.tsx` - Heart toggle button for products
- `client/src/components/ImageZoom.tsx` - Pinch-to-zoom image viewer for product photos
- `client/src/components/ProductSkeleton.tsx` - Skeleton loading components
- `client/src/pages/favorites.tsx` - Favorites page (localStorage-based)
- `client/src/pages/categories-overview.tsx` - Categories overview page
- `client/src/hooks/useRecentlyViewed.ts` - Recently viewed products tracking (localStorage)
- `client/src/lib/data.ts` - Static product data, categories, payment options, config
- `client/src/App.tsx` - Root component with routing, page transitions (framer-motion)

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
- `DELETE /api/admin/products/:id` - Delete product (auth required)
- `POST /api/admin/brand-categories` - Create category (auth required)
- `DELETE /api/admin/brand-categories/:id` - Delete category (auth required)
- `GET /api/product-detail/:id` - Product detail with category and cross-sell sections
- `GET /api/cross-sell-sections` - All cross-sell sections with items
- `POST /api/admin/cross-sell-sections` - Create cross-sell section (auth required)
- `DELETE /api/admin/cross-sell-sections/:id` - Delete cross-sell section (auth required)
- `POST /api/admin/cross-sell-items` - Add product to cross-sell section (auth required)
- `DELETE /api/admin/cross-sell-items/:id` - Remove product from cross-sell section (auth required)
- `POST /api/orders` - Create new order (public, saves to DB)
- `GET /api/admin/orders` - List all orders (auth required)
- `PATCH /api/admin/orders/:id/status` - Update order status (auth required)
- `GET /api/breed-stats/:productId` - Get breed stats for a product
- `POST /api/admin/breed-stats` - Create breed stat (auth required)
- `DELETE /api/admin/breed-stats/:id` - Delete breed stat (auth required)
- `GET /api/products/search?q=` - Search products by name
- `POST /api/customer/register` - Customer registration (phone+password+name)
- `POST /api/customer/login` - Customer login (phone+password)
- `POST /api/customer/logout` - Customer logout
- `GET /api/customer/me` - Get current customer (session-based)
- `PATCH /api/customer/profile` - Update customer name/address (auth required)
- `POST /api/stock-alerts` - Register stock notification (public)
- `GET /api/orders/track?phone=` - Track orders by phone number
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
- `/siparis-takip` - Order tracking by phone number
- `/favoriler` - Favorites page (localStorage)
- `/kategori` - Categories overview page
- `/giris` - Customer login/register page (phone+password)
- `/hesabim` - Customer profile page (edit name, address)
- `/admin` - Admin panel (login required)

## Admin Panel
- Default credentials: admin / jetgo2024
- Manage brand categories (add/delete)
- Manage products (add/edit/delete with stock management) with category filter
- Manage cross-sell sections (create/delete sections, add/remove products)
- View incoming orders with status management (yeni/hazirlaniyor/tamamlandi/iptal)
- SKT expiration warnings (products expiring within 3 months shown at top)
- Session-based authentication with PostgreSQL session store

## Config
- Phone: +908508403959
- Min order: 500 TL
- Free shipping: 1000 TL
- Shipping fee: 89 TL
