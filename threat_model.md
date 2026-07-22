# Threat Model

## Project Overview

JETGO is a publicly deployed Express + React e-commerce application for pet products with customer accounts, admin operations, checkout, order management, loyalty features, community features, and AI-assisted pet Q&A. The production deployment is public (`https://enuygunpetshop.com`) and uses PostgreSQL for application state, sessions, orders, customer data, and store settings. Payment flows integrate with Tosla and iyzico, SMS flows integrate with NetGSM, and some server-side features call OpenAI.

Production assumptions for this repository:
- `NODE_ENV` is `production` in deployed environments.
- Replit terminates TLS for deployed traffic.
- The current deployment visibility is public, so all public routes are internet-reachable.
- Mockup/dev-only surfaces are out of scope unless production reachability is demonstrated.

## Assets

- **Admin accounts and sessions** — compromise grants full access to products, customers, orders, exports, SMS sending, content management, and payment-related settings.
- **Customer accounts and sessions** — compromise exposes order history, addresses, phone numbers, pet profiles, loyalty state, and community content.
- **Order and payment state** — tampering can create fraudulent orders, mis-state payment completion, or corrupt stock and fulfillment data.
- **PII and business data** — phone numbers, names, addresses, contact messages, visitor analytics, and exported customer/order data require strict access control.
- **Application secrets and third-party quotas** — session secret, database credentials, payment credentials, SMS credentials, and OpenAI-backed capabilities can be abused for account takeover, financial loss, or service disruption.

## Trust Boundaries

- **Browser to API** — all request bodies, query parameters, headers, and uploaded content are untrusted.
- **Public to authenticated customer** — browsing is public, but customer profile, order, pet, and account data must be enforced server-side.
- **Authenticated customer to admin** — `/api/admin/*` operations must remain strictly unavailable to normal customers.
- **API to PostgreSQL** — the server has broad database access, so broken authorization or injection at the route layer can expose or tamper with all tenant data.
- **API to payment/SMS/OpenAI providers** — callbacks and outbound provider calls must be authenticated, bounded, and safe against spoofing and spend abuse.
- **Store/domain boundary** — the app serves multiple branded domains from one codebase, so per-store content and settings must not bleed across domains or admin store contexts.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`, `server/static.ts`.
- **Highest-risk areas:** admin auth/bootstrap, checkout/payment callbacks, customer account endpoints, admin exports/reporting, SMS flows, OpenAI-backed endpoints.
- **Public surfaces:** storefront/product/search/content routes, OTP/login/register, checkout, coupon validation, AI pet Q&A, visit telemetry (`/api/track/visit`), and community/contest/public feeds.
- **Authenticated customer surfaces:** `/api/customer/*`, order history/tracking, pet profiles, favorites, addresses, loyalty/community mutations.
- **Admin surfaces:** `/api/admin/*`, data exports, order management, customer management, settings, payment config.
- **Usually ignore unless proven live:** unmounted helper code under `server/replit_integrations/`; current recon found those files but not active registration in the production route tree.

## Threat Categories

### Spoofing

The application relies on server-side sessions for both admins and customers. Admin sessions must never be obtainable via default credentials or predictable bootstrap behavior, and customer login shortcuts such as trusted-device flows must bind only to the legitimate account owner. Payment callbacks and webhooks must accept only authenticated provider-originated messages.

### Tampering

The server is responsible for stock, order, payment, coupon, and store-scoped content state. Clients must not be able to change another user’s records by guessing identifiers, and destructive flows must verify ownership before mutating or deleting dependent records. Payment completion and cancellation paths must remain atomic and resistant to replay.

### Information Disclosure

The application stores substantial customer and operational data, including addresses, phones, order history, contact messages, and internal analytics. Public endpoints must not expose authenticated data, admin-only exports, or cross-user/cross-store records. Logs and API responses must avoid leaking sensitive identifiers and internal details beyond what operators need.

### Denial of Service

Several public endpoints trigger expensive work: OTP sending, AI-backed responses, telemetry geolocation lookups, image/audio processing, exports, and payment/session flows. Internet-reachable endpoints must enforce effective rate limits, payload bounds, and authentication where appropriate so attackers cannot convert third-party integrations or CPU-heavy operations into a spend or availability attack.

### Elevation of Privilege

This codebase has a wide privilege gap between anonymous users, customers, and admins. Every admin action must require a valid admin session, and every customer-owned object must be scoped to the active customer on read, update, and delete. Broken authorization, IDOR, or weak bootstrap controls would directly expose PII and allow operational takeover.