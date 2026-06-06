---
name: Multi-domain store registry ("tek mutfak, çok tabela")
description: How one app/DB/deployment serves multiple branded storefronts on different custom domains, and the rules that keep each domain ranking independently.
---

## Architecture
One app, one DB, one deployment ("Yol A"). Multiple custom domains are linked in the Replit Deployment settings. **Shared:** products, stock, customers, orders, single admin (jetgomarket.com/admin). **Per-domain:** brand name, logo, theme colors, SEO title/meta/JSON-LD.

The single source of truth is `shared/stores.ts` — a `StoreConfig` registry keyed by `hostnames`. Imported by BOTH client and server (the `@shared` alias resolves in both).

- Client resolves the active store ONCE from `window.location.hostname` via `client/src/lib/store.ts` (`CURRENT_STORE`). SEO.tsx, Logo.tsx, Header.tsx, main.tsx all read from it.
- Server resolves per-request: `injectAllMeta(html, url, req.hostname)` in `server/seo-meta.ts`.

## The rule that must never break: self-canonicalization
**Why:** the owner deliberately wants 3-4 SEPARATE live sites that each rank in Google (accepting duplicate-content risk). If a secondary domain's served HTML canonical/og:url points to jetgomarket.com, Google consolidates it into jetgo and the secondary site never ranks — defeating the whole project.

**How to apply:** any server-rendered canonical / og:url MUST be built from the request-domain's `store.domain`, never a hardcoded constant. `server/seo-meta.ts` does this for homepage, SEO landing pages, and product pages. Do NOT reintroduce a hardcoded `SITE = "https://www.jetgomarket.com"`.

## Host-detection helpers (don't mix them up)
- `getStoreByHost` — normalized (strips port + leading `www.`), falls back to `DEFAULT_STORE` for unknown/dev hosts. Use for BRANDING/metadata resolution.
- `getStoreByExactHost` — exact hostname match, returns `undefined` for unknown hosts. Use ONLY for the 301 canonical-host redirect in `server/index.ts`, so dev/preview/unknown hosts are never redirected.
- Redirect guard `if (target && reqHost !== target)` prevents redirect loops.

## Operational guard
Any newly linked custom domain MUST be added to `STORES` (with apex + www in `hostnames`) BEFORE go-live, or it falls back to the default store and canonicalizes into jetgo.

## Known deferred limitations (Faz 2+)
- The static JSON-LD block in `client/index.html` (lines ~56-100) is still jetgo-only; non-JS crawlers on secondary domains see jetgo identity until it's made store-aware server-side.
- Deep per-page SEO content in `client/src/lib/seo-data.ts` still says "JETGO"; brand-token substitution per store is deferred.
- Per-store prices, banners/campaigns, delivery, payment, and admin store-switcher + order source-site tags are later phases (Faz 2-4).
