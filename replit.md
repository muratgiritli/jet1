# JETGO - Hızlı Sipariş

## Overview
JETGO is a pet shop quick ordering application built with React/TypeScript, designed to streamline the pet product purchasing process. It allows customers to browse products, manage their cart, and place orders. The platform includes a dynamic admin panel for product management and an AI-powered pet care Q&A chatbot. The business vision is to provide an accessible and user-friendly platform for pet owners, offering convenience, personalized services (like the food calculator and reorder reminders), and efficient delivery options, capitalizing on the growing pet care market.

## User Preferences
I prefer iterative development with clear communication on significant changes. Please ask before making major architectural modifications or adding new external dependencies. For code, I appreciate clean, maintainable TypeScript with a focus on functional components where appropriate. When explaining concepts, use straightforward language, avoiding overly technical jargon.

## System Architecture
The application employs a modern web architecture:
- **Frontend**: React and TypeScript, utilizing `shadcn/ui`, Tailwind CSS, and `framer-motion` for animations.
- **Backend**: Express-based API with session-based authentication using `bcryptjs` and `express-session`. A trusted device system is implemented for OTP bypass for 30 days.
- **Database**: PostgreSQL with Drizzle ORM for all application data, including products, orders, customer profiles, loyalty points, and delivery configurations.
- **Product Images**: Stored as base64 in PostgreSQL, processed (WebP conversion, resizing) upon admin panel upload.
- **Dynamic Content**: All product and category data are dynamically fetched from the database.
- **Loyalty Program**: "Para Puan" system awarding 5% loyalty points on purchases.
- **Pet Care Tools**: "Akıllı Mama Hesaplama" for food needs and reorder reminders.
- **Campaign System**: Dedicated campaign page for product bundles with server-side validation and "frequently bought together" extras.
- **Delivery Management**: Configurable delivery pricing and selectable time slots.
- **SEO**: Comprehensive Local SEO including custom metadata, sitemaps, robots.txt, structured data (Schema.org), programmatic page generation, and keyword-optimized content.
- **Blog System**: Pet care blog with category filters, articles, FAQ sections, and SEO optimization.
- **SEO Pages**: Comprehensive local SEO with 30+ mahalle pages, 20+ keyword pages, store info box, FAQ schema, BreadcrumbList schema, and 500+ word content per page. Pages cover location-based (Atakum, İlkadım, Canik), category-based (kedi maması, köpek maması, kedi kumu), brand-based (JETGO), and intent-based (kapıya teslim, online sipariş, fiyat kampanya) keywords.
- **Low Stock Alerts**: Visual alerts for products with limited stock.
- **Product Reviews**: DB-backed review system with `product_reviews` table. Admin can create/edit/delete/publish/unpublish reviews per product (reviewer name, date, rating, helpful count, comment). Public API serves only published reviews. Admin panel has dedicated "Yorumlar" section with search, status filter, and inline management.
- **Coupon System**: Full CRUD for coupons in the admin panel, supporting various discount types and user-bound coupons.
- **Signup Bonus**: New users receive a 100 TL welcome coupon, displayed via a banner and integrated into the registration flow.
- **Checkout Coupon UI**: Integrated coupon application and display within the checkout process.
- **Social Share**: Product detail pages include social media sharing options.
- **User Panel (/hesabim)**: A multi-tab profile management area for users to view orders, loyalty points, addresses, pet profiles, and manage security settings.
- **Quick Cross-Sell**: Admin-assigned "sıklıkla birlikte alınan ürünler" for any product, displayed on product detail pages.
- **Admin Panel**: Extensive management features including a Dashboard with real-time stats and customer segmentation, product/order/campaign management, coupon CRUD, customer management (with impersonation), segmented bulk SMS, banner CRUD, detailed reporting, inventory counting (Stok Sayım), and settings for loyalty and pet feeding.
- **Kara Liste (Blacklist)**: Admin feature to block problematic customers from ordering, with auto-detection based on cancellation history.
- **Stok Sayım Modu**: Admin tool for efficient inventory updates via barcode or product name.
- **SKT Validation**: Server-side validation to prevent orders of expired products, with an endpoint for near-expiry items.
- **Askıda Mama**: Donation toggle at checkout for supporting street animals.
- **Veteriner Entegrasyonu**: Landing page section listing local veterinary clinics.
- **Mağaza/Konum Sayfası (/magaza)**: Dedicated store page with full NAP (Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A, Atakum), embedded Google Maps iframe, weekly opening hours, WhatsApp/call CTAs, store-about content, internal cross-links to local landing pages and category pages, and 8 store-focused FAQs with FAQPage + PetStore + BreadcrumbList JSON-LD. Linked from desktop footer "Müşteri Hizmetleri" section. Added to sitemap-main with priority 0.9. CSP `frame-src` extended to permit Google Maps embed.
- **Birlikte Alınır (Seasonal Recommendations)**: Seasonal expert tips and cross-selling links on product detail pages.
- **Son Siparişimi Tekrarla**: One-click reorder functionality for logged-in users.
- **Sesli Sipariş**: WhatsApp-based voice ordering option for accessibility.
- **Sanal Pet Besleme**: Gamified virtual pet adoption and feeding feature for earning loyalty points.
- **En Tatlı Pet Yarışması**: Weekly pet photo contest with voting and winner selection.
- **Özel Patiler**: Multi-pet dashboard for managing pet profiles, health records, feeding history, photos, and weight.
- **Sahiplendirme & Kayıp İlan**: Lost/found/adoption board for pets.
- **Pati-Blog & Bilgi Bankası**: Local pet care knowledge base with categorized articles.
- **Order Notifications**: Real-time admin notifications for new orders — browser sound alerts (Web Audio API) + visual popup in admin panel with 10s polling, and SMS notification to admin phone via NetGSM. Admin phone number and SMS toggle configurable from admin settings panel (`app_settings` table: `admin_phone`, `order_notification_sms` keys).
- **Pre-order System**: Products can be marked as "Ön Sipariş" by admin (toggle in product list). Pre-order products with zero stock display blue "Ön Sipariş — ~3 gün teslimat" badges across all product views (popup, product detail, brand products, checkout). Cart bypasses stock checks for preorder items. Server-side order creation deducts available stock first, marks remainder as preorder. Checkout shows a preorder info banner when preorder items are in cart.
- **Security Hardening**: Multi-layer rate limiting on all write endpoints (orders, OTP, registration, pet profiles, photos, addresses, health records, weight logs, favorites, lost/found, voice orders, contest entries/votes, coupon validation, AI chatbot), comprehensive security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), input validation with Zod schemas and field whitelisting on all PATCH endpoints, admin-specific lockout mechanisms, automatic memory cleanup for rate limit/OTP/login attempt Maps, and configurable per-endpoint rate limits for DDOS protection.
- **UI/UX**: Clean, modern, and responsive design with intuitive navigation elements.

## External Dependencies
- **OpenAI**: AI-powered pet care Q&A chatbot.
- **NetGSM**: SMS OTPs for customer authentication.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Database interaction.
- **WhatsApp API**: Submitting customer orders.