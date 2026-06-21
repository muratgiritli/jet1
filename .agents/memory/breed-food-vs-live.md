---
name: breed-named food vs live-animal classification
description: Why per-store SEO corpora misclassify breed-named food SKUs as live animals, and the local fix + test-recall rule.
---

# Breed-named FOOD SKU vs live-animal classification

The shared truthfulness engine (`keyword-truthfulness.ts`) classifies a bare breed
name ("british shorthair", "golden retriever") as a LIVE animal (liveKind "cins")
by design — so those pages get the "canlı hayvan satışı yapmayız" no-sale line.
But a breed-NAMED FOOD SKU ("royal canin british shorthair 10 kg", "orijen golden
…") is a product, not a live query, and must be classified food (brand page, NO
no-sale line).

**Rule:** fix this LOCALLY in the per-store generator, never by mutating the shared
engine. Pattern: wrap `analyze()` (e.g. `analyzeAtakum`) and, only when
`cat==="live" && liveKind==="cins"` AND a tight food-SKU regex matches (weight unit
kg/gr OR an explicit food brand; include tr dotless-ı variants like "royal canın",
"or[iı]jen"), return `{...a, cat:"food", liveKind:"", brand:detectFoodBrand(k)}`.

**Why:** the engine is shared across all stores; changing detectLive there ripples
to every corpus and breaks the diger byte-identical golden guard. The breed→live
default is correct for bare breeds; only the food-SKU overlap is wrong.

**How to apply (tests):** any slug-derived truthfulness RECALL sweep (live
acquisition, breed price, bird/rabbit price) MUST subtract the same slug-form
food-SKU signal (`\d(kg|gr|gram|kilo)|royal-?can[iı]n|pro-?plan|hills|farmina|
acana|or[iı]jen`). Otherwise the deliberately-flipped breed-food pages have no
no-sale line and fail the recall assertion. Also add an inverse assertion: a
breed-named food SKU must NOT carry the live no-sale disclaimer.

**Noise:** per-store keyword sources carry crawl noise the shared NOISE_RE leaves
in on purpose (it must keep "spectrum kedi maması" — a real food brand). Drop
Spanish-search autocomplete like "buscar spectrum" with a narrow LOCAL extra regex
(`\bbuscar\b`), keeping the bare-brand page.
