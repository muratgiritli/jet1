# JetGo - Hızlı Sipariş

## Overview
Pet shop quick ordering application converted from static HTML to modern React/TypeScript. Customers browse pet products, add items to cart, and submit orders via WhatsApp.

## Architecture
- **Frontend**: React + TypeScript with shadcn/ui components, Tailwind CSS, framer-motion
- **Backend**: Express (minimal - serves frontend only)
- **No database needed** - all product data is static, orders go to WhatsApp

## Key Files
- `client/src/pages/home.tsx` - Main ordering page with all functionality
- `client/src/lib/data.ts` - Product data, categories, payment options, config
- `client/src/App.tsx` - Root component with routing

## Features
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
