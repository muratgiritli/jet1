---
name: Keyword SEO local/cargo split
description: How generated keyword SEO pages are split between LOCAL (same-day) and CARGO models, and the rule for keeping local-intent copy/keywords off cargo.
---

# Keyword SEO local vs cargo split (keyword-pages.ts)

Each KEYWORDS entry generates a `localOnly` page via `buildKeywordPage`. A keyword
ALSO gets a separate `cargoOnly` page (via the cargo builder) **only** when
`isUniversalKeyword` is true — i.e. its category isn't acil/acik/hiz/yakin AND it
does not match `LOCAL_INTENT_RE`.

## Rules
- Local copy constants/helpers (e.g. `SPEED_LINE`, `flavorFor`, the keyword
  `metaTitle`/`h1`/`metaDescription`/`features`/`faq`) feed ONLY the local builder.
  They never reach cargo HTML, so it's safe to put "1 saatte / aynı gün / kapıda /
  kurye" claims there without touching any cargo rewrite.
- To keep a *kind* of keyword off cargo (geo, proximity, immediacy, door-payment,
  local-channel — e.g. mahalle/bölge/şimdi/gün içinde/navigasyon/adres/yol tarifi),
  add the term to **`LOCAL_INTENT_RE`**. The test's `FORBIDDEN_LOCAL` HTML scanner is
  only a safety net for forbidden *words* in cargo output; it does NOT decide cargo
  membership and won't catch semantically-local-but-word-clean keywords.

**Why:** a keyword like "petshop mahallemde" passes the forbidden-word scanner yet is
untruthful as a Türkiye-wide cargo page; membership must be filtered at the source.

## Truthful 1-hour messaging in titles
`regionLabel(kw)` returns exactly "Atakum" / "Samsun" / "Samsun ve Atakum". Use a
region-aware speed token: `region === "Atakum" ? "1 Saatte" : "Aynı Gün"`. "1 saatte"
is only truthful for Atakum; Samsun-wide is same-day. Body/meta-description can carry
the fuller "Atakum içinde 1 saatte, Samsun geneline aynı gün" because there is room to
qualify it.

**How to apply:** when adding bulk keywords or new speed copy, (1) append true
local-intent terms to LOCAL_INTENT_RE, (2) keep "türkiye" out of any local copy
(CARGO_SIGNATURE = /türkiye/i), (3) keep "aynı gün" in any local store's homepage
title (a test asserts it), and (4) rely on the store-scoping test suite's cargo
forbidden-scanner to catch leaks.
