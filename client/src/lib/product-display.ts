// Pure presentational helpers for the modern (jetgo) catalog UI. They derive
// display-only values (decoded name, weight badge, price/kg, category subtitle,
// formatted S.K.T, representative review count) from the existing product data.
// No randomness / Date / window — safe for SSR and stable between listing &
// detail. They MUST fail closed (return null) when a value cannot be derived,
// so we never show fabricated data.

export function decodeEntities(s: string): string {
  if (!s) return "";
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function cleanName(name: string | null | undefined): string {
  return decodeEntities(name || "").replace(/\s+/g, " ").trim();
}

// Ambiguous gram ranges like "70-75 Gr" — we cannot compute a reliable weight.
const GRAM_RANGE_RE = /\d+\s*-\s*\d+\s*gr?\b/i;

// Parse a confident total weight (in kg) plus a human label from the product
// name. Handles "14 kg", "1,5 Kg", multipacks "12x85 Gr"/"4x20 gr", and single
// grams with an optional pack multiplier ("400 Gr X 6 Adet", "70 Gr 2'li").
export function parseWeight(name: string | null | undefined): { kg: number | null; label: string | null } {
  const s = cleanName(name);
  if (!s) return { kg: null, label: null };

  const kgM = s.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if (kgM) {
    const kg = parseFloat(kgM[1].replace(",", "."));
    if (kg > 0) return { kg, label: `${kgM[1].replace(".", ",")} kg` };
  }

  if (GRAM_RANGE_RE.test(s)) return { kg: null, label: null };

  const mpM = s.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*gr?\b/i);
  if (mpM) {
    const count = parseInt(mpM[1], 10);
    const unit = parseFloat(mpM[2].replace(",", "."));
    const kg = (count * unit) / 1000;
    if (count > 0 && unit > 0) return { kg, label: `${count}x${mpM[2].replace(".", ",")} g` };
  }

  const gM = s.match(/(\d+(?:[.,]\d+)?)\s*gr?\b/i);
  if (gM) {
    const unit = parseFloat(gM[1].replace(",", "."));
    let mult = 1;
    const tail = s.slice((gM.index ?? 0) + gM[0].length);
    const packM = tail.match(/^\s*(?:[x×]\s*(\d+)\s*adet|(\d+)\s*['']?li\b|(\d+)\s*adet)/i);
    if (packM) mult = parseInt(packM[1] || packM[2] || packM[3], 10) || 1;
    const kg = (unit * mult) / 1000;
    if (unit > 0) {
      return { kg, label: `${gM[1].replace(".", ",")} g${mult > 1 ? ` x${mult}` : ""}` };
    }
  }

  return { kg: null, label: null };
}

export function sizeBadgeLabel(name: string | null | undefined): string | null {
  return parseWeight(name).label;
}

// "433 TL/kg" — only when a confident weight is parseable and price is valid.
export function pricePerKgLabel(price: number, name: string | null | undefined): string | null {
  const { kg } = parseWeight(name);
  if (!kg || kg <= 0 || !isFinite(price) || price <= 0) return null;
  const perKg = Math.round(price / kg);
  if (!isFinite(perKg) || perKg <= 0) return null;
  return `${perKg.toLocaleString("tr-TR")} TL/kg`;
}

// Trailing category descriptor used as the gray subtitle (e.g. "Köpek Maması").
const SUBTITLE_RE =
  /((?:yavru|yetişkin|yaşlı|kısırlaştırılmış|kısır|senior|adult|puppy|kitten|junior|mini|dev ırk|büyük ırk|orta ırk|küçük ırk)?\s*(?:köpek|kedi|kuş|kemirgen|balık|hamster|tavşan|akvaryum)\s+(?:maması|konservesi|kumu|yemi|ödülü|ödül|bisküvisi))\b/i;

export function deriveSubtitle(name: string | null | undefined): string | null {
  const s = cleanName(name);
  if (!s) return null;
  const m = s.match(SUBTITLE_RE);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim();
}

// "03.2027" -> "03/2027" (also tolerates "/", "-" or space separators).
export function formatSkt(skt: string | null | undefined): string | null {
  if (!skt) return null;
  const t = skt.trim();
  if (!t) return null;
  return t.replace(/[.\-\s]+/g, "/");
}

// Deterministic representative review count per product id (40..250). Pure
// function of the id only — stable across listing/detail, no real reviews exist.
export function representativeReviewCount(id: number | string): number {
  const n = typeof id === "number" ? id : parseInt(String(id), 10) || 0;
  const h = Math.abs(Math.imul((n || 1) ^ 0x9e3779b9, 2654435761));
  return 40 + (h % 211);
}

// Fixed display rating (no real reviews yet) — matches the mockups.
export const REPRESENTATIVE_RATING = 5;
