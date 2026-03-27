# JETGO - Hızlı Sipariş

## Overview
JETGO is a pet shop quick ordering application built with React/TypeScript, designed to streamline the pet product purchasing process. Customers can browse products, manage their cart, and place orders directly via WhatsApp. The platform includes a dynamic admin panel for comprehensive product management and an AI-powered pet care Q&A chatbot to enhance the user experience. The business vision is to provide a highly accessible and user-friendly platform for pet owners, capitalizing on the growing pet care market by offering convenience, personalized services (like the food calculator and reorder reminders), and efficient delivery options.

## User Preferences
I prefer iterative development with clear communication on significant changes. Please ask before making major architectural modifications or adding new external dependencies. For code, I appreciate clean, maintainable TypeScript with a focus on functional components where appropriate. When explaining concepts, use straightforward language, avoiding overly technical jargon.

## System Architecture
The application features a modern web architecture:
- **Frontend**: Developed with React and TypeScript, leveraging `shadcn/ui` components, Tailwind CSS for styling, and `framer-motion` for smooth animations.
- **Backend**: Implemented using Express, providing a robust API layer. Authentication is session-based, secured with `bcryptjs` for password hashing and `express-session` with `connect-pg-simple` for session management. SMS OTP for customer authentication is handled via NetGSM.
- **Database**: PostgreSQL is used as the primary data store, managed with Drizzle ORM. It stores all critical data including products, categories, orders, customer profiles, loyalty points, and delivery configurations.
- **Product Images**: Stored as base64 within the PostgreSQL database (`product_images` table) for high availability and easy deployment. Images are processed (auto-downloaded from URLs, converted to WebP, resized to 800x800 with 80% quality) upon upload via the admin panel.
- **Dynamic Content**: All product and category listings are dynamically fetched from the database via API, ensuring up-to-date content without static file modifications.
- **Loyalty Program**: A "Para Puan" system allows customers to earn 5% loyalty points on purchases, redeemable on future orders.
- **Pet Care Tools**: An "Akıllı Mama Hesaplama" (Smart Food Calculator) helps users determine pet food needs and set reorder reminders.
- **Campaign System**: Features a dedicated campaign page and checkout mode for special product bundles, with server-side validation.
- **Delivery Management**: Includes selectable delivery time slots and neighborhood-based delivery pricing, allowing administrators to define custom minimum order values, shipping fees, and free shipping thresholds per area.
- **SEO**: Comprehensive Local SEO implementation including custom per-page metadata, sitemaps, robots.txt, structured data (Schema.org for LocalBusiness, Product, FAQ, BreadcrumbList, WebSite, Article). 40+ dedicated SEO pages covering: core city page, 3 district pages (Atakum/İlkadım/Canik), mahalle-block page, 28 individual neighborhood pages, 4 category pages, 3 blog/comparison pages, and 10 keyword-targeted pages. All pages follow a local SEO + topical authority strategy. Programmatic mahalle page generation using `generateMahallePage()` in `seo-data.ts`. H1 tags properly set on landing, category, and SEO pages. Product images have local keyword alt text.
- **Blog System**: Pet care blog at `/blog` with 6 articles (kedi maması rehberi, köpek maması rehberi, kedi kumu rehberi, beslenme hataları, kedi bakım ipuçları, Samsun gezi rehberi). Blog listing page with category filters, individual article pages with FAQ sections, related posts, and CTA banners. Article structured data (Schema.org Article) for SEO. Blog preview section on landing page. Blog data in `client/src/lib/blog-data.ts`, pages in `client/src/pages/blog.tsx`.
- **Brand Showcase**: "Markalarımız" horizontal brand slider on landing page featuring 10 brands (Royal Canin, Hill's, N&D, Pro Plan, Reflex, Profine, Pronature, Brit, Acana, Orijen) with color-coded brand logos.
- **Product Reviews**: Deterministic review system (`client/src/components/ProductReviews.tsx`) generating 3-10 reviews per product based on product ID seed. Reviews feature mostly female Turkish name initials, 4-5 star ratings, dates within last month, and comments about delivery speed, payment options, and product quality. Includes "Yorum Yaz" form with interactive star rating and minimum 10-character validation.
- **Admin Panel**: Enhanced with 6-section tabbed navigation: Dashboard (real-time stats, revenue charts, top products, low stock alerts), Yönetim (existing product/order/campaign management), Müşteri (customer list with search, edit, WhatsApp contact), Bildirim (bulk SMS broadcast to customers), Banner (CRUD for promotional banners with image upload), Raporlama (payment methods, order status, top customers, monthly revenue). Navigation uses sticky pill-shaped buttons below header.
- **UI/UX**: Utilizes a clean, modern design with a responsive interface optimized for mobile. Key UI elements include a floating cart bar, a fixed bottom navigation bar, and a global header with search and navigation.

## External Dependencies
- **OpenAI**: Integrated for the AI-powered pet care Q&A chatbot on the landing page.
- **NetGSM**: Used for sending SMS OTPs for customer authentication.
- **PostgreSQL**: The relational database management system for persistent data storage.
- **Drizzle ORM**: Object-relational mapper for interacting with PostgreSQL.
- **WhatsApp API**: Used for submitting customer orders.