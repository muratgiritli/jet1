# JetGo - Hızlı Sipariş

## Overview
Pet shop quick ordering application converted from static HTML to modern React/TypeScript. Customers browse pet products, add items to cart, and submit orders via WhatsApp.

## Architecture
- **Frontend**: React + TypeScript with shadcn/ui components, Tailwind CSS, framer-motion
- **Backend**: Express (minimal - serves frontend only)
- **No database needed** - all product data is static, orders go to WhatsApp

## Key Files
- `client/src/pages/landing.tsx` - Landing/home page with category cards, banners, footer
- `client/src/pages/category.tsx` - Animal category pages (Köpek, Kedi, Kuş, Kemirgen) with subcategory grids
- `client/src/pages/home.tsx` - Product browsing page with catalog
- `client/src/pages/checkout.tsx` - Cart/checkout page with payment options and WhatsApp order
- `client/src/contexts/CartContext.tsx` - Global cart state provider
- `client/src/components/FloatingCartBar.tsx` - Floating cart indicator shown on all pages
- `client/src/lib/data.ts` - Product data, categories, payment options, config
- `client/src/App.tsx` - Root component with routing

## Routes
- `/` - Landing page (vitrin)
- `/kategori/:animal` - Animal category page (kopek, kedi, kus, kemirgen)
- `/siparis` - Product browsing page with catalog
- `/odeme` - Cart/checkout page with payment, summary, WhatsApp order

## Features
- Landing page with JETGO branding, promotional banners, 2x2 animal category grid
- Animal category pages with colorful subcategory grids (e.g., Mama Markaları, Yaş Mama, Bakım)
- Product browsing with categorized tabs (Kedi Kumu, Ödüller, Malt, Yaş Mama, Aksesuar)
- Quantity controls for each product
- Global cart system - single cart persists across all pages via CartContext
- Separate checkout page with payment options, progress bars, order summary
- Payment method selection with radio buttons (Nakit %10 indirim, EFT, QR, Kredi Kartı)
- Progress bars for minimum order (500 TL) and free shipping (1000 TL)
- WhatsApp order submission from checkout page
- Floating cart bar on all pages showing item count and total
- Sticky bottom bar on product page linking to checkout
- Mobile-first responsive design

## Config
- Phone: +908508403959
- Min order: 500 TL
- Free shipping: 1000 TL
- Shipping fee: 89 TL
