---
name: Store-exclusive landing-page corpora
description: Two shapes a single store can own an exclusive SEO corpus, plus the sitemap + test invariants that break when adding one.
---

A store can OWN an exclusive landing-page corpus in TWO distinct shapes (all pages
tagged `storeId`, `availability:"localOnly"`, `type:"keyword"`):

- **OVERRIDE corpus** (atakum): same slugs as the SHARED corpus, replaced 1:1 on
  that one domain. Integration filter keeps only pages whose shared slug already
  exists with `type==="keyword"`. Corpus size == shared local corpus (no new URLs).
- **NEW-SLUG corpus** (jetgo Pro Plan): brand-new slugs NOT in the shared corpus.
  Integration filter keeps a page UNLESS its slug collides with a NON-keyword
  curated shared page (collisions with a shared keyword page are an allowed
  override). This ADDS URLs, so the store's corpus is larger than a sibling's.

**Sitemap rule:** `getSitemapPagesForStore` must bypass the hash partition for a
store's own exclusives — `p.storeId === store.id || ownsSitemapSlug(...)`. Without
the `storeId===store.id` clause, a store that is in a partition group silently
drops most of its own exclusive pages from its sitemap.

**Why / test invariants that break:** when a local store gains its own exclusives,
two older invariants become wrong and must be relaxed (not deleted):
- "no store sees ANY exclusive page" → "no FOREIGN exclusive leaks", i.e. filter
  `p.storeId && p.storeId !== store.id`. A store legitimately sees its OWN.
- 1:1-override parity (corpus size + slug set) must be measured against a CLEAN
  sibling that owns no exclusives (e.g. jetgopet), NOT against a store that now
  owns a NEW-SLUG corpus (jetgo), or parity fails by the size of that corpus.

**How to apply:** adding any further store-exclusive corpus will reproduce these
exact two test breakages and require the sitemap bypass. `getSeoPagesForStore`
already gates exclusives by `storeId===store.id`, so leakage to siblings/cargo is
prevented at the source.

**Brand-truthfulness rule (imported keyword lists carry noise):** a "brand X"
keyword export will contain a small fraction of competitor/noise keywords (e.g. a
Royal Canin list had ~11/2556 naming Felicia/Whiskas/Monge/Brit Care/N&D/Hill's/
Pro Plan). The generator must NOT dress these up as brand-X products. Detect the
real brand: competitor-token AND no brand-X-token → frame neutrally ("check stock /
premium alternative", never claim it IS brand X); both tokens → brand-X-centric
comparison; else default brand X. Gate EVERY brand-X-specific surface (intro, meta,
explainer, info blurb, barcode prose, FAQ, and any brand-specific section like a
breed/size-line philosophy block) on the isRC flag, and parameterise hardcoded
brand mentions. `internalLinks` may still cross-sell to real brand-X product pages
— that is navigation, not a product-identity claim, so scope truthfulness tests to
page COPY (title/meta/h1/intro/sections/features/faq), not the whole serialized page.

**Multi-brand corpus (when the keyword export is NOT a single brand):** a "diğer
markalar" export spans many brands (Hill's, N&D/Farmina, GimCat, Reflex, Enjoy,
Pronature, LaVital, ProChoice, GranCarno, Cibau, + bare barcodes + foreign telecom
noise). There is NO single default brand: detect from a broad ordered brand table,
first hit = brand, second distinct hit = compareBrand (neutral comparison), zero
hits = stay generic (barcodes/bare sizes → product-code lookup, never invent a
brand). Brand-specific normalizations are load-bearing: N&D → "N&D (Farmina)";
GimCat (and bare malt/paste/vitamin/milk) = TREATS (macun/ödül/takviye), never
staple "mama". Skip non-pet noise via a NOISE_RE and EXPORT the skipped count so a
test can assert noise>0 AND that no noise token leaks into any page.

**Hill's letter-code vet diets — classification ORDER is the trap (cost me >1
test cycle):** generic-diet detection runs BEFORE the Hill's z/d/i/d/k/d… letter-code
map, so a generic token wins when both are present — e.g. "hills sensitive zd" is
classified as a generic *sensitive* diet, NOT a z/d veterinary diet, and correctly
carries NO mandatory veterinary framing. Consequence for tests: do NOT filter "true
vet-diet" pages by a title token like /\bzd\b/ (it over-matches these generic pages
and the "must mention veteriner" assertion then fails). Filter by the emitted
support-not-cure marker line ("Veteriner diyetleri tek başına tedavi değil, beslenme
desteğidir") — that tracks the generator's REAL classification and is a sound,
non-circular regression guard (count>10 breaks if vet framing regresses; the
no-cure assertion guards copy). Vet diets are nutritional SUPPORT under vet
guidance, never a cure.

**N-way cross-corpus dedup:** multiple jetgo corpora share storeId "jetgo"; append
them to `_jetgoCorpus` in EARLIER-WINS precedence (most specific first: Pro Plan →
Royal Canin → broad "markalar" → broadest "diğer anahtar kelimeler" catch-all). The
single existing dedup loop (seen-slug set + skip-curated-non-keyword-collision)
handles any number of corpora with no new code — just append in the right order.
Collisions are rare because brand/keyword slugs are largely disjoint, but ordering
still decides the winner for any overlap, so put the catch-all LAST.

**Turkish consonant mutation breaks literal stem regexes (cost a NO-SHIP cycle):**
Turkish softens a final k/p/t/ç before a vowel suffix — "köpek" + possessive →
"köpeği" (k→ğ, U+011F), "balık" → "balığı". A literal `köpek`/`balık` regex NEVER
matches the suffixed form, so possessive live-animal queries ("kangal köpeği
fiyatları") silently escape a truthfulness gate. Fix: use a char class on the final
consonant — `köpe[kğ]`, `balı[kğ]` — in EVERY place that matches the stem.

**A bare breed name IS a live animal (no generic head needed):** "kangal fiyatı" /
"pug fiyatı" have no "kedi/köpek" head yet are still live-animal price queries. The
live classifier must (a) OPEN its gate on a breed regex too (not only generic animal
nouns) and (b) SUBTRACT the breed (breed + `\S*` for suffixes) in the residue check
so a bare breed leaves empty residue → classified live and gets the no-sale
disclaimer. Tangible products still bail first ("kangal maması fiyatı" stays food).
