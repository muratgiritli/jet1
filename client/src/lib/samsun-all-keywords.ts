// ---------------------------------------------------------------------------
// Keyword universe for ATAKUM PET (atakumpet.com, store id "samsun") exclusive
// SEO landing pages — the 10th corpus in the family and the THIRD one built for
// a CARGO (Türkiye-geneli) store.
//
// samsun's keyword set is the union of the two canonical "markalar" (brand/SKU)
// and "diğer" (general intent) lists that the flagship jetgo store already
// consumes — the SAME universe as the karadeniz cargo corpus. Rather than
// duplicate ~5k lines of strings, we fold the two canonical lists into a single
// de-duplicated symbol here.
//
// DISTINCTNESS between corpora comes entirely from the GENERATOR
// (keyword-pages-samsun-all.ts), which authors a wholly separate, cargo-framed
// "Atakum Pet" voice — never from the keyword data. The same universe is also
// consumed by the jetgo-markalar / jetgo-diger generators (storeId "jetgo", a
// LOCAL same-day voice) and the karadeniz generator (the sibling cargo brand),
// so the samsun generator must read distinct from all of those; the cargo
// truthfulness (no same-day / no door-payment / no local presence) is enforced
// in the generator, not here.
// ---------------------------------------------------------------------------

import { MARKALAR_KEYWORDS } from "./markalar-keywords";
import { DIGER_KEYWORDS } from "./diger-keywords";

export const SAMSUN_ALL_KEYWORDS: string[] = Array.from(
  new Set([...MARKALAR_KEYWORDS, ...DIGER_KEYWORDS]),
);
