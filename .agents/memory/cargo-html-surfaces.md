---
name: Cargo HTML surface sanitization
description: Which served HTML surfaces a cargo (nationwide-shipping) store must sanitize beyond the SEO corpus, and which are deliberately not yet covered.
---

# Cargo must sanitize EVERY served HTML surface, not just the corpus

A cargo / online-payment store (commerce.fulfillment === "cargo") must never emit
the LOCAL model's claims: same-day, kapıda ödeme, kurye, whatsapp ordering,
Samsun-neighborhood delivery (Atakum/İlkadım/Canik/Tekkeköy), nakit/POS/QR.

**The trap:** the corpus pages were the obvious surface, but two GLOBAL static
surfaces in `client/index.html` are injected on EVERY route by
`applyGlobalBranding` (runs before per-route injection), so a corpus-only fix
leaves them leaking on cargo:
- the hidden `#seo-static` crawler `<div>` (local same-day/kapıda/mahalle copy)
- the static LocalBusiness JSON-LD `areaServed` neighborhood array

**Why a regex rewrite (commercifyFor) is NOT enough here:** `commercifyFor`'s
phrase table targets the CORPUS wording. The `#seo-static` / JSON-LD strings are
bespoke and not in that table, so rewriting silently leaves claims intact.

**How to apply:** for cargo, REPLACE the `#seo-static` block wholesale with a
nationwide-cargo block, and collapse JSON-LD `areaServed` from the neighborhood
array to `{"@type":"Country","name":"Türkiye"}`. Keep the address (physical
Samsun fulfillment center = truthful), and preserve email + sameAs (shared real
business). Local/default stores keep the original block, brandified.

**Verify the right way:** scan the FULL injected HTML (whole string + every
`ld+json` block + the `#seo-static` div), not just title/desc/keywords/noscript —
the earlier scanner missed these exact surfaces. Keep a local-host contrast
assertion so the scan can't pass vacuously.

# Known cargo leaks deliberately OUT of the SEO-corpus scope (not yet fixed)
- `injectProductMeta` default description fallback contains "Aynı gün teslimat,
  kapıda ödeme" and is NOT commercified (only used when a product has no
  metaDescription). Product pages are a separate surface.
- `client/src/components/SEO.tsx` geo.region/geo.placename meta + the global
  LocalBusiness JSON-LD on home/blog/category describe the Samsun business
  location on cargo hosts. geo = truthful business location, not a
  delivery/payment claim; these are non-corpus pages.
