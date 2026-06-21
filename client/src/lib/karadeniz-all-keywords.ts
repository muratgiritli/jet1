// ---------------------------------------------------------------------------
// Keyword universe for KARADENIZ PET SHOP (karadenizpetshop.com, store id
// "karadeniz") exclusive SEO landing pages — the 9th corpus in the family and
// the SECOND one built for a CARGO (Türkiye-geneli) store.
//
// karadeniz's attached keyword set is the union of the two canonical
// "markalar" (brand/SKU) and "diğer" (general intent) lists that the flagship
// jetgo store already consumes. Rather than duplicate ~5k lines of strings, we
// fold the two canonical lists into a single de-duplicated symbol here.
//
// DISTINCTNESS between corpora comes entirely from the GENERATOR
// (keyword-pages-karadeniz-all.ts), which authors a wholly separate, cargo-framed
// voice — never from the keyword data. The same universe is also consumed by the
// jetgo-markalar / jetgo-diger generators (storeId "jetgo", a LOCAL same-day
// voice), so the karadeniz generator must read distinct from those too; the
// cargo truthfulness (no same-day / no door-payment / no local presence) is
// enforced in the generator, not here.
// ---------------------------------------------------------------------------

import { MARKALAR_KEYWORDS } from "./markalar-keywords";
import { DIGER_KEYWORDS } from "./diger-keywords";

export const KARADENIZ_ALL_KEYWORDS: string[] = Array.from(
  new Set([...MARKALAR_KEYWORDS, ...DIGER_KEYWORDS]),
);
