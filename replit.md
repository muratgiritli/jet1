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
- `client/src/pages/home.tsx` - Ordering page with product catalog and cart
- `client/src/lib/data.ts` - Product data, categories, payment options, config
- `client/src/App.tsx` - Root component with routing

## Routes
- `/` - Landing page (vitrin)
- `/kategori/:animal` - Animal category page (kopek, kedi, kus, kemirgen)
- `/siparis` - Ordering page with products and cart

## Features
- Landing page with JETGO branding, promotional banners, 2x2 animal category grid
- Animal category pages with colorful subcategory grids (e.g., Mama Markaları, Yaş Mama, Bakım)
- Product browsing with categorized tabs (Kedi Kumu, Ödüller, Malt, Yaş Mama, Aksesuar)
- Quantity controls for each product
- Payment method selection with radio buttons (Nakit %10 indirim, EFT, QR, Kredi Kartı)
- Progress bars for minimum order (500 TL) and free shipping (1000 TL)
- Order summary with WhatsApp integration
- Sticky bottom bar showing cart total
- Mobile-first responsive design

## Config
- Phone: +908508403959
- Min order: 500 TL
- Free shipping: 1000 TL
- Shipping fee: 89 TL
