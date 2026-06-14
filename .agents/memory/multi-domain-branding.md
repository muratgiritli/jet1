---
name: Multi-domain brandify pattern
description: How JETGO serves multiple branded sites (jetgomarket / atakumpetshop) from one codebase and where rebranding must happen
---

# Multi-domain branding ("tek mutfak, çok tabela")

One app/DB/deployment serves several separate live branded sites on different
domains. Shared products/stock/customers/orders/admin; each domain shows its own
name/title/meta/logo/colors and self-canonicalizes.

## The mechanism
- `shared/stores.ts`: `brandifyFor(store, text)` — **no-op for `DEFAULT_STORE`** (jetgo),
  otherwise ordered replace of domain + brand-name tokens (www host → apex → JETGO/Jetgo/jetgo → brandWord).
- `client/src/lib/store.ts`: `brandify(text) = brandifyFor(CURRENT_STORE, text)`. `CURRENT_STORE`
  is resolved from `window.location.host` at module load.

## Where rebranding is handled (do NOT double-wrap)
- **`client/src/components/SEO.tsx` centralizes meta**: it brandifies title, description,
  keywords, OG/Twitter, AND jsonLd. So ANY text passed into `<SEO ...>` (including
  `jsonLd`, `FAQ_JSONLD([...])`, autoTitle/autoDescription) is already covered — leave those literals alone.
- **`server/seo-meta.ts`** brandifies the static `index.html` `#seo-static` hidden div and the
  static `ld+json` block for SSR/no-JS crawlers.

## Rules that bit us
- **Only directly-rendered visible body text needs a manual `brandify()` wrap.** SEO-prop text does not.
- **Contact identifiers must be preserved, not domain-rewritten.** In `server/seo-meta.ts` the JSON-LD
  brandify captures the original `"email"` and `"sameAs"` and restores them after brandify — they point
  to the one real shared business, so they must stay (e.g. info@jetgomarket.com / instagram.com/jetgomarket.com)
  on every brand. **Why:** brandifyFor's domain rule would otherwise turn the shared email/social into the apex domain.
- **Leave functional/non-visible JETGO tokens alone:** URL-matching regexes (link rewriting), function/component
  names (`WhyJetgo`), localStorage keys, asset paths, `className="hidden"` text, demo pages.
- Since brandify is a no-op for the default store, wrapping a literal is always safe for jetgo.
- **Two stores may deliberately share the same `name`/`shortName`/`brandWord`** (e.g. atakumpet.com cargo + atakum.biz local both brand "Atakum Pet"). They stay separate ONLY via distinct `id` + `domain`; host resolution is by hostname, brandify produces identical text for both (fine). The store-scoping collision tests must therefore assert distinct id + domain, NOT a distinct brand word.

## Workflow note
Restart the `Start application` workflow after ANY `server/` or `shared/` edit (tsx, no hot reload).
Client edits hot-reload via Vite. Verify SSR branding with `curl -H "Host: www.atakumpetshop.com" http://localhost:5000/`.
