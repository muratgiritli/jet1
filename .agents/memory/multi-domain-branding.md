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
  otherwise rewrites domain tokens (www host + apex) and brand-name tokens (JETGO/Jetgo/jetgo → brandWord).
- `client/src/lib/store.ts`: `brandify(text) = brandifyFor(CURRENT_STORE, text)`. `CURRENT_STORE`
  is resolved from `window.location.host` at module load.

## brandifyFor ordering trap — a store domain that CONTAINS "jetgo" (e.g. jetgo.pet)
- **The brand-name pass (`/jetgo/gi` → brandWord) must NOT run over the freshly-swapped target
  domain.** A naive "swap domain first, then brand word" corrupts `jetgomarket.com → jetgo.pet`
  into `JETGO.pet`, because the apex `jetgo.pet` now contains the substring "jetgo".
- **Fix in place:** swap the domain tokens to private-use sentinels first (`\uE000H\uE000` host /
  `\uE000A\uE000` apex), run the brand-word passes, THEN expand the sentinels back to the real host/apex.
  So the target domain never gets seen by the brand-word regex.
- **Why this is durable:** any future store whose domain shares a substring with the brand word (or
  with the source domain `jetgomarket`) will re-trip this. Keep the sentinel pass; don't "simplify"
  back to ordered string replaces.
- **Invariant to protect:** the sentinel pass must be a no-op for every store whose domain does NOT
  contain "jetgo" (atakum/samsun/etc.). There is a regression test asserting exactly this.

## Where rebranding is handled (do NOT double-wrap)
- **`client/src/components/SEO.tsx` centralizes meta**: it brandifies title, description,
  keywords, OG/Twitter, AND jsonLd. So ANY text passed into `<SEO ...>` (including
  `jsonLd`, `FAQ_JSONLD([...])`, autoTitle/autoDescription) is already covered — leave those literals alone.
- **`server/seo-meta.ts`** brandifies the static `index.html` `#seo-static` hidden div and the
  static `ld+json` block for SSR/no-JS crawlers.

## Rules that bit us
- **Only directly-rendered visible body text needs a manual `brandify()` wrap.** SEO-prop text does not.
- **Contact identifiers must be preserved, not domain-rewritten — on BOTH server AND client.** The JSON-LD
  brandify (in `server/seo-meta.ts` AND `client/src/components/SEO.tsx`) captures the original `"email"` and
  `"sameAs"` and restores them after brandify — they point to the one real shared business, so they must stay
  (e.g. info@jetgomarket.com / instagram.com/jetgomarket.com) on every brand. **Why:** brandifyFor's domain
  rule would otherwise turn the shared email/social into the store's apex domain. The client copy started
  mattering once a NON-default store carried non-empty social handles (jetgopet) — keep the two copies in sync.
- **Leave functional/non-visible JETGO tokens alone:** URL-matching regexes (link rewriting), function/component
  names (`WhyJetgo`), localStorage keys, asset paths, `className="hidden"` text, demo pages.
- Since brandify is a no-op for the default store, wrapping a literal is always safe for jetgo.
- **Two stores may deliberately share the same `name`/`shortName`/`brandWord`** (e.g. atakumpet.com cargo + atakum.biz local both brand "Atakum Pet"). They stay separate ONLY via distinct `id` + `domain`; host resolution is by hostname, brandify produces identical text for both (fine). The store-scoping collision tests must therefore assert distinct id + domain, NOT a distinct brand word.

## Workflow note
Restart the `Start application` workflow after ANY `server/` or `shared/` edit (tsx, no hot reload).
Client edits hot-reload via Vite. Verify SSR branding with `curl -H "Host: www.atakumpetshop.com" http://localhost:5000/`.
