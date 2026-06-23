// ---------------------------------------------------------------------------
// Keyword universe for SAMSUN PET SHOP (samsunpet.com, store id "samsunpet")
// exclusive SEO landing pages — another CARGO (Türkiye-geneli) store corpus in
// the family.
//
// samsunpet's attached keyword set is the union of the two canonical
// "markalar" (brand/SKU) and "diğer" (general intent) lists that the flagship
// jetgo store already consumes. Rather than duplicate ~5k lines of strings, we
// fold the two canonical lists into a single de-duplicated symbol here.
//
// DISTINCTNESS between corpora comes entirely from the GENERATOR
// (keyword-pages-samsunpet-all.ts), which authors a wholly separate, cargo-framed
// voice — never from the keyword data. The same universe is also consumed by the
// jetgo-markalar / jetgo-diger generators (storeId "jetgo", a LOCAL same-day
// voice) and the samsun / karadeniz / markapet cargo siblings, so the samsunpet
// generator must read distinct from ALL of those; the cargo truthfulness
// (no same-day / no door-payment / no local presence) is enforced in the
// generator, not here.
// ---------------------------------------------------------------------------

import { MARKALAR_KEYWORDS } from "./markalar-keywords";
import { DIGER_KEYWORDS } from "./diger-keywords";

export const SAMSUNPET_ALL_KEYWORDS: string[] = Array.from(
  new Set([...MARKALAR_KEYWORDS, ...DIGER_KEYWORDS]),
);
