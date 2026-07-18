---
name: Multi-domain brandify pattern
description: How one codebase serves multiple branded sites (flagship Enuygun/enuygunpetshop.com + atakumpetshop etc.) and where rebranding must happen
---

# Multi-domain branding ("tek mutfak, çok tabela")

One app/DB/deployment serves several separate live branded sites on different
domains. Shared products/stock/customers/orders/admin; each domain shows its own
name/title/meta/logo/colors and self-canonicalizes.

## The mechanism
- `shared/stores.ts`: `brandifyFor(store, text)` — **active for EVERY store, including `DEFAULT_STORE`**.
  It used to be a no-op for the default store; that changed when the flagship was rebranded JETGO→Enuygun,
  so now the shared JETGO/jetgomarket corpus is rewritten for the flagship too. Rewrites domain tokens
  (www host + apex) and brand-name tokens (JETGO/Jetgo/jetgo → brandWord).

## Flagship identity (Enuygun) — internal id stays "jetgo"
- The default/flagship store's internal `id` is still `"jetgo"` (all DB scoping keys off it), but its BRAND is
  Enuygun and its domain is `https://www.enuygunpetshop.com`. `jetgomarket.com` is kept in the flagship's
  `hostnames` ONLY so the legacy domain resolves to the same store and the canonicalHost middleware 301s it to
  enuygunpet. **Never treat id==="jetgo" as "the brand is JETGO".** The shared corpus + `client/index.html` are
  authored in JETGO/jetgomarket terms purely as the substitution SOURCE.
- `jetgo.pet` / `jetgo.shop` are SEPARATE stores that DELIBERATELY keep literal `brandWord:"JETGO"` +
  `/logo-jetgo.webp` (their own copies, not references to the flagship config), so rebranding the flagship
  does not leak into them.
- For `DEFAULT_STORE`, `server/seo-meta.ts` JSON-LD uses the flagship's OWN `email`/`social` config (not the
  static index.html block's legacy jetgomarket contact identifiers). Non-default stores still preserve the
  shared contact identifiers (see rule below).
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
- Wrapping a literal in `brandify()` is always safe: the flagship now yields Enuygun/enuygunpetshop.com, other
  stores their own brand. **But brandify is NO LONGER a no-op for the flagship** — so any FLAGSHIP-ONLY
  component (gated on `CURRENT_STORE.id === "jetgo"` / `store.id === "jetgo"`) that still holds a RAW
  "JETGO"/"jetgomarket.com" body literal is now a live customer/SEO brand leak and must be wrapped. The
  distance-sales + cookie-policy legal pages (flagship-gated variants in `static-pages.tsx`) were exactly this
  trap — SSR-homepage curl checks miss them because they are client-rendered on inner routes.
  **Why:** activating brandify for the flagship converts every previously-safe raw JETGO literal on a
  default-only code path into a leak; sweep `rg -in "jetgo" client/src | rg -v brandify` on default-gated paths.
- **Two stores may deliberately share the same `name`/`shortName`/`brandWord`** (e.g. atakumpet.com cargo + atakum.biz local both brand "Atakum Pet"). They stay separate ONLY via distinct `id` + `domain`; host resolution is by hostname, brandify produces identical text for both (fine). The store-scoping collision tests must therefore assert distinct id + domain, NOT a distinct brand word.

## Workflow note
Restart the `Start application` workflow after ANY `server/` or `shared/` edit (tsx, no hot reload).
Client edits hot-reload via Vite. Verify SSR branding with `curl -H "Host: www.atakumpetshop.com" http://localhost:5000/`.
