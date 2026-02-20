# JetGo - Hızlı Sipariş

## Overview
Pet shop quick ordering application built with React/TypeScript. Customers browse pet products, add items to cart, and submit orders via WhatsApp. Admin panel allows dynamic product management.

## Architecture
- **Frontend**: React + TypeScript with shadcn/ui components, Tailwind CSS, framer-motion
- **Backend**: Express with session-based auth (bcryptjs + express-session + connect-pg-simple)
- **Database**: PostgreSQL (Drizzle ORM) - brand_categories, products, cross_sell_sections, cross_sell_items, orders, breed_stats tables
- **Static data**: CATEGORIES in client/src/lib/data.ts (non-brand products remain static)
- **Dynamic data**: Brand products (Brit Care, Hill's, etc.) served from database via API
- **Cross-sell**: Reusable recommendation sections linked to products via junction table, displayed on product detail pages

## Key Files
- `shared/schema.ts` - Drizzle schema: users, brandCategories, products, crossSellSections, crossSellItems, orders, breedStats tables
- `server/storage.ts` - DatabaseStorage class with CRUD operations
- `server/routes.ts` - API routes (public + admin with session auth)
- `server/seed.ts` - Seeds database with initial brand product data
- `client/src/pages/landing.tsx` - Landing/home page with category cards, banners, footer
- `client/src/pages/category.tsx` - Animal category pages (Köpek, Kedi, Kuş, Kemirgen)
- `client/src/pages/brand-products.tsx` - Brand product listing (fetches from API)
- `client/src/pages/product-detail.tsx` - Individual product detail page with cross-sell sections
- `client/src/pages/home.tsx` - Product browsing page with catalog (static products)
- `client/src/pages/checkout.tsx` - Cart/checkout page with payment options and WhatsApp order
- `client/src/pages/admin.tsx` - Admin panel with login, product/category CRUD
- `client/src/contexts/CartContext.tsx` - Global cart state provider (fetches from API)
- `client/src/components/FloatingCartBar.tsx` - Floating cart indicator shown on all pages
- `client/src/lib/data.ts` - Static product data, categories, payment options, config
- `client/src/App.tsx` - Root component with routing

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

## Frontend Routes
- `/` - Landing page (vitrin)
- `/kategori/:animal` - Animal category page (kopek, kedi, kus, kemirgen)
- `/kategori/:animal/:subcategory` - Brand listing for subcategory
- `/siparis/:animal/:subcategory/:brand` - Brand product page (from DB)
- `/urun/:id` - Product detail page with cross-sell recommendations
- `/siparis` - Product browsing page with static catalog
- `/odeme` - Cart/checkout page with payment, summary, WhatsApp order
- `/admin` - Admin panel (login required)

## Admin Panel
- Default credentials: admin / jetgo2024
- Manage brand categories (add/delete)
- Manage products (add/edit/delete with stock management) with category filter
- Manage cross-sell sections (create/delete sections, add/remove products)
- View incoming orders with status management (yeni/hazirlaniyor/tamamlandi/iptal)
- Session-based authentication with PostgreSQL session store

## Config
- Phone: +908508403959
- Min order: 500 TL
- Free shipping: 1000 TL
- Shipping fee: 89 TL
